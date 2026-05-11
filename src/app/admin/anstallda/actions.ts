"use server";

import { revalidatePath } from "next/cache";
import ExcelJS from "exceljs";

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

export interface ExcelImportResult {
  ok: boolean;
  imported: number;
  failed: number;
  errors: Array<{ row: number; reason: string }>;
  /** Empty when ok=false at a global level (e.g. unreadable file). */
  globalError?: string;
}

const HEADER_MAP: Record<string, "first_name" | "last_name" | "birthday" | "number_of_people"> = {
  förnamn: "first_name",
  fornamn: "first_name",
  efternamn: "last_name",
  födelsedag: "birthday",
  fodelsedag: "birthday",
  "antal personer": "number_of_people",
  antal: "number_of_people",
};

function normaliseHeader(h: unknown): string {
  return String(h ?? "").trim().toLowerCase();
}

function parseBirthday(value: unknown): string | null {
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = String(value ?? "").trim();
  if (!s) return null;
  // Accept YYYY-MM-DD and YYYY/MM/DD
  const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (!m) return null;
  const yyyy = m[1];
  const mm = m[2].padStart(2, "0");
  const dd = m[3].padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

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

  let workbook: ExcelJS.Workbook;
  try {
    const arrayBuffer = await file.arrayBuffer();
    workbook = new ExcelJS.Workbook();
    // exceljs accepts ArrayBuffer at runtime, but its type defs are tied to
    // the older non-generic Buffer signature. Sidestep with an opaque cast.
    type LooseLoad = { load(data: ArrayBuffer): Promise<ExcelJS.Workbook> };
    await (workbook.xlsx as unknown as LooseLoad).load(arrayBuffer);
  } catch (err) {
    return {
      ok: false,
      imported: 0,
      failed: 0,
      errors: [],
      globalError: `Kunde inte läsa filen: ${err instanceof Error ? err.message : "okänt fel"}`,
    };
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return {
      ok: false,
      imported: 0,
      failed: 0,
      errors: [],
      globalError: "Arbetsboken är tom.",
    };
  }

  // Build a column-index map from the first row.
  const headerRow = sheet.getRow(1);
  const colMap: Record<number, keyof typeof HEADER_MAP[keyof typeof HEADER_MAP] | "first_name" | "last_name" | "birthday" | "number_of_people"> = {} as never;
  const colByField: Partial<Record<"first_name" | "last_name" | "birthday" | "number_of_people", number>> = {};
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const key = HEADER_MAP[normaliseHeader(cell.value)];
    if (key) colByField[key] = colNumber;
  });

  const missing: string[] = [];
  if (!colByField.first_name) missing.push("Förnamn");
  if (!colByField.last_name) missing.push("Efternamn");
  if (!colByField.birthday) missing.push("Födelsedag");
  if (!colByField.number_of_people) missing.push("Antal personer");
  if (missing.length) {
    return {
      ok: false,
      imported: 0,
      failed: 0,
      errors: [],
      globalError: `Saknar kolumn(er): ${missing.join(", ")}`,
    };
  }

  type ValidRow = {
    company_id: string;
    first_name: string;
    last_name: string;
    birthday: string;
    number_of_people: number;
    is_active: true;
  };

  const validRows: ValidRow[] = [];
  const errors: ExcelImportResult["errors"] = [];

  const rowCount = sheet.rowCount;
  for (let r = 2; r <= rowCount; r++) {
    const row = sheet.getRow(r);
    if (row.cellCount === 0) continue;

    const firstName = String(row.getCell(colByField.first_name!).value ?? "").trim();
    const lastName = String(row.getCell(colByField.last_name!).value ?? "").trim();
    const birthday = parseBirthday(row.getCell(colByField.birthday!).value);
    const numberRaw = row.getCell(colByField.number_of_people!).value;
    const numberOfPeople = Number(
      typeof numberRaw === "object" && numberRaw && "result" in numberRaw
        ? (numberRaw as { result: unknown }).result
        : numberRaw,
    );

    if (!firstName || !lastName) {
      errors.push({ row: r, reason: "Saknar förnamn eller efternamn" });
      continue;
    }
    if (!birthday) {
      errors.push({ row: r, reason: "Födelsedag måste vara YYYY-MM-DD" });
      continue;
    }
    if (!Number.isFinite(numberOfPeople) || numberOfPeople < 1) {
      errors.push({ row: r, reason: "Antal personer måste vara minst 1" });
      continue;
    }

    validRows.push({
      company_id: companyId,
      first_name: firstName,
      last_name: lastName,
      birthday,
      number_of_people: numberOfPeople,
      is_active: true,
    });
  }

  let imported = 0;
  if (validRows.length > 0) {
    const supabase = createClient();
    const { error } = await supabase.from("employees").insert(validRows);
    if (error) {
      return {
        ok: false,
        imported: 0,
        failed: validRows.length + errors.length,
        errors,
        globalError: `Databasen avvisade importen: ${error.message}`,
      };
    }
    imported = validRows.length;
  }

  revalidatePath("/admin/anstallda");

  return {
    ok: true,
    imported,
    failed: errors.length,
    errors,
  };
}
