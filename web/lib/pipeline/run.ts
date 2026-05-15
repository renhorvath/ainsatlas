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

export async function runAtlasPipeline(options: PipelineOptions = {}): Promise<void> {
  const { firecrawl, anthropic } = requireKeys();
  const client = new Anthropic({ apiKey: anthropic });
  const bundle = await loadBundle();

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

  for (const conf of targets) {
    bundle.raw[conf.id] = await scrapeConference(conf, firecrawl);
    bundle.extracted[conf.id] = (await extractFromRaw(
      client,
      bundle.raw[conf.id],
      conf.id,
    )) as AtlasBundle["extracted"][string];
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
