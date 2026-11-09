"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { useProgress } from "@/components/providers/progress-provider";
import { GAME_BY_ID } from "@/lib/games/registry";
import {
  DAILY_CHALLENGE_HINTS,
  DAILY_CHALLENGE_SECONDS,
  buildDailyChallenge,
  dailyKindLabel,
  dailyPoints,
  type DailyChallenge,
  type DailyChallengeQuestion,
} from "@/lib/games/daily-challenge";
import { toDateKey } from "@/lib/utils";
import type { GameDifficulty } from "@/lib/types";
import { GameIntro, GameResult, type GameResultData } from "./game-kit";
import { McqPlay, type McqQuestion } from "./mcq-game";

export function DailyChallengeGame({ onExit }: { onExit: () => void }) {
  const game = GAME_BY_ID["daily-challenge"];
  const { recordGame } = useProgress();
  const [dateKey] = useState(() => toDateKey(new Date()));
  const [difficulty, setDifficulty] = useState<GameDifficulty>("standard");
  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [runKey, setRunKey] = useState(0);
  const [result, setResult] = useState<GameResultData | null>(null);

  function start() {
    setResult(null);
    setRunKey((key) => key + 1);
    setPhase("playing");
  }

  function finish(next: GameResultData) {
    setResult(next);
    setPhase("done");
    void recordGame({
      gameId: "daily-challenge",
      difficulty,
      score: next.score,
      correct: next.correct,
      total: next.total,
      durationSec: next.durationSec,
      details: next.details,
    });
  }

  if (phase === "intro") {
    return (
      <GameIntro
        game={game}
        difficulty={difficulty}
        onDifficulty={setDifficulty}
        onStart={start}
        icon="calendar"
        extra={<Badge tone="muted">{dateKey} · 10 soal campuran</Badge>}
      />
    );
  }

  if (phase === "done" && result) {
    return (
      <GameResult
        game={game}
        difficulty={difficulty}
        score={result.score}
        correct={result.correct}
        total={result.total}
        durationSec={result.durationSec}
        details={result.details}
        xp={result.xp}
        onReplay={start}
        onExit={onExit}
      />
    );
  }

  return <Play key={runKey} dateKey={dateKey} difficulty={difficulty} onFinish={finish} onExit={onExit} />;
}

function Play({
  dateKey,
  difficulty,
  onFinish,
  onExit,
}: {
  dateKey: string;
  difficulty: GameDifficulty;
  onFinish: (result: GameResultData) => void;
  onExit: () => void;
}) {
  const game = GAME_BY_ID["daily-challenge"];
  const [challenge] = useState<DailyChallenge>(() => buildDailyChallenge(dateKey, difficulty));
  const byId = new Map(challenge.questions.map((question) => [question.id, question]));
  const questions: McqQuestion[] = challenge.questions.map((question: DailyChallengeQuestion) => ({
    id: question.id,
    prompt: question.prompt,
    promptJp: question.promptJp,
    options: question.options,
    answerIndex: question.answerIndex,
    explanation: question.explanation,
    level: question.level,
    label: "Tantangan harian · " + dailyKindLabel(question.kind),
  }));

  return (
    <McqPlay
      game={game}
      difficulty={difficulty}
      questions={questions}
      seconds={challenge.seconds || DAILY_CHALLENGE_SECONDS}
      hints={challenge.hints || DAILY_CHALLENGE_HINTS}
      points={(question, combo, hintUsed) => {
        const original = byId.get(question.id);
        return original ? dailyPoints(original, combo, hintUsed) : 0;
      }}
      onFinish={onFinish}
      onExit={onExit}
    />
  );
}
