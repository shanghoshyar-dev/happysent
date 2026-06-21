"use server";

import { isAdminUser } from "@/lib/auth/session";
import { runDailyCheck } from "@/lib/cron/daily-check";
import { runDonationCampaignClose } from "@/lib/cron/donation-campaign-close";
import { flushPendingEmployeeAddDigests } from "@/lib/cron/employee-add-digest";
import { runDeliveryCoordinationDigest } from "@/lib/cron/run-delivery-coordination-digest";
import { runMonthlyInvoiceSummary } from "@/lib/cron/monthly-invoice";
import { isLastDayOfMonth, todayInStockholm } from "@/lib/holidays/swedish";
import { recordLog } from "@/lib/logs";
import { sendSystemErrorEmail } from "@/lib/resend/templates";
import { createClient } from "@/lib/supabase/server";

export interface ManualCheckResult {
  ok: boolean;
  daily?: Awaited<ReturnType<typeof runDailyCheck>>;
  employeeDigest?: Awaited<ReturnType<typeof flushPendingEmployeeAddDigests>>;
  monthly?: Awaited<ReturnType<typeof runMonthlyInvoiceSummary>> | null;
  donationClose?: Awaited<ReturnType<typeof runDonationCampaignClose>> | null;
  deliveryCoordination?: Awaited<
    ReturnType<typeof runDeliveryCoordinationDigest>
  > | null;
  error?: string;
}

/**
 * Manually trigger the same pipeline that the Vercel cron runs each morning.
 * Auth-gated through the admin session (caller must be logged in).
 */
export async function triggerDailyCheckManually(): Promise<ManualCheckResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Du måste vara inloggad." };
  }
  if (!(await isAdminUser(user.id))) {
    return { ok: false, error: "Du har inte admin-åtkomst." };
  }

  const today = todayInStockholm();
  try {
    const daily = await runDailyCheck(today);

    let employeeDigest: Awaited<ReturnType<typeof flushPendingEmployeeAddDigests>>;
    try {
      employeeDigest = await flushPendingEmployeeAddDigests(today);
    } catch (err) {
      console.error("[manual] employee digest failed:", err);
      employeeDigest = {
        digestsSent: 0,
        digestsSkippedEmpty: 0,
        errors: [err instanceof Error ? err.message : String(err)],
      };
    }

    let monthly: Awaited<ReturnType<typeof runMonthlyInvoiceSummary>> | null = null;
    if (isLastDayOfMonth(today)) {
      try {
        monthly = await runMonthlyInvoiceSummary(today);
      } catch (err) {
        console.error("[manual] monthly summary failed:", err);
      }
    }

    let donationClose: Awaited<ReturnType<typeof runDonationCampaignClose>> | null =
      null;
    try {
      donationClose = await runDonationCampaignClose(new Date());
    } catch (err) {
      console.error("[manual] donation campaign close failed:", err);
    }

    let deliveryCoordination: Awaited<
      ReturnType<typeof runDeliveryCoordinationDigest>
    > | null = null;
    try {
      deliveryCoordination = await runDeliveryCoordinationDigest(today);
    } catch (err) {
      console.error("[manual] delivery coordination digest failed:", err);
    }

    return {
      ok: true,
      daily,
      employeeDigest,
      monthly,
      donationClose,
      deliveryCoordination,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await recordLog("error", "manual-trigger", message);
    try {
      await sendSystemErrorEmail({
        errorMessage: message,
        context: "manual-trigger",
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Swallow email errors so we always surface the real cron error to the UI.
    }
    return { ok: false, error: message };
  }
}
