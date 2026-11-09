"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExamQuestionCard } from "@/components/exam-question-card";
import { useProgress } from "@/components/providers/progress-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Badge, Button, Card, Modal, PageSkeleton, ProgressBar } from "@/components/ui";
import { Icon } from "@/components/icons";
import {
  gradeExam,
  isAnswered,
  paperQuestions,
  toExamPayload,
} from "@/lib/exam-engine";
import {
  clearActiveExam,
  readActiveExam,
  saveExamResult,
  type ActiveExam,
} from "@/lib/exam-storage";
import { cn, formatClock } from "@/lib/utils";

type ConfirmKind = "submit" | "leave" | null;

export default function ExamSessionPage() {
  const router = useRouter();
  const toast = useToast();
  const { recordExam } = useProgress();
  const [active, setActive] = useState<ActiveExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = readActiveExam();
      setActive(stored);
      if (stored) {
        const elapsed = Math.max(0, Math.round((Date.now() - new Date(stored.startedAt).getTime()) / 1000));
        setSecondsLeft(stored.paper.timed ? Math.max(0, stored.paper.minutes * 60 - elapsed) : null);
      }
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const paper = active?.paper ?? null;
  const questions = useMemo(() => (paper ? paperQuestions(paper) : []), [paper]);
  const current = questions[index];
  const answeredCount = paper ? questions.filter((item) => isAnswered(answers, item.id)).length : 0;
  const currentChecked = current ? checked.has(current.id) : false;
  const immediate = Boolean(paper?.immediateFeedback);

  const finish = useCallback(async () => {
    if (!active || submittedRef.current) return;
    submittedRef.current = true;
    const result = gradeExam(active.paper, answers, active.startedAt);
    saveExamResult(result);
    clearActiveExam();
    try {
      await recordExam(toExamPayload(result));
    } catch {
      toast.error("Hasil tampil, tetapi gagal disimpan ke progres lokal.");
    }
    router.push("/exams/result");
  }, [active, answers, recordExam, router, toast]);

  const timerActive = Boolean(paper?.timed) && secondsLeft !== null && secondsLeft > 0;

  useEffect(() => {
    if (!timerActive) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => (value === null ? null : Math.max(0, value - 1)));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerActive]);

  useEffect(() => {
    if (secondsLeft !== 0 || !paper?.timed || submittedRef.current) return;
    toast.info("Waktu habis. Jawaban dikumpulkan otomatis.");
    void finish();
  }, [finish, paper?.timed, secondsLeft, toast]);

  useEffect(() => {
    if (!active || submittedRef.current) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [active]);

  function choose(optionIndex: number) {
    if (!current || currentChecked) return;
    setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }));
  }

  function checkCurrent() {
    if (!current) return;
    if (!isAnswered(answers, current.id)) {
      toast.info("Pilih satu jawaban terlebih dahulu.");
      return;
    }
    setChecked((prev) => new Set(prev).add(current.id));
  }

  function toggleMark() {
    if (!current) return;
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  }

  function leave() {
    clearActiveExam();
    router.push("/exams");
  }

  if (loading) {
    return <PageSkeleton />;
  }

  if (!active || !paper || !current) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <Icon name="exam" size={28} className="mx-auto text-brand" />
        <h1 className="mt-3 font-display text-2xl text-ink">Tidak ada ujian aktif</h1>
        <p className="mt-2 text-sm text-muted">Pilih mode dan level di halaman ujian untuk memulai sesi baru.</p>
        <Link href="/exams" className="mt-5 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white">Kembali ke ujian</Link>
      </Card>
    );
  }

  const total = questions.length;
  const percentAnswered = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  const urgent = secondsLeft !== null && secondsLeft <= 60;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <button type="button" onClick={() => setConfirm("leave")} className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand">
            <Icon name="arrowLeft" size={14} /> Keluar sesi
          </button>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">{paper.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge tone="brand">{paper.level}</Badge>
            <Badge tone="muted">{paper.mode === "mock" ? "Simulasi" : paper.mode === "random" ? "Acak" : paper.mode === "topic" ? "Topik" : "Latihan"}</Badge>
            <span className="text-xs text-muted">{total} soal</span>
          </div>
        </div>
        {paper.timed && secondsLeft !== null ? (
          <div className={cn("rounded-2xl border px-4 py-2 text-right", urgent ? "border-brand bg-brand-soft" : "border-line bg-surface")}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Sisa waktu</p>
            <p className={cn("font-mono text-xl font-bold", urgent ? "text-brand" : "text-ink")}>{formatClock(secondsLeft)}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-surface px-4 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Mode</p>
            <p className="text-sm font-semibold text-ink">Tanpa batas waktu</p>
          </div>
        )}
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <span>{answeredCount} dari {total} soal dijawab</span>
          <span>{immediate ? "Periksa tiap soal untuk pembahasan" : "Pembahasan terbuka setelah dikumpulkan"}</span>
        </div>
        <ProgressBar value={percentAnswered} max={100} className="mt-2" label="Soal dijawab" />
      </Card>

      <p className="sr-only" aria-live="polite">
        Soal {index + 1} dari {total}. {isAnswered(answers, current.id) ? "Sudah dijawab." : "Belum dijawab."}
      </p>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <ExamQuestionCard
            item={current}
            number={index + 1}
            total={total}
            selected={answers[current.id] ?? null}
            onSelect={choose}
            checked={immediate ? currentChecked : false}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>
              <Icon name="chevronLeft" size={15} /> Sebelumnya
            </Button>
            {immediate ? (
              <Button type="button" onClick={checkCurrent} disabled={currentChecked || !isAnswered(answers, current.id)}>
                <Icon name="check" size={15} /> {currentChecked ? "Sudah diperiksa" : "Periksa jawaban"}
              </Button>
            ) : (
              <span className="inline-flex h-11 items-center gap-1.5 rounded-full bg-surface-2 px-4 text-xs text-muted">
                <Icon name="checkCircle" size={14} /> Jawaban tersimpan saat dipilih
              </span>
            )}
            {index < total - 1 ? (
              <Button type="button" variant="secondary" onClick={() => setIndex((value) => Math.min(total - 1, value + 1))}>
                Berikutnya <Icon name="chevronRight" size={15} />
              </Button>
            ) : (
              <Button type="button" onClick={() => setConfirm("submit")}>Kumpulkan <Icon name="arrowRight" size={15} /></Button>
            )}
            <Button type="button" variant="ghost" onClick={toggleMark} aria-pressed={marked.has(current.id)}>
              <Icon name="flag" size={15} /> {marked.has(current.id) ? "Ditandai" : "Tandai"}
            </Button>
          </div>
        </div>

        <aside className="space-y-3">
          <Card className="p-4">
            <p className="text-sm font-semibold text-ink">Navigasi soal</p>
            <div className="mt-3 space-y-3">
              {paper.sections.map((section) => (
                <div key={section.id}>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{section.label} · {section.questions.length}</p>
                  <div className="grid grid-cols-6 gap-1.5">
                    {section.questions.map((item) => {
                      const itemIndex = questions.findIndex((entry) => entry.id === item.id);
                      const answered = isAnswered(answers, item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setIndex(itemIndex)}
                          aria-current={itemIndex === index ? "step" : undefined}
                          aria-label={
                            "Soal " + (itemIndex + 1) + ": " + (answered ? "sudah dijawab" : "belum dijawab") + (marked.has(item.id) ? ", ditandai" : "")
                          }
                          title={"Soal " + (itemIndex + 1)}
                          className={cn(
                            "relative flex h-9 w-9 items-center justify-center rounded-lg border text-[11px] font-semibold transition",
                            itemIndex === index ? "border-brand bg-brand text-white" : answered ? "border-brand/30 bg-brand-soft text-brand-strong" : "border-line bg-surface-2 text-muted",
                          )}
                        >
                          {itemIndex + 1}
                          {marked.has(item.id) ? <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gold" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4 text-xs leading-relaxed text-muted">
            <p className="mb-1 flex items-center gap-1 font-semibold text-ink"><Icon name="flag" size={13} /> Tanda kuning</p>
            Tandai soal yang ingin ditinjau sebelum mengumpulkan. Penanda tidak memengaruhi skor.
          </Card>
          <Button type="button" className="w-full" onClick={() => setConfirm("submit")}>
            <Icon name="exam" size={16} /> Kumpulkan jawaban
          </Button>
        </aside>
      </div>

      <Modal
        open={confirm === "submit"}
        onClose={() => setConfirm(null)}
        title="Kumpulkan jawaban?"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setConfirm(null)}>Kembali</Button>
            <Button type="button" onClick={() => void finish()}>Ya, kumpulkan</Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-ink">
          {answeredCount} dari {total} soal sudah dijawab, {total - answeredCount} soal masih kosong. Setelah dikumpulkan, jawaban tidak dapat diubah dan pembahasan akan tersedia.
        </p>
      </Modal>

      <Modal
        open={confirm === "leave"}
        onClose={() => setConfirm(null)}
        title="Keluar dari sesi?"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setConfirm(null)}>Lanjut ujian</Button>
            <Button type="button" variant="danger" onClick={leave}>Keluar</Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-ink">Jawaban pada sesi ini belum dikumpulkan. Keluar akan menghapus sesi aktif dan progres jawaban sementara.</p>
      </Modal>
    </div>
  );
}
