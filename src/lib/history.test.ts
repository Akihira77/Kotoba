import { describe, expect, it } from "vitest";
import { lessonForProgressId } from "@/lib/learning";
import {
  MONTH_NAMES,
  monthCalendar,
  studySummary,
  studyTimeline,
  studyTrend,
} from "@/lib/history";
import { emptySnapshot } from "@/lib/progress-defaults";
import type { ProgressSnapshot } from "@/lib/types";

const TODAY = "2026-11-08";

function iso(month: number, day: number, hour = 9): string {
  return new Date(2026, month - 1, day, hour, 0, 0).toISOString();
}

function snapshot(): ProgressSnapshot {
  const base = emptySnapshot();
  return {
    ...base,
    lessons: [{ lessonId: "g-desu", kind: "grammar", score: 90, completedAt: iso(11, 7) }],
    activity: [
      { date: "2026-11-02", xp: 20, reviews: 4, minutes: 10 },
      { date: "2026-11-08", xp: 40, reviews: 2, minutes: 20 },
    ],
  };
}

describe("study history", () => {
  it("menyusun kalender enam minggu dengan Senin sebagai kolom pertama", () => {
    const cells = monthCalendar(snapshot().activity, 2026, 10);
    expect(MONTH_NAMES[10]).toBe("November");
    expect(cells).toHaveLength(42);
    expect(cells[0].date).toBe("2026-10-26");
    expect(cells.filter((cell) => cell.inMonth)).toHaveLength(30);
    const activeDay = cells.find((cell) => cell.date === "2026-11-08");
    expect(activeDay).toMatchObject({ active: true, xp: 40, minutes: 20 });
  });

  it("mengisi hari kosong pada tren tanpa mengarang aktivitas", () => {
    const trend = studyTrend(snapshot(), 7, TODAY);
    expect(trend).toHaveLength(7);
    expect(trend[0].date).toBe("2026-11-02");
    expect(trend.at(-1)?.date).toBe(TODAY);
    expect(trend.reduce((total, day) => total + day.minutes, 0)).toBe(30);
    const empty = trend.find((day) => day.date === "2026-11-03");
    expect(empty).toMatchObject({ xp: 0, minutes: 0, active: false });
    expect(empty?.label.length).toBeGreaterThan(0);
  });

  it("menggabungkan pelajaran dan aktivitas ke timeline terbaru", () => {
    const timeline = studyTimeline(snapshot(), 10);
    expect(timeline).toHaveLength(3);
    expect(timeline[0].kind).toBe("activity");
    expect(timeline[0].date).toBe(TODAY);
    const lesson = timeline.find((event) => event.kind === "lesson");
    expect(lesson?.title).toBe(lessonForProgressId("g-desu")?.title);
    expect(lesson?.href).toBe(lessonForProgressId("g-desu")?.href);
    expect(lesson?.detail).toContain("90%");
    expect(studyTimeline(snapshot(), 1)).toHaveLength(1);
  });

  it("meringkas tujuh hari terakhir dan akurasi ulasan", () => {
    const base = snapshot();
    const summary = studySummary(
      { ...base, stats: { ...base.stats, totalReviews: 10, correctReviews: 8 } },
      TODAY,
    );
    expect(summary.activeDays).toBe(2);
    expect(summary.minutes).toBe(30);
    expect(summary.reviews).toBe(6);
    expect(summary.accuracy).toBe(80);
  });
});
