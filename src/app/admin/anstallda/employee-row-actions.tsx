"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { deleteEmployee, toggleEmployeeActive } from "./actions";

interface Props {
  id: string;
  isActive: boolean;
}

export function EmployeeRowActions({ id, isActive }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-2">
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() =>
          startTransition(() => {
            void toggleEmployeeActive(id, !isActive);
          })
        }
      >
        {isActive ? "Pausa" : "Aktivera"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => {
          if (!confirm("Ta bort anställd?")) return;
          startTransition(() => {
            void deleteEmployee(id);
          });
        }}
      >
        Ta bort
      </Button>
    </div>
  );
}
