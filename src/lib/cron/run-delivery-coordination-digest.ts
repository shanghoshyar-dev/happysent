import "server-only";

import {
  DELIVERY_COORDINATION_LOOKAHEAD_DAYS,
  deliveryCoordinationWindow,
  formatDeliveryCoordinationDigestText,
  groupDeliveryCoordinationRows,
  mapOrderToDeliveryCoordinationRow,
  type DeliveryCoordinationDayGroup,
} from "@/lib/cron/delivery-coordination-digest";
import { formatIsoDateSv } from "@/lib/invoices/format";
import { toDateString } from "@/lib/holidays/swedish";
import { sendDeliveryCoordinationDigest } from "@/lib/resend/templates";
import { createAdminClient } from "@/lib/supabase/admin";

export interface DeliveryCoordinationDigestResult {
  windowStart: string;
  windowEnd: string;
  deliveriesFound: number;
  daysWithDeliveries: number;
  emailSent: boolean;
}

export async function runDeliveryCoordinationDigest(
  today: Date,
): Promise<DeliveryCoordinationDigestResult> {
  const supabase = createAdminClient();
  const { startIso, endIso } = deliveryCoordinationWindow(today);

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      delivery_date, gift_type, cake_name, people_count, cake_quantity, cake_lines,
      employee_first_name, employee_last_name,
      companies:company_id ( name, address, city, contact_phone, status ),
      products:product_id ( name ),
      employees:employee_id ( first_name, last_name )
    `,
    )
    .gte("delivery_date", startIso)
    .lte("delivery_date", endIso)
    .neq("status", "cancelled")
    .order("delivery_date")
    .order("company_id");

  if (error) {
    throw new Error(`Delivery coordination digest load failed: ${error.message}`);
  }

  const rows = (orders ?? [])
    .map((order) => mapOrderToDeliveryCoordinationRow(order))
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) {
    return {
      windowStart: startIso,
      windowEnd: endIso,
      deliveriesFound: 0,
      daysWithDeliveries: 0,
      emailSent: false,
    };
  }

  const groups: DeliveryCoordinationDayGroup[] = groupDeliveryCoordinationRows(
    rows,
    today,
  );

  const subjectDate = formatIsoDateSv(toDateString(today));
  await sendDeliveryCoordinationDigest({
    subjectDate,
    text: formatDeliveryCoordinationDigestText({ today, groups }),
  });

  return {
    windowStart: startIso,
    windowEnd: endIso,
    deliveriesFound: rows.length,
    daysWithDeliveries: groups.length,
    emailSent: true,
  };
}

export { DELIVERY_COORDINATION_LOOKAHEAD_DAYS };
