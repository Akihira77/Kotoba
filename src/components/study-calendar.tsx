"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui";
import { MONTH_NAMES, monthCalendar } from "@/lib/history";
import type { ActivityDay } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function shadeClass(xp: number): string {
  if (xp <= 0) return "bg-surface-2 text-muted";
  if (xp < 10) return "bg-brand/15 text-brand-strong";
  if (xp < 30) return "bg-brand/30 text-brand-strong";
  if (xp < 60) return "bg-brand/55 text-white";
  return "bg-brand text-white";
}

/**
 * Kalender aktivitas bulanan. Tanggal dihitung dengan komponen lokal, bukan
 * parsing string ISO, supaya hari tidak bergeser di zona waktu pengguna.
 */
export function StudyCalendar({ activity }: { activity: ActivityDay[] }) {
  const initial = new Date();
  const [cursor, setCursor] = useState({ year: initial.getFullYear(), month: initial.getMonth() });
  const days = useMemo(() => monthCalendar(activity, cursor.year, cursor.month), [activity, cursor]);
  const activeDays = days.filter((day) => day.inMonth && day.active).length;
  const monthXp = days.filter((day) => day.inMonth).reduce((total, day) => total + day.xp, 0);

  function move(delta: number) {
    const next = new Date(cursor.year, cursor.month + delta, 1, 12);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  }

  function goToday() {
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{MONTH_NAMES[cursor.month]} {cursor.year}</p>
          <p className="mt-0.5 text-[11px] text-muted">{activeDays} hari aktif · {monthXp} XP bulan ini</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => move(-1)} aria-label="Bulan sebelumnya">
            <Icon name="chevronLeft" size={17} />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday}>Hari ini</Button>
          <Button variant="ghost" size="sm" onClick={() => move(1)} aria-label="Bulan berikutnya">
            <Icon name="chevronRight" size={17} />
          </Button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center" role="list" aria-label={`Kalender aktivitas ${MONTH_NAMES[cursor.month]} ${cursor.year}`}>
        {WEEKDAYS.map((day) => (
          <div key={day} aria-hidden="true" className="pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">{day}</div>
        ))}
        {days.map((day) => (
          <div
            key={day.date}
            role="listitem"
            aria-label={`${day.date}: ${day.xp} XP, ${day.reviews} ulasan, ${day.minutes} menit${day.inMonth ? "" : ", di luar bulan ini"}`}
            title={`${day.date}: ${day.xp} XP · ${day.reviews} ulasan · ${day.minutes} menit`}
            className={cn(
              "flex aspect-square items-center justify-center rounded-lg text-xs font-medium transition-colors",
              day.inMonth ? shadeClass(day.xp) : "bg-transparent text-muted/30",
              !day.inMonth && day.active && "text-brand/30",
            )}
          >
            {day.day}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted">
        <span>Warna makin pekat = XP makin banyak.</span>
        <span className="flex items-center gap-1">
          Sedikit
          <i className="size-3 rounded-sm bg-brand/15" />
          <i className="size-3 rounded-sm bg-brand/30" />
          <i className="size-3 rounded-sm bg-brand/55" />
          <i className="size-3 rounded-sm bg-brand" />
          Banyak
        </span>
      </div>
    </div>
  );
}
