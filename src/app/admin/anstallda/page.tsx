import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { getCakePricesForForms } from "@/lib/pricing/get-cake-prices-for-forms";
import { formatDate } from "@/lib/utils";

import { EmployeeRowActions } from "./employee-row-actions";
import { ExcelImportForm } from "./excel-import-form";
import { NewEmployeeForm } from "./new-employee-form";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { company?: string };
}

export default async function AnstalldaPage({ searchParams }: Props) {
  const supabase = createClient();
  const filterCompany = searchParams.company;

  const [{ data: companies }, cakePrices] = await Promise.all([
    supabase.from("companies").select("id, name").order("name"),
    getCakePricesForForms(),
  ]);

  let query = supabase
    .from("employees")
    .select(
      "id, first_name, last_name, birthday, number_of_people, is_active, company_id, companies:company_id ( name )",
    )
    .order("birthday");

  if (filterCompany) {
    query = query.eq("company_id", filterCompany);
  }

  const { data: employees } = await query;

  return (
    <div>
      <PageHeader
        title="Anställda"
        description={
          filterCompany
            ? `Visar anställda för valt företag.`
            : "Alla registrerade anställda hos era företag."
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Anställda" },
        ]}
      />

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold text-slate-900">
            Lägg till ny anställd
          </h2>
          <NewEmployeeForm
            companies={companies ?? []}
            cakePrices={cakePrices}
            defaultCompanyId={filterCompany}
          />
        </Card>
        <Card>
          <ExcelImportForm
            companies={companies ?? []}
            defaultCompanyId={filterCompany}
          />
        </Card>
      </div>

      {!employees || employees.length === 0 ? (
        <EmptyState
          title="Inga anställda ännu"
          description="Använd formuläret ovan för att lägga till någon."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Namn</TH>
              <TH>Företag</TH>
              <TH>Födelsedag</TH>
              <TH>Personer</TH>
              <TH>Status</TH>
              <TH className="text-right">Åtgärder</TH>
            </TR>
          </THead>
          <TBody>
            {employees.map((e) => {
              const companyName = (e.companies as { name: string } | null)
                ?.name;
              return (
                <TR key={e.id}>
                  <TD className="font-medium text-slate-900">
                    <Link
                      href={`/admin/anstallda/${e.id}`}
                      className="hover:underline"
                    >
                      {e.first_name} {e.last_name}
                    </Link>
                  </TD>
                  <TD>{companyName ?? "—"}</TD>
                  <TD>{formatDate(e.birthday)}</TD>
                  <TD>{e.number_of_people}</TD>
                  <TD>
                    <Badge tone={e.is_active ? "success" : "neutral"}>
                      {e.is_active ? "Aktiv" : "Pausad"}
                    </Badge>
                  </TD>
                  <TD>
                    <EmployeeRowActions id={e.id} isActive={e.is_active} />
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}
    </div>
  );
}
