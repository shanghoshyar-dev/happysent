import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { fetchPendingApplicationById } from "@/lib/admin/pending-company-applications";
import { getAppSettings } from "@/lib/app-settings";
import { createClient } from "@/lib/supabase/server";

import { createCompany } from "../actions";
import { CreateCompanyForm } from "../create-company-form";
import type { CompanyFormProps } from "../company-form";

export const dynamic = "force-dynamic";

export default async function NyttForetagPage({
  searchParams,
}: {
  searchParams: { application?: string };
}) {
  const supabase = createClient();
  const [{ data: bakeries }, { data: florists }, { data: allProducts }] =
    await Promise.all([
    supabase.from("bakeries").select("id, name, city").order("name"),
    supabase.from("florists").select("id, name, city").order("name"),
    supabase.from("products").select("id, name, bakery_id").eq("is_active", true).order("name"),
  ]);

  if (!bakeries || !florists) notFound();

  const settings = await getAppSettings();

  const rawApplication =
    typeof searchParams.application === "string"
      ? searchParams.application.trim()
      : "";

  let applicationPrefill: CompanyFormProps["applicationPrefill"];

  if (rawApplication) {
    const app = await fetchPendingApplicationById(supabase, rawApplication);

    if (app) {
      applicationPrefill = {
        applicationId: app.id,
        companyName: app.company_name,
        contactEmail: app.contact_email,
        contactPhone: app.contact_phone,
        contactName: app.contact_name,
        message: app.message,
        hasEmployeesExcel: Boolean(app.employees_import_storage_path),
      };
    }
  }

  return (
    <div>
      <PageHeader
        title="Nytt företag"
        description="Lägg till ett företag och välj vilket bageri som ska leverera till dem."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Företag", href: "/admin/foretag" },
          { label: "Nytt företag" },
        ]}
      />

      {applicationPrefill ? (
        <div className="mb-4 max-w-3xl rounded-xl border border-candy-200 bg-cream-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">
            Förfrågan från webbplatsens kö
          </p>
          <p className="mt-1">
            Kontakt: {applicationPrefill.contactName} ·{" "}
            <a
              href={`mailto:${applicationPrefill.contactEmail}`}
              className="font-medium text-coral-600 hover:underline"
            >
              {applicationPrefill.contactEmail}
            </a>
            {applicationPrefill.contactPhone?.trim() ? (
              <>
                {" "}
                ·{" "}
                <a
                  href={`tel:${applicationPrefill.contactPhone.replace(/\s+/g, "")}`}
                  className="font-medium text-coral-600 hover:underline"
                >
                  {applicationPrefill.contactPhone}
                </a>
              </>
            ) : null}
          </p>
          {applicationPrefill.message?.trim() ? (
            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white/80 px-3 py-2 text-slate-600 ring-1 ring-candy-100/80">
              {applicationPrefill.message}
            </p>
          ) : null}
          <p className="mt-2 text-slate-600">
            Fyll i adress, stad och bageri nedan. Efter sparning kan du lägga in
            anställda och skicka välkomstmejl — inget mejl går till kunden förrän
            du gjort det.
            {applicationPrefill.hasEmployeesExcel ? (
              <>
                {" "}
                Bifogad Excel kan importeras på nästa steg.
              </>
            ) : null}
          </p>
        </div>
      ) : rawApplication ? (
        <div className="mb-4 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Förfrågan hittades inte eller är redan hanterad. Du kan ändå skapa
          ett företag manuellt.
        </div>
      ) : null}

      <Card className="max-w-3xl">
        <CreateCompanyForm
          bakeries={bakeries}
          florists={florists}
          bakeryProducts={(allProducts ?? []).map((p) => ({
            id: p.id,
            name: p.name,
            bakery_id: p.bakery_id,
          }))}
          saveAction={createCompany}
          submitLabel="Spara företag"
          defaultPricePerCake={settings.default_price_per_cake}
          applicationPrefill={applicationPrefill}
        />
      </Card>
    </div>
  );
}
