"use server";

import { revalidatePath } from "next/cache";

import { loadBundle, saveBundle } from "@/lib/atlas-bundle";
import { runAtlasPipeline } from "@/lib/pipeline/run";

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[-\s]+/g, "_")
      .replace(/^_+|_+$/g, "") || "conference"
  );
}

function normalizeId(row: Record<string, unknown>, index: number): string {
  let cid = String(row.id ?? "").trim();
  if (!cid) cid = slugify(String(row.name ?? ""));
  if (!cid) throw new Error(`Item ${index}: could not derive id`);
  return cid;
}

function validateConferences(rows: Record<string, unknown>[]): void {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || typeof row !== "object") throw new Error(`Item ${i} must be object`);
    for (const key of ["name", "year", "url"] as const) {
      if (!String(row[key] ?? "").trim()) throw new Error(`Item ${i}: missing ${key}`);
    }
    normalizeId(row, i);
  }
  const seen = new Set<string>();
  for (let i = 0; i < rows.length; i++) {
    const rid = normalizeId(rows[i], i);
    if (seen.has(rid)) throw new Error(`Duplicate id: ${rid}`);
    seen.add(rid);
  }
}

export type AddConferenceResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function addConferenceAction(formData: FormData): Promise<AddConferenceResult> {
  const name = String(formData.get("name") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const idRaw = String(formData.get("id") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const runNow = String(formData.get("runPipeline") ?? "1") === "1";

  if (!name || !year || !url) {
    return { ok: false, error: "Name, year, and programme URL are required." };
  }

  const id = idRaw || slugify(name);
  if (!id) return { ok: false, error: "Could not derive id — set id explicitly." };

  try {
    const bundle = await loadBundle();
    const rows = bundle.conferences as Record<string, unknown>[];
    const existing = new Set(rows.map((r, i) => normalizeId(r, i)));
    if (existing.has(id)) return { ok: false, error: `Conference id "${id}" already exists.` };

    const entry: Record<string, unknown> = { id, name, year, url };
    if (city) entry.city = city;
    if (country) entry.country = country;
    rows.push(entry);
    validateConferences(rows);
    bundle.conferences = rows as typeof bundle.conferences;
    await saveBundle(bundle);

    if (runNow) {
      await runAtlasPipeline({ conferenceId: id });
    }

    revalidatePath("/", "layout");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export type PipelineResult = { ok: true } | { ok: false; error: string };

export async function runPipelineAction(): Promise<PipelineResult> {
  try {
    await runAtlasPipeline();
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
