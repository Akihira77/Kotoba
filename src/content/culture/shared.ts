import type {
  CultureArticle,
  CultureCategory,
  CultureExpression,
  CultureGroup,
  CultureQuizQuestion,
  CultureSource,
  CultureTerm,
  Register,
} from "@/lib/types";
import { CULTURE_GROUP_BY_CATEGORY } from "@/lib/constants";

type VocabRow = [jp: string, reading: string, romaji: string, meaning: string];
type ExpressionRow = [
  jp: string,
  reading: string,
  romaji: string,
  meaning: string,
  register: Register,
  usage: string,
  note?: string,
];
type FactRow = [label: string, value: string];

/**
 * Sumber rujukan tingkat organisasi. Tautan ini adalah bacaan lanjutan untuk
 * memverifikasi topik, bukan kutipan langsung; artikel Kotoba tetap ditulis
 * ulang secara orisinal.
 */
export const CULTURE_SOURCES = {
  jnto: {
    label: "Japan National Tourism Organization (JNTO)",
    url: "https://www.japan.travel/en/",
  },
  bunka: {
    label: "Agency for Cultural Affairs, Japan",
    url: "https://www.bunka.go.jp/english/",
  },
  unesco: {
    label: "UNESCO Intangible Cultural Heritage",
    url: "https://ich.unesco.org/en/home",
  },
  maff: {
    label: "Ministry of Agriculture, Forestry and Fisheries (MAFF), Japan",
    url: "https://www.maff.go.jp/e/",
  },
  gsi: {
    label: "Geospatial Information Authority of Japan (GSI)",
    url: "https://www.gsi.go.jp/ENGLISH/",
  },
  jma: {
    label: "Japan Meteorological Agency (JMA)",
    url: "https://www.jma.go.jp/jma/indexe.html",
  },
  rekihaku: {
    label: "National Museum of Japanese History",
    url: "https://www.rekihaku.ac.jp/english/",
  },
  britannica: {
    label: "Encyclopaedia Britannica — Japan",
    url: "https://www.britannica.com/place/Japan",
  },
  britannicaLanguage: {
    label: "Encyclopaedia Britannica — Japanese language",
    url: "https://www.britannica.com/topic/Japanese-language",
  },
  aja: {
    label: "Association of Japanese Animations (AJA)",
    url: "https://aja.gr.jp/english",
  },
  jpf: {
    label: "The Japan Foundation",
    url: "https://www.jpf.go.jp/e/",
  },
} as const;

export type CultureSourceKey = keyof typeof CULTURE_SOURCES;

export const ORIGINAL_NOTE =
  "Ringkasan edukatif orisinal untuk pembelajaran Kotoba. Teks bukan terjemahan atau salinan sumber mana pun; rujukan di bawah disediakan sebagai bacaan lanjutan.";

const DEFAULT_SOURCE_KEYS: Record<CultureGroup, CultureSourceKey[]> = {
  budaya: ["bunka", "jnto", "unesco"],
  makanan: ["maff", "unesco", "jnto"],
  geografi: ["gsi", "jnto", "jma"],
  sejarah: ["rekihaku", "britannica", "unesco"],
  anime: ["aja", "bunka", "jpf"],
  bahasa: ["britannicaLanguage", "bunka", "jpf"],
};

const CATEGORY_TOPICS: Record<CultureCategory, string> = {
  tradisi: "Tradisi",
  makanan: "Kuliner",
  geografi: "Geografi",
  etiket: "Etiket",
  kehidupan: "Kehidupan sehari-hari",
  sejarah: "Sejarah",
  anime: "Anime",
  bahasa: "Fakta bahasa",
};

export interface CultureArticleMeta {
  topics?: string[];
  minutes?: number;
  sourceKeys?: CultureSourceKey[];
  quiz?: CultureQuizQuestion[];
}

function terms(rows: VocabRow[]): CultureTerm[] {
  return rows.map(([jp, reading, romaji, meaning]) => ({ jp, reading, romaji, meaning }));
}

function expressions(rows: ExpressionRow[]): CultureExpression[] {
  return rows.map(([jp, reading, romaji, meaning, register, usage, note]) => ({
    jp,
    reading,
    romaji,
    meaning,
    register,
    usage,
    note,
  }));
}

function hash(text: string): number {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function rotate(options: string[], seed: string): string[] {
  if (options.length === 0) return options;
  const shift = hash(seed) % options.length;
  return [...options.slice(shift), ...options.slice(0, shift)];
}

/**
 * Kuis mini diambil dari kosakata artikel itu sendiri: arti dan bacaan.
 * Dengan begitu setiap artikel punya latihan yang akurat tanpa mengarang
 * pertanyaan pemahaman yang tidak didukung teks.
 */
export function buildCultureQuiz(articleId: string, vocab: CultureTerm[]): CultureQuizQuestion[] {
  const questions: CultureQuizQuestion[] = [];

  for (const index of [0, 1]) {
    const term = vocab[index];
    if (!term) continue;
    const others = vocab.filter((_, itemIndex) => itemIndex !== index);
    const isMeaning = index === 0;
    const correct = isMeaning ? term.meaning : term.reading;
    const distractors = unique(
      others.map((item) => (isMeaning ? item.meaning : item.reading)).filter((value) => value && value !== correct),
    ).slice(0, 3);
    if (distractors.length < 3) continue;

    const options = rotate([correct, ...distractors], `${articleId}-${isMeaning ? "meaning" : "reading"}`);
    const question: CultureQuizQuestion = {
      id: `${articleId}-quiz-${index + 1}`,
      prompt: isMeaning ? `Apa arti 「${term.jp}」?` : `Bagaimana bacaan 「${term.jp}」?`,
      options,
      answerIndex: options.indexOf(correct),
      explanation: `${term.jp} dibaca ${term.reading} dan berarti "${term.meaning}".`,
    };
    questions.push(question);
  }

  return questions;
}

function estimateMinutes(body: string[], vocabCount: number): number {
  const characters = body.join("").length + vocabCount * 12;
  return Math.max(3, Math.min(9, Math.ceil(characters / 420)));
}

function sourcesFor(category: CultureCategory, keys?: CultureSourceKey[]): CultureSource[] {
  const group = CULTURE_GROUP_BY_CATEGORY[category];
  return (keys ?? DEFAULT_SOURCE_KEYS[group]).map((key) => ({ ...CULTURE_SOURCES[key] }));
}

export function article(
  id: string,
  category: CultureCategory,
  title: string,
  titleJp: string,
  summary: string,
  body: string[],
  factRows: FactRow[],
  vocabRows: VocabRow[],
  expressionRows?: ExpressionRow[],
  meta: CultureArticleMeta = {},
): CultureArticle {
  const vocab = terms(vocabRows);
  const result: CultureArticle = {
    id,
    category,
    topics: meta.topics ?? [CATEGORY_TOPICS[category]],
    title,
    titleJp,
    summary,
    body,
    facts: factRows.map(([label, value]) => ({ label, value })),
    vocab,
    sourceNote: ORIGINAL_NOTE,
    sources: sourcesFor(category, meta.sourceKeys),
    quiz: meta.quiz ?? buildCultureQuiz(id, vocab),
    minutes: meta.minutes ?? estimateMinutes(body, vocab.length),
  };
  if (expressionRows) {
    result.expressions = expressions(expressionRows);
  }
  return result;
}
