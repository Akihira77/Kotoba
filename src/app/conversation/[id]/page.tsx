"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AudioPlayerCard } from "@/components/audio";
import { Icon } from "@/components/icons";
import { JpText, SpeakButton } from "@/components/japanese";
import { useProgress } from "@/components/providers/progress-provider";
import { Badge, Button, Card, EmptyState, LinkButton, PageHeader, ProgressBar, Ring, SectionHeading } from "@/components/ui";
import { CONVERSATION_BY_ID } from "@/content/conversations";
import { REGISTER_LABELS, XP_RULES } from "@/lib/constants";
import { stripFurigana } from "@/lib/furigana";
import type { ConversationChoice, ConversationLine, Register } from "@/lib/types";
import { cn } from "@/lib/utils";

const REGISTER_TONE: Record<Register, "brand" | "matcha" | "indigo" | "gold" | "anime"> = {
  standar: "matcha",
  formal: "indigo",
  kasual: "indigo",
  slang: "gold",
  arkais: "anime",
  anime: "brand",
};

const LETTERS = ["A", "B", "C"];

export default function ConversationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const scenario = CONVERSATION_BY_ID.get(id);
  const { snapshot, recordLesson } = useProgress();
  const previousCompletion = scenario
    ? snapshot.lessons.find((lesson) => lesson.lessonId === scenario.id && lesson.kind === "conversation")
    : undefined;

  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongChoices, setWrongChoices] = useState<string[]>([]);
  const [mistakeSteps, setMistakeSteps] = useState<number[]>([]);
  const [transcript, setTranscript] = useState<Array<{ npc: ConversationLine; choice: ConversationChoice }>>([]);
  const [finished, setFinished] = useState(false);
  const [recordStatus, setRecordStatus] = useState<"idle" | "saving" | "saved" | "error">(
    previousCompletion ? "saved" : "idle",
  );

  useEffect(() => {
    if (!finished) return;
    const result = document.getElementById("conversation-result");
    result?.focus();
  }, [finished]);

  if (!scenario) {
    return (
      <EmptyState
        icon="conversation"
        title="Skenario tidak ditemukan"
        description="Skenario ini mungkin sudah dipindahkan. Kembali ke daftar percakapan untuk memilih dialog lain."
        action={<LinkButton href="/conversation">Kembali ke daftar</LinkButton>}
      />
    );
  }

  const totalSteps = scenario.steps.length;
  const current = scenario.steps[stepIndex];
  const selectedChoice = current.choices.find((choice) => choice.id === selected);
  const resolved = Boolean(selectedChoice?.correct);
  const score = Math.round(((totalSteps - mistakeSteps.length) / totalSteps) * 100);
  const progress = ((stepIndex + (resolved ? 1 : 0)) / totalSteps) * 100;

  function pick(choice: ConversationChoice) {
    if (!current || resolved) return;
    if (wrongChoices.includes(choice.id)) return;
    setSelected(choice.id);
    if (choice.correct) {
      setTranscript((entries) => [...entries, { npc: current.npc, choice }]);
    } else {
      setWrongChoices((entries) => [...entries, choice.id]);
      setMistakeSteps((entries) => (entries.includes(stepIndex) ? entries : [...entries, stepIndex]));
    }
  }

  async function saveCompletion() {
    if (!scenario || previousCompletion || recordStatus === "saving" || recordStatus === "saved") return;
    setRecordStatus("saving");
    try {
      await recordLesson({
        lessonId: scenario.id,
        kind: "conversation",
        score,
        xp: XP_RULES.lesson.conversation,
      });
      setRecordStatus("saved");
    } catch {
      setRecordStatus("error");
    }
  }

  function finish() {
    setFinished(true);
    void saveCompletion();
  }

  function next() {
    if (!selectedChoice?.correct) return;
    if (stepIndex >= totalSteps - 1) {
      finish();
      return;
    }
    setStepIndex((index) => index + 1);
    setSelected(null);
    setWrongChoices([]);
  }

  function restart() {
    setStepIndex(0);
    setSelected(null);
    setWrongChoices([]);
    setMistakeSteps([]);
    setTranscript([]);
    setFinished(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Latihan berbicara · 会話"
        title={scenario.title}
        titleJp={stripFurigana(scenario.titleJp)}
        description={scenario.summary}
        icon="conversation"
        actions={
          <LinkButton href="/conversation" variant="secondary" size="sm">
            <Icon name="conversation" size={15} /> Semua percakapan
          </LinkButton>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{scenario.level}</Badge>
                <Badge tone="muted">{scenario.category}</Badge>
                {previousCompletion ? <Badge tone="matcha"><Icon name="check" size={12} /> Selesai · {previousCompletion.score}%</Badge> : null}
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-muted"><Icon name="clock" size={14} /> {scenario.minutes} menit · {totalSteps} langkah</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{scenario.setting}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {scenario.goals.map((goal) => (
                <div key={goal} className="flex items-start gap-2 rounded-2xl bg-surface-2/70 px-3 py-2 text-xs text-muted">
                  <Icon name="target" size={14} className="mt-0.5 shrink-0 text-brand" />
                  <span>{goal}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            {finished ? (
              <div className="p-6 sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Skenario selesai</span>
                  <div className="mt-3">
                    <Ring value={score} label={`Skor ${score} persen`}>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{score}%</div>
                        <div className="text-[10px] uppercase tracking-wide text-muted">akurasi</div>
                      </div>
                    </Ring>
                  </div>
                  <h2 className="mt-4 text-xl font-bold">Kerja bagus.</h2>
                  <p className="mt-1 max-w-md text-sm text-muted">
                    {score === 100
                      ? "Semua balasan tepat pada percobaan pertama. Coba skenario lain untuk variasi situasi."
                      : "Beberapa jawaban perlu dicoba ulang. Baca kembali frasa kunci dan catatan register di samping, lalu ulangi dialog."}
                  </p>
                  <div id="conversation-result" tabIndex={-1} className="rounded-2xl focus:outline-none">
                  <p className="sr-only" role="status" aria-live="polite">Skenario selesai. Skor {score} persen.</p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <Button onClick={restart} variant="secondary"><Icon name="rotate" size={15} /> Ulangi dialog</Button>
                    <LinkButton href="/conversation"><Icon name="conversation" size={15} /> Pilih skenario lain</LinkButton>
                  </div>
                  <p className="mt-3 text-xs text-muted" role="status" aria-live="polite">
                    {recordStatus === "saved"
                      ? `Progres tersimpan · +${XP_RULES.lesson.conversation} XP untuk penyelesaian pertama.`
                      : recordStatus === "saving"
                        ? "Menyimpan progres..."
                        : recordStatus === "error"
                          ? "Progres belum tersimpan. Periksa koneksi server lokal."
                          : "Progres dicatat selama server lokal tersedia."}
                  </p>
                  {recordStatus === "error" ? (
                    <Button size="sm" variant="soft" className="mt-2" onClick={() => void saveCompletion()}>Coba simpan lagi</Button>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-2xl bg-surface-2/70 p-3 text-center"><p className="text-xs text-muted">Langkah</p><p className="mt-1 font-bold">{totalSteps}</p></div>
                  <div className="rounded-2xl bg-surface-2/70 p-3 text-center"><p className="text-xs text-muted">Perlu diulang</p><p className="mt-1 font-bold">{mistakeSteps.length}</p></div>
                  <div className="rounded-2xl bg-surface-2/70 p-3 text-center"><p className="text-xs text-muted">Frasa kunci</p><p className="mt-1 font-bold">{scenario.keyPhrases.length}</p></div>
                </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="border-b border-line/70 p-5 sm:p-6">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="font-semibold text-brand">Langkah {stepIndex + 1} dari {totalSteps}</span>
                    <span>{Math.round(progress)}% skenario</span>
                  </div>
                  <ProgressBar value={progress} max={100} className="mt-2" label={`Progres skenario ${Math.round(progress)} persen`} />
                </div>

                <div className="p-5 sm:p-6">
                  <div className="rounded-2xl border border-line bg-surface-2/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-brand dark:bg-brand/15"><Icon name="conversation" size={15} /></span>
                        Lawan bicara
                      </div>
                      <SpeakButton text={stripFurigana(current.npc.jp)} speech={current.npc.reading} label="Putar kalimat lawan bicara" />
                    </div>
                    <JpText text={current.npc.jp} className="mt-3 text-xl font-semibold leading-relaxed" />
                    <p lang="ja" className="mt-1 text-sm text-muted">{current.npc.reading}</p>
                    <p className="mt-0.5 text-xs italic text-muted">{current.npc.romaji}</p>
                    <p className="mt-2 border-t border-line/60 pt-2 text-sm text-ink">{current.npc.meaning}</p>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Pilih balasanmu</p>
                    <p className="mt-1 text-sm text-muted">{current.prompt}</p>
                  </div>

                  <div className="mt-3 space-y-2.5" role="group" aria-label="Pilihan balasan">
                    {current.choices.map((choice, index) => {
                      const isSelected = selected === choice.id;
                      const isWrong = wrongChoices.includes(choice.id);
                      const isRight = isSelected && choice.correct;
                      const disabled = resolved || isWrong;
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          aria-pressed={isSelected}
                          aria-disabled={disabled}
                          title={disabled ? "Pilihan ini sudah dinilai." : undefined}
                          onClick={() => pick(choice)}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors",
                            isRight
                              ? "border-matcha/60 bg-matcha-soft/60 dark:bg-matcha/10"
                              : isWrong
                                ? "border-red-300 bg-red-50/70 opacity-80 dark:border-red-500/40 dark:bg-red-500/10"
                                : "border-line bg-surface hover:border-brand/40 hover:bg-surface-2/60",
                            resolved && !isRight && "opacity-70",
                          )}
                        >
                          <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", isRight ? "bg-matcha text-white" : isWrong ? "bg-red-500 text-white" : "bg-surface-2 text-muted")}>
                            {LETTERS[index] ?? index + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <JpText text={choice.jp} className="text-base font-semibold" />
                              <Badge tone={REGISTER_TONE[choice.register]}>{REGISTER_LABELS[choice.register].label}</Badge>
                            </span>
                            <span lang="ja" className="mt-0.5 block text-xs text-muted">{choice.reading}</span>
                            <span className="mt-0.5 block text-xs text-muted">{choice.meaning}</span>
                          </span>
                          {isRight ? <Icon name="check" size={18} className="mt-1 shrink-0 text-matcha" /> : isWrong ? <Icon name="x" size={18} className="mt-1 shrink-0 text-red-500" /> : null}
                        </button>
                      );
                    })}
                  </div>

                  {selectedChoice ? (
                    <div role="status" aria-live="polite" className={cn("mt-4 rounded-2xl border p-4", resolved ? "border-matcha/40 bg-matcha-soft/50 dark:bg-matcha/10" : "border-gold/40 bg-gold-soft/50 dark:bg-gold/10")}>
                      <p className={cn("flex items-center gap-2 text-sm font-bold", resolved ? "text-matcha" : "text-gold")}>
                        <Icon name={resolved ? "check" : "info"} size={16} /> {resolved ? "Tepat." : "Belum tepat."}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink">{selectedChoice.feedback}</p>
                      {!resolved ? <p className="mt-2 text-xs text-muted">Coba pilihan lain yang menurutmu paling sesuai dengan situasi dan register.</p> : null}
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted">
                      {resolved ? "Siap lanjut ke langkah berikutnya." : "Pilih satu jawaban, lalu baca pembahasannya."}
                    </p>
                    <Button onClick={next} disabled={!resolved}>
                      {stepIndex >= totalSteps - 1 ? "Lihat hasil" : "Lanjut"} <Icon name="external" size={15} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {finished && transcript.length > 0 ? (
            <Card className="p-5 sm:p-6">
              <SectionHeading title="Transkrip dialog" description="Perhatikan bagaimana setiap balasan menyambung kalimat lawan bicara." />
              <div className="space-y-3">
                {transcript.map((entry, index) => (
                  <div key={`${entry.choice.id}-${index}`} className="rounded-2xl border border-line/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Lawan bicara · langkah {index + 1}</p>
                    <JpText text={entry.npc.jp} className="mt-1.5 text-base font-semibold" />
                    <p lang="ja" className="text-xs text-muted">{entry.npc.reading}</p>
                    <div className="mt-3 border-t border-line/60 pt-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand">Balasanmu</p>
                      <div className="mt-1 flex items-start justify-between gap-2">
                        <div>
                          <JpText text={entry.choice.jp} className="text-base font-semibold" />
                          <p lang="ja" className="text-xs text-muted">{entry.choice.reading}</p>
                          <p className="mt-0.5 text-xs text-muted">{entry.choice.meaning}</p>
                        </div>
                        <Badge tone={REGISTER_TONE[entry.choice.register]}>{REGISTER_LABELS[entry.choice.register].label}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-4">
          <AudioPlayerCard
            tracks={[
              {
                id: scenario.id + "-full",
                text: scenario.steps
                  .map((step) => {
                    const answer = step.choices.find((choice) => choice.correct);
                    return step.npc.jp + (answer ? " / " + answer.jp : "");
                  })
                  .join("\n"),
                speech: scenario.steps
                  .map((step) => {
                    const answer = step.choices.find((choice) => choice.correct);
                    return step.npc.reading + (answer ? "、" + answer.reading : "");
                  })
                  .join("。"),
                reading: scenario.steps
                  .map((step) => {
                    const answer = step.choices.find((choice) => choice.correct);
                    return step.npc.reading + (answer ? "、" + answer.reading : "");
                  })
                  .join("。"),
                label: "Seluruh dialog",
                context: scenario.summary,
              },
              ...scenario.steps.flatMap((step, index) => {
                const answer = step.choices.find((choice) => choice.correct);
                const tracks = [
                  {
                    id: scenario.id + "-npc-" + step.id,
                    text: step.npc.jp,
                    speech: step.npc.reading,
                    reading: step.npc.reading,
                    label: "Lawan bicara · Langkah " + (index + 1),
                    context: step.npc.meaning,
                  },
                ];
                if (answer) {
                  tracks.push({
                    id: scenario.id + "-answer-" + answer.id,
                    text: answer.jp,
                    speech: answer.reading,
                    reading: answer.reading,
                    label: "Jawaban tepat · Langkah " + (index + 1),
                    context: answer.meaning,
                  });
                }
                return tracks;
              }),
            ]}
            title="Putar dialog"
            description="Putar seluruh dialog atau satu baris pembicara. Kecepatan dan voice mengikuti Pengaturan."
            label="Pemutar dialog percakapan"
            queueColumns={1}
          />

          <Card className="p-5">
            <SectionHeading title="Frasa kunci" description="Dengarkan dan perhatikan register-nya." icon="vocab" />
            <ul className="space-y-3">
              {scenario.keyPhrases.map((keyPhrase) => (
                <li key={keyPhrase.jp} className="rounded-2xl border border-line/70 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <JpText text={keyPhrase.jp} className="text-sm font-semibold" />
                    <SpeakButton text={stripFurigana(keyPhrase.jp)} speech={keyPhrase.reading} label="Putar frasa kunci" />
                  </div>
                  <p lang="ja" className="mt-0.5 text-xs text-muted">{keyPhrase.reading}</p>
                  <p className="text-xs italic text-muted">{keyPhrase.romaji}</p>
                  <p className="mt-1.5 text-sm">{keyPhrase.meaning}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={REGISTER_TONE[keyPhrase.register]}>{REGISTER_LABELS[keyPhrase.register].label}</Badge>
                    {keyPhrase.note ? <span className="text-[11px] text-muted">{keyPhrase.note}</span> : null}
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold"><Icon name="culture" size={17} className="text-brand" /> Catatan budaya</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{scenario.culturalNote}</p>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold">Tentang skenario</h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between"><dt className="text-muted">Level</dt><dd className="font-semibold">{scenario.level}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Kategori</dt><dd className="font-semibold">{scenario.category}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Langkah</dt><dd className="font-semibold">{totalSteps}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Waktu</dt><dd className="font-semibold">±{scenario.minutes} menit</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Hadiah</dt><dd className="font-semibold text-brand">+{XP_RULES.lesson.conversation} XP</dd></div>
            </dl>
            <Link href="/plan" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
              Atur rencana belajar <Icon name="external" size={13} />
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
