import type { TopicChip } from "./types";

export function normalizeTopics(input: unknown): TopicChip[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      if (typeof item === "string") {
        return { label: item.trim() } satisfies TopicChip;
      }
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const label = String(o.topic ?? o.label ?? o.name ?? "").trim();
        const count =
          typeof o.conference_count === "number"
            ? o.conference_count
            : typeof o.count === "number"
              ? o.count
              : undefined;
        const conferences = Array.isArray(o.conferences)
          ? (o.conferences as unknown[]).map(String)
          : undefined;
        return { label, count, conferences } satisfies TopicChip;
      }
      return { label: String(item).trim() } satisfies TopicChip;
    })
    .filter((t) => t.label.length > 0);
}

export function normalizeStrings(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((x) => {
      if (typeof x === "string") return x.trim();
      if (x && typeof x === "object" && "topic" in x)
        return String((x as { topic?: unknown }).topic ?? "").trim();
      return String(x).trim();
    })
    .filter(Boolean);
}

export function normalizeProfiles(
  input: unknown,
): Record<string, string> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    out[k] = typeof v === "string" ? v : String(v ?? "");
  }
  return out;
}
