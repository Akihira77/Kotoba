import { VOCABULARY } from "@/content/vocabulary";
import type { GameDifficulty, JLPTLevel, VocabWord } from "@/lib/types";
import { pickDistinct, seededRng, shuffled, type Rng } from "./shared";

export interface VocabularyRushQuestion {
  id: string;
  word: VocabWord;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface VocabularyRushConfig {
  seconds: number;
  totalQuestions: number;
  sequence: JLPTLevel[];
  hints: number;
}

export const VOCABULARY_RUSH_CONFIG: Record<GameDifficulty, VocabularyRushConfig> = {
  easy: {
    seconds: 70,
    totalQuestions: 30,
    sequence: Array.from({ length: 30 }, () => "N5" as const),
    hints: 3,
  },
  standard: {
    seconds: 60,
    totalQuestions: 36,
    sequence: [
      ...Array.from({ length: 8 }, () => "N5" as const),
      ...Array.from({ length: 8 }, () => "N4" as const),
      ...Array.from({ length: 8 }, () => "N3" as const),
      ...Array.from({ length: 6 }, () => "N2" as const),
      ...Array.from({ length: 6 }, () => "N1" as const),
    ],
    hints: 2,
  },
  hard: {
    seconds: 50,
    totalQuestions: 36,
    sequence: [
      ...Array.from({ length: 4 }, () => "N5" as const),
      ...Array.from({ length: 8 }, () => "N4" as const),
      ...Array.from({ length: 10 }, () => "N3" as const),
      ...Array.from({ length: 8 }, () => "N2" as const),
      ...Array.from({ length: 6 }, () => "N1" as const),
    ],
    hints: 1,
  },
};

function wordsByLevel(level: JLPTLevel): VocabWord[] {
  return VOCABULARY.filter((word) => word.level === level);
}

function makeQuestion(word: VocabWord, options: string[], answerIndex: number): VocabularyRushQuestion {
  return {
    id: `rush-${word.id}`,
    word,
    prompt: word.japanese,
    options,
    answerIndex,
    explanation: `「${word.japanese}」 dibaca ${word.kana} (${word.romaji}) dan berarti "${word.meaning}".`,
  };
}

export function buildVocabularyRushQuestions(
  difficulty: GameDifficulty,
  rng: Rng = Math.random,
): VocabularyRushQuestion[] {
  const config = VOCABULARY_RUSH_CONFIG[difficulty];
  const pools = new Map<JLPTLevel, { words: VocabWord[]; cursor: number }>();
  for (const level of ["N5", "N4", "N3", "N2", "N1"] as JLPTLevel[]) {
    pools.set(level, { words: shuffled(wordsByLevel(level), rng), cursor: 0 });
  }

  const questions: VocabularyRushQuestion[] = [];
  const seen = new Set<string>();
  for (const level of config.sequence) {
    if (questions.length >= config.totalQuestions) break;
    const pool = pools.get(level);
    if (!pool || pool.words.length === 0) continue;
    let word = pool.words[pool.cursor % pool.words.length];
    let attempts = 0;
    while (seen.has(word.id) && attempts < pool.words.length) {
      pool.cursor += 1;
      word = pool.words[pool.cursor % pool.words.length];
      attempts += 1;
    }
    pool.cursor += 1;
    if (seen.has(word.id)) continue;
    seen.add(word.id);

    const meaningPool = Array.from(
      new Set(
        VOCABULARY.filter((candidate) => candidate.id !== word.id && candidate.meaning !== word.meaning).map(
          (candidate) => candidate.meaning,
        ),
      ),
    );
    const distractors = pickDistinct(meaningPool, 3, rng);
    if (distractors.length < 3) continue;

    const answerIndex = Math.floor(rng() * 4);
    const options = [...distractors];
    options.splice(answerIndex, 0, word.meaning);
    questions.push(makeQuestion(word, options, answerIndex));
  }

  return questions;
}

export function vocabularyRushQuestionsWithSeed(difficulty: GameDifficulty, seed: string): VocabularyRushQuestion[] {
  return buildVocabularyRushQuestions(difficulty, seededRng(seed));
}

const LEVEL_SCORE: Record<JLPTLevel, number> = { N5: 0, N4: 3, N3: 6, N2: 10, N1: 15 };

export function vocabularyRushPoints(level: JLPTLevel, combo: number, hintUsed: boolean): number {
  const comboBonus = Math.min(10, Math.max(0, combo) * 2);
  const hintPenalty = hintUsed ? 5 : 0;
  return Math.max(5, 10 + LEVEL_SCORE[level] + comboBonus - hintPenalty);
}

/** Pilih dua opsi salah untuk petunjuk 50:50. */
export function rushHintIndices(question: VocabularyRushQuestion, rng: Rng = Math.random): number[] {
  const wrong = question.options
    .map((_, index) => index)
    .filter((index) => index !== question.answerIndex);
  return pickDistinct(wrong, 2, rng).sort((a, b) => a - b);
}

export function rushLevelLabel(level: JLPTLevel): string {
  return `Kosakata ${level}`;
}
