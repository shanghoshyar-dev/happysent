"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { importEmployeesExcelBuffer } from "@/lib/employees/excel-import";
import {
  assertBakeryInCity,
  assertFloristInCity,
} from "@/lib/cake-selection/validate-partners";
import { sendCompanyPortalInviteEmail, sendCompanyWelcome } from "@/lib/resend/templates";
import { createPortalInviteLink } from "@/lib/auth/portal-invite";
import { getAuthSiteUrl, getSiteUrl } from "@/lib/site-url";
import { COMPANY_APPLICATION_UPLOADS_BUCKET } from "@/lib/storage/company-application-uploads";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  insertCompanyRow,
  updateCompanyRow,
} from "@/lib/supabase/companies-write";
import { createClient } from "@/lib/supabase/server";

export type CreateCompanyResult =
  | { ok: true; companyId: string; redirectTo: "aktivera" | "list" }
  | { ok: false; error: string };

export type SendWelcomeEmailResult =
  | { ok: true }
  | { ok: false; error: string };

export type SendPortalInviteResult =
  | { ok: true }
  | { ok: false; error: string };

export type ImportApplicationExcelResult =
  | { ok: true; imported: number }
  | { ok: false; error: string };

function parseContactPhone(formData: FormData): string | null {
  const t = String(formData.get("contact_phone") ?? "").trim();
  return t ? t : null;
}

function parsePricePerFlowers(formData: FormData): number | null {
  const raw = String(formData.get("price_per_flowers") ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Pris per blombukett måste vara ett giltigt tal (0 eller högre).");
  }
  return n;
}

function parseDefaultProductId(formData: FormData): string | null {
  const raw = String(formData.get("default_product_id") ?? "").trim();
  return raw || null;
}

function parseFlowerPartnerFields(formData: FormData): {
  offers_flowers: boolean;
  florist_id: string | null;
} {
  const offersFlowers = formData.get("offers_flowers") === "on";
  const floristRaw = String(formData.get("florist_id") ?? "").trim();
  if (offersFlowers && !floristRaw) {
    throw new Error(
      "Välj en blomsterbutik om företaget ska leverera blommor (eller avmarkera leverans av blommor).",
    );
  }
  return {
    offers_flowers: offersFlowers,
    florist_id: offersFlowers ? floristRaw : null,
  };
}

export async function createCompany(
  formData: FormData,
): Promise<CreateCompanyResult> {
  try {
    return await createCompanyInternal(formData);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Något gick fel",
    };
  }
}

async function createCompanyInternal(
  formData: FormData,
): Promise<CreateCompanyResult> {
  const supabase = createClient();
  const applicationId = String(formData.get("application_id") ?? "").trim();

  if (applicationId) {
    const { data: pending, error: pendErr } = await supabase
      .from("company_applications")
      .select("id")
      .eq("id", applicationId)
      .eq("status", "pending")
      .maybeSingle();
    if (pendErr) return { ok: false, error: pendErr.message };
    if (!pending) {
      return {
        ok: false,
        error:
          "Förfrågan finns inte eller är redan hanterad. Uppdatera sidan.",
      };
    }
  }

  const flowers = parseFlowerPartnerFields(formData);
  const city = String(formData.get("city") ?? "").trim();
  const bakeryId = String(formData.get("bakery_id") ?? "").trim();
  if (!bakeryId) {
    return { ok: false, error: "Välj bageri i företagets stad." };
  }
  try {
    await assertBakeryInCity(bakeryId, city);
    if (flowers.florist_id) {
      await assertFloristInCity(flowers.florist_id, city);
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Ogiltigt bageri eller blomsterbutik.",
    };
  }

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city,
    contact_email: String(formData.get("contact_email") ?? "").trim(),
    billing_email: String(formData.get("billing_email") ?? "").trim(),
    contact_phone: parseContactPhone(formData),
    bakery_id: bakeryId,
    offers_flowers: flowers.offers_flowers,
    florist_id: flowers.florist_id,
    price_per_flowers: parsePricePerFlowers(formData),
    default_product_id: parseDefaultProductId(formData),
    status: String(formData.get("status") ?? "active") as "active" | "paused",
  };
  const {
    data: created,
    error,
    strippedColumns,
  } = await insertCompanyRow(supabase, payload);

  if (strippedColumns.length > 0) {
    console.warn(
      "[createCompany] saknade kolumner i companies — sparade utan:",
      strippedColumns.join(", "),
    );
  }

  if (error) {
    return { ok: false, error: error.message ?? "Kunde inte spara företaget." };
  }
  if (!created?.id) {
    return { ok: false, error: "Företaget skapades men inget id returnerades." };
  }

  if (applicationId) {
    const { error: upErr } = await supabase
      .from("company_applications")
      .update({
        status: "approved",
        processed_at: new Date().toISOString(),
        created_company_id: created.id,
      })
      .eq("id", applicationId)
      .eq("status", "pending");
    if (upErr) {
      console.error("[createCompany] kunde inte markera ansökan godkänd:", upErr);
    }

    revalidatePath("/admin/foretag");
    revalidatePath("/admin/kolista");
    return {
      ok: true,
      companyId: created.id,
      redirectTo: "aktivera",
    };
  }

  revalidatePath("/admin/foretag");
  revalidatePath("/admin/kolista");
  return {
    ok: true,
    companyId: created.id,
    redirectTo: "list",
  };
}

