import { NextResponse } from "next/server";

import { runDailyCheck } from "@/lib/cron/daily-check";
import { todayInStockholm } from "@/lib/holidays/swedish";
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
    const result = await runDailyCheck(today);
    return NextResponse.json({
      ok: true,
      today: today.toISOString().slice(0, 10),
      stockholmHour: hour,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
