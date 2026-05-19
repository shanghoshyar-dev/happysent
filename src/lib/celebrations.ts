import {
  adjustDeliveryDate,
  addDays,
  birthdayThisYear,
  toDateString,
} from "./holidays/swedish";

export type CelebrationFrequency = "every_year" | "twice_yearly" | "decade";
export type GiftType = "cake" | "flowers";

export const DECADE_MILESTONE_AGES = [20, 30, 40, 50, 60, 70, 80] as const;

export interface EmployeeCelebrationRule {
  birthday: string;
  celebration_frequency: CelebrationFrequency;
}

/** Age in full years on `onDate` (calendar comparison, UTC fields). */
export function ageOnDate(birthdayIso: string, onDate: Date): number {
  const [by, bm, bd] = birthdayIso.split("-").map(Number);
  const y = onDate.getUTCFullYear();
  const m = onDate.getUTCMonth() + 1;
  const d = onDate.getUTCDate();
  let age = y - by;
  if (m < bm || (m === bm && d < bd)) {
    age -= 1;
  }
  return age;
}

export function isDecadeMilestoneAge(age: number): boolean {
  return (
    age >= DECADE_MILESTONE_AGES[0] &&
    age <= DECADE_MILESTONE_AGES[DECADE_MILESTONE_AGES.length - 1] &&
    age % 10 === 0
  );
}

/** Nominal birthday in `year` (handles Feb 29). */
export function birthdayInYear(birthdayIso: string, year: number): Date {
  return birthdayThisYear(birthdayIso, new Date(Date.UTC(year, 5, 15)));
}

function addMonthsUtc(date: Date, months: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const target = new Date(Date.UTC(y, m + months, d));
  if (target.getUTCDate() !== d) {
    return new Date(Date.UTC(y, m + months + 1, 0));
  }
  return target;
}

export type CelebrationOccasion = "birthday" | "half_year";

/**
 * Calendar occasions in `year` before holiday adjustment.
 * `decade` → only birthday when milestone age; `twice_yearly` → birthday + 6 months.
 */
export function celebrationOccasionsInYear(
  rule: EmployeeCelebrationRule,
  year: number,
): Array<{ occasion: CelebrationOccasion; nominalDate: Date }> {
  const birthday = birthdayInYear(rule.birthday, year);
  const age = ageOnDate(rule.birthday, birthday);

  switch (rule.celebration_frequency) {
    case "every_year":
      return [{ occasion: "birthday", nominalDate: birthday }];
    case "decade":
      if (!isDecadeMilestoneAge(age)) return [];
      return [{ occasion: "birthday", nominalDate: birthday }];
    case "twice_yearly":
      return [
        { occasion: "birthday", nominalDate: birthday },
        { occasion: "half_year", nominalDate: addMonthsUtc(birthday, 6) },
      ];
    default:
      return [{ occasion: "birthday", nominalDate: birthday }];
  }
}

export interface DeliveryOccasion {
  occasion: CelebrationOccasion;
  nominalDate: Date;
  deliveryDate: Date;
  deliveryIso: string;
}

/** Delivery dates (weekday-adjusted) for all occasions in the given calendar year. */
export function deliveryOccasionsInYear(
  rule: EmployeeCelebrationRule,
  year: number,
): DeliveryOccasion[] {
  return celebrationOccasionsInYear(rule, year).map(({ occasion, nominalDate }) => {
    const deliveryDate = adjustDeliveryDate(nominalDate);
    return {
      occasion,
      nominalDate,
      deliveryDate,
      deliveryIso: toDateString(deliveryDate),
    };
  });
}

/** Whether this specific delivery should run the order/reminder pipeline. */
export function shouldProcessDelivery(
  rule: EmployeeCelebrationRule,
  delivery: DeliveryOccasion,
): boolean {
  if (rule.celebration_frequency === "decade") {
    const age = ageOnDate(rule.birthday, delivery.nominalDate);
    return isDecadeMilestoneAge(age);
  }
  return true;
}

export function parseCelebrationFrequency(
  raw: string,
): CelebrationFrequency | null {
  const n = raw.trim().toLowerCase();
  if (
    n === "every_year" ||
    n === "varje år" ||
    n === "varje ar" ||
    n === "årligen" ||
    n === "arlig"
  ) {
    return "every_year";
  }
  if (
    n === "twice_yearly" ||
    n === "halvår" ||
    n === "halvar" ||
    n === "två gånger" ||
    n === "tva ganger" ||
    n === "2x"
  ) {
    return "twice_yearly";
  }
  if (
    n === "decade" ||
    n === "10-år" ||
    n === "10-ar" ||
    n === "jämna år" ||
    n === "jamna ar" ||
    n === "20-30-40"
  ) {
    return "decade";
  }
  return null;
}

export function parseGiftType(raw: string): GiftType | null {
  const n = raw.trim().toLowerCase();
  if (n === "cake" || n === "tårta" || n === "tarta" || n === "kaka") {
    return "cake";
  }
  if (
    n === "flowers" ||
    n === "blommor" ||
    n === "blomma" ||
    n === "bukett"
  ) {
    return "flowers";
  }
  return null;
}

export function celebrationFrequencyLabel(f: CelebrationFrequency): string {
  switch (f) {
    case "every_year":
      return "Varje år";
    case "twice_yearly":
      return "Två gånger per år (födelsedag + halvår)";
    case "decade":
      return "Jämna år (20, 30, 40 …)";
  }
}

export function giftTypeLabel(g: GiftType): string {
  return g === "flowers" ? "Blommor" : "Tårta";
}
