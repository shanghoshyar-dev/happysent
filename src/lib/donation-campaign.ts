import { todayInStockholm } from "@/lib/holidays/swedish";

/** SEK per levererad tårta/blomma som fakturerats och betalats. */
export const DONATION_KR_PER_DELIVERY = 10;

export function stockholmYear(from: Date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en", {
      timeZone: "Europe/Stockholm",
      year: "numeric",
    }).format(from),
  );
}

/** Slutet av kampanjår Y: 31 december 23:59:59 Europe/Stockholm. */
export function endOfCampaignYearMs(year: number): number {
  return new Date(`${year}-12-31T23:59:59+01:00`).getTime();
}

/** Slutet av insamlingsperioden: 31 december 23:59:59 Europe/Stockholm. */
export function donationCampaignEndMs(from: Date = todayInStockholm()): number {
  const year = stockholmYear(from);
  let end = new Date(`${year}-12-31T23:59:59+01:00`).getTime();
  if (from.getTime() > end) {
    end = new Date(`${year + 1}-12-31T23:59:59+01:00`).getTime();
  }
  return end;
}
