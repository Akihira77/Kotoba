import { describe, expect, it } from "vitest";
import { buildDailyChallenge, DAILY_CHALLENGE_SECONDS, DAILY_QUESTION_COUNT, dailyKindLabel, dailyPoints } from "./daily-challenge";

describe("daily challenge", () => {
  it("menghasilkan sepuluh soal deterministik untuk tanggal yang sama", () => {
    const a = buildDailyChallenge("2026-11-08", "standard");
    const b = buildDailyChallenge("2026-11-08", "standard");
    expect(a.questions).toHaveLength(DAILY_QUESTION_COUNT);
    expect(a.seconds).toBe(DAILY_CHALLENGE_SECONDS);
    expect(a.questions.map((question) => question.id)).toEqual(b.questions.map((question) => question.id));
    expect(a.questions.map((question) => question.options)).toEqual(b.questions.map((question) => question.options));
  });

  it("mencampur kosakata, kana, kanji, dan tata bahasa", () => {
    const challenge = buildDailyChallenge("2026-11-08", "standard");
    const counts = new Map<string, number>();
    for (const question of challenge.questions) {
      counts.set(question.kind, (counts.get(question.kind) ?? 0) + 1);
    }
    expect(counts.get("kosakata")).toBe(3);
    expect(counts.get("kanji")).toBe(3);
    expect(counts.get("kana")).toBe(2);
    expect(counts.get("tata-bahasa")).toBe(2);
    expect(dailyKindLabel("tata-bahasa")).toBe("Tata bahasa");
  });

  it("setiap soal punya empat opsi unik dan jawaban yang tepat", () => {
    const challenge = buildDailyChallenge("2026-11-09", "hard");
    for (const question of challenge.questions) {
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options).size).toBe(4);
      expect(question.answerIndex).toBeGreaterThanOrEqual(0);
      expect(question.answerIndex).toBeLessThan(4);
      expect(question.options[question.answerIndex]).toBeDefined();
      expect(question.explanation.length).toBeGreaterThan(10);
    }
  });

  it("tanggal dan kesulitan yang berbeda menghasilkan susunan berbeda", () => {
    const a = buildDailyChallenge("2026-11-08", "standard");
    const b = buildDailyChallenge("2026-11-09", "standard");
    const c = buildDailyChallenge("2026-11-08", "hard");
    expect(a.questions.map((question) => question.promptJp)).not.toEqual(b.questions.map((question) => question.promptJp));
    expect(a.questions.map((question) => question.promptJp)).not.toEqual(c.questions.map((question) => question.promptJp));
  });

  it("poin naik untuk level tinggi dan turun saat petunjuk dipakai", () => {
    const challenge = buildDailyChallenge("2026-11-08", "standard");
    const question = challenge.questions[0];
    expect(dailyPoints(question, 0, false)).toBeGreaterThan(0);
    expect(dailyPoints(question, 5, false)).toBeGreaterThan(dailyPoints(question, 0, false));
    expect(dailyPoints(question, 5, true)).toBeLessThan(dailyPoints(question, 5, false));
  });
});
