import type {
  CultureCategory,
  CultureGroup,
  JLPTLevel,
  PartOfSpeech,
  Register,
  Settings,
  VocabTopic,
} from "./types";

export const APP_NAME = "Kotoba";
export const APP_NAME_JP = "言葉";
export const APP_TAGLINE = "Belajar bahasa Jepang, langkah demi langkah.";
export const APP_DESCRIPTION =
  "Kotoba adalah platform belajar bahasa Jepang interaktif berbahasa Indonesia: kana, kosakata, kanji, tata bahasa, membaca, menyimak, permainan, dan simulasi JLPT N5–N1.";

/**
 * Enam belas tujuan navigasi utama. Halaman materi (kana, kosakata, kanji, dan
 * seterusnya) diakses melalui hub Belajar agar navigasi utama tetap ringkas.
 */
export const NAV_GROUPS = [
  {
    label: "Belajar",
    items: [
      { href: "/", label: "Dasbor", icon: "home", exact: true },
      { href: "/learn", label: "Belajar", icon: "learn", hint: "Kurikulum terpandu" },
      { href: "/plan", label: "Rencana", icon: "target", hint: "Jadwal belajar pribadi" },
      { href: "/practice", label: "Latihan", icon: "practice", hint: "Kuis campuran" },
    ],
  },
  {
    label: "Latihan",
    items: [
      { href: "/games", label: "Permainan", icon: "games", hint: "Belajar sambil bermain" },
      { href: "/audio", label: "Audio", icon: "volume", hint: "Studio pelafalan" },
      { href: "/writing", label: "Menulis", icon: "writing", hint: "Urutan goresan & latihan" },
      { href: "/typing", label: "Mengetik", icon: "keyboard", hint: "Latihan papan ketik Jepang" },
      { href: "/conversation", label: "Percakapan", icon: "conversation", hint: "Simulasi dialog" },
      { href: "/stories", label: "Cerita", icon: "story", hint: "Teater cerita animasi" },
      { href: "/pronunciation", label: "Pelafalan", icon: "pronunciation", hint: "Latihan berbicara" },
      { href: "/exams", label: "Ujian", icon: "exam", hint: "Simulasi JLPT" },
    ],
  },
  {
    label: "Jelajahi",
    items: [
      { href: "/culture", label: "Budaya", icon: "culture", hint: "Jepang sehari-hari" },
      { href: "/dictionary", label: "Kamus", icon: "dictionary", hint: "Cari kosakata & kanji" },
      { href: "/progress", label: "Statistik", icon: "progress", hint: "Rekap belajar" },
      { href: "/settings", label: "Pengaturan", icon: "settings", hint: "Preferensi" },
    ],
  },
] as const;

export const MOBILE_NAV = [
  { href: "/", label: "Dasbor", icon: "home", exact: true },
  { href: "/learn", label: "Belajar", icon: "learn" },
  { href: "/practice", label: "Latihan", icon: "practice" },
  { href: "/dictionary", label: "Kamus", icon: "dictionary" },
  { href: "/progress", label: "Statistik", icon: "progress" },
] as const;

/** Judul header untuk halaman yang tidak lagi muncul langsung di navigasi utama. */
export const SECONDARY_ROUTES = [
  { href: "/kana", label: "Kana" },
  { href: "/vocabulary", label: "Kosakata" },
  { href: "/kanji", label: "Kanji" },
  { href: "/grammar", label: "Tata Bahasa" },
  { href: "/reading", label: "Membaca" },
  { href: "/listening", label: "Menyimak" },
] as const;

export function routeTitle(pathname: string): string {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/")) {
        return item.label;
      }
    }
  }
  for (const item of SECONDARY_ROUTES) {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) return item.label;
  }
  return "Belajar";
}

export const LEVEL_LABELS: Record<JLPTLevel, string> = {
  N5: "N5 · Pemula",
  N4: "N4 · Dasar",
  N3: "N3 · Menengah",
  N2: "N2 · Lanjutan",
  N1: "N1 · Mahir",
};

