import type { WritingPoint, WritingStrokeData } from "@/lib/types";

/**
 * Perbandingan geometri sederhana, bukan pengenalan tulisan tangan.
 * Semua koordinat memakai ruang viewBox KanjiVG 0 0 109 109.
 */

export const WRITING_VIEWBOX = 109;
export const WRITING_MASTERY_SCORE = 80;

export interface StrokeComparison {
  score: number;
  shape: number;
  start: number;
  end: number;
  direction: number;
}

export interface WritingEvaluation {
  score: number;
  shapeScore: number;
  countScore: number;
  averageMatch: number;
  orderMistakes: number;
  matchedStrokes: number;
  strokeCountOk: boolean;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function distance(a: WritingPoint, b: WritingPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pathLength(points: WritingPoint[]): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += distance(points[index - 1], points[index]);
  }
  return total;
}

/** Mengubah polyline menjadi jumlah titik yang sama agar bentuk bisa dibandingkan. */
export function resample(points: WritingPoint[], count = 24): WritingPoint[] {
  if (points.length === 0 || count < 2) return [];
  if (points.length === 1) return Array.from({ length: count }, () => ({ ...points[0] }));
  const total = pathLength(points);
  if (total === 0) return Array.from({ length: count }, () => ({ ...points[0] }));
  const step = total / (count - 1);
  const result: WritingPoint[] = [{ ...points[0] }];
  let previous = points[0];
  let accumulated = 0;
  let index = 1;
  for (let sample = 1; sample < count; sample += 1) {
    const target = step * sample;
    while (index < points.length) {
      const segment = distance(previous, points[index]);
      if (accumulated + segment >= target || index === points.length - 1) {
        if (segment === 0) {
          previous = points[index];
          index += 1;
          continue;
        }
        const ratio = clamp01((target - accumulated) / segment);
        result.push({
          x: previous.x + (points[index].x - previous.x) * ratio,
          y: previous.y + (points[index].y - previous.y) * ratio,
        });
        accumulated += segment;
        previous = points[index];
        index += 1;
        break;
      }
      accumulated += segment;
      previous = points[index];
      index += 1;
    }
  }
  while (result.length < count) result.push({ ...points[points.length - 1] });
  return result;
}

function directionCos(a: WritingPoint[], b: WritingPoint[]): number {
  if (a.length < 2 || b.length < 2) return 0.6;
  const av = { x: a[a.length - 1].x - a[0].x, y: a[a.length - 1].y - a[0].y };
  const bv = { x: b[b.length - 1].x - b[0].x, y: b[b.length - 1].y - b[0].y };
  const al = Math.hypot(av.x, av.y);
  const bl = Math.hypot(bv.x, bv.y);
  if (al < 1 || bl < 1) return 0.6;
  return (av.x * bv.x + av.y * bv.y) / (al * bl);
}

/**
 * Skor satu goresan: bentuk 55%, titik awal 12%, titik akhir 12%, arah 21%.
 * Skor ini tidak mengukur estetika atau tekanan pena.
 */
export function compareStroke(expected: WritingPoint[], drawn: WritingPoint[]): StrokeComparison {
  if (expected.length === 0 || drawn.length === 0) {
    return { score: 0, shape: 0, start: 0, end: 0, direction: 0 };
  }
  const expectedSamples = resample(expected);
  const drawnSamples = resample(drawn);
  const average =
    expectedSamples.reduce((sum, point, index) => sum + distance(point, drawnSamples[index]), 0) /
    expectedSamples.length;
  const shape = Math.round(clamp01(1 - average / 16) * 100);
  const start = Math.round(clamp01(1 - distance(expected[0], drawn[0]) / 22) * 100);
  const end = Math.round(
    clamp01(1 - distance(expected[expected.length - 1], drawn[drawn.length - 1]) / 22) * 100,
  );
  const direction = Math.round(clamp01((directionCos(expected, drawn) + 1) / 2) * 100);
  const score = Math.round(shape * 0.55 + start * 0.12 + end * 0.12 + direction * 0.21);
  return { score, shape, start, end, direction };
}

