import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryTheater } from "@/components/story/story-theater";
import { PageHeader } from "@/components/ui";
import { STORIES, STORY_BY_ID } from "@/content/stories";

interface StoryPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return STORIES.map((story) => ({ id: story.id }));
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const story = STORY_BY_ID.get(decoded);
  if (!story) return { title: "Cerita tidak ditemukan · Kotoba" };
  return {
    title: story.title + " · Kotoba",
    description: story.summary,
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params;
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    decoded = id;
  }
  const story = STORY_BY_ID.get(decoded);
  if (!story) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Link href="/stories" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-brand">
        <span aria-hidden="true">←</span> Semua cerita
      </Link>
      <PageHeader
        eyebrow="TEATER CERITA · 物語"
        title={story.title}
        titleJp={story.titleJp}
        description={story.summary}
        icon="story"
      />
      <StoryTheater story={story} />
    </div>
  );
}
