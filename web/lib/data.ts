import "server-only";

import metaJson from "../data/meta.json";
import provenanceJson from "../data/provenance.json";
import synthesisJson from "../data/synthesis.json";

import { CONFERENCES } from "./conferences";
import type { MetaFile, ProvenanceRow, Synthesis } from "./types";

export function loadPublicData(): {
  synthesis: Synthesis;
  meta: MetaFile | null;
} {
  return {
    synthesis: synthesisJson as Synthesis,
    meta: metaJson as MetaFile,
  };
}

function conferenceExtras(id: string) {
  const c = CONFERENCES.find((x) => x.id === id);
  return { city: c?.city, country: c?.country, source_url: c?.url ?? "" };
}

/** Programme sources — merge provenance export with conference list for links and location. */
export function loadProvenance(): ProvenanceRow[] {
  const raw = provenanceJson as unknown;
  const rows: ProvenanceRow[] = Array.isArray(raw) ? (raw as ProvenanceRow[]) : [];

  if (rows.length === 0) {
    return CONFERENCES.map((c) => ({
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
    const extra = conferenceExtras(row.id);
    return {
      ...row,
      source_url: row.source_url || extra.source_url,
      city: extra.city,
      country: extra.country,
    };
  });
}
