import Link from "next/link";

import { loadProvenance } from "@/lib/data";

export const metadata = {
  title: "Sources",
};

export default async function SourcesPage() {
  const rows = await loadProvenance();

  if (!rows || rows.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 md:px-8">
        <h1 className="font-serif text-3xl text-parchment">No provenance file</h1>
        <p className="mt-4 text-parchment-muted leading-relaxed">
          Run <code className="rounded bg-ink-card px-1.5 text-sm text-gold">python run.py --report</code> or{" "}
          <code className="rounded bg-ink-card px-1.5 text-sm text-gold">python run.py --export-web</code>{" "}
          after scraping to generate <code className="text-gold">web/public/data/provenance.json</code>.
        </p>
        <Link href="/methodology" className="mt-8 inline-block text-gold hover:underline">
          Methodology →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Evidence</p>
      <h1 className="mt-4 font-serif text-4xl font-medium text-parchment md:text-5xl">
        What went into the model
      </h1>
      <p className="mt-5 max-w-3xl text-parchment-muted leading-relaxed">
        Each card shows the <strong className="font-medium text-parchment">public programme URL</strong>, scrape
        metadata, and the <strong className="font-medium text-parchment">opening of the markdown</strong> returned by
        Firecrawl (truncated for the bundle). That is the primary input to extraction — not hidden context. Short
        hash prefixes help detect if local raw files drift from what was exported.
      </p>

      <ul className="mt-14 space-y-10">
        {rows.map((r) => (
          <li
            key={r.id}
            className="rounded-xl border border-ink-line bg-ink-card p-6 md:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-parchment">{r.name}</h2>
                <p className="mt-1 text-sm text-parchment-dim">
                  {r.year}
                  {r.raw_sha256_prefix ? (
                    <span className="ml-2 font-mono text-xs text-parchment-muted">
                      · raw hash prefix {r.raw_sha256_prefix}
                    </span>
                  ) : null}
                </p>
              </div>
              <a
                href={r.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded bg-gold/15 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/25"
              >
                Open source URL
              </a>
            </div>

            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-parchment-dim">Scraped (UTC)</dt>
                <dd className="font-mono text-parchment-muted">{r.scraped_at ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-parchment-dim">Raw markdown length</dt>
                <dd className="font-mono text-parchment-muted">{r.raw_chars.toLocaleString()} chars</dd>
              </div>
              <div>
                <dt className="text-parchment-dim">Extracted sessions</dt>
                <dd className="font-mono text-parchment-muted">{r.extracted_session_count}</dd>
              </div>
              <div>
                <dt className="text-parchment-dim">Extraction note</dt>
                <dd className="text-parchment-muted">{r.extraction_note ?? "—"}</dd>
              </div>
            </dl>

            {r.scrape_error ? (
              <p className="mt-4 rounded border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-200/90">
                Scrape error: {r.scrape_error}
              </p>
            ) : null}

            <details className="mt-6 rounded border border-ink-line bg-ink p-4">
              <summary className="cursor-pointer text-sm font-semibold text-gold">
                Raw excerpt (start of markdown input)
              </summary>
              <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-parchment-muted">
                {r.raw_excerpt || "—"}
              </pre>
            </details>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-center text-sm text-parchment-dim">
        <Link href="/insights" className="text-gold hover:underline">
          Back to insights
        </Link>
      </p>
    </div>
  );
}
