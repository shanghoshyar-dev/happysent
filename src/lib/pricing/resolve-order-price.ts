import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import {
  resolveFallbackCakePrice,
  resolvePriceFromRows,
  type CakePriceRow,
} from "./cake-prices-data";

export interface ResolvedCakeOrderPrice {
  cakeName: string;
  peopleCount: number;
  price: number;
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

export async function resolveCakeOrderPrice(args: {
  supabase: Client;
  companyId: string;
  employeeCakeName: string | null;
  employeePeopleCount: number | null;
  priceRows?: CakePriceRow[];
}): Promise<ResolvedCakeOrderPrice> {
  const rows = args.priceRows ?? (await loadCakePriceRows(args.supabase));

  if (args.employeeCakeName && args.employeePeopleCount) {
    return {
      cakeName: args.employeeCakeName,
      peopleCount: args.employeePeopleCount,
      price: resolvePriceFromRows(
        rows,
        args.employeeCakeName,
        args.employeePeopleCount,
      ),
    };
  }

  const { count, error: countErr } = await args.supabase
    .from("employees")
    .select("id", { count: "exact", head: true })
    .eq("company_id", args.companyId)
    .eq("is_active", true);

  if (countErr) throw new Error(countErr.message);

  return resolveFallbackCakePrice(rows, count ?? 1);
}

export function parseEmployeeCakeFields(formData: FormData): {
  cake_name: string | null;
  people_count: number | null;
} {
  const cakeName = String(formData.get("cake_name") ?? "").trim();
  const peopleRaw = String(formData.get("people_count") ?? "").trim();

  if (!cakeName && !peopleRaw) {
    return { cake_name: null, people_count: null };
  }

  if (!cakeName || !peopleRaw) {
    throw new Error("Välj både tårttyp och tårtstorlek, eller lämna båda tomma.");
  }

  const peopleCount = Number(peopleRaw);
  if (!Number.isInteger(peopleCount) || peopleCount < 1) {
    throw new Error("Ogiltig tårtstorlek.");
  }

  return { cake_name: cakeName, people_count: peopleCount };
}

export async function validateEmployeeCakeFields(
  supabase: Client,
  cakeName: string | null,
  peopleCount: number | null,
): Promise<void> {
  if (!cakeName && peopleCount == null) return;
  if (!cakeName || peopleCount == null) {
    throw new Error("Välj både tårttyp och tårtstorlek, eller lämna båda tomma.");
  }

  const { data, error } = await supabase
    .from("cake_prices")
    .select("id")
    .eq("cake_name", cakeName)
    .eq("people_count", peopleCount)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    throw new Error(`Ogiltig tårtkombination: ${cakeName}, ${peopleCount} pers.`);
  }
}
