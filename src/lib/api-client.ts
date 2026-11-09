"use client";

import type {
  AddCardPayload,
  CultureFavoritePayload,
  ExamPayload,
  GameAttemptPayload,
  LessonPayload,
  ProgressSnapshot,
  QuizAttemptPayload,
  ReviewPayload,
  SavedCollectionPayload,
  SavedItemPayload,
  SessionPayload,
  Settings,
  StoryPayload,
  WritingPayload,
} from "./types";

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Permintaan gagal (${response.status})`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const api = {
  getProgress: () => request<ProgressSnapshot>("/progress"),
  recordSession: (payload: SessionPayload) =>
    request<ProgressSnapshot>("/progress/session", { method: "POST", body: JSON.stringify(payload) }),
  recordReview: (payload: ReviewPayload) =>
    request<ProgressSnapshot>("/progress/review", { method: "POST", body: JSON.stringify(payload) }),
  addCard: (payload: AddCardPayload) =>
    request<ProgressSnapshot>("/progress/card", { method: "POST", body: JSON.stringify(payload) }),
  recordKana: (payload: { char: string; script: "hiragana" | "katakana"; correct: boolean }) =>
    request<ProgressSnapshot>("/progress/kana", { method: "POST", body: JSON.stringify(payload) }),
  recordLesson: (payload: LessonPayload) =>
    request<ProgressSnapshot>("/progress/lesson", { method: "POST", body: JSON.stringify(payload) }),
  recordExam: (payload: ExamPayload) =>
    request<ProgressSnapshot>("/progress/exam", { method: "POST", body: JSON.stringify(payload) }),
  recordQuiz: (payload: QuizAttemptPayload) =>
    request<ProgressSnapshot>("/progress/quiz", { method: "POST", body: JSON.stringify(payload) }),
  recordGame: (payload: GameAttemptPayload) =>
    request<ProgressSnapshot>("/progress/game", { method: "POST", body: JSON.stringify(payload) }),
  recordWriting: (payload: WritingPayload) =>
    request<ProgressSnapshot>("/progress/writing", { method: "POST", body: JSON.stringify(payload) }),
  recordStory: (payload: StoryPayload) =>
    request<ProgressSnapshot>("/progress/story", { method: "POST", body: JSON.stringify(payload) }),
  toggleCultureFavorite: (payload: CultureFavoritePayload) =>
    request<ProgressSnapshot>("/progress/favorite", { method: "POST", body: JSON.stringify(payload) }),
  saveItem: (payload: SavedItemPayload) =>
    request<ProgressSnapshot>("/progress/saved", { method: "POST", body: JSON.stringify(payload) }),
  saveCollection: (payload: SavedCollectionPayload) =>
    request<ProgressSnapshot>("/progress/collections", { method: "POST", body: JSON.stringify(payload) }),
  updateSettings: (settings: Settings) =>
    request<ProgressSnapshot>("/progress/settings", { method: "POST", body: JSON.stringify(settings) }),
  renameProfile: (name: string) =>
    request<ProgressSnapshot>("/progress/profile", { method: "POST", body: JSON.stringify({ name }) }),
  resetProgress: () =>
    request<ProgressSnapshot>("/progress/reset", { method: "POST", body: JSON.stringify({ confirm: true }) }),
  importProgress: (snapshot: unknown) =>
    request<ProgressSnapshot>("/progress/import", {
      method: "POST",
      body: JSON.stringify({ confirm: true, snapshot }),
    }),
  exportProgress: () => request<ProgressSnapshot>("/progress/export"),
  health: () => request<{ ok: boolean; version: string }>("/health"),
};