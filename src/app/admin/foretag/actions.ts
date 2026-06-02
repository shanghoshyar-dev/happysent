"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateCompanyResult =
  | { ok: true }
  | { ok: false; error: string };

import { importEmployeesExcelBuffer } from "@/lib/employees/excel-import";
import { COMPANY_APPLICATION_UPLOADS_BUCKET } from "@/lib/storage/company-application-uploads";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  insertCompanyRow,
  updateCompanyRow,
} from "@/lib/supabase/companies-write";
import { createClient } from "@/lib/supabase/server";
import { sendCompanyWelcome } from "@/lib/resend/templates";

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
  let excelStoragePath: string | null = null;

  if (applicationId) {
    const { data: pending, error: pendErr } = await supabase
      .from("company_applications")
      .select("id, employees_import_storage_path")
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
    excelStoragePath = pending.employees_import_storage_path ?? null;
  }

  const flowers = parseFlowerPartnerFields(formData);
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    contact_email: String(formData.get("contact_email") ?? "").trim(),
    billing_email: String(formData.get("billing_email") ?? "").trim(),
    contact_phone: parseContactPhone(formData),
    bakery_id: String(formData.get("bakery_id") ?? ""),
    offers_flowers: flowers.offers_flowers,
    florist_id: flowers.florist_id,
    price_per_cake: Number(formData.get("price_per_cake") ?? 0),
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

  const admin = createAdminClient();

  if (excelStoragePath && created?.id) {
    const { data: bin, error: dlErr } = await admin.storage
      .from(COMPANY_APPLICATION_UPLOADS_BUCKET)
      .download(excelStoragePath);

    if (dlErr || !bin) {
      await supabase.from("companies").delete().eq("id", created.id);
      return {
        ok: false,
        error: `Kunde inte hämta bifogad Excel: ${dlErr?.message ?? "saknad fil"}`,
      };
    }

    const buf = await bin.arrayBuffer();
    const importResult = await importEmployeesExcelBuffer(
      supabase,
      created.id,
      buf,
    );

    const importFailed =
      !importResult.ok ||
      importResult.globalError ||
      importResult.imported < 1;

    if (importFailed) {
      await supabase.from("companies").delete().eq("id", created.id);
      const detail =
        importResult.globalError ??
        (importResult.imported < 1
          ? "Excel innehöll inga giltiga rader att importera."
          : "Importen misslyckades.");
      return { ok: false, error: detail };
    }

    await admin.storage
      .from(COMPANY_APPLICATION_UPLOADS_BUCKET)
      .remove([excelStoragePath]);

    revalidatePath("/admin/anstallda");
  }

  if (applicationId && created?.id) {
    const { error: upErr } = await supabase
      .from("company_applications")
      .update({
        status: "approved",
        processed_at: new Date().toISOString(),
        created_company_id: created.id,
        employees_import_storage_path: null,
      })
      .eq("id", applicationId)
      .eq("status", "pending");
    if (upErr) {
      console.error("[createCompany] kunde inte markera ansökan godkänd:", upErr);
    }
  }

  // Fire-and-forget welcome email — don't block navigation if it fails.
  if (payload.contact_email) {
    try {
      await sendCompanyWelcome({
        to: payload.contact_email,
        companyName: payload.name,
      });
    } catch (err) {
      console.error("[createCompany] welcome email failed:", err);
    }
  }

  revalidatePath("/admin/foretag");
  revalidatePath("/admin/kolista");
  return { ok: true };
}

export async function updateCompany(id: string, formData: FormData) {
  const supabase = createClient();
  const flowers = parseFlowerPartnerFields(formData);
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    contact_email: String(formData.get("contact_email") ?? "").trim(),
    billing_email: String(formData.get("billing_email") ?? "").trim(),
    contact_phone: parseContactPhone(formData),
    bakery_id: String(formData.get("bakery_id") ?? ""),
    offers_flowers: flowers.offers_flowers,
    florist_id: flowers.florist_id,
    price_per_cake: Number(formData.get("price_per_cake") ?? 0),
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
