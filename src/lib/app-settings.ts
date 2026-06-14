import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireEnv, optionalEnv } from "@/lib/env";

export type AppSettingsRow = {
  admin_email_override: string | null;
  delivery_window_start: string;
  delivery_window_end: string;
  cancellation_days_before_delivery: number;
};

const defaults: AppSettingsRow = {
  admin_email_override: null,
  delivery_window_start: "08:00",
  delivery_window_end: "11:00",
  cancellation_days_before_delivery: 10,
};

let cache: { row: AppSettingsRow; at: number } | null = null;
const TTL_MS = 30_000;

/** Operational settings from DB; merged with env fallback for admin email. */
export async function getAppSettings(): Promise<AppSettingsRow> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.row;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("app_settings")
    .select(
      "admin_email_override, delivery_window_start, delivery_window_end, cancellation_days_before_delivery",
    )
    .eq("id", 1)
    .maybeSingle();

  const row: AppSettingsRow = data
    ? {
        admin_email_override: data.admin_email_override,
        delivery_window_start: data.delivery_window_start,
        delivery_window_end: data.delivery_window_end,
        cancellation_days_before_delivery:
          data.cancellation_days_before_delivery,
      }
    : defaults;

  cache = { row, at: Date.now() };
  return row;
}

export function invalidateAppSettingsCache(): void {
  cache = null;
}

export function resolveAdminEmail(settings: AppSettingsRow): string {
  const override = settings.admin_email_override?.trim();
  if (override) return override;
  try {
    return requireEnv("ADMIN_EMAIL");
  } catch {
    return optionalEnv("ADMIN_EMAIL") ?? "";
  }
}

export function deliveryWindowLabel(settings: AppSettingsRow): string {
  return `${settings.delivery_window_start}–${settings.delivery_window_end}`;
}
