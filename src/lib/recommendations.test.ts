import { describe, expect, it } from "vitest";
import { CURRICULUM_LESSONS } from "@/content/curriculum";
import { lessonProgressId, lessonProgressKind } from "@/lib/learning";
import { emptySnapshot } from "@/lib/progress-defaults";
import { buildRecommendations } from "@/lib/recommendations";
import type { CardProgress, ExamAttempt, ProgressSnapshot, QuestionStat } from "@/lib/types";

const NOW = new Date(2026, 10, 8, 12, 0, 0).getTime();
const NOW_ISO = new Date(NOW).toISOString();

function stat(questionId: string, attempts: number, wrong: number): QuestionStat {
  const correct = attempts - wrong;
  return {
    questionId,
    attempts,
    correct,
    wrong,
    accuracy: Math.round((correct / attempts) * 100),
    lastResult: wrong > 0 ? "wrong" : "correct",
    lastAttemptAt: NOW_ISO,
    averageTimeMs: 4000,
  };
}

function dueCard(): CardProgress {
  return {
    itemId: "v-ohayou",
    kind: "vocab",
    ease: 2.5,
    intervalDays: 1,
    dueAt: new Date(2026, 10, 6, 9).toISOString(),
    reps: 2,
    lapses: 0,
    lastRating: 3,
    lastReviewedAt: new Date(2026, 10, 5, 9).toISOString(),
  };
}

function exam(): ExamAttempt {
  return {
    id: "exam-1",
    level: "N5",
    score: 60,
    total: 100,
    passed: false,
    sections: [
      { id: "moji-goi", label: "Moji & Goi", correct: 8, total: 10, score: 80, points: 10 },
      { id: "bunpou", label: "Bunpou & Dokkai", correct: 3, total: 10, score: 30, points: 10 },
    ],
    correct: 11,
    answered: 20,
    totalQuestions: 20,
    durationSec: 600,
    startedAt: NOW_ISO,
    finishedAt: NOW_ISO,
    review: [],
  };
}

describe("personalized recommendations", () => {
  it("menjelaskan bukti kartu jatuh tempo dan mengutamakannya", () => {
    const base = emptySnapshot();
    const recommendations = buildRecommendations(
      { ...base, cards: [dueCard()] },
      { now: NOW, limit: 3 },
    );
    expect(recommendations[0].kind).toBe("due");
    expect(recommendations[0].priority).toBe(100);
    expect(recommendations[0].evidence).toContain("1 kosakata");
    expect(recommendations[0].evidence).toContain("tertua sejak");
    expect(recommendations[0].href).toBe("/vocabulary?tab=review");
  });

  it("mendeteksi kosakata lemah dari statistik soal nyata", () => {
    const base = emptySnapshot();
    const snapshot: ProgressSnapshot = {
      ...base,
      questionStats: [stat("ex-vocab-meaning-v-ohayou", 4, 3)],
    };
    const recommendations = buildRecommendations(snapshot, { now: NOW, limit: 5 });
    const weak = recommendations.find((item) => item.kind === "vocabulary");
    expect(weak).toBeDefined();
    expect(weak?.evidence).toContain("25% benar dari 4 percobaan");
    expect(weak?.href).toContain("/vocabulary?search=");
  });

  it("mendeteksi pola tata bahasa dengan akurasi rendah", () => {
    const base = emptySnapshot();
    const snapshot: ProgressSnapshot = {
      ...base,
      questionStats: [stat("g-desu-ex1", 4, 4)],
    };
    const recommendations = buildRecommendations(snapshot, { now: NOW, limit: 5 });
    const grammar = recommendations.find((item) => item.kind === "grammar");
    expect(grammar?.title).toContain("です");
    expect(grammar?.href).toBe("/grammar/g-desu");
    expect(grammar?.evidence).toContain("0% (4 salah dari 4)");
  });

  it("menyarankan ulang pelajaran berskor rendah berdasarkan judul kurikulum", () => {
    const base = emptySnapshot();
    const snapshot: ProgressSnapshot = {
      ...base,
      lessons: [{ lessonId: "g-desu", kind: "grammar", score: 50, completedAt: NOW_ISO }],
    };
    const recommendations = buildRecommendations(snapshot, { now: NOW, limit: 5 });
    const lesson = recommendations.find((item) => item.kind === "lesson");
    expect(lesson?.title).toContain("Ulangi pelajaran");
    expect(lesson?.evidence).toContain("50%");
    expect(lesson?.href?.startsWith("/learn/")).toBe(true);
  });

  it("menyoroti bagian ujian terlemah dan selalu menyertakan langkah berikutnya", () => {
    const base = emptySnapshot();
    const recommendations = buildRecommendations(
      { ...base, exams: [exam()] },
      { now: NOW, limit: 5 },
    );
    const examRecommendation = recommendations.find((item) => item.kind === "exam");
    expect(examRecommendation?.title).toContain("Bunpou & Dokkai");
    expect(examRecommendation?.evidence).toContain("3/10 benar");

    const next = recommendations.find((item) => item.kind === "next");
    expect(next).toBeDefined();
    expect(next?.href?.startsWith("/learn/")).toBe(true);
    expect(next?.evidence).toContain("menit");
  });

  it("mengembalikan saran perawatan saat tidak ada sinyal masalah", () => {
    const base = emptySnapshot();
    const snapshot: ProgressSnapshot = {
      ...base,
      profile: { ...base.profile, settings: { ...base.profile.settings, dailyGoalXp: 0 } },
      lessons: CURRICULUM_LESSONS.map((lesson) => ({
        lessonId: lessonProgressId(lesson),
        kind: lessonProgressKind(lesson),
        score: 100,
        completedAt: NOW_ISO,
      })),
    };
    const recommendations = buildRecommendations(snapshot, { now: NOW, limit: 1 });
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].id).toBe("maintenance");
    expect(recommendations[0].reason.length).toBeGreaterThan(20);
  });
});
