import { describe, expect, it } from "vitest";
import { SENTENCES } from "@/content/sentences";
import { buildSentenceChallenge, checkSentenceAnswer, sentenceChallengeWithSeed, sentenceHint, sentenceScore } from "./sentence-challenge";
import { buildKanjiChallenge, kanjiChallengeWithSeed, kanjiHintIndices, kanjiPoints, KANJI_CHALLENGE_CONFIG } from "./kanji-challenge";
import { seededRng } from "./shared";

describe("sentence builder game", () => {
  it("memilih kalimat sesuai tingkat kesulitan", () => {
    for (const difficulty of ["easy", "standard", "hard"] as const) {
      const rounds = buildSentenceChallenge(difficulty, seededRng("sentence-" + difficulty));
      expect(rounds.length).toBeGreaterThan(0);
      const config = { easy: 5, standard: 6, hard: 7 }[difficulty];
      expect(rounds).toHaveLength(config);
      for (const item of rounds) {
        if (difficulty === "easy") expect(item.level).toBe("N5");
      }
    }
  });

  it("menerima susunan yang tepat dan menolak susunan lain", () => {
    const [item] = sentenceChallengeWithSeed("standard", "sentence-check");
    expect(checkSentenceAnswer(item, item.answer)).toBe(true);
    expect(checkSentenceAnswer(item, [...item.tokens])).toBe(false);
    expect(checkSentenceAnswer(item, [])).toBe(false);
  });

  it("poin menghargai percobaan pertama dan tingkat kesulitan", () => {
    expect(sentenceScore(true, false, false, "hard")).toBeGreaterThan(sentenceScore(true, false, false, "easy"));
    expect(sentenceScore(true, true, false, "standard")).toBeLessThan(sentenceScore(true, false, false, "standard"));
    expect(sentenceScore(false, false, false, "easy")).toBe(0);
  });

  it("petunjuk memakai penjelasan kalimat", () => {
    const [item] = sentenceChallengeWithSeed("easy", "sentence-hint");
    const hint = sentenceHint(item);
    expect(hint.startsWith("Petunjuk:")).toBe(true);
    expect(hint.length).toBeGreaterThan(10);
    expect(SENTENCES.some((sentence) => sentence.id === item.id)).toBe(true);
  });
});

describe("kanji challenge", () => {
  it("membangun soal pilihan ganda yang valid", () => {
    for (const difficulty of ["easy", "standard", "hard"] as const) {
      const config = KANJI_CHALLENGE_CONFIG[difficulty];
      const questions = buildKanjiChallenge(difficulty, seededRng("kanji-" + difficulty));
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.length).toBeLessThanOrEqual(config.rounds);
      for (const question of questions) {
        expect(config.levels).toContain(question.level);
        expect(question.options).toHaveLength(4);
        expect(new Set(question.options).size).toBe(4);
        expect(question.options[question.answerIndex]).toBeDefined();
        expect(question.explanation.length).toBeGreaterThan(10);
      }
      expect(new Set(questions.map((question) => question.type)).size).toBeGreaterThan(1);
    }
  });

  it("deterministik untuk seed yang sama", () => {
    const a = kanjiChallengeWithSeed("standard", "same");
    const b = kanjiChallengeWithSeed("standard", "same");
    expect(a.map((question) => question.id)).toEqual(b.map((question) => question.id));
    expect(a.map((question) => question.options)).toEqual(b.map((question) => question.options));
  });

  it("petunjuk menyembunyikan dua opsi salah", () => {
    const [question] = kanjiChallengeWithSeed("easy", "kanji-hint");
    const hidden = kanjiHintIndices(question, () => 0);
    expect(hidden).toHaveLength(2);
    expect(hidden).not.toContain(question.answerIndex);
    expect(kanjiPoints(question, 2, false)).toBeGreaterThan(0);
    expect(kanjiPoints(question, 2, true)).toBeLessThan(kanjiPoints(question, 2, false));
  });
});
