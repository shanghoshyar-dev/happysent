import "server-only";

import {
  DONATION_KR_PER_DELIVERY,
  endOfCampaignYearMs,
  stockholmYear,
} from "@/lib/donation-campaign";
import { sendDonationYearSummary } from "@/lib/resend/templates";
import { createAdminClient } from "@/lib/supabase/admin";

export { DONATION_KR_PER_DELIVERY } from "@/lib/donation-campaign";

export interface DonationCampaignCloseResult {
  closed: boolean;
  year?: number;
  totalKr?: number;
  emailSent?: boolean;
}

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

export async function getPreviousYearDonationSnapshot(): Promise<{
  year: number;
  totalKr: number;
} | null> {
  const year = stockholmYear() - 1;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("donation_campaign_snapshots")
    .select("total_kr")
    .eq("year", year)
    .maybeSingle();
  if (error) {
    console.error("[donation-fund] previous year snapshot failed:", error.message);
    return null;
  }
  if (!data) return null;
  return { year, totalKr: data.total_kr };
}

function campaignYearToCloseIfDue(now: Date): number | null {
  const closingYear = stockholmYear(now) - 1;
  if (now.getTime() <= endOfCampaignYearMs(closingYear)) {
    return null;
  }
  return closingYear;
}

/**
 * Efter 31 december: spara årets summa, mejla admin, töm kassan (en gång per år).
 */
export async function closeDonationCampaignIfDue(
  now: Date = new Date(),
): Promise<DonationCampaignCloseResult> {
  const year = campaignYearToCloseIfDue(now);
  if (year === null) {
    return { closed: false };
  }

  try {
    const supabase = createAdminClient();
    const { data: existing, error: existErr } = await supabase
      .from("donation_campaign_snapshots")
      .select("year")
      .eq("year", year)
      .maybeSingle();
    if (existErr) {
      console.error("[donation-fund] close check failed:", existErr.message);
      return { closed: false };
    }
    if (existing) {
      return { closed: false };
    }

    const totalKr = await getDonationFundTotalKr();

    const { error: insertErr } = await supabase
      .from("donation_campaign_snapshots")
      .insert({
        year,
        total_kr: totalKr,
      });
    if (insertErr) {
      if (insertErr.code === "23505") {
        return { closed: false };
      }
      console.error("[donation-fund] close insert failed:", insertErr.message);
      return { closed: false };
    }

    let emailSent = false;
    try {
      await sendDonationYearSummary({ year, totalKr });
      emailSent = true;
      await supabase
        .from("donation_campaign_snapshots")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("year", year);
    } catch (err) {
      console.error("[donation-fund] year summary email failed:", err);
    }

    const { error: deleteErr } = await supabase
      .from("donation_contributions")
      .delete()
      .not("invoice_id", "is", null);
    if (deleteErr) {
      console.error("[donation-fund] close delete failed:", deleteErr.message);
      return { closed: true, year, totalKr, emailSent };
    }

    return { closed: true, year, totalKr, emailSent };
  } catch (err) {
    console.error("[donation-fund] close failed:", err);
    return { closed: false };
  }
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
