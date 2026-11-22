import { describe, expect, it } from "bun:test";

import { fitDimensions } from "@/features/viewer/utils/imageFit";

describe("fitDimensions", () => {
  it("fits a landscape photo into a narrower desktop stage with sidebar open", () => {
    expect(fitDimensions(2000, 1000, 1000, 900)).toEqual({
      width: 1000,
      height: 500,
    });
  });

  it("fits a portrait photo into a wide container by height", () => {
    expect(fitDimensions(1000, 2000, 1200, 800)).toEqual({
      width: 400,
      height: 800,
    });
  });

  it("handles zero container or missing natural dimensions safely", () => {
    expect(fitDimensions(1600, 1200, 0, 800)).toEqual({ width: 0, height: 0 });
    expect(fitDimensions(0, 0, 800, 600)).toEqual({ width: 800, height: 600 });
  });
});
