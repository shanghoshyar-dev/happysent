import { NextResponse } from "next/server";

import { runDailyCheck } from "@/lib/cron/daily-check";
import { runDonationCampaignClose } from "@/lib/cron/donation-campaign-close";
import { runDeliveryCoordinationDigest } from "@/lib/cron/run-delivery-coordination-digest";
import { flushPendingEmployeeAddDigests } from "@/lib/cron/employee-add-digest";
import { runMonthlyInvoiceSummary } from "@/lib/cron/monthly-invoice";
import { isLastDayOfMonth, todayInStockholm } from "@/lib/holidays/swedish";
import { recordLog } from "@/lib/logs";
import { sendSystemErrorEmail } from "@/lib/resend/templates";
import { requireEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron ska köra mellan 06:00–06:59 Europe/Stockholm året runt.
 * Vercel Cron använder UTC, så vi schemalägger två gånger (04:00 + 05:00 UTC,
 * täcker CEST respektive CET) och låter routen köra bara när Stockholms timme är 6.
 */
const TARGET_STOCKHOLM_HOUR = 6;

function stockholmHour(now: Date = new Date()): number {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    hour12: false,
  });
  return Number(formatter.format(now));
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${requireEnv("CRON_SECRET")}`;
  const isManual = request.headers.get("x-cron-manual") === "1";

  if (auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Skip if Vercel triggered us at the "wrong" UTC hour for this season.
  // Manual invocations (with x-cron-manual: 1 header) bypass the gate.
  const hour = stockholmHour();
  if (!isManual && hour !== TARGET_STOCKHOLM_HOUR) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: `Stockholm hour is ${hour}, waiting for ${TARGET_STOCKHOLM_HOUR}`,
    });
  }

  const today = todayInStockholm();
  try {
    const daily = await runDailyCheck(today);

    let employeeDigest: Awaited<ReturnType<typeof flushPendingEmployeeAddDigests>>;
    try {
      employeeDigest = await flushPendingEmployeeAddDigests(today);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await notifyError(message, "employee-add-digest");
      employeeDigest = {
        digestsSent: 0,
        digestsSkippedEmpty: 0,
        errors: [message],
      };
    }

    // On the last day of each month, also fire the invoicing digest.
    let monthly: Awaited<ReturnType<typeof runMonthlyInvoiceSummary>> | null = null;
    if (isLastDayOfMonth(today)) {
      try {
        monthly = await runMonthlyInvoiceSummary(today);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await notifyError(message, "monthly-invoice");
      }
    }

    let donationClose: Awaited<ReturnType<typeof runDonationCampaignClose>> | null =
      null;
    try {
      donationClose = await runDonationCampaignClose(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await notifyError(message, "donation-campaign-close");
    }

    let deliveryCoordination: Awaited<
      ReturnType<typeof runDeliveryCoordinationDigest>
    > | null = null;
    try {
      deliveryCoordination = await runDeliveryCoordinationDigest(today);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await notifyError(message, "delivery-coordination-digest");
    }

    return NextResponse.json({
      ok: true,
      today: today.toISOString().slice(0, 10),
      stockholmHour: hour,
      daily,
      employeeDigest,
      monthly,
      donationClose,
      deliveryCoordination,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await notifyError(message, "daily-check");
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

async function notifyError(message: string, context: string): Promise<void> {
  await recordLog("error", context, message);
  try {
    await sendSystemErrorEmail({
      errorMessage: message,
      context,
      timestamp: new Date().toISOString(),
    });
  } catch (mailErr) {
    console.error("[cron] failed to send system error email:", mailErr);
  }
}
