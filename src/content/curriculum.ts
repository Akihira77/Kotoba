import type {
  ContentKind,
  ContentRef,
  Course,
  CourseModule,
  CultureCategory,
  JLPTLevel,
  KanaGroup,
  KanaScript,
  Lesson,
  VocabTopic,
} from "@/lib/types";
import { JLPT_LEVELS } from "@/lib/types";
import { CULTURE_CATEGORY_LABELS, TOPIC_LABELS } from "@/lib/constants";
import {
  HIRAGANA,
  KATAKANA,
  KANA_GROUP_LABELS,
  KANA_SCRIPT_LABELS,
} from "./kana";
import { VOCABULARY } from "./vocabulary";
import { KANJI } from "./kanji";
import { GRAMMAR } from "./grammar";
import { READING } from "./reading";
import { LISTENING } from "./listening";
import { CULTURE } from "./culture";
import { SENTENCES } from "./sentences";
import { SENTENCE_PLANS } from "./lessons/sentence";
import { hasLessonPlan } from "./lessons";

/**
 * Katalog kurikulum yang diturunkan dari konten nyata.
 *
 * Modul dan lesson tidak menyimpan materi; mereka hanya menyimpan ContentRef.
 * Menambah kosakata, kanji, tata bahasa, bacaan, atau budaya otomatis
 * memperluas katalog ini tanpa mengubah halaman atau engine.
 */

export const COURSE_ID = "course-kotoba";

const KANA_GROUP_ORDER: KanaGroup[] = ["basic", "dakuten", "handakuten", "yoon"];

const CULTURE_CATEGORY_ORDER: CultureCategory[] = [
  "tradisi",
  "makanan",
  "geografi",
  "etiket",
  "kehidupan",
  "sejarah",
  "anime",
  "bahasa",
];

