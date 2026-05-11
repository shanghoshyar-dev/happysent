import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { getAppSettings } from "@/lib/app-settings";
import { createClient } from "@/lib/supabase/server";

import { createCompany } from "../actions";
import { CompanyForm } from "../company-form";

export const dynamic = "force-dynamic";

export default async function NyttForetagPage() {
  const supabase = createClient();
  const { data: bakeries } = await supabase
    .from("bakeries")
    .select("id, name, city")
    .order("name");

  if (!bakeries) notFound();

  const settings = await getAppSettings();

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
      <Card className="max-w-3xl">
        <CompanyForm
          bakeries={bakeries}
          action={createCompany}
          submitLabel="Spara företag"
          defaultPricePerCake={settings.default_price_per_cake}
        />
      </Card>
    </div>
  );
}
