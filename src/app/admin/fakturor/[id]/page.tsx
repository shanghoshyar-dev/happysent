import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatSek } from "@/lib/utils";

import { DownloadInvoiceButton } from "./download-invoice-button";
import { MarkPaidButton } from "./mark-paid-button";
import { SendInvoiceButton } from "./send-invoice-button";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function InvoiceDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      "id, month, total_amount, status, orders, created_at, sent_at, pdf_downloaded_at, companies:company_id ( name, address, city, billing_email )",
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!invoice) notFound();

  const company = invoice.companies as
    | { name: string; address: string; city: string; billing_email: string }
    | null;
  const sentAt = invoice.sent_at ?? null;
  const pdfDownloadedAt = invoice.pdf_downloaded_at ?? null;
  const orderIds = Array.isArray(invoice.orders)
    ? (invoice.orders as string[])
    : [];

  const { data: lineItems } = await supabase
    .from("orders")
    .select(
      `id, delivery_date, price,
       employees:employee_id ( first_name, last_name )`,
    )
    .in("id", orderIds.length ? orderIds : ["00000000-0000-0000-0000-000000000000"]);

  return (
    <div>
      <PageHeader
        title={`Faktura ${invoice.month}`}
        description={company?.name ?? ""}
        action={
          <Link href="/admin/fakturor">
            <Button variant="secondary">Tillbaka</Button>
          </Link>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">Belopp</p>
          <p className="mt-1 font-display text-2xl text-slate-900">
            {formatSek(invoice.total_amount)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Status</p>
          <p className="mt-2">
            <Badge tone={invoice.status === "paid" ? "success" : "warning"}>
              {invoice.status === "paid" ? "Betald" : "Obetald"}
            </Badge>
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Faktura-mail</p>
          <p className="mt-1 text-sm text-slate-900">
            {company?.billing_email ?? "—"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Skickad till kund</p>
          <p className="mt-1 text-sm text-slate-900">
            {sentAt
              ? new Date(sentAt).toLocaleString("sv-SE", {
                  timeZone: "Europe/Stockholm",
                })
              : "Ej skickad"}
          </p>
          {pdfDownloadedAt ? (
            <p className="mt-1 text-xs text-slate-500">
              PDF nedladdad:{" "}
              {new Date(pdfDownloadedAt).toLocaleString("sv-SE", {
                timeZone: "Europe/Stockholm",
              })}
            </p>
          ) : null}
        </Card>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <DownloadInvoiceButton invoiceId={invoice.id} />
        <SendInvoiceButton
          id={invoice.id}
          billingEmail={company?.billing_email ?? null}
          sentAt={sentAt}
        />
      </div>

      <h2 className="mb-3 font-display text-xl text-slate-900">Rader</h2>
      <Table>
        <THead>
          <TR>
            <TH>Datum</TH>
            <TH>Anställd</TH>
            <TH className="text-right">Belopp</TH>
          </TR>
        </THead>
        <TBody>
          {(lineItems ?? []).map((row) => {
            const emp = row.employees as
              | { first_name: string; last_name: string }
              | null;
            return (
              <TR key={row.id}>
                <TD>{formatDate(row.delivery_date)}</TD>
                <TD>
                  {emp ? `${emp.first_name} ${emp.last_name}` : "—"}
                </TD>
                <TD className="text-right">{formatSek(row.price)}</TD>
              </TR>
            );
          })}
        </TBody>
      </Table>

      <div className="mt-6">
        <MarkPaidButton
          id={invoice.id}
          alreadyPaid={invoice.status === "paid"}
        />
      </div>
    </div>
  );
}