/** Evaluasi seluruh karakter: bentuk, jumlah goresan, dan indikasi urutan. */
export function evaluateWriting(expected: WritingPoint[][], drawn: WritingPoint[][]): WritingEvaluation {
  const expectedCount = expected.length;
  const drawnCount = drawn.length;
  if (expectedCount === 0 || drawnCount === 0) {
    return {
      score: 0,
      shapeScore: 0,
      countScore: 0,
      averageMatch: 0,
      orderMistakes: 0,
      matchedStrokes: 0,
      strokeCountOk: expectedCount === drawnCount,
    };
  }

  const candidates: Array<{ drawnIndex: number; expectedIndex: number; score: number }> = [];
  for (let drawnIndex = 0; drawnIndex < drawnCount; drawnIndex += 1) {
    for (let expectedIndex = 0; expectedIndex < expectedCount; expectedIndex += 1) {
      candidates.push({
        drawnIndex,
        expectedIndex,
        score: compareStroke(expected[expectedIndex], drawn[drawnIndex]).score,
      });
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  const usedDrawn = new Set<number>();
  const usedExpected = new Set<number>();
  const matches: Array<{ drawnIndex: number; expectedIndex: number; score: number }> = [];
  for (const candidate of candidates) {
    if (usedDrawn.has(candidate.drawnIndex) || usedExpected.has(candidate.expectedIndex)) continue;
    if (candidate.score < 18) continue;
    usedDrawn.add(candidate.drawnIndex);
    usedExpected.add(candidate.expectedIndex);
    matches.push(candidate);
  }

  const matchedTotal = matches.reduce((sum, match) => sum + match.score, 0);
  // Goresan yang hilang tetap dihitung sebagai nol, sehingga satu goresan
  // sempurna dari empat goresan tidak bisa mendapat nilai penuh.
  const shapeScore = Math.round(matchedTotal / expectedCount);
  const averageMatch = matches.length ? Math.round(matchedTotal / matches.length) : 0;
  const countScore =
    drawnCount === expectedCount ? 100 : Math.max(0, 100 - Math.abs(drawnCount - expectedCount) * 20);
  const orderMistakes = matches.filter(
    (match) => match.expectedIndex !== match.drawnIndex && match.score >= 45,
  ).length;
  // Urutan yang tertukar tetap mengurangi skor, tetapi tidak sebesar bentuk
  // yang salah; rinciannya selalu ditampilkan terpisah di UI.
  const orderPenalty = Math.min(24, orderMistakes * 6);
  const score = Math.round(shapeScore * 0.82 + countScore * 0.18 - orderPenalty);

  return {
    score: Math.min(100, Math.max(0, score)),
    shapeScore,
    countScore,
    averageMatch,
    orderMistakes,
    matchedStrokes: matches.length,
    strokeCountOk: drawnCount === expectedCount,
  };
}

export function writingScoreLabel(score: number): string {
  if (score >= 85) return "Sangat dekat dengan contoh";
  if (score >= 70) return "Cukup dekat";
  if (score >= 50) return "Perlu dirapikan";
  return "Coba ulangi perlahan";
}

export function flattenStrokePoints(glyphs: Array<{ strokes: WritingStrokeData[] }>): WritingPoint[][] {
  return glyphs.flatMap((glyph) => glyph.strokes.map((stroke) => stroke.points));
}

/** Lebar gabungan beberapa komponen. Yōon memakai dua komponen berurutan. */
export function combinedWidth(glyphCount: number): number {
  return WRITING_VIEWBOX * Math.max(1, glyphCount);
}

/** Titik goresan yang sudah digeser ke posisi komponennya pada kanvas gabungan. */
export function flattenGlyphPoints(glyphs: Array<{ strokes: WritingStrokeData[] }>): WritingPoint[][] {
  return glyphs.flatMap((glyph, glyphIndex) =>
    glyph.strokes.map((stroke) =>
      stroke.points.map((point) => ({
        x: point.x + glyphIndex * WRITING_VIEWBOX,
        y: point.y,
      })),
    ),
  );
}

export function globalStrokeIndex(glyphs: Array<{ strokes: WritingStrokeData[] }>, glyphIndex: number, strokeIndex: number): number {
  let offset = 0;
  for (let index = 0; index < glyphIndex; index += 1) offset += glyphs[index].strokes.length;
  return offset + strokeIndex;
}
