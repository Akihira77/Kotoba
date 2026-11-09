import type { CardProgress, ItemKind } from "./types";

export type Rating = 0 | 1 | 2 | 3;

export const RATING_LABELS: Array<{ rating: Rating; label: string; hint: string; tone: string }> = [
  { rating: 0, label: "Lagi", hint: "Belum ingat", tone: "brand" },
  { rating: 1, label: "Sulit", hint: "Ingat susah payah", tone: "gold" },
  { rating: 2, label: "Bagus", hint: "Ingat dengan baik", tone: "matcha" },
  { rating: 3, label: "Mudah", hint: "Sangat mudah", tone: "indigo" },
];

/**
 * Penjadwal SRS terinspirasi SM-2.
 *
 * Empat tombol dipetakan ke kualitas SM-2:
 *   Lagi = 2, Sulit = 3, Bagus = 4, Mudah = 5.
 *
 * Perubahan ease mengikuti rumus SM-2:
 *   EF' = EF + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
 * sehingga Lagi -0.32, Sulit -0.14, Bagus 0, dan Mudah +0.10.
 * Nilai ease dibatasi 1.3..3.0.
 *
 * Interval memakai varian empat tombol yang tetap deterministik:
 *   Lagi  : 10 menit, interval 0, lapses +1
 *   Sulit : 1 hari bila baru, lalu 1.2x interval sebelumnya
 *   Bagus : 1 hari bila baru, 6 hari pada ulangan kedua, lalu interval * ease
 *   Mudah : 2 hari bila baru, 8 hari pada ulangan kedua, lalu interval * ease * 1.3
 *
 * Ulangan kedua ditentukan dari interval sebelumnya (1 hari), bukan dari
 * penghitung reps, agar kartu yang pernah lupa tetap kembali ke jalur normal.
 * Algoritma ini diuji di src/lib/srs.test.ts.
 */
const MIN_EASE = 1.3;
const MAX_EASE = 3.0;
const AGAIN_DELAY_MS = 10 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_INTERVAL_DAYS = 3650;

export const SM2_EASE_DELTA: Record<Rating, number> = {
  0: -0.32,
  1: -0.14,
  2: 0,
  3: 0.1,
};

export function nextEase(ease: number, rating: Rating): number {
  return Number(Math.min(MAX_EASE, Math.max(MIN_EASE, ease + SM2_EASE_DELTA[rating])).toFixed(2));
}

export function createCard(itemId: string, kind: ItemKind, now: Date = new Date()): CardProgress {
  return {
    itemId,
    kind,
    ease: 2.5,
    intervalDays: 0,
    dueAt: now.toISOString(),
    reps: 0,
    lapses: 0,
    lastRating: null,
    lastReviewedAt: null,
  };
}

export function scheduleCard(card: CardProgress, rating: Rating, now: Date = new Date()): CardProgress {
  const ease = nextEase(card.ease, rating);
  const previousInterval = card.intervalDays;
  let intervalDays = previousInterval;
  let lapses = card.lapses;
  const reps = card.reps + 1;
  let dueAt = now.getTime();

  if (rating === 0) {
    lapses += 1;
    intervalDays = 0;
    dueAt += AGAIN_DELAY_MS;
  } else if (rating === 1) {
    intervalDays = previousInterval === 0 ? 1 : Math.max(1, Math.round(previousInterval * 1.2));
    intervalDays = Math.min(MAX_INTERVAL_DAYS, intervalDays);
    dueAt += intervalDays * DAY_MS;
  } else if (rating === 2) {
    intervalDays = card.reps === 0 ? 1 : card.reps === 1 ? 6 : Math.max(1, Math.round(previousInterval * ease));
    intervalDays = Math.min(MAX_INTERVAL_DAYS, intervalDays);
    dueAt += intervalDays * DAY_MS;
  } else {
    intervalDays = card.reps === 0 ? 2 : card.reps === 1 ? 8 : Math.max(2, Math.round(previousInterval * ease * 1.3));
    intervalDays = Math.min(MAX_INTERVAL_DAYS, intervalDays);
    dueAt += intervalDays * DAY_MS;
  }

  return {
    ...card,
    ease,
    intervalDays,
    lapses,
    reps,
    dueAt: new Date(dueAt).toISOString(),
    lastRating: rating,
    lastReviewedAt: now.toISOString(),
  };
}

export function isDue(card: CardProgress, now: Date = new Date()): boolean {
  return new Date(card.dueAt).getTime() <= now.getTime();
}

export function estimateInterval(card: CardProgress, rating: Rating): string {
  const next = scheduleCard(card, rating);
  if (rating === 0 || next.intervalDays === 0) return "10 mnt";
  if (next.intervalDays === 1) return "1 hari";
  if (next.intervalDays < 30) return `${next.intervalDays} hari`;
  const months = Math.round(next.intervalDays / 30);
  if (months < 12) return `${months} bln`;
  return `${Math.round(months / 12)} thn`;
}

export function masteryLabel(reps: number, lapses: number): string {
  if (reps === 0) return "Baru";
  if (reps < 3 || lapses > 2) return "Belajar";
  if (reps < 6) return "Familiar";
  return "Dikuasai";
}

export interface DeckItem {
  id: string;
  kind: ItemKind;
}