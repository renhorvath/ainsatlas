"""Load settings from environment variables."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

ROOT = Path(__file__).resolve().parent
DATA_RAW = ROOT / "data" / "raw"
DATA_EXTRACTED = ROOT / "data" / "extracted"
SYNTHESIS_PATH = ROOT / "data" / "synthesis.json"
REPORT_PATH = ROOT / "report.html"
TEMPLATES_DIR = ROOT / "templates"

FIRECRAWL_API_KEY = os.environ.get("FIRECRAWL_API_KEY", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

CLAUDE_MODEL = "claude-sonnet-4-5-20250929"
EXTRACT_MAX_INPUT_CHARS = 180_000
