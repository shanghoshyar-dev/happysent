import { NextResponse } from "next/server";

import { runDailyCheck } from "@/lib/cron/daily-check";
import { runMonthlyInvoiceSummary } from "@/lib/cron/monthly-invoice";
import { isLastDayOfMonth, todayInStockholm } from "@/lib/holidays/swedish";
import { recordLog } from "@/lib/logs";
import { sendSystemErrorEmail } from "@/lib/resend/templates";
import { requireEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * The cron should fire mejlen at exactly 07:00 Europe/Stockholm year-round.
 * Vercel Cron only speaks UTC, so we schedule it twice (05:00 + 06:00 UTC,
 * covering CEST and CET respectively) and let the route gate execution by
 * checking the actual Stockholm hour.
 */
const TARGET_STOCKHOLM_HOUR = 7;

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

    return NextResponse.json({
      ok: true,
      today: today.toISOString().slice(0, 10),
      stockholmHour: hour,
      daily,
      monthly,
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
