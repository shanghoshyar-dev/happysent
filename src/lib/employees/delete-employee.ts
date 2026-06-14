import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, OrderStatus } from "@/types/database";

const PRESERVED_ORDER_STATUSES: OrderStatus[] = ["delivered", "invoiced"];

type Client = SupabaseClient<Database>;

export async function deleteEmployeePreservingOrders(
  supabase: Client,
  employeeId: string,
  companyId?: string,
): Promise<void> {
  let empQuery = supabase
    .from("employees")
    .select("id, first_name, last_name, company_id")
    .eq("id", employeeId);
  if (companyId) {
    empQuery = empQuery.eq("company_id", companyId);
  }

  const { data: emp, error: empErr } = await empQuery.maybeSingle();
  if (empErr) throw new Error(empErr.message);
  if (!emp) throw new Error("Anställd hittades inte.");

  const { error: snapshotErr } = await supabase
    .from("orders")
    .update({
      employee_first_name: emp.first_name,
      employee_last_name: emp.last_name,
    })
    .eq("employee_id", employeeId)
    .in("status", PRESERVED_ORDER_STATUSES);
  if (snapshotErr) throw new Error(snapshotErr.message);

  const { error: ordersErr } = await supabase
    .from("orders")
    .delete()
    .eq("employee_id", employeeId)
    .not("status", "in", `(${PRESERVED_ORDER_STATUSES.join(",")})`);
  if (ordersErr) throw new Error(ordersErr.message);

  let deleteQuery = supabase.from("employees").delete().eq("id", employeeId);
  if (companyId) {
    deleteQuery = deleteQuery.eq("company_id", companyId);
  }

  const { error: deleteErr } = await deleteQuery;
  if (deleteErr) throw new Error(deleteErr.message);
}
