import "server-only";

import {
  deliveryOccasionsInYear,
  shouldProcessDelivery,
  type GiftType,
} from "@/lib/celebrations";
import { createAdminClient } from "@/lib/supabase/admin";
import { diffInDays } from "@/lib/holidays/swedish";
import {
  send14DayCompany,
  send1DayCompany,
  send7DayBakery,
  send7DayCompany,
  send7DayFlorist,
  sendDayOfCompany,
} from "@/lib/resend/templates";
import type { CelebrationFrequency, ReminderType } from "@/types/database";

interface ReminderAction {
  type: ReminderType;
  send: () => Promise<unknown>;
}

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
      celebration_frequency, gift_type,
      companies:company_id (
        id, name, address, city, contact_email, contact_phone, billing_email,
        price_per_cake, price_per_flowers, status, offers_flowers, florist_id,
        bakeries:bakery_id ( id, name, email ),
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
        const deliveryIso = delivery.deliveryIso;
        const daysAway = diffInDays(delivery.deliveryDate, today);

        if (![14, 7, 1, 0].includes(daysAway)) continue;

        if (giftType === "cake") {
          if (!company.bakeries) {
            throw new Error("Aktivt företag saknar bageri");
          }
        } else {
          if (!company.offers_flowers || !company.florists) {
            throw new Error(
              "Anställd har blommor men företaget saknar blomsterleverans eller florist",
            );
          }
        }

        const price =
          giftType === "flowers"
            ? (company.price_per_flowers ?? company.price_per_cake)
            : company.price_per_cake;

        const order = await ensureOrder({
          supabase,
          employeeId: emp.id,
          companyId: company.id,
          deliveryIso,
          price,
          giftType,
        });
        if (order.created) result.ordersUpserted++;

        const actions: ReminderAction[] = buildActions({
          daysAway,
          company,
          bakery: company.bakeries,
          florist: company.florists,
          giftType,
          emp,
          deliveryIso,
        });

        for (const action of actions) {
          const alreadySent = await reminderAlreadySent(
            supabase,
            order.id,
            action.type,
          );
          if (alreadySent) {
            result.remindersSkipped++;
            continue;
          }

          await action.send();
          await supabase.from("reminder_log").insert({
            employee_id: emp.id,
            order_id: order.id,
            type: action.type,
          });
          result.remindersSent++;
        }

        if (daysAway === 0) {
          await supabase
            .from("orders")
            .update({ status: "delivered" })
            .eq("id", order.id);
        } else if (daysAway === 7) {
          await supabase
            .from("orders")
            .update({ status: "sent_to_bakery" })
            .eq("id", order.id)
            .eq("status", "scheduled");
        }
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

// ---- helpers ---------------------------------------------------------------

interface Partner {
  id: string;
  name: string;
  email: string;
}

interface CompanyJoin {
  id: string;
  name: string;
  address: string;
  city: string;
  contact_email: string;
  contact_phone: string | null;
  billing_email: string;
  price_per_cake: number;
  price_per_flowers: number | null;
  status: "active" | "paused";
  offers_flowers: boolean;
  florist_id: string | null;
  bakeries: Partner | null;
  florists: Partner | null;
}

interface OrderRow {
  id: string;
  created: boolean;
}

async function ensureOrder(args: {
  supabase: ReturnType<typeof createAdminClient>;
  employeeId: string;
  companyId: string;
  deliveryIso: string;
  price: number;
  giftType: GiftType;
}): Promise<OrderRow> {
  const { supabase, employeeId, companyId, deliveryIso, price, giftType } = args;

  const { data: existing, error: selErr } = await supabase
    .from("orders")
    .select("id")
    .eq("employee_id", employeeId)
    .eq("delivery_date", deliveryIso)
    .maybeSingle();

  if (selErr) throw new Error(`Lookup order failed: ${selErr.message}`);
  if (existing) return { id: existing.id, created: false };

  const { data: inserted, error: insErr } = await supabase
    .from("orders")
    .insert({
      employee_id: employeeId,
      company_id: companyId,
      delivery_date: deliveryIso,
      price,
      gift_type: giftType,
      status: "scheduled",
    })
    .select("id")
    .single();

  if (insErr || !inserted) {
    throw new Error(`Insert order failed: ${insErr?.message ?? "no row"}`);
  }
  return { id: inserted.id, created: true };
}

async function reminderAlreadySent(
  supabase: ReturnType<typeof createAdminClient>,
  orderId: string,
  type: ReminderType,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("reminder_log")
    .select("id")
    .eq("order_id", orderId)
    .eq("type", type)
    .maybeSingle();
  if (error) throw new Error(`Reminder lookup failed: ${error.message}`);
  return !!data;
}

function buildActions(args: {
  daysAway: number;
  company: CompanyJoin;
  bakery: Partner | null;
  florist: Partner | null;
  giftType: GiftType;
  emp: {
    id: string;
    first_name: string;
    last_name: string;
    number_of_people: number;
  };
  deliveryIso: string;
}): ReminderAction[] {
  const { daysAway, company, bakery, florist, giftType, emp, deliveryIso } = args;
  const baseCompany = {
    to: company.contact_email,
    companyName: company.name,
    employeeFirstName: emp.first_name,
    employeeLastName: emp.last_name,
    deliveryDate: deliveryIso,
  };

  const partnerOrder =
    giftType === "flowers" && florist
      ? {
          type: "7_days_florist" as const,
          send: () =>
            send7DayFlorist({
              to: florist.email,
              floristName: florist.name,
              companyName: company.name,
              companyAddress: company.address,
              companyCity: company.city,
              contactPhone: company.contact_phone,
              employeeFirstName: emp.first_name,
              employeeLastName: emp.last_name,
              deliveryDate: deliveryIso,
            }),
        }
      : bakery
        ? {
            type: "7_days_bakery" as const,
            send: () =>
              send7DayBakery({
                to: bakery.email,
                bakeryName: bakery.name,
                companyName: company.name,
                companyAddress: company.address,
                companyCity: company.city,
                contactPhone: company.contact_phone,
                employeeFirstName: emp.first_name,
                employeeLastName: emp.last_name,
                deliveryDate: deliveryIso,
                numberOfPeople: emp.number_of_people,
              }),
          }
        : null;

  switch (daysAway) {
    case 14:
      return [
        {
          type: "14_days",
          send: () => send14DayCompany(baseCompany),
        },
      ];
    case 7: {
      const actions: ReminderAction[] = [
        {
          type: "7_days_company",
          send: () => send7DayCompany(baseCompany),
        },
      ];
      if (partnerOrder) actions.unshift(partnerOrder);
      return actions;
    }
    case 1:
      return [{ type: "1_day", send: () => send1DayCompany(baseCompany) }];
    case 0:
      return [{ type: "day_of", send: () => sendDayOfCompany(baseCompany) }];
    default:
      return [];
  }
}
