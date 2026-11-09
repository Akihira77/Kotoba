"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string | null;
  volume?: number;
  /** Optional hard limit for one playback. Defaults to a value scaled by text length. */
  timeoutMs?: number;
}

export type SpeechResultReason =
  | "unsupported"
  | "empty"
  | "cancelled"
  | "blocked"
  | "no-japanese-voice"
  | "error"
  | "timeout";

export interface SpeechPlaybackResult {
  ok: boolean;
  reason?: SpeechResultReason;
  providerId: string;
  voiceName: string | null;
  usedJapaneseVoice: boolean;
}

/**
 * Minimal provider contract so a future cloud or self-hosted TTS service can
 * replace the browser synthesizer without changing pages. Providers are tried
 * in registration order; the browser synthesizer is the final fallback.
 */
export interface SpeechProvider {
  id: string;
  label: string;
  isAvailable(): boolean;
  speak(text: string, options?: SpeakOptions): Promise<SpeechPlaybackResult>;
  cancel(): void;
  pause?(): void;
  resume?(): void;
}

let voicesCache: SpeechSynthesisVoice[] = [];

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function getVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  const all = window.speechSynthesis.getVoices();
  if (all.length) voicesCache = all;
  return voicesCache.length ? voicesCache : all;
}

export function getJapaneseVoices(): SpeechSynthesisVoice[] {
  return getVoices().filter((voice) => voice.lang?.toLowerCase().startsWith("ja"));
}

export function pickJapaneseVoice(voiceURI?: string | null): SpeechSynthesisVoice | null {
  const voices = getJapaneseVoices();
  if (!voices.length) return null;
  if (voiceURI) {
    const chosen = voices.find((voice) => voice.voiceURI === voiceURI);
    if (chosen) return chosen;
  }
  return voices[0];
}

export function describeSpeechFailure(reason?: SpeechResultReason): string {
  switch (reason) {
    case "unsupported":
      return "Browser ini belum mendukung pembacaan suara. Kamu tetap bisa belajar dengan membaca dan transkrip.";
    case "empty":
      return "Tidak ada teks Jepang yang bisa dibacakan.";
    case "cancelled":
      return "Pemutaran dihentikan.";
    case "blocked":
      return "Browser memblokir pemutaran otomatis. Tekan tombol audio sekali lagi.";
    case "no-japanese-voice":
      return "Belum ada suara Jepang (ja-JP) di perangkat ini. Kotoba tidak akan memakai suara bahasa lain. Pasang atau aktifkan voice Jepang di pengaturan sistem atau browser, lalu muat ulang halaman.";
    case "timeout":
      return "Pemutaran melewati batas waktu. Coba versi lambat atau teks yang lebih pendek.";
    case "error":
    default:
      return "Audio tidak dapat diputar. Coba lagi atau periksa pengaturan suara perangkat.";
  }
}

function result(reason: SpeechResultReason | undefined, voice: SpeechSynthesisVoice | null): SpeechPlaybackResult {
  return {
    ok: reason === undefined,
    reason,
    providerId: "browser-synthesis",
    voiceName: voice?.name ?? null,
    usedJapaneseVoice: Boolean(voice),
  };
}

interface ActivePlayback {
  cancel: () => void;
  pause: () => void;
  resume: () => void;
}

let activePlayback: ActivePlayback | null = null;

function defaultTimeout(text: string, explicit?: number): number {
  if (typeof explicit === "number" && Number.isFinite(explicit) && explicit > 0) return explicit;
  return Math.min(45000, Math.max(8000, text.length * 320));
}

function errorReason(event: SpeechSynthesisErrorEvent, cancelled: boolean): SpeechResultReason {
  if (cancelled) return "cancelled";
  if (event.error === "canceled" || event.error === "interrupted") return "cancelled";
  if (event.error === "not-allowed" || event.error === "audio-busy" || event.error === "audio-hardware") return "blocked";
  return "error";
}

