import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = resolve(process.cwd(), "scripts/backup-db.mjs");

function run(args: string[]): { code: number; stdout: string; stderr: string } {
  try {
    const stdout = execFileSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { code: 0, stdout, stderr: "" };
  } catch (error) {
    const failure = error as { status?: number; stdout?: string; stderr?: string };
    return { code: failure.status ?? 1, stdout: failure.stdout ?? "", stderr: failure.stderr ?? "" };
  }
}

const roots: string[] = [];

function workspace(): { dir: string; db: string } {
  const dir = mkdtempSync(join(tmpdir(), "kotoba-backup-"));
  roots.push(dir);
  const db = join(dir, "kotoba.db");
  const database = new DatabaseSync(db);
  database.exec("CREATE TABLE profile (id INTEGER PRIMARY KEY, name TEXT NOT NULL)");
  database.prepare("INSERT INTO profile (name) VALUES (?)").run("Pelajar");
  database.close();
  return { dir, db };
}

afterEach(() => {
  while (roots.length > 0) rmSync(roots.pop()!, { recursive: true, force: true });
});

describe("backup-db.mjs", () => {
  it("membuat backup konsisten, memverifikasi, dan memulihkannya", () => {
    const { dir, db } = workspace();
    const out = join(dir, "backups");

    const created = run(["--db", db, "--out", out, "--keep", "2", "--json"]);
    expect(created.code, created.stderr).toBe(0);
    const backup = JSON.parse(created.stdout.trim()) as { backup: string; integrity: string; tables: number; bytes: number };
    expect(backup.integrity).toBe("ok");
    expect(backup.tables).toBe(1);
    expect(backup.bytes).toBeGreaterThan(0);
    expect(existsSync(backup.backup)).toBe(true);
    expect(statSync(backup.backup).mode & 0o777).toBe(0o600);

    const verified = run(["--verify", backup.backup, "--json"]);
    expect(verified.code, verified.stderr).toBe(0);
    expect(JSON.parse(verified.stdout.trim()).counts.profile).toBe(1);

    const restoredDb = join(dir, "restored.db");
    const restored = run(["--restore", backup.backup, "--db", restoredDb, "--yes", "--json"]);
    expect(restored.code, restored.stderr).toBe(0);
    const check = new DatabaseSync(restoredDb, { readOnly: true });
    expect(check.prepare("SELECT name FROM profile").get()?.name).toBe("Pelajar");
    check.close();
  });

  it("menolak --keep di luar rentang dan restore tanpa --yes", () => {
    const { dir, db } = workspace();
    expect(run(["--db", db, "--keep", "0"]).code).toBe(1);
    expect(run(["--db", join(dir, "restored.db"), "--restore", db]).code).toBe(1);
  });

  it("mempertahankan jumlah backup sesuai --keep", () => {
    const { dir, db } = workspace();
    const out = join(dir, "backups");
    for (let index = 0; index < 3; index += 1) {
      const result = run(["--db", db, "--out", out, "--keep", "2", "--json"]);
      expect(result.code, result.stderr).toBe(0);
    }
    expect(readdirSync(out).filter((name) => name.endsWith(".db"))).toHaveLength(2);
  });
});
