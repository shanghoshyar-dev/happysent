"use server";

import { revalidatePath } from "next/cache";

import type { CelebrationFrequency, GiftType } from "@/lib/celebrations";
import type { ExcelImportResult } from "@/lib/employees/excel-import";
import { importEmployeesExcelBuffer } from "@/lib/employees/excel-import";
import { appendEmployeeAddDigestEntries } from "@/lib/cron/employee-add-digest";
import { catchUpEmployeeDelivery } from "@/lib/cron/catch-up-delivery";
import { formatCatchUpNotice } from "@/lib/cron/catch-up-message";
import { deleteEmployeePreservingOrders } from "@/lib/employees/delete-employee";
import {
  parseEmployeeCakeFields,
  validateEmployeeCakeFields,
} from "@/lib/pricing/resolve-order-price";
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

export async function createEmployee(formData: FormData): Promise<{
  catchUpNotice: string | null;
}> {
  const supabase = createClient();
  const cakeFields = parseEmployeeCakeFields(formData);
  await validateEmployeeCakeFields(
    supabase,
    cakeFields.cake_name,
    cakeFields.people_count,
  );
  const payload = {
    company_id: String(formData.get("company_id") ?? ""),
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    birthday: String(formData.get("birthday") ?? ""),
    number_of_people: Number(formData.get("number_of_people") ?? 1),
    celebration_frequency: parseCelebrationFrequencyField(formData),
    gift_type: parseGiftTypeField(formData),
    is_active: formData.get("is_active") === "on",
    cake_name: cakeFields.cake_name,
    people_count: cakeFields.people_count,
  };
  const { data: inserted, error } = await supabase
    .from("employees")
    .insert(payload)
    .select("id")
    .single();
  if (error || !inserted) throw new Error(error?.message ?? "Insert failed");
  await appendEmployeeAddDigestEntries(payload.company_id, [
    {
      kind: "add",
      first_name: payload.first_name,
      last_name: payload.last_name,
      birthday: payload.birthday.trim() || null,
      personal_number: null,
    },
  ]);
  const catchUp = await catchUpEmployeeDelivery(inserted.id);
  revalidatePath("/admin/anstallda");
  revalidatePath(`/admin/foretag/${payload.company_id}/aktivera`);
  return {
    catchUpNotice:
      catchUp.triggered && catchUp.daysAway != null
        ? formatCatchUpNotice(catchUp.daysAway)
        : null,
  };
}

export async function updateEmployee(id: string, formData: FormData) {
  const supabase = createClient();
  const cakeFields = parseEmployeeCakeFields(formData);
  await validateEmployeeCakeFields(
    supabase,
    cakeFields.cake_name,
    cakeFields.people_count,
  );
  const payload = {
    company_id: String(formData.get("company_id") ?? ""),
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    birthday: String(formData.get("birthday") ?? ""),
    number_of_people: Number(formData.get("number_of_people") ?? 1),
    celebration_frequency: parseCelebrationFrequencyField(formData),
    gift_type: parseGiftTypeField(formData),
    is_active: formData.get("is_active") === "on",
    cake_name: cakeFields.cake_name,
    people_count: cakeFields.people_count,
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
  const { data: emp } = await supabase
    .from("employees")
    .select("company_id")
    .eq("id", id)
    .maybeSingle();

  await deleteEmployeePreservingOrders(supabase, id);
  revalidatePath("/admin/anstallda");
  if (emp?.company_id) {
    revalidatePath(`/admin/foretag/${emp.company_id}/aktivera`);
  }
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
    revalidatePath(`/admin/foretag/${companyId}/aktivera`);
  }
  return result;
}
