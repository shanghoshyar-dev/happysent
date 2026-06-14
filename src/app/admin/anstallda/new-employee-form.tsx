"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { CakePriceFields } from "@/components/employees/cake-price-fields";
import { Button } from "@/components/ui/button";
import { IsoDateInput } from "@/components/ui/iso-date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { CakePriceRow } from "@/lib/pricing/cake-prices-data";

import { createEmployee } from "./actions";

interface CompanyOption {
  id: string;
  name: string;
}

interface NewEmployeeFormProps {
  companies: CompanyOption[];
  cakePrices: CakePriceRow[];
  defaultCompanyId?: string;
  /** Dölj företagsväljare — används vid aktivering efter godkänd ansökan. */
  lockCompanyId?: string;
}

export function NewEmployeeForm({
  companies,
  cakePrices,
  defaultCompanyId,
  lockCompanyId,
}: NewEmployeeFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = lockCompanyId ?? defaultCompanyId ?? companies[0]?.id;

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      if (lockCompanyId) {
        formData.set("company_id", lockCompanyId);
      }
      await createEmployee(formData);
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setPending(false);
    }
  }

  if (companies.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Lägg till ett företag först innan du registrerar anställda.
      </p>
    );
  }

  return (
    <form ref={formRef} action={action} className="grid gap-4 md:grid-cols-2">
      {lockCompanyId ? (
        <input type="hidden" name="company_id" value={lockCompanyId} />
      ) : (
        <div className="md:col-span-2">
          <Label htmlFor="company_id">Företag</Label>
          <Select
            id="company_id"
            name="company_id"
            required
            defaultValue={companyId}
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      )}
      <div>
        <Label htmlFor="first_name">Förnamn</Label>
        <Input id="first_name" name="first_name" required />
      </div>
      <div>
        <Label htmlFor="last_name">Efternamn</Label>
        <Input id="last_name" name="last_name" required />
      </div>
      <div>
        <Label htmlFor="birthday">Födelsedag</Label>
        <IsoDateInput id="birthday" name="birthday" required />
        <p className="mt-1 text-xs text-slate-500">Skriv datum som ÅÅÅÅ-MM-DD.</p>
      </div>
      <div>
        <Label htmlFor="number_of_people">Antal personer på avd.</Label>
        <Input
          id="number_of_people"
          name="number_of_people"
          type="number"
          min={1}
          defaultValue={1}
          required
        />
      </div>
      <CakePriceFields cakePrices={cakePrices} />
      <div className="flex items-center gap-2 md:col-span-2">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          defaultChecked
          className="h-4 w-4 rounded border-candy-300 text-candy-500 focus:ring-candy-300"
        />
        <Label htmlFor="is_active" className="mb-0">
          Aktiv
        </Label>
      </div>
      {error ? (
        <p className="text-sm text-red-600 md:col-span-2">{error}</p>
      ) : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Sparar…" : "Lägg till anställd"}
        </Button>
      </div>
    </form>
  );
}
