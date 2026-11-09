"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { JpText, SpeakButton } from "@/components/japanese";
import { useProgress } from "@/components/providers/progress-provider";
import { ExerciseRunner } from "@/components/exercise-runner";
import { SavedItemEditor, SaveButton } from "@/components/saved-item-editor";
import { Badge, Button, Card, EmptyState, LinkButton, SectionHeading } from "@/components/ui";
import { GRAMMAR, GRAMMAR_BY_ID } from "@/content/grammar";
import { exercisesFromQuizQuestions } from "@/lib/exercise-catalog";
import { XP_RULES } from "@/lib/constants";

export default function GrammarDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const point = GRAMMAR_BY_ID.get(id);
  const { snapshot, recordLesson } = useProgress();
  const [marked, setMarked] = useState(false);

  if (!point) {
    return (
      <EmptyState
        icon="grammar"
        title="Pola tata bahasa tidak ditemukan"
        description="Pola ini mungkin sudah dipindahkan. Kembali ke daftar tata bahasa untuk melihat semua materi."
        action={<LinkButton href="/grammar">Kembali ke daftar</LinkButton>}
      />
    );
  }

  const alreadyDone = snapshot.lessons.some((lesson) => lesson.lessonId === point.id && lesson.kind === "grammar");
  const done = alreadyDone || marked;
  const index = GRAMMAR.findIndex((entry) => entry.id === point.id);
  const previous = GRAMMAR[index - 1];
  const next = GRAMMAR[index + 1];
  const pointId = point.id;

  function markComplete() {
    if (done) return;
    setMarked(true);
    void recordLesson({ lessonId: pointId, kind: "grammar", score: 100, xp: XP_RULES.lesson.grammar });
  }

  return (
    <div className="space-y-6">
      <div>
        <LinkButton href="/grammar" variant="ghost" size="sm" className="-ml-2 mb-2">
          <Icon name="arrowLeft" size={15} /> Semua tata bahasa
        </LinkButton>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{point.level}</Badge>
              {done && <Badge tone="matcha"><Icon name="check" size={11} /> Selesai dipelajari</Badge>}
            </div>
            <h1 className="mt-2 font-jp text-3xl font-bold sm:text-4xl" lang="ja">{point.pattern}</h1>
            <p className="mt-1 text-lg text-muted">{point.meaning}</p>
          </div>
          <SaveButton kind="grammar" refId={point.id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <SectionHeading title="Penjelasan" icon="book" />
            <div className="space-y-3 text-sm leading-relaxed">
              {point.explanation.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading title="Formasi" icon="grammar" description="Bagaimana pola ini dibentuk." />
            <div className="overflow-hidden rounded-xl border border-line">
              {point.formation.map((row, idx) => (
                <div key={idx} className={idx > 0 ? "border-t border-line" : ""}>
                  <div className="grid gap-1 p-3 sm:grid-cols-[140px_1fr] sm:gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{row.label}</p>
                    <div>
                      <JpText text={row.form} className="text-base font-medium" />
                      {row.note && <p className="mt-1 text-xs text-muted">{row.note}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading title="Contoh kalimat" icon="listening" />
            <ul className="space-y-3">
              {point.examples.map((example, idx) => (
                <li key={idx} className="rounded-2xl border border-line bg-surface-2/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <JpText text={example.jp} className="text-lg font-medium" />
                      <p className="mt-1 text-xs text-muted" lang="ja">{example.reading}</p>
                      <p className="mt-1.5 text-sm">{example.meaning}</p>
                    </div>
                    <SpeakButton text={example.jp.replace(/\{[^{}|]+\|([^{}|]+)\}/g, "$1")} speech={example.reading} size={15} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {point.mistakes && point.mistakes.length > 0 && (
            <Card className="p-5 sm:p-6">
              <SectionHeading title="Kesalahan umum" icon="alert" description="Perhatikan perbedaan yang sering terlewat." />
              <ul className="space-y-3">
                {point.mistakes.map((mistake, idx) => (
                  <li key={idx} className="rounded-2xl border border-brand/20 bg-brand-soft/30 p-4 text-sm">
                    <p className="flex items-start gap-2"><Icon name="x" size={16} className="mt-0.5 shrink-0 text-brand" /> <span className="font-jp" lang="ja">{mistake.wrong}</span></p>
                    <p className="mt-1 flex items-start gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-matcha" /> <span className="font-jp" lang="ja">{mistake.right}</span></p>
                    <p className="mt-2 text-xs text-muted">{mistake.why}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {point.notes && point.notes.length > 0 && (
            <Card className="p-5 sm:p-6">
              <SectionHeading title="Catatan" icon="lightbulb" />
              <ul className="space-y-2 text-sm text-muted">
                {point.notes.map((note, idx) => <li key={idx} className="flex gap-2"><span className="text-gold">•</span> {note}</li>)}
              </ul>
            </Card>
          )}

          <Card className="p-5 sm:p-6">
            <SectionHeading title="Latihan" icon="zap" description="Uji pemahamanmu dengan satu soal singkat." />
            <ExerciseRunner
              key={point.id}
              exercises={exercisesFromQuizQuestions(point.practice, "Latihan tata bahasa")}
              mode="lesson"
              level={point.level}
              title="Latihan tata bahasa"
              onComplete={(attempt) => {
                if (!done) {
                  setMarked(true);
                  void recordLesson({
                    lessonId: pointId,
                    kind: "grammar",
                    score: attempt.score,
                    xp: XP_RULES.lesson.grammar,
                  });
                }
              }}
              completeHref="/grammar"
              completeLabel="Kembali ke daftar"
              allowRetry
            />
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="sticky top-20 p-5">
            <h2 className="text-sm font-bold">Aksi cepat</h2>
            <Button className="mt-3 w-full" onClick={markComplete} disabled={done} variant={done ? "secondary" : "primary"}>
              <Icon name={done ? "checkCircle" : "check"} size={16} /> {done ? "Sudah ditandai selesai" : "Tandai selesai"}
            </Button>
            {!done && <p className="mt-2 text-[11px] text-muted">Dapatkan {XP_RULES.lesson.grammar} XP saat pertama kali menyelesaikan pola ini.</p>}
            {point.related && point.related.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pola terkait</p>
                <ul className="mt-2 space-y-1.5">
                  {point.related.map((relatedId) => {
                    const related = GRAMMAR_BY_ID.get(relatedId);
                    if (!related) return null;
                    return (
                      <li key={relatedId}>
                        <LinkButton href={`/grammar/${relatedId}`} variant="ghost" size="sm" className="w-full justify-start font-normal">
                          <JpText text={related.pattern} className="text-sm" /> <span className="ml-auto text-muted">→</span>
                        </LinkButton>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <div className="mt-5 flex justify-between gap-2 border-t border-line pt-4 text-xs">
              {previous ? <LinkButton href={`/grammar/${previous.id}`} variant="ghost" size="sm" className="px-0">← {previous.level}</LinkButton> : <span />}
              {next ? <LinkButton href={`/grammar/${next.id}`} variant="ghost" size="sm" className="px-0">{next.level} →</LinkButton> : <span />}
            </div>
          </Card>
          <Card className="p-5">
            <SavedItemEditor kind="grammar" refId={point.id} title="Simpan pola ini" />
          </Card>
        </aside>
      </div>
    </div>
  );
}