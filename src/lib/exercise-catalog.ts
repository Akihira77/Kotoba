import { ALL_KANA } from "@/content/kana";
import { KANJI } from "@/content/kanji";
import { VOCABULARY } from "@/content/vocabulary";
import { GRAMMAR } from "@/content/grammar";
import { READING } from "@/content/reading";
import { LISTENING } from "@/content/listening";
import { LISTENING_DRILLS, listeningDrillsForLevel } from "@/content/listening-drills";
import { SENTENCES } from "@/content/sentences";
import type {
  CardProgress,
  Exercise,
  ExerciseKind,
  JLPTLevel,
  MatchingPair,
  QuestionStat,
  QuizQuestion,
} from "./types";
import { normalizeAnswer, rngFromSeed } from "./exercise-engine";
import { sample, sampleDistinct, shuffle } from "./utils";

export interface ExerciseCatalogFilter {
  level?: JLPTLevel;
  kinds?: ExerciseKind[];
}

interface ChoiceSet {
  options: string[];
  answerIndex: number;
}

function uniqueBy<T>(items: readonly T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const value = key(item);
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(item);
  }
  return out;
}

function choiceSet(correct: string, pool: readonly string[], rng: () => number, count = 3): ChoiceSet | null {
  const correctKey = normalizeAnswer(correct);
  const candidates = uniqueBy(
    pool.filter((item) => normalizeAnswer(item) !== correctKey && normalizeAnswer(item).length > 0),
    (item) => normalizeAnswer(item),
  );
  const picked = sampleDistinct(candidates, count, rng);
  if (picked.length < 2) return null;
  const options = shuffle([correct, ...picked], rng);
  return { options, answerIndex: options.indexOf(correct) };
}

function lowerMeanings(items: readonly { meaning: string }[]): string[] {
  return items.map((item) => item.meaning);
}

function vocabChoice(
  word: (typeof VOCABULARY)[number],
  pool: readonly (typeof VOCABULARY)[number][],
  rng: () => number,
): Exercise | null {
  const choice = choiceSet(word.meaning, lowerMeanings(pool), rng);
  if (!choice) return null;
  return {
    id: `ex-vocab-meaning-${word.id}`,
    kind: "multiple-choice",
    level: word.level,
    prompt: `Apa arti kata 「${word.japanese}」?`,
    instructions: "Pilih arti yang paling tepat.",
    explanation: `${word.japanese} (${word.kana}) berarti ${word.meaning}.${word.examples[0] ? ` Contoh: ${word.examples[0].jp} — ${word.examples[0].meaning}` : ""}`,
    tags: ["kosakata", word.topic],
    contentRef: { kind: "vocabulary", id: word.id, href: "/vocabulary" },
    options: choice.options,
    answerIndex: choice.answerIndex,
    questionType: "vocab-meaning",
  };
}

function vocabReading(
  word: (typeof VOCABULARY)[number],
  pool: readonly (typeof VOCABULARY)[number][],
  rng: () => number,
): Exercise | null {
  const choice = choiceSet(word.kana, pool.map((item) => item.kana), rng);
  if (!choice) return null;
  return {
    id: `ex-vocab-reading-${word.id}`,
    kind: "reading-recognition",
    level: word.level,
    prompt: `Bagaimana cara baca 「${word.japanese}」?`,
    instructions: "Pilih bacaan kana yang tepat.",
    explanation: `${word.japanese} dibaca ${word.kana} (${word.romaji}).`,
    tags: ["kosakata", "bacaan", word.topic],
    contentRef: { kind: "vocabulary", id: word.id, href: "/vocabulary" },
    word: word.japanese,
    options: choice.options,
    answerIndex: choice.answerIndex,
    reading: word.kana,
  };
}

