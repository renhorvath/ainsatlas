import "server-only";

const DEFAULT_REPO = "renhorvath/ainsatlas";

export function githubRepo(): string {
  return (process.env.GITHUB_REPO ?? DEFAULT_REPO).trim();
}

export function githubToken(): string | null {
  const t = process.env.GITHUB_TOKEN?.trim();
  return t || null;
}

export function isGithubPublishEnabled(): boolean {
  return Boolean(githubToken());
}

function repoParts(): { owner: string; repo: string } {
  const [owner, repo] = githubRepo().split("/");
  if (!owner || !repo) throw new Error(`Invalid GITHUB_REPO: ${githubRepo()}`);
  return { owner, repo };
}

async function ghFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = githubToken();
  if (!token) throw new Error("GITHUB_TOKEN is not configured.");
  const { owner, repo } = repoParts();
  const url = `https://api.github.com/repos/${owner}/${repo}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  return res;
}

export async function readRepoFile(filePath: string): Promise<{ text: string; sha: string }> {
  const res = await ghFetch(`/contents/${filePath}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub read ${filePath} failed (${res.status}): ${body}`);
  }
  const data = (await res.json()) as { content?: string; sha?: string; encoding?: string };
  if (!data.content || !data.sha) throw new Error(`GitHub read ${filePath}: missing content or sha`);
  const text = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
  return { text, sha: data.sha };
}

export async function writeRepoFile(
  filePath: string,
  text: string,
  message: string,
  sha?: string,
): Promise<void> {
  const body: Record<string, string> = {
    message,
    content: Buffer.from(text, "utf-8").toString("base64"),
  };
  if (sha) body.sha = sha;

  const res = await ghFetch(`/contents/${filePath}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub write ${filePath} failed (${res.status}): ${err}`);
  }
}

export async function triggerAtlasPipeline(ref = "main"): Promise<void> {
  const res = await ghFetch("/actions/workflows/atlas-pipeline.yml/dispatches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ref }),
  });
  if (res.status !== 204) {
    const err = await res.text();
    throw new Error(`GitHub workflow dispatch failed (${res.status}): ${err}`);
  }
}

export function conferencesJsonPath(): string {
  return "web/conferences.json";
}
