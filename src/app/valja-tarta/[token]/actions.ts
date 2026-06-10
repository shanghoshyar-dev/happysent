"use server";

import { revalidatePath } from "next/cache";

import {
  applyProductToOrder,
  validateProductForCompany,
} from "@/lib/cake-selection/assign-product";
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
      id, gift_type, cake_selection_status, product_id,
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

  const product = await validateProductForCompany(
    company.city,
    productId,
    company.bakery_id ?? null,
  );
  if (!product) {
    return { ok: false, error: "Ogiltigt tårtval." };
  }

  await applyProductToOrder(order.id, product.id);

  revalidatePath(`/valja-tarta/${token}`);
  return { ok: true, productName: product.name };
}
