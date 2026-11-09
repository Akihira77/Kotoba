"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { useProgress } from "@/components/providers/progress-provider";
import { GAME_BY_ID } from "@/lib/games/registry";
import {
  VOCABULARY_RUSH_CONFIG,
  buildVocabularyRushQuestions,
  vocabularyRushPoints,
} from "@/lib/games/vocabulary-rush";
import type { GameDifficulty } from "@/lib/types";
import { GameIntro, GameResult, type GameResultData } from "./game-kit";
import { McqPlay, type McqQuestion } from "./mcq-game";

export function VocabularyRushGame({ onExit }: { onExit: () => void }) {
  const game = GAME_BY_ID["vocabulary-rush"];
  const { recordGame } = useProgress();
  const [difficulty, setDifficulty] = useState<GameDifficulty>("standard");
  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [runKey, setRunKey] = useState(0);
  const [result, setResult] = useState<GameResultData | null>(null);

  const config = VOCABULARY_RUSH_CONFIG[difficulty];

  function start() {
    setResult(null);
    setRunKey((key) => key + 1);
    setPhase("playing");
  }

  function finish(next: GameResultData) {
    setResult(next);
    setPhase("done");
    void recordGame({
      gameId: "vocabulary-rush",
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
        icon="timer"
        extra={<Badge tone="muted">{config.totalQuestions} soal · {config.seconds} detik</Badge>}
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
  const game = GAME_BY_ID["vocabulary-rush"];
  const config = VOCABULARY_RUSH_CONFIG[difficulty];
  const [questions] = useState<McqQuestion[]>(() =>
    buildVocabularyRushQuestions(difficulty).map((question) => ({
      id: question.id,
      prompt: "Apa arti kata berikut?",
      promptJp: question.word.japanese,
      options: question.options,
      answerIndex: question.answerIndex,
      explanation: question.explanation,
      level: question.word.level,
      label: "Kejar kosakata · " + question.word.level,
    })),
  );

  return (
    <McqPlay
      game={game}
      difficulty={difficulty}
      questions={questions}
      seconds={config.seconds}
      hints={config.hints}
      points={(question, combo, hintUsed) => vocabularyRushPoints(question.level, combo, hintUsed)}
      onFinish={onFinish}
      onExit={onExit}
    />
  );
}
