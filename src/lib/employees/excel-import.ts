import "server-only";

import ExcelJS from "exceljs";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  parseCelebrationFrequency,
  parseGiftType,
  type CelebrationFrequency,
  type GiftType,
} from "@/lib/celebrations";
import { appendEmployeeAddDigestEntries } from "@/lib/cron/employee-add-digest";
import type { Database } from "@/types/database";

export interface ExcelImportResult {
  ok: boolean;
  imported: number;
  failed: number;
  errors: Array<{ row: number; reason: string }>;
  globalError?: string;
}

type EmployeeImportField =
  | "first_name"
  | "last_name"
  | "birthday"
  | "number_of_people"
  | "celebration_frequency"
  | "gift_type";

const HEADER_MAP: Record<string, EmployeeImportField> = {
  förnamn: "first_name",
  fornamn: "first_name",
  efternamn: "last_name",
  födelsedag: "birthday",
  fodelsedag: "birthday",
  "antal personer": "number_of_people",
  antal: "number_of_people",
  firande: "celebration_frequency",
  frekvens: "celebration_frequency",
  gåva: "gift_type",
  gava: "gift_type",
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
  celebration_frequency: CelebrationFrequency;
  gift_type: GiftType;
  is_active: true;
};

function findHeaderRow(sheet: ExcelJS.Worksheet): {
  headerRowIndex: number;
  colByField: Partial<Record<EmployeeImportField, number>>;
} | null {
  for (let r = 1; r <= 5; r++) {
    const row = sheet.getRow(r);
    const colByField: Partial<Record<EmployeeImportField, number>> = {};
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const key = HEADER_MAP[normaliseHeader(cell.value)];
      if (key) colByField[key] = colNumber;
    });
    if (colByField.first_name) {
      return { headerRowIndex: r, colByField };
    }
  }
  return null;
}

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

  const header = findHeaderRow(sheet);
  if (!header) {
    return {
      globalError:
        "Kunde inte hitta kolumnrubriker (förväntar rad med ”Förnamn”).",
    };
  }
  const { headerRowIndex, colByField } = header;

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
  const dataStartRow = headerRowIndex + 1;
  for (let r = dataStartRow; r <= rowCount; r++) {
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

    let celebrationFrequency: CelebrationFrequency = "every_year";
    if (colByField.celebration_frequency) {
      const raw = String(
        row.getCell(colByField.celebration_frequency).value ?? "",
      ).trim();
      if (raw) {
        const parsed = parseCelebrationFrequency(raw);
        if (!parsed) {
          errors.push({
            row: r,
            reason:
              'Ogiltigt firande (t.ex. "varje år", "halvår", "10-år")',
          });
          continue;
        }
        celebrationFrequency = parsed;
      }
    }

    let giftType: GiftType = "cake";
    if (colByField.gift_type) {
      const raw = String(row.getCell(colByField.gift_type).value ?? "").trim();
      if (raw) {
        const parsed = parseGiftType(raw);
        if (!parsed) {
          errors.push({
            row: r,
            reason: 'Ogiltig gåva (t.ex. "tårta" eller "blommor")',
          });
          continue;
        }
        giftType = parsed;
      }
    }

    validRows.push({
      company_id: companyId,
      first_name: firstName,
      last_name: lastName,
      birthday,
      number_of_people: numberOfPeople,
      celebration_frequency: celebrationFrequency,
      gift_type: giftType,
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
