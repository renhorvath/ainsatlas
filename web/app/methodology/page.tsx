import Link from "next/link";

export const metadata = {
  title: "Methodology",
};

const steps = [
  {
    title: "Scrape",
    body: "Public programme URLs are fetched with Firecrawl; markdown is stored per conference under data/raw/. Failures are logged — the chain keeps moving.",
  },
  {
    title: "Extract",
    body: "Claude Sonnet turns each raw file into structured sessions, speakers, topic tags, and local themes — capped for context where pages are enormous.",
  },
  {
    title: "Synthesize",
    body: "A second model pass looks across all extractions: consensus topics, emerging clusters, blind spots, and conference personality sketches.",
  },
  {
    title: "Publish",
    body: "The HTML brief is optional legacy output; this Next.js site reads the same synthesis JSON — exported into web/public/data/ when you run the report step.",
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
        The goal is repeatable reading, not a live calendar. Everything is idempotent: you can
        re-scrape and regenerate without hand-editing intermediate files.
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
        <h2 className="font-serif text-xl text-parchment">For your colleague</h2>
        <p className="mt-3 text-sm leading-relaxed text-parchment-muted">
          Add or remove sources in{" "}
          <code className="text-gold">web/conferences.json</code> (committed with the repo); the
          scraper and the Next.js conference list both read that file. Deploy the{" "}
          <code className="text-gold">web</code> folder to Vercel (set{" "}
          <strong className="text-parchment-muted">Root Directory</strong> to{" "}
          <code className="text-gold">web</code>). After each local pipeline run, commit the updated{" "}
          <code className="text-gold">web/public/data/synthesis.json</code> so production shows fresh
          results — or wire CI later if you want hands-off deploys.
        </p>
      </div>

      <p className="mt-12 text-sm text-parchment-dim">
        <Link href="/insights" className="text-gold hover:underline">
          View synthesis →
        </Link>
      </p>
    </div>
  );
}
