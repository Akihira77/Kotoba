import type { IconName } from "@/components/icons";
import { lessonForProgressId } from "@/lib/learning";
import type { ProgressSnapshot } from "@/lib/types";
import { DIFFICULTY_LABELS } from "@/lib/games/shared";
import { gameLabel } from "@/lib/games/registry";
import { addDays, formatDuration, percent, startOfWeek, toDateKey } from "@/lib/utils";

export type HistoryKind = "lesson" | "exam" | "quiz" | "game" | "activity";

export interface HistoryEvent {
  id: string;
  kind: HistoryKind;
  title: string;
  detail: string;
  at: string;
  date: string;
  href: string;
  icon: IconName;
  tone: "matcha" | "brand" | "indigo" | "gold" | "muted";
  xp?: number;
}

export interface CalendarDay {
  date: string;
  day: number;
  inMonth: boolean;
  active: boolean;
  xp: number;
  reviews: number;
  minutes: number;
}

export interface StudyTrendDay {
  date: string;
  label: string;
  xp: number;
  minutes: number;
  reviews: number;
  active: boolean;
}

function dayKey(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : toDateKey(date);
}

function localLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

/** Kalender enam minggu untuk bulan tertentu; Senin adalah kolom pertama. */
export function monthCalendar(activity: ProgressSnapshot["activity"], year: number, month: number): CalendarDay[] {
  const byDate = new Map(activity.map((day) => [day.date, day]));
  const first = new Date(year, month, 1, 12);
  const offset = (first.getDay() + 6) % 7;
  const start = addDays(first, -offset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    const key = toDateKey(date);
    const entry = byDate.get(key);
    return {
      date: key,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      active: Boolean(entry && (entry.xp > 0 || entry.reviews > 0 || entry.minutes > 0)),
      xp: entry?.xp ?? 0,
      reviews: entry?.reviews ?? 0,
      minutes: entry?.minutes ?? 0,
    };
  });
}

export const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function studyTrend(snapshot: ProgressSnapshot, days = 30, today = toDateKey(new Date())): StudyTrendDay[] {
  const byDate = new Map(snapshot.activity.map((day) => [day.date, day]));
  const end = new Date(`${today}T12:00:00`);
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(end, index - (days - 1));
    const key = toDateKey(date);
    const entry = byDate.get(key);
    return {
      date: key,
      label: date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      xp: entry?.xp ?? 0,
      minutes: entry?.minutes ?? 0,
      reviews: entry?.reviews ?? 0,
      active: Boolean(entry && (entry.xp > 0 || entry.reviews > 0 || entry.minutes > 0)),
    };
  });
}

/** Riwayat campuran yang diurutkan dari aktivitas terbaru. */
export function studyTimeline(snapshot: ProgressSnapshot, limit = 20): HistoryEvent[] {
  const events: HistoryEvent[] = [];

  for (const lesson of snapshot.lessons) {
    const content = lessonForProgressId(lesson.lessonId);
    events.push({
      id: `lesson-${lesson.lessonId}`,
      kind: "lesson",
      title: content?.title ?? lesson.lessonId,
      detail: lesson.score === null ? "Pelajaran diselesaikan." : `Skor latihan ${lesson.score}%.`,
      at: lesson.completedAt,
      date: dayKey(lesson.completedAt),
      href: content?.href ?? "/learn",
      icon: "book",
      tone: "matcha",
    });
  }
  for (const exam of snapshot.exams) {
    events.push({
      id: `exam-${exam.id}`,
      kind: "exam",
      title: `Simulasi ${exam.level}`,
      detail: `${exam.score}% · ${exam.correct}/${exam.totalQuestions} benar · ${formatDuration(exam.durationSec)}`,
      at: exam.finishedAt,
      date: dayKey(exam.finishedAt),
      href: "/exams",
      icon: "exam",
      tone: exam.passed ? "matcha" : "brand",
    });
  }
  for (const quiz of snapshot.quizAttempts) {
    events.push({
      id: `quiz-${quiz.id}`,
      kind: "quiz",
      title: quiz.title,
      detail: `${quiz.score}% · ${quiz.correct}/${quiz.total} benar · ${formatDuration(quiz.durationSec)}`,
      at: quiz.finishedAt,
      date: dayKey(quiz.finishedAt),
      href: "/practice",
      icon: "practice",
      tone: quiz.score >= 80 ? "matcha" : quiz.score >= 60 ? "gold" : "brand",
    });
  }
  for (const game of snapshot.games) {
    events.push({
      id: `game-${game.id}`,
      kind: "game",
      title: gameLabel(game.gameId),
      detail: `${DIFFICULTY_LABELS[game.difficulty]} · ${game.correct}/${game.total} benar · ${game.score} poin`,
      at: game.playedAt,
      date: dayKey(game.playedAt),
      href: `/games/${game.gameId}`,
      icon: "games",
      tone: game.accuracy >= 80 ? "matcha" : "indigo",
    });
  }
  for (const day of snapshot.activity) {
    if (day.xp === 0 && day.reviews === 0 && day.minutes === 0) continue;
    events.push({
      id: `activity-${day.date}`,
      kind: "activity",
      title: "Sesi belajar harian",
      detail: `${day.reviews} ulasan · ${day.minutes} menit · ${day.xp} XP`,
      at: `${day.date}T12:00:00`,
      date: day.date,
      href: "/progress",
      icon: "calendar",
      tone: "muted",
    });
  }

  return events
    .filter((event) => event.date)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}

export function studySummary(snapshot: ProgressSnapshot, today = toDateKey(new Date())) {
  const last7 = studyTrend(snapshot, 7, today);
  const activeDays = last7.filter((day) => day.active).length;
  const minutes = last7.reduce((total, day) => total + day.minutes, 0);
  const reviews = last7.reduce((total, day) => total + day.reviews, 0);
  const start = startOfWeek(new Date(`${today}T12:00:00`));
  const weekKeys = new Set(last7.map((day) => day.date));
  const thisWeek = snapshot.activity.filter((day) => weekKeys.has(day.date));
  return {
    last7,
    activeDays,
    minutes,
    reviews,
    weekStart: toDateKey(start),
    weekActiveDays: thisWeek.filter((day) => day.xp > 0 || day.reviews > 0 || day.minutes > 0).length,
    accuracy: snapshot.stats.totalReviews > 0 ? percent(snapshot.stats.correctReviews, snapshot.stats.totalReviews) : 0,
  };
}

export { localLabel };
