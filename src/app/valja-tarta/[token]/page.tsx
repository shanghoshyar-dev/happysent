import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandLogo } from "@/components/marketing/brand-logo";
import { formatDeadlineSv } from "@/lib/cake-selection/deadline";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

import { CakeSelectionForm } from "./cake-selection-form";

export const dynamic = "force-dynamic";

interface Props {
  params: { token: string };
}

export default async function ValjaTartaPage({ params }: Props) {
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      id, delivery_date, gift_type, cake_selection_status, selection_deadline, product_id,
      employees:employee_id ( first_name, last_name ),
      companies:company_id ( name, bakery_id ),
      products:product_id ( name )
    `,
    )
    .eq("selection_token", params.token)
    .maybeSingle();

  if (!order || order.gift_type !== "cake") {
    notFound();
  }

  const company = order.companies as { name: string; bakery_id: string } | null;
  const emp = order.employees as
    | { first_name: string; last_name: string }
    | null;
  const chosen = order.products as { name: string } | null;

  const { data: products } = await supabase
    .from("products")
    .select("id, name, dietary_notes")
    .eq("bakery_id", company?.bakery_id ?? "")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (!products?.length) {
    return (
      <main className="min-h-screen bg-cream px-6 py-12">
        <div className="mx-auto max-w-lg text-center">
          <BrandLogo className="justify-center" />
          <p className="mt-6 text-slate-600">
            Sortimentet är inte konfigurerat än. Kontakta HappySent på{" "}
            <a href="mailto:info@happysent.com" className="text-coral-600">
              info@happysent.com
            </a>
            .
          </p>
        </div>
      </main>
    );
  }

  const deadline = order.selection_deadline
    ? formatDeadlineSv(order.selection_deadline)
    : null;

  return (
    <main className="min-h-screen bg-cream px-6 py-12">
      <div className="mx-auto max-w-lg">
        <BrandLogo />
        <h1 className="mt-8 font-display text-3xl text-slate-900">
          Välj tårta
        </h1>
        <p className="mt-2 text-slate-600">
          {emp ? (
            <>
              <strong>
                {emp.first_name} {emp.last_name}
              </strong>{" "}
              fyller år — leverans{" "}
              <strong>{formatDate(order.delivery_date)}</strong>.
            </>
          ) : null}{" "}
          {company ? <> ({company.name})</> : null}
        </p>
        {deadline ? (
          <p className="mt-2 text-sm text-slate-500">
            Välj senast <strong>{deadline}</strong>. Därefter väljer HappySent
            åt er utifrån ert företags storlek och tidigare val.
          </p>
        ) : null}
        <p className="mt-4">
          <a
            href="/marketing/tartkatalog.pdf"
            className="text-sm font-medium text-coral-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ladda ner tårtkatalog (PDF)
          </a>
        </p>
        <div className="mt-8">
          <CakeSelectionForm
            token={params.token}
            products={products.map((p) => ({
              id: p.id,
              name: p.name,
              dietaryNotes: p.dietary_notes,
            }))}
            alreadyChosen={chosen?.name ?? null}
          />
        </div>
        <p className="mt-8 text-center text-xs text-slate-400">
          <Link href="/" className="hover:text-candy-600">
            happysent.com
          </Link>
        </p>
      </div>
    </main>
  );
}
