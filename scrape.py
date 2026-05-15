"""Scrape conference programme pages with Firecrawl; write raw JSON."""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

from conferences import CONFERENCES, Conference
from config import DATA_RAW, EXTRACT_MAX_INPUT_CHARS, FIRECRAWL_API_KEY
from util import ensure_dirs, LOG

try:
    from firecrawl.v2 import FirecrawlClient
except ImportError:  # pragma: no cover
    FirecrawlClient = None  # type: ignore


def _raw_path(conf: Conference) -> Path:
    return DATA_RAW / f"{conf['id']}.json"


def scrape_one(
    client: Any,
    conf: Conference,
    *,
    mock: bool,
) -> None:
    path = _raw_path(conf)
    if mock:
        if path.is_file():
            LOG.info("[mock] Using existing raw file: %s", path.name)
            return
        LOG.warning(
            "[mock] Skip %s — no raw file at %s (run scrape without --mock first)",
            conf["name"],
            path,
        )
        return

    payload: Dict[str, Any] = {
        "conference": conf["name"],
        "year": conf["year"],
        "url": conf["url"],
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "raw_content": None,
        "error": None,
    }
    try:
        doc = client.scrape(
            conf["url"],
            formats=["markdown"],
            only_main_content=True,
        )
        md = getattr(doc, "markdown", None) or ""
        if len(md) > EXTRACT_MAX_INPUT_CHARS * 2:
            LOG.info(
                "Large scrape for %s (%d chars); storing full markdown in raw file",
                conf["name"],
                len(md),
            )
        payload["raw_content"] = md
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        LOG.info("Scraped %s → %s (%d chars)", conf["name"], path.name, len(md))
    except Exception as exc:  # noqa: BLE001
        payload["error"] = str(exc)
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        LOG.error("Scrape failed for %s: %s", conf["name"], exc)


def run_scrape(*, mock: bool) -> None:
    ensure_dirs(DATA_RAW)
    if mock:
        for conf in CONFERENCES:
            scrape_one(None, conf, mock=True)
        return

    if not FIRECRAWL_API_KEY:
        raise SystemExit("FIRECRAWL_API_KEY is not set. Add it to .env or the environment.")
    if FirecrawlClient is None:
        raise SystemExit("firecrawl-py is not installed. pip install -r requirements-pipeline.txt")

    client = FirecrawlClient(api_key=FIRECRAWL_API_KEY)
    for conf in CONFERENCES:
        scrape_one(client, conf, mock=False)
