"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/icons";
import { useProgress } from "@/components/providers/progress-provider";
import { useToast } from "@/components/providers/toast-provider";
import {
  Badge,
  Button,
  Card,
  LinkButton,
  PageHeader,
  PageSkeleton,
  ProgressBar,
  Ring,
  SectionHeading,
  StatTile,
} from "@/components/ui";
import { STUDY_TARGET_WEEK_OPTIONS } from "@/lib/constants";
import { currentJlptLevel } from "@/lib/learning";
import {
  buildStudyPlan,
  PLAN_FEASIBILITY_LABELS,
  PLAN_LEVEL_DESCRIPTIONS,
  type PlanFeasibility,
} from "@/lib/study-plan";
import { JLPT_LEVELS, type JLPTLevel } from "@/lib/types";
import { cn, formatShortDate } from "@/lib/utils";

const FEASIBILITY_TONE: Record<PlanFeasibility, "matcha" | "brand" | "gold" | "muted"> = {
  longgar: "matcha",
  realistis: "brand",
  ketat: "gold",
  "tidak-realistis": "brand",
};

function percent(value: number, total: number): number {
  return total <= 0 ? 0 : Math.round((value / total) * 100);
}

const subscribeMounted = () => () => {};
const getMounted = () => true;
const getServerMounted = () => false;

