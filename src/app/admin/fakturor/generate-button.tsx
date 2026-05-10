"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { generateInvoicesForMonth } from "./actions";

export function GenerateInvoicesForm() {
  const now = new Date();
  const defaultMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(defaultMonth);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function onClick() {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await generateInvoicesForMonth(month);
        setMessage(
          result.invoices === 0
            ? "Inga beställningar att fakturera den här månaden."
            : `Skapade/uppdaterade ${result.invoices} faktura(r).`,
        );
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Något gick fel");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div>
        <Label htmlFor="month">Månad</Label>
        <Input
          id="month"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-44"
        />
      </div>
      <Button onClick={onClick} disabled={pending}>
        {pending ? "Genererar…" : "Generera fakturor"}
      </Button>
      {message ? (
        <p className="text-sm text-slate-600">{message}</p>
      ) : null}
    </div>
  );
}
