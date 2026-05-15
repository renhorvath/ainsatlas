import Link from "next/link";

export const metadata = {
  title: "Methodology",
};

const steps = [
  {
    title: "Scrape",
    body: "Public programme URLs are fetched with Firecrawl; markdown is stored per conference under data/raw/. Failures are logged in that JSON.",
  },
  {
    title: "Extract",
    body: "Claude turns each raw file into structured sessions, speakers, topic tags, and themes — with _meta.source_url linking back to the scrape.",
  },
  {
    title: "Synthesize",
    body: "A second pass reads all extractions: consensus topics, emerging clusters, blind spots, and short conference sketches.",
  },
  {
    title: "Publish",
    body: "report.html is optional; the Next.js site bundles synthesis.json, provenance.json, and meta.json from web/data/ (written on the report step).",
  },
] as const;

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Process</p>
      <h1 className="mt-4 font-serif text-4xl font-medium text-parchment md:text-5xl">
        How the atlas is built
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-parchment-muted">
        The goal repeatable reading, not a live calendar. Re-scrape and regenerate without
        hand-editing intermediates. Full spec:{" "}
        <code className="text-gold">PROJECT_SPEC.md</code> at repo root.
      </p>

      <ol className="mt-16 space-y-12">
        {steps.map((s, i) => (
          <li key={s.title} className="relative pl-0 md:pl-24">
            <span className="mb-3 block font-serif text-5xl leading-none text-gold/35 md:absolute md:left-0 md:top-0 md:mb-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="font-serif text-2xl text-parchment">{s.title}</h2>
            <p className="mt-3 leading-relaxed text-parchment-muted">{s.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-16 rounded-xl border border-ink-line bg-ink-card p-8">
        <h2 className="font-serif text-xl text-parchment">Publish to production</h2>
        <p className="mt-3 text-sm leading-relaxed text-parchment-muted">
          Set Vercel <strong className="text-parchment">Root Directory</strong> to{" "}
          <code className="text-gold">web</code>. After each pipeline run, commit{" "}
          <code className="text-gold">web/data/synthesis.json</code>,{" "}
          <code className="text-gold">provenance.json</code>, and{" "}
          <code className="text-gold">meta.json</code> (or use the GitHub Action{" "}
          <code className="text-gold">atlas-pipeline.yml</code>, which commits them automatically).
        </p>
        <p className="mt-3 text-sm leading-relaxed text-parchment-muted">
          On the live site, use <strong className="text-parchment">Conferences → Add a conference</strong>{" "}
          with <code className="text-gold">GITHUB_TOKEN</code> on Vercel, or edit{" "}
          <code className="text-gold">web/conferences.json</code> on GitHub and run the Atlas pipeline
          workflow (Firecrawl + Anthropic secrets in GitHub Actions).
        </p>
      </div>

      <p className="mt-12 text-sm text-parchment-dim">
        <Link href="/sources" className="text-gold hover:underline">
          Sources (input excerpts) →
        </Link>
      </p>
    </div>
  );
}
