export const DEFAULT_CATALOG_PDF = "/marketing/tartkatalog.pdf";

export const BAKERY_CATALOGS_BUCKET = "bakery_catalogs";

/** Publik URL eller sökväg till bageriets katalog-PDF. */
export function getBakeryCatalogPdfUrl(
  catalogPdfPath: string | null | undefined,
): string {
  if (!catalogPdfPath?.trim()) return DEFAULT_CATALOG_PDF;
  const trimmed = catalogPdfPath.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) return trimmed;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return DEFAULT_CATALOG_PDF;
  return `${base}/storage/v1/object/public/${BAKERY_CATALOGS_BUCKET}/${trimmed}`;
}
