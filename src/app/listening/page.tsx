"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { JpText } from "@/components/japanese";
import { useProgress } from "@/components/providers/progress-provider";
import { Badge, Card, EmptyState, SearchInput, StatTile } from "@/components/ui";
import { LISTENING } from "@/content/listening";
import { LISTENING_DRILLS } from "@/content/listening-drills";
import { JLPT_LEVELS, type JLPTLevel } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

type LevelFilter = JLPTLevel | "semua";

export default function ListeningPage() {
  const { snapshot } = useProgress();
  const [level, setLevel] = useState<LevelFilter>("semua");
  const [search, setSearch] = useState("");

  const completed = useMemo(
    () => new Set(snapshot.lessons.filter((lesson) => lesson.kind === "listening").map((lesson) => lesson.lessonId)),
    [snapshot.lessons],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return LISTENING.filter((item) => {
      if (level !== "semua" && item.level !== level) return false;
      if (!query) return true;
      return [item.title, item.titleId, item.scenario].some((field) => field.toLowerCase().includes(query));
    });
  }, [level, search]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Choukai · 聴解</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Latihan Mendengar</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Dialog pendek bertingkat dengan audio Jepang, mode lambat, transkrip tersembunyi, dan pertanyaan pemahaman.
          Latih telingamu memahami percakapan sehari-hari.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Dialog" value={formatNumber(LISTENING.length)} hint="N5 sampai N2" icon="listening" tone="brand" />
        <StatTile label="Sudah didengar" value={formatNumber(completed.size)} hint={`dari ${LISTENING.length} dialog`} icon="checkCircle" tone="matcha" />
        <StatTile
          label="Soal audio"
          value={formatNumber(LISTENING.reduce((sum, item) => sum + item.questions.length, 0) + LISTENING_DRILLS.length)}
          hint="Dialog + drill kilat"
          icon="list"
          tone="indigo"
        />
        <StatTile label="Drill kilat" value={formatNumber(LISTENING_DRILLS.length)} hint="N5 sampai N1" icon="practice" tone="gold" />
      </div>

      <Card className="relative overflow-hidden border-brand/25 bg-brand-soft/40 p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-6 -top-8 font-jp text-[8rem] font-bold leading-none text-brand/10" aria-hidden>
          聴
        </div>
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <Badge tone="brand">Latihan cepat</Badge>
            <h2 className="mt-2 text-xl font-bold text-ink">Latihan menyimak kilat</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              15 audio satu pertanyaan dari N5 sampai N1. Fokus pada kosakata, detail, maksud tersirat, dan nuansa.
              Transkrip dibuka setelah kamu menjawab.
            </p>
          </div>
          <Link
            href="/listening/practice"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-strong"
          >
            Mulai latihan kilat <Icon name="arrowRight" size={15} />
          </Link>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari tema dialog…" />
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
        <EmptyState icon="search" title="Belum ada dialog yang cocok" description="Coba kata kunci atau level lain." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/listening/${item.id}`}
              className="group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-lift"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge tone={item.level === "N5" ? "matcha" : item.level === "N4" ? "indigo" : "gold"}>{item.level}</Badge>
                  {completed.has(item.id) && <Badge tone="matcha"><Icon name="check" size={11} /> Selesai</Badge>}
                </div>
                <span className="flex items-center gap-1 text-[11px] text-muted"><Icon name="listening" size={12} /> {item.lines.length} baris</span>
              </div>
              <h2 className="mt-3 text-lg font-bold group-hover:text-brand">{item.title}</h2>
              <JpText text={item.titleId} className="mt-0.5 text-sm text-muted" />
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{item.scenario}</p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11px] text-muted">
                <span>{item.questions.length} pertanyaan · {item.keyPhrases.length} frasa</span>
                <span className="inline-flex items-center gap-1 font-semibold text-brand">Dengarkan <Icon name="play" size={12} /></span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
