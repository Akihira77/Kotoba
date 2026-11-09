import type { LessonPlan } from "@/lib/types";
import { GRAMMAR_PLANS } from "./grammar";
import { KANA_PLANS } from "./kana";
import { KANJI_PLANS } from "./kanji";
import { LISTENING_PLANS } from "./listening";
import { READING_PLANS } from "./reading";
import { SENTENCE_PLANS } from "./sentence";
import { VOCABULARY_PLANS } from "./vocabulary";

/**
 * Satu tempat untuk seluruh konten pelajaran interaktif.
 *
 * UI tidak boleh menyimpan materi pelajaran. Semua teks, contoh, dan soal
 * berasal dari registry ini agar pelajaran baru dapat ditambahkan tanpa
 * mengubah komponen halaman.
 */
export const LESSON_PLANS: LessonPlan[] = [
  ...KANA_PLANS,
  ...VOCABULARY_PLANS,
  ...KANJI_PLANS,
  ...GRAMMAR_PLANS,
  ...SENTENCE_PLANS,
  ...READING_PLANS,
  ...LISTENING_PLANS,
];

const planMap = new Map<string, LessonPlan>();
for (const plan of LESSON_PLANS) {
  if (planMap.has(plan.id)) {
    throw new Error("ID pelajaran ganda: " + plan.id);
  }
  planMap.set(plan.id, plan);
}

export const LESSON_PLAN_BY_ID: ReadonlyMap<string, LessonPlan> = planMap;

export function getLessonPlan(id: string): LessonPlan | undefined {
  return LESSON_PLAN_BY_ID.get(id);
}

export function hasLessonPlan(id: string): boolean {
  return LESSON_PLAN_BY_ID.has(id);
}

export function lessonPlanForSource(sourceId: string): LessonPlan | undefined {
  return LESSON_PLANS.find((plan) => plan.sourceId === sourceId);
}

export const PLANNED_LESSON_COUNT = LESSON_PLANS.length;

export interface LessonPathModule {
  id: string;
  title: string;
  titleJp: string;
  description: string;
  lessonIds: string[];
}

function idsFor(prefix: string): string[] {
  return LESSON_PLANS.filter((plan) => plan.id.startsWith(prefix)).map((plan) => plan.id);
}

/**
 * Delapan jalur belajar N5 yang ditampilkan di halaman Belajar. Urutan ini
 * mengikuti perkembangan kemampuan: membaca kana, lalu kanji, kosakata,
 * tata bahasa, menyusun kalimat, membaca, dan menyimak.
 */
export const N5_PATH_MODULES: LessonPathModule[] = [
  {
    id: "path-hiragana",
    title: "Hiragana",
    titleJp: "ひらがな",
    description: "46 kana dasar, dakuten, handakuten, dan yōon untuk kata asli Jepang.",
    lessonIds: idsFor("les-kana-hiragana-"),
  },
  {
    id: "path-katakana",
    title: "Katakana",
    titleJp: "カタカナ",
    description: "Kana untuk kata serapan, nama asing, dan penekanan bunyi.",
    lessonIds: idsFor("les-kana-katakana-"),
  },
  {
    id: "path-kanji",
    title: "Kanji",
    titleJp: "漢字",
    description: "65 kanji N5 dengan arti, on'yomi, kun'yomi, radikal, dan contoh kata.",
    lessonIds: idsFor("les-kanji-N5-"),
  },
  {
    id: "path-vocabulary",
    title: "Kosakata",
    titleJp: "語彙",
    description: "Kata N5 yang dikelompokkan menurut tema kehidupan sehari-hari.",
    lessonIds: idsFor("les-vocab-N5-"),
  },
  {
    id: "path-grammar",
    title: "Tata bahasa",
    titleJp: "文法",
    description: "Pola inti N5 dengan penjelasan, formasi, contoh, dan latihan.",
    lessonIds: idsFor("les-grammar-"),
  },
  {
    id: "path-sentence",
    title: "Susun kalimat",
    titleJp: "文の組み立て",
    description: "Urutan kata, partikel, dan pola kalimat dasar untuk percakapan.",
    lessonIds: idsFor("les-sentence-N5"),
  },
  {
    id: "path-reading",
    title: "Bacaan",
    titleJp: "読解",
    description: "Teks pendek N5 dengan furigana, kosakata, dan pertanyaan pemahaman.",
    lessonIds: idsFor("les-reading-"),
  },
  {
    id: "path-listening",
    title: "Menyimak",
    titleJp: "聴解",
    description: "Dialog N5 dengan audio, transkrip, frasa kunci, dan latihan.",
    lessonIds: idsFor("les-listening-"),
  },
];
