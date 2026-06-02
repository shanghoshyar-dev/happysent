import "server-only";

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

/** Jämför stad utan skilja på versaler eller å/ä/ö (Malmö = Malmo). */
function cityKey(city: string): string {
  return city
    .trim()
    .toLocaleLowerCase("sv-SE")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

async function bakeryIdsInCity(city: string): Promise<string[]> {
  const supabase = createAdminClient();
  const key = cityKey(city);
  const { data, error } = await supabase.from("bakeries").select("id, city");
  if (error) throw new Error(error.message);
  return (data ?? [])
    .filter((b) => cityKey(b.city) === key)
    .map((b) => b.id);
}

function dedupeByName(
  products: SelectableProduct[],
  preferredBakeryId: string | null,
): SelectableProduct[] {
  const byName = new Map<string, SelectableProduct>();
  for (const p of products) {
    const key = p.name.trim().toLocaleLowerCase("sv-SE");
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, p);
      continue;
    }
    const preferNew =
      preferredBakeryId &&
      p.bakery_id === preferredBakeryId &&
      existing.bakery_id !== preferredBakeryId;
    const preferExisting =
      preferredBakeryId &&
      existing.bakery_id === preferredBakeryId &&
      p.bakery_id !== preferredBakeryId;
    if (preferNew) {
      byName.set(key, p);
    } else if (!preferExisting && p.sort_order < existing.sort_order) {
      byName.set(key, p);
    }
  }
  return [...byName.values()].sort(
    (a, b) =>
      a.sort_order - b.sort_order ||
      a.name.localeCompare(b.name, "sv-SE"),
  );
}

/** Aktiva tårtor för företagets stad — HR ser inget bageri, bara sortimentet. */
export async function getSelectableProductsForCity(
  city: string,
  preferredBakeryId: string | null,
): Promise<SelectableProduct[]> {
  const trimmed = city.trim();
  if (!trimmed) return [];

  const bakeryIds = await bakeryIdsInCity(trimmed);
  if (bakeryIds.length === 0) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, dietary_notes, bakery_id, sort_order, min_people, max_people",
    )
    .in("bakery_id", bakeryIds)
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) throw new Error(error.message);
  return dedupeByName(data ?? [], preferredBakeryId);
}

export async function isProductAllowedInCity(
  city: string,
  productId: string,
  preferredBakeryId: string | null,
): Promise<boolean> {
  const allowed = await getSelectableProductsForCity(city, preferredBakeryId);
  return allowed.some((p) => p.id === productId);
}
