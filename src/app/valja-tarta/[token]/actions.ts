"use server";

import { revalidatePath } from "next/cache";

import { isProductAllowedInCity } from "@/lib/cake-selection/products";
import { createAdminClient } from "@/lib/supabase/admin";

export type SelectCakeResult =
  | { ok: true; productName: string }
  | { ok: false; error: string };

export async function selectCakeForOrder(
  token: string,
  productId: string,
): Promise<SelectCakeResult> {
  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id, gift_type, cake_selection_status, selection_deadline, product_id,
      companies:company_id ( city, bakery_id )
    `,
    )
    .eq("selection_token", token)
    .maybeSingle();

  if (error || !order) {
    return { ok: false, error: "Beställningen hittades inte." };
  }
  if (order.gift_type !== "cake") {
    return { ok: false, error: "Den här beställningen gäller inte tårta." };
  }
  if (order.product_id && order.cake_selection_status === "customer") {
    return { ok: false, error: "Tårtan är redan vald." };
  }

  const company = order.companies as { city: string; bakery_id: string } | null;
  if (!company?.city?.trim()) {
    return { ok: false, error: "Företaget saknar stad." };
  }

  const allowed = await isProductAllowedInCity(
    company.city,
    productId,
    company.bakery_id ?? null,
  );
  if (!allowed) {
    return { ok: false, error: "Ogiltigt tårtval." };
  }

  const { data: product, error: prodErr } = await supabase
    .from("products")
    .select("id, name, is_active")
    .eq("id", productId)
    .maybeSingle();

  if (prodErr || !product || !product.is_active) {
    return { ok: false, error: "Ogiltigt tårtval." };
  }

  const { error: updErr } = await supabase
    .from("orders")
    .update({
      product_id: productId,
      cake_selection_status: "customer",
      selected_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updErr) {
    return { ok: false, error: updErr.message };
  }

  revalidatePath(`/valja-tarta/${token}`);
  return { ok: true, productName: product.name };
}
