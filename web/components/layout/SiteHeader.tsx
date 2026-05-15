import Link from "next/link";

const nav = [
  { href: "/insights", label: "Insights" },
  { href: "/conferences", label: "Conferences" },
  { href: "/methodology", label: "Methodology" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gold/10 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link href="/" className="group flex flex-col leading-tight">
          <span className="font-serif text-xl font-medium tracking-tight text-parchment transition-colors group-hover:text-gold md:text-2xl">
            Conference Atlas
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-parchment-dim">
            European music industry
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-6" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-2 py-1 text-sm text-parchment-muted transition-colors hover:bg-gold-glow hover:text-gold sm:text-[15px]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
