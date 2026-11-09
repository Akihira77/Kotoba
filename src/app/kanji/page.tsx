"use client";

import { useMemo, useState } from "react";
import { Flashcards, type FlashcardData } from "@/components/flashcards";
import { Icon } from "@/components/icons";
import { SpeakButton } from "@/components/japanese";
import { ExerciseRunner } from "@/components/exercise-runner";
import { useProgress } from "@/components/providers/progress-provider";
import { SavedItemEditor, SaveButton } from "@/components/saved-item-editor";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LinkButton,
  Modal,
  ProgressBar,
  SearchInput,
  StatTile,
} from "@/components/ui";
import { KANJI, KANJI_BY_CHAR, KANJI_BY_ID } from "@/content/kanji";
import { exercisesFromQuizQuestions } from "@/lib/exercise-catalog";
import { kanjiQuestion } from "@/lib/quiz";
import { isDue, masteryLabel, type Rating } from "@/lib/srs";
import { JLPT_LEVELS, type CardProgress, type Exercise, type ExerciseGrade, type JLPTLevel, type Kanji, type QuizQuestion } from "@/lib/types";
import { cn, formatDate, formatNumber, sample } from "@/lib/utils";

type Tab = "daftar" | "ulasan";
type LevelFilter = JLPTLevel | "semua";

