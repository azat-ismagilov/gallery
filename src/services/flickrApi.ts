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
  FlickrPhotoSizesResponse,
  FlickrSearchResponse,
  Photo,
} from "@/types/gallery";
import { LruCache } from "@/utils/lruCache";

const EXTRAS =
  "tags,machine_tags,url_m,url_c,url_l,url_o,description,date_upload,date_taken";

const searchCache = new LruCache<string, FlickrSearchResponse>(100);
const photoInfoCache = new LruCache<string, FlickrPhotoInfoResponse>(200);
const photoByIdCache = new LruCache<string, Photo>(50);
const inFlightPhotoInfo = new Map<
  string,
  Promise<FlickrPhotoInfoResponse | null>
>();

export interface FetchConfig {
  signal?: AbortSignal;
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
    extras: EXTRAS,
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

function buildPhotoMethodUrl(method: string, id: string): string {
  return buildQuery({
    method,
    api_key,
    user_id,
    format: "json",
    nojsoncallback: "1",
    photo_id: id,
  });
}

async function fetchJson<T>(
  url: string,
  config: FetchConfig = {},
): Promise<T | null> {
  try {
    const response = await fetch(url, { signal: config.signal });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      return null;
    }
    console.error(e);
    return null;
  }
}

async function fetchSearchCached(
  url: string,
  config: FetchConfig = {},
): Promise<FlickrSearchResponse | null> {
  const cached = searchCache.get(url);
  if (cached) {
    return cached;
  }
  const result = await fetchJson<FlickrSearchResponse>(url, config);
  if (result && result.stat === "ok") {
    searchCache.set(url, result);
  }
  return result;
}

export function getAllWithEvent(
  year: string,
  event = "Photo%20Tour",
  page = 1,
  config: FetchConfig = {},
): Promise<FlickrSearchResponse | null> {
  return fetchSearchCached(
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
): Promise<FlickrSearchResponse | null> {
  return fetchSearchCached(
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
): Promise<FlickrSearchResponse | null> {
  return fetchSearchCached(
    buildSearchUrl([[TAG_ALBUM, year]], page, person),
    config,
  );
}

export function getAllWithText(
  text: string,
  page = 1,
  config: FetchConfig = {},
): Promise<FlickrSearchResponse | null> {
  return fetchSearchCached(
    buildSearchUrl([], page, `${text}%20and%20${TAG_ALBUM}$`),
    config,
  );
}

export function getCachedPhotoInfo(id: string): FlickrPhotoInfoResponse | null {
  return photoInfoCache.get(id) ?? null;
}

export async function getPhotoInfo(
  id: string,
  config: FetchConfig = {},
): Promise<FlickrPhotoInfoResponse | null> {
  const cached = photoInfoCache.get(id);
  if (cached) {
    return cached;
  }

  // Deduplicate concurrent requests (e.g. prefetch + active view) for the same photo ID.
  const existing = inFlightPhotoInfo.get(id);
  if (existing) {
    return existing;
  }

  const request = fetchJson<FlickrPhotoInfoResponse>(
    buildPhotoMethodUrl("flickr.photos.getInfo", id),
    config,
  )
    .then((result) => {
      if (result && result.stat === "ok") {
        photoInfoCache.set(id, result);
      }
      return result;
    })
    .finally(() => {
      inFlightPhotoInfo.delete(id);
    });

  inFlightPhotoInfo.set(id, request);
  return request;
}

export function prefetchPhotoInfo(id: string): void {
  if (photoInfoCache.has(id) || inFlightPhotoInfo.has(id)) {
    return;
  }
  void getPhotoInfo(id);
}

export async function getPhotoById(
  id: string,
  config: FetchConfig = {},
): Promise<Photo | null> {
  const cached = photoByIdCache.get(id);
  if (cached) {
    return cached;
  }

  const response = await fetchJson<FlickrPhotoSizesResponse>(
    buildPhotoMethodUrl("flickr.photos.getSizes", id),
    config,
  );
  const sizes = response?.sizes?.size;
  if (!sizes || sizes.length === 0) {
    return null;
  }

  const original = sizes.find((s) => s.label === "Original") ?? sizes.at(-1);
  const large =
    sizes.find((s) => s.label === "Large") ??
    sizes.find((s) => s.label === "Large 1600") ??
    original;
  const medium =
    sizes.find((s) => s.label === "Medium") ??
    sizes.find((s) => s.label === "Medium 800") ??
    large ??
    original;

  if (!original || !large || !medium) {
    return null;
  }

  const photo: Photo = {
    id,
    url_preview: medium.source,
    url: large.source,
    origin: original.source,
    width: Number(large.width) || Number(original.width) || 0,
    height: Number(large.height) || Number(original.height) || 0,
    year: "Unknown",
  };
  photoByIdCache.set(id, photo);
  return photo;
}
