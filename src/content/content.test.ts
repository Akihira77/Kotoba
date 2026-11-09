import { describe, expect, it } from "vitest";
import { ALL_KANA, getKanaChart, HIRAGANA, KATAKANA } from "./kana";
import { VOCABULARY } from "./vocabulary";
import { KANJI } from "./kanji";
import { GRAMMAR } from "./grammar";
import { READING } from "./reading";
import { LISTENING } from "./listening";
import { CULTURE } from "./culture";
import { SENTENCES } from "./sentences";
import { stripFurigana } from "@/lib/furigana";
import { CULTURE_GROUP_BY_CATEGORY, CULTURE_GROUP_ORDER } from "@/lib/constants";
import { JLPT_LEVELS, type QuizQuestion } from "@/lib/types";

function validateQuestions(questions: QuizQuestion[], source: string) {
  for (const question of questions) {
    expect(question.prompt.length, source + " prompt").toBeGreaterThan(0);
    expect(question.options.length, source + " options").toBeGreaterThanOrEqual(2);
    expect(question.answerIndex, source + " answerIndex").toBeGreaterThanOrEqual(0);
    expect(question.answerIndex, source + " answerIndex").toBeLessThan(question.options.length);
    expect(question.explanation.length, source + " explanation").toBeGreaterThan(0);
    for (const option of question.options) expect(option.length, source + " option").toBeGreaterThan(0);
  }
}

describe("kana dataset", () => {
  it("contains all basic, dakuten, handakuten, and yoon entries", () => {
    expect(HIRAGANA).toHaveLength(104);
    expect(KATAKANA).toHaveLength(104);
    expect(ALL_KANA).toHaveLength(208);
    expect(new Set(ALL_KANA.map((item) => item.id)).size).toBe(ALL_KANA.length);
  });

  it("provides romaji, mnemonics, and examples for basic kana", () => {
    const basics = ALL_KANA.filter((item) => item.group === "basic");
    expect(basics).toHaveLength(92);
    for (const kana of basics) {
      expect(kana.char.length, kana.id).toBeGreaterThan(0);
      expect(kana.romaji.length, kana.id).toBeGreaterThan(0);
      expect(kana.mnemonic?.length ?? 0, kana.id).toBeGreaterThan(10);
      // ヲ is an obsolete kana with no modern example word; all other basic kana carry one.
      if (kana.char !== "ヲ") expect(kana.examples.length, kana.id).toBeGreaterThanOrEqual(1);
      for (const example of kana.examples) {
        expect(example.word.length, kana.id).toBeGreaterThan(0);
        expect(example.meaning.length, kana.id).toBeGreaterThan(0);
      }
    }
  });

  it("builds charts with expected row and column counts", () => {
    const basic = getKanaChart("hiragana", "basic");
    expect(basic.length).toBeGreaterThanOrEqual(10);
    expect(basic[0].cells).toHaveLength(5);
    const yoon = getKanaChart("katakana", "yoon");
    expect(yoon.length).toBeGreaterThanOrEqual(8);
    expect(yoon[0].cells).toHaveLength(3);
  });
});

describe("vocabulary dataset", () => {
  it("has at least 200 unique entries across all levels", () => {
    expect(VOCABULARY.length).toBeGreaterThanOrEqual(200);
    expect(new Set(VOCABULARY.map((word) => word.id)).size).toBe(VOCABULARY.length);
    const levels = new Set(VOCABULARY.map((word) => word.level));
    for (const level of JLPT_LEVELS) expect(levels.has(level), level).toBe(true);
  });

  it("has Japanese writing, reading, romaji, meaning, and examples", () => {
    for (const word of VOCABULARY) {
      expect(word.japanese.length, word.id).toBeGreaterThan(0);
      expect(word.kana.length, word.id).toBeGreaterThan(0);
      expect(word.romaji.length, word.id).toBeGreaterThan(0);
      expect(word.meaning.length, word.id).toBeGreaterThan(0);
      expect(word.examples.length, word.id).toBeGreaterThanOrEqual(1);
      for (const example of word.examples) {
        expect(example.jp.length, word.id).toBeGreaterThan(0);
        expect(example.reading?.length ?? 0, word.id).toBeGreaterThan(0);
        expect(example.id.length, word.id).toBeGreaterThan(0);
      }
    }
  });
});

describe("kanji dataset", () => {
  it("has at least 100 unique characters with readings and words", () => {
    expect(KANJI.length).toBeGreaterThanOrEqual(100);
    expect(new Set(KANJI.map((item) => item.char)).size).toBe(KANJI.length);
    for (const kanji of KANJI) {
      expect(kanji.char.length, kanji.char).toBe(1);
      expect(kanji.strokes, kanji.char).toBeGreaterThan(0);
      expect(kanji.radical.length, kanji.char).toBeGreaterThan(0);
      expect(kanji.meanings.length, kanji.char).toBeGreaterThan(0);
      expect(kanji.on.length + kanji.kun.length, kanji.char).toBeGreaterThan(0);
      expect(kanji.examples.length, kanji.char).toBeGreaterThanOrEqual(1);
      for (const example of kanji.examples) {
        expect(example.word.length, kanji.char).toBeGreaterThan(0);
        expect(example.meaning.length, kanji.char).toBeGreaterThan(0);
      }
    }
  });
});

