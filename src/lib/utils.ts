import type { JLPTLevel } from "./types";

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function percent(value: number, total: number): number {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function shuffle<T>(input: readonly T[], rng: () => number = Math.random): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function sample<T>(input: readonly T[], count: number, rng: () => number = Math.random): T[] {
  return shuffle(input, rng).slice(0, Math.max(0, count));
}

export function sampleDistinct<T>(input: readonly T[], count: number, rng: () => number = Math.random): T[] {
  return shuffle(input, rng).slice(0, Math.max(0, Math.min(count, input.length)));
}

export function pickWeighted<T>(entries: Array<{ value: T; weight: number }>, rng: () => number = Math.random): T {
  const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
  let roll = rng() * total;
  for (const entry of entries) {
    roll -= Math.max(0, entry.weight);
    if (roll <= 0) return entry.value;
  }
  return entries[entries.length - 1].value;
}

export function groupBy<T, K extends string | number>(items: readonly T[], key: (item: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const item of items) {
    const k = key(item);
    (out[k] ||= []).push(item);
  }
  return out;
}

export function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatDate(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function formatShortDate(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(date);
}

export function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  if (safe < 60) return `${safe} detik`;
  const m = Math.floor(safe / 60);
  if (m < 60) return `${m} menit`;
  const h = Math.floor(m / 60);
  return `${h} jam ${m % 60} menit`;
}

export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function daysBetween(a: Date, b: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((end - start) / ms);
}

export function startOfWeek(date: Date = new Date()): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function relativeDue(iso: string, now: Date = new Date()): string {
  const diff = new Date(iso).getTime() - now.getTime();
  if (diff <= 0) return "siap diulang";
  const hours = Math.round(diff / (60 * 60 * 1000));
  if (hours < 24) return `dalam ${hours} jam`;
  const days = Math.round(diff / (24 * 60 * 60 * 1000));
  return `dalam ${days} hari`;
}

export function greeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 4) return "Selamat malam";
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

export function levelLabel(level: JLPTLevel): string {
  return `JLPT ${level}`;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function pickNextLevel(levels: JLPTLevel[]): JLPTLevel | null {
  if (!levels.length) return null;
  return levels[0];
}

export function pluralId(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}
