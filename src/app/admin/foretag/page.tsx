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

  const hasCompanies = (companies?.length ?? 0) > 0;

  return (
    <div>
      <PageHeader
        title="Företag"
        description="Företagen som vi levererar tårtor till. Väntande nykundsansökningar hanterar du under Kölista."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Företag" },
        ]}
        action={
          <>
            <Link href="/admin/kolista">
              <Button variant="secondary">Kölista</Button>
            </Link>
            <Link href="/admin/foretag/nytt">
              <Button>Nytt företag</Button>
            </Link>
          </>
        }
      />

      {!hasCompanies ? (
        <EmptyState
          title="Inga företag ännu"
          description="Lägg till ert första företag, eller öppna Kölista om ni har inkomna förfrågningar från webben."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/admin/kolista">
                <Button variant="secondary">Öppna Kölista</Button>
              </Link>
              <Link href="/admin/foretag/nytt">
                <Button>Lägg till företag</Button>
              </Link>
            </div>
          }
        />
      ) : (
        <CompaniesTable rows={rows} />
      )}
    </div>
  );
}
