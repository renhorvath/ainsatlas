"""Shared helpers: JSON from LLM responses, directories, logging."""

import json
import logging
import re
from pathlib import Path
from typing import Any, Dict

LOG = logging.getLogger("conference_map")


def ensure_dirs(*paths: Path) -> None:
    for p in paths:
        p.mkdir(parents=True, exist_ok=True)


def parse_json_object(text: str) -> Dict[str, Any]:
    """Extract a single JSON object from model output (handles ```json fences)."""
    s = text.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", s, re.IGNORECASE)
    if fence:
        s = fence.group(1).strip()
    start = s.find("{")
    end = s.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in model output")
    return json.loads(s[start : end + 1])
