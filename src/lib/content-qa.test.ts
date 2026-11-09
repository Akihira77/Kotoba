import { describe, expect, it } from "vitest";

import { collectQuizBanks, formatQaIssue, validateChoiceQuestion, validateContentQa } from "@/lib/content-qa";

describe("validateChoiceQuestion", () => {
  it("menandai pilihan duplikat setelah normalisasi", () => {
    const issues = validateChoiceQuestion({
      id: "q-test",
      source: "test",
      prompt: "Pilih jawaban.",
      options: ["Sama", " sama ", "Berbeda"],
      answerIndex: 0,
      explanation: "Pembahasan.",
    });
    expect(issues.some((issue) => issue.message.includes("duplikat"))).toBe(true);
  });

  it("menandai kunci jawaban di luar rentang", () => {
    const issues = validateChoiceQuestion({
      id: "q-test",
      source: "test",
      prompt: "Pilih jawaban.",
      options: ["A", "B"],
      answerIndex: 2,
      explanation: "Pembahasan.",
    });
    expect(issues.some((issue) => issue.severity === "error" && issue.message.includes("answerIndex"))).toBe(true);
  });
});

describe("dataset konten", () => {
  it("memiliki bank soal yang tidak kosong", () => {
    const total = collectQuizBanks().reduce((sum, bank) => sum + bank.questions.length, 0);
    expect(total).toBeGreaterThan(300);
  });

  it("tidak memiliki kesalahan struktural pada seluruh bank soal", () => {
    const errors = validateContentQa().filter((issue) => issue.severity === "error");
    if (errors.length > 0) {
      console.log(errors.map(formatQaIssue).join("\n"));
    }
    expect(errors).toEqual([]);
  });
});
