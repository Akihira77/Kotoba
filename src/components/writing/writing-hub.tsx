"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProgress } from "@/components/providers/progress-provider";
import { Badge, Button, Card, LinkButton, PageHeader, ProgressBar, SearchInput, StatTile } from "@/components/ui";
import { Icon } from "@/components/icons";
import { WRITING_MASTERY_SCORE } from "@/lib/writing-geometry";
import type { WritingIndexEntry, WritingStage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StageMeta {
  stage: WritingStage;
  label: string;
  description: string;
  count: number;
}

const PAGE_SIZE = 30;

function normalize(value: string): string {
  return value.normalize("NFKC").toLowerCase();
}

function matches(entry: WritingIndexEntry, query: string): boolean {
  const needle = normalize(query.trim());
  if (!needle) return true;
  return normalize(
    [entry.char, entry.id, entry.romaji, entry.reading, entry.primaryMeaning, entry.level ?? ""].join(" "),
  ).includes(needle);
}

export function WritingHub({
  entries,
  stages,
  total,
  kanaTotal,
  kanjiTotal,
}: {
  entries: WritingIndexEntry[];
  stages: StageMeta[];
  total: number;
  kanaTotal: number;
  kanjiTotal: number;
}) {
  const { snapshot } = useProgress();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<WritingStage | "all">("all");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const attemptStats = useMemo(() => {
    const map = new Map<string, { attempts: number; best: number }>();
    for (const attempt of snapshot.writing) {
      const current = map.get(attempt.characterId) ?? { attempts: 0, best: 0 };
      current.attempts += 1;
      current.best = Math.max(current.best, attempt.score);
      map.set(attempt.characterId, current);
    }
    return map;
  }, [snapshot.writing]);

  const filtered = useMemo(
    () => entries.filter((entry) => (stage === "all" || entry.stage === stage) && matches(entry, query)),
    [entries, stage, query],
  );
  const shown = filtered.slice(0, limit);
  const practiced = attemptStats.size;
  const mastered = Array.from(attemptStats.values()).filter((value) => value.best >= WRITING_MASTERY_SCORE).length;
  const overall = total === 0 ? 0 : Math.round((mastered / total) * 100);

  function changeStage(next: WritingStage | "all") {
    setStage(next);
    setLimit(PAGE_SIZE);
  }

  function changeQuery(next: string) {
    setQuery(next);
    setLimit(PAGE_SIZE);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MENULIS · 書く"
        title="Studio menulis Jepang"
        titleJp="日本語の書き方"
        description="Lihat urutan goresan, tirukan di kanvas, lalu menulis mandiri. Data goresan kana dan kanji berasal dari KanjiVG; skor latihan adalah perkiraan geometri, bukan pengenalan tulisan tangan."
        icon="writing"
        actions={
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/kana" variant="secondary" size="sm">
              <Icon name="kana" size={16} />
              Kana
            </LinkButton>
            <LinkButton href="/kanji" variant="secondary" size="sm">
              <Icon name="kanji" size={16} />
              Kanji
            </LinkButton>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Karakter" value={total} hint={kanaTotal + " kana · " + kanjiTotal + " kanji"} icon="writing" />
        <StatTile label="Sudah dilatih" value={practiced} hint={Math.round((practiced / Math.max(1, total)) * 100) + "% katalog"} icon="practice" />
        <StatTile label="Dikuasai" value={mastered} hint={"Skor geometri ≥ " + WRITING_MASTERY_SCORE} icon="award" />
        <StatTile label="Total latihan" value={snapshot.stats.writingAttempts} hint="Tersimpan di perangkat ini" icon="layers" />
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Progres katalog menulis</h2>
            <p className="mt-1 text-sm text-muted">Dihitung dari skor terbaik per karakter, bukan jumlah percobaan.</p>
          </div>
          <span className="text-sm font-semibold">{overall}%</span>
        </div>
        <ProgressBar value={overall} label="Progres karakter menulis yang dikuasai" className="mt-3" />
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {stages.map((meta) => {
            const stageMastered = entries.filter(
              (entry) => entry.stage === meta.stage && (attemptStats.get(entry.id)?.best ?? 0) >= WRITING_MASTERY_SCORE,
            ).length;
            return (
              <button
                key={meta.stage}
                type="button"
                aria-pressed={stage === meta.stage}
                onClick={() => changeStage(stage === meta.stage ? "all" : meta.stage)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition-colors",
                  stage === meta.stage ? "border-brand bg-brand-soft/60 dark:bg-brand/15" : "border-line bg-surface hover:bg-surface-2",
                )}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-muted">{meta.stage}</p>
                <p className="mt-0.5 text-sm font-semibold">{meta.label}</p>
                <p className="mt-1 text-xs text-muted">
                  {stageMastered}/{meta.count} dikuasai
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            value={query}
            onChange={changeQuery}
            placeholder="Cari karakter, romaji, bacaan, atau arti…"
            label="Cari karakter menulis"
            className="min-w-0 flex-1"
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter tahap belajar">
            <button
              type="button"
              aria-pressed={stage === "all"}
              onClick={() => changeStage("all")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                stage === "all" ? "border-brand bg-brand text-white" : "border-line bg-surface text-muted hover:text-ink",
              )}
            >
              Semua {total}
            </button>
            {stages.map((meta) => (
              <button
                key={meta.stage}
                type="button"
                aria-pressed={stage === meta.stage}
                onClick={() => changeStage(meta.stage)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold",
                  stage === meta.stage ? "border-brand bg-brand text-white" : "border-line bg-surface text-muted hover:text-ink",
                )}
              >
                {meta.stage} · {meta.label} {meta.count}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted" aria-live="polite">
          {filtered.length} karakter cocok. Menampilkan {shown.length}.
        </p>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-line px-6 py-12 text-center">
            <p className="font-semibold">Tidak ada karakter yang cocok.</p>
            <p className="mt-1 text-sm text-muted">Coba kata kunci lain atau pilih tahap Semua.</p>
            <Button
              className="mt-4"
              size="sm"
              variant="secondary"
              onClick={() => {
                changeQuery("");
                changeStage("all");
              }}
            >
              Atur ulang filter
            </Button>
          </div>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {shown.map((entry) => {
              const stats = attemptStats.get(entry.id);
              const masteredEntry = (stats?.best ?? 0) >= WRITING_MASTERY_SCORE;
              return (
                <li key={entry.id} className="min-w-0">
                  <Link
                    href={"/writing/" + entry.id}
                    className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-3 transition-colors hover:border-brand/50 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone={entry.script === "kanji" ? "indigo" : "muted"}>{entry.level ?? (entry.script === "hiragana" ? "Hiragana" : "Katakana")}</Badge>
                      <span className="text-[11px] text-muted">{entry.strokeCount} goresan</span>
                    </div>
                    <span className="mt-2 block font-jp text-5xl leading-none" lang="ja">{entry.char}</span>
                    <span className="mt-2 truncate text-sm font-semibold">{entry.reading}</span>
                    <span className="truncate text-xs text-muted">{entry.primaryMeaning || entry.romaji}</span>
                    <span className="mt-3 flex items-center justify-between gap-2 text-[11px]">
                      <span className={cn("font-semibold", masteredEntry ? "text-matcha" : stats ? "text-gold" : "text-muted")}>
                        {masteredEntry ? "Dikuasai" : stats ? "Terbaik " + stats.best : "Belum dilatih"}
                      </span>
                      <Icon name="chevronRight" size={14} className="text-muted transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {shown.length < filtered.length ? (
          <div className="mt-5 flex justify-center">
            <Button variant="secondary" onClick={() => setLimit((value) => value + PAGE_SIZE)}>
              Muat {Math.min(PAGE_SIZE, filtered.length - shown.length)} karakter lagi
            </Button>
          </div>
        ) : null}
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold">Cara berlatih</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-line p-3">
            <p className="text-xs font-bold text-brand">1 · Amati</p>
            <p className="mt-1 text-sm text-muted">Putar animasi dan perhatikan titik awal, arah, serta jumlah goresan.</p>
          </div>
          <div className="rounded-2xl border border-line p-3">
            <p className="text-xs font-bold text-brand">2 · Tirukan</p>
            <p className="mt-1 text-sm text-muted">Gambar di atas contoh. Skor per goresan membantu menemukan bentuk yang meleset.</p>
          </div>
          <div className="rounded-2xl border border-line p-3">
            <p className="text-xs font-bold text-brand">3 · Mandiri</p>
            <p className="mt-1 text-sm text-muted">Sembunyikan contoh dan tulis dari ingatan. Ulangi besok agar bentuknya melekat.</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted">
          Data goresan: KanjiVG oleh Ulrich Apel dan kontributor, CC BY-SA 3.0. Kotoba tidak mengklaim penilaian
          tulisan tangan otomatis atau sertifikasi kemampuan menulis.
        </p>
      </Card>
    </div>
  );
}
