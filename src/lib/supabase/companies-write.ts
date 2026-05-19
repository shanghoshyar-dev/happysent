import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { isMissingColumnError } from "./db-errors";

type CompanyInsert = Database["public"]["Tables"]["companies"]["Insert"];
type CompanyUpdate = Database["public"]["Tables"]["companies"]["Update"];

/** PostgREST: "Could not find the 'contact_phone' column ... in the schema cache" */
function missingColumnFromError(message: string): string | null {
  const quoted = message.match(/'([^']+)'\s+column/i);
  if (quoted?.[1]) return quoted[1];
  const dquoted = message.match(/column\s+"([^"]+)"/i);
  return dquoted?.[1] ?? null;
}

async function writeWithMissingColumnFallback<
  T extends Record<string, unknown>,
>(
  write: (body: T) => PromiseLike<{
    data: { id: string } | null;
    error: { message?: string; code?: string } | null;
  }>,
  payload: T,
): Promise<{
  data: { id: string } | null;
  error: { message?: string; code?: string } | null;
  strippedColumns: string[];
}> {
  let body = { ...payload } as T;
  const strippedColumns: string[] = [];
  let lastError: { message?: string; code?: string } | null = null;

  for (let attempt = 0; attempt < 10; attempt++) {
    const { data, error } = await write(body);
    if (!error) {
      return { data, error: null, strippedColumns };
    }
    lastError = error;
    if (!isMissingColumnError(error)) break;

    const col = missingColumnFromError(error.message ?? "");
    if (!col || !(col in body)) break;

    const { [col]: _removed, ...rest } = body;
    body = rest as T;
    strippedColumns.push(col);
  }

  return { data: null, error: lastError, strippedColumns };
}

export async function insertCompanyRow(
  supabase: SupabaseClient<Database>,
  payload: CompanyInsert,
) {
  return writeWithMissingColumnFallback(
    (body) =>
      supabase
        .from("companies")
        .insert(body as CompanyInsert)
        .select("id")
        .single(),
    payload as CompanyInsert & Record<string, unknown>,
  );
}

export async function updateCompanyRow(
  supabase: SupabaseClient<Database>,
  id: string,
  payload: CompanyUpdate,
) {
  return writeWithMissingColumnFallback(
    (body) =>
      supabase
        .from("companies")
        .update(body as CompanyUpdate)
        .eq("id", id)
        .select("id")
        .single(),
    payload as CompanyUpdate & Record<string, unknown>,
  );
}
