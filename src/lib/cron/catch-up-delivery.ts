import "server-only";

import {
  deliveryOccasionsInYear,
  shouldProcessDelivery,
  type GiftType,
} from "@/lib/celebrations";
import { diffInDays } from "@/lib/holidays/swedish";
import { loadCakePriceRows } from "@/lib/pricing/resolve-order-price";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CelebrationFrequency, ReminderType } from "@/types/database";
import {
  catchUpReminderTypes,
  shouldAutoPickCake,
} from "./catch-up-rules";
import {
  processDeliverySlot,
  reminderAlreadySent,
  type CompanyJoin,
  type EmployeeForDelivery,
} from "./delivery-processing";

export interface CatchUpResult {
  triggered: boolean;
  daysAway: number | null;
  orderId: string | null;
  emailsSent: ReminderType[];
  emailsSkipped: ReminderType[];
  warning: string | null;
}

const EMPLOYEE_SELECT = `
  id, first_name, last_name, birthday, number_of_people, is_active, company_id,
  celebration_frequency, gift_type, cake_name, people_count,
  companies:company_id (
    id, name, address, city, contact_email, contact_phone, billing_email,
    price_per_flowers, status, offers_flowers, florist_id, bakery_id,
    bakeries:bakery_id ( id, name, email, catalog_pdf_path ),
    florists:florist_id ( id, name, email )
  )
`;

/**
 * Catch up order creation and overdue reminders when an employee is added
 * with a delivery 0–13 days away. Idempotent if an order already exists.
 */
export async function catchUpEmployeeDelivery(
  employeeId: string,
): Promise<CatchUpResult> {
  const empty: CatchUpResult = {
    triggered: false,
    daysAway: null,
    orderId: null,
    emailsSent: [],
    emailsSkipped: [],
    warning: null,
  };

  try {
    const supabase = createAdminClient();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const { data: row, error: empErr } = await supabase
      .from("employees")
      .select(EMPLOYEE_SELECT)
      .eq("id", employeeId)
      .maybeSingle();

    if (empErr) {
      console.error("[catch-up] load employee failed:", empErr.message);
      return { ...empty, warning: empErr.message };
    }
    if (!row || !row.is_active) return empty;

    const company = (row as unknown as { companies: CompanyJoin | null })
      .companies;
    if (!company || company.status !== "active") return empty;

    const emp: EmployeeForDelivery = {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      birthday: row.birthday,
      number_of_people: row.number_of_people,
      is_active: row.is_active,
      company_id: row.company_id,
      celebration_frequency:
        (row.celebration_frequency as CelebrationFrequency) ?? "every_year",
      gift_type: (row.gift_type as GiftType) ?? "cake",
      cake_name: row.cake_name,
      people_count: row.people_count,
    };

    const year = today.getUTCFullYear();
    const rule = {
      birthday: emp.birthday,
      celebration_frequency: emp.celebration_frequency,
    };
    const deliveries = deliveryOccasionsInYear(rule, year);
    const delivery = deliveries.find((d) => shouldProcessDelivery(rule, d));
    if (!delivery) return empty;

    const daysAway = diffInDays(delivery.deliveryDate, today);
    if (daysAway < 0 || daysAway >= 14) return empty;

    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("employee_id", employeeId)
      .eq("delivery_date", delivery.deliveryIso)
      .maybeSingle();

    if (existingOrder) {
      return {
        ...empty,
        daysAway,
        orderId: existingOrder.id,
        warning: null,
      };
    }

    const giftType = emp.gift_type;
    const reminderTypes = catchUpReminderTypes(daysAway, giftType);
    const cakePriceRows = await loadCakePriceRows(supabase);

    const slot = await processDeliverySlot({
      supabase,
      emp,
      company,
      delivery,
      today,
      cakePriceRows,
      reminderTypes,
      runAutoPick: shouldAutoPickCake(daysAway),
      applyStatus: true,
    });

    return {
      triggered: true,
      daysAway,
      orderId: slot.orderId,
      emailsSent: slot.remindersSent,
      emailsSkipped: slot.remindersSkipped,
      warning: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[catch-up] failed for employee", employeeId, message);
    return { ...empty, warning: message };
  }
}

export {
  catchUpReminderTypes,
  isCatchUpEligible,
  shouldAutoPickCake,
} from "./catch-up-rules";
export { reminderAlreadySent } from "./delivery-processing";
