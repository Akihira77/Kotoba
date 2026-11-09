"use client";

import { useRef, type KeyboardEvent } from "react";
import { AddToCards } from "@/components/add-to-cards";
import { JpText, SpeakButton, hasJapanese } from "@/components/japanese";
import { Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import type { ExamQuestion } from "@/lib/exam-engine";
import { cn } from "@/lib/utils";

export function ExamQuestionCard({
  item,
  number,
  total,
  selected,
  onSelect,
  checked,
}: {
  item: ExamQuestion;
  number: number;
  total: number;
  selected: number | null;
  onSelect: (index: number) => void;
  checked: boolean;
}) {
  const { question, passage } = item;
  const correct = selected === question.answerIndex;
  const answered = selected !== null;
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function onOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, optionIndex: number) {
    if (checked) return;
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    const next = (optionIndex + delta + question.options.length) % question.options.length;
    optionRefs.current[next]?.focus();
    onSelect(next);
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2/60 px-5 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="brand">{item.categoryLabel}</Badge>
          <Badge tone="muted">{question.level}</Badge>
          <span className="text-xs text-muted">Soal {number} dari {total}</span>
        </div>
        {checked ? (
          correct ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-matcha"><Icon name="checkCircle" size={15} /> Benar</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand"><Icon name="xCircle" size={15} /> {answered ? "Belum tepat" : "Kosong"}</span>
          )
        ) : null}
        <span role="status" aria-live="polite" className="sr-only">
          {checked ? (correct ? "Jawaban benar" : "Jawaban belum tepat") : ""}
        </span>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {passage ? (
          <div className="rounded-2xl border border-line bg-surface-2/50 p-4">
            <div className="mb-2 flex flex-wrap items-baseline gap-2">
              <p className="text-sm font-semibold text-ink">{passage.title}</p>
              <span className="font-jp text-xs text-muted">{passage.titleJp}</span>
              <span className="ml-auto text-[11px] text-muted">Teks bacaan</span>
            </div>
            <JpText text={passage.text} className="text-[15px] leading-8 text-ink" />
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="text-base font-semibold leading-relaxed text-ink">{question.prompt}</p>
          {question.promptJp ? <JpText text={question.promptJp} className="text-lg text-ink" /> : null}
        </div>

        {question.type === "listening" && question.audioText ? (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface-2/50 p-3">
            <SpeakButton text={question.audioText} label="Putar audio soal" variant="solid" />
            <SpeakButton text={question.audioText} slow label="Putar audio lambat" />
            <span className="text-xs text-muted">Audio dari suara browser. Transkrip terbuka setelah jawaban diperiksa.</span>
          </div>
        ) : null}

        <div className="grid gap-2" role="radiogroup" aria-label={"Pilihan jawaban soal " + number}>
          {question.options.map((option, index) => {
            const isSelected = selected === index;
            const isAnswer = index === question.answerIndex;
            const showCorrect = checked && isAnswer;
            const showWrong = checked && isSelected && !isAnswer;
            return (
              <button
                key={String(index) + option}
                ref={(node) => { optionRefs.current[index] = node; }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-disabled={checked}
                tabIndex={isSelected || (selected === null && index === 0) ? 0 : -1}
                onClick={() => { if (!checked) onSelect(index); }}
                onKeyDown={(event) => onOptionKeyDown(event, index)}
                className={cn(
                  "flex min-h-12 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition",
                  "border-line bg-surface hover:border-brand/40 hover:bg-brand-soft/40",
                  isSelected && !checked && "border-brand bg-brand-soft text-brand-strong",
                  showCorrect && "border-matcha bg-matcha-soft text-ink",
                  showWrong && "border-brand bg-brand-soft text-brand-strong",
                  checked && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                    isSelected ? "border-current" : "border-line bg-surface-2 text-muted",
                    showCorrect && "border-matcha bg-matcha text-white",
                  )}
                >
                  {showCorrect ? <Icon name="check" size={13} /> : String.fromCharCode(65 + index)}
                </span>
                <span className={cn(hasJapanese(option) && "font-jp text-base")}>{option}</span>
              </button>
            );
          })}
        </div>

        {checked ? (
          <div className="space-y-3 border-t border-line pt-4">
            {!correct ? (
              <p className="text-sm text-ink">
                <span className="font-semibold">Jawaban tepat:</span>{" "}
                <span className={cn(hasJapanese(question.options[question.answerIndex]) && "font-jp")}>{question.options[question.answerIndex]}</span>
              </p>
            ) : null}
            <div className="rounded-2xl bg-surface-2/70 p-4 text-sm leading-relaxed text-ink">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted"><Icon name="info" size={14} /> Pembahasan</p>
              <p>{question.explanation}</p>
            </div>
            {item.transcript ? (
              <div className="rounded-2xl border border-line p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Transkrip audio</p>
                <p className="whitespace-pre-line font-jp text-sm leading-7 text-ink">{item.transcript}</p>
                {item.translation ? <p className="mt-2 text-sm text-muted">{item.translation}</p> : null}
              </div>
            ) : null}
            {passage ? (
              <div className="rounded-2xl border border-line p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Terjemahan teks</p>
                <p className="space-y-1 text-sm leading-relaxed text-muted">{passage.translation.join(" ")}</p>
              </div>
            ) : null}
            {item.itemKind && item.itemId ? (
              <AddToCards kind={item.itemKind} itemId={item.itemId} />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
