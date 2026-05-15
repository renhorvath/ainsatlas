#!/usr/bin/env python3
"""CLI for the European music conference topic aggregator."""

from __future__ import annotations

import argparse
import logging
import sys

from extract import run_extract
from report import run_report
from scrape import run_scrape
from synthesize import run_synthesize
from util import LOG


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(levelname)s %(message)s",
    )


def main(argv: list[str] | None = None) -> int:
    configure_logging()
    parser = argparse.ArgumentParser(
        description="Scrape, extract, synthesize, and report on European music conference programmes.",
    )
    parser.add_argument(
        "--scrape",
        action="store_true",
        help="Fetch programme pages via Firecrawl → data/raw/{id}.json",
    )
    parser.add_argument(
        "--extract",
        action="store_true",
        help="Run Claude extraction on each raw file → data/extracted/{id}.json",
    )
    parser.add_argument(
        "--synthesize",
        action="store_true",
        help="Combine extracted JSON via Claude → data/synthesis.json",
    )
    parser.add_argument(
        "--report",
        action="store_true",
        help="Render report.html from synthesis + raw metadata",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Run scrape → extract → synthesize → report (same order as listed)",
    )
    parser.add_argument(
        "--mock",
        action="store_true",
        help="With --scrape: skip Firecrawl and only use existing data/raw/*.json files",
    )
    parser.add_argument(
        "--export-web",
        action="store_true",
        help="Copy synthesis + provenance → web/public/data/ (for Next.js / Vercel)",
    )

    args = parser.parse_args(argv)
    if not any(
        [
            args.all,
            args.scrape,
            args.extract,
            args.synthesize,
            args.report,
            args.export_web,
        ]
    ):
        parser.print_help()
        return 0

    if args.all:
        LOG.info("=== Full pipeline (--all) ===")
        run_scrape(mock=args.mock)
        run_extract()
        run_synthesize()
        run_report()
        LOG.info("Done.")
        return 0

    if args.scrape:
        LOG.info("=== Scrape ===")
        run_scrape(mock=args.mock)
    if args.extract:
        LOG.info("=== Extract ===")
        run_extract()
    if args.synthesize:
        LOG.info("=== Synthesize ===")
        run_synthesize()
    if args.report:
        LOG.info("=== Report ===")
        run_report()

    if args.export_web:
        LOG.info("=== Export web ===")
        from export_web import export_for_next

        export_for_next()

    LOG.info("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
