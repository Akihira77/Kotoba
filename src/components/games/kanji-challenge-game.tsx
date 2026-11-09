"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { useProgress } from "@/components/providers/progress-provider";
import { GAME_BY_ID } from "@/lib/games/registry";
import {
  KANJI_CHALLENGE_CONFIG,
  buildKanjiChallenge,
  kanjiPoints,
  kanjiTypeLabel,
  type KanjiChallengeQuestion,
} from "@/lib/games/kanji-challenge";
import type { GameDifficulty } from "@/lib/types";
import { GameIntro, GameResult, type GameResultData } from "./game-kit";
import { McqPlay, type McqQuestion } from "./mcq-game";

export function KanjiChallengeGame({ onExit }: { onExit: () => void }) {
  const game = GAME_BY_ID["kanji-challenge"];
  const { recordGame } = useProgress();
  const [difficulty, setDifficulty] = useState<GameDifficulty>("standard");
  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [runKey, setRunKey] = useState(0);
  const [result, setResult] = useState<GameResultData | null>(null);

  const config = KANJI_CHALLENGE_CONFIG[difficulty];

  function start() {
    setResult(null);
    setRunKey((key) => key + 1);
    setPhase("playing");
  }

  function finish(next: GameResultData) {
    setResult(next);
    setPhase("done");
    void recordGame({
      gameId: "kanji-challenge",
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
        icon="kanji"
        extra={<Badge tone="muted">{config.rounds} soal · {config.seconds} detik</Badge>}
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

  return <Play key={runKey} difficulty={difficulty} onFinish={finish} onExit={onExit} />;
}

function Play({
  difficulty,
  onFinish,
  onExit,
}: {
  difficulty: GameDifficulty;
  onFinish: (result: GameResultData) => void;
  onExit: () => void;
}) {
  const game = GAME_BY_ID["kanji-challenge"];
  const config = KANJI_CHALLENGE_CONFIG[difficulty];
  const [source] = useState<KanjiChallengeQuestion[]>(() => buildKanjiChallenge(difficulty));
  const byId = new Map(source.map((question) => [question.id, question]));
  const questions: McqQuestion[] = source.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    promptJp: question.promptJp,
    options: question.options,
    answerIndex: question.answerIndex,
    explanation: question.explanation,
    level: question.level,
    label: "Tantangan kanji · " + kanjiTypeLabel(question.type),
  }));

  return (
    <McqPlay
      game={game}
      difficulty={difficulty}
      questions={questions}
      seconds={config.seconds}
      hints={config.hints}
      points={(question, combo, hintUsed) => {
        const original = byId.get(question.id);
        return original ? kanjiPoints(original, combo, hintUsed) : 0;
      }}
      onFinish={onFinish}
      onExit={onExit}
    />
  );
}
