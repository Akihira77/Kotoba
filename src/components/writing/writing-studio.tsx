"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useProgress } from "@/components/providers/progress-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Badge, Button, Card, Segmented } from "@/components/ui";
import { Icon } from "@/components/icons";
import {
  WRITING_MASTERY_SCORE,
  combinedWidth,
  compareStroke,
  distance,
  evaluateWriting,
  flattenGlyphPoints,
  writingScoreLabel,
  type StrokeComparison,
  type WritingEvaluation,
} from "@/lib/writing-geometry";
import type { WritingCharacter, WritingPoint } from "@/lib/types";
import { StrokeStage } from "./stroke-stage";
import { useGlyphData } from "./use-glyph-data";

type StudioMode = "animate" | "guided" | "free";

const MODE_OPTIONS: Array<{ value: StudioMode; label: string }> = [
  { value: "animate", label: "Animasi" },
  { value: "guided", label: "Tirukan" },
  { value: "free", label: "Mandiri" },
];

const SPEEDS = [
  { value: "0.6", label: "Lambat" },
  { value: "1", label: "Normal" },
  { value: "1.5", label: "Cepat" },
];

function pointsAttribute(points: WritingPoint[]): string {
  return points.map((point) => point.x.toFixed(2) + "," + point.y.toFixed(2)).join(" ");
}

function formatScore(score: number): string {
  return String(Math.max(0, Math.min(100, Math.round(score))));
}

