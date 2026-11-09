"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { JpText, SpeakButton } from "@/components/japanese";
import { LessonBlocks } from "@/components/lesson-blocks";
import { LessonPractice, type PracticeResult } from "@/components/lesson-practice";
import { useProgress } from "@/components/providers/progress-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Badge, Button, Card, LinkButton, PageHeader, ProgressBar, Ring } from "@/components/ui";
import { LESSON_PASS_SCORE } from "@/lib/constants";
import { stripFurigana } from "@/lib/furigana";
import type { Lesson, LessonPlan, LessonProgressKind, LessonTone } from "@/lib/types";
import { writingHrefForContentRef } from "@/lib/writing-links";
import { cn } from "@/lib/utils";

const STEPS: Array<{ label: string; icon: IconName }> = [
  { label: "Pengantar", icon: "info" },
  { label: "Penjelasan", icon: "book" },
  { label: "Contoh", icon: "eye" },
  { label: "Catatan", icon: "lightbulb" },
  { label: "Latihan", icon: "practice" },
  { label: "Selesai", icon: "flag" },
];

const NOTE_STYLES: Record<LessonTone, { icon: IconName; wrap: string; title: string }> = {
  info: { icon: "info", wrap: "border-indigo/20 bg-indigo-soft/45 dark:border-indigo/30 dark:bg-indigo/10", title: "text-indigo-ink dark:text-indigo" },
  tip: { icon: "lightbulb", wrap: "border-matcha/25 bg-matcha-soft/55 dark:border-matcha/30 dark:bg-matcha/10", title: "text-matcha" },
  important: { icon: "flag", wrap: "border-gold/30 bg-gold-soft/55 dark:border-gold/30 dark:bg-gold/10", title: "text-gold" },
  warning: { icon: "alert", wrap: "border-red-200 bg-red-50/70 dark:border-red-400/25 dark:bg-red-400/10", title: "text-red-700 dark:text-red-300" },
};

export interface LessonNextLink {
  id: string;
  title: string;
  titleJp?: string;
  href: string;
}

export interface LessonPlayerProps {
  plan: LessonPlan;
  lesson: Lesson;
  moduleTitle: string;
  moduleTitleJp?: string;
  progressId: string;
  progressKind: LessonProgressKind;
  kindLabel: string;
  xp: number;
  nextLesson: LessonNextLink | null;
}

