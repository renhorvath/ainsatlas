import { loadBundle } from "./atlas-bundle";

export type Conference = {
  id: string;
  name: string;
  year: string;
  url: string;
  city?: string;
  country?: string;
};

export async function getConferences(): Promise<readonly Conference[]> {
  const bundle = await loadBundle();
  return bundle.conferences;
}