const browserSpeechProvider: SpeechProvider = {
  id: "browser-synthesis",
  label: "Suara browser",
  isAvailable: isSpeechSupported,
  cancel: () => {
    if (!isSpeechSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  },
  pause: () => {
    if (!isSpeechSupported()) return;
    try {
      window.speechSynthesis.pause();
    } catch {
      /* ignore */
    }
  },
  resume: () => {
    if (!isSpeechSupported()) return;
    try {
      window.speechSynthesis.resume();
    } catch {
      /* ignore */
    }
  },
  speak: (text: string, options: SpeakOptions = {}) =>
    new Promise<SpeechPlaybackResult>((resolve) => {
      if (!isSpeechSupported()) {
        resolve(result("unsupported", null));
        return;
      }
      if (!text.trim()) {
        resolve(result("empty", null));
        return;
      }

      // Cancel any previous utterance and settle its waiting promise first.
      cancelSpeech();

      const synth = window.speechSynthesis;
      const voice = pickJapaneseVoice(options.voiceURI);
      if (!voice) {
        // Never fall back to an unrelated language voice. The caller receives
        // a specific reason so the UI can explain how to install a Japanese
        // voice instead of silently mispronouncing the text.
        resolve(result("no-japanese-voice", null));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = options.rate ?? 0.9;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;
      utterance.voice = voice;

      let settled = false;
      let cancelled = false;
      let timeout = 0;
      const playback: ActivePlayback = {
        cancel: () => {
          cancelled = true;
          finish("cancelled");
        },
        pause: () => {
          if (settled) return;
          try {
            synth.pause();
          } catch {
            /* ignore */
          }
        },
        resume: () => {
          if (settled) return;
          try {
            synth.resume();
          } catch {
            /* ignore */
          }
        },
      };

      const finish = (reason?: SpeechResultReason) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        if (activePlayback === playback) activePlayback = null;
        resolve(result(reason, voice));
      };

      activePlayback = playback;
      timeout = window.setTimeout(() => {
        cancelled = true;
        try {
          synth.cancel();
        } catch {
          /* ignore */
        }
        finish("timeout");
      }, defaultTimeout(text, options.timeoutMs));

      utterance.onend = () => finish();
      utterance.onerror = (event) => finish(errorReason(event, cancelled));

      // Some browsers pause the queue after cancellation; resume defensively.
      try {
        synth.resume();
      } catch {
        /* ignore */
      }
      window.setTimeout(() => {
        if (settled) return;
        try {
          synth.speak(utterance);
        } catch {
          finish("error");
        }
      }, 60);
    }),
};

export function cancelSpeech(): void {
  const playback = activePlayback;
  activePlayback = null;
  if (playback) playback.cancel();
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

export function pauseSpeech(): void {
  activePlayback?.pause();
}

export function resumeSpeech(): void {
  activePlayback?.resume();
}

/**
 * Resolve when a Japanese voice becomes available, or after a short timeout.
 * Some browsers populate voices asynchronously and fire voiceschanged late, so
 * the UI must never treat the first empty getVoices() call as final.
 */
export async function waitForJapaneseVoices(timeoutMs = 1200): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSupported()) return [];
  const immediate = getJapaneseVoices();
  if (immediate.length) return immediate;

  return new Promise((resolve) => {
    let settled = false;
    let timer = 0;
    let interval = 0;

    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.clearInterval(interval);
      window.speechSynthesis.removeEventListener("voiceschanged", refresh);
      resolve(getJapaneseVoices());
    };

    const refresh = () => {
      if (getJapaneseVoices().length) finish();
    };

    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    interval = window.setInterval(refresh, 180);
    timer = window.setTimeout(finish, timeoutMs);
  });
}

const registeredProviders: SpeechProvider[] = [];

/** Register an optional audio backend. The most recently registered available provider wins. */
export function registerSpeechProvider(provider: SpeechProvider): void {
  const index = registeredProviders.findIndex((item) => item.id === provider.id);
  if (index >= 0) registeredProviders.splice(index, 1);
  registeredProviders.unshift(provider);
}

export function getRegisteredSpeechProviders(): readonly SpeechProvider[] {
  return registeredProviders;
}

export function getActiveSpeechProvider(): SpeechProvider {
  return registeredProviders.find((provider) => provider.isAvailable()) ?? browserSpeechProvider;
}

/** Backward-compatible boolean wrapper used by existing call sites. */
export async function speak(text: string, options: SpeakOptions = {}): Promise<boolean> {
  const playback = await getActiveSpeechProvider().speak(text, options);
  return playback.ok;
}

export function speakDetailed(text: string, options: SpeakOptions = {}): Promise<SpeechPlaybackResult> {
  return getActiveSpeechProvider().speak(text, options);
}

function subscribeSpeechSupport(): () => void {
  // Browser support cannot change while the page is open.
  return () => {};
}

function getSpeechSupport(): boolean {
  return isSpeechSupported();
}

function getServerSpeechSupport(): boolean {
  return false;
}

export function useSpeech() {
  // External-store subscription gives a hydration-safe answer (false on the server,
  // real support after hydration) without setting state from an effect.
  const supported = useSyncExternalStore(subscribeSpeechSupport, getSpeechSupport, getServerSpeechSupport);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SpeechPlaybackResult | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!supported) return;
    const refresh = () => {
      if (!mounted.current) return;
      setVoices(getJapaneseVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    const first = window.setTimeout(refresh, 0);
    const retry = window.setTimeout(refresh, 700);
    return () => {
      mounted.current = false;
      window.speechSynthesis.removeEventListener("voiceschanged", refresh);
      window.clearTimeout(first);
      window.clearTimeout(retry);
      // Do not cancel shared speech here: another mounted SpeakButton may be
      // playing audio while this component unmounts.
    };
  }, [supported]);

  const sayDetailed = useCallback(async (text: string, options: SpeakOptions = {}) => {
    setSpeaking(true);
    setPaused(false);
    setError(null);
    const playback = await getActiveSpeechProvider().speak(text, options);
    if (mounted.current) {
      setSpeaking(false);
      setLastResult(playback);
      if (!playback.ok) setError(describeSpeechFailure(playback.reason));
    }
    return playback;
  }, []);

  const say = useCallback(
    async (text: string, options: SpeakOptions = {}) => {
      const playback = await sayDetailed(text, options);
      return playback.ok;
    },
    [sayDetailed],
  );

  const stop = useCallback(() => {
    cancelSpeech();
    setSpeaking(false);
    setPaused(false);
  }, []);

  const pause = useCallback(() => {
    pauseSpeech();
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    resumeSpeech();
    setPaused(false);
  }, []);

  return {
    supported,
    speaking,
    paused,
    voices,
    hasJapaneseVoice: voices.length > 0,
    error,
    lastResult,
    speak: say,
    speakDetailed: sayDetailed,
    stop,
    pause,
    resume,
  };
}
