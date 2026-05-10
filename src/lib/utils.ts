import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SEK = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

export function formatSek(amount: number): string {
  return SEK.format(amount);
}

const DATE_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Europe/Stockholm",
});

export function formatDate(value: string | Date): string {
  if (typeof value === "string") {
    const [y, m, d] = value.split("-").map(Number);
    return DATE_FORMATTER.format(new Date(Date.UTC(y, m - 1, d, 12)));
  }
  return DATE_FORMATTER.format(value);
}

const SHORT_DATE = new Intl.DateTimeFormat("sv-SE", {
  month: "short",
  day: "numeric",
  timeZone: "Europe/Stockholm",
});

export function formatShortDate(value: string | Date): string {
  if (typeof value === "string") {
    const [y, m, d] = value.split("-").map(Number);
    return SHORT_DATE.format(new Date(Date.UTC(y, m - 1, d, 12)));
  }
  return SHORT_DATE.format(value);
}
