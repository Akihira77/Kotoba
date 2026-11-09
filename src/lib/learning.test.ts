import { describe, expect, it } from "vitest";
import { CURRICULUM_LESSONS, LESSON_BY_ID } from "@/content/curriculum";
import { emptySnapshot } from "@/lib/progress-defaults";
import type { Lesson, LessonProgress, ProgressSnapshot } from "@/lib/types";
import {
  LEVEL_UNLOCK_RATIO,
  continueLessons,
  countCompletedCatalogLessons,
  currentJlptLevel,
  isLessonComplete,
  lastCompletedCatalogLesson,
  lessonForProgressId,
  lessonProgressFor,
  lessonProgressId,
  lessonProgressKind,
  levelCompletion,
  recommendedLesson,
} from "./learning";

function completeLesson(lesson: Lesson, completedAt = "2026-01-01T08:00:00.000Z"): LessonProgress {
  return {
    lessonId: lessonProgressId(lesson),
    kind: lessonProgressKind(lesson),
    score: null,
    completedAt,
  };
}

function snapshotWith(lessons: LessonProgress[]): ProgressSnapshot {
  return { ...emptySnapshot(), lessons };
}

describe("catalog progress mapping", () => {
  it("memetakan kana dan materi ke id yang dipakai halaman materi", () => {
    const kana = LESSON_BY_ID.get("les-kana-hiragana-basic");
    const grammar = CURRICULUM_LESSONS.find((lesson) => lesson.kind === "grammar");
    const vocabulary = CURRICULUM_LESSONS.find((lesson) => lesson.kind === "vocabulary");
    const culture = CURRICULUM_LESSONS.find((lesson) => lesson.kind === "culture");

    expect(kana).toBeDefined();
    expect(kana ? lessonProgressId(kana) : "").toBe("kana-hiragana-basic");
    expect(kana ? lessonProgressKind(kana) : "").toBe("kana-set");
    expect(grammar).toBeDefined();
    expect(grammar ? lessonProgressId(grammar) : "").toBe(grammar?.contentRefs[0]?.id);
    expect(grammar ? lessonProgressKind(grammar) : "").toBe("grammar");
    expect(vocabulary).toBeDefined();
    expect(vocabulary ? lessonProgressId(vocabulary) : "").toBe(vocabulary?.id);
    expect(vocabulary ? lessonProgressKind(vocabulary) : "").toBe("vocabulary");
    expect(culture).toBeDefined();
    expect(culture ? lessonProgressId(culture) : "").toBe(culture?.contentRefs[0]?.id);
  });

  it("memastikan setiap lesson katalog punya id progres yang unik", () => {
    const ids = CURRICULUM_LESSONS.map((lesson) => lessonProgressId(lesson));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("menandai lesson selesai hanya ketika id dan jenisnya tersimpan", () => {
    const grammar = CURRICULUM_LESSONS.find((lesson) => lesson.kind === "grammar");
    expect(grammar).toBeDefined();
    if (!grammar) return;

    const snapshot = snapshotWith([completeLesson(grammar)]);
    expect(isLessonComplete(snapshot, grammar)).toBe(true);
    expect(lessonProgressFor(snapshot, grammar)?.kind).toBe("grammar");
    expect(lessonForProgressId(lessonProgressId(grammar))?.id).toBe(grammar.id);
    expect(countCompletedCatalogLessons(snapshot)).toBe(1);

    const other = CURRICULUM_LESSONS.find(
      (lesson) => lesson.kind === "grammar" && lesson.id !== grammar.id,
    );
    expect(other).toBeDefined();
    if (other) expect(isLessonComplete(snapshot, other)).toBe(false);
  });

  it("mengabaikan id progres yang tidak ada di katalog saat menghitung", () => {
    const snapshot = snapshotWith([
      { lessonId: "unknown-lesson", kind: "grammar", score: null, completedAt: "2026-01-01T08:00:00.000Z" },
    ]);
    expect(countCompletedCatalogLessons(snapshot)).toBe(0);
    expect(lessonForProgressId("unknown-lesson")).toBeUndefined();
  });
});

describe("level completion and recommendations", () => {
  it("memulai di N5 dengan progres kosong", () => {
    const snapshot = emptySnapshot();
    expect(currentJlptLevel(snapshot)).toBe("N5");
    expect(levelCompletion(snapshot, "N5").completed).toBe(0);
    expect(recommendedLesson(snapshot)?.level).toBe("N5");
  });

  it("naik level setelah 60% lesson level berjalan selesai", () => {
    const n5Lessons = CURRICULUM_LESSONS.filter((lesson) => lesson.level === "N5");
    const needed = Math.ceil(n5Lessons.length * LEVEL_UNLOCK_RATIO);
    const snapshot = snapshotWith(n5Lessons.slice(0, needed).map((lesson) => completeLesson(lesson)));

    const completion = levelCompletion(snapshot, "N5");
    expect(completion.completed).toBe(needed);
    expect(completion.percent).toBe(Math.round((needed / n5Lessons.length) * 100));
    expect(currentJlptLevel(snapshot)).toBe("N4");
  });

  it("meneruskan lesson setelah lesson terakhir yang selesai", () => {
    const n5Lessons = CURRICULUM_LESSONS.filter((lesson) => lesson.level === "N5");
    expect(n5Lessons.length).toBeGreaterThan(3);
    const snapshot = snapshotWith([completeLesson(n5Lessons[0])]);

    const next = continueLessons(snapshot, 2);
    expect(next.map((lesson) => lesson.id)).toEqual([n5Lessons[1].id, n5Lessons[2].id]);
  });

  it("memilih lesson yang belum selesai sebagai rekomendasi", () => {
    const n5Lessons = CURRICULUM_LESSONS.filter((lesson) => lesson.level === "N5");
    const snapshot = snapshotWith([completeLesson(n5Lessons[0])]);
    expect(recommendedLesson(snapshot)?.id).toBe(n5Lessons[1].id);
  });

  it("mengambil lesson terakhir yang selesai berdasarkan waktu", () => {
    const n5Lessons = CURRICULUM_LESSONS.filter((lesson) => lesson.level === "N5");
    const snapshot = snapshotWith([
      completeLesson(n5Lessons[0], "2026-01-01T08:00:00.000Z"),
      completeLesson(n5Lessons[1], "2026-01-02T08:00:00.000Z"),
    ]);
    expect(lastCompletedCatalogLesson(snapshot)?.lesson.id).toBe(n5Lessons[1].id);
  });
});
