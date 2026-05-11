import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type Level = "info" | "warn" | "error";

/**
 * Persist a structured log row. Best-effort — if the logs table is missing
 * or the insert fails, we fall back to console so we never break the cron.
 */
export async function recordLog(
  level: Level,
  context: string,
  message: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("logs").insert({
      level,
      context,
      message,
      metadata: metadata ? (metadata as never) : null,
    });
    if (error) {
      console.error(`[logs] insert failed (${context}):`, error.message);
    }
  } catch (err) {
    console.error(`[logs] unexpected error (${context}):`, err);
  }
}
