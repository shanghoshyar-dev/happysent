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
import { findCompanyIdForContactMatch } from "@/lib/cron/employee-add-digest";
import { COMPANY_APPLICATION_UPLOADS_BUCKET } from "@/lib/storage/company-application-uploads";
import { isHoneypotFilled } from "@/lib/honeypot";
import {
  formatOrganizationNumber,
  normalizeOrganizationNumber,
} from "@/lib/organization-number";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

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

/** PostgREST/Postgres vid saknad kolumn. */
function isLikelyMissingColumnError(error: {
  message?: string;
  code?: string;
}): boolean {
  const msg = (error.message ?? "").toLowerCase();
  const code = String(error.code ?? "");
  if (code === "42703") return true;
  if (msg.includes("schema cache")) return true;
  if (msg.includes("could not find")) return true;
  return (
    msg.includes("column") &&
    (msg.includes("does not exist") || msg.includes("unknown column"))
  );
}

function errorMentionsTermsColumns(error: { message?: string }): boolean {
  const m = (error.message ?? "").toLowerCase();
  return m.includes("terms_accepted_at") || m.includes("terms_document_version");
}

function errorMentionsContactPhone(error: { message?: string }): boolean {
  const m = (error.message ?? "").toLowerCase();
  return m.includes("contact_phone");
}

function errorMentionsOrganizationNumber(error: { message?: string }): boolean {
  const m = (error.message ?? "").toLowerCase();
  return m.includes("organization_number");
}

/**
 * Telefon ska alltid ligga i kolumnen contact_phone — aldrig gömd i message.
 * Om villkorskolumner saknas i DB kan vi spara utan dem (migration pending).
 */
async function insertCompanyApplicationRow(
  admin: ReturnType<typeof createAdminClient>,
  row: {
    name: string;
    company: string;
    organizationNumber: string;
    email: string;
    phone: string;
    message: string;
  },
): Promise<
  | { ok: true; applicationId: string }
  | { ok: false; error: { message: string; code?: string } }
> {
  const baseMessage = row.message.trim() === "" ? null : row.message.trim();

  const fullPayload = {
    contact_name: row.name,
    company_name: row.company,
    organization_number: row.organizationNumber,
    contact_email: row.email,
    contact_phone: row.phone,
    message: baseMessage,
    terms_accepted_at: new Date().toISOString(),
    terms_document_version: TERMS_DOCUMENT_VERSION,
  };

  const { data: createdFull, error: fullErr } = await admin
    .from("company_applications")
    .insert(fullPayload as never)
    .select("id")
    .single();

  if (!fullErr && createdFull?.id) {
    return { ok: true, applicationId: createdFull.id };
  }

  const retryWithoutOrgNumber =
    fullErr &&
    isLikelyMissingColumnError(fullErr) &&
    errorMentionsOrganizationNumber(fullErr);

  if (retryWithoutOrgNumber) {
    console.warn(
      "[submitContactForm] organization_number saknas i DB — sparar org.nr i meddelandefältet. Kör migration company_applications_organization_number.",
    );
    const orgPrefix = `Organisationsnummer: ${formatOrganizationNumber(row.organizationNumber)}`;
    const messageWithOrg = baseMessage
      ? `${orgPrefix}\n\n${baseMessage}`
      : orgPrefix;
    const withoutOrgPayload = {
      contact_name: row.name,
      company_name: row.company,
      contact_email: row.email,
      contact_phone: row.phone,
      message: messageWithOrg,
      terms_accepted_at: new Date().toISOString(),
      terms_document_version: TERMS_DOCUMENT_VERSION,
    };
    const { data: createdOrgFallback, error: orgFallbackErr } = await admin
      .from("company_applications")
      .insert(withoutOrgPayload as never)
      .select("id")
      .single();
    if (!orgFallbackErr && createdOrgFallback?.id) {
      return { ok: true, applicationId: createdOrgFallback.id };
    }
  }

  const retryWithoutTerms =
    fullErr &&
    isLikelyMissingColumnError(fullErr) &&
    errorMentionsTermsColumns(fullErr) &&
    !errorMentionsContactPhone(fullErr);

  if (retryWithoutTerms) {
    console.warn(
      "[submitContactForm] villkorskolumner saknas — sparar med telefon i contact_phone men utan terms-fält. Kör migration company_applications_terms.",
    );
    const slimPayload = {
      contact_name: row.name,
      company_name: row.company,
      organization_number: row.organizationNumber,
      contact_email: row.email,
      contact_phone: row.phone,
      message: baseMessage,
    };
    const { data: createdSlim, error: slimErr } = await admin
      .from("company_applications")
      .insert(slimPayload as never)
      .select("id")
      .single();
    if (!slimErr && createdSlim?.id) {
      return { ok: true, applicationId: createdSlim.id };
    }
    return { ok: false, error: slimErr ?? fullErr };
  }

  return { ok: false, error: fullErr ?? { message: "Insert misslyckades" } };
}

