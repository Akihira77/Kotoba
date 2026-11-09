import { KANJI_BY_ID } from "@/content/kanji";
import { VOCAB_BY_ID } from "@/content/vocabulary";
import { CULTURE_BY_ID } from "@/content/culture";
import { GRAMMAR_BY_ID } from "@/content/grammar";
import { WRITING_BY_ID } from "@/lib/writing";
import { STORY_BY_ID } from "@/content/stories";
import type {
  ActivityDay,
  AddCardPayload,
  CardProgress,
  CultureFavorite,
  CultureFavoritePayload,
  ExamAttempt,
  ExamPayload,
  ExerciseAttemptAnswer,
  ExerciseKind,
  ExerciseSessionMode,
  GameAnswerDetail,
  GameAttempt,
  GameAttemptPayload,
  GameDifficulty,
  GameId,
  KanaProgress,
  LessonPayload,
  LessonProgress,
  ProgressSnapshot,
  QuestionStat,
  QuizAttempt,
  QuizAttemptPayload,
  ReviewLog,
  ReviewPayload,
  SavedCollection,
  SavedCollectionPayload,
  SavedItem,
  SavedItemKind,
  SavedItemPayload,
  SessionPayload,
  Settings,
  StoryAttempt,
  StoryPayload,
  WritingAttempt,
  WritingPayload,
} from "@/lib/types";
import { DEFAULT_SETTINGS, XP_RULES } from "@/lib/constants";
import { ALL_EXERCISE_KINDS } from "@/lib/exercise-engine";
import { estimateGameXp } from "@/lib/games/shared";
import { scheduleCard } from "@/lib/srs";
import { toDateKey } from "@/lib/utils";
import { getDb, transaction } from "./db";

type Row = Record<string, unknown>;

function clampInt(value: unknown, min: number, max: number, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(max, Math.max(min, n)));
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

function normalizeSettings(parsed: Partial<Settings> | null | undefined, base: Settings = DEFAULT_SETTINGS): Settings {
  const source = parsed ?? {};
  return {
    dailyGoalXp: clampInt(source.dailyGoalXp, 10, 500, base.dailyGoalXp),
    dailyStudyMinutes: clampInt(source.dailyStudyMinutes, 5, 240, base.dailyStudyMinutes),
    dailyVocabTarget: clampInt(source.dailyVocabTarget, 1, 100, base.dailyVocabTarget),
    dailyLessonTarget: clampInt(source.dailyLessonTarget, 1, 10, base.dailyLessonTarget),
    weeklyFrequency: clampInt(source.weeklyFrequency, 1, 7, base.weeklyFrequency),
    studyTargetLevel: ["N5", "N4", "N3", "N2", "N1"].includes(String(source.studyTargetLevel))
      ? (source.studyTargetLevel as Settings["studyTargetLevel"])
      : null,
    studyTargetWeeks: clampInt(source.studyTargetWeeks, 4, 104, base.studyTargetWeeks),
    theme: ["light", "dark", "system"].includes(String(source.theme)) ? (source.theme as Settings["theme"]) : base.theme,
    showRomaji: typeof source.showRomaji === "boolean" ? source.showRomaji : base.showRomaji,
    showFurigana: typeof source.showFurigana === "boolean" ? source.showFurigana : base.showFurigana,
    speechRate: Math.min(1.5, Math.max(0.5, Number(source.speechRate) || base.speechRate)),
    voiceURI: typeof source.voiceURI === "string" ? source.voiceURI : source.voiceURI === null ? null : base.voiceURI,
    autoPlayAudio: typeof source.autoPlayAudio === "boolean" ? source.autoPlayAudio : base.autoPlayAudio,
  };
}

function readProfile(): ProgressSnapshot["profile"] {
  const db = getDb();
  const row = db.prepare("SELECT * FROM profile WHERE id = 1").get() as Row;
  let settings: Settings = { ...DEFAULT_SETTINGS };
  try {
    settings = normalizeSettings(JSON.parse(str(row.settings, "{}")) as Partial<Settings>);
  } catch {
    settings = { ...DEFAULT_SETTINGS };
  }

  return {
    name: str(row.name, "Pelajar"),
    xp: Number(row.xp) || 0,
    streak: Number(row.streak) || 0,
    bestStreak: Number(row.best_streak) || 0,
    lastStudyDate: row.last_study_date ? str(row.last_study_date) : null,
    settings,
    createdAt: str(row.created_at, new Date().toISOString()),
  };
}

function readCards(): CardProgress[] {
  const rows = getDb().prepare("SELECT * FROM cards").all() as Row[];
  return rows.map((row) => ({
    itemId: str(row.item_id),
    kind: str(row.kind) === "kanji" ? "kanji" : "vocab",
    ease: Number(row.ease) || 2.5,
    intervalDays: Number(row.interval_days) || 0,
    dueAt: str(row.due_at, new Date().toISOString()),
    reps: Number(row.reps) || 0,
    lapses: Number(row.lapses) || 0,
    lastRating: row.last_rating === null ? null : Number(row.last_rating),
    lastReviewedAt: row.last_reviewed_at ? str(row.last_reviewed_at) : null,
  }));
}

function readKana(): KanaProgress[] {
  const rows = getDb().prepare("SELECT * FROM kana_progress").all() as Row[];
  return rows.map((row) => ({
    char: str(row.char),
    script: str(row.script) === "katakana" ? "katakana" : "hiragana",
    correct: Number(row.correct) || 0,
    wrong: Number(row.wrong) || 0,
    mastery: Number(row.mastery) || 0,
    lastSeen: row.last_seen ? str(row.last_seen) : null,
  }));
}

function readLessons(): LessonProgress[] {
  const rows = getDb().prepare("SELECT * FROM lessons ORDER BY completed_at DESC").all() as Row[];
  return rows.map((row) => ({
    lessonId: str(row.lesson_id),
    kind: str(row.kind, "grammar") as LessonProgress["kind"],
    score: row.score === null ? null : Number(row.score),
    completedAt: str(row.completed_at),
  }));
}

function readReviews(limit = 120): ReviewLog[] {
  const rows = getDb()
    .prepare("SELECT * FROM reviews ORDER BY created_at DESC LIMIT ?")
    .all(limit) as Row[];
  return rows.map((row) => ({
    id: str(row.id),
    itemId: str(row.item_id),
    kind: str(row.kind) === "kanji" ? "kanji" : "vocab",
    rating: Number(row.rating) || 0,
    correct: Boolean(Number(row.correct)),
    mode: str(row.mode, "review"),
    createdAt: str(row.created_at),
  }));
}

function readExams(limit = 20): ExamAttempt[] {
  const rows = getDb()
    .prepare("SELECT * FROM exams ORDER BY finished_at DESC LIMIT ?")
    .all(limit) as Row[];
  return rows.map((row) => ({
    id: str(row.id),
    level: str(row.level, "N5") as ExamAttempt["level"],
    score: Number(row.score) || 0,
    total: Number(row.total) || 180,
    passed: Boolean(Number(row.passed)),
    sections: safeJson(row.sections, []),
    correct: Number(row.correct) || 0,
    answered: Number(row.answered) || 0,
    totalQuestions: Number(row.total_questions) || 0,
    durationSec: Number(row.duration_sec) || 0,
    startedAt: str(row.started_at),
    finishedAt: str(row.finished_at),
    review: safeJson(row.review, []),
  }));
}

