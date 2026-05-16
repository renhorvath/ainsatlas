import { loadBundle } from "./atlas-bundle";
import { hasSubstantiveExtract } from "./extract-coverage";
import type { MetaFile, ProvenanceRow, Synthesis } from "./types";

export async function loadInsightsPageData(): Promise<{
  synthesis: Synthesis;
  meta: MetaFile | null;
  coverage: { id: string; name: string; hasExtract: boolean }[];
}> {
  const bundle = await loadBundle();
  const coverage = bundle.conferences.map((c) => ({
    id: c.id,
    name: c.name,
    hasExtract: hasSubstantiveExtract(bundle.extracted[c.id]),
  }));
  return {
    synthesis: (bundle.synthesis ?? {}) as Synthesis,
    meta: bundle.meta,
    coverage,
  };
}

export async function loadPublicData(): Promise<{
  synthesis: Synthesis;
  meta: MetaFile | null;
}> {
  const bundle = await loadBundle();
  return {
    synthesis: (bundle.synthesis ?? {}) as Synthesis,
    meta: bundle.meta,
  };
}

function placeholderRow(c: {
  id: string;
  name: string;
  year: string;
  url: string;
  city?: string;
  country?: string;
}): ProvenanceRow {
  return {
    id: c.id,
    name: c.name,
    year: c.year,
    source_url: c.url,
    city: c.city,
    country: c.country,
    scraped_at: null,
    scrape_error: null,
    raw_chars: 0,
    raw_excerpt: "",
    raw_sha256_prefix: null,
    extracted_session_count: 0,
    extraction_note: null,
    extraction_meta: null,
  };
}

/** One row per conference, merged with export provenance when present (handles new events before re-export). */
export async function loadProvenance(): Promise<ProvenanceRow[]> {
  const bundle = await loadBundle();
  const byId = new Map(bundle.provenance.map((r) => [r.id, r]));

  return bundle.conferences.map((c) => {
    const row = byId.get(c.id);
    if (!row) return placeholderRow(c);
    return {
      ...row,
      source_url: row.source_url || c.url || "",
      city: c.city,
      country: c.country,
    };
  });
}
