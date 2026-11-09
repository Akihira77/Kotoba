"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AudioPlayerCard } from "@/components/audio";
import { useToast } from "@/components/providers/toast-provider";
import { Icon } from "@/components/icons";
import { Badge, Button, Card, EmptyState, PageHeader, SearchInput, Segmented, useDebouncedValue } from "@/components/ui";
import { useAudioPlayer } from "@/lib/audio-player";
import { describeSpeechFailure } from "@/lib/speech";
import { ALL_KANA, KANA_GROUP_LABELS } from "@/content/kana";
import { VOCABULARY } from "@/content/vocabulary";
import { KANJI } from "@/content/kanji";
import { GRAMMAR } from "@/content/grammar";
import { READING } from "@/content/reading";
import { CONVERSATIONS } from "@/content/conversations";
import { furiganaReading, stripFurigana } from "@/lib/furigana";
import { cn } from "@/lib/utils";
import { JLPT_LEVELS, type JLPTLevel, type KanaGroup, type KanaScript } from "@/lib/types";

type StudioTab = "kana" | "vocabulary" | "kanji" | "grammar" | "reading" | "conversation";
type LevelFilter = "semua" | JLPTLevel;
type GroupFilter = "semua" | KanaGroup;

const TABS: Array<{ value: StudioTab; label: string }> = [
  { value: "kana", label: "Kana" },
  { value: "vocabulary", label: "Kosakata" },
  { value: "kanji", label: "Kanji" },
  { value: "grammar", label: "Tata bahasa" },
  { value: "reading", label: "Membaca" },
  { value: "conversation", label: "Percakapan" },
];

const LEVEL_OPTIONS: Array<{ value: LevelFilter; label: string }> = [
  { value: "semua", label: "Semua" },
  ...JLPT_LEVELS.map((level) => ({ value: level, label: level })),
];

const SCRIPT_OPTIONS: Array<{ value: KanaScript; label: string }> = [
  { value: "hiragana", label: "Hiragana" },
  { value: "katakana", label: "Katakana" },
];

const GROUP_OPTIONS: Array<{ value: GroupFilter; label: string }> = [
  { value: "semua", label: "Semua" },
  { value: "basic", label: KANA_GROUP_LABELS.basic },
  { value: "dakuten", label: KANA_GROUP_LABELS.dakuten },
  { value: "handakuten", label: KANA_GROUP_LABELS.handakuten },
  { value: "yoon", label: KANA_GROUP_LABELS.yoon },
];

interface StudioTrack {
  id: string;
  text: string;
  speech: string;
  reading?: string;
  label: string;
  context?: string;
}

function firstReading(value: string): string {
  return value.replace(/[.、].*$/, "").trim();
}

function levelMatches(level: JLPTLevel, filter: LevelFilter): boolean {
  return filter === "semua" || level === filter;
}

