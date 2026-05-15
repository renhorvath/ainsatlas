import conferencesJson from "../conferences.json";

export type Conference = {
  id: string;
  name: string;
  year: string;
  url: string;
  city?: string;
  country?: string;
};

export const CONFERENCES: readonly Conference[] = conferencesJson as Conference[];
