"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AudioControls } from "@/components/audio";
import { Icon } from "@/components/icons";
import { JpText } from "@/components/japanese";
import { Badge, Button, Card } from "@/components/ui";
import { useAudioPlayer } from "@/lib/audio-player";
import type { ListeningLine } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ListeningPlayerProps {
  lines: ListeningLine[];
  title?: string;
  scenario?: string;
  /** Hormati preferensi "Putar audio otomatis"; peramban tetap dapat memblokirnya. */
  autoPlay?: boolean;
}

const SPEAKER_TONE: Record<ListeningLine["speaker"], string> = {
  A: "bg-brand-soft text-brand dark:bg-brand/15",
  B: "bg-indigo-soft text-indigo dark:bg-indigo/15",
  Narasi: "bg-surface-2 text-muted",
};

export function ListeningPlayer({ lines, title, scenario, autoPlay = false }: ListeningPlayerProps) {
  const player = useAudioPlayer();
  const autoPlayed = useRef(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const tracks = useMemo(
    () =>
      lines.map((line, index) => ({
        id: `listening-${line.id}`,
        text: line.jp,
        speech: line.reading,
        reading: line.reading,
        label: `Baris ${index + 1} · ${line.speaker === "Narasi" ? "Narasi" : `Pembicara ${line.speaker}`}`,
        context: line.reading,
      })),
    [lines],
  );

  useEffect(() => {
    if (!autoPlay || autoPlayed.current || !player.supported || tracks.length === 0) return;
    autoPlayed.current = true;
    void player.playQueue(tracks, 0, { rate: player.rate, voiceURI: player.voiceURI });
  }, [autoPlay, player, tracks]);

  function activeLine(index: number): boolean {
    return player.current?.id === tracks[index]?.id && player.status !== "idle";
  }

  function toggleLine(index: number) {
    const track = tracks[index];
    if (!track) return;
    if (player.current?.id === track.id && player.status === "playing") {
      player.stop();
      return;
    }
    if (player.current?.id === track.id && player.status === "paused") {
      player.resume();
      return;
    }
    void player.playQueue(tracks, index, { rate: player.rate, voiceURI: player.voiceURI });
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line bg-seigaiha px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-soft text-indigo dark:bg-indigo/15">
              <Icon name="listening" size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{title ?? "Latihan menyimak"}</p>
              <p className="text-xs text-muted">{scenario ?? "Dengarkan percakapan, lalu jawab pertanyaannya."}</p>
            </div>
          </div>
          <Badge tone="indigo">{lines.length} baris</Badge>
        </div>
      </div>

      <div className="px-5 py-6">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
          <div className="flex h-14 items-end justify-center gap-1" aria-hidden="true">
            {[18, 30, 24, 42, 32, 50, 26, 38, 20, 44, 28, 34].map((height, index) => (
              <span
                key={index}
                className={cn("w-1.5 rounded-full bg-indigo/60 transition-all", player.status === "playing" ? "animate-pulse" : "opacity-40")}
                style={{ height: `${height}px`, animationDelay: `${index * 80}ms` }}
              />
            ))}
          </div>
          <AudioControls
            tracks={tracks}
            label="Pemutar latihan menyimak"
            className="w-full"
            compact={false}
          />
          <p className="text-center text-[11px] leading-relaxed text-muted">
            Putar seluruh percakapan, atau pilih baris dari transkrip. Kecepatan dan voice mengikuti Pengaturan.
          </p>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Transkrip</h2>
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={showTranscript}
              aria-controls="listening-transcript"
              onClick={() => setShowTranscript((value) => !value)}
            >
              <Icon name={showTranscript ? "eyeOff" : "eye"} size={15} />
              {showTranscript ? "Sembunyikan" : "Tampilkan transkrip"}
            </Button>
          </div>

          {showTranscript ? (
            <ul id="listening-transcript" className="mt-3 space-y-3">
              {lines.map((line, index) => (
                <li
                  key={line.id}
                  className={cn(
                    "rounded-2xl border p-3.5 transition",
                    activeLine(index) ? "border-indigo/40 bg-indigo-soft/40" : "border-line bg-surface-2/30",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className={cn("mt-0.5 inline-flex h-6 shrink-0 items-center rounded-full px-2 text-[11px] font-semibold", SPEAKER_TONE[line.speaker])}>
                      {line.speaker === "Narasi" ? "Narasi" : `Pembicara ${line.speaker}`}
                    </span>
                    <div className="min-w-0 flex-1">
                      <JpText text={line.jp} className="text-base" />
                      <p className="mt-1 text-xs text-muted" lang="ja">{line.reading}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleLine(index)}
                      aria-label={`Putar baris ${index + 1}`}
                      aria-pressed={activeLine(index)}
                      className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-indigo"
                    >
                      <Icon name={activeLine(index) && player.status === "playing" ? "pause" : "play"} size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 rounded-2xl border-2 border-dashed border-line px-4 py-8 text-center">
              <Icon name="eyeOff" className="mx-auto text-muted" size={22} />
              <p className="mt-2 text-sm text-muted">
                Transkrip disembunyikan agar melatih pendengaran. Putar audio beberapa kali sebelum membukanya.
              </p>
              <Button variant="secondary" size="sm" className="mt-3" onClick={() => setShowTranscript(true)}>
                Buka transkrip
              </Button>
            </div>
          )}
        </div>

        {showTranscript ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-2/50 px-3 py-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5"><Icon name="info" size={14} /> Kamu bisa memutar tiap baris untuk melatih pelafalan.</span>
            <Badge tone="indigo">{lines.length} baris</Badge>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