export async function importApplicationEmployeesExcel(
  companyId: string,
): Promise<ImportApplicationExcelResult> {
  const supabase = createClient();
  const admin = createAdminClient();

  const { data: app, error: appErr } = await supabase
    .from("company_applications")
    .select("id, employees_import_storage_path")
    .eq("created_company_id", companyId)
    .not("employees_import_storage_path", "is", null)
    .maybeSingle();

  if (appErr) return { ok: false, error: appErr.message };
  const path = app?.employees_import_storage_path;
  if (!path) {
    return { ok: false, error: "Ingen bifogad Excel finns kvar för den här ansökan." };
  }

  const { data: bin, error: dlErr } = await admin.storage
    .from(COMPANY_APPLICATION_UPLOADS_BUCKET)
    .download(path);

  if (dlErr || !bin) {
    return {
      ok: false,
      error: `Kunde inte hämta Excel: ${dlErr?.message ?? "saknad fil"}`,
    };
  }

  const importResult = await importEmployeesExcelBuffer(
    supabase,
    companyId,
    await bin.arrayBuffer(),
  );

  if (!importResult.ok || importResult.globalError) {
    return {
      ok: false,
      error: importResult.globalError ?? "Importen misslyckades.",
    };
  }
  if (importResult.imported < 1) {
    return {
      ok: false,
      error: "Excel innehöll inga giltiga rader att importera.",
    };
  }

  await admin.storage.from(COMPANY_APPLICATION_UPLOADS_BUCKET).remove([path]);
  await supabase
    .from("company_applications")
    .update({ employees_import_storage_path: null })
    .eq("id", app.id);

  revalidatePath("/admin/anstallda");
  revalidatePath(`/admin/foretag/${companyId}/aktivera`);
  return { ok: true, imported: importResult.imported };
}

export async function sendCompanyWelcomeEmail(
  companyId: string,
): Promise<SendWelcomeEmailResult> {
  const supabase = createClient();

  const { data: company, error: coErr } = await supabase
    .from("companies")
    .select("id, name, contact_email, welcome_email_sent_at")
    .eq("id", companyId)
    .maybeSingle();

  if (coErr || !company) {
    return { ok: false, error: "Företaget hittades inte." };
  }
  if (company.welcome_email_sent_at) {
    return { ok: false, error: "Välkomstmejlet är redan skickat." };
  }
  if (!company.contact_email?.trim()) {
    return { ok: false, error: "Företaget saknar kontaktmejl." };
  }

  const { count, error: countErr } = await supabase
    .from("employees")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);

  if (countErr) return { ok: false, error: countErr.message };
  const employeeCount = count ?? 0;
  if (employeeCount < 1) {
    return {
      ok: false,
      error: "Lägg till minst en anställd innan välkomstmejlet skickas.",
    };
  }

  try {
    await sendCompanyWelcome({
      to: company.contact_email,
      companyName: company.name,
      employeeCount,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Mejlet kunde inte skickas.",
    };
  }

  const { error: updErr } = await supabase
    .from("companies")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("id", companyId);

  if (updErr) {
    console.error("[sendCompanyWelcomeEmail] sparade inte sent_at:", updErr);
  }

  revalidatePath(`/admin/foretag/${companyId}/aktivera`);
  revalidatePath(`/admin/foretag/${companyId}`);
  return { ok: true };
}

