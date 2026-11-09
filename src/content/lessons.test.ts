import { describe, expect, it } from "vitest";
import {
  getLessonPlan,
  hasLessonPlan,
  LESSON_PLANS,
  LESSON_PLAN_BY_ID,
  lessonPlanForSource,
  N5_PATH_MODULES,
  PLANNED_LESSON_COUNT,
} from "./lessons";
import { CURRICULUM_LESSONS } from "./curriculum";
import { KANJI_BY_ID } from "./kanji";
import { VOCAB_BY_ID } from "./vocabulary";
import { HIRAGANA, KATAKANA } from "./kana";
import { SENTENCES } from "./sentences";
import type { LessonPlan } from "@/lib/types";

function assertQuestion(plan: LessonPlan) {
  for (const question of plan.practice) {
    const sourcePrefix = plan.sourceId ? plan.sourceId + "-" : null;
    expect(
      question.id.startsWith(plan.id + "-") || (sourcePrefix !== null && question.id.startsWith(sourcePrefix)),
      question.id,
    ).toBe(true);
    expect(question.prompt.length, question.id).toBeGreaterThan(0);
    expect(question.options.length, question.id).toBeGreaterThanOrEqual(3);
    expect(new Set(question.options).size, question.id).toBe(question.options.length);
    expect(question.answerIndex, question.id).toBeGreaterThanOrEqual(0);
    expect(question.answerIndex, question.id).toBeLessThan(question.options.length);
    expect(question.explanation.length, question.id).toBeGreaterThan(0);
    for (const option of question.options) expect(option.length, question.id).toBeGreaterThan(0);
  }
}

