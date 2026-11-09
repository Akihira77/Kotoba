import { CULTURE } from "@/content/culture";
import { GRAMMAR } from "@/content/grammar";
import { LESSON_PLANS } from "@/content/lessons";
import { LISTENING } from "@/content/listening";
import { LISTENING_DRILLS } from "@/content/listening-drills";
import { READING } from "@/content/reading";
import { buildExerciseCatalog } from "@/lib/exercise-catalog";
import { normalizeAnswer } from "@/lib/exercise-engine";
import type { QuizQuestion } from "@/lib/types";

export type QaSeverity = "error" | "warning";

export interface QaIssue {
  id: string;
  source: string;
  severity: QaSeverity;
  message: string;
}

interface ChoiceInput {
  id: string;
  source: string;
  prompt: string;
  options: readonly string[];
  answerIndex: number;
  explanation: string;
}

/**
 * Pemeriksa semantik ringan untuk bank soal. Validator ini tidak menilai
 * kebenaran tata bahasa; ia menangkap kesalahan struktural yang sering lolos
 * dari typecheck dan hampir selalu membuat soal tidak bisa dijawab.
 */
export function validateChoiceQuestion(input: ChoiceInput): QaIssue[] {
  const issues: QaIssue[] = [];
  const add = (severity: QaSeverity, message: string) => issues.push({ id: input.id, source: input.source, severity, message });

  if (!input.prompt.trim()) add("error", "Prompt kosong.");
  if (!input.explanation.trim()) add("warning", "Pembahasan kosong.");
  if (input.options.length < 2) add("error", "Butuh minimal 2 pilihan.");
  if (!Number.isInteger(input.answerIndex) || input.answerIndex < 0 || input.answerIndex >= input.options.length) {
    add("error", "answerIndex di luar rentang pilihan: " + input.answerIndex);
  }

  const seen = new Map<string, number>();
  input.options.forEach((option, index) => {
    if (!option.trim()) add("error", "Pilihan " + index + " kosong.");
    const key = normalizeAnswer(option);
    if (!key) add("error", "Pilihan " + index + " kosong setelah normalisasi.");
    const previous = seen.get(key);
    if (previous !== undefined) add("error", "Pilihan " + index + " duplikat dengan pilihan " + previous + ": " + option);
    else seen.set(key, index);
  });

  return issues;
}

function quizBank(source: string, questions: readonly QuizQuestion[]): { source: string; questions: QuizQuestion[] } {
  return { source, questions: [...questions] };
}

function cultureToQuiz(source: string, questions: (typeof CULTURE)[number]["quiz"]): QuizQuestion[] {
  return questions.map((question) => ({
    id: question.id,
    type: "reading",
    level: "N5",
    prompt: question.prompt,
    options: question.options,
    answerIndex: question.answerIndex,
    explanation: question.explanation,
    sourceId: source,
  }));
}

function drillToQuiz(source: string, drills: typeof LISTENING_DRILLS): QuizQuestion[] {
  return drills.map((drill) => ({
    id: drill.id,
    type: "listening",
    level: drill.level,
    prompt: drill.prompt,
    options: drill.options,
    answerIndex: drill.answerIndex,
    explanation: drill.explanation,
    sourceId: source,
  }));
}

export function collectQuizBanks(): { source: string; questions: QuizQuestion[] }[] {
  return [
    ...GRAMMAR.map((point) => quizBank("grammar:" + point.id, point.practice)),
    quizBank("reading", READING.flatMap((passage) => passage.questions)),
    quizBank("listening", LISTENING.flatMap((item) => item.questions)),
    quizBank("culture", CULTURE.flatMap((article) => cultureToQuiz(article.id, article.quiz))),
    quizBank("listening-drills", drillToQuiz("listening-drills", LISTENING_DRILLS)),
    quizBank("lesson-plans", LESSON_PLANS.flatMap((plan) => plan.practice)),
  ];
}

export function validateContentQa(): QaIssue[] {
  const issues: QaIssue[] = [];
  const seenIds = new Map<string, { fingerprint: string; source: string }>();

  for (const bank of collectQuizBanks()) {
    for (const question of bank.questions) {
      issues.push(
        ...validateChoiceQuestion({
          id: question.id,
          source: bank.source,
          prompt: question.prompt,
          options: question.options,
          answerIndex: question.answerIndex,
          explanation: question.explanation,
        }),
      );
      const fingerprint = question.prompt + "\u0000" + question.options.join("\u0001");
      const previous = seenIds.get(question.id);
      if (previous && previous.fingerprint !== fingerprint) {
        issues.push({
          id: question.id,
          source: bank.source,
          severity: "error",
          message: "ID soal dipakai untuk isi berbeda (juga di " + previous.source + ").",
        });
      } else {
        seenIds.set(question.id, { fingerprint, source: bank.source });
      }
    }
  }

  for (const exercise of buildExerciseCatalog()) {
    if (exercise.kind !== "multiple-choice" && exercise.kind !== "reading-recognition" && exercise.kind !== "listening") continue;
    issues.push(
      ...validateChoiceQuestion({
        id: exercise.id,
        source: "exercise-catalog",
        prompt: exercise.prompt,
        options: exercise.options,
        answerIndex: exercise.answerIndex,
        explanation: exercise.explanation,
      }),
    );
  }

  return issues;
}

export function formatQaIssue(issue: QaIssue): string {
  return "[" + issue.severity + "] " + issue.source + " / " + issue.id + ": " + issue.message;
}
