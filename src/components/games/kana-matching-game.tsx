"use client";

import { useRef, useState } from "react";
import { Badge, Button, Segmented } from "@/components/ui";
import { Icon } from "@/components/icons";
import { useProgress } from "@/components/providers/progress-provider";
import { useSpeech } from "@/lib/speech";
import { GAME_BY_ID } from "@/lib/games/registry";
import {
  KANA_MATCHING_MODES,
  buildKanaMatchingRound,
  kanaMatchExplanation,
  kanaMatchHints,
  kanaMatchPoints,
  pickKanaHintPair,
  type KanaMatchCard,
  type KanaMatchingMode,
  type KanaMatchingRound,
} from "@/lib/games/kana-matching";
import { DIFFICULTY_DESCRIPTIONS, DIFFICULTY_LABELS, estimateGameXp } from "@/lib/games/shared";
import type { GameAnswerDetail, GameDifficulty } from "@/lib/types";
import { GameHud, GamePanel, useElapsed, type GameResultData } from "./game-kit";

const DIFFICULTY_OPTIONS: { value: GameDifficulty; label: string }[] = [
  { value: "easy", label: DIFFICULTY_LABELS.easy },
  { value: "standard", label: DIFFICULTY_LABELS.standard },
  { value: "hard", label: DIFFICULTY_LABELS.hard },
];

