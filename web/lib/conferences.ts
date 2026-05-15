import conferencesJson from "../conferences.json";

export type Conference = {
  id: string;
  name: string;
  year: string;
  url: string;
  city?: string;
  country?: string;
};

/** Loaded from `web/conferences.json` — edit that file to add conferences. */
export const CONFERENCES: readonly Conference[] = conferencesJson as Conference[];
