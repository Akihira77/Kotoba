import { HIRAGANA, KATAKANA } from "@/content/kana";
import type { GameDifficulty, Kana, KanaGroup } from "@/lib/types";
import { pickDistinct, seededRng, shuffled, type Rng } from "./shared";

export type KanaMatchingMode = "hiragana-romaji" | "katakana-romaji" | "kana-vocab" | "kana-audio";

export interface KanaMatchingModeInfo {
  id: KanaMatchingMode;
  label: string;
  description: string;
}

export const KANA_MATCHING_MODES: KanaMatchingModeInfo[] = [
  {
    id: "hiragana-romaji",
    label: "Hiragana ↔ Romaji",
    description: "Cocokkan bentuk hiragana dengan cara bacanya.",
  },
  {
    id: "katakana-romaji",
    label: "Katakana ↔ Romaji",
    description: "Latih pengenalan katakana, termasuk bunyi serapan.",
  },
  {
    id: "kana-vocab",
    label: "Kana ↔ Kosakata",
    description: "Temukan kata contoh yang memakai kana tersebut.",
  },
  {
    id: "kana-audio",
    label: "Dengar ↔ Kana",
    description: "Dengarkan pelafalan, lalu temukan kana yang sesuai.",
  },
];

export interface KanaMatchPair {
  id: string;
  char: string;
  script: Kana["script"];
  romaji: string;
  matchLabel: string;
  matchSub?: string;
  exampleWord?: string;
  audioText: string;
}

export interface KanaMatchCard {
  id: string;
  pairId: string;
  face: "prompt" | "match";
  label: string;
  sub?: string;
  audioText?: string;
  audioOnly: boolean;
}

export interface KanaMatchingRound {
  mode: KanaMatchingMode;
  difficulty: GameDifficulty;
  pairs: KanaMatchPair[];
  cards: KanaMatchCard[];
}

export const KANA_MATCH_COUNTS: Record<GameDifficulty, number> = {
  easy: 4,
  standard: 6,
  hard: 8,
};

const BASIC_ROWS = new Set(["a", "ka", "sa", "ta", "na", "ha", "ma", "ya", "ra", "wa", "n"]);

function poolFor(mode: KanaMatchingMode, difficulty: GameDifficulty): Kana[] {
  if (mode === "katakana-romaji") {
    const groups: KanaGroup[] = difficulty === "easy" ? ["basic"] : difficulty === "standard" ? ["basic", "dakuten", "handakuten"] : ["basic", "dakuten", "handakuten", "yoon"];
    return KATAKANA.filter((item) => groups.includes(item.group));
  }
  if (mode === "kana-vocab") {
    return HIRAGANA.filter((item) => item.examples.length > 0 && (difficulty === "easy" ? item.group === "basic" : difficulty === "standard" ? item.group !== "yoon" : true));
  }
  if (mode === "kana-audio") {
    const groups: KanaGroup[] = difficulty === "easy" ? ["basic"] : difficulty === "standard" ? ["basic", "dakuten", "handakuten"] : ["basic", "dakuten", "yoon"];
    return HIRAGANA.filter((item) => groups.includes(item.group));
  }
  const groups: KanaGroup[] = difficulty === "easy" ? ["basic"] : difficulty === "standard" ? ["basic", "dakuten", "handakuten"] : ["basic", "dakuten", "yoon"];
  return HIRAGANA.filter((item) => groups.includes(item.group) && (difficulty !== "easy" || BASIC_ROWS.has(item.row)));
}

function pairFor(entry: Kana, mode: KanaMatchingMode): KanaMatchPair | null {
  const base = {
    id: `kana-${entry.script}-${entry.char}`,
    char: entry.char,
    script: entry.script,
    romaji: entry.romaji,
    audioText: entry.char,
  };
  if (mode === "hiragana-romaji" || mode === "katakana-romaji") {
    return { ...base, matchLabel: entry.romaji };
  }
  if (mode === "kana-audio") {
    return { ...base, matchLabel: entry.char };
  }
  const example = entry.examples.find((item) => (item.reading ?? item.word).includes(entry.char));
  if (!example) return null;
  return {
    ...base,
    matchLabel: example.word,
    matchSub: example.meaning,
    exampleWord: example.word,
  };
}

