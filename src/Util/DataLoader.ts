import { getRawEventData, getRawPeopleData, getRawTeamData } from "../consts";
import UniqueList from "./UniqueList";

function parseLines(raw: string): string[] {
  return UniqueList(
    raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== ""),
  );
}

async function getEventData(year: string | null): Promise<string[]> {
  if (!year) {
    return [];
  }
  return parseLines(await getRawEventData(year));
}

async function getTeamData(year: string | null): Promise<string[]> {
  if (!year) {
    return [];
  }
  return parseLines(await getRawTeamData(year));
}

async function getPeopleData(year: string | null): Promise<string[]> {
  if (!year) {
    return [];
  }
  return parseLines(await getRawPeopleData(year));
}

export { getEventData, getPeopleData, getTeamData };
