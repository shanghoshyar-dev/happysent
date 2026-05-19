/** Next.js kastar vid redirect/notFound — ska inte visas som formulärfel. */
export function isNextNavigationError(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("digest" in err)) {
    return false;
  }
  const digest = String((err as { digest: unknown }).digest);
  return digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND");
}
