import { VOCABULARY } from "@/content/vocabulary";
import type { GameDifficulty, VocabWord } from "@/lib/types";
import { kanaLength, toMorae } from "./morae";
import { pickDistinct, shuffled, type Rng } from "./shared";

export interface WordBuilderRound {
  id: string;
  target: VocabWord;
  tiles: string[];
  decoys: string[];
  hint: string;
}

export interface WordBuilderConfig {
  rounds: number;
  decoys: number;
  maxMorae: number;
  levels: VocabWord["level"][];
  seconds: number;
}

export const WORD_BUILDER_CONFIG: Record<GameDifficulty, WordBuilderConfig> = {
  easy: { rounds: 5, decoys: 2, maxMorae: 4, levels: ["N5"], seconds: 240 },
  standard: { rounds: 6, decoys: 3, maxMorae: 6, levels: ["N5", "N4"], seconds: 210 },
  hard: { rounds: 8, decoys: 4, maxMorae: 8, levels: ["N4", "N3", "N2", "N1"], seconds: 180 },
};

const VOCAB_BY_KANA = new Map<string, VocabWord>();
for (const word of VOCABULARY) {
  if (!VOCAB_BY_KANA.has(word.kana)) VOCAB_BY_KANA.set(word.kana, word);
}

const ALL_MORAE = Array.from(new Set(VOCABULARY.flatMap((word) => toMorae(word.kana))));

function eligibleWords(difficulty: GameDifficulty): VocabWord[] {
  const config = WORD_BUILDER_CONFIG[difficulty];
  return VOCABULARY.filter(
    (word) =>
      config.levels.includes(word.level) &&
      kanaLength(word.kana) >= 2 &&
      kanaLength(word.kana) <= config.maxMorae &&
      /^[\u3040-\u30ffー]+$/.test(word.kana),
  );
}

export function buildWordBuilderRounds(difficulty: GameDifficulty, rng: Rng = Math.random): WordBuilderRound[] {
  const config = WORD_BUILDER_CONFIG[difficulty];
  const pool = shuffled(eligibleWords(difficulty), rng);
  const chosen: VocabWord[] = [];
  const seen = new Set<string>();
  for (const word of pool) {
    if (seen.has(word.kana)) continue;
    chosen.push(word);
    seen.add(word.kana);
    if (chosen.length >= config.rounds) break;
  }

  return chosen.map((target, index) => {
    const needed = toMorae(target.kana);
    const decoys = pickDistinct(
      ALL_MORAE,
      config.decoys,
      rng,
      (tile) => needed.includes(tile),
    );
    const tiles = shuffled([...needed, ...decoys], rng);
    return {
      id: `${target.id}-wb-${index + 1}`,
      target,
      tiles,
      decoys,
      hint: `Kata ini memiliki ${needed.length} mora. Mora pertama adalah 「${needed[0]}」.`,
    };
  });
}

export type WordBuildStatus = "correct" | "alternate" | "incomplete" | "invalid" | "empty";

export interface WordBuildCheck {
  status: WordBuildStatus;
  accepted: boolean;
  word?: VocabWord;
  message: string;
}

/** Validasi dilakukan terhadap kamus, bukan sekadar mencocokkan target. */
export function checkWordBuild(input: string, target: VocabWord): WordBuildCheck {
  const clean = input.normalize("NFKC").trim();
  if (!clean) {
    return { status: "empty", accepted: false, message: "Susun dulu beberapa ubin kana." };
  }
  const found = VOCAB_BY_KANA.get(clean);
  if (found && found.id === target.id) {
    return {
      status: "correct",
      accepted: true,
      word: found,
      message: `Tepat! 「${found.japanese}」 berarti "${found.meaning}".`,
    };
  }
  if (found) {
    return {
      status: "alternate",
      accepted: true,
      word: found,
      message: `Kata 「${clean}」 juga valid dalam kamus: "${found.meaning}". Target hari ini 「${target.kana}」.`,
    };
  }
  if (target.kana.startsWith(clean)) {
    return {
      status: "incomplete",
      accepted: false,
      message: "Susunannya sudah mengarah ke kata yang benar. Tambahkan ubin berikutnya.",
    };
  }
  return {
    status: "invalid",
    accepted: false,
    message: `「${clean}」 belum ada sebagai kata dalam kamus Kotoba. Periksa urutan mora atau hapus satu ubin.`,
  };
}

export function wordBuilderPoints(word: VocabWord, difficulty: GameDifficulty, hintsUsed: number): number {
  const levelBonus: Record<VocabWord["level"], number> = { N5: 0, N4: 8, N3: 16, N2: 28, N1: 40 };
  const lengthBonus = kanaLength(word.kana) * 4;
  const difficultyMultiplier = difficulty === "hard" ? 1.5 : difficulty === "standard" ? 1.2 : 1;
  const hintPenalty = hintsUsed * 8;
  return Math.max(10, Math.round((12 + lengthBonus + levelBonus[word.level]) * difficultyMultiplier) - hintPenalty);
}

export function wordBuilderHint(round: WordBuilderRound, revealed: number): string {
  const morae = toMorae(round.target.kana);
  const visible = morae.slice(0, Math.max(1, Math.min(morae.length, revealed))).join("");
  return `Awal kata: 「${visible}…」 (${morae.length} mora).`;
}
