import { atlasPersistenceHelpText, isBlobConfigured } from "@/lib/atlas-bundle";

export function StorageWarning() {
  if (process.env.VERCEL !== "1") return null;
  if (isBlobConfigured()) return null;

  return (
    <div
      className="mb-8 rounded-lg border border-amber-500/40 bg-amber-950/25 px-4 py-3 text-sm leading-relaxed text-parchment-muted"
      role="status"
    >
      <p className="font-semibold text-amber-200/90">Production storage required</p>
      <p className="mt-2">{atlasPersistenceHelpText()}</p>
      <p className="mt-2 text-xs text-parchment-dim">
        After attaching Blob, redeploy — then use <strong className="text-parchment">Refresh all conferences</strong> once so Insights
        and Sources stay in sync.
      </p>
    </div>
  );
}
