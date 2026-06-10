import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { BakeryCatalogUpload } from "../bakery-catalog-upload";
import { deleteBakeryAndRedirect, updateBakery } from "../actions";
import { BakeryForm } from "../bakery-form";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function BakeryDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data: bakery } = await supabase
    .from("bakeries")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!bakery) notFound();

  const updateAction = updateBakery.bind(null, bakery.id);
  const deleteAction = deleteBakeryAndRedirect.bind(null, bakery.id);

  return (
    <div>
      <PageHeader
        title={bakery.name}
        description="Redigera kontaktuppgifter och leveransdetaljer."
        action={
          <Link href="/admin/bagerier">
            <Button variant="secondary">Tillbaka</Button>
          </Link>
        }
      />

      <Card className="max-w-3xl">
        <BakeryForm
          bakery={bakery}
          action={updateAction}
          submitLabel="Spara ändringar"
        />
      </Card>

      <Card className="mt-8 max-w-3xl">
        <BakeryCatalogUpload
          bakeryId={bakery.id}
          bakeryName={bakery.name}
          catalogPdfPath={bakery.catalog_pdf_path}
        />
      </Card>

      <div className="mt-8 max-w-3xl rounded-2xl border border-red-100 bg-red-50/50 p-6">
        <h3 className="font-semibold text-red-800">Farligt område</h3>
        <p className="mt-1 text-sm text-red-700">
          Bageriet kan bara tas bort om det inte längre används av något företag.
        </p>
        <form action={deleteAction} className="mt-4">
          <Button type="submit" variant="danger">
            Ta bort bageri
          </Button>
        </form>
      </div>
    </div>
  );
}
