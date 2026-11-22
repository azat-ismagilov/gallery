import {
  TAG_ALBUM,
  TAG_EVENT,
  TAG_PERSON,
  TAG_PHOTOGRAPHER,
  TAG_TEAM,
} from "@/config/gallery";
import type { PhotoInfo } from "@/types/gallery";
import {
  parsePhotoTags,
  serializePhotoTags,
  type TagPrefixes,
} from "@/utils/photoTagParser";

function getDefaultPrefixes(): TagPrefixes {
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
  return parsePhotoTags(tags, description, getDefaultPrefixes());
}

export function SerializePhotoInfo(photoInfo: PhotoInfo | null): string[] {
  return serializePhotoTags(photoInfo, getDefaultPrefixes());
}
