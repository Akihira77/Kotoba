import { describe, expect, it } from "vitest";
import {
  EXAM_CATEGORY_ORDER,
  EXAM_LEARNING_TARGET,
  availableGrammarPoints,
  availableVocabularyTopics,
  buildMockExam,
  buildPracticeExam,
  buildRandomExam,
  buildRetryPaper,
  buildTopicExam,
  gradeExam,
  paperQuestions,
  toExamPayload,
  wrongQuestionIds,
  type ExamPaper,
} from "@/lib/exam-engine";
import { JLPT_LEVELS } from "@/lib/types";

/** RNG deterministik sederhana agar urutan soal dapat diulang dalam uji. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function expectValidPaper(paper: ExamPaper) {
  expect(paper.questionCount).toBeGreaterThan(0);
  const questions = paperQuestions(paper);
  expect(questions).toHaveLength(paper.questionCount);
  expect(new Set(questions.map((item) => item.id)).size).toBe(questions.length);
  expect(new Set(paper.sections.map((section) => section.id)).size).toBe(paper.sections.length);
  for (const item of questions) {
    expect(item.question.options).toHaveLength(4);
    expect(new Set(item.question.options).size).toBe(4);
    expect(item.question.answerIndex).toBeGreaterThanOrEqual(0);
    expect(item.question.answerIndex).toBeLessThan(4);
    expect(EXAM_CATEGORY_ORDER).toContain(item.category);
  }
}

describe("exam engine builders", () => {
  it("membangun simulasi N5 bertimer dengan tiga bagian dan level utama N5", () => {
    const paper = buildMockExam("N5", seeded(7));
    expect(paper.mode).toBe("mock");
    expect(paper.level).toBe("N5");
    expect(paper.timed).toBe(true);
    expect(paper.immediateFeedback).toBe(false);
    expect(paper.minutes).toBe(25);
    expect(paper.sections).toHaveLength(3);
    expect(paper.questionCount).toBe(29);
    expect(paper.sections.map((section) => section.id)).toEqual(["moji-goi", "bunpou-dokkai", "choukai"]);
    expect(paperQuestions(paper).every((item) => item.question.level === "N5")).toBe(true);
    expect(paper.mixedLevels).toBe(false);
    expectValidPaper(paper);
  });

  it("mengisi level lanjut dengan bank soal lintas level dan menandai campuran", () => {
    const paper = buildMockExam("N1", seeded(11));
    expect(paper.level).toBe("N1");
    expect(paper.questionCount).toBe(41);
    expect(paper.mixedLevels).toBe(true);
    expectValidPaper(paper);
  });

  it("menghasilkan simulasi yang sama untuk seed RNG yang sama", () => {
    const first = buildMockExam("N4", seeded(42));
    const second = buildMockExam("N4", seeded(42));
    expect(paperQuestions(first).map((item) => item.id)).toEqual(paperQuestions(second).map((item) => item.id));
  });

  it("membangun ujian acak seimbang 20 soal", () => {
    const paper = buildRandomExam("N3", seeded(3));
    expect(paper.mode).toBe("random");
    expect(paper.timed).toBe(true);
    expect(paper.questionCount).toBe(20);
    expect(paper.sections).toHaveLength(3);
    const counts = new Map<string, number>();
    for (const item of paperQuestions(paper)) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    expect(counts.get("vocabulary")).toBe(6);
    expect(counts.get("kanji")).toBe(4);
    expect(counts.get("grammar")).toBe(4);
    expect(counts.get("reading")).toBe(3);
    expect(counts.get("listening")).toBe(3);
    expectValidPaper(paper);
  });

  it("membangun latihan campuran tanpa timer dengan lima kategori", () => {
    const paper = buildPracticeExam("N5", { count: 10, rng: seeded(9) });
    expect(paper.mode).toBe("practice");
    expect(paper.timed).toBe(false);
    expect(paper.immediateFeedback).toBe(true);
    expect(paper.minutes).toBe(0);
    expect(paper.sections).toHaveLength(1);
    const counts = new Map<string, number>();
    for (const item of paperQuestions(paper)) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    expect([...counts.keys()].sort()).toEqual([...EXAM_CATEGORY_ORDER].sort());
    expect([...counts.values()].every((count) => count === 2)).toBe(true);
    expectValidPaper(paper);
  });

  it("membangun latihan satu kategori", () => {
    const paper = buildPracticeExam("N5", { count: 6, category: "kanji", rng: seeded(5) });
    expect(paperQuestions(paper).every((item) => item.category === "kanji")).toBe(true);
    expect(paper.questionCount).toBe(6);
    expectValidPaper(paper);
  });

  it("membangun ujian topik kosakata", () => {
    const topic = availableVocabularyTopics("N5")[0];
    expect(topic).toBeDefined();
    const paper = buildTopicExam("N5", { kind: "vocabulary", topic: topic.topic }, { count: 5, rng: seeded(12) });
    expect(paper.mode).toBe("topic");
    expect(paper.timed).toBe(false);
    expect(paper.immediateFeedback).toBe(true);
    expect(paper.questionCount).toBeLessThanOrEqual(5);
    expect(paperQuestions(paper).every((item) => item.category === "vocabulary")).toBe(true);
    expectValidPaper(paper);
  });

  it("membangun ujian topik tata bahasa dari satu pola", () => {
    const point = availableGrammarPoints("N5")[0];
    expect(point).toBeDefined();
    const paper = buildTopicExam("N5", { kind: "grammar", grammarId: point.id }, { count: 2, rng: seeded(13) });
    expect(paper.mode).toBe("topic");
    expect(paperQuestions(paper).length).toBeGreaterThan(0);
    expect(paperQuestions(paper).every((item) => item.category === "grammar" && item.sourceId === point.id)).toBe(true);
    expectValidPaper(paper);
  });

  it("smoke test semua level dan mode utama", () => {
    for (const level of JLPT_LEVELS) {
      for (const paper of [buildMockExam(level, seeded(21)), buildRandomExam(level, seeded(22)), buildPracticeExam(level, { rng: seeded(23) })]) {
        expect(paper.level).toBe(level);
        expectValidPaper(paper);
      }
    }
  });

  it("menolak topik atau pola yang tidak ada", () => {
    expect(() => buildTopicExam("N5", { kind: "grammar", grammarId: "tidak-ada" })).toThrow();
  });
});

describe("exam engine grading", () => {
  const paper = buildPracticeExam("N5", { count: 5, rng: seeded(31) });
  const questions = paperQuestions(paper);

  it("menghitung benar, salah, kosong, akurasi, dan skor belajar", () => {
    const startedAt = "2026-11-08T10:00:00.000Z";
    const answers: Record<string, number> = {};
    answers[questions[0].id] = questions[0].question.answerIndex;
    answers[questions[1].id] = questions[1].question.answerIndex;
    answers[questions[2].id] = questions[2].question.answerIndex;
    answers[questions[3].id] = (questions[3].question.answerIndex + 1) % 4;
    const result = gradeExam(paper, answers, startedAt, "2026-11-08T10:02:05.000Z", 125);
    expect(result.totalQuestions).toBe(5);
    expect(result.correct).toBe(3);
    expect(result.answered).toBe(4);
    expect(result.unanswered).toBe(1);
    expect(result.score).toBe(60);
    expect(result.accuracy).toBe(75);
    expect(result.durationSec).toBe(125);
    expect(result.targetMet).toBe(false);
    expect(result.sections[0].score).toBe(60);
    expect(wrongQuestionIds(result)).toHaveLength(2);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it("menandai target belajar saat semua jawaban benar dan tidak menyisakan soal ulang", () => {
    const answers = Object.fromEntries(questions.map((item) => [item.id, item.question.answerIndex]));
    const result = gradeExam(paper, answers, "2026-11-08T10:00:00.000Z", "2026-11-08T10:01:00.000Z", 60);
    expect(result.correct).toBe(5);
    expect(result.unanswered).toBe(0);
    expect(result.score).toBe(100);
    expect(result.accuracy).toBe(100);
    expect(result.targetMet).toBe(true);
    expect(result.weakAreas).toHaveLength(0);
    expect(buildRetryPaper(result)).toBeNull();
  });

  it("membuat kertas ulang hanya dari soal salah atau kosong", () => {
    const answers: Record<string, number> = {};
    answers[questions[0].id] = questions[0].question.answerIndex;
    answers[questions[1].id] = (questions[1].question.answerIndex + 1) % 4;
    const result = gradeExam(paper, answers, "2026-11-08T10:00:00.000Z", "2026-11-08T10:01:00.000Z", 60);
    const retry = buildRetryPaper(result);
    expect(retry).not.toBeNull();
    expect(retry?.mode).toBe("practice");
    expect(retry?.timed).toBe(false);
    expect(retry?.immediateFeedback).toBe(true);
    expect(retry?.questionCount).toBe(4);
    expect(paperQuestions(retry!).map((item) => item.id)).not.toContain(questions[0].id);
    expect(paperQuestions(retry!).map((item) => item.id)).toContain(questions[1].id);
  });

  it("mengubah hasil menjadi payload progres API", () => {
    const answers = { [questions[0].id]: questions[0].question.answerIndex };
    const result = gradeExam(paper, answers, "2026-11-08T10:00:00.000Z", "2026-11-08T10:01:00.000Z", 60);
    const payload = toExamPayload(result);
    expect(payload.level).toBe("N5");
    expect(payload.total).toBe(100);
    expect(payload.passed).toBe(result.targetMet);
    expect(payload.review).toHaveLength(result.totalQuestions);
    expect(payload.review.find((item) => item.questionId === questions[0].id)?.correct).toBe(true);
    expect(payload.review.find((item) => item.questionId === questions[1].id)?.selectedIndex).toBeNull();
    expect(payload.sections).toHaveLength(result.sections.length);
  });

  it("memakai target belajar 70, bukan ambang resmi JLPT", () => {
    expect(EXAM_LEARNING_TARGET).toBe(70);
  });
});

describe("exam engine metadata", () => {
  it("menyediakan topik kosakata dan pola tata bahasa untuk N5", () => {
    expect(availableVocabularyTopics("N5").length).toBeGreaterThan(1);
    expect(availableGrammarPoints("N5").length).toBeGreaterThan(5);
  });

  it("mempertahankan urutan level JLPT", () => {
    expect(JLPT_LEVELS).toEqual(["N5", "N4", "N3", "N2", "N1"]);
  });
});
