"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { AudioPlayerCard } from "@/components/audio";
import { ExerciseRunner } from "@/components/exercise-runner";
import { Icon } from "@/components/icons";
import { JpText, SpeakButton } from "@/components/japanese";
import { useProgress } from "@/components/providers/progress-provider";
import { Badge, Button, Card, EmptyState, LinkButton, SectionHeading } from "@/components/ui";
import { READING_BY_ID } from "@/content/reading";
import { XP_RULES } from "@/lib/constants";
import { exercisesFromQuizQuestions } from "@/lib/exercise-catalog";
import { furiganaReading } from "@/lib/furigana";

export default function ReadingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const passage = READING_BY_ID.get(id);
  const { snapshot, recordLesson } = useProgress();
  const [showTranslation, setShowTranslation] = useState(false);
  const [furigana, setFurigana] = useState<boolean | null>(null);

  if (!passage) {
    return (
      <EmptyState
        icon="reading"
        title="Bacaan tidak ditemukan"
        description="Teks ini mungkin sudah dipindahkan. Kembali ke daftar bacaan untuk memilih teks lain."
        action={<LinkButton href="/reading">Kembali ke daftar</LinkButton>}
      />
    );
  }

  const showFurigana = furigana ?? snapshot.profile.settings.showFurigana;
  const done = snapshot.lessons.some((lesson) => lesson.lessonId === passage.id && lesson.kind === "reading");
  const exercises = exercisesFromQuizQuestions(passage.questions, "Dokkai");

  return (
    <div className="space-y-6">
      <div>
        <LinkButton href="/reading" variant="ghost" size="sm" className="-ml-2 mb-2">
          <Icon name="arrowLeft" size={15} /> Semua bacaan
        </LinkButton>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{passage.level}</Badge>
          <Badge tone="muted">{passage.minutes} menit</Badge>
          {done && <Badge tone="matcha"><Icon name="check" size={11} /> Selesai</Badge>}
        </div>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{passage.title}</h1>
        <JpText text={passage.titleJp} className="mt-1 text-lg text-muted" />
        <p className="mt-2 max-w-3xl text-sm text-muted">{passage.summary}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={showFurigana ? "primary" : "secondary"} onClick={() => setFurigana(!showFurigana)} aria-pressed={showFurigana}>
                  <Icon name="edit" size={14} /> Furigana {showFurigana ? "aktif" : "nonaktif"}
                </Button>
                <Button size="sm" variant={showTranslation ? "primary" : "secondary"} onClick={() => setShowTranslation(!showTranslation)} aria-pressed={showTranslation}>
                  <Icon name="eye" size={14} /> Terjemahan
                </Button>
              </div>
              <SpeakButton text={passage.text} speech={furiganaReading(passage.text)} slow label="Bacakan" />
            </div>
          </Card>

          <Card className="p-5 sm:p-7">
            <article className="space-y-4">
              {furiganaParagraphs(passage.text).map((paragraph, idx) => (
                <p key={idx} className="font-jp text-[17px] leading-[2] sm:text-lg" lang="ja">
                  <JpText text={paragraph} showFurigana={showFurigana} />
                </p>
              ))}
            </article>
            {showTranslation && (
              <div className="mt-6 space-y-3 rounded-2xl border border-indigo/20 bg-indigo-soft/40 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-indigo"><Icon name="eye" size={14} /> Terjemahan Indonesia</p>
                {passage.translation.map((line, idx) => <p key={idx} className="text-sm leading-relaxed">{line}</p>)}
                <p className="border-t border-indigo/15 pt-2 text-[11px] text-muted">Terjemahan ini disusun untuk membantu pemahaman, bukan pengganti membaca teks Jepangnya.</p>
              </div>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading title="Kosakata penting" icon="vocab" description="Klik pelafalan untuk mendengarkan." />
            <ul className="grid gap-2 sm:grid-cols-2">
              {passage.vocab.map((word) => (
                <li key={word.jp} className="flex items-center justify-between gap-2 rounded-xl border border-line p-3">
                  <div>
                    <p className="font-jp text-base font-medium" lang="ja">{word.jp}</p>
                    <p className="text-[11px] text-muted"><span lang="ja">{word.reading}</span> · {word.meaning}</p>
                  </div>
                  <SpeakButton text={word.jp} speech={word.reading} size={14} />
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading title="Pertanyaan pemahaman" icon="zap" description="Jawab untuk menguji pemahaman bacaan." />
            <ExerciseRunner
              key={passage.questions.map((question) => question.id).join("|")}
              exercises={exercises}
              title="Dokkai"
              description="Jawab berdasarkan isi bacaan. Pembahasan muncul setelah jawaban diperiksa."
              mode="lesson"
              level={passage.level}
              onComplete={(attempt) => {
                if (!done) {
                  void recordLesson({
                    lessonId: passage.id,
                    kind: "reading",
                    score: attempt.score,
                    xp: XP_RULES.lesson.reading,
                  });
                }
              }}
              completeHref="/reading"
              completeLabel="Pilih bacaan lain"
              allowRetry
            />
          </Card>
        </div>

        <aside className="space-y-4">
          <AudioPlayerCard
            tracks={[
              {
                id: passage.id + "-passage",
                text: passage.text,
                speech: furiganaReading(passage.text),
                reading: furiganaReading(passage.text),
                label: "Bacaan lengkap",
                context: passage.summary,
              },
              ...passage.vocab.map((word, index) => ({
                id: passage.id + "-vocab-" + index,
                text: word.jp,
                speech: word.reading,
                reading: word.reading,
                label: "Kosakata · " + word.jp,
                context: word.meaning,
              })),
            ]}
            title="Putar bacaan"
            description="Dengarkan seluruh teks atau kosakata penting. Teks yang dikirim ke mesin suara memakai bacaan kana."
            label="Pemutar bacaan"
            queueColumns={1}
          />

          <Card className="p-5">
            <h2 className="text-sm font-bold">Tentang bacaan</h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between"><dt className="text-muted">Level</dt><dd className="font-semibold">{passage.level}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Waktu baca</dt><dd className="font-semibold">±{passage.minutes} menit</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Kosakata</dt><dd className="font-semibold">{passage.vocab.length} kata</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Pertanyaan</dt><dd className="font-semibold">{passage.questions.length} soal</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Hadiah</dt><dd className="font-semibold text-brand">+{XP_RULES.lesson.reading} XP</dd></div>
            </dl>
          </Card>
          <Card className="p-5 text-xs leading-relaxed text-muted">
            <h2 className="text-sm font-bold text-ink">Tips membaca</h2>
            <ul className="mt-2 space-y-2">
              <li>• Baca sekali tanpa furigana untuk melatih pengenalan kanji.</li>
              <li>• Tandai kata yang belum dikenal, lalu cek daftar kosakata.</li>
              <li>• Baca ulang dengan suara keras untuk melatih ritme.</li>
              <li>• Jangan menerjemahkan kata per kata; tangkap gagasan utamanya dulu.</li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function furiganaParagraphs(text: string): string[] {
  return text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
}