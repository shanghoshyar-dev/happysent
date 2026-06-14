import "server-only";

import {
  deliveryOccasionsInYear,
  shouldProcessDelivery,
  type GiftType,
} from "@/lib/celebrations";
import { CAKE_SELECTION_AUTO_PICK_DAYS_BEFORE } from "@/lib/cake-selection/constants";
import { loadCakePriceRows } from "@/lib/pricing/resolve-order-price";
import { createAdminClient } from "@/lib/supabase/admin";
import { diffInDays } from "@/lib/holidays/swedish";
import type { CelebrationFrequency } from "@/types/database";

import {
  cronActionsForDay,
  processDeliverySlot,
  type CompanyJoin,
} from "./delivery-processing";

export interface DailyCheckResult {
  scannedEmployees: number;
  deliverySlotsChecked: number;
  ordersUpserted: number;
  remindersSent: number;
  remindersSkipped: number;
  errors: Array<{ employeeId: string; message: string }>;
}

/**
 * Run the daily reminder/order pipeline for `today` (UTC midnight, Stockholm calendar day).
 * Idempotent: re-running on the same day is a no-op (DB unique constraints + log lookups).
 */
export async function runDailyCheck(today: Date): Promise<DailyCheckResult> {
  const supabase = createAdminClient();
  const year = today.getUTCFullYear();

  const result: DailyCheckResult = {
    scannedEmployees: 0,
    deliverySlotsChecked: 0,
    ordersUpserted: 0,
    remindersSent: 0,
    remindersSkipped: 0,
    errors: [],
  };

  const { data: employees, error: empErr } = await supabase
    .from("employees")
    .select(
      `
      id, first_name, last_name, birthday, number_of_people, is_active, company_id,
      celebration_frequency, gift_type, cake_name, people_count,
      companies:company_id (
        id, name, address, city, contact_email, contact_phone, billing_email,
        price_per_flowers, status, offers_flowers, florist_id, bakery_id,
        bakeries:bakery_id ( id, name, email, catalog_pdf_path ),
        florists:florist_id ( id, name, email )
      )
    `,
    )
    .eq("is_active", true);

  if (empErr) {
    throw new Error(`Failed to load employees: ${empErr.message}`);
  }
  if (!employees) {
    return result;
  }

  const cakePriceRows = await loadCakePriceRows(supabase);

  for (const emp of employees) {
    result.scannedEmployees++;
    try {
      const company = (emp as unknown as { companies: CompanyJoin | null })
        .companies;
      if (!company || company.status !== "active") continue;

      const rule = {
        birthday: emp.birthday,
        celebration_frequency:
          (emp.celebration_frequency as CelebrationFrequency) ?? "every_year",
      };
      const giftType = (emp.gift_type as GiftType) ?? "cake";

      const deliveries = deliveryOccasionsInYear(rule, year);

      for (const delivery of deliveries) {
        if (!shouldProcessDelivery(rule, delivery)) continue;

        result.deliverySlotsChecked++;
        const daysAway = diffInDays(delivery.deliveryDate, today);

        if (
          ![14, CAKE_SELECTION_AUTO_PICK_DAYS_BEFORE, 7, 1, 0].includes(
            daysAway,
          )
        ) {
          continue;
        }

        const reminderTypes = cronActionsForDay(daysAway, giftType);
        const runAutoPick =
          giftType === "cake" &&
          (daysAway === CAKE_SELECTION_AUTO_PICK_DAYS_BEFORE || daysAway === 7);

        const slot = await processDeliverySlot({
          supabase,
          emp: {
            id: emp.id,
            first_name: emp.first_name,
            last_name: emp.last_name,
            birthday: emp.birthday,
            number_of_people: emp.number_of_people,
            is_active: emp.is_active,
            company_id: emp.company_id,
            celebration_frequency: rule.celebration_frequency,
            gift_type: giftType,
            cake_name: emp.cake_name,
            people_count: emp.people_count,
          },
          company,
          delivery,
          today,
          cakePriceRows,
          reminderTypes,
          runAutoPick,
          applyStatus: daysAway === 0 || daysAway === 7,
        });

        if (slot.orderCreated) result.ordersUpserted++;
        result.remindersSent += slot.remindersSent.length;
        result.remindersSkipped += slot.remindersSkipped.length;
      }
    } catch (err) {
      result.errors.push({
        employeeId: emp.id,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}

export {
  ensureOrder,
  reminderAlreadySent,
  processDeliverySlot,
} from "./delivery-processing";
export {
  catchUpReminderTypes,
  isCatchUpEligible,
  shouldAutoPickCake,
  cronActionsForDay,
} from "./catch-up-rules";
