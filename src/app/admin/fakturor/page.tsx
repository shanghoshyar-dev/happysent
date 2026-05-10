import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { formatSek } from "@/lib/utils";

import { GenerateInvoicesForm } from "./generate-button";

export const dynamic = "force-dynamic";

export default async function FakturorPage() {
  const supabase = createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select(
      "id, month, total_amount, status, companies:company_id ( name )",
    )
    .order("month", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Fakturor"
        description="Månadsfakturor per företag, baserat på levererade tårtor."
      />

      <Card className="mb-8 max-w-3xl">
        <h2 className="mb-4 font-semibold text-slate-900">
          Generera månadsfakturor
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Sammanställer alla beställningar med status “Levererad” eller
          “Fakturerad” för vald månad och skapar (eller uppdaterar) en faktura
          per företag.
        </p>
        <GenerateInvoicesForm />
      </Card>

      {!invoices || invoices.length === 0 ? (
        <EmptyState
          title="Inga fakturor ännu"
          description="Generera första månadens faktura med formuläret ovan."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Månad</TH>
              <TH>Företag</TH>
              <TH>Belopp</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {invoices.map((inv) => {
              const company = inv.companies as { name: string } | null;
              return (
                <TR key={inv.id}>
                  <TD className="font-medium text-slate-900">
                    <Link
                      href={`/admin/fakturor/${inv.id}`}
                      className="hover:underline"
                    >
                      {inv.month}
                    </Link>
                  </TD>
                  <TD>{company?.name ?? "—"}</TD>
                  <TD>{formatSek(inv.total_amount)}</TD>
                  <TD>
                    <Badge
                      tone={inv.status === "paid" ? "success" : "warning"}
                    >
                      {inv.status === "paid" ? "Betald" : "Obetald"}
                    </Badge>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}
    </div>
  );
}
