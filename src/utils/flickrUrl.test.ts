import { describe, expect, it } from "bun:test";

import {
  buildFlickrPhotoMethodUrl,
  buildFlickrSearchUrl,
  selectFlickrPhotoFromSizes,
} from "@/utils/flickrUrl";

const CREDS = {
  apiKey: "test-key",
  userId: "123@N06",
  perPage: 25,
};

describe("flickrUrl", () => {
  it("builds search URL with sanitized tags stripping commas and colons", () => {
    const url = buildFlickrSearchUrl(
      CREDS,
      [
        ["albumWF", "2024"],
        ["team", "University of California, Berkeley: EECS"],
      ],
      3,
    );

    expect(url).toContain("method=flickr.photos.search");
    expect(url).toContain("api_key=test-key");
    expect(url).toContain("user_id=123@N06");
    expect(url).toContain("page=3");
    expect(url).toContain("per_page=25");
    expect(url).toContain("nojsoncallback=1");
    expect(url).toContain(
      "tags=albumWF$2024,team$University of California Berkeley EECS",
    );
    expect(url).not.toContain("&text=");
  });

  it("includes text search parameter when provided and omits tags when empty", () => {
    const url = buildFlickrSearchUrl(
      CREDS,
      [],
      1,
      "Champions%20and%20albumWF$",
    );
    expect(url).not.toContain("tags=");
    expect(url).toContain("text=Champions%20and%20albumWF$");
  });

  it("builds photo method URLs cleanly", () => {
    const url = buildFlickrPhotoMethodUrl(
      CREDS,
      "flickr.photos.getInfo",
      "987654",
    );
    expect(url).toBe(
      "https://api.flickr.com/services/rest?method=flickr.photos.getInfo&api_key=test-key&user_id=123@N06&format=json&nojsoncallback=1&photo_id=987654",
    );
  });

  it("selects Medium, Large, and Original photo sizes when all are present", () => {
    const photo = selectFlickrPhotoFromSizes("42", [
      { label: "Medium", width: 500, height: 333, source: "https://img/m.jpg" },
      { label: "Large", width: 1024, height: 683, source: "https://img/l.jpg" },
      {
        label: "Original",
        width: 4000,
        height: 2667,
        source: "https://img/o.jpg",
      },
    ]);

    expect(photo).toEqual({
      id: "42",
      url_preview: "https://img/m.jpg",
      url: "https://img/l.jpg",
      origin: "https://img/o.jpg",
      width: 1024,
      height: 683,
      year: "Unknown",
    });
  });

  it("falls back to Large 1600 / Medium 800 / largest available size and returns null on empty", () => {
    const fallback = selectFlickrPhotoFromSizes("99", [
      {
        label: "Medium 800",
        width: "800",
        height: "600",
        source: "https://img/m800.jpg",
      },
      {
        label: "Large 1600",
        width: "1600",
        height: "1200",
        source: "https://img/l1600.jpg",
      },
    ]);

    expect(fallback).toEqual({
      id: "99",
      url_preview: "https://img/m800.jpg",
      url: "https://img/l1600.jpg",
      origin: "https://img/l1600.jpg",
      width: 1600,
      height: 1200,
      year: "Unknown",
    });

    expect(selectFlickrPhotoFromSizes("99", [])).toBeNull();
    expect(selectFlickrPhotoFromSizes("99", undefined)).toBeNull();
  });
});
