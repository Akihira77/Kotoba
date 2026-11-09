import type { ProgressSnapshot } from "@/lib/types";
import { addDays, startOfWeek, toDateKey } from "@/lib/utils";

export interface StreakSummary {
  current: number;
  longest: number;
  activeToday: boolean;
  totalActiveDays: number;
  week: Array<{ date: string; weekday: string; active: boolean; isToday: boolean }>;
}

const WEEKDAY_SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function previousDay(dateKey: string): string {
  return toDateKey(addDays(new Date(`${dateKey}T12:00:00`), -1));
}

/**
 * Streak dihitung ulang dari tanggal aktivitas lokal agar pergantian hari,
 * zona waktu, dan data lama tetap konsisten. Streak hari ini belum dimulai
 * tetap dihitung dari kemarin supaya tidak tampak putus pada pagi hari.
 */
export function streakSummary(snapshot: ProgressSnapshot, today = toDateKey(new Date())): StreakSummary {
  const active = new Set(
    snapshot.activity
      .filter((day) => day.xp > 0 || day.reviews > 0 || day.minutes > 0)
      .map((day) => day.date)
      .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)),
  );

  let cursor = active.has(today) ? today : previousDay(today);
  let current = 0;
  while (active.has(cursor)) {
    current += 1;
    cursor = previousDay(cursor);
  }

  const ordered = [...active].sort();
  let longest = 0;
  let run = 0;
  let prior = "";
  for (const date of ordered) {
    run = prior && previousDay(date) === prior ? run + 1 : 1;
    longest = Math.max(longest, run);
    prior = date;
  }

  const start = startOfWeek(new Date(`${today}T12:00:00`));
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = toDateKey(addDays(start, index));
    return {
      date,
      weekday: WEEKDAY_SHORT[index],
      active: active.has(date),
      isToday: date === today,
    };
  });

  return {
    current,
    longest: Math.max(longest, current, snapshot.profile.bestStreak),
    activeToday: active.has(today),
    totalActiveDays: active.size,
    week,
  };
}
