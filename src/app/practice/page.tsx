"use client";

import { useMemo, useState } from "react";
import { ExerciseRunner } from "@/components/exercise-runner";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/providers/toast-provider";
import { useProgress } from "@/components/providers/progress-provider";
import { SentenceBuilder } from "@/components/sentence-builder";
import { Button, Card, EmptyState, SectionHeading, StatTile } from "@/components/ui";
import { SENTENCES } from "@/content/sentences";
import { buildAdaptiveSession } from "@/lib/exercise-catalog";
import { ALL_EXERCISE_KINDS, EXERCISE_KIND_LABELS } from "@/lib/exercise-engine";
import { XP_RULES } from "@/lib/constants";
import { JLPT_LEVELS, type Exercise, type ExerciseKind, type JLPTLevel, type SentenceItem } from "@/lib/types";
import { cn, shuffle } from "@/lib/utils";

type Mode = "kuis" | "kalimat";
type LevelFilter = JLPTLevel | "semua";

const TYPE_OPTIONS: { type: ExerciseKind; label: string }[] = ALL_EXERCISE_KINDS.map((kind) => ({
  type: kind,
  label: EXERCISE_KIND_LABELS[kind],
}));

export default function PracticePage() {
  const { recordSession, snapshot } = useProgress();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>("kuis");
  const [level, setLevel] = useState<LevelFilter>("semua");
  const [count, setCount] = useState(10);
  const [types, setTypes] = useState<ExerciseKind[]>([]);
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [sentence, setSentence] = useState<SentenceItem | null>(null);
  const [sentenceLevel, setSentenceLevel] = useState<LevelFilter>("semua");
  const [sentenceDone, setSentenceDone] = useState<number>(0);

  const sentencePool = useMemo(
    () => SENTENCES.filter((item) => sentenceLevel === "semua" || item.level === sentenceLevel),
    [sentenceLevel],
  );

  function toggleType(type: ExerciseKind) {
    setTypes((current) => (current.includes(type) ? current.filter((entry) => entry !== type) : [...current, type]));
  }

  function startQuiz() {
    const next = buildAdaptiveSession({
      level: level === "semua" ? undefined : level,
      kinds: types.length > 0 ? types : undefined,
      count,
      cards: snapshot.cards,
      questionStats: snapshot.questionStats,
      seed: `${Date.now()}-${sessionKey}`,
      now: new Date(),
    });
    if (next.length === 0) {
      toast.info("Belum ada soal untuk kombinasi ini. Coba pilih level atau jenis soal lain.");
      return;
    }
    setExercises(next);
    setSessionKey((value) => value + 1);
  }

  function resetQuiz() {
    setExercises(null);
    setSessionKey((value) => value + 1);
  }

  function drawSentence() {
    setSentence(shuffle([...sentencePool])[0] ?? null);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Latihan campuran · 練習</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Latihan</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Sembilan jenis latihan — pilihan ganda, isi rumpang, terjemahan, mencocokkan, baca kana, menyimak, susun
          kalimat, benar/salah, dan mengetik. Sesi adaptif memprioritaskan soal yang sering salah dan kartu jatuh tempo.
        </p>
      </div>

      <div className="flex gap-1 rounded-full border border-line bg-surface-2 p-1 sm:w-fit">
        {(["kuis", "kalimat"] as Mode[]).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
            className={cn("flex-1 rounded-full px-4 py-2 text-sm font-semibold transition sm:flex-none", mode === value ? "bg-surface text-ink shadow-soft" : "text-muted hover:text-ink")}
          >
            {value === "kuis" ? "Kuis campuran" : "Susun kalimat"}
          </button>
        ))}
      </div>

      {mode === "kuis" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            {!exercises ? (
              <Card className="p-5 sm:p-6">
                <SectionHeading title="Atur sesi latihan" icon="practice" description="Pilih kombinasi yang ingin kamu latih hari ini." />

                <div className="mt-5 space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Level</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(["semua", ...JLPT_LEVELS] as LevelFilter[]).map((value) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={level === value}
                          onClick={() => setLevel(value)}
                          className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", level === value ? "border-brand bg-brand text-white" : "border-line bg-surface-2 text-muted hover:text-ink")}
                        >
                          {value === "semua" ? "Semua level" : value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Jumlah soal</p>
                    <div className="mt-2 flex gap-2">
                      {[5, 10, 15, 20].map((value) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={count === value}
                          onClick={() => setCount(value)}
                          className={cn("rounded-xl border px-3 py-2 text-sm font-semibold", count === value ? "border-brand bg-brand-soft/60 text-brand" : "border-line text-muted hover:text-ink")}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Jenis soal</p>
                      <button type="button" onClick={() => setTypes([])} className="inline-flex min-h-6 items-center text-[11px] font-semibold text-brand hover:underline">
                        Semua jenis
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {TYPE_OPTIONS.map((option) => {
                        const active = types.includes(option.type);
                        return (
                          <button
                            key={option.type}
                            type="button"
                            aria-pressed={active}
                            onClick={() => toggleType(option.type)}
                            className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition", active ? "border-indigo bg-indigo-soft text-indigo dark:bg-indigo/15" : "border-line text-muted hover:text-ink")}
                          >
                            {active && <Icon name="check" size={11} className="mr-1 inline" />}
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-muted">Tanpa memilih apa pun, semua jenis soal akan dicampur.</p>
                  </div>

                  <Button size="lg" className="w-full sm:w-auto" onClick={startQuiz}>
                    <Icon name="play" size={16} /> Mulai latihan
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {exercises.length} soal · {level === "semua" ? "Semua level" : level}
                  </p>
                  <Button size="sm" variant="secondary" onClick={resetQuiz}>
                    <Icon name="rotate" size={14} /> Ganti sesi
                  </Button>
                </div>
                <ExerciseRunner
                  key={`${sessionKey}-${exercises.map((exercise) => exercise.id).join("|")}`}
                  exercises={exercises}
                  title="Latihan campuran"
                  description="Setiap soal disertai pembahasan setelah diperiksa."
                  mode="practice"
                  level={level === "semua" ? undefined : level}
                  showAdaptiveNote
                  autoFocus
                  onComplete={(attempt) => {
                    toast.success(`Latihan selesai: ${attempt.correct}/${attempt.total} benar · skor ${attempt.score}`);
                  }}
                  completeHref="/practice"
                  completeLabel="Kembali ke latihan"
                  allowRetry
                />
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <StatTile label="XP sesi" value="+10–30" hint="Bonus dari skor" icon="zap" tone="gold" />
              <StatTile label="Soal tersedia" value="200+" hint="Dari semua konten" icon="layers" tone="indigo" />
              <StatTile label="Level" value="N5–N1" hint="Bertahap" icon="progress" tone="matcha" />
            </div>
            <Card className="p-5 text-xs leading-relaxed text-muted">
              <h2 className="text-sm font-bold text-ink">Cara memakai latihan</h2>
              <ul className="mt-2 space-y-2">
                <li>• Mulai dari satu jenis soal agar fokus.</li>
                <li>• Baca penjelasan setiap jawaban, benar maupun salah.</li>
                <li>• Kombinasikan level di bawah kemampuanmu untuk mengulang dasar.</li>
                <li>• Sesi adaptif menaikkan peluang soal yang sering salah.</li>
                <li>• Latihan tidak menggantikan ulasan SRS harian.</li>
              </ul>
            </Card>
          </aside>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {(["semua", ...JLPT_LEVELS] as LevelFilter[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setSentenceLevel(value); setSentence(null); }}
                    className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", sentenceLevel === value ? "bg-brand text-white" : "bg-surface-2 text-muted hover:text-ink")}
                  >
                    {value === "semua" ? "Semua" : value}
                  </button>
                ))}
              </div>
              <Button size="sm" variant="secondary" onClick={drawSentence}>
                <Icon name="shuffle" size={14} /> Kalimat acak
              </Button>
            </div>

            {sentence ? (
              <SentenceBuilder
                key={sentence.id}
                item={sentence}
                onChecked={(correct) => {
                  setSentenceDone((value) => value + 1);
                  const xp = correct ? XP_RULES.practiceCorrect : XP_RULES.practiceWrong;
                  void recordSession({ xp, minutes: 1, reviews: 1, source: "practice" });
                  if (correct) toast.success(`Tepat! +${xp} XP`);
                  else toast.info(`Belum tepat. Pelajari susunan yang benar, +${xp} XP.`);
                }}
              />
            ) : (
              <EmptyState
                icon="edit"
                title="Susun kalimat Jepang"
                description={`${sentencePool.length} kalimat tersedia untuk level ini. Ketuk tombol untuk mengambil kalimat acak.`}
                action={<Button onClick={drawSentence}><Icon name="shuffle" size={16} /> Ambil kalimat</Button>}
              />
            )}
          </Card>

          <aside className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <StatTile label="Kalimat tersedia" value={String(sentencePool.length)} hint="Level terpilih" icon="edit" tone="brand" />
              <StatTile label="Sudah dicoba" value={String(sentenceDone)} hint="Sesi ini" icon="checkCircle" tone="matcha" />
              <StatTile label="Hadiah" value={`+${XP_RULES.practiceCorrect}`} hint="Per kalimat tepat" icon="zap" tone="gold" />
            </div>
            <Card className="p-5 text-xs leading-relaxed text-muted">
              <h2 className="text-sm font-bold text-ink">Pola kalimat</h2>
              <p className="mt-2">
                Bahasa Jepang umumnya menempatkan kata kerja di akhir. Partikel seperti は, が, を, に, dan で menandai
                peran setiap kata, sehingga urutan menjadi kunci makna.
              </p>
              <p className="mt-2">Baca terjemahan Indonesia, lalu susun potongan kalimat hingga membentuk kalimat yang wajar.</p>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}
