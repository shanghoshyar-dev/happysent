import "server-only";

import {
  DONATION_KR_PER_DELIVERY,
  endOfCampaignYearMs,
  stockholmYear,
} from "@/lib/donation-campaign";
import {
  buildDonationVoteLeaderboard,
  resolveWinningCharity,
  votesByCharityRecord,
  type DonationVoteLeaderboardEntry,
  type DonationVoteRow,
} from "@/lib/donation-votes";
import { sendDonationYearSummary } from "@/lib/resend/templates";
import { createAdminClient } from "@/lib/supabase/admin";

export { DONATION_KR_PER_DELIVERY } from "@/lib/donation-campaign";
export type { DonationVoteLeaderboardEntry };

export interface DonationCampaignCloseResult {
  closed: boolean;
  year?: number;
  totalKr?: number;
  emailSent?: boolean;
  winningCharityName?: string | null;
}

export interface DonationCharityRow {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

async function loadActiveCharities(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<DonationCharityRow[]> {
  const { data, error } = await supabase
    .from("donation_charities")
    .select("id, name, slug, sort_order")
    .eq("is_active", true)
    .order("sort_order");
  if (error) {
    console.error("[donation-fund] charities load failed:", error.message);
    return [];
  }
  return data ?? [];
}

async function loadDonationVoteRows(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<DonationVoteRow[]> {
  const [charities, companiesResult] = await Promise.all([
    loadActiveCharities(supabase),
    supabase
      .from("companies")
      .select("donation_charity_id, donation_charity_voted_at")
      .not("donation_charity_id", "is", null)
      .not("donation_charity_voted_at", "is", null),
  ]);

  if (companiesResult.error) {
    console.error("[donation-fund] votes load failed:", companiesResult.error.message);
    return [];
  }

  const nameById = new Map(charities.map((c) => [c.id, c.name]));
  const votes: DonationVoteRow[] = [];
  for (const row of companiesResult.data ?? []) {
    const charityId = row.donation_charity_id;
    const votedAt = row.donation_charity_voted_at;
    const charityName = charityId ? nameById.get(charityId) : undefined;
    if (!charityId || !votedAt || !charityName) continue;
    votes.push({
      charityId,
      charityName,
      votedAt,
    });
  }
  return votes;
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

export async function getDonationVoteLeaderboard(): Promise<
  DonationVoteLeaderboardEntry[]
> {
  const supabase = createAdminClient();
  const [charities, votes] = await Promise.all([
    loadActiveCharities(supabase),
    loadDonationVoteRows(supabase),
  ]);
  return buildDonationVoteLeaderboard(
    votes,
    charities.map((c) => ({ id: c.id, name: c.name })),
  );
}

export async function getPreviousYearDonationSnapshot(): Promise<{
  year: number;
  totalKr: number;
  winningCharityName: string | null;
} | null> {
  const year = stockholmYear() - 1;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("donation_campaign_snapshots")
    .select("total_kr, winning_charity_id")
    .eq("year", year)
    .maybeSingle();
  if (error) {
    console.error("[donation-fund] previous year snapshot failed:", error.message);
    return null;
  }
  if (!data) return null;

  let winningCharityName: string | null = null;
  if (data.winning_charity_id) {
    const { data: charity } = await supabase
      .from("donation_charities")
      .select("name")
      .eq("id", data.winning_charity_id)
      .maybeSingle();
    winningCharityName = charity?.name ?? null;
  }

  return {
    year,
    totalKr: data.total_kr,
    winningCharityName,
  };
}

function campaignYearToCloseIfDue(now: Date): number | null {
  const closingYear = stockholmYear(now) - 1;
  if (now.getTime() <= endOfCampaignYearMs(closingYear)) {
    return null;
  }
  return closingYear;
}

/**
 * Efter 31 december: spara årets summa, vinnare, mejla admin, töm kassan (en gång per år).
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

    const [totalKr, votes, charities] = await Promise.all([
      getDonationFundTotalKr(),
      loadDonationVoteRows(supabase),
      loadActiveCharities(supabase),
    ]);

    const winner = resolveWinningCharity(votes);
    const votesRecord = votesByCharityRecord(votes);
    const charityNameById = new Map(charities.map((c) => [c.id, c.name]));
    const winningCharityName = winner
      ? (charityNameById.get(winner.charityId) ?? null)
      : null;

    const leaderboard = buildDonationVoteLeaderboard(
      votes,
      charities.map((c) => ({ id: c.id, name: c.name })),
    );

    const { error: insertErr } = await supabase
      .from("donation_campaign_snapshots")
      .insert({
        year,
        total_kr: totalKr,
        winning_charity_id: winner?.charityId ?? null,
        votes_by_charity: votesRecord,
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
      await sendDonationYearSummary({
        year,
        totalKr,
        winningCharityName,
        voteCount: winner?.voteCount ?? 0,
        leaderboard: leaderboard.map((e) => ({
          name: e.name,
          voteCount: e.voteCount,
        })),
      });
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
      return {
        closed: true,
        year,
        totalKr,
        emailSent,
        winningCharityName,
      };
    }

    return {
      closed: true,
      year,
      totalKr,
      emailSent,
      winningCharityName,
    };
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

export async function setCompanyDonationVote(
  companyId: string,
  charityId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createAdminClient();

  const { data: charity, error: charityErr } = await supabase
    .from("donation_charities")
    .select("id")
    .eq("id", charityId)
    .eq("is_active", true)
    .maybeSingle();
  if (charityErr || !charity) {
    return { ok: false, error: "Organisationen finns inte eller är inaktiv." };
  }

  const { error } = await supabase
    .from("companies")
    .update({
      donation_charity_id: charityId,
      donation_charity_voted_at: new Date().toISOString(),
    })
    .eq("id", companyId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
