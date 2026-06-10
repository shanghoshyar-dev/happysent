/** Synligt tårtnamn utan osynliga tecken (DB kan ha unikt suffix per bageri). */
export function displayProductName(name: string): string {
  const separator = name.indexOf("\u200B");
  if (separator !== -1) {
    return name.slice(0, separator);
  }
  return name.replace(/[\u200B-\u200D\uFEFF]/g, "");
}

/** Unikt DB-namn när global unik-constraint fortfarande gäller. */
export function uniqueProductNameForBakery(
  baseName: string,
  bakeryId: string,
): string {
  return `${baseName}\u200B${bakeryId.slice(0, 8)}`;
}
