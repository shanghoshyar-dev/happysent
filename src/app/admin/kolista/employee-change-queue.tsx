"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import type { PendingEmployeeChangeRequest } from "@/lib/admin/employee-change-requests";
import { formatDate } from "@/lib/utils";

import {
  approveEmployeeChangeRequest,
  rejectEmployeeChangeRequest,
} from "./actions";

interface Props {
  rows: PendingEmployeeChangeRequest[];
}

export function EmployeeChangeQueue({ rows }: Props) {
  return (
    <div className="rounded-xl border border-candy-200 bg-white shadow-sm ring-1 ring-candy-100/60">
      <div className="border-b border-candy-100 px-4 py-3 md:px-5">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          Kö: lägg till / ta bort anställd
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Förfrågningar från kontaktformuläret («Redan kund?»). Godkänn när
          uppgifterna stämmer — då uppdateras personallistan.
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <THead>
            <TR>
              <TH>Inkommen</TH>
              <TH>Åtgärd</TH>
              <TH>Företag</TH>
              <TH>Matchning</TH>
              <TH>Personer</TH>
              <TH>Avsändare</TH>
              <TH className="w-[1%] whitespace-nowrap">Åtgärder</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((r) => (
              <TR key={r.id}>
                <TD className="text-sm text-slate-700">
                  {formatDate(r.created_at.slice(0, 10))}
                </TD>
                <TD>
                  <span
                    className={
                      r.action_type === "add"
                        ? "inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800"
                        : "inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900"
                    }
                  >
                    {r.action_type === "add" ? "Lägg till" : "Ta bort"}
                  </span>
                </TD>
                <TD className="font-medium text-slate-900">{r.company_name}</TD>
                <TD className="text-sm text-slate-600">
                  {r.matched_company_name ? (
                    <span className="text-emerald-700">
                      {r.matched_company_name}
                    </span>
                  ) : (
                    <span className="text-amber-700">Ej matchad</span>
                  )}
                </TD>
                <TD className="max-w-[12rem] text-sm text-slate-600">
                  <ul className="list-inside list-disc">
                    {r.employees.map((e) => (
                      <li key={`${e.first_name}-${e.last_name}-${e.birthday}`}>
                        {e.first_name} {e.last_name}
                      </li>
                    ))}
                  </ul>
                </TD>
                <TD>
                  <a
                    href={`mailto:${r.submitted_by_email}`}
                    className="text-sm text-coral-600 hover:underline"
                  >
                    {r.submitted_by_email}
                  </a>
                </TD>
                <TD>
                  <div className="flex flex-wrap gap-2">
                    {r.matched_company_id ? (
                      <ApproveButton requestId={r.id} />
                    ) : (
                      <Link
                        href={`/admin/kolista/personal/${r.id}`}
                        className="inline-flex h-8 items-center justify-center rounded-full border border-candy-200 bg-white px-3 text-sm font-medium text-candy-700 transition-all hover:bg-candy-50"
                      >
                        Godkänn…
                      </Link>
                    )}
                    <RejectButton requestId={r.id} />
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}

function ApproveButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col gap-1">
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() => {
          if (
            !globalThis.confirm(
              "Godkänn och uppdatera personallistan för detta företag?",
            )
          ) {
            return;
          }
          setError(null);
          startTransition(async () => {
            const res = await approveEmployeeChangeRequest(requestId);
            if (!res.ok) setError(res.error ?? "Kunde inte godkänna.");
            else router.refresh();
          });
        }}
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Spinner />
            Sparar…
          </span>
        ) : (
          "Godkänn"
        )}
      </Button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </span>
  );
}

function RejectButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-slate-600"
        disabled={pending}
        onClick={() => {
          if (
            !globalThis.confirm(
              "Avvisa förfrågan? Den försvinner från kön utan ändring i systemet.",
            )
          ) {
            return;
          }
          setError(null);
          startTransition(async () => {
            const res = await rejectEmployeeChangeRequest(requestId);
            if (!res.ok) setError(res.error ?? "Kunde inte avvisa.");
            else router.refresh();
          });
        }}
      >
        {pending ? "Avvisar…" : "Avvisa"}
      </Button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </span>
  );
}
