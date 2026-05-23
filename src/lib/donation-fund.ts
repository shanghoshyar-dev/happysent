import "server-only";

import {
  DONATION_KR_PER_DELIVERY,
} from "@/lib/donation-campaign";
import { createAdminClient } from "@/lib/supabase/admin";

export { DONATION_KR_PER_DELIVERY } from "@/lib/donation-campaign";

export async function getDonationFundTotalKr(): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("donation_contributions")
    .select("amount_kr");
  if (error) {
    console.error("[donation-fund] sum failed:", error.message);
    return 0;
  }
  return (data ?? []).reduce((sum, row) => sum + row.amount_kr, 0);
}

/**
 * När en faktura markeras betald: lägg 10 kr × antal ordrar i kassan (en gång per faktura).
 */
export async function creditDonationForPaidInvoice(
  invoiceId: string,
): Promise<{ credited: boolean; amountKr: number }> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("donation_contributions")
    .select("invoice_id")
    .eq("invoice_id", invoiceId)
    .maybeSingle();
  if (existing) {
    return { credited: false, amountKr: 0 };
  }

  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .select("orders, status")
    .eq("id", invoiceId)
    .maybeSingle();
  if (invErr || !invoice) {
    throw new Error(invErr?.message ?? "Faktura hittades inte.");
  }
  if (invoice.status !== "paid") {
    return { credited: false, amountKr: 0 };
  }

  const orderIds = Array.isArray(invoice.orders)
    ? (invoice.orders as string[])
    : [];
  const orderCount = orderIds.length;
  if (orderCount === 0) {
    return { credited: false, amountKr: 0 };
  }

  const amountKr = orderCount * DONATION_KR_PER_DELIVERY;
  const { error: insErr } = await supabase.from("donation_contributions").insert({
    invoice_id: invoiceId,
    order_count: orderCount,
    amount_kr: amountKr,
  });
  if (insErr) {
    if (insErr.code === "23505") {
      return { credited: false, amountKr: 0 };
    }
    throw new Error(insErr.message);
  }

  return { credited: true, amountKr };
}
