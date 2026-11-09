/**
 * Browser speech recognition (Web Speech API) helpers.
 *
 * Important: this module only compares recognized TEXT with the expected
 * expression. It does not measure acoustics, pitch, or pronunciation quality.
 * Browser recognition support varies and some browsers send audio to a
 * vendor service; the UI must disclose that before starting.
 */

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

export interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

export interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type RecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const win = window as RecognitionWindow;
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

/**
 * Normalize text for a forgiving TEXT comparison:
 * - NFKC folds full-width Latin/digits and half-width katakana.
 * - Katakana is folded to hiragana, because recognition often returns either.
 * - Whitespace and punctuation are removed.
 * - The long-vowel mark ー and iteration mark 々 are preserved because they
 *   change readings and must not be silently dropped.
 */
export function normalizeSpeechText(text: string): string {
  const folded = text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, "");

  let output = "";
  for (const char of folded) {
    const code = char.codePointAt(0);
    if (code === undefined) continue;
    if (code >= 0x30a1 && code <= 0x30f6) {
      output += String.fromCodePoint(code - 0x60);
    } else {
      output += char;
    }
  }
  return output;
}

export type SpeechMatchVerdict = "match" | "close" | "different";

export interface SpeechComparison {
  verdict: SpeechMatchVerdict;
  /** 0..1 similarity against the best expected candidate. */
  similarity: number;
  bestExpected: string;
  normalizedExpected: string;
  normalizedTranscript: string;
}

function levenshtein(a: string, b: string): number {
  const left = Array.from(a);
  const right = Array.from(b);
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    previous = current;
  }
  return previous[right.length];
}

export function similarityScore(expected: string, actual: string): number {
  const source = normalizeSpeechText(expected);
  const target = normalizeSpeechText(actual);
  if (!source || !target) return 0;
  const distance = levenshtein(source, target);
  return Math.max(0, 1 - distance / Math.max(Array.from(source).length, Array.from(target).length));
}

/**
 * Compare browser-recognized text with one or more acceptable expressions.
 * This is a text comparison, not an acoustic pronunciation score.
 */
export function compareSpeechTranscript(
  expected: string | string[],
  transcript: string,
): SpeechComparison {
  const candidates = (Array.isArray(expected) ? expected : [expected]).filter((item) => item.trim());
  const normalizedTranscript = normalizeSpeechText(transcript);

  if (!candidates.length || !normalizedTranscript) {
    return {
      verdict: "different",
      similarity: 0,
      bestExpected: candidates[0] ?? "",
      normalizedExpected: normalizeSpeechText(candidates[0] ?? ""),
      normalizedTranscript,
    };
  }

  let bestExpected = candidates[0];
  let bestNormalized = "";
  let bestSimilarity = -1;
  for (const candidate of candidates) {
    const normalized = normalizeSpeechText(candidate);
    const similarity = similarityScore(normalized, normalizedTranscript);
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestExpected = candidate;
      bestNormalized = normalized;
    }
  }

  let verdict: SpeechMatchVerdict = "different";
  if (bestNormalized === normalizedTranscript) verdict = "match";
  else if (bestSimilarity >= 0.75) verdict = "close";

  return {
    verdict,
    similarity: Math.max(0, Math.min(1, bestSimilarity)),
    bestExpected,
    normalizedExpected: bestNormalized,
    normalizedTranscript,
  };
}

export function describeRecognitionError(code?: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Izin mikrofon atau pengenalan suara ditolak. Periksa izin situs di browser.";
    case "no-speech":
      return "Tidak ada suara yang terdeteksi. Coba dekatkan mikrofon dan bicara lebih jelas.";
    case "audio-capture":
      return "Mikrofon tidak ditemukan atau sedang dipakai aplikasi lain.";
    case "network":
      return "Layanan pengenalan suara browser tidak dapat dijangkau. Coba lagi nanti.";
    case "language-not-supported":
      return "Pengenalan suara Jepang belum didukung browser ini. Gunakan rekam dan bandingkan manual.";
    case "aborted":
      return "Pengenalan suara dihentikan.";
    case "bad-grammar":
      return "Browser tidak dapat memproses pengaturan pengenalan suara.";
    default:
      return "Pengenalan suara gagal. Anda tetap bisa merekam dan membandingkan secara manual.";
  }
}
