import "server-only";

import { citiesMatch } from "@/lib/cities/normalize";
import { createAdminClient } from "@/lib/supabase/admin";

export async function assertBakeryInCity(
  bakeryId: string,
  city: string,
): Promise<void> {
  const supabase = createAdminClient();
  const { data: bakery, error } = await supabase
    .from("bakeries")
    .select("city")
    .eq("id", bakeryId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!bakery?.city?.trim()) {
    throw new Error("Bageriet hittades inte.");
  }
  if (!citiesMatch(bakery.city, city)) {
    throw new Error("Valt bageri finns inte i företagets stad.");
  }
}

export async function assertFloristInCity(
  floristId: string,
  city: string,
): Promise<void> {
  const supabase = createAdminClient();
  const { data: florist, error } = await supabase
    .from("florists")
    .select("city")
    .eq("id", floristId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!florist?.city?.trim()) {
    throw new Error("Blomsterbutiken hittades inte.");
  }
  if (!citiesMatch(florist.city, city)) {
    throw new Error("Vald blomsterbutik finns inte i företagets stad.");
  }
}
