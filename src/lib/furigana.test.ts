import { describe, expect, it } from "vitest";
import { furiganaReading, hasFurigana, parseFurigana, stripFurigana } from "./furigana";

describe("furigana markup", () => {
  it("parses plain and annotated segments", () => {
    const segments = parseFurigana("私は{学生|がくせい}です。");
    expect(segments).toEqual([
      { text: "私は" },
      { text: "学生", ruby: "がくせい" },
      { text: "です。" },
    ]);
  });

  it("strips markup for speech and search", () => {
    expect(stripFurigana("私は{学生|がくせい}です。")).toBe("私は学生です。");
    expect(stripFurigana("プレーンな文")).toBe("プレーンな文");
  });

  it("uses ruby readings as the speech string", () => {
    expect(furiganaReading("私は{学生|がくせい}です。")).toBe("私はがくせいです。");
    expect(furiganaReading("{食|た}べます")).toBe("たべます");
    expect(furiganaReading("プレーンな文")).toBe("プレーンな文");
  });

  it("recognizes markup and leaves malformed braces intact", () => {
    expect(hasFurigana("{漢字|かんじ}")).toBe(true);
    expect(hasFurigana("漢字")).toBe(false);
    expect(stripFurigana("まだ{閉じない")).toBe("まだ{閉じない");
  });
});
