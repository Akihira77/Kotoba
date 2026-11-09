const SMALL_YOON = new Set(["ゃ", "ゅ", "ょ", "ャ", "ュ", "ョ"]);
const SMALL_VOWEL = new Set(["ぁ", "ぃ", "ぅ", "ぇ", "ぉ", "ァ", "ィ", "ゥ", "ェ", "ォ", "ゎ", "ヮ"]);

/**
 * Pecah teks kana menjadi mora. Bunyi gabungan seperti きょ dan ファ dihitung
 * satu ubin agar permainan menyusun kata tidak memecah bunyi yang sebenarnya
 * diucapkan sebagai satu satuan.
 */
export function toMorae(text: string): string[] {
  const morae: string[] = [];
  for (const char of Array.from(text.normalize("NFKC"))) {
    if (morae.length > 0 && (SMALL_YOON.has(char) || SMALL_VOWEL.has(char))) {
      morae[morae.length - 1] += char;
    } else {
      morae.push(char);
    }
  }
  return morae;
}

export function kanaLength(text: string): number {
  return toMorae(text).length;
}

export function countTiles(tiles: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const tile of tiles) counts.set(tile, (counts.get(tile) ?? 0) + 1);
  return counts;
}

/** Apakah seluruh mora pada kata tersedia di ubin, memperhitungkan duplikat. */
export function canBuildFromTiles(word: string, tiles: readonly string[]): boolean {
  const available = countTiles(tiles);
  for (const mora of toMorae(word)) {
    const left = available.get(mora) ?? 0;
    if (left <= 0) return false;
    available.set(mora, left - 1);
  }
  return true;
}

export function containsOnlyKana(text: string): boolean {
  return /^[\u3040-\u30ffー]+$/.test(text);
}
