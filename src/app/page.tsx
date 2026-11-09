"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DailyGoalCard } from "@/components/goal-progress";
import { ActivityHeatmap } from "@/components/heatmap";
import { Icon } from "@/components/icons";
import { RecommendationList } from "@/components/recommendations";
import { useProgress } from "@/components/providers/progress-provider";
import {
  Badge,
  Card,
  LinkButton,
  ProgressBar,
  Ring,
  SectionHeading,
} from "@/components/ui";
import { CURRICULUM_LESSONS } from "@/content/curriculum";
import { GRAMMAR } from "@/content/grammar";
import { ALL_KANA } from "@/content/kana";
import { KANJI } from "@/content/kanji";
import { VOCABULARY } from "@/content/vocabulary";
import { recentAchievements, type AchievementView } from "@/lib/achievements";
import { LEVEL_LABELS, XP_RULES } from "@/lib/constants";
import {
  LEVEL_UNLOCK_RATIO,
  countCompletedCatalogLessons,
  currentJlptLevel,
  isLessonComplete,
  lastCompletedCatalogLesson,
  lessonProgressKind,
  LESSON_PROGRESS_ICONS,
  LESSON_PROGRESS_LABELS,
  levelCompletion,
  moduleForLesson,
  nextJlptLevel,
  recommendedLesson,
} from "@/lib/learning";
import { buildRecommendations } from "@/lib/recommendations";
import { isDue } from "@/lib/srs";
import { streakSummary } from "@/lib/streak";
import { JLPT_LEVELS, type JLPTLevel } from "@/lib/types";
import { levelProgress } from "@/lib/xp";
import { formatNumber, formatShortDate, greeting, toDateKey } from "@/lib/utils";

const ACHIEVEMENT_TONES: Record<AchievementView["tone"], string> = {
  matcha: "bg-matcha-soft text-matcha dark:bg-matcha/15",
  brand: "bg-brand-soft text-brand dark:bg-brand/15",
  indigo: "bg-indigo-soft text-indigo-ink dark:bg-indigo/15",
  gold: "bg-gold-soft text-gold dark:bg-gold/15",
};

