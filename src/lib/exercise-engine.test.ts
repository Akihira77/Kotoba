import { describe, expect, it } from "vitest";
import type { Exercise, ExerciseAttemptAnswer } from "./types";
import {
  createQuizAttempt,
  gradeExercise,
  isAcceptedAnswer,
  normalizeAnswer,
  rngFromSeed,
  summarizeAnswers,
} from "./exercise-engine";

const mc: Exercise = {
  id: "ex-mc",
  kind: "multiple-choice",
  level: "N5",
  prompt: "Apa arti 学生?",
  explanation: "学生 berarti siswa atau mahasiswa.",
  tags: ["kosakata"],
  options: ["guru", "siswa / mahasiswa", "teman", "orang Jepang"],
  answerIndex: 1,
};

const reading: Exercise = {
  id: "ex-reading",
  kind: "reading-recognition",
  level: "N5",
  prompt: "Bagaimana cara baca 学校?",
  explanation: "学校 dibaca がっこう.",
  tags: ["kanji"],
  word: "学校",
  options: ["がくせい", "がっこう", "せんせい", "ともだち"],
  answerIndex: 1,
  reading: "がっこう",
};

const typing: Exercise = {
  id: "ex-typing",
  kind: "typing",
  level: "N5",
  prompt: "Ketik 'terima kasih' dalam bahasa Jepang.",
  explanation: "ありがとう adalah bentuk kasual.",
  tags: ["kosakata"],
  answer: "ありがとう",
  acceptedAnswers: ["ありがとう", "ありがとうございます"],
  inputMode: "kana",
};

const translation: Exercise = {
  id: "ex-translation",
  kind: "translation",
  level: "N5",
  prompt: "Terjemahkan ke bahasa Jepang.",
  explanation: "Gunakan pola N + です.",
  tags: ["tata bahasa"],
  source: "Saya seorang pelajar.",
  direction: "id-to-ja",
  acceptedAnswers: ["私は学生です。", "わたしはがくせいです。"],
  keywords: ["学生"],
  reference: "Saya seorang pelajar.",
};

const cloze: Exercise = {
  id: "ex-cloze",
  kind: "cloze",
  level: "N5",
  prompt: "Lengkapi kalimat.",
  explanation: "Partikel は menandai topik.",
  tags: ["partikel"],
  text: "私___学生です。",
  answer: "は",
  acceptedAnswers: ["は"],
};

const matching: Exercise = {
  id: "ex-matching",
  kind: "matching",
  level: "N5",
  prompt: "Cocokkan.",
  explanation: "Pasangan kosakata dasar.",
  tags: ["kosakata"],
  pairs: [
    { id: "p1", left: "私", right: "saya" },
    { id: "p2", left: "学生", right: "siswa" },
    { id: "p3", left: "先生", right: "guru" },
  ],
};

const ordering: Exercise = {
  id: "ex-ordering",
  kind: "ordering",
  level: "N5",
  prompt: "Susun kalimat.",
  explanation: "Partikel を menandai objek.",
  tags: ["susun kalimat"],
  tokens: ["パンを", "わたし", "は", "食べます"],
  answer: ["わたし", "は", "パンを", "食べます"],
};

const tf: Exercise = {
  id: "ex-tf",
  kind: "true-false",
  level: "N5",
  prompt: "Benar atau salah?",
  explanation: "学生 berarti siswa.",
  tags: ["kosakata"],
  statement: "Kata 学生 berarti guru.",
  answer: false,
  correction: "学生 berarti siswa atau mahasiswa; guru adalah 先生.",
};

const listening: Exercise = {
  id: "ex-listening",
  kind: "listening",
  level: "N5",
  prompt: "Apa yang dikatakan pembicara?",
  explanation: "こんにちは dipakai siang hari.",
  tags: ["menyimak"],
  audioText: "こんにちは、田中さん。",
  options: ["Selamat pagi", "Halo, Tanaka-san", "Selamat malam", "Terima kasih"],
  answerIndex: 1,
};

describe("normalisasi jawaban", () => {
  it("mengabaikan spasi, tanda baca, lebar karakter, dan huruf besar", () => {
    expect(normalizeAnswer("  ＳＥＬＡＭＡＴ   pagi! ")).toBe("selamatpagi");
    expect(normalizeAnswer("私は学生です。")).toBe("私は学生です");
    expect(normalizeAnswer("私は学生です")).toBe(normalizeAnswer("私は学生です。"));
  });

  it("menerima varian yang didaftarkan dan menolak yang tidak", () => {
    expect(isAcceptedAnswer("ありがとう", typing.acceptedAnswers)).toBe(true);
    expect(isAcceptedAnswer("ありがとうございます。", typing.acceptedAnswers)).toBe(true);
    expect(isAcceptedAnswer("さようなら", typing.acceptedAnswers)).toBe(false);
    expect(isAcceptedAnswer("", typing.acceptedAnswers)).toBe(false);
  });
});

