import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { getCompanySession } from "@/lib/auth/session";
import { formatMonthLabel } from "@/lib/invoices/format";
import { createClient } from "@/lib/supabase/server";
import { formatSek } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function KundFakturorPage() {
  const session = await getCompanySession();
  if (!session) return null;

  const supabase = createClient();
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, month, total_amount, status, sent_at, orders")
    .eq("company_id", session.companyId)
    .order("month", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl text-slate-900">Fakturor</h1>
      <p className="mt-2 text-slate-600">
        Era månadsfakturor baserade på levererade tårtor och blommor.
      </p>

      {error ? (
        <div className="mt-8">
          <EmptyState
            title="Kunde inte hämta fakturor"
            description={error.message}
          />
        </div>
      ) : !invoices || invoices.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Inga fakturor ännu"
            description="När ni har levererade beställningar som fakturerats visas de här."
          />
        </div>
      ) : (
        <Card className="mt-8 overflow-x-auto p-0">
          <Table>
            <THead>
              <TR>
                <TH>Månad</TH>
                <TH>Belopp</TH>
                <TH>Leveranser</TH>
                <TH>Status</TH>
                <TH className="text-right">PDF</TH>
              </TR>
            </THead>
            <TBody>
              {invoices.map((inv) => {
                const orderCount = Array.isArray(inv.orders)
                  ? (inv.orders as string[]).length
                  : 0;
                const isPaid = inv.status === "paid";
                return (
                  <TR key={inv.id}>
                    <TD className="font-medium text-slate-900">
                      {formatMonthLabel(inv.month)}
                    </TD>
                    <TD>{formatSek(inv.total_amount)}</TD>
                    <TD>{orderCount}</TD>
                    <TD>
                      <Badge tone={isPaid ? "success" : "warning"}>
                        {isPaid ? "Betald" : "Obetald"}
                      </Badge>
                      {inv.sent_at ? (
                        <span className="ml-2 text-xs text-slate-500">
                          Skickad
                        </span>
                      ) : null}
                    </TD>
                    <TD className="text-right">
                      <Link
                        href={`/api/invoices/${inv.id}/pdf`}
                        className="text-sm font-medium text-coral-600 hover:underline"
                      >
                        Ladda ner
                      </Link>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
