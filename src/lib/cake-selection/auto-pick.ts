import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { validateProductForCompany } from "./assign-product";
import { displayProductName } from "./product-name";
import { getSelectableProductsForCity } from "./products";

export type CakeSelectionStatus = "pending" | "customer" | "auto" | "default";

interface PickContext {
  companyId: string;
  city: string;
  bakeryId: string | null;
  numberOfPeople: number;
  defaultProductId: string | null;
  employeePreferredProductId: string | null;
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

async function loadCityProducts(
  city: string,
  bakeryId: string | null,
): Promise<ProductRow[]> {
  const products = await getSelectableProductsForCity(city, bakeryId);
  return products.map((p) => ({
    id: p.id,
    min_people: p.min_people,
    max_people: p.max_people,
    sort_order: p.sort_order,
  }));
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
  const products = await loadCityProducts(ctx.city, ctx.bakeryId);
  if (products.length === 0) {
    throw new Error("Staden saknar aktiva produkter i sortimentet.");
  }

  const activeIds = new Set(products.map((p) => p.id));

  if (
    ctx.employeePreferredProductId &&
    activeIds.has(ctx.employeePreferredProductId)
  ) {
    return { productId: ctx.employeePreferredProductId, status: "customer" };
  }

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
      employees:employee_id ( number_of_people, preferred_product_id ),
      companies:company_id ( default_product_id, bakery_id, city )
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
    city: string;
  } | null;
  const emp = order.employees as {
    number_of_people: number;
    preferred_product_id: string | null;
  } | null;
  if (!company?.city?.trim()) return false;

  const { productId, status } = await pickProductForOrder({
    companyId: order.company_id,
    city: company.city,
    bakeryId: company.bakery_id,
    numberOfPeople: emp?.number_of_people ?? 8,
    defaultProductId: company.default_product_id,
    employeePreferredProductId: emp?.preferred_product_id ?? null,
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
  return product?.name ? displayProductName(product.name) : null;
}

/** Applicera anställds favorittårta direkt vid orderskapande. */
export async function applyEmployeePreferredToOrder(
  orderId: string,
  employeeId: string,
  companyCity: string,
  bakeryId: string | null,
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data: emp } = await supabase
    .from("employees")
    .select("preferred_product_id, gift_type")
    .eq("id", employeeId)
    .maybeSingle();

  if (!emp?.preferred_product_id || emp.gift_type !== "cake") return false;

  const product = await validateProductForCompany(
    companyCity,
    emp.preferred_product_id,
    bakeryId,
  );
  if (!product) return false;

  const { error: updErr } = await supabase
    .from("orders")
    .update({
      product_id: product.id,
      cake_selection_status: "customer",
      selected_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updErr) throw new Error(updErr.message);
  return true;
}
