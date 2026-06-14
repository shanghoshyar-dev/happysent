"use client";

import { useMemo, useState } from "react";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { CakePriceRow } from "@/lib/pricing/cake-prices-data";

interface Props {
  cakePrices: CakePriceRow[];
  defaultCakeName?: string | null;
  defaultPeopleCount?: number | null;
}

export function CakePriceFields({
  cakePrices,
  defaultCakeName,
  defaultPeopleCount,
}: Props) {
  const cakeNames = useMemo(() => {
    const names = new Set(cakePrices.map((row) => row.cake_name));
    return Array.from(names).sort((a, b) => a.localeCompare(b, "sv"));
  }, [cakePrices]);

  const [cakeName, setCakeName] = useState(defaultCakeName ?? "");

  const sizeOptions = useMemo(
    () =>
      cakePrices
        .filter((row) => row.cake_name === cakeName)
        .sort((a, b) => a.people_count - b.people_count),
    [cakePrices, cakeName],
  );

  return (
    <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
      <div>
        <Label htmlFor="cake_name">Tårttyp (prissättning, valfritt)</Label>
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
      </div>
      <div>
        <Label htmlFor="people_count">Tårtstorlek (valfritt)</Label>
        <Select
          id="people_count"
          name="people_count"
          defaultValue={
            defaultPeopleCount != null ? String(defaultPeopleCount) : ""
          }
          disabled={!cakeName}
        >
          <option value="">
            {cakeName ? "Välj storlek" : "Välj tårttyp först"}
          </option>
          {sizeOptions.map((row) => (
            <option key={row.people_count} value={row.people_count}>
              {row.people_count} personer ({row.price} kr inkl. moms)
            </option>
          ))}
        </Select>
      </div>
      <p className="text-xs text-slate-500 md:col-span-2">
        Om ni inte väljer tårta skickar vi automatiskt vår standardtårta
        anpassad efter antalet anställda på företaget.
      </p>
    </div>
  );
}
