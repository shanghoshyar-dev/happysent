"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { deleteBakery } from "./actions";

interface Props {
  id: string;
  name: string;
}

export function BakeryRowActions({ id, name }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            `Ta bort bageriet "${name}"?\n\nDet går bara om inget företag använder det.`,
          )
        )
          return;
        startTransition(async () => {
          try {
            await deleteBakery(id);
          } catch (err) {
            alert(
              err instanceof Error
                ? `Kunde inte ta bort: ${err.message}`
                : "Kunde inte ta bort bageriet.",
            );
          }
        });
      }}
    >
      Ta bort
    </Button>
  );
}
