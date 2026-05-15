"use client";

import { useFormState, useFormStatus } from "react-dom";

import { addConferenceAction, runPipelineAction, type AddConferenceResult, type PipelineResult } from "./actions";

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 inline-flex rounded border border-gold bg-gold px-5 py-2.5 font-semibold text-ink transition hover:bg-gold-bright disabled:opacity-50"
    >
      {pending ? "Working…" : "Add & publish"}
    </button>
  );
}

function RefreshButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex rounded border border-ink-line px-5 py-2.5 text-sm font-semibold text-parchment transition hover:border-gold/40 disabled:opacity-50"
    >
      {pending ? "Running pipeline…" : "Refresh all conferences"}
    </button>
  );
}

async function boundAdd(
  _prev: AddConferenceResult | null,
  formData: FormData,
): Promise<AddConferenceResult> {
  return addConferenceAction(formData);
}

async function boundRefresh(
  _prev: PipelineResult | null,
  _formData: FormData,
): Promise<PipelineResult> {
  return runPipelineAction();
}

export function AddConferenceForm() {
  const [addState, addAction] = useFormState(boundAdd, null);
  const [refreshState, refreshAction] = useFormState(boundRefresh, null);

  return (
    <section className="mt-10 max-w-xl space-y-6">
      <form
        action={addAction}
        className="space-y-4 rounded-lg border border-ink-line bg-ink-card p-6"
      >
        <h2 className="font-serif text-xl text-parchment">Add a conference</h2>
        <p className="text-sm text-parchment-muted">
          Scrapes the programme URL, extracts sessions with Claude, updates cross-event insights,
          and publishes to the live site. Uses your Firecrawl and Anthropic keys on the server
          (same as local <code className="text-gold">.env</code>).
        </p>
        <input type="hidden" name="runPipeline" value="1" />
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
        <AddButton />
        {addState?.ok === true ? (
          <p className="text-sm text-gold" role="status">
            Published &quot;{addState.id}&quot; — insights and sources are updated.
          </p>
        ) : null}
        {addState && addState.ok === false ? (
          <p className="text-sm text-parchment-muted" role="alert">
            {addState.error}
          </p>
        ) : null}
      </form>

      <form action={refreshAction}>
        <RefreshButton />
        {refreshState?.ok === true ? (
          <p className="mt-3 text-sm text-gold" role="status">
            All conferences re-scraped and synthesis updated.
          </p>
        ) : null}
        {refreshState && refreshState.ok === false ? (
          <p className="mt-3 text-sm text-parchment-muted" role="alert">
            {refreshState.error}
          </p>
        ) : null}
      </form>
    </section>
  );
}
