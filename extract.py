"""Extract structured programme data from raw markdown via Claude."""

import json
from pathlib import Path
from typing import Any, Dict

import anthropic

from conferences import CONFERENCES
from config import ANTHROPIC_API_KEY, CLAUDE_MODEL, DATA_EXTRACTED, DATA_RAW, EXTRACT_MAX_INPUT_CHARS
from util import ensure_dirs, LOG, parse_json_object


def _raw_path(conf_id: str) -> Path:
    return DATA_RAW / f"{conf_id}.json"


def _extracted_path(conf_id: str) -> Path:
    return DATA_EXTRACTED / f"{conf_id}.json"


EXTRACTION_INSTRUCTIONS = """Extract structured data from the conference program text below.
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
"""


def extract_one(client: anthropic.Anthropic, raw: Dict[str, Any], conf_id: str) -> None:
    out_path = _extracted_path(conf_id)
    if raw.get("error"):
        LOG.warning("Skipping extract for %s — raw scrape has error: %s", conf_id, raw.get("error"))
        placeholder = {
            "conference": raw.get("conference", conf_id),
            "year": raw.get("year", ""),
            "sessions": [],
            "overall_themes": [],
            "extraction_note": f"Skipped: scrape error {raw.get('error')}",
        }
        out_path.write_text(json.dumps(placeholder, ensure_ascii=False, indent=2), encoding="utf-8")
        return

    content = raw.get("raw_content") or ""
    if not content.strip():
        LOG.warning("Skipping extract for %s — empty raw_content", conf_id)
        placeholder = {
            "conference": raw.get("conference", conf_id),
            "year": raw.get("year", ""),
            "sessions": [],
            "overall_themes": [],
            "extraction_note": "Skipped: empty content",
        }
        out_path.write_text(json.dumps(placeholder, ensure_ascii=False, indent=2), encoding="utf-8")
        return

    if len(content) > EXTRACT_MAX_INPUT_CHARS:
        content = (
            content[:EXTRACT_MAX_INPUT_CHARS]
            + "\n\n[CONTENT TRUNCATED FOR MODEL CONTEXT — tail omitted]\n"
        )

    user_block = f"{EXTRACTION_INSTRUCTIONS}\n\n---\nPROGRAM TEXT:\n\n{content}"

    msg = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=16_384,
        messages=[{"role": "user", "content": user_block}],
    )
    text_parts = []
    for block in msg.content:
        if hasattr(block, "text"):
            text_parts.append(block.text)
    out_text = "".join(text_parts)

    try:
        data = parse_json_object(out_text)
    except (json.JSONDecodeError, ValueError) as exc:
        LOG.error("Failed to parse extraction JSON for %s: %s", conf_id, exc)
        raise

    data.setdefault("conference", raw.get("conference", ""))
    data.setdefault("year", raw.get("year", ""))
    data["_meta"] = {
        "source_url": raw.get("url"),
        "scraped_at": raw.get("scraped_at"),
        "raw_file": str(_raw_path(conf_id)),
    }
    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    LOG.info("Extracted %s → %s", data.get("conference", conf_id), out_path.name)


def run_extract() -> None:
    if not ANTHROPIC_API_KEY:
        raise SystemExit("ANTHROPIC_API_KEY is not set.")

    ensure_dirs(DATA_EXTRACTED)
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    for conf in CONFERENCES:
        p = _raw_path(conf["id"])
        if not p.is_file():
            LOG.warning("No raw file for %s (%s) — run --scrape first", conf["name"], p.name)
            continue
        raw = json.loads(p.read_text(encoding="utf-8"))
        extract_one(client, raw, conf["id"])
