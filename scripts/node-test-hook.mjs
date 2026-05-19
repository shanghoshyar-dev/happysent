import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const srcRoot = path.resolve(import.meta.dirname, "../src");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = path.join(srcRoot, specifier.slice(2));
    const withTs = `${target}.ts`;
    if (fs.existsSync(withTs)) {
      return nextResolve(pathToFileURL(withTs).href, context);
    }
  }

  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    !path.extname(specifier)
  ) {
    const parent = path.dirname(fileURLToPath(context.parentURL));
    const candidate = path.resolve(parent, `${specifier}.ts`);
    if (fs.existsSync(candidate)) {
      return nextResolve(pathToFileURL(candidate).href, context);
    }
  }

  return nextResolve(specifier, context);
}
