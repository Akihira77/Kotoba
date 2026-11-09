import type { ReactNode } from "react";

export interface FuriganaSegment {
  text: string;
  ruby?: string;
}

/**
 * Parse lightweight furigana markup: `{漢字|かんじ}`.
 * Plain text is preserved, including punctuation and line breaks.
 */
export function parseFurigana(input: string): FuriganaSegment[] {
  const segments: FuriganaSegment[] = [];
  const regex = /\{([^{}|]+)\|([^{}|]+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: input.slice(lastIndex, match.index) });
    }
    segments.push({ text: match[1], ruby: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < input.length) {
    segments.push({ text: input.slice(lastIndex) });
  }

  return segments;
}

export function stripFurigana(input: string): string {
  return parseFurigana(input)
    .map((segment) => segment.text)
    .join("");
}

/**
 * Convert furigana markup into a reading string for speech synthesis:
 * ruby readings replace their base text, while plain kana/punctuation is kept.
 * Never use this to display text; use stripFurigana or renderFurigana instead.
 */
export function furiganaReading(input: string): string {
  return parseFurigana(input)
    .map((segment) => segment.ruby ?? segment.text)
    .join("");
}

export function renderFurigana(input: string, showFurigana: boolean): ReactNode {
  if (!showFurigana) {
    return stripFurigana(input);
  }

  const segments = parseFurigana(input);
  return segments.map((segment, index) =>
    segment.ruby ? (
      <ruby key={index} lang="ja">
        {segment.text}
        <rt className="text-[0.55em] font-normal tracking-normal text-muted">{segment.ruby}</rt>
      </ruby>
    ) : (
      <span key={index}>{segment.text}</span>
    ),
  );
}

export function hasFurigana(input: string): boolean {
  return /\{[^{}|]+\|[^{}|]+\}/.test(input);
}