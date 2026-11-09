import type { LessonBlock, LessonPlan, ListeningItem } from "@/lib/types";
import { LISTENING } from "../listening";

function listeningBlocks(item: ListeningItem): LessonBlock[] {
  return [
    {
      type: "dialog",
      heading: "Dialog",
      lines: item.lines.map((line) => ({
        speaker: line.speaker,
        jp: line.jp,
        reading: line.reading,
      })),
    },
    {
      type: "table",
      heading: "Frasa kunci",
      columns: ["Frasa", "Bacaan", "Arti"],
      rows: item.keyPhrases.map((phrase) => ({
        label: phrase.jp,
        cells: [phrase.reading, phrase.meaning],
      })),
    },
    {
      type: "callout",
      tone: "info",
      title: "Strategi menyimak",
      paragraphs: [
        "Dengarkan audio satu kali tanpa transkrip. Fokus pada situasi, siapa berbicara, dan kata tanya.",
        "Gunakan mode lambat bila perlu, lalu buka transkrip setelah menjawab. Cocokkan bacaan kana dengan bunyi yang kamu dengar.",
      ],
    },
  ];
}

/**
 * Delapan pelajaran menyimak N5. Audio tetap diputar oleh browser melalui
 * SpeakButton; pelajaran ini menambahkan alur baca, catatan, dan latihan.
 */
export const LISTENING_PLANS: LessonPlan[] = LISTENING.filter((item) => item.level === "N5").map((item) => ({
  id: "les-listening-" + item.id,
  title: item.title,
  titleJp: item.titleId,
  summary: item.scenario,
  estimateMinutes: 10,
  goals: [
    "Menangkap situasi dan topik dialog " + item.title + ".",
    "Mengenali frasa kunci serta bunyi yang mirip.",
    "Menjawab pertanyaan berdasarkan audio, bukan teks saja.",
  ],
  intro: [
    item.scenario,
    "Latihan ini memakai suara Jepang dari browser. Dengarkan dulu, pilih jawaban, lalu buka transkrip untuk memeriksa.",
    "Transkrip dan pertanyaan diambil dari dialog yang sama di halaman Menyimak.",
  ],
  explanation: listeningBlocks(item),
  examples: item.keyPhrases.slice(0, 3).map((phrase) => ({
    jp: phrase.jp,
    reading: phrase.reading,
    meaning: phrase.meaning,
  })),
  notes: [
    {
      tone: "tip",
      title: "Dengar sebelum membaca",
      body: [
        "Coba pahami topik dari dua atau tiga kata kunci. Tidak perlu menangkap setiap kata.",
        "Jika suara browser terdengar berbeda di perangkat lain, utamakan ritme dan panjang bunyi; kualitas suara bergantung pada voice yang tersedia.",
      ],
    },
    {
      tone: "info",
      title: "Setelah menjawab",
      body: [
        "Buka transkrip dan baca ulang sambil mendengarkan. Perhatikan partikel dan perubahan bentuk yang mungkin terlewat.",
        "Ulangi dialog ini besok dengan kecepatan normal untuk memperkuat ingatan.",
      ],
    },
  ],
  practice: item.questions,
  sourceId: item.id,
}));
