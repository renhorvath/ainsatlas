"use client";

import { useFormState, useFormStatus } from "react-dom";

import { runPipelineAction, type PipelineResult } from "./actions";

function RunButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex rounded border border-gold/60 px-5 py-2.5 text-sm font-semibold text-gold transition hover:border-gold hover:bg-gold/10 disabled:opacity-50"
    >
      {pending ? "Starting…" : "Run scrape → synthesize → publish"}
    </button>
  );
}

async function boundRun(
  _prev: PipelineResult | null,
  _formData: FormData,
): Promise<PipelineResult> {
  return runPipelineAction();
}

type Props = { githubEnabled: boolean };

export function PipelineControls({ githubEnabled }: Props) {
  const [state, formAction] = useFormState(boundRun, null);

  if (!githubEnabled) {
    return (
      <div className="mt-8 max-w-xl rounded-lg border border-ink-line bg-ink-card p-6">
        <h2 className="font-serif text-xl text-parchment">Publish updates</h2>
        <p className="mt-3 text-sm leading-relaxed text-parchment-muted">
          Production cannot run the Python pipeline on Vercel. To add conferences and publish
          synthesis like the others:
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-parchment-muted">
          <li>
            Add a row in{" "}
            <a
              href="https://github.com/renhorvath/ainsatlas/edit/main/web/conferences.json"
              className="text-gold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              web/conferences.json on GitHub
            </a>
            , or run <code className="text-gold">python dashboard.py</code> locally.
          </li>
          <li>
            Run the{" "}
            <a
              href="https://github.com/renhorvath/ainsatlas/actions/workflows/atlas-pipeline.yml"
              className="text-gold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Atlas pipeline
            </a>{" "}
            workflow (needs <code className="text-gold">FIRECRAWL_API_KEY</code> and{" "}
            <code className="text-gold">ANTHROPIC_API_KEY</code> in GitHub Actions secrets).
          </li>
          <li>Vercel redeploys automatically when <code className="text-gold">web/data/</code> is committed.</li>
        </ol>
        <p className="mt-4 text-xs text-parchment-dim">
          Optional: set <code className="text-gold">GITHUB_TOKEN</code> on Vercel to enable the form
          and one-click pipeline from this site.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6">
      <RunButton />
      {state?.ok === true ? (
        <p className="mt-3 text-sm text-gold" role="status">
          Pipeline started on GitHub Actions. When it finishes, this site redeploys with updated{" "}
          <code className="text-gold">web/data/</code> (usually 5–15 minutes).
        </p>
      ) : null}
      {state && state.ok === false ? (
        <p className="mt-3 text-sm text-parchment-muted" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
