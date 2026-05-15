import "server-only";

import fs from "fs/promises";
import path from "path";

import type { MetaFile, ProvenanceRow, Synthesis } from "./types";

export async function loadPublicData(): Promise<{
  synthesis: Synthesis | null;
  meta: MetaFile | null;
}> {
  const dir = path.join(process.cwd(), "public", "data");
  let synthesis: Synthesis | null = null;
  let meta: MetaFile | null = null;

  try {
    const synPath = path.join(dir, "synthesis.json");
    const raw = await fs.readFile(synPath, "utf-8");
    synthesis = JSON.parse(raw) as Synthesis;
  } catch {
    synthesis = null;
  }

  try {
    const metaPath = path.join(dir, "meta.json");
    const raw = await fs.readFile(metaPath, "utf-8");
    meta = JSON.parse(raw) as MetaFile;
  } catch {
    meta = null;
  }

  return { synthesis, meta };
}

export async function loadProvenance(): Promise<ProvenanceRow[] | null> {
  const dir = path.join(process.cwd(), "public", "data");
  try {
    const p = path.join(dir, "provenance.json");
    const raw = await fs.readFile(p, "utf-8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as ProvenanceRow[]) : null;
  } catch {
    return null;
  }
}
