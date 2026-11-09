import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { GameAttemptPayload, QuizAttemptPayload } from "../lib/types";

type ProgressService = typeof import("./progress-service");

let directory = "";
let service: ProgressService;

beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), "kotoba-test-"));
  process.env.KOTOBA_DB_PATH = join(directory, "kotoba-test.db");
  service = await import("./progress-service");
});

afterAll(() => {
  try {
    rmSync(directory, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors on read-only or locked files
  }
});

describe("progress service persistence", () => {
  it("starts with a default profile and empty progress", () => {
    const snapshot = service.getSnapshot();
    expect(snapshot.profile.name.length).toBeGreaterThan(0);
    expect(snapshot.profile.xp).toBe(0);
    expect(snapshot.cards).toEqual([]);
    expect(snapshot.favorites).toEqual([]);
    expect(snapshot.stats.totalReviews).toBe(0);
  });

  it("adds catalog cards idempotently without awarding XP", () => {
    const before = service.getSnapshot();
    expect(before.cards).toHaveLength(0);
    expect(before.profile.xp).toBe(0);

    service.addCard({ itemId: "v-ohayou", kind: "vocab" });
    let snapshot = service.getSnapshot();
    expect(snapshot.cards).toHaveLength(1);
    expect(snapshot.cards[0].itemId).toBe("v-ohayou");
    expect(snapshot.cards[0].kind).toBe("vocab");
    expect(snapshot.profile.xp).toBe(0);

    service.addCard({ itemId: "v-ohayou", kind: "vocab" });
    snapshot = service.getSnapshot();
    expect(snapshot.cards).toHaveLength(1);
    expect(snapshot.profile.xp).toBe(0);

    expect(() => service.addCard({ itemId: "bukan-item-kotoba", kind: "vocab" })).toThrow();
  });

  it("records a study session, review, kana practice, and lesson", () => {
    service.recordSession({ xp: 50, minutes: 10, reviews: 5, source: "test" });
    let snapshot = service.getSnapshot();
    expect(snapshot.profile.xp).toBe(50);
    expect(snapshot.profile.streak).toBe(1);
    expect(snapshot.stats.studyMinutes).toBe(10);

    service.recordReview({ itemId: "v-ohayou", kind: "vocab", rating: 2, correct: true, mode: "test" });
    snapshot = service.getSnapshot();
    expect(snapshot.cards).toHaveLength(1);
    expect(snapshot.stats.totalReviews).toBe(6); // 5 from the session + 1 review
    expect(snapshot.profile.xp).toBeGreaterThan(50);

    service.recordKana({ char: "あ", script: "hiragana", correct: true });
    snapshot = service.getSnapshot();
    expect(snapshot.kana.some((entry) => entry.char === "あ" && entry.mastery > 0)).toBe(true);

    service.recordLesson({ lessonId: "g-desu", kind: "grammar", score: 100, xp: 30 });
    const afterFirst = service.getSnapshot();
    expect(afterFirst.lessons).toHaveLength(1);
    service.recordLesson({ lessonId: "g-desu", kind: "grammar", score: 100, xp: 30 });
    const afterSecond = service.getSnapshot();
    expect(afterSecond.profile.xp).toBe(afterFirst.profile.xp);

    // XP penyelesaian pertama ditentukan server, bukan angka dari klien.
    const xpBeforeTamper = afterSecond.profile.xp;
    service.recordLesson({ lessonId: "g-tamper", kind: "grammar", score: 100, xp: 500 });
    expect(service.getSnapshot().profile.xp - xpBeforeTamper).toBe(30);
  });

  it("menerima lesson pelafalan dan memberi XP sekali saja", () => {
    const before = service.getSnapshot().profile.xp;
    service.recordLesson({ lessonId: "pronunciation-p-n5-1", kind: "pronunciation", score: null, xp: 0 });
    const afterFirst = service.getSnapshot();
    expect(afterFirst.profile.xp - before).toBe(10);
    expect(afterFirst.lessons.some((lesson) => lesson.lessonId === "pronunciation-p-n5-1" && lesson.kind === "pronunciation")).toBe(true);

    service.recordLesson({ lessonId: "pronunciation-p-n5-1", kind: "pronunciation", score: null, xp: 500 });
    expect(service.getSnapshot().profile.xp).toBe(afterFirst.profile.xp);
  });

  it("mencatat latihan menulis dengan XP hanya pada percobaan pertama", () => {
    const before = service.getSnapshot();
    const first = service.recordWriting({
      characterId: "writing-kanji-日",
      mode: "guided",
      score: 90,
      drawnStrokes: 4,
      orderMistakes: 1,
      durationSec: 35,
    });
    expect(first.profile.xp - before.profile.xp).toBe(15);
    expect(first.writing).toHaveLength(1);
    expect(first.writing[0].characterId).toBe("writing-kanji-日");
    expect(first.stats.writingAttempts).toBe(1);
    expect(first.stats.writingCharacters).toBe(1);
    expect(first.stats.writingMastered).toBe(1);
    expect(first.stats.writingOrderMistakes).toBe(1);

    const second = service.recordWriting({
      characterId: "writing-kanji-日",
      mode: "free",
      score: 55,
      drawnStrokes: 3,
      orderMistakes: 2,
      durationSec: 40,
    });
    expect(second.profile.xp).toBe(first.profile.xp);
    expect(second.stats.writingAttempts).toBe(2);
    expect(second.stats.writingCharacters).toBe(1);
    expect(second.stats.writingMastered).toBe(1);
    expect(second.stats.writingOrderMistakes).toBe(3);
    expect(second.writing[0].mode).toBe("free");

    expect(() =>
      service.recordWriting({
        characterId: "writing-tidak-ada",
        mode: "guided",
        score: 100,
        drawnStrokes: 1,
        durationSec: 5,
      }),
    ).toThrow();
  });

  it("mencatat cerita dan tidak memberi XP pada percobaan berikutnya", () => {
    const before = service.getSnapshot();
    const first = service.recordStory({
      storyId: "story-eki-hajimete",
      mode: "study",
      score: 100,
      correct: 3,
      total: 3,
      scenesCompleted: 3,
      durationSec: 120,
    });
    expect(first.profile.xp - before.profile.xp).toBe(25);
    expect(first.stories).toHaveLength(1);
    expect(first.stories[0].storyId).toBe("story-eki-hajimete");
    expect(first.stats.storyAttempts).toBe(1);
    expect(first.stats.storiesCompleted).toBe(1);
    expect(first.stats.storyBestScore).toBe(100);

    const second = service.recordStory({
      storyId: "story-eki-hajimete",
      mode: "watch",
      score: 67,
      correct: 2,
      total: 3,
      scenesCompleted: 3,
      durationSec: 90,
    });
    expect(second.profile.xp).toBe(first.profile.xp);
    expect(second.stats.storyAttempts).toBe(2);
    expect(second.stats.storiesCompleted).toBe(1);
    expect(second.stats.storyBestScore).toBe(100);
    expect(second.stories[0].mode).toBe("watch");
    expect(second.stories[0].score).toBe(67);

    expect(() =>
      service.recordStory({
        storyId: "story-tidak-ada",
        mode: "study",
        score: 100,
        correct: 1,
        total: 1,
        scenesCompleted: 1,
        durationSec: 10,
      }),
    ).toThrow();
  });

  it("stores exam attempts and settings", () => {
    service.recordExam({
      level: "N5",
      score: 80,
      total: 100,
      passed: true,
      sections: [{ id: "moji-goi", label: "Moji & Goi", correct: 8, total: 10, score: 80, points: 10 }],
      correct: 16,
      answered: 20,
      totalQuestions: 20,
      durationSec: 600,
      startedAt: new Date().toISOString(),
      review: [],
    });
    let snapshot = service.getSnapshot();
    expect(snapshot.stats.examsTaken).toBe(1);
    expect(snapshot.exams[0].level).toBe("N5");
    expect(snapshot.exams[0].passed).toBe(true);

    service.updateSettings({ ...snapshot.profile.settings, theme: "dark", dailyGoalXp: 100 });
    snapshot = service.getSnapshot();
    expect(snapshot.profile.settings.theme).toBe("dark");
    expect(snapshot.profile.settings.dailyGoalXp).toBe(100);

    service.updateSettings({
      ...snapshot.profile.settings,
      dailyStudyMinutes: 999,
      dailyVocabTarget: 0,
      dailyLessonTarget: -2,
      weeklyFrequency: 12,
    });
    snapshot = service.getSnapshot();
    expect(snapshot.profile.settings.dailyStudyMinutes).toBe(240);
    expect(snapshot.profile.settings.dailyVocabTarget).toBe(1);
    expect(snapshot.profile.settings.dailyLessonTarget).toBe(1);
    expect(snapshot.profile.settings.weeklyFrequency).toBe(7);

    service.renameProfile("Budi");
    expect(service.getSnapshot().profile.name).toBe("Budi");
  });

  it("records quiz attempts and aggregated question stats", () => {
    const before = service.getSnapshot();
    const payload: QuizAttemptPayload = {
      mode: "practice",
      title: "Kuis uji",
      level: "N5",
      durationSec: 75,
      startedAt: new Date().toISOString(),
      answers: [
        {
          exerciseId: "ex-vocab-meaning-v-ohayou",
          kind: "multiple-choice",
          response: { kind: "multiple-choice", selectedIndex: 0 },
          correct: false,
          score: 0,
          timeMs: 5000,
        },
        {
          exerciseId: "ex-vocab-reading-v-ohayou",
          kind: "reading-recognition",
          response: { kind: "reading-recognition", selectedIndex: 1 },
          correct: true,
          score: 1,
          timeMs: 4000,
        },
      ],
    };

    const after = service.recordQuizAttempt(payload);
    const attempt = after.quizAttempts[0];
    expect(after.stats.quizAttempts).toBe(1);
    expect(after.stats.quizAnswers).toBe(2);
    expect(after.stats.quizCorrect).toBe(1);
    expect(attempt.total).toBe(2);
    expect(attempt.correct).toBe(1);
    expect(attempt.score).toBe(50);
    expect(after.profile.xp - before.profile.xp).toBe(20); // 10 + round(50% * 20)

    const wrongStat = after.questionStats.find((stat) => stat.questionId === "ex-vocab-meaning-v-ohayou");
    expect(wrongStat?.attempts).toBe(1);
    expect(wrongStat?.accuracy).toBe(0);
    expect(wrongStat?.lastResult).toBe("wrong");
    const correctStat = after.questionStats.find((stat) => stat.questionId === "ex-vocab-reading-v-ohayou");
    expect(correctStat?.accuracy).toBe(100);
    expect(after.quizAttempts[0].answers[1].exerciseId).toBe("ex-vocab-reading-v-ohayou");
  });

  it("recomputes quiz aggregates on the server and rejects empty answers", () => {
    const payload: QuizAttemptPayload & { total: number; correct: number; score: number } = {
      mode: "topic",
      title: "Kuis agregat",
      total: 100,
      correct: 100,
      score: 100,
      durationSec: 30,
      startedAt: new Date().toISOString(),
      answers: [
        {
          exerciseId: "ex-vocab-typing-v-ohayou",
          kind: "typing",
          response: { kind: "typing", text: "salah" },
          correct: false,
          score: 0,
          timeMs: 2500,
        },
      ],
    };
    const after = service.recordQuizAttempt(payload);
    expect(after.quizAttempts[0].total).toBe(1);
    expect(after.quizAttempts[0].correct).toBe(0);
    expect(after.quizAttempts[0].score).toBe(0);
    expect(() => service.recordQuizAttempt({ ...payload, answers: [] })).toThrow();
  });

  it("records a game attempt with server-side accuracy and XP, and includes it in export", () => {
    const before = service.getSnapshot();
    const payload: GameAttemptPayload = {
      gameId: "kana-matching",
      difficulty: "easy",
      score: 500,
      correct: 4,
      total: 4,
      durationSec: 45,
      hintsUsed: 3,
      startedAt: new Date().toISOString(),
      details: [
        {
          id: "pair-1",
          prompt: "ひ (hi)",
          expected: "ひ = hi",
          response: "hi",
          correct: true,
          explanation: "ひ dibaca hi.",
          hintUsed: true,
        },
      ],
    };
    const after = service.recordGame(payload);
    expect(after.games).toHaveLength(1);
    expect(after.games[0].gameId).toBe("kana-matching");
    expect(after.games[0].accuracy).toBe(100);
    expect(after.stats.gameAttempts).toBe(1);
    expect(after.stats.gameCorrect).toBe(4);
    expect(after.stats.gameQuestions).toBe(4);
    expect(after.stats.gameBestScore).toBe(500);
    expect(after.profile.xp).toBeGreaterThan(before.profile.xp);
    expect(after.games[0].details[0].prompt).toBe("ひ (hi)");

    expect(() => service.recordGame({ ...payload, total: 0 })).toThrow();
    expect(() => service.recordGame({ ...payload, gameId: "unknown" as GameAttemptPayload["gameId"] })).toThrow();
  });

  it("toggles culture favorites idempotently and rejects unknown articles", () => {
    service.toggleCultureFavorite({ articleId: "c-budaya-1", favorite: true });
    let snapshot = service.getSnapshot();
    expect(snapshot.favorites.map((favorite) => favorite.articleId)).toEqual(["c-budaya-1"]);
    const savedAt = snapshot.favorites[0].savedAt;

    service.toggleCultureFavorite({ articleId: "c-budaya-1", favorite: true });
    snapshot = service.getSnapshot();
    expect(snapshot.favorites).toHaveLength(1);
    expect(snapshot.favorites[0].savedAt).toBe(savedAt);

    expect(() => service.toggleCultureFavorite({ articleId: "c-tidak-ada", favorite: true })).toThrow();
    service.toggleCultureFavorite({ articleId: "c-budaya-1", favorite: false });
    snapshot = service.getSnapshot();
    expect(snapshot.favorites).toEqual([]);
  });

  it("menyimpan materi, catatan, dan koleksi kamus pribadi", () => {
    const collection = service.saveSavedCollection({
      name: "Ujian N5",
      description: "Materi untuk latihan ujian.",
    });
    expect(collection.savedCollections).toHaveLength(1);
    const collectionId = collection.savedCollections[0].id;

    let snapshot = service.saveSavedItem({
      kind: "vocabulary",
      refId: "v-ohayou",
      note: "  Kata sapaan pagi.  ",
      collectionId,
    });
    snapshot = service.saveSavedItem({ kind: "kanji", refId: "kanji-日" });
    expect(snapshot.savedItems).toHaveLength(2);
    const vocabItem = snapshot.savedItems.find((item) => item.kind === "vocabulary");
    expect(vocabItem?.note).toBe("Kata sapaan pagi.");
    expect(vocabItem?.collectionId).toBe(collectionId);
    expect(snapshot.savedItems.find((item) => item.kind === "kanji")?.collectionId).toBeNull();

    // Memperbarui catatan tanpa menyebut koleksi mempertahankan koleksinya.
    snapshot = service.saveSavedItem({
      kind: "vocabulary",
      refId: "v-ohayou",
      note: "Kata sapaan pagi (sopan).",
    });
    expect(snapshot.savedItems.find((item) => item.kind === "vocabulary")?.collectionId).toBe(collectionId);

    expect(() => service.saveSavedItem({ kind: "vocabulary", refId: "v-tidak-ada" })).toThrow();
    expect(() => service.saveSavedItem({ kind: "grammar", refId: "g-tidak-ada" })).toThrow();
    expect(() => service.saveSavedCollection({ name: "   " })).toThrow();
    expect(() => service.saveSavedCollection({ id: "col-tidak-ada", name: "Tidak ada" })).toThrow();

    const temp = service.saveSavedCollection({ name: "Sementara" });
    const tempId = temp.savedCollections.find((item) => item.name === "Sementara")?.id;
    expect(tempId).toBeDefined();
    service.saveSavedCollection({ id: tempId, name: "Sementara", remove: true });
    snapshot = service.getSnapshot();
    expect(snapshot.savedCollections).toHaveLength(1);

    service.saveSavedItem({ kind: "kanji", refId: "kanji-日", remove: true });
    snapshot = service.getSnapshot();
    expect(snapshot.savedItems).toHaveLength(1);
    expect(snapshot.savedItems[0].kind).toBe("vocabulary");

    // Simpan kembali kanji agar ikut diuji pada ekspor/impor berikutnya.
    service.saveSavedItem({ kind: "kanji", refId: "kanji-日", note: "Kanji matahari." });
  });

  it("round-trips an export through import", () => {
    service.toggleCultureFavorite({ articleId: "c-bahasa-3", favorite: true });
    const exported = service.exportSnapshot();
    const exportedXp = exported.profile.xp;
    const exportedCards = exported.cards.length;
    service.resetProgress();
    const cleared = service.getSnapshot();
    expect(cleared.profile.xp).toBe(0);
    expect(cleared.cards).toHaveLength(0);

    service.importProgress(exported);
    const restored = service.getSnapshot();
    expect(restored.profile.name).toBe("Budi");
    expect(restored.profile.xp).toBe(exportedXp);
    expect(restored.cards).toHaveLength(exportedCards);
    expect(restored.favorites.map((favorite) => favorite.articleId)).toEqual(["c-bahasa-3"]);
    expect(restored.exams).toHaveLength(1);
    expect(restored.quizAttempts).toHaveLength(2);
    expect(restored.questionStats.length).toBeGreaterThan(0);
    expect(restored.games).toHaveLength(1);
    expect(restored.stats.gameAttempts).toBe(1);
    expect(restored.stats.gameBestScore).toBe(500);
    expect(restored.savedCollections).toHaveLength(1);
    expect(restored.savedCollections[0].name).toBe("Ujian N5");
    expect(restored.savedItems).toHaveLength(2);
    expect(restored.savedItems.find((item) => item.kind === "kanji")?.note).toBe("Kanji matahari.");
    expect(restored.savedItems.find((item) => item.kind === "vocabulary")?.collectionId).toBe(
      restored.savedCollections[0].id,
    );
    expect(restored.writing).toHaveLength(2);
    expect(restored.stats.writingAttempts).toBe(2);
    expect(restored.stats.writingCharacters).toBe(1);
    expect(restored.stats.writingOrderMistakes).toBe(3);
  });
});