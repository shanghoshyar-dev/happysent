/** Synligt tårtnamn utan osynliga tecken (DB kan ha unika suffix per bageri). */
export function displayProductName(name: string): string {
  return name.replace(/[\u200B-\u200D\uFEFF]/g, "");
}

/** Unikt DB-namn när global unik-constraint fortfarande gäller. */
export function uniqueProductNameForBakery(
  baseName: string,
  bakeryId: string,
): string {
  return `${baseName}\u200B${bakeryId.slice(0, 8)}`;
}
