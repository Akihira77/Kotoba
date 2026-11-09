"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { useProgress } from "@/components/providers/progress-provider";
import { useToast } from "@/components/providers/toast-provider";
import { PageHeader, PageSkeleton, Badge, Button, Card, LinkButton, ProgressBar, SectionHeading } from "@/components/ui";
import { crossLevelModules, currentJlptLevel, isLessonComplete, lessonProgressFor, lessonProgressKind, lessonProgressPayload, levelCompletion, modulesForLevel, nextJlptLevel, recommendedLesson, LESSON_PROGRESS_ICONS, LEVEL_UNLOCK_RATIO } from "@/lib/learning";
import { CURRICULUM_LESSONS, CURRICULUM_STATS, MODULE_BY_ID } from "@/content/curriculum";
import { LEVEL_DESCRIPTIONS, LEVEL_LABELS } from "@/lib/constants";
import { JLPT_LEVELS, type CourseModule, type JLPTLevel, type Lesson, type ProgressSnapshot } from "@/lib/types";

function moduleIcon(module: CourseModule): IconName {
  const first = module.lessons[0];
  return first ? LESSON_PROGRESS_ICONS[lessonProgressKind(first)] : "book";
}

const N5_PATH_ITEMS: Array<{ moduleId: string; title: string; titleJp: string; icon: IconName; description: string }> = [
  { moduleId: "mod-kana-hiragana", title: "Hiragana", titleJp: "ひらがな", icon: "kana", description: "Bentuk dasar, dakuten, handakuten, dan yōon." },
  { moduleId: "mod-kana-katakana", title: "Katakana", titleJp: "カタカナ", icon: "kana", description: "Kata serapan, bunyi panjang, dan yōon." },
  { moduleId: "mod-kanji-N5", title: "Kanji", titleJp: "漢字", icon: "kanji", description: "65 kanji dasar dengan bacaan dan kosakata." },
  { moduleId: "mod-vocab-N5", title: "Kosakata", titleJp: "語彙", icon: "vocab", description: "159 kata N5 dalam 20 tema sehari-hari." },
  { moduleId: "mod-grammar-N5", title: "Tata bahasa", titleJp: "文法", icon: "grammar", description: "20 pola kalimat dengan contoh dan latihan." },
  { moduleId: "mod-sentence-N5", title: "Susun kalimat", titleJp: "作文", icon: "list", description: "Praktik urutan kata dan partikel penting." },
];

