import { describe, expect, it } from "bun:test";

import type { Photo, Place } from "@/types/gallery";
import {
  buildGallerySections,
  extractAlbumYearFromTags,
  getNextEventName,
  getNextPhotoIndex,
  getPrevPhotoIndex,
} from "@/utils/gallerySections";

const PLACES: Place[] = [
  { year: "2024", place: "Astana", contestName: "World Finals" },
  { year: "2023", place: "Luxor", contestName: "World Finals" },
  { year: "2022", place: "Luxor", contestName: "World Finals" },
];

function makePhoto(id: string, year = "2024"): Photo {
  return {
    id,
    url_preview: `https://example.com/${id}_m.jpg`,
    url: `https://example.com/${id}_l.jpg`,
    origin: `https://example.com/${id}_o.jpg`,
    width: 1600,
    height: 1200,
    year,
  };
}

describe("gallerySections", () => {
  it("extracts album year from Flickr space-separated tags", () => {
    expect(
      extractAlbumYearFromTags(
        "eventopening albumwf2023 mit",
        "albumWF",
        PLACES,
      ),
    ).toBe("2023");
    expect(extractAlbumYearFromTags("misc tag", "albumWF", PLACES)).toBe(
      "Unknown",
    );
  });

  it("assigns distinct entryKeys and monotonic flatIndices when the same photo appears in multiple events", () => {
    const sharedPhoto = makePhoto("p-shared");
    const { sections, items } = buildGallerySections(
      [
        { event: "Photo Tour", photos: [makePhoto("p1"), sharedPhoto] },
        {
          event: "Opening Ceremony",
          photos: [sharedPhoto, makePhoto("p2")],
        },
      ],
      PLACES,
    );

    expect(sections).toHaveLength(2);
    expect(items).toHaveLength(4);
    expect(items.map((item) => item.photo.id)).toEqual([
      "p1",
      "p-shared",
      "p-shared",
      "p2",
    ]);
    expect(items.map((item) => item.flatIndex)).toEqual([0, 1, 2, 3]);
    expect(new Set(items.map((item) => item.entryKey)).size).toBe(4);
  });

  it("groups multi-year search results in place order so flatItems matches visual sections", () => {
    const { sections, items } = buildGallerySections(
      [
        {
          event: null,
          photos: [
            makePhoto("a", "2022"),
            makePhoto("b", "2024"),
            makePhoto("c", "2023"),
            makePhoto("d", "2024"),
          ],
        },
      ],
      PLACES,
    );

    expect(sections.map((s) => s.title)).toEqual(["2024", "2023", "2022"]);
    expect(items.map((i) => i.photo.id)).toEqual(["b", "d", "c", "a"]);
    expect(items.map((i) => i.flatIndex)).toEqual([0, 1, 2, 3]);
  });

  it("navigates linearly across duplicate photo IDs without looping back", () => {
    const shared = makePhoto("dup");
    const { items } = buildGallerySections(
      [
        { event: "Event A", photos: [makePhoto("a"), shared] },
        { event: "Event B", photos: [shared, makePhoto("b")] },
      ],
      PLACES,
    );

    // Stepping forward from index 0 through the entire list reaches every index once
    const visitedIndices: number[] = [0];
    let current: number | null = 0;
    while (true) {
      current = getNextPhotoIndex(current, items.length);
      if (current === null) break;
      visitedIndices.push(current);
    }
    expect(visitedIndices).toEqual([0, 1, 2, 3]);

    // Stepping forward with wrap (slideshow) wraps back to 0 only at the end
    expect(getNextPhotoIndex(3, items.length, { wrap: true })).toBe(0);
    // Stepping backward from index 2 (second copy of "dup") goes to index 1, not -1
    expect(getPrevPhotoIndex(2)).toBe(1);
    expect(getPrevPhotoIndex(0)).toBeNull();
  });

  it("computes the next event cleanly", () => {
    const events = ["Photo Tour", "Opening Ceremony", "World Finals"];
    expect(getNextEventName(events, "Photo Tour")).toBe("Opening Ceremony");
    expect(getNextEventName(events, "World Finals")).toBeNull();
    expect(getNextEventName(events, "Unknown")).toBe("Photo Tour");
    expect(getNextEventName(events, null)).toBeNull();
  });

  it("skips empty groups, places unknown years last, and avoids redundant year header for single-year search", () => {
    const singleYear = buildGallerySections(
      [
        { event: "Empty Event", photos: [] },
        {
          event: null,
          photos: [makePhoto("a", "2024"), makePhoto("b", "2024")],
        },
      ],
      PLACES,
    );
    expect(singleYear.sections).toHaveLength(1);
    expect(singleYear.sections[0]?.title).toBeNull();

    const withUnknown = buildGallerySections(
      [
        {
          event: null,
          photos: [makePhoto("u", "Unknown"), makePhoto("y", "2023")],
        },
      ],
      PLACES,
    );
    expect(withUnknown.sections.map((s) => s.title)).toEqual([
      "2023",
      "Unknown",
    ]);
    expect(getNextPhotoIndex(0, 0, { wrap: true })).toBeNull();
    expect(getNextPhotoIndex(0, 1, { wrap: true })).toBe(0);
    expect(getNextPhotoIndex(0, 1, { wrap: false })).toBeNull();
  });
});
