/** Approximate reading time in minutes (Swedish prose ~200 wpm). */
export function readingTimeMinutesFromText(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