function PathCard({ item, snapshot }: { item: (typeof N5_PATH_ITEMS)[number]; snapshot: ProgressSnapshot }) {
  const pathModule = MODULE_BY_ID.get(item.moduleId);
  if (!pathModule || pathModule.lessons.length === 0) return null;
  const completed = pathModule.lessons.filter((lesson) => isLessonComplete(snapshot, lesson)).length;
  const total = pathModule.lessons.length;
  const next = pathModule.lessons.find((lesson) => !isLessonComplete(snapshot, lesson)) ?? pathModule.lessons[0];
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Link
      href={next.href}
      className="group block h-full rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      aria-label={(completed > 0 ? "Lanjutkan" : "Mulai") + " jalur " + item.title}
    >
      <Card className="flex h-full flex-col p-4 transition-colors group-hover:border-brand/40 group-hover:bg-brand-soft/20">
        <div className="flex items-start justify-between gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-strong dark:bg-brand/15 dark:text-brand">
            <Icon name={item.icon} size={19} />
          </span>
          <Badge tone={completed === total ? "matcha" : "muted"}>{completed}/{total}</Badge>
        </div>
        <h3 className="mt-3 font-bold leading-tight">{item.title}</h3>
        <p className="font-jp text-xs text-muted" lang="ja">{item.titleJp}</p>
        <p className="mt-1 flex-1 text-xs leading-5 text-muted">{item.description}</p>
        <div className="mt-3">
          <ProgressBar value={completed} max={total} label={"Progres " + item.title} />
          <div className="mt-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-muted">{percent}% selesai</span>
            <span className="inline-flex items-center gap-1 text-brand">
              {completed === total ? "Ulas" : completed > 0 ? "Lanjutkan" : "Mulai"} <Icon name="arrowRight" size={13} />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ModuleCard({
  module,
  snapshot,
  expanded,
  onToggle,
  onComplete,
  busyLessonId,
}: {
  module: CourseModule;
  snapshot: ProgressSnapshot;
  expanded: boolean;
  onToggle: () => void;
  onComplete: (lesson: Lesson) => void;
  busyLessonId: string | null;
}) {
  const total = module.lessons.length;
  const completed = module.lessons.filter((lesson) => isLessonComplete(snapshot, lesson)).length;
  const visible = expanded ? module.lessons : module.lessons.slice(0, 4);
  const hiddenCount = total - visible.length;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-strong dark:bg-brand/15 dark:text-brand">
            <Icon name={moduleIcon(module)} size={19} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h3 className="font-bold">{module.title}</h3>
              {module.titleJp ? <span className="font-jp text-xs text-muted" lang="ja">{module.titleJp}</span> : null}
            </div>
            <p className="mt-0.5 text-sm leading-relaxed text-muted">{module.description}</p>
          </div>
        </div>
        <div className="shrink-0 sm:w-36">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{completed}/{total}</span>
            <span>{total > 0 ? Math.round((completed / total) * 100) : 0}%</span>
          </div>
          <ProgressBar value={completed} max={total} className="mt-1.5" label={"Progres " + module.title} />
        </div>
      </div>

      <ul id={"lessons-" + module.id} className="divide-y divide-line">
        {visible.map((lesson) => {
          const done = isLessonComplete(snapshot, lesson);
          const progress = lessonProgressFor(snapshot, lesson);
          const busy = busyLessonId === lesson.id;
          return (
            <li key={lesson.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
                  <Icon name={LESSON_PROGRESS_ICONS[lessonProgressKind(lesson)]} size={14} />
                </span>
                <div className="min-w-0">
                  <Link
                    href={lesson.href}
                    className="rounded-sm font-semibold decoration-brand/40 underline-offset-4 hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {lesson.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">
                    {lesson.titleJp ? <span className="font-jp" lang="ja">{lesson.titleJp}</span> : null}
                    {lesson.titleJp ? " · " : null}
                    {lesson.estimateMinutes} menit
                    {progress ? " · selesai " + new Date(progress.completedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : ""}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 pl-10 sm:pl-0">
                {done ? (
                  <Badge tone="matcha"><Icon name="check" size={12} /> Selesai</Badge>
                ) : lesson.interactive ? (
                  <LinkButton href={lesson.href} size="sm" variant="secondary">
                    <Icon name="play" size={13} /> Buka pelajaran
                  </LinkButton>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => onComplete(lesson)}
                    aria-label={"Tandai selesai: " + lesson.title}
                  >
                    <Icon name={busy ? "clock" : "checkCircle"} size={14} />
                    {busy ? "Menyimpan…" : "Tandai selesai"}
                  </Button>
                )}
                {lesson.interactive && !done ? null : (
                  <Link
                    href={lesson.href}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
                    aria-label={"Buka pelajaran " + lesson.title}
                  >
                    <Icon name="arrowUpRight" size={15} />
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {hiddenCount > 0 ? (
        <div className="border-t border-line px-4 py-2.5 sm:px-5">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={"lessons-" + module.id}
            className="rounded-full px-2 py-1 text-xs font-semibold text-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand"
          >
            {expanded ? "Ringkas daftar" : "Tampilkan " + hiddenCount + " pelajaran lain"}
          </button>
        </div>
      ) : null}
    </Card>
  );
}

export default function LearnPage() {
  const { snapshot, loading, recordLesson } = useProgress();
  const toast = useToast();
  const [levelTab, setLevelTab] = useState<JLPTLevel | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => new Set());
  const [busyLessonId, setBusyLessonId] = useState<string | null>(null);

  const currentLevel = currentJlptLevel(snapshot);
  const activeLevel = levelTab ?? currentLevel;
  const activeCompletion = levelCompletion(snapshot, activeLevel);
  const currentCompletion = levelCompletion(snapshot, currentLevel);
  const nextLevel = nextJlptLevel(currentLevel);
  const allLessons = CURRICULUM_STATS.lessons;
  const n5PathLessonCount = N5_PATH_ITEMS.reduce((total, item) => total + (MODULE_BY_ID.get(item.moduleId)?.lessons.length ?? 0), 0);
  const completedTotal = useMemo(
    () => CURRICULUM_LESSONS.filter((lesson) => isLessonComplete(snapshot, lesson)).length,
    [snapshot],
  );

  const recommended = recommendedLesson(snapshot);
  const allComplete = completedTotal >= allLessons;
  const modules = modulesForLevel(activeLevel);
  const cultureModules = crossLevelModules();
  const unlockTarget = Math.ceil(currentCompletion.total * LEVEL_UNLOCK_RATIO);

  function toggleModule(moduleId: string) {
    setExpandedModules((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  async function completeLesson(lesson: Lesson) {
    setBusyLessonId(lesson.id);
    try {
      await recordLesson({ ...lessonProgressPayload(lesson), score: null, xp: 0 });
      toast.success("Pelajaran “" + lesson.title + "” ditandai selesai.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan progres. Coba lagi saat server tersedia.");
    } finally {
      setBusyLessonId(null);
    }
  }

  if (loading && snapshot.lessons.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Kurikulum terpandu"
        title="Belajar"
        titleJp="学ぶ"
        icon="learn"
        description="Ikuti jalur N5 hingga N1 yang menghubungkan kana, kosakata, kanji, tata bahasa, bacaan, menyimak, budaya, dan latihan menyusun kalimat."
        actions={
          <>
            <LinkButton href="/practice" variant="secondary" size="sm">
              <Icon name="practice" size={15} /> Latihan campuran
            </LinkButton>
            <LinkButton href="/exams" size="sm">
              <Icon name="exam" size={15} /> Uji kemampuan
            </LinkButton>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-[1.35fr_1fr]">
          <div className="relative p-5 sm:p-6">
            <div className="pointer-events-none absolute -right-8 -top-10 font-jp text-8xl font-bold text-brand/[0.06]" lang="ja" aria-hidden="true">学</div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand"><Icon name="flag" size={12} /> Jalur saat ini</Badge>
              <Badge tone="muted">{LEVEL_LABELS[currentLevel]}</Badge>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{LEVEL_LABELS[currentLevel]}</h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">{LEVEL_DESCRIPTIONS[currentLevel]}</p>
            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Progres level</span>
                <span className="tnum font-semibold text-ink">{currentCompletion.completed}/{currentCompletion.total} pelajaran</span>
              </div>
              <ProgressBar value={currentCompletion.completed} max={currentCompletion.total} className="mt-1.5" label="Progres level saat ini" />
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {nextLevel
                  ? "Selesaikan " + unlockTarget + " pelajaran level ini (60%) untuk membuka jalur " + nextLevel + "."
                  : "Level tertinggi dalam katalog. Terus ulangi materi dan ujian agar tetap tajam."}
              </p>
            </div>
          </div>

          <div className="border-t border-line bg-brand-soft/40 p-5 dark:bg-brand/[0.06] sm:p-6 lg:border-l lg:border-t-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Rekomendasi berikutnya</p>
            {allComplete ? (
              <div className="mt-3">
                <p className="font-bold">Seluruh katalog sudah selesai.</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">Uji pemahaman lewat simulasi JLPT atau ulangi kartu yang jatuh tempo.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <LinkButton href="/exams" size="sm">Buka ujian</LinkButton>
                  <LinkButton href="/vocabulary?tab=review" variant="secondary" size="sm">Ulas kartu</LinkButton>
                </div>
              </div>
            ) : recommended ? (
              <div className="mt-3">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Icon name={LESSON_PROGRESS_ICONS[lessonProgressKind(recommended)]} size={14} />
                  {recommended.level === "semua" ? "Semua level" : LEVEL_LABELS[recommended.level]} · {recommended.estimateMinutes} menit
                </div>
                <p className="mt-1.5 font-bold leading-snug">{recommended.title}</p>
                {recommended.titleJp ? <p className="font-jp text-sm text-muted" lang="ja">{recommended.titleJp}</p> : null}
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{recommended.description}</p>
                <LinkButton href={recommended.href} size="sm" className="mt-4">
                  <Icon name="play" size={14} /> Buka pelajaran
                </LinkButton>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-matcha-soft text-matcha"><Icon name="checkCircle" size={19} /></span>
          <div>
            <p className="text-xl font-bold tnum">{completedTotal}/{allLessons}</p>
            <p className="text-xs text-muted">Pelajaran katalog selesai</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-soft text-indigo-ink dark:bg-indigo/15 dark:text-indigo"><Icon name="layers" size={19} /></span>
          <div>
            <p className="text-xl font-bold tnum">{CURRICULUM_STATS.modules}</p>
            <p className="text-xs text-muted">Modul dalam kurikulum</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-soft text-gold"><Icon name="clock" size={19} /></span>
          <div>
            <p className="text-xl font-bold tnum">{Math.round((completedTotal / Math.max(1, allLessons)) * 100)}%</p>
            <p className="text-xs text-muted">Katalog yang sudah dituntaskan</p>
          </div>
        </Card>
      </div>

      <section aria-labelledby="n5-path-heading" className="space-y-3">
        <SectionHeading
          title="Jalur N5"
          description="Enam fondasi belajar berurutan: kana, kanji, kosakata, tata bahasa, lalu menyusun kalimat."
          icon="flag"
          action={<Badge tone="brand">{n5PathLessonCount} pelajaran interaktif</Badge>}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {N5_PATH_ITEMS.map((item) => (
            <PathCard key={item.moduleId} item={item} snapshot={snapshot} />
          ))}
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Setiap pelajaran memiliki alur pengantar, penjelasan, contoh, catatan, latihan, dan penyelesaian. Progres tersimpan otomatis setelah latihan lulus.
        </p>
      </section>

      <section aria-labelledby="level-heading" className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="level-heading" className="text-lg font-bold">Pilih level</h2>
            <p className="text-sm text-muted">Materi tiap level tersusun dari dasar ke penerapan.</p>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label="Filter level JLPT">
            {JLPT_LEVELS.map((level) => {
              const isActive = level === activeLevel;
              const completion = levelCompletion(snapshot, level);
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setLevelTab(level)}
                  aria-pressed={isActive}
                  className={
                    "flex min-w-16 shrink-0 flex-col items-center rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand " +
                    (isActive ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:bg-surface-2")
                  }
                >
                  <span>{level}</span>
                  <span className={"text-[10px] font-medium " + (isActive ? "text-white/80" : "text-muted")}>{completion.percent}%</span>
                </button>
              );
            })}
          </div>
        </div>

        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold">{LEVEL_LABELS[activeLevel]}</h3>
                {activeLevel === currentLevel ? <Badge tone="brand">Level berjalan</Badge> : null}
                <Badge tone="muted">{modules.length} modul</Badge>
              </div>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{LEVEL_DESCRIPTIONS[activeLevel]}</p>
            </div>
            <div className="w-full sm:w-56">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{activeCompletion.completed}/{activeCompletion.total} pelajaran</span>
                <span className="tnum font-semibold text-ink">{activeCompletion.percent}%</span>
              </div>
              <ProgressBar value={activeCompletion.completed} max={activeCompletion.total} className="mt-1.5" label={"Progres " + activeLevel} />
            </div>
          </div>
        </Card>

        {modules.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                snapshot={snapshot}
                expanded={expandedModules.has(module.id)}
                onToggle={() => toggleModule(module.id)}
                onComplete={completeLesson}
                busyLessonId={busyLessonId}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="font-semibold">Belum ada modul untuk level ini.</p>
            <p className="mt-1 text-sm text-muted">Coba level lain atau buka latihan campuran.</p>
          </Card>
        )}
      </section>

      <section aria-labelledby="culture-heading" className="space-y-3">
        <div>
          <h2 id="culture-heading" className="text-lg font-bold">Berlaku semua level</h2>
          <p className="text-sm text-muted">Materi budaya dan kehidupan Jepang yang bisa dipelajari kapan saja, tanpa urutan level.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {cultureModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              snapshot={snapshot}
              expanded={expandedModules.has(module.id)}
              onToggle={() => toggleModule(module.id)}
              onComplete={completeLesson}
              busyLessonId={busyLessonId}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
