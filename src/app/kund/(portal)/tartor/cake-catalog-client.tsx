"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { getCakeImageUrl } from "@/lib/cake-selection/catalog-images";
import { cn } from "@/lib/utils";

import { assignPreferredCake, clearPreferredCake } from "../../actions";

export interface CakeProduct {
  id: string;
  name: string;
  dietaryNotes: string | null;
}

export interface CakeEmployee {
  id: string;
  firstName: string;
  lastName: string;
  preferredProductId: string | null;
}

interface Props {
  products: CakeProduct[];
  employees: CakeEmployee[];
}

export function CakeCatalogClient({ products, employees }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    products[0]?.id ?? null,
  );
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(
    new Set(),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const employeesByProduct = useMemo(() => {
    const map = new Map<string, CakeEmployee[]>();
    for (const emp of employees) {
      if (!emp.preferredProductId) continue;
      const list = map.get(emp.preferredProductId) ?? [];
      list.push(emp);
      map.set(emp.preferredProductId, list);
    }
    return map;
  }, [employees]);

  function toggleEmployee(id: string) {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllEmployees() {
    setSelectedEmployeeIds(new Set(employees.map((e) => e.id)));
  }

  function clearSelection() {
    setSelectedEmployeeIds(new Set());
  }

  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Tårtsortimentet för er stad är inte konfigurerat än. Kontakta HappySent
        om ni behöver hjälp.
      </p>
    );
  }

  if (employees.length === 0) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Lägg till aktiva anställda med gåva &quot;Tårta&quot; innan ni kan koppla
        favorittårtor.
      </p>
    );
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-600">
        Bläddra bland tårtorna och koppla en favorit till en eller flera
        anställda. Valet används automatiskt vid kommande födelsedagar.
      </p>

      <section>
        <h2 className="font-semibold text-slate-900">Välj tårta</h2>
        <div className="mt-3 flex gap-4 overflow-x-auto pb-2">
          {products.map((product) => {
            const linked = employeesByProduct.get(product.id) ?? [];
            const isSelected = selectedProductId === product.id;
            const imageUrl = getCakeImageUrl(product.name);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  setSelectedProductId(product.id);
                  setMessage(null);
                }}
                className={cn(
                  "w-[200px] shrink-0 overflow-hidden rounded-xl border text-left transition-colors",
                  isSelected
                    ? "border-candy-400 bg-candy-50 ring-1 ring-candy-300"
                    : "border-candy-100 bg-white hover:border-candy-200",
                )}
              >
                <div className="relative aspect-[4/3] bg-cream-100">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      Ingen bild
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <span className="font-medium text-slate-900">{product.name}</span>
                  {product.dietaryNotes ? (
                    <span className="mt-1 block text-xs text-slate-500">
                      {product.dietaryNotes}
                    </span>
                  ) : null}
                  {linked.length > 0 ? (
                    <span className="mt-2 block text-xs font-medium text-emerald-700">
                      {linked.length} anställd
                      {linked.length === 1 ? "" : "a"} kopplad
                      {linked.length === 1 ? "" : "e"}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selectedProduct ? (
        <section className="rounded-2xl border border-candy-100 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">
                Koppla {selectedProduct.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Markera vilka anställda som ska ha den här tårtan.
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={selectAllEmployees}
                className="text-coral-600 hover:underline"
              >
                Markera alla
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-slate-500 hover:underline"
              >
                Rensa markering
              </button>
            </div>
          </div>

          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
            {employees.map((emp) => {
              const checked = selectedEmployeeIds.has(emp.id);
              const currentProduct = products.find(
                (p) => p.id === emp.preferredProductId,
              );
              return (
                <li key={emp.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-candy-50 px-3 py-2 hover:bg-candy-50/50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEmployee(emp.id)}
                      className="h-4 w-4 rounded border-candy-300 text-candy-500"
                    />
                    <span className="flex-1 text-sm text-slate-900">
                      {emp.firstName} {emp.lastName}
                    </span>
                    {currentProduct ? (
                      <span className="text-xs text-slate-500">
                        Nu: {currentProduct.name}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Ingen tårta</span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>

          {message ? (
            <p
              className={`mt-4 text-sm ${isError ? "text-red-600" : "text-emerald-800"}`}
              role="alert"
            >
              {message}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={pending || selectedEmployeeIds.size === 0}
              onClick={() => {
                if (!selectedProductId) return;
                setMessage(null);
                startTransition(async () => {
                  const res = await assignPreferredCake(
                    selectedProductId,
                    [...selectedEmployeeIds],
                  );
                  if (res.ok) {
                    setIsError(false);
                    setMessage(
                      `${selectedProduct.name} kopplad till ${res.count} anställd${res.count === 1 ? "" : "a"}.`,
                    );
                    setSelectedEmployeeIds(new Set());
                    router.refresh();
                  } else {
                    setIsError(true);
                    setMessage(res.error);
                  }
                });
              }}
            >
              {pending ? "Sparar…" : "Koppla till valda"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={pending || selectedEmployeeIds.size === 0}
              onClick={() => {
                setMessage(null);
                startTransition(async () => {
                  const res = await clearPreferredCake([...selectedEmployeeIds]);
                  if (res.ok) {
                    setIsError(false);
                    setMessage(
                      `Tårtval borttaget för ${res.count} anställd${res.count === 1 ? "" : "a"}.`,
                    );
                    setSelectedEmployeeIds(new Set());
                    router.refresh();
                  } else {
                    setIsError(true);
                    setMessage(res.error);
                  }
                });
              }}
            >
              Ta bort tårtval
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
