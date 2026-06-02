"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { sendCompanyWelcomeEmail } from "../../actions";

interface Props {
  companyId: string;
  contactEmail: string;
  employeeCount: number;
  welcomeAlreadySent: boolean;
}

export function SendWelcomeButton({
  companyId,
  contactEmail,
  employeeCount,
  welcomeAlreadySent,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [sent, setSent] = useState(welcomeAlreadySent);

  const canSend = employeeCount >= 1 && !sent;

  return (
    <div className="rounded-xl border border-candy-200 bg-white px-4 py-4 shadow-sm">
      <p className="font-medium text-slate-900">Välkomstmejl till kund</p>
      <p className="mt-1 text-sm text-slate-600">
        Skickas till{" "}
        <a href={`mailto:${contactEmail}`} className="text-coral-600 hover:underline">
          {contactEmail}
        </a>
        . Mejlet säger att anställda är registrerade — skicka först när listan stämmer.
      </p>
      {sent ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Välkomstmejl skickat.
        </p>
      ) : employeeCount < 1 ? (
        <p className="mt-3 text-sm text-amber-800">
          Lägg till minst en anställd (eller importera Excel) innan mejlet kan skickas.
        </p>
      ) : null}
      {message && !sent ? (
        <p
          className={`mt-3 text-sm ${isError ? "text-red-700" : "text-emerald-800"}`}
          role="alert"
        >
          {message}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={!canSend || pending}
          onClick={() => {
            setMessage(null);
            startTransition(async () => {
              const res = await sendCompanyWelcomeEmail(companyId);
              if (res.ok) {
                setSent(true);
                setIsError(false);
                setMessage("Välkomstmejl skickat.");
                router.refresh();
              } else {
                setIsError(true);
                setMessage(res.error);
              }
            });
          }}
        >
          {pending ? "Skickar…" : "Skicka välkomstmejl"}
        </Button>
      </div>
    </div>
  );
}
