import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";

import { CompaniesTable, type CompanyTableRow } from "./companies-table";

export const dynamic = "force-dynamic";

export default async function ForetagPage() {
  const supabase = createClient();
  const { data: companies } = await supabase
    .from("companies")
    .select(
      "id, name, city, contact_email, price_per_cake, status, bakeries:bakery_id ( name )",
    )
    .order("created_at", { ascending: false });

  const rows: CompanyTableRow[] = (companies ?? []).map((c) => {
    const bakeryName = (c.bakeries as { name: string } | null)?.name ?? "—";
    return {
      id: c.id,
      name: c.name,
      city: c.city,
      bakeryName,
      contact_email: c.contact_email,
      price_per_cake: c.price_per_cake,
      status: c.status as "active" | "paused",
    };
  });

  return (
    <div>
      <PageHeader
        title="Företag"
        description="Företagen som vi levererar tårtor till."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Företag" },
        ]}
        action={
          <Link href="/admin/foretag/nytt">
            <Button>Nytt företag</Button>
          </Link>
        }
      />

      {!companies || companies.length === 0 ? (
        <EmptyState
          title="Inga företag ännu"
          description="Lägg till ert första företag för att komma igång."
          action={
            <Link href="/admin/foretag/nytt">
              <Button>Lägg till företag</Button>
            </Link>
          }
        />
      ) : (
        <CompaniesTable rows={rows} />
      )}
    </div>
  );
}
