import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { isProductAllowedInCity } from "./products";

export interface ValidatedProduct {
  id: string;
  name: string;
}

/** Verifierar att produkten är aktiv och tillåten i företagets stad. */
export async function validateProductForCompany(
  city: string,
  productId: string,
  bakeryId: string | null,
): Promise<ValidatedProduct | null> {
  const trimmedCity = city.trim();
  if (!trimmedCity || !productId.trim()) return null;

  const allowed = await isProductAllowedInCity(
    trimmedCity,
    productId,
    bakeryId,
  );
  if (!allowed) return null;

  const supabase = createAdminClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, is_active")
    .eq("id", productId)
    .maybeSingle();

  if (error || !product?.is_active) return null;
  return { id: product.id, name: product.name };
}

/** Uppdaterar order med produkt om valt (status customer). */
export async function applyProductToOrder(
  orderId: string,
  productId: string,
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({
      product_id: productId,
      cake_selection_status: "customer",
      selected_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}