function scrollToTop() {
  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

export function LessonPlayer({
  plan,
  lesson,
  moduleTitle,
  moduleTitleJp,
  progressId,
  progressKind,
  kindLabel,
  xp,
  nextLesson,
}: LessonPlayerProps) {
  const { snapshot, recordLesson } = useProgress();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [practiceResult, setPracticeResult] = useState<PracticeResult | null>(null);
  const [practiceAttempt, setPracticeAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const existing = snapshot.lessons.find((entry) => entry.lessonId === progressId);
  const completed = Boolean(existing) || justCompleted;
  const passed = Boolean(practiceResult && practiceResult.percent >= LESSON_PASS_SCORE);
  const showRomaji = snapshot.profile.settings.showRomaji;
  const writingRef = lesson.contentRefs.find((item) => item.kind === "kana" || item.kind === "kanji");
  const writingHref = writingRef ? writingHrefForContentRef(writingRef) : null;

  function goToStep(target: number) {
    const unlocked = completed || target <= maxStep || (target === 5 && passed);
    if (!unlocked) {
      toast.info("Selesaikan langkah sebelumnya terlebih dahulu.");
      return;
    }
    setStep(target);
    scrollToTop();
  }

  function previousStep() {
    if (step === 0) return;
    setStep((value) => Math.max(0, value - 1));
    scrollToTop();
  }

  function nextStep() {
    if (step >= STEPS.length - 1) return;
    if (step === 4 && !passed && !completed) {
      toast.info("Capai skor latihan minimal " + LESSON_PASS_SCORE + "% untuk melanjutkan.");
      return;
    }
    const target = step + 1;
    setStep(target);
    setMaxStep((value) => Math.max(value, target));
    scrollToTop();
  }

  function finishPractice(result: PracticeResult) {
    setPracticeResult(result);
    if (result.percent >= LESSON_PASS_SCORE) {
      setMaxStep((value) => Math.max(value, 5));
      toast.success("Latihan lulus dengan skor " + result.percent + "%. Lanjut ke langkah Selesai.");
    } else {
      toast.info("Skor " + result.percent + "%. Ulangi latihan sampai mencapai " + LESSON_PASS_SCORE + "%.");
    }
  }

  function retryPractice() {
    setPracticeResult(null);
    setPracticeAttempt((value) => value + 1);
    if (!completed) setMaxStep((value) => Math.min(value, 4));
  }

  async function completeLesson() {
    if (!practiceResult || practiceResult.percent < LESSON_PASS_SCORE || completed || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await recordLesson({
        lessonId: progressId,
        kind: progressKind,
        score: practiceResult.percent,
        xp,
      });
      setJustCompleted(true);
      toast.success("Pelajaran “" + plan.title + "” selesai. Progresmu tersimpan.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Gagal menyimpan progres. Pastikan server lokal aktif lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  const score = practiceResult?.percent ?? existing?.score ?? null;
  const progressPercent = completed ? 100 : Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <div className="space-y-5">
      <Link
        href="/learn"
        className="inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-muted transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Icon name="arrowLeft" size={15} /> Kembali ke kurikulum
      </Link>

      <PageHeader
        eyebrow={moduleTitle}
        title={plan.title}
        titleJp={plan.titleJp}
        icon="learn"
        description={plan.summary}
        actions={
          <>
            <Badge tone="brand">{lesson.level}</Badge>
            <Badge tone="muted">{plan.estimateMinutes} menit</Badge>
            {completed ? <Badge tone="matcha"><Icon name="check" size={12} /> Selesai</Badge> : null}
            {writingHref ? (
              <LinkButton href={writingHref} variant="secondary" size="sm">
                <Icon name="writing" size={15} /> Latihan menulis
              </LinkButton>
            ) : null}
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5"><Icon name="layers" size={13} /> {moduleTitleJp ? <span className="font-jp">{moduleTitleJp}</span> : moduleTitle}</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="practice" size={13} /> {kindLabel}</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="zap" size={13} /> hingga {xp} XP</span>
          </div>
          <p className="text-xs font-medium text-muted tnum">
            Langkah {Math.min(step + 1, STEPS.length)} dari {STEPS.length} · {progressPercent}%
          </p>
        </div>
        <div className="px-4 pt-3 sm:px-5">
          <ProgressBar value={completed ? STEPS.length : step + 1} max={STEPS.length} label="Progres pelajaran" />
          <p className="sr-only" role="status" aria-live="polite">Langkah {Math.min(step + 1, STEPS.length)} dari {STEPS.length}: {STEPS[step].label}</p>
        </div>
        <nav aria-label="Langkah pelajaran" className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 py-3 sm:px-4">
          {STEPS.map((item, index) => {
            const active = step === index;
            const unlocked = completed || index <= maxStep || (index === 5 && passed);
            const done = completed || index < step || (index === 4 && passed);
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => goToStep(index)}
                aria-current={active ? "step" : undefined}
                aria-disabled={!unlocked}
                title={unlocked ? undefined : "Selesaikan langkah sebelumnya terlebih dahulu."}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  active
                    ? "border-brand bg-brand text-white"
                    : unlocked
                      ? "border-line bg-surface text-ink hover:bg-surface-2"
                      : "cursor-not-allowed border-line bg-surface-2/50 text-muted opacity-60",
                )}
              >
                <span className={cn("flex h-5 w-5 items-center justify-center rounded-full", active ? "bg-white/20" : done ? "bg-matcha-soft text-matcha dark:bg-matcha/15" : "bg-surface-2 text-muted")}>
                  <Icon name={done && !active ? "check" : item.icon} size={12} />
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {step === 0 ? (
            <Card className="p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Pengantar</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Sebelum mulai</h2>
              <div className="mt-4 space-y-3">
                {plan.intro.map((paragraph, index) => (
                  <p key={index} className="text-sm leading-7 text-ink/90 sm:text-[15px]">{paragraph}</p>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-line bg-surface-2/40 p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold"><Icon name="target" size={16} className="text-brand" /> Target pelajaran</h3>
                <ul className="mt-3 space-y-2">
                  {plan.goals.map((goal) => (
                    <li key={goal} className="flex items-start gap-2.5 text-sm leading-6">
                      <Icon name="checkCircle" size={16} className="mt-0.5 shrink-0 text-matcha" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {completed ? (
                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-matcha/30 bg-matcha-soft/40 p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-matcha/10">
                  <div className="flex items-start gap-2.5">
                    <Icon name="checkCircle" size={18} className="mt-0.5 shrink-0 text-matcha" />
                    <div>
                      <p className="text-sm font-bold">Pelajaran ini sudah selesai</p>
                      <p className="text-xs leading-5 text-muted">Skor terakhir {practiceResult?.percent ?? existing?.score ?? "—"}%. Kamu bisa mengulang latihan kapan saja.</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => goToStep(5)}>Lihat penyelesaian</Button>
                </div>
              ) : null}
              <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted">
                <Icon name="lightbulb" size={14} className="mt-0.5 shrink-0 text-gold" />
                Ikuti langkah berurutan. Romaji dapat dimatikan di Pengaturan bila kamu sudah nyaman membaca kana.
              </p>
            </Card>
          ) : null}

          {step === 1 ? (
            <Card className="p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Penjelasan</p>
              <h2 className="mb-5 mt-1 text-xl font-bold tracking-tight sm:text-2xl">Memahami pola</h2>
              <LessonBlocks blocks={plan.explanation} />
            </Card>
          ) : null}

          {step === 2 ? (
            <Card className="p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Contoh</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Dengar dan bandingkan</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">Perhatikan tulisan Jepang, bacaan, lalu arti alaminya. Terjemahan harfiah ditampilkan terpisah bila perlu.</p>
              <div className="mt-5 space-y-3">
                {plan.examples.map((example, index) => (
                  <article key={example.jp + index} className="rounded-2xl border border-line bg-surface-2/35 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <JpText text={example.jp} as="p" className="text-xl font-semibold leading-8 sm:text-2xl" />
                        {example.reading ? <p className="font-jp mt-0.5 text-sm text-muted">{example.reading}</p> : null}
                        {showRomaji && example.romaji ? <p className="mt-0.5 text-xs italic text-muted">{example.romaji}</p> : null}
                      </div>
                      <SpeakButton text={stripFurigana(example.jp)} speech={example.reading} label="Putar contoh kalimat" />
                    </div>
                    <p className="mt-2.5 text-sm font-semibold leading-6">{example.meaning}</p>
                    {example.literal ? (
                      <p className="mt-1 text-xs leading-5 text-muted"><span className="font-semibold">Harfiah:</span> {example.literal}</p>
                    ) : null}
                    {example.note ? <p className="mt-2 border-t border-line pt-2 text-xs leading-5 text-muted">{example.note}</p> : null}
                  </article>
                ))}
              </div>
            </Card>
          ) : null}

          {step === 3 ? (
            <Card className="p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Catatan</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Hal yang mudah terlewat</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">Baca catatan ini sebelum latihan agar tidak mengulang kesalahan yang sama.</p>
              <div className="mt-5 space-y-3">
                {plan.notes.map((note, index) => {
                  const tone = NOTE_STYLES[note.tone];
                  return (
                    <section key={note.title + index} className={cn("rounded-2xl border p-4", tone.wrap)}>
                      <h3 className={cn("flex items-center gap-2 text-sm font-bold", tone.title)}>
                        <Icon name={tone.icon} size={16} /> {note.title}
                      </h3>
                      <div className="mt-2 space-y-1.5">
                        {note.body.map((paragraph, bodyIndex) => (
                          <p key={bodyIndex} className="text-sm leading-6 text-ink/85">{paragraph}</p>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </Card>
          ) : null}

          {step === 4 ? (
            <Card className="p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Latihan</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Uji pemahamanmu</h2>
              <p className="mb-5 mt-1 text-sm leading-relaxed text-muted">
                Jawab semua soal. Skor minimal {LESSON_PASS_SCORE}% membuka langkah Selesai. Kamu bisa mengulang latihan kapan saja.
              </p>
              <LessonPractice
                key={practiceAttempt}
                questions={plan.practice}
                result={practiceResult}
                onFinish={finishPractice}
                onRetry={retryPractice}
              />
            </Card>
          ) : null}

          {step === 5 ? (
            <Card className="overflow-hidden">
              {completed ? (
                <div className="p-5 sm:p-7">
                  <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                    <Ring value={100} size={116} label="Pelajaran selesai">
                      <Icon name="check" size={34} className="text-matcha" />
                    </Ring>
                    <div>
                      <Badge tone="matcha"><Icon name="checkCircle" size={12} /> Pelajaran selesai</Badge>
                      <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">Kerja bagus.</h2>
                      <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
                        Progres “{plan.title}” tersimpan di server lokal. Skor latihan terakhir: {score ?? "—"}%.
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-gold"><Icon name="zap" size={15} /> hingga {xp} XP untuk penyelesaian pertama</p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {nextLesson ? (
                      <LinkButton href={nextLesson.href}>
                        Pelajaran berikutnya <Icon name="arrowRight" size={15} />
                      </LinkButton>
                    ) : (
                      <LinkButton href="/learn">Kembali ke kurikulum <Icon name="arrowRight" size={15} /></LinkButton>
                    )}
                    <LinkButton href="/progress" variant="secondary">Lihat statistik</LinkButton>
                  </div>
                  {nextLesson ? (
                    <div className="mt-4 rounded-2xl border border-line bg-surface-2/40 px-4 py-3 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Berikutnya</p>
                      <p className="mt-0.5 font-bold">{nextLesson.title} {nextLesson.titleJp ? <span className="font-jp text-xs font-normal text-muted">· {nextLesson.titleJp}</span> : null}</p>
                    </div>
                  ) : null}
                </div>
              ) : passed ? (
                <div className="p-5 sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Selesai</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Siap menuntaskan pelajaran?</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                    Latihan lulus dengan skor {practiceResult?.percent}%. Simpan hasil ini agar progres dan XP tercatat di server lokal.
                  </p>
                  <div className="mt-5 rounded-2xl border border-matcha/30 bg-matcha-soft/40 p-4 dark:bg-matcha/10">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-matcha">Latihan lulus</p>
                        <p className="text-xs text-muted">Benar {practiceResult?.correct} dari {practiceResult?.total} soal</p>
                      </div>
                      <Ring value={practiceResult?.percent ?? 0} size={78} stroke={8} label="Skor latihan">
                        <span className="text-sm font-bold tnum">{practiceResult?.percent}%</span>
                      </Ring>
                    </div>
                  </div>
                  {saveError ? (
                    <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
                      {saveError}
                    </p>
                  ) : null}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button onClick={completeLesson} disabled={saving}>
                      <Icon name={saving ? "clock" : "flag"} size={15} />
                      {saving ? "Menyimpan…" : "Selesaikan pelajaran"}
                    </Button>
                    <Button variant="secondary" onClick={() => goToStep(4)}>
                      <Icon name="rotate" size={15} /> Ulangi latihan
                    </Button>
                  </div>
                  <p className="mt-3 text-xs text-muted">Penyelesaian pertama memberi XP. Mengulang pelajaran tetap memperbarui skor.</p>
                </div>
              ) : (
                <div className="p-5 text-center sm:p-7">
                  <Icon name="lock" size={28} className="mx-auto text-muted" />
                  <h2 className="mt-2 text-lg font-bold">Latihan belum lulus</h2>
                  <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted">
                    Capai skor minimal {LESSON_PASS_SCORE}% di langkah Latihan sebelum menyelesaikan pelajaran.
                  </p>
                  <Button className="mt-4" onClick={() => goToStep(4)}>Kembali ke latihan</Button>
                </div>
              )}
            </Card>
          ) : null}

          {step < 5 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <Button variant="ghost" onClick={previousStep} disabled={step === 0}>
                <Icon name="arrowLeft" size={15} /> Sebelumnya
              </Button>
              <Button
                onClick={nextStep}
                disabled={step === 4 && !passed && !completed}
                aria-describedby={step === 4 && !passed && !completed ? "lesson-next-hint" : undefined}
              >
                {step === 3 ? "Mulai latihan" : "Lanjut"} <Icon name="arrowRight" size={15} />
              </Button>
              {step === 4 && !passed && !completed ? (
                <p id="lesson-next-hint" className="w-full text-xs text-muted sm:w-auto sm:max-w-xs sm:text-right">
                  Capai skor latihan minimal {LESSON_PASS_SCORE}% untuk membuka langkah Selesai.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside className="hidden space-y-4 xl:sticky xl:top-5 xl:block xl:self-start">
          <Card className="p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold"><Icon name="target" size={16} className="text-brand" /> Target pelajaran</h2>
            <ul className="mt-2.5 space-y-2">
              {plan.goals.map((goal) => (
                <li key={goal} className="flex items-start gap-2 text-xs leading-5 text-muted">
                  <Icon name="circle" size={7} className="mt-1.5 shrink-0 fill-current text-brand/60" />
                  {goal}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold"><Icon name="info" size={16} className="text-indigo" /> Ringkasan</h2>
            <dl className="mt-2.5 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-3"><dt className="text-muted">Level</dt><dd className="font-semibold">{lesson.level}</dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="text-muted">Perkiraan</dt><dd className="font-semibold">{plan.estimateMinutes} menit</dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="text-muted">Soal latihan</dt><dd className="font-semibold">{plan.practice.length}</dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="text-muted">Skor lulus</dt><dd className="font-semibold">{LESSON_PASS_SCORE}%</dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="text-muted">XP pertama</dt><dd className="font-semibold">{xp}</dd></div>
            </dl>
          </Card>
          <Card className="bg-surface-2/40 p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold"><Icon name="lightbulb" size={16} className="text-gold" /> Cara belajar</h2>
            <p className="mt-2 text-xs leading-5 text-muted">
              Baca pengantar, pelajari pola, dengarkan contoh, lalu kerjakan latihan tanpa membuka jawaban. Ulangi besok agar ingatan lebih kuat.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
