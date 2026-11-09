import { CURRICULUM_LESSONS, MODULE_BY_ID } from "@/content/curriculum";
import { currentJlptLevel, isLessonComplete } from "@/lib/learning";
import type { JLPTLevel, Lesson, ProgressSnapshot } from "@/lib/types";
import { JLPT_LEVELS } from "@/lib/types";
import { addDays, toDateKey } from "@/lib/utils";

/**
 * Perencana belajar yang deterministik dan dapat dijelaskan.
 *
 * Rencana tidak disimpan sebagai daftar tugas baru. Ia diturunkan dari
 * kurikulum, progres nyata, dan preferensi pengguna. Dengan begitu rencana
 * selalu ikut berubah saat pengguna menyelesaikan pelajaran, tanpa risiko
 * data jadwal yang basi.
 */

export type PlanFeasibility = "longgar" | "realistis" | "ketat" | "tidak-realistis";

export interface StudyPlanLesson {
  id: string;
  title: string;
  level: JLPTLevel;
  moduleTitle: string;
  minutes: number;
  href: string;
}

export interface StudyPlanWeek {
  week: number;
  startDate: string;
  endDate: string;
  focus: string;
  lessons: StudyPlanLesson[];
  lessonMinutes: number;
  reviewMinutes: number;
  totalMinutes: number;
}

export interface StudyPlanMilestone {
  week: number;
  label: string;
  detail: string;
}

export interface StudyPlan {
  currentLevel: JLPTLevel;
  targetLevel: JLPTLevel;
  /** True bila target berada di bawah level berjalan dan rencana disesuaikan. */
  targetAdjusted: boolean;
  weeks: number;
  daysPerWeek: number;
  sessionMinutes: number;
  weeklyMinutes: number;
  totalLessons: number;
  completedLessons: number;
  plannedLessons: number;
  unplannedLessons: number;
  lessonMinutes: number;
  reviewMinutes: number;
  requiredWeeks: number;
  recommendedWeeks: number;
  feasibility: PlanFeasibility;
  summary: string;
  recommendation: string;
  weeksPlan: StudyPlanWeek[];
  milestones: StudyPlanMilestone[];
}

export interface StudyPlanInput {
  snapshot: ProgressSnapshot;
  targetLevel: JLPTLevel;
  weeks?: number;
  now?: Date;
}

function levelIndex(level: JLPTLevel): number {
  return JLPT_LEVELS.indexOf(level);
}

function lessonToPlan(lesson: Lesson): StudyPlanLesson {
  return {
    id: lesson.id,
    title: lesson.title,
    level: lesson.level === "semua" ? "N5" : lesson.level,
    moduleTitle: MODULE_BY_ID.get(lesson.moduleId)?.title ?? lesson.moduleId,
    minutes: Math.max(3, lesson.estimateMinutes),
    href: lesson.href,
  };
}

function feasibilityFor(ratio: number): PlanFeasibility {
  if (ratio <= 0.75) return "longgar";
  if (ratio <= 1) return "realistis";
  if (ratio <= 1.3) return "ketat";
  return "tidak-realistis";
}

