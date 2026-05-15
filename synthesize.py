"""Cross-conference synthesis from extracted JSON (single Claude call)."""

import json
from pathlib import Path
from typing import Any, Dict, List

import anthropic

from conferences import CONFERENCES
from config import ANTHROPIC_API_KEY, CLAUDE_MODEL, DATA_EXTRACTED, SYNTHESIS_PATH
from util import ensure_dirs, LOG, parse_json_object


def load_all_extracted() -> List[Dict[str, Any]]:
    combined: List[Dict[str, Any]] = []
    for conf in CONFERENCES:
        p = DATA_EXTRACTED / f"{conf['id']}.json"
        if not p.is_file():
            LOG.warning("Missing extracted file for %s (%s)", conf["name"], p.name)
            continue
        data = json.loads(p.read_text(encoding="utf-8"))
        data["_id"] = conf["id"]
        combined.append(data)
    return combined


SYNTHESIS_INSTRUCTIONS = """You are analyzing structured conference programme extractions from major European music industry events.

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
- universal_topics: topics clearly reflected in 5+ conferences (use programme evidence).
- emerging_topics: 2-4 conferences.
- conference_profiles: one key per exact conference name from the input data.
- frequent_speakers: only include when the same person (allow minor spelling variants) appears in >1 conference.
- Be specific; avoid fluff.
"""


def run_synthesize() -> None:
    if not ANTHROPIC_API_KEY:
        raise SystemExit("ANTHROPIC_API_KEY is not set.")

    bundle = load_all_extracted()
    if not bundle:
        raise SystemExit("No extracted JSON files found. Run --extract first.")

    ensure_dirs(SYNTHESIS_PATH.parent)
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    payload = json.dumps(bundle, ensure_ascii=False)
    if len(payload) > 450_000:
        LOG.warning("Synthesis payload is very large (%d chars); consider trimming", len(payload))

    msg = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=16_384,
        messages=[
            {
                "role": "user",
                "content": SYNTHESIS_INSTRUCTIONS + "\n\nINPUT_JSON:\n" + payload,
            }
        ],
    )
    text_parts = []
    for block in msg.content:
        if hasattr(block, "text"):
            text_parts.append(block.text)
    out_text = "".join(text_parts)

    try:
        data = parse_json_object(out_text)
    except (json.JSONDecodeError, ValueError) as exc:
        LOG.error("Synthesis parse failed: %s", exc)
        raise

    data["_meta"] = {
        "model": CLAUDE_MODEL,
        "conferences_included": [c["id"] for c in CONFERENCES],
    }
    SYNTHESIS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    LOG.info("Wrote synthesis → %s", SYNTHESIS_PATH)
