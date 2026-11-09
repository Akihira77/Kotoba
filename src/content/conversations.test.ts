import { describe, expect, it } from "vitest";
import {
  CONVERSATION_BY_ID,
  CONVERSATION_CATEGORIES,
  CONVERSATIONS,
  conversationCorrectChoice,
  conversationStepCount,
} from "./conversations";
import { stripFurigana } from "@/lib/furigana";
import { JLPT_LEVELS, type Register } from "@/lib/types";

const REGISTERS: Register[] = ["standar", "formal", "kasual", "slang", "arkais", "anime"];

describe("conversation scenarios", () => {
  it("provides six unique scenarios across N5–N4", () => {
    expect(CONVERSATIONS).toHaveLength(6);
    expect(new Set(CONVERSATIONS.map((scenario) => scenario.id)).size).toBe(CONVERSATIONS.length);
    expect(CONVERSATION_BY_ID.size).toBe(CONVERSATIONS.length);
    for (const scenario of CONVERSATIONS) {
      expect(JLPT_LEVELS).toContain(scenario.level);
      expect(["N5", "N4"]).toContain(scenario.level);
      expect(scenario.category.length, scenario.id).toBeGreaterThan(0);
      expect(CONVERSATION_CATEGORIES).toContain(scenario.category);
      expect(scenario.title.length, scenario.id).toBeGreaterThan(0);
      expect(scenario.titleJp.length, scenario.id).toBeGreaterThan(0);
      expect(scenario.summary.length, scenario.id).toBeGreaterThan(10);
      expect(scenario.setting.length, scenario.id).toBeGreaterThan(10);
      expect(scenario.goals.length, scenario.id).toBeGreaterThanOrEqual(2);
      expect(scenario.minutes, scenario.id).toBeGreaterThan(0);
      expect(scenario.culturalNote.length, scenario.id).toBeGreaterThan(40);
    }
  });

  it("has at least three steps with exactly one correct choice per step", () => {
    const choiceIds = new Set<string>();
    for (const scenario of CONVERSATIONS) {
      expect(conversationStepCount(scenario), scenario.id).toBeGreaterThanOrEqual(3);
      const stepIds = new Set(scenario.steps.map((step) => step.id));
      expect(stepIds.size, scenario.id).toBe(scenario.steps.length);
      for (const step of scenario.steps) {
        expect(step.prompt.length, step.id).toBeGreaterThan(0);
        expect(step.choices.length, step.id).toBe(3);
        expect(step.choices.filter((choice) => choice.correct), step.id).toHaveLength(1);
        expect(conversationCorrectChoice(step)?.correct, step.id).toBe(true);
        for (const item of step.choices) {
          expect(choiceIds.has(item.id), "duplicate choice id " + item.id).toBe(false);
          choiceIds.add(item.id);
          expect(REGISTERS, item.id).toContain(item.register);
          expect(item.feedback.length, item.id).toBeGreaterThan(20);
        }
      }
    }
  });

  it("keeps readings, romaji, and Indonesian meanings filled in", () => {
    for (const scenario of CONVERSATIONS) {
      const lines = [
        ...scenario.steps.map((step) => step.npc),
        ...scenario.steps.flatMap((step) => step.choices),
        ...scenario.keyPhrases,
      ];
      for (const line of lines) {
        expect(line.jp.length).toBeGreaterThan(0);
        expect(line.reading.length).toBeGreaterThan(0);
        expect(line.reading).not.toMatch(/[{}|]/);
        expect(line.romaji.length).toBeGreaterThan(0);
        expect(line.meaning.length).toBeGreaterThan(0);
        expect(stripFurigana(line.jp)).not.toMatch(/[{}|]/);
      }
    }
  });

  it("provides three register-labelled key phrases per scenario", () => {
    for (const scenario of CONVERSATIONS) {
      expect(scenario.keyPhrases.length, scenario.id).toBe(3);
      for (const keyPhrase of scenario.keyPhrases) {
        expect(REGISTERS, scenario.id).toContain(keyPhrase.register);
        expect(keyPhrase.note?.length ?? 0, scenario.id).toBeGreaterThan(0);
      }
    }
  });
});
