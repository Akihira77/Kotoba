import { describe, expect, it } from "vitest";
import {
  buildTypingSession,
  checkTypingAnswer,
  normalizeJapanese,
  normalizeRomaji,
  typingAccuracy,
} from "@/lib/typing";

describe("typing practice", () => {
  it("menormalkan variasi romaji yang lazim", () => {
    expect(normalizeRomaji(" Shi ")).toBe("shi");
    expect(normalizeRomaji("si")).toBe("shi");
    expect(normalizeRomaji("TYA")).toBe("cha");
    expect(normalizeRomaji("sya")).toBe("sha");
    expect(normalizeRomaji("jya")).toBe("ja");
    expect(normalizeRomaji("wo")).toBe("o");
    expect(normalizeRomaji("nn")).toBe("n");
  });

  it("menormalkan input Jepang tanpa mengubah makna", () => {
    expect(normalizeJapanese("  がくせい  ")).toBe("がくせい");
    expect(normalizeJapanese("ｶﾞｸｾｲ")).toBe("ガクセイ");
  });

  it("memeriksa jawaban sesuai mode latihan", () => {
    expect(checkTypingAnswer("kana-romaji", "si", "shi")).toBe(true);
    expect(checkTypingAnswer("kana-romaji", "chi", "shi")).toBe(false);
    expect(checkTypingAnswer("romaji-kana", " がくせい ", "がくせい")).toBe(true);
    expect(checkTypingAnswer("meaning-kanji", "学生", "学生")).toBe(true);
    expect(checkTypingAnswer("meaning-kanji", "がくせい", "学生")).toBe(false);
  });

  it("membuat sesi kana ke romaji yang unik dan deterministik", () => {
    const first = buildTypingSession({ mode: "kana-romaji", count: 10, seed: 42 });
    const second = buildTypingSession({ mode: "kana-romaji", count: 10, seed: 42 });

    expect(first).toHaveLength(10);
    expect(first.map((item) => item.id)).toEqual(second.map((item) => item.id));
    expect(new Set(first.map((item) => item.id)).size).toBe(first.length);
    for (const item of first) {
      expect(item.answer.length).toBeGreaterThan(0);
      expect(item.level).toBe("N5");
      expect(item.kana).toBeTruthy();
    }
  });

  it("membuat sesi romaji ke kana tanpa jawaban ganda pada satu skrip", () => {
    const session = buildTypingSession({ mode: "romaji-kana", count: 12, seed: 7 });
    expect(session.length).toBeGreaterThan(0);
    for (const item of session) {
      expect(item.promptSubtitle).toMatch(/Hiragana|Katakana/);
      expect(item.answer.length).toBeGreaterThan(0);
    }
    expect(new Set(session.map((item) => item.answer)).size).toBe(session.length);
  });

  it("membuat sesi arti ke kanji hanya dari kosakata berkanji", () => {
    const session = buildTypingSession({ mode: "meaning-kanji", level: "N5", count: 10, seed: 3 });
    expect(session.length).toBeGreaterThan(0);
    for (const item of session) {
      expect(item.answer).toMatch(/[\u3400-\u9fff々]/u);
      expect(item.level).toBe("N5");
      expect(item.meaning).toBeTruthy();
    }
  });

  it("membatasi jumlah soal sesuai ukuran kumpulan", () => {
    const session = buildTypingSession({ mode: "meaning-kanji", level: "N1", count: 100, seed: 1 });
    expect(session.length).toBeLessThanOrEqual(100);
    expect(session.length).toBeGreaterThan(0);
  });

  it("menghitung akurasi dengan aman", () => {
    expect(typingAccuracy(0, 0)).toBe(0);
    expect(typingAccuracy(7, 10)).toBe(70);
    expect(typingAccuracy(10, 10)).toBe(100);
  });
});
