import type { GrammarPoint, LessonBlock, LessonExample, LessonNote, LessonPlan, QuizQuestion } from "@/lib/types";
import { GRAMMAR } from "@/content/grammar";
import { makeQuestion } from "./shared";

const N5_GRAMMAR = GRAMMAR.filter((point) => point.level === "N5");
const MEANING_POOL = N5_GRAMMAR.map((point) => point.meaning);
const PATTERN_POOL = N5_GRAMMAR.map((point) => point.pattern);
const FORM_POOL = N5_GRAMMAR.flatMap((point) => point.formation.map((row) => row.form));

function examplesFor(point: GrammarPoint): LessonExample[] {
  return point.examples.map((example) => ({
    jp: example.jp,
    reading: example.reading,
    meaning: example.meaning,
    note: "Pola: " + point.pattern,
  }));
}

function explanationFor(point: GrammarPoint): LessonBlock[] {
  return [
    {
      type: "prose",
      heading: "Penjelasan",
      paragraphs: point.explanation,
    },
    {
      type: "table",
      heading: "Formasi",
      columns: ["Bentuk", "Pola", "Catatan"],
      rows: point.formation.map((row) => ({
        label: row.label,
        cells: [row.form, row.note ?? "—"],
      })),
    },
  ];
}

function notesFor(point: GrammarPoint): LessonNote[] {
  const notes: LessonNote[] = [
    {
      tone: "tip",
      title: "Baca contoh dengan suara",
      body: [
        "Baca setiap contoh dua kali: pertama perlahan sambil menunjuk partikel, lalu dengan kecepatan normal. Perhatikan bagaimana pola muncul dalam kalimat lengkap.",
      ],
    },
    {
      tone: "info",
      title: "Terjemahan natural",
      body: [
        "Terjemahan contoh di pelajaran ini adalah terjemahan natural, bukan terjemahan kata per kata. Urutan kata dan partikel Jepang tidak selalu memiliki padanan satu-satu dalam bahasa Indonesia.",
      ],
    },
  ];

  if (point.notes && point.notes.length > 0) {
    notes.push({ tone: "info", title: "Catatan penggunaan", body: point.notes });
  }

  if (point.mistakes && point.mistakes.length > 0) {
    notes.push({
      tone: "warning",
      title: "Kesalahan umum",
      body: point.mistakes.flatMap((mistake) => [
        "✗ " + mistake.wrong,
        "✓ " + mistake.right,
        mistake.why,
      ]),
    });
  }

  return notes;
}

function practiceFor(planId: string, point: GrammarPoint): QuizQuestion[] {
  const questions: QuizQuestion[] = point.practice.map((question, index) => ({
    ...question,
    id: planId + "-q-base-" + (index + 1),
  }));

  questions.push(
    makeQuestion({
      id: planId + "-q-meaning",
      type: "grammar",
      level: "N5",
      prompt: "Apa makna pola 「" + point.pattern + "」?",
      promptJp: point.pattern,
      correct: point.meaning,
      pool: MEANING_POOL,
      seed: 2,
      explanation: "Pola 「" + point.pattern + "」 berarti " + point.meaning + ".",
    }),
  );

  questions.push(
    makeQuestion({
      id: planId + "-q-pattern",
      type: "grammar",
      level: "N5",
      prompt: `Pola mana yang menyatakan makna "${point.meaning}"?`,
      correct: point.pattern,
      pool: PATTERN_POOL,
      seed: 5,
      explanation: "Pola yang tepat adalah 「" + point.pattern + "」.",
    }),
  );

  if (point.formation.length > 1) {
    const row = point.formation[1];
    questions.push(
      makeQuestion({
        id: planId + "-q-form",
        type: "grammar",
        level: "N5",
        prompt: `Bagaimana bentuk "${row.label}" pada pola ini?`,
        correct: row.form,
        pool: FORM_POOL,
        seed: 7,
        explanation:
          "Bentuk " + row.label + " untuk pola " + point.pattern + " adalah " + row.form + "." +
          (row.note ? " " + row.note : ""),
      }),
    );
  }

  return questions;
}

function buildGrammarPlan(point: GrammarPoint): LessonPlan {
  const id = "les-grammar-" + point.id;
  const goals = [
    "Memahami fungsi pola " + point.pattern + ".",
    "Menyusun kalimat dengan formasi yang benar.",
    "Menghindari kesalahan umum yang dijelaskan pada materi.",
  ];

  return {
    id,
    title: "Pola " + point.pattern,
    titleJp: point.pattern,
    summary: point.meaning,
    estimateMinutes: 10,
    goals,
    intro: [
      "Pola " + point.pattern + " berarti " + point.meaning + ". Pelajaran ini menjelaskan formasi, contoh pemakaian, dan kesalahan yang perlu dihindari.",
      "Baca penjelasan sekali, lalu langsung uji pemahaman pada langkah latihan. Jika skor belum cukup, ulangi contoh sebelum mencoba lagi.",
    ],
    explanation: explanationFor(point),
    examples: examplesFor(point),
    notes: notesFor(point),
    practice: practiceFor(id, point),
  };
}

export const GRAMMAR_PLANS: LessonPlan[] = N5_GRAMMAR.map(buildGrammarPlan);
