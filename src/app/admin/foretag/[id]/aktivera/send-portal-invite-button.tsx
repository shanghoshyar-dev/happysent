"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { sendCompanyPortalInvite } from "../../actions";

interface Props {
  companyId: string;
  contactEmail: string;
  employeeCount: number;
  inviteAlreadySent: boolean;
}

export function SendPortalInviteButton({
  companyId,
  contactEmail,
  employeeCount,
  inviteAlreadySent,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [sent, setSent] = useState(inviteAlreadySent);

  const canSend = employeeCount >= 1;

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-4">
      <p className="font-medium text-slate-900">Inbjudan till kundportalen</p>
      <p className="mt-1 text-sm text-slate-600">
        Skickas till{" "}
        <a href={`mailto:${contactEmail}`} className="text-coral-600 hover:underline">
          {contactEmail}
        </a>
        . HR klickar på länken i mejlet, väljer lösenord och loggar sedan in på{" "}
        <strong>/kund</strong>.
      </p>
      {sent ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Inbjudan skickad. Om länken inte fungerade kan du skicka om nedan.
        </p>
      ) : employeeCount < 1 ? (
        <p className="mt-3 text-sm text-amber-800">
          Lägg till minst en anställd innan inbjudan kan skickas.
        </p>
      ) : null}
      {message ? (
        <p
          className={`mt-3 text-sm ${isError ? "text-red-700" : "text-emerald-800"}`}
          role="alert"
        >
          {message}
        </p>
      ) : null}
      <Button
        type="button"
        className="mt-4"
        variant="secondary"
        disabled={!canSend || pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const res = await sendCompanyPortalInvite(companyId);
            if (res.ok) {
              setSent(true);
              setIsError(false);
              setMessage(
                sent
                  ? "Ny inbjudan skickad med aktiveringslänk."
                  : "Inbjudan skickad.",
              );
              router.refresh();
            } else {
              setIsError(true);
              setMessage(res.error);
            }
          });
        }}
      >
        {pending
          ? "Skickar…"
          : sent
            ? "Skicka om inbjudan"
            : "Skicka inbjudan till kundportalen"}
      </Button>
    </div>
  );
}
