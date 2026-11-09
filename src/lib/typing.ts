import { ALL_KANA, KANA_GROUP_LABELS, KANA_SCRIPT_LABELS } from "@/content/kana";
import { VOCABULARY } from "@/content/vocabulary";
import type { JLPTLevel, Kana } from "@/lib/types";

/**
 * Latihan mengetik Jepang.
 *
 * Tiga mode sengaja dipisahkan karena keterampilannya berbeda:
 * - kana → romaji: membaca kana tanpa bantuan IME.
 * - romaji → kana: mengenali bentuk kana dan berlatih IME.
 * - arti → kanji: mengetik kata Jepang yang mengandung kanji.
 *
 * Pemeriksaan jawaban tidak memanggil layanan luar dan tidak mengubah SRS.
 */

export type TypingMode = "kana-romaji" | "romaji-kana" | "meaning-kanji";

export interface TypingChallenge {
  id: string;
  mode: TypingMode;
  prompt: string;
  promptSubtitle: string;
  answer: string;
  hint: string;
  level: JLPTLevel;
  /** Kana yang diuji, bila relevan. */
  kana?: string;
  /** Arti Indonesia untuk mode arti → kanji. */
  meaning?: string;
}

export interface TypingModeInfo {
  id: TypingMode;
  label: string;
  shortLabel: string;
  description: string;
  needsIme: boolean;
}

export const TYPING_MODES: TypingModeInfo[] = [
  {
    id: "kana-romaji",
    label: "Kana → Romaji",
    shortLabel: "Baca kana",
    description: "Lihat karakter kana, lalu ketik bacaan romajinya. Cocok untuk latihan membaca cepat.",
    needsIme: false,
  },
  {
    id: "romaji-kana",
    label: "Romaji → Kana",
    shortLabel: "Ketik kana",
    description: "Lihat romaji, lalu ketik kana yang tepat. Aktifkan IME Jepang di perangkatmu.",
    needsIme: true,
  },
  {
    id: "meaning-kanji",
    label: "Arti → Kanji",
    shortLabel: "Ketik kanji",
    description: "Lihat arti dan bacaan, lalu ketik kata Jepangnya. Membantu mengingat tulisan kanji.",
    needsIme: true,
  },
];

export const TYPING_MODE_LABELS: Record<TypingMode, string> = {
  "kana-romaji": "Kana → Romaji",
  "romaji-kana": "Romaji → Kana",
  "meaning-kanji": "Arti → Kanji",
};

const KANA_GROUP_ORDER: Record<string, number> = {
  basic: 0,
  dakuten: 1,
  handakuten: 2,
  yoon: 3,
};

const ROMAJI_ALIASES: Record<string, string> = {
  si: "shi",
  ti: "chi",
  tu: "tsu",
  hu: "fu",
  zi: "ji",
  di: "ji",
  du: "zu",
  sya: "sha",
  syu: "shu",
  syo: "sho",
  tya: "cha",
  tyu: "chu",
  tyo: "cho",
  zya: "ja",
  zyu: "ju",
  zyo: "jo",
  jya: "ja",
  jyu: "ju",
  jyo: "jo",
  wo: "o",
  nn: "n",
};

export function normalizeRomaji(value: string): string {
  const base = value
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[\s'’\-]/g, "");
  return ROMAJI_ALIASES[base] ?? base;
}

export function normalizeJapanese(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, "");
}

export function checkTypingAnswer(mode: TypingMode, input: string, answer: string): boolean {
  if (mode === "kana-romaji") return normalizeRomaji(input) === normalizeRomaji(answer);
  return normalizeJapanese(input) === normalizeJapanese(answer);
}

export function isImeMode(mode: TypingMode): boolean {
  return mode !== "kana-romaji";
}

function hasKanji(value: string): boolean {
  return /[\u3400-\u9fff々]/u.test(value);
}

function uniqueRomajiKana(script: Kana["script"]): Kana[] {
  const counts = new Map<string, number>();
  for (const item of ALL_KANA.filter((candidate) => candidate.script === script)) {
    const key = normalizeRomaji(item.romaji);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return ALL_KANA.filter((item) => {
    if (item.script !== script) return false;
    return (counts.get(normalizeRomaji(item.romaji)) ?? 0) === 1;
  });
}

function kanaPool(mode: TypingMode): Kana[] {
  if (mode === "kana-romaji") {
    return [...ALL_KANA].sort((a, b) => {
      if (a.script !== b.script) return a.script === "hiragana" ? -1 : 1;
      const groupDiff = (KANA_GROUP_ORDER[a.group] ?? 9) - (KANA_GROUP_ORDER[b.group] ?? 9);
      return groupDiff !== 0 ? groupDiff : a.row.localeCompare(b.row) || a.char.localeCompare(b.char);
    });
  }
  return [...uniqueRomajiKana("hiragana"), ...uniqueRomajiKana("katakana")];
}

function challengeFromKana(item: Kana, mode: TypingMode): TypingChallenge {
  const group = KANA_GROUP_LABELS[item.group] ?? item.group;
  const script = KANA_SCRIPT_LABELS[item.script];
  if (mode === "kana-romaji") {
    return {
      id: "typing-kana-romaji-" + item.id,
      mode,
      prompt: item.char,
      promptSubtitle: script + " · " + group,
      answer: item.romaji,
      hint: "Ketik bacaan romaji. Varian ejaan umum seperti si/shi juga diterima.",
      level: "N5",
      kana: item.char,
    };
  }
  return {
    id: "typing-romaji-kana-" + item.id,
    mode,
    prompt: item.romaji,
    promptSubtitle: script + " · " + group,
    answer: item.char,
    hint: "Aktifkan IME Jepang, lalu ketik " + script.toLowerCase() + " yang sesuai.",
    level: "N5",
    kana: item.char,
  };
}

function challengeFromVocab(word: (typeof VOCABULARY)[number]): TypingChallenge {
  return {
    id: "typing-meaning-kanji-" + word.id,
    mode: "meaning-kanji",
    prompt: word.meaning,
    promptSubtitle: word.kana + " · " + word.romaji + " · " + word.level,
    answer: word.japanese,
    hint: "Ketik kata Jepangnya menggunakan IME. Bacaan: " + word.kana,
    level: word.level,
    kana: word.kana,
    meaning: word.meaning,
  };
}

function shuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let state = seed >>> 0;
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swap = state % (index + 1);
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export interface TypingSessionOptions {
  mode: TypingMode;
  level?: JLPTLevel | "semua";
  count?: number;
  seed?: number;
}

export function buildTypingSession({
  mode,
  level = "semua",
  count = 10,
  seed = 1,
}: TypingSessionOptions): TypingChallenge[] {
  if (mode === "meaning-kanji") {
    const pool = VOCABULARY.filter(
      (word) => hasKanji(word.japanese) && (level === "semua" || word.level === level),
    );
    return shuffle(pool, seed)
      .slice(0, Math.min(count, pool.length))
      .map(challengeFromVocab);
  }

  const pool = kanaPool(mode);
  const filtered = level === "semua" || level === "N5" ? pool : [];
  return shuffle(filtered, seed)
    .slice(0, Math.min(count, filtered.length))
    .map((item) => challengeFromKana(item, mode));
}

export function typingAccuracy(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export function typingLabel(mode: TypingMode): string {
  return TYPING_MODE_LABELS[mode];
}
