import Anthropic from "@anthropic-ai/sdk";

import type { RawRecord } from "../atlas-bundle";
import { CLAUDE_MODEL, EXTRACT_MAX_INPUT_CHARS } from "../config";
import { parseJsonObject } from "./parse-json";

const EXTRACTION_INSTRUCTIONS = `Extract structured data from the conference program text below.
Return ONLY a single JSON object (no markdown, no commentary) with this shape:
{
  "conference": "name",
  "year": "YYYY or year range as given",
  "sessions": [
    {
      "title": "session title",
      "speakers": ["name - role - company"],
      "topics": ["extracted topic tags"],
      "description": "brief summary if available"
    }
  ],
  "overall_themes": ["top 8-10 themes from this conference as short labels"]
}

Rules:
- If the page is sparse, extract what you can from panels, keynotes, and headings.
- Use concise topic tags (2-4 words).
- Speakers: include role/company when present in text; otherwise best-effort from context.
- sessions can be empty only if the text truly has no programmatic detail.
`;

export async function extractFromRaw(
  client: Anthropic,
  raw: RawRecord,
  confId: string,
): Promise<Record<string, unknown>> {
  if (raw.error) {
    return {
      conference: raw.conference,
      year: raw.year,
      sessions: [],
      overall_themes: [],
      extraction_note: `Skipped: scrape error ${raw.error}`,
    };
  }

  let content = raw.raw_content ?? "";
  if (!content.trim()) {
    return {
      conference: raw.conference,
      year: raw.year,
      sessions: [],
      overall_themes: [],
      extraction_note: "Skipped: empty content",
    };
  }

  if (content.length > EXTRACT_MAX_INPUT_CHARS) {
    content =
      content.slice(0, EXTRACT_MAX_INPUT_CHARS) +
      "\n\n[CONTENT TRUNCATED FOR MODEL CONTEXT — tail omitted]\n";
  }

  try {
    const msg = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 16_384,
      messages: [
        {
          role: "user",
          content: `${EXTRACTION_INSTRUCTIONS}\n\n---\nPROGRAM TEXT:\n\n${content}`,
        },
      ],
    });

    const outText = msg.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const data = parseJsonObject(outText);
    data.conference = data.conference ?? raw.conference;
    data.year = data.year ?? raw.year;
    data._meta = {
      source_url: raw.url,
      scraped_at: raw.scraped_at,
      raw_file: confId,
    };
    return data;
  } catch (e) {
    return {
      conference: raw.conference,
      year: raw.year,
      sessions: [],
      overall_themes: [],
      extraction_note: `Skipped: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
