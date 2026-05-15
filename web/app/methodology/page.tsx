import Link from "next/link";

export const metadata = {
  title: "Methodology",
};

const steps = [
  {
    title: "Scrape",
    body: "Public programme URLs are fetched with Firecrawl; markdown is stored per conference. Failures are logged on the Sources page.",
  },
  {
    title: "Extract",
    body: "Claude turns each scrape into structured sessions, speakers, topic tags, and themes — with source URLs preserved.",
  },
  {
    title: "Synthesize",
    body: "A second pass reads all extractions: consensus topics, emerging clusters, blind spots, and short conference sketches.",
  },
  {
    title: "Publish",
    body: "Results are saved on the server and shown on Insights and Sources immediately — no manual git export.",
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
        Add a conference on the{" "}
        <Link href="/conferences" className="text-gold hover:underline">
          Conferences
        </Link>{" "}
        page. The server uses your Firecrawl and Anthropic keys (local <code className="text-gold">.env</code>{" "}
        or Vercel environment variables). On Vercel, attach <strong className="text-parchment">Blob</strong>{" "}
        storage so every page reads the same saved data.
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

      <p className="mt-12 text-sm text-parchment-dim">
        <Link href="/sources" className="text-gold hover:underline">
          Sources (input excerpts) →
        </Link>
      </p>
    </div>
  );
}