export function buildKanaMatchingRound(
  mode: KanaMatchingMode,
  difficulty: GameDifficulty,
  rng: Rng = Math.random,
): KanaMatchingRound {
  const count = KANA_MATCH_COUNTS[difficulty];
  const entries = shuffled(poolFor(mode, difficulty), rng);
  const pairs: KanaMatchPair[] = [];
  const usedExamples = new Set<string>();
  const usedRomaji = new Set<string>();
  for (const entry of entries) {
    if (pairs.length >= count) break;
    const pair = pairFor(entry, mode);
    if (!pair) continue;
    if (mode === "kana-vocab" && usedExamples.has(pair.matchLabel)) continue;
    if (mode !== "kana-vocab" && usedRomaji.has(pair.romaji)) continue;
    pairs.push(pair);
    usedRomaji.add(pair.romaji);
    if (pair.exampleWord) usedExamples.add(pair.exampleWord);
  }

  // Fallback sangat jarang terjadi; pastikan jumlah kartu tetap genap.
  if (pairs.length < count) {
    for (const entry of entries) {
      if (pairs.length >= count) break;
      if (pairs.some((pair) => pair.char === entry.char)) continue;
      const pair = pairFor(entry, mode);
      if (pair) pairs.push(pair);
    }
  }

  const cards: KanaMatchCard[] = [];
  for (const pair of pairs) {
    cards.push({
      id: `${pair.id}-prompt`,
      pairId: pair.id,
      face: "prompt",
      label: mode === "kana-audio" ? "Dengarkan" : pair.char,
      audioText: pair.audioText,
      audioOnly: mode === "kana-audio",
    });
    cards.push({
      id: `${pair.id}-match`,
      pairId: pair.id,
      face: "match",
      label: pair.matchLabel,
      sub: pair.matchSub,
      audioOnly: false,
    });
  }

  return { mode, difficulty, pairs, cards: shuffled(cards, rng) };
}

export function kanaMatchPoints(pairs: number, mismatches: number, elapsedSec: number, hints: number): number {
  const base = pairs * 100;
  const penalty = mismatches * 12 + hints * 25;
  const timeBonus = Math.max(0, 180 - Math.round(elapsedSec * 2));
  return Math.max(20, base - penalty + timeBonus);
}

export function kanaMatchExplanation(pairs: readonly KanaMatchPair[]): string {
  return pairs.map((pair) => `${pair.char} = ${pair.romaji}${pair.exampleWord ? ` — ${pair.exampleWord} (${pair.matchSub})` : ""}`).join("; ");
}

export function kanaMatchSeed(mode: KanaMatchingMode, difficulty: GameDifficulty): string {
  return `kana-match-${mode}-${difficulty}-${Date.now()}`;
}

/** Hanya untuk pengujian determinisme. */
export function kanaMatchRoundWithSeed(mode: KanaMatchingMode, difficulty: GameDifficulty, seed: string): KanaMatchingRound {
  return buildKanaMatchingRound(mode, difficulty, seededRng(seed));
}

export function kanaMatchHints(difficulty: GameDifficulty): number {
  return difficulty === "hard" ? 2 : 3;
}

export function kanaMatchPairLabel(pair: KanaMatchPair): string {
  return pair.exampleWord ? `${pair.char} → ${pair.exampleWord}` : `${pair.char} → ${pair.romaji}`;
}

export function remainingPairs<T extends { pairId: string }>(cards: readonly T[], matched: ReadonlySet<string>): T[] {
  return cards.filter((card) => !matched.has(card.pairId));
}

export function pickKanaHintPair(cards: readonly KanaMatchCard[], matched: ReadonlySet<string>, rng: Rng = Math.random): string | null {
  const pool = cards.filter((card) => !matched.has(card.pairId));
  if (pool.length === 0) return null;
  return pickDistinct(pool, 1, rng)[0]?.pairId ?? null;
}
