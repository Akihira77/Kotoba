"use client";

import { useMemo, useState } from "react";
import { JpText, SpeakButton } from "@/components/japanese";
import { Icon } from "@/components/icons";
import { useProgress } from "@/components/providers/progress-provider";
import { SavedItemEditor, SaveButton } from "@/components/saved-item-editor";
import { Badge, Button, Card, EmptyState, LinkButton, Modal, PageHeader, SearchInput, Select, useDebouncedValue } from "@/components/ui";
import { GRAMMAR } from "@/content/grammar";
import { KANJI } from "@/content/kanji";
import { VOCABULARY } from "@/content/vocabulary";
import { LEVEL_LABELS, POS_LABELS, TOPIC_LABELS } from "@/lib/constants";
import { stripFurigana } from "@/lib/furigana";
import { JLPT_LEVELS, type GrammarPoint, type JLPTLevel, type Kanji, type VocabWord } from "@/lib/types";

type EntryKind = "vocab" | "kanji" | "grammar";
type Entry =
  | { kind: "vocab"; item: VocabWord }
  | { kind: "kanji"; item: Kanji }
  | { kind: "grammar"; item: GrammarPoint };

const TYPE_META = {
  vocab: { label: "Kosakata", icon: "vocab", tone: "brand" },
  kanji: { label: "Kanji", icon: "kanji", tone: "indigo" },
  grammar: { label: "Tata bahasa", icon: "grammar", tone: "gold" },
} as const;

const PAGE_SIZE = 18;

function normalized(value: string): string {
  return value.toLowerCase().trim();
}

function haystack(entry: Entry): string {
  if (entry.kind === "vocab") {
    const word = entry.item;
    return normalized(
      [
        word.japanese,
        word.kana,
        word.romaji,
        word.meaning,
        TOPIC_LABELS[word.topic],
        POS_LABELS[word.pos],
        ...word.examples.flatMap((example) => [example.jp, example.reading ?? "", example.meaning]),
      ].join(" "),
    );
  }
  if (entry.kind === "kanji") {
    const kanji = entry.item;
    return normalized(
      [
        kanji.char,
        ...kanji.meanings,
        ...kanji.on,
        ...kanji.kun,
        kanji.radical,
        kanji.radicalMeaning,
        ...kanji.examples.flatMap((example) => [example.word, example.reading, example.meaning]),
      ].join(" "),
    );
  }
  const point = entry.item;
  return normalized(
    [
      point.pattern,
      point.meaning,
      ...point.explanation,
      ...point.formation.flatMap((row) => [row.label, row.form, row.note ?? ""]),
      ...point.examples.flatMap((example) => [example.jp, example.reading]),
    ].join(" "),
  );
}

function relatedVocabulary(word: VocabWord): VocabWord[] {
  return VOCABULARY.filter(
    (item) => item.id !== word.id && (item.topic === word.topic || item.pos === word.pos),
  )
    .sort((a, b) => {
      const topicScore = Number(b.topic === word.topic) - Number(a.topic === word.topic);
      if (topicScore !== 0) return topicScore;
      const levelScore = Number(b.level === word.level) - Number(a.level === word.level);
      if (levelScore !== 0) return levelScore;
      return a.romaji.localeCompare(b.romaji);
    })
    .slice(0, 4);
}

function sameRadicalKanji(kanji: Kanji): Kanji[] {
  return KANJI.filter((item) => item.id !== kanji.id && item.radical === kanji.radical)
    .sort((a, b) => a.strokes - b.strokes || a.char.localeCompare(b.char))
    .slice(0, 4);
}

function entryTitle(entry: Entry): string {
  if (entry.kind === "vocab") return entry.item.japanese;
  if (entry.kind === "kanji") return entry.item.char;
  return entry.item.pattern;
}

function savedKindOf(kind: EntryKind): "vocabulary" | "kanji" | "grammar" {
  if (kind === "vocab") return "vocabulary";
  if (kind === "kanji") return "kanji";
  return "grammar";
}

