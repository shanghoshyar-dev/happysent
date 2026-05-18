import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { deleteFloristAndRedirect, updateFlorist } from "../../bagerier/florist-actions";
import { FloristForm } from "../../bagerier/florist-form";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function FloristDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data: florist } = await supabase
    .from("florists")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!florist) notFound();

  const updateAction = updateFlorist.bind(null, florist.id);
  const deleteAction = deleteFloristAndRedirect.bind(null, florist.id);

  return (
    <div>
      <PageHeader
        title={florist.name}
        description="Redigera kontaktuppgifter för blomsterleverantören."
        action={
          <Link href="/admin/bagerier">
            <Button variant="secondary">Tillbaka</Button>
          </Link>
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Bagerier / florist", href: "/admin/bagerier" },
          { label: florist.name },
        ]}
      />

      <Card className="max-w-3xl">
        <FloristForm florist={florist} action={updateAction} submitLabel="Spara ändringar" />
      </Card>

      <div className="mt-8 max-w-3xl rounded-2xl border border-red-100 bg-red-50/50 p-6">
        <h3 className="font-semibold text-red-800">Farligt område</h3>
        <p className="mt-1 text-sm text-red-700">
          Blomsterbutiken kan bara tas bort om inget företag med leverans av blommor
          är kopplat till den.
        </p>
        <form action={deleteAction} className="mt-4">
          <Button type="submit" variant="danger">
            Ta bort blomsterbutik
          </Button>
        </form>
      </div>
    </div>
  );
}