export default function PlanPage() {
  const { snapshot, saveSettings } = useProgress();
  const toast = useToast();
  const mounted = useSyncExternalStore(subscribeMounted, getMounted, getServerMounted);
  const [draftTarget, setDraftTarget] = useState<JLPTLevel | null>(null);
  const [draftWeeks, setDraftWeeks] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const current = currentJlptLevel(snapshot);
  const target = draftTarget ?? snapshot.profile.settings.studyTargetLevel ?? current;
  const weeks = draftWeeks ?? snapshot.profile.settings.studyTargetWeeks;
  const plan = useMemo(
    () => (mounted ? buildStudyPlan({ snapshot, targetLevel: target, weeks, now: new Date() }) : null),
    [snapshot, target, weeks, mounted],
  );

  const weekOptions = useMemo(
    () => Array.from(new Set([...STUDY_TARGET_WEEK_OPTIONS, weeks])).sort((a, b) => a - b),
    [weeks],
  );

  async function save() {
    setSaving(true);
    try {
      await saveSettings({ studyTargetLevel: target, studyTargetWeeks: weeks });
      setDraftTarget(target);
      setDraftWeeks(weeks);
      toast.success("Target belajar disimpan.");
    } catch {
      toast.info("Target disimpan di perangkat ini; server belum dapat dijangkau.");
    } finally {
      setSaving(false);
    }
  }

  if (!plan) return <PageSkeleton />;

  const completion = percent(plan.completedLessons, plan.totalLessons);
  const needsAdjustment = plan.unplannedLessons > 0;
  const suggestedWeeks = weekOptions.find((option) => option >= plan.requiredWeeks) ?? weekOptions[weekOptions.length - 1];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Rencana belajar · 学習計画"
        title="Rencana belajar"
        titleJp="勉強の計画"
        icon="target"
        description="Target dan jadwal yang dihitung dari kurikulum, progres nyata, serta preferensi belajarmu. Bukan jadwal yang dipaksakan."
        actions={
          <>
            <LinkButton href="/settings" variant="secondary" size="sm"><Icon name="settings" size={15} />Pengaturan</LinkButton>
            <LinkButton href="/learn" size="sm"><Icon name="learn" size={15} />Buka kurikulum</LinkButton>
          </>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0 space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Ring value={completion} size={142} label={"Penyelesaian " + completion + "%"}>
                <div className="text-center">
                  <div className="text-3xl font-bold">{completion}%</div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">selesai</div>
                </div>
              </Ring>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{plan.currentLevel} · level berjalan</Badge>
                  <Badge tone="muted">target {plan.targetLevel}</Badge>
                  <Badge tone={FEASIBILITY_TONE[plan.feasibility]}>{PLAN_FEASIBILITY_LABELS[plan.feasibility]}</Badge>
                </div>
                <h2 className="mt-3 text-xl font-bold">Rencana {plan.weeks} minggu menuju {plan.targetLevel}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{plan.summary}</p>
                <div className="mt-3">
                  <ProgressBar value={completion} label="Kemajuan level" />
                  <div className="mt-1 flex justify-between text-xs text-muted">
                    <span>{plan.completedLessons} dari {plan.totalLessons} pelajaran selesai</span>
                    <span>{plan.plannedLessons} dijadwalkan</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Materi" value={plan.lessonMinutes + "m"} hint="total pelajaran" icon="clock" />
              <StatTile label="Per minggu" value={plan.weeklyMinutes + "m"} hint={plan.daysPerWeek + " hari aktif"} icon="calendar" tone="matcha" />
              <StatTile label="Sesi" value={plan.sessionMinutes + "m"} hint="per hari belajar" icon="target" tone="indigo" />
              <StatTile label="Kebutuhan" value={plan.requiredWeeks + " mg"} hint="pada ritme ini" icon="timer" tone="gold" />
            </div>
          </Card>

          {plan.targetAdjusted ? (
            <Card className="border-gold/40 bg-gold-soft/30 p-4">
              <p className="flex items-start gap-2 text-sm leading-relaxed">
                <Icon name="info" size={18} className="mt-0.5 shrink-0 text-gold" />
                <span>
                  Target <span className="font-semibold">{target}</span> berada di bawah level berjalanmu ({plan.currentLevel}). Rencana disesuaikan ke level berjalan agar kamu tidak mengulang materi yang sudah dikuasai.
                </span>
              </p>
            </Card>
          ) : null}

          {needsAdjustment ? (
            <Card className="border-brand/40 bg-brand-soft/30 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <p className="flex flex-1 items-start gap-2 text-sm leading-relaxed">
                  <Icon name="alert" size={18} className="mt-0.5 shrink-0 text-brand" />
                  <span>
                    {plan.unplannedLessons} pelajaran belum masuk {plan.weeks} minggu. {plan.recommendation}
                  </span>
                </p>
                {suggestedWeeks !== weeks ? (
                  <Button variant="secondary" size="sm" onClick={() => setDraftWeeks(suggestedWeeks)}>
                    Coba {suggestedWeeks} minggu
                  </Button>
                ) : null}
              </div>
            </Card>
          ) : null}

          <Card className="p-5 sm:p-6">
            <SectionHeading
              title="Jadwal per minggu"
              description="Satu minggu berisi pelajaran inti dan waktu ulangan. Urutan mengikuti kurikulum, bukan tanggal ujian."
              action={<Badge tone="muted">{plan.weeks} minggu</Badge>}
            />
            <ol className="space-y-3">
              {plan.weeksPlan.map((week) => (
                <li key={week.week} className="rounded-2xl border border-line bg-surface-2/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold", week.lessons.length > 0 ? "bg-brand text-white" : "bg-surface text-muted")}>
                        {week.week}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">Minggu {week.week}</p>
                        <p className="text-xs text-muted">{formatShortDate(week.startDate)} – {formatShortDate(week.endDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span>{week.lessons.length} pelajaran</span>
                      <span>·</span>
                      <span>{week.totalMinutes} menit</span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold">{week.focus}</p>
                  {week.lessons.length > 0 ? (
                    <ul className="mt-2 space-y-1.5">
                      {week.lessons.slice(0, 4).map((lesson) => (
                        <li key={lesson.id}>
                          <Link href={lesson.href} className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-muted transition hover:bg-surface hover:text-ink">
                            <Icon name="chevronRight" size={13} className="shrink-0 text-brand" />
                            <span className="min-w-0 flex-1 leading-snug">{lesson.title}</span>
                            <span className="shrink-0 text-xs">{lesson.minutes}m</span>
                          </Link>
                        </li>
                      ))}
                      {week.lessons.length > 4 ? (
                        <li className="px-2 text-xs text-muted">+{week.lessons.length - 4} pelajaran lain</li>
                      ) : null}
                    </ul>
                  ) : (
                    <p className="mt-2 rounded-xl border border-dashed border-line px-3 py-2 text-sm text-muted">
                      Tidak ada pelajaran baru. Gunakan waktunya untuk ulangan kartu, latihan mendengar, atau istirahat.
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="muted">{week.lessonMinutes} menit materi</Badge>
                    <Badge tone="matcha">{week.reviewMinutes} menit ulangan</Badge>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <SectionHeading title="Atur target" icon="target" description="Pilih level dan rentang waktu yang realistis." />

            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Level target</p>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {JLPT_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-pressed={target === level}
                  onClick={() => setDraftTarget(level)}
                  className={cn(
                    "rounded-xl border px-1 py-2 text-sm font-bold transition",
                    target === level ? "border-brand bg-brand text-white" : "border-line text-muted hover:border-brand/40 hover:text-ink",
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="mt-2 min-h-10 text-xs leading-relaxed text-muted">{PLAN_LEVEL_DESCRIPTIONS[target]}</p>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Rentang waktu</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {weekOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={weeks === option}
                  onClick={() => setDraftWeeks(option)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                    weeks === option ? "border-brand bg-brand-soft/60 text-brand" : "border-line text-muted hover:text-ink",
                  )}
                >
                  {option} minggu
                </button>
              ))}
            </div>

            <Button className="mt-4 w-full" onClick={() => void save()} disabled={saving}>
              <Icon name="check" size={16} />
              {saving ? "Menyimpan..." : "Simpan target"}
            </Button>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Target XP, durasi sesi, dan frekuensi mingguan mengikuti Pengaturan. Rencana dihitung ulang saat progres berubah.
            </p>
          </Card>

          <Card className="p-5">
            <SectionHeading title="Tonggak" icon="flag" />
            {plan.milestones.length === 0 ? (
              <p className="text-sm text-muted">Belum ada tonggak. Selesaikan beberapa pelajaran untuk melihat kemajuan.</p>
            ) : (
              <ol className="space-y-3">
                {plan.milestones.map((milestone, index) => (
                  <li key={milestone.label + "-" + index} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand">{milestone.week}</span>
                    <span>
                      <span className="block text-sm font-semibold">{milestone.label}</span>
                      <span className="block text-xs leading-relaxed text-muted">{milestone.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card className="p-5">
            <SectionHeading title="Saran untukmu" icon="lightbulb" />
            <ul className="space-y-2 text-sm leading-relaxed text-muted">
              <li className="flex gap-2"><Icon name="check" size={15} className="mt-0.5 shrink-0 text-matcha" /> Utamakan ulangan kartu jatuh tempo sebelum menambah materi baru.</li>
              <li className="flex gap-2"><Icon name="check" size={15} className="mt-0.5 shrink-0 text-matcha" /> Satu sesi pendek setiap hari lebih mudah dipertahankan daripada sesi panjang.</li>
              <li className="flex gap-2"><Icon name="check" size={15} className="mt-0.5 shrink-0 text-matcha" /> Jika minggu ini berat, kurangi durasi sesi alih-alih melewatkan hari.</li>
            </ul>
            <div className="mt-4 rounded-xl bg-surface-2 p-3 text-xs leading-relaxed text-muted">
              Rencana dibuat di perangkat ini dari data progresmu. Kotoba tidak mengirim jadwal ke layanan AI atau pihak ketiga.
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeading title="Rencana bukan ujian" />
            <p className="text-sm leading-relaxed text-muted">
              Target ini adalah alat bantu ritme belajar, bukan prediksi kelulusan JLPT. Sesuaikan kembali kapan pun kebutuhanmu berubah.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
