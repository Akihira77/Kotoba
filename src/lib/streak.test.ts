import { describe, expect, it } from "vitest";
import { emptySnapshot } from "@/lib/progress-defaults";
import { streakSummary } from "@/lib/streak";
import type { ActivityDay, ProgressSnapshot } from "@/lib/types";

function withActivity(days: ActivityDay[], bestStreak = 0): ProgressSnapshot {
  const base = emptySnapshot();
  return {
    ...base,
    profile: { ...base.profile, bestStreak },
    activity: days,
  };
}

function day(date: string, xp = 20): ActivityDay {
  return { date, xp, reviews: 0, minutes: 10 };
}

describe("learning streak", () => {
  it("menghitung streak saat ini dan terpanjang dari tanggal lokal", () => {
    const summary = streakSummary(
      withActivity([
        day("2026-11-02"),
        day("2026-11-03"),
        day("2026-11-06"),
        day("2026-11-07"),
        day("2026-11-08"),
      ]),
      "2026-11-08",
    );
    expect(summary.current).toBe(3);
    expect(summary.longest).toBe(3);
    expect(summary.activeToday).toBe(true);
    expect(summary.totalActiveDays).toBe(5);
    expect(summary.week).toHaveLength(7);
    expect(summary.week[0].date).toBe("2026-11-02");
    expect(summary.week.at(-1)?.isToday).toBe(true);
  });

  it("tetap menghitung streak kemarin sebelum pengguna belajar hari ini", () => {
    const summary = streakSummary(
      withActivity([day("2026-11-08"), day("2026-11-09")]),
      "2026-11-10",
    );
    expect(summary.current).toBe(2);
    expect(summary.activeToday).toBe(false);
    expect(summary.week.find((item) => item.date === "2026-11-09")?.active).toBe(true);
  });

  it("memakai rekor tersimpan bila lebih tinggi dari data aktivitas", () => {
    const summary = streakSummary(withActivity([day("2026-11-08")], 7), "2026-11-08");
    expect(summary.current).toBe(1);
    expect(summary.longest).toBe(7);
  });

  it("mengabaikan baris aktivitas nol dan tanggal tidak valid", () => {
    const summary = streakSummary(
      withActivity([
        { date: "2026-11-06", xp: 0, reviews: 0, minutes: 0 },
        { date: "bukan-tanggal", xp: 30, reviews: 0, minutes: 10 },
        day("2026-11-08"),
      ]),
      "2026-11-08",
    );
    expect(summary.current).toBe(1);
    expect(summary.totalActiveDays).toBe(1);
  });
});
