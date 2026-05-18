import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/** Rad som visas i admin-kön (nykundsansökningar). */
export type PendingApplicationQueueRow = {
  id: string;
  contact_name: string;
  company_name: string;
  contact_email: string;
  contact_phone: string | null;
  message: string | null;
  created_at: string;
  terms_accepted_at: string | null;
  terms_document_version: string;
  employees_import_storage_path: string | null;
};

const SELECT_WITH_EXCEL =
  "id, contact_name, company_name, contact_email, contact_phone, message, created_at, terms_accepted_at, terms_document_version, employees_import_storage_path";

const SELECT_WITHOUT_EXCEL =
  "id, contact_name, company_name, contact_email, contact_phone, message, created_at, terms_accepted_at, terms_document_version";

function mentionsMissingExcelColumn(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes("employees_import_storage_path") ||
    (m.includes("column") && m.includes("company_applications"))
  );
}

function rowFromDb(
  r: {
    id: string;
    contact_name: string;
    company_name: string;
    contact_email: string;
    contact_phone: string | null;
    message: string | null;
    created_at: string;
    terms_accepted_at: string | null;
    terms_document_version: string;
    employees_import_storage_path?: string | null;
  },
  excelOverride: string | null | undefined,
): PendingApplicationQueueRow {
  return {
    id: r.id,
    contact_name: r.contact_name,
    company_name: r.company_name,
    contact_email: r.contact_email,
    contact_phone: r.contact_phone,
    message: r.message,
    created_at: r.created_at,
    terms_accepted_at: r.terms_accepted_at,
    terms_document_version: r.terms_document_version,
    employees_import_storage_path:
      excelOverride !== undefined
        ? excelOverride
        : (r.employees_import_storage_path ?? null),
  };
}

/**
 * Hämtar väntande ansökningar. Om DB saknar kolumnen för Excel-uppladdning
 * faller vi tillbaka utan den så att kön ändå syns (tills migration körts).
 */
export async function fetchPendingCompanyApplications(
  supabase: SupabaseClient<Database>,
): Promise<{
  rows: PendingApplicationQueueRow[];
  /** Sätts vid legacy-läge eller om läsning misslyckades. */
  warning?: string;
}> {
  const first = await supabase
    .from("company_applications")
    .select(SELECT_WITH_EXCEL)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (!first.error && first.data) {
    return {
      rows: first.data.map((r) => rowFromDb(r, undefined)),
    };
  }

  if (first.error && mentionsMissingExcelColumn(first.error.message ?? "")) {
    const second = await supabase
      .from("company_applications")
      .select(SELECT_WITHOUT_EXCEL)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!second.error && second.data) {
      return {
        rows: second.data.map((r) => rowFromDb(r, null)),
        warning:
          "Databasen saknar kolumnen för Excel-bilagor — kör migrationen som lägger till employees_import_storage_path och bucket company_application_uploads.",
      };
    }
    console.error(
      "[fetchPendingCompanyApplications] fallback-select misslyckades:",
      second.error,
    );
    return {
      rows: [],
      warning:
        second.error?.message ??
        "Kunde inte läsa kön (kontrollera att senaste Supabase-migrationer är körda).",
    };
  }

  console.error(
    "[fetchPendingCompanyApplications] select misslyckades:",
    first.error,
  );
  return {
    rows: [],
    warning:
      first.error?.message ??
      "Kunde inte läsa kön. Kontrollera databasen och serverloggar.",
  };
}

/** En väntande ansökan för förifyllnad på «Nytt företag» (tolererar saknad excel-kolumn). */
export async function fetchPendingApplicationById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<PendingApplicationQueueRow | null> {
  const first = await supabase
    .from("company_applications")
    .select(SELECT_WITH_EXCEL)
    .eq("id", id)
    .eq("status", "pending")
    .maybeSingle();

  if (!first.error && first.data) {
    return rowFromDb(first.data, undefined);
  }

  if (first.error && mentionsMissingExcelColumn(first.error.message ?? "")) {
    const second = await supabase
      .from("company_applications")
      .select(SELECT_WITHOUT_EXCEL)
      .eq("id", id)
      .eq("status", "pending")
      .maybeSingle();

    if (!second.error && second.data) {
      return rowFromDb(second.data, null);
    }
  }

  return null;
}
