import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  adjustDeliveryDate,
  birthdayThisYear,
  diffInDays,
  toDateString,
} from "@/lib/holidays/swedish";
import {
  send14DayCompany,
  send1DayCompany,
  send7DayBakery,
  send7DayCompany,
  sendDayOfCompany,
} from "@/lib/resend/templates";
import type { ReminderType } from "@/types/database";

interface ReminderAction {
  type: ReminderType;
  send: () => Promise<unknown>;
}

export interface DailyCheckResult {
  scannedEmployees: number;
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

  const result: DailyCheckResult = {
    scannedEmployees: 0,
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
      companies:company_id (
        id, name, address, contact_email, billing_email, price_per_cake, status,
        bakeries:bakery_id ( id, name, email )
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
      // Supabase typed-relations come through as `unknown` in the placeholder
      // type, so we narrow with a small runtime guard.
      const company = (emp as unknown as { companies: CompanyJoin | null })
        .companies;
      if (!company || company.status !== "active") continue;
      const bakery = company.bakeries;
      if (!bakery) continue;

      const birthday = birthdayThisYear(emp.birthday, today);
      const deliveryDate = adjustDeliveryDate(birthday);
      const deliveryIso = toDateString(deliveryDate);
      const daysAway = diffInDays(deliveryDate, today);

      // We only act on milestones; otherwise skip to save DB writes.
      if (![14, 7, 1, 0].includes(daysAway)) continue;

      // Idempotently ensure an order row exists for this employee/year.
      const order = await ensureOrder({
        supabase,
        employeeId: emp.id,
        companyId: company.id,
        deliveryIso,
        price: company.price_per_cake,
      });
      if (order.created) result.ordersUpserted++;

      const actions: ReminderAction[] = buildActions({
        daysAway,
        order,
        company,
        bakery,
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

interface CompanyJoin {
  id: string;
  name: string;
  address: string;
  contact_email: string;
  billing_email: string;
  price_per_cake: number;
  status: "active" | "paused";
  bakeries: { id: string; name: string; email: string } | null;
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
}): Promise<OrderRow> {
  const { supabase, employeeId, companyId, deliveryIso, price } = args;
  const year = Number(deliveryIso.slice(0, 4));

  // Look for an existing order in this delivery year for this employee.
  const { data: existing, error: selErr } = await supabase
    .from("orders")
    .select("id")
    .eq("employee_id", employeeId)
    .gte("delivery_date", `${year}-01-01`)
    .lte("delivery_date", `${year}-12-31`)
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
  order: OrderRow;
  company: CompanyJoin;
  bakery: NonNullable<CompanyJoin["bakeries"]>;
  emp: {
    id: string;
    first_name: string;
    last_name: string;
    number_of_people: number;
  };
  deliveryIso: string;
}): ReminderAction[] {
  const { daysAway, company, bakery, emp, deliveryIso } = args;
  const baseCompany = {
    to: company.contact_email,
    companyName: company.name,
    employeeFirstName: emp.first_name,
    employeeLastName: emp.last_name,
    deliveryDate: deliveryIso,
  };

  switch (daysAway) {
    case 14:
      return [
        {
          type: "14_days",
          send: () => send14DayCompany(baseCompany),
        },
      ];
    case 7:
      return [
        {
          type: "7_days_bakery",
          send: () =>
            send7DayBakery({
              to: bakery.email,
              bakeryName: bakery.name,
              companyName: company.name,
              companyAddress: company.address,
              employeeFirstName: emp.first_name,
              employeeLastName: emp.last_name,
              deliveryDate: deliveryIso,
              numberOfPeople: emp.number_of_people,
            }),
        },
        {
          type: "7_days_company",
          send: () => send7DayCompany(baseCompany),
        },
      ];
    case 1:
      return [{ type: "1_day", send: () => send1DayCompany(baseCompany) }];
    case 0:
      return [{ type: "day_of", send: () => sendDayOfCompany(baseCompany) }];
    default:
      return [];
  }
}
