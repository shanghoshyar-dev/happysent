import "server-only";

import type { DeliveryOccasion, GiftType } from "@/lib/celebrations";
import {
  applyAutoPickToOrder,
  applyEmployeePreferredToOrder,
  getOrderProductName,
} from "@/lib/cake-selection/auto-pick";
import { selectionDeadlineFromDelivery } from "@/lib/cake-selection/deadline";
import { cakeSelectionUrl } from "@/lib/cake-selection/selection-url";
import { diffInDays } from "@/lib/holidays/swedish";
import {
  cakeLinesToDbJson,
  type CakeOrderLine,
  type CakePriceRow,
} from "@/lib/pricing/cake-prices-data";
import { resolveCakeOrderPrice } from "@/lib/pricing/resolve-order-price";
import {
  send14DayCompany,
  send1DayCompany,
  send7DayBakery,
  send7DayCompany,
  send7DayFlorist,
  sendDayOfCompany,
} from "@/lib/resend/templates";
import type { createAdminClient } from "@/lib/supabase/admin";
import type { CelebrationFrequency, ReminderType } from "@/types/database";

export {
  catchUpReminderTypes,
  cronActionsForDay,
  isCatchUpEligible,
  shouldAutoPickCake,
} from "./catch-up-rules";

type AdminClient = ReturnType<typeof createAdminClient>;

export interface Partner {
  id: string;
  name: string;
  email: string;
  catalog_pdf_path?: string | null;
}

export interface CompanyJoin {
  id: string;
  name: string;
  address: string;
  city: string;
  contact_email: string;
  contact_phone: string | null;
  billing_email: string;
  price_per_flowers: number | null;
  status: "active" | "paused";
  offers_flowers: boolean;
  florist_id: string | null;
  bakery_id: string | null;
  bakeries: Partner | null;
  florists: Partner | null;
}

export interface EmployeeForDelivery {
  id: string;
  first_name: string;
  last_name: string;
  birthday: string;
  number_of_people: number;
  is_active: boolean;
  company_id: string;
  celebration_frequency: CelebrationFrequency;
  gift_type: GiftType;
  cake_name: string | null;
  people_count: number | null;
}

interface ReminderAction {
  type: ReminderType;
  send: () => Promise<unknown>;
}

export interface OrderRow {
  id: string;
  selectionToken: string;
  created: boolean;
}

export interface ProcessDeliverySlotResult {
  orderId: string;
  orderCreated: boolean;
  remindersSent: ReminderType[];
  remindersSkipped: ReminderType[];
}

function validateGiftPartner(giftType: GiftType, company: CompanyJoin): void {
  if (giftType === "cake") {
    if (!company.bakeries) {
      throw new Error("Aktivt företag saknar bageri");
    }
    return;
  }
  if (!company.offers_flowers || !company.florists) {
    throw new Error(
      "Anställd har blommor men företaget saknar blomsterleverans eller florist",
    );
  }
}

async function resolveOrderPricing(args: {
  supabase: AdminClient;
  giftType: GiftType;
  company: CompanyJoin;
  emp: EmployeeForDelivery;
  cakePriceRows: CakePriceRow[];
}): Promise<{
  price: number;
  cakeName: string | null;
  peopleCount: number | null;
  cakeQuantity: number;
  cakeLines: CakeOrderLine[];
}> {
  const { supabase, giftType, company, emp, cakePriceRows } = args;

  if (giftType === "flowers") {
    if (company.price_per_flowers == null) {
      throw new Error(
        `${company.name}: saknar pris per blombukett (price_per_flowers).`,
      );
    }
    return {
      price: company.price_per_flowers,
      cakeName: null,
      peopleCount: null,
      cakeQuantity: 1,
      cakeLines: [],
    };
  }

  const resolved = await resolveCakeOrderPrice({
    supabase,
    companyId: company.id,
    employeeCakeName: emp.cake_name,
    employeePeopleCount: emp.people_count,
    priceRows: cakePriceRows,
  });

  return {
    price: resolved.price,
    cakeName: resolved.cakeName,
    peopleCount: resolved.peopleCount,
    cakeQuantity: resolved.quantity,
    cakeLines: resolved.lines,
  };
}

