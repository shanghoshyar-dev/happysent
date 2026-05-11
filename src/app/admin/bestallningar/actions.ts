"use server";

import { revalidatePath } from "next/cache";

import { getAppSettings } from "@/lib/app-settings";
import {
  diffInDays,
  parseDateString,
  todayInStockholm,
} from "@/lib/holidays/swedish";
import { createClient } from "@/lib/supabase/server";

export interface CancelOrderResult {
  ok: boolean;
  error?: string;
}

/**
 * Cancel an order if delivery is more than the configured buffer away.
 * Surfaces a clear error message back to the UI otherwise.
 */
export async function cancelOrder(id: string): Promise<CancelOrderResult> {
  const settings = await getAppSettings();
  const cancellationDays = settings.cancellation_days_before_delivery;
  const supabase = createClient();

  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("id, delivery_date, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!order) return { ok: false, error: "Beställningen hittades inte." };
  if (order.status === "cancelled") {
    return { ok: false, error: "Beställningen är redan avbruten." };
  }
  if (order.status === "delivered" || order.status === "invoiced") {
    return {
      ok: false,
      error: "Beställningar som är levererade eller fakturerade kan inte avbokas.",
    };
  }

  const delivery = parseDateString(order.delivery_date);
  const today = todayInStockholm();
  const daysToDelivery = diffInDays(delivery, today);
  if (daysToDelivery < cancellationDays) {
    return {
      ok: false,
      error: `Avbokning ej möjlig – mindre än ${cancellationDays} dagar till leverans.`,
    };
  }

  const { error: updateErr } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (updateErr) return { ok: false, error: updateErr.message };

  revalidatePath("/admin/bestallningar");
  return { ok: true };
}