export const LEVEL_DESCRIPTIONS: Record<JLPTLevel, string> = {
  N5: "Memahami bahasa Jepang dasar: hiragana, katakana, kanji sederhana, dan percakapan sehari-hari.",
  N4: "Memahami percakapan sehari-hari dan teks dasar tentang topik yang familier.",
  N3: "Memahami bahasa Jepang yang digunakan dalam situasi sehari-hari dengan tingkat kesulitan menengah.",
  N2: "Memahami bahasa Jepang surat kabar, artikel, dan percakapan pada situasi yang lebih luas.",
  N1: "Memahami bahasa Jepang yang luas dan abstrak, termasuk teks akademik dan nuansa halus.",
};

export const LEVEL_META: Record<
  JLPTLevel,
  { passScore: number; vocabApprox: number; kanjiApprox: number; tone: string }
> = {
  N5: { passScore: 80, vocabApprox: 800, kanjiApprox: 100, tone: "matcha" },
  N4: { passScore: 90, vocabApprox: 1500, kanjiApprox: 300, tone: "indigo" },
  N3: { passScore: 95, vocabApprox: 3750, kanjiApprox: 650, tone: "gold" },
  N2: { passScore: 90, vocabApprox: 6000, kanjiApprox: 1000, tone: "brand" },
  N1: { passScore: 100, vocabApprox: 10000, kanjiApprox: 2000, tone: "ink" },
};

export const TOPIC_LABELS: Record<VocabTopic, string> = {
  salam: "Salam",
  perkenalan: "Perkenalan",
  angka: "Angka & Hitungan",
  waktu: "Waktu & Kalender",
  keluarga: "Keluarga",
  makanan: "Makanan",
  minuman: "Minuman",
  tempat: "Tempat",
  transportasi: "Transportasi",
  tubuh: "Tubuh & Kesehatan",
  warna: "Warna",
  cuaca: "Cuaca",
  alam: "Alam",
  sekolah: "Sekolah & Belajar",
  pekerjaan: "Pekerjaan",
  "kata-kerja": "Kata Kerja",
  "kata-sifat": "Kata Sifat",
  bisnis: "Bisnis & Kantor",
  teknologi: "Teknologi",
  emosi: "Emosi & Perasaan",
  anime: "Bahasa Gaul & Anime",
  kehidupan: "Kehidupan Sehari-hari",
};

export const POS_LABELS: Record<PartOfSpeech, string> = {
  nomina: "Nomina",
  verba: "Verba",
  "i-adjektiva": "Adjektiva -i",
  "na-adjektiva": "Adjektiva -na",
  adverbia: "Adverbia",
  partikel: "Partikel",
  ekspresi: "Ekspresi",
  konjungsi: "Konjungsi",
  bilangan: "Bilangan",
  klasifikator: "Klasifikator",
};

export const CULTURE_CATEGORY_LABELS: Record<CultureCategory, string> = {
  tradisi: "Tradisi & Festival",
  makanan: "Makanan & Minuman",
  geografi: "Geografi",
  etiket: "Etiket & Sopan Santun",
  kehidupan: "Kehidupan Sehari-hari",
  sejarah: "Sejarah",
  anime: "Bahasa Anime & Gaul",
  bahasa: "Fakta Bahasa",
};

export const CULTURE_CATEGORY_ICONS: Record<CultureCategory, string> = {
  tradisi: "sparkles",
  makanan: "coffee",
  geografi: "map",
  etiket: "star",
  kehidupan: "home",
  sejarah: "clock",
  anime: "torii",
  bahasa: "dictionary",
};

export const CULTURE_GROUP_ORDER: CultureGroup[] = [
  "budaya",
  "makanan",
  "geografi",
  "sejarah",
  "anime",
  "bahasa",
];

export const CULTURE_GROUP_LABELS: Record<CultureGroup, string> = {
  budaya: "Budaya & Tradisi",
  makanan: "Makanan",
  geografi: "Geografi",
  sejarah: "Sejarah",
  anime: "Anime & Hiburan",
  bahasa: "Fakta Bahasa",
};

export const CULTURE_GROUP_ICONS: Record<CultureGroup, string> = {
  budaya: "culture",
  makanan: "coffee",
  geografi: "map",
  sejarah: "clock",
  anime: "torii",
  bahasa: "dictionary",
};

