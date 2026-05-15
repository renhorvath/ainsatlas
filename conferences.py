"""Conference sources — edit web/conferences.json, Next.js (local), or dashboard.py."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, TypedDict, cast

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


def _normalize_id(row: Dict[str, Any], index: int) -> str:
    cid = str(row.get("id") or "").strip()
    if not cid:
        cid = _slugify(str(row["name"]))
    if not cid:
        raise ValueError(f"Item {index}: could not derive id from name")
    return cid


def validate_conferences_json(raw: object) -> List[Conference]:
    """Validate JSON array; return core Conference list (extras in file are allowed)."""
    if not isinstance(raw, list):
        raise ValueError(f"{CONFERENCES_JSON.name} must be a JSON array.")
    out: List[Conference] = []
    seen: set[str] = set()
    for i, row in enumerate(raw):
        if not isinstance(row, dict):
            raise ValueError(f"Item {i} must be a JSON object.")
        rowd = cast(Dict[str, Any], row)
        for key in ("name", "year", "url"):
            if key not in rowd or rowd[key] is None or str(rowd[key]).strip() == "":
                raise ValueError(f"Item {i} missing or empty required field: {key}")
        cid = _normalize_id(rowd, i)
        if cid in seen:
            raise ValueError(f"Duplicate conference id: {cid}")
        seen.add(cid)
        out.append(
            {
                "id": cid,
                "name": str(rowd["name"]).strip(),
                "year": str(rowd["year"]).strip(),
                "url": str(rowd["url"]).strip(),
            }
        )
    return out


def read_raw_conferences_file() -> List[Dict[str, Any]]:
    if not CONFERENCES_JSON.is_file():
        raise FileNotFoundError(
            f"Missing {CONFERENCES_JSON}. "
            "Create it as a JSON array of objects with name, year, url "
            "(optional: id, city, country)."
        )
    raw = json.loads(CONFERENCES_JSON.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise ValueError(f"{CONFERENCES_JSON.name} must be a JSON array.")
    for i, x in enumerate(raw):
        if not isinstance(x, dict):
            raise ValueError(f"Item {i} must be a JSON object.")
    return [cast(Dict[str, Any], x) for x in raw]


def write_raw_conferences_file(rows: List[Dict[str, Any]]) -> None:
    validate_conferences_json(rows)
    CONFERENCES_JSON.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(rows, ensure_ascii=False, indent=2) + "\n"
    tmp_path = CONFERENCES_JSON.with_suffix(".json.tmp")
    try:
        tmp_path.write_text(text, encoding="utf-8")
        tmp_path.replace(CONFERENCES_JSON)
    except BaseException:
        tmp_path.unlink(missing_ok=True)
        raise


def load_conferences() -> List[Conference]:
    raw = read_raw_conferences_file()
    return validate_conferences_json(raw)


try:
    CONFERENCES: List[Conference] = load_conferences()
except (FileNotFoundError, ValueError, json.JSONDecodeError) as exc:
    raise SystemExit(f"conferences config error: {exc}") from exc


def reload_conferences_in_memory() -> None:
    """Reload CONFERENCES from disk (same list object; safe for importers)."""
    new_list = load_conferences()
    CONFERENCES.clear()
    CONFERENCES.extend(new_list)


def append_conference_from_form(
    *,
    name: str,
    year: str,
    url: str,
    conf_id: str | None = None,
    city: str | None = None,
    country: str | None = None,
) -> Dict[str, Any]:
    """Append one conference to web/conferences.json and refresh CONFERENCES."""
    name = name.strip()
    year = year.strip()
    url = url.strip()
    if not name or not year or not url:
        raise ValueError("name, year, and url are required")

    rows = read_raw_conferences_file()
    cid = (conf_id or "").strip() or _slugify(name)
    if not cid:
        raise ValueError("Could not derive id — set id explicitly")
    existing_ids = {_normalize_id(cast(Dict[str, Any], r), i) for i, r in enumerate(rows)}
    if cid in existing_ids:
        raise ValueError(f"A conference with id {cid!r} already exists")

    entry: Dict[str, Any] = {
        "id": cid,
        "name": name,
        "year": year,
        "url": url,
    }
    city = (city or "").strip()
    country = (country or "").strip()
    if city:
        entry["city"] = city
    if country:
        entry["country"] = country

    rows.append(entry)
    write_raw_conferences_file(rows)
    reload_conferences_in_memory()
    return entry


def get_conference_by_id(conf_id: str) -> Optional[Conference]:
    for c in CONFERENCES:
        if c["id"] == conf_id:
            return c
    return None
