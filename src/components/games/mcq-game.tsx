"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { JpText } from "@/components/japanese";
import { estimateGameXp, shuffled } from "@/lib/games/shared";
import type { GameAnswerDetail, GameDifficulty, GameDefinition, JLPTLevel } from "@/lib/types";
import { GameHud, GamePanel, QuestionFeedback, useCountdown, type GameResultData } from "./game-kit";

export interface McqQuestion {
  id: string;
  prompt: string;
  promptJp?: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  level: JLPTLevel;
  label: string;
}

export function McqPlay({
  game,
  difficulty,
  questions,
  seconds,
  hints,
  points,
  onFinish,
  onExit,
}: {
  game: GameDefinition;
  difficulty: GameDifficulty;
  questions: McqQuestion[];
  seconds: number;
  hints: number;
  points: (question: McqQuestion, combo: number, hintUsed: boolean) => number;
  onFinish: (result: GameResultData) => void;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hintIndices, setHintIndices] = useState<number[]>([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [details, setDetails] = useState<GameAnswerDetail[]>([]);
  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const comboRef = useRef(0);
  const detailsRef = useRef<GameAnswerDetail[]>([]);
  const doneRef = useRef(false);
  const startedAtRef = useRef(0);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  function detailFor(target: McqQuestion, answerIndex: number, response: string, correct: boolean): GameAnswerDetail {
    return {
      id: target.id + "-" + answerIndex,
      prompt: target.prompt + (target.promptJp ? " — " + target.promptJp : ""),
      expected: target.options[target.answerIndex],
      response,
      correct,
      explanation: target.explanation,
      hintUsed: hintUsed,
    };
  }

  function finishNow() {
    if (doneRef.current) return;
    doneRef.current = true;
    const answered = new Set(detailsRef.current.map((detail) => detail.id));
    questions.forEach((target, questionIndex) => {
      const detailId = target.id + "-" + questionIndex;
      if (!answered.has(detailId)) {
        detailsRef.current.push(detailFor(target, questionIndex, "Waktu habis", false));
      }
    });
    onFinish({
      score: scoreRef.current,
      correct: correctRef.current,
      total: questions.length,
      durationSec: Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
      details: detailsRef.current,
      xp: estimateGameXp(correctRef.current, questions.length, difficulty),
    });
  }

  const question = questions[index];
  const secondsLeft = useCountdown(seconds, () => finishNow());

  function answer(optionIndex: number) {
    if (revealed || !question) return;
    const correct = optionIndex === question.answerIndex;
    const gained = correct ? points(question, comboRef.current, hintUsed) : 0;
    scoreRef.current += gained;
    if (correct) {
      correctRef.current += 1;
      comboRef.current += 1;
    } else {
      comboRef.current = 0;
    }
    const detail = detailFor(question, index, question.options[optionIndex], correct);
    detailsRef.current.push(detail);
    setScore(scoreRef.current);
    setCorrectCount(correctRef.current);
    setDetails([...detailsRef.current]);
    setChosen(optionIndex);
    setRevealed(true);
  }

  function requestHint() {
    if (!question || revealed || hintsUsed >= hints) return;
    const wrong = question.options.map((_, optionIndex) => optionIndex).filter((optionIndex) => optionIndex !== question.answerIndex);
    const picks = shuffled(wrong, Math.random).slice(0, 2);
    setHintIndices(picks);
    setHintUsed(true);
    setHintsUsed((value) => value + 1);
  }

  function next() {
    if (index + 1 >= questions.length) {
      finishNow();
      return;
    }
    setIndex((value) => value + 1);
    setChosen(null);
    setRevealed(false);
    setHintIndices([]);
    setHintUsed(false);
  }

  if (!question) return null;

  return (
    <div className="space-y-4">
      <GameHud
        title={game.title}
        score={score}
        secondsLeft={secondsLeft}
        secondsTotal={seconds}
        progress={"Soal " + (index + 1) + " dari " + questions.length + " · " + correctCount + " benar"}
        hintsLeft={Math.max(0, hints - hintsUsed)}
        onHint={requestHint}
        hintDisabled={revealed || hintsUsed >= hints}
        onExit={onExit}
      />

      <GamePanel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{question.label}</Badge>
            <Badge tone="muted">{question.level}</Badge>
          </div>
          <span className="text-xs text-muted">{details.length} soal dijawab</span>
        </div>

        <h2 className="mt-4 text-xl font-bold leading-snug">{question.prompt}</h2>
        {question.promptJp && (
          <JpText as="p" text={question.promptJp} className="mt-3 rounded-2xl bg-surface-2/70 px-4 py-3 text-3xl font-semibold" />
        )}

        <div className="mt-4 grid gap-2">
          {question.options.map((option, optionIndex) => {
            const hidden = hintIndices.includes(optionIndex);
            const isChosen = chosen === optionIndex;
            const isCorrect = optionIndex === question.answerIndex;
            return (
              <button
                key={optionIndex}
                type="button"
                disabled={revealed || hidden}
                onClick={() => answer(optionIndex)}
                className={
                  "flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition " +
                  (revealed && isCorrect
                    ? "border-matcha bg-matcha-soft/70 "
                    : revealed && isChosen
                      ? "border-brand bg-brand-soft/70 "
                      : "border-line bg-surface hover:border-brand/40 hover:bg-brand-soft/20 ") +
                  (hidden ? "pointer-events-none opacity-25 line-through" : "")
                }
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-xs font-bold">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="min-w-0 flex-1 font-medium">{option}</span>
                {revealed && isCorrect && <Icon name="checkCircle" size={16} className="shrink-0 text-matcha" />}
                {revealed && isChosen && !isCorrect && <Icon name="xCircle" size={16} className="shrink-0 text-brand" />}
              </button>
            );
          })}
        </div>

        {revealed && chosen !== null ? (
          <div className="mt-4">
            <QuestionFeedback
              correct={chosen === question.answerIndex}
              title={chosen === question.answerIndex ? "Tepat sekali" : "Belum tepat"}
              onNext={next}
              nextLabel={index + 1 >= questions.length ? "Lihat hasil" : "Soal berikutnya"}
            >
              <p>{question.explanation}</p>
              {question.promptJp && <p className="mt-1 text-xs">Materi: {question.promptJp}</p>}
            </QuestionFeedback>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted">Pilih satu jawaban. Waktu terus berjalan.</p>
        )}
      </GamePanel>
    </div>
  );
}