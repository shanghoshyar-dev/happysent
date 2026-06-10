/**
 * Lägg in katalogens 9 tårtor för varje bageri i databasen.
 * Kör: npx tsx supabase/scripts/seed-catalog-all-bakeries.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const CATALOG = [
  { name: "HappySent Tårta", dietaryNotes: null, sortOrder: 1 },
  { name: "Budapestårta", dietaryNotes: null, sortOrder: 2 },
  { name: "Jordgubbstårta", dietaryNotes: "Nötfri", sortOrder: 3 },
  { name: "Chokladtrippel", dietaryNotes: "Glutenfri", sortOrder: 4 },
  { name: "Hallontårta", dietaryNotes: null, sortOrder: 5 },
  { name: "Princesstårta", dietaryNotes: null, sortOrder: 6 },
  { name: "Schwarzwaldtårta", dietaryNotes: null, sortOrder: 7 },
  { name: "Lyxprincesstårta", dietaryNotes: null, sortOrder: 8 },
  { name: "Jordgubb & rabarbertårta", dietaryNotes: "Nötfri", sortOrder: 9 },
] as const;

function uniqueDbName(baseName: string, bakeryId: string): string {
  return `${baseName}\u200B${bakeryId.slice(0, 8)}`;
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Saknar NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY i .env.local");
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: bakeries, error: bakeryErr } = await supabase
    .from("bakeries")
    .select("id, name, city")
    .order("name");

  if (bakeryErr) throw new Error(bakeryErr.message);
  if (!bakeries?.length) {
    console.log("Inga bagerier hittades.");
    return;
  }

  console.log(`Hittade ${bakeries.length} bageri(er):`);
  for (const b of bakeries) {
    console.log(`  - ${b.name} (${b.city})`);
  }

  let inserted = 0;
  let updated = 0;

  for (const bakery of bakeries) {
    for (const cake of CATALOG) {
      const dbName = uniqueDbName(cake.name, bakery.id);

      const { data: existingByBakery } = await supabase
        .from("products")
        .select("id, name")
        .eq("bakery_id", bakery.id)
        .in("name", [cake.name, dbName])
        .maybeSingle();

      if (existingByBakery) {
        const { error } = await supabase
          .from("products")
          .update({
            name: dbName,
            dietary_notes: cake.dietaryNotes,
            sort_order: cake.sortOrder,
            is_active: true,
          })
          .eq("id", existingByBakery.id);
        if (error) throw new Error(`${bakery.name} / ${cake.name}: ${error.message}`);
        updated++;
        continue;
      }

      let { error: insertErr } = await supabase.from("products").insert({
        name: cake.name,
        bakery_id: bakery.id,
        dietary_notes: cake.dietaryNotes,
        sort_order: cake.sortOrder,
        is_active: true,
      });

      if (insertErr?.message.includes("products_name_key")) {
        ({ error: insertErr } = await supabase.from("products").insert({
          name: dbName,
          bakery_id: bakery.id,
          dietary_notes: cake.dietaryNotes,
          sort_order: cake.sortOrder,
          is_active: true,
        }));
      }

      if (insertErr) {
        throw new Error(`${bakery.name} / ${cake.name}: ${insertErr.message}`);
      }
      inserted++;
    }
  }

  console.log(`Klart: ${inserted} nya produkter, ${updated} uppdaterade.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
