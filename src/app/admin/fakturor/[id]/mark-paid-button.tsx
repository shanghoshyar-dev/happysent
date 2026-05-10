"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { markInvoicePaid } from "../actions";

interface Props {
  id: string;
  alreadyPaid: boolean;
}

export function MarkPaidButton({ id, alreadyPaid }: Props) {
  const [pending, startTransition] = useTransition();
  if (alreadyPaid) return null;
  return (
    <Button
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          void markInvoicePaid(id);
        })
      }
    >
      {pending ? "Sparar…" : "Markera som betald"}
    </Button>
  );
}
