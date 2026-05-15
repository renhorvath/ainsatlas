import type { Conference } from "../conferences";
import type { RawRecord } from "../atlas-bundle";

export async function scrapeConference(
  conf: Conference,
  apiKey: string,
): Promise<RawRecord> {
  const base: RawRecord = {
    conference: conf.name,
    year: conf.year,
    url: conf.url,
    scraped_at: new Date().toISOString(),
    raw_content: null,
    error: null,
  };

  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: conf.url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });
    const body = (await res.json()) as {
      success?: boolean;
      data?: { markdown?: string };
      error?: string;
    };
    if (!res.ok || !body.success) {
      base.error = body.error ?? `Firecrawl HTTP ${res.status}`;
      return base;
    }
    base.raw_content = body.data?.markdown ?? "";
    return base;
  } catch (e) {
    base.error = e instanceof Error ? e.message : String(e);
    return base;
  }
}