export function buildStudyPlan({
  snapshot,
  targetLevel,
  weeks: requestedWeeks,
  now = new Date(),
}: StudyPlanInput): StudyPlan {
  const currentLevel = currentJlptLevel(snapshot);
  const targetAdjusted = levelIndex(targetLevel) < levelIndex(currentLevel);
  const effectiveTarget = targetAdjusted ? currentLevel : targetLevel;
  const weeks = Math.min(104, Math.max(4, Math.round(requestedWeeks ?? 12)));
  const { dailyStudyMinutes: sessionMinutes, weeklyFrequency: daysPerWeek } = snapshot.profile.settings;

  const startIndex = levelIndex(currentLevel);
  const endIndex = levelIndex(effectiveTarget);
  const levels = JLPT_LEVELS.slice(startIndex, endIndex + 1);

  const scopedLessons = CURRICULUM_LESSONS.filter(
    (lesson) => lesson.level !== "semua" && levels.includes(lesson.level as JLPTLevel),
  );
  const completed = scopedLessons.filter((lesson) => isLessonComplete(snapshot, lesson));
  const incomplete = scopedLessons.filter((lesson) => !isLessonComplete(snapshot, lesson));
  const allPlanLessons = incomplete.map(lessonToPlan);
  const weeklyMinutes = sessionMinutes * daysPerWeek;
  const weeklyLessonBudget = Math.max(30, Math.round(weeklyMinutes * 0.75));
  const totalLessonMinutes = allPlanLessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
  const requiredWeeks = Math.max(1, Math.ceil(totalLessonMinutes / weeklyLessonBudget));
  const feasibility = feasibilityFor(totalLessonMinutes === 0 ? 0 : requiredWeeks / weeks);
  const recommendedWeeks = Math.max(1, requiredWeeks);

  const weeksPlan: StudyPlanWeek[] = [];
  const remaining = [...allPlanLessons];

  for (let index = 0; index < weeks; index += 1) {
    const weekStart = addDays(now, index * 7);
    const weekEnd = addDays(weekStart, 6);
    const chosen: StudyPlanLesson[] = [];
    let minutes = 0;

    while (remaining.length > 0) {
      const next = remaining[0];
      if (chosen.length > 0 && minutes + next.minutes > weeklyLessonBudget) break;
      chosen.push(next);
      minutes += next.minutes;
      remaining.shift();
    }

    const reviewMinutes = Math.max(0, weeklyMinutes - minutes);
    const first = chosen[0];
    weeksPlan.push({
      week: index + 1,
      startDate: toDateKey(weekStart),
      endDate: toDateKey(weekEnd),
      focus: first ? first.moduleTitle : "Konsolidasi & ulangan",
      lessons: chosen,
      lessonMinutes: minutes,
      reviewMinutes,
      totalMinutes: minutes + reviewMinutes,
    });
  }

  const milestones: StudyPlanMilestone[] = [];
  const seenLevels = new Set<JLPTLevel>();
  for (const week of weeksPlan) {
    const firstNewLevel = week.lessons.find((lesson) => !seenLevels.has(lesson.level));
    if (firstNewLevel) {
      seenLevels.add(firstNewLevel.level);
      milestones.push({
        week: week.week,
        label: "Mulai " + firstNewLevel.level,
        detail: "Fokus pada materi " + firstNewLevel.level + " dan ulangan kartu yang jatuh tempo.",
      });
    }
  }
  if (!targetAdjusted) {
    milestones.push({
      week: remaining.length === 0 ? weeks : requiredWeeks,
      label: "Target " + effectiveTarget,
      detail:
        remaining.length === 0
          ? "Seluruh pelajaran pada rentang level ini sudah masuk rencana."
          : "Sisa " + remaining.length + " pelajaran belum masuk rentang waktu yang dipilih.",
    });
  }

  const dueCards = snapshot.cards.filter((card) => card.dueAt <= now.toISOString()).length;
  const recommendations: string[] = [];
  if (dueCards > 0) recommendations.push("Sisihkan 10–15 menit di awal sesi untuk mengulang " + dueCards + " kartu jatuh tempo.");
  if (snapshot.kana.length === 0) recommendations.push("Selesaikan set kana dasar sebelum menambah target kosakata yang lebih besar.");
  if (snapshot.lessons.length === 0) recommendations.push("Mulai dari satu pelajaran pendek; rencana akan menyesuaikan diri setelah progres pertama tercatat.");
  if (recommendations.length === 0) recommendations.push("Pertahankan ritme: satu sesi pendek setiap hari lebih mudah dipertahankan daripada sesi panjang sekali seminggu.");

  const summary =
    totalLessonMinutes === 0
      ? "Tidak ada pelajaran tersisa pada rentang level ini. Gunakan waktunya untuk ulangan dan latihan mandiri."
      : "Rencana " + weeks + " minggu ini mencakup " + allPlanLessons.length + " pelajaran, sekitar " + totalLessonMinutes + " menit materi, ditambah ulangan.";
  const recommendation =
    remaining.length > 0
      ? "Dengan " + weeks + " minggu, sekitar " + remaining.length + " pelajaran belum masuk rencana. Perpanjang target atau tambah durasi sesi."
      : "Rencana ini muat dalam " + weeks + " minggu. Sisakan satu hari cadangan untuk ulangan atau istirahat.";

  return {
    currentLevel,
    targetLevel: effectiveTarget,
    targetAdjusted,
    weeks,
    daysPerWeek,
    sessionMinutes,
    weeklyMinutes,
    totalLessons: scopedLessons.length,
    completedLessons: completed.length,
    plannedLessons: allPlanLessons.length - remaining.length,
    unplannedLessons: remaining.length,
    lessonMinutes: totalLessonMinutes,
    reviewMinutes: Math.max(0, weeklyMinutes * weeks - totalLessonMinutes),
    requiredWeeks,
    recommendedWeeks,
    feasibility,
    summary,
    recommendation,
    weeksPlan,
    milestones,
  };
}

export const PLAN_FEASIBILITY_LABELS: Record<PlanFeasibility, string> = {
  longgar: "Longgar",
  realistis: "Realistis",
  ketat: "Ketat",
  "tidak-realistis": "Perlu disesuaikan",
};

export const PLAN_LEVEL_DESCRIPTIONS: Record<JLPTLevel, string> = {
  N5: "Fondasi kana, kosakata harian, dan pola kalimat dasar.",
  N4: "Percakapan sehari-hari dan teks pendek tentang topik akrab.",
  N3: "Materi menengah dengan bacaan dan percakapan yang lebih beragam.",
  N2: "Bacaan surat kabar, artikel, dan percakapan yang lebih luas.",
  N1: "Teks akademik dan nuansa bahasa yang halus.",
};
