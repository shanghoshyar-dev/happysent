import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  DEFAULT_CATALOG_PDF,
  getBakeryCatalogPdfUrl,
} from "./catalog-url";

export { BAKERY_CATALOGS_BUCKET, DEFAULT_CATALOG_PDF, getBakeryCatalogPdfUrl } from "./catalog-url";

export async function loadBakeryCatalogPdfBase64(
  catalogPdfPath: string | null | undefined,
): Promise<string | null> {
  const url = getBakeryCatalogPdfUrl(catalogPdfPath);
  if (url.startsWith("/")) {
    try {
      const filePath = path.join(process.cwd(), "public", url.slice(1));
      const buf = await readFile(filePath);
      return buf.toString("base64");
    } catch {
      return null;
    }
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      try {
        const fallbackPath = path.join(
          process.cwd(),
          "public",
          DEFAULT_CATALOG_PDF.slice(1),
        );
        const buf = await readFile(fallbackPath);
        return buf.toString("base64");
      } catch {
        return null;
      }
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.toString("base64");
  } catch {
    return null;
  }
}
