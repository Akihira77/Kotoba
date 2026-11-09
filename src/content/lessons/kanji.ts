import type { Kanji, LessonBlock, LessonExample, LessonNote, LessonPlan, QuizQuestion } from "@/lib/types";
import { KANJI } from "@/content/kanji";
import { makeQuestion, sampleDistinct } from "./shared";

const N5_KANJI = KANJI.filter((item) => item.level === "N5");
const KANJI_READING_POOL = N5_KANJI.flatMap((item) => item.examples.map((example) => example.reading));
const KANJI_MEANING_POOL = N5_KANJI.map((item) => item.meanings[0]);

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

function exampleFor(item: Kanji): LessonExample {
  const example = item.examples[0];
  const readings = [
    item.on.length > 0 ? "on: " + item.on.join("、") : null,
    item.kun.length > 0 ? "kun: " + item.kun.join("、") : null,
  ].filter(Boolean);

  return {
    jp: example ? example.word : item.char,
    reading: example ? example.reading : undefined,
    meaning: example ? example.meaning : item.meanings.join(", "),
    note: item.char + " · " + readings.join(" · "),
  };
}

function explanationFor(set: Kanji[]): LessonBlock[] {
  return [
    {
      type: "prose",
      heading: "Cara membaca kanji",
      paragraphs: [
        "On'yomi adalah bacaan yang diadaptasi dari bahasa Tionghoa dan sering muncul dalam kata majemuk. Kun'yomi adalah bacaan asli Jepang dan sering muncul saat kanji berdiri sendiri atau diikuti okurigana.",
        "Satu kanji dapat memiliki beberapa bacaan. Jangan mencoba menghafal semua bacaan sekaligus; pelajari bacaan yang muncul pada contoh kata di set ini terlebih dahulu.",
      ],
    },
    { type: "kanji-list", heading: set.length + " kanji pada set ini", kanjiIds: set.map((item) => item.id) },
    {
      type: "callout",
      tone: "info",
      title: "Urutan goresan",
      paragraphs: [
        "Jumlah goresan ditampilkan di kartu. Untuk melihat arah dan urutan goresan, buka Studio Menulis lewat tombol Latihan menulis di pelajaran ini atau menu Menulis. Animasi mengikuti data KanjiVG; tetap verifikasi pada kamus kanji tepercaya sebelum menulis dari ingatan.",
        "Aturan umum: tulis dari kiri ke kanan dan atas ke bawah, lalu selesaikan garis luar sebelum isi. Jangan menebak goresan yang tidak terlihat.",
      ],
    },
  ];
}

function notesFor(set: Kanji[]): LessonNote[] {
  return [
    {
      tone: "tip",
      title: "Satu kanji, satu cerita",
      body: [
        "Hubungkan bentuk kanji dengan radikal dan artinya. Misalnya 日 (matahari) muncul dalam 日本, 日曜日, dan 毎日. Semakin banyak kata yang Anda kenali, semakin mudah bacaan diingat.",
      ],
    },
    {
      tone: "warning",
      title: "Jangan menebak bacaan",
      body: [
        "Bacaan kanji bergantung pada kata dan konteks. Jika belum yakin, periksa kamus. Menebak on'yomi atau kun'yomi dapat menghasilkan kata yang tidak pernah dipakai.",
      ],
    },
    {
      tone: "info",
      title: "Radikal membantu",
      body: set.slice(0, 4).map((item) => item.char + " · radikal " + item.radical + " (" + item.radicalMeaning + "), " + item.strokes + " goresan."),
    },
  ];
}

function practiceFor(planId: string, set: Kanji[]): QuizQuestion[] {
  const readingExamples = Array.from(
    new Map(set.flatMap((item) => item.examples).map((example) => [example.word + example.reading, example])).values(),
  );
  const readingItems = sampleDistinct(readingExamples, 3, 2);
  const uniqueMeaningKanji = set.filter(
    (item) => KANJI_MEANING_POOL.filter((meaning) => meaning === item.meanings[0]).length === 1,
  );
  const meaningItems = sampleDistinct(uniqueMeaningKanji.length >= 3 ? uniqueMeaningKanji : set, 3, 4);
  const questions: QuizQuestion[] = [];

  readingItems.forEach((example, index) => {
    questions.push(
      makeQuestion({
        id: planId + "-q" + (index + 1),
        type: "kanji-reading",
        level: "N5",
        prompt: "Bagaimana bacaan kata 「" + example.word + "」?",
        promptJp: example.word,
        correct: example.reading,
        pool: KANJI_READING_POOL,
        seed: index + 2,
        explanation: `「${example.word}」 dibaca ${example.reading} dan berarti "${example.meaning}".`,
        audioText: example.word,
      }),
    );
  });

  meaningItems.forEach((item, index) => {
    questions.push(
      makeQuestion({
        id: planId + "-q" + (readingItems.length + index + 1),
        type: "kanji-meaning",
        level: "N5",
        prompt: "Apa arti utama kanji 「" + item.char + "」?",
        promptJp: item.char,
        correct: item.meanings[0],
        pool: KANJI_MEANING_POOL,
        seed: index + 5,
        explanation: "Kanji 「" + item.char + "」 berarti " + item.meanings.join(", ") + ".",
        audioText: item.char,
      }),
    );
  });

  return questions;
}

function buildKanjiPlan(set: Kanji[], index: number): LessonPlan {
  const id = "les-kanji-N5-" + (index + 1);
  const chars = set.map((item) => item.char).join("・");

  return {
    id,
    title: "Kanji N5 · Set " + (index + 1),
    titleJp: "N5 漢字",
    summary: set.length + " kanji dengan arti, on'yomi, kun'yomi, radikal, dan contoh kata.",
    estimateMinutes: 15,
    goals: [
      "Mengenali " + set.length + " kanji dan arti utamanya.",
      "Membaca on'yomi dan kun'yomi yang muncul pada contoh kata.",
      "Menghubungkan kanji dengan radikal dan jumlah goresan.",
    ],
    intro: [
      "Set " + (index + 1) + " berisi " + set.length + " kanji N5: " + chars + ".",
      "Pelajari empat kanji pertama dengan saksama, lalu tambah satu per satu. Kanji yang dipelajari bersama contoh kata lebih mudah diingat daripada daftar bacaan yang terpisah.",
    ],
    explanation: explanationFor(set),
    examples: set.map(exampleFor),
    notes: notesFor(set),
    practice: practiceFor(id, set),
  };
}

export const KANJI_PLANS: LessonPlan[] = chunk(N5_KANJI, 12).map((set, index) => buildKanjiPlan(set, index));
