import type { AppQueryState } from "@/types/gallery";

export function parseSearchParams(
  searchParams: URLSearchParams,
  defaultEvent: string,
): Partial<AppQueryState> {
  const parsed: Partial<AppQueryState> = {};

  const photoParam = searchParams.get("photo");
  if (photoParam !== null) {
    parsed.fullscreenPhotoId = photoParam;
  }

  const slideshowParam = searchParams.get("slideshow");
  if (slideshowParam !== null) {
    parsed.slideShow = slideshowParam === "true";
  }

  const queryParam = searchParams.get("query");
  if (queryParam !== null) {
    parsed.text = decodeURIComponent(queryParam);
    parsed.year = null;
  } else {
    const albumParam = searchParams.get("album");
    if (albumParam !== null) {
      parsed.year = decodeURIComponent(albumParam);
    }

    const eventParam = searchParams.get("event");
    const teamParam = searchParams.get("team");
    const personParam = searchParams.get("person");

    if (eventParam !== null) {
      parsed.event = decodeURIComponent(eventParam);
    } else if (teamParam !== null) {
      parsed.team = decodeURIComponent(teamParam);
    } else if (personParam !== null) {
      parsed.person = decodeURIComponent(personParam);
    } else {
      parsed.event = defaultEvent;
    }
  }

  return parsed;
}

export function serializeSearchParams({
  year,
  event,
  text,
  person,
  team,
  fullscreenPhotoId,
  slideShow,
}: AppQueryState): Record<string, string> {
  const params: Record<string, string> = {};
  if (year !== null) {
    params.album = year;
  }
  if (event !== null) {
    params.event = event;
  }
  if (person !== null) {
    params.person = person;
  }
  if (team !== null) {
    params.team = team;
  }
  if (text !== null) {
    params.query = text;
  }
  if (fullscreenPhotoId !== null) {
    params.photo = fullscreenPhotoId;
  }
  if (slideShow) {
    params.slideshow = "true";
  }
  return params;
}
