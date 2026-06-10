"use client";

import Image from "next/image";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { getCakeImageUrl } from "@/lib/cake-selection/catalog-images";
import { cn } from "@/lib/utils";

import { selectCakeForOrder } from "./actions";

interface ProductOption {
  id: string;
  name: string;
  dietaryNotes: string | null;
}

interface Props {
  token: string;
  products: ProductOption[];
  alreadyChosen: string | null;
}

export function CakeSelectionForm({
  token,
  products,
  alreadyChosen,
}: Props) {
  const [selected, setSelected] = useState<string>(
    products[0]?.id ?? "",
  );
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(
    alreadyChosen ? `Ni har valt: ${alreadyChosen}` : null,
  );
  const [done, setDone] = useState(Boolean(alreadyChosen));

  if (done) {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
        {message ?? "Tack! Ert val är sparat."}
      </p>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(null);
        startTransition(async () => {
          const result = await selectCakeForOrder(token, selected);
          if (result.ok) {
            setDone(true);
            setMessage(`Tack! Ni har valt: ${result.productName}`);
          } else {
            setMessage(result.error);
          }
        });
      }}
    >
      <fieldset>
        <legend className="sr-only">Välj tårta</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {products.map((p) => {
            const imageUrl = getCakeImageUrl(p.name);
            const isSelected = selected === p.id;
            return (
              <label
                key={p.id}
                className={cn(
                  "cursor-pointer overflow-hidden rounded-xl border bg-white transition-colors",
                  isSelected
                    ? "border-candy-400 ring-1 ring-candy-300"
                    : "border-candy-100 hover:border-candy-200",
                )}
              >
                <input
                  type="radio"
                  name="product"
                  value={p.id}
                  checked={isSelected}
                  onChange={() => setSelected(p.id)}
                  className="sr-only"
                />
                <div className="relative aspect-[4/3] bg-cream-100">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 240px"
                    />
                  ) : null}
                </div>
                <div className="p-3">
                  <span className="font-medium text-slate-900">{p.name}</span>
                  {p.dietaryNotes ? (
                    <span className="mt-1 block text-sm text-slate-500">
                      {p.dietaryNotes}
                    </span>
                  ) : null}
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>
      <Button type="submit" disabled={pending || !selected} className="w-full">
        {pending ? "Sparar…" : "Bekräfta val"}
      </Button>
      {message && !done ? (
        <p className="text-sm text-red-600" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
