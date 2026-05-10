import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatSek } from "@/lib/utils";
import type { OrderStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<OrderStatus, string> = {
  scheduled: "Schemalagd",
  sent_to_bakery: "Skickad till bageri",
  delivered: "Levererad",
  invoiced: "Fakturerad",
  cancelled: "Avbruten",
};

const STATUS_TONE: Record<OrderStatus, "neutral" | "info" | "success" | "warning" | "danger"> = {
  scheduled: "info",
  sent_to_bakery: "warning",
  delivered: "success",
  invoiced: "neutral",
  cancelled: "danger",
};

export default async function BestallningarPage() {
  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `id, delivery_date, status, price,
       employees:employee_id ( first_name, last_name ),
       companies:company_id ( name )`,
    )
    .order("delivery_date", { ascending: false })
    .limit(200);

  return (
    <div>
      <PageHeader
        title="Beställningar"
        description="Alla planerade och levererade tårtor."
      />

      {!orders || orders.length === 0 ? (
        <EmptyState
          title="Inga beställningar ännu"
          description="Beställningar skapas automatiskt när en anställds födelsedag närmar sig."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Leveransdag</TH>
              <TH>Företag</TH>
              <TH>Anställd</TH>
              <TH>Pris</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {orders.map((o) => {
              const emp = o.employees as
                | { first_name: string; last_name: string }
                | null;
              const company = o.companies as { name: string } | null;
              return (
                <TR key={o.id}>
                  <TD className="font-medium text-slate-900">
                    {formatDate(o.delivery_date)}
                  </TD>
                  <TD>{company?.name ?? "—"}</TD>
                  <TD>
                    {emp ? `${emp.first_name} ${emp.last_name}` : "—"}
                  </TD>
                  <TD>{formatSek(o.price)}</TD>
                  <TD>
                    <Badge tone={STATUS_TONE[o.status]}>
                      {STATUS_LABELS[o.status]}
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
