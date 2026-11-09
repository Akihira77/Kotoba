"use client";

import { ExerciseRunner } from "@/components/exercise-runner";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui";
import { exercisesFromQuizQuestions } from "@/lib/exercise-catalog";
import { LESSON_PASS_SCORE } from "@/lib/constants";
import type { ExerciseResponse, QuizAttempt, QuizQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface PracticeAnswer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
}

export interface PracticeResult {
  correct: number;
  total: number;
  percent: number;
  answers: PracticeAnswer[];
}

export function scorePractice(questions: QuizQuestion[], answers: PracticeAnswer[]): PracticeResult {
  const correct = answers.filter((answer) => answer.correct).length;
  const total = questions.length;
  return { correct, total, percent: total === 0 ? 0 : Math.round((correct / total) * 100), answers };
}

function selectedIndex(response: ExerciseResponse): number {
  return response.kind === "multiple-choice" || response.kind === "reading-recognition" || response.kind === "listening"
    ? response.selectedIndex
    : -1;
}

function toPracticeResult(attempt: QuizAttempt): PracticeResult {
  return {
    correct: attempt.correct,
    total: attempt.total,
    percent: attempt.score,
    answers: attempt.answers.map((answer) => ({
      questionId: answer.exerciseId.startsWith("quiz-") ? answer.exerciseId.slice(5) : answer.exerciseId,
      selectedIndex: selectedIndex(answer.response),
      correct: answer.correct,
    })),
  };
}

export function LessonPractice({
  questions,
  result,
  onFinish,
  onRetry,
  passScore = LESSON_PASS_SCORE,
}: {
  questions: QuizQuestion[];
  result: PracticeResult | null;
  onFinish: (result: PracticeResult) => void;
  onRetry: () => void;
  passScore?: number;
}) {
  const exercises = exercisesFromQuizQuestions(questions, "Latihan pelajaran");
  const passed = result ? result.percent >= passScore : null;

  return (
    <div className="space-y-4">
      {result ? (
        <div
          role="status"
          className={cn(
            "flex flex-wrap items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm",
            passed ? "border-matcha/30 bg-matcha-soft/60" : "border-brand/30 bg-brand-soft/60",
          )}
        >
          <Icon name={passed ? "checkCircle" : "alert"} size={16} className={passed ? "text-matcha" : "text-brand"} />
          <span className="font-semibold text-ink">{passed ? "Latihan lulus" : "Latihan belum lulus"}</span>
          <span className="text-muted">Skor terakhir {result.percent}% · minimal {passScore}%</span>
          <Badge tone={passed ? "matcha" : "brand"}>{result.correct}/{result.total} benar</Badge>
        </div>
      ) : null}
      <ExerciseRunner
        key={questions.map((question) => question.id).join("|")}
        exercises={exercises}
        title="Latihan pelajaran"
        description="Jawab semua soal. Kamu bisa mengulang sampai mencapai skor kelulusan."
        mode="lesson"
        level={questions[0]?.level}
        onComplete={(attempt) => onFinish(toPracticeResult(attempt))}
        onRestart={onRetry}
        allowRetry
      />
    </div>
  );
}
