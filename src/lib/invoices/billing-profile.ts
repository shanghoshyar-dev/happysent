import "server-only";

/** HappySent-utfärdarens uppgifter på faktura-PDF (valfria env-variabler). */
export interface IssuerProfile {
  name: string;
  addressLine: string;
  orgNumber: string | null;
  vatNumber: string | null;
  bankgiro: string | null;
  email: string | null;
}

export function getIssuerProfile(): IssuerProfile {
  return {
    name: process.env.HAPPYSENT_LEGAL_NAME?.trim() || "HappySent",
    addressLine:
      process.env.HAPPYSENT_ADDRESS?.trim() || "Malmö, Sverige",
    orgNumber: process.env.HAPPYSENT_ORG_NUMBER?.trim() || null,
    vatNumber: process.env.HAPPYSENT_VAT_NUMBER?.trim() || null,
    bankgiro: process.env.HAPPYSENT_BANKGIRO?.trim() || null,
    email: process.env.HAPPYSENT_BILLING_EMAIL?.trim() || null,
  };
}
