"use client";

import { useEffect, useSyncExternalStore } from "react";
import { furiganaReading } from "./furigana";
import {
  cancelSpeech,
  describeSpeechFailure,
  getActiveSpeechProvider,
  getJapaneseVoices,
  isSpeechSupported,
  speakDetailed,
  waitForJapaneseVoices,
  type SpeechResultReason,
} from "./speech";

export const AUDIO_RATES = [0.75, 1, 1.25, 1.5] as const;

export interface AudioTrack {
  id: string;
  /** Teks yang ditampilkan (boleh berisi furigana). */
  text: string;
  /** Teks yang dikirim ke mesin suara. Gunakan bacaan kana yang terverifikasi. */
  speech?: string;
  /** Bacaan kana bila berbeda dari teks tampilan. */
  reading?: string;
  label?: string;
  context?: string;
  /** Aset rekaman opsional; hanya URL same-origin yang diterima. */
  audioUrl?: string;
}

export type AudioStatus = "idle" | "loading" | "playing" | "paused" | "ended" | "error";

export interface AudioPlayerState {
  status: AudioStatus;
  current: AudioTrack | null;
  index: number;
  queue: AudioTrack[];
  rate: number;
  voiceURI: string | null;
  voices: SpeechSynthesisVoice[];
  voicesReady: boolean;
  error: string | null;
  usingRecorded: boolean;
  providerId: string | null;
}

export interface AudioPlaybackOptions {
  rate?: number;
  voiceURI?: string | null;
}

export interface AudioPlaybackResult {
  ok: boolean;
  reason?: SpeechResultReason;
}

const SERVER_STATE: AudioPlayerState = {
  status: "idle",
  current: null,
  index: -1,
  queue: [],
  rate: 0.9,
  voiceURI: null,
  voices: [],
  voicesReady: false,
  error: null,
  usingRecorded: false,
  providerId: null,
};

let state: AudioPlayerState = SERVER_STATE;
const listeners = new Set<() => void>();
let initialized = false;
let playbackToken = 0;
let activeAudio: HTMLAudioElement | null = null;
let activeAudioFinish: ((outcome: "cancelled" | "ended" | "error") => void) | null = null;

export function normalizeAudioRate(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0.9;
  return Math.round(Math.min(1.5, Math.max(0.5, numeric)) * 100) / 100;
}

