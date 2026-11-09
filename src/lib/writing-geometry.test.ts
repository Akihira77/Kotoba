import { describe, expect, it } from "vitest";
import {
  combinedWidth,
  compareStroke,
  evaluateWriting,
  flattenGlyphPoints,
  globalStrokeIndex,
  writingScoreLabel,
} from "./writing-geometry";
import type { WritingGlyphData, WritingPoint, WritingStrokeData } from "./types";

function line(from: [number, number], to: [number, number]): WritingPoint[] {
  return Array.from({ length: 24 }, (_, index) => ({
    x: from[0] + ((to[0] - from[0]) * index) / 23,
    y: from[1] + ((to[1] - from[1]) * index) / 23,
  }));
}

const horizontal = line([20, 55], [90, 55]);
const vertical = line([55, 20], [55, 90]);

function stroke(number: number, points: WritingPoint[]): WritingStrokeData {
  return {
    number: String(number),
    d: "",
    start: points[0],
    end: points[points.length - 1],
    points,
  };
}

function glyph(character: string, strokes: WritingStrokeData[]): WritingGlyphData {
  return {
    character,
    codepoint: "065e5",
    viewBox: "0 0 109 109",
    source: { project: "KanjiVG", commit: "test", url: "test", license: "CC BY-SA 3.0", attribution: "test" },
    strokes,
    numbers: strokes.map((item, index) => ({ number: String(index + 1), x: 5, y: 5 })),
  };
}

describe("writing geometry", () => {
  it("memberi skor penuh untuk goresan identik", () => {
    const result = compareStroke(horizontal, horizontal);
    expect(result.score).toBe(100);
    expect(result.start).toBe(100);
    expect(result.end).toBe(100);
    expect(result.direction).toBe(100);
  });

  it("menurunkan skor ketika arah goresan dibalik", () => {
    const result = compareStroke(horizontal, [...horizontal].reverse());
    expect(result.score).toBeLessThan(100);
    expect(result.direction).toBeLessThan(60);
  });

  it("menilai karakter lengkap dengan jumlah goresan yang berbeda", () => {
    const expected = [horizontal, vertical];
    const perfect = evaluateWriting(expected, [horizontal, vertical]);
    expect(perfect.score).toBe(100);
    expect(perfect.countScore).toBe(100);
    expect(perfect.strokeCountOk).toBe(true);

    const missing = evaluateWriting(expected, [horizontal]);
    expect(missing.score).toBeLessThan(perfect.score);
    expect(missing.strokeCountOk).toBe(false);
    expect(missing.matchedStrokes).toBe(1);
  });

  it("menandai urutan goresan yang tertukar tanpa mengklaim pengenalan tulisan", () => {
    const result = evaluateWriting([horizontal, vertical], [vertical, horizontal]);
    expect(result.orderMistakes).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
  });

  it("menggabungkan beberapa glif secara horizontal dan menghitung indeks global", () => {
    expect(combinedWidth(1)).toBe(109);
    expect(combinedWidth(2)).toBe(218);
    const glyphs = [glyph("き", [stroke(1, horizontal)]), glyph("ゃ", [stroke(1, vertical)])];
    const flattened = flattenGlyphPoints(glyphs);
    expect(flattened).toHaveLength(2);
    expect(flattened[1][0].x).toBeGreaterThan(100);
    expect(globalStrokeIndex(glyphs, 0, 0)).toBe(0);
    expect(globalStrokeIndex(glyphs, 1, 0)).toBe(1);
  });

  it("memberi label skor yang eksplisit", () => {
    expect(writingScoreLabel(95)).toBe("Sangat dekat dengan contoh");
    expect(writingScoreLabel(80)).toBe("Cukup dekat");
    expect(writingScoreLabel(55)).toBe("Perlu dirapikan");
    expect(writingScoreLabel(10)).toBe("Coba ulangi perlahan");
  });
});
