import type {
  GalleryPhotoItem,
  GallerySection,
  Photo,
  Place,
} from "@/types/gallery";

export interface RawPhotoGroup {
  event: string | null;
  photos: Photo[];
}

export function extractAlbumYearFromTags(
  tags: string,
  albumTagPrefix: string,
  places: readonly Place[],
): string {
  const normalizedPrefix = albumTagPrefix.toLowerCase();
  const matchedTag = tags
    .split(" ")
    .find((item) => item.startsWith(normalizedPrefix));
  if (matchedTag === undefined) {
    return "Unknown";
  }

  const targetTag = matchedTag.replaceAll(normalizedPrefix, "");
  const found = places.find(
    ({ year }) => year.toLowerCase().replace(/[-_\s]/g, "") === targetTag,
  );
  return found?.year ?? "Unknown";
}

function compareYears(
  yearA: string,
  yearB: string,
  places: readonly Place[],
): number {
  const indexA = places.findIndex(({ year }) => year === yearA);
  const indexB = places.findIndex(({ year }) => year === yearB);

  const normalizedA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
  const normalizedB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;

  if (normalizedA !== normalizedB) {
    return normalizedA - normalizedB;
  }
  return yearB.localeCompare(yearA);
}

/**
 * Builds canonical display sections and flattened indexed items so that
 * grid rendering, index-based navigation, and slideshow always share the
 * exact same order — even when identical photo IDs appear across multiple sections.
 */
export function buildGallerySections(
  groups: readonly RawPhotoGroup[],
  places: readonly Place[],
): { sections: GallerySection[]; items: GalleryPhotoItem[] } {
  const sections: GallerySection[] = [];
  const items: GalleryPhotoItem[] = [];

  for (const group of groups) {
    if (group.photos.length === 0) {
      continue;
    }

    // Group by year when photos span multiple years (e.g. global text search)
    const byYear = new Map<string, Photo[]>();
    for (const photo of group.photos) {
      const list = byYear.get(photo.year) ?? [];
      list.push(photo);
      byYear.set(photo.year, list);
    }

    if (group.event === null && byYear.size >= 2) {
      const sortedYears = Array.from(byYear.keys()).sort((a, b) =>
        compareYears(a, b, places),
      );
      for (const year of sortedYears) {
        const yearPhotos = byYear.get(year) ?? [];
        const sectionKey = `year:${year}`;
        const sectionItems = yearPhotos.map((photo) => {
          const item: GalleryPhotoItem = {
            entryKey: `${sectionKey}:${photo.id}`,
            flatIndex: items.length,
            sectionKey,
            photo,
          };
          items.push(item);
          return item;
        });
        sections.push({
          key: sectionKey,
          title: year,
          items: sectionItems,
        });
      }
      continue;
    }

    const sectionKey = group.event ? `event:${group.event}` : "all";
    const sectionItems = group.photos.map((photo) => {
      const item: GalleryPhotoItem = {
        entryKey: `${sectionKey}:${photo.id}`,
        flatIndex: items.length,
        sectionKey,
        photo,
      };
      items.push(item);
      return item;
    });

    sections.push({
      key: sectionKey,
      title: group.event,
      items: sectionItems,
    });
  }

  return { sections, items };
}

export function getNextEventName(
  events: readonly string[],
  currentEvent: string | null,
): string | null {
  if (currentEvent === null || events.length === 0) {
    return null;
  }
  const index = events.indexOf(currentEvent);
  if (index === -1) {
    return events[0] ?? null;
  }
  return events[index + 1] ?? null;
}

export function getNextPhotoIndex(
  currentIndex: number,
  totalCount: number,
  options: { wrap?: boolean } = {},
): number | null {
  if (totalCount <= 0) {
    return null;
  }
  const next = currentIndex + 1;
  if (next < totalCount) {
    return next;
  }
  return options.wrap ? 0 : null;
}

export function getPrevPhotoIndex(currentIndex: number): number | null {
  if (currentIndex <= 0) {
    return null;
  }
  return currentIndex - 1;
}
