import { getSiteUrl } from "@/lib/site-url";

export function cakeSelectionUrl(token: string): string {
  return `${getSiteUrl()}/valja-tarta/${token}`;
}
