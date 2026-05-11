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
  const subject = `🎂 ${a.employeeFirstName} fyller år om två veckor!`;
  const text =
    `Hej ${a.companyName}!\n\n` +
    `Vi vill påminna om att ${a.employeeFirstName} ${a.employeeLastName} fyller år om 14 dagar, den ${formatSwedishDate(a.deliveryDate)}.\n\n` +
    `En tårta är bokad och levereras automatiskt den dagen.\n` +
    `Ni behöver inte göra någonting!\n\n` +
    `Hälsningar,\nHappysent`;

  return getResend().emails.send({
    from: from(),
    to: a.to,
    subject,
    text,
  });
}

// 2a) 7 days before — order to bakery
export interface SevenDayBakeryArgs {
  to: string;
  bakeryName: string;
  companyName: string;
  companyAddress: string;
  companyCity?: string | null;
  employeeFirstName: string;
  employeeLastName: string;
  deliveryDate: string;
  numberOfPeople: number;
}
export async function send7DayBakery(a: SevenDayBakeryArgs) {
  const subject = `Beställning – Tårta till ${a.companyName} den ${formatSwedishDate(a.deliveryDate)}`;
  const deliveryAddress = a.companyCity
    ? `${a.companyAddress}, ${a.companyCity}`
    : a.companyAddress;
  const text =
    `Hej ${a.bakeryName}!\n\n` +
    `Vi bekräftar följande beställning:\n\n` +
    `Kund:             ${a.employeeFirstName} ${a.employeeLastName} fyller år den ${formatSwedishDate(a.deliveryDate)}\n` +
    `Företag:          ${a.companyName}\n` +
    `Leveransadress:   ${deliveryAddress}\n` +
    `Antal personer:   ${a.numberOfPeople}\n` +
    `Leveransdatum:    ${formatSwedishDate(a.deliveryDate)}\n` +
    `Skicka faktura till: ${requireEnv("ADMIN_EMAIL")}\n\n` +
    `Tack!\nHappysent`;

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
  const subject = `🎂 ${a.employeeFirstName} fyller år om en vecka!`;
  const text =
    `Hej ${a.companyName}!\n\n` +
    `En påminnelse om att ${a.employeeFirstName} fyller år om 7 dagar.\n` +
    `Tårtan är beställd och levereras den ${formatSwedishDate(a.deliveryDate)}.\n\n` +
    `Hälsningar,\nHappysent`;

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
  const subject = `🎂 Imorgon fyller ${a.employeeFirstName} år!`;
  const text =
    `Hej ${a.companyName}!\n\n` +
    `Imorgon fyller ${a.employeeFirstName} ${a.employeeLastName} år!\n` +
    `Tårtan levereras imorgon den ${formatSwedishDate(a.deliveryDate)}.\n\n` +
    `Hälsningar,\nHappysent`;

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
  const subject = `🎂 Grattis ${a.employeeFirstName}!`;
  const text =
    `Hej ${a.companyName}!\n\n` +
    `Idag fyller ${a.employeeFirstName} år!\n` +
    `Tårtan levereras idag mellan 08:00 och 11:00.\n\n` +
    `Vi hoppas ${a.employeeFirstName} får en fantastisk dag!\n\n` +
    `Hälsningar,\nHappysent`;

  return getResend().emails.send({
    from: from(),
    to: a.to,
    subject,
    text,
  });
}

// ---------- Public marketing site forms ----------

export interface ContactAdminArgs {
  name: string;
  company: string;
  email: string;
  message: string;
}
export async function sendContactAdminNotification(a: ContactAdminArgs) {
  const subject = `Nytt kontaktmeddelande från ${a.name} (${a.company})`;
  const text =
    `Ny förfrågan via happysent.com/kontakt:\n\n` +
    `Namn:     ${a.name}\n` +
    `Företag:  ${a.company}\n` +
    `Mejl:     ${a.email}\n\n` +
    `Meddelande:\n${a.message || "(inget meddelande)"}\n`;

  return getResend().emails.send({
    from: from(),
    to: requireEnv("ADMIN_EMAIL"),
    replyTo: a.email,
    subject,
    text,
  });
}

