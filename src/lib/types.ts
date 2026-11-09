export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export const JLPT_LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];

export type KanaScript = "hiragana" | "katakana";
export type KanaGroup = "basic" | "dakuten" | "handakuten" | "yoon";

export interface KanaExample {
  word: string;
  reading?: string;
  romaji: string;
  meaning: string;
}

export interface Kana {
  id: string;
  char: string;
  romaji: string;
  script: KanaScript;
  group: KanaGroup;
  row: string;
  vowel: "a" | "i" | "u" | "e" | "o" | "n";
  mnemonic?: string;
  examples: KanaExample[];
}

export type PartOfSpeech =
  | "nomina"
  | "verba"
  | "i-adjektiva"
  | "na-adjektiva"
  | "adverbia"
  | "partikel"
  | "ekspresi"
  | "konjungsi"
  | "bilangan"
  | "klasifikator";

export type VocabTopic =
  | "salam"
  | "perkenalan"
  | "angka"
  | "waktu"
  | "keluarga"
  | "makanan"
  | "minuman"
  | "tempat"
  | "transportasi"
  | "tubuh"
  | "warna"
  | "cuaca"
  | "alam"
  | "sekolah"
  | "pekerjaan"
  | "kata-kerja"
  | "kata-sifat"
  | "bisnis"
  | "teknologi"
  | "emosi"
  | "anime"
  | "kehidupan";

export interface VocabExample {
  jp: string;
  reading?: string;
  /** Terjemahan Indonesia dari contoh kalimat. */
  meaning: string;
  /** ID unik untuk key React dan pencarian. */
  id: string;
}

export interface VocabWord {
  id: string;
  japanese: string;
  kana: string;
  romaji: string;
  meaning: string;
  level: JLPTLevel;
  pos: PartOfSpeech;
  topic: VocabTopic;
  examples: VocabExample[];
  notes?: string;
}

export interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
}

export interface Kanji {
  id: string;
  char: string;
  level: JLPTLevel;
  strokes: number;
  radical: string;
  radicalMeaning: string;
  on: string[];
  kun: string[];
  meanings: string[];
  examples: KanjiExample[];
  mnemonic?: string;
}

export interface GrammarFormation {
  label: string;
  form: string;
  note?: string;
}

export interface GrammarExample {
  jp: string;
  reading: string;
  /** Terjemahan Indonesia dari contoh kalimat. */
  meaning: string;
  /** ID unik untuk key React dan pencarian. */
  id: string;
}

export interface GrammarMistake {
  wrong: string;
  right: string;
  why: string;
}

export interface GrammarPoint {
  id: string;
  level: JLPTLevel;
  pattern: string;
  meaning: string;
  formation: GrammarFormation[];
  explanation: string[];
  examples: GrammarExample[];
  notes?: string[];
  mistakes?: GrammarMistake[];
  related?: string[];
  practice: QuizQuestion[];
}

export type QuestionType =
  | "kana-reading"
  | "kana-writing"
  | "vocab-meaning"
  | "vocab-japanese"
  | "kanji-reading"
  | "kanji-meaning"
  | "grammar"
  | "reading"
  | "listening"
  | "sentence-order";

export type QuizSection = "moji-goi" | "bunpou-dokkai" | "dokkai" | "choukai" | "kana";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  level: JLPTLevel;
  prompt: string;
  promptJp?: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  audioText?: string;
  sourceId?: string;
  section?: QuizSection;
}

export interface ReadingVocab {
  jp: string;
  reading: string;
  meaning: string;
}

export interface ReadingPassage {
  id: string;
  level: JLPTLevel;
  title: string;
  titleJp: string;
  summary: string;
  text: string;
  translation: string[];
  vocab: ReadingVocab[];
  questions: QuizQuestion[];
  minutes: number;
}

export interface ListeningLine {
  speaker: "A" | "B" | "Narasi";
  jp: string;
  reading: string;
  id: string;
}

