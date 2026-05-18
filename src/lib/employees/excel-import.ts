import "server-only";

import ExcelJS from "exceljs";
import type { SupabaseClient } from "@supabase/supabase-js";

import { appendEmployeeAddDigestEntries } from "@/lib/cron/employee-add-digest";
import type { Database } from "@/types/database";

export interface ExcelImportResult {
  ok: boolean;
  imported: number;
  failed: number;
  errors: Array<{ row: number; reason: string }>;
  globalError?: string;
}

const HEADER_MAP: Record<
  string,
  "first_name" | "last_name" | "birthday" | "number_of_people"
> = {
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

export function parseBirthday(value: unknown): string | null {
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = String(value ?? "").trim();
  if (!s) return null;
  const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (!m) return null;
  const yyyy = m[1];
  const mm = m[2].padStart(2, "0");
  const dd = m[3].padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type EmployeeInsert = Database["public"]["Tables"]["employees"]["Insert"];

export type ParsedEmployeeImportRow = EmployeeInsert & {
  company_id: string;
  first_name: string;
  last_name: string;
  birthday: string;
  number_of_people: number;
  is_active: true;
};

/**
 * Läser workbook från buffert och bygger rader för insert (samma mall som admin-import).
 */
export async function parseEmployeesExcelBuffer(
  arrayBuffer: ArrayBuffer,
  companyId: string,
):
  Promise<
    | { globalError: string; validRows?: undefined; errors?: undefined }
    | {
        globalError?: undefined;
        validRows: ParsedEmployeeImportRow[];
        errors: ExcelImportResult["errors"];
      }
  > {
  let workbook: ExcelJS.Workbook;
  try {
    workbook = new ExcelJS.Workbook();
    type LooseLoad = { load(data: ArrayBuffer): Promise<ExcelJS.Workbook> };
    await (workbook.xlsx as unknown as LooseLoad).load(arrayBuffer);
  } catch (err) {
    return {
      globalError: `Kunde inte läsa filen: ${err instanceof Error ? err.message : "okänt fel"}`,
    };
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { globalError: "Arbetsboken är tom." };
  }

  const headerRow = sheet.getRow(1);
  const colByField: Partial<
    Record<"first_name" | "last_name" | "birthday" | "number_of_people", number>
  > = {};
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
      globalError: `Saknar kolumn(er): ${missing.join(", ")}`,
    };
  }

  const validRows: ParsedEmployeeImportRow[] = [];
  const errors: ExcelImportResult["errors"] = [];

  const rowCount = sheet.rowCount;
  for (let r = 2; r <= rowCount; r++) {
    const row = sheet.getRow(r);
    if (row.cellCount === 0) continue;

    const firstName = String(
      row.getCell(colByField.first_name!).value ?? "",
    ).trim();
    const lastName = String(
      row.getCell(colByField.last_name!).value ?? "",
    ).trim();
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

  return { validRows, errors };
}

/** Bulk-insert parsade rader + digest (samma beteende som admin Excel-import). */
export async function insertParsedEmployeeRows(
  supabase: SupabaseClient<Database>,
  validRows: ParsedEmployeeImportRow[],
  parseErrors: ExcelImportResult["errors"],
): Promise<ExcelImportResult> {
  let imported = 0;
  if (validRows.length > 0) {
    const { error } = await supabase.from("employees").insert(validRows);
    if (error) {
      return {
        ok: false,
        imported: 0,
        failed: validRows.length + parseErrors.length,
        errors: parseErrors,
        globalError: `Databasen avvisade importen: ${error.message}`,
      };
    }
    imported = validRows.length;
    const companyId = validRows[0]?.company_id;
    if (companyId) {
      await appendEmployeeAddDigestEntries(
        companyId,
        validRows.map((r) => ({
          kind: "add" as const,
          first_name: r.first_name,
          last_name: r.last_name,
          birthday: r.birthday,
          personal_number: null,
        })),
      );
    }
  }

  return {
    ok: true,
    imported,
    failed: parseErrors.length,
    errors: parseErrors,
  };
}

export async function importEmployeesExcelBuffer(
  supabase: SupabaseClient<Database>,
  companyId: string,
  arrayBuffer: ArrayBuffer,
): Promise<ExcelImportResult> {
  const parsed = await parseEmployeesExcelBuffer(arrayBuffer, companyId);
  if ("globalError" in parsed && parsed.globalError) {
    return {
      ok: false,
      imported: 0,
      failed: 0,
      errors: [],
      globalError: parsed.globalError,
    };
  }
  return insertParsedEmployeeRows(
    supabase,
    parsed.validRows!,
    parsed.errors ?? [],
  );
}
