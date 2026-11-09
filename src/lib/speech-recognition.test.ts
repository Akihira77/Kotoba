import { describe, expect, it } from "vitest";
import {
  compareSpeechTranscript,
  describeRecognitionError,
  normalizeSpeechText,
  similarityScore,
} from "./speech-recognition";

describe("normalizeSpeechText", () => {
  it("removes punctuation and whitespace", () => {
    expect(normalizeSpeechText(" こんにちは、世界！ ")).toBe("こんにちは世界");
    expect(normalizeSpeechText("はい。そう です。")).toBe("はいそうです");
  });

  it("folds katakana to hiragana but keeps long vowels", () => {
    expect(normalizeSpeechText("コンニチハ")).toBe("こんにちは");
    expect(normalizeSpeechText("コーヒー")).toBe("こーひー");
  });

  it("keeps the iteration mark", () => {
    expect(normalizeSpeechText("時々")).toBe("時々");
  });
});

describe("compareSpeechTranscript", () => {
  it("matches normalized katakana against hiragana", () => {
    const result = compareSpeechTranscript("こんにちは", "コンニチハ。");
    expect(result.verdict).toBe("match");
    expect(result.similarity).toBe(1);
  });

  it("accepts any listed reading and reports the best candidate", () => {
    const result = compareSpeechTranscript(["学生", "がくせい"], "がくせい");
    expect(result.verdict).toBe("match");
    expect(result.bestExpected).toBe("がくせい");
  });

  it("marks a near match as close, not exact", () => {
    const result = compareSpeechTranscript("ありがとう", "ありがと");
    expect(result.verdict).toBe("close");
    expect(result.similarity).toBeGreaterThanOrEqual(0.75);
    expect(result.similarity).toBeLessThan(1);
  });

  it("marks unrelated text as different", () => {
    const result = compareSpeechTranscript("こんにちは", "さようなら");
    expect(result.verdict).toBe("different");
    expect(result.similarity).toBeLessThan(0.75);
  });

  it("returns different for empty input", () => {
    expect(compareSpeechTranscript("こんにちは", "").verdict).toBe("different");
    expect(compareSpeechTranscript([], "こんにちは").verdict).toBe("different");
  });

  it("computes a bounded similarity score", () => {
    expect(similarityScore("こんにちは", "こんにちは")).toBe(1);
    expect(similarityScore("", "abc")).toBe(0);
    const score = similarityScore("ありがとう", "ありがと");
    expect(score).toBeGreaterThan(0.7);
    expect(score).toBeLessThan(1);
  });
});

describe("describeRecognitionError", () => {
  it("explains permission and device failures in Indonesian", () => {
    expect(describeRecognitionError("not-allowed")).toContain("Izin");
    expect(describeRecognitionError("audio-capture")).toContain("Mikrofon");
    expect(describeRecognitionError("language-not-supported")).toContain("Jepang");
  });

  it("has a fallback for unknown failures", () => {
    expect(describeRecognitionError("something-new")).toContain("Pengenalan suara gagal");
  });
});
