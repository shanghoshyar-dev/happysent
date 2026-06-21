import {
  cakeLinesFromDbJson,
  formatCakeOrderLabel,
  formatCakeOrderLines,
  type CakeOrderLine,
} from "@/lib/pricing/cake-prices-data";
import { displayProductName } from "@/lib/cake-selection/product-name";
import { orderEmployeeDisplayName } from "@/lib/orders/employee-name";
import { formatIsoDateSv } from "@/lib/invoices/format";
import { addDays, diffInDays, parseDateString, toDateString } from "@/lib/holidays/swedish";
import type { GiftType } from "@/lib/celebrations";
import type { Json } from "@/types/database";

export const DELIVERY_COORDINATION_LOOKAHEAD_DAYS = 7;

export interface DeliveryCoordinationRow {
  deliveryDate: string;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  contactPhone: string | null;
  employeeName: string;
  giftType: GiftType;
  productName: string | null;
  cakeName: string | null;
  peopleCount: number | null;
  cakeQuantity: number;
  cakeLines: CakeOrderLine[];
}

export interface DeliveryCoordinationDayGroup {
  deliveryDate: string;
  heading: string;
  rows: DeliveryCoordinationRow[];
}

export function formatCompanyAddress(
  address: string,
  city: string | null | undefined,
): string {
  const street = address.trim();
  const place = city?.trim();
  if (street && place) return `${street}, ${place}`;
  return street || place || "—";
}

export function formatGiftDetail(row: DeliveryCoordinationRow): string {
  if (row.giftType === "flowers") return "Blommor";

  if (row.productName) {
    return displayProductName(row.productName);
  }

  if (row.cakeName && row.cakeLines.length > 0) {
    return formatCakeOrderLines(row.cakeName, row.cakeLines);
  }

  if (row.cakeName && row.peopleCount) {
    return formatCakeOrderLabel({
      cakeName: row.cakeName,
      peopleCount: row.peopleCount,
      quantity: row.cakeQuantity,
    });
  }

  return "Tårta";
}

export function formatDeliveryDayHeading(
  deliveryDate: string,
  today: Date,
): string {
  const label = formatIsoDateSv(deliveryDate);
  const daysAway = diffInDays(parseDateString(deliveryDate), today);
  if (daysAway === 0) return `Idag, ${label}`;
  if (daysAway === 1) return `Imorgon, ${label}`;
  return label;
}

export function groupDeliveryCoordinationRows(
  rows: DeliveryCoordinationRow[],
  today: Date,
): DeliveryCoordinationDayGroup[] {
  const byDate = new Map<string, DeliveryCoordinationRow[]>();

  for (const row of rows) {
    const bucket = byDate.get(row.deliveryDate) ?? [];
    bucket.push(row);
    byDate.set(row.deliveryDate, bucket);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([deliveryDate, dayRows]) => ({
      deliveryDate,
      heading: formatDeliveryDayHeading(deliveryDate, today),
      rows: [...dayRows].sort((a, b) => {
        const company = a.companyName.localeCompare(b.companyName, "sv");
        if (company !== 0) return company;
        return a.employeeName.localeCompare(b.employeeName, "sv");
      }),
    }));
}

export function formatDeliveryCoordinationDigestText(args: {
  today: Date;
  groups: DeliveryCoordinationDayGroup[];
}): string {
  const todayLabel = formatIsoDateSv(toDateString(args.today));
  const sections = args.groups.map((group) => {
    const lines = group.rows.map((row) => {
      const address = formatCompanyAddress(row.companyAddress, row.companyCity);
      const phone = row.contactPhone?.trim() || "—";
      const gift = formatGiftDetail(row);
      return (
        `• ${row.companyName} | ${row.employeeName} | ${address} | ${phone} | ${gift}`
      );
    });
    return `${group.heading}\n${lines.join("\n")}`;
  });

  return (
    `Hej!\n\n` +
    `Här är leveransplanen från ${todayLabel} och ${DELIVERY_COORDINATION_LOOKAHEAD_DAYS} dagar framåt:\n\n` +
    `${sections.join("\n\n")}\n\n` +
    `Hälsningar,\nHappySent`
  );
}

interface OrderQueryRow {
  delivery_date: string;
  gift_type: GiftType;
  cake_name: string | null;
  people_count: number | null;
  cake_quantity: number;
  cake_lines: Json | null;
  employee_first_name: string;
  employee_last_name: string;
  companies: {
    name: string;
    address: string;
    city: string;
    contact_phone: string | null;
    status: string;
  } | null;
  products: { name: string } | null;
  employees: { first_name: string; last_name: string } | null;
}

export function mapOrderToDeliveryCoordinationRow(
  order: OrderQueryRow,
): DeliveryCoordinationRow | null {
  const company = order.companies;
  if (!company || company.status !== "active") return null;

  return {
    deliveryDate: order.delivery_date,
    companyName: company.name,
    companyAddress: company.address,
    companyCity: company.city,
    contactPhone: company.contact_phone,
    employeeName: orderEmployeeDisplayName(order),
    giftType: order.gift_type ?? "cake",
    productName: order.products?.name ?? null,
    cakeName: order.cake_name,
    peopleCount: order.people_count,
    cakeQuantity: order.cake_quantity ?? 1,
    cakeLines: cakeLinesFromDbJson(order.cake_lines) ?? [],
  };
}

export function deliveryCoordinationWindow(today: Date): {
  startIso: string;
  endIso: string;
} {
  const startIso = toDateString(today);
  const endIso = toDateString(
    addDays(today, DELIVERY_COORDINATION_LOOKAHEAD_DAYS),
  );
  return { startIso, endIso };
}
