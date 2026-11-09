import { GRAMMAR } from "@/content/grammar";
import { HIRAGANA, KATAKANA } from "@/content/kana";
import { KANJI } from "@/content/kanji";
import { VOCABULARY } from "@/content/vocabulary";
import type { GameDifficulty, JLPTLevel, QuizQuestion } from "@/lib/types";
import { pickDistinct, seededRng, type Rng } from "./shared";

export type DailyQuestionKind = "kosakata" | "kana" | "kanji" | "tata-bahasa";

export interface DailyChallengeQuestion {
  id: string;
  kind: DailyQuestionKind;
  prompt: string;
  promptJp?: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  level: JLPTLevel;
}

export interface DailyChallenge {
  dateKey: string;
  difficulty: GameDifficulty;
  seconds: number;
  hints: number;
  questions: DailyChallengeQuestion[];
}

export const DAILY_CHALLENGE_SECONDS = 240;
export const DAILY_CHALLENGE_HINTS = 2;
export const DAILY_QUESTION_COUNT = 10;

const ALL_KANA = [...HIRAGANA, ...KATAKANA];

function optionSet(correct: string, pool: readonly string[], rng: Rng, count = 3): { options: string[]; answerIndex: number } | null {
  const uniquePool = Array.from(new Set(pool.filter((value) => value !== correct)));
  const distractors = pickDistinct(uniquePool, count, rng);
  if (distractors.length < count) return null;
  const answerIndex = Math.floor(rng() * (count + 1));
  const options = [...distractors];
  options.splice(answerIndex, 0, correct);
  return { options, answerIndex };
}

function vocabQuestion(index: number, rng: Rng): DailyChallengeQuestion | null {
  const words = VOCABULARY;
  const word = words[Math.floor(rng() * words.length)];
  const choices = optionSet(word.meaning, VOCABULARY.map((item) => item.meaning), rng);
  if (!word || !choices) return null;
  return {
    id: `daily-vocab-${index}`,
    kind: "kosakata",
    prompt: "Apa arti kata berikut?",
    promptJp: word.japanese,
    options: choices.options,
    answerIndex: choices.answerIndex,
    explanation: `${word.japanese} (${word.kana}) berarti "${word.meaning}".${word.examples[0] ? ` Contoh: ${word.examples[0].jp} — ${word.examples[0].meaning}.` : ""}`,
    level: word.level,
  };
}

function kanaQuestion(index: number, rng: Rng): DailyChallengeQuestion | null {
  const item = ALL_KANA[Math.floor(rng() * ALL_KANA.length)];
  const choices = optionSet(item.romaji, ALL_KANA.map((kana) => kana.romaji), rng);
  if (!item || !choices) return null;
  const example = item.examples[0];
  return {
    id: `daily-kana-${index}`,
    kind: "kana",
    prompt: `Kana 「${item.char}」 dibaca…`,
    promptJp: item.char,
    options: choices.options,
    answerIndex: choices.answerIndex,
    explanation: `${item.char} dibaca ${item.romaji}.${example ? ` Contoh: ${example.word} (${example.meaning}).` : ""}`,
    level: "N5",
  };
}

function kanjiQuestion(index: number, rng: Rng): DailyChallengeQuestion | null {
  const item = KANJI[Math.floor(rng() * KANJI.length)];
  const choices = optionSet(item.char, KANJI.map((kanji) => kanji.char), rng);
  if (!item || !choices) return null;
  return {
    id: `daily-kanji-${index}`,
    kind: "kanji",
    prompt: "Pilih kanji yang sesuai dengan arti berikut.",
    promptJp: item.meanings.join(", "),
    options: choices.options,
    answerIndex: choices.answerIndex,
    explanation: `Kanji ${item.char} berarti ${item.meanings.join(", ")}. On'yomi ${item.on.join("、") || "—"}; kun'yomi ${item.kun.join("、") || "—"}.`,
    level: item.level,
  };
}

function grammarQuestion(index: number, rng: Rng): DailyChallengeQuestion | null {
  const levels: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];
  const level = levels[Math.floor(rng() * levels.length)];
  const points = GRAMMAR.filter((point) => point.level === level);
  const pool = points.length > 0 ? points : GRAMMAR;
  const point = pool[Math.floor(rng() * pool.length)];
  const practice = point?.practice ?? [];
  if (!point || practice.length === 0) return null;
  const quiz: QuizQuestion = practice[Math.floor(rng() * practice.length)];
  if (!quiz || quiz.options.length < 2 || quiz.answerIndex < 0) return null;
  return {
    id: `daily-grammar-${index}`,
    kind: "tata-bahasa",
    prompt: quiz.prompt,
    options: quiz.options,
    answerIndex: quiz.answerIndex,
    explanation: `${quiz.explanation} Pola: ${point.pattern} — ${point.meaning}.`,
    level: quiz.level,
  };
}

const BUILDERS: Record<DailyQuestionKind, (index: number, rng: Rng) => DailyChallengeQuestion | null> = {
  kosakata: vocabQuestion,
  kana: kanaQuestion,
  kanji: kanjiQuestion,
  "tata-bahasa": grammarQuestion,
};

const DAILY_BLUEPRINT: DailyQuestionKind[] = [
  "kosakata", "kana", "kanji", "tata-bahasa", "kosakata",
  "kanji", "kana", "tata-bahasa", "kosakata", "kanji",
];

export function buildDailyChallenge(dateKey: string, difficulty: GameDifficulty = "standard"): DailyChallenge {
  const rng = seededRng(`daily-${dateKey}-${difficulty}`);
  const questions: DailyChallengeQuestion[] = [];
  for (const [index, kind] of DAILY_BLUEPRINT.entries()) {
    const question = BUILDERS[kind](index, rng);
    if (question) questions.push(question);
  }
  return {
    dateKey,
    difficulty,
    seconds: DAILY_CHALLENGE_SECONDS,
    hints: DAILY_CHALLENGE_HINTS,
    questions: questions.slice(0, DAILY_QUESTION_COUNT),
  };
}

export function dailyRandomHintIndices(question: DailyChallengeQuestion, rng: Rng = Math.random): number[] {
  return pickDistinct(
    question.options.map((_, index) => index).filter((index) => index !== question.answerIndex),
    2,
    rng,
  );
}

export function dailyPoints(question: DailyChallengeQuestion, combo: number, hintUsed: boolean): number {
  const levelBonus = question.level === "N5" ? 0 : question.level === "N4" ? 4 : question.level === "N3" ? 9 : question.level === "N2" ? 15 : 22;
  return Math.max(5, 14 + levelBonus + Math.min(10, Math.max(0, combo) * 2) - (hintUsed ? 6 : 0));
}

export function dailyKindLabel(kind: DailyQuestionKind): string {
  return kind === "kosakata" ? "Kosakata" : kind === "kana" ? "Kana" : kind === "kanji" ? "Kanji" : "Tata bahasa";
}