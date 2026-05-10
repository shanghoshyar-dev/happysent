import "server-only";

import { getResend } from "@/lib/resend/client";
import { requireEnv } from "@/lib/env";

const fmt = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Europe/Stockholm",
});

function formatSwedishDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return fmt.format(new Date(Date.UTC(y, m - 1, d, 12)));
}

function from(): string {
  // Resend wants a verified sender. ADMIN_EMAIL must be on a verified domain.
  return `Happysent <${requireEnv("ADMIN_EMAIL")}>`;
}

interface BaseArgs {
  companyName: string;
  employeeFirstName: string;
  employeeLastName: string;
  deliveryDate: string; // YYYY-MM-DD
}

// 1) 14 days before — to company
export interface FourteenDayCompanyArgs extends BaseArgs {
  to: string;
}
export async function send14DayCompany(a: FourteenDayCompanyArgs) {
  const subject = `${a.employeeFirstName} fyller år om 2 veckor – tårtan är bokad`;
  const text =
    `Hej ${a.companyName}!\n\n` +
    `${a.employeeFirstName} ${a.employeeLastName} fyller år om 2 veckor. ` +
    `Tårtan är bokad och levereras ${formatSwedishDate(a.deliveryDate)}.\n\n` +
    `Vänliga hälsningar,\nHappysent`;

  return getResend().emails.send({
    from: from(),
    to: a.to,
    subject,
    text,
  });
}

// 2a) 7 days before — order to bakery
export interface SevenDayBakeryArgs {
  to: string; // bakery email
  bakeryName: string;
  companyName: string;
  companyAddress: string;
  employeeFirstName: string;
  employeeLastName: string;
  deliveryDate: string;
  numberOfPeople: number;
}
export async function send7DayBakery(a: SevenDayBakeryArgs) {
  const subject = `Beställning – tårta till ${a.companyName} ${formatSwedishDate(a.deliveryDate)}`;
  const text =
    `Hej ${a.bakeryName}!\n\n` +
    `Beställning – baka och leverera en tårta den ${formatSwedishDate(a.deliveryDate)} till ${a.companyName}. ` +
    `${a.employeeFirstName} ${a.employeeLastName} fyller år.\n\n` +
    `Adress: ${a.companyAddress}\n` +
    `Antal personer: ${a.numberOfPeople}\n\n` +
    `Tack på förhand!\nHappysent`;

  return getResend().emails.send({
    from: from(),
    to: a.to,
    subject,
    text,
  });
}

// 2b) 7 days before — confirmation to company
export interface SevenDayCompanyArgs extends BaseArgs {
  to: string;
}
export async function send7DayCompany(a: SevenDayCompanyArgs) {
  const subject = `En vecka kvar till ${a.employeeFirstName}s födelsedag`;
  const text =
    `Hej ${a.companyName}!\n\n` +
    `En vecka kvar till ${a.employeeFirstName}s födelsedag, tårtan är beställd ` +
    `och levereras ${formatSwedishDate(a.deliveryDate)}.\n\n` +
    `Vänliga hälsningar,\nHappysent`;

  return getResend().emails.send({
    from: from(),
    to: a.to,
    subject,
    text,
  });
}

// 3) 1 day before — to company
export interface OneDayCompanyArgs extends BaseArgs {
  to: string;
}
export async function send1DayCompany(a: OneDayCompanyArgs) {
  const subject = `Imorgon fyller ${a.employeeFirstName} år`;
  const text =
    `Hej ${a.companyName}!\n\n` +
    `Imorgon fyller ${a.employeeFirstName} år, tårtan levereras imorgon ` +
    `(${formatSwedishDate(a.deliveryDate)}) mellan 08:00 och 11:00.\n\n` +
    `Vänliga hälsningar,\nHappysent`;

  return getResend().emails.send({
    from: from(),
    to: a.to,
    subject,
    text,
  });
}

// 4) Day-of — to company
export interface DayOfCompanyArgs extends BaseArgs {
  to: string;
}
export async function sendDayOfCompany(a: DayOfCompanyArgs) {
  const subject = `Tårtan levereras idag`;
  const text =
    `Hej ${a.companyName}!\n\n` +
    `Tårtan till ${a.employeeFirstName} ${a.employeeLastName} levereras idag mellan 08:00 och 11:00.\n\n` +
    `Grattis på födelsedagen, ${a.employeeFirstName}!\n\n` +
    `Vänliga hälsningar,\nHappysent`;

  return getResend().emails.send({
    from: from(),
    to: a.to,
    subject,
    text,
  });
}
