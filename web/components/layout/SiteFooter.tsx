import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink-line bg-ink-raised">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <p className="font-serif text-2xl text-parchment">Conference Atlas</p>
            <p className="mt-3 text-sm leading-relaxed text-parchment-dim">
              Programme text is scraped from public pages, structured with an LLM, then synthesized.
              The Sources page shows excerpts of what entered the model. Not affiliated with any
              organizer.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-parchment-muted md:text-right">
            <Link href="/sources" className="hover:text-gold">
              Verify sources
            </Link>
            <Link href="/insights" className="hover:text-gold">
              View insights
            </Link>
            <span className="text-parchment-dim">Deploy on Vercel · Root Directory: web</span>
          </div>
        </div>
        <p className="mt-12 text-center text-xs text-parchment-dim">
          © {new Date().getFullYear()} — Read PROJECT_SPEC.md before changing the pipeline
        </p>
      </div>
    </footer>
  );
}
