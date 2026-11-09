"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { Badge, Button, Card, SectionHeading } from "@/components/ui";
import type { CultureQuizQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CultureQuiz({ questions }: { questions: CultureQuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  if (questions.length === 0) return null;

  const answered = questions.filter((question) => answers[question.id] !== undefined).length;
  const correct = questions.filter((question) => answers[question.id] === question.answerIndex).length;
  const complete = answered === questions.length;

  return (
    <Card className="p-5 sm:p-6" id="kuis">
      <SectionHeading
        title="Mini kuis"
        icon="practice"
        description="Uji pemahaman singkat setelah membaca. Umpan balik muncul segera."
        action={<Badge tone={complete ? "matcha" : "muted"}>{answered}/{questions.length} dijawab</Badge>}
      />

      <div className="space-y-5">
        {questions.map((question, questionIndex) => {
          const answer = answers[question.id];
          const revealed = answer !== undefined;
          const isCorrect = answer === question.answerIndex;
          return (
            <div key={question.id}>
              <p className="text-sm font-semibold leading-relaxed">{questionIndex + 1}. {question.prompt}</p>
              <div className="mt-3 grid gap-2">
                {question.options.map((option, optionIndex) => {
                  const isAnswer = optionIndex === question.answerIndex;
                  const isChosen = optionIndex === answer;
                  return (
                    <button
                      key={`${question.id}-${optionIndex}`}
                      type="button"
                      aria-disabled={revealed}
                      aria-pressed={isChosen}
                      onClick={() => {
                        if (revealed) return;
                        setAnswers((current) => (current[question.id] !== undefined ? current : { ...current, [question.id]: optionIndex }));
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                        !revealed && "border-line hover:border-brand/40 hover:bg-surface-2",
                        revealed && isAnswer && "border-matcha/50 bg-matcha-soft/60",
                        revealed && isChosen && !isAnswer && "border-brand/40 bg-brand-soft/50",
                        revealed && !isAnswer && !isChosen && "border-line opacity-60",
                      )}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-[11px] font-bold">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {revealed && isAnswer && <Icon name="checkCircle" size={16} className="text-matcha" />}
                    </button>
                  );
                })}
              </div>
              {revealed && (
                <div
                  role="status"
                  className={cn("mt-2 rounded-xl border p-3 text-xs leading-relaxed", isCorrect ? "border-matcha/30 bg-matcha-soft/40" : "border-brand/25 bg-brand-soft/30")}
                >
                  <p className="font-semibold">
                    {isCorrect ? "Benar." : "Belum tepat."} Jawaban: {question.options[question.answerIndex]}.
                  </p>
                  <p className="mt-1 text-muted">{question.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {complete && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-2/50 p-3 text-xs">
          <p aria-live="polite">
            <strong>{correct} dari {questions.length}</strong> benar.{" "}
            {correct === questions.length ? "Pemahaman artikel ini sudah kuat." : "Baca ulang bagian yang belum jelas, lalu coba lagi."}
          </p>
          <Button variant="secondary" size="sm" onClick={() => setAnswers({})}>
            <Icon name="rotate" size={14} /> Ulangi kuis
          </Button>
        </div>
      )}
    </Card>
  );
}
