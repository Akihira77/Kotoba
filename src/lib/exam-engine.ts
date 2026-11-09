import { GRAMMAR, GRAMMAR_BY_ID } from "@/content/grammar";
import { KANJI, KANJI_BY_ID } from "@/content/kanji";
import { LISTENING, LISTENING_BY_ID } from "@/content/listening";
import { LISTENING_DRILLS } from "@/content/listening-drills";
import { READING, READING_BY_ID } from "@/content/reading";
import { VOCABULARY, VOCAB_BY_ID } from "@/content/vocabulary";
import { LEVEL_LABELS, TOPIC_LABELS } from "@/lib/constants";
import { kanjiQuestion, vocabQuestion } from "@/lib/quiz";
import type {
  ExamAnswerReview,
  ExamPayload,
  ExamSectionResult,
  ItemKind,
  JLPTLevel,
  Kanji,
  QuizQuestion,
  VocabTopic,
  VocabWord,
} from "@/lib/types";
import { JLPT_LEVELS } from "@/lib/types";
import { shuffle } from "@/lib/utils";

/** Empat bentuk ujian yang dipakai oleh halaman ujian. */
export type ExamMode = "practice" | "mock" | "topic" | "random";

export type ExamCategory = "vocabulary" | "kanji" | "grammar" | "reading" | "listening";

export type ExamFocus =
  | { kind: "vocabulary"; topic: VocabTopic }
  | { kind: "grammar"; grammarId: string };

export interface ExamModeMeta {
  label: string;
  labelJp: string;
  description: string;
  timed: boolean;
  immediateFeedback: boolean;
}

export const EXAM_MODE_META: Record<ExamMode, ExamModeMeta> = {
  practice: {
    label: "Latihan",
    labelJp: "練習",
    description: "Tanpa batas waktu. Periksa jawaban satu per satu dan baca pembahasan langsung.",
    timed: false,
    immediateFeedback: true,
  },
  mock: {
    label: "Simulasi",
    labelJp: "模擬試験",
    description: "Timer berjalan, tiga bagian berurutan, jawaban dikumpulkan di akhir.",
    timed: true,
    immediateFeedback: false,
  },
  topic: {
    label: "Topik",
    labelJp: "分野別",
    description: "Fokus pada satu topik kosakata atau satu pola tata bahasa.",
    timed: false,
    immediateFeedback: true,
  },
  random: {
    label: "Acak",
    labelJp: "ランダム",
    description: "Soal seimbang dari semua kategori dengan timer dan pembahasan di akhir.",
    timed: true,
    immediateFeedback: false,
  },
};

export const EXAM_CATEGORY_ORDER: ExamCategory[] = ["vocabulary", "kanji", "grammar", "reading", "listening"];

export const EXAM_CATEGORY_META: Record<ExamCategory, { label: string; labelJp: string }> = {
  vocabulary: { label: "Kosakata", labelJp: "語彙" },
  kanji: { label: "Kanji", labelJp: "漢字" },
  grammar: { label: "Tata bahasa", labelJp: "文法" },
  reading: { label: "Pemahaman bacaan", labelJp: "読解" },
  listening: { label: "Pemahaman mendengar", labelJp: "聴解" },
};

/** Target ini adalah target belajar Kotoba, bukan ambang resmi JLPT. */
export const EXAM_LEARNING_TARGET = 70;

/** Satu soal ujian beserta konteks yang dibutuhkan saat pengerjaan dan review. */
export interface ExamContextPassage {
  id: string;
  title: string;
  titleJp: string;
  text: string;
  translation: string[];
}

export interface ExamQuestion {
  id: string;
  question: QuizQuestion;
  category: ExamCategory;
  categoryLabel: string;
  sectionId: string;
  sectionLabel: string;
  /** Bacaan lengkap untuk soal dokkai. */
  passage?: ExamContextPassage;
  /** Transkrip lengkap untuk soal choukai; hanya ditampilkan setelah dinilai. */
  transcript?: string;
  /** Terjemahan dialog/drill bila tersedia. */
  translation?: string;
  /** Item yang dapat ditambahkan ke kartu ulangan. */
  itemKind?: ItemKind;
  itemId?: string;
  sourceKind?: "vocabulary" | "kanji" | "grammar" | "reading" | "listening" | "listening-drill";
  sourceId?: string;
}

