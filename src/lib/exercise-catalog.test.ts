import { describe, expect, it } from "vitest";
import { buildAdaptiveSession, buildExerciseCatalog, exercisesFromQuizQuestions } from "./exercise-catalog";
import type { QuizQuestion } from "./types";

const NOW = new Date("2026-01-01T00:00:00.000Z");

describe("exercise catalog", () => {
  it("exposes all nine exercise kinds", () => {
    const catalog = buildExerciseCatalog();
    const kinds = new Set(catalog.map((exercise) => exercise.kind));
    expect(kinds).toEqual(
      new Set([
        "multiple-choice",
        "cloze",
        "translation",
        "matching",
        "reading-recognition",
        "listening",
        "ordering",
        "true-false",
        "typing",
      ]),
    );
  });

  it("builds a deterministic adaptive session with unique items", () => {
    const first = buildAdaptiveSession({ count: 9, seed: "uji-adaptif", now: NOW });
    const second = buildAdaptiveSession({ count: 9, seed: "uji-adaptif", now: NOW });
    expect(first).toHaveLength(9);
    expect(first.map((exercise) => exercise.id)).toEqual(second.map((exercise) => exercise.id));
    expect(new Set(first.map((exercise) => exercise.id)).size).toBe(9);
    expect(new Set(first.map((exercise) => exercise.kind)).size).toBe(9);
  });

  it("honours kind filters and count limits", () => {
    const session = buildAdaptiveSession({ kinds: ["multiple-choice"], count: 4, seed: "filter", now: NOW });
    expect(session).toHaveLength(4);
    expect(session.every((exercise) => exercise.kind === "multiple-choice")).toBe(true);
  });

  it("adapts extra quiz questions into shared listening and choice exercises", () => {
    const listening: QuizQuestion = {
      id: "q-listening-1",
      type: "listening",
      level: "N5",
      prompt: "Apa yang dibicarakan?",
      options: ["Kopi", "Teh"],
      answerIndex: 0,
      explanation: "Percakapan menyebut kopi.",
      audioText: "コーヒーをください。",
    };
    const choice: QuizQuestion = {
      id: "q-choice-1",
      type: "vocab-meaning",
      level: "N5",
      prompt: "Arti 学生?",
      options: ["siswa", "guru"],
      answerIndex: 0,
      explanation: "学生 berarti siswa.",
    };

    const exercises = exercisesFromQuizQuestions([listening, choice], "Ujian");
    expect(exercises).toHaveLength(2);
    expect(exercises[0].kind).toBe("listening");
    expect(exercises[0].id).toBe("quiz-q-listening-1");
    expect(exercises[1].kind).toBe("multiple-choice");
  });
});
