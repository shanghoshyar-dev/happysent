import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";

import {
  CompanyApplicationQueue,
  type ApplicationQueueRow,
} from "./application-queue";
import { CompaniesTable, type CompanyTableRow } from "./companies-table";

export const dynamic = "force-dynamic";

export default async function ForetagPage() {
  const supabase = createClient();

  const [{ data: pendingApps }, { data: companies }] = await Promise.all([
    supabase
      .from("company_applications")
      .select(
        "id, contact_name, company_name, contact_email, message, created_at",
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("companies")
      .select(
        "id, name, city, contact_email, price_per_cake, status, bakeries:bakery_id ( name )",
      )
      .order("created_at", { ascending: false }),
  ]);

  const queueRows: ApplicationQueueRow[] = (pendingApps ?? []).map((r) => ({
    id: r.id,
    contact_name: r.contact_name,
    company_name: r.company_name,
    contact_email: r.contact_email,
    message: r.message,
    created_at: r.created_at,
  }));

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
  const hasQueue = queueRows.length > 0;

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

      {hasQueue ? (
        <div className="mb-10">
          <CompanyApplicationQueue rows={queueRows} />
        </div>
      ) : null}

      {!hasCompanies ? (
        <EmptyState
          title="Inga företag ännu"
          description={
            hasQueue
              ? "Godkänn förfrågningar i kön ovan för att skapa era första kunder, eller lägg till ett företag manuellt."
              : "Lägg till ert första företag för att komma igång."
          }
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
