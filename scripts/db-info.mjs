import { DatabaseSync } from "node:sqlite";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve(process.env.KOTOBA_DB_PATH ?? ".data/kotoba.db");
console.log("Database Kotoba:", path);

if (!existsSync(path)) {
  console.log("Belum ada database. Jalankan aplikasi lalu selesaikan satu aktivitas belajar.");
  process.exit(0);
}

const db = new DatabaseSync(path, { readOnly: true });
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
  .all()
  .map((row) => row.name);
console.log("Ukuran file:", (statSync(path).size / 1024).toFixed(1), "KB");
console.log("Tabel:", tables.join(", ") || "-");

for (const table of tables) {
  if (table.startsWith("sqlite_")) continue;
  const row = db.prepare(`SELECT COUNT(*) AS count FROM "${table}"`).get();
  console.log(`- ${table}: ${row.count}`);
}

db.close();