function readActivity(limit = 400): ActivityDay[] {
  const rows = getDb()
    .prepare("SELECT * FROM activity ORDER BY date DESC LIMIT ?")
    .all(limit) as Row[];
  return rows.map((row) => ({
    date: str(row.date),
    xp: Number(row.xp) || 0,
    reviews: Number(row.reviews) || 0,
    minutes: Number(row.minutes) || 0,
  }));
}

const SESSION_MODES: ExerciseSessionMode[] = ["practice", "topic", "review", "lesson", "vocabulary", "exam"];

const GAME_IDS: GameId[] = ["word-builder", "kana-matching", "vocabulary-rush", "sentence-builder", "kanji-challenge", "daily-challenge"];
const GAME_DIFFICULTIES: GameDifficulty[] = ["easy", "standard", "hard"];

function readQuizAttempts(limit = 30): QuizAttempt[] {
  const rows = getDb()
    .prepare("SELECT * FROM quiz_attempts ORDER BY finished_at DESC LIMIT ?")
    .all(limit) as Row[];
  return rows.map((row) => ({
    id: str(row.id),
    mode: SESSION_MODES.includes(str(row.mode) as ExerciseSessionMode)
      ? (str(row.mode) as ExerciseSessionMode)
      : "practice",
    title: str(row.title, "Latihan"),
    level: ["N5", "N4", "N3", "N2", "N1"].includes(str(row.level)) ? (str(row.level) as QuizAttempt["level"]) : undefined,
    total: Number(row.total) || 0,
    correct: Number(row.correct) || 0,
    score: Number(row.score) || 0,
    durationSec: Number(row.duration_sec) || 0,
    startedAt: str(row.started_at),
    finishedAt: str(row.finished_at),
    answers: safeJson<ExerciseAttemptAnswer[]>(row.answers, []),
  }));
}

function readGames(limit = 100): GameAttempt[] {
  const rows = getDb()
    .prepare("SELECT * FROM game_attempts ORDER BY played_at DESC LIMIT ?")
    .all(limit) as Row[];
  return rows.map((row) => ({
    id: str(row.id),
    gameId: GAME_IDS.includes(str(row.game_id) as GameId) ? (str(row.game_id) as GameId) : "word-builder",
    difficulty: GAME_DIFFICULTIES.includes(str(row.difficulty) as GameDifficulty)
      ? (str(row.difficulty) as GameDifficulty)
      : "standard",
    score: Number(row.score) || 0,
    correct: Number(row.correct) || 0,
    total: Number(row.total) || 0,
    accuracy: Number(row.accuracy) || 0,
    durationSec: Number(row.duration_sec) || 0,
    hintsUsed: Number(row.hints_used) || 0,
    details: safeJson<GameAnswerDetail[]>(row.details, []),
    startedAt: str(row.started_at),
    playedAt: str(row.played_at),
  }));
}

function readFavorites(): CultureFavorite[] {
  const rows = getDb()
    .prepare("SELECT * FROM culture_favorites ORDER BY saved_at DESC")
    .all() as Row[];
  return rows.map((row) => ({
    articleId: str(row.article_id),
    savedAt: str(row.saved_at),
  }));
}

function readWriting(limit = 400): WritingAttempt[] {
  const rows = getDb()
    .prepare("SELECT * FROM writing_attempts ORDER BY created_at DESC LIMIT ?")
    .all(limit) as Row[];
  return rows.map((row) => ({
    id: str(row.id),
    characterId: str(row.character_id),
    script: str(row.script, "hiragana") as WritingAttempt["script"],
    mode: str(row.mode, "guided") as WritingAttempt["mode"],
    score: Number(row.score) || 0,
    expectedStrokes: Number(row.expected_strokes) || 0,
    drawnStrokes: Number(row.drawn_strokes) || 0,
    orderMistakes: Number(row.order_mistakes) || 0,
    durationSec: Number(row.duration_sec) || 0,
    createdAt: str(row.created_at),
  }));
}

function readStories(limit = 300): StoryAttempt[] {
  const rows = getDb()
    .prepare("SELECT * FROM story_attempts ORDER BY completed_at DESC LIMIT ?")
    .all(limit) as Row[];
  return rows.map((row) => ({
    id: str(row.id),
    storyId: str(row.story_id),
    level: str(row.level, "N5") as StoryAttempt["level"],
    mode: str(row.mode, "study") as StoryAttempt["mode"],
    score: Number(row.score) || 0,
    correct: Number(row.correct) || 0,
    total: Number(row.total) || 0,
    scenesCompleted: Number(row.scenes_completed) || 0,
    durationSec: Number(row.duration_sec) || 0,
    completedAt: str(row.completed_at),
  }));
}

function readSavedItems(): SavedItem[] {
  const rows = getDb()
    .prepare("SELECT * FROM saved_items ORDER BY updated_at DESC")
    .all() as Row[];
  return rows.map((row) => ({
    kind: str(row.kind, "vocabulary") as SavedItemKind,
    refId: str(row.ref_id),
    note: str(row.note),
    collectionId: row.collection_id ? str(row.collection_id) : null,
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  }));
}

function readSavedCollections(): SavedCollection[] {
  const rows = getDb()
    .prepare("SELECT * FROM saved_collections ORDER BY updated_at DESC")
    .all() as Row[];
  return rows.map((row) => ({
    id: str(row.id),
    name: str(row.name),
    description: str(row.description),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  }));
}

function readQuestionStats(): QuestionStat[] {
  const rows = getDb()
    .prepare("SELECT * FROM question_stats ORDER BY last_attempt_at DESC LIMIT 2000")
    .all() as Row[];
  return rows.map((row) => {
    const attempts = Number(row.attempts) || 0;
    const correct = Number(row.correct) || 0;
    return {
      questionId: str(row.question_id),
      attempts,
      correct,
      wrong: Number(row.wrong) || 0,
      accuracy: attempts === 0 ? 0 : Math.round((correct / attempts) * 100),
      lastResult: str(row.last_result) === "correct" ? "correct" : "wrong",
      lastAttemptAt: str(row.last_attempt_at),
      averageTimeMs: attempts === 0 ? 0 : Math.round((Number(row.total_time_ms) || 0) / attempts),
    };
  });
}

function safeJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getSnapshot(): ProgressSnapshot {
  const db = getDb();
  const profile = readProfile();
  const cards = readCards();
  const now = Date.now();
  const dueCards = cards.filter((card) => new Date(card.dueAt).getTime() <= now).length;

  const totals = db
    .prepare(
      `SELECT
         COALESCE(SUM(reviews), 0) AS total_reviews,
         COALESCE(SUM(minutes), 0) AS study_minutes
       FROM activity`,
    )
    .get() as Row;
  const lessonCount = db.prepare("SELECT COUNT(*) AS c FROM lessons").get() as Row;
  const examCount = db.prepare("SELECT COUNT(*) AS c FROM exams").get() as Row;
  const correctReviews = db
    .prepare("SELECT COUNT(*) AS c FROM reviews WHERE correct = 1")
    .get() as Row;
  const quizTotals = db
    .prepare(
      `SELECT
         COUNT(*) AS attempts,
         COALESCE(SUM(total), 0) AS answers,
         COALESCE(SUM(correct), 0) AS correct
       FROM quiz_attempts`,
    )
    .get() as Row;
  const gameTotals = db
    .prepare(
      `SELECT
         COUNT(*) AS attempts,
         COALESCE(SUM(correct), 0) AS correct,
         COALESCE(SUM(total), 0) AS questions,
         COALESCE(MAX(score), 0) AS best
       FROM game_attempts`,
    )
    .get() as Row;
  const writingTotals = db
    .prepare(
      `SELECT
         COUNT(*) AS attempts,
         COUNT(DISTINCT character_id) AS characters,
         COUNT(DISTINCT CASE WHEN score >= 80 THEN character_id END) AS mastered,
         COALESCE(SUM(order_mistakes), 0) AS mistakes
       FROM writing_attempts`,
    )
    .get() as Row;
  const storyTotals = db
    .prepare(
      `SELECT
         COUNT(*) AS attempts,
         COUNT(DISTINCT story_id) AS stories,
         COUNT(DISTINCT CASE WHEN score >= 60 THEN story_id END) AS completed,
         COALESCE(MAX(score), 0) AS best
       FROM story_attempts`,
    )
    .get() as Row;

  return {
    profile,
    cards,
    savedItems: readSavedItems(),
    savedCollections: readSavedCollections(),
    kana: readKana(),
    lessons: readLessons(),
    reviews: readReviews(),
    exams: readExams(),
    quizAttempts: readQuizAttempts(),
    questionStats: readQuestionStats(),
    games: readGames(),
    activity: readActivity(),
    favorites: readFavorites(),
    writing: readWriting(),
    stories: readStories(),
    stats: {
      totalReviews: Number(totals.total_reviews) || 0,
      correctReviews: Number(correctReviews.c) || 0,
      studyMinutes: Number(totals.study_minutes) || 0,
      lessonsCompleted: Number(lessonCount.c) || 0,
      examsTaken: Number(examCount.c) || 0,
      quizAttempts: Number(quizTotals.attempts) || 0,
      quizAnswers: Number(quizTotals.answers) || 0,
      quizCorrect: Number(quizTotals.correct) || 0,
      gameAttempts: Number(gameTotals.attempts) || 0,
      gameCorrect: Number(gameTotals.correct) || 0,
      gameQuestions: Number(gameTotals.questions) || 0,
      gameBestScore: Number(gameTotals.best) || 0,
      writingAttempts: Number(writingTotals.attempts) || 0,
      writingCharacters: Number(writingTotals.characters) || 0,
      writingMastered: Number(writingTotals.mastered) || 0,
      writingOrderMistakes: Number(writingTotals.mistakes) || 0,
      storyAttempts: Number(storyTotals.attempts) || 0,
      storiesCompleted: Number(storyTotals.completed) || 0,
      storyBestScore: Number(storyTotals.best) || 0,
      dueCards,
      newCardsAvailable: 0,
    },
  };
}

function touchActivity(
  db: ReturnType<typeof getDb>,
  delta: { xp?: number; reviews?: number; minutes?: number },
  date = todayKey(),
): void {
  const xp = Math.max(0, Math.round(delta.xp ?? 0));
  const reviews = Math.max(0, Math.round(delta.reviews ?? 0));
  const minutes = Math.max(0, Math.round(delta.minutes ?? 0));
  db.prepare(
    `INSERT INTO activity (date, xp, reviews, minutes) VALUES (?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       xp = xp + excluded.xp,
       reviews = reviews + excluded.reviews,
       minutes = minutes + excluded.minutes`,
  ).run(date, xp, reviews, minutes);
}

function touchStudy(db: ReturnType<typeof getDb>, xpDelta: number, minutesDelta = 0): void {
  const profile = readProfile();
  const today = todayKey();
  const yesterday = toDateKey(new Date(Date.now() - 86400000));
  let streak = profile.streak;
  if (profile.lastStudyDate !== today) {
    streak = profile.lastStudyDate === yesterday ? profile.streak + 1 : 1;
  }
  const bestStreak = Math.max(profile.bestStreak, streak);
  db.prepare(
    `UPDATE profile SET xp = xp + ?, streak = ?, best_streak = ?, last_study_date = ? WHERE id = 1`,
  ).run(Math.max(0, Math.round(xpDelta)), streak, bestStreak, today);
  touchActivity(db, { xp: xpDelta, minutes: minutesDelta });
}

export function recordSession(payload: SessionPayload): ProgressSnapshot {
  const xp = clampInt(payload.xp, 0, 2000);
  const minutes = clampInt(payload.minutes, 0, 600);
  const reviews = clampInt(payload.reviews, 0, 1000);
  transaction((db) => {
    touchStudy(db, xp, minutes);
    if (reviews > 0) touchActivity(db, { reviews });
  });
  return getSnapshot();
}

export function recordWriting(payload: WritingPayload): ProgressSnapshot {
  const character = WRITING_BY_ID.get(str(payload.characterId).slice(0, 160));
  if (!character) throw new Error("Karakter menulis tidak ditemukan");
  const mode = payload.mode === "free" ? "free" : "guided";
  const score = clampInt(payload.score, 0, 100);
  const drawnStrokes = clampInt(payload.drawnStrokes, 0, 80);
  const orderMistakes = clampInt(payload.orderMistakes, 0, 80);
  const durationSec = clampInt(payload.durationSec, 0, 3600);
  const expectedStrokes = character.strokeCount;
  let firstAttempt = false;

  transaction((db) => {
    const existing = db
      .prepare("SELECT 1 AS present FROM writing_attempts WHERE character_id = ? LIMIT 1")
      .get(character.id);
    firstAttempt = !existing;
    db.prepare(
      `INSERT INTO writing_attempts
        (id, character_id, script, mode, score, expected_strokes, drawn_strokes, order_mistakes, duration_sec, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      `wrt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      character.id,
      character.script,
      mode,
      score,
      expectedStrokes,
      drawnStrokes,
      orderMistakes,
      durationSec,
      new Date().toISOString(),
    );
    touchStudy(db, firstAttempt ? (XP_RULES.lesson.writing ?? 0) : 0, Math.max(1, Math.round(durationSec / 60)));
  });

  return getSnapshot();
}

export function recordStory(payload: StoryPayload): ProgressSnapshot {
  const story = STORY_BY_ID.get(str(payload.storyId).slice(0, 120));
  if (!story) throw new Error("Cerita tidak ditemukan");
  const mode = payload.mode === "watch" ? "watch" : "study";
  const total = clampInt(payload.total, 1, 20);
  const correct = clampInt(payload.correct, 0, total);
  const score = clampInt(payload.score, 0, 100);
  const scenesCompleted = clampInt(payload.scenesCompleted, 1, 30);
  const durationSec = clampInt(payload.durationSec, 0, 3600);
  let firstAttempt = false;

  transaction((db) => {
    const existing = db
      .prepare("SELECT 1 AS present FROM story_attempts WHERE story_id = ? LIMIT 1")
      .get(story.id);
    firstAttempt = !existing;
    db.prepare(
      `INSERT INTO story_attempts
        (id, story_id, level, mode, score, correct, total, scenes_completed, duration_sec, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      `st_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      story.id,
      story.level,
      mode,
      score,
      correct,
      total,
      Math.min(scenesCompleted, story.scenes.length),
      durationSec,
      new Date().toISOString(),
    );
    touchStudy(db, firstAttempt ? (XP_RULES.lesson.story ?? 0) : 0, Math.max(1, Math.round(durationSec / 60)));
  });

  return getSnapshot();
}

