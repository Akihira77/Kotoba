import { describe, expect, it } from "vitest";
import { createCard, estimateInterval, isDue, masteryLabel, nextEase, scheduleCard } from "./srs";

const NOW = new Date("2026-01-01T00:00:00.000Z");

describe("SRS scheduling", () => {
  it("creates a new card due immediately", () => {
    const card = createCard("v-ohayou", "vocab", NOW);
    expect(card.reps).toBe(0);
    expect(card.ease).toBe(2.5);
    expect(isDue(card, NOW)).toBe(true);
  });

  it("schedules a good first review for tomorrow", () => {
    const card = scheduleCard(createCard("v-ohayou", "vocab", NOW), 2, NOW);
    expect(card.reps).toBe(1);
    expect(card.intervalDays).toBe(1);
    expect(card.dueAt).toBe(new Date("2026-01-02T00:00:00.000Z").toISOString());
    expect(isDue(card, NOW)).toBe(false);
  });

  it("schedules an easy first review for two days and raises ease", () => {
    const card = scheduleCard(createCard("v-ohayou", "vocab", NOW), 3, NOW);
    expect(card.intervalDays).toBe(2);
    expect(card.ease).toBe(2.6);
  });

  it("schedules a hard first review for one day and lowers ease", () => {
    const card = scheduleCard(createCard("v-ohayou", "vocab", NOW), 1, NOW);
    expect(card.intervalDays).toBe(1);
    expect(card.ease).toBe(2.36);
  });

  it("uses SM-2 second intervals for good and easy", () => {
    let good = scheduleCard(createCard("v-ohayou", "vocab", NOW), 2, NOW);
    good = scheduleCard(good, 2, NOW);
    expect(good.intervalDays).toBe(6);

    let easy = scheduleCard(createCard("v-ohayou", "vocab", NOW), 3, NOW);
    easy = scheduleCard(easy, 3, NOW);
    expect(easy.intervalDays).toBe(8);
  });

  it("resets a lapsed card to a ten-minute delay and lowers ease", () => {
    const card = scheduleCard(createCard("v-ohayou", "vocab", NOW), 0, NOW);
    expect(card.intervalDays).toBe(0);
    expect(card.lapses).toBe(1);
    expect(card.ease).toBe(2.18);
    expect(card.dueAt).toBe(new Date("2026-01-01T00:10:00.000Z").toISOString());
  });

  it("keeps ease within bounds across many lapses and easy reviews", () => {
    let card = createCard("k-日", "kanji", NOW);
    for (let index = 0; index < 20; index += 1) card = scheduleCard(card, 0, NOW);
    expect(card.ease).toBeGreaterThanOrEqual(1.3);

    for (let index = 0; index < 20; index += 1) card = scheduleCard(card, 3, NOW);
    expect(card.ease).toBeLessThanOrEqual(3.0);
  });

  it("exposes the SM-2 ease delta deterministically", () => {
    expect(nextEase(2.5, 0)).toBe(2.18);
    expect(nextEase(2.5, 1)).toBe(2.36);
    expect(nextEase(2.5, 2)).toBe(2.5);
    expect(nextEase(2.5, 3)).toBe(2.6);
    expect(nextEase(1.3, 0)).toBe(1.3);
    expect(nextEase(3.0, 3)).toBe(3.0);
  });

  it("estimates readable intervals and mastery labels", () => {
    expect(estimateInterval(createCard("v-ohayou", "vocab", NOW), 2)).toBe("1 hari");
    expect(masteryLabel(0, 0)).toBe("Baru");
    expect(masteryLabel(2, 0)).toBe("Belajar");
    expect(masteryLabel(4, 0)).toBe("Familiar");
    expect(masteryLabel(6, 0)).toBe("Dikuasai");
  });
});
