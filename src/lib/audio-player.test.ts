import { describe, expect, it } from "vitest";
import { AUDIO_RATES, audioTrackSpeech, normalizeAudioRate, safeAudioUrl } from "./audio-player";
import { describeSpeechFailure } from "./speech";

describe("audio player helpers", () => {
  it("clamps speech rate to the supported range", () => {
    expect(normalizeAudioRate(0.2)).toBe(0.5);
    expect(normalizeAudioRate(2)).toBe(1.5);
    expect(normalizeAudioRate(1.256)).toBe(1.26);
    expect(normalizeAudioRate(Number.NaN)).toBe(0.9);
    expect(AUDIO_RATES).toEqual([0.75, 1, 1.25, 1.5]);
  });

  it("accepts only same-origin http(s) recorded assets", () => {
    const origin = "https://kotoba.local";
    expect(safeAudioUrl("/media/kana/a.mp3", origin)).toBe("https://kotoba.local/media/kana/a.mp3");
    expect(safeAudioUrl("https://kotoba.local/media/a.mp3", origin)).toBe("https://kotoba.local/media/a.mp3");
    expect(safeAudioUrl("https://cdn.example.com/a.mp3", origin)).toBeNull();
    expect(safeAudioUrl("javascript:alert(1)", origin)).toBeNull();
    expect(safeAudioUrl("data:audio/mpeg;base64,AAAA", origin)).toBeNull();
    expect(safeAudioUrl("", origin)).toBeNull();
  });

  it("prefers an explicit speech string, then a reading, then furigana rubies", () => {
    expect(audioTrackSpeech({ id: "1", text: "食べる", speech: "たべる" })).toBe("たべる");
    expect(audioTrackSpeech({ id: "2", text: "食べる", reading: "たべる" })).toBe("たべる");
    expect(audioTrackSpeech({ id: "3", text: "{食|た}べる" })).toBe("たべる");
    expect(audioTrackSpeech({ id: "4", text: "  こんにちは  " })).toBe("こんにちは");
  });

  it("explains a missing Japanese voice without suggesting another language", () => {
    const message = describeSpeechFailure("no-japanese-voice");
    expect(message).toContain("tidak akan memakai suara bahasa lain");
    expect(message).toContain("voice Jepang");
  });
});
