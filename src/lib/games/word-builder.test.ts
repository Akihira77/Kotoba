import { describe, expect, it } from "vitest";
import { VOCABULARY } from "@/content/vocabulary";
import { buildWordBuilderRounds, checkWordBuild, WORD_BUILDER_CONFIG, wordBuilderHint, wordBuilderPoints } from "./word-builder";
import { toMorae } from "./morae";
import { seededRng } from "./shared";

describe("word builder", () => {
  it("membangun ronde dengan jumlah, level, dan ubin yang benar", () => {
    for (const difficulty of ["easy", "standard", "hard"] as const) {
      const config = WORD_BUILDER_CONFIG[difficulty];
      const rounds = buildWordBuilderRounds(difficulty, seededRng("wb-" + difficulty));
      expect(rounds).toHaveLength(config.rounds);
      expect(new Set(rounds.map((round) => round.target.id)).size).toBe(config.rounds);
      for (const round of rounds) {
        expect(config.levels).toContain(round.target.level);
        expect(round.target.kana).toMatch(/^[\u3040-\u30ffー]+$/);
        const morae = toMorae(round.target.kana);
        expect(morae.length).toBeLessThanOrEqual(config.maxMorae);
        for (const mora of morae) expect(round.tiles).toContain(mora);
        for (const decoy of round.decoys) expect(morae).not.toContain(decoy);
        expect(round.hint).toContain("mora");
      }
    }
  });

  it("menerima target yang disusun tepat", () => {
    const [round] = buildWordBuilderRounds("easy", seededRng("wb-correct"));
    const result = checkWordBuild(round.target.kana, round.target);
    expect(result.status).toBe("correct");
    expect(result.accepted).toBe(true);
    expect(result.word?.id).toBe(round.target.id);
  });

  it("menerima kata lain yang ada di kamus sebagai alternatif", () => {
    const [round] = buildWordBuilderRounds("easy", seededRng("wb-alt"));
    const other = VOCABULARY.find(
      (word) => word.id !== round.target.id && word.kana !== round.target.kana,
    );
    expect(other).toBeDefined();
    const result = checkWordBuild(other!.kana, round.target);
    expect(result.status).toBe("alternate");
    expect(result.accepted).toBe(true);
  });

  it("menolak rangkaian yang tidak ada di kamus", () => {
    const [round] = buildWordBuilderRounds("easy", seededRng("wb-invalid"));
    const result = checkWordBuild("ぬぬぬ", round.target);
    expect(result.accepted).toBe(false);
    expect(["invalid", "incomplete"]).toContain(result.status);
    expect(checkWordBuild("", round.target).status).toBe("empty");
  });

  it("memberi petunjuk mora awal", () => {
    const [round] = buildWordBuilderRounds("easy", seededRng("wb-hint"));
    const morae = toMorae(round.target.kana);
    const hint = wordBuilderHint(round, 2);
    expect(hint).toContain(morae.slice(0, 2).join(""));
    expect(hint).toContain(String(morae.length));
  });

  it("memberi poin lebih besar untuk kata sulit dan memotong poin saat petunjuk dipakai", () => {
    const word = VOCABULARY.find((item) => item.level === "N1") ?? VOCABULARY[0];
    expect(wordBuilderPoints(word, "hard", 0)).toBeGreaterThan(0);
    expect(wordBuilderPoints(word, "hard", 2)).toBeLessThan(wordBuilderPoints(word, "hard", 0));
    expect(wordBuilderPoints(word, "easy", 0)).toBeGreaterThanOrEqual(10);
  });
});
