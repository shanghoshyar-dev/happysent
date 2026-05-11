/**
 * Swedish public holidays + delivery date adjustment.
 *
 * All dates here are treated as "calendar dates" — independent of timezone.
 * Use ISO date strings (YYYY-MM-DD) to interop with Postgres `date` columns.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Build a UTC midnight Date from y/m/d numbers (m is 1-indexed). */
function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

/** Format a Date as YYYY-MM-DD using its UTC fields. */
export function toDateString(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse a YYYY-MM-DD string into a UTC midnight Date. */
export function parseDateString(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return utcDate(y, m, d);
}

/** Add `days` to `d`, returning a new Date. */
export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * MS_PER_DAY);
}

/**
 * Easter Sunday for a given year, using the
 * Anonymous Gregorian (Meeus / Jones / Butcher) algorithm.
 */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=mars, 4=april
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utcDate(year, month, day);
}

/** Friday between June 19 and June 25 (inclusive). */
function midsummersEve(year: number): Date {
  for (let day = 19; day <= 25; day++) {
    const d = utcDate(year, 6, day);
    if (d.getUTCDay() === 5) return d;
  }
  throw new Error("midsummersEve: not found");
}

/** Saturday between June 20 and June 26 (inclusive). */
function midsummersDay(year: number): Date {
  for (let day = 20; day <= 26; day++) {
    const d = utcDate(year, 6, day);
    if (d.getUTCDay() === 6) return d;
  }
  throw new Error("midsummersDay: not found");
}

/** Saturday between October 31 and November 6 (inclusive). */
function allSaintsDay(year: number): Date {
  for (let day = 31; day <= 31; day++) {
    const d = utcDate(year, 10, day);
    if (d.getUTCDay() === 6) return d;
  }
  for (let day = 1; day <= 6; day++) {
    const d = utcDate(year, 11, day);
    if (d.getUTCDay() === 6) return d;
  }
  throw new Error("allSaintsDay: not found");
}

export interface SwedishHoliday {
  name: string;
  date: Date;
}

/** All Swedish public holidays for a given year. */
export function swedishHolidays(year: number): SwedishHoliday[] {
  const easter = easterSunday(year);
  return [
    { name: "Nyårsdagen", date: utcDate(year, 1, 1) },
    { name: "Trettondedag jul", date: utcDate(year, 1, 6) },
    { name: "Långfredagen", date: addDays(easter, -2) },
    { name: "Påskdagen", date: easter },
    { name: "Annandag påsk", date: addDays(easter, 1) },
    { name: "Valborg", date: utcDate(year, 4, 30) },
    { name: "Första maj", date: utcDate(year, 5, 1) },
    { name: "Kristi himmelsfärdsdag", date: addDays(easter, 39) },
    { name: "Pingstdagen", date: addDays(easter, 49) },
    { name: "Nationaldagen", date: utcDate(year, 6, 6) },
    { name: "Midsommarafton", date: midsummersEve(year) },
    { name: "Midsommardagen", date: midsummersDay(year) },
    { name: "Alla helgons dag", date: allSaintsDay(year) },
    { name: "Julafton", date: utcDate(year, 12, 24) },
    { name: "Juldagen", date: utcDate(year, 12, 25) },
    { name: "Annandag jul", date: utcDate(year, 12, 26) },
    { name: "Nyårsafton", date: utcDate(year, 12, 31) },
  ];
}

/** True if `date` is a Swedish public holiday. */
export function isSwedishHoliday(date: Date): boolean {
  const target = toDateString(date);
  return swedishHolidays(date.getUTCFullYear()).some(
    (h) => toDateString(h.date) === target,
  );
}

/** True if `date` is a Saturday or Sunday. */
export function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

/**
 * If the given date falls on a weekend or Swedish public holiday,
 * walk backwards day-by-day until we hit a valid weekday.
 *
 * Example: birthday on Saturday → delivery on the preceding Friday.
 *          Birthday on Långfredagen (Friday) → delivery on Thursday.
 */
export function adjustDeliveryDate(date: Date): Date {
  let d = date;
  // Cap iterations to avoid pathological loops; in practice 1-3 steps is enough.
  for (let i = 0; i < 14; i++) {
    if (!isWeekend(d) && !isSwedishHoliday(d)) {
      return d;
    }
    d = addDays(d, -1);
  }
  return d;
}

/**
 * Compute this year's birthday for an employee.
 * Handles Feb 29 on non-leap years by falling back to Feb 28.
 */
export function birthdayThisYear(birthdayIso: string, today: Date): Date {
  const [, m, d] = birthdayIso.split("-").map(Number);
  const year = today.getUTCFullYear();
  // Construct the date — Date.UTC normalises Feb 29 → Mar 1, so detect & adjust.
  let candidate = utcDate(year, m, d);
  if (candidate.getUTCMonth() !== m - 1) {
    candidate = utcDate(year, 2, 28);
  }
  return candidate;
}

/** Today at UTC midnight, projected to the Europe/Stockholm calendar day. */
export function todayInStockholm(now: Date = new Date()): Date {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return utcDate(get("year"), get("month"), get("day"));
}

/** Whole-day difference between two UTC midnight dates. */
export function diffInDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);
}

/** True if `date` is the last calendar day of its month. */
export function isLastDayOfMonth(date: Date): boolean {
  const next = addDays(date, 1);
  return next.getUTCMonth() !== date.getUTCMonth();
}

/** Long Swedish month label, e.g. "maj 2026". */
export function swedishMonthLabel(date: Date): string {
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  return fmt.format(date);
}
