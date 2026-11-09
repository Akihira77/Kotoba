import { describe, expect, it } from "vitest";
import { PRONUNCIATION_BY_ID, PRONUNCIATION_DRILLS } from "./pronunciation";
import { JLPT_LEVELS } from "@/lib/types";

const KANA_ONLY = /^[\u3040-\u309f\u30a0-\u30ffー、。！？\s]+$/;

describe("pronunciation drills", () => {
  it("menyediakan set latihan yang cukup untuk semua level", () => {
    expect(PRONUNCIATION_DRILLS.length).toBeGreaterThanOrEqual(12);
    for (const level of JLPT_LEVELS) {
      expect(PRONUNCIATION_DRILLS.some((drill) => drill.level === level)).toBe(true);
    }
  });

  it("memakai id unik dan dapat dicari kembali", () => {
    const ids = PRONUNCIATION_DRILLS.map((drill) => drill.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const drill of PRONUNCIATION_DRILLS) {
      expect(PRONUNCIATION_BY_ID.get(drill.id)).toBe(drill);
      expect(drill.id).toMatch(/^p-n[1-5]-\d+$/);
    }
  });

  it("melengkapi setiap latihan dengan bacaan, romaji, arti, dan tip", () => {
    for (const drill of PRONUNCIATION_DRILLS) {
      expect(drill.jp.trim().length).toBeGreaterThan(0);
      expect(drill.reading.trim().length).toBeGreaterThan(0);
      expect(drill.reading).toMatch(KANA_ONLY);
      expect(drill.romaji.trim().length).toBeGreaterThan(0);
      expect(drill.meaning.trim().length).toBeGreaterThan(0);
      expect(drill.focus.trim().length).toBeGreaterThan(0);
      expect(drill.tip.trim().length).toBeGreaterThan(0);
      expect(drill.jp).toMatch(/[\u3040-\u30ff\u4e00-\u9faf]/);
    }
  });
});
