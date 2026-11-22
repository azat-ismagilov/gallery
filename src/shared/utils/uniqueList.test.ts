import { describe, expect, it } from "bun:test";

import UniqueList from "@/shared/utils/uniqueList";

describe("UniqueList", () => {
  it("deduplicates primitive arrays while preserving order", () => {
    expect(UniqueList(["b", "a", "b", "c", "a"])).toEqual(["b", "a", "c"]);
  });

  it("deduplicates objects by key selector", () => {
    const items = [
      { id: "1", name: "first" },
      { id: "2", name: "second" },
      { id: "1", name: "duplicate" },
    ];
    expect(UniqueList(items, (item) => item.id)).toEqual([
      { id: "1", name: "first" },
      { id: "2", name: "second" },
    ]);
  });
});
