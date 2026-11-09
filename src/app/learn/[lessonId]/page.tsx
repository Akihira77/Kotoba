import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLesson, getModule } from "@/content/curriculum";
import { LESSON_PLANS, getLessonPlan } from "@/content/lessons";
import { LessonPlayer } from "@/components/lesson-player";
import { LESSON_PROGRESS_LABELS, lessonProgressId, lessonProgressKind } from "@/lib/learning";
import { XP_RULES } from "@/lib/constants";

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export function generateStaticParams() {
  return LESSON_PLANS.map((plan) => ({ lessonId: plan.id }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const plan = getLessonPlan(lessonId);
  if (!plan) return { title: "Pelajaran tidak ditemukan · Kotoba" };
  return {
    title: plan.title + " · Kotoba",
    description: plan.summary,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const plan = getLessonPlan(lessonId);
  const lesson = getLesson(lessonId);
  const courseModule = lesson ? getModule(lesson.moduleId) : undefined;

  if (!plan || !lesson || !courseModule) notFound();

  const progressId = lessonProgressId(lesson);
  const progressKind = lessonProgressKind(lesson);
  const xp = XP_RULES.lesson[progressKind] ?? 0;

  const moduleLessons = courseModule.lessons;
  const currentIndex = moduleLessons.findIndex((item) => item.id === lesson.id);
  const next = currentIndex >= 0 ? moduleLessons[currentIndex + 1] : undefined;
  const nextLesson = next
    ? { id: next.id, title: next.title, titleJp: next.titleJp, href: next.href }
    : null;

  return (
    <LessonPlayer
      plan={plan}
      lesson={lesson}
      moduleTitle={courseModule.title}
      moduleTitleJp={courseModule.titleJp}
      progressId={progressId}
      progressKind={progressKind}
      kindLabel={LESSON_PROGRESS_LABELS[progressKind]}
      xp={xp}
      nextLesson={nextLesson}
    />
  );
}
