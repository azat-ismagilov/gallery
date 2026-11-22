import {
  api_key,
  PER_PAGE,
  TAG_ALBUM,
  TAG_EVENT,
  TAG_TEAM,
  user_id,
} from "@/config/gallery";
import type {
  FlickrPhotoInfoResponse,
  FlickrSearchResponse,
} from "@/types/gallery";

const extras =
  "tags,machine_tags,url_m,url_c,url_l,url_o,description,date_upload,date_taken";

export interface FetchConfig {
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  data: T;
}

function buildQuery(params: Record<string, string | number>): string {
  const queryString = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return `https://api.flickr.com/services/rest?${queryString}`;
}

function buildSearchUrl(
  tags: ReadonlyArray<readonly [string, string]> = [],
  page = 1,
  text = "",
): string {
  const params: Record<string, string | number> = {
    method: "flickr.photos.search",
    api_key,
    user_id,
    tag_mode: "all",
    page,
    sort: "date-taken-desc",
    per_page: PER_PAGE,
    extras,
    format: "json",
    nojsoncallback: "1",
  };
  if (tags.length > 0) {
    params.tags = tags
      .map(([first, second]) => {
        const sanitized = second.replace(/[,:]/g, "");
        return `${first}$${sanitized}`;
      })
      .join(",");
  }
  if (text) {
    params.text = text;
  }
  return buildQuery(params);
}

function buildPhotoInfoUrl(id: string): string {
  const params: Record<string, string> = {
    method: "flickr.photos.getInfo",
    api_key,
    user_id,
    format: "json",
    nojsoncallback: "1",
    photo_id: id,
  };
  return buildQuery(params);
}

async function fetchData<T>(
  url: string,
  config: FetchConfig = {},
): Promise<ApiResponse<T> | undefined> {
  try {
    const response = await fetch(url, { signal: config.signal });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = (await response.json()) as T;
    return { data };
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      return undefined;
    }
    console.error(e);
    return undefined;
  }
}

export function getAllWithEvent(
  year: string,
  event = "Photo%20Tour",
  page = 1,
  config: FetchConfig = {},
): Promise<ApiResponse<FlickrSearchResponse> | undefined> {
  return fetchData<FlickrSearchResponse>(
    buildSearchUrl(
      [
        [TAG_ALBUM, year],
        [TAG_EVENT, event],
      ],
      page,
    ),
    config,
  );
}

export function getAllWithTeam(
  year: string,
  team: string,
  page = 1,
  config: FetchConfig = {},
): Promise<ApiResponse<FlickrSearchResponse> | undefined> {
  return fetchData<FlickrSearchResponse>(
    buildSearchUrl(
      [
        [TAG_ALBUM, year],
        [TAG_TEAM, team],
      ],
      page,
    ),
    config,
  );
}

export function getAllWithPerson(
  year: string,
  person: string,
  page = 1,
  config: FetchConfig = {},
): Promise<ApiResponse<FlickrSearchResponse> | undefined> {
  return fetchData<FlickrSearchResponse>(
    buildSearchUrl([[TAG_ALBUM, year]], page, person),
    config,
  );
}

export function getAllWithText(
  text: string,
  page = 1,
  config: FetchConfig = {},
): Promise<ApiResponse<FlickrSearchResponse> | undefined> {
  return fetchData<FlickrSearchResponse>(
    buildSearchUrl([], page, `${text}%20and%20${TAG_ALBUM}$`),
    config,
  );
}

export function getPhotoInfo(
  id: string,
  config: FetchConfig = {},
): Promise<ApiResponse<FlickrPhotoInfoResponse> | undefined> {
  return fetchData<FlickrPhotoInfoResponse>(buildPhotoInfoUrl(id), config);
}
