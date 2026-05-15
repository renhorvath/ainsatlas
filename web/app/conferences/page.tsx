import Link from "next/link";

import { AddConferenceForm } from "./AddConferenceForm";
import { CONFERENCES } from "@/lib/conferences";

export const metadata = {
  title: "Conferences",
};

export default function ConferencesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Coverage</p>
      <h1 className="mt-4 font-serif text-4xl font-medium text-parchment md:text-5xl">
        Programmes in the atlas
      </h1>
      <p className="mt-5 max-w-2xl text-parchment-muted leading-relaxed">
        Sources are listed in{" "}
        <code className="rounded bg-ink-card px-1.5 text-sm">web/conferences.json</code> — the same
        list drives the Python scraper and this site.
      </p>

      <AddConferenceForm />

      <ul className="mt-14 grid gap-5 md:grid-cols-2">
        {CONFERENCES.map((c) => (
          <li key={c.id}>
            <article className="flex h-full flex-col rounded-lg border border-ink-line bg-ink-card p-6 transition hover:border-gold/20">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-serif text-xl text-parchment">{c.name}</h2>
                <span className="shrink-0 rounded border border-ink-line px-2 py-0.5 text-xs text-parchment-dim">
                  {c.year}
                </span>
              </div>
              <p className="mt-2 text-sm text-parchment-muted">
                {[c.city, c.country].filter(Boolean).join(", ") || "—"}
              </p>
              <Link
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm font-medium text-gold hover:text-gold-bright"
              >
                Open programme →
              </Link>
            </article>
          </li>
        ))}
      </ul>

      <p className="mt-14 text-center text-sm text-parchment-dim">
        <Link href="/insights" className="text-gold hover:underline">
          Insights
        </Link>
        {" · "}
        <Link href="/sources" className="text-gold hover:underline">
          Sources
        </Link>
      </p>
    </div>
  );
}
