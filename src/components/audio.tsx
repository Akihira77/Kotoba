"use client";

import { useEffect } from "react";
import { Icon } from "@/components/icons";
import { JpText } from "@/components/japanese";
import { useProgress } from "@/components/providers/progress-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Badge, Button, Card } from "@/components/ui";
import {
  AUDIO_RATES,
  useAudioPlayer,
  type AudioTrack,
} from "@/lib/audio-player";
import { describeSpeechFailure } from "@/lib/speech";
import { cn } from "@/lib/utils";

interface AudioControlsProps {
  tracks: AudioTrack[];
  label: string;
  className?: string;
  compact?: boolean;
  /** Simpan pilihan kecepatan/voice ke pengaturan profil. */
  persist?: boolean;
}

function rateLabel(rate: number): string {
  return `${rate.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}x`;
}

function statusText(player: ReturnType<typeof useAudioPlayer>): string {
  switch (player.status) {
    case "loading":
      return "Menyiapkan audio...";
    case "playing":
      return player.current?.label ? `Memutar ${player.current.label}` : "Memutar audio...";
    case "paused":
      return "Audio dijeda.";
    case "ended":
      return "Selesai. Kamu bisa mengulang atau memilih item lain.";
    case "error":
      return player.error ?? "Audio tidak dapat diputar.";
    default:
      return "Siap memutar audio.";
  }
}

/**
 * Reusable control bar for browser TTS and optional recorded audio.
 * It never represents browser SpeechSynthesis as a downloadable MP3.
 */
export function AudioControls({ tracks, label, className, compact = false, persist = true }: AudioControlsProps) {
  const { snapshot, saveSettings } = useProgress();
  const toast = useToast();
  const player = useAudioPlayer();
  const { setRate, setVoice } = player;
  const settings = snapshot.profile.settings;

  useEffect(() => {
    setRate(settings.speechRate);
    setVoice(settings.voiceURI);
  }, [settings.speechRate, settings.voiceURI, setRate, setVoice]);

  const active = Boolean(player.current && tracks.some((track) => track.id === player.current?.id));
  const playing = active && player.status === "playing";
  const paused = active && player.status === "paused";
  const multiple = tracks.length > 1;
  const noVoice = player.supported && player.voicesReady && player.voices.length === 0;
  const canPlay = player.supported || tracks.some((track) => Boolean(track.audioUrl));

  async function togglePlay() {
    if (playing) {
      player.pause();
      return;
    }
    if (paused) {
      player.resume();
      return;
    }
    if (!tracks.length) return;
    const result = await player.playQueue(tracks, 0, { rate: player.rate, voiceURI: player.voiceURI });
    if (!result.ok && result.reason !== "cancelled") {
      toast.error(describeSpeechFailure(result.reason));
    }
  }

  async function repeat() {
    const result = await player.repeat();
    if (!result.ok && result.reason !== "cancelled") toast.error(describeSpeechFailure(result.reason));
  }

  function changeRate(value: string) {
    const next = Number(value);
    player.setRate(next);
    if (persist) void saveSettings({ speechRate: next });
  }

  function changeVoice(value: string) {
    const next = value || null;
    player.setVoice(next);
    if (persist) void saveSettings({ voiceURI: next });
  }

  return (
    <div className={cn("space-y-2.5", className)} role="group" aria-label={label}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="soft"
          onClick={() => void togglePlay()}
          disabled={!canPlay || tracks.length === 0}
          aria-label={playing ? "Jeda audio" : paused ? "Lanjutkan audio" : "Putar audio"}
          className="min-w-9"
        >
          <Icon name={playing ? "pause" : "play"} size={15} />
          {compact ? null : <span>{playing ? "Jeda" : paused ? "Lanjutkan" : "Putar"}</span>}
        </Button>

        <button
          type="button"
          onClick={player.stop}
          disabled={player.status === "idle"}
          aria-label="Hentikan audio"
          title="Hentikan audio"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink disabled:opacity-40"
        >
          <Icon name="x" size={15} />
        </button>

        <button
          type="button"
          onClick={() => void repeat()}
          disabled={!player.current}
          aria-label="Ulangi audio saat ini"
          title="Ulangi audio saat ini"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink disabled:opacity-40"
        >
          <Icon name="rotate" size={15} />
        </button>

        {multiple ? (
          <>
            <button
              type="button"
              onClick={() => void player.previous()}
              aria-label="Audio sebelumnya"
              title="Audio sebelumnya"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              <Icon name="chevronLeft" size={15} />
            </button>
            <button
              type="button"
              onClick={() => void player.next()}
              aria-label="Audio berikutnya"
              title="Audio berikutnya"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              <Icon name="chevronRight" size={15} />
            </button>
          </>
        ) : null}

        <label className="inline-flex items-center gap-1.5 text-[11px] text-muted">
          <span className="sr-only">Kecepatan bicara</span>
          <select
            value={player.rate}
            onChange={(event) => changeRate(event.target.value)}
            aria-label="Kecepatan bicara"
            className="h-9 rounded-full border border-line bg-surface px-2.5 text-xs font-semibold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          >
            {AUDIO_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rateLabel(rate)}
              </option>
            ))}
            {AUDIO_RATES.includes(player.rate as (typeof AUDIO_RATES)[number]) ? null : (
              <option value={player.rate}>{rateLabel(player.rate)}</option>
            )}
          </select>
        </label>

        {player.voices.length > 0 ? (
          <label className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-muted">
            <span className="sr-only">Pilih voice Jepang</span>
            <select
              value={player.voiceURI ?? ""}
              onChange={(event) => changeVoice(event.target.value)}
              aria-label="Pilih voice Jepang"
              className="h-9 max-w-44 min-w-0 rounded-full border border-line bg-surface px-2.5 text-xs font-medium text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            >
              <option value="">Otomatis</option>
              {player.voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} · {voice.lang}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <p className="text-[11px] leading-relaxed text-muted" role="status" aria-live="polite">
        {statusText(player)}
        {player.status === "playing" && player.queue.length > 1
          ? ` · ${player.index + 1} dari ${player.queue.length}`
          : ""}
      </p>

      {noVoice ? (
        <div className="rounded-xl border border-brand/20 bg-brand-soft/50 px-3 py-2 text-xs leading-relaxed text-brand-strong dark:bg-brand/10 dark:text-brand">
          <p className="font-semibold">Suara Jepang belum terdeteksi.</p>
          <p className="mt-0.5">
            Kotoba hanya memakai voice <span lang="ja">ja-JP</span>, tidak memakai voice bahasa lain. Pasang atau aktifkan
            voice Jepang di pengaturan sistem/peramban, lalu muat ulang halaman. Transkrip dan latihan tertulis tetap bisa
            dipakai.
          </p>
        </div>
      ) : null}

      {player.status === "error" && player.error ? (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300" role="alert">
          {player.error}
        </p>
      ) : null}
    </div>
  );
}

