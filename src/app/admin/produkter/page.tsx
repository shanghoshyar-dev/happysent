import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/server";

import { createProduct } from "./actions";
import { ProductRow } from "./product-row";

export const dynamic = "force-dynamic";

export default async function ProdukterPage() {
  const supabase = createClient();
  const [{ data: products }, { data: bakeries }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, is_active, dietary_notes, sort_order, bakeries:bakery_id ( name )")
      .order("sort_order")
      .order("name"),
    supabase.from("bakeries").select("id, name, city").order("name"),
  ]);

  return (
    <div>
      <PageHeader
        title="Produkter"
        description="Tårtor i katalogen — kopplas till bageri och visas vid tårtval."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Produkter" },
        ]}
      />

      <Card className="mb-8 max-w-xl">
        <h2 className="mb-4 font-semibold text-slate-900">Ny produkt</h2>
        <form action={createProduct} className="grid gap-3">
          <div>
            <Label htmlFor="name">Namn</Label>
            <Input id="name" name="name" required placeholder="t.ex. Princesstårta" />
          </div>
          <div>
            <Label htmlFor="bakery_id">Bageri</Label>
            <Select id="bakery_id" name="bakery_id" required defaultValue="">
              <option value="" disabled>
                Välj bageri
              </option>
              {(bakeries ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="dietary_notes">Märkning (valfritt)</Label>
            <Input
              id="dietary_notes"
              name="dietary_notes"
              placeholder="t.ex. Nötfri, Glutenfri"
            />
          </div>
          <Button type="submit">Lägg till</Button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          PDF-katalog:{" "}
          <a
            href="/marketing/tartkatalog.pdf"
            className="font-medium text-coral-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            tartkatalog.pdf
          </a>
        </p>
      </Card>

      {!products || products.length === 0 ? (
        <EmptyState
          title="Inga produkter ännu"
          description="Kör migration i Supabase eller lägg till produkter ovan."
        />
      ) : (
        <div className="space-y-3">
          {products.map((p) => {
            const bakery = p.bakeries as { name: string } | null;
            return (
              <ProductRow
                key={p.id}
                id={p.id}
                name={p.name}
                isActive={p.is_active}
                subtitle={
                  [bakery?.name, p.dietary_notes].filter(Boolean).join(" · ") ||
                  undefined
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
