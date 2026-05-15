import Link from "next/link";

import { loadPublicData } from "@/lib/data";
import { normalizeStrings, normalizeTopics } from "@/lib/normalize";

export default function HomePage() {
  const { synthesis, meta } = loadPublicData();
  const findings = synthesis
    ? normalizeStrings(synthesis.key_findings).slice(0, 3)
    : [];
  const hasData = Boolean(synthesis);

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink-line">
        <div className="pointer-events-none absolute -right-20 top-10 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-gold/5 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
          <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.28em] text-gold opacity-0 [animation-delay:0.05s]">
            Research surface
          </p>
          <h1 className="animate-fade-up mt-5 max-w-4xl font-serif text-4xl font-medium leading-[1.08] tracking-tight text-balance text-parchment opacity-0 [animation-delay:0.12s] md:text-6xl md:leading-[1.06]">
            Read across Europe&apos;s music conference conversation — in one calm view.
          </h1>
          <p className="animate-fade-up mt-6 max-w-2xl text-lg leading-relaxed text-parchment-muted opacity-0 [animation-delay:0.2s]">
            Programme pages are scraped to markdown, structured with an LLM, then synthesized for
            pattern reading — with source excerpts on the{" "}
            <Link href="/sources" className="text-gold hover:underline">
              Sources
            </Link>{" "}
            page so nothing is a black box.
          </p>
          <div className="animate-fade-up mt-10 flex flex-wrap items-center gap-4 opacity-0 [animation-delay:0.28s]">
            <Link
              href="/insights"
              className="inline-flex items-center justify-center rounded border border-gold bg-gold px-6 py-3 font-semibold text-ink transition hover:bg-gold-bright"
            >
              Explore insights
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center justify-center rounded border border-ink-line px-6 py-3 font-medium text-parchment transition hover:border-gold/40 hover:text-gold"
            >
              How it&apos;s made
            </Link>
          </div>
          {meta?.exportedAt ? (
            <p className="animate-fade-up mt-8 text-xs text-parchment-dim opacity-0 [animation-delay:0.34s]">
              Data export ·{" "}
              {new Date(meta.exportedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              {meta.synthesisCopied ? "" : " · using bundled preview"}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="font-serif text-3xl text-parchment md:text-4xl">Why this exists</h2>
            <p className="mt-4 text-parchment-muted leading-relaxed">
              Festival and conference sites are loud and fragmented. Atlas flattens public programme
              text into a single editorial layout with explicit traceability to inputs.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-parchment-muted">
              {[
                "Provenance — URLs, scrape time, and text excerpts per event",
                "Structured extraction — sessions, speakers, themes before any cross-event synthesis",
                "Deployable site — static JSON for Vercel; pipeline stays local",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-ink-line bg-ink-card p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">At a glance</p>
            {!hasData ? (
              <p className="mt-4 text-parchment-muted leading-relaxed">
                Run the Python pipeline to replace preview data. Until then, see sample output on{" "}
                <Link href="/insights" className="text-gold underline-offset-2 hover:underline">
                  insights
                </Link>
                .
              </p>
            ) : (
              <ol className="mt-6 space-y-5">
                {findings.length === 0 ? (
                  <li className="text-parchment-dim">No key findings in current file.</li>
                ) : (
                  findings.map((f, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="font-serif text-2xl leading-none text-gold-dim">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-parchment-muted leading-relaxed">{f}</span>
                    </li>
                  ))
                )}
              </ol>
            )}
            <Link
              href="/sources"
              className="mt-8 inline-block text-sm font-semibold text-gold hover:text-gold-bright"
            >
              Verify inputs (sources) →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