describe("grammar dataset", () => {
  it("has 45 unique points with complete explanations and practice", () => {
    expect(GRAMMAR).toHaveLength(45);
    expect(new Set(GRAMMAR.map((point) => point.id)).size).toBe(GRAMMAR.length);
    for (const point of GRAMMAR) {
      expect(point.pattern.length, point.id).toBeGreaterThan(0);
      expect(point.meaning.length, point.id).toBeGreaterThan(0);
      expect(point.formation.length, point.id).toBeGreaterThan(0);
      expect(point.explanation.length, point.id).toBeGreaterThanOrEqual(1);
      expect(point.examples.length, point.id).toBeGreaterThanOrEqual(1);
      expect(point.practice.length, point.id).toBeGreaterThanOrEqual(1);
      validateQuestions(point.practice, point.id);
      for (const example of point.examples) {
        expect(example.jp.length, point.id).toBeGreaterThan(0);
        expect(example.reading.length, point.id).toBeGreaterThan(0);
        expect(example.id.length, point.id).toBeGreaterThan(0);
      }
    }
  });
});

describe("reading, listening, culture, and sentence datasets", () => {
  it("contains the planned number of passages and items", () => {
    expect(READING).toHaveLength(12);
    expect(LISTENING).toHaveLength(12);
    expect(LISTENING.some((item) => item.level === "N1")).toBe(true);
    expect(CULTURE).toHaveLength(33);
    expect(SENTENCES).toHaveLength(28);
  });

  it("reading passages have furigana-safe text, translation, vocab, and questions", () => {
    for (const passage of READING) {
      expect(passage.title.length, passage.id).toBeGreaterThan(0);
      expect(passage.translation.length, passage.id).toBeGreaterThan(0);
      expect(passage.vocab.length, passage.id).toBeGreaterThanOrEqual(4);
      expect(passage.questions.length, passage.id).toBeGreaterThanOrEqual(1);
      validateQuestions(passage.questions, passage.id);
      const plain = stripFurigana(passage.text);
      expect(plain.length, passage.id).toBeGreaterThan(40);
      expect(plain.includes("{"), passage.id).toBe(false);
      for (const word of passage.vocab) {
        expect(word.jp.length, passage.id).toBeGreaterThan(0);
        expect(word.meaning.length, passage.id).toBeGreaterThan(0);
      }
    }
  });

  it("listening items have dialogue readings, speakers, and questions", () => {
    for (const item of LISTENING) {
      expect(item.lines.length, item.id).toBeGreaterThanOrEqual(4);
      expect(item.keyPhrases.length, item.id).toBeGreaterThanOrEqual(3);
      expect(item.questions.length, item.id).toBeGreaterThanOrEqual(1);
      validateQuestions(item.questions, item.id);
      for (const line of item.lines) {
        expect(line.jp.length, item.id).toBeGreaterThan(0);
        expect(line.reading.length, item.id).toBeGreaterThan(0);
        expect(["A", "B", "Narasi"]).toContain(line.speaker);
      }
    }
  });

  it("culture articles cover every category, group, source, and mini quiz", () => {
    expect(new Set(CULTURE.map((article) => article.id)).size).toBe(CULTURE.length);
    const categories = ["tradisi", "makanan", "geografi", "etiket", "kehidupan", "sejarah", "anime", "bahasa"];
    for (const category of categories) {
      expect(CULTURE.filter((article) => article.category === category).length, category).toBeGreaterThanOrEqual(2);
    }
    for (const group of CULTURE_GROUP_ORDER) {
      expect(CULTURE.filter((article) => CULTURE_GROUP_BY_CATEGORY[article.category] === group).length, group).toBeGreaterThanOrEqual(2);
    }
    for (const article of CULTURE) {
      expect(article.body.length, article.id).toBeGreaterThanOrEqual(3);
      expect(article.facts.length, article.id).toBeGreaterThanOrEqual(3);
      expect(article.vocab.length, article.id).toBeGreaterThanOrEqual(3);
      expect(article.topics.length, article.id).toBeGreaterThanOrEqual(1);
      expect(article.minutes, article.id).toBeGreaterThanOrEqual(3);
      expect(article.sources.length, article.id).toBeGreaterThanOrEqual(2);
      expect(article.quiz.length, article.id).toBeGreaterThanOrEqual(2);
      expect(new Set(article.quiz.map((question) => question.id)).size, article.id).toBe(article.quiz.length);
      expect(article.sourceNote?.length ?? 0, article.id).toBeGreaterThan(10);
      for (const source of article.sources) {
        expect(source.label.length, article.id).toBeGreaterThan(0);
        expect(source.url.startsWith("https://"), article.id).toBe(true);
      }
      for (const question of article.quiz) {
        expect(question.options.length, article.id).toBe(4);
        expect(new Set(question.options).size, article.id).toBe(4);
        expect(question.answerIndex, article.id).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex, article.id).toBeLessThan(question.options.length);
        expect(question.explanation.length, article.id).toBeGreaterThan(0);
      }
      for (const expression of article.expressions ?? []) {
        expect(["standar", "formal", "kasual", "slang", "arkais", "anime"]).toContain(expression.register);
        expect(expression.usage.length, article.id).toBeGreaterThan(0);
      }
    }
  });

  it("sentence items shuffle tokens without changing the answer set", () => {
    for (const item of SENTENCES) {
      expect(item.tokens.length, item.id).toBeGreaterThanOrEqual(4);
      expect(item.answer.length, item.id).toBeGreaterThanOrEqual(4);
      expect([...item.tokens].sort()).toEqual([...item.answer].sort());
      expect(item.translation.length, item.id).toBeGreaterThan(0);
      expect(item.explanation.length, item.id).toBeGreaterThan(0);
    }
  });
});