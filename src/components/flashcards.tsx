"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { JpText, SpeakButton } from "@/components/japanese";
import { Badge, Button, Card, EmptyState, ProgressBar } from "@/components/ui";
import { createCard, estimateInterval, RATING_LABELS, type Rating } from "@/lib/srs";
import type { CardProgress, ItemKind } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface FlashcardData {
  id: string;
  kind: ItemKind;
  front: string;
  reading?: string;
  romaji?: string;
  back: string;
  example?: string;
  exampleReading?: string;
  exampleMeaning?: string;
  badge?: string;
  note?: string;
  /** Kartu SRS yang sudah ada, dipakai untuk menampilkan estimasi jeda berikutnya. */
  card?: CardProgress;
}

interface FlashcardsProps {
  cards: FlashcardData[];
  onRate: (card: FlashcardData, rating: Rating) => void | Promise<void>;
  onComplete?: (ratings: Rating[]) => void;
  onRestart?: () => void;
  title?: string;
  showRomaji?: boolean;
}

export function Flashcards({ cards, onRate, onComplete, onRestart, title, showRomaji = true }: FlashcardsProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [finished, setFinished] = useState(false);
  const ratingLock = useRef(false);

  const current = cards[index];
  const total = cards.length;

  const counts = [0, 0, 0, 0];
  ratings.forEach((rating) => { counts[rating] += 1; });

  const rate = useCallback(
    async (rating: Rating) => {
      if (!flipped || !current || finished || ratingLock.current) return;
      ratingLock.current = true;
      try {
        await onRate(current, rating);
      } catch {
        ratingLock.current = false;
        return;
      }
      const nextRatings = [...ratings, rating];
      setRatings(nextRatings);
      if (index + 1 >= total) {
        setFinished(true);
        onComplete?.(nextRatings);
      } else {
        setIndex((value) => value + 1);
        setFlipped(false);
      }
    },
    [current, finished, flipped, index, onComplete, onRate, ratings, total],
  );

  useEffect(() => {
    // A successfully rated card advances and closes the lock; failed requests
    // are unlocked in the catch above so the learner can retry.
    if (!flipped) ratingLock.current = false;
  }, [flipped, index]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (finished) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (!flipped) {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          setFlipped(true);
        }
        return;
      }
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        return;
      }
      if (event.key === "1" || event.key === "2" || event.key === "3" || event.key === "4") {
        event.preventDefault();
        void rate((Number(event.key) - 1) as Rating);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [finished, flipped, rate]);

  if (total === 0) {
    return (
      <EmptyState
        icon="layers"
        title="Tidak ada kartu"
        description="Semua kartu untuk filter ini sudah selesai, atau belum ada kartu yang tersedia."
      />
    );
  }

  if (finished || !current) {
    return (
      <Card className="p-6 text-center sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-matcha-soft text-matcha">
          <Icon name="checkCircle" size={24} />
        </div>
        <h2 className="mt-4 text-xl font-bold">Sesi ulasan selesai</h2>
        <p className="mt-1 text-sm text-muted">Kamu mengulas {ratings.length} kartu. Jadwal ulangan sudah diperbarui.</p>
        <div className="mx-auto mt-5 grid max-w-md grid-cols-4 gap-2 text-center">
          {RATING_LABELS.map((label) => (
            <div key={label.rating} className="rounded-xl border border-line bg-surface-2/50 p-2">
              <p className="text-lg font-bold tnum">{counts[label.rating]}</p>
              <p className="text-[11px] text-muted">{label.label}</p>
            </div>
          ))}
        </div>
        {onRestart && (
          <Button className="mt-6" onClick={onRestart}>
            <Icon name="rotate" size={16} /> Muat ulang kartu
          </Button>
        )}
      </Card>
    );
  }

  const activeCard = current.card ?? createCard(current.id, current.kind);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {title && <span className="text-sm font-medium">{title}</span>}
          <Badge tone="muted">{current.kind === "vocab" ? "Kosakata" : "Kanji"}</Badge>
        </div>
        <span className="text-xs text-muted tnum">Kartu {index + 1} / {total}</span>
      </div>
      <ProgressBar value={index} max={total} label="Kemajuan kartu" />

      <Card className="mt-4 overflow-hidden">
        <div className="relative">
          <button
            type="button"
            onClick={() => setFlipped((value) => !value)}
            aria-label={flipped ? "Sembunyikan jawaban" : "Tampilkan jawaban"}
            aria-expanded={flipped}
            className="flex min-h-[300px] w-full flex-col items-center justify-center gap-2 px-5 py-10 text-center transition hover:bg-surface-2/30 sm:min-h-[340px]"
          >
            {current.badge && <Badge tone="brand">{current.badge}</Badge>}
            <p className="font-jp text-5xl font-semibold leading-tight sm:text-6xl">{current.front}</p>
            {current.reading && <p className="font-jp text-base text-muted">{current.reading}</p>}
            {showRomaji && current.romaji && <p className="text-xs italic text-muted">{current.romaji}</p>}

            {flipped ? (
              <div className="mt-3 max-w-xl animate-fade-up space-y-3">
                <p className="text-2xl font-semibold text-brand">{current.back}</p>
                {current.example && (
                  <div className="rounded-2xl border border-line bg-surface-2/60 px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <JpText text={current.example} className="text-base" />
                      <SpeakButton text={current.example} speech={current.exampleReading} size={14} />
                    </div>
                    {current.exampleReading && <p className="mt-1 text-xs text-muted">{current.exampleReading}</p>}
                    {current.exampleMeaning && <p className="mt-1 text-sm text-muted">{current.exampleMeaning}</p>}
                  </div>
                )}
                {current.note && <p className="text-xs text-muted">{current.note}</p>}
              </div>
            ) : (
              <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted">
                <Icon name="eye" size={14} /> Ketuk kartu untuk melihat arti
              </p>
            )}
          </button>
          <div className="absolute right-3 top-3">
            <SpeakButton text={current.front} speech={current.reading} label="Putar kata Jepang" size={16} />
          </div>
        </div>

        <div className="border-t border-line p-4">
          {flipped ? (
            <div>
              <p className="mb-2 text-center text-[11px] text-muted">
                Pilih seberapa mudah kamu mengingat kartu ini. Angka 1–4 juga bisa dipakai dari keyboard.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {RATING_LABELS.map((label) => (
                  <button
                    key={label.rating}
                    type="button"
                    onClick={() => void rate(label.rating)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-center transition hover:-translate-y-0.5",
                      label.tone === "brand" && "border-brand/25 bg-brand-soft/60 hover:border-brand/50",
                      label.tone === "gold" && "border-gold/25 bg-gold-soft/70 hover:border-gold/50",
                      label.tone === "matcha" && "border-matcha/25 bg-matcha-soft hover:border-matcha/50",
                      label.tone === "indigo" && "border-indigo/25 bg-indigo-soft hover:border-indigo/50",
                    )}
                  >
                    <span className="block text-sm font-semibold">{label.label}</span>
                    <span className="mt-0.5 block text-[11px] text-muted">{label.hint}</span>
                    <span className="mt-1 block text-[10px] font-medium text-ink/70">+{estimateInterval(activeCard, label.rating)}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Button className="w-full" onClick={() => setFlipped(true)}>
              <Icon name="eye" size={16} /> Tampilkan jawaban
            </Button>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {flipped ? `Jawaban: ${current.back}. Pilih Lagi, Sulit, Bagus, atau Mudah.` : "Kartu tertutup. Tekan spasi untuk melihat jawaban."}
        </p>
      </Card>
    </div>
  );
}