export interface ListeningItem {
  id: string;
  level: JLPTLevel;
  title: string;
  titleId: string;
  scenario: string;
  lines: ListeningLine[];
  questions: QuizQuestion[];
  keyPhrases: ReadingVocab[];
}

export type CultureCategory =
  | "tradisi"
  | "makanan"
  | "geografi"
  | "etiket"
  | "kehidupan"
  | "sejarah"
  | "anime"
  | "bahasa";

/** Enam kelompok besar untuk navigasi penemuan budaya. */
export type CultureGroup = "budaya" | "makanan" | "geografi" | "sejarah" | "anime" | "bahasa";

export type Register = "standar" | "formal" | "kasual" | "slang" | "arkais" | "anime";

export interface CultureTerm {
  jp: string;
  reading: string;
  romaji: string;
  meaning: string;
  register?: Register;
  note?: string;
}

export interface CultureExpression extends CultureTerm {
  register: Register;
  usage: string;
}

export interface CultureSource {
  label: string;
  url: string;
  note?: string;
}

export interface CultureQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface CultureArticle {
  id: string;
  category: CultureCategory;
  /** Topik spesifik di dalam kelompok, mis. "Festival" atau "Etiket kereta". */
  topics: string[];
  title: string;
  titleJp: string;
  summary: string;
  body: string[];
  facts: { label: string; value: string }[];
  vocab: CultureTerm[];
  expressions?: CultureExpression[];
  sourceNote?: string;
  sources: CultureSource[];
  quiz: CultureQuizQuestion[];
  minutes: number;
}

export interface CultureFavorite {
  articleId: string;
  savedAt: string;
}

export interface CultureFavoritePayload {
  articleId: string;
  favorite: boolean;
}

/** Satu tuturan dalam dialog percakapan. */
export interface ConversationLine {
  jp: string;
  reading: string;
  romaji: string;
  meaning: string;
}

/** Pilihan jawaban pemelajar pada satu langkah dialog. */
export interface ConversationChoice extends ConversationLine {
  id: string;
  register: Register;
  correct: boolean;
  feedback: string;
}

/** Satu langkah: lawan bicara menuturkan sesuatu, lalu pemelajar memilih balasan. */
export interface ConversationStep {
  id: string;
  npc: ConversationLine;
  prompt: string;
  choices: ConversationChoice[];
}

export interface ConversationPhrase extends ConversationLine {
  register: Register;
  note?: string;
}

/** Skenario percakapan pendek yang dapat dimainkan seperti dialog bercabang. */
export interface ConversationScenario {
  id: string;
  level: JLPTLevel;
  category: string;
  title: string;
  titleJp: string;
  summary: string;
  setting: string;
  goals: string[];
  steps: ConversationStep[];
  keyPhrases: ConversationPhrase[];
  culturalNote: string;
  minutes: number;
}

export interface SentenceItem {
  id: string;
  level: JLPTLevel;
  tokens: string[];
  answer: string[];
  translation: string;
  explanation: string;
}

/* ---------------------------------- Progress --------------------------------- */

export type ThemeMode = "light" | "dark" | "system";

export interface Settings {
  dailyGoalXp: number;
  /** Target durasi belajar per hari, dalam menit. */
  dailyStudyMinutes: number;
  /** Target jumlah kosakata baru yang disentuh per hari. */
  dailyVocabTarget: number;
  /** Target jumlah pelajaran yang diselesaikan per hari. */
  dailyLessonTarget: number;
  /** Target hari belajar aktif per minggu. */
  weeklyFrequency: number;
  /** Level JLPT yang ingin dicapai; null berarti belum memilih target. */
  studyTargetLevel: JLPTLevel | null;
  /** Rentang rencana belajar dalam minggu (4–104). */
  studyTargetWeeks: number;
  theme: ThemeMode;
  showRomaji: boolean;
  showFurigana: boolean;
  speechRate: number;
  voiceURI: string | null;
  autoPlayAudio: boolean;
}

