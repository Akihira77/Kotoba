"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProgress } from "@/components/providers/progress-provider";
import { Icon } from "@/components/icons";
import { Badge, Card, PageHeader, ProgressBar, StatTile } from "@/components/ui";
import { STORIES } from "@/content/stories";
import type { JLPTLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

type LevelFilter = "Semua" | JLPTLevel;

const COVER_TONES = [
  "from-[#f3d9c4] via-[#e9c3aa] to-[#c98668] dark:from-[#4b3328] dark:via-[#3b2922] dark:to-[#281b17]",
  "from-[#e4ead9] via-[#ccd8bd] to-[#8da27c] dark:from-[#2d392d] dark:via-[#253026] dark:to-[#1a221b]",
  "from-[#dbe4ee] via-[#bccbdd] to-[#7d97b3] dark:from-[#2a3440] dark:via-[#222b35] dark:to-[#171e26]",
];

function difficultyLabel(value: number): string {
  return ["Mudah", "Mudah+", "Sedang", "Sedang+", "Sulit"][Math.min(4, Math.max(0, value - 1))];
}

export default function StoriesPage() {
  const { snapshot } = useProgress();
  const [level, setLevel] = useState<LevelFilter>("Semua");
  const stats = snapshot.stats;
  const filtered = useMemo(
    () => STORIES.filter((story) => level === "Semua" || story.level === level),
    [level],
  );
  const bestByStory = useMemo(() => {
    const map = new Map<string, number>();
    for (const attempt of snapshot.stories) {
      map.set(attempt.storyId, Math.max(map.get(attempt.storyId) ?? 0, attempt.score));
    }
    return map;
  }, [snapshot.stories]);
  const completion = stats.storiesCompleted > 0 ? 100 : 0;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        eyebrow="CERITA INTERAKTIF · 物語"
        title="Teater cerita"
        titleJp="ストーリーテアター"
        description="Tonton dan dengarkan cerita Jepang pendek yang dianimasikan langsung di perangkat. Semua cerita dan ilustrasinya orisinal untuk Kotoba."
        icon="story"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Cerita tersedia" value={STORIES.length} hint="N5 sampai N4" icon="story" />
        <StatTile label="Sudah dimainkan" value={stats.storyAttempts} hint="Semua percobaan" icon="play" tone="indigo" />
        <StatTile label="Cerita selesai" value={stats.storiesCompleted} hint="Skor kuis ≥ 60" icon="check" tone="matcha" />
        <StatTile label="Skor terbaik" value={stats.storyBestScore > 0 ? stats.storyBestScore + "%" : "—"} hint="Persentase kuis" icon="trophy" tone="gold" />
      </div>

      <Card className="mt-4 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Progres teater</h2>
            <p className="mt-0.5 text-sm text-muted">
              {stats.storiesCompleted} dari {STORIES.length} cerita mencapai skor kuis minimal 60.
            </p>
          </div>
          <Badge tone="matcha">{completion}%</Badge>
        </div>
        <ProgressBar label="Progres cerita yang diselesaikan" value={stats.storiesCompleted} max={STORIES.length} className="mt-3" />
      </Card>

      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter level cerita">
        {(["Semua", "N5", "N4"] as LevelFilter[]).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={level === item}
            onClick={() => setLevel(item)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              level === item ? "border-brand bg-brand-soft text-brand-strong dark:bg-brand/20 dark:text-brand" : "border-line bg-surface text-muted hover:text-ink",
            )}
          >
            {item === "Semua" ? "Semua level" : item}
          </button>
        ))}
        <p className="ml-auto text-xs text-muted">Mode belajar dan mode tonton otomatis tersedia di setiap cerita.</p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((story, index) => {
          const best = bestByStory.get(story.id) ?? 0;
          const lineCount = story.scenes.reduce((sum, scene) => sum + scene.lines.length, 0);
          return (
            <Link key={story.id} href={`/stories/${story.id}`} className="group block rounded-[1.75rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">
              <Card className="flex h-full flex-col overflow-hidden transition-transform duration-200 group-hover:-translate-y-0.5">
                <div className={cn("relative h-40 overflow-hidden bg-gradient-to-br p-5", COVER_TONES[index % COVER_TONES.length])}>
                  <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full border border-white/30 bg-white/15" aria-hidden="true" />
                  <div className="absolute bottom-3 right-5 flex items-end gap-2" aria-hidden="true">
                    {story.characters.slice(0, 2).map((character, characterIndex) => (
                      <span
                        key={character.id}
                        className="relative inline-flex h-20 w-14 items-end justify-center rounded-t-full"
                        style={{ background: character.accent, transform: `translateY(${characterIndex === 0 ? 8 : 0}px)` }}
                      >
                        <span className="absolute -top-4 h-9 w-9 rounded-full border-2 border-white/50" style={{ background: character.tone }} />
                        <span className="absolute -top-6 h-5 w-10 rounded-t-full" style={{ background: character.hair }} />
                      </span>
                    ))}
                  </div>
                  <div className="relative flex items-center gap-2">
                    <Badge tone="brand">{story.level}</Badge>
                    <Badge tone="muted">{story.minutes} menit</Badge>
                    {best > 0 ? <Badge tone="matcha">Terbaik {best}%</Badge> : null}
                  </div>
                  <p className="relative mt-10 max-w-[70%] text-sm font-semibold text-ink/80 dark:text-white/80">
                    {story.titleJp}
                  </p>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold leading-snug">{story.title}</h2>
                      <p lang="ja" className="mt-0.5 font-jp text-sm text-muted">{story.titleJp}</p>
                    </div>
                    <Icon name="story" size={20} className="shrink-0 text-brand" />
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{story.summary}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <span>{story.scenes.length} adegan</span>
                    <span>{lineCount} dialog</span>
                    <span>{difficultyLabel(story.difficulty)}</span>
                    <span>{story.questions.length} soal</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                    <div className="flex flex-wrap gap-1.5">
                      {story.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} tone="muted">{tag}</Badge>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
                      {best > 0 ? "Tonton lagi" : "Buka cerita"}
                      <Icon name="arrowRight" size={15} />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-4 p-8 text-center">
          <p className="text-base font-bold">Belum ada cerita untuk level ini.</p>
          <p className="mt-1 text-sm text-muted">Coba pilih level lain atau kembali ke semua cerita.</p>
        </Card>
      ) : null}

      <Card className="mt-6 border-dashed p-5 text-sm leading-relaxed text-muted">
        <p className="flex gap-2">
          <Icon name="info" size={17} className="mt-0.5 shrink-0" />
          <span>
            Cerita, karakter, dan ilustrasi di halaman ini dibuat khusus untuk Kotoba, bukan kutipan anime atau buku.
            Suara memakai Web Speech API perangkat; bila suara Jepang tidak tersedia, teks dan terjemahan tetap bisa dipelajari.
            Mode tonton menampilkan sorotan per kalimat, bukan sinkronisasi per kata.
          </span>
        </p>
      </Card>
    </div>
  );
}