export function recordReview(payload: ReviewPayload): ProgressSnapshot {
  const rating = clampInt(payload.rating, 0, 3);
  const kind = payload.kind === "kanji" ? "kanji" : "vocab";
  const itemId = str(payload.itemId).slice(0, 120);
  if (!itemId) throw new Error("itemId wajib diisi");
  const correct = rating >= 2;
  const xp = correct ? 10 : 3;

  transaction((db) => {
    const existing = db.prepare("SELECT * FROM cards WHERE item_id = ?").get(itemId) as Row | undefined;
    const base: CardProgress = existing
      ? {
          itemId,
          kind,
          ease: Number(existing.ease) || 2.5,
          intervalDays: Number(existing.interval_days) || 0,
          dueAt: str(existing.due_at, new Date().toISOString()),
          reps: Number(existing.reps) || 0,
          lapses: Number(existing.lapses) || 0,
          lastRating: existing.last_rating === null ? null : Number(existing.last_rating),
          lastReviewedAt: existing.last_reviewed_at ? str(existing.last_reviewed_at) : null,
        }
      : {
          itemId,
          kind,
          ease: 2.5,
          intervalDays: 0,
          dueAt: new Date().toISOString(),
          reps: 0,
          lapses: 0,
          lastRating: null,
          lastReviewedAt: null,
        };

    const next = scheduleCard(base, rating as 0 | 1 | 2 | 3);
    db.prepare(
      `INSERT INTO cards (item_id, kind, ease, interval_days, due_at, reps, lapses, last_rating, last_reviewed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(item_id) DO UPDATE SET
         kind = excluded.kind,
         ease = excluded.ease,
         interval_days = excluded.interval_days,
         due_at = excluded.due_at,
         reps = excluded.reps,
         lapses = excluded.lapses,
         last_rating = excluded.last_rating,
         last_reviewed_at = excluded.last_reviewed_at`,
    ).run(
      itemId,
      kind,
      next.ease,
      next.intervalDays,
      next.dueAt,
      next.reps,
      next.lapses,
      next.lastRating,
      next.lastReviewedAt,
    );

    db.prepare(
      "INSERT INTO reviews (id, item_id, kind, rating, correct, mode, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ).run(
      `rev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      itemId,
      kind,
      rating,
      correct ? 1 : 0,
      str(payload.mode, "review").slice(0, 40),
      next.lastReviewedAt ?? new Date().toISOString(),
    );

    touchStudy(db, xp);
    touchActivity(db, { reviews: 1 });
  });

  return getSnapshot();
}

/** Menambahkan kartu baru secara idempoten, tanpa XP dan tanpa mencatat ulasan. */
export function addCard(payload: AddCardPayload): ProgressSnapshot {
  const kind = payload.kind === "kanji" ? "kanji" : "vocab";
  const itemId = str(payload.itemId).slice(0, 120);
  if (!itemId) throw new Error("itemId wajib diisi");
  const exists = kind === "kanji" ? KANJI_BY_ID.has(itemId) : VOCAB_BY_ID.has(itemId);
  if (!exists) throw new Error("Item tidak ditemukan pada katalog Kotoba");
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO cards (item_id, kind, ease, interval_days, due_at, reps, lapses, last_rating, last_reviewed_at)
       VALUES (?, ?, 2.5, 0, ?, 0, 0, NULL, NULL)
       ON CONFLICT(item_id) DO NOTHING`,
    )
    .run(itemId, kind, now);
  return getSnapshot();
}

export function recordKana(payload: { char: string; script: string; correct: boolean }): ProgressSnapshot {
  const char = str(payload.char).slice(0, 4);
  if (!char) throw new Error("Karakter kana wajib diisi");
  const script = payload.script === "katakana" ? "katakana" : "hiragana";
  const correct = Boolean(payload.correct);
  const xp = correct ? 4 : 2;

  transaction((db) => {
    const row = db.prepare("SELECT * FROM kana_progress WHERE char = ?").get(char) as Row | undefined;
    const prevCorrect = Number(row?.correct) || 0;
    const prevWrong = Number(row?.wrong) || 0;
    const prevMastery = Number(row?.mastery) || 0;
    const mastery = correct ? Math.min(5, prevMastery + 1) : Math.max(0, prevMastery - 1);
    db.prepare(
      `INSERT INTO kana_progress (char, script, correct, wrong, mastery, last_seen)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(char) DO UPDATE SET
         script = excluded.script,
         correct = excluded.correct,
         wrong = excluded.wrong,
         mastery = excluded.mastery,
         last_seen = excluded.last_seen`,
    ).run(
      char,
      script,
      prevCorrect + (correct ? 1 : 0),
      prevWrong + (correct ? 0 : 1),
      mastery,
      new Date().toISOString(),
    );
    touchStudy(db, xp);
  });

  return getSnapshot();
}

export function recordLesson(payload: LessonPayload): ProgressSnapshot {
  const lessonId = str(payload.lessonId).slice(0, 160);
  if (!lessonId) throw new Error("lessonId wajib diisi");
  const kind = [
    "grammar",
    "reading",
    "listening",
    "culture",
    "vocabulary",
    "kanji",
    "sentence",
    "pronunciation",
    "kana-set",
    "game",
    "typing",
    "conversation",
  ].includes(payload.kind)
    ? payload.kind
    : "grammar";
  const score = payload.score === undefined || payload.score === null ? null : clampInt(payload.score, 0, 100);
  let firstCompletion = false;

  transaction((db) => {
    const existing = db.prepare("SELECT lesson_id FROM lessons WHERE lesson_id = ?").get(lessonId);
    db.prepare(
      `INSERT INTO lessons (lesson_id, kind, score, completed_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(lesson_id) DO UPDATE SET
         kind = excluded.kind,
         score = COALESCE(excluded.score, lessons.score),
         completed_at = excluded.completed_at`,
    ).run(lessonId, kind, score, new Date().toISOString());
    firstCompletion = !existing;
    if (firstCompletion) {
      // XP penyelesaian lesson ditentukan server dari jenisnya; payload klien
      // tidak boleh menaikkan hadiah pertama kali.
      const xp = XP_RULES.lesson[kind] ?? 0;
      touchStudy(db, xp);
    }
  });

  return getSnapshot();
}

export function recordExam(payload: ExamPayload): ProgressSnapshot {
  const level = ["N5", "N4", "N3", "N2", "N1"].includes(payload.level) ? payload.level : "N5";
  const total = clampInt(payload.total, 1, 300, 180);
  const score = clampInt(payload.score, 0, total);
  const correct = clampInt(payload.correct, 0, 500);
  const answered = clampInt(payload.answered, 0, 500);
  const totalQuestions = clampInt(payload.totalQuestions, 0, 500);
  const durationSec = clampInt(payload.durationSec, 0, 60 * 60 * 4);
  const passed = Boolean(payload.passed);
  const sections = Array.isArray(payload.sections) ? payload.sections.slice(0, 6) : [];
  const review = Array.isArray(payload.review) ? payload.review.slice(0, 300) : [];
  const now = new Date().toISOString();
  const xp = 40 + Math.round((score / total) * 60);

  transaction((db) => {
    db.prepare(
      `INSERT INTO exams (id, level, score, total, passed, sections, correct, answered, total_questions, duration_sec, started_at, finished_at, review)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      `exam_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      level,
      score,
      total,
      passed ? 1 : 0,
      JSON.stringify(sections),
      correct,
      answered,
      totalQuestions,
      durationSec,
      str(payload.startedAt, now),
      now,
      JSON.stringify(review),
    );
    touchStudy(db, xp, Math.round(durationSec / 60));
  });

  return getSnapshot();
}

export function recordQuizAttempt(payload: QuizAttemptPayload): ProgressSnapshot {
  const mode: ExerciseSessionMode = SESSION_MODES.includes(payload.mode) ? payload.mode : "practice";
  const title = str(payload.title, "Latihan").slice(0, 160) || "Latihan";
  const level = ["N5", "N4", "N3", "N2", "N1"].includes(str(payload.level))
    ? (str(payload.level) as QuizAttempt["level"])
    : undefined;
  const rawAnswers = Array.isArray(payload.answers) ? payload.answers.slice(0, 100) : [];
  if (rawAnswers.length === 0) throw new Error("Jawaban kuis wajib diisi");

  const now = new Date().toISOString();
  const answers: ExerciseAttemptAnswer[] = rawAnswers.map((answer) => {
    const kind: ExerciseKind = ALL_EXERCISE_KINDS.includes(answer.kind) ? answer.kind : "multiple-choice";
    const correct = Boolean(answer.correct);
    const score = Number.isFinite(answer.score) ? Math.max(0, Math.min(1, answer.score)) : correct ? 1 : 0;
    const timeMs = clampInt(answer.timeMs, 0, 10 * 60 * 1000);
    const response =
      answer.response && typeof answer.response === "object"
        ? answer.response
        : ({ kind: "multiple-choice", selectedIndex: -1 } as ExerciseAttemptAnswer["response"]);
    return {
      exerciseId: str(answer.exerciseId, "unknown").slice(0, 160) || "unknown",
      kind,
      response,
      correct,
      score,
      timeMs,
    };
  });

  const total = answers.length;
  const correct = answers.filter((answer) => answer.correct).length;
  const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
  const score = total === 0 ? 0 : Math.round((totalScore / total) * 100);
  const durationSec = clampInt(payload.durationSec, 0, 60 * 60 * 4);
  const startedAt = str(payload.startedAt, now);
  const id = `quiz_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const xp = mode === "lesson" || mode === "exam" ? 0 : XP_RULES.quizBase + Math.round((score / 100) * XP_RULES.quizBonusMax);

  transaction((db) => {
    db.prepare(
      `INSERT INTO quiz_attempts (id, mode, title, level, total, correct, score, duration_sec, started_at, finished_at, answers)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, mode, title, level ?? null, total, correct, score, durationSec, startedAt, now, JSON.stringify(answers));

    const upsertStat = db.prepare(
      `INSERT INTO question_stats (question_id, attempts, correct, wrong, last_result, last_attempt_at, total_time_ms)
       VALUES (?, 1, ?, ?, ?, ?, ?)
       ON CONFLICT(question_id) DO UPDATE SET
         attempts = attempts + 1,
         correct = correct + excluded.correct,
         wrong = wrong + excluded.wrong,
         last_result = excluded.last_result,
         last_attempt_at = excluded.last_attempt_at,
         total_time_ms = total_time_ms + excluded.total_time_ms`,
    );
    for (const answer of answers) {
      upsertStat.run(
        answer.exerciseId,
        answer.correct ? 1 : 0,
        answer.correct ? 0 : 1,
        answer.correct ? "correct" : "wrong",
        now,
        answer.timeMs,
      );
    }

    touchStudy(db, xp, Math.round(durationSec / 60));
  });

  return getSnapshot();
}

