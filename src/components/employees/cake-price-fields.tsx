"use client";

import { useMemo, useState } from "react";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { CakePriceRow } from "@/lib/pricing/cake-prices-data";

interface Props {
  cakePrices: CakePriceRow[];
  defaultCakeName?: string | null;
}

export function CakePriceFields({
  cakePrices,
  defaultCakeName,
}: Props) {
  const cakeNames = useMemo(() => {
    const names = new Set(cakePrices.map((row) => row.cake_name));
    return Array.from(names).sort((a, b) => a.localeCompare(b, "sv"));
  }, [cakePrices]);

  const [cakeName, setCakeName] = useState(defaultCakeName ?? "");

  return (
    <div className="md:col-span-2">
      <Label htmlFor="cake_name">Tårttyp (valfritt)</Label>
      <Select
        id="cake_name"
        name="cake_name"
        value={cakeName}
        onChange={(event) => setCakeName(event.target.value)}
      >
        <option value="">Ingen vald — standardtårta</option>
        {cakeNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
      <p className="mt-2 text-xs text-slate-500">
        Om ni inte väljer tårta skickar vi automatiskt vår standardtårta.
        Antal och storlekar anpassas efter antalet anställda på företaget
        (t.ex. 21 pers → en 20-pers och en 8-pers).
      </p>
    </div>
  );
}