describe("gradeExercise", () => {
  it("menilai pilihan ganda dan memberi jawaban yang tepat", () => {
    const right = gradeExercise(mc, { kind: "multiple-choice", selectedIndex: 1 });
    expect(right.correct).toBe(true);
    expect(right.score).toBe(1);
    const wrong = gradeExercise(mc, { kind: "multiple-choice", selectedIndex: 0 });
    expect(wrong.correct).toBe(false);
    expect(wrong.feedback).toContain("siswa / mahasiswa");
  });

  it("menilai soal baca dan menyimak", () => {
    expect(gradeExercise(reading, { kind: "multiple-choice", selectedIndex: 1 }).correct).toBe(true);
    expect(gradeExercise(reading, { kind: "multiple-choice", selectedIndex: 2 }).correct).toBe(false);
    expect(gradeExercise(listening, { kind: "listening", selectedIndex: 1 }).correct).toBe(true);
  });

  it("menerima varian ejaan Jepang pada soal mengetik", () => {
    expect(gradeExercise(typing, { kind: "typing", text: "ありがとう" }).correct).toBe(true);
    expect(gradeExercise(typing, { kind: "typing", text: "ありがとうございます。" }).correct).toBe(true);
    expect(gradeExercise(typing, { kind: "typing", text: "ありがとう" }).score).toBe(1);
  });

  it("menilai isi rumpang dan terjemahan dengan tanda baca berbeda", () => {
    expect(gradeExercise(cloze, { kind: "cloze", text: "は" }).correct).toBe(true);
    expect(gradeExercise(translation, { kind: "translation", text: "わたしはがくせいです" }).correct).toBe(true);
    expect(gradeExercise(translation, { kind: "translation", text: "私は先生です。" }).correct).toBe(false);
  });

  it("memberi skor sebagian untuk mencocokkan", () => {
    const partial = gradeExercise(matching, {
      kind: "matching",
      matches: { p1: "p1", p2: "p3", p3: "p3" },
    });
    expect(partial.correct).toBe(false);
    expect(partial.score).toBeCloseTo(2 / 3);
    const all = gradeExercise(matching, {
      kind: "matching",
      matches: { p1: "p1", p2: "p2", p3: "p3" },
    });
    expect(all.correct).toBe(true);
    expect(all.score).toBe(1);
  });

  it("menilai urutan kalimat dan benar/salah", () => {
    expect(gradeExercise(ordering, { kind: "ordering", order: [1, 2, 0, 3] }).correct).toBe(true);
    expect(gradeExercise(ordering, { kind: "ordering", order: [0, 1, 2, 3] }).correct).toBe(false);
    expect(gradeExercise(tf, { kind: "true-false", value: false }).correct).toBe(true);
    expect(gradeExercise(tf, { kind: "true-false", value: true }).feedback).toContain("先生");
  });

  it("menolak respons yang jenisnya tidak cocok", () => {
    const wrongKind = gradeExercise(mc, { kind: "typing", text: "siswa" });
    expect(wrongKind.correct).toBe(false);
    expect(wrongKind.feedback).toContain("tidak cocok");
  });
});

const answers: ExerciseAttemptAnswer[] = [
  { exerciseId: "a", kind: "multiple-choice", response: { kind: "multiple-choice", selectedIndex: 1 }, correct: true, score: 1, timeMs: 4000 },
  { exerciseId: "b", kind: "multiple-choice", response: { kind: "multiple-choice", selectedIndex: 0 }, correct: false, score: 0, timeMs: 6000 },
  { exerciseId: "c", kind: "matching", response: { kind: "matching", matches: {} }, correct: false, score: 0.5, timeMs: 8000 },
];

describe("ringkasan sesi", () => {
  it("menghitung benar, skor parsial, dan akurasi", () => {
    const summary = summarizeAnswers(answers);
    expect(summary.total).toBe(3);
    expect(summary.correct).toBe(1);
    expect(summary.score).toBe(50);
    expect(summary.accuracy).toBe(33);
  });

  it("membuat attempt dengan skor dan durasi yang dibulatkan", () => {
    const attempt = createQuizAttempt({
      id: "quiz-test",
      mode: "practice",
      title: "Latihan uji",
      level: "N5",
      startedAt: "2026-01-01T00:00:00.000Z",
      finishedAt: "2026-01-01T00:01:00.000Z",
      durationSec: 60.4,
      answers,
    });
    expect(attempt.total).toBe(3);
    expect(attempt.score).toBe(50);
    expect(attempt.durationSec).toBe(60);
    expect(attempt.id).toBe("quiz-test");
  });
});

describe("rng deterministik", () => {
  it("memberi urutan yang sama untuk seed yang sama", () => {
    const a = rngFromSeed("sesi-1");
    const b = rngFromSeed("sesi-1");
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(rngFromSeed("sesi-2")()).not.toBe(rngFromSeed("sesi-1")());
  });
});
