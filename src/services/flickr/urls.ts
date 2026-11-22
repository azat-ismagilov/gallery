import type { FlickrPhotoSize, Photo } from "@/types/gallery";

const EXTRAS =
  "tags,machine_tags,url_m,url_c,url_l,url_o,description,date_upload,date_taken";

export interface FlickrApiCredentials {
  apiKey: string;
  userId: string;
  perPage: number;
}

function buildQuery(params: Record<string, string | number>): string {
  const queryString = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return `https://api.flickr.com/services/rest?${queryString}`;
}

export function buildFlickrSearchUrl(
  credentials: FlickrApiCredentials,
  tags: ReadonlyArray<readonly [string, string]> = [],
  page = 1,
  text = "",
): string {
  const params: Record<string, string | number> = {
    method: "flickr.photos.search",
    api_key: credentials.apiKey,
    user_id: credentials.userId,
    tag_mode: "all",
    page,
    sort: "date-taken-desc",
    per_page: credentials.perPage,
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

export function buildFlickrPhotoMethodUrl(
  credentials: Pick<FlickrApiCredentials, "apiKey" | "userId">,
  method: string,
  id: string,
): string {
  return buildQuery({
    method,
    api_key: credentials.apiKey,
    user_id: credentials.userId,
    format: "json",
    nojsoncallback: "1",
    photo_id: id,
  });
}

export function selectFlickrPhotoFromSizes(
  id: string,
  sizes: readonly FlickrPhotoSize[] | undefined,
): Photo | null {
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

  return {
    id,
    url_preview: medium.source,
    url: large.source,
    origin: original.source,
    width: Number(large.width) || Number(original.width) || 0,
    height: Number(large.height) || Number(original.height) || 0,
    year: "Unknown",
  };
}