export interface ExamSection {
  id: string;
  label: string;
  labelJp: string;
  questions: ExamQuestion[];
}

export interface ExamPaper {
  id: string;
  mode: ExamMode;
  level: JLPTLevel;
  title: string;
  titleJp: string;
  description: string;
  minutes: number;
  timed: boolean;
  immediateFeedback: boolean;
  targetScore: number;
  createdAt: string;
  questionCount: number;
  /** True bila sebagian soal berasal dari level lain karena stok level ini terbatas. */
  mixedLevels: boolean;
  focus?: ExamFocus;
  sections: ExamSection[];
}

export interface ExamCategoryStat {
  category: ExamCategory;
  label: string;
  correct: number;
  total: number;
  score: number;
}

export interface ExamRecommendation {
  id: string;
  title: string;
  description: string;
  href: string;
  category: ExamCategory;
}

export interface ExamResult {
  id: string;
  paper: ExamPaper;
  answers: Record<string, number>;
  startedAt: string;
  finishedAt: string;
  durationSec: number;
  score: number;
  targetScore: number;
  targetMet: boolean;
  correct: number;
  answered: number;
  unanswered: number;
  totalQuestions: number;
  accuracy: number;
  sections: ExamSectionResult[];
  categoryStats: ExamCategoryStat[];
  weakAreas: ExamCategoryStat[];
  recommendations: ExamRecommendation[];
}

interface BuildOptions {
  /** Jumlah soal untuk mode latihan/topik. */
  count?: number;
  category?: ExamCategory | "campuran";
  rng?: () => number;
}

const ALL_LEVELS = JLPT_LEVELS;

const MOCK_COUNTS: Record<JLPTLevel, { vocabulary: number; kanji: number; grammar: number; reading: number; listening: number; minutes: number }> = {
  N5: { vocabulary: 8, kanji: 6, grammar: 6, reading: 3, listening: 6, minutes: 25 },
  N4: { vocabulary: 9, kanji: 6, grammar: 7, reading: 4, listening: 6, minutes: 30 },
  N3: { vocabulary: 10, kanji: 6, grammar: 8, reading: 5, listening: 7, minutes: 40 },
  N2: { vocabulary: 10, kanji: 7, grammar: 8, reading: 6, listening: 8, minutes: 50 },
  N1: { vocabulary: 10, kanji: 8, grammar: 9, reading: 6, listening: 8, minutes: 60 },
};

const RANDOM_COUNTS: Record<JLPTLevel, { vocabulary: number; kanji: number; grammar: number; reading: number; listening: number; minutes: number }> = {
  N5: { vocabulary: 6, kanji: 4, grammar: 4, reading: 3, listening: 3, minutes: 20 },
  N4: { vocabulary: 6, kanji: 4, grammar: 4, reading: 3, listening: 3, minutes: 22 },
  N3: { vocabulary: 6, kanji: 4, grammar: 4, reading: 3, listening: 3, minutes: 25 },
  N2: { vocabulary: 6, kanji: 4, grammar: 4, reading: 3, listening: 3, minutes: 30 },
  N1: { vocabulary: 6, kanji: 4, grammar: 4, reading: 3, listening: 3, minutes: 35 },
};

function createId(prefix: string): string {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
}

/** Level pertama diacak lebih dulu, lalu level lain sebagai cadangan. */
function levelFirstShuffled<T extends { level: JLPTLevel }>(items: readonly T[], level: JLPTLevel, rng: () => number): T[] {
  return [
    ...shuffle(items.filter((item) => item.level === level), rng),
    ...shuffle(items.filter((item) => item.level !== level), rng),
  ];
}

function uniqueOptions(correct: string, options: readonly string[], fallbacks: readonly string[], rng: () => number): string[] {
  const distractors = [...new Set([...options, ...fallbacks])].filter((option) => Boolean(option) && option !== correct);
  const picked = shuffle(distractors, rng).slice(0, Math.max(1, 3));
  return shuffle([correct, ...picked], rng);
}

function ensureFourOptions(question: QuizQuestion, fallbacks: readonly string[], rng: () => number): QuizQuestion {
  const correct = question.options[question.answerIndex];
  if (!correct) return question;
  const options = uniqueOptions(correct, question.options, fallbacks, rng);
  if (options.length < 2) return question;
  return { ...question, options, answerIndex: options.indexOf(correct) };
}

