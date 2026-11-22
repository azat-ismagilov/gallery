import {
  TAG_ALBUM,
  TAG_EVENT,
  TAG_PERSON,
  TAG_PHOTOGRAPHER,
  TAG_TEAM,
} from "@/config/gallery";
import type { PhotoInfo } from "@/types/gallery";
import {
  buildFlickrSetTagsPayload,
  extractPreservedTags,
  parsePhotoTags,
  serializePhotoTags,
  type TagPrefixes,
} from "@/utils/photoTagParser";

export function getGalleryTagPrefixes(): TagPrefixes {
  return {
    event: TAG_EVENT,
    team: TAG_TEAM,
    album: TAG_ALBUM,
    person: TAG_PERSON,
    photographer: TAG_PHOTOGRAPHER,
  };
}

export function ParsePhotoInfo(
  tags: readonly (string | null)[] | null | undefined,
  description: string | undefined,
): PhotoInfo {
  return parsePhotoTags(tags, description, getGalleryTagPrefixes());
}

export function ExtractPreservedTags(
  tags: readonly (string | null)[] | null | undefined,
): string[] {
  return extractPreservedTags(tags, getGalleryTagPrefixes());
}

export function SerializePhotoInfo(photoInfo: PhotoInfo | null): string[] {
  return serializePhotoTags(photoInfo, getGalleryTagPrefixes());
}

export function BuildFlickrSetTagsPayload(
  photoInfo: PhotoInfo,
  preservedTags: readonly string[],
): string {
  return buildFlickrSetTagsPayload(
    photoInfo,
    preservedTags,
    getGalleryTagPrefixes(),
  );
}
