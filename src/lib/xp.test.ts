import { describe, expect, it } from "vitest";
import { LEVEL_TITLES, levelFromXp, levelProgress, nextLevelXp, xpForLevel } from "./xp";

describe("XP and levels", () => {
  it("starts at level 1 with zero XP", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(levelFromXp(0)).toBe(1);
    expect(nextLevelXp(0)).toBe(xpForLevel(2));
  });

  it("increases thresholds monotonically", () => {
    for (let level = 2; level <= 12; level += 1) {
      expect(xpForLevel(level)).toBeGreaterThan(xpForLevel(level - 1));
    }
  });

  it("maps XP to levels and progress", () => {
    expect(levelFromXp(xpForLevel(3))).toBe(3);
    const progress = levelProgress(xpForLevel(3));
    expect(progress.level).toBe(3);
    expect(progress.current).toBe(0);
    expect(progress.percent).toBe(0);
    expect(progress.title).toBe(LEVEL_TITLES[2].title);
  });

  it("caps progress below 100 percent just before the next level", () => {
    const progress = levelProgress(xpForLevel(4) - 1);
    expect(progress.percent).toBeLessThan(100);
    expect(progress.level).toBe(3);
  });
});