interface AudioPlayerCardProps {
  tracks: AudioTrack[];
  title: string;
  description?: string;
  label?: string;
  className?: string;
  showQueue?: boolean;
  persist?: boolean;
  queueColumns?: 1 | 2;
}

/** A card that shows the current item and a queue, useful for reading/dialogue/studio. */
export function AudioPlayerCard({
  tracks,
  title,
  description,
  label,
  className,
  showQueue = true,
  persist = true,
  queueColumns = 2,
}: AudioPlayerCardProps) {
  const player = useAudioPlayer();
  const toast = useToast();
  const current = player.current && tracks.some((track) => track.id === player.current?.id) ? player.current : tracks[0];

  async function playTrack(index: number) {
    const result = await player.playQueue(tracks, index, { rate: player.rate, voiceURI: player.voiceURI });
    if (!result.ok && result.reason !== "cancelled") toast.error(describeSpeechFailure(result.reason));
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="border-b border-line bg-surface-2/40 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-bold">{title}</h2>
            {description ? <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p> : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge tone="indigo">Audio</Badge>
            <Badge tone="muted">{tracks.length} bagian</Badge>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        {current ? (
          <div className="max-h-56 overflow-y-auto rounded-2xl border border-line bg-surface-2/35 px-4 py-3">
            {current.label ? <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">{current.label}</p> : null}
            <JpText text={current.text} as="p" className="mt-1 text-lg font-semibold" />
            {current.reading && current.reading !== current.text ? (
              <p className="mt-1 text-xs text-muted" lang="ja">{current.reading}</p>
            ) : null}
            {current.context ? <p className="mt-1 text-xs leading-relaxed text-muted">{current.context}</p> : null}
          </div>
        ) : null}

        <AudioControls tracks={tracks} label={label ?? `Kontrol audio: ${title}`} compact persist={persist} />

        {showQueue && tracks.length > 1 ? (
          <div>
            <p className="text-xs font-semibold text-muted">Daftar audio</p>
            <ol className={cn("mt-2 grid gap-1.5", queueColumns === 1 ? "grid-cols-1" : "sm:grid-cols-2")}>
              {tracks.map((track, index) => {
                const activeTrack = player.current?.id === track.id && player.status !== "idle";
                return (
                  <li key={track.id}>
                    <button
                      type="button"
                      onClick={() => void playTrack(index)}
                      aria-pressed={activeTrack}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs transition",
                        activeTrack
                          ? "border-brand/40 bg-brand-soft/60 text-brand-strong dark:bg-brand/15 dark:text-brand"
                          : "border-line bg-surface text-ink hover:bg-surface-2",
                      )}
                    >
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted">
                        <Icon name={activeTrack && player.status === "playing" ? "pause" : "play"} size={13} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{track.label ?? `Bagian ${index + 1}`}</span>
                        <span className="block truncate text-[10px] text-muted" lang="ja">{track.reading ?? track.text}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
