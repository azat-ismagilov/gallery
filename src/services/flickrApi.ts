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
import {
  buildFlickrPhotoMethodUrl,
  buildFlickrSearchUrl,
  selectFlickrPhotoFromSizes,
} from "@/utils/flickrUrl";
import { LruCache } from "@/utils/lruCache";

const credentials = {
  apiKey: api_key,
  userId: user_id,
  perPage: PER_PAGE,
};

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
    buildFlickrSearchUrl(
      credentials,
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
    buildFlickrSearchUrl(
      credentials,
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
    buildFlickrSearchUrl(credentials, [[TAG_ALBUM, year]], page, person),
    config,
  );
}

export function getAllWithText(
  text: string,
  page = 1,
  config: FetchConfig = {},
): Promise<FlickrSearchResponse | null> {
  return fetchSearchCached(
    buildFlickrSearchUrl(
      credentials,
      [],
      page,
      `${text}%20and%20${TAG_ALBUM}$`,
    ),
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

  const existing = inFlightPhotoInfo.get(id);
  if (existing) {
    return existing;
  }

  const request = fetchJson<FlickrPhotoInfoResponse>(
    buildFlickrPhotoMethodUrl(credentials, "flickr.photos.getInfo", id),
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
    buildFlickrPhotoMethodUrl(credentials, "flickr.photos.getSizes", id),
    config,
  );
  const photo = selectFlickrPhotoFromSizes(id, response?.sizes?.size);
  if (photo) {
    photoByIdCache.set(id, photo);
  }
  return photo;
}
