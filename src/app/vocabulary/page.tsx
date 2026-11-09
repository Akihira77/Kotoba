"use client";

import { useEffect, useMemo, useState } from "react";
import { ExerciseRunner } from "@/components/exercise-runner";
import { Flashcards, type FlashcardData } from "@/components/flashcards";
import { Icon } from "@/components/icons";
import { SavedItemEditor, SaveButton } from "@/components/saved-item-editor";
import { JpText, SpeakButton } from "@/components/japanese";
import { useProgress } from "@/components/providers/progress-provider";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  ProgressBar,
  SearchInput,
  Select,
  StatTile,
} from "@/components/ui";
import { VOCABULARY, VOCAB_BY_ID } from "@/content/vocabulary";
import { LEVEL_LABELS, PAGE_SIZE, TOPIC_LABELS } from "@/lib/constants";
import { buildExerciseCatalog } from "@/lib/exercise-catalog";
import { isDue, masteryLabel, type Rating } from "@/lib/srs";
import {
  JLPT_LEVELS,
  type CardProgress,
  type Exercise,
  type ExerciseKind,
  type JLPTLevel,
  type QuestionStat,
  type VocabTopic,
  type VocabWord,
} from "@/lib/types";
import { formatDate, formatNumber, relativeDue, sample, shuffle } from "@/lib/utils";

type Tab = "kamus" | "ulasan" | "kuis";
type LevelFilter = JLPTLevel | "semua";
type TopicFilter = VocabTopic | "semua";

const TOPIC_KEYS = Object.keys(TOPIC_LABELS) as VocabTopic[];

