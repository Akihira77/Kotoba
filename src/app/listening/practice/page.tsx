"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExerciseRunner } from "@/components/exercise-runner";
import { Icon } from "@/components/icons";
import { Badge, Card } from "@/components/ui";
import { LISTENING_DRILLS } from "@/content/listening-drills";
import { listeningDrillExercises } from "@/lib/exercise-catalog";
import { JLPT_LEVELS, type JLPTLevel } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

type LevelFilter = JLPTLevel | "semua";

const FOCUS_NOTE = "Latihan singkat satu pertanyaan. Dengarkan audio, pilih jawaban, lalu baca transkrip dan penjelasannya.";

export default function ListeningPracticePage() {
  const [level, setLevel] = useState<LevelFilter>("semua");

  const exercises = useMemo(() => listeningDrillExercises(level), [level]);
  const counts = useMemo(() => {
    const map = new Map<LevelFilter, number>();
    map.set("semua", LISTENING_DRILLS.length);
    for (const value of JLPT_LEVELS) {
      map.set(value, LISTENING_DRILLS.filter((drill) => drill.level === value).length);
    }
    return map;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/listening" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand">
          <Icon name="arrowLeft" size={13} /> Kembali ke daftar dialog
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Choukai · 聴解</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Latihan Menyimak Kilat</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              15 latihan audio pendek dari N5 sampai N1: kosakata, detail percakapan, maksud tersirat, dan nuansa.
              Transkrip baru muncul setelah kamu menjawab.
            </p>
          </div>
          <Badge tone="muted">{formatNumber(exercises.length)} soal pada filter ini</Badge>
        </div>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted">Level</span>
          {(["semua", ...JLPT_LEVELS] as LevelFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setLevel(value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                level === value ? "bg-brand text-white" : "bg-surface-2 text-muted hover:text-ink",
              )}
              aria-pressed={level === value}
            >
              {value === "semua" ? "Semua" : value}
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", level === value ? "bg-white/20" : "bg-surface")}>
                {counts.get(value) ?? 0}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><Icon name="listening" size={13} /> Audio dari suara browser</span>
          <span className="inline-flex items-center gap-1.5"><Icon name="eye" size={13} /> Transkrip setelah menjawab</span>
          <span className="inline-flex items-center gap-1.5"><Icon name="checkCircle" size={13} /> Hasil tersimpan otomatis</span>
        </div>
      </Card>

      <Card className="border-brand/20 bg-brand-soft/40 p-4 sm:p-5">
        <div className="flex gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-brand">
            <Icon name="listening" size={18} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink">Cara memakai latihan ini</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {FOCUS_NOTE} Kamu bisa memutar audio normal atau lambat. Transkrip tidak ditampilkan sebelum jawaban
              diperiksa, jadi coba pahami dulu dari suara. Pengenalan suara dan mikrofon tidak diperlukan di halaman ini.
            </p>
          </div>
        </div>
      </Card>

      <ExerciseRunner
        key={level}
        exercises={exercises}
        title={level === "semua" ? "Latihan listening campuran" : `Latihan listening ${level}`}
        description="Dengarkan audio singkat, pilih jawaban, lalu periksa transkrip dan terjemahan."
        mode="practice"
        level={level === "semua" ? undefined : level}
        completeHref="/listening"
        completeLabel="Kembali ke daftar dialog"
      />

      <p className="text-center text-xs text-muted">
        Latihan ini bagian dari Kotoba, bukan sertifikasi JLPT resmi. Audio memakai suara browser dan bisa berbeda
        antarperangkat.
      </p>
    </div>
  );
}