function vocabEntry(word: VocabWord, mode: "meaning" | "japanese", rng: () => number): ExamQuestion {
  const sameLevel = VOCABULARY.filter((item) => item.level === word.level);
  const pool = sameLevel.length >= 4 ? sameLevel : VOCABULARY;
  const fallbacks = mode === "meaning" ? VOCABULARY.map((item) => item.meaning) : VOCABULARY.map((item) => item.japanese);
  const question = ensureFourOptions(vocabQuestion(word, pool, mode), fallbacks, rng);
  return {
    id: question.id,
    question,
    category: "vocabulary",
    categoryLabel: EXAM_CATEGORY_META.vocabulary.label,
    sectionId: "latihan",
    sectionLabel: "Latihan",
    itemKind: "vocab",
    itemId: word.id,
    sourceKind: "vocabulary",
    sourceId: word.id,
  };
}

function kanjiEntry(item: Kanji, mode: "meaning" | "reading", rng: () => number): ExamQuestion {
  const sameLevel = KANJI.filter((entry) => entry.level === item.level);
  const pool = sameLevel.length >= 4 ? sameLevel : KANJI;
  const fallbacks =
    mode === "meaning"
      ? KANJI.map((entry) => entry.meanings.join(", "))
      : KANJI.flatMap((entry) => entry.examples.map((example) => example.reading));
  const question = ensureFourOptions(kanjiQuestion(item, pool, mode), fallbacks, rng);
  return {
    id: question.id,
    question,
    category: "kanji",
    categoryLabel: EXAM_CATEGORY_META.kanji.label,
    sectionId: "latihan",
    sectionLabel: "Latihan",
    itemKind: "kanji",
    itemId: item.id,
    sourceKind: "kanji",
    sourceId: item.id,
  };
}

function grammarEntry(pointId: string, question: QuizQuestion, rng: () => number): ExamQuestion {
  const fallbacks = GRAMMAR.flatMap((point) => point.practice)
    .map((item) => item.options[item.answerIndex])
    .filter(Boolean);
  const safe = ensureFourOptions(question, fallbacks, rng);
  return {
    id: safe.id,
    question: safe,
    category: "grammar",
    categoryLabel: EXAM_CATEGORY_META.grammar.label,
    sectionId: "latihan",
    sectionLabel: "Latihan",
    sourceKind: "grammar",
    sourceId: pointId,
  };
}

function readingEntry(
  passageId: string,
  passageTitle: string,
  passageTitleJp: string,
  passageText: string,
  translation: string[],
  question: QuizQuestion,
  rng: () => number,
): ExamQuestion {
  const fallbacks = READING.flatMap((passage) => passage.questions)
    .map((item) => item.options[item.answerIndex])
    .filter(Boolean);
  const safe = ensureFourOptions({ ...question, sourceId: question.sourceId ?? passageId }, fallbacks, rng);
  return {
    id: safe.id,
    question: safe,
    category: "reading",
    categoryLabel: EXAM_CATEGORY_META.reading.label,
    sectionId: "latihan",
    sectionLabel: "Latihan",
    passage: {
      id: passageId,
      title: passageTitle,
      titleJp: passageTitleJp,
      text: passageText,
      translation,
    },
    sourceKind: "reading",
    sourceId: passageId,
  };
}

function listeningDialogEntries(
  item: (typeof LISTENING)[number],
  rng: () => number,
): ExamQuestion[] {
  const audio = item.lines.map((line) => line.jp).join(" ");
  const transcript = item.lines
    .map((line) => line.speaker + ": " + line.jp + "（" + line.reading + "）")
    .join("\n");
  const fallbacks = LISTENING.flatMap((entry) => entry.questions)
    .map((entry) => entry.options[entry.answerIndex])
    .filter(Boolean);
  return item.questions.map((question) => {
    const withAudio = ensureFourOptions({ ...question, audioText: audio }, fallbacks, rng);
    return {
      id: withAudio.id,
      question: withAudio,
      category: "listening" as const,
      categoryLabel: EXAM_CATEGORY_META.listening.label,
      sectionId: "latihan",
      sectionLabel: "Latihan",
      transcript,
      sourceKind: "listening" as const,
      sourceId: item.id,
    };
  });
}