export async function sendCompanyPortalInvite(
  companyId: string,
): Promise<SendPortalInviteResult> {
  const supabase = createClient();
  const admin = createAdminClient();

  const { data: company, error: coErr } = await supabase
    .from("companies")
    .select("id, name, contact_email, portal_invite_sent_at")
    .eq("id", companyId)
    .maybeSingle();

  if (coErr || !company) {
    return { ok: false, error: "Företaget hittades inte." };
  }
  const email = company.contact_email?.trim();
  if (!email) {
    return { ok: false, error: "Företaget saknar kontaktmejl." };
  }

  const siteUrl = getAuthSiteUrl();
  const loginUrl = `${getSiteUrl()}/kund/login`;

  const linkResult = await createPortalInviteLink(email, companyId);
  if (!linkResult.ok) {
    return { ok: false, error: linkResult.error };
  }

  try {
    await sendCompanyPortalInviteEmail({
      to: email,
      companyName: company.name,
      activateUrl: linkResult.actionLink,
      loginUrl,
    });
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Inbjudningsmejlet kunde inte skickas.",
    };
  }

  await admin.from("company_portal_invites").upsert(
    {
      company_id: companyId,
      email,
      invited_at: new Date().toISOString(),
      accepted_at: null,
    },
    { onConflict: "company_id,email" },
  );

  const { error: updErr } = await supabase
    .from("companies")
    .update({ portal_invite_sent_at: new Date().toISOString() })
    .eq("id", companyId);

  if (updErr) {
    console.error("[sendCompanyPortalInvite] portal_invite_sent_at:", updErr);
  }

  revalidatePath(`/admin/foretag/${companyId}/aktivera`);
  revalidatePath(`/admin/foretag/${companyId}`);
  return { ok: true };
}

export async function updateCompany(id: string, formData: FormData) {
  const supabase = createClient();
  const flowers = parseFlowerPartnerFields(formData);
  const city = String(formData.get("city") ?? "").trim();
  const bakeryId = String(formData.get("bakery_id") ?? "").trim();
  if (!bakeryId) {
    throw new Error("Välj bageri i företagets stad.");
  }
  await assertBakeryInCity(bakeryId, city);
  if (flowers.florist_id) {
    await assertFloristInCity(flowers.florist_id, city);
  }

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city,
    contact_email: String(formData.get("contact_email") ?? "").trim(),
    billing_email: String(formData.get("billing_email") ?? "").trim(),
    contact_phone: parseContactPhone(formData),
    bakery_id: bakeryId,
    offers_flowers: flowers.offers_flowers,
    florist_id: flowers.florist_id,
    price_per_flowers: parsePricePerFlowers(formData),
    default_product_id: parseDefaultProductId(formData),
    status: String(formData.get("status") ?? "active") as "active" | "paused",
  };
  const { error, strippedColumns } = await updateCompanyRow(
    supabase,
    id,
    payload,
  );
  if (strippedColumns.length > 0) {
    console.warn(
      "[updateCompany] saknade kolumner i companies — sparade utan:",
      strippedColumns.join(", "),
    );
  }
  if (error) throw new Error(error.message);
  revalidatePath("/admin/foretag");
  revalidatePath(`/admin/foretag/${id}`);
}

export async function deleteCompany(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/foretag");
  redirect("/admin/foretag");
}
