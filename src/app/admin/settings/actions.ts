"use server";

import { revalidatePath } from "next/cache";

import { invalidateAppSettingsCache } from "@/lib/app-settings";
import { createClient } from "@/lib/supabase/server";

function num(formData: FormData, key: string): number {
  const v = Number(String(formData.get(key) ?? ""));
  return Number.isFinite(v) ? v : NaN;
}

export async function saveAppSettings(formData: FormData) {
  const supabase = createClient();

  const admin_email_override_raw = String(
    formData.get("admin_email_override") ?? "",
  ).trim();
  const admin_email_override =
    admin_email_override_raw === "" ? null : admin_email_override_raw;

  const default_price_per_cake = num(formData, "default_price_per_cake");
  const cancellation_days_before_delivery = num(
    formData,
    "cancellation_days_before_delivery",
  );

  const delivery_window_start = String(
    formData.get("delivery_window_start") ?? "",
  ).trim();
  const delivery_window_end = String(
    formData.get("delivery_window_end") ?? "",
  ).trim();

  if (!delivery_window_start || !delivery_window_end) {
    throw new Error("Leveransfönstret måste ha start och slut.");
  }
  if (
    Number.isNaN(default_price_per_cake) ||
    default_price_per_cake < 0 ||
    Number.isNaN(cancellation_days_before_delivery) ||
    cancellation_days_before_delivery < 0
  ) {
    throw new Error("Ogiltiga numeriska värden.");
  }

  const { error } = await supabase
    .from("app_settings")
    .update({
      admin_email_override,
      default_price_per_cake,
      delivery_window_start,
      delivery_window_end,
      cancellation_days_before_delivery,
    })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  invalidateAppSettingsCache();
  revalidatePath("/admin/settings");
}
