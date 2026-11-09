import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  WRITING_BY_ID,
  WRITING_CHARACTERS,
  WRITING_INDEX,
  WRITING_KANJI_TOTAL,
  WRITING_KANA_TOTAL,
  WRITING_TOTAL,
} from "./writing";
import { writingHrefForContentRef } from "./writing-links";
import type { WritingGlyphData } from "./types";

const dataRoot = join(process.cwd(), "public", "writing", "kanjivg");

function loadGlyph(file: string): WritingGlyphData {
  return JSON.parse(readFileSync(join(dataRoot, file), "utf8")) as WritingGlyphData;
}

describe("writing catalog", () => {
  it("mencakup seluruh kana dan kanji tanpa ID duplikat", () => {
    expect(WRITING_TOTAL).toBe(WRITING_KANA_TOTAL + WRITING_KANJI_TOTAL);
    expect(WRITING_TOTAL).toBe(319);
    expect(WRITING_INDEX).toHaveLength(WRITING_TOTAL);
    expect(new Set(WRITING_CHARACTERS.map((item) => item.id)).size).toBe(WRITING_TOTAL);
    expect(WRITING_BY_ID.get("writing-kanji-日")?.char).toBe("日");
    expect(WRITING_BY_ID.get("writing-hiragana-あ")?.romaji).toBe("a");
  });

  it("memakai komponen berurutan untuk yōon, bukan glif gabungan", () => {
    const yoon = WRITING_BY_ID.get("writing-hiragana-きゃ");
    expect(yoon).toBeDefined();
    expect(yoon?.glyphs.map((glyph) => glyph.char)).toEqual(["き", "ゃ"]);
    expect(yoon?.glyphs).toHaveLength(2);
    expect(yoon?.strokeCount).toBe((yoon?.glyphs[0].strokes ?? 0) + (yoon?.glyphs[1].strokes ?? 0));
    expect(yoon?.strokeCount).toBeGreaterThan(4);
  });

  it("menyimpan jumlah goresan yang sama dengan data KanjiVG", () => {
    for (const item of WRITING_CHARACTERS) {
      let total = 0;
      for (const glyph of item.glyphs) {
        const file = join(dataRoot, glyph.file);
        expect(existsSync(file), glyph.file + " harus ada").toBe(true);
        const parsed = loadGlyph(glyph.file);
        expect(parsed.viewBox).toBe("0 0 109 109");
        expect(parsed.strokes.length).toBeGreaterThan(0);
        expect(parsed.strokes.length).toBe(glyph.strokes);
        expect(parsed.numbers).toHaveLength(glyph.strokes);
        expect(parsed.strokes.map((stroke) => Number(stroke.number))).toEqual(
          Array.from({ length: glyph.strokes }, (_, index) => index + 1),
        );
        for (const stroke of parsed.strokes) {
          expect(typeof stroke.start.x, glyph.file + " start.x").toBe("number");
          expect(typeof stroke.start.y, glyph.file + " start.y").toBe("number");
          expect(Array.isArray(stroke.points)).toBe(true);
          expect(stroke.points.length).toBeGreaterThan(1);
          expect(typeof stroke.points[0].x, glyph.file + " point.x").toBe("number");
          expect(typeof stroke.end.y, glyph.file + " end.y").toBe("number");
        }
        total += parsed.strokes.length;
      }
      expect(item.strokeCount).toBe(total);
    }
  });

  it("memberi tahap dan metadata tampilan yang masuk akal", () => {
    for (const item of WRITING_CHARACTERS) {
      expect(item.char.length).toBeGreaterThan(0);
      expect(item.reading.length).toBeGreaterThan(0);
      expect(item.strokeCount).toBeGreaterThan(0);
      if (item.script === "kanji") {
        expect(item.examples.length).toBeGreaterThan(0);
        expect(item.level).toBeDefined();
        expect(["C", "D", "E"]).toContain(item.stage);
        expect(item.meanings.length).toBeGreaterThan(0);
      } else {
        expect(["A", "B"]).toContain(item.stage);
        expect(item.romaji.length).toBeGreaterThan(0);
        expect(item.level).toBeUndefined();
        expect(item.meanings).toEqual([]);
      }
    }
  });

  it("menautkan referensi kana dan kanji ke detail menulis yang ada", () => {
    for (const ref of [
      { kind: "kana" as const, id: "hiragana-あ" },
      { kind: "kana" as const, id: "katakana-ア" },
      { kind: "kanji" as const, id: "kanji-日" },
    ]) {
      const href = writingHrefForContentRef(ref);
      expect(href).not.toBeNull();
      const id = decodeURIComponent(href!.slice("/writing/".length));
      expect(WRITING_BY_ID.has(id), href + " harus menunjuk katalog").toBe(true);
    }
    expect(writingHrefForContentRef({ kind: "vocabulary", id: "v-salam-ohayou" })).toBeNull();
  });
});
