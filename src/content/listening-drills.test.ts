import { describe, expect, it } from "vitest";
import { LISTENING_DRILLS, listeningDrillsForLevel } from "./listening-drills";
import { listeningDrillExercises } from "@/lib/exercise-catalog";
import { JLPT_LEVELS } from "@/lib/types";

const JAPANESE = /[\u3040-\u30ff\u3400-\u9fff]/;

describe("listening drills", () => {
  it("has fifteen original drills with three per JLPT level", () => {
    expect(LISTENING_DRILLS).toHaveLength(15);
    for (const level of JLPT_LEVELS) {
      expect(listeningDrillsForLevel(level), level).toHaveLength(3);
    }
    expect(listeningDrillsForLevel("semua")).toHaveLength(15);
  });

  it("uses unique ids and valid four-option questions", () => {
    expect(new Set(LISTENING_DRILLS.map((drill) => drill.id)).size).toBe(LISTENING_DRILLS.length);
    for (const drill of LISTENING_DRILLS) {
      expect(drill.prompt.length, drill.id).toBeGreaterThan(0);
      expect(drill.focus.length, drill.id).toBeGreaterThan(0);
      expect(drill.audioText.length, drill.id).toBeGreaterThan(0);
      expect(drill.audioText, drill.id).toMatch(JAPANESE);
      expect(drill.reading.length, drill.id).toBeGreaterThan(0);
      expect(drill.translation.length, drill.id).toBeGreaterThan(0);
      expect(drill.explanation.length, drill.id).toBeGreaterThan(0);
      expect(drill.tip.length, drill.id).toBeGreaterThan(0);
      expect(drill.options, drill.id).toHaveLength(4);
      expect(new Set(drill.options).size, drill.id).toBe(4);
      for (const option of drill.options) expect(option.length, drill.id).toBeGreaterThan(0);
      expect(drill.answerIndex, drill.id).toBeGreaterThanOrEqual(0);
      expect(drill.answerIndex, drill.id).toBeLessThan(drill.options.length);
    }
  });

  it("maps every drill to a persisted listening exercise", () => {
    const exercises = listeningDrillExercises();
    expect(exercises).toHaveLength(15);
    expect(new Set(exercises.map((exercise) => exercise.id)).size).toBe(exercises.length);
    expect(listeningDrillExercises("N3")).toHaveLength(3);
    for (const exercise of exercises) {
      if (exercise.kind !== "listening") throw new Error("expected a listening exercise");
      expect(exercise.id.startsWith("ex-listen-drill-")).toBe(true);
      expect(exercise.audioText?.length ?? 0).toBeGreaterThan(0);
      expect(exercise.options.length).toBe(4);
      expect(exercise.answerIndex).toBeGreaterThanOrEqual(0);
      expect(exercise.answerIndex).toBeLessThan(exercise.options.length);
      expect(exercise.contentRef?.href).toBe("/listening/practice");
    }
  });
});
