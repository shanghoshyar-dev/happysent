"use client";

import Link from "next/link";

import {
  FilterableTable,
  type FilterableColumn,
} from "@/components/admin/filterable-table";
import { Badge } from "@/components/ui/badge";

export type CompanyTableRow = {
  id: string;
  name: string;
  city: string;
  bakeryName: string;
  offers_flowers: boolean;
  floristName: string;
  contact_email: string;
  status: "active" | "paused";
};

interface Props {
  rows: CompanyTableRow[];
}

export function CompaniesTable({ rows }: Props) {
  const columns: FilterableColumn<CompanyTableRow>[] = [
    {
      id: "name",
      header: "Namn",
      sortable: true,
      sortValue: (r) => r.name.toLowerCase(),
      searchText: (r) => r.name,
      cell: (r) => (
        <Link
          href={`/admin/foretag/${r.id}`}
          className="font-medium text-slate-900 hover:text-coral-600 hover:underline"
        >
          {r.name}
        </Link>
      ),
    },
    {
      id: "city",
      header: "Stad",
      sortable: true,
      sortValue: (r) => r.city.toLowerCase(),
      searchText: (r) => r.city,
      cell: (r) => r.city,
    },
    {
      id: "bakery",
      header: "Bageri",
      sortable: true,
      sortValue: (r) => r.bakeryName.toLowerCase(),
      searchText: (r) => r.bakeryName,
      cell: (r) => r.bakeryName,
    },
    {
      id: "flowers",
      header: "Blommor",
      sortable: true,
      sortValue: (r) => (r.offers_flowers ? "ja" : "nej"),
      searchText: (r) => (r.offers_flowers ? "Ja blommor" : "Nej"),
      cell: (r) => (r.offers_flowers ? "Ja" : "Nej"),
    },
    {
      id: "florist",
      header: "Blomsterbutik",
      sortable: true,
      sortValue: (r) => r.floristName.toLowerCase(),
      searchText: (r) => r.floristName,
      cell: (r) => r.floristName,
    },
    {
      id: "contact",
      header: "Kontakt",
      sortable: true,
      sortValue: (r) => r.contact_email.toLowerCase(),
      searchText: (r) => r.contact_email,
      cell: (r) => r.contact_email,
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      sortValue: (r) => r.status,
      searchText: (r) => (r.status === "active" ? "Aktivt" : "Pausat"),
      cell: (r) => (
        <Badge tone={r.status === "active" ? "success" : "warning"}>
          {r.status === "active" ? "Aktivt" : "Pausat"}
        </Badge>
      ),
    },
  ];

  return (
    <FilterableTable<CompanyTableRow>
      rows={rows}
      columns={columns}
      rowKey={(r) => r.id}
      searchPlaceholder="Sök på namn, stad, bageri, blomsterbutik eller mejl…"
      pageSize={20}
    />
  );
}
