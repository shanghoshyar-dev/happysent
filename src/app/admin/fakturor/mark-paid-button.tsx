"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { DONATION_KR_PER_DELIVERY } from "@/lib/donation-campaign";
import { formatSek } from "@/lib/utils";

import { markInvoicePaid } from "./actions";

interface Props {
  id: string;
  alreadyPaid: boolean;
  orderCount: number;
  donationKr?: number | null;
  compact?: boolean;
}

export function MarkPaidButton({
  id,
  alreadyPaid,
  orderCount,
  donationKr,
  compact = false,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (alreadyPaid) {
    if (compact) {
      return (
        <BadgePaid donationKr={donationKr} orderCount={orderCount} inline />
      );
    }
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <p className="font-semibold text-emerald-900">Betald</p>
        <p className="mt-1 text-sm text-emerald-800">
          {donationKr != null && donationKr > 0
            ? `${formatSek(donationKr)} (${DONATION_KR_PER_DELIVERY} kr × ${orderCount} leveranser) har lagts i donationskassan.`
            : "Fakturan är markerad som betald."}
        </p>
      </div>
    );
  }

  const expectedDonation = orderCount * DONATION_KR_PER_DELIVERY;

  function onMarkPaid() {
    const confirmText =
      orderCount > 0
        ? `Markera fakturan som betald?\n\n${formatSek(expectedDonation)} (${DONATION_KR_PER_DELIVERY} kr × ${orderCount} leveranser) läggs i donationskassan.`
        : "Markera fakturan som betald?";

    if (!window.confirm(confirmText)) return;

    setMessage(null);
    startTransition(async () => {
      try {
        const result = await markInvoicePaid(id);
        router.refresh();
        if (result.donationKr > 0) {
          setMessage(
            `Betald. ${formatSek(result.donationKr)} till donationskassan.`,
          );
        } else {
          setMessage("Betald.");
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Något gick fel");
      }
    });
  }

  return (
    <div className={compact ? "flex flex-col items-end gap-1" : "space-y-2"}>
      <Button
        disabled={pending}
        onClick={onMarkPaid}
        variant={compact ? "secondary" : "primary"}
        className={compact ? "text-xs" : undefined}
      >
        {pending ? "Sparar…" : compact ? "Markera betald" : "Markera som betald"}
      </Button>
      {message ? (
        <p
          className={`text-sm ${message.startsWith("Betald") ? "text-emerald-700" : "text-red-600"}`}
          role="status"
        >
          {message}
        </p>
      ) : !compact ? (
        <p className="text-sm text-slate-500">
          När kunden betalat: klicka här. Då blir status{" "}
          <strong>Betald</strong> och {DONATION_KR_PER_DELIVERY} kr ×{" "}
          {orderCount} leveranser går till donationskassan
          {expectedDonation > 0 ? ` (${formatSek(expectedDonation)})` : ""}.
        </p>
      ) : null}
    </div>
  );
}

function BadgePaid({
  donationKr,
  orderCount,
  inline,
}: {
  donationKr?: number | null;
  orderCount: number;
  inline?: boolean;
}) {
  const label =
    donationKr != null && donationKr > 0
      ? `Betald · ${formatSek(donationKr)} till kassan`
      : "Betald";

  if (inline) {
    return (
      <span className="text-xs font-medium text-emerald-700" title={label}>
        ✓ Betald
      </span>
    );
  }

  return null;
}
