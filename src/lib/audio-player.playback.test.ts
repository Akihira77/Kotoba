import { beforeEach, describe, expect, it, vi } from "vitest";

const audio = vi.hoisted(() => ({
  supported: true,
  voices: [] as Array<{ voiceURI: string; lang: string; name: string }>,
  wait: vi.fn(),
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
}));

vi.mock("./speech", () => ({
  isSpeechSupported: () => audio.supported,
  getJapaneseVoices: () => audio.voices,
  waitForJapaneseVoices: (...args: unknown[]) => audio.wait(...args),
  speakDetailed: (...args: unknown[]) => audio.speak(...args),
  cancelSpeech: (...args: unknown[]) => audio.cancel(...args),
  describeSpeechFailure: (reason?: string) => `failure:${reason ?? "error"}`,
  getActiveSpeechProvider: () => ({
    id: "browser-synthesis",
    pause: audio.pause,
    resume: audio.resume,
  }),
}));

import { getAudioSnapshot, playAudioQueue, stopAudio } from "./audio-player";

const japaneseVoice = { voiceURI: "ja-test", lang: "ja-JP", name: "Test Japanese" };
const success = {
  ok: true,
  providerId: "browser-synthesis",
  voiceName: "Test Japanese",
  usedJapaneseVoice: true,
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("audio player fallback and cancellation", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    audio.supported = true;
    audio.voices = [japaneseVoice];
    audio.wait.mockReset();
    audio.speak.mockReset();
    audio.cancel.mockReset();
    audio.pause.mockReset();
    audio.resume.mockReset();
    audio.wait.mockResolvedValue([japaneseVoice]);
    audio.speak.mockResolvedValue(success);
    stopAudio();
  });

  it("reports unsupported speech instead of trying another language", async () => {
    audio.supported = false;
    const result = await playAudioQueue([{ id: "1", text: "こんにちは" }]);
    expect(result).toEqual({ ok: false, reason: "unsupported" });
    expect(getAudioSnapshot().status).toBe("error");
    expect(audio.speak).not.toHaveBeenCalled();
  });

  it("refuses playback when no Japanese voice is available", async () => {
    audio.wait.mockResolvedValue([]);
    const result = await playAudioQueue([{ id: "1", text: "こんにちは" }]);
    expect(result).toEqual({ ok: false, reason: "no-japanese-voice" });
    const state = getAudioSnapshot();
    expect(state.status).toBe("error");
    expect(state.error).toContain("no-japanese-voice");
    expect(audio.speak).not.toHaveBeenCalled();
  });

  it("falls back to Japanese TTS when a recorded asset fails", async () => {
    const instances: Array<{ src: string }> = [];
    class FakeAudio {
      src: string;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      currentTime = 0;
      playbackRate = 1;
      constructor(src: string) {
        this.src = src;
        instances.push(this);
      }
      play() {
        return Promise.reject(new Error("missing asset"));
      }
      pause() {}
    }
    vi.stubGlobal("Audio", FakeAudio);
    vi.stubGlobal("window", { location: { origin: "https://kotoba.local" } });

    const result = await playAudioQueue([
      { id: "1", text: "こんにちは", reading: "こんにちは", audioUrl: "/media/missing.mp3" },
    ]);

    expect(instances).toHaveLength(1);
    expect(result).toEqual({ ok: true });
    expect(audio.speak).toHaveBeenCalledWith("こんにちは", { rate: 0.9, voiceURI: null });
    expect(getAudioSnapshot().status).toBe("ended");
  });

  it("cancels the previous queue when another playback starts", async () => {
    const first = deferred<typeof success>();
    const second = deferred<typeof success>();
    audio.speak.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    const one = playAudioQueue([{ id: "1", text: "いち" }]);
    await vi.waitFor(() => expect(audio.speak).toHaveBeenCalledTimes(1));
    const two = playAudioQueue([{ id: "2", text: "に" }]);
    await vi.waitFor(() => expect(audio.speak).toHaveBeenCalledTimes(2));
    second.resolve(success);
    expect(await two).toEqual({ ok: true });
    first.resolve(success);
    expect(await one).toEqual({ ok: false, reason: "cancelled" });
    expect(audio.cancel).toHaveBeenCalled();
    expect(getAudioSnapshot().queue.map((track) => track.id)).toEqual(["2"]);
  });
});