export interface EmployeeRequestAdminArgs {
  action: "add" | "remove";
  companyName: string;
  address: string;
  city: string;
  postalCode: string;
  employeeFirstName: string;
  employeeLastName: string;
  birthday: string | null;
  numberOfPeople: number | null;
  message: string;
  submittedByEmail: string;
}
export async function sendEmployeeRequestAdminNotification(
  a: EmployeeRequestAdminArgs,
) {
  const actionLabel = a.action === "add" ? "Lägg till anställd" : "Ta bort anställd";
  const subject = `${actionLabel}: ${a.employeeFirstName} ${a.employeeLastName} (${a.companyName})`;
  const extraFields =
    a.action === "add"
      ? `Födelsedag:       ${a.birthday ?? "(saknas)"}\n` +
        `Antal personer:   ${a.numberOfPeople ?? "(saknas)"}\n`
      : "";
  const text =
    `Ny ${actionLabel.toLowerCase()}-förfrågan via happysent.com/kontakt:\n\n` +
    `Företag:          ${a.companyName}\n` +
    `Adress:           ${a.address}\n` +
    `Postnummer:       ${a.postalCode}\n` +
    `Ort:              ${a.city}\n\n` +
    `Anställd:         ${a.employeeFirstName} ${a.employeeLastName}\n` +
    extraFields +
    `\nAvsändarens mejl: ${a.submittedByEmail}\n\n` +
    `Meddelande:\n${a.message || "(inget meddelande)"}\n`;

  return getResend().emails.send({
    from: from(),
    to: requireEnv("ADMIN_EMAIL"),
    replyTo: a.submittedByEmail,
    subject,
    text,
  });
}

export interface ContactConfirmationArgs {
  to: string;
  name: string;
}
export async function sendContactConfirmation(a: ContactConfirmationArgs) {
  const subject = `Tack för ditt meddelande – Happysent`;
  const text =
    `Hej ${a.name}!\n\n` +
    `Vi har tagit emot ditt meddelande och återkommer inom en arbetsdag.\n\n` +
    `Hälsningar,\nHappysent-teamet`;

  return getResend().emails.send({
    from: from(),
    to: a.to,
    subject,
    text,
  });
}

// ---------- Admin / lifecycle ----------

export interface WelcomeCompanyArgs {
  to: string;
  companyName: string;
}
export async function sendCompanyWelcome(a: WelcomeCompanyArgs) {
  const subject = `Välkommen till Happysent! 🎂`;
  const text =
    `Hej ${a.companyName}!\n\n` +
    `Välkommen till Happysent!\n\n` +
    `Era anställda är nu registrerade i vårt system.\n` +
    `Ni behöver inte göra någonting – vi sköter allt.\n` +
    `Tårtan levereras automatiskt på rätt dag.\n\n` +
    `Hör av er om ni har frågor på ${requireEnv("ADMIN_EMAIL")}\n\n` +
    `Hälsningar,\nHappysent-teamet`;

  return getResend().emails.send({
    from: from(),
    to: a.to,
    subject,
    text,
  });
}

export interface MonthlyInvoiceSummaryArgs {
  monthLabel: string; // e.g. "maj 2026"
  rows: Array<{
    companyName: string;
    deliveries: number;
    amount: number;
  }>;
  total: number;
}
export async function sendMonthlyInvoiceSummary(a: MonthlyInvoiceSummaryArgs) {
  const sek = (n: number) =>
    new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(n);
  const subject = `Happysent – Dags att fakturera ${a.monthLabel}`;
  const lines = a.rows.length
    ? a.rows
        .map(
          (r) =>
            `  • ${r.companyName.padEnd(30, " ")} ${String(r.deliveries).padStart(3, " ")} tårtor   ${sek(r.amount)}`,
        )
        .join("\n")
    : "  (Inga leveranser denna månad.)";

  const text =
    `Hej!\n\n` +
    `Här är månadens sammanställning för ${a.monthLabel}:\n\n` +
    `${lines}\n\n` +
    `Total: ${sek(a.total)}\n\n` +
    `Logga in på admin-panelen för att markera fakturorna som skickade.\n\n` +
    `Hälsningar,\nHappysent`;

  return getResend().emails.send({
    from: from(),
    to: requireEnv("ADMIN_EMAIL"),
    subject,
    text,
  });
}

export interface SystemErrorArgs {
  errorMessage: string;
  context?: string;
  timestamp: string; // ISO string
}
export async function sendSystemErrorEmail(a: SystemErrorArgs) {
  const subject = `⚠️ Happysent – Systemfel`;
  const text =
    `Ett fel uppstod i systemet:\n\n` +
    `${a.errorMessage}\n\n` +
    (a.context ? `Sammanhang: ${a.context}\n\n` : "") +
    `Tidpunkt: ${a.timestamp}\n\n` +
    `Kontrollera admin-panelen för mer information.`;

  return getResend().emails.send({
    from: from(),
    to: requireEnv("ADMIN_EMAIL"),
    subject,
    text,
  });
}
