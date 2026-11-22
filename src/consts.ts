import * as consts from "@data/consts.js";
import type { Place } from "./types";

const eventFiles = import.meta.glob<string>("@data/*.event", {
  query: "?raw",
  import: "default",
});
const teamFiles = import.meta.glob<string>("@data/*.team", {
  query: "?raw",
  import: "default",
});
const peopleFiles = import.meta.glob<string>("@data/*.people", {
  query: "?raw",
  import: "default",
});

async function loadRawData(
  files: Record<string, () => Promise<string>>,
  year: string,
  extension: string,
): Promise<string> {
  const suffix = `/${year}.${extension}`;
  const entry = Object.entries(files).find(([key]) => key.endsWith(suffix));
  if (!entry) {
    return "";
  }
  return entry[1]();
}

export const getRawEventData = (year: string): Promise<string> =>
  loadRawData(eventFiles, year, "event");
export const getRawTeamData = (year: string): Promise<string> =>
  loadRawData(teamFiles, year, "team");
export const getRawPeopleData = (year: string): Promise<string> =>
  loadRawData(peopleFiles, year, "people");

export const places: Place[] = consts.places.map(
  ([year, place, contestName]) => ({
    year,
    place,
    contestName,
  }),
);
export const api_key: string = consts.api_key;
export const user_id: string = consts.user_id;
export const title: string = consts.title;
export const description: string = consts.description;
export const TAG_EVENT: string = consts.TAG_EVENT;
export const TAG_TEAM: string = consts.TAG_TEAM;
export const TAG_ALBUM: string = consts.TAG_ALBUM;
export const TAG_PERSON: string = consts.TAG_PERSON;
export const TAG_PHOTOGRAPHER: string = consts.TAG_PHOTOGRAPHER;
export const SVG_WIDTH: number = consts.SVG_WIDTH;
export const SVG_HEIGHT: number = consts.SVG_HEIGHT;
export const PER_PAGE: number = consts.PER_PAGE;
export const LAST_YEAR: string = consts.LAST_YEAR;
export const DEFAULT_EVENT: string = consts.DEFAULT_EVENT;
export const FLICKR_IMAGE_PREFIX: string = consts.FLICKR_IMAGE_PREFIX;
export const SUGGESTIONS_EMAIL: string = consts.SUGGESTIONS_EMAIL;
export const DEBUG: boolean = import.meta.env.DEV;