/** Resolve a recorded asset URL, accepting only same-origin http(s) assets. */
export function safeAudioUrl(url: string, origin?: string): string | null {
  if (!url.trim()) return null;
  try {
    const resolvedOrigin = origin ?? (typeof window !== "undefined" ? window.location.origin : undefined);
    const parsed = new URL(url, resolvedOrigin);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (resolvedOrigin && parsed.origin !== resolvedOrigin) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

/** The exact string sent to TTS. Never send raw kanji when a verified reading exists. */
export function audioTrackSpeech(track: AudioTrack): string {
  return (track.speech ?? track.reading ?? furiganaReading(track.text)).trim();
}

function sameVoices(a: SpeechSynthesisVoice[], b: SpeechSynthesisVoice[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((voice, index) => voice.voiceURI === b[index]?.voiceURI);
}

function emit(): void {
  for (const listener of listeners) listener();
}

function setState(patch: Partial<AudioPlayerState>): void {
  state = { ...state, ...patch };
  emit();
}

export function subscribeAudio(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAudioSnapshot(): AudioPlayerState {
  return state;
}

export function getServerAudioSnapshot(): AudioPlayerState {
  return SERVER_STATE;
}

function subscribeSupport(): () => void {
  return () => {};
}

function refreshVoices(): void {
  if (!isSpeechSupported()) return;
  const voices = getJapaneseVoices();
  if (sameVoices(state.voices, voices) && state.voicesReady) return;
  setState({ voices, voicesReady: true });
}

function initAudioStore(): void {
  if (initialized || typeof window === "undefined" || !isSpeechSupported()) return;
  initialized = true;
  window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
  const immediate = getJapaneseVoices();
  if (immediate.length) {
    setState({ voices: immediate, voicesReady: true });
  } else {
    void waitForJapaneseVoices(1400).then((voices) => setState({ voices, voicesReady: true }));
  }
  window.setTimeout(refreshVoices, 700);
}

function clearRecorded(): void {
  const finish = activeAudioFinish;
  activeAudioFinish = null;
  activeAudio = null;
  if (finish) finish("cancelled");
}

function playRecorded(url: string, rate: number, token: number): Promise<"ended" | "cancelled" | "error"> {
  return new Promise((resolve) => {
    const safe = safeAudioUrl(url);
    if (!safe) {
      resolve("error");
      return;
    }
    const audio = new Audio(safe);
    activeAudio = audio;
    let settled = false;
    const finish = (outcome: "ended" | "cancelled" | "error") => {
      if (settled) return;
      settled = true;
      if (activeAudio === audio) activeAudio = null;
      if (activeAudioFinish === finish) activeAudioFinish = null;
      audio.onended = null;
      audio.onerror = null;
      if (outcome !== "ended") {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
      resolve(outcome);
    };
    activeAudioFinish = finish;
    audio.onended = () => finish("ended");
    audio.onerror = () => finish("error");
    audio.playbackRate = rate;
    setState({ status: "loading", usingRecorded: true, providerId: "recorded", error: null });
    audio
      .play()
      .then(() => {
        if (token !== playbackToken) {
          finish("cancelled");
          return;
        }
        setState({ status: "playing", usingRecorded: true, providerId: "recorded", error: null });
      })
      .catch(() => finish("error"));
  });
}

async function playFrom(index: number, token: number, rate: number, voiceURI: string | null): Promise<AudioPlaybackResult> {
  if (token !== playbackToken) return { ok: false, reason: "cancelled" };
  const queue = state.queue;
  if (index >= queue.length) {
    setState({ status: "ended", current: null, index: queue.length });
    return { ok: true };
  }

  const track = queue[index];
  setState({ status: "loading", current: track, index, error: null, usingRecorded: false });

  if (track.audioUrl) {
    const outcome = await playRecorded(track.audioUrl, rate, token);
    if (token !== playbackToken) return { ok: false, reason: "cancelled" };
    if (outcome === "ended") return playFrom(index + 1, token, rate, voiceURI);
    if (outcome === "cancelled") return { ok: false, reason: "cancelled" };
    // A configured asset can fail (404, decode, autoplay). Fall through to TTS
    // rather than claiming there is no audio at all.
  }

  if (!isSpeechSupported()) {
    const error = describeSpeechFailure("unsupported");
    setState({ status: "error", error, current: track, index });
    return { ok: false, reason: "unsupported" };
  }

  const voices = await waitForJapaneseVoices(650);
  if (token !== playbackToken) return { ok: false, reason: "cancelled" };
  setState({ voices, voicesReady: true });

  if (!voices.length) {
    const error = describeSpeechFailure("no-japanese-voice");
    setState({ status: "error", error, current: track, index });
    return { ok: false, reason: "no-japanese-voice" };
  }

  setState({
    status: "playing",
    error: null,
    usingRecorded: false,
    providerId: getActiveSpeechProvider().id,
  });
  const speech = audioTrackSpeech(track);
  if (!speech) {
    setState({ status: "error", error: describeSpeechFailure("empty") });
    return { ok: false, reason: "empty" };
  }

  const result = await speakDetailed(speech, { rate, voiceURI });
  if (token !== playbackToken) return { ok: false, reason: "cancelled" };
  if (result.reason === "cancelled") {
    setState({ status: "idle", current: null, index: -1, queue: [] });
    return { ok: false, reason: "cancelled" };
  }
  if (!result.ok) {
    setState({ status: "error", error: describeSpeechFailure(result.reason), current: track, index });
    return { ok: false, reason: result.reason };
  }
  return playFrom(index + 1, token, rate, voiceURI);
}

export async function playAudioQueue(
  tracks: AudioTrack[],
  startIndex = 0,
  options: AudioPlaybackOptions = {},
): Promise<AudioPlaybackResult> {
  if (!tracks.length) return { ok: false, reason: "empty" };
  if (!isSpeechSupported() && tracks.every((track) => !track.audioUrl)) {
    setState({ status: "error", error: describeSpeechFailure("unsupported") });
    return { ok: false, reason: "unsupported" };
  }

  const token = ++playbackToken;
  clearRecorded();
  cancelSpeech();

  const index = Math.min(Math.max(0, startIndex), tracks.length - 1);
  const rate = normalizeAudioRate(options.rate ?? state.rate);
  const voiceURI = options.voiceURI === undefined ? state.voiceURI : options.voiceURI;
  setState({
    status: "loading",
    queue: [...tracks],
    index,
    current: tracks[index],
    rate,
    voiceURI,
    error: null,
    usingRecorded: false,
  });
  return playFrom(index, token, rate, voiceURI);
}

export function playAudio(track: AudioTrack, options: AudioPlaybackOptions = {}): Promise<AudioPlaybackResult> {
  return playAudioQueue([track], 0, options);
}

export function pauseAudio(): void {
  if (state.status !== "playing") return;
  if (activeAudio) {
    activeAudio.pause();
    setState({ status: "paused" });
    return;
  }
  getActiveSpeechProvider().pause?.();
  setState({ status: "paused" });
}

export function resumeAudio(): void {
  if (state.status !== "paused") return;
  if (activeAudio) {
    void activeAudio.play().then(
      () => setState({ status: "playing" }),
      () => setState({ status: "error", error: describeSpeechFailure("blocked") }),
    );
    return;
  }
  getActiveSpeechProvider().resume?.();
  setState({ status: "playing" });
}

export function stopAudio(): void {
  playbackToken += 1;
  clearRecorded();
  cancelSpeech();
  setState({ status: "idle", current: null, index: -1, queue: [], error: null, usingRecorded: false });
}

export function repeatAudio(): Promise<AudioPlaybackResult> {
  if (!state.queue.length && !state.current) return Promise.resolve({ ok: false, reason: "empty" });
  const queue = state.queue.length ? state.queue : [state.current as AudioTrack];
  const index = state.status === "ended" ? 0 : Math.max(0, Math.min(state.index, queue.length - 1));
  return playAudioQueue(queue, index, { rate: state.rate, voiceURI: state.voiceURI });
}

export function nextAudio(): Promise<AudioPlaybackResult> {
  if (!state.queue.length) return Promise.resolve({ ok: false, reason: "empty" });
  const next = (state.index + 1) % state.queue.length;
  return playAudioQueue(state.queue, next, { rate: state.rate, voiceURI: state.voiceURI });
}

export function previousAudio(): Promise<AudioPlaybackResult> {
  if (!state.queue.length) return Promise.resolve({ ok: false, reason: "empty" });
  const previous = (state.index - 1 + state.queue.length) % state.queue.length;
  return playAudioQueue(state.queue, previous, { rate: state.rate, voiceURI: state.voiceURI });
}

export function setAudioRate(value: number): void {
  const rate = normalizeAudioRate(value);
  if (state.rate === rate) return;
  const restart = state.status === "playing" || state.status === "paused";
  setState({ rate });
  if (activeAudio) activeAudio.playbackRate = rate;
  if (restart && state.current) {
    void playAudioQueue(state.queue.length ? state.queue : [state.current], Math.max(0, state.index), {
      rate,
      voiceURI: state.voiceURI,
    });
  }
}

export function setAudioVoice(voiceURI: string | null): void {
  if (state.voiceURI === voiceURI) return;
  const restart = state.status === "playing" || state.status === "paused";
  setState({ voiceURI });
  if (restart && state.current) {
    void playAudioQueue(state.queue.length ? state.queue : [state.current], Math.max(0, state.index), {
      rate: state.rate,
      voiceURI,
    });
  }
}

export function useAudioPlayer() {
  const supported = useSyncExternalStore(subscribeSupport, isSpeechSupported, () => false);
  const snapshot = useSyncExternalStore(subscribeAudio, getAudioSnapshot, getServerAudioSnapshot);

  useEffect(() => {
    initAudioStore();
  }, []);

  return {
    ...snapshot,
    supported,
    hasJapaneseVoice: snapshot.voices.length > 0,
    play: playAudio,
    playQueue: playAudioQueue,
    pause: pauseAudio,
    resume: resumeAudio,
    stop: stopAudio,
    repeat: repeatAudio,
    next: nextAudio,
    previous: previousAudio,
    setRate: setAudioRate,
    setVoice: setAudioVoice,
  };
}
