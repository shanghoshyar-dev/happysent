"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import { importEmployeesExcel, type ExcelImportResult } from "./actions";

interface Company {
  id: string;
  name: string;
}

interface Props {
  companies: Company[];
  defaultCompanyId?: string;
  lockCompanyId?: string;
}

export function ExcelImportForm({
  companies,
  defaultCompanyId,
  lockCompanyId,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ExcelImportResult | null>(null);
  const companyId = lockCompanyId ?? defaultCompanyId ?? "";

  async function action(formData: FormData) {
    setResult(null);
    if (lockCompanyId) {
      formData.set("company_id", lockCompanyId);
    }
    startTransition(async () => {
      const r = await importEmployeesExcel(formData);
      setResult(r);
      if (r.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-slate-900">
          Importera från Excel
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Ladda upp en{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">.xlsx</code>-fil
          med kolumnerna{" "}
          <strong>
            Förnamn, Efternamn, Födelsedag, Antal personer
          </strong>{" "}
          (valfritt: <strong>Firande</strong>, <strong>Gåva</strong>). Firande:
          varje år, halvår eller 10-år. Gåva: tårta eller blommor. Födelsedag i
          formatet <code>YYYY-MM-DD</code>.
        </p>
      </div>

      <form action={action} className="grid gap-4 sm:grid-cols-[1fr,1fr,auto]">
        {lockCompanyId ? (
          <input type="hidden" name="company_id" value={lockCompanyId} />
        ) : (
          <div>
            <Label htmlFor="import_company_id">Företag</Label>
            <Select
              id="import_company_id"
              name="company_id"
              defaultValue={companyId}
              required
            >
              <option value="" disabled>
                Välj företag...
              </option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        )}
        <div>
          <Label htmlFor="import_file">Excel-fil</Label>
          <input
            id="import_file"
            name="file"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            required
            className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-candy-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-candy-700 hover:file:bg-candy-200"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Importerar..." : "Importera"}
          </Button>
        </div>
      </form>

      {result && result.globalError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.globalError}
        </p>
      )}
      {result && result.ok && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          <p>
            <strong>{result.imported}</strong> anställda importerade
            {result.failed > 0 ? (
              <>
                , <strong>{result.failed}</strong> rader hade fel.
              </>
            ) : (
              "."
            )}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-800">
              {result.errors.map((e) => (
                <li key={e.row}>
                  Rad {e.row}: {e.reason}
                </li>
              ))}
            </ul>
          )}
          {(result.catchUpTriggered ?? 0) > 0 ? (
            <p className="mt-2 text-amber-900">
              {result.catchUpTriggered} anställda med nära födelsedag — beställning
              startad och bekräftelse skickad.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
