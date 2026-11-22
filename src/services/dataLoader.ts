import {
  getRawEventData,
  getRawPeopleData,
  getRawTeamData,
} from "@/config/gallery";
import UniqueList from "@/utils/uniqueList";

const eventCache = new Map<string, Promise<string[]>>();
const teamCache = new Map<string, Promise<string[]>>();
const peopleCache = new Map<string, Promise<string[]>>();

function parseLines(raw: string): string[] {
  return UniqueList(
    raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== ""),
  );
}

function loadCached(
  cache: Map<string, Promise<string[]>>,
  year: string | null,
  loader: (y: string) => Promise<string>,
): Promise<string[]> {
  if (!year) {
    return Promise.resolve([]);
  }
  const existing = cache.get(year);
  if (existing) {
    return existing;
  }
  const promise = loader(year)
    .then(parseLines)
    .catch((err) => {
      cache.delete(year);
      throw err;
    });
  cache.set(year, promise);
  return promise;
}

export function getEventData(year: string | null): Promise<string[]> {
  return loadCached(eventCache, year, getRawEventData);
}

export function getTeamData(year: string | null): Promise<string[]> {
  return loadCached(teamCache, year, getRawTeamData);
}

export function getPeopleData(year: string | null): Promise<string[]> {
  return loadCached(peopleCache, year, getRawPeopleData);
}
