"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Badge, Button, Card, ProgressBar, Ring, Segmented } from "@/components/ui";
import { DIFFICULTY_DESCRIPTIONS, DIFFICULTY_LABELS, formatGameDuration } from "@/lib/games/shared";
import type { GameAnswerDetail, GameDefinition, GameDifficulty } from "@/lib/types";
import { cn, formatClock } from "@/lib/utils";

export interface GameResultData {
  score: number;
  correct: number;
  total: number;
  durationSec: number;
  details: GameAnswerDetail[];
  xp: number;
}

const DIFFICULTY_OPTIONS: { value: GameDifficulty; label: string }[] = [
  { value: "easy", label: DIFFICULTY_LABELS.easy },
  { value: "standard", label: DIFFICULTY_LABELS.standard },
  { value: "hard", label: DIFFICULTY_LABELS.hard },
];

export function useCountdown(totalSeconds: number, onExpire: () => void): number {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const expireRef = useRef(onExpire);

  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const left = Math.max(0, totalSeconds - Math.floor((Date.now() - startedAt) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
        window.clearInterval(timer);
        expireRef.current();
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [totalSeconds]);

  return secondsLeft;
}

export function useElapsed(): number {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 500);
    return () => window.clearInterval(timer);
  }, []);
  return elapsed;
}

