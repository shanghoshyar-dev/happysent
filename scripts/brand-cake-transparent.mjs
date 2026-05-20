/**
 * Makes white/near-white background transparent on brand-cake.png
 * so the icon blends with cream cards and white nav/footer.
 * Run: npm run brand-cake:transparent
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(__dirname, "..", "public", "marketing", "brand-cake.png");

const WHITE = { r: 255, g: 255, b: 255 };
const TOLERANCE = 40;

function colorDistance(r, g, b, target) {
  return Math.sqrt(
    (r - target.r) ** 2 + (g - target.g) ** 2 + (b - target.b) ** 2,
  );
}

function isBackgroundPixel(r, g, b, a) {
  if (a < 128) return true;
  if (colorDistance(r, g, b, WHITE) <= TOLERANCE) return true;
  if (r >= 248 && g >= 248 && b >= 248) return true;
  return false;
}

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = data[i + 3];
  if (isBackgroundPixel(r, g, b, a)) {
    data[i + 3] = 0;
  }
}

await sharp(data, {
  raw: {
    width: info.width,
    height: info.height,
    channels: 4,
  },
})
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(input);

console.log("Transparent background: brand-cake.png");