export default function VocabularyPage() {
  const { snapshot, recordReview } = useProgress();
  const [tab, setTab] = useState<Tab>("kamus");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<LevelFilter>("semua");
  const [topic, setTopic] = useState<TopicFilter>("semua");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<VocabWord | null>(null);
  const [sessionCards, setSessionCards] = useState<FlashcardData[] | null>(null);
  const [vocabExercises, setVocabExercises] = useState<Exercise[] | null>(null);
  const [quizKey, setQuizKey] = useState(0);

  const settings = snapshot.profile.settings;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const requestedLevel = params.get("level");
      if (requestedLevel && JLPT_LEVELS.includes(requestedLevel as JLPTLevel)) {
        setLevel(requestedLevel as JLPTLevel);
        setPage(1);
      }
      const requestedQuery = params.get("q")?.trim();
      if (requestedQuery) {
        setSearch(requestedQuery);
        setPage(1);
      }
      const requestedTopic = params.get("topic");
      if (requestedTopic && (TOPIC_KEYS as string[]).includes(requestedTopic)) {
        setTopic(requestedTopic as TopicFilter);
        setPage(1);
      }
      if (params.get("tab") === "review") setTab("ulasan");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const cardMap = useMemo(() => new Map(snapshot.cards.map((card) => [card.itemId, card])), [snapshot.cards]);
  const dueVocabCards = useMemo(
    () => snapshot.cards.filter((card) => card.kind === "vocab" && isDue(card)),
    [snapshot.cards],
  );
  const newWords = useMemo(() => VOCABULARY.filter((word) => !cardMap.has(word.id)), [cardMap]);
  const learnedCount = VOCABULARY.filter((word) => cardMap.has(word.id)).length;
  const masteredCount = VOCABULARY.filter((word) => {
    const card = cardMap.get(word.id);
    return card ? masteryLabel(card.reps, card.lapses) === "Dikuasai" : false;
  }).length;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return VOCABULARY.filter((word) => {
      if (level !== "semua" && word.level !== level) return false;
      if (topic !== "semua" && word.topic !== topic) return false;
      if (!query) return true;
      return [word.japanese, word.kana, word.romaji, word.meaning].some((field) => field.toLowerCase().includes(query));
    });
  }, [search, level, topic]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function buildSession(): FlashcardData[] {
    const fromDue = dueVocabCards.slice(0, 20).flatMap((card) => {
      const word = VOCAB_BY_ID.get(card.itemId);
      return word ? [toCard(word, card)] : [];
    });
    const cardIds = new Set(snapshot.cards.map((card) => card.itemId));
    const fresh = sample(VOCABULARY.filter((word) => !cardIds.has(word.id)), 8).map((word) => toCard(word, cardMap.get(word.id)));
    return [...fromDue, ...fresh];
  }

  function startVocabQuiz() {
    const words = filtered.length > 0 ? filtered : VOCABULARY;
    const picked = buildVocabularyQuiz(words, cardMap, snapshot.questionStats, 10);
    if (picked.length === 0) return;
    setVocabExercises(picked);
    setQuizKey((value) => value + 1);
    setTab("kuis");
  }

  function startReview() {
    setSessionCards(buildSession());
  }

  async function rateCard(card: FlashcardData, rating: Rating) {
    await recordReview({
      itemId: card.id,
      kind: "vocab",
      rating,
      correct: rating >= 2,
      mode: "vocabulary",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Kosakata & ulangan berjarak</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Kosakata</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            {formatNumber(VOCABULARY.length)} kata dengan arti bahasa Indonesia dan contoh kalimat. Ulas kartu secara
            berkala agar kata-kata baru menempel di ingatan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={tab === "kamus" ? "primary" : "secondary"} aria-pressed={tab === "kamus"} onClick={() => setTab("kamus")}>
            <Icon name="book" size={16} /> Kamus
          </Button>
          <Button variant={tab === "ulasan" ? "primary" : "secondary"} aria-pressed={tab === "ulasan"} onClick={() => setTab("ulasan")}>
            <Icon name="layers" size={16} /> Ulasan {dueVocabCards.length > 0 && <span className="tnum">({dueVocabCards.length})</span>}
          </Button>
          <Button variant={tab === "kuis" ? "primary" : "secondary"} aria-pressed={tab === "kuis"} onClick={startVocabQuiz}>
            <Icon name="practice" size={16} /> Kuis
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total kosakata" value={formatNumber(VOCABULARY.length)} hint="N5 sampai N1" icon="vocab" tone="brand" />
        <StatTile label="Sudah dipelajari" value={formatNumber(learnedCount)} hint={`${Math.round((learnedCount / VOCABULARY.length) * 100)}% dari koleksi`} icon="book" tone="indigo" />
        <StatTile label="Dikuasai" value={formatNumber(masteredCount)} hint="Enam ulasan atau lebih" icon="award" tone="matcha" />
        <StatTile label="Jatuh tempo" value={formatNumber(dueVocabCards.length)} hint={dueVocabCards.length ? "Siap diulas hari ini" : "Tidak ada ulangan tertunda"} icon="clock" tone="gold" />
      </div>

      {tab === "kamus" ? (
        <>
          <Card className="p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_180px_200px]">
              <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Cari kata, kana, romaji, atau arti…" />
              <Select label="Level" value={level} onChange={(event) => { setLevel(event.target.value as LevelFilter); setPage(1); }}>
                <option value="semua">Semua level</option>
                {JLPT_LEVELS.map((item) => <option key={item} value={item}>{LEVEL_LABELS[item]}</option>)}
              </Select>
              <Select label="Topik" value={topic} onChange={(event) => { setTopic(event.target.value as TopicFilter); setPage(1); }}>
                <option value="semua">Semua topik</option>
                {TOPIC_KEYS.map((key) => <option key={key} value={key}>{TOPIC_LABELS[key]}</option>)}
              </Select>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <span>{formatNumber(filtered.length)} kata ditemukan</span>
              {(level !== "semua" || topic !== "semua" || search) && (
                <button type="button" className="font-medium text-brand" onClick={() => { setLevel("semua"); setTopic("semua"); setSearch(""); setPage(1); }}>
                  Reset filter
                </button>
              )}
            </div>
          </Card>

          {visible.length === 0 ? (
            <EmptyState
              icon="search"
              title="Kata tidak ditemukan"
              description="Coba kata kunci lain, atau longsorkan filter level dan topik."
              action={<Button variant="secondary" onClick={() => { setSearch(""); setLevel("semua"); setTopic("semua"); setPage(1); }}>Hapus filter</Button>}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((word) => {
                const card = cardMap.get(word.id);
                return (
                  <div key={word.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setSelected(word)}
                      className="h-full w-full rounded-2xl border border-line bg-surface p-4 pr-11 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-lift"
                    >
                      <div className="flex items-center gap-2">
                        <Badge tone={word.level === "N5" ? "matcha" : word.level === "N4" ? "indigo" : word.level === "N3" ? "gold" : "brand"}>{word.level}</Badge>
                        <span className="text-[11px] text-muted">{TOPIC_LABELS[word.topic]}</span>
                      </div>
                      <p className="mt-2 font-jp text-2xl font-semibold leading-tight" lang="ja">{word.japanese}</p>
                      <p className="font-jp text-sm text-muted" lang="ja">{word.kana}</p>
                      {settings.showRomaji && <p className="mt-0.5 text-[11px] italic text-muted">{word.romaji}</p>}
                      <p className="mt-2 line-clamp-2 text-sm">{word.meaning}</p>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                        <span>{card ? relativeDue(card.dueAt) : "Belum diulas"}</span>
                        {card && <span className="inline-flex items-center gap-1"><Icon name="layers" size={12} /> {card.reps}×</span>}
                      </div>
                    </button>
                    <div className="absolute right-2.5 top-2">
                      <SaveButton kind="vocabulary" refId={word.id} compact />
                    </div>
                    <div className="absolute right-2.5 top-11">
                      <SpeakButton text={word.japanese} speech={word.kana} size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pageCount > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted">Halaman {safePage} dari {pageCount}</p>
              <div className="flex items-center gap-1.5">
                <Button variant="secondary" size="sm" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                  <Icon name="chevronLeft" size={15} /> Sebelumnya
                </Button>
                <Button variant="secondary" size="sm" disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)}>
                  Berikutnya <Icon name="chevronRight" size={15} />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : tab === "ulasan" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div>
            {sessionCards ? (
              <Flashcards
                key={sessionCards.map((card) => card.id).join("|")}
                cards={sessionCards}
                title="Ulasan kosakata"
                onRate={rateCard}
                onRestart={startReview}
                showRomaji={settings.showRomaji}
              />
            ) : (
              <Card className="p-6 text-center sm:p-8">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand dark:bg-brand/15">
                  <Icon name="layers" size={24} />
                </span>
                <h2 className="mt-4 text-xl font-bold">Sesi ulangan kosakata</h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted">
                  {dueVocabCards.length > 0
                    ? `${dueVocabCards.length} kartu jatuh tempo dan ${Math.min(8, newWords.length)} kata baru siap diulas.`
                    : `Tidak ada kartu jatuh tempo. Kami siapkan ${Math.min(8, newWords.length)} kata baru untukmu.`}
                </p>
                <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-line bg-surface-2/40 p-4 text-left text-xs text-muted">
                  <p className="font-semibold text-ink">Cara kerja ulangan</p>
                  <p className="mt-1.5">Lihat kata Jepang, tebak artinya, lalu buka kartu. Nilai ingatanmu dengan empat pilihan: Lagi, Sulit, Bagus, atau Mudah. Penjadwalan berikutnya menyesuaikan penilaianmu.</p>
                </div>
                <Button className="mt-5" onClick={startReview} disabled={dueVocabCards.length === 0 && newWords.length === 0}>
                  <Icon name="play" size={16} /> Mulai sesi ulangan
                </Button>
              </Card>
            )}
          </div>
          <aside className="space-y-4">
            <Card className="p-5">
              <h2 className="text-sm font-bold">Ringkasan koleksi</h2>
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between"><span>Sudah dipelajari</span><span className="tnum">{learnedCount}/{VOCABULARY.length}</span></div>
                  <ProgressBar value={(learnedCount / VOCABULARY.length) * 100} className="mt-1" label="Koleksi dipelajari" />
                </div>
                <div>
                  <div className="flex justify-between"><span>Dikuasai</span><span className="tnum">{masteredCount}</span></div>
                  <ProgressBar value={(masteredCount / VOCABULARY.length) * 100} barClassName="bg-matcha" label="Koleksi dikuasai" />
                </div>
                <div className="flex justify-between border-t border-line pt-2">
                  <span>Total ulasan</span><span className="tnum">{formatNumber(snapshot.stats.totalReviews)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Akurasi ulasan</span><span className="tnum">{snapshot.stats.totalReviews ? Math.round((snapshot.stats.correctReviews / snapshot.stats.totalReviews) * 100) : 0}%</span>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold"><Icon name="info" size={15} className="text-brand" /> Tips SRS</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Jawab dengan jujur. Memilih “Mudah” saat belum yakin akan memperpanjang jeda terlalu cepat, sehingga kata
                itu bisa terlupakan sebelum diulas kembali.
              </p>
            </Card>
          </aside>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div>
            {vocabExercises ? (
              <ExerciseRunner
                key={quizKey}
                exercises={vocabExercises}
                title="Kuis kosakata"
                description={`${vocabExercises.length} soal campuran dari ${filtered.length > 0 ? filtered.length : VOCABULARY.length} kata pada filter ini. Soal yang sering salah dan kartu jatuh tempo diprioritaskan.`}
                mode="vocabulary"
                showAdaptiveNote
                autoFocus
                onRestart={startVocabQuiz}
                completeHref="/vocabulary"
                completeLabel="Kembali ke kosakata"
              />
            ) : (
              <Card className="p-6 text-center sm:p-8">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-soft text-indigo">
                  <Icon name="practice" size={24} />
                </span>
                <h2 className="mt-4 text-xl font-bold">Kuis kosakata adaptif</h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted">
                  Uji arti, cara baca, ejaan, dan terjemahan dari kata yang sedang kamu pelajari. Setiap kali dimulai,
                  soal dipilih dari filter yang aktif dan disesuaikan dengan riwayat jawabanmu.
                </p>
                <div className="mx-auto mt-5 grid max-w-md grid-cols-2 gap-2 text-left text-xs sm:grid-cols-3">
                  <span className="rounded-xl border border-line bg-surface-2/50 px-3 py-2">Pilihan ganda</span>
                  <span className="rounded-xl border border-line bg-surface-2/50 px-3 py-2">Baca kana</span>
                  <span className="rounded-xl border border-line bg-surface-2/50 px-3 py-2">Mengetik</span>
                  <span className="rounded-xl border border-line bg-surface-2/50 px-3 py-2">Isi rumpang</span>
                  <span className="rounded-xl border border-line bg-surface-2/50 px-3 py-2">Terjemahan</span>
                  <span className="rounded-xl border border-line bg-surface-2/50 px-3 py-2">Umpan balik</span>
                </div>
                <Button className="mt-5" onClick={startVocabQuiz}>
                  <Icon name="play" size={16} /> Mulai kuis kosakata
                </Button>
              </Card>
            )}
          </div>
          <aside className="space-y-4">
            <Card className="p-5">
              <h2 className="text-sm font-bold">Cakupan kuis</h2>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between gap-2"><span>Kata pada filter</span><span className="tnum">{formatNumber(filtered.length > 0 ? filtered.length : VOCABULARY.length)}</span></div>
                <div className="flex justify-between gap-2"><span>Level</span><span>{level === "semua" ? "Semua level" : LEVEL_LABELS[level]}</span></div>
                <div className="flex justify-between gap-2"><span>Topik</span><span>{topic === "semua" ? "Semua topik" : TOPIC_LABELS[topic]}</span></div>
                <div className="flex justify-between gap-2 border-t border-line pt-2"><span>Kartu jatuh tempo</span><span className="tnum">{dueVocabCards.length}</span></div>
                <div className="flex justify-between gap-2"><span>Soal per sesi</span><span className="tnum">10</span></div>
              </div>
              <Button className="mt-3 w-full" size="sm" variant="secondary" onClick={() => setTab("kamus")}>
                <Icon name="book" size={15} /> Ubah filter
              </Button>
            </Card>
            <Card className="p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold"><Icon name="sparkles" size={15} className="text-brand" /> Cara memilih soal</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Kartu jatuh tempo, kata baru, dan soal yang pernah salah mendapat bobot lebih besar. Setiap kata hanya
                muncul sekali per sesi agar cakupannya lebih luas.
              </p>
            </Card>
            <Card className="p-5">
              <h2 className="text-sm font-bold">Setelah kuis</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Hasil kuis tersimpan di riwayat dan ikut memengaruhi prioritas soal berikutnya. Kamu bisa mengulang
                hanya soal yang salah dari halaman ringkasan.
              </p>
            </Card>
          </aside>
        </div>
      )}

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.japanese} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-surface-2/50 p-5 text-center">
              <p className="font-jp text-4xl font-semibold" lang="ja">{selected.japanese}</p>
              <p className="mt-1 font-jp text-base text-muted" lang="ja">{selected.kana}</p>
              <p className="text-xs italic text-muted">{selected.romaji}</p>
              <div className="mt-2 flex justify-center"><SpeakButton text={selected.japanese} speech={selected.kana} variant="solid" /></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Badge tone="brand">{selected.level}</Badge>
                <Badge tone="muted">{TOPIC_LABELS[selected.topic]}</Badge>
                <Badge tone="indigo">{selected.pos}</Badge>
              </div>
              <SaveButton kind="vocabulary" refId={selected.id} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Arti</p>
              <p className="mt-1 text-base">{selected.meaning}</p>
            </div>
            {selected.examples.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Contoh kalimat</p>
                <ul className="mt-2 space-y-2.5">
                  {selected.examples.map((example, index) => (
                    <li key={index} className="flex items-start justify-between gap-2 rounded-xl border border-line p-3">
                      <div>
                        <JpText text={example.jp} className="text-base" />
                        {example.reading && <p className="text-xs text-muted">{example.reading}</p>}
                        <p className="mt-0.5 text-sm">{example.meaning}</p>
                      </div>
                      <SpeakButton text={example.jp.replace(/\{[^{}|]+\|([^{}|]+)\}/g, "$1")} speech={example.reading} size={14} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selected.notes && (
              <div className="rounded-xl border border-gold/25 bg-gold-soft/40 p-3 text-sm">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-gold"><Icon name="lightbulb" size={14} /> Catatan</p>
                <p className="mt-1 text-muted">{selected.notes}</p>
              </div>
            )}
            <SavedItemEditor key={selected.id} kind="vocabulary" refId={selected.id} title="Simpan kata ini" />
            {cardMap.get(selected.id) ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-2/50 px-3 py-2 text-xs">
                <span>Kartu ulangan: {cardMap.get(selected.id)?.reps} ulasan · {masteryLabel(cardMap.get(selected.id)!.reps, cardMap.get(selected.id)!.lapses)}</span>
                <span className="text-muted">{formatDate(cardMap.get(selected.id)!.dueAt)}</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-soft/40 px-3 py-2 text-xs">
                <span>Kata ini belum masuk koleksi ulanganmu.</span>
                <Button size="sm" variant="secondary" onClick={() => { setSelected(null); setTab("ulasan"); }}>Masukkan ke ulangan</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

const VOCAB_QUIZ_KINDS: ExerciseKind[] = ["multiple-choice", "reading-recognition", "typing", "cloze", "translation"];

function buildVocabularyQuiz(
  words: VocabWord[],
  cards: Map<string, CardProgress>,
  stats: readonly QuestionStat[],
  count = 10,
): Exercise[] {
  const allowed = new Set(words.map((word) => word.id));
  const statById = new Map(stats.map((stat) => [stat.questionId, stat]));
  const byWord = new Map<string, Exercise[]>();

  for (const exercise of buildExerciseCatalog({ kinds: VOCAB_QUIZ_KINDS })) {
    if (exercise.contentRef?.kind !== "vocabulary" || !allowed.has(exercise.contentRef.id)) continue;
    const list = byWord.get(exercise.contentRef.id) ?? [];
    list.push(exercise);
    byWord.set(exercise.contentRef.id, list);
  }

  const ranked = words
    .flatMap((word) => {
      const list = byWord.get(word.id) ?? [];
      if (list.length === 0) return [];
      const card = cards.get(word.id);
      let priority = 0;
      if (card && isDue(card)) priority += 60;
      if (!card) priority += 30;
      if (card && card.lapses > 1) priority += 12;
      if (list.some((exercise) => statById.get(exercise.id)?.lastResult === "wrong")) priority += 24;
      const accuracies = list.flatMap((exercise) => {
        const stat = statById.get(exercise.id);
        return stat ? [stat.accuracy] : [];
      });
      if (accuracies.length > 0) priority += Math.round((1 - Math.max(...accuracies) / 100) * 15);
      return [{ word, list, priority: priority + Math.random() * 8 }];
    })
    .sort((a, b) => b.priority - a.priority || a.word.id.localeCompare(b.word.id));

  const picked: Exercise[] = [];
  const usedKinds = new Set<ExerciseKind>();
  for (const item of ranked) {
    if (picked.length >= count) break;
    const chosen = [...item.list].sort((a, b) => {
      const usedDiff = Number(usedKinds.has(a.kind)) - Number(usedKinds.has(b.kind));
      return usedDiff !== 0 ? usedDiff : a.kind.localeCompare(b.kind);
    })[0];
    picked.push(chosen);
    usedKinds.add(chosen.kind);
  }

  if (picked.length < count) {
    const chosenIds = new Set(picked.map((exercise) => exercise.id));
    const rest = shuffle(
      [...byWord.values()]
        .flat()
        .filter((exercise) => !chosenIds.has(exercise.id)),
    );
    picked.push(...rest.slice(0, count - picked.length));
  }

  return shuffle(picked);
}

function toCard(word: VocabWord, card?: CardProgress): FlashcardData {
  const example = word.examples[0];
  return {
    id: word.id,
    kind: "vocab",
    front: word.japanese,
    reading: word.kana,
    romaji: word.romaji,
    back: word.meaning,
    example: example?.jp,
    exampleReading: example?.reading,
    exampleMeaning: example?.meaning,
    badge: word.level,
    note: word.notes,
    card,
  };
}