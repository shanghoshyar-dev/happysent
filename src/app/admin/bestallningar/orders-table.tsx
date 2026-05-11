"use client";

import {
  FilterableTable,
  type FilterableColumn,
} from "@/components/admin/filterable-table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatSek } from "@/lib/utils";
import type { OrderStatus } from "@/types/database";

import { CancelOrderButton } from "./cancel-button";

const STATUS_LABELS: Record<OrderStatus, string> = {
  scheduled: "Schemalagd",
  sent_to_bakery: "Skickad till bageri",
  delivered: "Levererad",
  invoiced: "Fakturerad",
  cancelled: "Avbruten",
};

const STATUS_TONE: Record<
  OrderStatus,
  "neutral" | "info" | "success" | "warning" | "danger"
> = {
  scheduled: "info",
  sent_to_bakery: "warning",
  delivered: "success",
  invoiced: "neutral",
  cancelled: "danger",
};

export type OrderTableRow = {
  id: string;
  delivery_date: string;
  status: OrderStatus;
  price: number;
  companyName: string;
  employeeName: string;
  canCancel: boolean;
};

interface Props {
  rows: OrderTableRow[];
}

export function OrdersTable({ rows }: Props) {
  const columns: FilterableColumn<OrderTableRow>[] = [
    {
      id: "delivery",
      header: "Leveransdag",
      sortable: true,
      sortValue: (r) => r.delivery_date,
      searchText: (r) => formatDate(r.delivery_date),
      cell: (r) => (
        <span className="font-medium text-slate-900">
          {formatDate(r.delivery_date)}
        </span>
      ),
    },
    {
      id: "company",
      header: "Företag",
      sortable: true,
      sortValue: (r) => r.companyName.toLowerCase(),
      searchText: (r) => r.companyName,
      cell: (r) => r.companyName,
    },
    {
      id: "employee",
      header: "Anställd",
      sortable: true,
      sortValue: (r) => r.employeeName.toLowerCase(),
      searchText: (r) => r.employeeName,
      cell: (r) => r.employeeName,
    },
    {
      id: "price",
      header: "Pris",
      sortable: true,
      sortValue: (r) => r.price,
      searchText: (r) => String(r.price),
      cell: (r) => formatSek(r.price),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      sortValue: (r) => STATUS_LABELS[r.status],
      searchText: (r) => STATUS_LABELS[r.status],
      cell: (r) => (
        <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABELS[r.status]}</Badge>
      ),
    },
    {
      id: "actions",
      header: "Åtgärder",
      cell: (r) => (
        <div className="flex justify-end">
          <CancelOrderButton orderId={r.id} canCancel={r.canCancel} />
        </div>
      ),
    },
  ];

  return (
    <FilterableTable<OrderTableRow>
      rows={rows}
      columns={columns}
      rowKey={(r) => r.id}
      searchPlaceholder="Sök på datum, företag, anställd eller status…"
      pageSize={20}
    />
  );
}
