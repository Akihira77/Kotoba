import { afterEach, describe, expect, it, vi } from "vitest";
import { preferredTheme, readStoredTheme } from "./theme";

function remember(value: string | null) {
  vi.stubGlobal("window", { localStorage: { getItem: () => value } });
}

describe("theme preference", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads only known explicit stored themes", () => {
    remember("dark");
    expect(readStoredTheme()).toBe("dark");
    remember("light");
    expect(readStoredTheme()).toBe("light");
    remember("sepia");
    expect(readStoredTheme()).toBeNull();
    remember(null);
    expect(readStoredTheme()).toBeNull();
  });

  it("keeps an explicit local choice over the server system default", () => {
    remember("dark");
    expect(preferredTheme("system")).toBe("dark");
    remember("light");
    expect(preferredTheme("system")).toBe("light");
    remember("system");
    expect(preferredTheme("system")).toBe("system");
  });

  it("always honors an explicit server choice", () => {
    remember("dark");
    expect(preferredTheme("light")).toBe("light");
    expect(preferredTheme("dark")).toBe("dark");
  });
});