function ref(kind: ContentKind, id: string, href: string): ContentRef {
  return { kind, id, href };
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

function buildKanaModule(script: KanaScript): CourseModule {
  const moduleId = "mod-kana-" + script;
  const items = script === "hiragana" ? HIRAGANA : KATAKANA;
  const scriptJp = script === "hiragana" ? "ひらがな" : "カタカナ";

  const lessons: Lesson[] = KANA_GROUP_ORDER.map((group, index) => {
    const chars = items.filter((item) => item.group === group);
    return {
      id: "les-kana-" + script + "-" + group,
      moduleId,
      order: index + 1,
      title: KANA_SCRIPT_LABELS[script] + " · " + KANA_GROUP_LABELS[group],
      titleJp: scriptJp,
      description:
        chars.length +
        " karakter " +
        KANA_SCRIPT_LABELS[script] +
        " kelompok " +
        KANA_GROUP_LABELS[group] +
        ".",
      kind: "kana",
      level: "N5",
      estimateMinutes: group === "basic" ? 20 : 10,
      objectives: [
        "Mengenali bentuk dan bunyi " + chars.length + " karakter.",
        "Membaca karakter dengan urutan gojūon yang benar.",
        "Menulis karakter dari ingatan setelah latihan.",
      ],
      contentRefs: chars.map((item) => ref("kana", item.id, "/kana")),
      href: "/kana",
    };
  });

  return {
    id: moduleId,
    courseId: COURSE_ID,
    order: 0,
    title: KANA_SCRIPT_LABELS[script],
    titleJp: scriptJp,
    description:
      "Dasar membaca dan menulis " +
      KANA_SCRIPT_LABELS[script] +
      ", termasuk dakuten, handakuten, dan yōon.",
    kind: "kana",
    level: "N5",
    lessons,
  };
}

function buildVocabModule(level: JLPTLevel): CourseModule {
  const moduleId = "mod-vocab-" + level;
  const words = VOCABULARY.filter((word) => word.level === level);
  const topics: VocabTopic[] = [];

  for (const word of words) {
    if (!topics.includes(word.topic)) {
      topics.push(word.topic);
    }
  }

  const lessons: Lesson[] = topics.map((topic, index) => {
    const items = words.filter((word) => word.topic === topic);
    const href = "/vocabulary?level=" + level;
    return {
      id: "les-vocab-" + level + "-" + topic,
      moduleId,
      order: index + 1,
      title: "Kosakata " + level + " · " + TOPIC_LABELS[topic],
      description: items.length + " kosakata tema " + TOPIC_LABELS[topic] + " untuk level " + level + ".",
      kind: "vocabulary",
      level,
      estimateMinutes: 10,
      objectives: [
        "Menguasai " + items.length + " kosakata tema " + TOPIC_LABELS[topic] + ".",
        "Membaca kana dan memahami contoh kalimat.",
        "Memakai kosakata dalam kalimat sederhana.",
      ],
      contentRefs: items.map((word) => ref("vocabulary", word.id, href)),
      href,
    };
  });

  return {
    id: moduleId,
    courseId: COURSE_ID,
    order: 0,
    title: "Kosakata " + level,
    titleJp: level + " 語彙",
    description: "Kosakata " + level + " yang dikelompokkan menurut tema sehari-hari.",
    kind: "vocabulary",
    level,
    lessons,
  };
}

function buildKanjiModule(level: JLPTLevel): CourseModule {
  const moduleId = "mod-kanji-" + level;
  const items = KANJI.filter((item) => item.level === level);
  const sets = chunk(items, 12);

  const lessons: Lesson[] = sets.map((set, index) => ({
    id: "les-kanji-" + level + "-" + (index + 1),
    moduleId,
    order: index + 1,
    title: "Kanji " + level + " · Set " + (index + 1),
    titleJp: level + " 漢字",
    description: set.length + " kanji dengan bacaan, radikal, dan contoh kata.",
    kind: "kanji",
    level,
    estimateMinutes: 15,
    objectives: [
      "Mengenali " + set.length + " kanji dan arti utamanya.",
      "Membaca on'yomi dan kun'yomi yang paling sering dipakai.",
      "Membaca contoh kata yang memakai kanji tersebut.",
    ],
    contentRefs: set.map((item) => ref("kanji", item.id, "/kanji")),
    href: "/kanji",
  }));

  return {
    id: moduleId,
    courseId: COURSE_ID,
    order: 0,
    title: "Kanji " + level,
    titleJp: level + " 漢字",
    description: "Kanji " + level + " disusun dalam set kecil agar mudah diulang.",
    kind: "kanji",
    level,
    lessons,
  };
}

function buildGrammarModule(level: JLPTLevel): CourseModule {
  const moduleId = "mod-grammar-" + level;
  const points = GRAMMAR.filter((point) => point.level === level);

  const lessons: Lesson[] = points.map((point, index) => ({
    id: "les-grammar-" + point.id,
    moduleId,
    order: index + 1,
    title: "Pola " + point.pattern,
    titleJp: point.pattern,
    description: point.meaning,
    kind: "grammar",
    level,
    estimateMinutes: 10,
    objectives: [
      "Memahami fungsi pola " + point.pattern + ".",
      "Menyusun kalimat dengan formasi yang benar.",
      "Menghindari kesalahan umum yang dijelaskan pada materi.",
    ],
    contentRefs: [ref("grammar", point.id, "/grammar/" + point.id)],
    href: "/grammar/" + point.id,
  }));

  return {
    id: moduleId,
    courseId: COURSE_ID,
    order: 0,
    title: "Tata bahasa " + level,
    titleJp: level + " 文法",
    description: "Pola tata bahasa " + level + " dengan penjelasan dan latihan.",
    kind: "grammar",
    level,
    lessons,
  };
}

function buildReadingModule(level: JLPTLevel): CourseModule {
  const moduleId = "mod-reading-" + level;
  const passages = READING.filter((passage) => passage.level === level);

  const lessons: Lesson[] = passages.map((passage, index) => ({
    id: "les-reading-" + passage.id,
    moduleId,
    order: index + 1,
    title: passage.title,
    titleJp: passage.titleJp,
    description: passage.summary,
    kind: "reading",
    level,
    estimateMinutes: passage.minutes,
    objectives: [
      "Memahami ide utama bacaan " + passage.title + ".",
      "Menemukan informasi rinci dan kosakata kunci.",
      "Menjawab pertanyaan pemahaman tanpa terjemahan.",
    ],
    contentRefs: [ref("reading", passage.id, "/reading/" + passage.id)],
    href: "/reading/" + passage.id,
  }));

  return {
    id: moduleId,
    courseId: COURSE_ID,
    order: 0,
    title: "Bacaan " + level,
    titleJp: level + " 読解",
    description: "Teks bacaan " + level + " dengan furigana, kosakata, dan pertanyaan.",
    kind: "reading",
    level,
    lessons,
  };
}

function buildListeningModule(level: JLPTLevel): CourseModule {
  const moduleId = "mod-listening-" + level;
  const items = LISTENING.filter((item) => item.level === level);

  const lessons: Lesson[] = items.map((item, index) => ({
    id: "les-listening-" + item.id,
    moduleId,
    order: index + 1,
    title: item.title,
    titleJp: item.titleId,
    description: item.scenario,
    kind: "listening",
    level,
    estimateMinutes: 8,
    objectives: [
      "Menangkap topik dan situasi dialog.",
      "Mengenali frasa kunci yang diucapkan.",
      "Menjawab pertanyaan berdasarkan audio.",
    ],
    contentRefs: [ref("listening", item.id, "/listening/" + item.id)],
    href: "/listening/" + item.id,
  }));

  return {
    id: moduleId,
    courseId: COURSE_ID,
    order: 0,
    title: "Menyimak " + level,
    titleJp: level + " 聴解",
    description: "Dialog " + level + " dengan transkrip, frasa kunci, dan pertanyaan.",
    kind: "listening",
    level,
    lessons,
  };
}

function buildSentenceModule(level: JLPTLevel): CourseModule {
  const moduleId = "mod-sentence-" + level;
  const items = SENTENCES.filter((item) => item.level === level);

  // N5 dipecah menjadi delapan pelajaran interaktif. Setiap pelajaran memiliki
  // tepat satu ContentRef agar katalog tetap terhubung ke latihan aslinya.
  const plans = level === "N5" ? SENTENCE_PLANS : [];
  const lessons: Lesson[] =
    plans.length > 0
      ? plans.map((plan, index) => {
          const item = items.find((entry) => entry.id === plan.sourceId);
          return {
            id: plan.id,
            moduleId,
            order: index + 1,
            title: plan.title,
            titleJp: plan.titleJp,
            description: plan.summary,
            kind: "sentence",
            level,
            estimateMinutes: plan.estimateMinutes,
            objectives: plan.goals,
            contentRefs: item ? [ref("sentence", item.id, "/learn/" + plan.id)] : [],
            href: "/learn/" + plan.id,
          };
        })
      : [
          {
            id: "les-sentence-" + level,
            moduleId,
            order: 1,
            title: "Susun kalimat " + level,
            titleJp: level + " 文の組み立て",
            description: items.length + " latihan menyusun kalimat level " + level + ".",
            kind: "sentence",
            level,
            estimateMinutes: 8,
            objectives: [
              "Menyusun " + items.length + " kalimat sesuai urutan yang benar.",
              "Memahami posisi partikel dan predikat.",
              "Menggunakan penjelasan sebagai umpan balik belajar.",
            ],
            contentRefs: items.map((item) => ref("sentence", item.id, "/practice")),
            href: "/practice",
          },
        ];

  return {
    id: moduleId,
    courseId: COURSE_ID,
    order: 0,
    title: "Susun kalimat " + level,
    titleJp: level + " 文の組み立て",
    description: "Latihan urutan kata level " + level + ".",
    kind: "sentence",
    level,
    lessons,
  };
}

function buildCultureModule(category: CultureCategory): CourseModule {
  const moduleId = "mod-culture-" + category;
  const articles = CULTURE.filter((article) => article.category === category);

  const lessons: Lesson[] = articles.map((article, index) => ({
    id: "les-culture-" + article.id,
    moduleId,
    order: index + 1,
    title: article.title,
    titleJp: article.titleJp,
    description: article.summary,
    kind: "culture",
    level: "semua",
    estimateMinutes: article.minutes,
    objectives: [
      "Memahami konteks budaya pada artikel " + article.title + ".",
      "Mengenali kosakata dan ungkapan yang relevan.",
      "Membedakan register bahasa bila artikel menyediakannya.",
    ],
    contentRefs: [ref("culture", article.id, "/culture/" + article.id)],
    href: "/culture/" + article.id,
  }));

  return {
    id: moduleId,
    courseId: COURSE_ID,
    order: 0,
    title: "Budaya · " + CULTURE_CATEGORY_LABELS[category],
    titleJp: "文化",
    description: "Artikel budaya kategori " + CULTURE_CATEGORY_LABELS[category] + ".",
    kind: "culture",
    level: "semua",
    lessons,
  };
}

const modules: CourseModule[] = [
  buildKanaModule("hiragana"),
  buildKanaModule("katakana"),
  ...JLPT_LEVELS.map(buildVocabModule),
  ...JLPT_LEVELS.map(buildKanjiModule),
  ...JLPT_LEVELS.map(buildGrammarModule),
  ...JLPT_LEVELS.map(buildReadingModule),
  ...JLPT_LEVELS.map(buildListeningModule),
  ...JLPT_LEVELS.map(buildSentenceModule),
  ...CULTURE_CATEGORY_ORDER.map(buildCultureModule),
].map((module, index) => {
  const ordered = { ...module, order: index + 1 };
  return {
    ...ordered,
    lessons: ordered.lessons.map((lesson) =>
      hasLessonPlan(lesson.id) ? { ...lesson, href: "/learn/" + lesson.id, interactive: true } : lesson,
    ),
  };
});

export const CURRICULUM: Course = {
  id: COURSE_ID,
  title: "Kotoba: Bahasa Jepang N5–N1",
  titleJp: "言葉",
  description:
    "Kurikulum terpadu yang menghubungkan kana, kosakata, kanji, tata bahasa, bacaan, menyimak, budaya, dan latihan menyusun kalimat.",
  levels: JLPT_LEVELS,
  modules,
};

export const CURRICULUM_MODULES = modules;
export const CURRICULUM_LESSONS: Lesson[] = modules.flatMap((module) => module.lessons);
export const LESSON_BY_ID = new Map(CURRICULUM_LESSONS.map((lesson) => [lesson.id, lesson]));
export const MODULE_BY_ID = new Map(modules.map((module) => [module.id, module]));

export const CURRICULUM_STATS = {
  modules: modules.length,
  lessons: CURRICULUM_LESSONS.length,
  contentRefs: CURRICULUM_LESSONS.reduce((total, lesson) => total + lesson.contentRefs.length, 0),
};

export function getLesson(id: string): Lesson | undefined {
  return LESSON_BY_ID.get(id);
}

export function getModule(id: string): CourseModule | undefined {
  return MODULE_BY_ID.get(id);
}

export function getLessonsByLevel(level: JLPTLevel): Lesson[] {
  return CURRICULUM_LESSONS.filter((lesson) => lesson.level === level);
}
