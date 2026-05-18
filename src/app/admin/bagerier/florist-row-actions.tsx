"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { deleteFlorist } from "./florist-actions";

interface Props {
  id: string;
  name: string;
}

export function FloristRowActions({ id, name }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            `Ta bort blomsterbutiken "${name}"?\n\nDet går bara om inget aktivt blommor-upplägg på företag pekar hit.`,
          )
        )
          return;
        startTransition(async () => {
          try {
            await deleteFlorist(id);
          } catch (err) {
            alert(
              err instanceof Error
                ? `Kunde inte ta bort: ${err.message}`
                : "Kunde inte ta bort blomsterbutiken.",
            );
          }
        });
      }}
    >
      Ta bort
    </Button>
  );
}