export interface Profile {
  name: string;
  xp: number;
  streak: number;
  bestStreak: number;
  lastStudyDate: string | null;
  settings: Settings;
  createdAt: string;
}

export type ItemKind = "vocab" | "kanji";

export interface CardProgress {
  itemId: string;
  kind: ItemKind;
  ease: number;
  intervalDays: number;
  dueAt: string;
  reps: number;
  lapses: number;
  lastRating: number | null;
  lastReviewedAt: string | null;
}

export interface KanaProgress {
  char: string;
  script: KanaScript;
  correct: number;
  wrong: number;
  mastery: number;
  lastSeen: string | null;
}

/* ---------------------------------- Writing --------------------------------- */

export type WritingScript = "hiragana" | "katakana" | "kanji";
export type WritingStage = "A" | "B" | "C" | "D" | "E";
export type WritingMode = "guided" | "free";

/** Satu glyph komponen; kana yōon memakai dua glyph berurutan. */
export interface WritingGlyph {
  char: string;
  file: string;
  strokes: number;
}

/** Entri katalog latihan menulis untuk satu karakter kana atau kanji. */
export interface WritingCharacter {
  id: string;
  char: string;
  script: WritingScript;
  stage: WritingStage;
  level?: JLPTLevel;
  romaji: string;
  reading: string;
  strokeCount: number;
  glyphs: WritingGlyph[];
  meanings: string[];
  on: string[];
  kun: string[];
  radical?: string;
  radicalMeaning?: string;
  examples: { word: string; reading: string; meaning: string }[];
  notes: string[];
  mnemonic?: string;
  kanaGroup?: KanaGroup;
  kanaRow?: string;
}

export interface WritingPoint {
  x: number;
  y: number;
}

export interface WritingStrokeData {
  number: string;
  d: string;
  start: WritingPoint;
  end: WritingPoint;
  points: WritingPoint[];
}

export interface WritingGlyphData {
  character: string;
  codepoint: string;
  viewBox: string;
  source: { project: string; commit: string; url: string; license: string; attribution: string };
  strokes: WritingStrokeData[];
  numbers: { number: string; x: number; y: number }[];
}

export interface WritingIndexEntry {
  id: string;
  char: string;
  script: WritingScript;
  stage: WritingStage;
  level?: JLPTLevel;
  romaji: string;
  reading: string;
  strokeCount: number;
  glyphCount: number;
  primaryMeaning: string;
}

export interface WritingAttempt {
  id: string;
  characterId: string;
  script: WritingScript;
  mode: WritingMode;
  score: number;
  expectedStrokes: number;
  drawnStrokes: number;
  orderMistakes: number;
  durationSec: number;
  createdAt: string;
}

export interface WritingPayload {
  characterId: string;
  mode: WritingMode;
  score: number;
  drawnStrokes: number;
  orderMistakes?: number;
  durationSec: number;
}

/** Satu baris dialog dalam story theater. */
export interface StoryLine {
  id: string;
  speakerId: string;
  /** Teks Jepang dengan markup furigana {漢字|かんじ}. */
  jp: string;
  /** Bacaan lengkap dalam kana; dipakai untuk TTS dan verifikasi. */
  reading: string;
  romaji: string;
  meaning: string;
  /** Ekspresi karakter saat baris ini diucapkan. */
  expression?: StoryExpression;
  vocabIds?: string[];
  grammarIds?: string[];
  /** Audio rekaman opsional; browser TTS tetap menjadi fallback. */
  audioUrl?: string;
  note?: string;
}

export type StoryExpression = "neutral" | "happy" | "surprised" | "worried" | "thinking";

export type StoryBackground = "station" | "platform" | "train" | "cafe" | "table" | "park-rain" | "library" | "street";

export type StoryStagePosition = "far-left" | "left" | "center" | "right" | "far-right";

