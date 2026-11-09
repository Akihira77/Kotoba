import type { ContentKind, ContentRef, Course } from "@/lib/types";
import { CURRICULUM } from "@/content/curriculum";
import { ALL_KANA } from "@/content/kana";
import { KANJI_BY_ID } from "@/content/kanji";
import { VOCAB_BY_ID } from "@/content/vocabulary";
import { GRAMMAR_BY_ID } from "@/content/grammar";
import { READING_BY_ID } from "@/content/reading";
import { LISTENING_BY_ID } from "@/content/listening";
import { CULTURE_BY_ID } from "@/content/culture";
import { SENTENCES_BY_ID } from "@/content/sentences";

export interface ContentValidationIssue {
  path: string;
  message: string;
}

export function contentRefExists(ref: ContentRef): boolean {
  switch (ref.kind) {
    case "kana":
      return ALL_KANA.some((item) => item.id === ref.id);
    case "vocabulary":
      return VOCAB_BY_ID.has(ref.id);
    case "kanji":
      return KANJI_BY_ID.has(ref.id);
    case "grammar":
      return GRAMMAR_BY_ID.has(ref.id);
    case "reading":
      return READING_BY_ID.has(ref.id);
    case "listening":
      return LISTENING_BY_ID.has(ref.id);
    case "culture":
      return CULTURE_BY_ID.has(ref.id);
    case "sentence":
      return SENTENCES_BY_ID.has(ref.id);
    default:
      return false;
  }
}

function expectedRefKeys(): string[] {
  const keys: string[] = [];
  const add = (kind: ContentKind, ids: Iterable<string>) => {
    for (const id of ids) {
      keys.push(kind + ":" + id);
    }
  };

  add("kana", ALL_KANA.map((item) => item.id));
  add("vocabulary", VOCAB_BY_ID.keys());
  add("kanji", KANJI_BY_ID.keys());
  add("grammar", GRAMMAR_BY_ID.keys());
  add("reading", READING_BY_ID.keys());
  add("listening", LISTENING_BY_ID.keys());
  add("culture", CULTURE_BY_ID.keys());
  add("sentence", SENTENCES_BY_ID.keys());

  return keys;
}

/**
 * Memeriksa integritas katalog kurikulum dan seluruh referensi kontennya.
 * Fungsi ini murni dan dipakai oleh tes; tidak menyentuh database atau UI.
 */
export function validateCurriculum(course: Course = CURRICULUM): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const moduleIds = new Set<string>();
  const lessonIds = new Set<string>();
  const covered = new Set<string>();

  if (course.modules.length === 0) {
    issues.push({ path: "course.modules", message: "Kurikulum harus memiliki minimal satu modul." });
  }

  course.modules.forEach((module, moduleIndex) => {
    const modulePath = "modules[" + moduleIndex + "]";
    if (moduleIds.has(module.id)) {
      issues.push({ path: modulePath + ".id", message: "ID modul duplikat: " + module.id });
    }
    moduleIds.add(module.id);

    if (module.courseId !== course.id) {
      issues.push({ path: modulePath + ".courseId", message: "courseId modul tidak cocok dengan course." });
    }
    if (module.order < 1) {
      issues.push({ path: modulePath + ".order", message: "Urutan modul harus mulai dari 1." });
    }
    if (module.lessons.length === 0) {
      issues.push({ path: modulePath + ".lessons", message: "Modul harus memiliki minimal satu lesson." });
    }

    module.lessons.forEach((lesson, lessonIndex) => {
      const lessonPath = modulePath + ".lessons[" + lessonIndex + "]";
      if (lessonIds.has(lesson.id)) {
        issues.push({ path: lessonPath + ".id", message: "ID lesson duplikat: " + lesson.id });
      }
      lessonIds.add(lesson.id);

      if (lesson.moduleId !== module.id) {
        issues.push({ path: lessonPath + ".moduleId", message: "moduleId lesson tidak cocok dengan modul induk." });
      }
      if (lesson.order < 1) {
        issues.push({ path: lessonPath + ".order", message: "Urutan lesson harus mulai dari 1." });
      }
      if (lesson.estimateMinutes <= 0) {
        issues.push({ path: lessonPath + ".estimateMinutes", message: "Estimasi menit harus positif." });
      }
      if (lesson.objectives.length === 0) {
        issues.push({ path: lessonPath + ".objectives", message: "Lesson harus memiliki tujuan belajar." });
      }
      if (!lesson.href.startsWith("/")) {
        issues.push({ path: lessonPath + ".href", message: "Href lesson harus berupa path internal." });
      }
      if (lesson.contentRefs.length === 0) {
        issues.push({ path: lessonPath + ".contentRefs", message: "Lesson harus merujuk minimal satu konten." });
      }

      lesson.contentRefs.forEach((ref, refIndex) => {
        const refPath = lessonPath + ".contentRefs[" + refIndex + "]";
        if (!contentRefExists(ref)) {
          issues.push({
            path: refPath,
            message: "Referensi tidak ditemukan: " + ref.kind + ":" + ref.id,
          });
          return;
        }

        covered.add(ref.kind + ":" + ref.id);

        if (ref.href && !ref.href.startsWith("/")) {
          issues.push({ path: refPath + ".href", message: "Href referensi harus berupa path internal." });
        }
      });
    });
  });

  for (const key of expectedRefKeys()) {
    if (!covered.has(key)) {
      issues.push({ path: "coverage", message: "Konten belum tercakup kurikulum: " + key });
    }
  }

  return issues;
}

export function assertValidCurriculum(course: Course = CURRICULUM): void {
  const issues = validateCurriculum(course);
  if (issues.length > 0) {
    throw new Error(
      "Kurikulum tidak valid:\n" +
        issues.map((issue) => "- " + issue.path + ": " + issue.message).join("\n"),
    );
  }
}
