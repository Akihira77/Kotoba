"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { useProgress } from "@/components/providers/progress-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Badge, Button, Card, EmptyState, PageHeader, ProgressBar, Ring, SectionHeading, StatTile } from "@/components/ui";
import {
  buildTypingSession,
  checkTypingAnswer,
  TYPING_MODES,
  typingAccuracy,
  type TypingChallenge,
  type TypingMode,
} from "@/lib/typing";
import { cn } from "@/lib/utils";

interface Attempt {
  challenge: TypingChallenge;
  input: string;
  correct: boolean;
}

const COUNT_OPTIONS = [5, 10, 15];

export default function TypingPage() {
  const { recordLesson, recordSession, snapshot } = useProgress();
  const toast = useToast();
  const [mode, setMode] = useState<TypingMode>("kana-romaji");
  const [count, setCount] = useState(10);
  const [challenges, setChallenges] = useState<TypingChallenge[] | null>(null);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"ready" | "correct" | "wrong">("ready");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [finished, setFinished] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const modeInfo = TYPING_MODES.find((item) => item.id === mode) ?? TYPING_MODES[0];
  const challenge = challenges?.[index] ?? null;
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const answered = attempts.length;
  const accuracy = typingAccuracy(correct, answered);

  const typingLessons = useMemo(
    () => snapshot.lessons.filter((lesson) => lesson.kind === "typing"),
    [snapshot.lessons],
  );
  const bestScore = useMemo(
    () => typingLessons.reduce((best, lesson) => Math.max(best, lesson.score ?? 0), 0),
    [typingLessons],
  );

  useEffect(() => {
    if (!startedAt || finished) return;
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, finished]);

  function start() {
    const session = buildTypingSession({ mode, count, seed: Date.now() % 100000 });
    if (session.length === 0) {
      toast.info("Belum ada soal untuk mode ini. Coba pilih mode lain.");
      return;
    }
    setChallenges(session);
    setIndex(0);
    setInput("");
    setStatus("ready");
    setAttempts([]);
    setFinished(false);
    setElapsed(0);
    setStartedAt(Date.now());
  }

  function submit() {
    if (!challenge || status !== "ready") return;
    const isCorrect = checkTypingAnswer(challenge.mode, input, challenge.answer);
    setStatus(isCorrect ? "correct" : "wrong");
    setAttempts((current) => [...current, { challenge, input, correct: isCorrect }]);
  }

  async function finish(nextAttempts: Attempt[], nextElapsed: number) {
    const finalCorrect = nextAttempts.filter((attempt) => attempt.correct).length;
    const finalAccuracy = typingAccuracy(finalCorrect, nextAttempts.length);
    setFinished(true);
    setStartedAt(null);
    try {
      await recordLesson({
        lessonId: "typing-" + mode,
        kind: "typing",
        score: finalAccuracy,
        xp: 0,
      });
      await recordSession({
        xp: finalCorrect * 3,
        minutes: Math.max(1, Math.round(nextElapsed / 60)),
        source: "typing",
      });
    } catch {
      toast.info("Hasil latihan tampil, tetapi progres belum tersimpan. Coba lagi saat koneksi pulih.");
    }
  }

  function next() {
    if (!challenges) return;
    if (index + 1 >= challenges.length) {
      void finish(attempts, elapsed);
      return;
    }
    setIndex((value) => value + 1);
    setInput("");
    setStatus("ready");
  }

  function reset() {
    setChallenges(null);
    setIndex(0);
    setInput("");
    setStatus("ready");
    setAttempts([]);
    setFinished(false);
    setStartedAt(null);
    setElapsed(0);
  }

  if (!challenges) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Latihan mengetik · タイピング"
          title="Mengetik Jepang"
          titleJp="日本語入力"
          icon="keyboard"
          description="Latih kecepatan membaca kana dan ketepatan mengetik Jepang. Tiga mode terpisah agar latihan tetap fokus."
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_310px]">
          <Card className="p-5 sm:p-6">
            <SectionHeading title="Pilih mode" icon="keyboard" description="Mulai dari membaca kana, lalu naik ke input dengan IME." />
            <div className="space-y-3">
              {TYPING_MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={mode === item.id}
                  onClick={() => setMode(item.id)}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition",
                    mode === item.id
                      ? "border-brand bg-brand-soft/30 shadow-soft"
                      : "border-line bg-surface-2/60 hover:border-brand/40",
                  )}
                >
                  <span className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", mode === item.id ? "bg-brand text-white" : "bg-surface text-muted")}>
                    <Icon name={item.needsIme ? "keyboard" : "kana"} size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{item.label}</span>
                      {item.needsIme ? <Badge tone="indigo">IME</Badge> : <Badge tone="matcha">tanpa IME</Badge>}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">{item.description}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Jumlah soal</p>
              <div className="mt-2 flex gap-2">
                {COUNT_OPTIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={count === value}
                    onClick={() => setCount(value)}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                      count === value ? "border-brand bg-brand text-white" : "border-line text-muted hover:text-ink",
                    )}
                  >
                    {value} soal
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">Jumlah dapat lebih sedikit bila kumpulan soal untuk filter ini terbatas.</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button onClick={start}>
                <Icon name="play" size={16} />
                Mulai latihan
              </Button>
              <span className="text-xs text-muted">± {Math.max(1, Math.round(count * (mode === "kana-romaji" ? 0.3 : 0.45)))} menit</span>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Icon name="info" size={17} className="text-brand" />
                Tentang IME
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Mode <span className="font-semibold text-ink">Romaji → Kana</span> dan <span className="font-semibold text-ink">Arti → Kanji</span> memerlukan IME Jepang aktif di perangkat. Di ponsel, tambahkan keyboard Jepang melalui pengaturan bahasa.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Kotoba tidak mengirim ketikanmu ke server. Pemeriksaan jawaban dilakukan langsung di peramban.
              </p>
            </Card>

            <Card className="p-5">
              <SectionHeading title="Rekap mengetik" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <StatTile label="Mode tercatat" value={typingLessons.length} hint="di server lokal" icon="keyboard" />
                <StatTile label="Akurasi terbaik" value={bestScore + "%"} hint="per sesi" icon="target" tone="matcha" />
              </div>
              <p className="mt-3 text-xs text-muted">Selesaikan satu sesi untuk mencatat skor. Latihan ulang tetap tersimpan sebagai riwayat belajar.</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Sesi selesai · おつかれさま"
          title="Latihan mengetik selesai"
          titleJp="タイピング練習"
          icon="keyboard"
          description={"Mode " + modeInfo.label + " · " + challenges.length + " soal"}
          actions={<Button variant="secondary" onClick={reset}><Icon name="rotate" size={16} />Latihan lagi</Button>}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="p-6">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
              <Ring value={accuracy} size={142} label={"Akurasi " + accuracy + "%"}>
                <div className="text-center">
                  <div className="text-3xl font-bold">{accuracy}%</div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">akurasi</div>
                </div>
              </Ring>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold">{correct} dari {challenges.length} tepat</h2>
                <p className="mt-1 text-sm text-muted">
                  Waktu {Math.floor(elapsed / 60)} menit {elapsed % 60} detik. Setiap jawaban yang tepat memberi XP, dan penyelesaian pertama mode ini memberi bonus pelajaran.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge tone="matcha">{correct} benar</Badge>
                  <Badge tone="brand">{challenges.length - correct} perlu diulang</Badge>
                  <Badge tone="muted">{modeInfo.label}</Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeading title="Rincian" />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted">Mode</dt><dd className="font-semibold">{modeInfo.label}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Soal</dt><dd className="font-semibold">{challenges.length}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Benar</dt><dd className="font-semibold">{correct}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Akurasi</dt><dd className="font-semibold">{accuracy}%</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Waktu</dt><dd className="font-semibold">{Math.floor(elapsed / 60)}m {elapsed % 60}s</dd></div>
            </dl>
          </Card>
        </div>

        <Card className="p-5">
          <SectionHeading title="Tinjau jawaban" description="Bandingkan ketikanmu dengan jawaban yang benar." />
          {attempts.length === 0 ? (
            <EmptyState title="Tidak ada jawaban" description="Sesi ini berakhir sebelum ada jawaban yang dikirim." action={<Button onClick={reset}>Mulai lagi</Button>} />
          ) : (
            <ol className="divide-y divide-line">
              {attempts.map((attempt, position) => (
                <li key={attempt.challenge.id + "-" + position} className="flex flex-wrap items-start gap-3 py-3">
                  <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", attempt.correct ? "bg-matcha-soft text-matcha" : "bg-brand-soft text-brand")}>
                    <Icon name={attempt.correct ? "check" : "x"} size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-jp text-base font-semibold">{attempt.challenge.prompt}</p>
                    <p className="mt-0.5 text-xs text-muted">Jawabanmu: <span className="font-jp text-ink">{attempt.input || "—"}</span> · Jawaban: <span className="font-jp text-ink">{attempt.challenge.answer}</span></p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    );
  }

  if (!challenge) {
    return <EmptyState title="Soal tidak tersedia" description="Coba mulai sesi baru dengan mode lain." action={<Button onClick={reset}>Kembali</Button>} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Latihan mengetik · タイピング"
        title={modeInfo.label}
        titleJp="日本語入力"
        icon="keyboard"
        description={modeInfo.description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{index + 1} / {challenges.length}</Badge>
            <Badge tone="muted"><Icon name="clock" size={13} /> {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</Badge>
            <Badge tone="matcha">{accuracy}%</Badge>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-4 sm:px-6">
            <ProgressBar value={answered} max={challenges.length} label="Kemajuan sesi" />
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>{answered} dijawab</span>
              <span>{correct} benar</span>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="rounded-3xl bg-surface-2 px-5 py-8 text-center sm:py-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{challenge.promptSubtitle}</p>
              <p className={cn("mt-4 break-words font-bold leading-tight", challenge.mode === "kana-romaji" ? "font-jp text-6xl sm:text-7xl" : challenge.mode === "romaji-kana" ? "text-4xl font-mono sm:text-5xl" : "font-jp text-4xl sm:text-5xl")}>
                {challenge.prompt}
              </p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">{challenge.hint}</p>
            </div>

            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault();
                if (status === "ready") submit();
                else next();
              }}
            >
              <label htmlFor="typing-answer" className="text-xs font-semibold uppercase tracking-wide text-muted">Jawabanmu</label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  id="typing-answer"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={status !== "ready"}
                  autoFocus
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  lang={challenge.mode === "kana-romaji" ? "en" : "ja"}
                  placeholder={challenge.mode === "kana-romaji" ? "contoh: shi" : "Ketik dengan IME Jepang"}
                  className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-lg font-semibold outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-70 font-jp"
                />
                <Button type="submit" disabled={status === "ready" && input.trim().length === 0} className="shrink-0">
                  {status === "ready" ? <><Icon name="check" size={16} />Periksa</> : <>Lanjut<Icon name="arrowRight" size={16} /></>}
                </Button>
              </div>
            </form>

            {status !== "ready" ? (
              <div className={cn("mt-4 rounded-2xl border p-4", status === "correct" ? "border-matcha/30 bg-matcha-soft/50" : "border-brand/30 bg-brand-soft/40")}>
                <div className="flex items-center gap-2 font-semibold">
                  <Icon name={status === "correct" ? "checkCircle" : "xCircle"} size={18} className={status === "correct" ? "text-matcha" : "text-brand"} />
                  {status === "correct" ? "Tepat." : "Belum tepat."}
                </div>
                <p className="mt-1 text-sm text-muted">
                  Jawaban yang benar: <span className="font-jp font-semibold text-ink">{challenge.answer}</span>
                  {status === "wrong" ? " · Ketikanmu: " : ""}
                  {status === "wrong" ? <span className="font-jp font-semibold text-ink">{input || "—"}</span> : null}
                </p>
              </div>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <SectionHeading title="Sesi ini" />
            <div className="grid grid-cols-2 gap-3">
              <StatTile label="Benar" value={correct} hint={"dari " + answered} icon="checkCircle" tone="matcha" />
              <StatTile label="Salah" value={attempts.length - correct} hint="jawaban" icon="xCircle" />
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted"><span>Kemajuan</span><span>{answered}/{challenges.length}</span></div>
              <ProgressBar value={answered} max={challenges.length} label="Kemajuan sesi" />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><Icon name="lightbulb" size={17} className="text-brand" /> Latihan yang efektif</div>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
              <li>Baca prompt dengan suara, lalu ketik tanpa melihat papan tombol.</li>
              <li>Jika salah, baca jawaban benar dengan lantang sebelum lanjut.</li>
              <li>Ulangi mode yang sama besok; kecepatan mengikuti kebiasaan.</li>
            </ul>
          </Card>

          <Button variant="ghost" className="w-full" onClick={reset}><Icon name="arrowLeft" size={16} />Ganti mode</Button>
        </div>
      </div>
    </div>
  );
}
