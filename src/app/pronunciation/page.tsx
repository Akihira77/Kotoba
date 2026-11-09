"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AudioControls } from "@/components/audio";
import { Icon } from "@/components/icons";
import { JpText } from "@/components/japanese";
import { PronunciationGuide } from "@/components/pronunciation-guide";
import { SpeechRecognitionPanel } from "@/components/speech-recognition-panel";
import { useProgress } from "@/components/providers/progress-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Badge, Button, Card, PageHeader, PageSkeleton, ProgressBar } from "@/components/ui";
import { PRONUNCIATION_DRILLS, type PronunciationDrill } from "@/content/pronunciation";
import { LEVEL_LABELS, XP_RULES } from "@/lib/constants";
import { JLPT_LEVELS, type JLPTLevel } from "@/lib/types";

const SELF_CHECK_ITEMS = [
  "Vokal panjang sudah ditahan cukup lama.",
  "Hentian sokuon (っ) dan bunyi rangkap terdengar jelas.",
  "Intonasi akhir kalimat tidak terburu-buru.",
];

function subscribeMediaSupport(): () => void {
  return () => {};
}

function getMediaSupport(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
}

function getServerMediaSupport(): boolean {
  return false;
}

type RecordStatus = "idle" | "requesting" | "recording" | "processing" | "ready" | "denied" | "error";

