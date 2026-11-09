import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WritingStudio } from "@/components/writing/writing-studio";
import { PageHeader } from "@/components/ui";
import { WRITING_BY_ID } from "@/lib/writing";

type WritingPageProps = {
  params: Promise<{ id: string }>;
};

function decodeId(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: WritingPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = WRITING_BY_ID.get(decodeId(id));
  if (!item) return { title: "Karakter tidak ditemukan" };
  return {
    title: "Menulis " + item.char,
    description:
      "Latihan menulis " +
      item.char +
      " (" +
      item.reading +
      "): " +
      item.strokeCount +
      " goresan, animasi urutan, tracing, dan latihan mandiri.",
  };
}

export default async function WritingDetailPage({ params }: WritingPageProps) {
  const { id } = await params;
  const item = WRITING_BY_ID.get(decodeId(id));
  if (!item) notFound();

  const meaning = item.meanings[0];
  const summary =
    item.script === "kanji"
      ? [
          "Kanji " + item.strokeCount + " goresan",
          item.radical ? "radikal " + item.radical : null,
          meaning ?? null,
        ]
          .filter(Boolean)
          .join(" · ")
      : [
          item.script === "hiragana" ? "Hiragana" : "Katakana",
          item.romaji,
          item.strokeCount + " goresan",
          meaning ?? null,
        ]
          .filter(Boolean)
          .join(" · ");

  return (
    <div className="space-y-5">
      <Link
        href="/writing"
        className="inline-flex min-h-6 items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
      >
        <span aria-hidden="true">←</span> Semua karakter menulis
      </Link>
      <PageHeader
        eyebrow="STUDIO MENULIS · 書字"
        title={"Latihan menulis " + item.char}
        titleJp={item.script === "kanji" ? item.reading : item.romaji}
        description={summary + ". Amati urutan goresan, tirukan, lalu tulis mandiri."}
      />
      <WritingStudio item={item} />
    </div>
  );
}
