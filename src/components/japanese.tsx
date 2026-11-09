"use client";

import type { ElementType } from "react";
import { Icon } from "@/components/icons";
import { useProgress } from "@/components/providers/progress-provider";
import { useToast } from "@/components/providers/toast-provider";
import { useAudioPlayer } from "@/lib/audio-player";
import { furiganaReading, renderFurigana } from "@/lib/furigana";
import { describeSpeechFailure } from "@/lib/speech";
import { cn } from "@/lib/utils";

export function hasJapanese(text: string): boolean {
  return /[\u3040-\u30ff\u3400-\u9fff\uff66-\uff9f]/.test(text);
}

interface JpTextProps {
  text: string;
  as?: ElementType;
  showFurigana?: boolean;
  className?: string;
}

/** Japanese text with optional furigana (respects the learner's setting by default). */
export function JpText({ text, as: Tag = "span", showFurigana, className }: JpTextProps) {
  const { snapshot } = useProgress();
  const enabled = showFurigana ?? snapshot.profile.settings.showFurigana;
  return (
    <Tag lang="ja" className={cn("font-jp leading-relaxed", className)}>
      {renderFurigana(text, enabled)}
    </Tag>
  );
}

interface SpeakButtonProps {
  text: string;
  /** Bacaan kana terverifikasi untuk TTS; jika ada, dipakai menggantikan teks kanji. */
  speech?: string;
  className?: string;
  size?: number;
  slow?: boolean;
  label?: string;
  variant?: "solid" | "soft";
}

/** Play Japanese text with the browser's Japanese speech synthesis voice. */
export function SpeakButton({ text, speech, className, size = 16, slow = false, label, variant = "soft" }: SpeakButtonProps) {
  const spoken = (speech ?? furiganaReading(text)).slice(0, 40);
  const resolvedLabel = label ?? `Putar pelafalan: ${spoken}`;
  const { snapshot } = useProgress();
  const toast = useToast();
  const player = useAudioPlayer();
  const { speechRate, voiceURI } = snapshot.profile.settings;
  const trackId = `speak:${speech ?? text}`;
  const active = player.current?.id === trackId && player.status !== "idle";
  const speaking = active && player.status === "playing";
  const paused = active && player.status === "paused";

  async function play() {
    if (speaking) {
      player.stop();
      return;
    }
    if (paused) {
      player.resume();
      return;
    }
    const result = await player.play(
      { id: trackId, text, speech: speech ?? furiganaReading(text), reading: speech ?? furiganaReading(text) },
      { rate: slow ? 0.65 : speechRate, voiceURI },
    );
    if (!result.ok && result.reason !== "cancelled") {
      toast.error(describeSpeechFailure(result.reason));
    }
  }

  if (!player.supported) {
    return (
      <button
        type="button"
        disabled
        title="Browser ini belum mendukung pembacaan suara"
        aria-label="Pembacaan suara tidak tersedia"
        className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full text-muted opacity-50", className)}
      >
        <Icon name="volume" size={size} />
      </button>
    );
  }

  return (
    <button
      type="button"
      title={speaking ? "Hentikan suara" : paused ? "Lanjutkan suara" : resolvedLabel}
      aria-label={speaking ? "Hentikan suara" : paused ? "Lanjutkan suara" : resolvedLabel}
      aria-pressed={active}
      onClick={() => void play()}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition",
        variant === "solid" ? "bg-brand text-white hover:bg-brand/90" : "bg-surface-2 text-muted hover:bg-brand-soft hover:text-brand",
        speaking && "animate-pulse text-brand",
        className,
      )}
    >
      <Icon name={speaking ? "pause" : "volume"} size={size} />
    </button>
  );
}
