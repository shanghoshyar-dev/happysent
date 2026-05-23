"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { sendInvoiceToCustomer } from "../actions";

interface Props {
  id: string;
  billingEmail: string | null;
  sentAt: string | null;
}

export function SendInvoiceButton({ id, billingEmail, sentAt }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (!billingEmail) {
    return (
      <p className="text-sm text-amber-700">
        Lägg till fakturamejl på företaget innan fakturan kan skickas.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await sendInvoiceToCustomer(id);
            if (result.ok) {
              setMessage(`Skickad till ${billingEmail}.`);
            } else {
              setMessage(result.error ?? "Något gick fel.");
            }
          });
        }}
      >
        {pending ? "Skickar…" : sentAt ? "Skicka PDF igen" : "Skicka PDF till kund"}
      </Button>
      {sentAt ? (
        <p className="text-sm text-slate-500">
          Senast skickad:{" "}
          {new Date(sentAt).toLocaleString("sv-SE", {
            timeZone: "Europe/Stockholm",
          })}
        </p>
      ) : null}
      {message ? (
        <p
          className={`text-sm ${message.startsWith("Skickad") ? "text-green-700" : "text-red-600"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
