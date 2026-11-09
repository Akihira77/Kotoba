import { describe, expect, it } from "vitest";
import { STORY_BY_ID, STORY_LINE_TOTAL, STORY_SCENE_TOTAL, STORY_TOTAL, STORIES } from "./stories";
import { VOCAB_BY_ID } from "./vocabulary";
import { GRAMMAR_BY_ID } from "./grammar";
import { furiganaReading } from "@/lib/furigana";

describe("stories", () => {
  it("has the expected original story volume", () => {
    expect(STORY_TOTAL).toBe(3);
    expect(STORY_SCENE_TOTAL).toBe(9);
    expect(STORY_LINE_TOTAL).toBe(36);
    expect(STORY_BY_ID.size).toBe(3);
    for (const story of STORIES) {
      expect(story.scenes).toHaveLength(3);
      expect(story.characters.length).toBeGreaterThanOrEqual(2);
      expect(story.scenes.reduce((sum, scene) => sum + scene.lines.length, 0)).toBe(12);
      expect(story.questions).toHaveLength(3);
      expect(story.questions.some((question) => question.kind === "listening")).toBe(true);
    }
  });

  it("keeps every story and line identifier unique", () => {
    const storyIds = new Set<string>();
    const lineIds = new Set<string>();
    const sceneIds = new Set<string>();
    const questionIds = new Set<string>();
    for (const story of STORIES) {
      expect(storyIds.has(story.id)).toBe(false);
      storyIds.add(story.id);
      for (const scene of story.scenes) {
        expect(sceneIds.has(scene.id)).toBe(false);
        sceneIds.add(scene.id);
        for (const line of scene.lines) {
          expect(lineIds.has(line.id)).toBe(false);
          lineIds.add(line.id);
        }
      }
      for (const question of story.questions) {
        expect(questionIds.has(question.id)).toBe(false);
        questionIds.add(question.id);
      }
    }
  });

  it("has readings that match the furigana markup", () => {
    for (const story of STORIES) {
      for (const scene of story.scenes) {
        for (const line of scene.lines) {
          expect(furiganaReading(line.jp)).toBe(line.reading);
          expect(line.romaji.trim().length).toBeGreaterThan(0);
          expect(line.meaning.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("only references real vocabulary and grammar", () => {
    for (const story of STORIES) {
      for (const id of story.vocabIds) {
        expect(VOCAB_BY_ID.has(id), id).toBe(true);
      }
      for (const id of story.grammarIds) {
        expect(GRAMMAR_BY_ID.has(id), id).toBe(true);
      }
      for (const scene of story.scenes) {
        for (const line of scene.lines) {
          for (const id of line.vocabIds ?? []) {
            expect(VOCAB_BY_ID.has(id), id).toBe(true);
          }
          for (const id of line.grammarIds ?? []) {
            expect(GRAMMAR_BY_ID.has(id), id).toBe(true);
          }
        }
      }
    }
  });

  it("has valid speakers and stage characters", () => {
    const stagePositions = new Set(["far-left", "left", "center", "right", "far-right"]);
    for (const story of STORIES) {
      const characterIds = new Set(story.characters.map((character) => character.id));
      for (const scene of story.scenes) {
        for (const staged of scene.characters) {
          expect(characterIds.has(staged.characterId), staged.characterId).toBe(true);
          expect(stagePositions.has(staged.position), staged.position).toBe(true);
        }
        for (const line of scene.lines) {
          expect(characterIds.has(line.speakerId), line.speakerId).toBe(true);
        }
      }
    }
  });

  it("has well-formed quiz questions", () => {
    for (const story of STORIES) {
      for (const question of story.questions) {
        expect(question.options.length).toBeGreaterThanOrEqual(3);
        expect(question.answerIndex).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex).toBeLessThan(question.options.length);
        expect(question.prompt.length).toBeGreaterThan(0);
        expect(question.explanation.length).toBeGreaterThan(0);
        if (question.kind === "listening") {
          expect(question.audioText?.length ?? 0).toBeGreaterThan(0);
        }
      }
    }
  });
});
