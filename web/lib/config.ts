import "server-only";

export const CLAUDE_MODEL = "claude-sonnet-4-5-20250929";
export const EXTRACT_MAX_INPUT_CHARS = 180_000;
export const PROVENANCE_EXCERPT_CHARS = 1200;

export function requireKeys(): { firecrawl: string; anthropic: string } {
  const firecrawl = process.env.FIRECRAWL_API_KEY?.trim();
  const anthropic = process.env.ANTHROPIC_API_KEY?.trim();
  if (!firecrawl || !anthropic) {
    throw new Error(
      "FIRECRAWL_API_KEY and ANTHROPIC_API_KEY must be set (local .env or Vercel environment variables).",
    );
  }
  return { firecrawl, anthropic };
}
