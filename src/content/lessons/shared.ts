import type { JLPTLevel, QuizQuestion, QuestionType } from "@/lib/types";

/**
 * Pilihan jawaban diacak secara deterministik agar build stabil, tetapi
 * jawaban benar tidak selalu berada di posisi yang sama.
 */
export function buildOptions(
  correct: string,
  pool: string[],
  seed = 0,
): { options: string[]; answerIndex: number } {
  const unique = Array.from(new Set(pool.filter((item) => item.length > 0 && item !== correct)));
  const distractors: string[] = [];

  for (let index = 0; index < unique.length && distractors.length < 3; index += 1) {
    distractors.push(unique[(index + seed) % unique.length]);
  }

  if (distractors.length < 3) {
    throw new Error("Butuh minimal 4 pilihan unik untuk soal: " + correct);
  }

  const ordered = [correct, ...distractors];
  const shift = Math.abs(seed) % ordered.length;
  const options = [...ordered.slice(shift), ...ordered.slice(0, shift)];

  return { options, answerIndex: options.indexOf(correct) };
}

interface QuestionInput {
  id: string;
  type: QuestionType;
  level: JLPTLevel;
  prompt: string;
  correct: string;
  pool: string[];
  explanation: string;
  seed?: number;
  promptJp?: string;
  audioText?: string;
}

export function makeQuestion(input: QuestionInput): QuizQuestion {
  const { options, answerIndex } = buildOptions(input.correct, input.pool, input.seed ?? 0);
  return {
    id: input.id,
    type: input.type,
    level: input.level,
    prompt: input.prompt,
    promptJp: input.promptJp,
    options,
    answerIndex,
    explanation: input.explanation,
    audioText: input.audioText,
  };
}

/** Ambil sejumlah item unik dengan rotasi deterministik. */
export function sampleDistinct<T>(items: T[], count: number, seed = 0): T[] {
  if (items.length === 0) return [];
  const result: T[] = [];
  const total = Math.min(count, items.length);

  for (let index = 0; index < total; index += 1) {
    result.push(items[(index + seed) % items.length]);
  }

  return result;
}

export function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export function posSummary(entries: { pos: string; count: number }[], labels: Record<string, string>): string {
  return entries
    .map((entry) => (labels[entry.pos] ?? entry.pos) + " (" + entry.count + ")")
    .join(", ");
}
