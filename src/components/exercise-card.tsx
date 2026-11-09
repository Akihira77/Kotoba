"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { hasJapanese, JpText, SpeakButton } from "@/components/japanese";
import { Badge, Button, Card } from "@/components/ui";
import { exerciseMeta, rngFromSeed } from "@/lib/exercise-engine";
import { stripFurigana } from "@/lib/furigana";
import type { Exercise, ExerciseGrade, ExerciseResponse, MatchingPair } from "@/lib/types";
import { cn, shuffle } from "@/lib/utils";

export interface ExerciseCardProps {
  exercise: Exercise;
  response: ExerciseResponse;
  onChange: (response: ExerciseResponse) => void;
  checked?: boolean;
  grade?: ExerciseGrade | null;
  showFeedback?: boolean;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

function isJapanese(value: string) {
  return hasJapanese(stripFurigana(value));
}

function PromptText({ text, className }: { text: string; className?: string }) {
  const plain = stripFurigana(text);
  if (!isJapanese(plain)) return <p className={className}>{plain}</p>;
  return (
    <p className={className}>
      <JpText text={text} className="font-jp" />
    </p>
  );
}

function ChoiceButtons({
  options,
  selectedIndex,
  answerIndex,
  checked,
  onSelect,
}: {
  options: string[];
  selectedIndex: number;
  answerIndex: number;
  checked: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="grid gap-2.5" role="group" aria-label="Pilihan jawaban">
      {options.map((option, index) => {
        const selected = selectedIndex === index;
        const correct = checked && index === answerIndex;
        const wrong = checked && selected && index !== answerIndex;
        return (
          <button
            key={`${index}-${option}`}
            type="button"
            disabled={checked}
            aria-pressed={selected}
            onClick={() => onSelect(index)}
            className={cn(
              "flex min-h-12 w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-sm transition-colors sm:text-base",
              selected && !checked && "border-brand bg-brand-soft text-brand-strong",
              !selected && !checked && "border-line bg-surface hover:border-brand/40 hover:bg-surface-2",
              correct && "border-matcha bg-matcha-soft text-matcha",
              wrong && "border-brand bg-brand-soft text-brand-strong",
              checked && !correct && !wrong && "border-line bg-surface text-muted opacity-70",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                selected && !checked ? "border-brand bg-brand text-white" : "border-line bg-surface-2 text-muted",
                correct && "border-matcha bg-matcha text-white",
                wrong && "border-brand bg-brand text-white",
              )}
            >
              {correct ? <Icon name="check" size={15} /> : wrong ? <Icon name="x" size={15} /> : OPTION_LETTERS[index] ?? index + 1}
            </span>
            <span className="min-w-0 break-words">{plainOption(option)}</span>
          </button>
        );
      })}
    </div>
  );
}

function plainOption(option: string) {
  const plain = stripFurigana(option);
  return isJapanese(plain) ? <JpText text={option} className="font-jp" /> : plain;
}

export function ExerciseCard({
  exercise,
  response,
  onChange,
  checked = false,
  grade = null,
  showFeedback = true,
}: ExerciseCardProps) {
  const meta = exerciseMeta(exercise);
  const promptJp = "promptJp" in exercise ? exercise.promptJp : undefined;
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const shuffledRight = useMemo<MatchingPair[]>(
    () => (exercise.kind === "matching" ? shuffle(exercise.pairs, rngFromSeed(`${exercise.id}-right`)) : []),
    [exercise],
  );

  return (
    <Card className="overflow-hidden">
      <div className="space-y-3 border-b border-line bg-surface-2/40 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{meta.label}</Badge>
          <Badge tone="muted">{exercise.level}</Badge>
          {exercise.contentRef ? <Badge tone="indigo">{exercise.contentRef.kind}</Badge> : null}
        </div>
        <PromptText text={exercise.prompt} className="text-lg font-semibold leading-relaxed text-ink sm:text-xl" />
        {promptJp ? (
          <p className="font-jp text-2xl leading-relaxed text-ink sm:text-3xl">
            <JpText text={promptJp} />
          </p>
        ) : null}
        <p className="flex items-start gap-2 text-sm text-muted">
          <Icon name="info" size={15} className="mt-0.5 shrink-0" />
          <span>{meta.hint}</span>
        </p>

        {exercise.kind === "listening" ? (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface p-3">
            <SpeakButton text={exercise.audioText} label="Putar audio" />
            <SpeakButton text={exercise.audioText} slow variant="soft" label="Putar lambat" />
            <span className="text-xs text-muted">Audio memakai suara bawaan peramban.</span>
          </div>
        ) : exercise.kind === "multiple-choice" && exercise.audioText ? (
          <SpeakButton text={exercise.audioText} label="Putar audio soal" />
        ) : null}
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {exercise.kind === "multiple-choice" || exercise.kind === "reading-recognition" || exercise.kind === "listening" ? (
          <>
            {exercise.kind === "reading-recognition" ? (
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2/50 p-4">
                <span className="font-jp text-4xl font-semibold text-ink sm:text-5xl">
                  <JpText text={exercise.word} />
                </span>
                <SpeakButton text={exercise.word} label="Putar kata" />
              </div>
            ) : null}
            <ChoiceButtons
              options={exercise.options}
              selectedIndex={response.kind === "multiple-choice" || response.kind === "reading-recognition" || response.kind === "listening" ? response.selectedIndex : -1}
              answerIndex={exercise.answerIndex}
              checked={checked}
              onSelect={(selectedIndex) => onChange({ kind: exercise.kind, selectedIndex })}
            />
          </>
        ) : null}

        {exercise.kind === "cloze" ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-line bg-surface-2/50 p-4 font-jp text-xl leading-loose text-ink sm:text-2xl">
              <JpText text={exercise.text} />
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-ink">Jawaban</span>
              <input
                value={response.kind === "cloze" ? response.text : ""}
                onChange={(event) => onChange({ kind: "cloze", text: event.target.value })}
                disabled={checked}
                lang="ja"
                autoComplete="off"
                spellCheck={false}
                placeholder="Ketik kata yang hilang"
                className="font-jp h-12 w-full rounded-2xl border border-line bg-surface px-4 text-lg text-ink outline-none transition-shadow focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-70"
              />
            </label>
            {exercise.hint ? <p className="text-sm text-muted">Petunjuk: {exercise.hint}</p> : null}
          </div>
        ) : null}

        {exercise.kind === "translation" ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-line bg-surface-2/50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                {exercise.direction === "id-to-ja" ? "Terjemahkan ke bahasa Jepang" : "Terjemahkan ke bahasa Indonesia"}
              </p>
              <PromptText text={exercise.source} className="text-lg leading-relaxed text-ink" />
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-ink">Terjemahanmu</span>
              <textarea
                value={response.kind === "translation" ? response.text : ""}
                onChange={(event) => onChange({ kind: "translation", text: event.target.value })}
                disabled={checked}
                rows={3}
                lang={exercise.direction === "id-to-ja" ? "ja" : "id"}
                autoComplete="off"
                spellCheck={false}
                placeholder={exercise.direction === "id-to-ja" ? "Tulis dalam bahasa Jepang" : "Tulis dalam bahasa Indonesia"}
                className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-base text-ink outline-none transition-shadow focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-70"
              />
            </label>
            {exercise.keywords.length > 0 ? (
              <p className="text-sm text-muted">Kata kunci: {exercise.keywords.join(", ")}</p>
            ) : null}
          </div>
        ) : null}