export function WritingStudio({ item }: { item: WritingCharacter }) {
  const { snapshot, recordWriting } = useProgress();
  const toast = useToast();
  const { data, error, loading, retry } = useGlyphData(item.glyphs);
  const [mode, setMode] = useState<StudioMode>("animate");
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [active, setActive] = useState(0);
  const [replayTick, setReplayTick] = useState(0);
  const [tracing, setTracing] = useState<WritingPoint[][]>([]);
  const [liveStroke, setLiveStroke] = useState<WritingPoint[]>([]);
  const [guidedIndex, setGuidedIndex] = useState(0);
  const [guidedResults, setGuidedResults] = useState<StrokeComparison[]>([]);
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showReference, setShowReference] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const drawingRef = useRef<WritingPoint[] | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const expected = useMemo(() => (data ? flattenGlyphPoints(data) : []), [data]);
  const total = expected.length;
  const width = data ? combinedWidth(data.length) : 109;
  const isPlaying = playing && active < total;

  const strokeRows = useMemo(
    () =>
      data
        ? data.flatMap((glyph, glyphIndex) =>
            glyph.strokes.map((stroke) => ({
              ...stroke,
              character: glyph.character,
              globalIndex:
                data.slice(0, glyphIndex).reduce((sum, current) => sum + current.strokes.length, 0) +
                Number(stroke.number) -
                1,
            })),
          )
        : [],
    [data],
  );

  const attempts = snapshot.writing.filter((attempt) => attempt.characterId === item.id);
  const bestScore = attempts.reduce((best, attempt) => Math.max(best, attempt.score), 0);

  useEffect(() => {
    if (!isPlaying || total === 0) return;
    const timer = window.setTimeout(() => setActive((value) => Math.min(total, value + 1)), 820 / speed);
    return () => window.clearTimeout(timer);
  }, [isPlaying, active, total, speed]);

  useEffect(() => {
    if (!evaluation) return;
    resultRef.current?.focus();
  }, [evaluation]);

  function resetStudio(nextMode: StudioMode = mode, autoplay = nextMode === "animate") {
    setTracing([]);
    setLiveStroke([]);
    drawingRef.current = null;
    setGuidedIndex(0);
    setGuidedResults([]);
    setEvaluation(null);
    setFeedback(null);
    setSaved(false);
    setActive(0);
    setPlaying(autoplay);
    setReplayTick((value) => value + 1);
    setStartedAt(Date.now());
  }

  function changeMode(nextMode: StudioMode) {
    setMode(nextMode);
    resetStudio(nextMode);
  }

  function togglePlay() {
    if (isPlaying) {
      setPlaying(false);
      return;
    }
    if (active >= total) {
      setActive(0);
      setReplayTick((value) => value + 1);
    }
    setPlaying(true);
  }

  function step(direction: -1 | 1) {
    setPlaying(false);
    setActive((value) => Math.max(0, Math.min(total, value + direction)));
  }

  function replayCurrent() {
    setPlaying(false);
    setActive((value) => Math.max(0, value >= total ? total - 1 : value));
    setReplayTick((value) => value + 1);
  }

  function toPoint(event: ReactPointerEvent<SVGSVGElement>): WritingPoint {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * width;
    const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 109;
    return {
      x: Math.max(0, Math.min(width, x)),
      y: Math.max(0, Math.min(109, y)),
    };
  }

  function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (mode === "animate" || !data || evaluation) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = toPoint(event);
    drawingRef.current = [point];
    setLiveStroke([point]);
    setFeedback(null);
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const current = drawingRef.current;
    if (!current) return;
    const point = toPoint(event);
    const last = current[current.length - 1];
    if (last && distance(last, point) < 0.35) return;
    current.push(point);
    setLiveStroke([...current]);
  }

  function finishStroke(event: ReactPointerEvent<SVGSVGElement>) {
    const current = drawingRef.current;
    if (!current || current.length < 2) {
      drawingRef.current = null;
      setLiveStroke([]);
      return;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const points = current.map((point) => ({ ...point }));
    drawingRef.current = null;
    setLiveStroke([]);

    if (mode === "guided") {
      const currentIndex = guidedIndex;
      if (currentIndex >= expected.length) return;
      const comparison = compareStroke(expected[currentIndex], points);
      const nextTracing = [...tracing, points];
      const nextResults = [...guidedResults, comparison];
      const nextIndex = currentIndex + 1;
      setTracing(nextTracing);
      setGuidedResults(nextResults);
      setGuidedIndex(nextIndex);
      if (nextIndex >= expected.length) {
        const result = evaluateWriting(expected, nextTracing);
        setEvaluation(result);
        setFeedback(
          "Semua goresan selesai. Skor geometri " + result.score + " dari 100. " + writingScoreLabel(result.score) + ".",
        );
      } else {
        setFeedback(
          "Goresan " +
            (currentIndex + 1) +
            ": " +
            comparison.score +
            "/100. " +
            writingScoreLabel(comparison.score) +
            ". Lanjut ke goresan " +
            (nextIndex + 1) +
            ".",
        );
      }
      return;
    }

    setTracing((previous) => [...previous, points]);
    setEvaluation(null);
    setSaved(false);
    setFeedback("Goresan " + (tracing.length + 1) + " tercatat. Lanjutkan atau nilai gambarmu.");
  }

  function undoStroke() {
    if (mode === "guided") {
      if (guidedIndex === 0) return;
      setTracing((previous) => previous.slice(0, -1));
      setGuidedResults((previous) => previous.slice(0, -1));
      setGuidedIndex((value) => Math.max(0, value - 1));
    } else {
      setTracing((previous) => previous.slice(0, -1));
    }
    setEvaluation(null);
    setSaved(false);
    setFeedback("Goresan terakhir dibatalkan.");
  }

  function evaluateFree() {
    if (expected.length === 0 || tracing.length === 0) return;
    const result = evaluateWriting(expected, tracing);
    setEvaluation(result);
    setFeedback("Penilaian geometri selesai: " + result.score + "/100. " + writingScoreLabel(result.score) + ".");
  }

  async function saveAttempt() {
    if (!evaluation || saving || saved) return;
    setSaving(true);
    try {
      const durationSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      await recordWriting({
        characterId: item.id,
        mode: mode === "guided" ? "guided" : "free",
        score: evaluation.score,
        drawnStrokes: tracing.length,
        orderMistakes: evaluation.orderMistakes,
        durationSec,
      });
      setSaved(true);
      toast.success("Latihan menulis tersimpan.");
    } catch {
      toast.error("Latihan menulis belum tersimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  const guidedActive = mode === "guided" && guidedIndex < total ? guidedIndex : undefined;
  const animationActive = mode === "animate" && active < total ? active : undefined;
  const referenceDone = mode === "guided" ? guidedIndex : mode === "animate" ? active : 0;
  const stageActive = mode === "animate" ? animationActive : guidedActive;
  const stageDone = mode === "animate" ? active : referenceDone;
  const faintReference = mode === "free" && showReference;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-6">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">Studio menulis</p>
              <h2 className="mt-1 font-jp text-4xl font-semibold" lang="ja">
                {item.char}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {item.script === "kanji"
                  ? "Kanji " + (item.level ?? "") + " · " + item.meanings.join(", ")
                  : item.romaji + " · " + item.strokeCount + " goresan"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="matcha">{item.strokeCount} goresan</Badge>
              {attempts.length > 0 ? (
                <Badge tone={bestScore >= WRITING_MASTERY_SCORE ? "matcha" : "gold"}>
                  Terbaik {bestScore}
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Segmented options={MODE_OPTIONS} value={mode} onChange={changeMode} label="Mode latihan menulis" size="sm" />
            {mode === "animate" ? (
              <Segmented
                options={SPEEDS}
                value={String(speed)}
                onChange={(value) => setSpeed(Number(value))}
                label="Kecepatan animasi"
                size="sm"
              />
            ) : null}
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-brand/30 bg-brand-soft/50 p-4 text-sm" role="alert">
              <p className="font-semibold">Data goresan belum bisa dimuat.</p>
              <p className="mt-1 text-muted">{error}</p>
              <Button className="mt-3" size="sm" variant="secondary" onClick={retry}>
                Coba lagi
              </Button>
            </div>
          ) : null}

          {loading ? (
            <div className="mt-5 space-y-3" role="status" aria-live="polite">
              <div className="mx-auto aspect-square w-full max-w-[440px] animate-pulse rounded-3xl bg-surface-2" />
              <p className="text-center text-sm text-muted">Memuat data goresan KanjiVG…</p>
            </div>
          ) : null}

          {data ? (
            <div className="mt-5">
              {mode === "animate" ? (
                <div className="mx-auto max-w-[460px]">
                  <div className="relative rounded-3xl border border-line bg-surface p-3">
                    <StrokeStage
                      key={"animation-" + active + "-" + replayTick}
                      glyphs={data}
                      activeStroke={animationActive}
                      doneStrokes={stageDone}
                      animateActive
                      label={`Animasi urutan goresan ${item.char}`}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => step(-1)} aria-label="Goresan sebelumnya" disabled={active <= 0}>
                      <Icon name="chevronLeft" size={16} />
                    </Button>
                    <Button size="sm" onClick={togglePlay} aria-label={isPlaying ? "Jeda animasi" : "Putar animasi"}>
                      <Icon name={isPlaying ? "pause" : "play"} size={16} />
                      {isPlaying ? "Jeda" : active >= total ? "Ulang" : "Putar"}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => step(1)} aria-label="Goresan berikutnya" disabled={active >= total}>
                      <Icon name="chevronRight" size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={replayCurrent}>
                      <Icon name="rotate" size={16} />
                      Ulang goresan
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => resetStudio("animate")}>
                      <Icon name="rotate" size={16} />
                      Mulai ulang
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted">
                    <span>
                      Goresan {Math.min(total, active + (active < total ? 1 : 0))} dari {total}
                    </span>
                    <span>{Math.round(speed * 10) / 10}×</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-label="Kemajuan animasi goresan" aria-valuemin={0} aria-valuemax={total} aria-valuenow={active}>
                    <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: (total ? (active / total) * 100 : 0) + "%" }} />
                  </div>
                  <p className="mt-3 text-center text-xs text-muted">
                    Animasi mengikuti data KanjiVG. Alat ini tidak menilai kecepatan atau tekanan pena.
                  </p>
                </div>
              ) : (
                <div className="mx-auto max-w-[500px]">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm">
                      {mode === "guided" ? (
                        <span>
                          Goresan <strong>{Math.min(guidedIndex + 1, total)}</strong> dari {total}
                          {data.length > 1 ? " · komponen " + (guidedIndex < (data[0]?.strokes.length ?? 0) ? "1" : "2") : ""}
                        </span>
                      ) : (
                        <span>{tracing.length} goresan digambar</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mode === "free" ? (
                        <Button size="sm" variant="ghost" onClick={() => setShowReference((value) => !value)} aria-pressed={showReference}>
                          <Icon name={showReference ? "eyeOff" : "eye"} size={16} />
                          {showReference ? "Sembunyikan contoh" : "Tampilkan contoh"}
                        </Button>
                      ) : null}
                      <Button size="sm" variant="ghost" onClick={undoStroke} disabled={tracing.length === 0}>
                        Undo
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => resetStudio(mode)} disabled={tracing.length === 0 && !evaluation}>
                        <Icon name="trash" size={16} />
                        Reset
                      </Button>
                    </div>
                  </div>

                  <div
                    className="writing-canvas-surface relative w-full overflow-hidden rounded-3xl border border-line bg-surface"
                    style={{ aspectRatio: width + " / 109" }}
                  >
                    {mode === "guided" || showReference ? (
                      <StrokeStage
                        key={"trace-" + guidedIndex + "-" + replayTick}
                        glyphs={data}
                        activeStroke={faintReference ? total : stageActive}
                        doneStrokes={faintReference ? 0 : stageDone}
                        showNumbers
                        className="pointer-events-none absolute inset-0"
                        label={`Contoh goresan ${item.char}`}
                      />
                    ) : null}
                    <svg
                      viewBox={"0 0 " + width + " 109"}
                      className="writing-canvas absolute inset-0 h-full w-full"
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={finishStroke}
                      onPointerCancel={() => {
                        drawingRef.current = null;
                        setLiveStroke([]);
                      }}
                      role="img"
                      aria-label={
                        mode === "guided"
                          ? "Kanvas menirukan goresan " + item.char + ". Gunakan mouse, jari, atau stylus."
                          : "Kanvas latihan mandiri untuk " + item.char + ". Gunakan mouse, jari, atau stylus."
                      }
                    >
                      {tracing.map((points, index) => (
                        <polyline key={"drawn-" + index} points={pointsAttribute(points)} className="writing-draw-stroke" />
                      ))}
                      {liveStroke.length > 1 ? <polyline points={pointsAttribute(liveStroke)} className="writing-draw-stroke opacity-80" /> : null}
                    </svg>
                  </div>

                  <div className="mt-3 min-h-12 text-sm" aria-live="polite">
                    {feedback ? <p className="text-muted">{feedback}</p> : null}
                    {!feedback ? (
                      <p className="text-muted">
                        {mode === "guided"
                          ? "Ikuti garis merah dari titik awal. Lepaskan jari atau pena setelah satu goresan selesai."
                          : "Gambar karakter dari ingatan. Contoh bisa disembunyikan sebelum mulai."}
                      </p>
                    ) : null}
                  </div>

                  {guidedResults.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {guidedResults.map((result, index) => (
                        <span key={index} className="rounded-full border border-line px-2.5 py-1 text-xs">
                          Goresan {index + 1}: {result.score}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {mode === "free" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" onClick={evaluateFree} disabled={tracing.length === 0 || Boolean(evaluation)}>
                        <Icon name="check" size={16} />
                        Nilai gambar
                      </Button>
                      <span className="self-center text-xs text-muted">Skor memakai perkiraan geometri, bukan pengenalan tulisan tangan.</span>
                    </div>
                  ) : null}

                  {evaluation ? (
                    <div ref={resultRef} tabIndex={-1} className="mt-5 rounded-3xl border border-line bg-surface-2/60 p-4 outline-none" aria-live="polite">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Hasil latihan</p>
                          <p className="mt-1 text-3xl font-semibold">{formatScore(evaluation.score)}<span className="text-base font-normal text-muted">/100</span></p>
                          <p className="mt-1 text-sm text-muted">{writingScoreLabel(evaluation.score)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-sm">
                          <span className="text-muted">Goresan cocok</span>
                          <span className="text-right font-semibold">{evaluation.matchedStrokes}/{total}</span>
                          <span className="text-muted">Jumlah goresan</span>
                          <span className="text-right font-semibold">{tracing.length}/{total}</span>
                          <span className="text-muted">Perkiraan urutan</span>
                          <span className="text-right font-semibold">{evaluation.orderMistakes === 0 ? "sesuai" : evaluation.orderMistakes + " perlu dicek"}</span>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-muted">
                        Ini perkiraan geometri dari posisi, bentuk, dan arah goresan. Bukan pengenalan tulisan tangan, bukan nilai estetika, dan bukan sertifikasi.
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button size="sm" onClick={saveAttempt} disabled={saving || saved}>
                          <Icon name={saved ? "check" : "writing"} size={16} />
                          {saved ? "Tersimpan" : saving ? "Menyimpan…" : "Simpan latihan"}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => resetStudio(mode)}>
                          Coba lagi
                        </Button>
                        {saved ? (
                          <Link href="/progress" className="text-sm font-semibold text-brand hover:underline">
                            Lihat progres
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold">Urutan goresan</h2>
          <p className="mt-1 text-sm text-muted">
            Nomor mengikuti KanjiVG. Titik biru adalah awal goresan, titik merah adalah akhir.
          </p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {strokeRows.map((stroke) => (
              <li key={"stroke-" + stroke.globalIndex} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold">
                  {stroke.globalIndex + 1}
                </span>
                <svg viewBox="0 0 109 109" className="h-10 w-10 shrink-0" role="img" aria-label={`Goresan ${stroke.globalIndex + 1}`}>
                  <path d={stroke.d} className="writing-reference-stroke" />
                  <circle cx={stroke.start.x} cy={stroke.start.y} r="2.4" fill="var(--c-indigo)" />
                  <circle cx={stroke.end.x} cy={stroke.end.y} r="2.4" fill="var(--c-brand)" />
                </svg>
                <div className="min-w-0 text-xs">
                  <p className="font-semibold">
                    {stroke.character} · goresan {Number(stroke.number)}
                  </p>
                  <p className="text-muted">
                    mulai ({Math.round(stroke.start.x)}, {Math.round(stroke.start.y)}) → akhir ({Math.round(stroke.end.x)}, {Math.round(stroke.end.y)})
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <aside className="min-w-0 space-y-4">
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Informasi karakter</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Jenis</dt>
              <dd className="font-semibold">{item.script === "kanji" ? "Kanji" : item.script === "hiragana" ? "Hiragana" : "Katakana"}</dd>
            </div>
            {item.script !== "kanji" ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Romaji</dt>
                <dd className="font-semibold">{item.romaji}</dd>
              </div>
            ) : (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Level</dt>
                <dd className="font-semibold">{item.level}</dd>
              </div>
            )}
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Goresan</dt>
              <dd className="font-semibold">{item.strokeCount}</dd>
            </div>
            {item.radical ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Radikal</dt>
                <dd className="font-semibold" lang="ja">{item.radical} · {item.radicalMeaning}</dd>
              </div>
            ) : null}
            {item.on.length > 0 ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">On’yomi</dt>
                <dd className="text-right font-semibold" lang="ja">{item.on.join("、")}</dd>
              </div>
            ) : null}
            {item.kun.length > 0 ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Kun’yomi</dt>
                <dd className="text-right font-semibold" lang="ja">{item.kun.join("、")}</dd>
              </div>
            ) : null}
          </dl>
          {item.meanings.length > 0 ? (
            <p className="mt-3 border-t border-line pt-3 text-sm">
              <span className="text-muted">Arti: </span>
              {item.meanings.join(", ")}
            </p>
          ) : null}
          {item.mnemonic ? (
            <p className="mt-3 rounded-2xl bg-gold-soft/60 p-3 text-sm text-ink dark:bg-gold/10">
              <span className="font-semibold">Cara mengingat: </span>
              {item.mnemonic}
            </p>
          ) : null}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold">Kesalahan umum</h2>
          <ul className="mt-2 space-y-2 text-sm text-muted">
            {item.notes.map((note, index) => (
              <li key={index} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </Card>

        {item.examples.length > 0 ? (
          <Card className="p-5">
            <h2 className="text-sm font-semibold">Contoh kata</h2>
            <ul className="mt-3 space-y-2">
              {item.examples.map((example) => (
                <li key={example.word} className="rounded-2xl border border-line px-3 py-2">
                  <p className="font-jp text-lg" lang="ja">{example.word}</p>
                  <p className="text-xs text-muted">
                    <span lang="ja">{example.reading}</span> · {example.meaning}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <Card className="p-5">
          <h2 className="text-sm font-semibold">Riwayat latihan</h2>
          {attempts.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Belum ada latihan untuk karakter ini.</p>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">
                {attempts.length} latihan · skor terbaik {bestScore}
                {bestScore >= WRITING_MASTERY_SCORE ? " · dikuasai" : ""}
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-muted">
                {attempts.slice(0, 4).map((attempt) => (
                  <li key={attempt.id} className="flex justify-between gap-2">
                    <span>{attempt.mode === "guided" ? "Tirukan" : "Mandiri"}</span>
                    <span>{attempt.score}/100 · {attempt.orderMistakes} urutan perlu dicek</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card className="p-5 text-xs text-muted">
          <p className="font-semibold text-ink">Sumber data goresan</p>
          <p className="mt-2">
            KanjiVG oleh Ulrich Apel dan kontributor, lisensi CC BY-SA 3.0. Data diimpor pada commit tetap dan
            disimpan lokal.
          </p>
          <div className="mt-3 flex flex-col gap-1">
            <a className="font-semibold text-brand hover:underline" href="https://kanjivg.tagaini.net/" target="_blank" rel="noreferrer">
              kanjivg.tagaini.net
            </a>
            <a className="font-semibold text-brand hover:underline" href="/licenses/kanjivg-CC-BY-SA-3.0.txt">
              Teks lisensi lengkap
            </a>
            <Link className="font-semibold text-brand hover:underline" href="/writing">
              Kembali ke daftar karakter
            </Link>
          </div>
        </Card>
      </aside>
    </div>
  );
}
