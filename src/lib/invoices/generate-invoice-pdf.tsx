import "server-only";

import { renderToBuffer } from "@react-pdf/renderer";

import { getIssuerProfile } from "./billing-profile";
import { pdfFilename } from "./format";
import { loadInvoicePdfData } from "./load-invoice-data";
import { InvoicePdfDocument } from "./pdf-document";

export async function generateInvoicePdf(invoiceId: string): Promise<{
  buffer: Buffer;
  filename: string;
} | null> {
  const invoice = await loadInvoicePdfData(invoiceId);
  if (!invoice) return null;

  const issuer = getIssuerProfile();
  const buffer = Buffer.from(
    await renderToBuffer(
      <InvoicePdfDocument invoice={invoice} issuer={issuer} />,
    ),
  );
  const filename = pdfFilename(invoice.company.name, invoice.month);

  return { buffer, filename };
}
