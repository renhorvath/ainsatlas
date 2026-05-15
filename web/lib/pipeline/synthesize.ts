import Anthropic from "@anthropic-ai/sdk";

import type { Conference } from "../conferences";
import type { ExtractedRecord } from "../atlas-bundle";
import { CLAUDE_MODEL } from "../config";
import { parseJsonObject } from "./parse-json";

const SYNTHESIS_INSTRUCTIONS = `You are analyzing structured conference programme extractions from major European music industry events.

You will receive a JSON array: each item has conference, year, sessions (with topics, speakers), and overall_themes.

Produce ONE JSON object ONLY (no markdown fences, no commentary) with:
{
  "universal_topics": [
    { "topic": "short label", "conference_count": <int>, "conferences": ["names that mention it"] }
  ],
  "emerging_topics": [
    { "topic": "short label", "conference_count": <int> }
  ],
  "niche_topics": ["topics clearly centered in only one conference"],
  "absent_topics": ["important music industry themes not evidenced in these programmes — inferred"],
  "conference_profiles": {
    "Exact Conference Name": "2-3 sentence character description based on topic mix"
  },
  "frequent_speakers": ["names or name+org appearing across multiple conferences when repeated"],
  "key_findings": ["5-7 synthesized observations for a strategic audience"]
}

Rules:
- universal_topics: topics clearly reflected in 5+ conferences (use programme evidence). If there are fewer than 5 conferences with substantive programmes, lower the threshold and explain in key_findings.
- emerging_topics: 2-4 conferences (or adjust if the set is small).
- conference_profiles: REQUIRED — one entry for EVERY item in INPUT_JSON, using the exact "conference" field string (or _id if conference name missing). Do not omit a conference; if a programme was thin, say so in that profile.
- frequent_speakers: only include when the same person (allow minor spelling variants) appears in >1 conference.
- key_findings: mention any new or standout event by name when its programme clearly differs from the rest.
- Be specific; avoid fluff.
`;

export async function synthesizeAll(
  client: Anthropic,
  conferences: Conference[],
  extracted: Record<string, ExtractedRecord>,
): Promise<Record<string, unknown>> {
  const bundle = conferences
    .map((c) => {
      const row = extracted[c.id];
      if (!row) return null;
      return { ...row, _id: c.id };
    })
    .filter(Boolean);

  if (bundle.length === 0) {
    throw new Error("No extracted data to synthesize. Run scrape and extract first.");
  }

  const payload = JSON.stringify(bundle);
  const msg = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 16_384,
    messages: [
      {
        role: "user",
        content: `${SYNTHESIS_INSTRUCTIONS}\n\nINPUT_JSON:\n${payload}`,
      },
    ],
  });

  const outText = msg.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const data = parseJsonObject(outText);
  data._meta = {
    model: CLAUDE_MODEL,
    conferences_included: conferences.map((c) => c.id),
  };
  return data;
}
