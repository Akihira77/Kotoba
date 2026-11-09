import { describe, expect, it } from "vitest";
import {
  COURSE_ID,
  CURRICULUM,
  CURRICULUM_LESSONS,
  CURRICULUM_MODULES,
  CURRICULUM_STATS,
  getLesson,
  getLessonsByLevel,
  MODULE_BY_ID,
} from "./curriculum";
import { validateCurriculum } from "@/lib/content-validation";
import { ALL_KANA } from "./kana";
import { VOCABULARY } from "./vocabulary";
import { KANJI } from "./kanji";
import { GRAMMAR } from "./grammar";
import { READING } from "./reading";
import { LISTENING } from "./listening";
import { CULTURE } from "./culture";
import { SENTENCES } from "./sentences";
import type { ContentKind } from "@/lib/types";

describe("generated curriculum", () => {
  it("builds one course from the real content catalog", () => {
    expect(CURRICULUM.id).toBe(COURSE_ID);
    expect(CURRICULUM.levels).toEqual(["N5", "N4", "N3", "N2", "N1"]);
    expect(CURRICULUM_MODULES.length).toBeGreaterThan(0);
    expect(CURRICULUM_LESSONS.length).toBeGreaterThan(100);
    expect(CURRICULUM_STATS.modules).toBe(CURRICULUM_MODULES.length);
    expect(CURRICULUM_STATS.lessons).toBe(CURRICULUM_LESSONS.length);
    expect(CURRICULUM_STATS.contentRefs).toBe(
      CURRICULUM_LESSONS.reduce((total, lesson) => total + lesson.contentRefs.length, 0),
    );
  });

  it("keeps module and lesson ids unique and ordered", () => {
    expect(new Set(CURRICULUM_MODULES.map((module) => module.id)).size).toBe(
      CURRICULUM_MODULES.length,
    );
    expect(new Set(CURRICULUM_LESSONS.map((lesson) => lesson.id)).size).toBe(
      CURRICULUM_LESSONS.length,
    );
    expect(CURRICULUM_MODULES.map((courseModule) => courseModule.order)).toEqual(
      CURRICULUM_MODULES.map((_, index) => index + 1),
    );

    for (const courseModule of CURRICULUM_MODULES) {
      expect(MODULE_BY_ID.get(courseModule.id)).toBe(courseModule);
      expect(courseModule.lessons.map((lesson) => lesson.order)).toEqual(
        courseModule.lessons.map((_, index) => index + 1),
      );
      for (const lesson of courseModule.lessons) {
        expect(lesson.moduleId).toBe(courseModule.id);
        expect(lesson.kind).toBe(courseModule.kind);
        expect(lesson.estimateMinutes).toBeGreaterThan(0);
        expect(lesson.objectives.length).toBeGreaterThan(0);
        expect(lesson.href.startsWith("/")).toBe(true);
      }
    }
  });

  it("references only existing content and covers the whole catalog", () => {
    expect(validateCurriculum()).toEqual([]);

    const counts = new Map<ContentKind, number>();
    for (const lesson of CURRICULUM_LESSONS) {
      for (const ref of lesson.contentRefs) {
        counts.set(ref.kind, (counts.get(ref.kind) ?? 0) + 1);
      }
    }

    expect(counts.get("kana")).toBe(ALL_KANA.length);
    expect(counts.get("vocabulary")).toBe(VOCABULARY.length);
    expect(counts.get("kanji")).toBe(KANJI.length);
    expect(counts.get("grammar")).toBe(GRAMMAR.length);
    expect(counts.get("reading")).toBe(READING.length);
    expect(counts.get("listening")).toBe(LISTENING.length);
    expect(counts.get("culture")).toBe(CULTURE.length);
    expect(counts.get("sentence")).toBe(SENTENCES.length);
  });

  it("provides lookup helpers and level filters", () => {
    const first = CURRICULUM_LESSONS[0];
    expect(getLesson(first.id)).toBe(first);
    expect(getLesson("lesson-yang-tidak-ada")).toBeUndefined();
    expect(getLessonsByLevel("N5").length).toBeGreaterThan(0);
    expect(getLessonsByLevel("N1").length).toBeGreaterThan(0);
  });

  it("links lessons to internal routes for direct practice", () => {
    for (const lesson of CURRICULUM_LESSONS) {
      expect(lesson.href.startsWith("/")).toBe(true);
      for (const ref of lesson.contentRefs) {
        expect(ref.href?.startsWith("/")).toBe(true);
      }
    }
  });
});
