import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

import { createBakery } from "./actions";
import { BakeryForm } from "./bakery-form";
import { BakeryRowActions } from "./bakery-row-actions";

export const dynamic = "force-dynamic";

export default async function BagerierPage() {
  const supabase = createClient();
  const { data: bakeries } = await supabase
    .from("bakeries")
    .select("id, name, city, email, phone, days_notice")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Bagerier"
        description="De bagerier som vi samarbetar med per stad."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Bagerier" },
        ]}
      />

      <div className="mb-8">
        <Card className="max-w-3xl">
          <h2 className="mb-4 font-semibold text-slate-900">Nytt bageri</h2>
          <BakeryForm action={createBakery} submitLabel="Spara bageri" />
        </Card>
      </div>

      {!bakeries || bakeries.length === 0 ? (
        <EmptyState
          title="Inga bagerier ännu"
          description="Lägg till det första bageriet ovan."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Namn</TH>
              <TH>Stad</TH>
              <TH>E-post</TH>
              <TH>Telefon</TH>
              <TH>Dagar förväg</TH>
              <TH className="text-right">Åtgärder</TH>
            </TR>
          </THead>
          <TBody>
            {bakeries.map((b) => (
              <TR key={b.id}>
                <TD className="font-medium text-slate-900">
                  <Link
                    href={`/admin/bagerier/${b.id}`}
                    className="hover:underline"
                  >
                    {b.name}
                  </Link>
                </TD>
                <TD>{b.city}</TD>
                <TD>{b.email}</TD>
                <TD>{b.phone ?? "—"}</TD>
                <TD>{b.days_notice}</TD>
                <TD>
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/bagerier/${b.id}`}>
                      <Button size="sm" variant="secondary">
                        Redigera
                      </Button>
                    </Link>
                    <BakeryRowActions id={b.id} name={b.name} />
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
