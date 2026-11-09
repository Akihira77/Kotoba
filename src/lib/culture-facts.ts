import { CULTURE } from "@/content/culture";
import { CULTURE_GROUP_BY_CATEGORY } from "@/lib/constants";
import type { CultureCategory, CultureGroup } from "@/lib/types";

export interface CultureFact {
  id: string;
  articleId: string;
  articleTitle: string;
  category: CultureCategory;
  group: CultureGroup;
  label: string;
  value: string;
}

export const CULTURE_FACTS: CultureFact[] = CULTURE.flatMap((article) =>
  article.facts.map((fact, index) => ({
    id: `${article.id}-fact-${index + 1}`,
    articleId: article.id,
    articleTitle: article.title,
    category: article.category,
    group: CULTURE_GROUP_BY_CATEGORY[article.category],
    label: fact.label,
    value: fact.value,
  })),
);

/** FNV-1a: stable across server and browser so daily facts stay reproducible. */
function hashKey(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function factForKey(key: string): CultureFact {
  return CULTURE_FACTS[hashKey(key) % CULTURE_FACTS.length];
}

/** Local calendar date, not UTC, so the fact changes at the learner's midnight. */
export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function factOfDay(date: Date): CultureFact {
  return factForKey(`daily:${localDateKey(date)}`);
}
