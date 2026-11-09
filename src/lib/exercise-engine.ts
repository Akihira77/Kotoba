import type {
  Exercise,
  ExerciseAttemptAnswer,
  ExerciseGrade,
  ExerciseKind,
  ExerciseResponse,
  ExerciseSessionMode,
  JLPTLevel,
  QuizAttempt,
} from "./types";
import { uid } from "./utils";

export const ALL_EXERCISE_KINDS: ExerciseKind[] = [
  "multiple-choice",
  "cloze",
  "translation",
  "matching",
  "reading-recognition",
  "listening",
  "ordering",
  "true-false",
  "typing",
];

export const EXERCISE_KIND_LABELS: Record<ExerciseKind, string> = {
  "multiple-choice": "Pilihan ganda",
  cloze: "Isi rumpang",
  translation: "Terjemahan",
  matching: "Mencocokkan",
  "reading-recognition": "Baca kana",
  listening: "Menyimak",
  ordering: "Susun kalimat",
  "true-false": "Benar / salah",
  typing: "Mengetik",
};

export const EXERCISE_KIND_HINTS: Record<ExerciseKind, string> = {
  "multiple-choice": "Pilih satu jawaban yang paling tepat.",
  cloze: "Lengkapi bagian kosong dengan kata yang tepat.",
  translation: "Tulis terjemahan dalam bahasa tujuan.",
  matching: "Pasangkan setiap kata Jepang dengan artinya.",
  "reading-recognition": "Pilih cara baca yang tepat.",
  listening: "Dengarkan audio, lalu pilih jawaban yang tepat.",
  ordering: "Susun potongan kata menjadi kalimat yang benar.",
  "true-false": "Tentukan apakah pernyataan ini benar atau salah.",
  typing: "Ketik jawabanmu, lalu periksa.",
};

/**
 * Normalisasi jawaban teks.
 *
 * Aturan ini sengaja konservatif: hanya perbedaan yang tidak mengubah makna
 * yang diabaikan (spasi, tanda baca, lebar karakter, huruf besar-kecil).
 * Perbedaan kanji/kana tidak disamakan otomatis; varian yang sah harus
 * dicantumkan eksplisit di acceptedAnswers.
 */
