"use server";

import { revalidatePath } from "next/cache";

import type { ExcelImportResult } from "@/lib/employees/excel-import";
import { importEmployeesExcelBuffer } from "@/lib/employees/excel-import";
import { appendEmployeeAddDigestEntries } from "@/lib/cron/employee-add-digest";
import { createClient } from "@/lib/supabase/server";

export async function createEmployee(formData: FormData) {
  const supabase = createClient();
  const payload = {
    company_id: String(formData.get("company_id") ?? ""),
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    birthday: String(formData.get("birthday") ?? ""),
    number_of_people: Number(formData.get("number_of_people") ?? 1),
    is_active: formData.get("is_active") === "on",
  };
  const { error } = await supabase.from("employees").insert(payload);
  if (error) throw new Error(error.message);
  await appendEmployeeAddDigestEntries(payload.company_id, [
    {
      kind: "add",
      first_name: payload.first_name,
      last_name: payload.last_name,
      birthday: payload.birthday.trim() || null,
      personal_number: null,
    },
  ]);
  revalidatePath("/admin/anstallda");
}

export async function updateEmployee(id: string, formData: FormData) {
  const supabase = createClient();
  const payload = {
    company_id: String(formData.get("company_id") ?? ""),
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    birthday: String(formData.get("birthday") ?? ""),
    number_of_people: Number(formData.get("number_of_people") ?? 1),
    is_active: formData.get("is_active") === "on",
  };
  const { error } = await supabase
    .from("employees")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/anstallda");
  revalidatePath(`/admin/anstallda/${id}`);
}

export async function toggleEmployeeActive(id: string, next: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("employees")
    .update({ is_active: next })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/anstallda");
}

export async function deleteEmployee(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/anstallda");
}

// ---------- Excel import ----------

export type { ExcelImportResult } from "@/lib/employees/excel-import";

export async function importEmployeesExcel(
  formData: FormData,
): Promise<ExcelImportResult> {
  const companyId = String(formData.get("company_id") ?? "");
  const file = formData.get("file");

  if (!companyId) {
    return {
      ok: false,
      imported: 0,
      failed: 0,
      errors: [],
      globalError: "Välj ett företag innan du importerar.",
    };
  }
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
  const result = await importEmployeesExcelBuffer(supabase, companyId, arrayBuffer);
  if (result.ok) {
    revalidatePath("/admin/anstallda");
  }
  return result;
}
