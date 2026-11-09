import { describe, expect, it } from "vitest";
import { canBuildFromTiles, containsOnlyKana, countTiles, kanaLength, toMorae } from "./morae";

describe("morae", () => {
  it("menggabungkan yoon dan vokal kecil menjadi satu mora", () => {
    expect(toMorae("きょう")).toEqual(["きょ", "う"]);
    expect(toMorae("ファ")).toEqual(["ファ"]);
    expect(kanaLength("しゃしん")).toBe(3);
  });

  it("mempertahankan sokuon dan vokal panjang sebagai mora terpisah", () => {
    expect(toMorae("がっこう")).toEqual(["が", "っ", "こ", "う"]);
    expect(toMorae("コーヒー")).toEqual(["コ", "ー", "ヒ", "ー"]);
  });

  it("menghitung duplikat ubin dengan benar", () => {
    expect(canBuildFromTiles("こころ", ["こ", "こ", "ろ"])).toBe(true);
    expect(canBuildFromTiles("こころ", ["こ", "ろ"])).toBe(false);
    expect(canBuildFromTiles("がっこう", ["が", "っ", "こ", "う", "あ"])).toBe(true);
  });

  it("mengubah teks ke NFKC sebelum memecah mora", () => {
    expect(toMorae("ｷｮｳ")).toEqual(["キョ", "ウ"]);
  });

  it("mendeteksi teks yang hanya berisi kana", () => {
    expect(containsOnlyKana("ひらがな")).toBe(true);
    expect(containsOnlyKana("コーヒー")).toBe(true);
    expect(containsOnlyKana("漢字")).toBe(false);
    expect(containsOnlyKana("kana")).toBe(false);
  });

  it("menghitung frekuensi ubin", () => {
    expect(countTiles(["あ", "い", "あ"]).get("あ")).toBe(2);
    expect(countTiles(["あ", "い", "あ"]).get("う")).toBeUndefined();
  });
});