function vocabTyping(word: (typeof VOCABULARY)[number]): Exercise {
  return {
    id: `ex-vocab-typing-${word.id}`,
    kind: "typing",
    level: word.level,
    prompt: `Ketik bahasa Jepang untuk "${word.meaning}".`,
    instructions: "Kanji atau kana sama-sama diterima. Gunakan IME Jepang bila tersedia.",
    explanation: `${word.japanese} (${word.kana}) berarti ${word.meaning}.`,
    tags: ["kosakata", "mengetik", word.topic],
    contentRef: { kind: "vocabulary", id: word.id, href: "/vocabulary" },
    answer: word.japanese,
    acceptedAnswers: [word.japanese, word.kana],
    hint: "Awali dari ingatan; bantuan romaji ada di kamus.",
    inputMode: "kanji",
    meaning: word.meaning,
  };
}

function vocabCloze(word: (typeof VOCABULARY)[number]): Exercise | null {
  const example = word.examples[0];
  if (!example || !example.jp.includes(word.japanese)) return null;
  const text = example.jp.replace(word.japanese, "＿＿＿");
  if (text.length < 4 || text === example.jp) return null;
  return {
    id: `ex-vocab-cloze-${word.id}`,
    kind: "cloze",
    level: word.level,
    prompt: "Lengkapi kalimat berikut.",
    instructions: "Ketik kata yang hilang. Kana diterima bila kanji belum dikuasai.",
    explanation: `Kalimat lengkap: ${example.jp} — ${example.meaning}`,
    tags: ["kosakata", "isi rumpang", word.topic],
    contentRef: { kind: "vocabulary", id: word.id, href: "/vocabulary" },
    text,
    answer: word.japanese,
    acceptedAnswers: [word.japanese, word.kana],
    hint: `Arti kalimat: ${example.meaning}`,
  };
}

function vocabTranslation(word: (typeof VOCABULARY)[number]): Exercise | null {
  const example = word.examples[0];
  if (!example) return null;
  return {
    id: `ex-vocab-translation-${word.id}`,
    kind: "translation",
    level: word.level,
    prompt: `Terjemahkan ke bahasa Jepang: "${example.meaning}"`,
    instructions: "Kana diterima. Tanda baca tidak dinilai.",
    explanation: `${example.jp} (${example.reading}) berarti ${example.meaning}.`,
    tags: ["kosakata", "terjemahan", word.topic],
    contentRef: { kind: "vocabulary", id: word.id, href: "/vocabulary" },
    source: example.meaning,
    direction: "id-to-ja",
    acceptedAnswers: [example.jp, example.reading || example.jp],
    keywords: [word.japanese],
    reference: example.jp,
  };
}

function kanjiChoices(rng: () => number): Exercise[] {
  const out: Exercise[] = [];
  for (const item of KANJI) {
    const meaningPool = KANJI.map((kanji) => kanji.meanings[0]).filter(Boolean);
    const meaningChoice = choiceSet(item.meanings[0], meaningPool, rng);
    if (meaningChoice) {
      out.push({
        id: `ex-kanji-meaning-${item.id}`,
        kind: "multiple-choice",
        level: item.level,
        prompt: `Apa arti kanji 「${item.char}」?`,
        instructions: "Pilih arti utama kanji ini.",
        explanation: `${item.char} berarti ${item.meanings.join(" / ")}. Contoh: ${item.examples[0]?.word ?? ""} (${item.examples[0]?.reading ?? ""}).`,
        tags: ["kanji", "arti"],
        contentRef: { kind: "kanji", id: item.id, href: "/kanji" },
        options: meaningChoice.options,
        answerIndex: meaningChoice.answerIndex,
        questionType: "kanji-meaning",
      });
    }

    const readings = item.on.length > 0 ? item.on : item.kun;
    const reading = readings[0];
    if (reading) {
      const allTargetReadings = [...item.on, ...item.kun].map((value) => normalizeAnswer(value));
      const readingPool = KANJI.flatMap((kanji) => [...kanji.on, ...kanji.kun]).filter(
        (value) => !allTargetReadings.includes(normalizeAnswer(value)),
      );
      const readingChoice = choiceSet(reading, readingPool, rng);
      if (readingChoice) {
        out.push({
          id: `ex-kanji-reading-${item.id}`,
          kind: "reading-recognition",
          level: item.level,
          prompt: `Pilih cara baca ${item.on.length > 0 ? "on'yomi" : "kun'yomi"} untuk 「${item.char}」.`,
          instructions: "Perhatikan apakah bacaan yang diminta on'yomi atau kun'yomi.",
          explanation: `${item.char}: on'yomi ${item.on.join("、") || "-"}; kun'yomi ${item.kun.join("、") || "-"}. Bacaan yang diminta: ${reading}.`,
          tags: ["kanji", "bacaan"],
          contentRef: { kind: "kanji", id: item.id, href: "/kanji" },
          word: item.char,
          options: readingChoice.options,
          answerIndex: readingChoice.answerIndex,
          reading,
        });
      }
    }
  }
  return out;
}

