import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { ExcelImportForm } from "@/app/admin/anstallda/excel-import-form";
import { NewEmployeeForm } from "@/app/admin/anstallda/new-employee-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

import { ImportApplicationExcelButton } from "./import-application-excel-button";
import { SendPortalInviteButton } from "./send-portal-invite-button";
import { SendWelcomeButton } from "./send-welcome-button";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function AktiveraForetagPage({ params }: Props) {
  const supabase = createClient();

  const [{ data: company }, { data: employees }, { data: application }] =
    await Promise.all([
      supabase
        .from("companies")
        .select("id, name, contact_email, welcome_email_sent_at, portal_invite_sent_at")
        .eq("id", params.id)
        .maybeSingle(),
      supabase
        .from("employees")
        .select("id, first_name, last_name, birthday, is_active")
        .eq("company_id", params.id)
        .order("last_name")
        .order("first_name"),
      supabase
        .from("company_applications")
        .select("employees_import_storage_path")
        .eq("created_company_id", params.id)
        .not("employees_import_storage_path", "is", null)
        .maybeSingle(),
    ]);

  if (!company) notFound();

  const employeeCount = employees?.length ?? 0;
  const welcomeSent = Boolean(company.welcome_email_sent_at);
  const inviteSent = Boolean(company.portal_invite_sent_at);
  const hasPendingExcel = Boolean(
    application?.employees_import_storage_path?.trim(),
  );
  const companyOption = [{ id: company.id, name: company.name }];

  return (
    <div>
      <PageHeader
        title={`Aktivera: ${company.name}`}
        description="Lägg in anställda och skicka välkomstmejl när allt stämmer."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Företag", href: "/admin/foretag" },
          { label: company.name, href: `/admin/foretag/${company.id}` },
          { label: "Aktivera" },
        ]}
        action={
          <Link href={`/admin/foretag/${company.id}`}>
            <Button variant="secondary">Företagsdetaljer</Button>
          </Link>
        }
      />

      <div className="mb-8 max-w-3xl space-y-4">
        {hasPendingExcel ? (
          <ImportApplicationExcelButton companyId={company.id} />
        ) : null}
        <SendWelcomeButton
          companyId={company.id}
          contactEmail={company.contact_email}
          employeeCount={employeeCount}
          welcomeAlreadySent={welcomeSent}
        />
        <SendPortalInviteButton
          companyId={company.id}
          contactEmail={company.contact_email}
          employeeCount={employeeCount}
          inviteAlreadySent={inviteSent}
        />
      </div>

      <div className="mb-8 grid max-w-5xl gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold text-slate-900">
            Lägg till anställd
          </h2>
          <NewEmployeeForm
            companies={companyOption}
            lockCompanyId={company.id}
          />
        </Card>
        <Card>
          <ExcelImportForm
            companies={companyOption}
            lockCompanyId={company.id}
          />
        </Card>
      </div>

      <section className="max-w-5xl">
        <h2 className="font-display text-xl text-slate-900">
          Registrerade anställda ({employeeCount})
        </h2>
        {employeeCount === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            Inga anställda ännu — lägg till manuellt eller importera Excel ovan.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-candy-100 bg-white">
            <Table>
              <THead>
                <TR>
                  <TH>Namn</TH>
                  <TH>Födelsedag</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {employees!.map((e) => (
                  <TR key={e.id}>
                    <TD>
                      {e.first_name} {e.last_name}
                    </TD>
                    <TD>{formatDate(e.birthday)}</TD>
                    <TD>
                      <Badge tone={e.is_active ? "success" : "neutral"}>
                        {e.is_active ? "Aktiv" : "Pausad"}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )}
        <p className="mt-4 text-sm text-slate-500">
          <Link
            href={`/admin/anstallda?company=${company.id}`}
            className="text-candy-600 hover:underline"
          >
            Hantera alla fält för anställda
          </Link>
        </p>
      </section>
    </div>
  );
}