export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[−–—‐‑]/g, "-")
    .replace(/[\s。．、，,.!！?？;；:：'"“”‘’「」『』()（）\[\]【】〈〉《》…‥・]/g, "")
    .trim();
}

export function isAcceptedAnswer(value: string, acceptedAnswers: readonly string[]): boolean {
  const normalized = normalizeAnswer(value);
  if (!normalized) return false;
  return acceptedAnswers.some((answer) => normalizeAnswer(answer) === normalized);
}

function expectedFor(exercise: Exercise): string {
  switch (exercise.kind) {
    case "multiple-choice":
    case "reading-recognition":
    case "listening":
      return exercise.options[exercise.answerIndex] ?? "";
    case "cloze":
    case "typing":
      return exercise.answer;
    case "translation":
      return exercise.acceptedAnswers[0] ?? exercise.reference;
    case "matching":
      return exercise.pairs.map((pair) => `${pair.left} = ${pair.right}`).join(" · ");
    case "ordering":
      return exercise.answer.join("");
    case "true-false":
      return exercise.answer ? "Benar" : "Salah";
    default:
      return "";
  }
}

function gradeChoice(exercise: Exercise, selectedIndex: number): ExerciseGrade {
  const options =
    exercise.kind === "multiple-choice" || exercise.kind === "reading-recognition" || exercise.kind === "listening"
      ? exercise.options
      : [];
  const answerIndex =
    exercise.kind === "multiple-choice" || exercise.kind === "reading-recognition" || exercise.kind === "listening"
      ? exercise.answerIndex
      : -1;
  const valid = Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex < options.length;
  const correct = valid && selectedIndex === answerIndex;
  return {
    correct,
    score: correct ? 1 : 0,
    expected: options[answerIndex] ?? "",
    feedback: correct ? exercise.explanation : `Jawaban yang tepat: ${options[answerIndex] ?? "-"}. ${exercise.explanation}`,
  };
}

function gradeMatching(exercise: Extract<Exercise, { kind: "matching" }>, matches: Record<string, string>): ExerciseGrade {
  const total = exercise.pairs.length;
  const matched = exercise.pairs.filter((pair) => matches[pair.id] === pair.id).length;
  const score = total === 0 ? 0 : matched / total;
  const correct = total > 0 && matched === total;
  const expected = exercise.pairs.map((pair) => `${pair.left} = ${pair.right}`).join("; ");
  return {
    correct,
    score,
    expected,
    feedback: correct
      ? exercise.explanation
      : `${matched} dari ${total} pasangan benar. Pasangan yang tepat: ${expected}.`,
  };
}

function gradeOrdering(exercise: Extract<Exercise, { kind: "ordering" }>, order: number[]): ExerciseGrade {
  const picked = order
    .filter((index) => Number.isInteger(index) && index >= 0 && index < exercise.tokens.length)
    .map((index) => exercise.tokens[index]);
  const correct = picked.length === exercise.answer.length && picked.every((token, index) => token === exercise.answer[index]);
  return {
    correct,
    score: correct ? 1 : 0,
    expected: exercise.answer.join(""),
    feedback: correct
      ? exercise.explanation
      : `Urutan yang tepat: ${exercise.answer.join("")}. ${exercise.explanation}`,
  };
}

export function gradeExercise(exercise: Exercise, response: ExerciseResponse): ExerciseGrade {
  if (
    (exercise.kind === "multiple-choice" || exercise.kind === "reading-recognition" || exercise.kind === "listening") &&
    (response.kind === "multiple-choice" || response.kind === "reading-recognition" || response.kind === "listening")
  ) {
    return gradeChoice(exercise, response.selectedIndex);
  }

  if (
    (exercise.kind === "cloze" || exercise.kind === "translation" || exercise.kind === "typing") &&
    (response.kind === "cloze" || response.kind === "translation" || response.kind === "typing")
  ) {
    const accepted = exercise.kind === "cloze" || exercise.kind === "typing" ? [exercise.answer, ...exercise.acceptedAnswers] : exercise.acceptedAnswers;
    const correct = isAcceptedAnswer(response.text, accepted);
    return {
      correct,
      score: correct ? 1 : 0,
      expected: exercise.kind === "translation" ? (exercise.acceptedAnswers[0] ?? exercise.reference) : exercise.answer,
      feedback: correct
        ? exercise.explanation
        : `Jawaban yang tepat: ${exercise.kind === "translation" ? (exercise.acceptedAnswers[0] ?? exercise.reference) : exercise.answer}. ${exercise.explanation}`,
    };
  }

  if (exercise.kind === "matching" && response.kind === "matching") {
    return gradeMatching(exercise, response.matches);
  }

  if (exercise.kind === "ordering" && response.kind === "ordering") {
    return gradeOrdering(exercise, response.order);
  }

  if (exercise.kind === "true-false" && response.kind === "true-false") {
    const correct = response.value === exercise.answer;
    const expected = exercise.answer ? "Benar" : "Salah";
    return {
      correct,
      score: correct ? 1 : 0,
      expected,
      feedback: correct
        ? exercise.explanation
        : `Pernyataan ini ${expected.toLowerCase()}. ${exercise.correction ?? ""} ${exercise.explanation}`.trim(),
    };
  }

  return {
    correct: false,
    score: 0,
    expected: expectedFor(exercise),
    feedback: "Jenis jawaban tidak cocok dengan soal. Coba muat ulang latihan.",
  };
}

export interface ExerciseSummary {
  total: number;
  correct: number;
  answered: number;
  score: number;
  accuracy: number;
  totalScore: number;
}

export function summarizeAnswers(answers: readonly ExerciseAttemptAnswer[]): ExerciseSummary {
  const total = answers.length;
  const correct = answers.filter((answer) => answer.correct).length;
  const totalScore = answers.reduce((sum, answer) => sum + Math.max(0, Math.min(1, answer.score)), 0);
  const score = total === 0 ? 0 : Math.round((totalScore / total) * 100);
  const answered = answers.filter((answer) => answer.score > 0 || answer.correct).length;
  return { total, correct, answered, score, accuracy: total === 0 ? 0 : Math.round((correct / total) * 100), totalScore };
}

export interface CreateAttemptInput {
  mode: ExerciseSessionMode;
  title: string;
  level?: JLPTLevel;
  startedAt: string;
  durationSec: number;
  answers: ExerciseAttemptAnswer[];
  id?: string;
  finishedAt?: string;
}

export function createQuizAttempt(input: CreateAttemptInput): QuizAttempt {
  const summary = summarizeAnswers(input.answers);
  return {
    id: input.id ?? uid("quiz"),
    mode: input.mode,
    title: input.title,
    level: input.level,
    total: summary.total,
    correct: summary.correct,
    score: summary.score,
    durationSec: Math.max(0, Math.round(input.durationSec)),
    startedAt: input.startedAt,
    finishedAt: input.finishedAt ?? new Date().toISOString(),
    answers: input.answers,
  };
}

/** RNG deterministik (FNV-1a + LCG) untuk sesi latihan yang dapat diuji. */
export function rngFromSeed(seed: string | number): () => number {
  const text = String(seed);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function exerciseMeta(exercise: Exercise): { label: string; hint: string } {
  return {
    label: EXERCISE_KIND_LABELS[exercise.kind],
    hint: exercise.instructions || EXERCISE_KIND_HINTS[exercise.kind],
  };
}
