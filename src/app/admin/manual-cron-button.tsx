"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { triggerDailyCheckManually, type ManualCheckResult } from "./actions";

export function ManualCronButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ManualCheckResult | null>(null);

  const onClick = () => {
    setResult(null);
    startTransition(async () => {
      const r = await triggerDailyCheckManually();
      setResult(r);
    });
  };

  return (
    <div className="rounded-2xl border border-candy-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg text-slate-900">
            Kör daglig kontroll manuellt
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Triggar samma flöde som körs automatiskt kl 07:00 svensk tid.
            Användbart för test eller om en cron-körning behöver göras om.
          </p>
        </div>
        <Button onClick={onClick} disabled={pending}>
          {pending ? "Kör..." : "Kör nu"}
        </Button>
      </div>

      {result && result.ok && result.daily && (
        <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          <p className="font-medium">Klar.</p>
          <ul className="mt-2 space-y-1">
            <li>Anställda kontrollerade: {result.daily.scannedEmployees}</li>
            <li>Nya ordrar: {result.daily.ordersUpserted}</li>
            <li>Skickade påminnelser: {result.daily.remindersSent}</li>
            <li>Hoppade över (redan skickade): {result.daily.remindersSkipped}</li>
            {result.daily.errors.length > 0 && (
              <li className="text-amber-700">
                Per-anställd-fel: {result.daily.errors.length}
              </li>
            )}
            {result.monthly && (
              <li>
                Månadsrapport skickad för {result.monthly.monthLabel}{" "}
                ({result.monthly.rowsSummarised} företag,{" "}
                {result.monthly.totalAmount} kr).
              </li>
            )}
          </ul>
        </div>
      )}
      {result && !result.ok && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Fel: {result.error}
        </p>
      )}
    </div>
  );
}
