import { register } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const hook = pathToFileURL(
  path.join(import.meta.dirname, "node-test-hook.mjs"),
).href;

register(hook, import.meta.url);