function audioTracksFor({
  tab,
  level,
  script,
  group,
  query,
}: {
  tab: StudioTab;
  level: LevelFilter;
  script: KanaScript;
  group: GroupFilter;
  query: string;
}): StudioTrack[] {
  const q = query.trim().toLowerCase();
  const matches = (...values: Array<string | undefined>) =>
    !q || values.some((value) => value?.toLowerCase().includes(q));

  if (tab === "kana") {
    return ALL_KANA.filter((kana) => kana.script === script && (group === "semua" || kana.group === group))
      .filter((kana) => matches(kana.char, kana.romaji, kana.group, kana.examples[0]?.word, kana.examples[0]?.meaning))
      .map((kana) => {
        const example = kana.examples[0];
        return {
          id: kana.id,
          text: kana.char,
          speech: kana.char,
          reading: kana.romaji,
          label: `${kana.char} · ${kana.romaji}`,
          context: example
            ? `${KANA_GROUP_LABELS[kana.group]} · Contoh: ${example.word}${example.reading ? ` (${example.reading})` : ""} — ${example.meaning}`
            : KANA_GROUP_LABELS[kana.group],
        };
      });
  }

  if (tab === "vocabulary") {
    return VOCABULARY.filter((word) => levelMatches(word.level, level))
      .filter((word) => matches(word.japanese, word.kana, word.romaji, word.meaning))
      .map((word) => ({
        id: word.id,
        text: word.japanese,
        speech: word.kana,
        reading: word.kana,
        label: `${word.japanese} · ${word.kana}`,
        context: `${word.romaji} — ${word.meaning}`,
      }));
  }

  if (tab === "kanji") {
    return KANJI.filter((item) => levelMatches(item.level, level))
      .filter((item) =>
        matches(item.char, item.meanings.join(" "), item.on.join(" "), item.kun.join(" "), item.radicalMeaning),
      )
      .map((item) => {
        const reading = [...item.kun, ...item.on].map(firstReading).filter(Boolean).join("、");
        return {
          id: item.id,
          text: item.char,
          speech: firstReading(item.kun[0] ?? item.on[0] ?? item.char),
          reading,
          label: `${item.char} · ${item.meanings[0] ?? ""}`,
          context: `${item.strokes} goresan · radikal ${item.radical} (${item.radicalMeaning}) · on: ${item.on.join("、")} · kun: ${item.kun.join("、")}`,
        };
      });
  }

  if (tab === "grammar") {
    return GRAMMAR.filter((point) => levelMatches(point.level, level))
      .flatMap((point) =>
        point.examples
          .filter((example) => matches(point.pattern, point.meaning, example.jp, example.reading, example.meaning))
          .map((example, index) => ({
            id: `grammar-${point.id}-${example.id ?? index}`,
            text: example.jp,
            speech: example.reading,
            reading: example.reading,
            label: `${point.pattern} · Contoh ${index + 1}`,
            context: `${point.meaning} — ${example.meaning}`,
          })),
      );
  }

  if (tab === "reading") {
    return READING.filter((passage) => levelMatches(passage.level, level))
      .filter((passage) => matches(passage.title, passage.titleJp, passage.summary, stripFurigana(passage.text)))
      .map((passage) => ({
        id: passage.id,
        text: passage.text,
        speech: furiganaReading(passage.text),
        reading: furiganaReading(passage.text),
        label: `${passage.title} · ${passage.titleJp}`,
        context: passage.summary,
      }));
  }

  return CONVERSATIONS.filter((scenario) => levelMatches(scenario.level, level))
    .flatMap((scenario) => {
      const stepTracks: StudioTrack[] = scenario.steps.map((step, index) => ({
        id: `conversation-${scenario.id}-${step.id}`,
        text: step.npc.jp,
        speech: step.npc.reading,
        reading: step.npc.reading,
        label: `${scenario.title} · Langkah ${index + 1}`,
        context: `${step.npc.romaji} — ${step.npc.meaning}`,
      }));
      const fullSpeech = scenario.steps
        .map((step) => {
          const answer = step.choices.find((choice) => choice.correct);
          return `${step.npc.reading}${answer ? `、${answer.reading}` : ""}`;
        })
        .join("。");
      const fullTrack: StudioTrack = {
        id: `conversation-${scenario.id}-full`,
        text: scenario.steps
          .map((step) => {
            const answer = step.choices.find((choice) => choice.correct);
            return `${step.npc.jp}${answer ? ` / ${answer.jp}` : ""}`;
          })
          .join("\n"),
        speech: fullSpeech,
        reading: fullSpeech,
        label: `${scenario.title} · Seluruh dialog`,
        context: scenario.summary,
      };
      return [fullTrack, ...stepTracks];
    })
    .filter((track) => q ? `${track.label} ${track.context ?? ""} ${track.reading ?? ""}`.toLowerCase().includes(q) : true);
}

function AudioReadiness() {
  const player = useAudioPlayer();
  const tone = !player.supported ? "gold" : player.voices.length > 0 ? "matcha" : "muted";
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand dark:bg-brand/15">
            <Icon name="volume" size={19} />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold">Status suara Jepang</h2>
            {!player.supported ? (
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Browser ini belum mendukung Web Speech API. Transkrip, romaji, dan latihan tertulis tetap bisa dipakai.
                Untuk audio, gunakan Chrome, Edge, atau Safari terbaru di perangkat yang memiliki voice Jepang.
              </p>
            ) : !player.voicesReady ? (
              <p className="mt-1 text-xs leading-relaxed text-muted">Memeriksa voice Jepang yang tersedia di perangkat...</p>
            ) : player.voices.length > 0 ? (
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {player.voices.length} voice Jepang terdeteksi. Voice dipilih berdasarkan preferensi di Pengaturan; Kotoba
                tidak akan memakai voice bahasa lain.
              </p>
            ) : (
              <div className="mt-1 space-y-1 text-xs leading-relaxed text-muted">
                <p className="font-semibold text-ink">Belum ada voice Jepang di perangkat ini.</p>
                <p>
                  Pasang paket bahasa Jepang di pengaturan sistem, atau aktifkan voice Jepang di pengaturan browser
                  (biasanya di bagian aksesibilitas/bahasa), lalu muat ulang halaman.
                </p>
                <p>Kotoba tidak mengirim teks ke layanan TTS berbayar dan tidak memakai voice non-Jepang.</p>
              </div>
            )}
          </div>
        </div>
        <Badge tone={tone}>{!player.supported ? "Tidak didukung" : player.voices.length > 0 ? "Siap" : "Voice belum ada"}</Badge>
      </div>
    </Card>
  );
}

