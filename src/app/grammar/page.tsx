"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { JpText } from "@/components/japanese";
import { useProgress } from "@/components/providers/progress-provider";
import { Badge, Card, EmptyState, LinkButton, SearchInput } from "@/components/ui";
import { GRAMMAR } from "@/content/grammar";
import { LEVEL_LABELS, LEVEL_META } from "@/lib/constants";
import { JLPT_LEVELS, type JLPTLevel } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

type LevelFilter = JLPTLevel | "semua";

export default function GrammarPage() {
  const { snapshot } = useProgress();
  const [level, setLevel] = useState<LevelFilter>("semua");
  const [search, setSearch] = useState("");

  const completed = useMemo(() => new Set(snapshot.lessons.filter((lesson) => lesson.kind === "grammar").map((lesson) => lesson.lessonId)), [snapshot.lessons]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return GRAMMAR.filter((point) => {
      if (level !== "semua" && point.level !== level) return false;
      if (!query) return true;
      return [point.pattern, point.meaning, ...point.explanation].some((field) => field.toLowerCase().includes(query));
    });
  }, [level, search]);

  const counts = useMemo(
    () => Object.fromEntries(JLPT_LEVELS.map((key) => [key, GRAMMAR.filter((point) => point.level === key).length])),
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Tata bahasa terstruktur</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Tata Bahasa</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {formatNumber(GRAMMAR.length)} pola kalimat dengan penjelasan berbahasa Indonesia, contoh kalimat, kesalahan
          umum, dan latihan singkat. Pelajari dari N5 hingga N1 secara bertahap.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {JLPT_LEVELS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={level === key}
            onClick={() => setLevel(level === key ? "semua" : key)}
            className={cn(
              "rounded-2xl border p-3 text-left transition hover:-translate-y-0.5",
              level === key ? "border-brand bg-brand-soft/60" : "border-line bg-surface",
            )}
          >
            <p className="text-sm font-bold">{key} <span className="font-normal text-muted">· {LEVEL_META[key].passScore}</span></p>
            <p className="mt-0.5 text-[11px] text-muted">{LEVEL_LABELS[key].split(" · ")[1]}</p>
            <p className="mt-1 text-xs font-semibold text-brand tnum">{counts[key]} pola</p>
          </button>
        ))}
      </div>

      <Card className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari pola atau makna, mis. てください…" />
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              aria-pressed={level === "semua"}
              onClick={() => setLevel("semua")}
              className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", level === "semua" ? "bg-brand text-white" : "bg-surface-2 text-muted hover:text-ink")}
            >
              Semua level
            </button>
            {JLPT_LEVELS.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={level === key}
                onClick={() => setLevel(key)}
                className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", level === key ? "bg-brand text-white" : "bg-surface-2 text-muted hover:text-ink")}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">{filtered.length} pola ditampilkan</p>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon="search" title="Pola tidak ditemukan" description="Coba kata kunci lain atau pilih level berbeda." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((point) => {
            const isDone = completed.has(point.id);
            return (
              <LinkButton
                key={point.id}
                href={`/grammar/${point.id}`}
                variant="ghost"
                className="h-full justify-start rounded-2xl border border-line bg-surface p-4 text-left font-normal shadow-soft transition hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-lift"
              >
                <span className="flex w-full flex-col gap-2">
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <Badge tone={point.level === "N5" ? "matcha" : point.level === "N4" ? "indigo" : point.level === "N3" ? "gold" : "brand"}>{point.level}</Badge>
                      {isDone && <Badge tone="matcha"><Icon name="check" size={11} /> Selesai</Badge>}
                    </span>
                    <Icon name="chevronRight" size={16} className="text-muted" />
                  </span>
                  <JpText text={point.pattern} className="text-xl font-semibold" />
                  <span className="text-sm text-ink">{point.meaning}</span>
                  <span className="line-clamp-2 text-xs text-muted">{point.explanation[0]}</span>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-muted">
                    <Icon name="grammar" size={13} /> {point.formation[0]?.label}: {point.formation[0]?.form}
                  </span>
                </span>
              </LinkButton>
            );
          })}
        </div>
      )}
    </div>
  );
}