function kanjiTrueFalse(): Exercise[] {
  const out: Exercise[] = [];
  for (const item of KANJI) {
    const trueId = `ex-kanji-tf-true-${item.id}`;
    out.push({
      id: trueId,
      kind: "true-false",
      level: item.level,
      prompt: "Benar atau salah?",
      instructions: "Nilai pernyataan tentang kanji berikut.",
      explanation: `${item.char} berarti ${item.meanings.join(" / ")}.`,
      tags: ["kanji", "benar-salah"],
      contentRef: { kind: "kanji", id: item.id, href: "/kanji" },
      statement: `Kanji 「${item.char}」 memiliki arti "${item.meanings[0]}".`,
      answer: true,
    });
    const other = KANJI.find((kanji) => !item.meanings.includes(kanji.meanings[0]));
    if (other) {
      out.push({
        id: `ex-kanji-tf-false-${item.id}`,
        kind: "true-false",
        level: item.level,
        prompt: "Benar atau salah?",
        instructions: "Nilai pernyataan tentang kanji berikut.",
        explanation: `${item.char} berarti ${item.meanings.join(" / ")}.`,
        tags: ["kanji", "benar-salah"],
        contentRef: { kind: "kanji", id: item.id, href: "/kanji" },
        statement: `Kanji 「${item.char}」 memiliki arti "${other.meanings[0]}".`,
        answer: false,
        correction: `${other.meanings[0]} adalah arti kanji ${other.char}.`,
      });
    }
  }
  return out;
}

function grammarMultipleChoice(): Exercise[] {
  return GRAMMAR.map((point) => ({
    id: `ex-grammar-${point.id}`,
    kind: "multiple-choice" as const,
    level: point.level,
    prompt: point.practice[0]?.prompt ?? `Pola "${point.pattern}" berarti apa?`,
    instructions: `Pola: ${point.pattern} — ${point.meaning}`,
    explanation: point.practice[0]?.explanation ?? point.explanation[0] ?? "",
    tags: ["tata bahasa", point.level],
    contentRef: { kind: "grammar" as const, id: point.id, href: `/grammar/${point.id}` },
    options: point.practice[0]?.options ?? [],
    answerIndex: point.practice[0]?.answerIndex ?? 0,
    questionType: "grammar" as const,
  })).filter((exercise) => exercise.options.length >= 2);
}

function readingMultipleChoice(): Exercise[] {
  return READING.flatMap((passage) =>
    passage.questions.map((question) => ({
      id: `ex-reading-${question.id}`,
      kind: "multiple-choice" as const,
      level: passage.level,
      prompt: question.prompt,
      instructions: `Bacaan: ${passage.title} (${passage.titleJp})`,
      explanation: question.explanation,
      tags: ["membaca", passage.level],
      contentRef: { kind: "reading" as const, id: passage.id, href: `/reading/${passage.id}` },
      options: question.options,
      answerIndex: question.answerIndex,
      questionType: "reading" as const,
    })),
  );
}

