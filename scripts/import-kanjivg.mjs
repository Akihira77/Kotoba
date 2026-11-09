#!/usr/bin/env node
/**
 * Imports stroke geometry from KanjiVG (CC BY-SA 3.0) into compact per-glyph
 * JSON. Source commit is pinned; the source SVG is not modified except for
 * extracting paths and start/end data needed by the Kotoba player.
 *
 * Run: node --experimental-strip-types scripts/import-kanjivg.mjs [--force]
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const COMMIT = "610091ce618cf757ed1357a8954cd65283e015d6";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "writing", "kanjivg");
const FORCE = process.argv.includes("--force");
const BASE = "https://raw.githubusercontent.com/KanjiVG/kanjivg/" + COMMIT + "/kanji/";

const { ALL_KANA } = await import(pathToFileURL(path.join(ROOT, "src/content/kana.ts")).href);
const { KANJI } = await import(pathToFileURL(path.join(ROOT, "src/content/kanji.ts")).href);

const glyphs = new Map();
for (const kana of ALL_KANA) {
  for (const char of [...kana.char]) {
    glyphs.set(char, { char, kinds: new Set(["kana"]) });
  }
}
for (const kanji of KANJI) {
  const entry = glyphs.get(kanji.char) ?? { char: kanji.char, kinds: new Set() };
  entry.kinds.add("kanji");
  entry.expectedStrokes = kanji.strokes;
  glyphs.set(kanji.char, entry);
}

function codepoint(char) {
  return [...char].map((c) => c.codePointAt(0).toString(16).padStart(5, "0")).join("-");
}

function attrs(tag) {
  const out = {};
  for (const match of tag.matchAll(/([a-zA-Z:-]+)="([^"]*)"/g)) out[match[1]] = match[2];
  return out;
}

function extractSvg(svg, char) {
  const pathTags = [...svg.matchAll(/<path\b[^>]*>/g)].map((m) => m[0]);
  const paths = pathTags.map((tag) => ({ ...attrs(tag), ...(tag.includes("/>") ? {} : {}) }));
  const strokes = paths
    .filter((p) => p.id && /-s\d+$/.test(p.id))
    .map((p) => {
      const m = p.id.match(/-s(\d+)$/);
      return { number: Number(m[1]), d: p.d ?? "", id: p.id };
    })
    .sort((a, b) => a.number - b.number);
  if (strokes.length === 0) throw new Error(char + ": no stroke paths");
  for (let i = 0; i < strokes.length; i++) {
    if (strokes[i].number !== i + 1) throw new Error(char + ": stroke sequence gap at " + (i + 1));
    if (!strokes[i].d) throw new Error(char + ": empty stroke path " + (i + 1));
  }
  const numbers = [...svg.matchAll(/<text\b[^>]*transform="matrix\(1 0 0 1 ([\d.-]+) ([\d.-]+)\)"[^>]*>(\d+)<\/text>/g)].map(
    (m) => ({ number: Number(m[3]), x: Number(m[1]), y: Number(m[2]) }),
  );
  if (numbers.length !== strokes.length) {
    throw new Error(char + ": number count " + numbers.length + " != strokes " + strokes.length);
  }
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i].number !== i + 1) throw new Error(char + ": number sequence gap at " + (i + 1));
  }
  return { strokes, numbers };
}

const NUMBER = /[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;

function parsePath(d) {
  const tokens = d.match(NUMBER) ?? [];
  const segs = [];
  let i = 0;
  let cmd = "";
  let x = 0, y = 0, sx = 0, sy = 0;
  let lastCtrl = null, lastQCtrl = null, prevCmd = "";
  const number = () => {
    if (i >= tokens.length) throw new Error("Unexpected end of path");
    const value = Number(tokens[i++]);
    if (!Number.isFinite(value)) throw new Error("Bad path number");
    return value;
  };
  const isCmd = (token) => /^[a-zA-Z]$/.test(token);
  const addLine = (x1, y1) => segs.push({ type: "L", from: [x, y], to: [x1, y1], command: cmd });
  const addCubic = (x1, y1, x2, y2, x3, y3) => segs.push({ type: "C", from: [x, y], c1: [x1, y1], c2: [x2, y2], to: [x3, y3], command: cmd });
  const addQuad = (x1, y1, x2, y2) => segs.push({ type: "Q", from: [x, y], c: [x1, y1], to: [x2, y2], command: cmd });

  while (i < tokens.length) {
    let token = tokens[i];
    if (!isCmd(token)) {
      if (!cmd) throw new Error("Path data must start with a command");
      // implicit repeat of previous command, except M/m becomes L/l
      if (cmd === "M") token = "L";
      else if (cmd === "m") token = "l";
      else token = cmd;
    } else {
      i++;
      cmd = token;
    }
    const rel = token === token.toLowerCase();
    const baseX = rel ? x : 0;
    const baseY = rel ? y : 0;
    switch (token.toUpperCase()) {
      case "M": {
        x = baseX + number();
        y = baseY + number();
        sx = x; sy = y;
        segs.push({ type: "M", to: [x, y], command: token });
        break;
      }
      case "L": {
        const nx = baseX + number();
        const ny = baseY + number();
        addLine(nx, ny); x = nx; y = ny;
        break;
      }
      case "H": {
        const nx = baseX + number();
        addLine(nx, y); x = nx;
        break;
      }
      case "V": {
        const ny = baseY + number();
        addLine(x, ny); y = ny;
        break;
      }
      case "C": {
        const x1 = baseX + number(), y1 = baseY + number();
        const x2 = baseX + number(), y2 = baseY + number();
        const x3 = baseX + number(), y3 = baseY + number();
        addCubic(x1, y1, x2, y2, x3, y3);
        lastCtrl = [x2, y2]; x = x3; y = y3;
        break;
      }
      case "S": {
        const x2 = baseX + number(), y2 = baseY + number();
        const x3 = baseX + number(), y3 = baseY + number();
        const prev = prevCmd.toUpperCase();
        const c1 = (prev === "C" || prev === "S") && lastCtrl ? [2 * x - lastCtrl[0], 2 * y - lastCtrl[1]] : [x, y];
        addCubic(c1[0], c1[1], x2, y2, x3, y3);
        lastCtrl = [x2, y2]; x = x3; y = y3;
        break;
      }
      case "Q": {
        const x1 = baseX + number(), y1 = baseY + number();
        const x2 = baseX + number(), y2 = baseY + number();
        addQuad(x1, y1, x2, y2);
        lastQCtrl = [x1, y1]; x = x2; y = y2;
        break;
      }
      case "T": {
        const x2 = baseX + number(), y2 = baseY + number();
        const prev = prevCmd.toUpperCase();
        const c = (prev === "Q" || prev === "T") && lastQCtrl ? [2 * x - lastQCtrl[0], 2 * y - lastQCtrl[1]] : [x, y];
        addQuad(c[0], c[1], x2, y2);
        lastQCtrl = c; x = x2; y = y2;
        break;
      }
      case "A": {
        // KanjiVG uses cubic paths; if an arc appears, keep the endpoint but
        // fail loudly rather than fabricate a shape for animation/validation.
        const rx = number(), ry = number(), rot = number(), large = number(), sweep = number();
        const nx = baseX + number(), ny = baseY + number();
        void rx; void ry; void rot; void large; void sweep;
        throw new Error("Arc command is unsupported");
        x = nx; y = ny;
        break;
      }
      case "Z": {
        segs.push({ type: "Z", to: [sx, sy], command: token });
        x = sx; y = sy;
        break;
      }
      default:
        throw new Error("Unsupported path command: " + token);
    }
    prevCmd = token;
    if (token === "M" || token === "m") prevCmd = "M";
  }
  return segs;
}

const SAMPLES_PER_CURVE = 12;

function sampleSegments(segs) {
  const points = [];
  let start = [0, 0];
  for (const seg of segs) {
    if (seg.type === "M") {
      start = seg.to;
      points.push([...seg.to]);
    } else if (seg.type === "L") {
      for (let k = 1; k <= 8; k++) points.push(lerp(seg.from, seg.to, k / 8));
    } else if (seg.type === "C") {
      for (let k = 1; k <= SAMPLES_PER_CURVE; k++) {
        const t = k / SAMPLES_PER_CURVE;
        const mt = 1 - t;
        points.push([
          mt*mt*mt*seg.from[0] + 3*mt*mt*t*seg.c1[0] + 3*mt*t*t*seg.c2[0] + t*t*t*seg.to[0],
          mt*mt*mt*seg.from[1] + 3*mt*mt*t*seg.c1[1] + 3*mt*t*t*seg.c2[1] + t*t*t*seg.to[1],
        ]);
      }
    } else if (seg.type === "Q") {
      for (let k = 1; k <= SAMPLES_PER_CURVE; k++) {
        const t = k / SAMPLES_PER_CURVE;
        const mt = 1 - t;
        points.push([
          mt*mt*seg.from[0] + 2*mt*t*seg.c[0] + t*t*seg.to[0],
          mt*mt*seg.from[1] + 2*mt*t*seg.c[1] + t*t*seg.to[1],
        ]);
      }
    } else if (seg.type === "Z") {
      points.push([...start]);
    }
  }
  return resample(points, 28);
}

function serializePoint(point) {
  return { x: Math.round(point[0] * 100) / 100, y: Math.round(point[1] * 100) / 100 };
}

function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function resample(points, count) {
  const clean = points.filter((p, i) => i === 0 || Math.hypot(p[0] - points[i-1][0], p[1] - points[i-1][1]) > 0.0001);
  if (clean.length < 2) return [];
  const lengths = [0];
  let total = 0;
  for (let i = 1; i < clean.length; i++) {
    total += Math.hypot(clean[i][0] - clean[i-1][0], clean[i][1] - clean[i-1][1]);
    lengths.push(total);
  }
  if (total === 0) return [];
  const result = [];
  let cursor = 0;
  for (let i = 0; i < count; i++) {
    const target = (i / (count - 1)) * total;
    while (cursor < lengths.length - 1 && lengths[cursor + 1] < target) cursor++;
    const span = lengths[cursor + 1] - lengths[cursor] || 1;
    const ratio = (target - lengths[cursor]) / span;
    result.push(lerp(clean[cursor], clean[cursor + 1], Math.max(0, Math.min(1, ratio))));
  }
  return result.map(([x, y]) => [round(x), round(y)]);
}

function round(value) {
  return Math.round(value * 100) / 100;
}

async function fetchSvg(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  throw lastError;
}

await fs.mkdir(OUT_DIR, { recursive: true });
const files = [...glyphs.values()].sort((a, b) => a.char.localeCompare(b.char, "ja"));
let fetched = 0, skipped = 0;
const failures = [];
for (const glyph of files) {
  const id = codepoint(glyph.char);
  const target = path.join(OUT_DIR, id + ".json");
  if (!FORCE) {
    try {
      const existing = JSON.parse(await fs.readFile(target, "utf8"));
      if (existing.strokes?.length && existing.character === glyph.char) { skipped++; continue; }
    } catch {}
  }
  const url = BASE + id + ".svg";
  try {
    const svg = await fetchSvg(url);
    const { strokes, numbers } = extractSvg(svg, glyph.char);
    if (glyph.expectedStrokes && glyph.expectedStrokes !== strokes.length) {
      throw new Error("stroke count mismatch: catalog " + glyph.expectedStrokes + ", KanjiVG " + strokes.length);
    }
    const output = {
      character: glyph.char,
      codepoint: id,
      viewBox: "0 0 109 109",
      source: {
        project: "KanjiVG",
        commit: COMMIT,
        url: "https://github.com/KanjiVG/kanjivg",
        license: "CC BY-SA 3.0",
        attribution: "Ulrich Apel and KanjiVG contributors",
      },
      strokes: strokes.map((stroke) => {
        const points = sampleSegments(parsePath(stroke.d));
        if (points.length < 2) throw new Error("empty geometry for stroke " + stroke.number);
        return {
          number: stroke.number,
          d: stroke.d,
          start: serializePoint(points[0]),
          end: serializePoint(points[points.length - 1]),
          points: points.map(serializePoint),
        };
      }),
      numbers,
    };
    await fs.writeFile(target, JSON.stringify(output));
    fetched++;
    if (fetched % 20 === 0) console.log("fetched", fetched, "/", files.length);
  } catch (error) {
    failures.push({ char: glyph.char, id, message: error.message });
  }
}

const strokeCounts = {};
for (const glyph of files) {
  const data = JSON.parse(await fs.readFile(path.join(OUT_DIR, codepoint(glyph.char) + ".json"), "utf8"));
  strokeCounts[glyph.char] = data.strokes.length;
}
const manifest = {
  project: "KanjiVG",
  commit: COMMIT,
  license: "CC BY-SA 3.0",
  attribution: "Ulrich Apel and KanjiVG contributors",
  source: "https://github.com/KanjiVG/kanjivg",
  characters: files.length,
  files: files.map((glyph) => ({ character: glyph.char, file: codepoint(glyph.char) + ".json", strokes: strokeCounts[glyph.char] })),
};
await fs.writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
const strokeModule = "/** Generated by scripts/import-kanjivg.mjs. Do not edit by hand. */\nexport const KANJIVG_STROKE_COUNTS: Record<string, number> = " + JSON.stringify(strokeCounts, null, 2) + ";\n";
await fs.writeFile(path.join(ROOT, "src/content/writing-strokes.ts"), strokeModule);
console.log(JSON.stringify({ fetched, skipped, failed: failures.length, files: files.length }, null, 2));
if (failures.length) {
  console.error(failures);
  process.exitCode = 1;
}