function listeningDrillEntries(
  drill: (typeof LISTENING_DRILLS)[number],
  rng: () => number,
): ExamQuestion[] {
  const question: QuizQuestion = {
    id: "drill-" + drill.id,
    type: "listening",
    level: drill.level,
    prompt: drill.prompt,
    options: drill.options,
    answerIndex: drill.answerIndex,
    explanation: drill.explanation + " Terjemahan: " + drill.translation,
    audioText: drill.audioText,
    sourceId: drill.id,
    section: "choukai",
  };
  const fallbacks = LISTENING_DRILLS.map((entry) => entry.options[entry.answerIndex]).filter(Boolean);
  const safe = ensureFourOptions(question, fallbacks, rng);
  return [
    {
      id: safe.id,
      question: safe,
      category: "listening" as const,
      categoryLabel: EXAM_CATEGORY_META.listening.label,
      sectionId: "latihan",
      sectionLabel: "Latihan",
      transcript: drill.audioText + "\n\n" + drill.reading,
      translation: drill.translation,
      sourceKind: "listening-drill" as const,
      sourceId: drill.id,
    },
  ];
}

function vocabularyPool(level: JLPTLevel, rng: () => number): ExamQuestion[] {
  return levelFirstShuffled(VOCABULARY, level, rng).map((word, index) =>
    vocabEntry(word, index % 2 === 0 ? "meaning" : "japanese", rng),
  );
}

function kanjiPool(level: JLPTLevel, rng: () => number): ExamQuestion[] {
  return levelFirstShuffled(KANJI, level, rng).map((item, index) =>
    kanjiEntry(item, index % 2 === 0 ? "meaning" : "reading", rng),
  );
}

function grammarPool(level: JLPTLevel, rng: () => number): ExamQuestion[] {
  return levelFirstShuffled(GRAMMAR, level, rng).flatMap((point) =>
    point.practice.map((question) => grammarEntry(point.id, question, rng)),
  );
}

function readingPool(level: JLPTLevel, rng: () => number): ExamQuestion[] {
  return levelFirstShuffled(READING, level, rng).flatMap((passage) =>
    passage.questions.map((question) =>
      readingEntry(passage.id, passage.title, passage.titleJp, passage.text, passage.translation, question, rng),
    ),
  );
}

function listeningPool(level: JLPTLevel, rng: () => number): ExamQuestion[] {
  const dialogs = levelFirstShuffled(LISTENING, level, rng).flatMap((item) => listeningDialogEntries(item, rng));
  const drills = levelFirstShuffled(LISTENING_DRILLS, level, rng).flatMap((drill) => listeningDrillEntries(drill, rng));
  const all = [...dialogs, ...drills];
  return [
    ...shuffle(all.filter((item) => item.question.level === level), rng),
    ...shuffle(all.filter((item) => item.question.level !== level), rng),
  ];
}

function categoryPool(category: ExamCategory, level: JLPTLevel, rng: () => number): ExamQuestion[] {
  switch (category) {
    case "vocabulary":
      return vocabularyPool(level, rng);
    case "kanji":
      return kanjiPool(level, rng);
    case "grammar":
      return grammarPool(level, rng);
    case "reading":
      return readingPool(level, rng);
    case "listening":
      return listeningPool(level, rng);
  }
}

function takeQuestions(pool: readonly ExamQuestion[], count: number, seen: Set<string>): ExamQuestion[] {
  const result: ExamQuestion[] = [];
  for (const item of pool) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
    if (result.length >= count) break;
  }
  return result;
}

function makeSection(
  id: string,
  label: string,
  labelJp: string,
  questions: ExamQuestion[],
): ExamSection {
  return {
    id,
    label,
    labelJp,
    questions: questions.map((item) => ({ ...item, sectionId: id, sectionLabel: label })),
  };
}

function paperBase(
  mode: ExamMode,
  level: JLPTLevel,
  title: string,
  titleJp: string,
  description: string,
  minutes: number,
  sections: ExamSection[],
  rng: () => number,
  immediateFeedback: boolean,
  timed: boolean,
): ExamPaper {
  const nonEmpty = sections.filter((section) => section.questions.length > 0);
  const all = nonEmpty.flatMap((section) => section.questions);
  return {
    id: createId("paper"),
    mode,
    level,
    title,
    titleJp,
    description,
    minutes,
    timed,
    immediateFeedback,
    targetScore: EXAM_LEARNING_TARGET,
    createdAt: new Date().toISOString(),
    questionCount: all.length,
    mixedLevels: all.some((item) => item.question.level !== level),
    sections: nonEmpty,
  };
}

