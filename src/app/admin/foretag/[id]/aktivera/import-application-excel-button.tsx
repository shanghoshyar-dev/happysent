"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { importApplicationEmployeesExcel } from "../../actions";

interface Props {
  companyId: string;
}

export function ImportApplicationExcelButton({ companyId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  return (
    <div className="rounded-xl border border-coral-200 bg-coral-50 px-4 py-4">
      <p className="font-medium text-slate-900">Bifogad personalista (Excel)</p>
      <p className="mt-1 text-sm text-slate-600">
        Kunden laddade upp en Excel-fil i ansökan. Importera den innan du skickar
        välkomstmejl.
      </p>
      {message ? (
        <p
          className={`mt-3 text-sm ${isError ? "text-red-700" : "text-emerald-800"}`}
          role="alert"
        >
          {message}
        </p>
      ) : null}
      <Button
        type="button"
        className="mt-4"
        disabled={pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const res = await importApplicationEmployeesExcel(companyId);
            if (res.ok) {
              setIsError(false);
              setMessage(`${res.imported} anställda importerades.`);
              router.refresh();
            } else {
              setIsError(true);
              setMessage(res.error);
            }
          });
        }}
      >
        {pending ? "Importerar…" : "Importera bifogad Excel"}
      </Button>
    </div>
  );
}
