import "server-only";

import { citiesMatch } from "@/lib/cities/normalize";
import { createAdminClient } from "@/lib/supabase/admin";

export interface SelectableProduct {
  id: string;
  name: string;
  dietary_notes: string | null;
  bakery_id: string | null;
  sort_order: number;
  min_people: number | null;
  max_people: number | null;
}

/** Aktiva tårtor för företagets kopplade bageri (måste ligga i samma stad). */
export async function getSelectableProductsForCity(
  city: string,
  bakeryId: string | null,
): Promise<SelectableProduct[]> {
  const trimmedCity = city.trim();
  if (!trimmedCity || !bakeryId) return [];

  const supabase = createAdminClient();
  const { data: bakery, error: bakeryErr } = await supabase
    .from("bakeries")
    .select("id, city")
    .eq("id", bakeryId)
    .maybeSingle();

  if (bakeryErr) throw new Error(bakeryErr.message);
  if (!bakery || !citiesMatch(bakery.city, trimmedCity)) return [];

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, dietary_notes, bakery_id, sort_order, min_people, max_people",
    )
    .eq("bakery_id", bakeryId)
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function isProductAllowedInCity(
  city: string,
  productId: string,
  bakeryId: string | null,
): Promise<boolean> {
  const allowed = await getSelectableProductsForCity(city, bakeryId);
  return allowed.some((p) => p.id === productId);
}

export async function getBakeryCatalogPdfPath(
  bakeryId: string | null,
): Promise<string | null> {
  if (!bakeryId) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bakeries")
    .select("catalog_pdf_path")
    .eq("id", bakeryId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.catalog_pdf_path ?? null;
}