function Recorder({ drill }: { drill: PronunciationDrill }) {
  const mediaSupported = useSyncExternalStore(subscribeMediaSupport, getMediaSupport, getServerMediaSupport);
  const [status, setStatus] = useState<RecordStatus>("idle");
  const [message, setMessage] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const urlRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      const recorder = recorderRef.current;
      if (recorder) {
        recorder.onstop = null;
        if (recorder.state !== "inactive") {
          try {
            recorder.stop();
          } catch {
            /* ignore */
          }
        }
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [clearTimer]);

  async function startRecording() {
    setMessage("");
    setElapsed(0);
    if (!mediaSupported) {
      setStatus("error");
      setMessage("Browser ini belum mendukung perekaman audio. Gunakan Chrome, Edge, atau Safari versi terbaru.");
      return;
    }

    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined;
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        clearTimer();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        const nextUrl = URL.createObjectURL(blob);
        urlRef.current = nextUrl;
        setAudioUrl(nextUrl);
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setStatus("ready");
      };

      recorder.start();
      setStatus("recording");
      const startedAt = Date.now();
      timerRef.current = window.setInterval(() => {
        const next = Math.min(30, Math.floor((Date.now() - startedAt) / 1000));
        setElapsed(next);
        if (next >= 30) stopRecording();
      }, 250);
    } catch (error) {
      clearTimer();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      const name = error instanceof DOMException ? error.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setStatus("denied");
        setMessage("Izin mikrofon ditolak. Aktifkan izin mikrofon untuk situs ini melalui ikon di bilah alamat, lalu coba lagi.");
      } else if (name === "NotFoundError") {
        setStatus("error");
        setMessage("Mikrofon tidak ditemukan. Hubungkan mikrofon atau headset lalu coba lagi.");
      } else {
        setStatus("error");
        setMessage("Rekaman tidak dapat dimulai. Periksa perangkat audio dan izin browser.");
      }
    }
  }

  function stopRecording() {
    clearTimer();
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    setStatus("processing");
    recorder.stop();
  }

  function clearRecording() {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setAudioUrl(null);
    setElapsed(0);
    setStatus("idle");
    setMessage("");
  }

  const buttonLabel =
    status === "requesting"
      ? "Menunggu izin…"
      : status === "recording"
        ? "Hentikan rekaman"
        : status === "processing"
          ? "Menyiapkan audio…"
          : audioUrl
            ? "Rekam ulang"
            : "Mulai rekam";

  return (
    <div className="rounded-2xl border border-line bg-surface-2/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold"><Icon name="pronunciation" size={16} className="text-brand" /> Rekam suaramu</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            Mikrofon hanya aktif setelah kamu menekan tombol. Rekaman tetap di perangkat ini, tidak diunggah, dan
            berhenti otomatis setelah 30 detik.
          </p>
        </div>
        <span role="status" aria-live="polite">
          <Badge tone={status === "recording" ? "brand" : "muted"}>
            {status === "recording" ? "Merekam…" : audioUrl ? "Rekaman siap" : "Siap merekam"}
          </Badge>
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {status !== "recording" ? (
          <Button
            size="sm"
            variant={audioUrl ? "secondary" : "primary"}
            onClick={() => void startRecording()}
            disabled={status === "requesting" || status === "processing" || !mediaSupported}
          >
            <Icon name="pronunciation" size={15} /> {buttonLabel}
          </Button>
        ) : (
          <Button size="sm" variant="danger" onClick={stopRecording}>
            <Icon name="pause" size={15} /> {buttonLabel}
          </Button>
        )}
        {audioUrl ? (
          <Button size="sm" variant="ghost" onClick={clearRecording}>
            <Icon name="trash" size={14} /> Hapus rekaman
          </Button>
        ) : null}
        {!mediaSupported ? (
          <span className="text-xs text-muted">Perekaman memerlukan browser modern dan koneksi aman (HTTPS atau localhost).</span>
        ) : null}
      </div>

      {(status === "recording" || status === "processing") && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Durasi rekaman</span>
            <span className="tnum font-semibold text-ink">{elapsed} / 30 detik</span>
          </div>
          <ProgressBar value={elapsed} max={30} className="mt-1.5" label="Durasi rekaman" />
          <p className="mt-1 text-[11px] text-muted">Rekaman berhenti otomatis pada detik ke-30.</p>
        </div>
      )}

      {audioUrl ? (
        <div className="mt-3">
          <audio controls src={audioUrl} className="h-10 w-full" aria-label={"Hasil rekaman latihan " + drill.id} />
          <p className="mt-1 text-xs text-muted">Putar contoh sekali lagi, lalu putar rekaman ini dan bandingkan iramanya.</p>
        </div>
      ) : null}

      {message ? (
        <p role="alert" className="mt-3 rounded-xl bg-brand-soft px-3 py-2 text-xs leading-relaxed text-brand-strong dark:bg-brand/10 dark:text-brand">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function DrillDetail({ drill, practiced, marking, onPractice }: { drill: PronunciationDrill; practiced: boolean; marking: boolean; onPractice: () => void }) {
  const [checked, setChecked] = useState<boolean[]>(() => SELF_CHECK_ITEMS.map(() => false));
  const checkedCount = checked.filter(Boolean).length;

  function toggleCheck(index: number) {
    setChecked((current) => current.map((value, itemIndex) => (itemIndex === index ? !value : value)));
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="border-b border-line bg-gradient-to-br from-brand-soft/70 to-transparent px-5 py-5 dark:from-brand/10">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="brand">{drill.level}</Badge>
            <Badge tone="gold">{drill.focus}</Badge>
            {practiced ? <Badge tone="matcha"><Icon name="check" size={12} /> Sudah dilatih</Badge> : null}
          </div>
          <JpText text={drill.jp} as="p" className="mt-3 text-2xl font-bold leading-relaxed sm:text-3xl" />
          <p className="mt-1 font-jp text-base text-muted">{drill.reading}</p>
          <p className="text-sm italic text-muted">{drill.romaji}</p>
          <p className="mt-2 text-sm font-medium">{drill.meaning}</p>
        </div>

        <div className="px-5 py-4">
          <AudioControls
            tracks={[
              {
                id: "pronunciation-" + drill.id,
                text: drill.jp,
                speech: drill.reading,
                reading: drill.reading,
                label: "Kalimat latihan",
                context: drill.meaning,
              },
            ]}
            label="Pemutar contoh pelafalan"
          />
        </div>
      </Card>

      <Card className="p-5">
        <p className="flex items-center gap-2 text-sm font-bold"><Icon name="lightbulb" size={16} className="text-gold" /> Kunci pelafalan</p>
        <p className="mt-2 text-sm leading-relaxed">{drill.tip}</p>
        <p className="mt-3 rounded-xl bg-surface-2 p-3 text-xs leading-relaxed text-muted">
          Fokus latihan: <span className="font-semibold text-ink">{drill.focus}</span>. Pelafalan Jepang tidak memakai tekanan kata seperti bahasa Indonesia; panjang pendek bunyi lebih menentukan.
        </p>
      </Card>

      <Card className="p-5">
        <Recorder key={drill.id} drill={drill} />
      </Card>

      <SpeechRecognitionPanel key={"recognize-" + drill.id} candidates={[drill.jp, drill.reading]} displayText={drill.jp} />

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold">Cek mandiri</p>
          <span className="text-xs text-muted tnum">{checkedCount}/{SELF_CHECK_ITEMS.length} poin</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted">Ini bukan penilaian otomatis. Dengarkan rekamanmu dan tandai hal yang sudah terdengar jelas.</p>
        <div className="mt-3 space-y-2">
          {SELF_CHECK_ITEMS.map((item, index) => (
            <label key={item} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-3 py-2.5 text-sm hover:bg-surface-2">
              <input
                type="checkbox"
                checked={checked[index]}
                onChange={() => toggleCheck(index)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand)]"
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-xs text-muted">Latihan pertama tiap kalimat memberi {XP_RULES.lesson.pronunciation} XP.</p>
          {practiced ? (
            <Badge tone="matcha"><Icon name="checkCircle" size={13} /> Tercatat di progres</Badge>
          ) : (
            <Button size="sm" onClick={onPractice} disabled={marking}>
              <Icon name="check" size={15} /> Tandai sudah dilatih
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function PronunciationPage() {
  const { snapshot, loading, recordLesson } = useProgress();
  const toast = useToast();
  const [level, setLevel] = useState<JLPTLevel | "semua">("semua");
  const [selectedId, setSelectedId] = useState<string>(PRONUNCIATION_DRILLS[0]?.id ?? "");
  const [marking, setMarking] = useState(false);

  const filtered = level === "semua" ? PRONUNCIATION_DRILLS : PRONUNCIATION_DRILLS.filter((drill) => drill.level === level);
  const selected = filtered.find((drill) => drill.id === selectedId) ?? filtered[0];
  const practicedIds = new Set(
    snapshot.lessons
      .filter((lesson) => lesson.kind === "pronunciation")
      .map((lesson) => lesson.lessonId.replace(/^pronunciation-/, "")),
  );
  const practicedCount = PRONUNCIATION_DRILLS.filter((drill) => practicedIds.has(drill.id)).length;
  const percent = Math.round((practicedCount / PRONUNCIATION_DRILLS.length) * 100);

  async function markPracticed() {
    if (!selected) return;
    setMarking(true);
    try {
      await recordLesson({ lessonId: "pronunciation-" + selected.id, kind: "pronunciation", score: null, xp: 0 });
      toast.success("Latihan pelafalan dicatat. Bagus, terus ulangi dengan tempo berbeda.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan latihan. Coba lagi saat server tersedia.");
    } finally {
      setMarking(false);
    }
  }

  if (loading && snapshot.lessons.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Latihan berbicara"
        title="Pelafalan"
        titleJp="発音"
        icon="pronunciation"
        description="Dengarkan kalimat contoh, rekam suaramu, lalu bandingkan. Panduan bunyi dan pengenalan suara membantu latihan — keduanya bukan penilaian akustik."
      />

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <Badge tone="matcha"><Icon name="pronunciation" size={12} /> Latihan mandiri</Badge>
            <h2 className="mt-2 text-lg font-bold">Dengar, tirukan, rekam, bandingkan.</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Rekaman mikrofon tetap di perangkat ini dan tidak diunggah ke server Kotoba. Pengenalan suara opsional
              memakai layanan browser dan dapat mengirim audio ke vendor browser; Kotoba tidak menyimpan rekaman
              tersebut. Tidak ada skor akustik otomatis.
            </p>
            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Kalimat yang sudah ditandai</span>
                <span className="tnum font-semibold text-ink">{practicedCount}/{PRONUNCIATION_DRILLS.length}</span>
              </div>
              <ProgressBar value={practicedCount} max={PRONUNCIATION_DRILLS.length} className="mt-1.5" label="Progres latihan pelafalan" />
            </div>
          </div>
          <div className="shrink-0 text-center">
            <p className="text-4xl font-bold tnum">{percent}<span className="text-lg text-muted">%</span></p>
            <p className="text-xs text-muted">latihan tercatat</p>
          </div>
        </div>
      </Card>

      <PronunciationGuide />

      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label="Filter level pelafalan">
        {(["semua", ...JLPT_LEVELS] as const).map((item) => {
          const isActive = level === item;
          const count = item === "semua" ? PRONUNCIATION_DRILLS.length : PRONUNCIATION_DRILLS.filter((drill) => drill.level === item).length;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setLevel(item)}
              aria-pressed={isActive}
              className={
                "shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand " +
                (isActive ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:bg-surface-2")
              }
            >
              {item === "semua" ? "Semua" : LEVEL_LABELS[item]}
              <span className={"ml-1.5 text-[10px] " + (isActive ? "text-white/80" : "text-muted")}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(260px,340px)_1fr]">
        <Card className="overflow-hidden lg:sticky lg:top-20">
          <div className="border-b border-line px-4 py-3">
            <p className="text-sm font-bold">Pilih kalimat</p>
            <p className="text-xs text-muted">{filtered.length} latihan pada filter ini</p>
          </div>
          <ul className="max-h-[65vh] divide-y divide-line overflow-y-auto">
            {filtered.map((drill) => {
              const isSelected = selected?.id === drill.id;
              const done = practicedIds.has(drill.id);
              return (
                <li key={drill.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(drill.id)}
                    aria-pressed={isSelected}
                    className={
                      "w-full px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-brand " +
                      (isSelected ? "bg-brand-soft dark:bg-brand/15" : "hover:bg-surface-2")
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-jp text-lg font-semibold leading-snug">{drill.jp}</p>
                      {done ? <Icon name="checkCircle" size={16} className="mt-1 shrink-0 text-matcha" /> : null}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{drill.meaning}</p>
                    <p className="mt-1 text-[11px] font-medium text-brand">{drill.level} · {drill.focus}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {selected ? (
          <DrillDetail
            key={selected.id}
            drill={selected}
            practiced={practicedIds.has(selected.id)}
            marking={marking}
            onPractice={() => void markPracticed()}
          />
        ) : (
          <Card className="p-8 text-center">
            <p className="font-semibold">Belum ada kalimat pada level ini.</p>
            <p className="mt-1 text-sm text-muted">Pilih level lain.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
