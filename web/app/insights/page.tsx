import Link from "next/link";

import { InsightsView } from "@/components/insights/InsightsView";
import { loadPublicData } from "@/lib/data";
import {
  normalizeProfiles,
  normalizeStrings,
  normalizeTopics,
} from "@/lib/normalize";

export const metadata = {
  title: "Insights",
};

const toc = [
  { id: "universal", label: "Universal themes" },
  { id: "emerging", label: "Emerging" },
  { id: "niche", label: "Local & niche" },
  { id: "absent", label: "Absent" },
  { id: "profiles", label: "Profiles" },
  { id: "findings", label: "Findings" },
] as const;

export default async function InsightsPage() {
  const { synthesis, meta } = await loadPublicData();

  if (!synthesis) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 md:px-8">
        <h1 className="font-serif text-3xl text-parchment">No synthesis file</h1>
        <p className="mt-4 text-parchment-muted leading-relaxed">
          Add <code className="rounded bg-ink-card px-1.5 py-0.5 text-sm">web/public/data/synthesis.json</code>{" "}
          or run <code className="rounded bg-ink-card px-1.5 py-0.5 text-sm">python run.py --all</code>{" "}
          after a successful pipeline (report step exports to <span className="text-gold">web/public/data/</span>).
        </p>
        <Link href="/" className="mt-8 inline-block font-medium text-gold hover:underline">
          ← Home
        </Link>
      </div>
    );
  }

  const props = {
    universal: normalizeTopics(synthesis.universal_topics),
    emerging: normalizeTopics(synthesis.emerging_topics),
    niche: normalizeStrings(synthesis.niche_topics),
    absent: normalizeStrings(synthesis.absent_topics),
    profiles: normalizeProfiles(synthesis.conference_profiles),
    speakers: normalizeStrings(synthesis.frequent_speakers),
    findings: normalizeStrings(synthesis.key_findings),
    exportedAt: meta?.exportedAt,
    synthesisCopied: meta?.synthesisCopied,
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
            Cross-conference synthesis
          </p>
          <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight text-parchment md:text-5xl">
            European programme landscape
          </h1>
          <p className="mt-5 max-w-2xl text-parchment-muted leading-relaxed">
            Structured from public conference pages — interpreted for teams who plan releases, DSP
            partnerships, and touring years ahead of the calendar circuit.
          </p>
          {props.exportedAt ? (
            <p className="mt-4 text-xs text-parchment-dim">
              Last export{" "}
              {new Date(props.exportedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              {props.synthesisCopied === false ? (
                <span className="text-gold-dim"> · preview dataset</span>
              ) : null}
            </p>
          ) : null}
        </div>

        <aside className="mt-10 hidden lg:sticky lg:top-28 lg:mt-0 lg:block lg:h-fit">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-parchment-dim">
            On this page
          </p>
          <ul className="mt-4 space-y-2 border-l border-ink-line pl-4">
            {toc.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-sm text-parchment-muted transition hover:text-gold"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="mt-16">
        <InsightsView {...props} />
      </div>
    </div>
  );
}
