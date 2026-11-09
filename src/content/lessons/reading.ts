import type { LessonBlock, LessonPlan, ReadingPassage } from "@/lib/types";
import { READING } from "../reading";

function readingBlocks(passage: ReadingPassage): LessonBlock[] {
  const paragraphs = passage.text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return [
    { type: "jp-prose", heading: "Teks bacaan", paragraphs },
    {
      type: "table",
      heading: "Kosakata kunci",
      columns: ["Kata", "Bacaan", "Arti"],
      rows: passage.vocab.map((word) => ({ label: word.jp, cells: [word.reading, word.meaning] })),
    },
    { type: "prose", heading: "Terjemahan", paragraphs: passage.translation },
    {
      type: "callout",
      tone: "tip",
      title: "Cara membaca",
      paragraphs: [
        "Baca teks Jepang dulu tanpa membuka terjemahan. Tandai kata yang belum dikenal, lalu cocokkan dengan tabel kosakata.",
        "Furigana mengikuti pengaturan di halaman Pengaturan. Setelah nyaman, coba baca tanpa furigana dan periksa lagi maknanya.",
      ],
    },
  ];
}

/**
 * Empat pelajaran membaca N5. Soal diambil langsung dari bank bacaan agar
 * tidak ada duplikasi konten dan setiap perubahan sumber otomatis terpakai.
 */
export const READING_PLANS: LessonPlan[] = READING.filter((passage) => passage.level === "N5").map((passage) => ({
  id: "les-reading-" + passage.id,
  title: passage.title,
  titleJp: passage.titleJp,
  summary: passage.summary,
  estimateMinutes: Math.max(5, passage.minutes + 2),
  goals: [
    "Memahami ide utama dan informasi rinci pada teks " + passage.title + ".",
    "Membaca kosakata kunci tanpa bergantung pada romaji.",
    "Menjawab pertanyaan pemahaman berdasarkan teks Jepang.",
  ],
  intro: [
    passage.summary,
    "Pelajari teks ini secara bertahap: baca versi Jepang, periksa kosakata, lalu jawab pertanyaan tanpa melihat terjemahan.",
    "Semua furigana dan pertanyaan berasal dari konten Kotoba yang sama dengan halaman bacaan.",
  ],
  explanation: readingBlocks(passage),
  examples: passage.vocab.slice(0, 3).map((word) => ({
    jp: word.jp,
    reading: word.reading,
    meaning: word.meaning,
  })),
  notes: [
    {
      tone: "tip",
      title: "Furigana adalah alat bantu",
      body: [
        "Gunakan furigana untuk memastikan bacaan, bukan untuk menghafal posisi bacaannya. Setelah beberapa kali membaca, coba sembunyikan furigana.",
        "Jika satu kalimat masih sulit, pecah menjadi bagian kecil dan cari predikatnya lebih dulu.",
      ],
    },
    {
      tone: "info",
      title: "Sebelum menjawab",
      body: [
        "Baca pertanyaan lebih dulu, lalu cari kalimat yang memuat kata kunci. Jawaban yang benar selalu punya bukti di teks.",
        "Skor minimal 60% membuka langkah Selesai; kamu bisa mengulang latihan kapan saja.",
      ],
    },
  ],
  practice: passage.questions,
  sourceId: passage.id,
}));
