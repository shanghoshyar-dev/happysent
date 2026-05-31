"use server";

import { revalidatePath } from "next/cache";

import {
  formatMonthLabel,
  invoiceNumber,
  vatFromSubtotal,
} from "@/lib/invoices/format";
import { generateInvoicePdf } from "@/lib/invoices/generate-invoice-pdf";
import { loadInvoicePdfData } from "@/lib/invoices/load-invoice-data";
import { sendCustomerInvoiceEmail } from "@/lib/resend/templates";
import { creditDonationForPaidInvoice } from "@/lib/donation-fund";
import { formatSek } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Generate (or regenerate) invoices for a given month (format: YYYY-MM).
 * Pulls all delivered/invoiced orders for that month per company, sums them,
 * and upserts an invoices row. Then marks those orders as `invoiced`.
 */
export async function generateInvoicesForMonth(month: string) {
  const supabase = createAdminClient();

  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error("Month must be formatted as YYYY-MM");
  }
  const start = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const nextMonth =
    m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, company_id, price")
    .gte("delivery_date", start)
    .lt("delivery_date", nextMonth)
    .in("status", ["delivered", "invoiced"]);

  if (error) throw new Error(error.message);
  if (!orders || orders.length === 0) return { invoices: 0 };

  const grouped = new Map<string, { ids: string[]; total: number }>();
  for (const o of orders) {
    const g = grouped.get(o.company_id) ?? { ids: [], total: 0 };
    g.ids.push(o.id);
    g.total += o.price;
    grouped.set(o.company_id, g);
  }

  let count = 0;
  for (const [companyId, g] of grouped.entries()) {
    const { error: upsertErr } = await supabase
      .from("invoices")
      .upsert(
        {
          company_id: companyId,
          month,
          total_amount: g.total,
          orders: g.ids,
          status: "unpaid",
        },
        { onConflict: "company_id,month" },
      );
    if (upsertErr) throw new Error(upsertErr.message);

    await supabase
      .from("orders")
      .update({ status: "invoiced" })
      .in("id", g.ids);

    count++;
  }

  revalidatePath("/admin/fakturor");
  return { invoices: count };
}

export interface MarkInvoicePaidResult {
  donationKr: number;
  orderCount: number;
}

export async function markInvoicePaid(
  id: string,
): Promise<MarkInvoicePaidResult> {
  const supabase = createAdminClient();

  const { data: invoice, error: loadErr } = await supabase
    .from("invoices")
    .select("orders, status")
    .eq("id", id)
    .maybeSingle();
  if (loadErr || !invoice) {
    throw new Error(loadErr?.message ?? "Faktura hittades inte.");
  }

  const orderIds = Array.isArray(invoice.orders)
    ? (invoice.orders as string[])
    : [];
  const orderCount = orderIds.length;

  if (invoice.status !== "paid") {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "paid" })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  const { amountKr } = await creditDonationForPaidInvoice(id);

  revalidatePath("/admin/fakturor");
  revalidatePath(`/admin/fakturor/${id}`);
  revalidatePath("/", "layout");

  return { donationKr: amountKr, orderCount };
}

export interface SendInvoiceResult {
  ok: boolean;
  error?: string;
}

export async function sendInvoiceToCustomer(
  id: string,
): Promise<SendInvoiceResult> {
  const invoice = await loadInvoicePdfData(id);
  if (!invoice) {
    return { ok: false, error: "Faktura hittades inte." };
  }
  if (!invoice.company.billingEmail) {
    return { ok: false, error: "Företaget saknar fakturamejl." };
  }

  const pdf = await generateInvoicePdf(id);
  if (!pdf) {
    return { ok: false, error: "Kunde inte skapa PDF." };
  }

  const subtotal = invoice.lineItems.reduce((sum, row) => sum + row.amount, 0);
  const totalInclVat = subtotal + vatFromSubtotal(subtotal);
  const number = invoiceNumber(invoice.id, invoice.month);

  try {
    await sendCustomerInvoiceEmail({
      to: invoice.company.billingEmail,
      companyName: invoice.company.name,
      monthLabel: formatMonthLabel(invoice.month),
      invoiceNumber: number,
      totalInclVat: formatSek(totalInclVat),
      pdfFilename: pdf.filename,
      pdfBase64: pdf.buffer.toString("base64"),
    });
  } catch (e) {
    console.error("[sendInvoiceToCustomer]", e);
    return {
      ok: false,
      error: "Mejlet kunde inte skickas. Kontrollera Resend-konfigurationen.",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("invoices")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/fakturor");
  revalidatePath(`/admin/fakturor/${id}`);
  return { ok: true };
}
