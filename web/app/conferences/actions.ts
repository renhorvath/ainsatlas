"use server";

import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

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

async function readRows(): Promise<Record<string, unknown>[]> {
  const file = path.join(process.cwd(), "conferences.json");
  const raw = JSON.parse(await fs.readFile(file, "utf-8")) as unknown;
  if (!Array.isArray(raw)) throw new Error("conferences.json must be an array");
  return raw as Record<string, unknown>[];
}

async function writeRows(rows: Record<string, unknown>[]): Promise<void> {
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
  const file = path.join(process.cwd(), "conferences.json");
  const tmp = `${file}.tmp`;
  const text = JSON.stringify(rows, null, 2) + "\n";
  await fs.writeFile(tmp, text, "utf-8");
  await fs.rename(tmp, file);
}

export type AddConferenceResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function addConferenceAction(formData: FormData): Promise<AddConferenceResult> {
  const blocked =
    process.env.VERCEL === "1" &&
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_VERCEL_CONF_WRITE !== "1";

  if (blocked) {
    return {
      ok: false,
      error:
        "Saving conferences is disabled on production Vercel (read-only filesystem). Edit web/conferences.json in GitHub, or run python dashboard.py / npm run dev locally. See PROJECT_SPEC.md.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const idRaw = String(formData.get("id") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();

  if (!name || !year || !url) {
    return { ok: false, error: "Name, year, and programme URL are required." };
  }

  const id = idRaw || slugify(name);
  if (!id) return { ok: false, error: "Could not derive id — set id explicitly." };

  try {
    const rows = await readRows();
    const existing = new Set(rows.map((r, i) => normalizeId(r, i)));
    if (existing.has(id)) return { ok: false, error: `Conference id "${id}" already exists.` };

    const entry: Record<string, unknown> = { id, name, year, url };
    if (city) entry.city = city;
    if (country) entry.country = country;
    rows.push(entry);
    await writeRows(rows);
    revalidatePath("/conferences");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
