"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

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
    <div className="rounded-2xl border-2 border-coral-400 bg-gradient-to-br from-coral-50 via-white to-cream p-6 shadow-md ring-2 ring-coral-100">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-forest-800">
            Manuell test: kör daglig kontroll
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Triggar samma flöde som körs automatiskt kl 07:00 svensk tid
            (födelsedagspåminnelser, månadsslut vid behov, och samlade mejl om
            nya anställda för gårdagen). Användbart för test.
          </p>
        </div>
        <Button
          onClick={onClick}
          disabled={pending}
          className="min-w-[8rem] shrink-0 shadow-md"
        >
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <Spinner />
              Kör…
            </span>
          ) : (
            "Kör nu"
          )}
        </Button>
      </div>

      {result && result.ok && result.daily && (
        <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          <p className="font-medium">Klar.</p>
          <ul className="mt-2 space-y-1">
            <li>Anställda kontrollerade: {result.daily.scannedEmployees}</li>
            <li>
              Leveranstillfällen i år: {result.daily.deliverySlotsChecked}
            </li>
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
            {result.employeeDigest && (
              <li>
                Mejl om nya anställda (per företag/dag):{" "}
                {result.employeeDigest.digestsSent} skickade
                {result.employeeDigest.errors.length > 0 && (
                  <span className="text-amber-700">
                    {" "}
                    ({result.employeeDigest.errors.length} fel)
                  </span>
                )}
              </li>
            )}
            {result.employeeDigest?.errors.map((err) => (
              <li key={err} className="text-amber-800">
                Personal-digest: {err}
              </li>
            ))}
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
