"use client";

import { useEffect, useState } from "react";
import { addDays, formatDate, toDateKey } from "@/lib/utils";
import type { ActivityDay } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HeatmapProps {
  activity: ActivityDay[];
  weeks?: number;
}

const LEVEL_CLASSES = [
  "bg-line/55 dark:bg-line/40",
  "bg-brand/25",
  "bg-brand/45",
  "bg-brand/70",
  "bg-brand",
];

function levelForXp(xp: number): number {
  if (xp <= 0) return 0;
  if (xp < 20) return 1;
  if (xp < 50) return 2;
  if (xp < 100) return 3;
  return 4;
}

/** GitHub-style study activity calendar over the last N weeks. */
export function ActivityHeatmap({ activity, weeks = 17 }: HeatmapProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setNow(new Date()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!now) {
    return <div className="h-[120px] animate-pulse rounded-xl bg-surface-2" aria-hidden="true" />;
  }

  const byDate = new Map(activity.map((day) => [day.date, day]));
  const totalDays = weeks * 7;
  const start = addDays(now, -(totalDays - 1));
  const cells = Array.from({ length: totalDays }, (_, index) => {
    const date = addDays(start, index);
    const key = toDateKey(date);
    const day = byDate.get(key);
    return { key, date, xp: day?.xp ?? 0, reviews: day?.reviews ?? 0 };
  });

  const activeDays = cells.filter((cell) => cell.xp > 0).length;

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="grid shrink-0 grid-rows-7 gap-[3px] pt-[1px] text-[9px] leading-[11px] text-muted">
          <span>Sen</span><span /><span>Rab</span><span /><span>Jum</span><span /><span />
        </div>
        <div className="grid grid-flow-col grid-rows-7 gap-[3px]" role="list" aria-label="Aktivitas belajar per hari">
          {cells.map((cell) => (
            <div
              key={cell.key}
              role="listitem"
              title={`${formatDate(cell.date)} · ${cell.xp} XP · ${cell.reviews} ulasan`}
              aria-label={`${formatDate(cell.date)}: ${cell.xp} XP`}
              className={cn("h-[11px] w-[11px] rounded-[3px]", LEVEL_CLASSES[levelForXp(cell.xp)])}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
        <span>{activeDays} hari aktif dalam {weeks} minggu terakhir</span>
        <span className="inline-flex items-center gap-1.5">
          Sedikit
          {LEVEL_CLASSES.map((className, index) => (
            <span key={index} className={cn("h-[10px] w-[10px] rounded-[2px]", className)} />
          ))}
          Banyak
        </span>
      </div>
    </div>
  );
}