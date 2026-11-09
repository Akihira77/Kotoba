"use client";

import { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { Icon } from "@/components/icons";
import { JpText, SpeakButton } from "@/components/japanese";
import { useProgress } from "@/components/providers/progress-provider";
import { GAME_BY_ID } from "@/lib/games/registry";
import {
  SENTENCE_CHALLENGE_CONFIG,
  buildSentenceChallenge,
  checkSentenceAnswer,
  sentenceHint,
  sentenceScore,
} from "@/lib/games/sentence-challenge";
import { estimateGameXp, seededRng, shuffled } from "@/lib/games/shared";
import type { GameAnswerDetail, GameDifficulty, SentenceItem } from "@/lib/types";
import { GameHud, GamePanel, QuestionFeedback, useElapsed, type GameResultData } from "./game-kit";

export function SentenceBuilderGame({ onExit }: { onExit: () => void }) {
  const game = GAME_BY_ID["sentence-builder"];
  const { recordGame } = useProgress();
  const [difficulty, setDifficulty] = useState<GameDifficulty>("standard");
  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [runKey, setRunKey] = useState(0);
  const [result, setResult] = useState<GameResultData | null>(null);

  const config = SENTENCE_CHALLENGE_CONFIG[difficulty];

  function start() {
    setResult(null);
    setRunKey((key) => key + 1);
    setPhase("playing");
  }

  function finish(next: GameResultData) {
    setResult(next);
    setPhase("done");
    void recordGame({
      gameId: "sentence-builder",
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
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <Icon name="grammar" size={26} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{game.title}</h2>
              <span className="text-sm text-muted">{game.titleJp}</span>
              <Badge tone="gold">hingga {game.xpReward} XP</Badge>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted">{game.description}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface-2/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Tujuan belajar</p>
          <ul className="mt-2 space-y-1">
            {game.objectives.map((objective) => (
              <li key={objective} className="flex gap-2 text-sm">
                <Icon name="checkCircle" size={15} className="mt-0.5 shrink-0 text-matcha" />
                {objective}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Tingkat kesulitan</p>
          <div className="flex flex-wrap gap-2">
            {(["easy", "standard", "hard"] as GameDifficulty[]).map((value) => (
              <Button
                key={value}
                variant={difficulty === value ? "primary" : "secondary"}
                size="sm"
                onClick={() => setDifficulty(value)}
              >
                {value === "easy" ? "Santai" : value === "standard" ? "Standar" : "Tantangan"}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            {config.rounds} kalimat. Susun dari kiri ke kanan; partikel menentukan peran setiap kata.
          </p>
        </div>
        <Button size="lg" onClick={start}>
          <Icon name="play" size={17} />
          Mulai menyusun
        </Button>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-line bg-surface-2/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Permainan selesai</p>
          <h2 className="mt-1 text-xl font-bold">{game.title}</h2>
          <p className="mt-1 text-sm text-muted">
            {result.correct} kalimat benar dari {result.total} · {result.score} poin ·{" "}
            <span className="font-semibold text-gold">+{result.xp} XP</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={start}><Icon name="rotate" size={16} />Main lagi</Button>
            <Button variant="secondary" onClick={onExit}>Pilih permainan lain</Button>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold">Tinjau susunan</p>
          <ol className="space-y-2">
            {result.details.map((detail) => (
              <li key={detail.id} className="rounded-xl border border-line bg-surface p-3 text-sm">
                <p className="font-semibold">{detail.correct ? "Benar" : "Perlu diulang"}</p>
                <p className="mt-1 text-xs text-muted">Jawabanmu: {detail.response || "—"}</p>
                <p className="mt-1 text-xs text-matcha">Susunan tepat: {detail.expected}</p>
                <p className="mt-1 text-xs text-muted">{detail.explanation}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
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
  const game = GAME_BY_ID["sentence-builder"];
  const [rounds] = useState<SentenceItem[]>(() => buildSentenceChallenge(difficulty));
  const [index, setIndex] = useState(0);
  const [bank, setBank] = useState<string[]>(() =>
    shuffled(rounds[0]?.answer ?? [], seededRng("sentence-game-" + (rounds[0]?.id ?? ""))),
  );
  const [picked, setPicked] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintText, setHintText] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; title: string; body: string } | null>(null);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [details, setDetails] = useState<GameAnswerDetail[]>([]);
  const elapsed = useElapsed();
  const round = rounds[index];

  if (!round) return null;

  function pickBank(bankIndex: number) {
    if (feedback) return;
    const token = bank[bankIndex];
    setBank((items) => items.filter((_, itemIndex) => itemIndex !== bankIndex));
    setPicked((items) => [...items, token]);
    setMessage("");
  }

  function removePicked(pickedIndex: number) {
    if (feedback) return;
    const token = picked[pickedIndex];
    setPicked((items) => items.filter((_, itemIndex) => itemIndex !== pickedIndex));
    setBank((items) => [...items, token]);
  }

  function resolve(correct: boolean) {
    const gained = sentenceScore(correct, hintsUsed > 0, attempts > 0, difficulty);
    const detail: GameAnswerDetail = {
      id: round.id,
      prompt: round.translation,
      expected: round.answer.join(" "),
      response: picked.join(" ") || "Dilewati",
      correct,
      explanation: round.explanation,
      hintUsed: hintsUsed > 0,
    };
    setDetails((items) => [...items, detail]);
    setFeedback({
      correct,
      title: correct ? "Susunan tepat!" : "Susunan belum tepat",
      body: correct ? "Partikel dan urutan sudah sesuai." : "Perhatikan urutan predikat dan partikel.",
    });
    if (correct) {
      setScore((value) => value + gained);
      setCorrectCount((value) => value + 1);
    }
  }

  function check() {
    if (feedback || picked.length === 0) return;
    if (checkSentenceAnswer(round, picked)) {
      resolve(true);
    } else {
      setAttempts((value) => value + 1);
      setMessage("Belum tepat. Coba tukar posisi beberapa komponen.");
    }
  }

  function skip() {
    if (feedback) return;
    resolve(false);
  }

  function requestHint() {
    if (hintsUsed > 0 || feedback) return;
    setHintsUsed(1);
    setHintText(sentenceHint(round));
  }

  function next() {
    if (index + 1 >= rounds.length) {
      onFinish({
        score,
        correct: correctCount,
        total: rounds.length,
        durationSec: Math.max(1, elapsed),
        details,
        xp: estimateGameXp(correctCount, rounds.length, difficulty),
      });
      return;
    }
    const nextIndex = index + 1;
    const nextRound = rounds[nextIndex];
    setIndex(nextIndex);
    setBank(shuffled(nextRound.answer, seededRng("sentence-game-" + nextRound.id)));
    setPicked([]);
    setAttempts(0);
    setHintsUsed(0);
    setHintText("");
    setFeedback(null);
    setMessage("");
  }

  return (
    <div className="space-y-4">
      <GameHud
        title={game.title}
        score={score}
        elapsed={elapsed}
        progress={"Kalimat " + (index + 1) + " dari " + rounds.length + " · " + correctCount + " tepat"}
        hintsLeft={hintsUsed > 0 ? 0 : 1}
        onHint={requestHint}
        hintDisabled={hintsUsed > 0 || Boolean(feedback)}
        onExit={onExit}
      />

      <GamePanel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone="brand">Susun kalimat · {round.level}</Badge>
          <span className="text-xs text-muted">Terjemahan: {round.translation}</span>
        </div>

        <div className="mt-4 min-h-16 rounded-2xl border-2 border-dashed border-line bg-surface-2/40 p-3">
          {picked.length === 0 ? (
            <p className="py-2 text-center text-sm text-muted">Klik komponen di bawah untuk menyusun kalimat.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {picked.map((token, pickedIndex) => (
                <button
                  key={token + "-" + pickedIndex}
                  type="button"
                  onClick={() => removePicked(pickedIndex)}
                  className="rounded-lg border border-brand/30 bg-brand-soft px-2.5 py-1.5 text-sm font-semibold text-brand-strong"
                >
                  {token}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {bank.map((token, bankIndex) => (
            <button
              key={token + "-" + bankIndex}
              type="button"
              onClick={() => pickBank(bankIndex)}
              disabled={Boolean(feedback)}
              className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm font-semibold transition hover:border-brand/40 disabled:opacity-40"
            >
              {token}
            </button>
          ))}
        </div>

        {hintText && !feedback && (
          <p className="mt-3 rounded-xl bg-gold-soft/70 p-2 text-xs text-gold" role="status">
            <Icon name="lightbulb" size={13} className="mr-1 inline" />{hintText}
          </p>
        )}
        {message && !feedback && <p className="mt-3 text-sm text-brand" role="alert">{message}</p>}

        {!feedback ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={check} disabled={picked.length === 0}>Periksa susunan</Button>
            <Button variant="secondary" onClick={() => { setPicked([]); setBank(shuffled(round.answer, seededRng("sentence-game-" + round.id))); }} disabled={picked.length === 0}>
              Acak ulang
            </Button>
            <Button variant="ghost" onClick={skip}>Lewati</Button>
          </div>
        ) : (
          <div className="mt-4">
            <QuestionFeedback
              correct={feedback.correct}
              title={feedback.title}
              onNext={next}
              nextLabel={index + 1 >= rounds.length ? "Lihat hasil" : "Kalimat berikutnya"}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <JpText as="span" text={round.answer.join("")} className="font-semibold text-ink" />
                  <SpeakButton text={round.answer.join("")} />
                </div>
                <p>{round.explanation}</p>
              </div>
            </QuestionFeedback>
          </div>
        )}
      </GamePanel>
    </div>
  );
}
