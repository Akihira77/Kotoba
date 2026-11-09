import { SENTENCES } from "@/content/sentences";
import type { GameDifficulty, JLPTLevel, SentenceItem } from "@/lib/types";
import { seededRng, shuffled, type Rng } from "./shared";

export interface SentenceChallengeConfig {
  rounds: number;
  levels: JLPTLevel[];
  hintCost: number;
}

export const SENTENCE_CHALLENGE_CONFIG: Record<GameDifficulty, SentenceChallengeConfig> = {
  easy: { rounds: 5, levels: ["N5"], hintCost: 20 },
  standard: { rounds: 6, levels: ["N5", "N4"], hintCost: 30 },
  hard: { rounds: 7, levels: ["N3", "N2", "N1"], hintCost: 40 },
};

export function buildSentenceChallenge(difficulty: GameDifficulty, rng: Rng = Math.random): SentenceItem[] {
  const config = SENTENCE_CHALLENGE_CONFIG[difficulty];
  const pool = shuffled(
    SENTENCES.filter((item) => config.levels.includes(item.level)),
    rng,
  );
  return pool.slice(0, Math.min(config.rounds, pool.length));
}

export function sentenceChallengeWithSeed(difficulty: GameDifficulty, seed: string): SentenceItem[] {
  return buildSentenceChallenge(difficulty, seededRng(seed));
}

export function sentenceTokens(item: SentenceItem): string[] {
  return item.answer.map((token, index) => `${index}:${token}`);
}

export function sentenceScore(correct: boolean, hintUsed: boolean, attempted: boolean, difficulty: GameDifficulty): number {
  if (!correct) return 0;
  const base = attempted ? 55 : 100;
  const difficultyBonus = difficulty === "hard" ? 25 : difficulty === "standard" ? 12 : 0;
  return Math.max(10, base + difficultyBonus - (hintUsed ? 20 : 0));
}

export function sentenceHint(item: SentenceItem): string {
  const explanation = item.explanation.trim();
  return explanation.length > 0
    ? `Petunjuk: ${explanation}`
    : `Petunjuk: kalimat dimulai dengan 「${item.answer[0]}」.`;
}

export function canonSentenceAnswer(tokens: readonly string[]): string {
  return tokens.join("");
}

export function checkSentenceAnswer(item: SentenceItem, tokens: readonly string[]): boolean {
  return canonSentenceAnswer(tokens) === canonSentenceAnswer(item.answer);
}
