import { describe, expect, it } from "vitest";
import { VOCABULARY_RUSH_CONFIG, buildVocabularyRushQuestions, rushHintIndices, vocabularyRushPoints, vocabularyRushQuestionsWithSeed } from "./vocabulary-rush";
import { seededRng } from "./shared";

describe("vocabulary rush", () => {
  it("membangun soal unik dengan empat pilihan jawaban yang berbeda", () => {
    for (const difficulty of ["easy", "standard", "hard"] as const) {
      const questions = buildVocabularyRushQuestions(difficulty, seededRngRush(difficulty));
      expect(questions.length).toBeGreaterThanOrEqual(20);
      expect(questions.length).toBeLessThanOrEqual(VOCABULARY_RUSH_CONFIG[difficulty].totalQuestions);
      expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
      for (const question of questions) {
        expect(question.options).toHaveLength(4);
        expect(new Set(question.options).size).toBe(4);
        expect(question.answerIndex).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex).toBeLessThan(4);
        expect(question.options[question.answerIndex]).toBe(question.word.meaning);
        expect(question.explanation).toContain(question.word.meaning);
      }
    }
  });

  it("memakai soal N5 pada tingkat mudah", () => {
    const questions = vocabularyRushQuestionsWithSeed("easy", "rush-easy");
    expect(questions).toHaveLength(30);
    for (const question of questions) expect(question.word.level).toBe("N5");
  });

  it("memuat tingkat kesulitan bertahap pada mode standar", () => {
    const questions = vocabularyRushQuestionsWithSeed("standard", "rush-standard");
    const levels = new Set(questions.map((question) => question.word.level));
    expect(levels.has("N5")).toBe(true);
    expect(levels.has("N3")).toBe(true);
    expect(levels.has("N1")).toBe(true);
  });

  it("deterministik untuk seed yang sama", () => {
    const a = vocabularyRushQuestionsWithSeed("standard", "same");
    const b = vocabularyRushQuestionsWithSeed("standard", "same");
    expect(a.map((question) => question.id)).toEqual(b.map((question) => question.id));
    expect(a.map((question) => question.options)).toEqual(b.map((question) => question.options));
  });

  it("menghitung poin dan petunjuk 50:50 dengan benar", () => {
    expect(vocabularyRushPoints("N5", 0, false)).toBeGreaterThan(0);
    expect(vocabularyRushPoints("N1", 3, false)).toBeGreaterThan(vocabularyRushPoints("N5", 0, false));
    expect(vocabularyRushPoints("N1", 3, true)).toBeLessThan(vocabularyRushPoints("N1", 3, false));

    const [question] = vocabularyRushQuestionsWithSeed("easy", "hint");
    const hidden = rushHintIndices(question, () => 0);
    expect(hidden).toHaveLength(2);
    expect(hidden).not.toContain(question.answerIndex);
    for (const index of hidden) expect(question.options[index]).not.toBe(question.word.meaning);
  });
});

function seededRngRush(difficulty: string) {
  return seededRng("rush-" + difficulty);
}
