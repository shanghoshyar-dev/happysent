/**
 * Sets step mascot PNG backgrounds to pure white (#FFFFFF).
 * Replaces cream (#FDF6EC), transparency, and other light backdrop pixels.
 * Run: npm run mascots:white-bg
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "public", "marketing", "how-it-works");

const CREAM = { r: 253, g: 246, b: 236 };
const CREAM_TOLERANCE = 48;

const files = [
  "step-1-register.png",
  "step-2-book.png",
  "step-3-deliver.png",
];

function colorDistance(r, g, b, target) {
  return Math.sqrt(
    (r - target.r) ** 2 + (g - target.g) ** 2 + (b - target.b) ** 2,
  );
}

/** Backdrop pixels (cream, off-white, or transparent). */
function isBackgroundPixel(r, g, b, a) {
  if (a < 200) return true;
  if (colorDistance(r, g, b, CREAM) <= CREAM_TOLERANCE) return true;
  // Warm off-white / light cream fringe from compression
  if (r >= 248 && g >= 244 && b >= 232) return true;
  if (r >= 240 && g >= 235 && b >= 225 && r - b < 30) return true;
  return false;
}

for (const file of files) {
  const input = path.join(dir, file);

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
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(input);

  console.log(`White background: ${file}`);
}