export async function ensureOrder(args: {
  supabase: AdminClient;
  employeeId: string;
  employeeFirstName: string;
  employeeLastName: string;
  companyId: string;
  deliveryIso: string;
  price: number;
  cakeName: string | null;
  peopleCount: number | null;
  cakeQuantity: number;
  cakeLines: CakeOrderLine[];
  giftType: GiftType;
  companyCity: string;
  companyBakeryId: string | null;
}): Promise<OrderRow> {
  const {
    supabase,
    employeeId,
    employeeFirstName,
    employeeLastName,
    companyId,
    deliveryIso,
    price,
    cakeName,
    peopleCount,
    cakeQuantity,
    cakeLines,
    giftType,
    companyCity,
    companyBakeryId,
  } = args;

  const deadline =
    giftType === "cake" ? selectionDeadlineFromDelivery(deliveryIso) : null;

  const { data: existing, error: selErr } = await supabase
    .from("orders")
    .select("id, selection_token, selection_deadline")
    .eq("employee_id", employeeId)
    .eq("delivery_date", deliveryIso)
    .maybeSingle();

  if (selErr) throw new Error(`Lookup order failed: ${selErr.message}`);
  if (existing) {
    if (giftType === "cake" && deadline && !existing.selection_deadline) {
      await supabase
        .from("orders")
        .update({ selection_deadline: deadline })
        .eq("id", existing.id);
    }
    return {
      id: existing.id,
      selectionToken: existing.selection_token,
      created: false,
    };
  }

  const { data: inserted, error: insErr } = await supabase
    .from("orders")
    .insert({
      employee_id: employeeId,
      employee_first_name: employeeFirstName,
      employee_last_name: employeeLastName,
      company_id: companyId,
      delivery_date: deliveryIso,
      price,
      cake_name: cakeName,
      people_count: peopleCount,
      cake_quantity: cakeQuantity,
      cake_lines: cakeLines.length ? cakeLinesToDbJson(cakeLines) : null,
      gift_type: giftType,
      status: "scheduled",
      selection_deadline: deadline,
    })
    .select("id, selection_token")
    .single();

  if (insErr || !inserted) {
    throw new Error(`Insert order failed: ${insErr?.message ?? "no row"}`);
  }

  if (giftType === "cake" && companyCity.trim()) {
    await applyEmployeePreferredToOrder(
      inserted.id,
      employeeId,
      companyCity,
      companyBakeryId,
    );
  }

  return {
    id: inserted.id,
    selectionToken: inserted.selection_token,
    created: true,
  };
}

