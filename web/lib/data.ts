import "server-only";

import { loadBundle } from "./atlas-bundle";
import type { MetaFile, ProvenanceRow, Synthesis } from "./types";

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

export async function loadProvenance(): Promise<ProvenanceRow[]> {
  const bundle = await loadBundle();
  const rows = bundle.provenance;

  if (rows.length === 0) {
    return bundle.conferences.map((c) => ({
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
    }));
  }

  return rows.map((row) => {
    const c = bundle.conferences.find((x) => x.id === row.id);
    return {
      ...row,
      source_url: row.source_url || c?.url || "",
      city: c?.city,
      country: c?.country,
    };
  });
}
