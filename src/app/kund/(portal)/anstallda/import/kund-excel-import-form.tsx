"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { importKundEmployeesExcel, type ExcelImportResult } from "../../../actions";

export function KundExcelImportForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ExcelImportResult | null>(null);

  async function action(formData: FormData) {
    setResult(null);
    startTransition(async () => {
      const r = await importKundEmployeesExcel(formData);
      setResult(r);
      if (r.ok) router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-slate-900">
          Importera Excel
        </h1>
        <Link href="/kund/anstallda">
          <Button variant="secondary">Tillbaka</Button>
        </Link>
      </div>
      <Card className="max-w-2xl p-6">
        <p className="text-sm text-slate-600">
          Kolumner: <strong>Förnamn, Efternamn, Födelsedag, Antal personer</strong>
          . Valfritt: Firande, Gåva.
        </p>
        <form action={action} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="import_file">Excel-fil (.xlsx)</Label>
            <input
              id="import_file"
              name="file"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              required
              className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-candy-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-candy-700"
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Importerar…" : "Importera"}
          </Button>
        </form>
        {result?.globalError ? (
          <p className="mt-4 text-sm text-red-600">{result.globalError}</p>
        ) : null}
        {result?.ok ? (
          <p className="mt-4 text-sm text-emerald-800">
            {result.imported} anställda importerade
            {result.failed > 0 ? `, ${result.failed} rader med fel.` : "."}
          </p>
        ) : null}
      </Card>
    </div>
  );
}
