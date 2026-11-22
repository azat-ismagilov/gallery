import { describe, expect, it } from "bun:test";

import { shouldRunSlideshow } from "@/hooks/useSlideshow";

describe("shouldRunSlideshow", () => {
  it("runs when active, not paused, and multiple photos exist", () => {
    expect(
      shouldRunSlideshow({
        active: true,
        paused: false,
        totalItems: 10,
        hasMore: false,
      }),
    ).toBe(true);
  });

  it("does not run when inactive or paused (e.g. edit mode or loading)", () => {
    expect(
      shouldRunSlideshow({
        active: false,
        paused: false,
        totalItems: 10,
        hasMore: true,
      }),
    ).toBe(false);
    expect(
      shouldRunSlideshow({
        active: true,
        paused: true,
        totalItems: 10,
        hasMore: true,
      }),
    ).toBe(false);
  });

  it("does not run when only one photo exists and no more pages can load", () => {
    expect(
      shouldRunSlideshow({
        active: true,
        paused: false,
        totalItems: 1,
        hasMore: false,
      }),
    ).toBe(false);
  });

  it("runs when one photo is loaded if more pages are still available", () => {
    expect(
      shouldRunSlideshow({
        active: true,
        paused: false,
        totalItems: 1,
        hasMore: true,
      }),
    ).toBe(true);
  });
});
