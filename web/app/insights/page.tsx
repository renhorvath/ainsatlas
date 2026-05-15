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

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const { synthesis, meta } = await loadPublicData();

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

  const isPreview = meta?.synthesisCopied === false;

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
            Patterns read across public programme pages. Browse each festival on the{" "}
            <Link href="/conferences" className="text-gold hover:underline">
              Conferences
            </Link> 
            page or review programme inputs on{" "}
            <Link href="/sources" className="text-gold hover:underline">
              Sources
            </Link>
            .
          </p>
          {isPreview ? (
            <p className="mt-4 rounded border border-gold/25 bg-gold-glow px-4 py-2 text-sm text-parchment-muted">
              Preview analysis — refresh by running the pipeline with your API keys.
            </p>
          ) : null}
          {props.exportedAt ? (
            <p className="mt-4 text-xs text-parchment-dim">
              Last export{" "}
              {new Date(props.exportedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
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
