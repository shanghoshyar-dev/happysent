"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { formatOrganizationNumber } from "@/lib/organization-number";
import { formatDate } from "@/lib/utils";

import type { PendingApplicationQueueRow } from "@/lib/admin/pending-company-applications";

import { rejectCompanyApplication } from "./application-actions";

export type ApplicationQueueRow = PendingApplicationQueueRow;

interface Props {
  rows: ApplicationQueueRow[];
}

export function CompanyApplicationQueue({ rows }: Props) {
  return (
    <div className="rounded-xl border border-candy-200 bg-white shadow-sm ring-1 ring-candy-100/60">
      <div className="border-b border-candy-100 px-4 py-3 md:px-5">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          Kö: nya företagsförfrågningar
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Här hamnar intresseanmälningar från kontaktformuläret (&quot;Ny
          kund?&quot;). Varje rad ligger kvar som <strong>väntande</strong> tills
          ni godkänner (skapa företag) eller avvisar — inget försvinner av sig
          själv.
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <THead>
            <TR>
              <TH>Inkommen</TH>
              <TH>Kontakt</TH>
              <TH>Företag</TH>
              <TH>Org.nr</TH>
              <TH>Mejl</TH>
              <TH>Telefon</TH>
              <TH>Meddelande</TH>
              <TH>Excel</TH>
              <TH>Villkor</TH>
              <TH className="w-[1%] whitespace-nowrap">Åtgärder</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((r) => (
              <TR key={r.id}>
                <TD className="text-sm text-slate-700">
                  {formatDate(r.created_at.slice(0, 10))}
                </TD>
                <TD className="font-medium text-slate-900">{r.contact_name}</TD>
                <TD>{r.company_name}</TD>
                <TD className="whitespace-nowrap text-sm text-slate-700">
                  {r.organization_number?.trim() ? (
                    formatOrganizationNumber(r.organization_number)
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TD>
                <TD>
                  <a
                    href={`mailto:${r.contact_email}`}
                    className="text-coral-600 hover:underline"
                  >
                    {r.contact_email}
                  </a>
                </TD>
                <TD className="text-sm">
                  {r.contact_phone?.trim() ? (
                    <a
                      href={`tel:${r.contact_phone.replace(/\s+/g, "")}`}
                      className="text-coral-600 hover:underline"
                    >
                      {r.contact_phone}
                    </a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TD>
                <TD
                  className="max-w-[14rem] truncate text-sm text-slate-600"
                  title={r.message ?? undefined}
                >
                  {r.message?.trim() ? r.message : "—"}
                </TD>
                <TD className="text-sm">
                  {r.employees_import_storage_path ? (
                    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-100">
                      Mall bifogad
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TD>
                <TD className="whitespace-nowrap text-sm text-slate-600">
                  {r.terms_accepted_at ? (
                    <>
                      {formatDate(r.terms_accepted_at.slice(0, 10))}
                      <span className="block text-xs text-slate-500">
                        {r.terms_document_version}
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-700">Saknas</span>
                  )}
                </TD>
                <TD>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/foretag/nytt?application=${r.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-full border border-candy-200 bg-white px-3 text-sm font-medium text-candy-700 shadow-none transition-all hover:bg-candy-50 focus:outline-none focus:ring-2 focus:ring-coral-300 focus:ring-offset-2"
                    >
                      Godkänn…
                    </Link>
                    <RejectButton applicationId={r.id} />
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

function RejectButton({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    if (
      !globalThis.confirm(
        "Markera denna förfrågan som avvisad? Den försvinner från kön.",
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await rejectCompanyApplication(applicationId);
      if (!res.ok) setError(res.error ?? "Kunde inte avvisa.");
      else router.refresh();
    });
  };

  return (
    <span className="inline-flex flex-col gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-slate-600"
        disabled={pending}
        onClick={onClick}
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Spinner />
            Avvisar…
          </span>
        ) : (
          "Avvisa"
        )}
      </Button>
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : null}
    </span>
  );
}
