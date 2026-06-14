import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import {
  resolveCakePriceForHeadcount,
  resolveFallbackCakePrice,
  totalCakeQuantity,
  type CakeOrderLine,
  type CakePriceRow,
} from "./cake-prices-data";

export interface ResolvedCakeOrderPrice {
  cakeName: string;
  lines: CakeOrderLine[];
  price: number;
  /** @deprecated First line size — use lines instead. */
  peopleCount: number;
  /** @deprecated Total cake count — use lines instead. */
  quantity: number;
}

type Client = SupabaseClient<Database>;

export async function loadCakePriceRows(
  supabase: Client,
): Promise<CakePriceRow[]> {
  const { data, error } = await supabase
    .from("cake_prices")
    .select("cake_name, people_count, price, is_default")
    .order("cake_name")
    .order("people_count");

  if (error) throw new Error(error.message);
  return data ?? [];
}

async function countActiveEmployees(
  supabase: Client,
  companyId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("employees")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (error) throw new Error(error.message);
  return Math.max(1, count ?? 1);
}

function toResolved(lineup: {
  cakeName: string;
  lines: CakeOrderLine[];
  price: number;
}): ResolvedCakeOrderPrice {
  return {
    cakeName: lineup.cakeName,
    lines: lineup.lines,
    price: lineup.price,
    peopleCount: lineup.lines[0]?.peopleCount ?? 0,
    quantity: totalCakeQuantity(lineup.lines),
  };
}

export async function resolveCakeOrderPrice(args: {
  supabase: Client;
  companyId: string;
  employeeCakeName: string | null;
  employeePeopleCount: number | null;
  priceRows?: CakePriceRow[];
}): Promise<ResolvedCakeOrderPrice> {
  const rows = args.priceRows ?? (await loadCakePriceRows(args.supabase));
  const headcount = await countActiveEmployees(args.supabase, args.companyId);

  if (args.employeeCakeName) {
    return toResolved(
      resolveCakePriceForHeadcount(rows, args.employeeCakeName, headcount),
    );
  }

  return toResolved(resolveFallbackCakePrice(rows, headcount));
}

export function parseEmployeeCakeFields(formData: FormData): {
  cake_name: string | null;
  people_count: number | null;
} {
  const cakeName = String(formData.get("cake_name") ?? "").trim();

  if (!cakeName) {
    return { cake_name: null, people_count: null };
  }

  return { cake_name: cakeName, people_count: null };
}

export async function validateEmployeeCakeFields(
  supabase: Client,
  cakeName: string | null,
  peopleCount: number | null,
): Promise<void> {
  if (!cakeName) {
    if (peopleCount != null) {
      throw new Error("Ogiltig tårttyp.");
    }
    return;
  }

  const { data, error } = await supabase
    .from("cake_prices")
    .select("id")
    .eq("cake_name", cakeName)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    throw new Error(`Ogiltig tårttyp: ${cakeName}`);
  }
}
