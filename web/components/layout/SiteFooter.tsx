import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink-line bg-ink-raised">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <p className="font-serif text-2xl text-parchment">Conference Atlas</p>
            <p className="mt-3 text-sm leading-relaxed text-parchment-dim">
              Programme text is scraped from public industry pages, structured with an LLM,
              then synthesized for pattern reading. Not affiliated with any organizer — treat as
              research scaffolding, not official scheduling.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-parchment-muted md:text-right">
            <Link
              href="/insights"
              className="hover:text-gold"
            >
              View insights
            </Link>
            <span className="text-parchment-dim">
              Deploy on Vercel · share the URL with your team
            </span>
          </div>
        </div>
        <p className="mt-12 text-center text-xs text-parchment-dim">
          © {new Date().getFullYear()} — Built for internal strategy reviews
        </p>
      </div>
    </footer>
  );
}
