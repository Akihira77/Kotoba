import type { Metadata } from "next";
import { WritingHub } from "@/components/writing/writing-hub";
import {
  WRITING_INDEX,
  WRITING_KANA_TOTAL,
  WRITING_KANJI_TOTAL,
  WRITING_STAGE_DESCRIPTIONS,
  WRITING_STAGE_LABELS,
  WRITING_STAGE_ORDER,
  WRITING_TOTAL,
} from "@/lib/writing";

export const metadata: Metadata = {
  title: "Studio menulis Jepang",
  description:
    "Latih urutan goresan hiragana, katakana, dan kanji dengan animasi, tracing, dan latihan mandiri. Data goresan KanjiVG, penilaian berupa perkiraan geometri.",
};

export default function WritingPage() {
  const stages = WRITING_STAGE_ORDER.map((stage) => ({
    stage,
    label: WRITING_STAGE_LABELS[stage],
    description: WRITING_STAGE_DESCRIPTIONS[stage],
    count: WRITING_INDEX.filter((entry) => entry.stage === stage).length,
  }));

  return (
    <WritingHub
      entries={WRITING_INDEX}
      stages={stages}
      total={WRITING_TOTAL}
      kanaTotal={WRITING_KANA_TOTAL}
      kanjiTotal={WRITING_KANJI_TOTAL}
    />
  );
}
