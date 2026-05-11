import "server-only";

import { createHash } from "crypto";

import { createAdminClient } from "@/lib/supabase/admin";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_HITS = 10;

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}

export class ContactRateLimitError extends Error {
  constructor() {
    super("För många förfrågningar. Vänta en stund och försök igen.");
    this.name = "ContactRateLimitError";
  }
}

/**
 * Sliding-ish fixed window per IP for anonymous contact forms.
 * Uses service role — table has no public policies.
 */
export async function assertContactRateLimit(clientIp: string): Promise<void> {
  const ip = clientIp.trim() || "unknown";
  const windowId = Math.floor(Date.now() / WINDOW_MS);
  const bucketKey = `contact:${hashIp(ip)}:${windowId}`;

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("contact_rate_limits")
    .select("hit_count")
    .eq("bucket_key", bucketKey)
    .maybeSingle();

  const next = (existing?.hit_count ?? 0) + 1;
  if (next > MAX_HITS) throw new ContactRateLimitError();

  const { error } = await supabase.from("contact_rate_limits").upsert(
    {
      bucket_key: bucketKey,
      window_start: new Date(windowId * WINDOW_MS).toISOString(),
      hit_count: next,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "bucket_key" },
  );

  if (error) {
    console.error("[rate-limit] upsert failed:", error.message);
  }
}
