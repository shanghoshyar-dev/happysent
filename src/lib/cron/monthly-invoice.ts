import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendMonthlyInvoiceSummary } from "@/lib/resend/templates";
import { swedishMonthLabel, toDateString } from "@/lib/holidays/swedish";

export interface MonthlyInvoiceResult {
  monthLabel: string;
  rowsSummarised: number;
  totalAmount: number;
  emailSent: boolean;
}

/**
 * Build a summary of all delivered/scheduled orders for the calendar month
 * containing `referenceDate`, grouped by company. Sends an email to
 * ADMIN_EMAIL with the totals. Idempotent enough that calling it multiple
 * times the same day just resends the same digest.
 */
export async function runMonthlyInvoiceSummary(
  referenceDate: Date,
): Promise<MonthlyInvoiceResult> {
  const supabase = createAdminClient();
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth(); // 0-indexed
  const startIso = toDateString(new Date(Date.UTC(year, month, 1)));
  const endIso = toDateString(new Date(Date.UTC(year, month + 1, 0))); // last day

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `id, price, status, delivery_date, company_id,
       companies:company_id ( name )`,
    )
    .gte("delivery_date", startIso)
    .lte("delivery_date", endIso)
    .in("status", ["delivered", "sent_to_bakery", "invoiced", "scheduled"]);

  if (error) throw new Error(`Monthly summary load failed: ${error.message}`);

  const byCompany = new Map<
    string,
    { companyName: string; deliveries: number; amount: number }
  >();
  for (const o of orders ?? []) {
    const company = (o as unknown as { companies: { name: string } | null }).companies;
    const key = o.company_id;
    const entry = byCompany.get(key) ?? {
      companyName: company?.name ?? "Okänt företag",
      deliveries: 0,
      amount: 0,
    };
    entry.deliveries += 1;
    entry.amount += o.price ?? 0;
    byCompany.set(key, entry);
  }

  const rows = Array.from(byCompany.values()).sort((a, b) =>
    a.companyName.localeCompare(b.companyName, "sv"),
  );
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  const monthLabel = swedishMonthLabel(referenceDate);

  await sendMonthlyInvoiceSummary({ monthLabel, rows, total });

  return {
    monthLabel,
    rowsSummarised: rows.length,
    totalAmount: total,
    emailSent: true,
  };
}
