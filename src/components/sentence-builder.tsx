"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { JpText, SpeakButton } from "@/components/japanese";
import { Button } from "@/components/ui";
import type { SentenceItem } from "@/lib/types";
import { cn, shuffle } from "@/lib/utils";

interface Token {
  token: string;
  originalIndex: number;
}

/** Small deterministic PRNG so the first render matches on server and client. */
function rngFromSeed(seed: string): () => number {
  let state = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }
  state >>>= 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

interface SentenceBuilderProps {
  item: SentenceItem;
  onChecked?: (correct: boolean) => void;
}

/** Arrange shuffled word tokens into a correct Japanese sentence. */
export function SentenceBuilder({ item, onChecked }: SentenceBuilderProps) {
  const ordered = useMemo<Token[]>(
    () => item.tokens.map((token, originalIndex) => ({ token, originalIndex })),
    [item],
  );
  const [bank, setBank] = useState<Token[]>(() => shuffle(ordered, rngFromSeed(item.id)));
  const [picked, setPicked] = useState<Token[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);

  const correctSentence = item.answer.join("");

  function pick(token: Token) {
    if (checked !== null) return;
    setBank((current) => current.filter((entry) => entry.originalIndex !== token.originalIndex));
    setPicked((current) => [...current, token]);
  }

  function unpick(token: Token) {
    if (checked !== null) return;
    setPicked((current) => current.filter((entry) => entry.originalIndex !== token.originalIndex));
    setBank((current) => [...current, token]);
  }

  function reset() {
    setBank(shuffle(ordered));
    setPicked([]);
    setChecked(null);
  }

  function check() {
    if (picked.length === 0) return;
    const correct = picked.map((entry) => entry.token).join("") === correctSentence;
    setChecked(correct);
    onChecked?.(correct);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Susun kalimat</p>
        <p className="mt-1 text-lg font-semibold">{item.translation}</p>
        <p className="mt-1 text-xs text-muted">Ketuk kata sesuai urutan yang benar dalam bahasa Jepang.</p>
      </div>

      <div
        className={cn(
          "flex min-h-[88px] flex-wrap content-start items-start gap-2 rounded-2xl border-2 border-dashed p-3 transition",
          checked === null && "border-line bg-surface-2/40",
          checked === true && "border-matcha/60 bg-matcha-soft",
          checked === false && "border-brand/50 bg-brand-soft/60",
        )}
      >
        {picked.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted">Ketuk kata di bawah untuk mulai menyusun…</p>
        ) : (
          picked.map((entry) => (
            <button
              key={entry.originalIndex}
              type="button"
              disabled={checked !== null}
              onClick={() => unpick(entry)}
              className="rounded-xl border border-line bg-surface px-3 py-2 font-jp text-base shadow-soft transition hover:border-brand/40 disabled:cursor-default"
            >
              {entry.token}
            </button>
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {bank.map((entry) => (
          <button
            key={entry.originalIndex}
            type="button"
            onClick={() => pick(entry)}
            disabled={checked !== null}
            className="rounded-xl border border-line bg-surface px-3 py-2 font-jp text-base shadow-soft transition hover:-translate-y-0.5 hover:border-brand/40 disabled:opacity-40"
          >
            {entry.token}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="min-h-5 text-sm">
        {checked === true && (
          <p className="flex items-center gap-2 font-medium text-matcha">
            <Icon name="checkCircle" size={18} /> Tepat sekali!
          </p>
        )}
        {checked === false && (
          <div className="rounded-xl border border-brand/25 bg-brand-soft/60 p-3 text-sm">
            <p className="font-medium text-brand">Belum tepat. Kalimat yang benar:</p>
            <p className="mt-1 flex items-center gap-2 font-jp text-base">
              <JpText text={correctSentence} /> <SpeakButton text={correctSentence} />
            </p>
          </div>
        )}
      </div>

      {checked === false && <p className="text-sm text-muted">{item.explanation}</p>}
      {checked === true && <p className="text-sm text-muted">{item.explanation}</p>}

      <div className="flex flex-wrap items-center gap-2">
        {checked === null ? (
          <>
            <Button onClick={check} disabled={picked.length === 0}>Periksa susunan</Button>
            <Button variant="ghost" onClick={reset} disabled={picked.length === 0 && bank.length === ordered.length}>
              <Icon name="rotate" size={16} /> Acak ulang
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={reset}>
              <Icon name="rotate" size={16} /> Coba lagi
            </Button>
            <span className="inline-flex items-center gap-2 text-xs text-muted">
              <SpeakButton text={correctSentence} /> Dengar kalimat lengkap
            </span>
          </>
        )}
      </div>
    </div>
  );
}
