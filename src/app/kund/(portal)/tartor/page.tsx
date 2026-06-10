import { redirect } from "next/navigation";

import { getCompanySession } from "@/lib/auth/session";
import { getSelectableProductsForCity } from "@/lib/cake-selection/products";
import { createClient } from "@/lib/supabase/server";

import { CakeCatalogClient } from "./cake-catalog-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tårtor – kundportal",
};

export default async function KundTartorPage() {
  const session = await getCompanySession();
  if (!session) redirect("/kund/login");

  const supabase = createClient();
  const [{ data: company }, { data: employees }] = await Promise.all([
    supabase
      .from("companies")
      .select("city, bakery_id")
      .eq("id", session.companyId)
      .maybeSingle(),
    supabase
      .from("employees")
      .select("id, first_name, last_name, preferred_product_id")
      .eq("company_id", session.companyId)
      .eq("is_active", true)
      .eq("gift_type", "cake")
      .order("last_name")
      .order("first_name"),
  ]);

  const products = company?.city
    ? await getSelectableProductsForCity(company.city, company.bakery_id)
    : [];

  return (
    <div>
      <h1 className="font-display text-3xl text-slate-900">Tårtor</h1>
      <p className="mt-2 text-slate-600">
        Sortiment från ert bageri — välj favorittårta per anställd.
      </p>
      <div className="mt-8">
        <CakeCatalogClient
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            dietaryNotes: p.dietary_notes,
          }))}
          employees={(employees ?? []).map((e) => ({
            id: e.id,
            firstName: e.first_name,
            lastName: e.last_name,
            preferredProductId: e.preferred_product_id,
          }))}
        />
      </div>
    </div>
  );
}
