import type { ExtractedRecord } from "./atlas-bundle";

export function hasSubstantiveExtract(e: ExtractedRecord | undefined): boolean {
  const sessions = e?.sessions;
  return (
    Boolean(e) &&
    !String(e?.extraction_note ?? "").toLowerCase().startsWith("skipped") &&
    (Array.isArray(sessions) ? sessions.length > 0 : false)
  );
}

export function hasUsableRaw(raw: { error?: string | null; raw_content?: string | null } | undefined): boolean {
  return Boolean(raw && !raw.error && (raw.raw_content ?? "").trim().length > 0);
}
