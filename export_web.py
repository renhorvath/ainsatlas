"""Copy synthesis + provenance into the Next.js public folder for Vercel."""

from __future__ import annotations

import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from conferences import CONFERENCES
from config import DATA_EXTRACTED, DATA_RAW, ROOT, SYNTHESIS_PATH
from util import LOG

WEB_DATA = ROOT / "web" / "data"
WEB_DATA_PUBLIC = ROOT / "web" / "public" / "data"
EXCERPT_CHARS = 1200


def build_provenances() -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for c in CONFERENCES:
        row: Dict[str, Any] = {
            "id": c["id"],
            "name": c["name"],
            "year": c["year"],
            "source_url": c["url"],
            "scraped_at": None,
            "scrape_error": None,
            "raw_chars": 0,
            "raw_excerpt": "",
            "raw_sha256_prefix": None,
            "extracted_session_count": 0,
            "extraction_note": None,
            "extraction_meta": None,
        }
        raw_p = DATA_RAW / f"{c['id']}.json"
        if raw_p.is_file():
            try:
                raw = json.loads(raw_p.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                row["scrape_error"] = "invalid raw JSON"
            else:
                row["scraped_at"] = raw.get("scraped_at")
                row["scrape_error"] = raw.get("error")
                content = raw.get("raw_content") or ""
                if isinstance(content, str):
                    row["raw_chars"] = len(content)
                    row["raw_excerpt"] = content[:EXCERPT_CHARS]
                    if content:
                        row["raw_sha256_prefix"] = hashlib.sha256(
                            content.encode("utf-8")
                        ).hexdigest()[:16]
        ext_p = DATA_EXTRACTED / f"{c['id']}.json"
        if ext_p.is_file():
            try:
                ext = json.loads(ext_p.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                row["extraction_note"] = "invalid extracted JSON"
            else:
                sessions = ext.get("sessions") or []
                if isinstance(sessions, list):
                    row["extracted_session_count"] = len(sessions)
                row["extraction_note"] = ext.get("extraction_note")
                row["extraction_meta"] = ext.get("_meta")
        out.append(row)
    return out


def export_for_next() -> None:
    WEB_DATA.mkdir(parents=True, exist_ok=True)
    WEB_DATA_PUBLIC.mkdir(parents=True, exist_ok=True)
    meta: Dict[str, Any] = {
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "synthesisCopied": False,
    }
    if SYNTHESIS_PATH.is_file():
        shutil.copy2(SYNTHESIS_PATH, WEB_DATA / "synthesis.json")
        shutil.copy2(SYNTHESIS_PATH, WEB_DATA_PUBLIC / "synthesis.json")
        meta["synthesisCopied"] = True
        LOG.info("Copied synthesis → web/data/synthesis.json")
    else:
        LOG.warning(
            "No %s — leaving existing web/data/synthesis.json unchanged",
            SYNTHESIS_PATH,
        )

    prov = build_provenances()
    prov_text = json.dumps(prov, ensure_ascii=False, indent=2) + "\n"
    (WEB_DATA / "provenance.json").write_text(prov_text, encoding="utf-8")
    (WEB_DATA_PUBLIC / "provenance.json").write_text(prov_text, encoding="utf-8")
    LOG.info("Wrote provenance (%d rows) → web/data/provenance.json", len(prov))

    meta_text = json.dumps(meta, ensure_ascii=False, indent=2) + "\n"
    (WEB_DATA / "meta.json").write_text(meta_text, encoding="utf-8")
    (WEB_DATA_PUBLIC / "meta.json").write_text(meta_text, encoding="utf-8")
