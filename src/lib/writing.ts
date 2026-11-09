import { ALL_KANA } from "@/content/kana";
import { KANJI } from "@/content/kanji";
import { KANJIVG_STROKE_COUNTS } from "@/content/writing-strokes";
import { WRITING_SHAPE_NOTES } from "@/content/writing-notes";
import type {
  JLPTLevel,
  Kana,
  Kanji,
  WritingCharacter,
  WritingGlyph,
  WritingIndexEntry,
  WritingScript,
  WritingStage,
} from "@/lib/types";
import { WRITING_MASTERY_SCORE } from "@/lib/writing-geometry";

/**
 * Katalog latihan menulis. Data goresan berasal dari KanjiVG (commit tetap di
 * scripts/import-kanjivg.mjs) dan diimpor menjadi JSON per glyph di
 * public/writing/kanjivg. Modul ini hanya menyusun katalog ringan; berkas SVG
 * penuh dimuat saat detail karakter dibuka.
 */

export const WRITING_STAGE_LABELS: Record<WritingStage, string> = {
  A: "Hiragana",
  B: "Katakana",
  C: "Kanji dasar (N5–N4)",
  D: "Kanji menengah (N3–N2)",
  E: "Kanji lanjut (N1)",
};

export const WRITING_STAGE_DESCRIPTIONS: Record<WritingStage, string> = {
  A: "104 hiragana, termasuk dakuten, handakuten, dan yōon.",
  B: "104 katakana untuk kata serapan dan nama asing.",
  C: "Kanji N5–N4 untuk percakapan dan teks sehari-hari.",
  D: "Kanji N3–N2 untuk berita, artikel, dan topik abstrak.",
  E: "Kanji N1 untuk teks akademik dan nuansa lanjut.",
};

export const WRITING_STAGE_ORDER: WritingStage[] = ["A", "B", "C", "D", "E"];

export const WRITING_SCRIPT_LABELS: Record<WritingScript, string> = {
  hiragana: "Hiragana",
  katakana: "Katakana",
  kanji: "Kanji",
};

export function writingStageForKanji(level: JLPTLevel): WritingStage {
  if (level === "N5" || level === "N4") return "C";
  if (level === "N3" || level === "N2") return "D";
  return "E";
}

export function codePointFile(char: string): string {
  return Array.from(char)
    .map((part) => part.codePointAt(0)?.toString(16).padStart(5, "0"))
    .join("-");
}

export function writingGlyphUrl(file: string): string {
  // Versi query memaksa peramban membuang cache data lama yang masih memakai
  // titik berbentuk array sebelum importer diperbaiki.
  return `/writing/kanjivg/${file}?v=2`;
}

function glyph(char: string): WritingGlyph {
  const strokes = KANJIVG_STROKE_COUNTS[char] ?? 0;
  return { char, file: codePointFile(char) + ".json", strokes };
}

function glyphsFor(char: string): WritingGlyph[] {
  return Array.from(char).map(glyph);
}

function sumStrokes(glyphs: WritingGlyph[]): number {
  return glyphs.reduce((total, item) => total + item.strokes, 0);
}

function glyphNotes(char: string, fallback: string): string[] {
  const specific = WRITING_SHAPE_NOTES[char];
  return specific && specific.length > 0 ? specific : [fallback];
}

function kanaEntry(kana: Kana): WritingCharacter {
  const glyphs = glyphsFor(kana.char);
  return {
    id: `writing-${kana.script}-${kana.char}`,
    char: kana.char,
    script: kana.script,
    stage: kana.script === "hiragana" ? "A" : "B",
    romaji: kana.romaji,
    reading: kana.char,
    strokeCount: sumStrokes(glyphs),
    glyphs,
    // Kana adalah satuan bunyi, bukan kata: jangan menampilkan arti contoh
    // kata sebagai makna karakter itu sendiri.
    meanings: [],
    on: [],
    kun: [],
    examples: kana.examples.map((item) => ({
      word: item.word,
      reading: item.reading ?? item.word,
      meaning: item.meaning,
    })),
    notes: glyphNotes(
      kana.char,
      Array.from(kana.char).length > 1
        ? "Karakter yōon terdiri dari dua komponen; tulis komponen pertama lalu komponen kecil, jangan digabung menjadi satu goresan."
        : "Perhatikan titik awal, arah, dan panjang setiap goresan; bandingkan hasilmu dengan contoh.",
    ),
    mnemonic: kana.mnemonic,
    kanaGroup: kana.group,
    kanaRow: kana.row,
  };
}

function kanjiEntry(kanji: Kanji): WritingCharacter {
  const glyphs = glyphsFor(kanji.char);
  return {
    id: `writing-kanji-${kanji.char}`,
    char: kanji.char,
    script: "kanji",
    stage: writingStageForKanji(kanji.level),
    level: kanji.level,
    romaji: kanji.level,
    reading: [...kanji.on, ...kanji.kun].join("、"),
    strokeCount: sumStrokes(glyphs),
    glyphs,
    meanings: kanji.meanings,
    on: kanji.on,
    kun: kanji.kun,
    radical: kanji.radical,
    radicalMeaning: kanji.radicalMeaning,
    examples: kanji.examples.map((item) => ({
      word: item.word,
      reading: item.reading,
      meaning: item.meaning,
    })),
    notes: glyphNotes(
      kanji.char,
      `Pastikan ${sumStrokes(glyphs)} goresan mengikuti urutan contoh; jangan menebalkan satu garis dua kali.`,
    ),
    mnemonic: kanji.mnemonic,
  };
}

const KANA_ORDER = new Map(ALL_KANA.map((item, index) => [item.id, index]));

export const WRITING_CHARACTERS: WritingCharacter[] = [
  ...ALL_KANA.slice()
    .sort((a, b) => (KANA_ORDER.get(a.id) ?? 0) - (KANA_ORDER.get(b.id) ?? 0))
    .map(kanaEntry),
  ...KANJI.map(kanjiEntry),
];

export const WRITING_BY_ID = new Map(WRITING_CHARACTERS.map((item) => [item.id, item]));

/** Indeks ringan untuk hub; detail karakter tetap dimuat di server. */
export const WRITING_INDEX: WritingIndexEntry[] = WRITING_CHARACTERS.map((item) => ({
  id: item.id,
  char: item.char,
  script: item.script,
  stage: item.stage,
  level: item.level,
  romaji: item.romaji,
  reading: item.reading,
  strokeCount: item.strokeCount,
  glyphCount: item.glyphs.length,
  primaryMeaning: item.meanings[0] ?? "",
}));

export const WRITING_TOTAL = WRITING_CHARACTERS.length;
export const WRITING_KANA_TOTAL = ALL_KANA.length;
export const WRITING_KANJI_TOTAL = KANJI.length;

export function writingHref(item: Pick<WritingCharacter, "id">): string {
  return `/writing/${item.id}`;
}

export function writingMatches(item: WritingCharacter, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [
    item.char,
    item.id,
    item.romaji,
    item.reading,
    ...item.meanings,
    ...item.on,
    ...item.kun,
    ...item.examples.map((example) => example.word + " " + example.meaning),
  ]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

export function writingMasteryScore(): number {
  return WRITING_MASTERY_SCORE;
}