function dialogListeningExercises(): Exercise[] {
  return LISTENING.flatMap((item) =>
    item.questions.map((question) => ({
      id: `ex-listening-${question.id}`,
      kind: "listening" as const,
      level: item.level,
      prompt: question.prompt,
      instructions: "Dengarkan audio, lalu pilih jawaban yang tepat.",
      explanation: question.explanation,
      tags: ["menyimak", item.level],
      contentRef: { kind: "listening" as const, id: item.id, href: `/listening/${item.id}` },
      audioText: question.audioText ?? item.lines[0]?.jp ?? "",
      script: question.audioText,
      options: question.options,
      answerIndex: question.answerIndex,
    })),
  ).filter((exercise) => Boolean(exercise.audioText));
}

/**
 * Short, single-turn drills for the dedicated listening-practice page. The
 * same items also flow into adaptive practice, so results are persisted by the
 * normal quiz-attempt pipeline.
 */
export function listeningDrillExercises(level?: JLPTLevel | "semua"): Exercise[] {
  const drills = level && level !== "semua" ? listeningDrillsForLevel(level) : LISTENING_DRILLS;
  return drills.map((drill): Exercise => ({
    id: `ex-listen-drill-${drill.id}`,
    kind: "listening",
    level: drill.level,
    prompt: drill.prompt,
    instructions: `Fokus: ${drill.focus}. Dengarkan audio, lalu pilih jawaban yang tepat.`,
    explanation: `${drill.explanation} Terjemahan: ${drill.translation}`,
    tags: ["menyimak", "drill", drill.level],
    contentRef: { kind: "listening", id: drill.id, href: "/listening/practice" },
    audioText: drill.audioText,
    script: drill.audioText,
    options: drill.options,
    answerIndex: drill.answerIndex,
  }));
}

function listeningExercises(): Exercise[] {
  return [...dialogListeningExercises(), ...listeningDrillExercises()];
}

function sentenceExercises(): Exercise[] {
  return SENTENCES.map((sentence) => ({
    id: `ex-ordering-${sentence.id}`,
    kind: "ordering" as const,
    level: sentence.level,
    prompt: "Susun potongan kata menjadi kalimat yang benar.",
    instructions: `Terjemahan: ${sentence.translation}`,
    explanation: sentence.explanation,
    tags: ["susun kalimat", sentence.level],
    contentRef: { kind: "sentence" as const, id: sentence.id, href: "/practice?mode=ordering" },
    tokens: sentence.tokens,
    answer: sentence.answer,
    translation: sentence.translation,
  }));
}

function kanaExercises(kinds: Set<ExerciseKind>, rng: () => number): Exercise[] {
  const out: Exercise[] = [];
  const uniqueRomaji = new Set(
    ALL_KANA.filter((kana) => ALL_KANA.filter((other) => other.script === kana.script && other.romaji === kana.romaji).length === 1).map(
      (kana) => kana.id,
    ),
  );
  for (const kana of ALL_KANA) {
    if (kinds.has("reading-recognition")) {
      const choice = choiceSet(kana.romaji, ALL_KANA.filter((item) => item.script === kana.script).map((item) => item.romaji), rng);
      if (choice) {
        out.push({
          id: `ex-kana-reading-${kana.id}`,
          kind: "reading-recognition",
          level: "N5",
          prompt: `Karakter 「${kana.char}」 dibaca ...`,
          instructions: `Pilih romaji untuk ${kana.script === "hiragana" ? "hiragana" : "katakana"} ini.`,
          explanation: `${kana.char} dibaca ${kana.romaji}.`,
          tags: ["kana", kana.script],
          contentRef: { kind: "kana", id: kana.id, href: "/kana" },
          word: kana.char,
          options: choice.options,
          answerIndex: choice.answerIndex,
          reading: kana.romaji,
        });
      }
    }
    if (kinds.has("typing") && uniqueRomaji.has(kana.id)) {
      out.push({
        id: `ex-kana-typing-${kana.id}`,
        kind: "typing",
        level: "N5",
        prompt: `Ketik karakter ${kana.script === "hiragana" ? "hiragana" : "katakana"} untuk bunyi "${kana.romaji}".`,
        instructions: "Gunakan IME Jepang atau papan ketik kana.",
        explanation: `Bunyi ${kana.romaji} ditulis ${kana.char}.`,
        tags: ["kana", "mengetik", kana.script],
        contentRef: { kind: "kana", id: kana.id, href: "/kana" },
        answer: kana.char,
        acceptedAnswers: [kana.char],
        inputMode: "kana",
      });
    }
  }
  return out;
}

