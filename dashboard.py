"""Local-only web UI for the pipeline (Flask). Not used on Vercel — run: python dashboard.py"""

from __future__ import annotations

import json
import os
import subprocess
import sys

from dotenv import load_dotenv
from flask import Flask, Response, jsonify, render_template, request

from conferences import CONFERENCES, append_conference_from_form
from config import (
    DATA_EXTRACTED,
    DATA_RAW,
    REPORT_PATH,
    ROOT,
    SYNTHESIS_PATH,
)

app = Flask(__name__)
RUN_PY = ROOT / "run.py"


def _raw_payload(conf_id: str) -> dict | None:
    path = DATA_RAW / f"{conf_id}.json"
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def _extracted_payload(conf_id: str) -> dict | None:
    path = DATA_EXTRACTED / f"{conf_id}.json"
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def build_status() -> dict:
    load_dotenv(override=True)
    rows = []
    for c in CONFERENCES:
        raw = _raw_payload(c["id"])
        ext = _extracted_payload(c["id"])
        if raw is not None:
            content = raw.get("raw_content") or ""
            raw_info = {
                "exists": True,
                "scraped_at": raw.get("scraped_at"),
                "error": raw.get("error"),
                "chars": len(content),
            }
        else:
            raw_info = {"exists": False, "scraped_at": None, "error": None, "chars": 0}

        if ext is not None:
            sessions = ext.get("sessions") or []
            themes = ext.get("overall_themes") or []
            ext_info = {
                "exists": True,
                "sessions": len(sessions) if isinstance(sessions, list) else 0,
                "themes": len(themes) if isinstance(themes, list) else 0,
                "note": ext.get("extraction_note"),
            }
        else:
            ext_info = {"exists": False, "sessions": 0, "themes": 0, "note": None}

        rows.append(
            {
                "id": c["id"],
                "name": c["name"],
                "year": c["year"],
                "url": c["url"],
                "raw": raw_info,
                "extracted": ext_info,
            }
        )

    return {
        "keys": {
            "firecrawl": bool(os.environ.get("FIRECRAWL_API_KEY")),
            "anthropic": bool(os.environ.get("ANTHROPIC_API_KEY")),
        },
        "report_ready": REPORT_PATH.is_file(),
        "synthesis_ready": SYNTHESIS_PATH.is_file(),
        "conferences": rows,
    }


@app.route("/")
def index():
    return render_template("dashboard.html")


@app.route("/api/conferences", methods=["POST"])
def api_add_conference():
    data = request.get_json(force=True, silent=True) or {}
    try:
        rec = append_conference_from_form(
            name=str(data.get("name") or ""),
            year=str(data.get("year") or ""),
            url=str(data.get("url") or ""),
            conf_id=(str(data.get("id") or "").strip() or None),
            city=(str(data.get("city") or "").strip() or None),
            country=(str(data.get("country") or "").strip() or None),
        )
    except ValueError as exc:
        return jsonify({"ok": False, "error": str(exc)}), 400
    except OSError as exc:
        return jsonify({"ok": False, "error": str(exc)}), 500
    return jsonify({"ok": True, "conference": rec})


@app.route("/api/status")
def api_status():
    return jsonify(build_status())


@app.route("/report")
def serve_report():
    if not REPORT_PATH.is_file():
        return Response(
            "<!DOCTYPE html><html><body style='font-family:sans-serif;background:#1a1a1a;color:#eee;padding:2rem;'>"
            "<p><strong>report.html</strong> not found.</p>"
            "<p>Run <code style=color:#c8a96e>python run.py --all</code> or use <strong>Run → all</strong> in the dashboard.</p>"
            "<p><a style=color:#c8a96e href=/>← Back</a></p></body></html>",
            status=404,
            mimetype="text/html; charset=utf-8",
        )
    return Response(
        REPORT_PATH.read_text(encoding="utf-8"),
        mimetype="text/html; charset=utf-8",
    )


@app.route("/api/run", methods=["POST"])
def api_run():
    load_dotenv(override=True)

    data = request.get_json(force=True, silent=True) or {}
    step = data.get("step", "")
    mock = bool(data.get("mock"))
    allowed = {"scrape", "extract", "synthesize", "report", "all"}
    if step not in allowed:
        return jsonify({"ok": False, "error": f"step must be one of {sorted(allowed)}"}), 400

    cmd = [sys.executable, str(RUN_PY), f"--{step}"]
    if mock and step in ("scrape", "all"):
        cmd.append("--mock")

    try:
        proc = subprocess.run(
            cmd,
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            timeout=None,
            env={**os.environ},
        )
    except OSError as exc:
        return jsonify({"ok": False, "error": str(exc), "output": ""}), 500

    out = (proc.stdout or "") + (proc.stderr or "")
    return jsonify(
        {
            "ok": proc.returncode == 0,
            "returncode": proc.returncode,
            "output": out[-120_000:] if len(out) > 120_000 else out,
        }
    )


def main() -> None:
    port = int(os.environ.get("PORT", "5050"))
    app.run(host="127.0.0.1", port=port, debug=False, use_reloader=False)


if __name__ == "__main__":
    main()
