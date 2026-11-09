import type { CourseModule, JLPTLevel, Lesson, LessonProgress, LessonProgressKind, ProgressSnapshot } from "@/lib/types";
import { JLPT_LEVELS } from "@/lib/types";
import { CURRICULUM_LESSONS, CURRICULUM_MODULES, getModule } from "@/content/curriculum";
import type { IconName } from "@/components/icons";

/**
 * Jembatan antara katalog kurikulum dan progres yang tersimpan.
 *
 * Katalog memakai id lesson (mis. "les-grammar-g-desu"), sedangkan halaman
 * materi menyimpan id kontennya (mis. "g-desu"). Fungsi di modul ini menjadi
 * satu-satunya tempat pemetaan tersebut agar UI tidak menebak-nebak.
 */

const KANA_LESSON_PATTERN = /^les-kana-(hiragana|katakana)-(basic|dakuten|handakuten|yoon)$/;

export const LESSON_PROGRESS_LABELS: Record<LessonProgressKind, string> = {
  grammar: "Tata bahasa",
  reading: "Membaca",
  listening: "Menyimak",
  culture: "Budaya",
  vocabulary: "Kosakata",
  kanji: "Kanji",
  sentence: "Susun kalimat",
  pronunciation: "Pelafalan",
  "kana-set": "Kana",
  game: "Permainan",
  typing: "Mengetik",
  conversation: "Percakapan",
};

export const LESSON_PROGRESS_ICONS: Record<LessonProgressKind, IconName> = {
  grammar: "grammar",
  reading: "reading",
  listening: "listening",
  culture: "culture",
  vocabulary: "vocab",
  kanji: "kanji",
  sentence: "list",
  pronunciation: "pronunciation",
  "kana-set": "kana",
  game: "games",
  typing: "keyboard",
  conversation: "conversation",
};

export function lessonProgressKind(lesson: Lesson): LessonProgressKind {
  switch (lesson.kind) {
    case "kana":
      return "kana-set";
    case "vocabulary":
      return "vocabulary";
    case "kanji":
      return "kanji";
    case "sentence":
      return "sentence";
    case "grammar":
      return "grammar";
    case "reading":
      return "reading";
    case "listening":
      return "listening";
    case "culture":
      return "culture";
    case "game":
      return "game";
    default:
      return "grammar";
  }
}

/** Id yang dipakai halaman materi saat memanggil recordLesson. */
export function lessonProgressId(lesson: Lesson): string {
  if (lesson.kind === "kana") {
    const match = KANA_LESSON_PATTERN.exec(lesson.id);
    if (match) return "kana-" + match[1] + "-" + match[2];
  }
  if (["grammar", "reading", "listening", "culture"].includes(lesson.kind)) {
    const ref = lesson.contentRefs[0];
    if (ref) return ref.id;
  }
  return lesson.id;
}

export function lessonProgressPayload(lesson: Lesson): { lessonId: string; kind: LessonProgressKind } {
  return { lessonId: lessonProgressId(lesson), kind: lessonProgressKind(lesson) };
}

const LESSON_BY_PROGRESS_ID = new Map<string, Lesson>();
for (const lesson of CURRICULUM_LESSONS) {
  const id = lessonProgressId(lesson);
  if (!LESSON_BY_PROGRESS_ID.has(id)) LESSON_BY_PROGRESS_ID.set(id, lesson);
}

export function lessonForProgressId(progressId: string): Lesson | undefined {
  return LESSON_BY_PROGRESS_ID.get(progressId);
}

export function lessonProgressFor(snapshot: ProgressSnapshot, lesson: Lesson): LessonProgress | undefined {
  const id = lessonProgressId(lesson);
  return snapshot.lessons.find((entry) => entry.lessonId === id);
}

export function isLessonComplete(snapshot: ProgressSnapshot, lesson: Lesson): boolean {
  return Boolean(lessonProgressFor(snapshot, lesson));
}

export function completedCatalogLessonIds(snapshot: ProgressSnapshot): Set<string> {
  const ids = new Set<string>();
  for (const progress of snapshot.lessons) {
    if (LESSON_BY_PROGRESS_ID.has(progress.lessonId)) ids.add(progress.lessonId);
  }
  return ids;
}

export function countCompletedCatalogLessons(snapshot: ProgressSnapshot): number {
  return completedCatalogLessonIds(snapshot).size;
}

