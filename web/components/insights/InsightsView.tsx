import type { TopicChip } from "@/lib/types";

export type InsightsViewProps = {
  universal: TopicChip[];
  emerging: TopicChip[];
  niche: string[];
  absent: string[];
  profiles: Record<string, string>;
  speakers: string[];
  findings: string[];
  exportedAt?: string;
  synthesisCopied?: boolean;
};

function SectionTitle({
  id,
  kicker,
  title,
  description,
}: {
  id: string;
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <div id={id} className="scroll-mt-28">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{kicker}</p>
      <h2 className="mt-3 font-serif text-3xl text-parchment md:text-4xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-parchment-muted leading-relaxed">{description}</p>
    </div>
  );
}

export function InsightsView({
  universal,
  emerging,
  niche,
  absent,
  profiles,
  speakers,
  findings,
}: InsightsViewProps) {
  return (
    <div className="space-y-28">
      <section className="space-y-10">
        <SectionTitle
          id="universal"
          kicker="01 · Consensus"
          title="Universal themes"
          description="Cross-event patterns in the synthesis — check /sources for the programme text excerpts they’re grounded in."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {universal.length === 0 ? (
            <p className="text-parchment-dim">No universal topics in this file.</p>
          ) : (
            universal.map((t, i) => (
              <article
                key={`${t.label}-${i}`}
                className="group relative overflow-hidden rounded-lg border border-ink-line bg-ink-card p-6 transition hover:border-gold/25"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-serif text-xl leading-snug text-parchment group-hover:text-gold">
                    {t.label}
                  </h3>
                  {typeof t.count === "number" ? (
                    <span className="shrink-0 rounded border border-gold/35 bg-gold-glow px-2.5 py-1 text-xs font-semibold tabular-nums text-gold">
                      {t.count} markets
                    </span>
                  ) : null}
                </div>
                {t.conferences && t.conferences.length > 0 ? (
                  <p className="mt-4 text-xs leading-relaxed text-parchment-dim">
                    <span className="text-parchment-muted">Present in · </span>
                    {t.conferences.join(" · ")}
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="space-y-10">
        <SectionTitle
          id="emerging"
          kicker="02 · Momentum"
          title="Emerging threads"
          description="Topics gaining weight in a subset of agendas."
        />
        <div className="flex flex-wrap gap-3">
          {emerging.length === 0 ? (
            <p className="text-parchment-dim">No emerging topics listed.</p>
          ) : (
            emerging.map((t, i) => (
              <div
                key={`${t.label}-${i}`}
                className="flex max-w-md items-center gap-3 rounded-full border border-ink-line bg-ink-raised px-4 py-2.5"
              >
                <span className="font-medium text-parchment">{t.label}</span>
                {typeof t.count === "number" ? (
                  <span className="text-xs tabular-nums text-gold-dim">{t.count} conf.</span>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-10">
        <SectionTitle
          id="niche"
          kicker="03 · Local colour"
          title="Localized & niche themes"
          description="Angles concentrated in one market or organizer lens."
        />
        <ul className="grid gap-3 md:grid-cols-2">
          {niche.length === 0 ? (
            <li className="text-parchment-dim">None listed in this synthesis.</li>
          ) : (
            niche.map((t) => (
              <li
                key={t}
                className="border-l-2 border-gold/40 bg-ink-card/50 py-3 pl-5 text-parchment-muted leading-relaxed"
              >
                {t}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="space-y-8">
        <SectionTitle
          id="absent"
          kicker="04 · Silence"
          title="What the programmes barely touch"
          description="Model-inferred gaps — hypotheses, not proof of absence. Compare with excerpts on Sources."
        />
        <div className="relative overflow-hidden rounded-xl border border-gold/25 bg-gradient-to-br from-gold/10 via-ink-card to-ink-raised p-8 md:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/15 blur-2xl" />
          <ul className="relative space-y-5">
            {absent.length === 0 ? (
              <li className="text-parchment-muted">No absent topics in this file.</li>
            ) : (
              absent.map((t) => (
                <li key={t} className="font-serif text-lg leading-snug text-parchment md:text-xl">
                  <span className="mr-2 text-gold">—</span>
                  {t}
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="space-y-10">
        <SectionTitle
          id="profiles"
          kicker="05 · Identity"
          title="Conference character"
          description="Short profiles from the model, based on topic mix — editorial, not organizer branding."
        />
        {speakers.length > 0 ? (
          <div className="rounded-lg border border-dashed border-gold/25 bg-gold-glow px-5 py-4 md:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Names seen more than once
            </p>
            <p className="mt-2 text-sm leading-relaxed text-parchment-muted">{speakers.join(" · ")}</p>
          </div>
        ) : null}
        <div className="grid gap-5 md:grid-cols-2">
          {Object.keys(profiles).length === 0 ? (
            <p className="text-parchment-dim">No conference profiles in this file.</p>
          ) : (
            Object.entries(profiles).map(([name, body]) => (
              <article
                key={name}
                className="flex flex-col rounded-lg border border-ink-line bg-ink-card p-6 md:p-7"
              >
                <div className="h-0.5 w-12 bg-gold" aria-hidden />
                <h3 className="mt-5 font-serif text-xl text-parchment">{name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-parchment-muted">{body}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="space-y-10 pb-8">
        <SectionTitle
          id="findings"
          kicker="06 · Strategy read"
          title="Key findings"
          description="Compressed takeaways — trace supporting programme text under Sources."
        />
        <ol className="space-y-0">
          {findings.length === 0 ? (
            <li className="text-parchment-dim">No findings in this file.</li>
          ) : (
            findings.map((f, i) => (
              <li
                key={i}
                className="grid gap-4 border-t border-ink-line py-8 md:grid-cols-[4rem_1fr] md:gap-8"
              >
                <span className="font-serif text-3xl leading-none text-gold/50 md:text-4xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-lg leading-relaxed text-parchment-muted md:pt-1 md:text-xl">
                  {f}
                </p>
              </li>
            ))
          )}
        </ol>
      </section>
    </div>
  );
}