export async function submitContactForm(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  if (isHoneypotFilled(formData)) {
    return { status: "success" };
  }

  const name = getStr(formData, "name");
  const company = getStr(formData, "company");
  const organizationNumberRaw = getStr(formData, "organization_number");
  const organizationNumber = normalizeOrganizationNumber(organizationNumberRaw);
  const email = getStr(formData, "email");
  const phone = getStr(formData, "phone");
  const message = getStr(formData, "message");
  const consent = formData.get("consent") === "on";
  const termsAccept = formData.get("terms_accept") === "on";

  if (!name || !company || !organizationNumberRaw || !email || !phone) {
    return {
      status: "error",
      message:
        "Fyll i namn, företag, organisationsnummer, mejl och telefon.",
    };
  }
  if (!organizationNumber) {
    return {
      status: "error",
      message:
        "Organisationsnumret ser inte giltigt ut. Ange 10 siffror (t.ex. 556123-4567) eller personnummer för enskild firma.",
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
    const admin = createAdminClient();
    const inserted = await insertCompanyApplicationRow(admin, {
      name,
      company,
      organizationNumber,
      email,
      phone,
      message,
    });

    if (!inserted.ok) {
      const qErr = inserted.error;
      console.error("[submitContactForm] kö-rad misslyckades:", qErr.message);
      try {
        await sendContactAdminNotification({
          name,
          company,
          organizationNumber,
          email,
          phone,
          message:
            `[Tekniskt fel — förfrågan sparades inte i admin-kön och syns inte under Företag: ${qErr.message}]\n\n` +
            (message || "(inget meddelande)"),
          subjectPrefix: "[KÖ SPARADES EJ] ",
        });
      } catch (notifyErr) {
        console.error(
          "[submitContactForm] kunde inte mejla admin om köfel:",
          notifyErr,
        );
      }
      return {
        status: "error",
        message:
          "Vi kunde inte spara er förfrågan i systemet just nu. Försök gärna igen om en liten stund eller kontakta oss direkt.",
      };
    }

    const applicationId = inserted.applicationId;
    const excelMaxBytes = 5 * 1024 * 1024;
    const excelFile = formData.get("employees_xlsx");
    let excelUploadedPath: string | null = null;

    if (excelFile instanceof File && excelFile.size > 0) {
      if (excelFile.size > excelMaxBytes) {
        await admin.from("company_applications").delete().eq("id", applicationId);
        return {
          status: "error",
          message: "Excel-filen får vara högst 5 MB.",
        };
      }
      const lower = excelFile.name.toLowerCase();
      if (!lower.endsWith(".xlsx")) {
        await admin.from("company_applications").delete().eq("id", applicationId);
        return {
          status: "error",
          message:
            "Bifogad personalfil måste vara .xlsx enligt vår mall (samma som för befintliga kunder).",
        };
      }

      excelUploadedPath = `${applicationId}/employees.xlsx`;
      const { error: upErr } = await admin.storage
        .from(COMPANY_APPLICATION_UPLOADS_BUCKET)
        .upload(excelUploadedPath, excelFile, {
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          upsert: true,
        });

      if (upErr) {
        console.error("[submitContactForm] storage upload:", upErr);
        await admin.from("company_applications").delete().eq("id", applicationId);
        return {
          status: "error",
          message:
            "Kunde inte ladda upp Excel-filen. Försök utan bilaga eller kontakta oss.",
        };
      }

      const { error: pathErr } = await admin
        .from("company_applications")
        .update({ employees_import_storage_path: excelUploadedPath })
        .eq("id", applicationId);

      if (pathErr) {
        console.error("[submitContactForm] path update:", pathErr);
        await admin.storage
          .from(COMPANY_APPLICATION_UPLOADS_BUCKET)
          .remove([excelUploadedPath]);
        await admin.from("company_applications").delete().eq("id", applicationId);
        return {
          status: "error",
          message:
            "Kunde inte koppla Excel-filen till er förfrågan. Försök igen eller kontakta oss.",
        };
      }
    }

    let adminMessage = message.trim();
    if (excelUploadedPath) {
      adminMessage =
        (adminMessage ? `${adminMessage}\n\n` : "") +
        "[Excel enligt HappySent-mall bifogad — personal importeras automatiskt när ansökan godkänns i admin.]";
    }

    await sendContactAdminNotification({
      name,
      company,
      organizationNumber,
      email,
      phone,
      message: adminMessage || "(inget meddelande)",
    });
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
  if (isHoneypotFilled(formData)) {
    return { status: "success" };
  }

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
    const matchedCompanyId = await findCompanyIdForContactMatch({
      companyName,
      address,
      city,
    });

    const admin = createAdminClient();
    const employeesJson: Json = employeeRows.map((r) => ({
      first_name: r.first,
      last_name: r.last,
      birthday: r.birthday,
    }));

    const { error: queueErr } = await admin
      .from("employee_change_requests")
      .insert({
        action_type: action,
        company_name: companyName,
        address,
        city,
        postal_code: postalCode,
        submitted_by_email: submittedByEmail,
        message: message.trim() === "" ? null : message.trim(),
        number_of_people: action === "add" ? numberOfPeople : null,
        employees: employeesJson,
        matched_company_id: matchedCompanyId,
      });

    if (queueErr) {
      console.error("[submitEmployeeRequest] kö-rad misslyckades:", queueErr);
      return {
        status: "error",
        message:
          "Vi kunde inte spara er förfrågan just nu. Försök igen om en stund eller mejla oss.",
      };
    }

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

    return { status: "success" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Okänt fel";
    return {
      status: "error",
      message: `Något gick fel när vi skulle skicka mejlet: ${msg}`,
    };
  }
}
