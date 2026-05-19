/** Tar bort allt utom siffror. */
export function digitsOnlyOrganizationNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** Svenskt organisationsnummer (10 siffror, kontrollsiffra). */
export function isValidSwedishOrganizationNumber(digits: string): boolean {
  if (!/^\d{10}$/.test(digits)) return false;
  const weights = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let n = Number(digits[i]) * weights[i];
    if (n > 9) n -= 9;
    sum += n;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(digits[9]);
}

/** Returnerar 10 siffror om giltigt, annars null. */
export function normalizeOrganizationNumber(raw: string): string | null {
  const digits = digitsOnlyOrganizationNumber(raw);
  if (!isValidSwedishOrganizationNumber(digits)) return null;
  return digits;
}

export function formatOrganizationNumber(digits: string): string {
  const d = digitsOnlyOrganizationNumber(digits);
  if (d.length !== 10) return digits.trim();
  return `${d.slice(0, 6)}-${d.slice(6)}`;
}