export const CULTURE_GROUP_BY_CATEGORY: Record<CultureCategory, CultureGroup> = {
  tradisi: "budaya",
  etiket: "budaya",
  kehidupan: "budaya",
  makanan: "makanan",
  geografi: "geografi",
  sejarah: "sejarah",
  anime: "anime",
  bahasa: "bahasa",
};

export const REGISTER_LABELS: Record<Register, { label: string; description: string; tone: string }> = {
  standar: {
    label: "Standar",
    description: "Aman digunakan dalam hampir semua situasi, termasuk orang yang baru dikenal.",
    tone: "matcha",
  },
  formal: {
    label: "Formal",
    description: "Dipakai dalam situasi resmi, dokumen, atau kepada pihak yang perlu dihormati.",
    tone: "indigo",
  },
  kasual: {
    label: "Kasual",
    description: "Dipakai dengan teman, keluarga, atau orang yang sudah dekat.",
    tone: "indigo",
  },
  slang: {
    label: "Slang",
    description: "Bahasa gaul percakapan; hindari dalam situasi formal.",
    tone: "gold",
  },
  arkais: {
    label: "Arkais",
    description: "Bentuk kuno atau klasik dari sastra dan sejarah; bukan percakapan harian.",
    tone: "anime",
  },
  anime: {
    label: "Khas Anime (stilistis)",
    description: "Ekspresi dramatis atau karakteristik anime. Tidak selalu wajar dalam percakapan nyata.",
    tone: "brand",
  },
};

export const DEFAULT_SETTINGS: Settings = {
  dailyGoalXp: 50,
  dailyStudyMinutes: 30,
  dailyVocabTarget: 10,
  dailyLessonTarget: 1,
  weeklyFrequency: 5,
  studyTargetLevel: null,
  studyTargetWeeks: 12,
  theme: "system",
  showRomaji: true,
  showFurigana: true,
  speechRate: 0.9,
  voiceURI: null,
  autoPlayAudio: false,
};

export const DAILY_GOAL_OPTIONS = [20, 50, 100, 150, 200];
export const DAILY_STUDY_MINUTE_OPTIONS = [15, 30, 45, 60, 90];
export const DAILY_VOCAB_TARGET_OPTIONS = [5, 10, 20, 30, 50];
export const DAILY_LESSON_TARGET_OPTIONS = [1, 2, 3, 4];
export const WEEKLY_FREQUENCY_OPTIONS = [3, 5, 7];
export const STUDY_TARGET_WEEK_OPTIONS = [8, 12, 16, 24, 36];

/** Skor minimum latihan sebelum pelajaran interaktif dapat diselesaikan. */
export const LESSON_PASS_SCORE = 60;

export const XP_RULES = {
  reviewCorrect: 10,
  reviewWrong: 3,
  lesson: {
    grammar: 30,
    reading: 25,
    listening: 20,
    culture: 15,
    vocabulary: 20,
    kanji: 25,
    sentence: 15,
    pronunciation: 10,
    "kana-set": 20,
    game: 10,
    typing: 20,
    conversation: 20,
    writing: 15,
    story: 25,
  } as Record<string, number>,
  practiceCorrect: 8,
  practiceWrong: 2,
  quizBase: 10,
  quizBonusMax: 20,
  examBase: 40,
  examBonusMax: 60,
  gameCorrect: 5,
} as const;

export const PAGE_SIZE = 24;

export const LEVEL_TONE: Record<JLPTLevel, { bg: string; text: string; ring: string; bar: string }> = {
  N5: { bg: "bg-matcha-soft", text: "text-matcha", ring: "ring-matcha/25", bar: "bg-matcha" },
  N4: { bg: "bg-indigo-soft", text: "text-indigo-ink", ring: "ring-indigo-ink/20", bar: "bg-indigo-ink" },
  N3: { bg: "bg-gold-soft", text: "text-gold", ring: "ring-gold/25", bar: "bg-gold" },
  N2: { bg: "bg-brand-soft", text: "text-brand", ring: "ring-brand/20", bar: "bg-brand" },
  N1: { bg: "bg-surface-2", text: "text-ink", ring: "ring-ink/15", bar: "bg-ink" },
};