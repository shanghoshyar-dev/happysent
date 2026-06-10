"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { citiesMatch } from "@/lib/cities/normalize";
import type { Tables } from "@/types/database";

export interface CompanyFormProps {
  bakeries: Pick<Tables<"bakeries">, "id" | "name" | "city">[];
  florists: Pick<Tables<"florists">, "id" | "name" | "city">[];
  bakeryProducts?: Pick<Tables<"products">, "id" | "name" | "bakery_id">[];
  company?: Tables<"companies"> | null;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  defaultPricePerCake?: number;
  applicationPrefill?: {
    applicationId: string;
    companyName: string;
    contactEmail: string;
    contactPhone?: string | null;
    contactName: string;
    message: string | null;
    hasEmployeesExcel?: boolean;
  };
}

export function CompanyForm({
  bakeries,
  florists,
  bakeryProducts = [],
  company,
  action,
  submitLabel,
  defaultPricePerCake,
  applicationPrefill,
}: CompanyFormProps) {
  const pre = applicationPrefill;
  const [city, setCity] = useState(company?.city ?? "");
  const [bakeryId, setBakeryId] = useState(company?.bakery_id ?? "");
  const [floristId, setFloristId] = useState(company?.florist_id ?? "");

  const bakeriesInCity = useMemo(
    () =>
      city.trim()
        ? bakeries.filter((b) => citiesMatch(b.city, city))
        : [],
    [bakeries, city],
  );

  const floristsInCity = useMemo(
    () =>
      city.trim()
        ? florists.filter((f) => citiesMatch(f.city, city))
        : [],
    [florists, city],
  );

  const productsForBakery = useMemo(
    () =>
      bakeryId
        ? bakeryProducts.filter((p) => p.bakery_id === bakeryId)
        : [],
    [bakeryProducts, bakeryId],
  );

  function handleCityChange(nextCity: string) {
    setCity(nextCity);
    if (bakeryId) {
      const bakery = bakeries.find((b) => b.id === bakeryId);
      if (!bakery || !citiesMatch(bakery.city, nextCity)) {
        setBakeryId("");
      }
    }
    if (floristId) {
      const florist = florists.find((f) => f.id === floristId);
      if (!florist || !citiesMatch(florist.city, nextCity)) {
        setFloristId("");
      }
    }
  }

  return (
    <form action={action} className="grid gap-5 md:grid-cols-2">
      {pre ? (
        <input type="hidden" name="application_id" value={pre.applicationId} />
      ) : null}
      <div className="md:col-span-2">
        <Label htmlFor="name">Företagsnamn</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={company?.name ?? pre?.companyName}
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="address">Adress</Label>
        <Input
          id="address"
          name="address"
          required
          defaultValue={company?.address}
        />
      </div>
      <div>
        <Label htmlFor="city">Stad</Label>
        <Input
          id="city"
          name="city"
          required
          value={city}
          onChange={(e) => handleCityChange(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-500">
          Bageri och blomsterbutik filtreras på stad.
        </p>
      </div>
      <div>
        <Label htmlFor="bakery_id">Bageri</Label>
        <Select
          id="bakery_id"
          name="bakery_id"
          required
          value={bakeryId}
          onChange={(e) => setBakeryId(e.target.value)}
          disabled={!city.trim()}
        >
          <option value="" disabled>
            {city.trim()
              ? bakeriesInCity.length
                ? "Välj bageri"
                : "Inga bagerier i denna stad"
              : "Ange stad först"}
          </option>
          {bakeriesInCity.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="md:col-span-2 rounded-xl border border-candy-100 bg-cream-50/80 p-4 ring-1 ring-candy-100/60">
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            name="offers_flowers"
            defaultChecked={company?.offers_flowers ?? false}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-candy-600 focus:ring-candy-500"
          />
          <span>
            <span className="font-medium text-slate-900">Levererar blommor</span>
            <span className="mt-1 block text-slate-600">
              Obligatoriskt att välja blomsterbutik nedan. Partner finns under{" "}
              <span className="font-medium text-slate-800">Bagerier / florist</span>.
            </span>
          </span>
        </label>
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="florist_id">Blomsterbutik</Label>
        <Select
          id="florist_id"
          name="florist_id"
          value={floristId}
          onChange={(e) => setFloristId(e.target.value)}
          disabled={!city.trim()}
        >
          <option value="">— Ingen / inte aktiverat ovan —</option>
          {floristsInCity.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </Select>
        {city.trim() && floristsInCity.length === 0 ? (
          <p className="mt-1 text-xs text-amber-700">
            Inga blomsterbutiker registrerade i {city.trim()}.
          </p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="contact_email">Kontakt-mail</Label>
        <Input
          id="contact_email"
          name="contact_email"
          type="email"
          required
          defaultValue={company?.contact_email ?? pre?.contactEmail}
        />
      </div>
      <div>
        <Label htmlFor="contact_phone">Kontaktperson telefon</Label>
        <Input
          id="contact_phone"
          name="contact_phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="t.ex. 070-123 45 67"
          defaultValue={company?.contact_phone ?? pre?.contactPhone ?? ""}
        />
        <p className="mt-1 text-xs text-slate-500">
          Ringnummer till kontakt på mottagande företag — ingår i beställningsmejlet till
          bageriet en vecka före leverans.
        </p>
      </div>
      <div>
        <Label htmlFor="billing_email">Faktura-mail</Label>
        <Input
          id="billing_email"
          name="billing_email"
          type="email"
          required
          defaultValue={company?.billing_email ?? pre?.contactEmail}
        />
      </div>
      {productsForBakery.length > 0 ? (
        <div className="md:col-span-2">
          <Label htmlFor="default_product_id">Standardtårta (valfritt)</Label>
          <Select
            id="default_product_id"
            name="default_product_id"
            defaultValue={company?.default_product_id ?? ""}
          >
            <option value="">Ingen standard — HappySent väljer vid behov</option>
            {productsForBakery.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-slate-500">
            Tårtor från valt bageri. Används om kunden inte hinner välja inom 5 dagar
            efter 14-dagarsmejlet.
          </p>
        </div>
      ) : bakeryId ? (
        <div className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Valda bageriet har inga tårtor än. Lägg till produkter under Admin →
          Produkter.
        </div>
      ) : null}
      <div>
        <Label htmlFor="price_per_cake">Pris per tårta (SEK)</Label>
        <Input
          id="price_per_cake"
          name="price_per_cake"
          type="number"
          min={0}
          required
          defaultValue={company?.price_per_cake ?? defaultPricePerCake ?? 450}
        />
      </div>
      <div>
        <Label htmlFor="price_per_flowers">Pris per blombukett (SEK)</Label>
        <Input
          id="price_per_flowers"
          name="price_per_flowers"
          type="number"
          min={0}
          placeholder="Samma som tårta om tomt"
          defaultValue={company?.price_per_flowers ?? ""}
        />
        <p className="mt-1 text-xs text-slate-500">
          Används när en anställd har gåva &quot;Blommor&quot;. Lämna tomt för att
          använda tårtpriset.
        </p>
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue={company?.status ?? "active"}>
          <option value="active">Aktivt</option>
          <option value="paused">Pausat</option>
        </Select>
      </div>
      <div className="md:col-span-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