export interface StoryStageCharacter {
  characterId: string;
  position: StoryStagePosition;
  expression?: StoryExpression;
  /** Efek masuk; default fade. */
  enter?: "fade" | "slide-left" | "slide-right";
  facing?: "left" | "right";
}

export interface StoryCharacter {
  id: string;
  name: string;
  nameJp: string;
  role: string;
  tone: string;
  hair: string;
  accent: string;
}

export interface StoryScene {
  id: string;
  title: string;
  titleJp: string;
  setting: string;
  background: StoryBackground;
  /** Efek cuaca/dekoratif opsional, dirender CSS tanpa aset video. */
  effect?: "rain" | "snow" | "petals" | null;
  /** Aset video pra-render opsional (same-origin). Bila kosong, adegan dirender SVG/CSS. */
  videoUrl?: string;
  characters: StoryStageCharacter[];
  lines: StoryLine[];
}

export interface StoryQuestion {
  id: string;
  kind: "comprehension" | "listening";
  prompt: string;
  audioText?: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

/** Satu cerita orisinal yang dirender oleh engine scene generik. */
export interface Story {
  id: string;
  title: string;
  titleJp: string;
  summary: string;
  level: JLPTLevel;
  /** 1 = sangat mudah, 5 = menantang. */
  difficulty: 1 | 2 | 3 | 4 | 5;
  minutes: number;
  tags: string[];
  characters: StoryCharacter[];
  scenes: StoryScene[];
  vocabIds: string[];
  grammarIds: string[];
  questions: StoryQuestion[];
  culturalNote?: string;
}

export type StoryMode = "study" | "watch";

export interface StoryAttempt {
  id: string;
  storyId: string;
  level: JLPTLevel;
  mode: StoryMode;
  score: number;
  correct: number;
  total: number;
  scenesCompleted: number;
  durationSec: number;
  completedAt: string;
}

export interface StoryPayload {
  storyId: string;
  mode: StoryMode;
  score: number;
  correct: number;
  total: number;
  scenesCompleted: number;
  durationSec: number;
}

export type LessonProgressKind =
  | "grammar"
  | "reading"
  | "listening"
  | "culture"
  | "vocabulary"
  | "kanji"
  | "sentence"
  | "pronunciation"
  | "kana-set"
  | "game"
  | "typing"
  | "conversation";

export interface LessonProgress {
  lessonId: string;
  kind: LessonProgressKind;
  score: number | null;
  completedAt: string;
}

export interface ReviewLog {
  id: string;
  itemId: string;
  kind: ItemKind;
  rating: number;
  correct: boolean;
  mode: string;
  createdAt: string;
}

export interface ExamSectionResult {
  id: string;
  label: string;
  correct: number;
  total: number;
  score: number;
  points: number;
}

export interface ExamAnswerReview {
  questionId: string;
  prompt: string;
  selectedIndex: number | null;
  answerIndex: number;
  correct: boolean;
  explanation: string;
}

export interface ExamAttempt {
  id: string;
  level: JLPTLevel;
  score: number;
  total: number;
  passed: boolean;
  sections: ExamSectionResult[];
  correct: number;
  answered: number;
  totalQuestions: number;
  durationSec: number;
  startedAt: string;
  finishedAt: string;
  review: ExamAnswerReview[];
}

export interface ActivityDay {
  date: string;
  xp: number;
  reviews: number;
  minutes: number;
}

export interface ProgressStats {
  totalReviews: number;
  correctReviews: number;
  studyMinutes: number;
  lessonsCompleted: number;
  examsTaken: number;
  quizAttempts: number;
  quizAnswers: number;
  quizCorrect: number;
  gameAttempts: number;
  gameCorrect: number;
  gameQuestions: number;
  gameBestScore: number;
  dueCards: number;
  newCardsAvailable: number;
  writingAttempts: number;
  writingCharacters: number;
  writingMastered: number;
  writingOrderMistakes: number;
  storyAttempts: number;
  storiesCompleted: number;
  storyBestScore: number;
}

export interface ProgressSnapshot {
  profile: Profile;
  cards: CardProgress[];
  savedItems: SavedItem[];
  savedCollections: SavedCollection[];
  kana: KanaProgress[];
  lessons: LessonProgress[];
  reviews: ReviewLog[];
  exams: ExamAttempt[];
  quizAttempts: QuizAttempt[];
  questionStats: QuestionStat[];
  games: GameAttempt[];
  activity: ActivityDay[];
  favorites: CultureFavorite[];
  writing: WritingAttempt[];
  stories: StoryAttempt[];
  stats: ProgressStats;
}

export interface SessionPayload {
  xp: number;
  minutes: number;
  reviews?: number;
  source: string;
}

export interface ReviewPayload {
  itemId: string;
  kind: ItemKind;
  rating: number;
  correct: boolean;
  mode: string;
}

/** Menambahkan item ke kartu ulangan tanpa mencatat ulasan atau XP. */
export interface AddCardPayload {
  itemId: string;
  kind: ItemKind;
}

export interface LessonPayload {
  lessonId: string;
  kind: LessonProgress["kind"];
  score?: number | null;
  xp: number;
}

export interface ExamPayload {
  level: JLPTLevel;
  score: number;
  total: number;
  passed: boolean;
  sections: ExamSectionResult[];
  correct: number;
  answered: number;
  totalQuestions: number;
  durationSec: number;
  startedAt: string;
  review: ExamAnswerReview[];
}

/* -------------------------------------------------------------------------- */
/* Domain catalog: courses, lessons, and reusable content references          */
/* -------------------------------------------------------------------------- */

/** Alias semantik untuk level pembelajaran. Saat ini memetakan langsung ke JLPT. */
export type LearningLevel = JLPTLevel;

/** Level katalog; "semua" dipakai konten budaya dan lintas level. */
export type CurriculumLevel = JLPTLevel | "semua";

export type ContentKind =
  | "kana"
  | "vocabulary"
  | "kanji"
  | "grammar"
  | "reading"
  | "listening"
  | "culture"
  | "sentence";

/** Referensi stabil ke satu item konten tanpa menduplikasi isinya. */
export interface ContentRef {
  kind: ContentKind;
  id: string;
  href?: string;
}

export type LessonKind = ContentKind | "practice" | "game" | "exam";

/**
 * Satu unit belajar dalam katalog. Lesson tidak menyimpan konten; ia hanya
 * merujuk item konten melalui ContentRef sehingga konten dapat ditambah tanpa
 * mengubah logika aplikasi.
 */
export interface Lesson {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  titleJp?: string;
  description: string;
  kind: LessonKind;
  level: CurriculumLevel;
  estimateMinutes: number;
  objectives: string[];
  contentRefs: ContentRef[];
  href: string;
  /** Pelajaran dengan alur interaktif di /learn/[lessonId]. */
  interactive?: boolean;
}

export interface CourseModule {
  id: string;
  courseId: string;
  order: number;
  title: string;
  titleJp?: string;
  description: string;
  kind: LessonKind;
  level: CurriculumLevel;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  titleJp: string;
  description: string;
  levels: JLPTLevel[];
  modules: CourseModule[];
}

/* -------------------------------------------------------------------------- */
/* Interactive lesson plans                                                   */
/* -------------------------------------------------------------------------- */

export type LessonTone = "info" | "tip" | "important" | "warning";

/** Satu contoh kalimat/frasa dalam pelajaran interaktif. */
export interface LessonExample {
  jp: string;
  reading?: string;
  romaji?: string;
  meaning: string;
  /** Terjemahan harfiah bila berbeda cukup jauh dari terjemahan natural. */
  literal?: string;
  note?: string;
}

/** Blok penjelasan yang dirender oleh komponen generik, bukan JSX di data. */
export type LessonBlock =
  | { type: "prose"; heading?: string; paragraphs: string[] }
  | { type: "jp-prose"; heading?: string; paragraphs: string[] }
  | {
      type: "dialog";
      heading?: string;
      lines: { speaker: string; jp: string; reading: string; meaning?: string }[];
    }
  | {
      type: "table";
      heading?: string;
      columns: string[];
      rows: { label: string; cells: string[] }[];
    }
  | {
      type: "grid";
      heading?: string;
      columns?: 2 | 3 | 4;
      items: { main: string; sub?: string; extra?: string }[];
    }
  | { type: "kana-grid"; heading?: string; script: KanaScript; chars: string[] }
  | { type: "vocab-list"; heading?: string; wordIds: string[] }
  | { type: "kanji-list"; heading?: string; kanjiIds: string[] }
  | { type: "callout"; tone: LessonTone; title: string; paragraphs: string[] }
  | {
      type: "steps";
      heading?: string;
      items: { title: string; body: string }[];
    };

/** Catatan penting dengan nada visual yang berbeda. */
export interface LessonNote {
  tone: LessonTone;
  title: string;
  body: string[];
}

/**
 * Rencana pelajaran interaktif. Semua materi berada di sini; komponen UI
 * hanya merender bentuk generik sehingga pelajaran baru tidak memerlukan
 * perubahan di halaman atau engine.
 */
export interface LessonPlan {
  id: string;
  title: string;
  titleJp?: string;
  summary: string;
  estimateMinutes: number;
  goals: string[];
  intro: string[];
  explanation: LessonBlock[];
  examples: LessonExample[];
  notes: LessonNote[];
  practice: QuizQuestion[];
  /** Item sumber untuk pelajaran susun kalimat; opsional untuk jenis lain. */
  sourceId?: string;
}

/* -------------------------------------------------------------------------- */
/* Exercise and assessment definitions                                        */
/* -------------------------------------------------------------------------- */

export type ExerciseKind =
  | "multiple-choice"
  | "cloze"
  | "translation"
  | "matching"
  | "reading-recognition"
  | "listening"
  | "ordering"
  | "true-false"
  | "typing";

/**
 * Bentuk bersama semua latihan. Engine tidak pernah membaca field khusus UI;
 * setiap view hanya memakai data yang dibutuhkan jenis latihannya.
 */
export interface ExerciseBase {
  id: string;
  level: JLPTLevel;
  prompt: string;
  /** Petunjuk singkat di atas soal. */
  instructions?: string;
  explanation: string;
  tags: string[];
  contentRef?: ContentRef;
  /** Bobot soal; default 1. Berguna bila satu sesi mencampur soal cepat dan lambat. */
  points?: number;
}

export interface MultipleChoiceExercise extends ExerciseBase {
  kind: "multiple-choice";
  options: string[];
  answerIndex: number;
  promptJp?: string;
  audioText?: string;
  questionType?: QuestionType;
}

export interface ClozeExercise extends ExerciseBase {
  kind: "cloze";
  /** Kalimat dengan bagian kosong, misalnya "私は＿＿です。". */
  text: string;
  answer: string;
  acceptedAnswers: string[];
  hint?: string;
}

export interface TranslationExercise extends ExerciseBase {
  kind: "translation";
  source: string;
  direction: "id-to-ja" | "ja-to-id";
  acceptedAnswers: string[];
  keywords: string[];
  /** Terjemahan contoh yang ditampilkan setelah diperiksa. */
  reference: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
  leftReading?: string;
  leftRomaji?: string;
}

export interface MatchingExercise extends ExerciseBase {
  kind: "matching";
  pairs: MatchingPair[];
}

export interface ReadingRecognitionExercise extends ExerciseBase {
  kind: "reading-recognition";
  word: string;
  options: string[];
  answerIndex: number;
  /** Bacaan lengkap untuk ditampilkan setelah jawaban diperiksa. */
  reading: string;
}

export interface ListeningExercise extends ExerciseBase {
  kind: "listening";
  audioText: string;
  /** Transkrip audio; hanya ditampilkan setelah pemeriksaan. */
  script?: string;
  options: string[];
  answerIndex: number;
  promptJp?: string;
}

export interface OrderingExercise extends ExerciseBase {
  kind: "ordering";
  tokens: string[];
  answer: string[];
  translation?: string;
}

export interface TrueFalseExercise extends ExerciseBase {
  kind: "true-false";
  statement: string;
  promptJp?: string;
  answer: boolean;
  /** Penjelasan tambahan bila pernyataan salah. */
  correction?: string;
}

export interface TypingExercise extends ExerciseBase {
  kind: "typing";
  /** Jawaban utama dalam tulisan Jepang. */
  answer: string;
  acceptedAnswers: string[];
  hint?: string;
  inputMode?: "kana" | "kanji" | "romaji";
  /** Ditampilkan setelah diperiksa, misalnya terjemahan Indonesia. */
  meaning?: string;
}

export type Exercise =
  | MultipleChoiceExercise
  | ClozeExercise
  | TranslationExercise
  | MatchingExercise
  | ReadingRecognitionExercise
  | ListeningExercise
  | OrderingExercise
  | TrueFalseExercise
  | TypingExercise;

export interface MultipleChoiceResponse {
  kind: "multiple-choice" | "reading-recognition" | "listening";
  selectedIndex: number;
}

export interface TextResponse {
  kind: "cloze" | "translation" | "typing";
  text: string;
}

export interface TrueFalseResponse {
  kind: "true-false";
  value: boolean | null;
}

export interface MatchingResponse {
  kind: "matching";
  /** pairId kiri -> pairId kanan. */
  matches: Record<string, string>;
}

export interface OrderingResponse {
  kind: "ordering";
  /** Indeks token pada array tokens, sesuai urutan pilihan pengguna. */
  order: number[];
}

export type ExerciseResponse =
  | MultipleChoiceResponse
  | TextResponse
  | TrueFalseResponse
  | MatchingResponse
  | OrderingResponse;

export interface ExerciseGrade {
  correct: boolean;
  /** 0..1; matching dapat memperoleh skor sebagian. */
  score: number;
  expected: string;
  feedback: string;
}

export interface ExerciseAttemptAnswer {
  exerciseId: string;
  kind: ExerciseKind;
  response: ExerciseResponse;
  correct: boolean;
  score: number;
  timeMs: number;
}

export type ExerciseSessionMode = "practice" | "topic" | "review" | "lesson" | "vocabulary" | "exam";

export interface QuizAttempt {
  id: string;
  mode: ExerciseSessionMode;
  title: string;
  level?: JLPTLevel;
  total: number;
  correct: number;
  score: number;
  durationSec: number;
  startedAt: string;
  finishedAt: string;
  answers: ExerciseAttemptAnswer[];
}

export interface QuestionStat {
  questionId: string;
  attempts: number;
  correct: number;
  wrong: number;
  accuracy: number;
  lastResult: "correct" | "wrong";
  lastAttemptAt: string;
  averageTimeMs: number;
}

export interface QuizAttemptPayload {
  mode: ExerciseSessionMode;
  title: string;
  level?: JLPTLevel;
  durationSec: number;
  startedAt: string;
  answers: ExerciseAttemptAnswer[];
}

export type QuizMode = "practice" | "topic" | "review" | "exam";

/** Definisi kuis yang merujuk question id; engine menyelesaikan id menjadi soal. */
export interface QuizDefinition {
  id: string;
  title: string;
  description: string;
  mode: QuizMode;
  level: CurriculumLevel;
  questionIds: string[];
}

export type ExamSectionId = "moji-goi" | "bunpou-dokkai" | "choukai";

export interface ExamSectionDefinition {
  id: ExamSectionId;
  label: string;
  questionIds: string[];
}

export interface ExamDefinition {
  id: string;
  level: JLPTLevel;
  title: string;
  minutes: number;
  passScore: number;
  sections: ExamSectionDefinition[];
}

/* -------------------------------------------------------------------------- */
/* Games and cultural facts                                                   */
/* -------------------------------------------------------------------------- */

export type GameId =
  | "word-builder"
  | "kana-matching"
  | "vocabulary-rush"
  | "sentence-builder"
  | "kanji-challenge"
  | "daily-challenge";

export type GameDifficulty = "easy" | "standard" | "hard";

export type GameKind = GameId;

export interface GameDefinition {
  id: GameId;
  title: string;
  titleJp?: string;
  description: string;
  objectives: string[];
  kind: GameId;
  level: CurriculumLevel;
  href: string;
  xpReward: number;
}

/** Satu soal yang sudah dinilai, disimpan agar hasil permainan bisa ditinjau. */
export interface GameAnswerDetail {
  id: string;
  prompt: string;
  expected: string;
  response: string;
  correct: boolean;
  explanation: string;
  timeMs?: number;
  hintUsed?: boolean;
}

export interface GameAttempt {
  id: string;
  gameId: GameId;
  difficulty: GameDifficulty;
  score: number;
  correct: number;
  total: number;
  accuracy: number;
  durationSec: number;
  hintsUsed: number;
  details: GameAnswerDetail[];
  startedAt: string;
  playedAt: string;
}

export interface GameAttemptPayload {
  gameId: GameId;
  difficulty: GameDifficulty;
  score: number;
  correct: number;
  total: number;
  durationSec: number;
  hintsUsed?: number;
  details?: GameAnswerDetail[];
  startedAt?: string;
}

/**
 * Fakta budaya yang dapat dipakai ulang. Artikel saat ini menyimpan fakta
 * ringkas secara inline; tipe ini menjadi bentuk kanonis ketika fakta perlu
 * ditautkan atau ditampilkan di luar artikel.
 */
export interface CulturalFact {
  id: string;
  category: CultureCategory;
  title: string;
  value: string;
  note?: string;
}

/* -------------------------------------------------------------------------- */
/* Learning analytics, achievements, bookmarks, and the user aggregate        */
/* -------------------------------------------------------------------------- */

export type LearningAttemptKind = "review" | "quiz" | "lesson" | "game" | "exam" | "pronunciation";

/** Catatan aktivitas belajar yang netral terhadap UI untuk analitik mendatang. */
export interface LearningAttempt {
  id: string;
  kind: LearningAttemptKind;
  activityId: string;
  level?: JLPTLevel;
  startedAt: string;
  finishedAt: string;
  correct: number;
  total: number;
  durationSec: number;
  xp: number;
  source?: string;
}

/** Nama domain untuk state SRS yang saat ini dipersistensikan sebagai CardProgress. */
export type ReviewSchedule = CardProgress;

export type AchievementMetric =
  | "reviews"
  | "streak"
  | "xp"
  | "lessons"
  | "exams"
  | "cards"
  | "kana"
  | "minutes"
  | "level";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  metric: AchievementMetric;
  target: number;
  icon?: string;
}

/** Jenis materi yang dapat disimpan ke kamus pribadi. */
export type SavedItemKind = "vocabulary" | "kanji" | "grammar";

export interface SavedItem {
  kind: SavedItemKind;
  refId: string;
  note: string;
  collectionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedCollection {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedItemPayload {
  kind: SavedItemKind;
  refId: string;
  note?: string;
  collectionId?: string | null;
  remove?: boolean;
}

export interface SavedCollectionPayload {
  id?: string;
  name: string;
  description?: string;
  remove?: boolean;
}

export type BookmarkKind = "vocabulary" | "kanji" | "reading" | "culture";

export interface Bookmark {
  itemId: string;
  kind: BookmarkKind;
  createdAt: string;
}

/** Agregat progres pengguna saat ini; nanti dapat diperluas dengan bookmark. */
export type UserProgress = ProgressSnapshot;