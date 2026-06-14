import type { GiftType } from "@/lib/celebrations";
import { CAKE_SELECTION_AUTO_PICK_DAYS_BEFORE } from "@/lib/cake-selection/constants";
import type { ReminderType } from "@/types/database";

/** Reminder types to send when catching up after a late employee insert (0–13 days). */
export function catchUpReminderTypes(
  daysAway: number,
  giftType: GiftType,
): ReminderType[] {
  if (daysAway < 0 || daysAway >= 14) return [];

  const types: ReminderType[] = [];
  if (daysAway >= 10) types.push("14_days");
  if (daysAway <= 7) {
    types.push(giftType === "flowers" ? "7_days_florist" : "7_days_bakery");
    types.push("7_days_company");
  }
  if (daysAway === 1) types.push("1_day");
  if (daysAway === 0) types.push("day_of");
  return types;
}

export function isCatchUpEligible(daysAway: number): boolean {
  return daysAway >= 0 && daysAway < 14;
}

export function shouldAutoPickCake(daysAway: number): boolean {
  return daysAway <= CAKE_SELECTION_AUTO_PICK_DAYS_BEFORE;
}

export function cronReminderTypes(daysAway: number): ReminderType[] {
  switch (daysAway) {
    case 14:
      return ["14_days"];
    case 7:
      return ["7_days_bakery", "7_days_company"];
    case 1:
      return ["1_day"];
    case 0:
      return ["day_of"];
    default:
      return [];
  }
}

export function cronPartnerReminderType(giftType: GiftType): ReminderType | null {
  if (giftType === "flowers") return "7_days_florist";
  return "7_days_bakery";
}

export function cronActionsForDay(
  daysAway: number,
  giftType: GiftType,
): ReminderType[] {
  if (daysAway === 7) {
    const partner = cronPartnerReminderType(giftType);
    return partner ? [partner, "7_days_company"] : ["7_days_company"];
  }
  return cronReminderTypes(daysAway);
}