/** Simulasi tiga bagian dengan komposisi per level dan durasi level-appropriate. */
export function buildMockExam(level: JLPTLevel, rng: () => number = Math.random): ExamPaper {
  const plan = MOCK_COUNTS[level];
  const seen = new Set<string>();
  const vocabulary = takeQuestions(vocabularyPool(level, rng), plan.vocabulary, seen);
  const kanji = takeQuestions(kanjiPool(level, rng), plan.kanji, seen);
  const grammar = takeQuestions(grammarPool(level, rng), plan.grammar, seen);
  const reading = takeQuestions(readingPool(level, rng), plan.reading, seen);
  const listening = takeQuestions(listeningPool(level, rng), plan.listening, seen);

  return paperBase(
    "mock",
    level,
    "Simulasi " + level,
    "模擬試験",
    "Tiga bagian bergaya JLPT dengan timer. Pembahasan muncul setelah jawaban dikumpulkan.",
    plan.minutes,
    [
      makeSection("moji-goi", "Moji & Goi", "文字・語彙", [...vocabulary, ...kanji]),
      makeSection("bunpou-dokkai", "Bunpou & Dokkai", "文法・読解", [...grammar, ...reading]),
      makeSection("choukai", "Choukai", "聴解", listening),
    ],
    rng,
    false,
    true,
  );
}

/** Latihan tanpa timer: satu kategori, atau campuran lima kategori. */
export function buildPracticeExam(level: JLPTLevel, options: BuildOptions = {}): ExamPaper {
  const rng = options.rng ?? Math.random;
  const count = Math.max(4, Math.min(30, options.count ?? 10));
  const category = options.category ?? "campuran";
  const seen = new Set<string>();
  let questions: ExamQuestion[] = [];

  if (category === "campuran") {
    const categories = shuffle(EXAM_CATEGORY_ORDER, rng);
    const base = Math.floor(count / categories.length);
    const remainder = count % categories.length;
    for (let index = 0; index < categories.length; index += 1) {
      const wanted = base + (index < remainder ? 1 : 0);
      questions = questions.concat(takeQuestions(categoryPool(categories[index], level, rng), wanted, seen));
    }
    if (questions.length < count) {
      for (const itemCategory of EXAM_CATEGORY_ORDER) {
        if (questions.length >= count) break;
        questions = questions.concat(takeQuestions(categoryPool(itemCategory, level, rng), count - questions.length, seen));
      }
    }
  } else {
    questions = takeQuestions(categoryPool(category, level, rng), count, seen);
  }

  const label = category === "campuran" ? "Latihan campuran" : EXAM_CATEGORY_META[category].label;
  return paperBase(
    "practice",
    level,
    "Latihan " + level + " · " + label,
    "練習",
    "Periksa jawaban satu per satu. Penjelasan langsung muncul setelah jawaban diperiksa.",
    0,
    [makeSection("latihan", label, category === "campuran" ? "総合練習" : EXAM_CATEGORY_META[category].labelJp, questions)],
    rng,
    true,
    false,
  );
}

/** Ujian acak seimbang dengan timer dan pembahasan di akhir. */
export function buildRandomExam(level: JLPTLevel, rng: () => number = Math.random): ExamPaper {
  const plan = RANDOM_COUNTS[level];
  const seen = new Set<string>();
  const vocabulary = takeQuestions(vocabularyPool(level, rng), plan.vocabulary, seen);
  const kanji = takeQuestions(kanjiPool(level, rng), plan.kanji, seen);
  const grammar = takeQuestions(grammarPool(level, rng), plan.grammar, seen);
  const reading = takeQuestions(readingPool(level, rng), plan.reading, seen);
  const listening = takeQuestions(listeningPool(level, rng), plan.listening, seen);

  return paperBase(
    "random",
    level,
    "Ujian acak " + level,
    "ランダム試験",
    "Soal seimbang dari lima kategori. Hasil dan pembahasan muncul setelah dikumpulkan.",
    plan.minutes,
    [
      makeSection("moji-goi", "Moji & Goi", "文字・語彙", [...vocabulary, ...kanji]),
      makeSection("bunpou-dokkai", "Bunpou & Dokkai", "文法・読解", [...grammar, ...reading]),
      makeSection("choukai", "Choukai", "聴解", listening),
    ],
    rng,
    false,
    true,
  );
}

