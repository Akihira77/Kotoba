"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DailyGoalCard } from "@/components/goal-progress";
import { ActivityHeatmap } from "@/components/heatmap";
import { Icon } from "@/components/icons";
import { StudyCalendar } from "@/components/study-calendar";
import { useProgress } from "@/components/providers/progress-provider";
import { Badge, Button, Card, EmptyState, LinkButton, ProgressBar, SectionHeading, StatTile } from "@/components/ui";
import { KANJI, KANJI_BY_CHAR } from "@/content/kanji";
import { VOCABULARY, VOCAB_BY_ID } from "@/content/vocabulary";
import { HIRAGANA, KATAKANA } from "@/content/kana";
import { buildAchievements } from "@/lib/achievements";
import { gameLabel } from "@/lib/games/registry";
import { DIFFICULTY_LABELS } from "@/lib/games/shared";
import { LEVEL_LABELS } from "@/lib/constants";
import { studyTimeline, studyTrend, type HistoryEvent } from "@/lib/history";
import { streakSummary } from "@/lib/streak";
import { levelProgress } from "@/lib/xp";
import { formatDuration, formatShortDate, percent } from "@/lib/utils";
import { JLPT_LEVELS, type JLPTLevel, type QuizAttempt } from "@/lib/types";

const QUIZ_MODE_LABELS: Record<QuizAttempt["mode"], string> = {
  practice: "Latihan",
  topic: "Topik",
  review: "Ulasan",
  lesson: "Pelajaran",
  vocabulary: "Kosakata",
  exam: "Ujian",
};

const HISTORY_TONES: Record<HistoryEvent["tone"], string> = {
  matcha: "bg-matcha-soft text-matcha dark:bg-matcha/15",
  brand: "bg-brand-soft text-brand dark:bg-brand/15",
  indigo: "bg-indigo-soft text-indigo-ink dark:bg-indigo/15",
  gold: "bg-gold-soft text-gold dark:bg-gold/15",
  muted: "bg-surface-2 text-muted",
};

