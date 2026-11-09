import { KANJI } from "@/content/kanji";
import type { GameDifficulty, JLPTLevel, Kanji } from "@/lib/types";
import { kanaLength } from "./morae";
import { pickDistinct, seededRng, shuffled, type Rng } from "./shared";

export type KanjiQuestionType = "meaning" | "reading" | "vocab";

export interface KanjiChallengeQuestion {
  id: string;
  type: KanjiQuestionType;
  kanji: Kanji;
  prompt: string;
  promptJp?: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  level: JLPTLevel;
}

export interface KanjiChallengeConfig {
  rounds: number;
  seconds: number;
  levels: JLPTLevel[];
  hints: number;
}

export const KANJI_CHALLENGE_CONFIG: Record<GameDifficulty, KanjiChallengeConfig> = {
  easy: { rounds: 10, seconds: 110, levels: ["N5"], hints: 3 },
  standard: { rounds: 12, seconds: 90, levels: ["N5", "N4"], hints: 2 },
  hard: { rounds: 14, seconds: 75, levels: ["N4", "N3", "N2", "N1"], hints: 1 },
};

const ALL_READINGS = Array.from(new Set(KANJI.flatMap((item) => [...item.on, ...item.kun]))).filter(Boolean);
const ALL_MEANINGS = Array.from(new Set(KANJI.flatMap((item) => item.meanings))).filter(Boolean);
const TYPE_ORDER: KanjiQuestionType[] = ["meaning", "reading", "vocab"];

function readingOf(item: Kanji, rng: Rng): string {
  const readings = [...item.kun, ...item.on].filter(Boolean);
  return readings[Math.floor(rng() * readings.length)] ?? item.on[0] ?? item.kun[0] ?? "—";
}

function makeQuestion(item: Kanji, type: KanjiQuestionType, rng: Rng, index: number): KanjiChallengeQuestion | null {
  if (type === "meaning") {
    const correct = item.meanings[0];
    const distractors = pickDistinct(
      ALL_MEANINGS,
      3,
      rng,
      (meaning) => item.meanings.includes(meaning),
    );
    if (!correct || distractors.length < 3) return null;
    const answerIndex = Math.floor(rng() * 4);
    const options = [...distractors];
    options.splice(answerIndex, 0, correct);
    return {
      id: `kanji-${item.char}-${index}`,
      type,
      kanji: item,
      prompt: `Apa arti kanji 「${item.char}」?`,
      options,
      answerIndex,
      explanation: `Kanji 「${item.char}」 memiliki arti ${item.meanings.join(", ")}. On'yomi: ${item.on.join("、") || "—"}; kun'yomi: ${item.kun.join("、") || "—"}.`,
      level: item.level,
    };
  }

  if (type === "reading") {
    const correct = readingOf(item, rng);
    if (!correct) return null;
    const invalid = new Set([...item.on, ...item.kun]);
    const distractors = pickDistinct(ALL_READINGS, 3, rng, (reading) => invalid.has(reading));
    if (distractors.length < 3) return null;
    const answerIndex = Math.floor(rng() * 4);
    const options = [...distractors];
    options.splice(answerIndex, 0, correct);
    return {
      id: `kanji-${item.char}-${index}`,
      type,
      kanji: item,
      prompt: `Pilih salah satu bacaan kanji 「${item.char}」.`,
      options,
      answerIndex,
      explanation: `Bacaan yang benar: ${correct}. On'yomi: ${item.on.join("、") || "—"}; kun'yomi: ${item.kun.join("、") || "—"}. Bacaan lain bisa muncul pada kata yang berbeda.`,
      level: item.level,
    };
  }

  const example = item.examples[0];
  if (!example) return null;
  const correct = item.meanings[0];
  const distractors = pickDistinct(ALL_MEANINGS, 3, rng, (meaning) => item.meanings.includes(meaning));
  if (!correct || distractors.length < 3) return null;
  const answerIndex = Math.floor(rng() * 4);
  const options = [...distractors];
  options.splice(answerIndex, 0, correct);
  return {
    id: `kanji-${item.char}-${index}`,
    type,
    kanji: item,
    prompt: `Kanji 「${item.char}」 pada kata 「${example.word}」 berarti…`,
    promptJp: example.word,
    options,
    answerIndex,
    explanation: `${example.word} (${example.reading}) berarti ${example.meaning}. Kanji ${item.char} di sini membawa arti ${item.meanings.join(", ")}.`,
    level: item.level,
  };
}

export function buildKanjiChallenge(difficulty: GameDifficulty, rng: Rng = Math.random): KanjiChallengeQuestion[] {
  const config = KANJI_CHALLENGE_CONFIG[difficulty];
  const pool = shuffled(KANJI.filter((item) => config.levels.includes(item.level)), rng);
  const questions: KanjiChallengeQuestion[] = [];
  let typeIndex = 0;
  for (const item of pool) {
    if (questions.length >= config.rounds) break;
    const type = TYPE_ORDER[typeIndex % TYPE_ORDER.length];
    typeIndex += 1;
    const question = makeQuestion(item, type, rng, questions.length);
    if (question) questions.push(question);
  }
  return questions;
}

export function kanjiChallengeWithSeed(difficulty: GameDifficulty, seed: string): KanjiChallengeQuestion[] {
  return buildKanjiChallenge(difficulty, seededRng(seed));
}

const TYPE_BONUS: Record<KanjiQuestionType, number> = { meaning: 0, reading: 5, vocab: 8 };

export function kanjiPoints(question: KanjiChallengeQuestion, combo: number, hintUsed: boolean): number {
  const levelBonus = question.level === "N5" ? 0 : question.level === "N4" ? 4 : question.level === "N3" ? 9 : question.level === "N2" ? 15 : 22;
  const comboBonus = Math.min(12, Math.max(0, combo) * 2);
  return Math.max(5, 12 + TYPE_BONUS[question.type] + levelBonus + comboBonus - (hintUsed ? 6 : 0));
}

export function kanjiHintIndices(question: KanjiChallengeQuestion, rng: Rng = Math.random): number[] {
  const wrong = question.options.map((_, index) => index).filter((index) => index !== question.answerIndex);
  return pickDistinct(wrong, 2, rng).sort((a, b) => a - b);
}

export function kanjiTypeLabel(type: KanjiQuestionType): string {
  return type === "meaning" ? "Arti" : type === "reading" ? "Bacaan" : "Kanji dalam kata";
}

export function kanjiQuestionLength(question: KanjiChallengeQuestion): number {
  return kanaLength(question.promptJp ?? question.kanji.char);
}
