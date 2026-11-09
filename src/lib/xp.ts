export const LEVEL_TITLES: Array<{ min: number; title: string; jp: string }> = [
  { min: 1, title: "Pemula", jp: "初心者" },
  { min: 2, title: "Pelajar", jp: "学徒" },
  { min: 3, title: "Penjelajah", jp: "旅人" },
  { min: 4, title: "Praktisi", jp: "使い手" },
  { min: 5, title: "Mahir", jp: "上級者" },
  { min: 6, title: "Ahli", jp: "達人" },
  { min: 7, title: "Sensei", jp: "師範" },
  { min: 8, title: "Ahli Kata", jp: "言葉の匠" },
  { min: 9, title: "Legenda", jp: "伝説" },
  { min: 10, title: "Lentera Bahasa", jp: "言葉の光" },
];

export function xpForLevel(level: number): number {
  const n = Math.max(1, level) - 1;
  return 150 * n + 50 * n * n;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp && level < 99) level += 1;
  return level;
}

export function levelProgress(xp: number): {
  level: number;
  title: string;
  jp: string;
  current: number;
  needed: number;
  percent: number;
  nextXp: number;
} {
  const level = levelFromXp(xp);
  const currentFloor = xpForLevel(level);
  const nextXp = xpForLevel(level + 1);
  const current = xp - currentFloor;
  const needed = Math.max(1, nextXp - currentFloor);
  const meta = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  return {
    level,
    title: meta.title,
    jp: meta.jp,
    current,
    needed,
    percent: Math.min(99, Math.floor((current / needed) * 100)),
    nextXp,
  };
}

export function nextLevelXp(xp: number): number {
  return xpForLevel(levelFromXp(xp) + 1);
}