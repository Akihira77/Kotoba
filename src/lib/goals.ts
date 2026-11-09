import type { ProgressSnapshot } from "@/lib/types";
import { addDays, percent, startOfWeek, toDateKey } from "@/lib/utils";

export type DailyGoalId = "minutes" | "vocab" | "lessons" | "xp";

export interface DailyGoalItem {
  id: DailyGoalId;
  label: string;
  current: number;
  target: number;
  unit: string;
  percent: number;
  done: boolean;
  href: string;
}

export interface WeeklyGoal {
  activeDays: number;
  target: number;
  percent: number;
  done: boolean;
  days: Array<{ date: string; active: boolean }>;
}

export interface GoalProgress {
  date: string;
  items: DailyGoalItem[];
  completed: number;
  percent: number;
  weekly: WeeklyGoal;
}

function dayKey(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : toDateKey(date);
}

/**
 * Progres target harian dihitung dari data yang benar-benar tersimpan:
 * menit dan XP dari tabel aktivitas, kosakata dari ulasan hari ini, dan
 * pelajaran dari waktu penyelesaian. Tidak ada angka yang dikarang.
 */
export function goalProgress(snapshot: ProgressSnapshot, today = toDateKey(new Date())): GoalProgress {
  const settings = snapshot.profile.settings;
  const todayActivity = snapshot.activity.find((day) => day.date === today);
  const vocabTouched = new Set(
    snapshot.reviews
      .filter((review) => review.kind === "vocab" && dayKey(review.createdAt) === today)
      .map((review) => review.itemId),
  );
  const lessonsDone = new Set(
    snapshot.lessons
      .filter((lesson) => dayKey(lesson.completedAt) === today)
      .map((lesson) => lesson.lessonId),
  );

  const items: DailyGoalItem[] = [
    {
      id: "minutes",
      label: "Durasi belajar",
      current: todayActivity?.minutes ?? 0,
      target: settings.dailyStudyMinutes,
      unit: "menit",
      percent: percent(todayActivity?.minutes ?? 0, settings.dailyStudyMinutes),
      done: (todayActivity?.minutes ?? 0) >= settings.dailyStudyMinutes,
      href: "/practice",
    },
    {
      id: "vocab",
      label: "Kosakata ditinjau",
      current: vocabTouched.size,
      target: settings.dailyVocabTarget,
      unit: "kata",
      percent: percent(vocabTouched.size, settings.dailyVocabTarget),
      done: vocabTouched.size >= settings.dailyVocabTarget,
      href: "/vocabulary?tab=review",
    },
    {
      id: "lessons",
      label: "Pelajaran selesai",
      current: lessonsDone.size,
      target: settings.dailyLessonTarget,
      unit: "pelajaran",
      percent: percent(lessonsDone.size, settings.dailyLessonTarget),
      done: lessonsDone.size >= settings.dailyLessonTarget,
      href: "/learn",
    },
    {
      id: "xp",
      label: "Target XP",
      current: todayActivity?.xp ?? 0,
      target: settings.dailyGoalXp,
      unit: "XP",
      percent: percent(todayActivity?.xp ?? 0, settings.dailyGoalXp),
      done: (todayActivity?.xp ?? 0) >= settings.dailyGoalXp,
      href: "/practice",
    },
  ];

  const completed = items.filter((item) => item.done).length;
  return {
    date: today,
    items,
    completed,
    percent: Math.round((completed / items.length) * 100),
    weekly: weeklyGoal(snapshot, today),
  };
}

/** Minggu dimulai Senin dan memakai tanggal lokal, bukan UTC. */
export function weeklyGoal(snapshot: ProgressSnapshot, today = toDateKey(new Date())): WeeklyGoal {
  const start = startOfWeek(new Date(`${today}T12:00:00`));
  const active = new Set(
    snapshot.activity
      .filter((day) => day.xp > 0 || day.reviews > 0 || day.minutes > 0)
      .map((day) => day.date),
  );
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = toDateKey(addDays(start, index));
    return { date, active: active.has(date) };
  });
  const activeDays = days.filter((day) => day.active).length;
  const target = snapshot.profile.settings.weeklyFrequency;
  return {
    activeDays,
    target,
    percent: percent(activeDays, target),
    done: activeDays >= target,
    days,
  };
}

export function activeStudyDays(snapshot: ProgressSnapshot): Set<string> {
  return new Set(
    snapshot.activity
      .filter((day) => day.xp > 0 || day.reviews > 0 || day.minutes > 0)
      .map((day) => day.date),
  );
}
