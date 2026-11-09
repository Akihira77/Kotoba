"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  describeRecognitionError,
  getSpeechRecognitionConstructor,
  isSpeechRecognitionSupported,
  type SpeechRecognitionErrorEventLike,
  type SpeechRecognitionEventLike,
  type SpeechRecognitionLike,
} from "@/lib/speech-recognition";

export type RecognitionStatus =
  | "idle"
  | "starting"
  | "listening"
  | "processing"
  | "done"
  | "denied"
  | "unsupported"
  | "error";

export interface SpeechRecognitionState {
  supported: boolean;
  status: RecognitionStatus;
  listening: boolean;
  transcript: string;
  interim: string;
  confidence: number | null;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const DEFAULT_LIMIT_MS = 15000;

function subscribeSupport(): () => void {
  return () => {};
}

function getSupport(): boolean {
  return isSpeechRecognitionSupported();
}

function getServerSupport(): boolean {
  return false;
}

/**
 * Thin React wrapper around the browser Web Speech API recognition object.
 * Microphone access is only requested when the learner calls start(), and the
 * caller is responsible for showing the consent/disclosure copy first.
 */
export function useSpeechRecognition(): SpeechRecognitionState {
  const supported = useSyncExternalStore(subscribeSupport, getSupport, getServerSupport);
  const [status, setStatus] = useState<RecognitionStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mounted = useRef(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTextRef = useRef("");
  const errorRef = useRef(false);
  const resettingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const reset = useCallback(() => {
    resettingRef.current = true;
    clearTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    }
    finalTextRef.current = "";
    errorRef.current = false;
    if (!mounted.current) return;
    setStatus("idle");
    setTranscript("");
    setInterim("");
    setConfidence(null);
    setError(null);
  }, [clearTimer]);

  const start = useCallback(() => {
    const Constructor = getSpeechRecognitionConstructor();
    if (!Constructor) {
      if (!mounted.current) return;
      setError("Browser ini belum mendukung pengenalan suara Jepang.");
      setStatus("unsupported");
      return;
    }

    clearTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignore */
      }
    }

    const recognition = new Constructor();
    recognitionRef.current = recognition;
    recognition.lang = "ja-JP";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    resettingRef.current = false;
    errorRef.current = false;
    finalTextRef.current = "";
    setStatus("starting");
    setTranscript("");
    setInterim("");
    setConfidence(null);
    setError(null);

    recognition.onstart = () => {
      if (!mounted.current || recognitionRef.current !== recognition) return;
      setStatus("listening");
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      if (!mounted.current || recognitionRef.current !== recognition) return;
      let finalText = finalTextRef.current;
      let interimText = "";
      let firstConfidence: number | null = null;

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const alternative = result?.[0];
        if (!alternative) continue;
        if (result.isFinal) {
          finalText += alternative.transcript;
          if (firstConfidence === null && typeof alternative.confidence === "number") {
            firstConfidence = alternative.confidence;
          }
        } else {
          interimText += alternative.transcript;
        }
      }

      finalTextRef.current = finalText;
      setTranscript(finalText);
      setInterim(interimText);
      if (firstConfidence !== null) setConfidence(firstConfidence);
      if (finalText) setStatus("processing");
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      clearTimer();
      if (!mounted.current || recognitionRef.current !== recognition) return;
      if (resettingRef.current) {
        setStatus("idle");
        return;
      }
      errorRef.current = true;
      const message = describeRecognitionError(event.error);
      setError(message);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setStatus("denied");
      } else if (event.error === "language-not-supported") {
        setStatus("unsupported");
      } else if (event.error === "aborted") {
        setStatus("idle");
      } else {
        setStatus("error");
      }
    };

    recognition.onend = () => {
      clearTimer();
      if (!mounted.current || recognitionRef.current !== recognition) return;
      if (resettingRef.current) {
        setStatus("idle");
        return;
      }
      if (errorRef.current) return;
      if (!finalTextRef.current) {
        setError("Tidak ada teks Jepang yang dikenali. Coba lagi dengan suara yang lebih jelas.");
        setStatus("error");
        return;
      }
      setStatus("done");
    };

    try {
      recognition.start();
      timerRef.current = window.setTimeout(() => {
        if (recognitionRef.current !== recognition) return;
        try {
          recognition.stop();
        } catch {
          /* ignore */
        }
      }, DEFAULT_LIMIT_MS);
    } catch {
      errorRef.current = true;
      setError("Pengenalan suara tidak dapat dimulai. Coba muat ulang halaman.");
      setStatus("error");
    }
  }, [clearTimer]);

  const stop = useCallback(() => {
    clearTimer();
    const recognition = recognitionRef.current;
    if (!recognition) return;
    setStatus("processing");
    try {
      recognition.stop();
    } catch {
      /* ignore */
    }
  }, [clearTimer]);

  return {
    supported,
    status,
    listening: status === "listening" || status === "starting",
    transcript,
    interim,
    confidence,
    error,
    start,
    stop,
    reset,
  };
}