/** Ujian topik kosakata atau satu pola tata bahasa. */
export function buildTopicExam(level: JLPTLevel, focus: ExamFocus, options: BuildOptions = {}): ExamPaper {
  const rng = options.rng ?? Math.random;
  const count = Math.max(1, Math.min(20, options.count ?? 10));
  if (focus.kind === "vocabulary") {
    const words = levelFirstShuffled(VOCABULARY.filter((word) => word.topic === focus.topic), level, rng).slice(0, count);
    if (words.length === 0) throw new Error("Topik kosakata ini belum memiliki soal pada level tersebut.");
    const questions = words.map((word, index) => vocabEntry(word, index % 2 === 0 ? "meaning" : "japanese", rng));
    const label = "Kosakata · " + TOPIC_LABELS[focus.topic];
    return paperBase(
      "topic",
      level,
      "Topik " + level + " · " + TOPIC_LABELS[focus.topic],
      "分野別",
      "Latihan terfokus pada kosakata topik " + TOPIC_LABELS[focus.topic] + ".",
      0,
      [makeSection("topik", label, "語彙", questions)],
      rng,
      true,
      false,
    );
  }

  const point = GRAMMAR_BY_ID.get(focus.grammarId);
  if (!point) throw new Error("Pola tata bahasa tidak ditemukan.");
  const questions = point.practice.slice(0, count).map((question) => grammarEntry(point.id, question, rng));
  if (questions.length === 0) throw new Error("Pola tata bahasa ini belum memiliki soal.");
  const label = "Tata bahasa · " + point.pattern;
  return paperBase(
    "topic",
    level,
    "Topik " + level + " · " + point.pattern,
    "分野別",
    "Latihan terfokus pada pola " + point.pattern + " (" + point.meaning + ").",
    0,
    [makeSection("topik", label, "文法", questions)],
    rng,
    true,
    false,
  );
}

/** Membuat ujian ulang hanya dari soal yang salah atau belum dijawab. */
export function buildRetryPaper(result: ExamResult): ExamPaper | null {
  const wrongIds = new Set<string>();
  for (const item of result.paper.sections.flatMap((section) => section.questions)) {
    if (result.answers[item.id] !== item.question.answerIndex) wrongIds.add(item.id);
  }
  if (wrongIds.size === 0) return null;
  const sections = result.paper.sections
    .map((section) => ({ ...section, questions: section.questions.filter((item) => wrongIds.has(item.id)) }))
    .filter((section) => section.questions.length > 0);
  const paper: ExamPaper = {
    ...result.paper,
    id: createId("paper"),
    mode: "practice",
    title: "Ulangi soal salah · " + result.paper.level,
    titleJp: "復習",
    description: "Kerjakan kembali soal yang salah atau belum dijawab. Pembahasan tetap tersedia.",
    minutes: 0,
    timed: false,
    immediateFeedback: true,
    targetScore: EXAM_LEARNING_TARGET,
    createdAt: new Date().toISOString(),
    questionCount: sections.reduce((sum, section) => sum + section.questions.length, 0),
    sections,
  };
  return paper;
}

