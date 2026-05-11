import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";

import { createProduct } from "./actions";
import { ProductRow } from "./product-row";

export const dynamic = "force-dynamic";

export default async function ProdukterPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, is_active")
    .order("name");

  return (
    <div>
      <PageHeader
        title="Produkter"
        description="De produktkategorier som bagerierna kan leverera."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Produkter" },
        ]}
      />

      <div className="mb-8">
        <Card className="max-w-xl">
          <h2 className="mb-4 font-semibold text-slate-900">Ny produkt</h2>
          <form action={createProduct} className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="name">Namn</Label>
              <Input id="name" name="name" required placeholder="t.ex. Cupcakes" />
            </div>
            <Button type="submit">Lägg till</Button>
          </form>
        </Card>
      </div>

      {!products || products.length === 0 ? (
        <EmptyState
          title="Inga produkter ännu"
          description="Lägg till tårta, cupcakes eller annat ovan."
        />
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <ProductRow
              key={p.id}
              id={p.id}
              name={p.name}
              isActive={p.is_active}
            />
          ))}
        </div>
      )}
    </div>
  );
}
