import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import { head, put } from "@vercel/blob";

import bundledConferences from "../conferences.json";
import bundledMeta from "../data/meta.json";
import bundledProvenance from "../data/provenance.json";
import bundledSynthesis from "../data/synthesis.json";
import type { Conference } from "./conferences";
import type { MetaFile, ProvenanceRow, Synthesis } from "./types";

const BLOB_PATH = "atlas/bundle.json";
const LOCAL_PATH = path.join(process.cwd(), ".atlas-store", "bundle.json");
const VERCEL_TMP = "/tmp/atlas-bundle.json";

/** Vercel names env `BLOB_READ_WRITE_TOKEN` for the first linked store, or `BLOB_2_READ_WRITE_TOKEN`, etc. */
export function blobReadWriteToken(): string | undefined {
  const t =
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
    process.env.BLOB_2_READ_WRITE_TOKEN?.trim() ||
    process.env.BLOB_3_READ_WRITE_TOKEN?.trim();
  return t || undefined;
}

export type RawRecord = {
  conference: string;
  year: string;
  url: string;
  scraped_at: string;
  raw_content: string | null;
  error: string | null;
};

export type ExtractedRecord = {
  conference?: string;
  year?: string;
  sessions?: unknown[];
  overall_themes?: unknown[];
  extraction_note?: string;
  _meta?: Record<string, unknown>;
  _id?: string;
};

export type AtlasBundle = {
  conferences: Conference[];
  raw: Record<string, RawRecord>;
  extracted: Record<string, ExtractedRecord>;
  synthesis: Synthesis | null;
  provenance: ProvenanceRow[];
  meta: MetaFile;
};

function defaultBundle(): AtlasBundle {
  return {
    conferences: bundledConferences as Conference[],
    raw: {},
    extracted: {},
    synthesis: bundledSynthesis as Synthesis,
    provenance: bundledProvenance as ProvenanceRow[],
    meta: bundledMeta as MetaFile,
  };
}

async function readLocal(): Promise<AtlasBundle | null> {
  try {
    const text = await fs.readFile(LOCAL_PATH, "utf-8");
    return JSON.parse(text) as AtlasBundle;
  } catch {
    return null;
  }
}

async function readTmp(): Promise<AtlasBundle | null> {
  if (process.env.VERCEL !== "1") return null;
  try {
    const text = await fs.readFile(VERCEL_TMP, "utf-8");
    return JSON.parse(text) as AtlasBundle;
  } catch {
    return null;
  }
}

async function readBlob(): Promise<AtlasBundle | null> {
  const token = blobReadWriteToken();
  if (!token) return null;
  try {
    const meta = await head(BLOB_PATH, { token });
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as AtlasBundle;
  } catch {
    return null;
  }
}

export async function loadBundle(): Promise<AtlasBundle> {
  const onVercel = process.env.VERCEL === "1";
  const hasBlob = Boolean(blobReadWriteToken());

  if (hasBlob) {
    const blob = await readBlob();
    if (blob) return blob;
    if (onVercel) return defaultBundle();
  }

  const tmp = await readTmp();
  if (tmp) return tmp;
  const local = await readLocal();
  if (local) return local;
  return defaultBundle();
}

export function atlasPersistenceHelpText(): string {
  return (
    "Connect Vercel Blob (Project → Storage → Blob → attach to this project). " +
    "Without it, each server has its own copy of your data — Insights can show old synthesis while Sources shows updates."
  );
}

export async function saveBundle(bundle: AtlasBundle): Promise<void> {
  const text = JSON.stringify(bundle, null, 2);

  const onVercel = process.env.VERCEL === "1";
  const token = blobReadWriteToken();
  const hasBlob = Boolean(token);

  if (onVercel && !hasBlob) {
    throw new Error(atlasPersistenceHelpText());
  }

  if (hasBlob && token) {
    await put(BLOB_PATH, text, {
      access: "public",
      allowOverwrite: true,
      contentType: "application/json",
      token,
    });
  }

  if (onVercel) {
    await fs.writeFile(VERCEL_TMP, text, "utf-8");
    return;
  }

  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, text, "utf-8");
}

/** True when Blob is wired (required for consistent reads across Vercel instances). */
export function isBlobConfigured(): boolean {
  return Boolean(blobReadWriteToken());
}

export function buildProvenance(bundle: AtlasBundle): ProvenanceRow[] {
  return bundle.conferences.map((c) => {
    const raw = bundle.raw[c.id];
    const ext = bundle.extracted[c.id];
    const content = raw?.raw_content ?? "";
    return {
      id: c.id,
      name: c.name,
      year: c.year,
      source_url: c.url,
      city: c.city,
      country: c.country,
      scraped_at: raw?.scraped_at ?? null,
      scrape_error: raw?.error ?? null,
      raw_chars: content.length,
      raw_excerpt: content.slice(0, 1200),
      raw_sha256_prefix: content
        ? createHash("sha256").update(content).digest("hex").slice(0, 16)
        : null,
      extracted_session_count: Array.isArray(ext?.sessions) ? ext.sessions.length : 0,
      extraction_note: ext?.extraction_note ?? null,
      extraction_meta: (ext?._meta as Record<string, unknown>) ?? null,
    };
  });
}
