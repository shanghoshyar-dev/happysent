"use client";

import { useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { deleteProduct, toggleProduct } from "./actions";

interface Props {
  id: string;
  name: string;
  isActive: boolean;
  subtitle?: string;
}

export function ProductRow({ id, name, isActive, subtitle }: Props) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-center justify-between rounded-xl border border-candy-100 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <div>
          <span className="font-medium text-slate-900">{name}</span>
          {subtitle ? (
            <p className="text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        <Badge tone={isActive ? "success" : "neutral"}>
          {isActive ? "Aktiv" : "Inaktiv"}
        </Badge>
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(() => {
              void toggleProduct(id, !isActive);
            })
          }
        >
          {isActive ? "Inaktivera" : "Aktivera"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => {
            if (!confirm("Ta bort produkten?")) return;
            startTransition(() => {
              void deleteProduct(id);
            });
          }}
        >
          Ta bort
        </Button>
      </div>
    </div>
  );
}
