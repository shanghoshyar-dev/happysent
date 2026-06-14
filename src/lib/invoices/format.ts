const SEK = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

export function formatInvoiceSek(amount: number): string {
  return SEK.format(amount);
}

export function invoiceNumber(id: string, month: string): string {
  const compactMonth = month.replace("-", "");
  return `HS-${compactMonth}-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function addDaysIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12));
  return dt.toISOString().slice(0, 10);
}

export function formatIsoDateSv(iso: string): string {
  const [y, mo, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/Stockholm",
  }).format(new Date(Date.UTC(y, mo - 1, d, 12)));
}

export function formatMonthLabel(month: string): string {
  const [y, mo] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "long",
    timeZone: "Europe/Stockholm",
  }).format(new Date(Date.UTC(y, mo - 1, 1, 12)));
}

export function pdfFilename(companyName: string, month: string): string {
  const slug = companyName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `HappySent-faktura-${month}${slug ? `-${slug}` : ""}.pdf`;
}

/** Moms 6 % — priser i orders är inkl. moms. */
export const VAT_RATE = 0.06;

export function exclVatFromIncl(incl: number): number {
  return Math.round(incl / (1 + VAT_RATE));
}

export function vatFromIncl(incl: number): number {
  return incl - exclVatFromIncl(incl);
}

export function totalInclFromLineItems(amounts: number[]): number {
  return amounts.reduce((sum, amount) => sum + amount, 0);
}

/** @deprecated Historiska fakturor — nya priser är inkl moms. */
export function vatFromSubtotal(subtotal: number): number {
  return Math.round(subtotal * VAT_RATE);
}
