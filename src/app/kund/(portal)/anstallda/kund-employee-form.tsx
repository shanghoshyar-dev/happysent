"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { CelebrationFrequency, GiftType } from "@/lib/celebrations";
import type { Tables } from "@/types/database";

interface CompanyOption {
  id: string;
  name: string;
}

interface KundEmployeeFormProps {
  employee?: Tables<"employees"> | null;
  companies: CompanyOption[];
  companyId: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}

export function KundEmployeeForm({
  employee,
  companies,
  companyId,
  action,
  submitLabel,
}: KundEmployeeFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    if (pending) return;
    setPending(true);
    setError(null);
    formData.set("company_id", companyId);

    try {
      await action(formData);
      formRef.current?.reset();
      router.push("/kund/anstallda");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte spara. Försök igen.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="grid gap-4 md:grid-cols-2"
      noValidate
      onSubmit={(event) => {
        const form = event.currentTarget;
        if (!form.checkValidity()) {
          event.preventDefault();
          setError("Fyll i alla obligatoriska fält, inklusive födelsedag.");
        }
      }}
    >
      <input type="hidden" name="company_id" value={companyId} />

      <div>
        <Label htmlFor="first_name">Förnamn</Label>
        <Input
          id="first_name"
          name="first_name"
          required
          autoComplete="given-name"
          defaultValue={employee?.first_name}
        />
      </div>
      <div>
        <Label htmlFor="last_name">Efternamn</Label>
        <Input
          id="last_name"
          name="last_name"
          required
          autoComplete="family-name"
          defaultValue={employee?.last_name}
        />
      </div>
      <div>
        <Label htmlFor="birthday">Födelsedag</Label>
        <Input
          id="birthday"
          name="birthday"
          type="date"
          required
          defaultValue={employee?.birthday ?? undefined}
        />
        <p className="mt-1 text-xs text-slate-500">
          Välj datum i kalendern (ÅÅÅÅ-MM-DD).
        </p>
      </div>
      <div>
        <Label htmlFor="number_of_people">Antal personer på avd.</Label>
        <Input
          id="number_of_people"
          name="number_of_people"
          type="number"
          min={1}
          required
          defaultValue={employee?.number_of_people ?? 1}
        />
      </div>
      <div>
        <Label htmlFor="celebration_frequency">Firande</Label>
        <Select
          id="celebration_frequency"
          name="celebration_frequency"
          defaultValue={
            (employee?.celebration_frequency as CelebrationFrequency | undefined) ??
            "every_year"
          }
        >
          <option value="every_year">Varje år</option>
          <option value="twice_yearly">
            Två gånger per år (födelsedag + halvår)
          </option>
          <option value="decade">Jämna år (20, 30, 40 …)</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="gift_type">Gåva</Label>
        <Select
          id="gift_type"
          name="gift_type"
          defaultValue={(employee?.gift_type as GiftType | undefined) ?? "cake"}
        >
          <option value="cake">Tårta</option>
          <option value="flowers">Blommor</option>
        </Select>
        <p className="mt-1 text-xs text-slate-500">
          Blommor kräver att företaget har blomsterpartner aktiverad.
        </p>
      </div>
      <div className="flex items-center gap-2 md:col-span-2">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          defaultChecked={employee?.is_active ?? true}
          className="h-4 w-4 rounded border-candy-300 text-candy-500 focus:ring-candy-300"
        />
        <Label htmlFor="is_active" className="mb-0">
          Aktiv
        </Label>
      </div>

      {error ? (
        <p className="text-sm text-red-600 md:col-span-2" role="alert">
          {error}
        </p>
      ) : null}

      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Sparar…" : submitLabel}
        </Button>
      </div>

      {companies[0]?.name ? (
        <p className="text-xs text-slate-400 md:col-span-2">
          Registreras för {companies[0].name}.
        </p>
      ) : null}
    </form>
  );
}
