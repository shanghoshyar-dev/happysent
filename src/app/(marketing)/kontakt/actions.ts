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
  type DigestChangeEntry,
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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Minimikrav: tillräckligt många siffror för ett rimligt telefonnummer (även +46). */
function isPlausiblePhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

function parseIsoDateYYYYMMDD(iso: string): string | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== mo - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return iso;
}

/** ÅÅMMDD för kö/digest (bakåtkompabilitet), härlett ur fullständigt datum. */
function isoDateToYYMMDD(iso: string): string | null {
  if (!parseIsoDateYYYYMMDD(iso)) return null;
  const y = Number(iso.slice(0, 4));
  const yy = String(y % 100).padStart(2, "0");
  return `${yy}${iso.slice(5, 7)}${iso.slice(8, 10)}`;
}

function collectTrimmed(formData: FormData, key: string): string[] {
  return formData.getAll(key).flatMap((v) => {
    if (typeof v !== "string") return [];
    const t = v.trim();
    return t ? [t] : [];
  });
}

function parseEmployeeRowsFromFormData(formData: FormData):
  | { ok: true; rows: Array<{ first: string; last: string; birthday: string }> }
  | { ok: false; message: string } {
  const firsts = collectTrimmed(formData, "emp_first_name");
  const lasts = collectTrimmed(formData, "emp_last_name");
  const birthdays = collectTrimmed(formData, "emp_birthday");

  if (firsts.length === 0) {
    return {
      ok: false,
      message: "Lägg till minst en anställd med förnamn, efternamn och födelsedatum.",
    };
  }
  if (firsts.length !== lasts.length || firsts.length !== birthdays.length) {
    return {
      ok: false,
      message: "Varje anställd behöver förnamn, efternamn och födelsedatum.",
    };
  }

  const rows: Array<{ first: string; last: string; birthday: string }> = [];
  for (let i = 0; i < firsts.length; i++) {
    const birthday = parseIsoDateYYYYMMDD(birthdays[i]);
    if (!birthday) {
      return {
        ok: false,
        message: `Ogiltigt födelsedatum för rad ${i + 1}.`,
      };
    }
    rows.push({ first: firsts[i], last: lasts[i], birthday });
  }
  return { ok: true, rows };
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
  const phone = getStr(formData, "phone");
  const message = getStr(formData, "message");
  const consent = formData.get("consent") === "on";
  const termsAccept = formData.get("terms_accept") === "on";

  if (!name || !company || !email || !phone) {
    return {
      status: "error",
      message: "Fyll i namn, företag, mejl och telefon.",
    };
  }
  if (!isValidEmail(email)) {
    return { status: "error", message: "Mejladressen ser inte giltig ut." };
  }
  if (!isPlausiblePhone(phone)) {
    return {
      status: "error",
      message:
        "Telefonnumret ser inte giltigt ut. Ange minst 8 siffror (t.ex. 070-123 45 67 eller +46 …).",
    };
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
        contact_phone: phone,
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

    await sendContactAdminNotification({ name, company, email, phone, message });
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
  const submittedByEmail = getStr(formData, "submitted_by_email");
  const message = getStr(formData, "message");

  const parsedRows = parseEmployeeRowsFromFormData(formData);
  if (!parsedRows.ok) {
    return { status: "error", message: parsedRows.message };
  }
  const employeeRows = parsedRows.rows;

  const rawNumber = getStr(formData, "number_of_people");
  const numberOfPeople =
    action === "add" && rawNumber !== "" ? Number(rawNumber) : null;

  if (!companyName || !address || !city || !postalCode) {
    return {
      status: "error",
      message: "Fyll i alla företagsuppgifter.",
    };
  }
  if (!isValidEmail(submittedByEmail)) {
    return {
      status: "error",
      message: "Vi behöver en giltig mejladress att svara på.",
    };
  }
  if (action === "add") {
    if (numberOfPeople === null || Number.isNaN(numberOfPeople) || numberOfPeople < 1) {
      return {
        status: "error",
        message: "Antal personer på avdelningen måste vara minst 1.",
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
      employees: employeeRows.map((r) => ({
        first_name: r.first,
        last_name: r.last,
        birthday_iso: r.birthday,
      })),
      numberOfPeople,
      message,
      submittedByEmail,
    });
    await sendContactConfirmation({
      to: submittedByEmail,
      name: employeeRows[0]?.first || companyName,
    });

    const matchedCompanyId = await findCompanyIdForContactMatch({
      companyName,
      address,
      city,
    });
    if (matchedCompanyId) {
      const digestEntries: DigestChangeEntry[] = employeeRows.map((r) => ({
        kind: action === "remove" ? "remove" : "add",
        first_name: r.first,
        last_name: r.last,
        birthday: r.birthday,
        personal_number: isoDateToYYMMDD(r.birthday)!,
      }));
      await appendEmployeeAddDigestEntries(matchedCompanyId, digestEntries);
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