export default function AudioStudioPage() {
  const player = useAudioPlayer();
  const toast = useToast();
  const router = useRouter();
  const [tab, setTab] = useState<StudioTab>("kana");
  const [level, setLevel] = useState<LevelFilter>("semua");
  const [script, setScript] = useState<KanaScript>("hiragana");
  const [group, setGroup] = useState<GroupFilter>("semua");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(24);
  const query = useDebouncedValue(search, 180);

  const allTracks = useMemo(
    () => audioTracksFor({ tab, level, script, group, query }),
    [tab, level, script, group, query],
  );
  const tracks = allTracks.slice(0, visibleCount);

  function resetView(run: () => void) {
    player.stop();
    setVisibleCount(24);
    run();
  }

  function changeTab(value: StudioTab) {
    resetView(() => setTab(value));
  }

  async function playTrack(index: number) {
    const result = await player.playQueue(tracks, index, { rate: player.rate, voiceURI: player.voiceURI });
    if (!result.ok && result.reason !== "cancelled") toast.error(describeSpeechFailure(result.reason));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dengar & tirukan · 音声"
        title="Studio audio"
        titleJp="音声スタジオ"
        description="Dengarkan kana, kosakata, kanji, contoh tata bahasa, bacaan, dan dialog dengan voice Jepang di perangkatmu. Kotoba memakai Web Speech API bawaan browser, bukan layanan berbayar."
        icon="volume"
        actions={
          <Button variant="secondary" onClick={() => router.push("/settings#audio")}>
            <Icon name="settings" size={16} /> Pengaturan audio
          </Button>
        }
      />

      <AudioReadiness />

      <Card className="p-4 sm:p-5">
        <Segmented options={TABS} value={tab} onChange={changeTab} label="Jenis materi audio" />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={(value) => { setSearch(value); setVisibleCount(24); }} placeholder="Cari materi audio..." className="sm:max-w-sm" />
          {tab !== "kana" ? (
            <div className="min-w-0">
              <Segmented options={LEVEL_OPTIONS} value={level} onChange={(value) => resetView(() => setLevel(value))} size="sm" label="Filter level audio" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Segmented options={SCRIPT_OPTIONS} value={script} onChange={(value) => resetView(() => setScript(value))} size="sm" label="Pilih skrip kana" />
              <Segmented options={GROUP_OPTIONS} value={group} onChange={(value) => resetView(() => setGroup(value))} size="sm" label="Pilih kelompok kana" />
            </div>
          )}
        </div>
      </Card>

      {tracks.length === 0 ? (
        <EmptyState
          icon="volume"
          title="Tidak ada materi audio pada filter ini"
          description="Coba hapus kata pencarian atau pilih level/kelompok lain."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-4">
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold">Materi audio</h2>
                  <p className="mt-1 text-xs text-muted">
                    {allTracks.length} materi cocok. {tracks.length < allTracks.length ? `Menampilkan ${tracks.length} pertama.` : "Semua ditampilkan."}
                  </p>
                </div>
                <Badge tone="brand">{TABS.find((item) => item.value === tab)?.label}</Badge>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {tracks.map((track, index) => {
                  const active = player.current?.id === track.id && player.status !== "idle";
                  return (
                    <li key={track.id} className="min-w-0">
                      <button
                        type="button"
                        onClick={() => void playTrack(index)}
                        aria-pressed={active}
                        className={cn(
                          "flex w-full items-start gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition",
                          active
                            ? "border-brand/40 bg-brand-soft/60 dark:bg-brand/15"
                            : "border-line bg-surface hover:bg-surface-2",
                        )}
                      >
                        <span className={cn("mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full", active ? "bg-brand text-white" : "bg-surface-2 text-muted")}>
                          <Icon name={active && player.status === "playing" ? "pause" : "play"} size={14} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{track.label}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-muted">{track.context}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {tracks.length < allTracks.length ? (
                <div className="mt-4 flex justify-center">
                  <Button variant="secondary" size="sm" onClick={() => setVisibleCount((count) => count + 24)}>
                    Muat 24 materi lagi
                  </Button>
                </div>
              ) : null}
            </Card>
          </div>

          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <AudioPlayerCard
              tracks={tracks}
              title="Pemutar audio"
              description="Pilih materi di samping, lalu putar, jeda, ulangi, atau ubah kecepatan. Kecepatan dan voice disimpan ke pengaturan profil."
              label="Pemutar studio audio"
            />
            <Card className="mt-4 p-4">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
                <Icon name="info" size={15} className="mt-0.5 shrink-0 text-brand" />
                <span>
                  Pelafalan dari browser dapat berbeda antardevice. Kotoba tidak menyimpan file MP3 dari Web Speech API
                  dan tidak memberi skor akustik. Gunakan tombol pelan untuk memperhatikan mora dan vokal panjang.
                </span>
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
