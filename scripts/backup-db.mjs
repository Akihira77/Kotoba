#!/usr/bin/env node
/**
 * Backup, verify, and restore the Kotoba SQLite database.
 *
 * Usage:
 *   node scripts/backup-db.mjs
 *   node scripts/backup-db.mjs --db .data/kotoba.db --out .data/backups --keep 7
 *   node scripts/backup-db.mjs --verify .data/backups/kotoba-....db
 *   node scripts/backup-db.mjs --restore .data/backups/kotoba-....db --db .data/kotoba.db --yes
 *
 * VACUUM INTO is used for a consistent copy while the app is running. A restore
 * replaces the target file, so stop the server first and pass --yes explicitly.
 */
import { DatabaseSync } from "node:sqlite";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { join, resolve } from "node:path";

const DEFAULT_DB = process.env.KOTOBA_DB_PATH || ".data/kotoba.db";
const DEFAULT_OUT = ".data/backups";
const DEFAULT_KEEP = 7;

function parseArgs(argv) {
  const args = { db: DEFAULT_DB, out: DEFAULT_OUT, keep: DEFAULT_KEEP, verify: null, restore: null, yes: false, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--db") args.db = argv[++i];
    else if (arg === "--out") args.out = argv[++i];
    else if (arg === "--keep") args.keep = Number(argv[++i]);
    else if (arg === "--verify") args.verify = argv[++i];
    else if (arg === "--restore") args.restore = argv[++i];
    else if (arg === "--yes") args.yes = true;
    else if (arg === "--json") args.json = true;
    else if (arg === "--help" || arg === "-h") {
      console.log("Usage: node scripts/backup-db.mjs [--db FILE] [--out DIR] [--keep N] [--verify FILE] [--restore FILE --yes] [--json]");
      process.exit(0);
    } else {
      throw new Error("Argumen tidak dikenal: " + arg);
    }
  }
  if (!Number.isInteger(args.keep) || args.keep < 1 || args.keep > 100) {
    throw new Error("--keep harus bilangan bulat 1-100");
  }
  return args;
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function quoteSqlString(value) {
  return "'" + String(value).replace(/'/g, "''") + "'";
}

function openReadOnly(file) {
  return new DatabaseSync(file, { readOnly: true });
}

export function inspectDatabase(file) {
  if (!existsSync(file)) throw new Error("Database tidak ditemukan: " + file);
  const db = openReadOnly(file);
  try {
    const integrityRow = db.prepare("PRAGMA integrity_check").get();
    const integrity = integrityRow ? Object.values(integrityRow)[0] : "unknown";
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map((row) => row.name);
    const counts = {};
    for (const table of tables) {
      counts[table] = db.prepare("SELECT COUNT(*) AS n FROM " + quoteIdentifier(table)).get().n;
    }
    return { file, integrity, tables, counts };
  } finally {
    db.close();
  }
}

function quoteIdentifier(value) {
  return '"' + String(value).replace(/"/g, '""') + '"';
}

function backup(args) {
  const dbPath = resolve(args.db);
  if (!existsSync(dbPath)) throw new Error("Database tidak ditemukan: " + dbPath);
  const outDir = resolve(args.out);
  mkdirSync(outDir, { recursive: true, mode: 0o700 });
  chmodSync(outDir, 0o700);
  const target = join(outDir, "kotoba-" + timestamp() + ".db");
  if (existsSync(target)) throw new Error("File backup sudah ada: " + target);
  const db = new DatabaseSync(dbPath);
  try {
    db.exec("VACUUM INTO " + quoteSqlString(target));
  } finally {
    db.close();
  }
  chmodSync(target, 0o600);
  const info = inspectDatabase(target);
  if (info.integrity !== "ok") throw new Error("Backup tidak lolos integrity_check: " + info.integrity);
  const files = readdirSync(outDir)
    .filter((name) => /^kotoba-.*\.db$/.test(name))
    .map((name) => ({ name, path: join(outDir, name), mtime: statSync(join(outDir, name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  for (const old of files.slice(args.keep)) unlinkSync(old.path);
  return { action: "backup", source: dbPath, backup: target, bytes: statSync(target).size, kept: Math.min(files.length, args.keep), tables: info.tables.length, integrity: info.integrity };
}

function verify(file) {
  const info = inspectDatabase(resolve(file));
  if (info.integrity !== "ok") throw new Error("Verifikasi gagal: " + info.integrity);
  if (info.tables.length === 0) throw new Error("Verifikasi gagal: tidak ada tabel");
  return { action: "verify", ...info };
}

function restore(args) {
  if (!args.yes) throw new Error("Restore menimpa database. Jalankan ulang dengan --yes setelah server dihentikan.");
  const source = resolve(args.restore);
  const target = resolve(args.db);
  const info = verify(source);
  const safety = target + ".pre-restore-" + timestamp();
  if (existsSync(target)) {
    copyFileSync(target, safety);
    chmodSync(safety, 0o600);
  }
  for (const suffix of ["-wal", "-shm"]) {
    const sidecar = target + suffix;
    if (existsSync(sidecar)) unlinkSync(sidecar);
  }
  copyFileSync(source, target);
  chmodSync(target, 0o600);
  const restored = inspectDatabase(target);
  if (restored.integrity !== "ok") throw new Error("Restore gagal: " + restored.integrity);
  return { action: "restore", source, target, safety, tables: info.tables.length, integrity: restored.integrity };
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = args.restore ? restore(args) : args.verify ? verify(args.verify) : backup(args);
    if (args.json) console.log(JSON.stringify(result));
    else if (result.action === "backup") console.log("Backup dibuat: " + result.backup + " (" + result.bytes + " byte, " + result.tables + " tabel)");
    else if (result.action === "restore") console.log("Database dipulihkan: " + result.target + " (cadangan lama: " + result.safety + ")");
    else console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Gagal: " + (error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  }
}

if (import.meta.url === "file://" + process.argv[1]) main();