export default function DashboardPage() {
  const { snapshot } = useProgress();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Defer to a task so SSR and the first client paint agree, then reveal today's data.
    const timer = window.setTimeout(() => setNow(new Date()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const todayKey = now ? toDateKey(now) : null;
  const todayActivity = todayKey ? snapshot.activity.find((day) => day.date === todayKey) : undefined;
  const xpToday = todayActivity?.xp ?? 0;
  const reviewsToday = todayActivity?.reviews ?? 0;
  const settings = snapshot.profile.settings;
  const goal = settings.dailyGoalXp;
  const goalPercent = Math.min(100, Math.round((xpToday / goal) * 100));
  const level = levelProgress(snapshot.profile.xp);
  const studiedToday = lessonsToday(snapshot.lessons, todayKey);

  const due = useMemo(() => snapshot.cards.filter((card) => isDue(card)), [snapshot.cards]);
  const dueKanji = due.filter((card) => card.kind === "kanji").length;

  const vocabSummary = useMemo(() => {
    const cardMap = new Map(
      snapshot.cards.filter((card) => card.kind === "vocab").map((card) => [card.itemId, card]),
    );
    let dueCount = 0;
    let newCount = 0;
    let mastered = 0;
    const dueWords = [];
    for (const word of VOCABULARY) {
      const card = cardMap.get(word.id);
      if (!card || card.reps === 0) newCount += 1;
      if (card && card.reps >= 6) mastered += 1;
      if (card && isDue(card)) {
        dueCount += 1;
        if (dueWords.length < 3) dueWords.push(word);
      }
    }
    return { dueCount, newCount, mastered, dueWords, total: VOCABULARY.length };
  }, [snapshot.cards]);

  const currentLevel = currentJlptLevel(snapshot);
  const levelPath = JLPT_LEVELS.map((levelKey: JLPTLevel) => ({
    ...levelCompletion(snapshot, levelKey),
    label: LEVEL_LABELS[levelKey],
  }));
  const currentCompletion =
    levelPath.find((entry) => entry.level === currentLevel) ?? levelPath[0];
  const nextLevel = nextJlptLevel(currentLevel);
  const requiredForNext = Math.ceil(currentCompletion.total * LEVEL_UNLOCK_RATIO);
  const remainingForNext = Math.max(0, requiredForNext - currentCompletion.completed);

  const recommended = recommendedLesson(snapshot);
  const completedLessons = countCompletedCatalogLessons(snapshot);
  const allComplete = completedLessons >= CURRICULUM_LESSONS.length;
  const streak = streakSummary(snapshot, todayKey ?? undefined);
  const recommendations = now ? buildRecommendations(snapshot, { limit: 3, now: now.getTime() }) : [];

  const vocabLearned = snapshot.cards.filter((card) => card.kind === "vocab" && card.reps > 0).length;
  const kanjiLearned = snapshot.cards.filter((card) => card.kind === "kanji" && card.reps > 0).length;
  const grammarCompleted = new Set(
    snapshot.lessons.filter((lesson) => lesson.kind === "grammar").map((lesson) => lesson.lessonId),
  ).size;
  const totalMinutes = snapshot.stats.studyMinutes;
  const curriculumPercent = Math.round((completedLessons / CURRICULUM_LESSONS.length) * 100);
  const recentExams = snapshot.exams.slice(0, 3);

  const continueItems = useMemo(() => {
    if (!recommended) return [];
    const sameLevel = CURRICULUM_LESSONS.filter(
      (lesson) => lesson.level === recommended.level && !isLessonComplete(snapshot, lesson),
    );
    const index = sameLevel.findIndex((lesson) => lesson.id === recommended.id);
    const ordered = index >= 0 ? [...sameLevel.slice(index + 1), ...sameLevel.slice(0, index)] : sameLevel;
    return ordered.slice(0, 2);
  }, [snapshot, recommended]);

  const lastCompleted = useMemo(() => lastCompletedCatalogLesson(snapshot), [snapshot]);
  const achievements = recentAchievements(snapshot, 3);
  const kanaMastered = snapshot.kana.filter((row) => row.mastery >= 4).length;

  const plan = [
    ...(due.length > 0
      ? [{ label: `Ulas ${due.length} kartu jatuh tempo`, done: reviewsToday > 0, href: "/vocabulary?tab=review" }]
      : []),
    { label: "Selesaikan satu pelajaran", done: studiedToday, href: recommended?.href ?? "/learn" },
    { label: "Jawab minimal 10 soal", done: reviewsToday >= 10, href: "/practice" },
    { label: `Capai ${goal} XP hari ini`, done: xpToday >= goal, href: "/practice" },
  ];
  const completedPlan = plan.filter((item) => item.done).length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
        <div className="pointer-events-none absolute inset-0 bg-seigaiha pattern-opacity" aria-hidden="true" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-10 select-none font-jp text-[140px] font-bold leading-none text-brand/5 dark:text-brand/10"
        >
          言葉
        </span>
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.55fr_1fr] lg:items-center">
          <div>
            <Badge tone="brand" className="mb-3">
              <Icon name="sparkles" size={13} /> Selamat datang kembali · おかえりなさい
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mari lanjutkan, {snapshot.profile.name}.</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              {now ? greeting(now) : "Halo"}. Setiap langkah kecil hari ini menambah bekalmu untuk percakapan nyata.
              Mulai dari ulangan singkat, lalu lanjutkan satu materi.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <LinkButton href={due.length > 0 ? "/vocabulary?tab=review" : recommended?.href ?? "/learn"}>
                <Icon name={due.length > 0 ? "layers" : "play"} size={17} />
                {due.length > 0 ? `Ulas ${due.length} kartu` : "Mulai belajar"}
              </LinkButton>
              <LinkButton href="/learn" variant="secondary">
                Lihat kurikulum
              </LinkButton>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-surface/80 p-3.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold">
                    {LEVEL_LABELS[currentLevel]}
                  </span>
                  <span className="tnum text-muted">{currentCompletion.percent}%</span>
                </div>
                <ProgressBar value={currentCompletion.percent} className="mt-2" label="Kemajuan level JLPT" />
                <p className="mt-1.5 text-[11px] text-muted">
                  {currentCompletion.completed} dari {currentCompletion.total} pelajaran di jalur ini
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-surface/80 p-3.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Icon name="flame" size={15} className="text-brand" /> {streak.current} hari beruntun
                  </span>
                  <span className="text-muted">rekor {streak.longest}</span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted">
                  Level perjalananmu {level.level} · {level.title}. {streak.week.filter((day) => day.active).length} dari 7 hari
                  minggu ini sudah aktif.
                </p>
              </div>
            </div>
          </div>

          <div className="justify-self-start lg:justify-self-end">
            <div className="rounded-3xl border border-line bg-surface/85 p-5 shadow-soft">
              <p className="text-center text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Target hari ini</p>
              <div className="mx-auto mt-3 w-fit">
                <Ring value={goalPercent} size={148} label={`${goalPercent}% dari target harian`}>
                  <span className="text-2xl font-bold tnum">{formatNumber(xpToday)}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted">dari {goal} XP</span>
                  <span className="text-[10px] text-muted">hari ini</span>
                </Ring>
              </div>
              <p className="mt-3 text-center text-xs text-muted" aria-live="polite">
                {goalPercent >= 100
                  ? "Target tercapai. Pertahankan ritme belajarmu."
                  : `${formatNumber(Math.max(0, goal - xpToday))} XP lagi menuju target.`}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3 text-[11px] text-muted">
                <span className="flex items-center gap-1.5">
                  <Icon name="layers" size={14} className="text-indigo" /> {due.length} kartu jatuh tempo
                </span>
                <Link href="/progress" className="font-semibold text-brand hover:underline">
                  Statistik
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Ringkasan belajar</p>
            <p className="mt-0.5 text-sm font-semibold">
              Level {level.level} · {level.title}
              <span className="ml-2 text-xs font-normal text-muted">{LEVEL_LABELS[currentLevel]}</span>
            </p>
          </div>
          <div className="flex min-w-[190px] flex-1 items-center gap-3 sm:max-w-xs">
            <ProgressBar value={curriculumPercent} className="flex-1" label="Kemajuan kurikulum" />
            <span className="tnum shrink-0 text-xs font-semibold">{curriculumPercent}%</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-2xl border border-line bg-surface-2/35 p-3">
            <p className="flex items-center gap-1.5 text-[11px] text-muted"><Icon name="learn" size={13} /> Pelajaran</p>
            <p className="mt-1 text-xl font-bold tnum">{completedLessons}<span className="text-xs font-normal text-muted">/{CURRICULUM_LESSONS.length}</span></p>
            <p className="text-[10px] text-muted">selesai di kurikulum</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface-2/35 p-3">
            <p className="flex items-center gap-1.5 text-[11px] text-muted"><Icon name="vocab" size={13} /> Kosakata</p>
            <p className="mt-1 text-xl font-bold tnum">{vocabLearned}<span className="text-xs font-normal text-muted">/{VOCABULARY.length}</span></p>
            <p className="text-[10px] text-muted">pernah diulas</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface-2/35 p-3">
            <p className="flex items-center gap-1.5 text-[11px] text-muted"><Icon name="kanji" size={13} /> Kanji</p>
            <p className="mt-1 text-xl font-bold tnum">{kanjiLearned}<span className="text-xs font-normal text-muted">/{KANJI.length}</span></p>
            <p className="text-[10px] text-muted">pernah diulas</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface-2/35 p-3">
            <p className="flex items-center gap-1.5 text-[11px] text-muted"><Icon name="grammar" size={13} /> Tata bahasa</p>
            <p className="mt-1 text-xl font-bold tnum">{grammarCompleted}<span className="text-xs font-normal text-muted">/{GRAMMAR.length}</span></p>
            <p className="text-[10px] text-muted">pelajaran selesai</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface-2/35 p-3">
            <p className="flex items-center gap-1.5 text-[11px] text-muted"><Icon name="clock" size={13} /> Waktu belajar</p>
            <p className="mt-1 text-xl font-bold tnum">{formatStudyMinutes(totalMinutes)}</p>
            <p className="text-[10px] text-muted">total tercatat</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface-2/35 p-3">
            <p className="flex items-center gap-1.5 text-[11px] text-muted"><Icon name="exam" size={13} /> Ujian</p>
            <p className="mt-1 text-xl font-bold tnum">{snapshot.exams.length}</p>
            <p className="text-[10px] text-muted">{snapshot.exams.filter((exam) => exam.passed).length} lulus simulasi</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <DailyGoalCard snapshot={snapshot} />

          <Card className="p-5 sm:p-6">
            <SectionHeading
              title="Saran untukmu"
              description="Disusun dari kartu SRS, latihan, pelajaran, dan ujian yang benar-benar kamu kerjakan."
              icon="sparkles"
              action={
                <LinkButton href="/progress" variant="ghost" size="sm">
                  Lihat semua <Icon name="chevronRight" size={14} />
                </LinkButton>
              }
            />
            <div className="mt-4">
              {recommendations.length > 0 ? (
                <RecommendationList recommendations={recommendations} />
              ) : (
                <div className="space-y-2.5" aria-label="Menyiapkan saran">
                  {[0, 1].map((item) => (
                    <div key={item} className="h-24 animate-pulse rounded-2xl bg-surface-2" />
                  ))}
                </div>
              )}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Alasan dan bukti ditampilkan agar kamu bisa menilai sendiri apakah saran ini relevan. Tidak ada data yang
              dikirim ke layanan luar.
            </p>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading
              title="Lanjutkan belajar"
              description={
                lastCompleted
                  ? `Terakhir kamu menyelesaikan "${lastCompleted.lesson.title}".`
                  : "Urutan pelajaran berikutnya di jalurmu."
              }
              icon="play"
              action={
                <LinkButton href="/learn" variant="ghost" size="sm">
                  Semua pelajaran <Icon name="chevronRight" size={15} />
                </LinkButton>
              }
            />
            {continueItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-surface-2/40 px-4 py-6 text-center">
                <p className="text-sm font-medium">
                  {allComplete ? "Semua pelajaran sudah selesai." : "Langkah berikutnya sedang disiapkan."}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {allComplete
                    ? "Coba ujian JLPT atau ulangi materi yang ingin kamu perdalam."
                    : "Buka kurikulum untuk melihat seluruh jalur belajar."}
                </p>
                <LinkButton href={allComplete ? "/exams" : "/learn"} variant="secondary" size="sm" className="mt-3">
                  {allComplete ? "Buka ujian" : "Buka kurikulum"}
                </LinkButton>
              </div>
            ) : (
              <div className="space-y-2.5">
                {continueItems.map((lesson, index) => {
                  const lessonModule = moduleForLesson(lesson);
                  return (
                    <Link
                      key={lesson.id}
                      href={lesson.href}
                      className="group flex items-center gap-3 rounded-2xl border border-line bg-surface-2/30 p-3.5 transition hover:-translate-y-0.5 hover:border-brand/30 hover:bg-surface"
                    >
                      <span className="tnum flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-bold text-muted">
                        {index + 2}
                      </span>
                      <span className="rounded-xl bg-brand-soft p-2 text-brand dark:bg-brand/15">
                        <Icon name={LESSON_PROGRESS_ICONS[lessonProgressKind(lesson)]} size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] text-muted">
                          {lesson.level} · {lessonModule?.title ?? LESSON_PROGRESS_LABELS[lessonProgressKind(lesson)]}
                        </span>
                        <span className="block truncate text-sm font-semibold group-hover:text-brand">{lesson.title}</span>
                        <span className="block truncate font-jp text-xs text-muted">{lesson.titleJp}</span>
                      </span>
                      <span className="hidden shrink-0 items-center gap-1 text-[11px] text-muted sm:flex">
                        <Icon name="clock" size={12} /> {lesson.estimateMinutes} mnt
                      </span>
                      <Icon name="chevronRight" size={16} className="shrink-0 text-muted" />
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading
              title="Ringkasan ulangan kosakata"
              description="Kartu yang jatuh tempo, kata baru, dan yang sudah kamu kuasai."
              icon="layers"
              action={
                <LinkButton href="/vocabulary" variant="ghost" size="sm">
                  Buka kamus <Icon name="chevronRight" size={15} />
                </LinkButton>
              }
            />
            <div className="grid gap-2.5 sm:grid-cols-3">
              <div className="rounded-2xl border border-line bg-brand-soft/40 p-3.5">
                <p className="text-[11px] font-medium text-muted">Jatuh tempo</p>
                <p className="tnum mt-0.5 text-2xl font-bold text-brand">{formatNumber(vocabSummary.dueCount)}</p>
                <p className="text-[11px] text-muted">kosakata siap diulas</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface-2/40 p-3.5">
                <p className="text-[11px] font-medium text-muted">Kata baru</p>
                <p className="tnum mt-0.5 text-2xl font-bold">{formatNumber(vocabSummary.newCount)}</p>
                <p className="text-[11px] text-muted">belum pernah diulas</p>
              </div>
              <div className="rounded-2xl border border-line bg-matcha-soft/40 p-3.5">
                <p className="text-[11px] font-medium text-muted">Dikuasai</p>
                <p className="tnum mt-0.5 text-2xl font-bold text-matcha">{formatNumber(vocabSummary.mastered)}</p>
                <p className="text-[11px] text-muted">minimal 6 ulangan</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>Penguasaan kosakata</span>
                <span className="tnum">
                  {vocabSummary.mastered}/{vocabSummary.total} kata · {Math.round((vocabSummary.mastered / vocabSummary.total) * 100)}%
                </span>
              </div>
              <ProgressBar
                value={vocabSummary.mastered}
                max={vocabSummary.total}
                className="mt-1.5"
                label="Penguasaan kosakata"
              />
            </div>
            {vocabSummary.dueWords.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium text-muted">Menunggu:</span>
                {vocabSummary.dueWords.map((word) => (
                  <span key={word.id} className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs">
                    <span className="font-jp font-semibold">{word.japanese}</span>
                    <span className="ml-1 text-muted">{word.kana}</span>
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-2/50 px-3 py-2.5">
              <p className="text-xs text-muted">
                {vocabSummary.dueCount > 0
                  ? `Satu ulasan benar memberi ${XP_RULES.reviewCorrect} XP.`
                  : "Tidak ada kosakata yang jatuh tempo hari ini."}
                {dueKanji > 0 ? ` ${dueKanji} kanji juga menunggu diulas.` : ""}
              </p>
              <LinkButton
                href={vocabSummary.dueCount > 0 ? "/vocabulary?tab=review" : "/vocabulary"}
                size="sm"
                variant={vocabSummary.dueCount > 0 ? "primary" : "secondary"}
              >
                {vocabSummary.dueCount > 0 ? "Ulas kosakata" : "Tambah kata baru"}
              </LinkButton>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading
              title="Jalur JLPT"
              description={`Kamu berada di ${currentLevel}. Jalur naik level mengikuti katalog pelajaran.`}
              icon="target"
              action={
                <LinkButton href="/learn" variant="ghost" size="sm">
                  Buka kurikulum <Icon name="chevronRight" size={15} />
                </LinkButton>
              }
            />
            <div className="grid grid-cols-2 gap-2 min-[380px]:grid-cols-5 sm:gap-2.5">
              {levelPath.map((entry) => {
                const isCurrent = entry.level === currentLevel;
                const reached = entry.percent >= Math.round(LEVEL_UNLOCK_RATIO * 100);
                return (
                  <div
                    key={entry.level}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`rounded-2xl border p-2.5 ${
                      isCurrent
                        ? "border-brand/40 bg-brand-soft/60 dark:bg-brand/10"
                        : "border-line bg-surface-2/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-sm font-bold ${isCurrent ? "text-brand" : ""}`}>{entry.level}</span>
                      <Icon
                        name={reached ? "checkCircle" : isCurrent ? "target" : "circle"}
                        size={13}
                        className={reached ? "text-matcha" : isCurrent ? "text-brand" : "text-muted/50"}
                      />
                    </div>
                    <p className="mt-0.5 text-[10px] leading-tight text-muted">{entry.label}</p>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
                      <span
                        className={`block h-full rounded-full ${reached ? "bg-matcha" : "bg-brand"}`}
                        style={{ width: `${Math.max(2, entry.percent)}%` }}
                      />
                    </div>
                    <p className="tnum mt-1 text-[10px] text-muted">{entry.percent}%</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {nextLevel
                ? `Butuh ${requiredForNext} pelajaran ${currentLevel} selesai untuk membuka ${nextLevel} — ${remainingForNext} pelajaran lagi.`
                : "Kamu sudah berada di level tertinggi di katalog. Pertahankan dengan latihan dan simulasi ujian."}
              {" "}
              Saat ini {completedLessons} dari {CURRICULUM_LESSONS.length} pelajaran katalog sudah selesai.
            </p>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">Rencana hari ini</h2>
              <Badge tone={completedPlan === plan.length ? "matcha" : "muted"}>
                {completedPlan}/{plan.length}
              </Badge>
            </div>
            <ProgressBar value={completedPlan} max={plan.length} className="mt-3" label="Rencana hari ini" />
            <ul className="mt-4 space-y-2.5">
              {plan.map((item) => (
                <li key={item.label} className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      item.done ? "border-matcha bg-matcha text-white dark:bg-matcha/25 dark:text-matcha" : "border-line text-transparent"
                    }`}
                  >
                    <Icon name="check" size={12} />
                  </span>
                  <Link href={item.href} className={`text-sm ${item.done ? "text-muted line-through" : "hover:text-brand"}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            {due.length === 0 ? (
              <p className="mt-4 rounded-xl bg-surface-2/50 px-3 py-2 text-[11px] leading-relaxed text-muted">
                Tidak ada kartu jatuh tempo hari ini. Ulasan baru muncul saat waktunya tiba.
              </p>
            ) : null}
          </Card>

          <Card className="p-5">
            <SectionHeading
              title="Ujian terbaru"
              action={
                <LinkButton href="/exams" variant="ghost" size="sm">
                  Buka <Icon name="chevronRight" size={14} />
                </LinkButton>
              }
            />
            {recentExams.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {recentExams.map((exam) => (
                  <li key={exam.id}>
                    <Link
                      href="/exams"
                      className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/30 p-2.5 transition hover:border-brand/30"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold-soft text-[11px] font-bold text-gold">
                        {exam.level}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold tnum">{exam.score}% skor belajar</span>
                        <span className="block text-[10px] text-muted">
                          {formatShortDate(exam.finishedAt)} · {Math.max(1, Math.round(exam.durationSec / 60))} menit
                        </span>
                      </span>
                      <Badge tone={exam.passed ? "matcha" : "muted"}>{exam.passed ? "Lulus" : "Latih lagi"}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-line bg-surface-2/30 px-3 py-4 text-center">
                <p className="text-xs font-medium">Belum ada simulasi.</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Coba satu simulasi untuk melihat kekuatan dan area yang perlu diperbaiki.
                </p>
                <LinkButton href="/exams" variant="secondary" size="sm" className="mt-2">
                  Mulai simulasi
                </LinkButton>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <SectionHeading
              title="Pencapaian terbaru"
              action={
                <LinkButton href="/progress" variant="ghost" size="sm">
                  Semua <Icon name="chevronRight" size={14} />
                </LinkButton>
              }
            />
            <ul className="space-y-3">
              {achievements.map((achievement) => (
                <li key={achievement.id} className="flex items-start gap-3">
                  <span className={`rounded-xl p-2 ${ACHIEVEMENT_TONES[achievement.tone]}`}>
                    <Icon name={achievement.icon} size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{achievement.label}</p>
                      {achievement.unlocked ? (
                        <Badge tone="matcha">Terbuka</Badge>
                      ) : (
                        <Badge tone="muted">Terkunci</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted">{achievement.description}</p>
                    <p className="tnum mt-0.5 text-[11px] text-muted">{achievement.progress}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <Icon name="kana" size={16} className="text-brand" /> Kana
              </h2>
              <Badge tone="muted">{Math.round((kanaMastered / ALL_KANA.length) * 100)}%</Badge>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <Ring value={Math.round((kanaMastered / ALL_KANA.length) * 100)} size={78} stroke={7} label="Kana dikuasai">
                <span className="text-sm font-bold tnum">{kanaMastered}</span>
              </Ring>
              <div className="text-xs text-muted">
                <p>
                  <span className="text-base font-bold text-ink tnum">{kanaMastered}</span> dari {ALL_KANA.length} karakter
                </p>
                <p className="mt-1">{snapshot.kana.length} sudah dipelajari.</p>
                <Link href="/kana" className="mt-2 inline-flex items-center gap-1 font-medium text-brand hover:underline">
                  Latihan kana <Icon name="arrowRight" size={13} />
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <Icon name="writing" size={16} className="text-brand" /> Menulis
              </h2>
              <Badge tone={snapshot.stats.writingMastered > 0 ? "matcha" : "muted"}>
                {snapshot.stats.writingMastered} dikuasai
              </Badge>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Latih urutan goresan dengan animasi KanjiVG, tracing, dan tulisan mandiri.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-line p-2">
                <p className="text-base font-bold tnum">{snapshot.stats.writingCharacters}</p>
                <p className="text-[10px] text-muted">karakter dilatih</p>
              </div>
              <div className="rounded-xl border border-line p-2">
                <p className="text-base font-bold tnum">{snapshot.stats.writingAttempts}</p>
                <p className="text-[10px] text-muted">total latihan</p>
              </div>
            </div>
            <Link href="/writing" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
              Buka studio menulis <Icon name="arrowRight" size={13} />
            </Link>
          </Card>
        </aside>
      </div>

      <Card className="p-5 sm:p-6">
        <SectionHeading
          title="Konsistensi belajar"
          description={`${formatNumber(snapshot.stats.totalReviews)} ulasan · ${formatNumber(snapshot.stats.correctReviews)} benar · ${formatNumber(snapshot.stats.studyMinutes)} menit belajar`}
          icon="calendar"
        />
        <ActivityHeatmap activity={snapshot.activity} />
      </Card>
    </div>
  );
}

function formatStudyMinutes(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  if (safe < 60) return `${safe} mnt`;
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  return rest > 0 ? `${hours}j ${rest}m` : `${hours}j`;
}

function lessonsToday(lessons: Array<{ completedAt: string }>, todayKey: string | null): boolean {
  if (!todayKey) return false;
  return lessons.some((lesson) => {
    const date = new Date(lesson.completedAt);
    if (Number.isNaN(date.getTime())) return false;
    return toDateKey(date) === todayKey;
  });
}