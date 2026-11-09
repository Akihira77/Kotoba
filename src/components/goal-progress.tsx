"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { Card, ProgressBar, SectionHeading } from "@/components/ui";
import { goalProgress } from "@/lib/goals";
import type { ProgressSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";

const GOAL_ICONS = {
  minutes: "clock",
  vocab: "vocab",
  lessons: "book",
  xp: "zap",
} as const;

/** Ringkasan target harian yang bisa dipakai di dasbor maupun Statistik. */
export function DailyGoalCard({ snapshot, compact = false }: { snapshot: ProgressSnapshot; compact?: boolean }) {
  const goal = goalProgress(snapshot);

  return (
    <Card className={compact ? "p-4" : "p-5 sm:p-6"}>
      <div className="flex items-start justify-between gap-3">
        <SectionHeading
          title="Target hari ini"
          description={compact ? undefined : "Empat target kecil yang membentuk kebiasaan belajar."}
          icon="target"
        />
        <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold tabular-nums text-muted">
          {goal.completed}/{goal.items.length}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {goal.items.map((item) => (
          <div key={item.id}>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="flex min-w-0 items-center gap-1.5 font-medium">
                <Icon name={GOAL_ICONS[item.id]} size={14} className={item.done ? "text-matcha" : "text-muted"} />
                <span className="truncate">{item.label}</span>
              </span>
              <span className={cn("shrink-0 tabular-nums", item.done ? "font-semibold text-matcha" : "text-muted")}>
                {Math.min(item.current, item.target)}/{item.target} {item.unit}
                {item.done ? <Icon name="check" size={13} className="ml-1 inline" /> : null}
              </span>
            </div>
            <ProgressBar
              value={Math.min(item.current, item.target)}
              max={item.target}
              className="mt-1.5 h-1.5"
              barClassName={item.done ? "bg-matcha" : "bg-brand"}
              label={item.label}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-line bg-surface-2/50 p-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-medium">Konsistensi mingguan</span>
          <span className="tabular-nums text-muted">{Math.min(goal.weekly.activeDays, goal.weekly.target)}/{goal.weekly.target} hari</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          {goal.weekly.days.map((day) => (
            <span
              key={day.date}
              title={day.date}
              className={cn(
                "flex h-7 flex-1 items-center justify-center rounded-md text-[10px] font-medium",
                day.active ? "bg-matcha text-white dark:bg-matcha/25 dark:text-matcha" : "bg-surface text-muted ring-1 ring-line",
              )}
            >
              {day.active ? <Icon name="check" size={12} /> : day.date.slice(8)}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-muted">
          {goal.weekly.done
            ? "Target frekuensi minggu ini tercapai. Istirahat tetap bagian dari belajar."
            : `${goal.weekly.target - goal.weekly.activeDays} hari aktif lagi untuk mencapai target mingguan.`}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[10px] text-muted">Target mengikuti pengaturanmu.</p>
        <Link href="/settings#target" className="inline-flex min-h-6 items-center gap-1 text-[11px] font-semibold text-brand hover:underline">
          Ubah target
          <Icon name="arrowRight" size={12} />
        </Link>
      </div>
    </Card>
  );
}
