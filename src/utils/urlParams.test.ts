import { describe, expect, it } from "bun:test";

import type { AppQueryState } from "@/types/gallery";
import { parseSearchParams, serializeSearchParams } from "@/utils/urlParams";

describe("urlParams", () => {
  it("defaults event when no filter param is present", () => {
    const parsed = parseSearchParams(new URLSearchParams(""), "Photo Tour");
    expect(parsed.event).toBe("Photo Tour");
  });

  it("parses slideshow flag strictly as boolean", () => {
    expect(
      parseSearchParams(new URLSearchParams("slideshow=true"), "Photo Tour")
        .slideShow,
    ).toBe(true);
    expect(
      parseSearchParams(new URLSearchParams("slideshow=false"), "Photo Tour")
        .slideShow,
    ).toBe(false);
  });

  it("clears year when global search query is provided", () => {
    const parsed = parseSearchParams(
      new URLSearchParams("album=2024&query=Champions"),
      "Photo Tour",
    );
    expect(parsed.text).toBe("Champions");
    expect(parsed.year).toBeNull();
  });

  it("round-trips serialized query state", () => {
    const state: AppQueryState = {
      year: "2024",
      event: "Opening Ceremony",
      text: null,
      person: null,
      team: null,
      fullscreenPhotoId: "123456",
      slideShow: true,
    };
    const serialized = serializeSearchParams(state);
    const reparsed = parseSearchParams(
      new URLSearchParams(serialized),
      "Photo Tour",
    );
    expect(reparsed).toEqual({
      year: "2024",
      event: "Opening Ceremony",
      fullscreenPhotoId: "123456",
      slideShow: true,
    });
  });
});
