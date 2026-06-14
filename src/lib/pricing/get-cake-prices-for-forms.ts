import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { loadCakePriceRows } from "./resolve-order-price";

export async function getCakePricesForForms() {
  const supabase = createAdminClient();
  return loadCakePriceRows(supabase);
}
