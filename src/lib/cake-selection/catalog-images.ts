import { displayProductName } from "./product-name";

/** Slug per katalognamn — bilder i public/marketing/tartor/. */
const CAKE_IMAGE_SLUGS: Record<string, string> = {
  "HappySent Tårta": "happysent-tarta",
  Budapestårta: "budapesttarta",
  Jordgubbstårta: "jordgubbstarta",
  Chokladtrippel: "chokladtrippel",
  Hallontårta: "hallontarta",
  Princesstårta: "princesstarta",
  Schwarzwaldtårta: "schwarzwaldtarta",
  Lyxprincesstårta: "lyxprincesstarta",
  "Jordgubb & rabarbertårta": "jordgubb-rabarbertarta",
};

/** Publik bild-URL för en katalogtårta, eller null om ingen bild finns. */
export function getCakeImageUrl(productName: string): string | null {
  const slug = CAKE_IMAGE_SLUGS[displayProductName(productName)];
  if (!slug) return null;
  return `/marketing/tartor/${slug}.jpeg`;
}
