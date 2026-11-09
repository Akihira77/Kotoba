"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExamQuestionCard } from "@/components/exam-question-card";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/providers/toast-provider";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LinkButton,
  PageSkeleton,
  ProgressBar,
  Ring,
  SectionHeading,
  StatTile,
} from "@/components/ui";
import {
  buildRetryPaper,
  paperQuestions,
  type ExamResult,
} from "@/lib/exam-engine";
import { readExamResult, saveActiveExam } from "@/lib/exam-storage";
import { cn, formatDuration } from "@/lib/utils";

type ReviewFilter = "semua" | "benar" | "salah" | "kosong";

export default function ExamResultPage() {
  const router = useRouter();
  const toast = useToast();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReviewFilter>("semua");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setResult(readExamResult());
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const questions = useMemo(() => (result ? paperQuestions(result.paper) : []), [result]);

  function retryWrong() {
    if (!result) return;
    const paper = buildRetryPaper(result);
    if (!paper) {
      toast.info("Tidak ada soal yang perlu diulang.");
      return;
    }
    saveActiveExam({ paper, startedAt: new Date().toISOString() });
    router.push("/exams/session");
  }

  if (loading) return <PageSkeleton />;

  if (!result) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <Icon name="exam" size={28} className="mx-auto text-brand" />
        <h1 className="mt-3 font-display text-2xl text-ink">Belum ada hasil ujian</h1>
        <p className="mt-2 text-sm text-muted">Selesaikan sesi ujian terlebih dahulu. Hasil hanya tersimpan selama tab ini terbuka.</p>
        <LinkButton href="/exams" className="mt-5">Buka ujian</LinkButton>
      </Card>
    );
  }

  const incorrect = result.answered - result.correct;
  const filtered = questions.filter((item) => {
    if (filter === "semua") return true;
    const selected = result.answers[item.id];
    if (filter === "kosong") return selected === undefined;
    if (filter === "benar") return selected === item.question.answerIndex;
    return selected !== undefined && selected !== item.question.answerIndex;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/exams" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand">
            <Icon name="arrowLeft" size={14} /> Kembali ke ujian
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Hasil belajar</p>
          <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">{result.paper.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge tone="muted">{result.paper.level}</Badge>
            <Badge tone="brand">Skor belajar</Badge>
            <span className="text-xs text-muted">{new Date(result.finishedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={retryWrong}
            disabled={result.correct === result.totalQuestions}
            title={result.correct === result.totalQuestions ? "Semua soal sudah benar." : undefined}
          >
            <Icon name="rotate" size={15} /> Ulangi soal salah
          </Button>
          <LinkButton href="/exams">Ujian baru</LinkButton>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        Hasil ujian: skor belajar {result.score} persen, {result.correct} benar dari {result.totalQuestions} soal.
      </p>
      <Card className="overflow-hidden p-0">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center justify-center gap-2">
            <Ring value={result.score} size={148} stroke={12} label={`Skor belajar ${result.score} persen`}>
              <div className="text-center">
                <p className="font-display text-4xl text-ink">{result.score}%</p>
                <p className="text-[11px] uppercase tracking-wide text-muted">Skor belajar</p>
              </div>
            </Ring>
            <Badge tone={result.targetMet ? "matcha" : "brand"}>{result.targetMet ? "Target latihan tercapai" : "Belum mencapai target"}</Badge>
            <p className="text-center text-[11px] leading-relaxed text-muted">Target belajar {result.targetScore}%. Ini estimasi performa, bukan nilai resmi JLPT.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile label="Benar" value={String(result.correct)} hint={"dari " + result.totalQuestions + " soal"} icon="checkCircle" tone="matcha" />
            <StatTile label="Salah" value={String(incorrect)} hint="jawaban terisi" icon="xCircle" tone="brand" />
            <StatTile label="Kosong" value={String(result.unanswered)} hint="tidak dijawab" icon="alert" tone="gold" />
            <StatTile label="Akurasi" value={result.accuracy + "%"} hint="benar / terjawab" icon="target" tone="indigo" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line bg-surface-2/40 px-5 py-3 text-xs text-muted sm:px-6">
          <span><Icon name="clock" size={14} className="mr-1 inline" /> Waktu pengerjaan {formatDuration(result.durationSec)}</span>
          <span><Icon name="list" size={14} className="mr-1 inline" /> {result.answered} dijawab · {result.unanswered} kosong</span>
          <span><Icon name="target" size={14} className="mr-1 inline" /> Estimasi performa belajar</span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeading title="Performa per bagian" />
          <div className="space-y-4">
            {result.sections.map((section) => (
              <div key={section.id}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-ink">{section.label}</span>
                  <span className="text-muted">{section.correct}/{section.total} · {section.score}%</span>
                </div>
                <ProgressBar value={section.score} max={100} label={"Skor " + section.label} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionHeading title="Kategori" />
          <div className="space-y-3">
            {result.categoryStats.map((category) => (
              <div key={category.category}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-ink">{category.label}</span>
                  <span className={cn("text-muted", category.score < result.targetScore && "text-brand")}>{category.correct}/{category.total} · {category.score}%</span>
                </div>
                <ProgressBar value={category.score} max={100} barClassName={category.score < result.targetScore ? "bg-brand" : undefined} label={"Skor " + category.label} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeading title="Area yang perlu diperkuat" description={`Kategori dengan skor di bawah target belajar ${result.targetScore}%.`} />
        {result.weakAreas.length === 0 ? (
          <div className="flex items-center gap-2 rounded-2xl bg-matcha-soft p-4 text-sm text-ink"><Icon name="checkCircle" size={18} className="text-matcha" /> Semua kategori sudah mencapai target belajar. Pertahankan dengan latihan berkala.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {result.weakAreas.map((area) => (
              <div key={area.category} className="rounded-2xl border border-line p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{area.label}</p>
                  <Badge tone="brand">{area.score}%</Badge>
                </div>
                <p className="mt-1 text-xs text-muted">{area.correct} benar dari {area.total} soal. Buka rekomendasi materi di bawah lalu ulangi soal salah.</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionHeading title="Rekomendasi belajar" description="Materi yang terkait langsung dengan jawaban yang belum tepat." />
        <div className="grid gap-3 sm:grid-cols-2">
          {result.recommendations.map((recommendation) => (
            <Link
              key={recommendation.id}
              href={recommendation.href}
              className="group rounded-2xl border border-line p-4 transition hover:border-brand/40 hover:bg-brand-soft/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{recommendation.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{recommendation.description}</p>
                </div>
                <Icon name="arrowUpRight" size={16} className="mt-0.5 shrink-0 text-muted transition group-hover:text-brand" />
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeading title="Pembahasan semua soal" description="Pilih filter untuk meninjau jawaban, transkrip, dan penjelasan." />
          <div className="flex flex-wrap gap-1.5">
            {(["semua", "benar", "salah", "kosong"] as ReviewFilter[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
                className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold capitalize", filter === item ? "border-brand bg-brand text-white" : "border-line text-muted")}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon="checkCircle" title="Tidak ada soal pada filter ini" description="Coba filter lain untuk melihat pembahasan." />
        ) : (
          <div className="mt-4 space-y-4">
            {filtered.map((item) => {
              const originalIndex = questions.findIndex((entry) => entry.id === item.id);
              return (
                <ExamQuestionCard
                  key={item.id}
                  item={item}
                  number={originalIndex + 1}
                  total={questions.length}
                  selected={result.answers[item.id] ?? null}
                  onSelect={() => undefined}
                  checked
                />
              );
            })}
          </div>
        )}
      </Card>

      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" variant="secondary" onClick={retryWrong} disabled={result.correct === result.totalQuestions}>
          <Icon name="rotate" size={15} /> Ulangi soal salah
        </Button>
        <LinkButton href="/exams" variant="secondary">Ujian baru</LinkButton>
        <LinkButton href="/progress">Lihat statistik</LinkButton>
      </div>

      <p className="text-center text-[11px] leading-relaxed text-muted">
        Soal dibuat orisinal oleh Kotoba untuk latihan. Skor tidak menggantikan sertifikasi JLPT dan tidak boleh dianggap sebagai nilai resmi.
      </p>
    </div>
  );
}
