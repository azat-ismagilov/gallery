import type { FacePosition, PersonTag, PhotoInfo } from "@/types/gallery";
import UniqueList from "@/utils/uniqueList";

export interface TagPrefixes {
  event: string;
  team: string;
  album: string;
  person: string;
  photographer: string;
}

const MAX_INT = 65535;

const convertNum = (text: string): number => Number.parseInt(`0x${text}`, 16);
const convertRel = (text: string): number => convertNum(text) / MAX_INT;

function getPosition(encodedPosition: string): FacePosition {
  return {
    left: convertRel(encodedPosition.slice(0, 4)),
    top: convertRel(encodedPosition.slice(4, 8)),
    right: convertRel(encodedPosition.slice(8, 12)),
    bottom: convertRel(encodedPosition.slice(12, 16)),
  };
}

function serializePosition(position: FacePosition): string {
  return (
    Math.round(position.left * MAX_INT)
      .toString(16)
      .padStart(4, "0") +
    Math.round(position.top * MAX_INT)
      .toString(16)
      .padStart(4, "0") +
    Math.round(position.right * MAX_INT)
      .toString(16)
      .padStart(4, "0") +
    Math.round(position.bottom * MAX_INT)
      .toString(16)
      .padStart(4, "0")
  );
}

function parsePerson(personTag: string): PersonTag | null {
  const openBracket = personTag.indexOf("(");
  if (openBracket === -1) {
    return null;
  }
  const name = personTag.slice(0, openBracket).trim();
  const closingBracket = personTag.indexOf(")", openBracket);
  if (closingBracket === -1) {
    return null;
  }
  const encodedPosition = personTag.slice(openBracket + 1, closingBracket);
  if (name === "" || !/^[0-9a-fA-F]{16}$/.test(encodedPosition)) {
    return null;
  }
  return {
    name,
    position: getPosition(encodedPosition),
  };
}

function serializePerson(person: PersonTag, personPrefix: string): string {
  if (!person.position) {
    return `${personPrefix}$${person.name}`;
  }
  return `${person.name}(${serializePosition(person.position)})`;
}

export function parsePhotoTags(
  tags: readonly (string | null)[] | null | undefined,
  description: string | undefined,
  prefixes: TagPrefixes,
): PhotoInfo {
  const photoInfo: PhotoInfo = {
    event: [],
    team: [],
    person: [],
    album: [],
    photographer: [],
  };

  if (description) {
    const cleaned = description.replaceAll("Photographer: ", "").trim();
    if (cleaned !== "") {
      photoInfo.photographer.push(cleaned);
    }
  }

  if (tags === null || tags === undefined) {
    return photoInfo;
  }

  for (const tag of tags) {
    if (tag === null) {
      continue;
    }
    if (tag.startsWith(`${prefixes.event}$`)) {
      photoInfo.event.push(tag.slice(prefixes.event.length + 1));
      continue;
    }
    if (tag.startsWith(`${prefixes.team}$`)) {
      photoInfo.team.push(tag.slice(prefixes.team.length + 1));
      continue;
    }
    if (tag.startsWith(`${prefixes.person}$`)) {
      photoInfo.person.push({
        name: tag.slice(prefixes.person.length + 1),
      });
      continue;
    }
    if (tag.startsWith(`${prefixes.album}$`)) {
      photoInfo.album.push(tag.slice(prefixes.album.length + 1));
      continue;
    }
    if (tag.startsWith(`${prefixes.photographer}$`)) {
      photoInfo.photographer.push(tag.slice(prefixes.photographer.length + 1));
      continue;
    }
    const parsedPerson = parsePerson(tag);
    if (parsedPerson !== null) {
      photoInfo.person.push(parsedPerson);
    }
  }

  photoInfo.event = UniqueList(photoInfo.event);
  photoInfo.team = UniqueList(photoInfo.team);
  photoInfo.album = UniqueList(photoInfo.album);
  photoInfo.photographer = UniqueList(photoInfo.photographer);

  return photoInfo;
}

export function serializePhotoTags(
  photoInfo: PhotoInfo | null,
  prefixes: TagPrefixes,
): string[] {
  if (!photoInfo) {
    return [];
  }
  const tags: string[] = [];
  for (const event of photoInfo.event) {
    tags.push(`${prefixes.event}$${event}`);
  }
  for (const team of photoInfo.team) {
    tags.push(`${prefixes.team}$${team}`);
  }
  for (const album of photoInfo.album) {
    tags.push(`${prefixes.album}$${album}`);
  }
  for (const photographer of photoInfo.photographer) {
    tags.push(`${prefixes.photographer}$${photographer}`);
  }
  for (const person of photoInfo.person) {
    tags.push(serializePerson(person, prefixes.person));
  }
  return tags.map((tag) => `"${tag.trim()}"`);
}
