"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCompanySession } from "@/lib/auth/session";
import { validateProductForCompany } from "@/lib/cake-selection/assign-product";
import { appendEmployeeAddDigestEntries } from "@/lib/cron/employee-add-digest";
import type { CelebrationFrequency, GiftType } from "@/lib/celebrations";
import type { ExcelImportResult } from "@/lib/employees/excel-import";
import { importEmployeesExcelBuffer } from "@/lib/employees/excel-import";
import { createClient } from "@/lib/supabase/server";

const CELEBRATION_FREQUENCIES = [
  "every_year",
  "twice_yearly",
  "decade",
] as const satisfies readonly CelebrationFrequency[];

const GIFT_TYPES = ["cake", "flowers"] as const satisfies readonly GiftType[];

function parseCelebrationFrequencyField(formData: FormData): CelebrationFrequency {
  const raw = String(formData.get("celebration_frequency") ?? "every_year");
  if (CELEBRATION_FREQUENCIES.includes(raw as CelebrationFrequency)) {
    return raw as CelebrationFrequency;
  }
  return "every_year";
}

function parseGiftTypeField(formData: FormData): GiftType {
  const raw = String(formData.get("gift_type") ?? "cake");
  if (GIFT_TYPES.includes(raw as GiftType)) {
    return raw as GiftType;
  }
  return "cake";
}

async function requireCompanySession() {
  const session = await getCompanySession();
  if (!session) throw new Error("Du måste vara inloggad.");
  return session;
}

function revalidateKund(companyId: string) {
  revalidatePath("/kund");
  revalidatePath("/kund/anstallda");
  revalidatePath("/kund/tartor");
  revalidatePath(`/admin/foretag/${companyId}/aktivera`);
}

export type AssignPreferredCakeResult =
  | { ok: true; count: number; productName: string }
  | { ok: false; error: string };

export async function assignPreferredCake(
  productId: string,
  employeeIds: string[],
): Promise<AssignPreferredCakeResult> {
  const session = await requireCompanySession();
  if (!employeeIds.length) {
    return { ok: false, error: "Välj minst en anställd." };
  }

  const supabase = createClient();
  const { data: company, error: coErr } = await supabase
    .from("companies")
    .select("city, bakery_id")
    .eq("id", session.companyId)
    .maybeSingle();

  if (coErr || !company?.city?.trim()) {
    return { ok: false, error: "Företaget saknar stad." };
  }

  const product = await validateProductForCompany(
    company.city,
    productId,
    company.bakery_id,
  );
  if (!product) {
    return { ok: false, error: "Ogiltigt tårtval." };
  }

  const { data: employees, error: empErr } = await supabase
    .from("employees")
    .select("id")
    .eq("company_id", session.companyId)
    .eq("is_active", true)
    .eq("gift_type", "cake")
    .in("id", employeeIds);

  if (empErr) return { ok: false, error: empErr.message };
  if (!employees?.length) {
    return { ok: false, error: "Inga giltiga anställda valdes." };
  }

  const ids = employees.map((e) => e.id);
  const { error: updErr } = await supabase
    .from("employees")
    .update({ preferred_product_id: productId })
    .eq("company_id", session.companyId)
    .in("id", ids);

  if (updErr) return { ok: false, error: updErr.message };

  revalidateKund(session.companyId);
  return { ok: true, count: ids.length, productName: product.name };
}

export type ClearPreferredCakeResult =
  | { ok: true; count: number }
  | { ok: false; error: string };

export async function clearPreferredCake(
  employeeIds: string[],
): Promise<ClearPreferredCakeResult> {
  const session = await requireCompanySession();
  if (!employeeIds.length) {
    return { ok: false, error: "Välj minst en anställd." };
  }

  const supabase = createClient();
  const { data: employees, error: empErr } = await supabase
    .from("employees")
    .select("id")
    .eq("company_id", session.companyId)
    .in("id", employeeIds);

  if (empErr) return { ok: false, error: empErr.message };
  if (!employees?.length) {
    return { ok: false, error: "Inga giltiga anställda valdes." };
  }

  const ids = employees.map((e) => e.id);
  const { error: updErr } = await supabase
    .from("employees")
    .update({ preferred_product_id: null })
    .eq("company_id", session.companyId)
    .in("id", ids);

  if (updErr) return { ok: false, error: updErr.message };

  revalidateKund(session.companyId);
  return { ok: true, count: ids.length };
}

export async function createKundEmployee(formData: FormData) {
  const session = await requireCompanySession();
  const supabase = createClient();

  const payload = {
    company_id: session.companyId,
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    birthday: String(formData.get("birthday") ?? ""),
    number_of_people: Number(formData.get("number_of_people") ?? 1),
    celebration_frequency: parseCelebrationFrequencyField(formData),
    gift_type: parseGiftTypeField(formData),
    is_active: formData.get("is_active") === "on",
  };

  const { error } = await supabase.from("employees").insert(payload);
  if (error) throw new Error(error.message);

  await appendEmployeeAddDigestEntries(session.companyId, [
    {
      kind: "add",
      first_name: payload.first_name,
      last_name: payload.last_name,
      birthday: payload.birthday.trim() || null,
      personal_number: null,
    },
  ]);

  revalidateKund(session.companyId);
  redirect("/kund/anstallda");
}

export async function updateKundEmployee(id: string, formData: FormData) {
  const session = await requireCompanySession();
  const supabase = createClient();

  const payload = {
    company_id: session.companyId,
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    birthday: String(formData.get("birthday") ?? ""),
    number_of_people: Number(formData.get("number_of_people") ?? 1),
    celebration_frequency: parseCelebrationFrequencyField(formData),
    gift_type: parseGiftTypeField(formData),
    is_active: formData.get("is_active") === "on",
  };

  const { error } = await supabase
    .from("employees")
    .update(payload)
    .eq("id", id)
    .eq("company_id", session.companyId);

  if (error) throw new Error(error.message);
  revalidateKund(session.companyId);
  revalidatePath(`/kund/anstallda/${id}`);
  redirect("/kund/anstallda");
}

export async function deleteKundEmployee(id: string) {
  const session = await requireCompanySession();
  const supabase = createClient();

  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", id)
    .eq("company_id", session.companyId);

  if (error) throw new Error(error.message);
  revalidateKund(session.companyId);
  redirect("/kund/anstallda");
}

export async function importKundEmployeesExcel(
  formData: FormData,
): Promise<ExcelImportResult> {
  const session = await requireCompanySession();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false,
      imported: 0,
      failed: 0,
      errors: [],
      globalError: "Ingen fil vald.",
    };
  }

  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch (err) {
    return {
      ok: false,
      imported: 0,
      failed: 0,
      errors: [],
      globalError: `Kunde inte läsa filen: ${err instanceof Error ? err.message : "okänt fel"}`,
    };
  }

  const supabase = createClient();
  const result = await importEmployeesExcelBuffer(
    supabase,
    session.companyId,
    arrayBuffer,
  );
  if (result.ok) revalidateKund(session.companyId);
  return result;
}

export type { ExcelImportResult };
