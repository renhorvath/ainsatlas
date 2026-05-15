"""Copy synthesis output into the Next.js app's public folder for Vercel deploys."""

import json
import shutil
from datetime import datetime, timezone

from config import ROOT, SYNTHESIS_PATH
from util import LOG

WEB_DATA = ROOT / "web" / "public" / "data"


def export_for_next() -> None:
    WEB_DATA.mkdir(parents=True, exist_ok=True)
    meta = {
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "synthesisCopied": False,
    }
    if SYNTHESIS_PATH.is_file():
        shutil.copy2(SYNTHESIS_PATH, WEB_DATA / "synthesis.json")
        meta["synthesisCopied"] = True
        LOG.info("Copied synthesis → web/public/data/synthesis.json")
    else:
        LOG.warning(
            "No %s — leaving existing web/public/data/synthesis.json unchanged",
            SYNTHESIS_PATH,
        )
    (WEB_DATA / "meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
