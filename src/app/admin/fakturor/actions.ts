"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Generate (or regenerate) invoices for a given month (format: YYYY-MM).
 * Pulls all delivered/invoiced orders for that month per company, sums them,
 * and upserts an invoices row. Then marks those orders as `invoiced`.
 */
export async function generateInvoicesForMonth(month: string) {
  const supabase = createAdminClient();

  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error("Month must be formatted as YYYY-MM");
  }
  const start = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const nextMonth =
    m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, company_id, price")
    .gte("delivery_date", start)
    .lt("delivery_date", nextMonth)
    .in("status", ["delivered", "invoiced"]);

  if (error) throw new Error(error.message);
  if (!orders || orders.length === 0) return { invoices: 0 };

  const grouped = new Map<string, { ids: string[]; total: number }>();
  for (const o of orders) {
    const g = grouped.get(o.company_id) ?? { ids: [], total: 0 };
    g.ids.push(o.id);
    g.total += o.price;
    grouped.set(o.company_id, g);
  }

  let count = 0;
  for (const [companyId, g] of grouped.entries()) {
    const { error: upsertErr } = await supabase
      .from("invoices")
      .upsert(
        {
          company_id: companyId,
          month,
          total_amount: g.total,
          orders: g.ids,
          status: "unpaid",
        },
        { onConflict: "company_id,month" },
      );
    if (upsertErr) throw new Error(upsertErr.message);

    await supabase
      .from("orders")
      .update({ status: "invoiced" })
      .in("id", g.ids);

    count++;
  }

  revalidatePath("/admin/fakturor");
  return { invoices: count };
}

export async function markInvoicePaid(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("invoices")
    .update({ status: "paid" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/fakturor");
  revalidatePath(`/admin/fakturor/${id}`);
}