export default function DictionaryPage() {
  const { snapshot } = useProgress();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<EntryKind | "semua">("semua");
  const [level, setLevel] = useState<JLPTLevel | "semua">("semua");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Entry | null>(null);
  const debouncedQuery = useDebouncedValue(query, 180);

  const entries = useMemo<Entry[]>(
    () => [
      ...VOCABULARY.map((item) => ({ kind: "vocab" as const, item })),
      ...KANJI.map((item) => ({ kind: "kanji" as const, item })),
      ...GRAMMAR.map((item) => ({ kind: "grammar" as const, item })),
    ],
    [],
  );

  const filtered = useMemo(() => {
    const needle = normalized(debouncedQuery);
    return entries.filter((entry) => {
      if (kind !== "semua" && entry.kind !== kind) return false;
      if (level !== "semua" && entry.item.level !== level) return false;
      if (!needle) return true;
      return haystack(entry).includes(needle);
    });
  }, [debouncedQuery, entries, kind, level]);

  const visible = filtered.slice(0, limit);
  const relatedVocab = selected?.kind === "vocab" ? relatedVocabulary(selected.item) : [];
  const sameRadical = selected?.kind === "kanji" ? sameRadicalKanji(selected.item) : [];
  const counts = useMemo(
    () => ({
      semua: VOCABULARY.length + KANJI.length + GRAMMAR.length,
      vocab: VOCABULARY.length,
      kanji: KANJI.length,
      grammar: GRAMMAR.length,
    }),
    [],
  );

  function changeQuery(next: string) {
    setQuery(next);
    setLimit(PAGE_SIZE);
  }

  function changeKind(next: EntryKind | "semua") {
    setKind(next);
    setLimit(PAGE_SIZE);
  }

  function changeLevel(next: JLPTLevel | "semua") {
    setLevel(next);
    setLimit(PAGE_SIZE);
  }

  function clearFilters() {
    setQuery("");
    setKind("semua");
    setLevel("semua");
    setLimit(PAGE_SIZE);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Referensi belajar"
        title="Kamus"
        titleJp="辞書"
        icon="dictionary"
        description="Cari kosakata, kanji, dan pola tata bahasa dalam satu tempat. Hasil mencakup tulisan Jepang, bacaan, romaji, arti Indonesia, serta contoh pemakaian."
        actions={
          <>
            <LinkButton href="/dictionary/collections" variant="secondary" size="sm">
              <Icon name="bookmark" size={15} /> Koleksi pribadi
              <span className="rounded-full bg-surface-2 px-1.5 text-[10px] text-muted">{snapshot.savedItems.length}</span>
            </LinkButton>
            <LinkButton href="/vocabulary" variant="secondary" size="sm">
              <Icon name="vocab" size={15} /> Kosakata
            </LinkButton>
            <LinkButton href="/kanji" variant="secondary" size="sm">
              <Icon name="kanji" size={15} /> Kanji
            </LinkButton>
          </>
        }
      />

      <Card className="space-y-3 p-4 sm:p-5">
        <SearchInput
          value={query}
          onChange={changeQuery}
          placeholder="Cari kata, kanji, bacaan, romaji, atau arti…"
        />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Jenis entri">
            {(["semua", "vocab", "kanji", "grammar"] as const).map((option) => {
              const isActive = kind === option;
              const label = option === "semua" ? "Semua" : TYPE_META[option].label;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => changeKind(option)}
                  aria-pressed={isActive}
                  className={
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand " +
                    (isActive ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:bg-surface-2")
                  }
                >
                  {option === "semua" ? <Icon name="search" size={14} /> : <Icon name={TYPE_META[option].icon} size={14} />}
                  {label}
                  <span className={"rounded-full px-1.5 text-[10px] " + (isActive ? "bg-white/20" : "bg-surface-2 text-muted")}>
                    {counts[option]}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <Select label="Level" value={level} onChange={(event) => changeLevel(event.target.value as JLPTLevel | "semua")}>
              <option value="semua">Semua level</option>
              {JLPT_LEVELS.map((item) => (
                <option key={item} value={item}>{item} — {LEVEL_LABELS[item]}</option>
              ))}
            </Select>
            {query || kind !== "semua" || level !== "semua" ? (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <Icon name="close" size={14} /> Bersihkan
              </Button>
            ) : null}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            {filtered.length} entri ditemukan
            {debouncedQuery ? " untuk “" + debouncedQuery + "”" : ""}
          </span>
          <span className="hidden sm:inline">Tekan kartu untuk melihat contoh dan bacaan lengkap.</span>
        </div>
      </Card>

      {visible.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((entry) => {
              const meta = TYPE_META[entry.kind];
              return (
                <div
                  key={entry.kind + "-" + entry.item.id}
                  className="group relative flex flex-col rounded-3xl border border-line bg-surface p-4 shadow-soft transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lift"
                >
                  <button
                    type="button"
                    onClick={() => setSelected(entry)}
                    aria-label={"Buka detail " + entryTitle(entry)}
                    className="absolute inset-0 z-0 rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  />
                  <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone={meta.tone}><Icon name={meta.icon} size={12} /> {meta.label}</Badge>
                        <Badge tone="muted">{entry.item.level}</Badge>
                      </div>
                      <div className="pointer-events-auto flex items-center gap-1">
                        <SaveButton kind={savedKindOf(entry.kind)} refId={entry.item.id} compact />
                        <span className="rounded-full p-1.5 text-muted transition-colors group-hover:bg-surface-2 group-hover:text-ink">
                          <Icon name="arrowUpRight" size={15} />
                        </span>
                      </div>
                    </div>

                    {entry.kind === "vocab" ? (
                      <>
                        <p className="mt-3 font-jp text-3xl font-bold leading-tight">{entry.item.japanese}</p>
                        <p className="mt-1 font-jp text-sm text-muted">{entry.item.kana}</p>
                        <p className="text-xs italic text-muted">{entry.item.romaji}</p>
                        <p className="mt-2 line-clamp-2 text-sm font-semibold">{entry.item.meaning}</p>
                        <p className="mt-auto pt-3 text-xs text-muted">{TOPIC_LABELS[entry.item.topic]} · {POS_LABELS[entry.item.pos]}</p>
                      </>
                    ) : entry.kind === "kanji" ? (
                      <>
                        <p className="mt-3 font-jp text-5xl font-bold leading-none">{entry.item.char}</p>
                        <p className="mt-2 line-clamp-1 text-sm font-semibold">{entry.item.meanings.join(", ")}</p>
                        <p className="mt-1 text-xs text-muted">{entry.item.strokes} goresan · radikal {entry.item.radical} ({entry.item.radicalMeaning})</p>
                        <p className="mt-auto line-clamp-1 pt-3 font-jp text-xs text-muted">{[...entry.item.on, ...entry.item.kun].slice(0, 4).join("、")}</p>
                      </>
                    ) : (
                      <>
                        <p className="mt-3 font-jp text-xl font-bold leading-snug">{entry.item.pattern}</p>
                        <p className="mt-1 line-clamp-2 text-sm font-semibold">{entry.item.meaning}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{entry.item.explanation[0]}</p>
                        <p className="mt-auto pt-3 text-xs text-muted">{entry.item.formation.length} bentuk · {entry.item.examples.length} contoh</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-muted">Menampilkan {visible.length} dari {filtered.length} entri</p>
            {filtered.length > visible.length ? (
              <Button variant="secondary" onClick={() => setLimit((current) => current + PAGE_SIZE)}>
                Muat {Math.min(PAGE_SIZE, filtered.length - visible.length)} entri lagi
              </Button>
            ) : null}
          </div>
        </>
      ) : (
        <EmptyState
          icon="search"
          title="Tidak ada entri yang cocok"
          description="Coba kata kunci lain, gunakan romaji, atau longgarkan filter level dan jenis entri."
          action={<Button variant="secondary" onClick={clearFilters}>Bersihkan filter</Button>}
        />
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? TYPE_META[selected.kind].label : "Detail"}
        size="lg"
        footer={
          selected ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-muted">Level {selected.item.level} · konten orisinal Kotoba</span>
              {selected.kind === "grammar" ? (
                <LinkButton href={"/grammar/" + selected.item.id} size="sm">
                  Buka materi tata bahasa <Icon name="arrowUpRight" size={14} />
                </LinkButton>
              ) : selected.kind === "vocab" ? (
                <LinkButton href={"/vocabulary?level=" + selected.item.level} size="sm">
                  Buka daftar kosakata <Icon name="arrowUpRight" size={14} />
                </LinkButton>
              ) : (
                <LinkButton href={"/kanji?level=" + selected.item.level} size="sm">
                  Buka daftar kanji <Icon name="arrowUpRight" size={14} />
                </LinkButton>
              )}
            </div>
          ) : null
        }
      >
        {selected?.kind === "vocab" ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-jp text-4xl font-bold leading-tight">{selected.item.japanese}</p>
                <p className="mt-1 font-jp text-lg text-muted">{selected.item.kana}</p>
                <p className="text-sm italic text-muted">{selected.item.romaji}</p>
              </div>
              <SpeakButton text={selected.item.japanese} speech={selected.item.kana} size={18} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="brand">{selected.item.level}</Badge>
              <Badge tone="muted">{POS_LABELS[selected.item.pos]}</Badge>
              <Badge tone="muted">{TOPIC_LABELS[selected.item.topic]}</Badge>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Arti Indonesia</p>
              <p className="mt-1 text-lg font-semibold">{selected.item.meaning}</p>
              {selected.item.notes ? <p className="mt-2 text-sm leading-relaxed text-muted">{selected.item.notes}</p> : null}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Contoh pemakaian</p>
              <div className="mt-2 space-y-2">
                {selected.item.examples.map((example) => (
                  <div key={example.id} className="rounded-2xl border border-line bg-surface-2/50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <JpText text={example.jp} as="p" className="font-jp text-base font-semibold" />
                        {example.reading ? <p className="font-jp text-xs text-muted">{example.reading}</p> : null}
                        <p className="mt-1 text-sm text-muted">Arti: {example.meaning}</p>
                      </div>
                      <SpeakButton text={stripFurigana(example.jp)} speech={example.reading} size={15} />
                    </div>
                  </div>
                ))}
            {relatedVocab.length > 0 ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Kosakata terkait</p>
                <p className="mt-1 text-xs text-muted">Berbagi topik atau jenis kata yang sama.</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {relatedVocab.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelected({ kind: "vocab", item })}
                      className="rounded-2xl border border-line bg-surface-2/50 p-3 text-left transition hover:border-brand/40 hover:bg-brand-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-jp text-lg font-semibold">{item.japanese}</span>
                        <Badge tone="muted">{item.level}</Badge>
                      </div>
                      <p className="font-jp text-xs text-muted">{item.kana}</p>
                      <p className="mt-1 text-sm font-semibold">{item.meaning}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
              </div>
            </div>
          </div>
        ) : selected?.kind === "kanji" ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-jp text-6xl font-bold leading-none">{selected.item.char}</p>
                <p className="mt-2 text-base font-semibold">{selected.item.meanings.join(", ")}</p>
              </div>
              <SpeakButton text={selected.item.char} speech={selected.item.kun[0]?.replace(/[.、].*$/, "").trim() ?? selected.item.on[0] ?? selected.item.char} size={18} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-surface-2 p-3">
                <p className="text-xs text-muted">Goresan</p>
                <p className="text-lg font-bold tnum">{selected.item.strokes}</p>
              </div>
              <div className="rounded-2xl bg-surface-2 p-3">
                <p className="text-xs text-muted">Radikal</p>
                <p className="font-jp text-lg font-bold">{selected.item.radical}</p>
                <p className="text-[11px] text-muted">{selected.item.radicalMeaning}</p>
              </div>
              <div className="rounded-2xl bg-surface-2 p-3">
                <p className="text-xs text-muted">Level</p>
                <p className="text-lg font-bold">{selected.item.level}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">On&apos;yomi</p>
                <p className="mt-1 font-jp text-lg">{selected.item.on.join("、") || "—"}</p>
              </div>
              <div className="rounded-2xl border border-line p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Kun&apos;yomi</p>
                <p className="mt-1 font-jp text-lg">{selected.item.kun.join("、") || "—"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Contoh kata</p>
              <ul className="mt-2 divide-y divide-line rounded-2xl border border-line">
                {selected.item.examples.map((example) => (
                  <li key={example.word} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <div>
                      <p className="font-jp font-semibold">{example.word} <span className="text-xs font-normal text-muted">({example.reading})</span></p>
                      <p className="text-xs text-muted">{example.meaning}</p>
                    </div>
                    <SpeakButton text={example.word} speech={example.reading} size={14} />
                  </li>
                ))}
              </ul>
            </div>
            {selected.item.mnemonic ? (
              <div className="rounded-2xl bg-gold-soft/60 p-3 text-sm leading-relaxed text-gold dark:bg-gold/10 dark:text-gold">
                <span className="font-semibold">Cara mengingat: </span>{selected.item.mnemonic}
              </div>
            ) : null}
            {sameRadical.length > 0 ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Kanji dengan radikal sama</p>
                <p className="mt-1 text-xs text-muted">Radikal {selected.item.radical} · {selected.item.radicalMeaning}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {sameRadical.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelected({ kind: "kanji", item })}
                      className="rounded-2xl border border-line bg-surface-2/50 p-3 text-left transition hover:border-indigo/40 hover:bg-indigo-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-jp text-3xl font-bold">{item.char}</span>
                        <Badge tone="muted">{item.level}</Badge>
                      </div>
                      <p className="mt-1 text-xs font-semibold leading-snug">{item.meanings.join(", ")}</p>
                      <p className="text-[11px] text-muted">{item.strokes} goresan</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : selected?.kind === "grammar" ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-jp text-2xl font-bold leading-snug">{selected.item.pattern}</p>
                <p className="mt-1 text-base font-semibold">{selected.item.meaning}</p>
              </div>
              <SpeakButton text={selected.item.examples[0] ? stripFurigana(selected.item.examples[0].jp) : selected.item.pattern} speech={selected.item.examples[0]?.reading} size={18} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="gold">{selected.item.level}</Badge>
              <Badge tone="muted">Tata bahasa</Badge>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Formasi</p>
              <div className="mt-2 overflow-hidden rounded-2xl border border-line">
                {selected.item.formation.map((row, index) => (
                  <div key={row.label} className={"grid gap-1 px-3 py-2.5 sm:grid-cols-[110px_1fr] " + (index > 0 ? "border-t border-line" : "")}>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">{row.label}</p>
                    <div>
                      <p className="font-jp text-sm font-semibold">{row.form}</p>
                      {row.note ? <p className="mt-0.5 text-xs leading-relaxed text-muted">{row.note}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Penjelasan</p>
              <div className="mt-2 space-y-2 text-sm leading-relaxed">
                {selected.item.explanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Contoh kalimat</p>
              <div className="mt-2 space-y-2">
                {selected.item.examples.map((example) => (
                  <div key={example.id} className="rounded-2xl border border-line bg-surface-2/50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <JpText text={example.jp} as="p" className="font-jp text-base font-semibold" />
                        <p className="font-jp text-xs text-muted">{example.reading}</p>
                        <p className="mt-1 text-sm text-muted">Arti: {example.meaning}</p>
                      </div>
                      <SpeakButton text={stripFurigana(example.jp)} speech={example.reading} size={15} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        {selected ? (
          <div className="mt-5 border-t border-line pt-4">
            <SavedItemEditor
              key={selected.kind + "-" + selected.item.id}
              kind={savedKindOf(selected.kind)}
              refId={selected.item.id}
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
