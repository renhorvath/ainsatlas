"""Conference sources — edit web/conferences.json to add or change events."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import List, Optional, TypedDict

ROOT = Path(__file__).resolve().parent
CONFERENCES_JSON = ROOT / "web" / "conferences.json"


class Conference(TypedDict):
    id: str
    name: str
    year: str
    url: str


def _slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[-\s]+", "_", s)
    return s.strip("_") or "conference"


def load_conferences() -> List[Conference]:
    if not CONFERENCES_JSON.is_file():
        raise FileNotFoundError(
            f"Missing {CONFERENCES_JSON}. "
            "Create it as a JSON array of objects with id, name, year, url "
            "(optional: city, country for the website)."
        )
    raw = json.loads(CONFERENCES_JSON.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise ValueError(f"{CONFERENCES_JSON.name} must be a JSON array.")
    out: List[Conference] = []
    seen: set[str] = set()
    for i, row in enumerate(raw):
        if not isinstance(row, dict):
            raise ValueError(f"Item {i} must be a JSON object.")
        for key in ("name", "year", "url"):
            if key not in row or row[key] is None or str(row[key]).strip() == "":
                raise ValueError(f"Item {i} missing or empty required field: {key}")
        cid = str(row.get("id") or "").strip()
        if not cid:
            cid = _slugify(str(row["name"]))
        if cid in seen:
            raise ValueError(f"Duplicate conference id: {cid}")
        seen.add(cid)
        out.append(
            {
                "id": cid,
                "name": str(row["name"]).strip(),
                "year": str(row["year"]).strip(),
                "url": str(row["url"]).strip(),
            }
        )
    return out


try:
    CONFERENCES: List[Conference] = load_conferences()
except (FileNotFoundError, ValueError, json.JSONDecodeError) as exc:
    raise SystemExit(f"conferences config error: {exc}") from exc


def get_conference_by_id(conf_id: str) -> Optional[Conference]:
    for c in CONFERENCES:
        if c["id"] == conf_id:
            return c
    return None


def all_conference_ids() -> List[str]:
    return [c["id"] for c in CONFERENCES]
