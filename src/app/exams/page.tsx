"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProgress } from "@/components/providers/progress-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Icon, type IconName } from "@/components/icons";
import { Badge, Button, Card, EmptyState, LinkButton, PageHeader, ProgressBar, Segmented, StatTile } from "@/components/ui";
import { LEVEL_DESCRIPTIONS, LEVEL_LABELS } from "@/lib/constants";
import {
  EXAM_CATEGORY_META,
  EXAM_CATEGORY_ORDER,
  EXAM_MODE_META,
  availableGrammarPoints,
  availableVocabularyTopics,
  buildMockExam,
  buildPracticeExam,
  buildRandomExam,
  buildTopicExam,
  type ExamCategory,
  type ExamMode,
  type ExamPaper,
} from "@/lib/exam-engine";
import { clearExamResult, saveActiveExam } from "@/lib/exam-storage";
import type { JLPTLevel, VocabTopic } from "@/lib/types";
import { JLPT_LEVELS } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

const MODE_ICONS: Record<ExamMode, IconName> = {
  practice: "practice",
  mock: "timer",
  topic: "target",
  random: "shuffle",
};

export default function ExamsPage() {
  const router = useRouter();
  const toast = useToast();
  const { snapshot } = useProgress();
  const [mode, setMode] = useState<ExamMode>("mock");
  const [level, setLevel] = useState<JLPTLevel>("N5");
  const [practiceCategory, setPracticeCategory] = useState<ExamCategory | "campuran">("campuran");
  const [practiceCount, setPracticeCount] = useState(10);
  const [topicKind, setTopicKind] = useState<"vocabulary" | "grammar">("vocabulary");
  const [topic, setTopic] = useState<VocabTopic | "">("");
  const [grammarId, setGrammarId] = useState<string>("");
  const [topicCount, setTopicCount] = useState(10);

  const topics = availableVocabularyTopics(level);
  const grammars = availableGrammarPoints(level);
  const effectiveTopic = topics.some((item) => item.topic === topic) ? topic : topics[0]?.topic;
  const effectiveGrammar = grammars.some((item) => item.id === grammarId) ? grammarId : grammars[0]?.id;

  const preview = useMemo<{ paper: ExamPaper | null; error: string | null }>(() => {
    try {
      if (mode === "mock") return { paper: buildMockExam(level), error: null };
      if (mode === "random") return { paper: buildRandomExam(level), error: null };
      if (mode === "practice") {
        return {
          paper: buildPracticeExam(level, { count: practiceCount, category: practiceCategory }),
          error: null,
        };
      }

      if (topicKind === "vocabulary") {
        const levelTopics = availableVocabularyTopics(level);
        const selectedTopic = levelTopics.some((item) => item.topic === topic) ? topic : levelTopics[0]?.topic;
        if (!selectedTopic) return { paper: null, error: "Belum ada topik kosakata untuk level ini." };
        return {
          paper: buildTopicExam(level, { kind: "vocabulary", topic: selectedTopic }, { count: topicCount }),
          error: null,
        };
      }

      const levelGrammars = availableGrammarPoints(level);
      const selectedGrammar = levelGrammars.some((item) => item.id === grammarId) ? grammarId : levelGrammars[0]?.id;
      if (!selectedGrammar) return { paper: null, error: "Belum ada pola tata bahasa untuk level ini." };
      return {
        paper: buildTopicExam(level, { kind: "grammar", grammarId: selectedGrammar }, { count: topicCount }),
        error: null,
      };
    } catch (error) {
      return { paper: null, error: error instanceof Error ? error.message : "Soal belum tersedia." };
    }
  }, [mode, level, practiceCategory, practiceCount, topicKind, topic, grammarId, topicCount]);

  function start() {
    if (!preview.paper) {
      toast.error(preview.error ?? "Soal belum tersedia.");
      return;
    }
    clearExamResult();
    saveActiveExam({ paper: preview.paper, startedAt: new Date().toISOString() });
    router.push("/exams/session");
  }

  const history = snapshot.exams.slice(0, 6);
  const paper = preview.paper;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Simulasi & evaluasi"
        title="Ujian Jepang"
        titleJp="試験"
        icon="exam"
        description="Latihan terarah, simulasi bertimer, ujian topik, dan ujian acak N5–N1. Semua soal orisinal Kotoba dan hasilnya adalah skor belajar, bukan sertifikat JLPT."
        actions={<LinkButton href="/progress" variant="secondary" size="sm"><Icon name="progress" size={15} /> Statistik</LinkButton>}
      />

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-line bg-surface-2/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Pilih level</p>
            <p className="mt-1 text-sm text-muted">{LEVEL_DESCRIPTIONS[level]}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {JLPT_LEVELS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLevel(item)}
                aria-pressed={level === item}
                className={"rounded-full border px-3.5 py-2 text-sm font-semibold transition " + (level === item ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:border-brand/40")}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(Object.keys(EXAM_MODE_META) as ExamMode[]).map((item) => {
              const meta = EXAM_MODE_META[item];
              const active = mode === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  aria-pressed={active}
                  className={"rounded-3xl border p-4 text-left transition " + (active ? "border-brand bg-brand-soft shadow-soft" : "border-line bg-surface hover:border-brand/40")}
                >
                  <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-surface text-brand shadow-soft">
                    <Icon name={MODE_ICONS[item]} size={19} />
                  </span>
                  <span className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-ink">{meta.label}</span>
                    <span className="font-jp text-xs text-muted">{meta.labelJp}</span>
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">{meta.description}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {mode === "practice" ? (
                <div className="space-y-3 rounded-2xl border border-line p-4">
                  <p className="text-sm font-semibold text-ink">Fokus latihan</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => setPracticeCategory("campuran")} aria-pressed={practiceCategory === "campuran"} className={"rounded-full border px-3 py-1.5 text-xs font-semibold " + (practiceCategory === "campuran" ? "border-brand bg-brand text-white" : "border-line text-muted")}>Campuran</button>
                    {EXAM_CATEGORY_ORDER.map((category) => (
                      <button key={category} type="button" onClick={() => setPracticeCategory(category)} aria-pressed={practiceCategory === category} className={"rounded-full border px-3 py-1.5 text-xs font-semibold " + (practiceCategory === category ? "border-brand bg-brand text-white" : "border-line text-muted")}>
                        {EXAM_CATEGORY_META[category].label}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-3 text-sm text-muted">
                    Jumlah soal
                    <select value={practiceCount} onChange={(event) => setPracticeCount(Number(event.target.value))} className="h-9 rounded-full border border-line bg-surface px-3 text-sm text-ink">
                      {[5, 10, 15, 20, 25].map((n) => <option key={n} value={n}>{n} soal</option>)}
                    </select>
                  </label>
                </div>
              ) : null}

              {mode === "topic" ? (
                <div className="space-y-3 rounded-2xl border border-line p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">Fokus topik</p>
                    <Segmented
                      value={topicKind}
                      onChange={(value) => setTopicKind(value as "vocabulary" | "grammar")}
                      options={[{ value: "vocabulary", label: "Kosakata" }, { value: "grammar", label: "Tata bahasa" }]}
                      size="sm"
                    />
                  </div>
                  {topicKind === "vocabulary" ? (
                    <label className="block text-sm text-muted">
                      Topik kosakata
                      <select value={effectiveTopic ?? ""} onChange={(event) => setTopic(event.target.value as VocabTopic)} className="mt-1.5 h-11 w-full rounded-2xl border border-line bg-surface px-3 text-sm text-ink">
                        {topics.map((item) => <option key={item.topic} value={item.topic}>{item.label} · {item.count} kata</option>)}
                      </select>
                    </label>
                  ) : (
                    <label className="block text-sm text-muted">
                      Pola tata bahasa
                      <select value={effectiveGrammar ?? ""} onChange={(event) => setGrammarId(event.target.value)} className="mt-1.5 h-11 w-full rounded-2xl border border-line bg-surface px-3 text-sm text-ink">
                        {grammars.map((item) => <option key={item.id} value={item.id}>{item.pattern} — {item.meaning} ({item.count} soal)</option>)}
                      </select>
                    </label>
                  )}
                  <label className="flex items-center gap-3 text-sm text-muted">
                    Jumlah soal
                    <select value={topicCount} onChange={(event) => setTopicCount(Number(event.target.value))} className="h-9 rounded-full border border-line bg-surface px-3 text-sm text-ink">
                      {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n} soal</option>)}
                    </select>
                  </label>
                </div>
              ) : null}

              <div className="rounded-2xl bg-surface-2/60 p-4 text-sm leading-relaxed text-muted">
                {mode === "mock" ? "Simulasi mengikuti tiga bagian: Moji & Goi, Bunpou & Dokkai, lalu Choukai. Timer berjalan sejak ujian dimulai." : null}
                {mode === "practice" ? "Jawaban diperiksa satu per satu. Pembahasan dan transkrip langsung terbuka, lalu soal yang salah dapat diulang." : null}
                {mode === "topic" ? "Materi difokuskan pada satu topik kosakata atau satu pola tata bahasa. Cocok setelah menyelesaikan lesson terkait." : null}
                {mode === "random" ? "Soal diambil seimbang dari lima kategori dengan timer. Gunakan sebagai pemeriksaan kesiapan." : null}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-line bg-surface-2/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">Ringkasan</p>
                <Badge tone="muted">{LEVEL_LABELS[level]}</Badge>
              </div>
              {paper ? (
                <>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3"><dt className="text-muted">Jumlah soal</dt><dd className="font-semibold text-ink">{paper.questionCount}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-muted">Durasi</dt><dd className="font-semibold text-ink">{paper.timed ? paper.minutes + " menit" : "Tanpa batas"}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-muted">Pembahasan</dt><dd className="font-semibold text-ink">{paper.immediateFeedback ? "Langsung" : "Setelah dikumpulkan"}</dd></div>
                  </dl>
                  {paper.mixedLevels ? <p className="rounded-xl bg-gold-soft/60 p-2.5 text-xs leading-relaxed text-ink">Sebagian soal berasal dari level lain karena stok soal level ini masih terbatas. Level tiap soal tetap ditampilkan.</p> : null}
                  <div className="space-y-1.5 border-t border-line pt-3">
                    {paper.sections.map((section) => (
                      <div key={section.id} className="flex items-center justify-between text-xs"><span className="text-muted">{section.label}</span><span className="font-semibold text-ink">{section.questions.length} soal</span></div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-brand-strong">{preview.error}</p>
              )}
              <Button type="button" onClick={start} disabled={!paper} className="w-full">
                <Icon name="play" size={16} /> Mulai {paper ? EXAM_MODE_META[paper.mode].label.toLowerCase() : "ujian"}
              </Button>
              <p className="text-center text-[11px] leading-relaxed text-muted">Target belajar {paper?.targetScore ?? 70}%. Bukan nilai resmi JLPT.</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Simulasi tersimpan" value={String(snapshot.stats.examsTaken)} hint="Semua mode ujian" icon="exam" tone="brand" />
        <StatTile label="Skor tertinggi" value={history.length ? String(Math.max(...history.map((exam) => Math.round((exam.score / Math.max(1, exam.total)) * 100)))) + "%" : "—"} hint="Persentase skor belajar" icon="trophy" tone="gold" />
        <StatTile label="Total soal katalog" value="N5–N1" hint="Kosakata, kanji, tata bahasa, bacaan, audio" icon="layers" tone="matcha" />
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl text-ink">Riwayat ujian</h2>
            <p className="text-sm text-muted">Skor belajar disimpan di server lokal perangkat ini.</p>
          </div>
          {history.length ? <Link href="/progress" className="text-sm font-semibold text-brand">Lihat statistik →</Link> : null}
        </div>
        {history.length === 0 ? (
          <EmptyState icon="exam" title="Belum ada riwayat ujian" description="Selesaikan satu latihan atau simulasi untuk melihat skor dan area yang perlu diperkuat." action={<Button type="button" size="sm" onClick={start}>Mulai ujian pertama</Button>} />
        ) : (
          <div className="space-y-2">
            {history.map((exam) => {
              const percent = Math.round((exam.score / Math.max(1, exam.total)) * 100);
              return (
                <div key={exam.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line px-4 py-3">
                  <Badge tone="muted">{exam.level}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">Skor belajar {percent}%</p>
                    <p className="text-xs text-muted">{exam.correct} benar dari {exam.totalQuestions} soal · {formatDuration(exam.durationSec)}</p>
                  </div>
                  <span className={"text-xs font-semibold " + (percent >= 70 ? "text-matcha" : "text-brand")}>{percent >= 70 ? "Target tercapai" : "Perlu latihan"}</span>
                  <div className="w-full sm:w-32"><ProgressBar value={percent} max={100} label="Skor belajar" /></div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="rounded-2xl border border-line bg-surface-2/40 p-4 text-xs leading-relaxed text-muted">
        <p className="mb-1 font-semibold text-ink">Tentang penilaian</p>
        <p>Kotoba memakai soal orisinal dan target belajar 70%, bukan ambang kelulusan JLPT. Skor, jawaban, dan waktu disimpan untuk latihan berikutnya; tidak ada sertifikasi resmi yang diberikan.</p>
      </div>
    </div>
  );
}
