import {
  TAG_ALBUM,
  TAG_EVENT,
  TAG_PERSON,
  TAG_PHOTOGRAPHER,
  TAG_TEAM,
} from "@/config/gallery";
import type { FacePosition, PersonTag, PhotoInfo } from "@/types/gallery";
import UniqueList from "@/utils/uniqueList";

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
  const name = personTag.slice(0, openBracket);
  const closingBracket = personTag.indexOf(")", openBracket);
  if (closingBracket === -1) {
    return null;
  }
  const encodedPosition = personTag.slice(openBracket + 1, closingBracket);
  if (name === "" || encodedPosition.length < 16) {
    return null;
  }
  return {
    name,
    position: getPosition(encodedPosition),
  };
}

function serializePerson(person: PersonTag): string {
  if (!person.position) {
    return `${TAG_PERSON}$${person.name}`;
  }
  return `${person.name}(${serializePosition(person.position)})`;
}

function ParsePhotoInfo(
  tags: readonly (string | null)[] | null | undefined,
  description: string | undefined,
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
    if (tag.startsWith(`${TAG_EVENT}$`)) {
      photoInfo.event.push(tag.replaceAll(`${TAG_EVENT}$`, ""));
      continue;
    }
    if (tag.startsWith(`${TAG_TEAM}$`)) {
      photoInfo.team.push(tag.replaceAll(`${TAG_TEAM}$`, ""));
      continue;
    }
    if (tag.startsWith(`${TAG_PERSON}$`)) {
      photoInfo.person.push({
        name: tag.replaceAll(`${TAG_PERSON}$`, ""),
      });
      continue;
    }
    if (tag.startsWith(`${TAG_ALBUM}$`)) {
      photoInfo.album.push(tag.replaceAll(`${TAG_ALBUM}$`, ""));
      continue;
    }
    if (tag.startsWith(`${TAG_PHOTOGRAPHER}$`)) {
      photoInfo.photographer.push(tag.replaceAll(`${TAG_PHOTOGRAPHER}$`, ""));
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

function SerializePhotoInfo(photoInfo: PhotoInfo | null): string[] {
  if (!photoInfo) {
    return [];
  }
  const tags: string[] = [];
  for (const event of photoInfo.event) {
    tags.push(`${TAG_EVENT}$${event}`);
  }
  for (const team of photoInfo.team) {
    tags.push(`${TAG_TEAM}$${team}`);
  }
  for (const album of photoInfo.album) {
    tags.push(`${TAG_ALBUM}$${album}`);
  }
  for (const photographer of photoInfo.photographer) {
    tags.push(`${TAG_PHOTOGRAPHER}$${photographer}`);
  }
  for (const person of photoInfo.person) {
    tags.push(serializePerson(person));
  }
  return tags.map((tag) => `"${tag.trim()}"`);
}

export { ParsePhotoInfo, SerializePhotoInfo };
