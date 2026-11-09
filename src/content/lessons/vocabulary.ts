import type { LessonExample, LessonNote, LessonPlan, QuizQuestion, VocabTopic, VocabWord } from "@/lib/types";
import { POS_LABELS, TOPIC_LABELS } from "@/lib/constants";
import { VOCABULARY } from "@/content/vocabulary";
import { makeQuestion, posSummary, sampleDistinct } from "./shared";

const N5_WORDS = VOCABULARY.filter((word) => word.level === "N5");

function topicWords(topic: VocabTopic): VocabWord[] {
  return N5_WORDS.filter((word) => word.topic === topic);
}

function examplesFor(words: VocabWord[]): LessonExample[] {
  const seen = new Set<string>();
  const result: LessonExample[] = [];

  for (const word of words) {
    for (const example of word.examples) {
      if (seen.has(example.jp)) continue;
      seen.add(example.jp);
      result.push({
        jp: example.jp,
        reading: example.reading,
        meaning: example.meaning,
        note: word.japanese + " · " + word.meaning,
      });
      if (result.length >= 6) return result;
    }
  }

  for (const word of words) {
    if (result.length >= 4) break;
    if (seen.has(word.japanese)) continue;
    seen.add(word.japanese);
    result.push({
      jp: word.japanese,
      reading: word.kana,
      romaji: word.romaji,
      meaning: word.meaning,
      note: "Kata dasar tema " + TOPIC_LABELS[word.topic] + ".",
    });
  }

  return result;
}

function notesFor(words: VocabWord[]): LessonNote[] {
  const notes: LessonNote[] = [
    {
      tone: "tip",
      title: "Belajar dengan konteks",
      body: [
        "Baca contoh kalimat lengkap, bukan hanya pasangan kata dan arti. Perhatikan partikel dan bentuk kata kerja yang mengelilingi kata baru.",
      ],
    },
    {
      tone: "warning",
      title: "Jangan menghafal romaji saja",
      body: [
        "Gunakan romaji hanya untuk memeriksa bunyi. Jika selalu membaca romaji, bentuk kana dan kanji tidak akan terhubung dengan makna.",
      ],
    },
  ];

  const wordNotes = words.filter((word) => word.notes).slice(0, 4);
  if (wordNotes.length > 0) {
    notes.push({
      tone: "info",
      title: "Catatan kata",
      body: wordNotes.map((word) => word.japanese + " — " + word.notes),
    });
  }

  return notes;
}

function practiceFor(planId: string, words: VocabWord[]): QuizQuestion[] {
  const meaningPool = Array.from(new Set(N5_WORDS.map((word) => word.meaning)));
  const meaningCount = new Map<string, number>();
  for (const word of N5_WORDS) {
    meaningCount.set(word.meaning, (meaningCount.get(word.meaning) ?? 0) + 1);
  }

  // Hindari soal yang punya lebih dari satu jawaban benar, misalnya 勉強 dan
  // 勉強する yang sama-sama berarti "belajar".
  const unambiguousWords = words.filter((word) => meaningCount.get(word.meaning) === 1);
  const meaningWords = sampleDistinct(unambiguousWords.length >= 3 ? unambiguousWords : words, 3, 1);
  const japaneseWords = sampleDistinct(unambiguousWords.length >= 3 ? unambiguousWords : words, 3, 4);
  const questions: QuizQuestion[] = [];

  meaningWords.forEach((word, index) => {
    questions.push(
      makeQuestion({
        id: planId + "-q" + (index + 1),
        type: "vocab-meaning",
        level: "N5",
        prompt: "Apa arti 「" + word.japanese + "」?",
        promptJp: word.japanese,
        correct: word.meaning,
        pool: meaningPool,
        seed: index + 1,
        explanation: "「" + word.japanese + "」 (" + word.kana + ") berarti " + word.meaning + ".",
        audioText: word.japanese,
      }),
    );
  });

  japaneseWords.forEach((word, index) => {
    const japanesePool = N5_WORDS.filter((entry) => entry.meaning !== word.meaning).map((entry) => entry.japanese);
    questions.push(
      makeQuestion({
        id: planId + "-q" + (meaningWords.length + index + 1),
        type: "vocab-japanese",
        level: "N5",
        prompt: "Kata Jepang untuk " + word.meaning + " adalah…",
        correct: word.japanese,
        pool: japanesePool,
        seed: index + 4,
        explanation: "Kata yang tepat adalah 「" + word.japanese + "」 (" + word.kana + ", " + word.romaji + ").",
        audioText: word.japanese,
      }),
    );
  });

  return questions;
}

function buildVocabPlan(topic: VocabTopic, words: VocabWord[]): LessonPlan {
  const id = "les-vocab-N5-" + topic;
  const label = TOPIC_LABELS[topic];
  const posCounts = new Map<string, number>();
  for (const word of words) {
    posCounts.set(word.pos, (posCounts.get(word.pos) ?? 0) + 1);
  }
  const posText = posSummary(
    Array.from(posCounts.entries()).map(([pos, count]) => ({ pos, count })),
    POS_LABELS,
  );

  return {
    id,
    title: "Kosakata N5 · " + label,
    titleJp: "N5 語彙",
    summary: words.length + " kata tema " + label + " untuk level N5, lengkap dengan kana, romaji, arti, dan contoh.",
    estimateMinutes: 10,
    goals: [
      "Mengenali " + words.length + " kosakata tema " + label + ".",
      "Membaca kana dan memahami contoh kalimat.",
      "Memakai kata baru dalam kalimat sederhana.",
    ],
    intro: [
      "Tema " + label + " berisi " + words.length + " kata N5. Setiap entri menampilkan tulisan Jepang, bacaan kana, romaji opsional, dan arti Indonesia.",
      "Komposisi kelas kata pada tema ini: " + posText + ".",
    ],
    explanation: [
      {
        type: "prose",
        heading: "Cara membaca daftar",
        paragraphs: [
          "Baca dari tulisan Jepang ke kana, lalu ke arti. Romaji boleh dipakai untuk memastikan bunyi, tetapi jangan dijadikan satu-satunya jalur membaca.",
          "Setelah mengenali kata, buka contoh kalimat dan cari kata tersebut. Perhatikan partikel yang menyertainya karena arti sering bergantung pada konteks.",
        ],
      },
      { type: "vocab-list", heading: "Daftar kosakata " + label, wordIds: words.map((word) => word.id) },
      {
        type: "callout",
        tone: "tip",
        title: "Latihan singkat",
        paragraphs: [
          "Pilih tiga kata, lalu buat satu kalimat pendek untuk masing-masing. Bandingkan dengan contoh yang tersedia; perbaiki partikel bila perlu.",
        ],
      },
    ],
    examples: examplesFor(words),
    notes: notesFor(words),
    practice: practiceFor(id, words),
  };
}

const TOPIC_ORDER = Array.from(new Set(N5_WORDS.map((word) => word.topic)));

export const VOCABULARY_PLANS: LessonPlan[] = TOPIC_ORDER.map((topic) => buildVocabPlan(topic, topicWords(topic)));
