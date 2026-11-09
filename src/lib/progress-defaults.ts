import { DEFAULT_SETTINGS } from "./constants";
import type { ProgressSnapshot } from "./types";

export const SNAPSHOT_STORAGE_KEY = "kotoba.snapshot.v1";

export function emptySnapshot(): ProgressSnapshot {
  const now = new Date().toISOString();
  return {
    profile: {
      name: "Pelajar",
      xp: 0,
      streak: 0,
      bestStreak: 0,
      lastStudyDate: null,
      settings: { ...DEFAULT_SETTINGS },
      createdAt: now,
    },
    cards: [],
    savedItems: [],
    savedCollections: [],
    kana: [],
    lessons: [],
    reviews: [],
    exams: [],
    quizAttempts: [],
    questionStats: [],
    games: [],
    activity: [],
    favorites: [],
    writing: [],
    stories: [],
    stats: {
      totalReviews: 0,
      correctReviews: 0,
      studyMinutes: 0,
      lessonsCompleted: 0,
      examsTaken: 0,
      quizAttempts: 0,
      quizAnswers: 0,
      quizCorrect: 0,
      gameAttempts: 0,
      gameCorrect: 0,
      gameQuestions: 0,
      gameBestScore: 0,
      writingAttempts: 0,
      writingCharacters: 0,
      writingMastered: 0,
      writingOrderMistakes: 0,
      storyAttempts: 0,
      storiesCompleted: 0,
      storyBestScore: 0,
      dueCards: 0,
      newCardsAvailable: 0,
    },
  };
}

export function readCachedSnapshot(): ProgressSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProgressSnapshot;
    if (!parsed?.profile?.settings) return null;
    return {
      ...parsed,
      profile: {
        ...parsed.profile,
        settings: { ...DEFAULT_SETTINGS, ...parsed.profile.settings },
      },
      savedItems: parsed.savedItems ?? [],
      savedCollections: parsed.savedCollections ?? [],
      quizAttempts: parsed.quizAttempts ?? [],
      questionStats: parsed.questionStats ?? [],
      games: parsed.games ?? [],
      favorites: parsed.favorites ?? [],
      writing: parsed.writing ?? [],
      stories: parsed.stories ?? [],
      stats: {
        ...parsed.stats,
        quizAttempts: parsed.stats?.quizAttempts ?? 0,
        quizAnswers: parsed.stats?.quizAnswers ?? 0,
        quizCorrect: parsed.stats?.quizCorrect ?? 0,
        gameAttempts: parsed.stats?.gameAttempts ?? 0,
        gameCorrect: parsed.stats?.gameCorrect ?? 0,
        gameQuestions: parsed.stats?.gameQuestions ?? 0,
        gameBestScore: parsed.stats?.gameBestScore ?? 0,
        writingAttempts: parsed.stats?.writingAttempts ?? 0,
        writingCharacters: parsed.stats?.writingCharacters ?? 0,
        writingMastered: parsed.stats?.writingMastered ?? 0,
        writingOrderMistakes: parsed.stats?.writingOrderMistakes ?? 0,
        storyAttempts: parsed.stats?.storyAttempts ?? 0,
        storiesCompleted: parsed.stats?.storiesCompleted ?? 0,
        storyBestScore: parsed.stats?.storyBestScore ?? 0,
      },
    };
  } catch {
    return null;
  }
}

export function writeCachedSnapshot(snapshot: ProgressSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage penuh atau diblokir — abaikan */
  }
}

export function clearCachedSnapshot(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SNAPSHOT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