export async function reminderAlreadySent(
  supabase: AdminClient,
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

async function buildActionForType(
  type: ReminderType,
  args: {
    company: CompanyJoin;
    bakery: Partner | null;
    florist: Partner | null;
    giftType: GiftType;
    emp: Pick<
      EmployeeForDelivery,
      "first_name" | "last_name" | "number_of_people"
    >;
    deliveryIso: string;
    orderId: string;
    selectionToken: string;
    cakeName: string | null;
    cakePeopleCount: number | null;
    cakeQuantity: number;
    cakeLines: CakeOrderLine[];
  },
): Promise<ReminderAction | null> {
  const {
    company,
    bakery,
    florist,
    giftType,
    emp,
    deliveryIso,
    orderId,
    selectionToken,
    cakeName,
    cakePeopleCount,
    cakeQuantity,
    cakeLines,
  } = args;

  const baseCompany = {
    to: company.contact_email,
    companyName: company.name,
    employeeFirstName: emp.first_name,
    employeeLastName: emp.last_name,
    deliveryDate: deliveryIso,
  };

  switch (type) {
    case "14_days":
      return {
        type,
        send: async () => {
          const productName =
            giftType === "cake" ? await getOrderProductName(orderId) : null;
          return send14DayCompany({
            ...baseCompany,
            giftType,
            includeCakeSelection: giftType === "cake" && !productName,
            preSelectedProductName: productName,
            catalogPdfPath: bakery?.catalog_pdf_path ?? null,
            selectionUrl: cakeSelectionUrl(selectionToken),
            selectionDeadline: selectionDeadlineFromDelivery(deliveryIso),
          });
        },
      };
    case "7_days_bakery":
      if (!bakery) return null;
      return {
        type,
        send: async () => {
          const productName = await getOrderProductName(orderId);
          return send7DayBakery({
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
            productName,
            cakeName,
            cakePeopleCount,
            cakeQuantity,
            cakeLines,
          });
        },
      };
    case "7_days_florist":
      if (!florist) return null;
      return {
        type,
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
      };
    case "7_days_company":
      return { type, send: () => send7DayCompany(baseCompany) };
    case "1_day":
      return { type, send: () => send1DayCompany(baseCompany) };
    case "day_of":
      return { type, send: () => sendDayOfCompany(baseCompany) };
    default:
      return null;
  }
}

async function buildActionsForTypes(
  types: ReminderType[],
  args: Parameters<typeof buildActionForType>[1],
): Promise<ReminderAction[]> {
  const actions: ReminderAction[] = [];
  for (const type of types) {
    const action = await buildActionForType(type, args);
    if (action) actions.push(action);
  }
  return actions;
}

async function applyOrderStatus(
  supabase: AdminClient,
  orderId: string,
  daysAway: number,
): Promise<void> {
  if (daysAway === 0) {
    await supabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", orderId);
    return;
  }
  if (daysAway <= 7) {
    await supabase
      .from("orders")
      .update({ status: "sent_to_bakery" })
      .eq("id", orderId)
      .eq("status", "scheduled");
  }
}

export async function processDeliverySlot(args: {
  supabase: AdminClient;
  emp: EmployeeForDelivery;
  company: CompanyJoin;
  delivery: DeliveryOccasion;
  today: Date;
  cakePriceRows: CakePriceRow[];
  reminderTypes: ReminderType[];
  runAutoPick: boolean;
  applyStatus: boolean;
}): Promise<ProcessDeliverySlotResult> {
  const {
    supabase,
    emp,
    company,
    delivery,
    today,
    cakePriceRows,
    reminderTypes,
    runAutoPick,
    applyStatus,
  } = args;

  const giftType = emp.gift_type ?? "cake";
  validateGiftPartner(giftType, company);

  const daysAway = diffInDays(delivery.deliveryDate, today);
  const pricing = await resolveOrderPricing({
    supabase,
    giftType,
    company,
    emp,
    cakePriceRows,
  });

  const order = await ensureOrder({
    supabase,
    employeeId: emp.id,
    employeeFirstName: emp.first_name,
    employeeLastName: emp.last_name,
    companyId: company.id,
    deliveryIso: delivery.deliveryIso,
    price: pricing.price,
    cakeName: pricing.cakeName,
    peopleCount: pricing.peopleCount,
    cakeQuantity: pricing.cakeQuantity,
    cakeLines: pricing.cakeLines,
    giftType,
    companyCity: company.city,
    companyBakeryId: company.bakery_id,
  });

  if (runAutoPick && giftType === "cake") {
    await applyAutoPickToOrder(order.id);
  }

  const actionArgs = {
    company,
    bakery: company.bakeries,
    florist: company.florists,
    giftType,
    emp,
    deliveryIso: delivery.deliveryIso,
    orderId: order.id,
    selectionToken: order.selectionToken,
    cakeName: pricing.cakeName,
    cakePeopleCount: pricing.peopleCount,
    cakeQuantity: pricing.cakeQuantity,
    cakeLines: pricing.cakeLines,
  };

  const actions = await buildActionsForTypes(reminderTypes, actionArgs);
  const remindersSent: ReminderType[] = [];
  const remindersSkipped: ReminderType[] = [];

  for (const action of actions) {
    const alreadySent = await reminderAlreadySent(
      supabase,
      order.id,
      action.type,
    );
    if (alreadySent) {
      remindersSkipped.push(action.type);
      continue;
    }
    await action.send();
    await supabase.from("reminder_log").insert({
      employee_id: emp.id,
      order_id: order.id,
      type: action.type,
    });
    remindersSent.push(action.type);
  }

  if (applyStatus) {
    await applyOrderStatus(supabase, order.id, daysAway);
  }

  return {
    orderId: order.id,
    orderCreated: order.created,
    remindersSent,
    remindersSkipped,
  };
}
