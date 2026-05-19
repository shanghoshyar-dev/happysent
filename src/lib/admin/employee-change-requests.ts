import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export type EmployeeChangeRequestRow = {
  first_name: string;
  last_name: string;
  birthday: string;
};

export type PendingEmployeeChangeRequest = {
  id: string;
  action_type: "add" | "remove";
  company_name: string;
  address: string;
  city: string;
  postal_code: string;
  submitted_by_email: string;
  message: string | null;
  number_of_people: number | null;
  employees: EmployeeChangeRequestRow[];
  matched_company_id: string | null;
  matched_company_name: string | null;
  created_at: string;
};

const SELECT_PENDING = `
  id, action_type, company_name, address, city, postal_code,
  submitted_by_email, message, number_of_people, employees,
  matched_company_id, created_at,
  companies:matched_company_id ( name )
`;

export function parseEmployeesJson(raw: unknown): EmployeeChangeRequestRow[] {
  if (!Array.isArray(raw)) return [];
  const rows: EmployeeChangeRequestRow[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const first_name = String(o.first_name ?? "").trim();
    const last_name = String(o.last_name ?? "").trim();
    const birthday = String(o.birthday ?? "").trim();
    if (!first_name || !last_name || !birthday) continue;
    rows.push({ first_name, last_name, birthday });
  }
  return rows;
}

function mapRow(r: {
  id: string;
  action_type: string;
  company_name: string;
  address: string;
  city: string;
  postal_code: string;
  submitted_by_email: string;
  message: string | null;
  number_of_people: number | null;
  employees: unknown;
  matched_company_id: string | null;
  created_at: string;
  companies: { name: string } | { name: string }[] | null;
}): PendingEmployeeChangeRequest {
  const companyJoin = r.companies;
  const matchedName = Array.isArray(companyJoin)
    ? companyJoin[0]?.name ?? null
    : companyJoin?.name ?? null;

  return {
    id: r.id,
    action_type: r.action_type as "add" | "remove",
    company_name: r.company_name,
    address: r.address,
    city: r.city,
    postal_code: r.postal_code,
    submitted_by_email: r.submitted_by_email,
    message: r.message,
    number_of_people: r.number_of_people,
    employees: parseEmployeesJson(r.employees),
    matched_company_id: r.matched_company_id,
    matched_company_name: matchedName,
    created_at: r.created_at,
  };
}

export async function fetchPendingEmployeeChangeRequests(
  supabase: SupabaseClient<Database>,
): Promise<{ rows: PendingEmployeeChangeRequest[]; warning?: string }> {
  const { data, error } = await supabase
    .from("employee_change_requests")
    .select(SELECT_PENDING)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    if (
      error.message?.toLowerCase().includes("employee_change_requests") ||
      error.message?.toLowerCase().includes("schema cache")
    ) {
      return {
        rows: [],
        warning:
          "Kör migrationen employee_change_requests i Supabase för att visa personaländringar i kön.",
      };
    }
    return { rows: [], warning: error.message };
  }

  return {
    rows: (data ?? []).map((r) =>
      mapRow(
        r as unknown as Parameters<typeof mapRow>[0],
      ),
    ),
  };
}

export async function fetchEmployeeChangeRequestById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<PendingEmployeeChangeRequest | null> {
  const { data, error } = await supabase
    .from("employee_change_requests")
    .select(SELECT_PENDING)
    .eq("id", id)
    .eq("status", "pending")
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data as unknown as Parameters<typeof mapRow>[0]);
}
