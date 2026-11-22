import { describe, expect, it } from "bun:test";

import {
  parsePhotoTags,
  serializePhotoTags,
  type TagPrefixes,
} from "@/utils/photoTagParser";

const PREFIXES: TagPrefixes = {
  event: "event",
  team: "team",
  album: "albumWF",
  person: "person",
  photographer: "photographer",
};

describe("photoTagParser", () => {
  it("parses structured Flickr tags, photographer description, and Picasa face tags", () => {
    const info = parsePhotoTags(
      [
        "albumWF$2024",
        "event$Opening Ceremony",
        "team$MIT",
        "person$Jane Doe",
        "Bill Poucher(1761524d3f579a4d)",
        "photographer$John Smith",
      ],
      "Photographer: Alice Photo",
      PREFIXES,
    );

    expect(info.album).toEqual(["2024"]);
    expect(info.event).toEqual(["Opening Ceremony"]);
    expect(info.team).toEqual(["MIT"]);
    expect(info.photographer).toEqual(["Alice Photo", "John Smith"]);
    expect(info.person).toHaveLength(2);
    expect(info.person[0]).toEqual({ name: "Jane Doe" });
    expect(info.person[1]?.name).toBe("Bill Poucher");
    expect(info.person[1]?.position?.left).toBeCloseTo(0x1761 / 65535, 5);
    expect(info.person[1]?.position?.top).toBeCloseTo(0x524d / 65535, 5);
    expect(info.person[1]?.position?.right).toBeCloseTo(0x3f57 / 65535, 5);
    expect(info.person[1]?.position?.bottom).toBeCloseTo(0x9a4d / 65535, 5);
  });

  it("ignores non-hex parenthetical tags", () => {
    const info = parsePhotoTags(
      ["Some Event (Day 1)", "(1761524d3f579a4d)"],
      undefined,
      PREFIXES,
    );
    expect(info.person).toEqual([]);
  });

  it("serializes people with and without face positions", () => {
    const serialized = serializePhotoTags(
      {
        event: ["World Finals"],
        team: ["Aalto University"],
        album: ["2024"],
        photographer: ["Alice"],
        person: [
          { name: "Jane Doe" },
          {
            name: "Bill Poucher",
            position: {
              left: 0x1761 / 65535,
              top: 0x524d / 65535,
              right: 0x3f57 / 65535,
              bottom: 0x9a4d / 65535,
            },
          },
        ],
      },
      PREFIXES,
    );

    expect(serialized).toEqual([
      '"event$World Finals"',
      '"team$Aalto University"',
      '"albumWF$2024"',
      '"photographer$Alice"',
      '"person$Jane Doe"',
      '"Bill Poucher(1761524d3f579a4d)"',
    ]);
  });
});