export default function KanjiPage() {
  const { snapshot, recordReview } = useProgress();
  const [tab, setTab] = useState<Tab>("daftar");
  const [level, setLevel] = useState<LevelFilter>("semua");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Kanji | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [sessionCards, setSessionCards] = useState<FlashcardData[] | null>(null);

  const cardMap = useMemo(() => new Map(snapshot.cards.map((card) => [card.itemId, card])), [snapshot.cards]);
  const dueCards = useMemo(() => snapshot.cards.filter((card) => card.kind === "kanji" && isDue(card)), [snapshot.cards]);
  const filtered = useMemo(() => {
    const query = search.trim();
    return KANJI.filter((item) => {
      if (level !== "semua" && item.level !== level) return false;
      if (!query) return true;
      return [item.char, item.meanings.join(" "), item.on.join(" "), item.kun.join(" ")].some((field) => field.includes(query));
    });
  }, [level, search]);

  const learnedCount = KANJI.filter((item) => cardMap.has(item.char)).length;
  const masteredCount = KANJI.filter((item) => {
    const card = cardMap.get(item.char);
    return card ? masteryLabel(card.reps, card.lapses) === "Dikuasai" : false;
  }).length;
  const hasSession = dueCards.length > 0 || KANJI.some((item) => !cardMap.has(item.char));

  function buildSession(): FlashcardData[] {
    const due = dueCards.slice(0, 20).flatMap((card) => {
      const item = KANJI_BY_CHAR.get(card.itemId);
      return item ? [toCard(item, card)] : [];
    });
    const known = new Set(snapshot.cards.map((card) => card.itemId));
    const fresh = sample(KANJI.filter((item) => !known.has(item.char)), 8).map((item) => toCard(item, cardMap.get(item.char)));
    return [...due, ...fresh];
  }

  async function rateCard(card: FlashcardData, rating: Rating) {
    await recordReview({ itemId: card.id, kind: "kanji", rating, correct: rating >= 2, mode: "kanji" });
  }

  function openQuiz() {
    const pool = filtered.length > 0 ? filtered : KANJI;
    const picked = sample(pool, Math.min(10, pool.length));
    const questions = sample(
      picked.flatMap((item) => [
        kanjiQuestion(item, pool, "meaning"),
        ...(item.examples.length > 0 ? [kanjiQuestion(item, pool, "reading")] : []),
      ]),
      10,
    );
    setQuizQuestions(questions);
    setQuizOpen(true);
  }

  function handleAnswer(question: QuizQuestion, _selectedIndex: number, correct: boolean) {
    const item = question.sourceId ? KANJI_BY_ID.get(question.sourceId) : undefined;
    if (!item) return;
    void recordReview({
      itemId: item.char,
      kind: "kanji",
      rating: correct ? 2 : 0,
      correct,
      mode: "kanji-quiz",
    });
  }

  function handleExerciseAnswer(exercise: Exercise, grade: ExerciseGrade) {
    const question = quizQuestions.find((item) => `quiz-${item.id}` === exercise.id);
    if (question) handleAnswer(question, -1, grade.correct);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Kanji & radikal</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Kanji</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Pelajari bentuk, jumlah guratan, radikal, bacaan on’yomi dan kun’yomi, serta contoh kata. Setiap kanji adalah
            kunci untuk membaca lebih banyak kosakata.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" aria-pressed={tab === "ulasan"} onClick={() => setTab(tab === "daftar" ? "ulasan" : "daftar")}>
            <Icon name="layers" size={16} /> {tab === "daftar" ? `Ulasan (${dueCards.length})` : "Daftar kanji"}
          </Button>
          <Button onClick={openQuiz}><Icon name="zap" size={16} /> Kuis kanji</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Kanji tersedia" value={formatNumber(KANJI.length)} hint="N5 sampai N1" icon="kanji" tone="brand" />
        <StatTile label="Sudah dipelajari" value={formatNumber(learnedCount)} hint={`${Math.round((learnedCount / KANJI.length) * 100)}% koleksi`} icon="book" tone="indigo" />
        <StatTile label="Dikuasai" value={formatNumber(masteredCount)} hint="Enam ulasan atau lebih" icon="award" tone="matcha" />
        <StatTile label="Jatuh tempo" value={formatNumber(dueCards.length)} hint={dueCards.length ? "Siap diulas" : "Semua sudah diulas"} icon="clock" tone="gold" />
      </div>

      {tab === "daftar" ? (
        <>
          <Card className="p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <SearchInput value={search} onChange={setSearch} placeholder="Cari kanji, arti, atau bacaan…" />
              <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-line bg-surface-2 p-1">
                {(["semua", ...JLPT_LEVELS] as LevelFilter[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLevel(value)}
                    aria-pressed={level === value}
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition",
                      level === value ? "bg-surface text-ink shadow-soft" : "text-muted hover:text-ink",
                    )}
                  >
                    {value === "semua" ? "Semua" : value}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-muted">{filtered.length} kanji ditampilkan</p>
          </Card>

          {filtered.length === 0 ? (
            <EmptyState icon="search" title="Kanji tidak ditemukan" description="Coba kata kunci lain atau pilih level berbeda." />
          ) : (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
              {filtered.map((item) => {
                const card = cardMap.get(item.char);
                return (
                  <button
                    key={item.char}
                    type="button"
                    onClick={() => setSelected(item)}
                    aria-label={`${item.char}, ${item.meanings.join(", ")}, ${item.level}, ${card ? masteryLabel(card.reps, card.lapses) : "Belum dilatih"}`}
                    className="group relative flex aspect-square flex-col items-center justify-center rounded-2xl border border-line bg-surface shadow-soft transition hover:-translate-y-0.5 hover:border-brand/40"
                  >
                    <span className="absolute left-1.5 top-1.5 text-[9px] font-semibold text-muted">{item.level}</span>
                    {card && (
                      <span
                        className={cn("absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full", card.reps >= 6 ? "bg-matcha" : card.reps >= 3 ? "bg-gold" : "bg-brand/60")}
                        title={masteryLabel(card.reps, card.lapses)}
                        aria-hidden="true"
                      />
                    )}
                    <span className="font-jp text-3xl font-medium transition group-hover:scale-105" lang="ja">{item.char}</span>
                    <span className="mt-0.5 line-clamp-1 px-1 text-[10px] text-muted">{item.meanings[0]}</span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div>
            {sessionCards ? (
              <Flashcards key={sessionCards.map((card) => card.id).join("|")} cards={sessionCards} title="Ulasan kanji" onRate={rateCard} onRestart={() => setSessionCards(buildSession())} />
            ) : (
              <Card className="p-6 text-center sm:p-8">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-soft text-indigo dark:bg-indigo/15">
                  <Icon name="kanji" size={24} />
                </span>
                <h2 className="mt-4 text-xl font-bold">Sesi ulangan kanji</h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted">
                  {dueCards.length > 0
                    ? `${dueCards.length} kanji jatuh tempo, ditambah beberapa kanji baru.`
                    : "Tidak ada kanji yang jatuh tempo. Kami siapkan kanji baru untukmu."}
                </p>
                <Button className="mt-5" onClick={() => setSessionCards(buildSession())} disabled={!hasSession}>
                  <Icon name="play" size={16} /> Mulai sesi
                </Button>
              </Card>
            )}
          </div>
          <aside className="space-y-4">
            <Card className="p-5">
              <h2 className="text-sm font-bold">Cara belajar kanji</h2>
              <ol className="mt-2 space-y-2 text-xs leading-relaxed text-muted">
                <li><span className="font-semibold text-ink">1.</span> Kenali arti dasar dan radikalnya.</li>
                <li><span className="font-semibold text-ink">2.</span> Hafalkan satu bacaan yang paling sering dipakai.</li>
                <li><span className="font-semibold text-ink">3.</span> Kaitkan dengan dua kata contoh.</li>
                <li><span className="font-semibold text-ink">4.</span> Tulis kanji beberapa kali sambil menyebut artinya.</li>
              </ol>
            </Card>
            <Card className="p-5">
              <h2 className="text-sm font-bold">Progres</h2>
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between"><span>Dipelajari</span><span className="tnum">{learnedCount}/{KANJI.length}</span></div>
                  <ProgressBar value={(learnedCount / KANJI.length) * 100} className="mt-1" label="Kanji dipelajari" />
                </div>
                <div>
                  <div className="flex justify-between"><span>Dikuasai</span><span className="tnum">{masteredCount}</span></div>
                  <ProgressBar value={(masteredCount / KANJI.length) * 100} barClassName="bg-matcha" label="Kanji dikuasai" />
                </div>
              </div>
            </Card>
          </aside>
        </div>
      )}

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected ? `Kanji ${selected.char}` : "Kanji"} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-col items-center rounded-2xl bg-surface-2/50 p-5">
              <p className="font-jp text-6xl font-medium" lang="ja">{selected.char}</p>
              <p className="mt-1 text-sm font-semibold">{selected.meanings.join(" · ")}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                <span>{selected.strokes} guratan</span>
                <span>·</span>
                <span>Radikal {selected.radical} ({selected.radicalMeaning})</span>
                <Badge tone="muted">{selected.level}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <LinkButton
                href={"/writing/" + encodeURIComponent(`writing-kanji-${selected.char}`)}
                variant="secondary"
                size="sm"
              >
                <Icon name="writing" size={15} /> Urutan goresan
              </LinkButton>
              <SaveButton kind="kanji" refId={selected.id} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">On’yomi (bunyi Tionghoa)</p>
                <p className="mt-1 font-jp text-lg" lang="ja">{selected.on.length ? selected.on.join("、") : "—"}</p>
              </div>
              <div className="rounded-xl border border-line p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Kun’yomi (bunyi Jepang)</p>
                <p className="mt-1 font-jp text-lg" lang="ja">{selected.kun.length ? selected.kun.join("、") : "—"}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Kata contoh</p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {selected.examples.map((example) => (
                  <li key={example.word} className="flex items-start justify-between gap-2 rounded-xl border border-line p-3">
                    <div>
                      <p className="font-jp text-base font-medium" lang="ja">{example.word}</p>
                      <p className="text-xs text-muted"><span lang="ja">{example.reading}</span> · {example.meaning}</p>
                    </div>
                    <SpeakButton text={example.word} speech={example.reading} size={14} />
                  </li>
                ))}
              </ul>
            </div>

            {selected.mnemonic && (
              <div className="rounded-xl border border-gold/25 bg-gold-soft/40 p-3 text-sm">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-gold"><Icon name="lightbulb" size={14} /> Cara mengingat</p>
                <p className="mt-1 text-muted">{selected.mnemonic}</p>
              </div>
            )}

            <SavedItemEditor key={selected.id} kind="kanji" refId={selected.id} title="Simpan kanji ini" />
            {cardMap.get(selected.char) ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-2/50 px-3 py-2 text-xs">
                <span>{cardMap.get(selected.char)?.reps} ulasan · {masteryLabel(cardMap.get(selected.char)!.reps, cardMap.get(selected.char)!.lapses)}</span>
                <span className="text-muted">Jadwal berikutnya {formatDate(cardMap.get(selected.char)!.dueAt)}</span>
              </div>
            ) : (
              <p className="rounded-xl bg-brand-soft/40 px-3 py-2 text-xs">Kanji ini belum masuk koleksi ulangan. Jawab kuis kanji atau mulai sesi ulasan untuk menambahkannya.</p>
            )}
          </div>
        )}
      </Modal>

      <Modal open={quizOpen} onClose={() => setQuizOpen(false)} title="Kuis kanji" size="lg">
        {quizOpen && (
          <ExerciseRunner
            key={quizQuestions.map((question) => question.id).join("|")}
            exercises={exercisesFromQuizQuestions(quizQuestions, "Kuis kanji")}
            title="Kuis kanji"
            mode="practice"
            level={quizQuestions[0]?.level}
            onAnswer={handleExerciseAnswer}
            completeHref="/kanji"
            completeLabel="Kembali ke daftar kanji"
            allowRetry
          />
        )}
      </Modal>
    </div>
  );
}

function toCard(item: Kanji, card?: CardProgress): FlashcardData {
  const readings = [...item.on, ...item.kun].slice(0, 3).join("、");
  const example = item.examples[0];
  return {
    id: item.char,
    kind: "kanji",
    front: item.char,
    reading: readings || undefined,
    back: item.meanings.join(", "),
    example: example?.word,
    exampleReading: example?.reading,
    exampleMeaning: example ? `${example.reading} · ${example.meaning}` : undefined,
    badge: item.level,
    note: readings ? `Bacaan: ${readings}${item.mnemonic ? ` — ${item.mnemonic}` : ""}` : item.mnemonic,
    card,
  };
}