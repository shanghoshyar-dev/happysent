"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

interface Props {
  invoiceId: string;
}

export function DownloadInvoiceButton({ invoiceId }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          window.location.href = `/api/invoices/${invoiceId}/pdf`;
        });
      }}
    >
      {pending ? "Laddar…" : "Ladda ner PDF"}
    </Button>
  );
}
