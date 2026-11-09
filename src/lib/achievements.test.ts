import { describe, expect, it } from "vitest";
import { buildAchievements, recentAchievements } from "@/lib/achievements";
import { HIRAGANA } from "@/content/kana";
import { emptySnapshot } from "@/lib/progress-defaults";
import type { CardProgress, KanaProgress, QuizAttempt } from "@/lib/types";

const EXPECTED_IDS = [
  "first-review",
  "first-lesson",
  "vocab-50",
  "vocab-100",
  "hiragana-master",
  "katakana-master",
  "first-exam",
  "perfect-quiz",
  "kanji-50",
  "streak-3",
  "streak-7",
  "reviews-100",
  "xp-500",
  "exam-pass",
  "cards-100",
  "kana-46",
  "study-300",
  "level-5",
  "first-game",
  "games-25",
  "game-correct-100",
  "writing-first",
  "writing-20",
  "story-first",
  "story-3",
];

function card(itemId: string, kind: "vocab" | "kanji", reps = 1): CardProgress {
  return {
    itemId,
    kind,
    ease: 2.5,
    intervalDays: 1,
    dueAt: "2026-01-02T00:00:00.000Z",
    reps,
    lapses: 0,
    lastRating: 3,
    lastReviewedAt: "2026-01-01T00:00:00.000Z",
  };
}

function masteredKana(): KanaProgress[] {
  return HIRAGANA.filter((item) => item.group === "basic").map((item) => ({
    char: item.char,
    script: "hiragana",
    correct: 5,
    wrong: 0,
    mastery: 4,
    lastSeen: "2026-01-01T00:00:00.000Z",
  }));
}

function perfectQuiz(): QuizAttempt {
  return {
    id: "quiz-1",
    mode: "practice",
    title: "Kuis sempurna",
    level: "N5",
    total: 5,
    correct: 5,
    score: 100,
    durationSec: 40,
    startedAt: "2026-01-01T00:00:00.000Z",
    finishedAt: "2026-01-01T00:01:00.000Z",
    answers: [],
  };
}

describe("achievements", () => {
  it("mendefinisikan dua puluh lima pencapaian yang dipakai bersama", () => {
    const achievements = buildAchievements(emptySnapshot());
    expect(achievements).toHaveLength(EXPECTED_IDS.length);
    expect(achievements.map((item) => item.id)).toEqual(EXPECTED_IDS);
    expect(new Set(EXPECTED_IDS).size).toBe(EXPECTED_IDS.length);
  });

  it("membuka pencapaian pelajaran pertama, kuis sempurna, dan hiragana master", () => {
    const snapshot = emptySnapshot();
    const unlocked = buildAchievements({
      ...snapshot,
      lessons: [{ lessonId: "g-desu", kind: "grammar", score: 100, completedAt: "2026-01-01T00:00:00.000Z" }],
      quizAttempts: [perfectQuiz()],
      kana: masteredKana(),
    }).filter((achievement) => achievement.unlocked);
    expect(unlocked.map((item) => item.id)).toEqual(
      expect.arrayContaining(["first-lesson", "perfect-quiz", "hiragana-master"]),
    );
  });

  it("membuka tonggak 100 kosakata dan 50 kanji dari kartu yang benar-benar diulas", () => {
    const snapshot = emptySnapshot();
    const cards = [
      ...Array.from({ length: 100 }, (_, index) => card("v-" + index, "vocab")),
      ...Array.from({ length: 50 }, (_, index) => card("k-" + index, "kanji")),
    ];
    const achievements = buildAchievements({ ...snapshot, cards });
    expect(achievements.find((item) => item.id === "vocab-100")?.unlocked).toBe(true);
    expect(achievements.find((item) => item.id === "kanji-50")?.unlocked).toBe(true);
  });

  it("membuka pencapaian menulis pertama dan dua puluh karakter dikuasai", () => {
    const snapshot = emptySnapshot();
    const achievements = buildAchievements({
      ...snapshot,
      stats: { ...snapshot.stats, writingAttempts: 1, writingMastered: 20 },
    });
    expect(achievements.find((item) => item.id === "writing-first")?.unlocked).toBe(true);
    expect(achievements.find((item) => item.id === "writing-20")?.unlocked).toBe(true);
  });

  it("membuka pencapaian cerita pertama dan tiga cerita selesai", () => {
    const snapshot = emptySnapshot();
    const achievements = buildAchievements({
      ...snapshot,
      stats: { ...snapshot.stats, storyAttempts: 1, storiesCompleted: 3 },
    });
    expect(achievements.find((item) => item.id === "story-first")?.unlocked).toBe(true);
    expect(achievements.find((item) => item.id === "story-3")?.unlocked).toBe(true);
  });

  it("menempatkan pencapaian terbuka sebelum yang terkunci", () => {
    const snapshot = emptySnapshot();
    const recent = recentAchievements(
      {
        ...snapshot,
        cards: [card("v-n5-ohayou", "vocab")],
        stats: { ...snapshot.stats, totalReviews: 1 },
      },
      3,
    );
    expect(recent[0].id).toBe("first-review");
    expect(recent[0].unlocked).toBe(true);
    expect(recent.slice(1).every((item) => !item.unlocked)).toBe(true);
  });

  it("mempertahankan urutan definisi saat semua masih terkunci", () => {
    expect(recentAchievements(emptySnapshot(), 3).map((item) => item.id)).toEqual([
      "first-review",
      "first-lesson",
      "vocab-50",
    ]);
  });
});
