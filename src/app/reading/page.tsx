"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { JpText } from "@/components/japanese";
import { useProgress } from "@/components/providers/progress-provider";
import { Badge, Card, EmptyState, SearchInput, StatTile } from "@/components/ui";
import { READING } from "@/content/reading";
import { JLPT_LEVELS, type JLPTLevel } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

type LevelFilter = JLPTLevel | "semua";

export default function ReadingPage() {
  const { snapshot } = useProgress();
  const [level, setLevel] = useState<LevelFilter>("semua");
  const [search, setSearch] = useState("");

  const completed = useMemo(
    () => new Set(snapshot.lessons.filter((lesson) => lesson.kind === "reading").map((lesson) => lesson.lessonId)),
    [snapshot.lessons],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return READING.filter((passage) => {
      if (level !== "semua" && passage.level !== level) return false;
      if (!query) return true;
      return [passage.title, passage.titleJp, passage.summary].some((field) => field.toLowerCase().includes(query));
    });
  }, [level, search]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Dokkai · 読解</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Latihan Membaca</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Bacaan orisinal bertingkat dengan furigana opsional, terjemahan, daftar kosakata, dan pertanyaan pemahaman.
          Mulai dari cerita pendek N5 hingga esai N1.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Teks bacaan" value={formatNumber(READING.length)} hint="N5 sampai N1" icon="reading" tone="brand" />
        <StatTile label="Sudah dibaca" value={formatNumber(completed.size)} hint={`dari ${READING.length} teks`} icon="checkCircle" tone="matcha" />
        <StatTile label="Pertanyaan" value={formatNumber(READING.reduce((sum, passage) => sum + passage.questions.length, 0))} hint="Pemahaman bacaan" icon="list" tone="indigo" />
        <StatTile label="Estimasi" value={`${READING.reduce((sum, passage) => sum + passage.minutes, 0)} mnt`} hint="Total waktu membaca" icon="clock" tone="gold" />
      </div>

      <Card className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari judul bacaan…" />
          <div className="no-scrollbar flex gap-1 overflow-x-auto">
            {(["semua", ...JLPT_LEVELS] as LevelFilter[]).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={level === value}
                onClick={() => setLevel(value)}
                className={cn("whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold", level === value ? "bg-brand text-white" : "bg-surface-2 text-muted hover:text-ink")}
              >
                {value === "semua" ? "Semua" : value}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon="search" title="Belum ada bacaan yang cocok" description="Coba kata kunci atau level lain." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((passage) => (
            <Link
              key={passage.id}
              href={`/reading/${passage.id}`}
              className="group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-lift"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge tone={passage.level === "N5" ? "matcha" : passage.level === "N4" ? "indigo" : "gold"}>{passage.level}</Badge>
                  {completed.has(passage.id) && <Badge tone="matcha"><Icon name="check" size={11} /> Selesai</Badge>}
                </div>
                <span className="flex items-center gap-1 text-[11px] text-muted"><Icon name="clock" size={12} /> {passage.minutes} menit</span>
              </div>
              <h2 className="mt-3 text-lg font-bold group-hover:text-brand">{passage.title}</h2>
              <JpText text={passage.titleJp} className="mt-0.5 text-sm text-muted" />
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{passage.summary}</p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11px] text-muted">
                <span>{passage.vocab.length} kosakata · {passage.questions.length} pertanyaan</span>
                <span className="inline-flex items-center gap-1 font-semibold text-brand">Baca <Icon name="arrowRight" size={13} /></span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
