import { describe, expect, it } from "bun:test";

import {
  applyEventFilter,
  applyFilterSelection,
  applyPersonFilter,
  applyTeamFilter,
  applyTextSearch,
  applyYearFilter,
  createDefaultGalleryState,
  getGalleryFilterKey,
} from "@/utils/galleryState";

const DEFAULTS = {
  lastYear: "2024",
  defaultEvent: "Photo Tour",
};

describe("galleryState transitions", () => {
  it("resets filters, viewer, and slideshow when changing year", () => {
    const next = applyYearFilter("2022", DEFAULTS);
    expect(next).toEqual({
      year: "2022",
      event: "Photo Tour",
      text: null,
      person: null,
      team: null,
      fullscreenPhotoId: null,
      slideShow: false,
    });
  });

  it("clears year and specific filters on global text search", () => {
    const initial = applyYearFilter("2023", DEFAULTS);
    const searched = applyTextSearch(initial, "Champions");
    expect(searched.year).toBeNull();
    expect(searched.event).toBeNull();
    expect(searched.team).toBeNull();
    expect(searched.person).toBeNull();
    expect(searched.text).toBe("Champions");
  });

  it("restores fallback year when switching from global text search to event, team, or person", () => {
    const searched = applyTextSearch(
      createDefaultGalleryState(DEFAULTS),
      "Bill",
    );

    const byEvent = applyEventFilter(searched, "Opening Ceremony", "2024");
    expect(byEvent.year).toBe("2024");
    expect(byEvent.event).toBe("Opening Ceremony");
    expect(byEvent.text).toBeNull();

    const byTeam = applyTeamFilter(searched, "MIT", "2024");
    expect(byTeam.year).toBe("2024");
    expect(byTeam.team).toBe("MIT");
    expect(byTeam.event).toBeNull();
    expect(byTeam.text).toBeNull();

    const byPerson = applyPersonFilter(searched, "Bill Poucher", "2024");
    expect(byPerson.year).toBe("2024");
    expect(byPerson.person).toBe("Bill Poucher");
    expect(byPerson.team).toBeNull();
    expect(byPerson.text).toBeNull();
  });

  it("handles atomic chip filter selection and closes fullscreen viewer", () => {
    const openViewer = {
      ...applyYearFilter("2024", DEFAULTS),
      fullscreenPhotoId: "12345",
      slideShow: true,
    };

    const albumOnly = applyFilterSelection(
      openViewer,
      { year: "2021" },
      DEFAULTS,
    );
    expect(albumOnly.year).toBe("2021");
    expect(albumOnly.event).toBe("Photo Tour");
    expect(albumOnly.fullscreenPhotoId).toBeNull();
    expect(albumOnly.slideShow).toBe(false);

    const specificTeam = applyFilterSelection(
      openViewer,
      { year: "2022", team: "Aalto University" },
      DEFAULTS,
    );
    expect(specificTeam.year).toBe("2022");
    expect(specificTeam.event).toBeNull();
    expect(specificTeam.team).toBe("Aalto University");
    expect(specificTeam.fullscreenPhotoId).toBeNull();
  });

  it("generates stable filter keys that ignore viewer-only state changes", () => {
    const base = applyYearFilter("2024", DEFAULTS);
    const withViewer = { ...base, fullscreenPhotoId: "999", slideShow: true };
    const differentEvent = applyEventFilter(base, "World Finals", "2024");

    expect(getGalleryFilterKey(base)).toBe(getGalleryFilterKey(withViewer));
    expect(getGalleryFilterKey(base)).not.toBe(
      getGalleryFilterKey(differentEvent),
    );
  });
});
