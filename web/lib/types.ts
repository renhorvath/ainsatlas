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
