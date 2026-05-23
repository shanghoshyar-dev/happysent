import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import type { InvoicePdfData } from "./types";

export async function loadInvoicePdfData(
  invoiceId: string,
): Promise<InvoicePdfData | null> {
  const supabase = createAdminClient();
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      "id, month, total_amount, status, orders, created_at, sent_at, companies:company_id ( name, address, city, billing_email )",
    )
    .eq("id", invoiceId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!invoice) return null;

  const company = invoice.companies as {
    name: string;
    address: string;
    city: string;
    billing_email: string;
  } | null;

  if (!company) return null;

  const orderIds = Array.isArray(invoice.orders)
    ? (invoice.orders as string[])
    : [];

  const { data: rows, error: rowsErr } = await supabase
    .from("orders")
    .select(
      `delivery_date, price, employees:employee_id ( first_name, last_name )`,
    )
    .in(
      "id",
      orderIds.length ? orderIds : ["00000000-0000-0000-0000-000000000000"],
    )
    .order("delivery_date", { ascending: true });

  if (rowsErr) throw new Error(rowsErr.message);

  const lineItems = (rows ?? []).map((row) => {
    const emp = row.employees as
      | { first_name: string; last_name: string }
      | null;
    return {
      deliveryDate: row.delivery_date,
      employeeName: emp ? `${emp.first_name} ${emp.last_name}` : "—",
      amount: row.price,
    };
  });

  return {
    id: invoice.id,
    month: invoice.month,
    createdAt: invoice.created_at,
    totalAmount: invoice.total_amount,
    status: invoice.status,
    sentAt: invoice.sent_at ?? null,
    company: {
      name: company.name,
      address: company.address,
      city: company.city,
      billingEmail: company.billing_email,
    },
    lineItems,
  };
}
