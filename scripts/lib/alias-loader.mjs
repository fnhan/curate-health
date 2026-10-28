/**
 * Lets `node scripts/*.ts` resolve this project's `@/` imports.
 *
 *   node --import ./scripts/lib/alias-loader.mjs scripts/test-share-fallback.ts
 *
 * Node 24 strips TypeScript types on its own, so a .ts file under scripts/
 * runs with no build step. What it does not do is read the `paths` alias out
 * of tsconfig.json, so `@/lib/page-metadata` fails to resolve and the whole
 * module graph with it.
 *
 * This maps `@/` to the repository root and supplies the extension, since
 * the source omits it the way a bundler allows. Resolution only: nothing here
 * transforms code, so what the test imports is the same file Next compiles.
 */
import { existsSync } from "node:fs";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = new URL("../../", import.meta.url);
const EXTENSIONS = ["", ".ts", ".tsx", ".mjs", ".js", "/index.ts", "/index.tsx"];

function firstThatExists(base) {
  for (const extension of EXTENSIONS) {
    const candidate = new URL(base.href + extension);
    if (existsSync(fileURLToPath(candidate))) {
      return { url: candidate.href, shortCircuit: true };
    }
  }
  return null;
}

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const found = firstThatExists(new URL(specifier.slice(2), ROOT));
    if (found) return found;
  }

  /*
   * A relative import needs the same treatment. Node's ESM resolver requires
   * the extension and this source omits it throughout, so `./env` inside
   * sanity/lib/image.ts fails even once the alias above has worked.
   */
  if (specifier.startsWith(".") && context.parentURL) {
    const found = firstThatExists(new URL(specifier, context.parentURL));
    if (found) return found;
  }

  return nextResolve(specifier, context);
}

// Registering from inside the file that --import loads puts the hook on the
// loader thread, which is where resolution actually happens.
if (!process.env.__ALIAS_LOADER_REGISTERED) {
  process.env.__ALIAS_LOADER_REGISTERED = "1";
  register(pathToFileURL(fileURLToPath(import.meta.url)));
}
