import { ALL_KANA, KANA_BY_ID } from "@/content/kana";
import { KANJI } from "@/content/kanji";
import { VOCABULARY } from "@/content/vocabulary";
import { GRAMMAR } from "@/content/grammar";
import { READING } from "@/content/reading";
import { LISTENING } from "@/content/listening";
import { SENTENCES } from "@/content/sentences";
import type {
  JLPTLevel,
  Kanji,
  Kana,
  QuizQuestion,
  QuestionType,
  VocabWord,
} from "./types";
import { sampleDistinct, shuffle } from "./utils";

export interface QuestionFilter {
  level?: JLPTLevel | "semua";
  types?: QuestionType[];
  count?: number;
}

const ALL_LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];

function poolForLevel(level: JLPTLevel): JLPTLevel[] {
  return ALL_LEVELS.filter((item) => ALL_LEVELS.indexOf(item) >= ALL_LEVELS.indexOf(level));
}

function pickDistractors<T>(pool: T[], correct: T, get: (item: T) => string, count = 3): T[] {
  const seen = new Set([get(correct)]);
  const candidates = pool.filter((item) => {
    const value = get(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
  return sampleDistinct(candidates, count);
}

export function kanaQuestion(item: Kana, all: Kana[] = ALL_KANA, mode: "reading" | "writing" = "reading"): QuizQuestion {
  const pool = all.filter((k) => k.script === item.script && k.group === item.group);
  if (mode === "reading") {
    const wrong = pickDistractors(pool.length >= 4 ? pool : all.filter((k) => k.script === item.script), item, (k) => k.romaji);
    const options = shuffle([item.romaji, ...wrong.map((k) => k.romaji)]);
    return {
      id: `kana-${item.id}-${mode}`,
      type: "kana-reading",
      level: "N5",
      prompt: "Apa bacaan kana berikut?",
      promptJp: item.char,
      options,
      answerIndex: options.indexOf(item.romaji),
      explanation: `${item.char} dibaca "${item.romaji}" (${item.script === "hiragana" ? "hiragana" : "katakana"}).`,
      sourceId: item.id,
      section: "kana",
    };
  }
  const candidates = sampleDistinct(all.filter((k) => k.script === item.script && k.char !== item.char && k.romaji !== item.romaji), 3);
  const options = shuffle([item.char, ...candidates.map((k) => k.char)]);
  return {
    id: `kana-${item.id}-${mode}`,
    type: "kana-writing",
    level: "N5",
    prompt: `Kana manakah yang dibaca "${item.romaji}"?`,
    promptJp: item.romaji,
    options,
    answerIndex: options.indexOf(item.char),
    explanation: `Romaji "${item.romaji}" ditulis ${item.char}.`,
    sourceId: item.id,
    section: "kana",
  };
}

export function vocabQuestion(item: VocabWord, pool: VocabWord[] = VOCABULARY, mode: "meaning" | "japanese" = "meaning"): QuizQuestion {
  if (mode === "meaning") {
    const wrong = pickDistractors(pool.filter((v) => v.level === item.level), item, (v) => v.meaning);
    const options = shuffle([item.meaning, ...wrong.map((v) => v.meaning)]);
    return {
      id: `vocab-${item.id}-${mode}`,
      type: "vocab-meaning",
      level: item.level,
      prompt: "Apa arti kata berikut?",
      promptJp: item.japanese,
      options,
      answerIndex: options.indexOf(item.meaning),
      explanation: `${item.japanese} (${item.kana}) berarti "${item.meaning}".`,
      sourceId: item.id,
      section: "moji-goi",
    };
  }
  const wrong = pickDistractors(pool.filter((v) => v.level === item.level), item, (v) => v.japanese);
  const options = shuffle([item.japanese, ...wrong.map((v) => v.japanese)]);
  return {
    id: `vocab-${item.id}-${mode}`,
    type: "vocab-japanese",
    level: item.level,
    prompt: `Kata Jepang untuk "${item.meaning}" adalah ...`,
    options,
    answerIndex: options.indexOf(item.japanese),
    explanation: `"${item.meaning}" dalam bahasa Jepang adalah ${item.japanese} (${item.kana}).`,
    sourceId: item.id,
    section: "moji-goi",
  };
}

export function kanjiQuestion(item: Kanji, pool: Kanji[] = KANJI, mode: "meaning" | "reading" = "meaning"): QuizQuestion {
  if (mode === "meaning") {
    const wrong = pickDistractors(pool, item, (k) => k.meanings[0]);
    const correct = item.meanings.join(", ");
    const options = shuffle([correct, ...wrong.map((k) => k.meanings.join(", "))]);
    return {
      id: `kanji-${item.id}-${mode}`,
      type: "kanji-meaning",
      level: item.level,
      prompt: "Apa makna kanji berikut?",
      promptJp: item.char,
      options,
      answerIndex: options.indexOf(correct),
      explanation: `Kanji ${item.char} berarti "${correct}" dengan bacaan on: ${item.on.join("、") || "-"} dan kun: ${item.kun.join("、") || "-"}.`,
      sourceId: item.id,
      section: "moji-goi",
    };
  }
  const example = item.examples[0];
  if (!example) {
    return kanjiQuestion(item, pool, "meaning");
  }
  const correct = example.reading;
  const wrong = sampleDistinct(
    pool.flatMap((k) => k.examples.map((e) => e.reading)).filter((r) => r !== correct),
    3,
  );
  const options = shuffle([correct, ...wrong]);
  return {
    id: `kanji-${item.id}-${mode}`,
    type: "kanji-reading",
    level: item.level,
    prompt: `Bagaimana cara membaca ${example.word}?`,
    promptJp: example.word,
    options,
    answerIndex: options.indexOf(correct),
    explanation: `${example.word} dibaca ${example.reading} dan berarti "${example.meaning}".`,
    sourceId: item.id,
    section: "moji-goi",
  };
}

export function grammarQuestions(level?: JLPTLevel | "semua", count = 5): QuizQuestion[] {
  const pool = GRAMMAR.filter((g) => !level || level === "semua" || g.level === level);
  const source = pool.length ? pool : GRAMMAR;
  return shuffle(source).slice(0, Math.min(count, source.length)).flatMap((g) => g.practice);
}

export function readingQuestions(level?: JLPTLevel | "semua", count = 4): QuizQuestion[] {
  const pool = READING.filter((r) => !level || level === "semua" || r.level === level);
  const source = pool.length ? pool : READING;
  return shuffle(source).slice(0, Math.min(count, source.length)).flatMap((r) => r.questions);
}

export function listeningQuestions(level?: JLPTLevel | "semua", count = 3): QuizQuestion[] {
  const pool = LISTENING.filter((l) => !level || level === "semua" || l.level === level);
  const source = pool.length ? pool : LISTENING;
  return shuffle(source).slice(0, Math.min(count, source.length)).flatMap((l) => l.questions);
}

export function sentenceQuestion(item: SentenceItemLike): QuizQuestion {
  return {
    id: item.id,
    type: "sentence-order",
    level: item.level,
    prompt: "Susun kata menjadi kalimat yang benar.",
    promptJp: item.translation,
    options: item.tokens,
    answerIndex: 0,
    explanation: item.explanation,
    sourceId: item.id,
    section: "bunpou-dokkai",
  };
}

interface SentenceItemLike {
  id: string;
  level: JLPTLevel;
  tokens: string[];
  answer: string[];
  translation: string;
  explanation: string;
}

export function sentenceQuestions(level?: JLPTLevel | "semua", count = 4): QuizQuestion[] {
  const pool = SENTENCES.filter((s) => !level || level === "semua" || s.level === level);
  const source = pool.length ? pool : SENTENCES;
  return shuffle(source).slice(0, Math.min(count, source.length)).map(sentenceQuestion);
}

export function buildPracticeQuiz(filter: QuestionFilter = {}): QuizQuestion[] {
  const { level = "semua", count = 10 } = filter;
  const wanted = filter.types && filter.types.length ? new Set(filter.types) : null;
  const result: QuizQuestion[] = [];

  const add = (questions: QuizQuestion[]) => {
    for (const question of questions) {
      if (wanted && !wanted.has(question.type)) continue;
      if (level !== "semua" && question.level !== level) continue;
      if (result.some((q) => q.id === question.id)) continue;
      result.push(question);
    }
  };

  const levels: JLPTLevel[] = level === "semua" ? ALL_LEVELS : poolForLevel(level);

  for (const lv of levels) {
    add(GRAMMAR.filter((g) => g.level === lv).flatMap((g) => g.practice));
    add(READING.filter((r) => r.level === lv).flatMap((r) => r.questions));
    add(LISTENING.filter((r) => r.level === lv).flatMap((r) => r.questions));
  }

  if (levels.length) {
    const vocabPool = VOCABULARY.filter((v) => levels.includes(v.level));
    add(vocabPool.map((v) => vocabQuestion(v, VOCABULARY, Math.random() > 0.5 ? "meaning" : "japanese")));
    const kanjiPool = KANJI.filter((k) => levels.includes(k.level));
    add(kanjiPool.map((k) => kanjiQuestion(k, KANJI, Math.random() > 0.5 ? "meaning" : "reading")));
    const kanaPool = level === "semua" || level === "N5" ? ALL_KANA : [];
    add(kanaPool.map((k) => kanaQuestion(k, ALL_KANA, Math.random() > 0.5 ? "reading" : "writing")));
  }

  return shuffle(result).slice(0, count);
}

export interface ExamSection {
  id: "moji-goi" | "bunpou-dokkai" | "choukai";
  label: string;
  questions: QuizQuestion[];
}

export interface ExamBlueprint {
  level: JLPTLevel;
  minutes: number;
  sections: ExamSection[];
}

const EXAM_COUNTS: Record<JLPTLevel, { vocab: number; kanji: number; grammar: number; reading: number; listening: number; minutes: number }> = {
  N5: { vocab: 8, kanji: 6, grammar: 6, reading: 3, listening: 6, minutes: 25 },
  N4: { vocab: 9, kanji: 6, grammar: 7, reading: 4, listening: 6, minutes: 30 },
  N3: { vocab: 10, kanji: 6, grammar: 8, reading: 5, listening: 7, minutes: 40 },
  N2: { vocab: 10, kanji: 7, grammar: 8, reading: 6, listening: 8, minutes: 50 },
  N1: { vocab: 10, kanji: 8, grammar: 9, reading: 6, listening: 8, minutes: 60 },
};

/** Level-first pool: level items first, then other levels as a fallback. */
function levelFirst<T extends { level: JLPTLevel }>(items: T[], level: JLPTLevel): T[] {
  return [...items.filter((item) => item.level === level), ...items.filter((item) => item.level !== level)];
}

/** Level-first questions with de-duplication, so a sparse level still fills a section. */
function fillQuestions(primary: QuizQuestion[], fallback: QuizQuestion[], count: number): QuizQuestion[] {
  const result: QuizQuestion[] = [];
  for (const question of [...primary, ...fallback]) {
    if (result.some((item) => item.id === question.id)) continue;
    result.push(question);
    if (result.length >= count) break;
  }
  return result;
}

export function buildExam(level: JLPTLevel): ExamBlueprint {
  const plan = EXAM_COUNTS[level];
  const vocabPool = levelFirst(VOCABULARY, level);
  const kanjiPool = levelFirst(KANJI, level);

  const vocabQs = shuffle(vocabPool)
    .slice(0, plan.vocab)
    .map((v, i) => vocabQuestion(v, vocabPool, i % 2 === 0 ? "meaning" : "japanese"));
  const kanjiQs = shuffle(kanjiPool)
    .slice(0, plan.kanji)
    .map((k, i) => kanjiQuestion(k, kanjiPool, i % 2 === 0 ? "meaning" : "reading"));
  const grammarQs = fillQuestions(
    GRAMMAR.filter((point) => point.level === level).flatMap((point) => point.practice),
    GRAMMAR.flatMap((point) => point.practice),
    plan.grammar,
  );
  const readingQs = fillQuestions(
    READING.filter((passage) => passage.level === level).flatMap((passage) => passage.questions),
    READING.flatMap((passage) => passage.questions),
    plan.reading,
  );
  const listeningQs = fillQuestions(
    LISTENING.filter((item) => item.level === level).flatMap((item) => item.questions),
    LISTENING.flatMap((item) => item.questions),
    plan.listening,
  );

  const sections: ExamSection[] = [
    { id: "moji-goi", label: "Moji & Goi", questions: [...vocabQs, ...kanjiQs] },
    { id: "bunpou-dokkai", label: "Bunpou & Dokkai", questions: [...grammarQs, ...readingQs] },
    { id: "choukai", label: "Choukai", questions: listeningQs },
  ];

  return { level, minutes: plan.minutes, sections };
}

export function questionsById(): Map<string, QuizQuestion> {
  const map = new Map<string, QuizQuestion>();
  for (const g of GRAMMAR) for (const q of g.practice) map.set(q.id, q);
  for (const r of READING) for (const q of r.questions) map.set(q.id, q);
  for (const l of LISTENING) for (const q of l.questions) map.set(q.id, q);
  for (const k of ALL_KANA) {
    map.set(`kana-${k.id}-reading`, kanaQuestion(k, ALL_KANA, "reading"));
    map.set(`kana-${k.id}-writing`, kanaQuestion(k, ALL_KANA, "writing"));
  }
  return map;
}

export function lookupKanaByChar(char: string): Kana | undefined {
  return ALL_KANA.find((k) => k.char === char);
}

export function kanaById(id: string): Kana | undefined {
  return KANA_BY_ID.get(id);
}
