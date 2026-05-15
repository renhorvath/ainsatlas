"""Render the HTML research brief from synthesis + raw metadata."""

import json
from typing import Any, Dict, List, Tuple

from jinja2 import Environment, FileSystemLoader, select_autoescape

from conferences import CONFERENCES
from config import DATA_RAW, REPORT_PATH, SYNTHESIS_PATH, TEMPLATES_DIR
from util import LOG


def _normalize_topic_entries(items: Any, default_count: Any = None) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    if not items:
        return out
    for item in items:
        if isinstance(item, str):
            out.append({"topic": item, "conference_count": default_count})
        elif isinstance(item, dict):
            topic = item.get("topic") or item.get("label") or item.get("name") or ""
            count = item.get("conference_count") or item.get("count") or default_count
            conferences = item.get("conferences") or []
            out.append({"topic": topic, "conference_count": count, "conferences": conferences})
        else:
            out.append({"topic": str(item), "conference_count": default_count})
    return out


def load_sources_footer() -> Tuple[List[Dict[str, Any]], int]:
    rows: List[Dict[str, Any]] = []
    ok = 0
    for conf in CONFERENCES:
        p = DATA_RAW / f"{conf['id']}.json"
        row = {
            "name": conf["name"],
            "year": conf["year"],
            "url": conf["url"],
            "scraped_at": None,
            "error": None,
        }
        if p.is_file():
            try:
                raw = json.loads(p.read_text(encoding="utf-8"))
                row["scraped_at"] = raw.get("scraped_at")
                row["error"] = raw.get("error")
                if not raw.get("error") and raw.get("raw_content"):
                    ok += 1
            except json.JSONDecodeError:
                row["error"] = "invalid raw JSON"
        rows.append(row)
    return rows, ok


def run_report() -> None:
    if not SYNTHESIS_PATH.is_file():
        raise SystemExit(f"Missing {SYNTHESIS_PATH}. Run --synthesize first.")

    synthesis = json.loads(SYNTHESIS_PATH.read_text(encoding="utf-8"))
    universal = _normalize_topic_entries(synthesis.get("universal_topics"))
    emerging = _normalize_topic_entries(synthesis.get("emerging_topics"))

    niche_raw = synthesis.get("niche_topics") or []
    niche: List[str] = []
    for x in niche_raw:
        if isinstance(x, str):
            niche.append(x)
        elif isinstance(x, dict):
            niche.append(str(x.get("topic") or x))
        else:
            niche.append(str(x))

    absent = synthesis.get("absent_topics") or []
    profiles = synthesis.get("conference_profiles") or {}
    speakers = synthesis.get("frequent_speakers") or []
    findings = synthesis.get("key_findings") or []

    sources, scrape_ok = load_sources_footer()

    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(["html", "xml"]),
    )
    tmpl = env.get_template("report.html")
    html = tmpl.render(
        universal_topics=universal,
        emerging_topics=emerging,
        niche_topics=niche,
        absent_topics=absent,
        conference_profiles=profiles,
        frequent_speakers=speakers,
        key_findings=findings,
        sources=sources,
        scrape_ok_count=scrape_ok,
        scrape_total=len(CONFERENCES),
    )
    REPORT_PATH.write_text(html, encoding="utf-8")
    LOG.info("Wrote report → %s", REPORT_PATH)

    from export_web import export_for_next

    try:
        export_for_next()
    except OSError as exc:
        LOG.warning("Could not export data for Next.js: %s", exc)
