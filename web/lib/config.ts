export const CLAUDE_MODEL = "claude-sonnet-4-5-20250929";
export const EXTRACT_MAX_INPUT_CHARS = 180_000;
export const PROVENANCE_EXCERPT_CHARS = 1200;

/** Strip whitespace and accidental quotes from Vercel / .env paste. */
function cleanEnv(value: string | undefined): string {
  let v = (value ?? "").trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

export function requireKeys(): { firecrawl: string; anthropic: string } {
  const firecrawl = cleanEnv(process.env.FIRECRAWL_API_KEY);
  const anthropic = cleanEnv(process.env.ANTHROPIC_API_KEY);
  if (!firecrawl || !anthropic) {
    throw new Error(
      "FIRECRAWL_API_KEY and ANTHROPIC_API_KEY must be set (local .env or Vercel environment variables).",
    );
  }
  return { firecrawl, anthropic };
}
