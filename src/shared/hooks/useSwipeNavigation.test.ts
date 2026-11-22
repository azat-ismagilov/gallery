import { describe, expect, it } from "bun:test";

import { detectHorizontalSwipe } from "@/shared/hooks/useSwipeNavigation";

describe("detectHorizontalSwipe", () => {
  it("detects left swipe as next and right swipe as prev", () => {
    expect(detectHorizontalSwipe(300, 200, 180, 210)).toBe("next");
    expect(detectHorizontalSwipe(120, 200, 260, 195)).toBe("prev");
  });

  it("ignores short taps below threshold", () => {
    expect(detectHorizontalSwipe(200, 200, 165, 202)).toBeNull();
    expect(detectHorizontalSwipe(200, 200, 230, 200)).toBeNull();
  });

  it("ignores vertical scrolls so mobile scrolling to bottom info panel is preserved", () => {
    expect(detectHorizontalSwipe(200, 400, 190, 150)).toBeNull();
    expect(detectHorizontalSwipe(200, 150, 210, 420)).toBeNull();
  });

  it("ignores ambiguous diagonal drags", () => {
    expect(detectHorizontalSwipe(200, 200, 120, 120)).toBeNull();
    expect(detectHorizontalSwipe(200, 200, 280, 270)).toBeNull();
  });
});
