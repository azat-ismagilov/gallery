import {
  api_key,
  PER_PAGE,
  TAG_ALBUM,
  TAG_EVENT,
  TAG_TEAM,
  user_id,
} from "@/config/gallery";
import { signFlickrOAuthParams } from "@/services/flickr/oauth";
import {
  buildFlickrPhotoMethodUrl,
  buildFlickrSearchUrl,
  selectFlickrPhotoFromSizes,
} from "@/services/flickr/urls";
import { LruCache } from "@/shared/utils/lruCache";
import type {
  FlickrAuthCredentials,
  FlickrPhotoInfoResponse,
  FlickrPhotoSizesResponse,
  FlickrSearchResponse,
  Photo,
} from "@/types/gallery";

const FLICKR_REST_ENDPOINT = "https://api.flickr.com/services/rest";

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

export function invalidatePhotoInfoCache(id: string): void {
  photoInfoCache.delete(id);
}

interface FlickrWriteBaseResponse {
  stat: "ok" | "fail";
  message?: string;
  code?: number;
  user?: {
    id: string;
    username?: {
      _content?: string;
    };
  };
}

async function postSignedFlickrMethod(
  method: string,
  extraParams: Record<string, string>,
  credentials: FlickrAuthCredentials,
): Promise<FlickrWriteBaseResponse> {
  const signedParams = await signFlickrOAuthParams(
    "POST",
    FLICKR_REST_ENDPOINT,
    {
      method,
      format: "json",
      nojsoncallback: "1",
      ...extraParams,
    },
    credentials,
  );

  const body = new URLSearchParams(signedParams);
  const response = await fetch(FLICKR_REST_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Flickr API returned HTTP ${response.status}`);
  }

  return (await response.json()) as FlickrWriteBaseResponse;
}

export async function testFlickrLogin(
  credentials: FlickrAuthCredentials,
): Promise<{ ok: true; username: string } | { ok: false; error: string }> {
  try {
    const result = await postSignedFlickrMethod(
      "flickr.test.login",
      {},
      credentials,
    );
    if (result.stat === "ok") {
      return {
        ok: true,
        username:
          result.user?.username?._content ?? result.user?.id ?? "Flickr user",
      };
    }
    return {
      ok: false,
      error: result.message ?? "Flickr rejected the provided credentials.",
    };
  } catch (e: unknown) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to reach Flickr API.",
    };
  }
}

export async function updatePhotoTags(
  photoId: string,
  tagsPayload: string,
  credentials: FlickrAuthCredentials,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const result = await postSignedFlickrMethod(
      "flickr.photos.setTags",
      {
        photo_id: photoId,
        tags: tagsPayload,
      },
      credentials,
    );
    if (result.stat === "ok") {
      invalidatePhotoInfoCache(photoId);
      return { ok: true };
    }
    return {
      ok: false,
      error: result.message ?? "Flickr rejected the tag update.",
    };
  } catch (e: unknown) {
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : "Failed to update tags on Flickr.",
    };
  }
}