/** Nilai kertas ujian tanpa menyentuh jaringan atau penyimpanan. */
export function gradeExam(
  paper: ExamPaper,
  answers: Record<string, number>,
  startedAt: string,
  finishedAt: string = new Date().toISOString(),
  durationSec?: number,
): ExamResult {
  const all = paper.sections.flatMap((section) => section.questions);
  const safeAnswers: Record<string, number> = {};
  for (const [key, value] of Object.entries(answers)) {
    if (Number.isInteger(value)) safeAnswers[key] = value;
  }
  const graded = all.map((item) => {
    const selected = safeAnswers[item.id];
    return {
      item,
      selected: selected ?? null,
      correct: selected === item.question.answerIndex,
    };
  });
  const correct = graded.filter((entry) => entry.correct).length;
  const answered = graded.filter((entry) => entry.selected !== null).length;
  const totalQuestions = graded.length;
  const score = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  const sections: ExamSectionResult[] = paper.sections.map((section) => {
    const total = section.questions.length;
    const sectionCorrect = graded.filter((entry) => entry.item.sectionId === section.id && entry.correct).length;
    return {
      id: section.id,
      label: section.label,
      correct: sectionCorrect,
      total,
      score: total > 0 ? Math.round((sectionCorrect / total) * 100) : 0,
      points: total,
    };
  });

  const categoryStats: ExamCategoryStat[] = EXAM_CATEGORY_ORDER.map((category) => {
    const entries = graded.filter((entry) => entry.item.category === category);
    const total = entries.length;
    const categoryCorrect = entries.filter((entry) => entry.correct).length;
    return {
      category,
      label: EXAM_CATEGORY_META[category].label,
      correct: categoryCorrect,
      total,
      score: total > 0 ? Math.round((categoryCorrect / total) * 100) : 0,
    };
  }).filter((stat) => stat.total > 0);

  const weakAreas = categoryStats.filter((stat) => stat.total > 0 && stat.score < EXAM_LEARNING_TARGET);
  const started = new Date(startedAt).getTime();
  const finished = new Date(finishedAt).getTime();
  const computedDuration =
    durationSec ??
    (Number.isFinite(started) && Number.isFinite(finished) ? Math.max(1, Math.round((finished - started) / 1000)) : 0);
  const targetMet = score >= paper.targetScore;

  return {
    id: createId("result"),
    paper,
    answers: safeAnswers,
    startedAt,
    finishedAt,
    durationSec: computedDuration,
    score,
    targetScore: paper.targetScore,
    targetMet,
    correct,
    answered,
    unanswered: totalQuestions - answered,
    totalQuestions,
    accuracy,
    sections,
    categoryStats,
    weakAreas,
    recommendations: buildRecommendations(paper, graded),
  };
}

interface GradedEntry {
  item: ExamQuestion;
  selected: number | null;
  correct: boolean;
}

function buildRecommendations(paper: ExamPaper, graded: readonly GradedEntry[]): ExamRecommendation[] {
  const recommendations: ExamRecommendation[] = [];
  const seen = new Set<string>();
  const add = (recommendation: ExamRecommendation) => {
    if (seen.has(recommendation.href)) return;
    seen.add(recommendation.href);
    recommendations.push(recommendation);
  };

  for (const entry of graded) {
    if (entry.correct) continue;
    const item = entry.item;
    const sourceId = item.sourceId;
    if (!sourceId) continue;

    if (item.sourceKind === "grammar") {
      const point = GRAMMAR_BY_ID.get(sourceId);
      add({
        id: "rec-grammar-" + sourceId,
        title: point ? "Ulangi pola " + point.pattern : "Ulangi tata bahasa",
        description: point ? point.meaning + ". Baca formasi, contoh, lalu kerjakan latihan pendek." : "Buka materi tata bahasa terkait.",
        href: "/grammar/" + sourceId,
        category: "grammar",
      });
    } else if (item.sourceKind === "reading") {
      const passage = READING_BY_ID.get(sourceId);
      add({
        id: "rec-reading-" + sourceId,
        title: passage ? "Baca ulang " + passage.title : "Baca ulang teks",
        description: "Baca teks lengkap, nyalakan furigana, lalu jawab pertanyaan tanpa melihat terjemahan.",
        href: "/reading/" + sourceId,
        category: "reading",
      });
    } else if (item.sourceKind === "listening") {
      const dialog = LISTENING_BY_ID.get(sourceId);
      add({
        id: "rec-listening-" + sourceId,
        title: dialog ? "Simak ulang " + dialog.title : "Simak ulang dialog",
        description: "Dengarkan dialog lengkap, baca frasa kunci, lalu coba lagi pertanyaannya.",
        href: "/listening/" + sourceId,
        category: "listening",
      });
    } else if (item.sourceKind === "listening-drill") {
      add({
        id: "rec-listening-drill",
        title: "Latihan menyimak kilat",
        description: "Tambah latihan audio pendek N5–N1 untuk melatih detail, maksud, dan nuansa.",
        href: "/listening/practice",
        category: "listening",
      });
    } else if (item.sourceKind === "vocabulary") {
      const word = VOCAB_BY_ID.get(sourceId);
      add({
        id: "rec-vocab-" + sourceId,
        title: word ? "Ulangi " + word.japanese : "Ulangi kosakata",
        description: word ? word.kana + " · " + word.meaning + ". Tambahkan ke kartu ulangan bila masih sulit." : "Buka daftar kosakata level ini.",
        href: "/vocabulary?level=" + paper.level,
        category: "vocabulary",
      });
    } else if (item.sourceKind === "kanji") {
      const kanji = KANJI_BY_ID.get(sourceId);
      add({
        id: "rec-kanji-" + sourceId,
        title: kanji ? "Ulangi kanji " + kanji.char : "Ulangi kanji",
        description: "Periksa arti, on'yomi, kun'yomi, dan contoh kata. Ulangi dengan kartu kanji.",
        href: "/kanji",
        category: "kanji",
      });
    }
    if (recommendations.length >= 6) break;
  }

  if (recommendations.length === 0) {
    add({
      id: "rec-practice",
      title: "Lanjutkan latihan campuran",
      description: "Pertahankan ritme dengan kuis pendek lintas kategori.",
      href: "/practice",
      category: "vocabulary",
    });
  }
  return recommendations;
}

