"use server";

import { getRequestIp } from "@/lib/client-ip";
import {
  ContactRateLimitError,
  assertContactRateLimit,
} from "@/lib/rate-limit-contact";
import {
  sendContactAdminNotification,
  sendContactConfirmation,
  sendEmployeeRequestAdminNotification,
} from "@/lib/resend/templates";
import {
  appendEmployeeAddDigestEntries,
  findCompanyIdForContactMatch,
} from "@/lib/cron/employee-add-digest";
import { createAdminClient } from "@/lib/supabase/admin";

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

function getStr(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptStr(formData: FormData, key: string): string | null {
  const v = getStr(formData, key);
  return v === "" ? null : v;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Endast sex siffror ÅÅMMDD (t.ex. 971219 eller 97-12-19). */
function extractSixDigitYYMMDD(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 6 ? digits : null;
}

function isValidYYMMDD(digits: string): boolean {
  const yy = Number.parseInt(digits.slice(0, 2), 10);
  const mm = Number.parseInt(digits.slice(2, 4), 10);
  const dd = Number.parseInt(digits.slice(4, 6), 10);
  const yyyy = yy >= 50 ? 1900 + yy : 2000 + yy;
  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  return (
    d.getUTCFullYear() === yyyy &&
    d.getUTCMonth() === mm - 1 &&
    d.getUTCDate() === dd
  );
}

/** Måste matcha default i migration `terms_document_version`. */
const TERMS_DOCUMENT_VERSION = "May 2026";

export async function submitContactForm(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = getStr(formData, "name");
  const company = getStr(formData, "company");
  const email = getStr(formData, "email");
  const message = getStr(formData, "message");
  const consent = formData.get("consent") === "on";
  const termsAccept = formData.get("terms_accept") === "on";

  if (!name || !company || !email) {
    return { status: "error", message: "Fyll i namn, företag och mejl." };
  }
  if (!isValidEmail(email)) {
    return { status: "error", message: "Mejladressen ser inte giltig ut." };
  }
  if (!consent) {
    return {
      status: "error",
      message:
        "Du behöver godkänna privacy policy och databehandlingsavtalet.",
    };
  }
  if (!termsAccept) {
    return {
      status: "error",
      message:
        "Du behöver godkänna användarvillkoren för att skicka en förfrågan som ny kund.",
    };
  }

  try {
    await assertContactRateLimit(getRequestIp());
  } catch (e) {
    if (e instanceof ContactRateLimitError) {
      return { status: "error", message: e.message };
    }
    throw e;
  }

  try {
    try {
      const admin = createAdminClient();
      const { error: qErr } = await admin.from("company_applications").insert({
        contact_name: name,
        company_name: company,
        contact_email: email,
        message: message || null,
        terms_accepted_at: new Date().toISOString(),
        terms_document_version: TERMS_DOCUMENT_VERSION,
      });
      if (qErr) {
        console.error("[submitContactForm] kö-rad misslyckades:", qErr.message);
      }
    } catch (e) {
      console.error("[submitContactForm] kö-rad oväntat fel:", e);
    }

    await sendContactAdminNotification({ name, company, email, message });
    await sendContactConfirmation({ to: email, name });
    return { status: "success" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Okänt fel";
    return {
      status: "error",
      message: `Något gick fel när vi skulle skicka mejlet: ${msg}`,
    };
  }
}

export async function submitEmployeeRequest(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const rawAction = getStr(formData, "action_type");
  if (rawAction !== "add" && rawAction !== "remove") {
    return { status: "error", message: "Välj om du vill lägga till eller ta bort." };
  }
  const action = rawAction;

  const companyName = getStr(formData, "company_name");
  const address = getStr(formData, "address");
  const city = getStr(formData, "city");
  const postalCode = getStr(formData, "postal_code");
  const firstName = getStr(formData, "first_name");
  const lastName = getStr(formData, "last_name");
  const submittedByEmail = getStr(formData, "submitted_by_email");
  const message = getStr(formData, "message");

  const birthday = action === "add" ? getOptStr(formData, "birthday") : null;
  const personalNumberRaw = getStr(formData, "personal_number");
  const rawNumber = getStr(formData, "number_of_people");
  const numberOfPeople =
    action === "add" && rawNumber !== "" ? Number(rawNumber) : null;

  if (!companyName || !address || !city || !postalCode || !firstName || !lastName) {
    return {
      status: "error",
      message: "Fyll i företagsuppgifter och anställdas namn.",
    };
  }
  if (!isValidEmail(submittedByEmail)) {
    return {
      status: "error",
      message: "Vi behöver en giltig mejladress att svara på.",
    };
  }
  const yyMmDd = extractSixDigitYYMMDD(personalNumberRaw);
  if (!yyMmDd) {
    return {
      status: "error",
      message:
        "Ange sex siffror för födelsedatum (ÅÅMMDD), t.ex. 971219 eller 97-12-19. Du behöver inte fylla i hela personnumret.",
    };
  }
  if (!isValidYYMMDD(yyMmDd)) {
    return {
      status: "error",
      message:
        "Datumet verkar ogiltigt. Ange ÅÅMMDD med sex siffror (t.ex. 97-12-19).",
    };
  }
  if (action === "add") {
    if (!birthday) {
      return { status: "error", message: "Födelsedag krävs när du lägger till." };
    }
    if (numberOfPeople === null || Number.isNaN(numberOfPeople) || numberOfPeople < 1) {
      return {
        status: "error",
        message: "Antal personer måste vara minst 1.",
      };
    }
  }

  try {
    await assertContactRateLimit(getRequestIp());
  } catch (e) {
    if (e instanceof ContactRateLimitError) {
      return { status: "error", message: e.message };
    }
    throw e;
  }

  try {
    await sendEmployeeRequestAdminNotification({
      action,
      companyName,
      address,
      city,
      postalCode,
      employeeFirstName: firstName,
      employeeLastName: lastName,
      birthday,
      personalNumber: yyMmDd,
      numberOfPeople,
      message,
      submittedByEmail,
    });
    await sendContactConfirmation({
      to: submittedByEmail,
      name: firstName || companyName,
    });

    const matchedCompanyId = await findCompanyIdForContactMatch({
      companyName,
      address,
      city,
    });
    if (matchedCompanyId) {
      await appendEmployeeAddDigestEntries(matchedCompanyId, [
        {
          kind: action,
          first_name: firstName,
          last_name: lastName,
          birthday,
          personal_number: yyMmDd,
        },
      ]);
    } else {
      console.warn(
        "[submitEmployeeRequest] inget företag matchade för digest-mejl",
        { companyName, city },
      );
    }

    return { status: "success" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Okänt fel";
    return {
      status: "error",
      message: `Något gick fel när vi skulle skicka mejlet: ${msg}`,
    };
  }
}