export interface LevelCompletion {
  level: JLPTLevel;
  completed: number;
  total: number;
  percent: number;
}

export function levelCompletion(snapshot: ProgressSnapshot, level: JLPTLevel): LevelCompletion {
  const lessons = CURRICULUM_LESSONS.filter((lesson) => lesson.level === level);
  let completed = 0;
  for (const lesson of lessons) {
    if (isLessonComplete(snapshot, lesson)) completed += 1;
  }
  return {
    level,
    completed,
    total: lessons.length,
    percent: lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0,
  };
}

/**
 * Jalur JLPT dianggap naik ketika 60% lesson pada level berjalan sudah selesai.
 * Ambang ini cukup tinggi agar label tidak melompat hanya karena satu materi
 * tingkat lanjut pernah dibuka.
 */
export const LEVEL_UNLOCK_RATIO = 0.6;

export function currentJlptLevel(snapshot: ProgressSnapshot): JLPTLevel {
  let active: JLPTLevel = JLPT_LEVELS[0];
  for (let index = 0; index < JLPT_LEVELS.length - 1; index += 1) {
    const completion = levelCompletion(snapshot, JLPT_LEVELS[index]);
    if (completion.total > 0 && completion.completed / completion.total >= LEVEL_UNLOCK_RATIO) {
      active = JLPT_LEVELS[index + 1];
    } else {
      break;
    }
  }
  return active;
}

export function nextJlptLevel(level: JLPTLevel): JLPTLevel | null {
  const index = JLPT_LEVELS.indexOf(level);
  return index >= 0 && index < JLPT_LEVELS.length - 1 ? JLPT_LEVELS[index + 1] : null;
}

export function modulesForLevel(level: JLPTLevel): CourseModule[] {
  return CURRICULUM_MODULES.filter((module) => module.level === level);
}

export function crossLevelModules(): CourseModule[] {
  return CURRICULUM_MODULES.filter((module) => module.level === "semua");
}

function incompleteLessons(snapshot: ProgressSnapshot, level?: JLPTLevel): Lesson[] {
  return CURRICULUM_LESSONS.filter(
    (lesson) => (level ? lesson.level === level : true) && !isLessonComplete(snapshot, lesson),
  );
}

export function recommendedLesson(snapshot: ProgressSnapshot): Lesson | undefined {
  const level = currentJlptLevel(snapshot);
  return (
    incompleteLessons(snapshot, level)[0] ??
    incompleteLessons(snapshot)[0] ??
    CURRICULUM_LESSONS[0]
  );
}

export interface LastCompletedLesson {
  lesson: Lesson;
  completedAt: string;
}

export function lastCompletedCatalogLesson(snapshot: ProgressSnapshot): LastCompletedLesson | undefined {
  let latest: LastCompletedLesson | undefined;
  for (const progress of snapshot.lessons) {
    const lesson = lessonForProgressId(progress.lessonId);
    if (!lesson) continue;
    if (!latest || progress.completedAt > latest.completedAt) {
      latest = { lesson, completedAt: progress.completedAt };
    }
  }
  return latest;
}

/**
 * Lesson berikutnya yang masuk akal: meneruskan urutan dari lesson terakhir
 * yang selesai, lalu melengkapi dari awal level bila sudah di ujung.
 */
export function continueLessons(snapshot: ProgressSnapshot, count = 2): Lesson[] {
  const level = currentJlptLevel(snapshot);
  const levelLessons = CURRICULUM_LESSONS.filter((lesson) => lesson.level === level);
  if (levelLessons.length === 0) return [];

  const last = lastCompletedCatalogLesson(snapshot);
  let start = 0;
  if (last && last.lesson.level === level) {
    const index = levelLessons.findIndex((lesson) => lesson.id === last.lesson.id);
    if (index >= 0) start = index + 1;
  }

  const ordered = [...levelLessons.slice(start), ...levelLessons.slice(0, start)];
  const result: Lesson[] = [];
  for (const lesson of ordered) {
    if (isLessonComplete(snapshot, lesson)) continue;
    result.push(lesson);
    if (result.length >= count) break;
  }
  return result;
}

export function moduleForLesson(lesson: Lesson): CourseModule | undefined {
  return getModule(lesson.moduleId);
}
