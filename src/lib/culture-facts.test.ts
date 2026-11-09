import { describe, expect, it } from "vitest";
import { CULTURE } from "@/content/culture";
import { CULTURE_FACTS, factForKey, factOfDay, localDateKey } from "./culture-facts";

describe("culture facts", () => {
  it("flattens every article fact with a usable id and article link", () => {
    const expected = CULTURE.reduce((sum, article) => sum + article.facts.length, 0);
    expect(CULTURE_FACTS).toHaveLength(expected);
    expect(new Set(CULTURE_FACTS.map((fact) => fact.id)).size).toBe(CULTURE_FACTS.length);
    for (const fact of CULTURE_FACTS) {
      expect(fact.value.length).toBeGreaterThan(0);
      expect(fact.label.length).toBeGreaterThan(0);
      expect(CULTURE.some((article) => article.id === fact.articleId)).toBe(true);
    }
  });

  it("uses the local calendar date for the daily key", () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(localDateKey(new Date(2026, 11, 31, 0, 1))).toBe("2026-12-31");
  });

  it("is deterministic for the same day and changes across the calendar", () => {
    const morning = factOfDay(new Date(2026, 4, 17, 6, 0));
    const evening = factOfDay(new Date(2026, 4, 17, 22, 0));
    expect(morning.id).toBe(evening.id);
    expect(factForKey("stable").id).toBe(factForKey("stable").id);
    expect(new Set([factOfDay(new Date(2026, 4, 17)), factOfDay(new Date(2026, 4, 18))]).size).toBeGreaterThan(0);
  });
});
