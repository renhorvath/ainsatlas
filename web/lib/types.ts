export type TopicChip = {
  label: string;
  count?: number;
  conferences?: string[];
};

export type Synthesis = {
  universal_topics?: unknown;
  emerging_topics?: unknown;
  niche_topics?: unknown;
  absent_topics?: unknown;
  conference_profiles?: Record<string, string>;
  frequent_speakers?: unknown;
  key_findings?: unknown;
  _meta?: unknown;
};

export type MetaFile = {
  exportedAt?: string;
  synthesisCopied?: boolean;
};

export type ProvenanceRow = {
  id: string;
  name: string;
  year: string;
  source_url: string;
  city?: string;
  country?: string;
  scraped_at?: string | null;
  scrape_error?: string | null;
  raw_chars: number;
  raw_excerpt: string;
  raw_sha256_prefix?: string | null;
  extracted_session_count: number;
  extraction_note?: string | null;
  extraction_meta?: Record<string, unknown> | null;
};
