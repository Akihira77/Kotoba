import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_SETTINGS } from "@/lib/constants";

const DB_PATH =
  process.env.KOTOBA_DB_PATH ?? path.join(process.cwd(), ".data", "kotoba.db");

const globalForDb = globalThis as unknown as { __kotobaDb?: DatabaseSync };

export function dbPath(): string {
  return DB_PATH;
}

/** The database stores a single learner's plaintext history; keep it private. */
function tightenDatabasePermissions(): void {
  tightenPermissions(DB_PATH, 0o600);
  for (const suffix of ["-wal", "-shm"]) {
    tightenPermissions(DB_PATH + suffix, 0o600);
  }
}

function tightenPermissions(target: string, mode: number): void {
  try {
    fs.chmodSync(target, mode);
  } catch {
    // Best-effort on filesystems that do not expose POSIX permissions.
  }
}

export function getDb(): DatabaseSync {
  if (globalForDb.__kotobaDb) return globalForDb.__kotobaDb;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  tightenPermissions(path.dirname(DB_PATH), 0o700);
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA busy_timeout = 5000;");
  migrate(db);
  tightenDatabasePermissions();
  globalForDb.__kotobaDb = db;
  return db;
}

function migrate(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      xp INTEGER NOT NULL DEFAULT 0,
      streak INTEGER NOT NULL DEFAULT 0,
      best_streak INTEGER NOT NULL DEFAULT 0,
      last_study_date TEXT,
      settings TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
      item_id TEXT PRIMARY KEY,
      kind TEXT NOT NULL CHECK (kind IN ('vocab', 'kanji')),
      ease REAL NOT NULL,
      interval_days INTEGER NOT NULL,
      due_at TEXT NOT NULL,
      reps INTEGER NOT NULL DEFAULT 0,
      lapses INTEGER NOT NULL DEFAULT 0,
      last_rating INTEGER,
      last_reviewed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS kana_progress (
      char TEXT PRIMARY KEY,
      script TEXT NOT NULL,
      correct INTEGER NOT NULL DEFAULT 0,
      wrong INTEGER NOT NULL DEFAULT 0,
      mastery INTEGER NOT NULL DEFAULT 0,
      last_seen TEXT
    );

    CREATE TABLE IF NOT EXISTS lessons (
      lesson_id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      score INTEGER,
      completed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      rating INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      mode TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      level TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      sections TEXT NOT NULL,
      correct INTEGER NOT NULL,
      answered INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      duration_sec INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT NOT NULL,
      review TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity (
      date TEXT PRIMARY KEY,
      xp INTEGER NOT NULL DEFAULT 0,
      reviews INTEGER NOT NULL DEFAULT 0,
      minutes INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      mode TEXT NOT NULL,
      title TEXT NOT NULL,
      level TEXT,
      total INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      score INTEGER NOT NULL,
      duration_sec INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT NOT NULL,
      answers TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS question_stats (
      question_id TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL DEFAULT 0,
      correct INTEGER NOT NULL DEFAULT 0,
      wrong INTEGER NOT NULL DEFAULT 0,
      last_result TEXT NOT NULL,
      last_attempt_at TEXT NOT NULL,
      total_time_ms INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_cards_due ON cards (due_at);
    CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews (created_at);
    CREATE INDEX IF NOT EXISTS idx_activity_date ON activity (date);
    CREATE INDEX IF NOT EXISTS idx_quiz_attempts_finished ON quiz_attempts (finished_at);
    CREATE TABLE IF NOT EXISTS game_attempts (
      id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      score INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      total INTEGER NOT NULL,
      accuracy INTEGER NOT NULL,
      duration_sec INTEGER NOT NULL,
      hints_used INTEGER NOT NULL DEFAULT 0,
      details TEXT NOT NULL,
      started_at TEXT NOT NULL,
      played_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_question_stats_attempted ON question_stats (last_attempt_at);
    CREATE INDEX IF NOT EXISTS idx_game_attempts_played ON game_attempts (played_at);

    CREATE TABLE IF NOT EXISTS culture_favorites (
      article_id TEXT PRIMARY KEY,
      saved_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_culture_favorites_saved ON culture_favorites (saved_at);

    CREATE TABLE IF NOT EXISTS saved_collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saved_items (
      kind TEXT NOT NULL CHECK (kind IN ('vocabulary', 'kanji', 'grammar')),
      ref_id TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      collection_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (kind, ref_id)
    );

    CREATE INDEX IF NOT EXISTS idx_saved_items_updated ON saved_items (updated_at);
    CREATE INDEX IF NOT EXISTS idx_saved_items_collection ON saved_items (collection_id);

    CREATE TABLE IF NOT EXISTS writing_attempts (
      id TEXT PRIMARY KEY,
      character_id TEXT NOT NULL,
      script TEXT NOT NULL,
      mode TEXT NOT NULL CHECK (mode IN ('guided', 'free')),
      score INTEGER NOT NULL,
      expected_strokes INTEGER NOT NULL,
      drawn_strokes INTEGER NOT NULL,
      order_mistakes INTEGER NOT NULL DEFAULT 0,
      duration_sec INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_writing_attempts_created ON writing_attempts (created_at);
    CREATE INDEX IF NOT EXISTS idx_writing_attempts_character ON writing_attempts (character_id);

    CREATE TABLE IF NOT EXISTS story_attempts (
      id TEXT PRIMARY KEY,
      story_id TEXT NOT NULL,
      level TEXT NOT NULL,
      mode TEXT NOT NULL CHECK (mode IN ('study', 'watch')),
      score INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      total INTEGER NOT NULL,
      scenes_completed INTEGER NOT NULL,
      duration_sec INTEGER NOT NULL,
      completed_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_story_attempts_completed ON story_attempts (completed_at);
    CREATE INDEX IF NOT EXISTS idx_story_attempts_story ON story_attempts (story_id);
  `);

  const existing = db.prepare("SELECT id FROM profile WHERE id = 1").get();
  if (!existing) {
    db.prepare(
      `INSERT INTO profile (id, name, xp, streak, best_streak, last_study_date, settings, created_at)
       VALUES (1, 'Pelajar', 0, 0, 0, NULL, ?, ?)`,
    ).run(JSON.stringify(DEFAULT_SETTINGS), new Date().toISOString());
  }
}

let transactionDepth = 0;

export function transaction<T>(fn: (db: DatabaseSync) => T): T {
  const db = getDb();
  if (transactionDepth > 0) {
    throw new Error("Transaksi bersarang tidak didukung");
  }
  transactionDepth += 1;
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn(db);
    db.exec("COMMIT");
    return result;
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* ignore rollback failure and surface the original error */
    }
    throw error;
  } finally {
    transactionDepth -= 1;
  }
}