function matchingExercises(): Exercise[] {
  const out: Exercise[] = [];
  const byTopic = new Map<string, typeof VOCABULARY>();
  for (const word of VOCABULARY) {
    const key = `${word.level}:${word.topic}`;
    const list = byTopic.get(key) ?? [];
    list.push(word);
    byTopic.set(key, list);
  }
  for (const [key, words] of [...byTopic.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const uniqueWords = uniqueBy(words, (word) => normalizeAnswer(word.meaning));
    for (let index = 0; index + 2 < uniqueWords.length; index += 4) {
      const group = uniqueWords.slice(index, index + 4);
      if (group.length < 3) continue;
      const level = group[0].level;
      const pairs: MatchingPair[] = group.map((word) => ({
        id: `${key}-${word.id}`,
        left: word.japanese,
        right: word.meaning,
        leftReading: word.kana,
        leftRomaji: word.romaji,
      }));
      out.push({
        id: `ex-matching-${key.replace(":", "-")}-${Math.floor(index / 4)}`,
        kind: "matching",
        level,
        prompt: "Cocokkan kosakata Jepang dengan arti Indonesianya.",
        instructions: "Ketuk satu kata Jepang, lalu ketuk artinya.",
        explanation: `Pasangan: ${pairs.map((pair) => `${pair.left} = ${pair.right}`).join("; ")}.`,
        tags: ["kosakata", "mencocokkan", group[0].topic],
        pairs,
      });
    }
  }
  return out;
}

/**
 * Membangun katalog latihan dari konten yang sama dengan kamus dan pelajaran.
 * Semua id stabil agar riwayat dan prioritas adaptif dapat dilacak.
 */
export function buildExerciseCatalog(filter: ExerciseCatalogFilter = {}): Exercise[] {
  const kinds = new Set<ExerciseKind>(filter.kinds?.length ? filter.kinds : ALL_KINDS);
  const rng = rngFromSeed(`catalog-${filter.level ?? "all"}-${[...kinds].sort().join(",")}`);
  const candidates: Exercise[] = [];

  if (kinds.has("multiple-choice") || kinds.has("reading-recognition") || kinds.has("typing") || kinds.has("cloze") || kinds.has("translation")) {
    const vocab = VOCABULARY.filter((word) => !filter.level || word.level === filter.level);
    for (const word of vocab) {
      if (kinds.has("multiple-choice") && filter.level === undefined) {
        // Semua varian tetap dibuat; level sudah difilter di atas.
      }
      if (kinds.has("multiple-choice")) {
        const exercise = vocabChoice(word, VOCABULARY, rng);
        if (exercise) candidates.push(exercise);
      }
      if (kinds.has("reading-recognition")) {
        const exercise = vocabReading(word, VOCABULARY, rng);
        if (exercise) candidates.push(exercise);
      }
      if (kinds.has("typing")) candidates.push(vocabTyping(word));
      if (kinds.has("cloze")) {
        const exercise = vocabCloze(word);
        if (exercise) candidates.push(exercise);
      }
      if (kinds.has("translation")) {
        const exercise = vocabTranslation(word);
        if (exercise) candidates.push(exercise);
      }
    }
  }

  if (kinds.has("multiple-choice") || kinds.has("reading-recognition") || kinds.has("true-false")) {
    if (kinds.has("multiple-choice") || kinds.has("reading-recognition")) {
      candidates.push(
        ...kanjiChoices(rng).filter(
          (exercise) => kinds.has(exercise.kind) && (!filter.level || exercise.level === filter.level),
        ),
      );
    }
    if (kinds.has("true-false")) {
      candidates.push(...kanjiTrueFalse().filter((exercise) => !filter.level || exercise.level === filter.level));
    }
  }

  if (kinds.has("multiple-choice")) {
    candidates.push(...grammarMultipleChoice().filter((exercise) => !filter.level || exercise.level === filter.level));
    candidates.push(...readingMultipleChoice().filter((exercise) => !filter.level || exercise.level === filter.level));
  }
  if (kinds.has("listening")) {
    candidates.push(...listeningExercises().filter((exercise) => !filter.level || exercise.level === filter.level));
  }
  if (kinds.has("ordering")) {
    candidates.push(...sentenceExercises().filter((exercise) => !filter.level || exercise.level === filter.level));
  }
  if (kinds.has("matching")) {
    candidates.push(...matchingExercises().filter((exercise) => !filter.level || exercise.level === filter.level));
  }
  if (filter.level === "N5" || !filter.level) {
    candidates.push(...kanaExercises(kinds, rng));
  }

  return uniqueBy(candidates, (exercise) => exercise.id);
}

const ALL_KINDS: ExerciseKind[] = [
  "multiple-choice",
  "cloze",
  "translation",
  "matching",
  "reading-recognition",
  "listening",
  "ordering",
  "true-false",
  "typing",
];

export interface AdaptiveSessionOptions {
  level?: JLPTLevel;
  kinds?: ExerciseKind[];
  count?: number;
  cards?: CardProgress[];
  questionStats?: QuestionStat[] | Record<string, QuestionStat>;
  seed?: string | number;
  now?: Date;
}

function cardKey(card: CardProgress): string {
  return `${card.kind}:${card.itemId}`;
}

function contentCardKey(exercise: Exercise): string | null {
  if (!exercise.contentRef) return null;
  if (exercise.contentRef.kind === "vocabulary") return `vocab:${exercise.contentRef.id}`;
  if (exercise.contentRef.kind === "kanji") return `kanji:${exercise.contentRef.id}`;
  return null;
}

/**
 * Memilih latihan adaptif:
 * 1. soal dengan riwayat salah berulang mendapat bobot lebih besar;
 * 2. kosakata/kanji yang jatuh tempo atau telat diulang diprioritaskan;
 * 3. soal yang sudah sering benar dan kartunya dikuasai diturunkan bobotnya;
 * 4. satu jenis latihan dijamin muncul lebih dulu agar sesi tetap bervariasi.
 */
export function buildAdaptiveSession(options: AdaptiveSessionOptions = {}): Exercise[] {
  const count = Math.max(1, Math.min(50, Math.round(options.count ?? 10)));
  const seed = options.seed ?? `session-${Date.now()}-${Math.random()}`;
  const rng = rngFromSeed(seed);
  const catalog = buildExerciseCatalog({ level: options.level, kinds: options.kinds });
  if (catalog.length <= count) return shuffle(catalog, rng);

  const stats = new Map<string, QuestionStat>();
  if (Array.isArray(options.questionStats)) {
    for (const stat of options.questionStats) stats.set(stat.questionId, stat);
  } else {
    for (const [id, stat] of Object.entries(options.questionStats ?? {})) stats.set(id, stat);
  }
  const cards = new Map((options.cards ?? []).map((card) => [cardKey(card), card]));
  const now = (options.now ?? new Date()).getTime();
  const contentCounts = new Map<string, number>();

  const weightFor = (exercise: Exercise): number => {
    let weight = 1;
    const stat = stats.get(exercise.id);
    if (stat && stat.attempts > 0) {
      const accuracy = stat.correct / stat.attempts;
      weight *= 0.55 + (1 - accuracy) * 2.2;
      if (stat.wrong >= 2) weight *= 1.35;
      if (stat.lastResult === "wrong") weight *= 1.15;
    }
    const key = contentCardKey(exercise);
    if (key) {
      const card = cards.get(key);
      if (card) {
        const due = new Date(card.dueAt).getTime();
        if (due <= now) weight *= 1.65;
        if (due <= now - 3 * 86_400_000) weight *= 1.25;
        if (card.reps === 0) weight *= 1.1;
        if (card.reps >= 6 && (!stat || stat.correct >= stat.attempts * 0.8)) weight *= 0.45;
      }
    }
    return Math.max(0.05, weight);
  };

  const selected: Exercise[] = [];
  const selectedIds = new Set<string>();
  const add = (exercise: Exercise): void => {
    selected.push(exercise);
    selectedIds.add(exercise.id);
    const key = exercise.contentRef ? `${exercise.contentRef.kind}:${exercise.contentRef.id}` : exercise.id;
    contentCounts.set(key, (contentCounts.get(key) ?? 0) + 1);
  };
  const available = (exercise: Exercise): boolean => {
    if (selectedIds.has(exercise.id)) return false;
    const key = exercise.contentRef ? `${exercise.contentRef.kind}:${exercise.contentRef.id}` : exercise.id;
    return (contentCounts.get(key) ?? 0) < 2;
  };

  const availableKinds = shuffle(
    [...new Set(catalog.map((exercise) => exercise.kind))],
    rng,
  );
  for (const kind of availableKinds) {
    if (selected.length >= count) break;
    const candidates = catalog.filter((exercise) => exercise.kind === kind && available(exercise));
    if (candidates.length === 0) continue;
    const weighted = candidates.map((exercise) => ({ value: exercise, weight: weightFor(exercise) }));
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = rng() * total;
    let picked = weighted[weighted.length - 1].value;
    for (const entry of weighted) {
      roll -= entry.weight;
      if (roll <= 0) {
        picked = entry.value;
        break;
      }
    }
    add(picked);
  }

  while (selected.length < count) {
    const candidates = catalog.filter((exercise) => available(exercise));
    if (candidates.length === 0) break;
    const weighted = candidates.map((exercise) => ({ value: exercise, weight: weightFor(exercise) }));
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = rng() * total;
    let picked = weighted[weighted.length - 1].value;
    for (const entry of weighted) {
      roll -= entry.weight;
      if (roll <= 0) {
        picked = entry.value;
        break;
      }
    }
    add(picked);
  }

  return selected;
}

export function questionStatById(stats: readonly QuestionStat[]): Record<string, QuestionStat> {
  return Object.fromEntries(stats.map((stat) => [stat.questionId, stat]));
}

export function exercisesFromQuizQuestions(questions: readonly QuizQuestion[], title: string): Exercise[] {
  return questions.map((question): Exercise => {
    if (question.type === "listening") {
      return {
        id: `quiz-${question.id}`,
        kind: "listening",
        level: question.level,
        prompt: question.prompt,
        instructions: title,
        explanation: question.explanation,
        tags: [question.type],
        contentRef: question.sourceId
          ? { kind: "listening", id: question.sourceId, href: `/listening/${question.sourceId}` }
          : undefined,
        audioText: question.audioText ?? "",
        script: question.audioText,
        options: question.options,
        answerIndex: question.answerIndex,
        promptJp: question.promptJp,
      };
    }
    return {
      id: `quiz-${question.id}`,
      kind: "multiple-choice",
      level: question.level,
      prompt: question.prompt,
      instructions: title,
      explanation: question.explanation,
      tags: [question.type],
      contentRef:
        question.type === "reading" && question.sourceId
          ? { kind: "reading", id: question.sourceId, href: `/reading/${question.sourceId}` }
          : undefined,
      audioText: question.audioText,
      options: question.options,
      answerIndex: question.answerIndex,
      promptJp: question.promptJp,
      questionType: question.type,
    };
  });
}

export { sample, sampleDistinct };
