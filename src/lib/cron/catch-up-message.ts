/** User-facing notice after catch-up on late employee insert. */
export function formatCatchUpNotice(daysAway: number, locale: "sv" | "en" = "sv"): string {
  if (locale === "en") {
    const base = `The birthday is in ${daysAway} day${daysAway === 1 ? "" : "s"} — the order has been started and a confirmation has been sent.`;
    if (daysAway < 7) {
      return `${base} The bakery has been notified on short notice.`;
    }
    return base;
  }

  const base = `Födelsedagen är om ${daysAway} dagar — beställningen är startad och bekräftelse har skickats.`;
  if (daysAway < 7) {
    return `${base} Bageriet har meddelats med kort varsel.`;
  }
  return base;
}