        {exercise.kind === "typing" ? (
          <div className="space-y-3">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-ink">Ketikan jawaban</span>
              <input
                value={response.kind === "typing" ? response.text : ""}
                onChange={(event) => onChange({ kind: "typing", text: event.target.value })}
                disabled={checked}
                lang={exercise.inputMode === "romaji" ? "id" : "ja"}
                autoComplete="off"
                spellCheck={false}
                placeholder={exercise.inputMode === "romaji" ? "Ketik romaji" : "Ketik dalam tulisan Jepang"}
                className="font-jp h-12 w-full rounded-2xl border border-line bg-surface px-4 text-lg text-ink outline-none transition-shadow focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-70"
              />
            </label>
            {exercise.hint ? <p className="text-sm text-muted">Petunjuk: {exercise.hint}</p> : null}
          </div>
        ) : null}

        {exercise.kind === "true-false" ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-line bg-surface-2/50 p-4">
              <PromptText text={exercise.statement} className="text-lg leading-relaxed text-ink" />
            </div>
            <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="Benar atau salah">
              {[true, false].map((value) => {
                const selected = response.kind === "true-false" && response.value === value;
                const correct = checked && exercise.answer === value;
                const wrong = checked && selected && exercise.answer !== value;
                return (
                  <Button
                    key={String(value)}
                    type="button"
                    variant={selected && !checked ? "primary" : "secondary"}
                    disabled={checked}
                    aria-pressed={selected}
                    onClick={() => onChange({ kind: "true-false", value })}
                    className={cn(
                      "h-14 gap-2",
                      correct && "border-matcha bg-matcha-soft text-matcha",
                      wrong && "border-brand bg-brand-soft text-brand-strong",
                    )}
                  >
                    <Icon name={value ? "check" : "x"} size={17} />
                    {value ? "Benar" : "Salah"}
                  </Button>
                );
              })}
            </div>
          </div>
        ) : null}

        {exercise.kind === "matching" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted">Ketuk satu kata Jepang, lalu ketuk artinya.</p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={checked || Object.keys(response.kind === "matching" ? response.matches : {}).length === 0}
                onClick={() => onChange({ kind: "matching", matches: {} })}
              >
                <Icon name="rotate" size={14} /> Hapus
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Bahasa Jepang</p>
                {exercise.pairs.map((pair, index) => {
                  const matchedRight = response.kind === "matching" ? response.matches[pair.id] : undefined;
                  const selected = selectedLeft === pair.id;
                  return (
                    <button
                      key={pair.id}
                      type="button"
                      disabled={checked}
                      aria-pressed={selected}
                      onClick={() => setSelectedLeft((current) => (current === pair.id ? null : pair.id))}
                      className={cn(
                        "w-full rounded-2xl border p-3 text-left transition-colors",
                        selected ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-brand/40",
                        matchedRight ? "border-matcha/60" : "",
                      )}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className="font-jp block text-lg text-ink">
                            <JpText text={pair.left} />
                          </span>
                          {pair.leftReading || pair.leftRomaji ? (
                            <span className="mt-0.5 block text-xs text-muted">
                              {pair.leftReading}
                              {pair.leftRomaji ? ` · ${pair.leftRomaji}` : ""}
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-xs font-semibold text-muted">
                          {matchedRight ? <Badge tone="matcha">Terpasang</Badge> : `${index + 1}`}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Arti</p>
                {shuffledRight.map((pair) => {
                  const owner = response.kind === "matching"
                    ? Object.entries(response.matches).find(([, rightId]) => rightId === pair.id)?.[0]
                    : undefined;
                  const leftIndex = owner ? exercise.pairs.findIndex((item) => item.id === owner) : -1;
                  return (
                    <button
                      key={pair.id}
                      type="button"
                      disabled={checked || !selectedLeft}
                      onClick={() => {
                        if (!selectedLeft) return;
                        const current = response.kind === "matching" ? response.matches : {};
                        const next: Record<string, string> = {};
                        for (const [leftId, rightId] of Object.entries(current)) {
                          if (leftId !== selectedLeft && rightId !== pair.id) next[leftId] = rightId;
                        }
                        next[selectedLeft] = pair.id;
                        onChange({ kind: "matching", matches: next });
                        setSelectedLeft(null);
                      }}
                      className={cn(
                        "min-h-12 w-full rounded-2xl border p-3 text-left text-sm transition-colors",
                        owner ? "border-matcha/60 bg-matcha-soft/40" : "border-line bg-surface hover:border-brand/40",
                        !selectedLeft && !owner && "opacity-70",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {owner ? <Badge tone="matcha">{leftIndex + 1}</Badge> : null}
                        <span>{pair.right}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {exercise.kind === "ordering" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted">Susun potongan kata dari kiri ke kanan.</p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={checked || (response.kind === "ordering" ? response.order.length : 0) === 0}
                onClick={() => onChange({ kind: "ordering", order: [] })}
              >
                <Icon name="rotate" size={14} /> Hapus
              </Button>
            </div>
            <div className="min-h-20 rounded-2xl border border-dashed border-line bg-surface-2/50 p-3">
              {response.kind === "ordering" && response.order.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {response.order.map((tokenIndex, position) => (
                    <button
                      key={`${tokenIndex}-${position}`}
                      type="button"
                      disabled={checked}
                      aria-label={`Hapus ${exercise.tokens[tokenIndex]}`}
                      onClick={() =>
                        onChange({ kind: "ordering", order: response.order.filter((_, current) => current !== position) })
                      }
                      className="font-jp rounded-xl border border-brand/30 bg-surface px-3 py-2 text-lg text-ink transition-colors hover:border-brand"
                    >
                      {exercise.tokens[tokenIndex]}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-3 text-center text-sm text-muted">Ketuk potongan kata di bawah untuk menyusun kalimat.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {exercise.tokens.map((token, index) => {
                const used = response.kind === "ordering" ? response.order.includes(index) : false;
                return (
                  <button
                    key={`${index}-${token}`}
                    type="button"
                    disabled={checked || used}
                    onClick={() => {
                      if (response.kind !== "ordering") return;
                      onChange({ kind: "ordering", order: [...response.order, index] });
                    }}
                    className={cn(
                      "font-jp rounded-xl border px-3 py-2 text-lg transition-colors",
                      used
                        ? "border-line bg-surface-2 text-muted opacity-40"
                        : "border-line bg-surface text-ink hover:border-brand hover:bg-brand-soft",
                    )}
                  >
                    {token}
                  </button>
                );
              })}
            </div>
            {exercise.translation ? <p className="text-sm text-muted">Arti: {exercise.translation}</p> : null}
          </div>
        ) : null}
      </div>

      {showFeedback && checked && grade ? (
        <div
          role="status"
          className={cn(
            "space-y-1.5 border-t p-5 sm:p-6",
            grade.correct ? "border-matcha/30 bg-matcha-soft/50" : "border-brand/30 bg-brand-soft/50",
          )}
        >
          <p className={cn("flex items-center gap-2 text-sm font-semibold", grade.correct ? "text-matcha" : "text-brand-strong")}>
            <Icon name={grade.correct ? "checkCircle" : "xCircle"} size={17} />
            {grade.correct ? "Jawaban benar" : grade.score > 0 ? `Sebagian benar (${Math.round(grade.score * 100)}%)` : "Jawaban belum tepat"}
          </p>
          <PromptText text={grade.feedback} className="text-sm leading-relaxed text-ink" />
          {exercise.kind === "reading-recognition" ? (
            <p className="font-jp text-sm text-ink">
              Bacaan: <JpText text={exercise.reading} />
            </p>
          ) : null}
          {exercise.kind === "listening" && exercise.script ? (
            <p className="font-jp text-sm text-ink">
              Transkrip: <JpText text={exercise.script} />
            </p>
          ) : null}
          {exercise.kind === "typing" && exercise.meaning ? (
            <p className="text-sm text-muted">Arti: {exercise.meaning}</p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
