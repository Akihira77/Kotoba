"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { SpeakButton } from "@/components/japanese";
import { ExerciseRunner } from "@/components/exercise-runner";
import { useProgress } from "@/components/providers/progress-provider";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LinkButton,
  Modal,
  ProgressBar,
  Segmented,
} from "@/components/ui";
import {
  getKana,
  getKanaChart,
  KANA_BY_ID,
  KANA_GROUP_LABELS,
  KANA_SCRIPT_LABELS,
  KANA_TOTALS,
} from "@/content/kana";
import { XP_RULES } from "@/lib/constants";
import { exercisesFromQuizQuestions } from "@/lib/exercise-catalog";
import { kanaQuestion } from "@/lib/quiz";
import type { Exercise, ExerciseGrade, Kana, KanaGroup, KanaScript, QuizQuestion } from "@/lib/types";
import { cn, formatNumber, sample } from "@/lib/utils";

const SCRIPT_OPTIONS: Array<{ value: KanaScript; label: string }> = [
  { value: "hiragana", label: "Hiragana ひらがな" },
  { value: "katakana", label: "Katakana カタカナ" },
];

const GROUPS: KanaGroup[] = ["basic", "dakuten", "handakuten", "yoon"];

export default function KanaPage() {
  const { snapshot, recordKana, recordLesson } = useProgress();
  const [script, setScript] = useState<KanaScript>("hiragana");
  const [group, setGroup] = useState<KanaGroup>("basic");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizTitle, setQuizTitle] = useState("");

  const rows = useMemo(() => getKanaChart(script, group), [script, group]);
  const groupItems = useMemo(() => getKana(script).filter((item) => item.group === group), [script, group]);
  const allScript = useMemo(() => getKana(script), [script]);
  const progress = useMemo(() => new Map(snapshot.kana.map((row) => [row.char, row])), [snapshot.kana]);
  const selected: Kana | undefined = selectedId ? KANA_BY_ID.get(selectedId) : undefined;

  const scriptProgress = snapshot.kana.filter((row) => row.script === script);
  const mastered = scriptProgress.filter((row) => row.mastery >= 4).length;
  const learned = scriptProgress.length;
  const total = KANA_TOTALS[script];
  const groupCounts = useMemo(
    () => Object.fromEntries(GROUPS.map((key) => [key, allScript.filter((item) => item.group === key).length])),
    [allScript],
  );

  function openQuiz(items: Kana[], title: string) {
    const picked = sample(items, Math.min(8, items.length));
    const questions = picked
      .flatMap((item) => [kanaQuestion(item, allScript, "reading"), kanaQuestion(item, allScript, "writing")])
      .slice(0, 12);
    setQuizQuestions(questions);
    setQuizTitle(title);
    setQuizOpen(true);
  }

  function handleAnswer(question: QuizQuestion, _selectedIndex: number, correct: boolean) {
    const kana = question.sourceId ? KANA_BY_ID.get(question.sourceId) : undefined;
    if (!kana) return;
    void recordKana({ char: kana.char, script: kana.script, correct });
  }

  function handleExerciseAnswer(exercise: Exercise, grade: ExerciseGrade) {
    const question = quizQuestions.find((item) => `quiz-${item.id}` === exercise.id);
    if (question) handleAnswer(question, -1, grade.correct);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Dasar membaca & menulis</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Kana</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Hiragana untuk kata asli Jepang dan katakana untuk kata serapan. Ketuk karakter untuk melihat cara baca,
            contoh kata, dan latihan.
          </p>
        </div>
        <Button onClick={() => openQuiz(groupItems, `Kuis ${KANA_SCRIPT_LABELS[script]} · ${KANA_GROUP_LABELS[group]}`)} disabled={groupItems.length === 0}>
          <Icon name="zap" size={16} /> Kuis kelompok ini
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="min-w-0 p-4 sm:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented options={SCRIPT_OPTIONS} value={script} onChange={(value) => { setScript(value); setSelectedId(null); }} />
            <Badge tone="muted">{rows.length} baris</Badge>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <div className="flex flex-col gap-0.5 text-xs sm:flex-row sm:justify-between">
                <span className="font-medium">{learned} dipelajari · {mastered} dikuasai</span>
                <span className="tnum text-muted">{mastered}/{total} karakter</span>
              </div>
              <ProgressBar value={(mastered / total) * 100} className="mt-1.5" label="Kana dikuasai" />
            </div>
            <div className="text-xs text-muted">
              <p><span className="font-bold text-ink">{formatNumber(total)}</span> karakter</p>
              <p>termasuk dakuten & yōon</p>
            </div>
          </div>
        </Card>
        <Card className="flex min-w-0 flex-col justify-center gap-2 p-4">
          <p className="text-xs font-semibold text-muted">Skrip lainnya</p>
          <div className="flex items-center justify-between text-sm">
            <span>{KANA_SCRIPT_LABELS[script === "hiragana" ? "katakana" : "hiragana"]}</span>
            <span className="tnum text-muted">
              {snapshot.kana.filter((row) => row.script !== script && row.mastery >= 4).length}/{KANA_TOTALS[script === "hiragana" ? "katakana" : "hiragana"]}
            </span>
          </div>
          <ProgressBar
            value={(snapshot.kana.filter((row) => row.script !== script && row.mastery >= 4).length / KANA_TOTALS[script === "hiragana" ? "katakana" : "hiragana"]) * 100}
            barClassName="bg-indigo"
            label="Progres skrip lainnya"
          />
          <button type="button" className="mt-1 inline-flex min-h-6 items-center text-left text-xs font-medium text-brand" onClick={() => { setScript(script === "hiragana" ? "katakana" : "hiragana"); setGroup("basic"); }}>
            Beralih ke {KANA_SCRIPT_LABELS[script === "hiragana" ? "katakana" : "hiragana"]} →
          </button>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="no-scrollbar flex min-w-0 max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-surface-2 p-1">
          {GROUPS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => { setGroup(key); setSelectedId(null); }}
              aria-pressed={group === key}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition",
                group === key ? "bg-surface text-ink shadow-soft" : "text-muted hover:text-ink",
              )}
            >
              {KANA_GROUP_LABELS[key]} <span className="ml-1 text-[10px] text-muted tnum">{groupCounts[key]}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">Ketuk karakter untuk detail & pelafalan.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-4 sm:p-5">
          {group === "basic" && (
            <div className="mb-2 grid grid-cols-[2rem_repeat(5,1fr)] gap-1.5 text-center text-[10px] font-medium uppercase tracking-wide text-muted">
              <span />
              {["a", "i", "u", "e", "o"].map((vowel) => <span key={vowel}>{vowel}</span>)}
            </div>
          )}
          <div className="space-y-1.5">
            {rows.map((row) => (
              <div key={row.row} className="grid grid-cols-[2rem_1fr] items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted">{row.label}</span>
                <div
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: `repeat(${row.cells.length}, minmax(0, 1fr))` }}
                >
                  {row.cells.map((cell, index) => {
                    if (!cell) return <span key={index} aria-hidden="true" className="rounded-xl bg-surface-2/30" />;
                    const rowProgress = progress.get(cell.char);
                    const mastery = rowProgress?.mastery ?? 0;
                    const masteryText = mastery >= 4 ? "Dikuasai" : mastery >= 2 ? "Familiar" : mastery > 0 ? "Sedang belajar" : "Belum dilatih";
                    return (
                      <button
                        key={cell.id}
                        type="button"
                        onClick={() => setSelectedId(cell.id)}
                        aria-label={`${cell.char} (${cell.romaji}), ${masteryText}`}
                        aria-pressed={selectedId === cell.id}
                        className={cn(
                          "group relative flex aspect-[5/4] flex-col items-center justify-center rounded-xl border bg-surface transition hover:-translate-y-0.5 hover:border-brand/40 sm:aspect-[4/3]",
                          selectedId === cell.id ? "border-brand ring-2 ring-brand/20" : "border-line",
                        )}
                      >
                        <span className="font-jp text-xl font-semibold leading-none sm:text-2xl" lang="ja">{cell.char}</span>
                        <span className="mt-0.5 text-[10px] text-muted">{cell.romaji}</span>
                        {mastery > 0 && (
                          <span
                            className={cn(
                              "absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full",
                              mastery >= 4 ? "bg-matcha" : mastery >= 2 ? "bg-gold" : "bg-brand/50",
                            )}
                            title={masteryText}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {rows.length === 0 && <EmptyState icon="kana" title="Belum ada karakter" description="Kelompok ini belum tersedia." />}
        </Card>

        <div className="space-y-4">
          {selected ? (
            <Card className="sticky top-20 overflow-hidden">
              <div className="bg-seigaiha border-b border-line p-5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {KANA_SCRIPT_LABELS[selected.script]} · {KANA_GROUP_LABELS[selected.group]}
                </p>
                <p className="mt-1 font-jp text-6xl font-semibold" lang="ja">{selected.char}</p>
                <p className="mt-1 text-lg font-semibold text-brand">{selected.romaji}</p>
                <div className="mt-2 flex justify-center">
                  <SpeakButton text={selected.char} variant="solid" />
                </div>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Cara mengingat</p>
                  <p className="mt-1 text-sm leading-relaxed">{selected.mnemonic ?? "Hubungkan bentuk karakter dengan bunyinya melalui latihan berulang."}</p>
                </div>
                {selected.examples.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Contoh kata</p>
                    <ul className="mt-2 space-y-2">
                      {selected.examples.map((example) => (
                        <li key={example.word} className="flex items-start justify-between gap-2 rounded-xl bg-surface-2/50 p-2.5">
                          <div>
                            <p className="font-jp text-base font-medium" lang="ja">{example.word}</p>
                            <p className="text-[11px] text-muted">{example.romaji} · {example.meaning}</p>
                          </div>
                          <SpeakButton text={example.word} speech={example.reading ?? example.word} size={14} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="rounded-xl border border-line bg-surface-2/40 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Latihan tercatat</span>
                    <span className="tnum">{(progress.get(selected.char)?.correct ?? 0)} benar / {(progress.get(selected.char)?.wrong ?? 0)} salah</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span>Tingkat penguasaan</span>
                    <Badge tone={(progress.get(selected.char)?.mastery ?? 0) >= 4 ? "matcha" : "muted"}>
                      {["Baru", "Baru", "Belajar", "Familiar", "Dikuasai", "Dikuasai"][progress.get(selected.char)?.mastery ?? 0]}
                    </Badge>
                  </div>
                </div>
                <Button className="w-full" size="sm" onClick={() => openQuiz([selected], `Latihan ${selected.char}`)}>
                  <Icon name="zap" size={15} /> Latih karakter ini
                </Button>
                <LinkButton
                  href={"/writing/" + encodeURIComponent(`writing-${selected.script}-${selected.char}`)}
                  variant="secondary"
                  size="sm"
                  className="mt-2 w-full"
                >
                  <Icon name="writing" size={15} /> Pelajari urutan goresan
                </LinkButton>
              </div>
            </Card>
          ) : (
            <Card className="sticky top-20 p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold"><Icon name="lightbulb" size={16} className="text-gold" /> Tips belajar kana</h2>
              <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-muted">
                <li>• Pelajari 5 karakter per sesi, lalu ulangi besok sebelum menambah yang baru.</li>
                <li>• Ucapkan bunyi dengan keras sambil menulis karakter di udara.</li>
                <li>• Katakana muncul pada kata serapan seperti コーヒー (kopi) dan コンピューター (komputer).</li>
                <li>• Gunakan tombol speaker untuk memeriksa pelafalan alami.</li>
              </ul>
              <div className="mt-4 rounded-xl bg-brand-soft/50 p-3">
                <p className="font-jp text-base" lang="ja">{script === "hiragana" ? "あいうえお" : "アイウエオ"}</p>
                <p className="mt-1 text-[11px] text-muted">Baris vokal adalah fondasi semua baris lainnya.</p>
              </div>
            </Card>
          )}
          <Card className="p-4">
            <p className="text-xs font-semibold">Belum yakin dengan satu karakter?</p>
            <p className="mt-1 text-xs text-muted">Buka latihan kana lengkap dengan campuran membaca dan menulis.</p>
            <LinkButton href="/practice" variant="secondary" size="sm" className="mt-2 w-full">Buka latihan campuran</LinkButton>
          </Card>
        </div>
      </div>

      <Modal open={quizOpen} onClose={() => setQuizOpen(false)} title={quizTitle} size="lg">
        {quizOpen && (
          <ExerciseRunner
            key={quizQuestions.map((question) => question.id).join("|")}
            exercises={exercisesFromQuizQuestions(quizQuestions, quizTitle)}
            title={quizTitle}
            mode="practice"
            level="N5"
            onAnswer={handleExerciseAnswer}
            onComplete={(attempt) => {
              void recordLesson({
                lessonId: `kana-${script}-${group}`,
                kind: "kana-set",
                score: attempt.score,
                xp: XP_RULES.lesson["kana-set"],
              });
            }}
            completeHref="/kana"
            completeLabel="Kembali ke peta kana"
            allowRetry
          />
        )}
      </Modal>
    </div>
  );
}
