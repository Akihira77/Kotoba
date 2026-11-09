import type { GameDefinition, GameId } from "@/lib/types";

/**
 * Katalog permainan dipakai oleh hub dan riwayat. Semua game berbagi
 * kontrak isi yang sama: delapan sampai empat belas soal, umpan balik,
 * dan penjelasan setelah setiap jawaban.
 */
export const GAME_DEFINITIONS: GameDefinition[] = [
  {
    id: "word-builder",
    title: "Pembuat kata",
    titleJp: "ことばづくり",
    description: "Susun ubin kana menjadi kosakata Jepang yang benar, lalu lihat bacaan dan artinya.",
    objectives: [
      "Mengenali urutan mora dalam kosakata",
      "Membedakan kata yang valid dari susunan acak",
      "Membaca kana tanpa bergantung pada romaji",
    ],
    kind: "word-builder",
    level: "N5",
    href: "/games?game=word-builder",
    xpReward: 30,
  },
  {
    id: "kana-matching",
    title: "Cocokkan kana",
    titleJp: "かな合わせ",
    description: "Cocokkan hiragana atau katakana dengan romaji, arti kata contoh, atau suara.",
    objectives: [
      "Mengenali bentuk kana dengan cepat",
      "Menghubungkan kana dengan bunyi dan kata",
      "Melatih ketelitian tanpa terburu-buru",
    ],
    kind: "kana-matching",
    level: "N5",
    href: "/games?game=kana-matching",
    xpReward: 25,
  },
  {
    id: "vocabulary-rush",
    title: "Kejar kosakata",
    titleJp: "ごいラッシュ",
    description: "Pilih arti yang tepat sebelum waktu habis. Kesulitan naik dari N5 sampai N1.",
    objectives: [
      "Mempercepat pengenalan makna kosakata",
      "Membedakan kata yang mirip",
      "Membaca contoh pemakaian setelah menjawab",
    ],
    kind: "vocabulary-rush",
    level: "semua",
    href: "/games?game=vocabulary-rush",
    xpReward: 30,
  },
  {
    id: "sentence-builder",
    title: "Susun kalimat",
    titleJp: "ぶんづくり",
    description: "Urutkan komponen kalimat dengan partikel yang tepat, lalu baca penjelasannya.",
    objectives: [
      "Memahami urutan predikat dan objek",
      "Memilih partikel sesuai peran kata",
      "Menjelaskan alasan susunan yang benar",
    ],
    kind: "sentence-builder",
    level: "N5",
    href: "/games?game=sentence-builder",
    xpReward: 30,
  },
  {
    id: "kanji-challenge",
    title: "Tantangan kanji",
    titleJp: "かんじチャレンジ",
    description: "Tebak arti, bacaan, dan pemakaian kanji dalam kata dengan tingkat kesulitan bertahap.",
    objectives: [
      "Mengenali arti dasar kanji",
      "Memilih bacaan yang sesuai konteks",
      "Menghubungkan kanji dengan kosakata nyata",
    ],
    kind: "kanji-challenge",
    level: "N5",
    href: "/games?game=kanji-challenge",
    xpReward: 30,
  },
  {
    id: "daily-challenge",
    title: "Tantangan harian",
    titleJp: "まいにちチャレンジ",
    description: "Sepuluh soal campuran kana, kosakata, kanji, dan tata bahasa yang berganti setiap hari.",
    objectives: [
      "Mengulang materi lintas level",
      "Mengukur kesiapan harian",
      "Menjaga kebiasaan belajar singkat",
    ],
    kind: "daily-challenge",
    level: "semua",
    href: "/games?game=daily-challenge",
    xpReward: 35,
  },
];

export const GAME_BY_ID: Record<GameId, GameDefinition> = GAME_DEFINITIONS.reduce(
  (accumulator, game) => {
    accumulator[game.id] = game;
    return accumulator;
  },
  {} as Record<GameId, GameDefinition>,
);

export function isGameId(value: string | null | undefined): value is GameId {
  return Boolean(value && value in GAME_BY_ID);
}

export function gameLabel(id: GameId): string {
  return GAME_BY_ID[id]?.title ?? "Permainan";
}

export function gameObjectives(id: GameId): string[] {
  return GAME_BY_ID[id]?.objectives ?? [];
}
