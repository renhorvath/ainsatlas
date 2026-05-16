import { readFile } from "fs/promises";
import path from "path";

import Anthropic from "@anthropic-ai/sdk";

import { buildProvenance, loadBundle, saveBundle, type AtlasBundle } from "../atlas-bundle";
import type { Conference } from "../conferences";
import { requireKeys } from "../config";
import { hasSubstantiveExtract, hasUsableRaw } from "../extract-coverage";
import { extractFromRaw } from "./extract";
import { scrapeConference } from "./scrape";
import { synthesizeAll } from "./synthesize";

export type PipelineOptions = {
  /** If set, only scrape+extract this id; always re-synthesizes all. */
  conferenceId?: string;
};

const EXTRACT_CONCURRENCY = 3;

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  const workers = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}

/** Use web/conferences.json so URL edits in Git apply on the next refresh (not stale Blob list). */
async function syncConferencesFromFile(bundle: AtlasBundle): Promise<void> {
  try {
    const text = await readFile(path.join(process.cwd(), "conferences.json"), "utf-8");
    const rows = JSON.parse(text) as Conference[];
    if (Array.isArray(rows) && rows.length > 0) {
      bundle.conferences = rows;
    }
  } catch {
    // keep bundle list if file missing
  }
}

function anySuccessfulScrape(bundle: AtlasBundle, conferences: Conference[]): boolean {
  return conferences.some((c) => hasUsableRaw(bundle.raw[c.id]));
}

/** Scrape + extract; saves bundle with synthesis cleared (avoids stale Insights). */
export async function runScrapeExtractPhase(options: PipelineOptions = {}): Promise<void> {
  const { firecrawl, anthropic } = requireKeys();
  const client = new Anthropic({ apiKey: anthropic });
  const bundle = await loadBundle();
  await syncConferencesFromFile(bundle);

  const targets: Conference[] = options.conferenceId
    ? bundle.conferences.filter((c) => c.id === options.conferenceId)
    : bundle.conferences;

  if (targets.length === 0) {
    throw new Error(
      options.conferenceId
        ? `Conference "${options.conferenceId}" not found.`
        : "No conferences in list.",
    );
  }

  const pairs = await mapPool(targets, EXTRACT_CONCURRENCY, async (conf) => {
    const raw = await scrapeConference(conf, firecrawl);
    const extracted = (await extractFromRaw(client, raw, conf.id)) as AtlasBundle["extracted"][string];
    return { id: conf.id, raw, extracted };
  });

  for (const { id, raw, extracted } of pairs) {
    bundle.raw[id] = raw;
    bundle.extracted[id] = extracted;
  }

  bundle.provenance = buildProvenance(bundle);
  bundle.synthesis = null;
  bundle.meta = {
    exportedAt: new Date().toISOString(),
    synthesisCopied: false,
  };
  await saveBundle(bundle);

  if (!anySuccessfulScrape(bundle, targets)) {
    const samples = targets
      .map((c) => {
        const r = bundle.raw[c.id];
        return r ? `${c.name}: ${r.error || "(empty body)"}` : `${c.name}: (no raw)`;
      })
      .slice(0, 4)
      .join(" · ");
    throw new Error(
      `All ${targets.length} Firecrawl scrapes failed — no programme text to analyze. ${samples}. ` +
        `On Vercel: Project → Settings → Environment Variables → ensure FIRECRAWL_API_KEY is set for Production ` +
        `(same value as local .env; key usually starts with fc-). Redeploy after saving, then run Refresh again.`,
    );
  }
}

/** Re-extract thin rows, synthesize, save — no Firecrawl (fits after scrape on Vercel). */
export async function runSynthesisPhase(): Promise<void> {
  const { anthropic } = requireKeys();
  const client = new Anthropic({ apiKey: anthropic });
  const bundle = await loadBundle();

  const retryTargets = bundle.conferences.filter(
    (c) => hasUsableRaw(bundle.raw[c.id]) && !hasSubstantiveExtract(bundle.extracted[c.id]),
  );

  if (retryTargets.length > 0) {
    const repaired = await mapPool(retryTargets, EXTRACT_CONCURRENCY, async (conf) => {
      const raw = bundle.raw[conf.id];
      const extracted = (await extractFromRaw(client, raw, conf.id)) as AtlasBundle["extracted"][string];
      return { id: conf.id, extracted };
    });
    for (const { id, extracted } of repaired) {
      bundle.extracted[id] = extracted;
    }
  }

  const withExtract = bundle.conferences.filter((c) => hasSubstantiveExtract(bundle.extracted[c.id]));
  if (withExtract.length === 0) {
    throw new Error(
      "No programme extractions available for synthesis. Run “Refresh all conferences” first, or check Anthropic API key on Vercel.",
    );
  }

  bundle.synthesis = (await synthesizeAll(
    client,
    bundle.conferences,
    bundle.extracted,
  )) as AtlasBundle["synthesis"];

  bundle.provenance = buildProvenance(bundle);
  bundle.meta = {
    exportedAt: new Date().toISOString(),
    synthesisCopied: true,
  };

  await saveBundle(bundle);
}

export async function runAtlasPipeline(options: PipelineOptions = {}): Promise<void> {
  await runScrapeExtractPhase(options);
  await runSynthesisPhase();
}
