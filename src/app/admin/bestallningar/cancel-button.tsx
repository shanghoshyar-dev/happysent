"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { cancelOrder } from "./actions";

interface Props {
  orderId: string;
  /** Set to false to disable for orders already past the cutoff. */
  canCancel: boolean;
}

export function CancelOrderButton({ orderId, canCancel }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!canCancel) {
    return (
      <span className="text-xs text-slate-400">Ej avbokbar</span>
    );
  }

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await cancelOrder(orderId);
      if (!result.ok) setError(result.error ?? "Något gick fel.");
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="ghost"
        onClick={onClick}
        disabled={pending}
        className="text-red-600 hover:bg-red-50"
      >
        {pending ? "..." : "Avboka"}
      </Button>
      {error && (
        <span className="max-w-xs text-right text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
