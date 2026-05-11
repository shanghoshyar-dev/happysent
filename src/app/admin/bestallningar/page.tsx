import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getAppSettings } from "@/lib/app-settings";
import {
  diffInDays,
  parseDateString,
  todayInStockholm,
} from "@/lib/holidays/swedish";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database";

import { OrdersTable, type OrderTableRow } from "./orders-table";

export const dynamic = "force-dynamic";

export default async function BestallningarPage() {
  const settings = await getAppSettings();
  const cancellationDays = settings.cancellation_days_before_delivery;

  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `id, delivery_date, status, price,
       employees:employee_id ( first_name, last_name ),
       companies:company_id ( name )`,
    )
    .order("delivery_date", { ascending: false })
    .limit(500);

  const rows: OrderTableRow[] = (orders ?? []).map((o) => {
    const emp = o.employees as
      | { first_name: string; last_name: string }
      | null;
    const company = o.companies as { name: string } | null;
    const today = todayInStockholm();
    const daysAway = diffInDays(parseDateString(o.delivery_date), today);
    const canCancel =
      (o.status === "scheduled" || o.status === "sent_to_bakery") &&
      daysAway >= cancellationDays;
    return {
      id: o.id,
      delivery_date: o.delivery_date,
      status: o.status as OrderStatus,
      price: o.price,
      companyName: company?.name ?? "—",
      employeeName: emp ? `${emp.first_name} ${emp.last_name}` : "—",
      canCancel,
    };
  });

  return (
    <div>
      <PageHeader
        title="Beställningar"
        description={`Alla planerade och levererade tårtor. Avbokning tillåten tidigast ${cancellationDays} dagar före leverans.`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Beställningar" },
        ]}
      />

      {!orders || orders.length === 0 ? (
        <EmptyState
          title="Inga beställningar ännu"
          description="Beställningar skapas automatiskt när en anställds födelsedag närmar sig."
        />
      ) : (
        <OrdersTable rows={rows} />
      )}
    </div>
  );
}