export function recordGame(payload: GameAttemptPayload): ProgressSnapshot {
  const gameId = GAME_IDS.includes(payload.gameId) ? payload.gameId : null;
  if (!gameId) throw new Error("Permainan tidak dikenal");
  const difficulty = GAME_DIFFICULTIES.includes(payload.difficulty) ? payload.difficulty : "standard";
  const total = clampInt(payload.total, 0, 200, 0);
  if (total <= 0) throw new Error("Jumlah soal permainan wajib diisi");
  const correct = clampInt(payload.correct, 0, total);
  const score = clampInt(payload.score, 0, 100000);
  const durationSec = clampInt(payload.durationSec, 0, 60 * 60 * 2);
  const hintsUsed = clampInt(payload.hintsUsed, 0, 100);
  const accuracy = Math.round((correct / total) * 100);
  const now = new Date().toISOString();
  const startedAt = str(payload.startedAt, now);
  const id = `game_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const rawDetails = Array.isArray(payload.details) ? payload.details.slice(0, 100) : [];
  const details: GameAnswerDetail[] = rawDetails.map((detail, index) => ({
    id: str(detail.id, `detail-${index}`).slice(0, 160),
    prompt: str(detail.prompt).slice(0, 500),
    expected: str(detail.expected).slice(0, 400),
    response: str(detail.response).slice(0, 400),
    correct: Boolean(detail.correct),
    explanation: str(detail.explanation).slice(0, 1000),
    timeMs: clampInt(detail.timeMs, 0, 10 * 60 * 1000),
    hintUsed: Boolean(detail.hintUsed),
  }));
  const xp = estimateGameXp(correct, total, difficulty);

  transaction((db) => {
    db.prepare(
      `INSERT INTO game_attempts (id, game_id, difficulty, score, correct, total, accuracy, duration_sec, hints_used, details, started_at, played_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      gameId,
      difficulty,
      score,
      correct,
      total,
      accuracy,
      durationSec,
      hintsUsed,
      JSON.stringify(details),
      startedAt,
      now,
    );
    touchStudy(db, xp, Math.max(1, Math.round(durationSec / 60)));
  });

  return getSnapshot();
}

export function updateSettings(settings: Settings): ProgressSnapshot {
  const db = getDb();
  const current = readProfile().settings;
  const next = normalizeSettings(settings, current);
  db.prepare("UPDATE profile SET settings = ? WHERE id = 1").run(JSON.stringify(next));
  return getSnapshot();
}

export function renameProfile(name: string): ProgressSnapshot {
  const clean = str(name).trim().slice(0, 40) || "Pelajar";
  getDb().prepare("UPDATE profile SET name = ? WHERE id = 1").run(clean);
  return getSnapshot();
}

export function resetProgress(): ProgressSnapshot {
  transaction((db) => {
    db.exec("DELETE FROM cards; DELETE FROM kana_progress; DELETE FROM lessons; DELETE FROM reviews; DELETE FROM exams; DELETE FROM quiz_attempts; DELETE FROM question_stats; DELETE FROM game_attempts; DELETE FROM activity; DELETE FROM culture_favorites; DELETE FROM saved_items; DELETE FROM saved_collections; DELETE FROM writing_attempts; DELETE FROM story_attempts;");
    db.prepare(
      "UPDATE profile SET xp = 0, streak = 0, best_streak = 0, last_study_date = NULL WHERE id = 1",
    ).run();
  });
  return getSnapshot();
}

export function exportSnapshot(): ProgressSnapshot {
  return getSnapshot();
}

export function toggleCultureFavorite(payload: CultureFavoritePayload): ProgressSnapshot {
  const articleId = str(payload.articleId).slice(0, 120);
  if (!articleId || !CULTURE_BY_ID.has(articleId)) {
    throw new Error("Artikel budaya tidak dikenal");
  }
  transaction((db) => {
    if (payload.favorite) {
      db.prepare(
        "INSERT INTO culture_favorites (article_id, saved_at) VALUES (?, ?) ON CONFLICT(article_id) DO NOTHING",
      ).run(articleId, new Date().toISOString());
    } else {
      db.prepare("DELETE FROM culture_favorites WHERE article_id = ?").run(articleId);
    }
  });
  return getSnapshot();
}

function savedItemExists(kind: SavedItemKind, refId: string): boolean {
  if (kind === "vocabulary") return VOCAB_BY_ID.has(refId);
  if (kind === "kanji") return KANJI_BY_ID.has(refId);
  return GRAMMAR_BY_ID.has(refId);
}

