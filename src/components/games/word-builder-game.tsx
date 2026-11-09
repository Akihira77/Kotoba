"use client";

import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/components/providers/progress-provider";
import { JpText, SpeakButton } from "@/components/japanese";
import { Badge, Button, ProgressBar } from "@/components/ui";
import { Icon } from "@/components/icons";
import {
  WORD_BUILDER_CONFIG,
  buildWordBuilderRounds,
  checkWordBuild,
  wordBuilderHint,
  wordBuilderPoints,
  type WordBuilderRound,
} from "@/lib/games/word-builder";
import { estimateGameXp } from "@/lib/games/shared";
import { GAME_BY_ID } from "@/lib/games/registry";
import type { GameAnswerDetail, GameDifficulty } from "@/lib/types";
import { GameHud, GameIntro, GamePanel, GameResult, QuestionFeedback, useCountdown } from "./game-kit";

interface Result {
  score: number;
  correct: number;
  total: number;
  durationSec: number;
  details: GameAnswerDetail[];
  xp: number;
}

export function WordBuilderGame({ onExit }: { onExit: () => void }) {
  const game = GAME_BY_ID["word-builder"];
  const { recordGame } = useProgress();
  const [difficulty, setDifficulty] = useState<GameDifficulty>("standard");
  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [runKey, setRunKey] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  function start() {
    setResult(null);
    setRunKey((key) => key + 1);
    setPhase("playing");
  }

  function finish(next: Result) {
    setResult(next);
    setPhase("done");
    void recordGame({
      gameId: "word-builder",
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
        icon="edit"
        extra={<Badge tone="muted">5–8 kata</Badge>}
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
  onFinish: (result: Result) => void;
  onExit: () => void;
}) {
  const game = GAME_BY_ID["word-builder"];
  const config = WORD_BUILDER_CONFIG[difficulty];
  const [rounds] = useState<WordBuilderRound[]>(() => buildWordBuilderRounds(difficulty));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; title: string; body: string } | null>(null);
  const [resolved, setResolved] = useState(false);
  const [hintsRound, setHintsRound] = useState(0);
  const [hintText, setHintText] = useState("");
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [details, setDetails] = useState<GameAnswerDetail[]>([]);
  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const detailsRef = useRef<GameAnswerDetail[]>([]);
  const doneRef = useRef(false);
  const startedAtRef = useRef(0);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  function finishNow() {
    if (doneRef.current) return;
    doneRef.current = true;
    const correct = correctRef.current;
    const total = rounds.length;
    onFinish({
      score: scoreRef.current,
      correct,
      total,
      durationSec: Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
      details: detailsRef.current,
      xp: estimateGameXp(correct, total, difficulty),
    });
  }

  const round = rounds[index];
  const secondsLeft = useCountdown(config.seconds, () => finishNow());

  function choose(tileIndex: number) {
    if (feedback) return;
    setSelected((current) =>
      current.includes(tileIndex) ? current.filter((item) => item !== tileIndex) : [...current, tileIndex],
    );
    setMessage("");
  }

  function requestHint() {
    if (feedback || !round) return;
    const next = hintsRound + 1;
    setHintsRound(next);
    setHintText(wordBuilderHint(round, next));
  }

  function resolveAccepted(check: ReturnType<typeof checkWordBuild>, built: string) {
    const acceptedWord = check.word ?? round.target;
    const base = wordBuilderPoints(acceptedWord, difficulty, hintsRound);
    const firstTry = attempts === 0;
    const points = Math.max(5, Math.round(base * (firstTry ? 1 : 0.6)));
    const correct = check.status === "correct" || check.status === "alternate";
    scoreRef.current += points;
    if (correct) correctRef.current += 1;
    setScore(scoreRef.current);
    setCorrectCount(correctRef.current);
    const detail: GameAnswerDetail = {
      id: round.id,
      prompt: "Susun kata yang berarti \"" + round.target.meaning + "\"",
      expected: round.target.kana,
      response: built,
      correct,
      explanation:
        check.message +
        " Bacaan: " +
        round.target.kana +
        " (" +
        round.target.romaji +
        "). Contoh: " +
        (round.target.examples[0]?.jp ?? round.target.japanese) +
        " — " +
        (round.target.examples[0]?.meaning ?? round.target.meaning) +
        ".",
      hintUsed: hintsRound > 0,
    };
    detailsRef.current = [...detailsRef.current, detail];
    setDetails(detailsRef.current);
    setResolved(true);
    setFeedback({
      correct,
      title: correct ? "Kata valid!" : "Belum tepat",
      body: check.message,
    });
  }

  function check() {
    if (feedback || resolved) return;
    const built = selected.map((tileIndex) => round.tiles[tileIndex]).join("");
    const checkResult = checkWordBuild(built, round.target);
    if (checkResult.accepted) {
      resolveAccepted(checkResult, built);
      return;
    }
    setAttempts((count) => count + 1);
    setMessage(checkResult.message);
  }

  function skip() {
    if (feedback || resolved) return;
    const detail: GameAnswerDetail = {
      id: round.id,
      prompt: "Susun kata yang berarti \"" + round.target.meaning + "\"",
      expected: round.target.kana,
      response: "Dilewati",
      correct: false,
      explanation:
        "Kata yang tepat adalah " +
        round.target.kana +
        " (" +
        round.target.japanese +
        ", " +
        round.target.romaji +
        ") yang berarti " +
        round.target.meaning +
        ".",
      hintUsed: hintsRound > 0,
    };
    detailsRef.current = [...detailsRef.current, detail];
    setDetails(detailsRef.current);
    setResolved(true);
    setFeedback({ correct: false, title: "Dilewati", body: detail.explanation });
  }

  function next() {
    if (index + 1 >= rounds.length) {
      finishNow();
      return;
    }
    setIndex((value) => value + 1);
    setSelected([]);
    setAttempts(0);
    setFeedback(null);
    setResolved(false);
    setHintsRound(0);
    setHintText("");
    setMessage("");
  }

  if (!round) return null;

  return (
    <div className="space-y-4">
      <GameHud
        title={game.title}
        score={score}
        secondsLeft={secondsLeft}
        secondsTotal={config.seconds}
        progress={"Soal " + (index + 1) + " dari " + rounds.length + " · " + correctCount + " benar"}
        hintsLeft={Math.max(0, 2 - hintsRound)}
        onHint={requestHint}
        hintDisabled={Boolean(feedback)}
        onExit={onExit}
      />

      <GamePanel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Susun kosakata</p>
            <h2 className="mt-1 text-lg font-bold">
              Kata yang berarti: <span className="text-brand">{round.target.meaning}</span>
            </h2>
            <p className="mt-1 text-xs text-muted">
              Klik ubin kana sesuai urutan. Kata divalidasi terhadap kamus, bukan sekadar target.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="gold">{round.target.level}</Badge>
            <Badge tone="muted">{round.target.pos}</Badge>
          </div>
        </div>

        <div className="mt-4 min-h-16 rounded-2xl border-2 border-dashed border-line bg-surface-2/40 p-3">
          {selected.length === 0 ? (
            <p className="py-2 text-center text-sm text-muted">Klik ubin di bawah untuk menyusun kata.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selected.map((tileIndex) => (
                <button
                  key={tileIndex}
                  type="button"
                  onClick={() => choose(tileIndex)}
                  className="flex h-11 min-w-11 items-center justify-center rounded-xl border border-brand/30 bg-brand-soft px-2 text-xl font-semibold text-brand-strong"
                  aria-label={"Hapus " + round.tiles[tileIndex]}
                >
                  {round.tiles[tileIndex]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {round.tiles.map((tile, tileIndex) => {
            const used = selected.includes(tileIndex);
            return (
              <button
                key={tileIndex}
                type="button"
                disabled={used || Boolean(feedback)}
                onClick={() => choose(tileIndex)}
                className="flex h-14 items-center justify-center rounded-xl border border-line bg-surface text-2xl font-semibold transition hover:border-brand/40 hover:bg-brand-soft/30 disabled:opacity-30"
              >
                {tile}
              </button>
            );
          })}
        </div>

        {hintText && !feedback && (
          <p className="mt-3 rounded-xl bg-gold-soft/70 p-2 text-xs text-gold" role="status">
            <Icon name="lightbulb" size={13} className="mr-1 inline" />
            {hintText}
          </p>
        )}

        {message && !feedback && (
          <p className="mt-3 text-sm text-brand" role="alert">
            {message}
          </p>
        )}

        {!feedback ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button onClick={check} disabled={selected.length === 0}>
              Periksa kata
            </Button>
            <Button variant="secondary" onClick={() => setSelected([])} disabled={selected.length === 0}>
              Kosongkan
            </Button>
            <Button variant="ghost" onClick={skip}>
              Lewati
            </Button>
            <span className="text-xs text-muted">Percobaan: {attempts + 1}</span>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <QuestionFeedback
              correct={feedback.correct}
              title={feedback.title}
              onNext={next}
              nextLabel={index + 1 >= rounds.length ? "Lihat hasil" : "Soal berikutnya"}
            >
              <p>{feedback.body}</p>
              <div className="mt-2 rounded-xl bg-surface p-3">
                <div className="flex items-center gap-2">
                  <JpText as="span" text={round.target.japanese} className="text-lg font-semibold text-ink" />
                  <SpeakButton text={round.target.kana} />
                </div>
                <p className="mt-1 text-xs">
                  {round.target.kana} · {round.target.romaji} · {round.target.meaning}
                </p>
                {round.target.examples[0] && (
                  <p className="mt-1 text-xs text-muted">
                    {round.target.examples[0].jp} — {round.target.examples[0].meaning}
                  </p>
                )}
              </div>
            </QuestionFeedback>
            <ProgressBar value={index + 1} max={rounds.length} label="Kemajuan permainan" />
            <p className="text-xs text-muted">
              {details.length} soal tercatat. Skor sementara {score} poin.
            </p>
          </div>
        )}
      </GamePanel>
    </div>
  );
}