describe("interactive lesson plans", () => {
  it("ships the planned N5 curriculum volume", () => {
    expect(PLANNED_LESSON_COUNT).toBe(70);
    expect(LESSON_PLANS).toHaveLength(70);
    expect(new Set(LESSON_PLANS.map((plan) => plan.id)).size).toBe(LESSON_PLANS.length);
    expect(LESSON_PLANS.filter((plan) => plan.id.startsWith("les-kana-"))).toHaveLength(8);
    expect(LESSON_PLANS.filter((plan) => plan.id.startsWith("les-vocab-"))).toHaveLength(20);
    expect(LESSON_PLANS.filter((plan) => plan.id.startsWith("les-kanji-"))).toHaveLength(6);
    expect(LESSON_PLANS.filter((plan) => plan.id.startsWith("les-grammar-"))).toHaveLength(20);
    expect(LESSON_PLANS.filter((plan) => plan.id.startsWith("les-sentence-"))).toHaveLength(8);
    expect(LESSON_PLANS.filter((plan) => plan.id.startsWith("les-reading-"))).toHaveLength(4);
    expect(LESSON_PLANS.filter((plan) => plan.id.startsWith("les-listening-"))).toHaveLength(4);
  });

  it("keeps every plan structurally complete", () => {
    for (const plan of LESSON_PLANS) {
      expect(plan.title.length, plan.id).toBeGreaterThan(0);
      expect(plan.summary.length, plan.id).toBeGreaterThan(0);
      expect(plan.estimateMinutes, plan.id).toBeGreaterThan(0);
      expect(plan.goals.length, plan.id).toBeGreaterThanOrEqual(3);
      expect(plan.intro.length, plan.id).toBeGreaterThanOrEqual(2);
      expect(plan.explanation.length, plan.id).toBeGreaterThanOrEqual(2);
      expect(plan.examples.length, plan.id).toBeGreaterThanOrEqual(1);
      expect(plan.notes.length, plan.id).toBeGreaterThanOrEqual(2);
      expect(plan.practice.length, plan.id).toBeGreaterThanOrEqual(2);
      assertQuestion(plan);
    }
  });

  it("resolves every reference used by lesson blocks", () => {
    for (const plan of LESSON_PLANS) {
      for (const block of plan.explanation) {
        if (block.type === "table") {
          for (const row of block.rows) {
            expect(row.cells.length, plan.id).toBe(block.columns.length - 1);
          }
        }
        if (block.type === "vocab-list") {
          for (const id of block.wordIds) expect(VOCAB_BY_ID.get(id), id).toBeTruthy();
        }
        if (block.type === "kanji-list") {
          for (const id of block.kanjiIds) expect(KANJI_BY_ID.get(id), id).toBeTruthy();
        }
        if (block.type === "kana-grid") {
          const source = block.script === "hiragana" ? HIRAGANA : KATAKANA;
          const chars = new Set(source.map((item) => item.char));
          for (const char of block.chars) expect(chars.has(char), plan.id + " " + char).toBe(true);
        }
      }
      for (const example of plan.examples) {
        expect(example.jp.length, plan.id).toBeGreaterThan(0);
        expect(example.meaning.length, plan.id).toBeGreaterThan(0);
      }
      for (const note of plan.notes) {
        expect(note.title.length, plan.id).toBeGreaterThan(0);
        expect(note.body.length, plan.id).toBeGreaterThan(0);
      }
    }
  });

  it("maps every planned lesson into the generated catalog", () => {
    const plannedCatalog = CURRICULUM_LESSONS.filter((lesson) => hasLessonPlan(lesson.id));
    expect(plannedCatalog).toHaveLength(70);
    expect(plannedCatalog.every((lesson) => lesson.level === "N5")).toBe(true);
    expect(plannedCatalog.every((lesson) => lesson.interactive === true)).toBe(true);
    expect(CURRICULUM_LESSONS.filter((lesson) => lesson.interactive)).toHaveLength(70);

    for (const plan of LESSON_PLANS) {
      const catalogLesson = CURRICULUM_LESSONS.find((lesson) => lesson.id === plan.id);
      expect(catalogLesson, plan.id).toBeTruthy();
      expect(catalogLesson?.title).toBe(plan.title);
      expect(catalogLesson?.href).toBe("/learn/" + plan.id);
      expect((catalogLesson?.contentRefs.length ?? 0) > 0, plan.id).toBe(true);
      if (plan.id.startsWith("les-sentence-")) {
        expect(catalogLesson?.contentRefs).toHaveLength(1);
      }
      expect(getLessonPlan(plan.id)).toBe(plan);
      expect(LESSON_PLAN_BY_ID.get(plan.id)).toBe(plan);
    }

    const plannedIds = new Set(LESSON_PLANS.map((plan) => plan.id));
    for (const lesson of CURRICULUM_LESSONS) {
      expect(hasLessonPlan(lesson.id)).toBe(plannedIds.has(lesson.id));
    }
  });

  it("describes eight N5 paths that cover all planned lessons without duplicates", () => {
    expect(N5_PATH_MODULES).toHaveLength(8);
    const ids = N5_PATH_MODULES.flatMap((module) => module.lessonIds);
    expect(ids).toHaveLength(70);
    expect(new Set(ids).size).toBe(70);
    expect(new Set(ids)).toEqual(new Set(LESSON_PLANS.map((plan) => plan.id)));
    for (const path of N5_PATH_MODULES) {
      expect(path.title.length, path.id).toBeGreaterThan(0);
      expect(path.lessonIds.length, path.id).toBeGreaterThan(0);
    }
  });

  it("splits N5 sentence construction into one lesson per source item", () => {
    const sentencePlans = LESSON_PLANS.filter((plan) => plan.id.startsWith("les-sentence-"));
    const sentenceLessons = CURRICULUM_LESSONS.filter((lesson) => lesson.kind === "sentence" && lesson.level === "N5");
    expect(sentenceLessons).toHaveLength(8);
    expect(sentencePlans).toHaveLength(8);
    expect(new Set(sentenceLessons.flatMap((lesson) => lesson.contentRefs.map((ref) => ref.id)))).toEqual(
      new Set(SENTENCES.filter((item) => item.level === "N5").map((item) => item.id)),
    );

    for (const plan of sentencePlans) {
      expect(plan.sourceId, plan.id).toBeTruthy();
      expect(SENTENCES.some((item) => item.id === plan.sourceId), plan.id).toBe(true);
      expect(lessonPlanForSource(plan.sourceId ?? ""), plan.id).toBe(plan);
    }
  });

  it("does not invent plans for levels above N5 yet", () => {
    for (const lesson of CURRICULUM_LESSONS) {
      if (lesson.level !== "N5") expect(hasLessonPlan(lesson.id), lesson.id).toBe(false);
    }
  });
});