/** Menyimpan, memperbarui, atau menghapus satu materi di kamus pribadi. */
export function saveSavedItem(payload: SavedItemPayload): ProgressSnapshot {
  const kind: SavedItemKind =
    payload.kind === "kanji" || payload.kind === "grammar" ? payload.kind : "vocabulary";
  const refId = str(payload.refId).slice(0, 120);
  if (!refId || !savedItemExists(kind, refId)) throw new Error("Materi tidak ditemukan pada katalog Kotoba");

  transaction((db) => {
    if (payload.remove) {
      db.prepare("DELETE FROM saved_items WHERE kind = ? AND ref_id = ?").run(kind, refId);
      return;
    }
    const existing = db
      .prepare("SELECT * FROM saved_items WHERE kind = ? AND ref_id = ?")
      .get(kind, refId) as Row | undefined;
    const note =
      payload.note === undefined ? str(existing?.note) : str(payload.note).trim().slice(0, 1000);
    let collectionId: string | null =
      payload.collectionId === undefined
        ? existing?.collection_id
          ? str(existing.collection_id)
          : null
        : payload.collectionId
          ? str(payload.collectionId).slice(0, 60)
          : null;
    if (collectionId && !db.prepare("SELECT id FROM saved_collections WHERE id = ?").get(collectionId)) {
      collectionId = null;
    }
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO saved_items (kind, ref_id, note, collection_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(kind, ref_id) DO UPDATE SET
         note = excluded.note,
         collection_id = excluded.collection_id,
         updated_at = excluded.updated_at`,
    ).run(kind, refId, note, collectionId, str(existing?.created_at, now), now);
  });
  return getSnapshot();
}

/** Membuat, memperbarui, atau menghapus koleksi kamus pribadi. */
export function saveSavedCollection(payload: SavedCollectionPayload): ProgressSnapshot {
  const name = str(payload.name).trim().slice(0, 60);
  const description = str(payload.description).trim().slice(0, 240);
  const id = str(payload.id).slice(0, 60);
  transaction((db) => {
    if (payload.remove) {
      if (!id) throw new Error("Koleksi tidak ditemukan");
      db.prepare("DELETE FROM saved_collections WHERE id = ?").run(id);
      db.prepare("UPDATE saved_items SET collection_id = NULL WHERE collection_id = ?").run(id);
      return;
    }
    if (!name) throw new Error("Nama koleksi wajib diisi");
    const now = new Date().toISOString();
    if (id) {
      const existing = db.prepare("SELECT * FROM saved_collections WHERE id = ?").get(id) as Row | undefined;
      if (!existing) throw new Error("Koleksi tidak ditemukan");
      db.prepare("UPDATE saved_collections SET name = ?, description = ?, updated_at = ? WHERE id = ?").run(
        name,
        payload.description === undefined ? str(existing.description) : description,
        now,
        id,
      );
    } else {
      db.prepare(
        "INSERT INTO saved_collections (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      ).run(`col_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`, name, description, now, now);
    }
  });
  return getSnapshot();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const IMPORT_ARRAY_LIMITS: Record<string, number> = {
  cards: 20000,
  kana: 1000,
  lessons: 5000,
  reviews: 5000,
  exams: 500,
  quizAttempts: 1000,
  questionStats: 5000,
  games: 500,
  activity: 1000,
  favorites: 2000,
  savedCollections: 200,
  savedItems: 5000,
  writing: 5000,
  stories: 1000,
};

const IMPORT_LESSON_KINDS = new Set([
  "grammar", "reading", "listening", "culture", "vocabulary", "kanji",
  "sentence", "pronunciation", "kana-set", "game", "typing", "conversation",
]);

/**
 * Rejects malformed or destructive imports before any transaction starts.
 * Import replaces every progress table, so a shape error must never reach the
 * DELETE statements and silently produce a half-restored profile.
 */
function assertImportShape(raw: unknown): asserts raw is Partial<ProgressSnapshot> & { profile: ProgressSnapshot["profile"] } {
  if (!isRecord(raw) || !isRecord(raw.profile)) throw new Error("Format data tidak valid");
  const profile = raw.profile;
  if (typeof profile.name !== "string" || profile.name.trim().length < 1 || profile.name.length > 40) {
    throw new Error("Nama profil pada file impor tidak valid");
  }
  if (!isRecord(profile.settings)) throw new Error("Pengaturan pada file impor tidak valid");
  for (const [key, limit] of Object.entries(IMPORT_ARRAY_LIMITS)) {
    const value = raw[key];
    if (value === undefined) continue;
    if (!Array.isArray(value)) throw new Error("Struktur data impor tidak valid: " + key);
    if (value.length > limit) throw new Error("File impor terlalu besar pada bagian " + key);
  }
  if (Array.isArray(raw.cards)) {
    for (const card of raw.cards) {
      if (!isRecord(card) || typeof card.itemId !== "string" || !card.itemId) {
        throw new Error("Data kartu SRS pada file impor tidak valid");
      }
      if (card.kind !== "vocab" && card.kind !== "kanji") throw new Error("Jenis kartu SRS tidak dikenal");
    }
  }
  if (Array.isArray(raw.lessons)) {
    for (const lesson of raw.lessons) {
      if (!isRecord(lesson) || typeof lesson.lessonId !== "string" || !lesson.lessonId) {
        throw new Error("Data pelajaran pada file impor tidak valid");
      }
      if (lesson.kind !== undefined && !IMPORT_LESSON_KINDS.has(String(lesson.kind))) {
        throw new Error("Jenis pelajaran pada file impor tidak dikenal");
      }
    }
  }
  if (Array.isArray(raw.reviews)) {
    for (const review of raw.reviews) {
      if (!isRecord(review) || typeof review.id !== "string" || typeof review.itemId !== "string") {
        throw new Error("Riwayat ulasan pada file impor tidak valid");
      }
    }
  }
  if (Array.isArray(raw.writing)) {
    for (const attempt of raw.writing) {
      if (!isRecord(attempt)) throw new Error("Riwayat menulis pada file impor tidak valid");
      if (typeof attempt.characterId !== "string" || !WRITING_BY_ID.has(attempt.characterId)) {
        throw new Error("Karakter pada riwayat menulis tidak ditemukan");
      }
      if (attempt.mode !== "guided" && attempt.mode !== "free") {
        throw new Error("Mode riwayat menulis tidak dikenal");
      }
    }
  }
  if (Array.isArray(raw.stories)) {
    for (const attempt of raw.stories) {
      if (!isRecord(attempt)) throw new Error("Riwayat cerita pada file impor tidak valid");
      if (typeof attempt.storyId !== "string" || !STORY_BY_ID.has(attempt.storyId)) {
        throw new Error("Cerita pada riwayat teater tidak ditemukan");
      }
      if (attempt.mode !== "study" && attempt.mode !== "watch") {
        throw new Error("Mode riwayat cerita tidak dikenal");
      }
    }
  }
  if (Array.isArray(raw.savedItems)) {
    for (const item of raw.savedItems) {
      if (!isRecord(item)) throw new Error("Kamus pribadi pada file impor tidak valid");
      const kind = item.kind;
      const refId = item.refId;
      if (kind !== "vocabulary" && kind !== "kanji" && kind !== "grammar") {
        throw new Error("Jenis materi kamus pribadi tidak dikenal");
      }
      if (typeof refId !== "string" || !savedItemExists(kind, refId)) {
        throw new Error("Materi kamus pribadi tidak ditemukan pada katalog Kotoba");
      }
    }
  }
}
export function importProgress(raw: unknown): ProgressSnapshot {
  assertImportShape(raw);
  const snapshot = raw;
  const profile = snapshot.profile;
  const cards = Array.isArray(snapshot.cards) ? snapshot.cards.slice(0, 20000) : [];
  const kana = Array.isArray(snapshot.kana) ? snapshot.kana.slice(0, 1000) : [];
  const lessons = Array.isArray(snapshot.lessons) ? snapshot.lessons.slice(0, 5000) : [];
  const reviews = Array.isArray(snapshot.reviews) ? snapshot.reviews.slice(0, 5000) : [];
  const exams = Array.isArray(snapshot.exams) ? snapshot.exams.slice(0, 500) : [];
  const quizAttempts = Array.isArray(snapshot.quizAttempts) ? snapshot.quizAttempts.slice(0, 1000) : [];
  const questionStats = Array.isArray(snapshot.questionStats) ? snapshot.questionStats.slice(0, 5000) : [];
  const games = Array.isArray(snapshot.games) ? snapshot.games.slice(0, 500) : [];
  const activity = Array.isArray(snapshot.activity) ? snapshot.activity.slice(0, 1000) : [];
  const favorites = Array.isArray(snapshot.favorites) ? snapshot.favorites.slice(0, 2000) : [];
  const savedCollections = Array.isArray(snapshot.savedCollections)
    ? snapshot.savedCollections.slice(0, 200)
    : [];
  const savedItems = Array.isArray(snapshot.savedItems) ? snapshot.savedItems.slice(0, 5000) : [];
  const writing = Array.isArray(snapshot.writing) ? snapshot.writing.slice(0, 5000) : [];
  const storyAttempts = Array.isArray(snapshot.stories) ? snapshot.stories.slice(0, 1000) : [];

  transaction((db) => {
    db.exec("DELETE FROM cards; DELETE FROM kana_progress; DELETE FROM lessons; DELETE FROM reviews; DELETE FROM exams; DELETE FROM quiz_attempts; DELETE FROM question_stats; DELETE FROM game_attempts; DELETE FROM activity; DELETE FROM culture_favorites; DELETE FROM saved_items; DELETE FROM saved_collections; DELETE FROM writing_attempts; DELETE FROM story_attempts;");
    const settings: Settings = normalizeSettings(profile.settings as Partial<Settings> | undefined);
    db.prepare(
      `UPDATE profile SET name = ?, xp = ?, streak = ?, best_streak = ?, last_study_date = ?, settings = ? WHERE id = 1`,
    ).run(
      str(profile.name, "Pelajar").slice(0, 40),
      clampInt(profile.xp, 0, 10_000_000),
      clampInt(profile.streak, 0, 10000),
      clampInt(profile.bestStreak, 0, 10000),
      profile.lastStudyDate ? str(profile.lastStudyDate) : null,
      JSON.stringify(settings),
    );

    for (const card of cards as CardProgress[]) {
      if (!card?.itemId) continue;
      db.prepare(
        `INSERT OR REPLACE INTO cards (item_id, kind, ease, interval_days, due_at, reps, lapses, last_rating, last_reviewed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        str(card.itemId),
        card.kind === "kanji" ? "kanji" : "vocab",
        Number(card.ease) || 2.5,
        clampInt(card.intervalDays, 0, 36500),
        str(card.dueAt, new Date().toISOString()),
        clampInt(card.reps, 0, 100000),
        clampInt(card.lapses, 0, 100000),
        card.lastRating === null || card.lastRating === undefined ? null : clampInt(card.lastRating, 0, 3),
        card.lastReviewedAt ? str(card.lastReviewedAt) : null,
      );
    }

    for (const item of kana as KanaProgress[]) {
      if (!item?.char) continue;
      db.prepare(
        `INSERT OR REPLACE INTO kana_progress (char, script, correct, wrong, mastery, last_seen)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).run(
        str(item.char).slice(0, 4),
        item.script === "katakana" ? "katakana" : "hiragana",
        clampInt(item.correct, 0, 100000),
        clampInt(item.wrong, 0, 100000),
        clampInt(item.mastery, 0, 5),
        item.lastSeen ? str(item.lastSeen) : null,
      );
    }

    for (const lesson of lessons as LessonProgress[]) {
      if (!lesson?.lessonId) continue;
      db.prepare("INSERT OR REPLACE INTO lessons (lesson_id, kind, score, completed_at) VALUES (?, ?, ?, ?)").run(
        str(lesson.lessonId).slice(0, 160),
        str(lesson.kind, "grammar"),
        lesson.score === null || lesson.score === undefined ? null : clampInt(lesson.score, 0, 100),
        str(lesson.completedAt, new Date().toISOString()),
      );
    }

    for (const review of reviews as ReviewLog[]) {
      if (!review?.id || !review?.itemId) continue;
      db.prepare(
        "INSERT OR REPLACE INTO reviews (id, item_id, kind, rating, correct, mode, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ).run(
        str(review.id).slice(0, 80),
        str(review.itemId).slice(0, 120),
        review.kind === "kanji" ? "kanji" : "vocab",
        clampInt(review.rating, 0, 3),
        review.correct ? 1 : 0,
        str(review.mode, "review").slice(0, 40),
        str(review.createdAt, new Date().toISOString()),
      );
    }

    for (const exam of exams as ExamAttempt[]) {
      if (!exam?.id) continue;
      db.prepare(
        `INSERT OR REPLACE INTO exams (id, level, score, total, passed, sections, correct, answered, total_questions, duration_sec, started_at, finished_at, review)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        str(exam.id).slice(0, 80),
        str(exam.level, "N5"),
        clampInt(exam.score, 0, 300),
        clampInt(exam.total, 1, 300, 180),
        exam.passed ? 1 : 0,
        JSON.stringify(exam.sections ?? []),
        clampInt(exam.correct, 0, 500),
        clampInt(exam.answered, 0, 500),
        clampInt(exam.totalQuestions, 0, 500),
        clampInt(exam.durationSec, 0, 14400),
        str(exam.startedAt),
        str(exam.finishedAt),
        JSON.stringify(exam.review ?? []),
      );
    }

    for (const attempt of quizAttempts as QuizAttempt[]) {
      if (!attempt?.id) continue;
      const attemptAnswers = Array.isArray(attempt.answers) ? attempt.answers.slice(0, 100) : [];
      const total = attemptAnswers.length;
      const correct = attemptAnswers.filter((answer) => answer.correct).length;
      const totalScore = attemptAnswers.reduce((sum, answer) => sum + Math.max(0, Math.min(1, Number(answer.score) || 0)), 0);
      const score = total === 0 ? 0 : Math.round((totalScore / total) * 100);
      const mode: ExerciseSessionMode = SESSION_MODES.includes(attempt.mode) ? attempt.mode : "practice";
      const level = ["N5", "N4", "N3", "N2", "N1"].includes(str(attempt.level)) ? str(attempt.level) : null;
      db.prepare(
        `INSERT OR REPLACE INTO quiz_attempts (id, mode, title, level, total, correct, score, duration_sec, started_at, finished_at, answers)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        str(attempt.id).slice(0, 100),
        mode,
        str(attempt.title, "Latihan").slice(0, 160),
        level,
        total,
        correct,
        score,
        clampInt(attempt.durationSec, 0, 14400),
        str(attempt.startedAt, new Date().toISOString()),
        str(attempt.finishedAt, new Date().toISOString()),
        JSON.stringify(attemptAnswers),
      );
    }

    for (const game of games as GameAttempt[]) {
      if (!game?.id) continue;
      const gameTotal = clampInt(game.total, 1, 200, 1);
      const gameCorrect = clampInt(game.correct, 0, gameTotal);
      const gameDetails = Array.isArray(game.details) ? game.details.slice(0, 100) : [];
      db.prepare(
        `INSERT OR REPLACE INTO game_attempts (id, game_id, difficulty, score, correct, total, accuracy, duration_sec, hints_used, details, started_at, played_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        str(game.id).slice(0, 100),
        GAME_IDS.includes(game.gameId) ? game.gameId : "word-builder",
        GAME_DIFFICULTIES.includes(game.difficulty) ? game.difficulty : "standard",
        clampInt(game.score, 0, 100000),
        gameCorrect,
        gameTotal,
        Math.round((gameCorrect / gameTotal) * 100),
        clampInt(game.durationSec, 0, 7200),
        clampInt(game.hintsUsed, 0, 100),
        JSON.stringify(gameDetails),
        str(game.startedAt, new Date().toISOString()),
        str(game.playedAt, new Date().toISOString()),
      );
    }

    const statRows = questionStats as QuestionStat[];
    if (statRows.length > 0) {
      for (const stat of statRows) {
        if (!stat?.questionId) continue;
        db.prepare(
          `INSERT OR REPLACE INTO question_stats (question_id, attempts, correct, wrong, last_result, last_attempt_at, total_time_ms)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ).run(
          str(stat.questionId).slice(0, 160),
          clampInt(stat.attempts, 0, 100000),
          clampInt(stat.correct, 0, 100000),
          clampInt(stat.wrong, 0, 100000),
          stat.lastResult === "correct" ? "correct" : "wrong",
          str(stat.lastAttemptAt, new Date().toISOString()),
          clampInt(stat.averageTimeMs, 0, 600000) * clampInt(stat.attempts, 0, 100000),
        );
      }
    } else {
      // Ekspor lama belum memiliki questionStats; turunkan dari attempt yang ada
      // agar prioritas adaptif tetap berfungsi setelah impor.
      const derived = new Map<string, { attempts: number; correct: number; wrong: number; time: number; lastAt: string; lastResult: string }>();
      for (const attempt of quizAttempts as QuizAttempt[]) {
        for (const answer of Array.isArray(attempt.answers) ? attempt.answers : []) {
          if (!answer?.exerciseId) continue;
          const current = derived.get(answer.exerciseId) ?? {
            attempts: 0,
            correct: 0,
            wrong: 0,
            time: 0,
            lastAt: "",
            lastResult: "wrong",
          };
          current.attempts += 1;
          current.correct += answer.correct ? 1 : 0;
          current.wrong += answer.correct ? 0 : 1;
          current.time += clampInt(answer.timeMs, 0, 600000);
          const at = str(attempt.finishedAt, new Date().toISOString());
          if (at > current.lastAt) {
            current.lastAt = at;
            current.lastResult = answer.correct ? "correct" : "wrong";
          }
          derived.set(answer.exerciseId, current);
        }
      }
      for (const [questionId, stat] of derived) {
        db.prepare(
          `INSERT OR REPLACE INTO question_stats (question_id, attempts, correct, wrong, last_result, last_attempt_at, total_time_ms)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ).run(questionId, stat.attempts, stat.correct, stat.wrong, stat.lastResult, stat.lastAt, stat.time);
      }
    }

    for (const day of activity as ActivityDay[]) {
      if (!day?.date) continue;
      db.prepare("INSERT OR REPLACE INTO activity (date, xp, reviews, minutes) VALUES (?, ?, ?, ?)").run(
        str(day.date).slice(0, 10),
        clampInt(day.xp, 0, 100000),
        clampInt(day.reviews, 0, 100000),
        clampInt(day.minutes, 0, 100000),
      );
    }

    for (const favorite of favorites as CultureFavorite[]) {
      const articleId = str(favorite?.articleId).slice(0, 120);
      if (!articleId || !CULTURE_BY_ID.has(articleId)) continue;
      db.prepare(
        "INSERT OR REPLACE INTO culture_favorites (article_id, saved_at) VALUES (?, ?)",
      ).run(articleId, str(favorite.savedAt, new Date().toISOString()));
    }

    const collectionIds = new Set<string>();
    for (const collection of savedCollections as SavedCollection[]) {
      const collectionId = str(collection?.id).slice(0, 60);
      const name = str(collection?.name).trim().slice(0, 60);
      if (!collectionId || !name) continue;
      collectionIds.add(collectionId);
      db.prepare(
        `INSERT OR REPLACE INTO saved_collections (id, name, description, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
      ).run(
        collectionId,
        name,
        str(collection.description).slice(0, 240),
        str(collection.createdAt, new Date().toISOString()),
        str(collection.updatedAt, new Date().toISOString()),
      );
    }

    for (const attempt of writing as WritingAttempt[]) {
      const character = WRITING_BY_ID.get(str(attempt?.characterId).slice(0, 160));
      if (!character) continue;
      db.prepare(
        `INSERT OR REPLACE INTO writing_attempts
          (id, character_id, script, mode, score, expected_strokes, drawn_strokes, order_mistakes, duration_sec, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        str(attempt.id, `wrt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`).slice(0, 100),
        character.id,
        character.script,
        attempt.mode === "free" ? "free" : "guided",
        clampInt(attempt.score, 0, 100),
        character.strokeCount,
        clampInt(attempt.drawnStrokes, 0, 80),
        clampInt(attempt.orderMistakes, 0, 80),
        clampInt(attempt.durationSec, 0, 3600),
        str(attempt.createdAt, new Date().toISOString()),
      );
    }

    for (const attempt of storyAttempts as StoryAttempt[]) {
      const story = STORY_BY_ID.get(str(attempt?.storyId).slice(0, 120));
      if (!story) continue;
      const total = clampInt(attempt.total, 1, 20);
      db.prepare(
        `INSERT OR REPLACE INTO story_attempts
          (id, story_id, level, mode, score, correct, total, scenes_completed, duration_sec, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        str(attempt.id, `st_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`).slice(0, 100),
        story.id,
        story.level,
        attempt.mode === "watch" ? "watch" : "study",
        clampInt(attempt.score, 0, 100),
        clampInt(attempt.correct, 0, total),
        total,
        clampInt(attempt.scenesCompleted, 1, 30),
        clampInt(attempt.durationSec, 0, 3600),
        str(attempt.completedAt, new Date().toISOString()),
      );
    }

    for (const item of savedItems as SavedItem[]) {
      const kind: SavedItemKind | null =
        item?.kind === "kanji" || item?.kind === "grammar" || item?.kind === "vocabulary"
          ? item.kind
          : null;
      const refId = str(item?.refId).slice(0, 120);
      if (!kind || !refId || !savedItemExists(kind, refId)) continue;
      const collectionId = str(item.collectionId).slice(0, 60);
      db.prepare(
        `INSERT OR REPLACE INTO saved_items (kind, ref_id, note, collection_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).run(
        kind,
        refId,
        str(item.note).slice(0, 1000),
        collectionId && collectionIds.has(collectionId) ? collectionId : null,
        str(item.createdAt, new Date().toISOString()),
        str(item.updatedAt, new Date().toISOString()),
      );
    }
  });

  return getSnapshot();
}
