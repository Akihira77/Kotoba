import { describe, expect, it } from "vitest";
import { buildExam, buildPracticeQuiz, kanaQuestion, lookupKanaByChar } from "./quiz";
import { ALL_KANA } from "@/content/kana";
import { JLPT_LEVELS } from "./types";

function expectValidQuestion(question: { prompt: string; options: string[]; answerIndex: number; explanation: string }) {
  expect(question.prompt.length).toBeGreaterThan(0);
  expect(question.options.length).toBeGreaterThanOrEqual(2);
  expect(question.answerIndex).toBeGreaterThanOrEqual(0);
  expect(question.answerIndex).toBeLessThan(question.options.length);
  expect(question.explanation.length).toBeGreaterThan(0);
}

describe("question builders", () => {
  it("creates kana reading and writing questions with a valid key", () => {
    const kana = lookupKanaByChar("あ");
    expect(kana).toBeDefined();
    if (!kana) return;
    const reading = kanaQuestion(kana, ALL_KANA, "reading");
    const writing = kanaQuestion(kana, ALL_KANA, "writing");
    expectValidQuestion(reading);
    expectValidQuestion(writing);
    expect(reading.options[reading.answerIndex]).toBe(kana.romaji);
    expect(writing.options[writing.answerIndex]).toBe(kana.char);
  });

  it("builds practice quizzes for every JLPT level", () => {
    for (const level of JLPT_LEVELS) {
      const quiz = buildPracticeQuiz({ level, count: 10 });
      expect(quiz.length, level).toBeGreaterThan(0);
      expect(quiz.length, level).toBeLessThanOrEqual(10);
      expect(new Set(quiz.map((question) => question.id)).size, level).toBe(quiz.length);
      for (const question of quiz) expectValidQuestion(question);
    }
  });

  it("builds exam blueprints with three non-empty sections", () => {
    for (const level of JLPT_LEVELS) {
      const exam = buildExam(level);
      expect(exam.level).toBe(level);
      expect(exam.minutes).toBeGreaterThan(0);
      expect(exam.sections).toHaveLength(3);
      expect(exam.sections.map((section) => section.id)).toEqual(["moji-goi", "bunpou-dokkai", "choukai"]);
      for (const section of exam.sections) {
        expect(section.questions.length, level + " " + section.id).toBeGreaterThan(0);
        for (const question of section.questions) expectValidQuestion(question);
      }
    }
  });
});