export function GameIntro({
  game,
  difficulty,
  onDifficulty,
  onStart,
  icon,
  extra,
  startLabel = "Mulai permainan",
}: {
  game: GameDefinition;
  difficulty: GameDifficulty;
  onDifficulty: (value: GameDifficulty) => void;
  onStart: () => void;
  icon: IconName;
  extra?: ReactNode;
  startLabel?: string;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Icon name={icon} size={26} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">{game.title}</h2>
            {game.titleJp && <span className="text-sm text-muted">{game.titleJp}</span>}
            <Badge tone="gold">hingga {game.xpReward} XP</Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted">{game.description}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface-2/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Tujuan belajar</p>
          <ul className="mt-2 space-y-1.5">
            {game.objectives.map((objective) => (
              <li key={objective} className="flex gap-2 text-sm">
                <Icon name="checkCircle" size={15} className="mt-0.5 shrink-0 text-matcha" />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-surface-2/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Cara main</p>
          <p className="mt-2 text-sm text-muted">
            Setiap jawaban langsung dinilai. Setelah selesai, tinjau penjelasan tiap soal. Skor, akurasi, dan
            riwayat tersimpan di progres lokalmu.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {extra}
            <Badge tone="muted">Hints tersedia</Badge>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Tingkat kesulitan</p>
        <Segmented options={DIFFICULTY_OPTIONS} value={difficulty} onChange={onDifficulty} />
        <p className="mt-2 text-xs text-muted">{DIFFICULTY_DESCRIPTIONS[difficulty]}</p>
      </div>

      <Button size="lg" onClick={onStart}>
        <Icon name="play" size={17} />
        {startLabel}
      </Button>
    </div>
  );
}

export function GameHud({
  title,
  score,
  secondsLeft,
  secondsTotal,
  elapsed,
  progress,
  hintsLeft,
  onHint,
  hintDisabled,
  onExit,
}: {
  title: string;
  score: number;
  secondsLeft?: number;
  secondsTotal?: number;
  elapsed?: number;
  progress: string;
  hintsLeft?: number;
  onHint?: () => void;
  hintDisabled?: boolean;
  onExit: () => void;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2/60 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{title}</span>
          <Badge tone="brand">{score} poin</Badge>
        </div>
        <div className="flex items-center gap-2">
          {typeof secondsLeft === "number" && (
            <Badge tone={secondsLeft <= 10 ? "brand" : "muted"}>
              <Icon name="clock" size={13} />
              {formatClock(secondsLeft)}
            </Badge>
          )}
          {typeof elapsed === "number" && (
            <Badge tone="muted">
              <Icon name="clock" size={13} />
              {formatGameDuration(elapsed)}
            </Badge>
          )}
          {typeof onHint === "function" && (
            <Button variant="secondary" size="sm" onClick={onHint} disabled={hintDisabled || (hintsLeft ?? 0) <= 0}>
              <Icon name="lightbulb" size={14} />
              Petunjuk {typeof hintsLeft === "number" ? "(" + hintsLeft + ")" : ""}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onExit}>
            Keluar
          </Button>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted">{progress}</p>
      {typeof secondsLeft === "number" && (
        <ProgressBar
          value={secondsLeft}
          max={Math.max(1, secondsTotal ?? secondsLeft)}
          className="mt-2 h-1.5"
          label="Sisa waktu"
        />
      )}
    </div>
  );
}

export function QuestionFeedback({
  correct,
  title,
  children,
  onNext,
  nextLabel = "Lanjut",
  nextDisabled,
}: {
  correct: boolean;
  title: string;
  children: ReactNode;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-2xl border p-4",
        correct ? "border-matcha/40 bg-matcha-soft/60" : "border-brand/30 bg-brand-soft/50",
      )}
    >
      <div className="flex items-center gap-2 text-sm font-bold">
        <Icon name={correct ? "checkCircle" : "xCircle"} size={17} className={correct ? "text-matcha" : "text-brand"} />
        {title}
      </div>
      <div className="mt-1.5 text-sm text-muted">{children}</div>
      <Button className="mt-3" size="sm" onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
        <Icon name="arrowRight" size={15} />
      </Button>
    </div>
  );
}

export function GameResult({
  game,
  difficulty,
  score,
  correct,
  total,
  durationSec,
  details,
  xp,
  onReplay,
  onExit,
}: {
  game: GameDefinition;
  difficulty: GameDifficulty;
  score: number;
  correct: number;
  total: number;
  durationSec: number;
  details: GameAnswerDetail[];
  xp: number;
  onReplay: () => void;
  onExit: () => void;
}) {
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start gap-5 rounded-2xl border border-line bg-surface-2/50 p-4 sm:flex-row sm:items-center">
        <Ring value={accuracy} size={122}>
          <span className="text-2xl font-bold">{accuracy}%</span>
          <span className="text-[11px] text-muted">akurasi</span>
        </Ring>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Permainan selesai</p>
          <h2 className="mt-0.5 text-xl font-bold">{game.title}</h2>
          <p className="mt-1 text-sm text-muted">
            {correct} benar dari {total} soal · {score} poin · {formatGameDuration(durationSec)} ·{" "}
            <span className="font-semibold text-gold">+{xp} XP</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="muted">{DIFFICULTY_LABELS[difficulty]}</Badge>
            <Badge tone="matcha">{correct} benar</Badge>
            <Badge tone="brand">{total - correct} perlu diulang</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={onReplay}>
              <Icon name="rotate" size={16} />
              Main lagi
            </Button>
            <Button variant="secondary" onClick={onExit}>
              Pilih permainan lain
            </Button>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-bold">Tinjau jawaban</p>
        {details.length === 0 ? (
          <p className="text-sm text-muted">Tidak ada rincian jawaban untuk sesi ini.</p>
        ) : (
          <ol className="space-y-2">
            {details.map((detail, index) => (
              <li key={detail.id + "-" + index} className="rounded-xl border border-line bg-surface p-3">
                <div className="flex items-start gap-2">
                  <Icon
                    name={detail.correct ? "checkCircle" : "xCircle"}
                    size={16}
                    className={detail.correct ? "mt-0.5 shrink-0 text-matcha" : "mt-0.5 shrink-0 text-brand"}
                  />
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold">Soal {index + 1}</p>
                    <p className="mt-0.5 whitespace-pre-wrap">{detail.prompt}</p>
                    <p className="mt-1 text-xs text-muted">
                      Jawabanmu: <span className="font-semibold text-ink">{detail.response || "—"}</span>
                      {!detail.correct && (
                        <>
                          {" · "}Jawaban tepat: <span className="font-semibold text-matcha">{detail.expected}</span>
                        </>
                      )}
                    </p>
                    {detail.explanation && <p className="mt-1 text-xs text-muted">{detail.explanation}</p>}
                    {detail.hintUsed && <p className="mt-1 text-[11px] text-gold">Petunjuk dipakai.</p>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export function GamePanel({ children, className }: { children: ReactNode; className?: string }) {
  return <Card className={cn("p-4 sm:p-5", className)}>{children}</Card>;
}
