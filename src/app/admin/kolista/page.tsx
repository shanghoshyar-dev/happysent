import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchPendingEmployeeChangeRequests } from "@/lib/admin/employee-change-requests";
import { fetchPendingCompanyApplications } from "@/lib/admin/pending-company-applications";
import { createClient } from "@/lib/supabase/server";

import { CompanyApplicationQueue } from "../foretag/application-queue";
import { EmployeeChangeQueue } from "./employee-change-queue";

export const dynamic = "force-dynamic";

export default async function KolistaPage() {
  const supabase = createClient();
  const [companyQueue, employeeQueue] = await Promise.all([
    fetchPendingCompanyApplications(supabase),
    fetchPendingEmployeeChangeRequests(supabase),
  ]);

  const warnings = [companyQueue.warning, employeeQueue.warning].filter(
    Boolean,
  ) as string[];

  const hasAny =
    companyQueue.rows.length > 0 || employeeQueue.rows.length > 0;

  return (
    <div>
      <PageHeader
        title="Kölista"
        description="Förfrågningar från kontaktformuläret som väntar på godkännande innan de slår igenom i systemet."
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

      {warnings.map((w) => (
        <div
          key={w}
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          {w}
        </div>
      ))}

      {!hasAny ? (
        <EmptyState
          title="Ingen kö just nu"
          description="Nya kunder och personaländringar från /kontakt visas här när de skickas in."
          action={
            <Link href="/kontakt" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">Öppna kontaktsidan</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-10">
          {employeeQueue.rows.length > 0 ? (
            <EmployeeChangeQueue rows={employeeQueue.rows} />
          ) : null}
          {companyQueue.rows.length > 0 ? (
            <CompanyApplicationQueue rows={companyQueue.rows} />
          ) : null}
        </div>
      )}
    </div>
  );
}
