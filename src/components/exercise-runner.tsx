"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExerciseCard } from "@/components/exercise-card";
import { Icon } from "@/components/icons";
import { useProgress } from "@/components/providers/progress-provider";
import { Badge, Button, Card, EmptyState, LinkButton, ProgressBar, Ring } from "@/components/ui";
import {
  ALL_EXERCISE_KINDS,
  EXERCISE_KIND_LABELS,
  createQuizAttempt,
  exerciseMeta,
  gradeExercise,
} from "@/lib/exercise-engine";
import type {
  Exercise,
  ExerciseAttemptAnswer,
  ExerciseGrade,
  ExerciseResponse,
  ExerciseSessionMode,
  JLPTLevel,
  QuizAttempt,
} from "@/lib/types";
export interface ExerciseRunnerProps {
  exercises: Exercise[];
  title?: string;
  description?: string;
  mode?: ExerciseSessionMode;
  level?: JLPTLevel;
  onAnswer?: (exercise: Exercise, grade: ExerciseGrade) => void;
  onComplete?: (attempt: QuizAttempt) => void | Promise<void>;
  onRestart?: () => void;
  completeHref?: string;
  completeLabel?: string;
  allowRetry?: boolean;
  showAdaptiveNote?: boolean;
  /** Move keyboard focus to the question after a standalone session starts. */
  autoFocus?: boolean;
}

type SaveState = "idle" | "saving" | "saved" | "error";

function initialResponse(exercise: Exercise): ExerciseResponse {
  switch (exercise.kind) {
    case "multiple-choice":
    case "reading-recognition":
    case "listening":
      return { kind: exercise.kind, selectedIndex: -1 };
    case "cloze":
    case "translation":
    case "typing":
      return { kind: exercise.kind, text: "" };
    case "true-false":
      return { kind: "true-false", value: null };
    case "matching":
      return { kind: "matching", matches: {} };
    case "ordering":
      return { kind: "ordering", order: [] };
    default:
      return { kind: "multiple-choice", selectedIndex: -1 };
  }
}

function responseKey(exerciseId: string) {
  return exerciseId;
}

function isAnswered(exercise: Exercise, response: ExerciseResponse): boolean {
  switch (exercise.kind) {
    case "multiple-choice":
    case "reading-recognition":
    case "listening":
      return response.kind === exercise.kind && response.selectedIndex >= 0;
    case "cloze":
    case "translation":
    case "typing":
      return response.kind === exercise.kind && response.text.trim().length > 0;
    case "true-false":
      return response.kind === "true-false" && response.value !== null;
    case "matching":
      return response.kind === "matching" && exercise.pairs.every((pair) => Boolean(response.matches[pair.id]));
    case "ordering":
      return response.kind === "ordering" && response.order.length === exercise.tokens.length;
    default:
      return false;
  }
}

function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return minutes > 0 ? `${minutes} mnt ${rest} dtk` : `${rest} dtk`;
}

function initialResponses(exercises: Exercise[]) {
  return Object.fromEntries(exercises.map((exercise) => [responseKey(exercise.id), initialResponse(exercise)]));
}

