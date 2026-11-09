import { describe, expect, it } from "vitest";
import { KANA_MATCHING_MODES, KANA_MATCH_COUNTS, buildKanaMatchingRound, kanaMatchHints, kanaMatchPoints, kanaMatchRoundWithSeed, pickKanaHintPair } from "./kana-matching";
import { seededRng } from "./shared";

const difficulties = ["easy", "standard", "hard"] as const;

describe("kana matching", () => {
  it("menyediakan empat mode permainan", () => {
    expect(KANA_MATCHING_MODES.map((mode) => mode.id)).toEqual([
      "hiragana-romaji",
      "katakana-romaji",
      "kana-vocab",
      "kana-audio",
    ]);
  });

  it("membangun jumlah pasangan dan kartu sesuai tingkat kesulitan", () => {
    for (const mode of KANA_MATCHING_MODES) {
      for (const difficulty of difficulties) {
        const round = buildKanaMatchingRound(mode.id, difficulty, seededRngFor(mode.id, difficulty));
        expect(round.pairs).toHaveLength(KANA_MATCH_COUNTS[difficulty]);
        expect(round.cards).toHaveLength(KANA_MATCH_COUNTS[difficulty] * 2);
        expect(new Set(round.pairs.map((pair) => pair.id)).size).toBe(round.pairs.length);
        expect(new Set(round.cards.map((card) => card.id)).size).toBe(round.cards.length);
        for (const card of round.cards) {
          expect(round.pairs.some((pair) => pair.id === card.pairId)).toBe(true);
        }
      }
    }
  });

  it("memakai label yang sesuai untuk setiap mode", () => {
    const romaji = buildKanaMatchingRound("hiragana-romaji", "easy", seededRngFor("hiragana-romaji", "easy"));
    for (const pair of romaji.pairs) expect(pair.matchLabel).toBe(pair.romaji);

    const vocab = buildKanaMatchingRound("kana-vocab", "easy", seededRngFor("kana-vocab", "easy"));
    for (const pair of vocab.pairs) {
      expect(pair.exampleWord).toBeTruthy();
      expect(pair.matchLabel).toBe(pair.exampleWord);
      expect(pair.matchSub).toBeTruthy();
    }

    const audio = buildKanaMatchingRound("kana-audio", "easy", seededRngFor("kana-audio", "easy"));
    for (const card of audio.cards) {
      if (card.face === "prompt") {
        expect(card.audioOnly).toBe(true);
        expect(card.audioText).toBeTruthy();
      } else {
        expect(card.audioOnly).toBe(false);
        expect(audio.pairs.find((pair) => pair.id === card.pairId)?.char).toBe(card.label);
      }
    }
  });

  it("deterministik untuk seed yang sama", () => {
    const a = kanaMatchRoundWithSeed("katakana-romaji", "standard", "seed-1");
    const b = kanaMatchRoundWithSeed("katakana-romaji", "standard", "seed-1");
    expect(a.pairs.map((pair) => pair.id)).toEqual(b.pairs.map((pair) => pair.id));
    expect(a.cards.map((card) => card.id)).toEqual(b.cards.map((card) => card.id));
  });

  it("memberi skor minimal 20 dan petunjuk sesuai kesulitan", () => {
    expect(kanaMatchPoints(1, 30, 200, 10)).toBe(20);
    expect(kanaMatchPoints(8, 0, 20, 0)).toBeGreaterThan(0);
    expect(kanaMatchHints("hard")).toBe(2);
    expect(kanaMatchHints("easy")).toBe(3);
  });

  it("memilih pasangan yang belum cocok sebagai petunjuk", () => {
    const round = kanaMatchRoundWithSeed("hiragana-romaji", "easy", "hint-seed");
    const first = round.pairs[0];
    const hint = pickKanaHintPair(round.cards, new Set([first.id]), () => 0);
    expect(hint).not.toBe(first.id);
    expect(pickKanaHintPair(round.cards, new Set(round.pairs.map((pair) => pair.id)))).toBeNull();
  });
});

function seededRngFor(mode: string, difficulty: string) {
  return seededRng("kana-" + mode + "-" + difficulty);
}
