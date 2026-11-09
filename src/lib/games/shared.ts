import type { GameDifficulty } from "@/lib/types";
import { shuffle } from "@/lib/utils";

export type Rng = () => number;

export const GAME_DIFFICULTIES: GameDifficulty[] = ["easy", "standard", "hard"];

export const DIFFICULTY_LABELS: Record<GameDifficulty, string> = {
  easy: "Santai",
  standard: "Standar",
  hard: "Tantangan",
};

export const DIFFICULTY_DESCRIPTIONS: Record<GameDifficulty, string> = {
  easy: "Pemanasan dengan kosakata N5 dan waktu lebih longgar.",
  standard: "Campuran N5–N3 untuk latihan harian yang seimbang.",
  hard: "Level N4–N1 dengan waktu ketat dan kosakata lebih jarang.",
};

/** PRNG deterministik agar soal tidak berubah antara render server dan klien. */
export function seededRng(seed: string): Rng {
  let state = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }
  state >>>= 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function shuffled<T>(input: readonly T[], rng: Rng = Math.random): T[] {
  return shuffle([...input], rng);
}

export function pickOne<T>(input: readonly T[], rng: Rng = Math.random): T {
  return input[Math.floor(rng() * input.length)];
}

export function pickDistinct<T>(input: readonly T[], count: number, rng: Rng = Math.random, exclude?: (item: T) => boolean): T[] {
  const pool = shuffled(input.filter((item) => !exclude || !exclude(item)), rng);
  return pool.slice(0, count);
}

export function normalizeGameText(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

export function clampScore(value: number): number {
  return Math.max(0, Math.round(value));
}

/** XP dihitung dari performa, bukan dari angka skor mentah yang bisa dimanipulasi klien. */
export function estimateGameXp(correct: number, total: number, difficulty: GameDifficulty): number {
  if (total <= 0) return 0;
  const accuracy = Math.max(0, Math.min(1, correct / total));
  const difficultyBonus = difficulty === "hard" ? 10 : difficulty === "standard" ? 5 : 0;
  const perfectBonus = correct === total ? 5 : 0;
  return 10 + Math.round(accuracy * 20) + difficultyBonus + perfectBonus;
}

export function formatGameDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return minutes > 0 ? `${minutes}m ${rest}s` : `${rest}s`;
}