export function ExerciseRunner({
  exercises,
  title = "Latihan",
  description,
  mode = "practice",
  level,
  onAnswer,
  onComplete,
  onRestart,
  completeHref,
  completeLabel = "Lihat kemajuan",
  allowRetry = true,
  showAdaptiveNote = false,
  autoFocus = false,
}: ExerciseRunnerProps) {
  const { recordQuiz } = useProgress();
  const [roundExercises, setRoundExercises] = useState<Exercise[]>(exercises);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, ExerciseResponse>>(() => initialResponses(exercises));
  const [grades, setGrades] = useState<Record<string, ExerciseGrade>>({});
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<ExerciseAttemptAnswer[]>([]);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [round, setRound] = useState(1);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const startedAt = useRef("");
  const startedMs = useRef(0);
  const questionStartedMs = useRef(0);
  const finishedRef = useRef(false);
  const promptRef = useRef<HTMLDivElement>(null);
  const hasNavigated = useRef(false);

  useEffect(() => {
    const now = Date.now();
    startedAt.current = new Date(now).toISOString();
    startedMs.current = now;
    questionStartedMs.current = now;
  }, []);

  useEffect(() => {
    if (!autoFocus && !hasNavigated.current) return;
    promptRef.current?.focus();
  }, [index, autoFocus]);

  const current = roundExercises[index];
  const currentResponse = current ? responses[responseKey(current.id)] ?? initialResponse(current) : null;
  const currentGrade = current ? grades[responseKey(current.id)] ?? null : null;
  const answered = index + (checked ? 1 : 0);

  const wrongAnswers = useMemo(() => (attempt ? attempt.answers.filter((answer) => !answer.correct) : []), [attempt]);

  function resetSession(next: Exercise[]) {
    setRoundExercises(next);
    setIndex(0);
    setResponses(initialResponses(next));
    setGrades({});
    setChecked(false);
    setAnswers([]);
    setAttempt(null);
    setSaveState("idle");
    startedAt.current = new Date().toISOString();
    startedMs.current = Date.now();
    questionStartedMs.current = Date.now();
    finishedRef.current = false;
  }

  function updateResponse(response: ExerciseResponse) {
    if (!current || checked) return;
    setResponses((previous) => ({ ...previous, [responseKey(current.id)]: response }));
  }

  async function finish(finalAnswers: ExerciseAttemptAnswer[]) {
    if (finishedRef.current || finalAnswers.length === 0) return;
    finishedRef.current = true;
    const startMs = startedMs.current || Date.now();
    const startedAtValue = startedAt.current || new Date(startMs).toISOString();
    const durationSec = Math.max(1, Math.round((Date.now() - startMs) / 1000));
    const finishedAttempt = createQuizAttempt({
      mode,
      title,
      level,
      startedAt: startedAtValue,
      durationSec,
      answers: finalAnswers,
    });
    setAttempt(finishedAttempt);
    setSaveState("saving");
    try {
      await recordQuiz({
        mode,
        title,
        level,
        durationSec,
        startedAt: startedAtValue,
        answers: finalAnswers,
      });
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
    if (onComplete) await onComplete(finishedAttempt);
  }

  function handleCheck() {
    if (!current || !currentResponse || checked) return;
    if (!isAnswered(current, currentResponse)) return;
    const grade = gradeExercise(current, currentResponse);
    const answer: ExerciseAttemptAnswer = {
      exerciseId: current.id,
      kind: current.kind,
      response: currentResponse,
      correct: grade.correct,
      score: grade.score,
      timeMs: Math.max(0, Date.now() - questionStartedMs.current),
    };
    setGrades((previous) => ({ ...previous, [responseKey(current.id)]: grade }));
    setAnswers((previous) => [...previous, answer]);
    setChecked(true);
    onAnswer?.(current, grade);
  }

  function handleNext() {
    if (!checked) {
      handleCheck();
      return;
    }
    if (index + 1 >= roundExercises.length) {
      void finish(answers);
      return;
    }
    hasNavigated.current = true;
    setIndex((previous) => previous + 1);
    setChecked(false);
    questionStartedMs.current = Date.now();
  }

  function restartSession() {
    if (onRestart) {
      onRestart();
      return;
    }
    setRound(1);
    resetSession(exercises);
  }

  function retryWrong() {
    const wrongIds = new Set(wrongAnswers.map((answer) => answer.exerciseId));
    const wrongExercises = roundExercises.filter((exercise) => wrongIds.has(exercise.id));
    if (wrongExercises.length === 0) return;
    setRound((previous) => previous + 1);
    resetSession(wrongExercises);
  }

  if (roundExercises.length === 0) {
    return (
      <EmptyState
        icon="practice"
        title="Belum ada soal"
        description="Pilih materi atau level lain untuk mulai berlatih."
        action={completeHref ? <LinkButton href={completeHref} variant="secondary">{completeLabel}</LinkButton> : undefined}
      />
    );
  }

  if (attempt) {
    const wrongRows = wrongAnswers
      .map((answer) => {
        const exercise = roundExercises.find((item) => item.id === answer.exerciseId);
        if (!exercise) return null;
        return { answer, exercise, expected: gradeExercise(exercise, answer.response).expected };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    return (
      <div className="space-y-5">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
            <Ring value={attempt.score} size={116} label={`Skor ${attempt.score}%`}>
              <span className="font-display text-3xl font-bold text-ink">{attempt.score}%</span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">skor</span>
            </Ring>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={attempt.score >= 80 ? "matcha" : "brand"}>Latihan selesai</Badge>
                <Badge tone="muted">{attempt.total} soal</Badge>
                {round > 1 ? <Badge tone="gold">Putaran {round}</Badge> : null}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
                <p className="mt-1 text-sm text-muted">
                  {attempt.correct} benar dari {attempt.total} soal. Waktu {formatDuration(attempt.durationSec)}.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm" role="status" aria-live="polite">
                <span className="rounded-full bg-surface-2 px-3 py-1 text-muted">
                  Akurasi <strong className="text-ink">{attempt.total > 0 ? Math.round((attempt.correct / attempt.total) * 100) : 0}%</strong>
                </span>
                <span className="rounded-full bg-surface-2 px-3 py-1 text-muted">
                  Skor poin <strong className="text-ink">{attempt.score}/100</strong>
                </span>
                {saveState === "saved" ? <Badge tone="matcha">Riwayat tersimpan</Badge> : null}
                {saveState === "saving" ? <Badge tone="muted">Menyimpan riwayat…</Badge> : null}
                {saveState === "error" ? <Badge tone="brand">Riwayat belum tersimpan</Badge> : null}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Rincian per jenis soal</h3>
          <div className="mt-4 space-y-3">
            {ALL_EXERCISE_KINDS.map((kind) => {
              const rows = attempt.answers.filter((answer) => answer.kind === kind);
              if (rows.length === 0) return null;
              const correct = rows.filter((answer) => answer.correct).length;
              return (
                <div key={kind} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-ink">{EXERCISE_KIND_LABELS[kind]}</span>
                    <span className="text-muted">{correct}/{rows.length}</span>
                  </div>
                  <ProgressBar value={correct} max={rows.length} className="h-1.5" label={EXERCISE_KIND_LABELS[kind]} />
                </div>
              );
            })}
          </div>
        </Card>

        {wrongRows.length > 0 ? (
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Soal yang perlu diulang</h3>
              <Badge tone="brand">{wrongRows.length}</Badge>
            </div>
            <div className="mt-3 divide-y divide-line">
              {wrongRows.map(({ answer, exercise, expected }) => (
                <div key={answer.exerciseId} className="space-y-1 py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium leading-snug text-ink">{exercise.prompt}</p>
                  <p className="font-jp text-sm text-muted">{expected}</p>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="flex items-center gap-3 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-matcha-soft text-matcha">
              <Icon name="checkCircle" size={20} />
            </span>
            <div>
              <p className="font-semibold text-ink">Semua jawaban benar.</p>
              <p className="text-sm text-muted">Naikkan tingkat kesulitan atau coba latihan campuran berikutnya.</p>
            </div>
          </Card>
        )}

        <div className="flex flex-wrap gap-2">
          {allowRetry && wrongRows.length > 0 ? (
            <Button type="button" onClick={retryWrong}>
              <Icon name="rotate" size={16} /> Ulangi soal salah
            </Button>
          ) : null}
          {allowRetry ? (
            <Button type="button" variant="secondary" onClick={restartSession}>
              <Icon name="shuffle" size={16} /> Ulangi sesi
            </Button>
          ) : null}
          {completeHref ? (
            <LinkButton href={completeHref} variant="secondary">
              {completeLabel} <Icon name="arrowRight" size={16} />
            </LinkButton>
          ) : null}
        </div>
      </div>
    );
  }

  if (!current || !currentResponse) return null;

  const meta = exerciseMeta(current);
  const canCheck = isAnswered(current, currentResponse);
  const correctSoFar = answers.filter((answer) => answer.correct).length;

  return (
    <div className="space-y-5">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{round > 1 ? `Putaran ${round}` : meta.label}</Badge>
              <Badge tone="muted">Soal {index + 1} dari {roundExercises.length}</Badge>
              {level ? <Badge tone="indigo">{level}</Badge> : null}
            </div>
            <h2 className="mt-2 text-lg font-semibold text-ink">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-matcha-soft px-3 py-1 font-semibold text-matcha">
              {correctSoFar} benar
            </span>
          </div>
        </div>
        <ProgressBar value={answered} max={roundExercises.length} className="mt-4 h-1.5" label="Kemajuan latihan" />
        {showAdaptiveNote ? (
          <p className="mt-3 flex items-start gap-2 text-xs text-muted">
            <Icon name="sparkles" size={14} className="mt-0.5 shrink-0" />
            Sesi adaptif memprioritaskan soal yang sering salah dan kartu yang sudah jatuh tempo.
          </p>
        ) : null}
      </Card>

      <div ref={promptRef} tabIndex={-1} className="rounded-3xl outline-none" aria-label={"Soal " + (index + 1) + " dari " + roundExercises.length}>
        <ExerciseCard
          key={current.id}
          exercise={current}
          response={currentResponse}
          onChange={updateResponse}
          checked={checked}
          grade={currentGrade}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" role="status" aria-live="polite">
          {checked
            ? currentGrade?.correct
              ? "Benar. Lanjutkan ke soal berikutnya."
              : "Periksa pembahasan, lalu lanjutkan."
            : canCheck
              ? "Jawaban sudah lengkap. Periksa untuk melihat pembahasan."
              : "Lengkapi jawaban terlebih dahulu."}
        </p>
        <Button type="button" onClick={handleNext} disabled={!checked && !canCheck}>
          {!checked ? "Periksa jawaban" : index + 1 >= roundExercises.length ? "Lihat hasil" : "Soal berikutnya"}
          <Icon name={!checked ? "check" : index + 1 >= roundExercises.length ? "award" : "arrowRight"} size={16} />
        </Button>
      </div>
    </div>
  );
}
