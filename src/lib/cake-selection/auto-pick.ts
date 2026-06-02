import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type CakeSelectionStatus = "pending" | "customer" | "auto" | "default";

interface PickContext {
  companyId: string;
  bakeryId: string;
  numberOfPeople: number;
  defaultProductId: string | null;
}

interface ProductRow {
  id: string;
  min_people: number | null;
  max_people: number | null;
  sort_order: number;
}

function fitsPeople(p: ProductRow, n: number): boolean {
  if (p.min_people != null && n < p.min_people) return false;
  if (p.max_people != null && n > p.max_people) return false;
  return true;
}

async function loadBakeryProducts(bakeryId: string): Promise<ProductRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, min_people, max_people, sort_order")
    .eq("bakery_id", bakeryId)
    .eq("is_active", true)
    .order("sort_order")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function lastProductForCompany(companyId: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("product_id")
    .eq("company_id", companyId)
    .not("product_id", "is", null)
    .order("delivery_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.product_id ?? null;
}

export async function pickProductForOrder(
  ctx: PickContext,
): Promise<{ productId: string; status: CakeSelectionStatus }> {
  const products = await loadBakeryProducts(ctx.bakeryId);
  if (products.length === 0) {
    throw new Error("Bageriet saknar aktiva produkter i sortimentet.");
  }

  const activeIds = new Set(products.map((p) => p.id));

  if (ctx.defaultProductId && activeIds.has(ctx.defaultProductId)) {
    return { productId: ctx.defaultProductId, status: "default" };
  }

  const lastId = await lastProductForCompany(ctx.companyId);
  if (lastId && activeIds.has(lastId)) {
    return { productId: lastId, status: "auto" };
  }

  const bySize = products.find((p) => fitsPeople(p, ctx.numberOfPeople));
  if (bySize) {
    return { productId: bySize.id, status: "auto" };
  }

  return { productId: products[0].id, status: "auto" };
}

export async function applyAutoPickToOrder(orderId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id, company_id, product_id, cake_selection_status, gift_type,
      employees:employee_id ( number_of_people ),
      companies:company_id ( default_product_id, bakery_id )
    `,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) return false;
  if (order.gift_type !== "cake") return false;
  if (order.product_id) return false;
  if (order.cake_selection_status !== "pending") return false;

  const company = order.companies as {
    default_product_id: string | null;
    bakery_id: string;
  } | null;
  const emp = order.employees as { number_of_people: number } | null;
  if (!company?.bakery_id) return false;

  const { productId, status } = await pickProductForOrder({
    companyId: order.company_id,
    bakeryId: company.bakery_id,
    numberOfPeople: emp?.number_of_people ?? 8,
    defaultProductId: company.default_product_id,
  });

  const { error: updErr } = await supabase
    .from("orders")
    .update({
      product_id: productId,
      cake_selection_status: status,
      selected_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updErr) throw new Error(updErr.message);
  return true;
}

export async function getOrderProductName(orderId: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("product_id, products:product_id ( name )")
    .eq("id", orderId)
    .maybeSingle();
  if (!data?.product_id) return null;
  const product = data.products as { name: string } | null;
  return product?.name ?? null;
}
