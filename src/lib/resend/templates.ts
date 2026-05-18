import "server-only";

import { getResend } from "@/lib/resend/client";
import {
  getAppSettings,
  resolveAdminEmail,
} from "@/lib/app-settings";

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

async function mailFrom(): Promise<string> {
  const settings = await getAppSettings();
  const email = resolveAdminEmail(settings);
  if (!email) throw new Error("ADMIN_EMAIL saknas i miljö eller inställningar.");
  return `Happysent <${email}>`;
}

async function adminInbox(): Promise<string> {
  const email = resolveAdminEmail(await getAppSettings());
  if (!email) throw new Error("ADMIN_EMAIL saknas.");
  return email;
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
    from: await mailFrom(),
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
  contactPhone?: string | null;
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
  const contactTel = a.contactPhone?.trim()
    ? a.contactPhone.trim()
    : "(saknas i kundregistret — kontakta Happysent vid leveransfrågor)";
  const text =
    `Hej ${a.bakeryName}!\n\n` +
    `Vi bekräftar följande beställning:\n\n` +
    `Kund:             ${a.employeeFirstName} ${a.employeeLastName} fyller år den ${formatSwedishDate(a.deliveryDate)}\n` +
    `Företag:          ${a.companyName}\n` +
    `Leveransadress:   ${deliveryAddress}\n` +
    `Kontakt telefon:  ${contactTel}\n` +
    `Antal personer:   ${a.numberOfPeople}\n` +
    `Leveransdatum:    ${formatSwedishDate(a.deliveryDate)}\n` +
    `Skicka faktura till: ${await adminInbox()}\n\n` +
    `Tack!\nHappysent`;

  return getResend().emails.send({
    from: await mailFrom(),
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
    from: await mailFrom(),
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
    from: await mailFrom(),
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
  const s = await getAppSettings();
  const slot = `mellan ${s.delivery_window_start} och ${s.delivery_window_end}`;
  const subject = `🎂 Grattis ${a.employeeFirstName}!`;
  const text =
    `Hej ${a.companyName}!\n\n` +
    `Idag fyller ${a.employeeFirstName} år!\n` +
    `Tårtan levereras idag ${slot}.\n\n` +
    `Vi hoppas ${a.employeeFirstName} får en fantastisk dag!\n\n` +
    `Hälsningar,\nHappysent`;

  return getResend().emails.send({
    from: await mailFrom(),
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
  phone: string;
  message: string;
  /** Läggs före standardämnesraden (t.ex. vid fel som hindrar körad). */
  subjectPrefix?: string;
}
export async function sendContactAdminNotification(a: ContactAdminArgs) {
  const subject =
    `${a.subjectPrefix ?? ""}Nytt kontaktmeddelande från ${a.name} (${a.company})`.trim();
  const text =
    `Ny förfrågan via happysent.com/kontakt:\n\n` +
    `Namn:     ${a.name}\n` +
    `Företag:  ${a.company}\n` +
    `Mejl:     ${a.email}\n` +
    `Telefon:  ${a.phone}\n\n` +
    `Meddelande:\n${a.message || "(inget meddelande)"}\n`;

  return getResend().emails.send({
    from: await mailFrom(),
    to: await adminInbox(),
    replyTo: a.email,
    subject,
    text,
  });
}

export interface EmployeeRequestAdminRow {
  first_name: string;
  last_name: string;
  birthday_iso: string; // YYYY-MM-DD
}

export interface EmployeeRequestAdminArgs {
  action: "add" | "remove";
  companyName: string;
  address: string;
  city: string;
  postalCode: string;
  employees: EmployeeRequestAdminRow[];
  numberOfPeople: number | null;
  message: string;
  submittedByEmail: string;
}
export async function sendEmployeeRequestAdminNotification(
  a: EmployeeRequestAdminArgs,
) {
  const actionLabel = a.action === "add" ? "Lägg till anställd" : "Ta bort anställd";
  const count = a.employees.length;
  const names = a.employees.map((e) => `${e.first_name} ${e.last_name}`).join(", ");
  const subject =
    count === 1
      ? `${actionLabel}: ${names} (${a.companyName})`
      : `${actionLabel}: ${count} personer (${a.companyName})`;

  const peopleBlock = a.employees
    .map(
      (e, i) =>
        `${i + 1}. ${e.first_name} ${e.last_name} — födelsedatum ${formatSwedishDate(e.birthday_iso)}`,
    )
    .join("\n");

  const extraFields =
    a.action === "add"
      ? `Antal personer på avdelningen: ${a.numberOfPeople ?? "(saknas)"}\n`
      : "";

  const text =
    `Ny ${actionLabel.toLowerCase()}-förfrågan via happysent.com/kontakt:\n\n` +
    `Företag:          ${a.companyName}\n` +
    `Adress:           ${a.address}\n` +
    `Postnummer:       ${a.postalCode}\n` +
    `Ort:              ${a.city}\n\n` +
    `Personer (${count}):\n${peopleBlock}\n\n` +
    extraFields +
    `Avsändarens mejl: ${a.submittedByEmail}\n\n` +
    `Meddelande:\n${a.message || "(inget meddelande)"}\n`;

  return getResend().emails.send({
    from: await mailFrom(),
    to: await adminInbox(),
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
    from: await mailFrom(),
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
    `Hör av er om ni har frågor på ${await adminInbox()}\n\n` +
    `Hälsningar,\nHappysent-teamet`;

  return getResend().emails.send({
    from: await mailFrom(),
    to: a.to,
    subject,
    text,
  });
}

/** Batch notification: tillagda och/eller borttagna anställda (max en mejl per företag och kalenderdag, nästa morgon via cron). */
export interface EmployeeChangesDigestArgs {
  to: string;
  companyName: string;
  digestDateIso: string;
  entries: Array<{
    kind: "add" | "remove";
    first_name: string;
    last_name: string;
    birthday?: string | null;
    personal_number?: string | null;
  }>;
}

/** Sex siffror ÅÅMMDD lagrade kan visas som ÅÅ-MM-DD; äldre värden visas som inskickat. */
function formatPersonalIdentifierForMail(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 6) {
    return `${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4, 6)}`;
  }
  return raw.trim();
}

function formatDigestDetailLine(e: EmployeeChangesDigestArgs["entries"][number]): string {
  const name = `${e.first_name} ${e.last_name}`;
  const bits: string[] = [];
  if (e.birthday) {
    bits.push(`födelsedatum ${formatSwedishDate(e.birthday)}`);
  } else if (e.personal_number?.trim()) {
    bits.push(`ÅÅMMDD ${formatPersonalIdentifierForMail(e.personal_number.trim())}`);
  }
  const extra = bits.length > 0 ? ` (${bits.join(", ")})` : "";
  const verb = e.kind === "remove" ? "Borttagen" : "Tillagd";
  return `• ${verb}: ${name}${extra}`;
}

export async function sendEmployeeChangesDigest(a: EmployeeChangesDigestArgs) {
  const adds = a.entries.filter((e) => e.kind !== "remove");
  const removes = a.entries.filter((e) => e.kind === "remove");
  const lines = a.entries.map(formatDigestDetailLine).join("\n");

  let subject: string;
  if (adds.length > 0 && removes.length > 0) {
    subject = `Personaländringar registrerade – Happysent`;
  } else if (removes.length > 0) {
    subject =
      removes.length === 1
        ? `Anställd borttagen – Happysent`
        : `${removes.length} anställda borttagna – Happysent`;
  } else {
    const count = adds.length;
    subject =
      count === 1
        ? `Ny anställd registrerad – Happysent`
        : `${count} nya anställda registrerade – Happysent`;
  }

  const text =
    `Hej ${a.companyName}!\n\n` +
    `Vi har registrerat följande ändring(ar) för er (${formatSwedishDate(a.digestDateIso)}):\n\n` +
    `${lines}\n\n` +
    `Detta är en automatisk bekräftelse. Vid felaktig uppgift, kontakta oss på info@happysent.com.\n\n` +
    `Hälsningar,\nHappysent`;

  return getResend().emails.send({
    from: await mailFrom(),
    to: a.to,
    subject,
    text,
  });
}

/** @deprecated Använd sendEmployeeChangesDigest */
export async function sendEmployeeAdditionsDigest(a: {
  to: string;
  companyName: string;
  digestDateIso: string;
  names: Array<{ first_name: string; last_name: string }>;
}) {
  return sendEmployeeChangesDigest({
    to: a.to,
    companyName: a.companyName,
    digestDateIso: a.digestDateIso,
    entries: a.names.map((n) => ({
      kind: "add" as const,
      first_name: n.first_name,
      last_name: n.last_name,
      birthday: null,
      personal_number: null,
    })),
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
    from: await mailFrom(),
    to: await adminInbox(),
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
    from: await mailFrom(),
    to: await adminInbox(),
    subject,
    text,
  });
}
