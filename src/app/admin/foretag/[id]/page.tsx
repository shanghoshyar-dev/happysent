import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { deleteCompany, updateCompany } from "../actions";
import { CompanyForm } from "../company-form";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function ForetagDetailPage({ params }: Props) {
  const supabase = createClient();
  const [{ data: company }, { data: bakeries }, { data: florists }, { data: employees }] =
    await Promise.all([
      supabase.from("companies").select("*").eq("id", params.id).maybeSingle(),
      supabase.from("bakeries").select("id, name, city").order("name"),
      supabase.from("florists").select("id, name, city").order("name"),
      supabase
        .from("employees")
        .select("id, first_name, last_name, birthday, is_active")
        .eq("company_id", params.id)
        .order("birthday"),
    ]);

  if (!company || !bakeries || !florists) notFound();

  const { data: bakeryProducts } = await supabase
    .from("products")
    .select("id, name")
    .eq("bakery_id", company.bakery_id)
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  const updateAction = updateCompany.bind(null, company.id);
  const deleteAction = deleteCompany.bind(null, company.id);

  return (
    <div>
      <PageHeader
        title={company.name}
        description="Redigera företagets uppgifter eller ta bort dem helt."
        action={
          <Link href="/admin/foretag">
            <Button variant="secondary">Tillbaka</Button>
          </Link>
        }
      />

      <Card className="max-w-3xl">
        <CompanyForm
          bakeries={bakeries}
          florists={florists}
          bakeryProducts={bakeryProducts ?? []}
          company={company}
          action={updateAction}
          submitLabel="Spara ändringar"
        />
      </Card>

      <div className="mt-8 max-w-3xl rounded-2xl border border-red-100 bg-red-50/50 p-6">
        <h3 className="font-semibold text-red-800">Farligt område</h3>
        <p className="mt-1 text-sm text-red-700">
          Om du tar bort företaget försvinner alla anställda, beställningar och
          fakturor som hör till.
        </p>
        <form action={deleteAction} className="mt-4">
          <Button type="submit" variant="danger">
            Ta bort företag
          </Button>
        </form>
      </div>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-display text-xl text-slate-900">Anställda</h2>
        <p className="mt-1 text-sm text-slate-500">
          {employees?.length ?? 0} registrerade
          {" · "}
          <Link
            href={`/admin/anstallda?company=${company.id}`}
            className="text-candy-600 hover:underline"
          >
            Hantera
          </Link>
        </p>
      </section>
    </div>
  );
}
