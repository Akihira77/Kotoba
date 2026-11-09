"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { JpText, SpeakButton } from "@/components/japanese";
import { ExerciseRunner } from "@/components/exercise-runner";
import { ListeningPlayer } from "@/components/listening-player";
import { useProgress } from "@/components/providers/progress-provider";
import { Badge, Button, Card, EmptyState, LinkButton, SectionHeading } from "@/components/ui";
import { LISTENING_BY_ID } from "@/content/listening";
import { XP_RULES } from "@/lib/constants";
import { exercisesFromQuizQuestions } from "@/lib/exercise-catalog";
import { cn } from "@/lib/utils";

const SPEAKER_LABELS: Record<string, string> = { A: "Pembicara A", B: "Pembicara B", Narasi: "Narasi" };

export default function ListeningDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const item = LISTENING_BY_ID.get(id);
  const { snapshot, recordLesson } = useProgress();
  const [showTranscript, setShowTranscript] = useState(false);

  if (!item) {
    return (
      <EmptyState
        icon="listening"
        title="Dialog tidak ditemukan"
        description="Dialog ini mungkin sudah dipindahkan. Kembali ke daftar untuk memilih dialog lain."
        action={<LinkButton href="/listening">Kembali ke daftar</LinkButton>}
      />
    );
  }

  const done = snapshot.lessons.some((lesson) => lesson.lessonId === item.id && lesson.kind === "listening");
  const exercises = exercisesFromQuizQuestions(item.questions, "Choukai");

  return (
    <div className="space-y-6">
      <div>
        <LinkButton href="/listening" variant="ghost" size="sm" className="-ml-2 mb-2">
          <Icon name="arrowLeft" size={15} /> Semua dialog
        </LinkButton>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{item.level}</Badge>
          {done && <Badge tone="matcha"><Icon name="check" size={11} /> Selesai</Badge>}
        </div>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{item.title}</h1>
        <JpText text={item.titleId} className="mt-1 text-lg text-muted" />
        <p className="mt-2 max-w-3xl text-sm text-muted">{item.scenario}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <ListeningPlayer
              lines={item.lines}
              title={item.title}
              scenario={item.scenario}
              autoPlay={snapshot.profile.settings.autoPlayAudio}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => setShowTranscript(!showTranscript)} aria-pressed={showTranscript}>
                <Icon name={showTranscript ? "eyeOff" : "eye"} size={14} /> {showTranscript ? "Sembunyikan transkrip" : "Tampilkan transkrip"}
              </Button>
              <span className="self-center text-[11px] text-muted">Dengarkan dulu tanpa transkrip, lalu bandingkan.</span>
            </div>
          </Card>

          {showTranscript && (
            <Card className="p-5 sm:p-6">
              <SectionHeading title="Transkrip dialog" icon="listening" />
              <ul className="space-y-3">
                {item.lines.map((line) => (
                  <li key={line.id} className={cn("flex gap-3 rounded-xl p-2", line.speaker === "A" ? "bg-brand-soft/25" : line.speaker === "B" ? "bg-indigo-soft/30" : "bg-surface-2/60")}>
                    <span className="mt-0.5 w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted">{SPEAKER_LABELS[line.speaker]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-jp text-base font-medium" lang="ja">{line.jp}</p>
                      <p className="text-[11px] text-muted" lang="ja">{line.reading}</p>
                    </div>
                    <SpeakButton text={line.jp} speech={line.reading} size={13} />
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-5 sm:p-6">
            <SectionHeading title="Pertanyaan" icon="zap" description="Jawab berdasarkan apa yang kamu dengar." />
            <ExerciseRunner
              key={item.questions.map((question) => question.id).join("|")}
              exercises={exercises}
              title="Choukai"
              description="Dengarkan audio, lalu pilih jawaban yang tepat. Transkrip soal terbuka setelah diperiksa."
              mode="lesson"
              level={item.level}
              onComplete={(attempt) => {
                if (!done) {
                  void recordLesson({
                    lessonId: item.id,
                    kind: "listening",
                    score: attempt.score,
                    xp: XP_RULES.lesson.listening,
                  });
                }
              }}
              completeHref="/listening"
              completeLabel="Pilih dialog lain"
              allowRetry
            />
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-bold">Frasa kunci</h2>
            <ul className="mt-3 space-y-2.5">
              {item.keyPhrases.map((phrase) => (
                <li key={phrase.jp} className="flex items-start justify-between gap-2 border-b border-line pb-2.5 last:border-0 last:pb-0">
                  <div>
                    <p className="font-jp text-sm font-medium" lang="ja">{phrase.jp}</p>
                    <p className="text-[11px] text-muted"><span lang="ja">{phrase.reading}</span> · {phrase.meaning}</p>
                  </div>
                  <SpeakButton text={phrase.jp} speech={phrase.reading} size={13} />
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5 text-xs leading-relaxed text-muted">
            <h2 className="text-sm font-bold text-ink">Tips mendengar</h2>
            <ul className="mt-2 space-y-2">
              <li>• Dengarkan versi normal dulu, catat kata yang tertangkap.</li>
              <li>• Gunakan mode lambat untuk frasa yang sulit.</li>
              <li>• Perhatikan partikel dan bentuk akhir kata kerja.</li>
              <li>• Ulangi sambil membaca transkrip, lalu tutup transkrip.</li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
