/** Swedish-friendly slug for URLs (blog posts). */
export function slugify(input: string): string {
  const base = input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
  return base.length > 0 ? base : "inlagg";
}
