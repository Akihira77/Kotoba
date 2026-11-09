"use client";

import { useMemo } from "react";
import { compareSpeechTranscript, type SpeechComparison } from "@/lib/speech-recognition";
import { useSpeechRecognition } from "@/lib/use-speech-recognition";
import { Badge, Button, Card } from "@/components/ui";

interface SpeechRecognitionPanelProps {
  /** Accepted expressions, usually the target sentence and its kana reading. */
  candidates: string[];
  /** Japanese text shown to the learner. */
  displayText: string;
}

const VERDICT_COPY: Record<
  SpeechComparison["verdict"],
  { label: string; tone: "matcha" | "gold" | "muted"; detail: string }
> = {
  match: {
    label: "Cocok",
    tone: "matcha",
    detail: "Teks yang dikenali browser sama dengan contoh.",
  },
  close: {
    label: "Hampir cocok",
    tone: "gold",
    detail: "Teks hampir sama. Periksa bagian yang berbeda, lalu ulangi bila perlu.",
  },
  different: {
    label: "Belum cocok",
    tone: "muted",
    detail: "Teks yang dikenali berbeda. Dengarkan contoh lagi dan coba ucapkan lebih jelas.",
  },
};

function statusCopy(status: ReturnType<typeof useSpeechRecognition>["status"]): string {
  switch (status) {
    case "starting":
      return "Menyiapkan mikrofon…";
    case "listening":
      return "Mendengarkan… ucapkan kalimat Jepang.";
    case "processing":
      return "Memproses hasil pengenalan…";
    case "done":
      return "Pengenalan selesai.";
    case "denied":
      return "Izin mikrofon ditolak.";
    case "error":
      return "Pengenalan suara tidak berhasil.";
    case "unsupported":
      return "Pengenalan suara tidak tersedia.";
    case "idle":
    default:
      return "Belum dimulai.";
  }
}

export function SpeechRecognitionPanel({ candidates, displayText }: SpeechRecognitionPanelProps) {
  const recognition = useSpeechRecognition();
  const comparison = useMemo(
    () => compareSpeechTranscript(candidates, recognition.transcript),
    [candidates, recognition.transcript],
  );
  const hasTranscript = Boolean(recognition.transcript.trim());
  const copy = VERDICT_COPY[comparison.verdict];
  const status = statusCopy(recognition.status);

  return (
    <Card className="space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Cek ucapan</p>
          <h3 className="mt-1 text-lg font-semibold text-ink">Bandingkan dengan pengenalan suara</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Ucapkan <span className="font-jp font-semibold text-ink">{displayText}</span> setelah menekan tombol.
            Browser akan mengubah suara menjadi teks, lalu Kotoba membandingkan teksnya.
          </p>
        </div>
        <Badge tone="muted">Opsional</Badge>
      </div>

      <div className="rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm text-muted">
        <p className="font-medium text-ink">Sebelum mulai</p>
        <p className="mt-1 leading-relaxed">
          Fitur ini memakai pengenalan suara bawaan browser, bukan penilaian akustik. Sebagian browser dapat
          mengirim audio ke layanan vendornya; Kotoba tidak mengunggah atau menyimpan rekaman dari fitur ini.
          Mikrofon hanya aktif setelah kamu menekan tombol.
        </p>
      </div>

      {!recognition.supported ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface-2 px-4 py-3 text-sm text-muted">
          Browser ini tidak menyediakan Web Speech Recognition. Gunakan panel rekam suara di atas untuk
          membandingkan pelafalan secara manual — latihan tetap bisa dilakukan.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {recognition.listening ? (
              <Button type="button" variant="secondary" onClick={recognition.stop}>
                Hentikan pengenalan
              </Button>
            ) : (
              <Button
                type="button"
                onClick={recognition.start}
                disabled={recognition.status === "starting" || recognition.status === "processing"}
              >
                {recognition.status === "idle" ? "Mulai pengenalan suara" : "Coba lagi"}
              </Button>
            )}
            {hasTranscript && (
              <Button type="button" variant="ghost" onClick={recognition.reset}>
                Hapus hasil
              </Button>
            )}
            <p className="text-sm text-muted" role="status" aria-live="polite">
              {status}
            </p>
          </div>

          {recognition.error && (
            <p className="rounded-2xl border border-brand/20 bg-brand-soft px-4 py-3 text-sm text-brand-strong">
              {recognition.error}
            </p>
          )}

          {hasTranscript && (
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
              <div className="rounded-2xl border border-line bg-surface px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Yang terdengar browser</p>
                <p className="mt-2 font-jp text-xl leading-relaxed text-ink">{recognition.transcript}</p>
                {recognition.interim && !recognition.listening && (
                  <p className="mt-1 text-xs text-muted">Sementara: {recognition.interim}</p>
                )}
              </div>
              <div className="rounded-2xl border border-line bg-surface-2 px-4 py-3 sm:min-w-48">
                <Badge tone={copy.tone}>{copy.label}</Badge>
                <p className="mt-2 text-xs text-muted">
                  Kemiripan teks {Math.round(comparison.similarity * 100)}% — bukan skor pelafalan.
                </p>
              </div>
            </div>
          )}

          {hasTranscript && (
            <div className="space-y-2">
              <p className="text-sm text-ink">{copy.detail}</p>
              <p className="text-sm text-muted">
                Contoh yang diharapkan: <span className="font-jp text-ink">{comparison.bestExpected}</span>
              </p>
              <p className="text-xs leading-relaxed text-muted">
                Perbandingan memakai teks yang sudah dinormalisasi (kanji tetap kanji, katakana disamakan dengan
                hiragana, tanda baca diabaikan). Hasil ini bukan evaluasi akustik dan tidak mengukur aksen atau
                kualitas suara secara ilmiah.
              </p>
            </div>
          )}

          {!hasTranscript && !recognition.error && (
            <p className="text-xs text-muted">
              Tip: bicara dengan jarak sekitar satu jempol dari mikrofon, tanpa menutupi mulut. Pengenalan otomatis
              berhenti setelah 15 detik.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
