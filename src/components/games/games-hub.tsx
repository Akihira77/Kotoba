"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Badge, Button, Card, PageHeader, StatTile } from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import { useProgress } from "@/components/providers/progress-provider";
import { GAME_DEFINITIONS, GAME_BY_ID, gameLabel } from "@/lib/games/registry";
import { DIFFICULTY_LABELS } from "@/lib/games/shared";
import type { GameId } from "@/lib/types";
import { formatShortDate } from "@/lib/utils";
function GameLoading() {
  return (
    <Card className="p-8 text-center text-sm text-muted" role="status">
      Memuat permainan…
    </Card>
  );
}

// Games are fetched on demand so the hub stays light on mobile connections.
const WordBuilderGame = dynamic(() => import("./word-builder-game").then((mod) => mod.WordBuilderGame), { ssr: false, loading: GameLoading });
const KanaMatchingGame = dynamic(() => import("./kana-matching-game").then((mod) => mod.KanaMatchingGame), { ssr: false, loading: GameLoading });
const VocabularyRushGame = dynamic(() => import("./vocabulary-rush-game").then((mod) => mod.VocabularyRushGame), { ssr: false, loading: GameLoading });
const SentenceBuilderGame = dynamic(() => import("./sentence-builder-game").then((mod) => mod.SentenceBuilderGame), { ssr: false, loading: GameLoading });
const KanjiChallengeGame = dynamic(() => import("./kanji-challenge-game").then((mod) => mod.KanjiChallengeGame), { ssr: false, loading: GameLoading });
const DailyChallengeGame = dynamic(() => import("./daily-challenge-game").then((mod) => mod.DailyChallengeGame), { ssr: false, loading: GameLoading });

const GAME_ICONS: Record<GameId, IconName> = {
  "word-builder": "edit",
  "kana-matching": "kana",
  "vocabulary-rush": "timer",
  "sentence-builder": "grammar",
  "kanji-challenge": "kanji",
  "daily-challenge": "calendar",
};

export function GamesHub({ initialGame }: { initialGame: GameId | null }) {
  const { snapshot } = useProgress();
  const [active, setActive] = useState<GameId | null>(initialGame);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const stats = snapshot.stats;

  useEffect(() => {
    if (active) surfaceRef.current?.focus();
  }, [active]);

  function open(gameId: GameId) {
    setActive(gameId);
    const url = new URL(window.location.href);
    url.searchParams.set("game", gameId);
    window.history.replaceState(null, "", url.toString());
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function close() {
    setActive(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("game");
    window.history.replaceState(null, "", url.toString());
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  if (active) {
    const game = GAME_BY_ID[active];
    return (
      <div ref={surfaceRef} tabIndex={-1} className="space-y-5 outline-none" aria-labelledby="game-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={close}>
            <Icon name="arrowLeft" size={16} />
            Semua permainan
          </Button>
          <Badge tone="muted"><span lang="ja">{game.titleJp}</span></Badge>
        </div>
        <h1 id="game-title" className="text-xl font-extrabold tracking-tight">{game.title}</h1>
        <GameSurface gameId={active} onExit={close} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Belajar sambil bermain"
        title="Permainan"
        titleJp="ゲーム"
        description="Enam permainan untuk menguatkan kana, kosakata, kanji, dan tata bahasa. Setiap sesi punya tingkat kesulitan, petunjuk, skor, dan penjelasan jawaban."
        icon="games"
        actions={<Badge tone="gold">6 permainan</Badge>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Sesi permainan" value={stats.gameAttempts} hint="Semua percobaan tersimpan" icon="games" />
        <StatTile label="Jawaban benar" value={stats.gameCorrect} hint={stats.gameQuestions + " soal dijawab"} icon="target" tone="matcha" />
        <StatTile label="Skor terbaik" value={stats.gameBestScore} hint="Satu sesi" icon="trophy" tone="gold" />
        <StatTile
          label="Akurasi permainan"
          value={stats.gameQuestions > 0 ? Math.round((stats.gameCorrect / stats.gameQuestions) * 100) + "%" : "—"}
          hint="Benar / total soal"
          icon="zap"
          tone="indigo"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {GAME_DEFINITIONS.map((game) => (
          <Card key={game.id} className="flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon name={GAME_ICONS[game.id]} size={22} />
              </span>
              <div className="flex flex-wrap justify-end gap-1">
                <Badge tone="muted">{game.level}</Badge>
                <Badge tone="gold">{game.xpReward} XP</Badge>
              </div>
            </div>
            <h2 className="mt-3 text-lg font-bold">{game.title}</h2>
            <p className="text-sm text-muted" lang="ja">{game.titleJp}</p>
            <p className="mt-2 text-sm text-muted">{game.description}</p>
            <ul className="mt-3 flex-1 space-y-1">
              {game.objectives.slice(0, 2).map((objective) => (
                <li key={objective} className="flex gap-1.5 text-xs text-muted">
                  <Icon name="checkCircle" size={13} className="mt-0.5 shrink-0 text-matcha" />
                  {objective}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="text-xs text-muted">3 tingkat kesulitan</span>
              <Button size="sm" onClick={() => open(game.id)} aria-label={"Mainkan " + game.title}>
                Mainkan
                <Icon name="arrowRight" size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-bold">Riwayat permainan</h2>
            <p className="text-sm text-muted">Skor terbaru dari semua permainan.</p>
          </div>
          {snapshot.games.length > 0 && <Badge tone="muted">{snapshot.games.length} sesi</Badge>}
        </div>
        {snapshot.games.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line bg-surface-2/40 p-4 text-sm text-muted">
            Belum ada sesi. Mainkan permainan pertama; skor dan akurasi akan muncul di sini dan di halaman Statistik.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {snapshot.games.slice(0, 5).map((attempt) => (
              <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold">{gameLabel(attempt.gameId)}</p>
                  <p className="text-xs text-muted">
                    {DIFFICULTY_LABELS[attempt.difficulty]} · {attempt.correct}/{attempt.total} benar ·{" "}
                    {formatShortDate(attempt.playedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={attempt.accuracy >= 80 ? "matcha" : attempt.accuracy >= 50 ? "gold" : "muted"}>
                    {attempt.accuracy}%
                  </Badge>
                  <span className="text-sm font-bold">{attempt.score} poin</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function GameSurface({ gameId, onExit }: { gameId: GameId; onExit: () => void }) {
  if (gameId === "word-builder") return <WordBuilderGame onExit={onExit} />;
  if (gameId === "kana-matching") return <KanaMatchingGame onExit={onExit} />;
  if (gameId === "vocabulary-rush") return <VocabularyRushGame onExit={onExit} />;
  if (gameId === "sentence-builder") return <SentenceBuilderGame onExit={onExit} />;
  if (gameId === "kanji-challenge") return <KanjiChallengeGame onExit={onExit} />;
  return <DailyChallengeGame onExit={onExit} />;
}
