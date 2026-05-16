import { readFile } from "fs/promises";
import path from "path";

import Anthropic from "@anthropic-ai/sdk";

import { buildProvenance, loadBundle, saveBundle, type AtlasBundle } from "../atlas-bundle";
import type { Conference } from "../conferences";
import { requireKeys } from "../config";
import { extractFromRaw } from "./extract";
import { scrapeConference } from "./scrape";
import { synthesizeAll } from "./synthesize";

export type PipelineOptions = {
  /** If set, only scrape+extract this id; always re-synthesizes all. */
  conferenceId?: string;
};

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
  return conferences.some((c) => {
    const r = bundle.raw[c.id];
    return Boolean(r && !r.error && (r.raw_content ?? "").trim().length > 0);
  });
}

export async function runAtlasPipeline(options: PipelineOptions = {}): Promise<void> {
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

  // Scrape + extract in parallel (sequential was ~7+ min locally; exceeds Vercel 300s limit).
  const pairs = await Promise.all(
    targets.map(async (conf) => {
      const raw = await scrapeConference(conf, firecrawl);
      const extracted = (await extractFromRaw(client, raw, conf.id)) as AtlasBundle["extracted"][string];
      return { id: conf.id, raw, extracted };
    }),
  );

  for (const { id, raw, extracted } of pairs) {
    bundle.raw[id] = raw;
    bundle.extracted[id] = extracted;
  }

  bundle.provenance = buildProvenance(bundle);
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
