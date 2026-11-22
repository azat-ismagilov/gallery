import {
  parsePhotoTags,
  serializeFacePosition,
  serializeRawPhotoTags,
  type TagPrefixes,
} from "@/features/viewer/utils/photoTagParser";
import type { FaceDiffStatus, PersonTag, PhotoInfo } from "@/types/gallery";

export interface ListDiff<T> {
  added: T[];
  removed: T[];
  unchanged: T[];
}

export interface PhotoInfoDiff {
  photographer: ListDiff<string>;
  album: ListDiff<string>;
  event: ListDiff<string>;
  team: ListDiff<string>;
  person: ListDiff<PersonTag>;
  hasChanges: boolean;
}

export interface DiffFaceEntry {
  person: PersonTag;
  status: FaceDiffStatus;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(encoded: string): Uint8Array {
  const padded = encoded
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(encoded.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encodes proposed PhotoInfo into a compact, Unicode-safe Base64URL string
 * suitable for `?suggest=<payload>` preview links.
 */
export function encodeSuggestionPayload(
  photoInfo: PhotoInfo,
  prefixes: TagPrefixes,
): string {
  const rawTags = serializeRawPhotoTags(photoInfo, prefixes);
  const json = JSON.stringify(rawTags);
  const bytes = new TextEncoder().encode(json);
  return toBase64Url(bytes);
}

/**
 * Decodes a `?suggest=<payload>` parameter back into a `PhotoInfo` object.
 * Returns `null` if the payload is malformed or corrupted.
 */
export function decodeSuggestionPayload(
  encoded: string | null | undefined,
  prefixes: TagPrefixes,
): PhotoInfo | null {
  if (!encoded) {
    return null;
  }
  try {
    const bytes = fromBase64Url(encoded);
    const json = new TextDecoder().decode(bytes);
    const parsed: unknown = JSON.parse(json);
    if (
      !Array.isArray(parsed) ||
      !parsed.every((item): item is string => typeof item === "string")
    ) {
      return null;
    }
    return parsePhotoTags(parsed, undefined, prefixes);
  } catch {
    return null;
  }
}

export function getPersonTagKey(person: PersonTag): string {
  if (!person.position) {
    return `${person.name}|none`;
  }
  return `${person.name}|${serializeFacePosition(person.position)}`;
}

function diffStringList(
  original: readonly string[],
  proposed: readonly string[],
): ListDiff<string> {
  const originalSet = new Set(original);
  const proposedSet = new Set(proposed);

  return {
    added: proposed.filter((item) => !originalSet.has(item)),
    removed: original.filter((item) => !proposedSet.has(item)),
    unchanged: proposed.filter((item) => originalSet.has(item)),
  };
}

function diffPersonList(
  original: readonly PersonTag[],
  proposed: readonly PersonTag[],
): ListDiff<PersonTag> {
  const originalKeys = new Set(original.map(getPersonTagKey));
  const proposedKeys = new Set(proposed.map(getPersonTagKey));

  return {
    added: proposed.filter((p) => !originalKeys.has(getPersonTagKey(p))),
    removed: original.filter((p) => !proposedKeys.has(getPersonTagKey(p))),
    unchanged: proposed.filter((p) => originalKeys.has(getPersonTagKey(p))),
  };
}

export function computePhotoInfoDiff(
  original: PhotoInfo,
  proposed: PhotoInfo,
): PhotoInfoDiff {
  const photographer = diffStringList(
    original.photographer,
    proposed.photographer,
  );
  const album = diffStringList(original.album, proposed.album);
  const event = diffStringList(original.event, proposed.event);
  const team = diffStringList(original.team, proposed.team);
  const person = diffPersonList(original.person, proposed.person);

  const hasChanges =
    photographer.added.length > 0 ||
    photographer.removed.length > 0 ||
    album.added.length > 0 ||
    album.removed.length > 0 ||
    event.added.length > 0 ||
    event.removed.length > 0 ||
    team.added.length > 0 ||
    team.removed.length > 0 ||
    person.added.length > 0 ||
    person.removed.length > 0;

  return {
    photographer,
    album,
    event,
    team,
    person,
    hasChanges,
  };
}

export function getDiffFaceEntries(diff: PhotoInfoDiff): DiffFaceEntry[] {
  return [
    ...diff.person.unchanged.map((person) => ({
      person,
      status: "unchanged" as const,
    })),
    ...diff.person.added.map((person) => ({
      person,
      status: "added" as const,
    })),
    ...diff.person.removed.map((person) => ({
      person,
      status: "removed" as const,
    })),
  ];
}
