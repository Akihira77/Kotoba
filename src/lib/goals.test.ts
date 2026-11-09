import { describe, expect, it } from "vitest";
import { goalProgress, weeklyGoal } from "@/lib/goals";
import { emptySnapshot } from "@/lib/progress-defaults";
import type { ProgressSnapshot, ReviewLog } from "@/lib/types";

const TODAY = "2026-11-08"; // Minggu, 8 November 2026 (waktu lokal)

function localIso(month: number, day: number, hour = 9): string {
  return new Date(2026, month - 1, day, hour, 0, 0).toISOString();
}

function review(id: string, itemId: string, day: number): ReviewLog {
  return {
    id,
    itemId,
    kind: "vocab",
    rating: 3,
    correct: true,
    mode: "test",
    createdAt: localIso(11, day),
  };
}

function snapshot(): ProgressSnapshot {
  const base = emptySnapshot();
  return {
    ...base,
    profile: {
      ...base.profile,
      settings: {
        ...base.profile.settings,
        dailyGoalXp: 50,
        dailyStudyMinutes: 30,
        dailyVocabTarget: 2,
        dailyLessonTarget: 1,
        weeklyFrequency: 3,
      },
    },
    activity: [
      { date: "2026-11-02", xp: 20, reviews: 4, minutes: 10 },
      { date: "2026-11-08", xp: 40, reviews: 2, minutes: 20 },
    ],
    reviews: [
      review("r1", "v-ohayou", 8),
      review("r2", "v-ohayou", 8),
      review("r3", "v-konnichiwa", 8),
      review("r4", "v-arigatou", 7),
    ],
    lessons: [
      { lessonId: "g-desu", kind: "grammar", score: 100, completedAt: localIso(11, 8) },
      { lessonId: "g-wa", kind: "grammar", score: 100, completedAt: localIso(11, 7) },
    ],
  };
}

describe("daily goals", () => {
  it("menghitung target harian dari aktivitas, ulasan, dan pelajaran tersimpan", () => {
    const progress = goalProgress(snapshot(), TODAY);
    expect(progress.date).toBe(TODAY);

    const minutes = progress.items.find((item) => item.id === "minutes");
    const vocab = progress.items.find((item) => item.id === "vocab");
    const lessons = progress.items.find((item) => item.id === "lessons");
    const xp = progress.items.find((item) => item.id === "xp");

    expect(minutes).toMatchObject({ current: 20, target: 30, done: false });
    expect(vocab).toMatchObject({ current: 2, target: 2, done: true });
    expect(lessons).toMatchObject({ current: 1, target: 1, done: true });
    expect(xp).toMatchObject({ current: 40, target: 50, done: false });
    expect(progress.completed).toBe(2);
    expect(progress.percent).toBe(50);
  });

  it("menghitung frekuensi mingguan dari hari aktif dengan minggu mulai Senin", () => {
    const weekly = weeklyGoal(snapshot(), TODAY);
    expect(weekly.days.map((day) => day.date)).toEqual([
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
      "2026-11-08",
    ]);
    expect(weekly.activeDays).toBe(2);
    expect(weekly.target).toBe(3);
    expect(weekly.done).toBe(false);
    expect(weekly.percent).toBe(67);
  });

  it("tidak mengarang progres saat data masih kosong", () => {
    const progress = goalProgress(emptySnapshot(), TODAY);
    expect(progress.items.every((item) => item.current === 0)).toBe(true);
    expect(progress.completed).toBe(0);
    expect(progress.weekly.activeDays).toBe(0);
  });
});
