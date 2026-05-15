"use client";

import { useFormState, useFormStatus } from "react-dom";

import { addConferenceAction, type AddConferenceResult } from "./actions";

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

export function AddConferenceForm() {
  const [state, formAction] = useFormState(boundAddConference, null);

  return (
    <form action={formAction} className="mt-8 max-w-xl space-y-4 rounded-lg border border-ink-line bg-ink-card p-6">
      <h2 className="font-serif text-xl text-parchment">Add a conference (Next.js)</h2>
      <p className="text-sm text-parchment-muted">
        Local dev: writes <code className="text-gold">web/conferences.json</code>. Production on Vercel:
        use Git or the local Flask dashboard — see message after submit if blocked.
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
          <input id="nc-id" name="id" className="mt-1 w-full rounded border border-ink-line bg-ink px-3 py-2 text-parchment" />
        </div>
        <div>
          <label className="text-xs text-parchment-dim" htmlFor="nc-city">
            City
          </label>
          <input id="nc-city" name="city" className="mt-1 w-full rounded border border-ink-line bg-ink px-3 py-2 text-parchment" />
        </div>
        <div>
          <label className="text-xs text-parchment-dim" htmlFor="nc-country">
            Country
          </label>
          <input id="nc-country" name="country" className="mt-1 w-full rounded border border-ink-line bg-ink px-3 py-2 text-parchment" />
        </div>
      </div>
      <SubmitButton />
      {state?.ok === true ? (
        <p className="text-sm text-gold" role="status">
          Saved id &quot;{state.id}&quot;. Re-run the Python pipeline for this URL.
        </p>
      ) : null}
      {state && state.ok === false ? (
        <p className="text-sm text-parchment-muted" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