function HistoryRow({ event }: { event: HistoryEvent }) {
  return (
    <li>
      <Link
        href={event.href}
        className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/30 p-2.5 transition hover:border-brand/30"
      >
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${HISTORY_TONES[event.tone]}`}>
          <Icon name={event.icon} size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{event.title}</span>
          <span className="block text-[10px] text-muted">{event.detail}</span>
        </span>
        <span className="shrink-0 text-right text-[10px] text-muted">
          {formatShortDate(event.at)}
          {event.xp ? <span className="mt-0.5 block font-semibold text-brand">+{event.xp} XP</span> : null}
        </span>
      </Link>
    </li>
  );
}

export default function ProgressPage() {
  const { snapshot, exportSnapshot, loading } = useProgress();
  const [selectedTrendDate, setSelectedTrendDate] = useState<string | null>(null);
  const { profile, cards, kana, reviews, exams, quizAttempts, games, stats } = snapshot;

  const level = levelProgress(profile.xp);
  const accuracy = stats.totalReviews > 0 ? percent(stats.correctReviews, stats.totalReviews) : 0;
  const cardMap = useMemo(() => new Map(cards.map((card) => [`${card.kind}:${card.itemId}`, card])), [cards]);

  const levelRows = useMemo(
    () =>
      JLPT_LEVELS.map((jlpt: JLPTLevel) => {
        const vocab = VOCABULARY.filter((word) => word.level === jlpt);
        const kanji = KANJI.filter((item) => item.level === jlpt);
        const total = vocab.length + kanji.length;
        let learned = 0;
        let mastered = 0;
        for (const word of vocab) {
          const card = cardMap.get(`vocab:${word.id}`);
          if (card && card.reps > 0) learned += 1;
          if (card && card.reps >= 6) mastered += 1;
        }
        for (const item of kanji) {
          const card = cardMap.get(`kanji:${item.char}`);
          if (card && card.reps > 0) learned += 1;
          if (card && card.reps >= 6) mastered += 1;
        }
        return { jlpt, total, learned, mastered, pct: total > 0 ? Math.round((mastered / total) * 100) : 0 };
      }),
    [cardMap],
  );

  const kanaRows = useMemo(
    () =>
      [
        { script: "hiragana" as const, label: "Hiragana", total: HIRAGANA.length },
        { script: "katakana" as const, label: "Katakana", total: KATAKANA.length },
      ].map((row) => {
        const entries = kana.filter((item) => item.script === row.script);
        const learned = entries.filter((item) => item.mastery > 0).length;
        const mastered = entries.filter((item) => item.mastery >= 4).length;
        return { ...row, learned, mastered, pct: row.total > 0 ? Math.round((mastered / row.total) * 100) : 0 };
      }),
    [kana],
  );

  const achievements = buildAchievements(snapshot);
  const streak = streakSummary(snapshot);
  const timeline = useMemo(() => studyTimeline(snapshot, 12), [snapshot]);
  const unlockedCount = achievements.filter((item) => item.unlocked).length;
  const chartDays = useMemo(() => studyTrend(snapshot, 30), [snapshot]);
  const selectedTrend = chartDays.find((day) => day.date === selectedTrendDate) ?? null;
  const chartMax = Math.max(10, ...chartDays.map((day) => day.xp));
  const trendActive = chartDays.filter((day) => day.active).length;
  const trendMinutes = chartDays.reduce((total, day) => total + day.minutes, 0);
  const trendReviews = chartDays.reduce((total, day) => total + day.reviews, 0);

  const recentReviews = reviews.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Rekap belajar · 学習記録</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Statistik</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Semua yang kamu kerjakan tersimpan di server lokal perangkat ini: ulasan, pelajaran, permainan, dan simulasi ujian.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => void exportSnapshot()} disabled={loading}>
            <Icon name="download" size={16} />
            Ekspor data
          </Button>
          <LinkButton href="/settings" variant="soft" size="sm">
            <Icon name="settings" size={16} />
            Pengaturan
          </LinkButton>
        </div>
      </div>

      <Card className="overflow-hidden bg-gradient-to-br from-brand-soft/80 via-surface to-matcha-soft/60 p-5 sm:p-6 dark:from-brand/10 dark:via-surface dark:to-matcha/10">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-surface text-2xl font-bold text-brand shadow-soft">
            {profile.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <Badge tone="brand">Level {level.level}</Badge>
              <Badge tone="muted">{level.title} {level.jp}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted">
              {level.current} / {level.needed} XP menuju level {level.level + 1} · total {profile.xp} XP
            </p>
            <ProgressBar value={level.current} max={level.needed} className="mt-2 max-w-xl" barClassName="bg-brand" label="Progres level" />
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="flex items-center justify-center gap-1 text-2xl font-bold text-brand">
                <Icon name="flame" size={20} />
                {streak.current}
              </p>
              <p className="text-[11px] font-medium text-muted">streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">{streak.longest}</p>
              <p className="text-[11px] font-medium text-muted">rekor</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line/70 pt-3">
          <span className="text-[11px] font-semibold text-muted">Minggu ini</span>
          {streak.week.map((day) => (
            <span
              key={day.date}
              className={`flex h-7 min-w-9 items-center justify-center gap-1 rounded-lg px-1.5 text-[10px] font-semibold ${
                day.active
                  ? "bg-matcha text-white dark:bg-matcha/25 dark:text-matcha"
                  : day.isToday
                    ? "border border-brand/40 bg-surface text-brand"
                    : "bg-surface text-muted ring-1 ring-line"
              }`}
              title={`${day.date}${day.isToday ? " · hari ini" : ""}`}
            >
              {day.active ? <Icon name="check" size={11} /> : null}
              {day.weekday}
            </span>
          ))}
          <span className="ml-auto text-[10px] text-muted">{streak.totalActiveDays} hari aktif total</span>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total ulasan" value={stats.totalReviews} hint={`akurasi ${accuracy}%`} icon="layers" tone="matcha" />
        <StatTile label="Menit belajar" value={stats.studyMinutes} hint="akumulasi semua aktivitas" icon="clock" tone="indigo" />
        <StatTile label="Pelajaran" value={stats.lessonsCompleted} hint="grammar, bacaan, budaya, kana" icon="book" tone="gold" />
        <StatTile label="Ujian" value={stats.examsTaken} hint={`${exams.filter((exam) => exam.passed).length} kali target tercapai`} icon="exam" tone="brand" />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <Card className="p-5 sm:p-6">
            <SectionHeading
              title="Aktivitas 17 minggu"
              description="Intensitas belajar harian berdasarkan XP yang dikumpulkan."
              icon="calendar"
            />
            <div className="mt-4">
              <ActivityHeatmap activity={snapshot.activity} />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading
              title="Tren 30 hari terakhir"
              description="XP, menit belajar, dan ulasan per hari. Hari kosong tetap ditampilkan."
              icon="zap"
            />
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full bg-surface-2 px-2.5 py-1"><b className="tnum">{trendActive}</b> hari aktif</span>
              <span className="rounded-full bg-surface-2 px-2.5 py-1"><b className="tnum">{trendMinutes}</b> menit</span>
              <span className="rounded-full bg-surface-2 px-2.5 py-1"><b className="tnum">{trendReviews}</b> ulasan</span>
            </div>
            {snapshot.activity.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon="zap"
                  title="Belum ada aktivitas"
                  description="Mulai sesi pertamamu untuk mengisi grafik ini."
                  action={<LinkButton href="/practice" variant="soft">Mulai latihan</LinkButton>}
                />
              </div>
            ) : (
              <div className="mt-5 flex h-40 items-end gap-1">
                {chartDays.map((day, index) => {
                  const height = Math.max(2, Math.round((day.xp / chartMax) * 100));
                  const selected = selectedTrendDate === day.date;
                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => setSelectedTrendDate(day.date)}
                      aria-pressed={selected}
                      aria-controls="trend-detail"
                      aria-label={`${day.label}: ${day.xp} XP, ${day.minutes} menit belajar, ${day.reviews} ulasan`}
                      className="group flex h-full min-w-0 flex-1 cursor-pointer flex-col items-center justify-end gap-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                    >
                      <span className={`text-[9px] font-semibold text-muted transition ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`}>
                        {day.xp}
                      </span>
                      <span
                        className={day.xp > 0 ? `w-full rounded-t-sm transition ${selected ? "bg-brand" : "bg-brand/80 group-hover:bg-brand"}` : "w-full rounded-t-sm bg-line/70"}
                        style={{ height: `${height}%` }}
                        title={`${day.date}: ${day.xp} XP · ${day.minutes} menit · ${day.reviews} ulasan`}
                      />
                      <span className="h-3 text-[8px] text-muted">
                        {index % 5 === 0 || index === chartDays.length - 1 ? day.label.split(" ")[0] : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {snapshot.activity.length > 0 ? (
              <p id="trend-detail" role="status" aria-live="polite" className="mt-2 text-xs text-muted">
                {selectedTrend
                  ? `${selectedTrend.label}: ${selectedTrend.xp} XP, ${selectedTrend.minutes} menit belajar, ${selectedTrend.reviews} ulasan.`
                  : "Ketuk salah satu batang untuk melihat detail hari."}
              </p>
            ) : null}
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading
              title="Kalender belajar"
              description="Hari aktif dihitung dari tanggal lokal perangkat ini."
              icon="calendar"
            />
            <div className="mt-4">
              <StudyCalendar activity={snapshot.activity} />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading
              title="Riwayat belajar"
              description="Pelajaran, latihan, permainan, ujian, dan sesi harian dalam satu garis waktu."
              icon="clock"
            />
            {timeline.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon="clock"
                  title="Belum ada riwayat"
                  description="Aktivitas pertamamu akan muncul di sini setelah satu sesi belajar."
                  action={<LinkButton href="/learn" variant="soft">Buka kurikulum</LinkButton>}
                />
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {timeline.map((event) => (
                  <HistoryRow key={event.id} event={event} />
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading title="Riwayat latihan" description={`${quizAttempts.length} sesi kuis tersimpan.`} icon="practice" />
            {quizAttempts.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon="practice"
                  title="Belum ada riwayat latihan"
                  description="Selesaikan sesi latihan adaptif untuk melihat skor dan waktu belajarmu."
                  action={<LinkButton href="/practice" variant="soft">Buka latihan</LinkButton>}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {quizAttempts.slice(0, 6).map((attempt) => (
                  <div key={attempt.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-2/50 p-3">
                    <Badge tone="indigo">{QUIZ_MODE_LABELS[attempt.mode]}</Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{attempt.title}</p>
                      <p className="text-xs text-muted">
                        {attempt.correct}/{attempt.total} benar · {formatDuration(attempt.durationSec)} · {formatShortDate(attempt.finishedAt)}
                      </p>
                    </div>
                    <Badge tone={attempt.score >= 80 ? "matcha" : "brand"}>{attempt.score}/100</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading
              title="Permainan"
              description={`${stats.gameAttempts} sesi · ${stats.gameCorrect} jawaban benar.`}
              icon="games"
              action={<LinkButton href="/games" variant="soft" size="sm">Buka permainan</LinkButton>}
            />
            {games.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon="games"
                  title="Belum ada riwayat permainan"
                  description="Mainkan salah satu permainan untuk melatih kosakata, kana, kanji, dan susunan kalimat."
                  action={<LinkButton href="/games" variant="soft">Pilih permainan</LinkButton>}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {games.slice(0, 6).map((attempt) => (
                  <div key={attempt.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-2/50 p-3">
                    <Badge tone="indigo">{gameLabel(attempt.gameId)}</Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {attempt.correct}/{attempt.total} benar · {attempt.accuracy}% akurasi
                      </p>
                      <p className="text-xs text-muted">
                        {DIFFICULTY_LABELS[attempt.difficulty]} · {formatDuration(attempt.durationSec)} · {formatShortDate(attempt.playedAt)}
                      </p>
                    </div>
                    <Badge tone={attempt.accuracy >= 80 ? "matcha" : "brand"}>{attempt.score} poin</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading title="Riwayat ujian" description={`${exams.length} percobaan tersimpan.`} icon="exam" />
            {exams.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon="exam"
                  title="Belum ada simulasi"
                  description="Coba simulasi JLPT untuk mengukur kemampuanmu."
                  action={<LinkButton href="/exams" variant="soft">Buka ujian</LinkButton>}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {exams.slice(0, 6).map((exam) => {
                  const score = exam.total > 0 ? Math.round((exam.score / exam.total) * 100) : 0;
                  return (
                    <div key={exam.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-2/50 p-3">
                      <Badge tone="indigo">{exam.level}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{score}% · {exam.correct}/{exam.totalQuestions} benar</p>
                        <p className="text-xs text-muted">{formatShortDate(exam.finishedAt)} · {Math.round(exam.durationSec / 60)} menit</p>
                      </div>
                      <Badge tone={exam.passed ? "matcha" : "muted"}>{exam.passed ? "Target tercapai" : "Belum target"}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <DailyGoalCard snapshot={snapshot} />

          <Card className="p-5">
            <SectionHeading title="Kuasai kanji & kosakata" description="Berdasarkan jumlah ulasan kartu." icon="target" />
            <div className="mt-4 space-y-4">
              {levelRows.map((row) => (
                <div key={row.jlpt}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold">{LEVEL_LABELS[row.jlpt]}</span>
                    <span className="text-muted">{row.mastered}/{row.total}</span>
                  </div>
                  <ProgressBar value={row.mastered} max={row.total} barClassName="bg-matcha" label={"Penguasaan " + LEVEL_LABELS[row.jlpt]} />
                  <p className="mt-1 text-[10px] text-muted">{row.learned} dipelajari · {row.pct}% dikuasai</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeading title="Kana" description="Mastery dari latihan dan game kana." icon="kana" />
            <div className="mt-4 space-y-4">
              {kanaRows.map((row) => (
                <div key={row.script}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold">{row.label}</span>
                    <span className="text-muted">{row.mastered}/{row.total}</span>
                  </div>
                  <ProgressBar value={row.mastered} max={row.total} barClassName="bg-brand" label={"Penguasaan " + row.label} />
                  <p className="mt-1 text-[10px] text-muted">{row.learned} dikenali · {row.pct}% dikuasai</p>
                </div>
              ))}
            </div>
            <Link href="/kana" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
              Latihan kana
              <Icon name="arrowRight" size={14} />
            </Link>
          </Card>

          <Card className="p-5">
            <SectionHeading title="Pencapaian" description={`${unlockedCount} dari ${achievements.length} terbuka.`} icon="trophy" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              {achievements.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border p-2.5 transition ${item.unlocked ? "border-line bg-surface-2/60" : "border-dashed border-line bg-surface opacity-60"}`}
                  title={item.description}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon name={item.icon} size={16} className={item.unlocked ? "text-brand" : "text-muted"} />
                    {!item.unlocked && <Icon name="lock" size={12} className="text-muted" />}
                  </div>
                  <p className="mt-1.5 text-[11px] font-semibold leading-tight">{item.label}</p>
                  <p className="mt-0.5 text-[10px] text-muted">{item.progress}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-5 sm:p-6">
        <SectionHeading title="Ulasan terakhir" description="Delapan kartu yang terakhir kamu nilai." icon="clock" />
        {recentReviews.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Belum ada ulasan. Kartu pertama akan muncul di sini setelah kamu belajar.</p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {recentReviews.map((review) => {
              const label =
                review.kind === "vocab"
                  ? (VOCAB_BY_ID.get(review.itemId)?.japanese ?? review.itemId)
                  : (KANJI_BY_CHAR.get(review.itemId)?.char ?? review.itemId);
              const meaning =
                review.kind === "vocab"
                  ? (VOCAB_BY_ID.get(review.itemId)?.meaning ?? "")
                  : (KANJI_BY_CHAR.get(review.itemId)?.meanings.join(", ") ?? "");
              return (
                <div key={review.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <Icon
                    name={review.correct ? "checkCircle" : "xCircle"}
                    size={18}
                    className={review.correct ? "text-matcha" : "text-brand"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {label} {meaning && <span className="font-normal text-muted">· {meaning}</span>}
                    </p>
                    <p className="text-[11px] text-muted">
                      {review.kind === "vocab" ? "Kosakata" : "Kanji"} · {review.mode} · {formatShortDate(review.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}