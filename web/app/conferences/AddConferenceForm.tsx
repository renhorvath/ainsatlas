"use client";

import { useFormState, useFormStatus } from "react-dom";

import { addConferenceAction, type AddConferenceResult } from "./actions";
import { PipelineControls } from "./PipelineControls";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 inline-flex rounded border border-gold bg-gold px-5 py-2.5 font-semibold text-ink transition hover:bg-gold-bright disabled:opacity-50"
    >
      {pending ? "Saving…" : "Add conference"}
    </button>
  );
}

async function boundAddConference(
  _prev: AddConferenceResult | null,
  formData: FormData,
): Promise<AddConferenceResult> {
  return addConferenceAction(formData);
}

type Props = { githubEnabled: boolean };

export function AddConferenceForm({ githubEnabled }: Props) {
  const [state, formAction] = useFormState(boundAddConference, null);

  return (
    <section className="mt-10 max-w-xl">
      <form
        action={formAction}
        className="space-y-4 rounded-lg border border-ink-line bg-ink-card p-6"
      >
        <h2 className="font-serif text-xl text-parchment">Add a conference</h2>
        <p className="text-sm text-parchment-muted">
          {githubEnabled
            ? "Saves to GitHub, then the Atlas pipeline scrapes, extracts, synthesizes, and commits web/data/ for the live site."
            : "Local dev: writes web/conferences.json. On production without GITHUB_TOKEN, use the publish steps below."}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-parchment-dim" htmlFor="nc-name">
              Name
            </label>
            <input
              id="nc-name"
              name="name"
              required
              className="mt-1 w-full rounded border border-ink-line bg-ink px-3 py-2 text-parchment"
            />
          </div>
          <div>
            <label className="text-xs text-parchment-dim" htmlFor="nc-year">
              Year
            </label>
            <input
              id="nc-year"
              name="year"
              required
              className="mt-1 w-full rounded border border-ink-line bg-ink px-3 py-2 text-parchment"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-parchment-dim" htmlFor="nc-url">
            Programme URL
          </label>
          <input
            id="nc-url"
            name="url"
            type="url"
            required
            className="mt-1 w-full rounded border border-ink-line bg-ink px-3 py-2 text-parchment"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs text-parchment-dim" htmlFor="nc-id">
              Id (optional)
            </label>
            <input
              id="nc-id"
              name="id"
              className="mt-1 w-full rounded border border-ink-line bg-ink px-3 py-2 text-parchment"
            />
          </div>
          <div>
            <label className="text-xs text-parchment-dim" htmlFor="nc-city">
              City
            </label>
            <input
              id="nc-city"
              name="city"
              className="mt-1 w-full rounded border border-ink-line bg-ink px-3 py-2 text-parchment"
            />
          </div>
          <div>
            <label className="text-xs text-parchment-dim" htmlFor="nc-country">
              Country
            </label>
            <input
              id="nc-country"
              name="country"
              className="mt-1 w-full rounded border border-ink-line bg-ink px-3 py-2 text-parchment"
            />
          </div>
        </div>
        <SubmitButton />
        {state?.ok === true ? (
          <p className="text-sm text-gold" role="status">
            Saved &quot;{state.id}&quot;.
            {state.pipelineQueued
              ? " The Atlas pipeline will start on GitHub (then Vercel redeploys with new insights)."
              : " Run python run.py --all or the dashboard to scrape and publish."}
          </p>
        ) : null}
        {state && state.ok === false ? (
          <p className="text-sm text-parchment-muted" role="alert">
            {state.error}
          </p>
        ) : null}
      </form>

      <PipelineControls githubEnabled={githubEnabled} />
    </section>
  );
}
