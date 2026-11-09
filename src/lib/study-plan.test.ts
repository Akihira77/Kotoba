import { describe, expect, it } from "vitest";
import { CURRICULUM_LESSONS } from "@/content/curriculum";
import { lessonProgressPayload } from "@/lib/learning";
import { emptySnapshot } from "@/lib/progress-defaults";
import { buildStudyPlan } from "@/lib/study-plan";
import type { LessonProgress } from "@/lib/types";

const NOW = new Date(2026, 10, 8, 9, 0, 0);

function completedLessons(level: string, ratio = 1): LessonProgress[] {
  const lessons = CURRICULUM_LESSONS.filter((lesson) => lesson.level === level);
  const count = Math.ceil(lessons.length * ratio);
  return lessons.slice(0, count).map((lesson) => {
    const payload = lessonProgressPayload(lesson);
    return {
      lessonId: payload.lessonId,
      kind: payload.kind,
      score: 100,
      completedAt: NOW.toISOString(),
    };
  });
}

describe("study plan", () => {
  it("membuat rencana mingguan dari level berjalan dan target", () => {
    const snapshot = emptySnapshot();
    const plan = buildStudyPlan({ snapshot, targetLevel: "N5", weeks: 12, now: NOW });

    expect(plan.currentLevel).toBe("N5");
    expect(plan.targetLevel).toBe("N5");
    expect(plan.targetAdjusted).toBe(false);
    expect(plan.weeks).toBe(12);
    expect(plan.weeksPlan).toHaveLength(12);
    expect(plan.weeksPlan[0].startDate).toBe("2026-11-08");
    expect(plan.weeksPlan[0].endDate).toBe("2026-11-14");
    expect(plan.totalLessons).toBeGreaterThan(0);
    expect(plan.plannedLessons + plan.unplannedLessons).toBe(plan.totalLessons);
    expect(plan.weeksPlan.some((week) => week.lessons.length > 0)).toBe(true);
    expect(plan.weeksPlan[0].lessons[0]?.moduleTitle).not.toMatch(/^mod-/);
    expect(plan.milestones.some((milestone) => milestone.label === "Target N5")).toBe(true);
  });

  it("memperluas cakupan saat target lebih tinggi dari level berjalan", () => {
    const snapshot = emptySnapshot();
    const n5 = buildStudyPlan({ snapshot, targetLevel: "N5", weeks: 24, now: NOW });
    const n4 = buildStudyPlan({ snapshot, targetLevel: "N4", weeks: 24, now: NOW });

    expect(n4.totalLessons).toBeGreaterThan(n5.totalLessons);
    expect(n4.lessonMinutes).toBeGreaterThan(n5.lessonMinutes);
    expect(n4.weeksPlan[0].lessons[0]?.moduleTitle).not.toMatch(/^mod-/);
  });

  it("menyesuaikan target yang berada di bawah level berjalan", () => {
    const base = emptySnapshot();
    const snapshot = { ...base, lessons: completedLessons("N5", 1) };
    const plan = buildStudyPlan({ snapshot, targetLevel: "N5", weeks: 12, now: NOW });

    expect(plan.currentLevel).toBe("N4");
    expect(plan.targetAdjusted).toBe(true);
    expect(plan.targetLevel).toBe("N4");
    expect(plan.milestones.some((milestone) => milestone.label === "Target N5")).toBe(false);
  });

  it("menandai rencana yang terlalu sempit dan menyisakan pelajaran", () => {
    const snapshot = emptySnapshot();
    const plan = buildStudyPlan({ snapshot, targetLevel: "N4", weeks: 4, now: NOW });

    expect(plan.unplannedLessons).toBeGreaterThan(0);
    expect(["ketat", "tidak-realistis"]).toContain(plan.feasibility);
    expect(plan.recommendation).toContain("belum masuk rencana");
  });

  it("menjaga jumlah minggu dalam batas aman", () => {
    const snapshot = emptySnapshot();
    expect(buildStudyPlan({ snapshot, targetLevel: "N5", weeks: 1, now: NOW }).weeks).toBe(4);
    expect(buildStudyPlan({ snapshot, targetLevel: "N5", weeks: 999, now: NOW }).weeks).toBe(104);
  });
});
