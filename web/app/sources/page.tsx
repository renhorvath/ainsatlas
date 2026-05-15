import Link from "next/link";

import { loadProvenance } from "@/lib/data";

export const metadata = {
  title: "Sources",
};

export default function SourcesPage() {
  const rows = loadProvenance();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Evidence</p>
      <h1 className="mt-4 font-serif text-4xl font-medium text-parchment md:text-5xl">
        Programme sources
      </h1>
      <p className="mt-5 max-w-3xl text-parchment-muted leading-relaxed">
        Each festival links to the public programme page used as input. Where we have captured
        text, you can expand a card to read the opening of the page.
      </p>

      <ul className="mt-14 space-y-10">
        {rows.map((r) => {
          const hasExcerpt =
            Boolean(r.raw_excerpt) &&
            !r.raw_excerpt.startsWith("[") &&
            r.raw_chars > 0;

          const location = [r.city, r.country].filter(Boolean).join(", ");

          return (
            <li
              key={r.id}
              className="rounded-xl border border-ink-line bg-ink-card p-6 md:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-parchment">{r.name}</h2>
                  <p className="mt-1 text-sm text-parchment-dim">
                    {r.year}
                    {location ? ` · ${location}` : ""}
                  </p>
                </div>
                <a
                  href={r.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded border border-gold bg-gold/15 px-4 py-2.5 text-sm font-semibold text-gold transition hover:bg-gold/25"
                >
                  Open programme →
                </a>
              </div>

              {r.scraped_at || r.raw_chars > 0 ? (
                <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                  {r.scraped_at ? (
                    <div>
                      <dt className="text-parchment-dim">Last scraped (UTC)</dt>
                      <dd className="font-mono text-parchment-muted">{r.scraped_at}</dd>
                    </div>
                  ) : null}
                  {r.raw_chars > 0 ? (
                    <div>
                      <dt className="text-parchment-dim">Captured text</dt>
                      <dd className="font-mono text-parchment-muted">
                        {r.raw_chars.toLocaleString()} characters
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}

              {hasExcerpt ? (
                <details className="mt-6 rounded border border-ink-line bg-ink p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-gold">
                    Programme excerpt
                  </summary>
                  <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-parchment-muted">
                    {r.raw_excerpt}
                  </pre>
                </details>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-12 text-center text-sm text-parchment-dim">
        <Link href="/conferences" className="text-gold hover:underline">
          All conferences
        </Link>
        {" · "}
        <Link href="/insights" className="text-gold hover:underline">
          Insights
        </Link>
      </p>
    </div>
  );
}
