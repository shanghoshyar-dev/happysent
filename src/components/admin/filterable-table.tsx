"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface FilterableColumn<T> {
  id: string;
  header: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  searchText?: (row: T) => string;
  cell: (row: T) => ReactNode;
}

interface FilterableTableProps<T> {
  rows: T[];
  columns: FilterableColumn<T>[];
  rowKey: (row: T) => string;
  searchPlaceholder?: string;
  pageSize?: number;
}

export function FilterableTable<T>({
  rows,
  columns,
  rowKey,
  searchPlaceholder = "Sök…",
  pageSize = 25,
}: FilterableTableProps<T>) {
  const [q, setQ] = useState("");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const processed = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = rows;
    if (needle) {
      list = rows.filter((row) =>
        columns.some((c) =>
          (c.searchText?.(row) ?? "").toLowerCase().includes(needle),
        ),
      );
    }
    const col = columns.find((c) => c.id === sortCol);
    if (col?.sortValue) {
      list = [...list].sort((a, b) => {
        const va = col.sortValue!(a);
        const vb = col.sortValue!(b);
        const cmp =
          typeof va === "number" && typeof vb === "number"
            ? va - vb
            : String(va).localeCompare(String(vb), "sv");
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [rows, q, sortCol, sortDir, columns]);

  const pageCount = Math.max(1, Math.ceil(processed.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const slice = processed.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize,
  );

  function toggleSort(id: string) {
    const col = columns.find((c) => c.id === id);
    if (!col?.sortable) return;
    if (sortCol === id) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(id);
      setSortDir("asc");
    }
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder={searchPlaceholder}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(0);
        }}
        className="max-w-md"
        aria-label="Sök i tabellen"
      />
      <Table>
          <THead>
            <TR>
              {columns.map((c) => (
                <TH key={c.id}>
                  {c.sortable ? (
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1 font-semibold text-slate-700 transition-colors hover:text-coral-600",
                        sortCol === c.id && "text-coral-600",
                      )}
                      onClick={() => toggleSort(c.id)}
                    >
                      {c.header}
                      {sortCol === c.id ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </button>
                  ) : (
                    c.header
                  )}
                </TH>
              ))}
            </TR>
          </THead>
          <TBody>
            {slice.length === 0 ? (
              <TR>
                <TD
                  colSpan={columns.length}
                  className="py-10 text-center text-slate-500"
                >
                  Inga rader matchar sökningen.
                </TD>
              </TR>
            ) : (
              slice.map((row) => (
                <TR key={rowKey(row)}>
                  {columns.map((c) => (
                    <TD key={c.id}>{c.cell(row)}</TD>
                  ))}
                </TR>
              ))
            )}
          </TBody>
        </Table>
      {processed.length > pageSize ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <span>
            Visar {safePage * pageSize + 1}–
            {Math.min((safePage + 1) * pageSize, processed.length)} av{" "}
            {processed.length}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
              disabled={safePage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Föregående
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              Nästa
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
