"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { JpText } from "@/components/japanese";
import { useProgress } from "@/components/providers/progress-provider";
import { Badge, Button, Card, EmptyState, LinkButton, PageHeader, ProgressBar, Segmented, StatTile } from "@/components/ui";
import { CONVERSATIONS, CONVERSATION_CATEGORIES } from "@/content/conversations";
import { cn } from "@/lib/utils";

type LevelFilter = "semua" | "N5" | "N4";

const LEVEL_OPTIONS: Array<{ value: LevelFilter; label: string }> = [
  { value: "semua", label: "Semua level" },
  { value: "N5", label: "N5 · Pemula" },
  { value: "N4", label: "N4 · Dasar" },
];

export default function ConversationPage() {
  const { snapshot } = useProgress();
  const [level, setLevel] = useState<LevelFilter>("semua");
  const [category, setCategory] = useState<string>("semua");

  const completed = useMemo(() => {
    const map = new Map<string, number>();
    for (const lesson of snapshot.lessons) {
      if (lesson.kind !== "conversation") continue;
      map.set(lesson.lessonId, Math.max(map.get(lesson.lessonId) ?? 0, lesson.score ?? 0));
    }
    return map;
  }, [snapshot.lessons]);

  const filtered = useMemo(
    () =>
      CONVERSATIONS.filter((scenario) => {
        if (level !== "semua" && scenario.level !== level) return false;
        if (category !== "semua" && scenario.category !== category) return false;
        return true;
      }),
    [category, level],
  );

  const totalSteps = CONVERSATIONS.reduce((sum, scenario) => sum + scenario.steps.length, 0);
  const completedCount = CONVERSATIONS.filter((scenario) => completed.has(scenario.id)).length;
  const totalMinutes = CONVERSATIONS.reduce((sum, scenario) => sum + scenario.minutes, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Latihan berbicara · 会話"
        title="Percakapan"
        titleJp="かいわ"
        description="Mainkan dialog pendek sesuai situasi nyata. Setiap pilihan memberi tahu apakah jawabanmu cocok secara makna, register, dan konteks."
        icon="conversation"
        actions={<LinkButton href="/plan" variant="secondary" size="sm"><Icon name="target" size={15} /> Lihat rencana</LinkButton>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Skenario" value={CONVERSATIONS.length} hint="N5 sampai N4" icon="conversation" />
        <StatTile label="Selesai" value={completedCount} hint={`${Math.round((completedCount / CONVERSATIONS.length) * 100)}% skenario`} icon="check" tone="matcha" />
        <StatTile label="Langkah dialog" value={totalSteps} hint="Latihan memilih balasan" icon="list" tone="indigo" />
        <StatTile label="Perkiraan waktu" value={`${totalMinutes} mnt`} hint="Semua skenario" icon="clock" tone="gold" />
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold"><Icon name="conversation" size={20} className="text-brand" /> Pilih situasi</h2>
            <p className="mt-1 text-sm text-muted">Mulai dari perkenalan, lalu lanjut ke makanan, belanja, arah, pertemanan, dan transportasi.</p>
          </div>
          <span className="text-xs font-semibold text-muted">{filtered.length} dari {CONVERSATIONS.length} skenario</span>
        </div>

        <div className="mt-4 space-y-3">
          <Segmented options={LEVEL_OPTIONS} value={level} onChange={setLevel} size="sm" />
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter kategori percakapan">
            {["semua", ...CONVERSATION_CATEGORIES].map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  category === item
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-surface text-muted hover:border-brand/40 hover:text-brand",
                )}
              >
                {item === "semua" ? "Semua kategori" : item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
            <span>Progres percakapan</span>
            <span>{completedCount}/{CONVERSATIONS.length}</span>
          </div>
          <ProgressBar value={completedCount} max={CONVERSATIONS.length} label="Progres percakapan" />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon="conversation"
          title="Belum ada skenario yang cocok"
          description="Coba pilih level atau kategori lain untuk melihat dialog yang tersedia."
          action={<Button variant="secondary" onClick={() => { setLevel("semua"); setCategory("semua"); }}>Tampilkan semua</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((scenario) => {
            const score = completed.get(scenario.id);
            return (
              <Link key={scenario.id} href={`/conversation/${scenario.id}`} className="group block h-full">
                <Card className="flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="brand">{scenario.level}</Badge>
                      <Badge tone="muted">{scenario.category}</Badge>
                      {score !== undefined ? <Badge tone="matcha"><Icon name="check" size={12} /> {score}%</Badge> : null}
                    </div>
                    <Icon name="conversation" size={20} className="shrink-0 text-brand/70" />
                  </div>
                  <h3 className="mt-3 text-lg font-bold leading-snug group-hover:text-brand">{scenario.title}</h3>
                  <JpText text={scenario.titleJp} className="mt-0.5 text-sm text-muted" />
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{scenario.summary}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-3 text-xs text-muted">
                    <span className="inline-flex items-center gap-1"><Icon name="list" size={14} /> {scenario.steps.length} langkah</span>
                    <span className="inline-flex items-center gap-1"><Icon name="clock" size={14} /> {scenario.minutes} menit</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-brand">Buka <Icon name="external" size={13} /></span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Card className="p-5 text-xs leading-relaxed text-muted">
        <p className="flex items-start gap-2"><Icon name="info" size={15} className="mt-0.5 shrink-0 text-brand" /> Dialog ini ditulis untuk latihan Kotoba, bukan percakapan asli atau kutipan dari anime. Register setiap jawaban ditandai agar kamu tahu kapan bentuk sopan, standar, atau santai aman digunakan.</p>
      </Card>
    </div>
  );
}
