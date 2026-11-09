"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { JpText } from "@/components/japanese";
import { useProgress } from "@/components/providers/progress-provider";
import { useToast } from "@/components/providers/toast-provider";
import { SaveButton } from "@/components/saved-item-editor";
import { StoryStage } from "@/components/story/story-stage";
import { Badge, Button, Card, Modal, ProgressBar, Segmented, Toggle } from "@/components/ui";
import { useAudioPlayer, playAudio, stopAudio } from "@/lib/audio-player";
import { describeSpeechFailure } from "@/lib/speech";
import { VOCAB_BY_ID } from "@/content/vocabulary";
import { GRAMMAR_BY_ID } from "@/content/grammar";
import type {
  AudioTrack,
} from "@/lib/audio-player";
import type {
  JLPTLevel,
  Story,
  StoryLine,
  StoryMode,
  StoryQuestion,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const SPEEDS = [0.75, 1, 1.25, 1.5];

function difficultyLabel(value: number): string {
  return ["Mudah", "Mudah+", "Sedang", "Sedang+", "Sulit"][Math.min(4, Math.max(0, value - 1))];
}

function levelTone(level: JLPTLevel): "brand" | "indigo" | "gold" {
  if (level === "N5") return "brand";
  if (level === "N4") return "indigo";
  return "gold";
}

function speakerName(story: Story, speakerId: string): string {
  return story.characters.find((character) => character.id === speakerId)?.name ?? "Narator";
}

export function StoryTheater({ story }: { story: Story }) {
  const { snapshot, recordStory, saveSettings } = useProgress();
  const toast = useToast();
  const player = useAudioPlayer();
  const settings = snapshot.profile.settings;

  const [mode, setMode] = useState<StoryMode>("study");
  const [sceneIndex, setSceneIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [speed, setSpeed] = useState(settings.speechRate || 1);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showFurigana, setShowFurigana] = useState(settings.showFurigana);
  const [showRomaji, setShowRomaji] = useState(settings.showRomaji);
  const [showTranslation, setShowTranslation] = useState(true);
  const [japaneseOnly, setJapaneseOnly] = useState(false);
  const [showVocab, setShowVocab] = useState(true);
  const [showGrammar, setShowGrammar] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<{ correct: number; score: number } | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedVocabId, setSelectedVocabId] = useState<string | null>(null);
  const [selectedGrammarId, setSelectedGrammarId] = useState<string | null>(null);

  const autoTokenRef = useRef(0);
  const autoRunningRef = useRef(false);
  const attemptSavedRef = useRef(false);
  const startedAtRef = useRef(0);
  const rateRef = useRef(speed);
  const voiceMapRef = useRef(new Map<string, string>());
  const quizHeadingRef = useRef<HTMLHeadingElement>(null);

  const scene = story.scenes[sceneIndex] ?? story.scenes[0];
  const line = scene.lines[lineIndex] ?? scene.lines[0];
  const totalLines = story.scenes.reduce((sum, item) => sum + item.lines.length, 0);
  const globalLineIndex =
    story.scenes.slice(0, sceneIndex).reduce((sum, item) => sum + item.lines.length, 0) + lineIndex;
  const lineSpeaker = story.characters.find((character) => character.id === line.speakerId);
  const activeTrackId = "story:" + story.id + ":" + line.id;
  const activeLine = player.current?.id === activeTrackId;
  const canPlay = player.supported || Boolean(line.audioUrl);
  const noJapaneseVoice = player.supported && player.voicesReady && player.voices.length === 0;
  const voicesPresent = player.voices.length >= 2;
  const allAnswered = story.questions.every((question) => answers[question.id] !== undefined);
  const selectedVocab = selectedVocabId ? VOCAB_BY_ID.get(selectedVocabId) ?? null : null;
  const selectedGrammar = selectedGrammarId ? GRAMMAR_BY_ID.get(selectedGrammarId) ?? null : null;

  const sceneVocab = (line.vocabIds ?? []).map((id) => VOCAB_BY_ID.get(id)).filter((item) => Boolean(item));
  const sceneGrammar = (line.grammarIds ?? []).map((id) => GRAMMAR_BY_ID.get(id)).filter((item) => Boolean(item));
  const summaryVocab = story.vocabIds.map((id) => VOCAB_BY_ID.get(id)).filter((item) => Boolean(item));
  const summaryGrammar = story.grammarIds.map((id) => GRAMMAR_BY_ID.get(id)).filter((item) => Boolean(item));

  const statusLabel = useMemo(() => {
    if (player.status === "error") return player.error ?? "Audio tidak dapat diputar.";
    if (player.status === "paused") return "Audio dijeda. Tekan Lanjut untuk melanjutkan.";
    if (player.status === "playing") return "Memutar dialog " + (globalLineIndex + 1) + " dari " + totalLines + ".";
    if (player.status === "loading") return "Menyiapkan suara...";
    if (autoRunning) return "Menunggu dialog berikutnya...";
    if (noJapaneseVoice) return "Suara Jepang tidak terdeteksi. Cerita tetap bisa dibaca dan dijelajahi.";
    return started ? "Siap memutar dialog ini." : "Tekan Putar untuk memulai cerita.";
  }, [autoRunning, globalLineIndex, noJapaneseVoice, player.error, player.status, started, totalLines]);

  useEffect(() => {
    rateRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const map = new Map<string, string>();
    if (player.voices.length >= 2) {
      story.characters.forEach((character, index) => {
        const voice = player.voices[index % player.voices.length];
        if (voice) map.set(character.id, voice.voiceURI);
      });
    }
    voiceMapRef.current = map;
  }, [player.voices, story.characters]);

  useEffect(() => {
    return () => {
      autoTokenRef.current += 1;
      stopAudio();
    };
  }, []);

  useEffect(() => {
    if (!finished) return;
    const timer = window.setTimeout(() => quizHeadingRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [finished]);

  function trackFor(target: StoryLine): AudioTrack {
    const speaker = story.characters.find((character) => character.id === target.speakerId);
    return {
      id: "story:" + story.id + ":" + target.id,
      text: target.jp,
      speech: target.reading,
      reading: target.reading,
      label: (speaker?.name ?? "Narator") + " — " + story.title,
      audioUrl: target.audioUrl,
    };
  }

  function voiceFor(speakerId: string): string | null {
    return voiceMapRef.current.get(speakerId) ?? player.voiceURI ?? null;
  }

  async function playLine(target: StoryLine): Promise<boolean> {
    if (!startedAtRef.current) startedAtRef.current = Date.now();
    const playback = await playAudio(trackFor(target), {
      rate: rateRef.current,
      voiceURI: voiceFor(target.speakerId),
    });
    if (!playback.ok) {
      if (playback.reason !== "cancelled") toast.error(describeSpeechFailure(playback.reason));
      return false;
    }
    return true;
  }

  function cancelAuto(withStop = true) {
    autoTokenRef.current += 1;
    autoRunningRef.current = false;
    setAutoRunning(false);
    if (withStop) stopAudio();
  }

  async function runAuto(fromScene: number, fromLine: number) {
    const token = autoTokenRef.current + 1;
    autoTokenRef.current = token;
    autoRunningRef.current = true;
    setAutoRunning(true);
    setStarted(true);
    let currentScene = fromScene;
    let currentLine = fromLine;

    while (currentScene < story.scenes.length) {
      const targetScene = story.scenes[currentScene];
      const targetLine = targetScene.lines[currentLine];
      if (!targetLine) {
        currentScene += 1;
        currentLine = 0;
        continue;
      }
      if (token !== autoTokenRef.current) return;
      setSceneIndex(currentScene);
      setLineIndex(currentLine);
      await new Promise((resolve) => window.setTimeout(resolve, 280));
      if (token !== autoTokenRef.current) return;
      const played = await playLine(targetLine);
      if (token !== autoTokenRef.current) return;
      if (!played) {
        autoRunningRef.current = false;
        setAutoRunning(false);
        return;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      if (token !== autoTokenRef.current) return;
      currentLine += 1;
      if (currentLine >= targetScene.lines.length) {
        currentScene += 1;
        currentLine = 0;
      }
    }

    autoRunningRef.current = false;
    setAutoRunning(false);
    stopAudio();
    setFinished(true);
  }

  function finishStory() {
    cancelAuto();
    setFinished(true);
  }

  function resetProgress() {
    cancelAuto();
    setSceneIndex(0);
    setLineIndex(0);
    setStarted(false);
    setFinished(false);
    setAnswers({});
    setChecked(false);
    setResult(null);
    setSaved(false);
    setSaveError(null);
    setSaveBusy(false);
    attemptSavedRef.current = false;
    startedAtRef.current = 0;
  }

  async function togglePlayback() {
    if (activeLine && player.status === "playing") {
      player.pause();
      return;
    }
    if (activeLine && player.status === "paused") {
      player.resume();
      return;
    }
    setStarted(true);
    if (mode === "watch") {
      void runAuto(sceneIndex, lineIndex);
      return;
    }
    void playLine(line);
  }

  async function replayCurrent() {
    cancelAuto();
    setStarted(true);
    void playLine(line);
  }

  function stopPlayback() {
    cancelAuto();
  }

  function locate(target: number): { scene: number; line: number } | null {
    if (target < 0) return null;
    let remaining = target;
    for (let scenePosition = 0; scenePosition < story.scenes.length; scenePosition += 1) {
      const sceneLength = story.scenes[scenePosition].lines.length;
      if (remaining < sceneLength) return { scene: scenePosition, line: remaining };
      remaining -= sceneLength;
    }
    return null;
  }

  function jumpTo(nextScene: number, nextLine: number) {
    const wasAuto = autoRunningRef.current;
    cancelAuto();
    setSceneIndex(nextScene);
    setLineIndex(nextLine);
    setStarted(true);
    if (wasAuto) {
      void runAuto(nextScene, nextLine);
    } else if (mode === "study") {
      const target = story.scenes[nextScene]?.lines[nextLine];
      if (target) void playLine(target);
    }
  }

  function step(delta: number) {
    const next = locate(globalLineIndex + delta);
    if (!next) {
      if (delta > 0) finishStory();
      return;
    }
    jumpTo(next.scene, next.line);
  }

  function changeMode(next: StoryMode) {
    cancelAuto();
    setMode(next);
    setStarted(false);
    setFinished(false);
  }

  function changeSpeed(value: number) {
    setSpeed(value);
    rateRef.current = value;
    if (!autoRunningRef.current) player.setRate(value);
  }

  function changeVoice(value: string) {
    const next = value || null;
    player.setVoice(next);
    void saveSettings({ voiceURI: next });
  }

  async function playQuestion(question: StoryQuestion) {
    if (!question.audioText) return;
    const playback = await playAudio(
      {
        id: "story-question:" + question.id,
        text: question.audioText,
        speech: question.audioText,
        reading: question.audioText,
        label: "Soal pemahaman",
      },
      { rate: speed, voiceURI: player.voiceURI },
    );
    if (!playback.ok && playback.reason !== "cancelled") toast.error(describeSpeechFailure(playback.reason));
  }

  async function saveAttempt(scoreValue: number, correctValue: number) {
    if (attemptSavedRef.current) return;
    attemptSavedRef.current = true;
    setSaveBusy(true);
    setSaveError(null);
    try {
      await recordStory({
        storyId: story.id,
        mode,
        score: scoreValue,
        correct: correctValue,
        total: story.questions.length,
        scenesCompleted: story.scenes.length,
        durationSec: startedAtRef.current
          ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))
          : 1,
      });
      setSaved(true);
    } catch {
      attemptSavedRef.current = false;
      setSaveError("Hasil belum tersimpan. Periksa koneksi server lokal lalu coba lagi.");
    } finally {
      setSaveBusy(false);
    }
  }

  async function submitQuiz() {
    if (checked || !allAnswered) return;
    const correct = story.questions.filter((question) => answers[question.id] === question.answerIndex).length;
    const score = Math.round((correct / story.questions.length) * 100);
    setChecked(true);
    setResult({ correct, score });
    await saveAttempt(score, correct);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
      <div className="min-w-0 space-y-5">
        <Card className="overflow-hidden p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={levelTone(story.level)}>{story.level}</Badge>
                <Badge tone="muted">{difficultyLabel(story.difficulty)}</Badge>
                <Badge tone="muted">{story.minutes} menit</Badge>
              </div>
              <h2 className="mt-2 text-xl font-bold leading-tight">{story.title}</h2>
              <p className="mt-0.5 text-sm text-muted">
                {lineSpeaker ? "Pembicara: " + lineSpeaker.name : "Narator"} · Adegan {sceneIndex + 1} dari {story.scenes.length}
              </p>
            </div>
            {finished ? (
              <Badge tone="matcha">Selesai</Badge>
            ) : (
              <Segmented
                label="Mode cerita"
                value={mode}
                onChange={changeMode}
                options={[
                  { value: "study", label: "Mode belajar" },
                  { value: "watch", label: "Mode tonton" },
                ]}
              />
            )}
          </div>

          <StoryStage
            story={story}
            scene={scene}
            line={line}
            sceneIndex={sceneIndex}
            showSubtitles={showSubtitles}
            showFurigana={showFurigana}
            showRomaji={showRomaji}
            showTranslation={showTranslation}
            japaneseOnly={japaneseOnly}
          />

          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span>
                  {mode === "watch"
                    ? "Mode tonton memajukan dialog otomatis setelah audionya selesai."
                    : "Mode belajar memajukan dialog saat kamu menekan Lanjut."}
                </span>
                <span>{globalLineIndex + 1}/{totalLines}</span>
              </div>
              <ProgressBar
                label={"Progres dialog " + (globalLineIndex + 1) + " dari " + totalLines}
                value={globalLineIndex + 1}
                max={totalLines}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={() => void togglePlayback()}
                disabled={!canPlay}
                title={!canPlay ? "Browser ini belum mendukung audio dan tidak ada aset rekaman untuk dialog ini." : undefined}
              >
                <Icon name={activeLine && player.status === "playing" ? "pause" : "play"} size={16} />
                {activeLine && player.status === "playing" ? "Jeda" : activeLine && player.status === "paused" ? "Lanjut" : "Putar"}
              </Button>
              <Button type="button" variant="secondary" onClick={stopPlayback} aria-label="Hentikan audio cerita">
                Hentikan
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => step(-1)} disabled={globalLineIndex === 0}>
                <Icon name="chevronLeft" size={15} /> Sebelumnya
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => step(1)}>
                Berikutnya <Icon name="chevronRight" size={15} />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => void replayCurrent()}>
                <Icon name="rotate" size={15} /> Ulangi
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={resetProgress}>
                <Icon name="rotate" size={15} /> Mulai ulang
              </Button>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
                Kecepatan
                <select
                  value={speed}
                  onChange={(event) => changeSpeed(Number(event.target.value))}
                  className="h-10 rounded-full border border-line bg-surface px-3 text-sm font-semibold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
                >
                  {SPEEDS.map((value) => (
                    <option key={value} value={value}>{value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}x</option>
                  ))}
                </select>
              </label>
              <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-semibold text-muted sm:flex-none">
                Voice Jepang
                <select
                  value={player.voiceURI ?? ""}
                  onChange={(event) => changeVoice(event.target.value)}
                  disabled={player.voices.length === 0}
                  className="h-10 max-w-full rounded-full border border-line bg-surface px-3 text-sm font-semibold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:opacity-60 sm:max-w-64"
                >
                  <option value="">{player.voices.length ? "Otomatis (voice Jepang)" : "Belum ada voice Jepang"}</option>
                  {player.voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>
                  ))}
                </select>
              </label>
              <p className="max-w-full text-xs leading-relaxed text-muted sm:max-w-md">
                {voicesPresent
                  ? "Beberapa voice Jepang terdeteksi. Kotoba memberi voice berbeda untuk tiap karakter; bukan sulih suara profesional."
                  : "Satu voice Jepang atau kurang terdeteksi. Semua karakter memakai voice yang tersedia — Kotoba tidak memalsukan suara karakter berbeda."}
              </p>
            </div>

            <p role="status" className={cn("rounded-2xl px-3 py-2 text-xs", player.status === "error" ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300" : "bg-surface-2 text-muted")}>
              {statusLabel}
            </p>

            {noJapaneseVoice || !player.supported ? (
              <div className="rounded-2xl border border-gold/40 bg-gold-soft/60 p-3 text-xs leading-relaxed text-ink dark:bg-gold/10">
                <p className="font-bold">Suara Jepang belum tersedia di perangkat ini.</p>
                <p className="mt-1 text-muted">
                  Cerita tetap dapat dibaca, diterjemahkan, dan dijelajahi. Pasang paket bahasa Jepang atau voice
                  Japanese di pengaturan browser, lalu muat ulang halaman untuk mencoba audio. Kotoba tidak mengirim
                  teks ke layanan suara berbayar.
                </p>
              </div>
            ) : null}

            <div className="border-t border-line pt-3">
              <p className="mb-2 text-xs font-semibold text-muted">Lompat ke dialog</p>
              <div className="no-scrollbar flex flex-wrap gap-1.5" role="group" aria-label="Lompat ke dialog cerita">
                {story.scenes.map((storyScene, scenePosition) =>
                  storyScene.lines.map((storyLine, linePosition) => {
                    const targetIndex =
                      story.scenes.slice(0, scenePosition).reduce((sum, item) => sum + item.lines.length, 0) + linePosition;
                    const current = targetIndex === globalLineIndex;
                    return (
                      <button
                        key={storyLine.id}
                        type="button"
                        aria-label={"Dialog " + (targetIndex + 1) + ": " + speakerName(story, storyLine.speakerId)}
                        aria-current={current ? "true" : undefined}
                        onClick={() => jumpTo(scenePosition, linePosition)}
                        className={cn(
                          "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[11px] font-semibold transition-colors",
                          current ? "bg-brand text-white" : "bg-surface-2 text-muted hover:text-ink",
                        )}
                      >
                        {targetIndex + 1}
                      </button>
                    );
                  }),
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {story.scenes.map((storyScene, scenePosition) => (
                  <button
                    key={storyScene.id}
                    type="button"
                    aria-pressed={sceneIndex === scenePosition}
                    onClick={() => jumpTo(scenePosition, 0)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      sceneIndex === scenePosition ? "border-brand bg-brand-soft text-brand-strong dark:bg-brand/20 dark:text-brand" : "border-line text-muted hover:text-ink",
                    )}
                  >
                    {scenePosition + 1}. {storyScene.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Dialog aktif · 会話</p>
              <h3 className="mt-1 flex items-center gap-2 text-lg font-bold">
                {lineSpeaker?.name ?? "Narator"}
                {lineSpeaker ? <span lang="ja" className="font-jp text-sm font-normal text-muted">{lineSpeaker.nameJp}</span> : null}
              </h3>
            </div>
            <Button type="button" size="sm" variant="secondary" onClick={() => setSelectedVocabId(line.vocabIds?.[0] ?? null)} disabled={!line.vocabIds?.length}>
              <Icon name="dictionary" size={15} /> Lihat kosakata
            </Button>
          </div>

          <JpText
            text={line.jp}
            as="p"
            showFurigana={showFurigana}
            className="mt-3 text-lg font-semibold leading-relaxed sm:text-xl"
          />
          {showRomaji && !japaneseOnly ? <p className="mt-1 text-sm italic text-muted">{line.romaji}</p> : null}
          {showTranslation && !japaneseOnly ? <p className="mt-2 text-sm leading-relaxed text-muted">{line.meaning}</p> : null}
          {line.note ? <p className="mt-2 rounded-xl bg-surface-2 px-3 py-2 text-xs text-muted">{line.note}</p> : null}

          {showVocab && sceneVocab.length ? (
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted">Kosakata dialog</p>
              <div className="flex flex-wrap gap-1.5">
                {sceneVocab.map((item) =>
                  item ? (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedVocabId(item.id)}
                      className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold transition-colors hover:border-brand hover:text-brand"
                    >
                      <span lang="ja" className="font-jp">{item.japanese}</span>
                      <span className="ml-1 text-muted">{item.kana}</span>
                    </button>
                  ) : null,
                )}
              </div>
            </div>
          ) : null}

          {showGrammar && sceneGrammar.length ? (
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted">Tata bahasa dialog</p>
              <div className="flex flex-wrap gap-1.5">
                {sceneGrammar.map((item) =>
                  item ? (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedGrammarId(item.id)}
                      className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold transition-colors hover:border-brand hover:text-brand"
                    >
                      <span lang="ja" className="font-jp">{item.pattern}</span>
                      <span className="ml-1 text-muted">{item.meaning}</span>
                    </button>
                  ) : null,
                )}
              </div>
            </div>
          ) : null}
        </Card>

        {finished ? (
          <Card className="p-5" aria-labelledby="story-quiz-title">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Selesai · 完了</p>
                <h2 id="story-quiz-title" ref={quizHeadingRef} tabIndex={-1} className="mt-1 text-xl font-bold">
                  Pemahaman cerita
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Jawab semua pertanyaan untuk menyimpan hasil dan melihat kosakata penting.
                </p>
              </div>
              {result ? (
                <div className="rounded-2xl bg-brand-soft px-4 py-3 text-right dark:bg-brand/15">
                  <p className="text-2xl font-bold text-brand-strong dark:text-brand">{result.score}%</p>
                  <p className="text-xs text-muted">{result.correct}/{story.questions.length} benar</p>
                </div>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              {story.questions.map((question, questionIndex) => (
                <div key={question.id} className="rounded-2xl border border-line p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={question.kind === "listening" ? "indigo" : "brand"}>
                      {question.kind === "listening" ? "Menyimak" : "Pemahaman"}
                    </Badge>
                    <span className="text-xs text-muted">Soal {questionIndex + 1} dari {story.questions.length}</span>
                    {question.audioText ? (
                      <button
                        type="button"
                        onClick={() => void playQuestion(question)}
                        className="ml-auto inline-flex h-8 items-center gap-1 rounded-full bg-surface-2 px-3 text-xs font-semibold text-muted hover:text-ink"
                      >
                        <Icon name="volume" size={14} /> Putar audio
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-2 font-semibold">{question.prompt}</p>
                  <div className="mt-3 grid gap-2" role="group" aria-label={"Pilihan jawaban soal " + (questionIndex + 1)}>
                    {question.options.map((option, optionIndex) => {
                      const selected = answers[question.id] === optionIndex;
                      const isCorrect = checked && optionIndex === question.answerIndex;
                      const isWrong = checked && selected && optionIndex !== question.answerIndex;
                      return (
                        <button
                          key={optionIndex}
                          type="button"
                          aria-pressed={selected}
                          disabled={checked}
                          onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: optionIndex }))}
                          className={cn(
                            "flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                            selected && !checked && "border-brand bg-brand-soft dark:bg-brand/15",
                            isCorrect && "border-matcha bg-matcha-soft text-ink dark:bg-matcha/15",
                            isWrong && "border-red-400 bg-red-50 dark:bg-red-500/10",
                            !selected && !checked && "border-line hover:border-brand/60",
                          )}
                        >
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {checked ? (
                    <p role="status" className="mt-2 rounded-xl bg-surface-2 px-3 py-2 text-xs leading-relaxed text-muted">
                      {answers[question.id] === question.answerIndex ? "Benar. " : "Belum tepat. "}
                      {question.explanation}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!checked ? (
                <Button type="button" onClick={() => void submitQuiz()} disabled={!allAnswered || saveBusy}>
                  Periksa jawaban & simpan hasil
                </Button>
              ) : (
                <span role="status" className="text-sm font-semibold text-matcha">
                  {saveBusy ? "Menyimpan hasil..." : saved ? "Hasil tersimpan." : saveError ?? "Hasil belum tersimpan."}
                </span>
              )}
              {saveError && result ? (
                <Button type="button" variant="secondary" size="sm" onClick={() => void saveAttempt(result.score, result.correct)}>
                  Coba simpan lagi
                </Button>
              ) : null}
              <Button type="button" variant="secondary" onClick={resetProgress}>
                <Icon name="rotate" size={15} /> Putar ulang cerita
              </Button>
              <Link href="/stories" className="text-sm font-semibold text-brand hover:underline">
                Kembali ke daftar cerita
              </Link>
            </div>

            <div className="mt-6 grid gap-5 border-t border-line pt-5 lg:grid-cols-2">
              <div>
                <h3 className="text-base font-bold">Kosakata cerita</h3>
                <p className="mt-0.5 text-xs text-muted">Simpan kata penting ke kamus pribadi.</p>
                <div className="mt-3 space-y-2">
                  {summaryVocab.map((item) =>
                    item ? (
                      <div key={item.id} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
                        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setSelectedVocabId(item.id)}>
                          <span lang="ja" className="font-jp text-sm font-semibold">{item.japanese}</span>
                          <span className="ml-1 text-xs text-muted">{item.kana}</span>
                          <span className="block truncate text-xs text-muted">{item.meaning}</span>
                        </button>
                        <SaveButton kind="vocabulary" refId={item.id} compact />
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold">Tata bahasa penting</h3>
                <p className="mt-0.5 text-xs text-muted">Pola yang muncul dalam cerita ini.</p>
                <div className="mt-3 space-y-2">
                  {summaryGrammar.map((item) =>
                    item ? (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedGrammarId(item.id)}
                        className="block w-full rounded-xl border border-line px-3 py-2 text-left transition-colors hover:border-brand"
                      >
                        <span lang="ja" className="font-jp text-sm font-semibold">{item.pattern}</span>
                        <span className="mt-0.5 block text-xs text-muted">{item.meaning}</span>
                      </button>
                    ) : null,
                  )}
                </div>
              </div>
            </div>
            <p className="mt-5 text-xs text-muted">
              Skor ini adalah latihan pemahaman Kotoba, bukan nilai resmi JLPT. Semua dialog dan ilustrasi dibuat orisinal.
            </p>
          </Card>
        ) : (
          <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="font-bold">Sudah selesai membaca?</p>
              <p className="text-sm text-muted">Buka kuis pemahaman, simpan progres, lalu tinjau kosakata cerita.</p>
            </div>
            <Button type="button" onClick={finishStory}>
              <Icon name="check" size={16} /> Selesaikan cerita
            </Button>
          </Card>
        )}
      </div>

      <aside className="min-w-0 space-y-4">
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <Icon name="settings" size={18} className="text-brand" /> Kontrol belajar
          </h2>
          <div className="mt-2 divide-y divide-line">
            <Toggle checked={showSubtitles} onChange={setShowSubtitles} label="Subtitle Jepang" description="Tampilkan balon dialog di atas panggung." />
            <Toggle checked={showFurigana} onChange={setShowFurigana} label="Furigana" description="Bacaan kana di atas kanji." />
            <Toggle checked={showRomaji} onChange={setShowRomaji} label="Romaji" description="Bantuan baca Latin." />
            <Toggle checked={showTranslation} onChange={setShowTranslation} label="Terjemahan Indonesia" description="Arti kalimat dalam bahasa Indonesia." />
            <Toggle checked={japaneseOnly} onChange={setJapaneseOnly} label="Mode Jepang saja" description="Sembunyikan romaji dan terjemahan." />
            <Toggle checked={showVocab} onChange={setShowVocab} label="Sorotan kosakata" description="Chip kosakata pada dialog aktif." />
            <Toggle checked={showGrammar} onChange={setShowGrammar} label="Catatan tata bahasa" description="Pola tata bahasa yang muncul." />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-bold">Tentang adegan</h2>
          <p className="mt-1 text-sm font-semibold">{scene.title}</p>
          <p lang="ja" className="font-jp text-xs text-muted">{scene.titleJp}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{scene.setting}</p>
          <div className="mt-4 space-y-2">
            {story.characters.map((character) => (
              <div key={character.id} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2">
                <span className="h-8 w-8 shrink-0 rounded-full" style={{ background: character.accent }} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {character.name}
                    <span lang="ja" className="ml-1 font-jp text-xs font-normal text-muted">{character.nameJp}</span>
                  </p>
                  <p className="truncate text-xs text-muted">{character.role}</p>
                </div>
                {line.speakerId === character.id ? <Badge tone="brand" className="ml-auto">Berbicara</Badge> : null}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-bold">Tentang cerita</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{story.summary}</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted">Level</dt><dd className="font-semibold">{story.level}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Kesulitan</dt><dd className="font-semibold">{difficultyLabel(story.difficulty)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Perkiraan</dt><dd className="font-semibold">{story.minutes} menit</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Dialog</dt><dd className="font-semibold">{totalLines}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Soal</dt><dd className="font-semibold">{story.questions.length}</dd></div>
          </dl>
          {story.culturalNote ? (
            <div className="mt-4 rounded-2xl bg-gold-soft/60 p-3 text-xs leading-relaxed text-ink dark:bg-gold/10">
              <p className="font-bold">Catatan budaya</p>
              <p className="mt-1 text-muted">{story.culturalNote}</p>
            </div>
          ) : null}
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Suara memakai Web Speech API perangkat. Sorotan mengikuti dialog, bukan sinkronisasi per kata.
            Cerita, tokoh, dan ilustrasi adalah konten orisinal Kotoba.
          </p>
        </Card>
      </aside>

      <Modal
        open={Boolean(selectedVocab)}
        onClose={() => setSelectedVocabId(null)}
        title="Kosakata cerita"
        size="sm"
      >
        {selectedVocab ? (
          <div className="space-y-3">
            <div>
              <p lang="ja" className="font-jp text-2xl font-bold">{selectedVocab.japanese}</p>
              <p className="text-sm text-muted">{selectedVocab.kana} · {selectedVocab.romaji}</p>
              <p className="mt-2 font-semibold">{selectedVocab.meaning}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="brand">{selectedVocab.level}</Badge>
                <Badge tone="muted">{selectedVocab.pos}</Badge>
                <Badge tone="muted">{selectedVocab.topic}</Badge>
              </div>
            </div>
            {selectedVocab.examples[0] ? (
              <div className="rounded-2xl bg-surface-2 p-3">
                <JpText text={selectedVocab.examples[0].jp} as="p" showFurigana={showFurigana} className="font-semibold" />
                <p className="mt-1 text-xs text-muted">{selectedVocab.examples[0].meaning}</p>
              </div>
            ) : null}
            <SaveButton kind="vocabulary" refId={selectedVocab.id} />
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(selectedGrammar)}
        onClose={() => setSelectedGrammarId(null)}
        title="Catatan tata bahasa"
        size="md"
      >
        {selectedGrammar ? (
          <div className="space-y-3">
            <div>
              <p lang="ja" className="font-jp text-xl font-bold">{selectedGrammar.pattern}</p>
              <p className="mt-1 text-sm font-semibold">{selectedGrammar.meaning}</p>
              <Badge tone="muted" className="mt-2">{selectedGrammar.level}</Badge>
            </div>
            <div className="space-y-2 text-sm leading-relaxed text-muted">
              {selectedGrammar.explanation.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="rounded-2xl bg-surface-2 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Formasi</p>
              <ul className="mt-1 space-y-1 text-sm">
                {selectedGrammar.formation.map((item) => (
                  <li key={item.label}><span className="font-semibold">{item.label}:</span> {item.form}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