/** Bentuk payload yang diterima API progres. */
export function toExamPayload(result: ExamResult): ExamPayload {
  const review: ExamAnswerReview[] = result.paper.sections.flatMap((section) =>
    section.questions.map((item) => ({
      questionId: item.id,
      prompt: item.question.prompt,
      selectedIndex: result.answers[item.id] ?? null,
      answerIndex: item.question.answerIndex,
      correct: result.answers[item.id] === item.question.answerIndex,
      explanation: item.question.explanation,
    })),
  );
  return {
    level: result.paper.level,
    score: result.score,
    total: 100,
    passed: result.targetMet,
    sections: result.sections,
    correct: result.correct,
    answered: result.answered,
    totalQuestions: result.totalQuestions,
    durationSec: result.durationSec,
    startedAt: result.startedAt,
    review,
  };
}

export function examCategoryLabel(category: ExamCategory): string {
  return EXAM_CATEGORY_META[category].label;
}

export function examLevelLabel(level: JLPTLevel): string {
  return LEVEL_LABELS[level];
}

export function availableVocabularyTopics(level: JLPTLevel): Array<{ topic: VocabTopic; label: string; count: number }> {
  const counts = new Map<VocabTopic, number>();
  for (const word of VOCABULARY) {
    if (word.level !== level) continue;
    counts.set(word.topic, (counts.get(word.topic) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([topic, count]) => ({ topic, label: TOPIC_LABELS[topic], count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function availableGrammarPoints(level: JLPTLevel): Array<{ id: string; pattern: string; meaning: string; count: number }> {
  return GRAMMAR.filter((point) => point.level === level).map((point) => ({
    id: point.id,
    pattern: point.pattern,
    meaning: point.meaning,
    count: point.practice.length,
  }));
}

export function paperQuestions(paper: ExamPaper): ExamQuestion[] {
  return paper.sections.flatMap((section) => section.questions);
}

export function isAnswered(answers: Record<string, number>, questionId: string): boolean {
  return Number.isInteger(answers[questionId]);
}

export function wrongQuestionIds(result: ExamResult): string[] {
  return paperQuestions(result.paper)
    .filter((item) => result.answers[item.id] !== item.question.answerIndex)
    .map((item) => item.id);
}

export function categoryCountsForLevel(level: JLPTLevel): Array<{ category: ExamCategory; count: number }> {
  return EXAM_CATEGORY_ORDER.map((category) => ({
    category,
    count:
      category === "vocabulary"
        ? VOCABULARY.filter((item) => item.level === level).length
        : category === "kanji"
          ? KANJI.filter((item) => item.level === level).length
          : category === "grammar"
            ? GRAMMAR.filter((item) => item.level === level).reduce((sum, point) => sum + point.practice.length, 0)
            : category === "reading"
              ? READING.filter((item) => item.level === level).reduce((sum, passage) => sum + passage.questions.length, 0)
              : LISTENING.filter((item) => item.level === level).reduce((sum, item) => sum + item.questions.length, 0) +
                LISTENING_DRILLS.filter((item) => item.level === level).length,
  }));
}

export { ALL_LEVELS };
