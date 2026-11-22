import { beforeEach, describe, expect, it } from "bun:test";

import {
  readStoredBoolean,
  writeStoredBoolean,
} from "@/shared/hooks/useLocalStorage";

describe("useLocalStorage helpers", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    Object.defineProperty(globalThis, "window", {
      value: {
        localStorage: {
          getItem: (key: string) => store.get(key) ?? null,
          setItem: (key: string, value: string) => {
            store.set(key, value);
          },
        },
      },
      configurable: true,
    });
  });

  it("returns fallback when key is absent", () => {
    expect(readStoredBoolean("gallery:infoSidebarOpen", false)).toBe(false);
    expect(readStoredBoolean("gallery:infoSidebarOpen", true)).toBe(true);
  });

  it("persists and reads boolean values accurately", () => {
    writeStoredBoolean("gallery:infoSidebarOpen", true);
    expect(readStoredBoolean("gallery:infoSidebarOpen", false)).toBe(true);

    writeStoredBoolean("gallery:infoSidebarOpen", false);
    expect(readStoredBoolean("gallery:infoSidebarOpen", true)).toBe(false);
  });
});
