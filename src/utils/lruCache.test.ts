import { describe, expect, it } from "bun:test";

import { LruCache } from "@/utils/lruCache";

describe("LruCache", () => {
  it("stores and retrieves entries up to maxSize", () => {
    const cache = new LruCache<string, number>(2);
    cache.set("a", 1);
    cache.set("b", 2);

    expect(cache.size).toBe(2);
    expect(cache.get("a")).toBe(1);
    expect(cache.get("b")).toBe(2);
  });

  it("evicts the least recently used entry on overflow", () => {
    const cache = new LruCache<string, number>(2);
    cache.set("a", 1);
    cache.set("b", 2);
    // Access "a" so "b" becomes least recently used.
    expect(cache.get("a")).toBe(1);
    cache.set("c", 3);

    expect(cache.has("b")).toBe(false);
    expect(cache.get("a")).toBe(1);
    expect(cache.get("c")).toBe(3);
  });

  it("updates existing keys without growing beyond maxSize", () => {
    const cache = new LruCache<string, number>(2);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("a", 10);
    cache.set("c", 3);

    expect(cache.size).toBe(2);
    expect(cache.get("a")).toBe(10);
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("c")).toBe(3);
  });

  it("supports delete, clear, and rejects invalid capacity", () => {
    expect(() => new LruCache<string, number>(0)).toThrow();
    const cache = new LruCache<string, number>(2);
    cache.set("a", 1);
    expect(cache.delete("a")).toBe(true);
    expect(cache.size).toBe(0);
    cache.set("b", 2);
    cache.clear();
    expect(cache.size).toBe(0);
  });
});