export function KanaMatchingGame({ onExit }: { onExit: () => void }) {
  const game = GAME_BY_ID["kana-matching"];
  const { recordGame } = useProgress();
  const [mode, setMode] = useState<KanaMatchingMode>("hiragana-romaji");
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
      gameId: "kana-matching",
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
            <Icon name="kana" size={26} />
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
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pilih jenis latihan</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {KANA_MATCHING_MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={mode === item.id}
                onClick={() => setMode(item.id)}
                className={
                  "rounded-xl border p-3 text-left transition " +
                  (mode === item.id
                    ? "border-brand bg-brand-soft/50"
                    : "border-line bg-surface hover:border-brand/40")
                }
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="mt-0.5 block text-xs text-muted">{item.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Tingkat kesulitan</p>
          <Segmented options={DIFFICULTY_OPTIONS} value={difficulty} onChange={setDifficulty} />
          <p className="mt-2 text-xs text-muted">{DIFFICULTY_DESCRIPTIONS[difficulty]}</p>
        </div>

        <Button size="lg" onClick={start}>
          <Icon name="play" size={17} />
          Mulai mencocokkan
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
            {result.correct} pasangan selesai · {result.score} poin · {result.durationSec} detik ·{" "}
            <span className="font-semibold text-gold">+{result.xp} XP</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={start}>
              <Icon name="rotate" size={16} />
              Main lagi
            </Button>
            <Button variant="secondary" onClick={onExit}>Pilih permainan lain</Button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold">Tinjau pasangan</p>
          <ol className="space-y-2">
            {result.details.map((detail, index) => (
              <li key={detail.id + "-" + index} className="rounded-xl border border-line bg-surface p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="checkCircle" size={15} className="text-matcha" />
                  <span className="font-semibold">{detail.prompt}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{detail.explanation}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  return (
    <Play
      key={runKey}
      gameTitle={game.title}
      mode={mode}
      difficulty={difficulty}
      onFinish={finish}
      onExit={onExit}
    />
  );
}

function Play({
  gameTitle,
  mode,
  difficulty,
  onFinish,
  onExit,
}: {
  gameTitle: string;
  mode: KanaMatchingMode;
  difficulty: GameDifficulty;
  onFinish: (result: GameResultData) => void;
  onExit: () => void;
}) {
  const [round] = useState<KanaMatchingRound>(() => buildKanaMatchingRound(mode, difficulty));
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(() => new Set());
  const [mismatches, setMismatches] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintPair, setHintPair] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const elapsed = useElapsed();
  const { speak } = useSpeech();
  const doneRef = useRef(false);
  const hintLimit = kanaMatchHints(difficulty);

  function cardLabel(card: KanaMatchCard): string {
    if (card.audioOnly) return "Dengarkan";
    return card.label;
  }

  function complete(nextMatched: Set<string>) {
    if (doneRef.current) return;
    doneRef.current = true;
    const details: GameAnswerDetail[] = round.pairs.map((pair) => ({
      id: pair.id,
      prompt: pair.char + " (" + pair.romaji + ")",
      expected: pair.exampleWord ? pair.exampleWord + " — " + (pair.matchSub ?? "") : pair.romaji,
      response: pair.exampleWord ?? pair.romaji,
      correct: true,
      explanation: kanaMatchExplanation([pair]),
      hintUsed: hintsUsed > 0,
    }));
    onFinish({
      score: kanaMatchPoints(round.pairs.length, mismatches, elapsed, hintsUsed),
      correct: nextMatched.size,
      total: round.pairs.length,
      durationSec: Math.max(1, elapsed),
      details,
      xp: estimateGameXp(nextMatched.size, round.pairs.length, difficulty),
    });
  }

  function select(card: KanaMatchCard) {
    if (doneRef.current || matched.has(card.pairId)) return;
    if (card.audioOnly && card.audioText) void speak(card.audioText);
    if (!selected) {
      setSelected(card.id);
      setMessage("");
      return;
    }
    if (selected === card.id) {
      setSelected(null);
      return;
    }
    const first = round.cards.find((item) => item.id === selected);
    if (!first) {
      setSelected(card.id);
      return;
    }
    if (first.pairId === card.pairId) {
      const nextMatched = new Set(matched);
      nextMatched.add(card.pairId);
      setMatched(nextMatched);
      setSelected(null);
      setHintPair(null);
      setMessage("Pasangan tepat: " + card.label + ".");
      if (nextMatched.size >= round.pairs.length) complete(nextMatched);
      return;
    }
    setMismatches((value) => value + 1);
    setSelected(null);
    setMessage("Belum cocok. Perhatikan bentuk dan bunyinya, lalu coba lagi.");
  }

  function requestHint() {
    if (hintsUsed >= hintLimit || doneRef.current) return;
    const pairId = pickKanaHintPair(round.cards, matched);
    if (!pairId) return;
    setHintPair(pairId);
    setHintsUsed((value) => value + 1);
    setMessage("Petunjuk menyorot dua kartu yang berpasangan.");
  }

  return (
    <div className="space-y-4">
      <GameHud
        title={gameTitle}
        score={Math.max(0, round.pairs.length * 100 - mismatches * 12 - hintsUsed * 25)}
        elapsed={elapsed}
        progress={matched.size + " dari " + round.pairs.length + " pasangan cocok"}
        hintsLeft={Math.max(0, hintLimit - hintsUsed)}
        onHint={requestHint}
        hintDisabled={hintsUsed >= hintLimit}
        onExit={onExit}
      />

      <GamePanel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone="brand">{KANA_MATCHING_MODES.find((item) => item.id === mode)?.label}</Badge>
          <span className="text-xs text-muted">Klik dua kartu yang berpasangan. Kartu suara berbunyi saat diklik.</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {round.cards.map((card) => {
            const isMatched = matched.has(card.pairId);
            const isSelected = selected === card.id;
            const isHinted = hintPair === card.pairId;
            return (
              <button
                key={card.id}
                type="button"
                disabled={isMatched}
                onClick={() => select(card)}
                className={
                  "flex min-h-24 flex-col items-center justify-center rounded-xl border p-2 text-center transition " +
                  (isMatched
                    ? "border-matcha/40 bg-matcha-soft/50 opacity-60 "
                    : "bg-surface hover:border-brand/40 hover:bg-brand-soft/20 ") +
                  (isSelected ? "border-brand ring-2 ring-brand/30 " : "border-line ") +
                  (isHinted && !isMatched ? "ring-2 ring-gold " : "")
                }
              >
                {card.face === "prompt" ? (
                  card.audioOnly ? (
                    <>
                      <Icon name="listening" size={22} className="text-brand" />
                      <span className="mt-1 text-xs font-semibold text-muted">Dengarkan</span>
                    </>
                  ) : (
                    <span className="text-3xl font-semibold">{cardLabel(card)}</span>
                  )
                ) : (
                  <>
                    <span className="text-xl font-semibold">{cardLabel(card)}</span>
                    {card.sub && <span className="mt-1 text-[11px] text-muted">{card.sub}</span>}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {message && (
          <p className="mt-3 rounded-xl bg-surface-2/70 p-2 text-xs text-muted" role="status">{message}</p>
        )}
        <p className="mt-3 text-xs text-muted">
          Salah pasangan: {mismatches}. Skor sementara memperhitungkan ketepatan dan kecepatan.
        </p>
      </GamePanel>
    </div>
  );
}