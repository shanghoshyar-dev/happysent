"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
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
      <fieldset className="space-y-2">
        <legend className="sr-only">Välj tårta</legend>
        {products.map((p) => (
          <label
            key={p.id}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-candy-100 bg-white p-4 has-[:checked]:border-candy-400 has-[:checked]:ring-1 has-[:checked]:ring-candy-300"
          >
            <input
              type="radio"
              name="product"
              value={p.id}
              checked={selected === p.id}
              onChange={() => setSelected(p.id)}
              className="mt-1"
            />
            <span>
              <span className="font-medium text-slate-900">{p.name}</span>
              {p.dietaryNotes ? (
                <span className="ml-2 text-sm text-slate-500">
                  ({p.dietaryNotes})
                </span>
              ) : null}
            </span>
          </label>
        ))}
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
