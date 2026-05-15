/**
 * Run the same pipeline as production (writes web/.atlas-store/bundle.json).
 * Usage from repo root:
 *   export $(grep -v '^#' .env | xargs) && cd web && npx tsx scripts/run-atlas-local.mts
 */
import { mkdir, readFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadEnvFromRoot() {
  const envPath = resolve(__dirname, "../../.env");
  try {
    const raw = await readFile(envPath, "utf-8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env optional if vars already exported
  }
}

await loadEnvFromRoot();
process.chdir(resolve(__dirname, ".."));

const stores = resolve(__dirname, "../.atlas-store");
await mkdir(stores, { recursive: true });

const { runAtlasPipeline } = await import("../lib/pipeline/run");
await runAtlasPipeline();
console.log("OK — bundle saved under web/.atlas-store/bundle.json");
