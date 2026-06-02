import { CAKE_SELECTION_EMAIL_DAYS_BEFORE, CAKE_SELECTION_RESPONSE_DAYS } from "./constants";

export function selectionDeadlineFromDelivery(deliveryIso: string): string {
  const [y, m, d] = deliveryIso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  const daysBefore =
    CAKE_SELECTION_EMAIL_DAYS_BEFORE - CAKE_SELECTION_RESPONSE_DAYS;
  date.setUTCDate(date.getUTCDate() - daysBefore);
  return date.toISOString().slice(0, 10);
}

export function formatDeadlineSv(deadlineIso: string): string {
  const [y, m, d] = deadlineIso.split("-").map(Number);
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/Stockholm",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}
