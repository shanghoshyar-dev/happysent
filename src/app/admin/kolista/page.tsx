import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchPendingCompanyApplications } from "@/lib/admin/pending-company-applications";
import { createClient } from "@/lib/supabase/server";

import { CompanyApplicationQueue } from "../foretag/application-queue";

export const dynamic = "force-dynamic";

export default async function KolistaPage() {
  const supabase = createClient();
  const { rows, warning } = await fetchPendingCompanyApplications(supabase);

  return (
    <div>
      <PageHeader
        title="Kölista"
        description={
          "Intresseanmälningar från kontaktformuläret («Ny kund?»). Varje rad är väntande tills ni godkänner eller avvisar den."
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Kölista" },
        ]}
        action={
          <Link href="/admin/foretag/nytt">
            <Button variant="secondary">Nytt företag (manuellt)</Button>
          </Link>
        }
      />

      {warning ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {warning}
        </div>
      ) : null}

      {rows.length > 0 ? (
        <CompanyApplicationQueue rows={rows} />
      ) : (
        <EmptyState
          title="Ingen kö just nu"
          description={
            warning
              ? "Åtgärda varningen ovan om kön inte borde vara tom. Annars visas nya ansökningar här när någon fyller i formuläret på /kontakt."
              : "När någon skickar en förfrågan som ny kund på webbplatsen visas den här."
          }
          action={
            <Link href="/kontakt" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">Öppna kontaktsidan</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
