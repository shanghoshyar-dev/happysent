/** Fältnamn som inte ska fyllas i av riktiga användare (dolt i UI). */
export const HONEYPOT_FIELD_NAME = "company_fax";

export function isHoneypotFilled(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD_NAME);
  if (typeof value !== "string") return false;
  return value.trim().length > 0;
}
