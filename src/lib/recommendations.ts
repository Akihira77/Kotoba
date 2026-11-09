import type { IconName } from "@/components/icons";
import { GRAMMAR, GRAMMAR_BY_ID } from "@/content/grammar";
import { VOCAB_BY_ID } from "@/content/vocabulary";
import { isLessonComplete, lessonForProgressId, recommendedLesson } from "@/lib/learning";
import type { ProgressSnapshot } from "@/lib/types";
import { formatShortDate, percent, toDateKey } from "@/lib/utils";

export type RecommendationTone = "brand" | "matcha" | "gold" | "indigo";

export interface Recommendation {
  id: string;
  kind: "due" | "vocabulary" | "grammar" | "lesson" | "exam" | "next" | "practice";
  title: string;
  description: string;
  reason: string;
  evidence: string;
  actionLabel: string;
  href: string;
  icon: IconName;
  tone: RecommendationTone;
  priority: number;
}

interface WeakWord {
  id: string;
  label: string;
  attempts: number;
  wrong: number;
  accuracy: number;
}

interface WeakGrammar {
  id: string;
  label: string;
  attempts: number;
  wrong: number;
  accuracy: number;
}

function dayKey(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : toDateKey(date);
}

function weakVocabulary(snapshot: ProgressSnapshot): WeakWord[] {
  const map = new Map<string, WeakWord>();
  for (const stat of snapshot.questionStats) {
    const match = /^ex-vocab-(?:meaning|reading|typing|cloze|translation)-(.+)$/.exec(stat.questionId);
    if (!match) continue;
    const word = VOCAB_BY_ID.get(match[1]);
    if (!word || stat.attempts < 2) continue;
    const previous = map.get(word.id);
    const attempts = (previous?.attempts ?? 0) + stat.attempts;
    const wrong = (previous?.wrong ?? 0) + stat.wrong;
    map.set(word.id, {
      id: word.id,
      label: word.japanese,
      attempts,
      wrong,
      accuracy: attempts > 0 ? Math.round(((attempts - wrong) / attempts) * 100) : 0,
    });
  }

  for (const card of snapshot.cards) {
    if (card.kind !== "vocab" || card.lapses < 2) continue;
    const word = VOCAB_BY_ID.get(card.itemId);
    if (!word) continue;
    const current = map.get(word.id);
    if (current) continue;
    map.set(word.id, {
      id: word.id,
      label: word.japanese,
      attempts: Math.max(card.reps, card.lapses),
      wrong: card.lapses,
      accuracy: Math.max(0, 100 - card.lapses * 12),
    });
  }

  return [...map.values()]
    .filter((word) => word.wrong > 0 && word.accuracy < 75)
    .sort((a, b) => b.wrong - a.wrong || a.accuracy - b.accuracy)
    .slice(0, 4);
}

function weakGrammar(snapshot: ProgressSnapshot): WeakGrammar[] {
  const map = new Map<string, WeakGrammar>();
  for (const stat of snapshot.questionStats) {
    if (stat.attempts < 2) continue;
    let grammarId = "";
    const direct = /^ex-grammar-(.+)$/.exec(stat.questionId);
    if (direct) grammarId = direct[1];
    else {
      const practice = /^(.+)-ex\d+$/.exec(stat.questionId);
      if (practice) grammarId = practice[1];
    }
    if (!grammarId) {
      const point = GRAMMAR.find((entry) => stat.questionId.startsWith(`${entry.id}-ex`));
      grammarId = point?.id ?? "";
    }
    const point = GRAMMAR_BY_ID.get(grammarId);
    if (!point) continue;
    const previous = map.get(point.id);
    const attempts = (previous?.attempts ?? 0) + stat.attempts;
    const wrong = (previous?.wrong ?? 0) + stat.wrong;
    map.set(point.id, {
      id: point.id,
      label: point.pattern,
      attempts,
      wrong,
      accuracy: attempts > 0 ? Math.round(((attempts - wrong) / attempts) * 100) : 0,
    });
  }
  return [...map.values()]
    .filter((point) => point.accuracy < 70)
    .sort((a, b) => b.wrong - a.wrong || a.accuracy - b.accuracy)
    .slice(0, 3);
}

/**
 * Rekomendasi deterministik dari data nyata. Setiap kartu menyebut bukti
 * angka yang dipakai agar pengguna memahami alasan di baliknya.
 */
export function buildRecommendations(
  snapshot: ProgressSnapshot,
  options: { limit?: number; now?: number } = {},
): Recommendation[] {
  const now = options.now ?? Date.now();
  const limit = options.limit ?? 4;
  const recommendations: Recommendation[] = [];
  const nowDate = new Date(now);

  const due = snapshot.cards
    .filter((card) => new Date(card.dueAt).getTime() <= now)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  if (due.length > 0) {
    const oldest = new Date(due[0].dueAt);
    const oldestLabel = Number.isNaN(oldest.getTime()) ? "" : formatShortDate(oldest.toISOString());
    const parts = [
      due.filter((card) => card.kind === "vocab").length ? `${due.filter((card) => card.kind === "vocab").length} kosakata` : "",
      due.filter((card) => card.kind === "kanji").length ? `${due.filter((card) => card.kind === "kanji").length} kanji` : "",
    ].filter(Boolean);
    recommendations.push({
      id: "due-cards",
      kind: "due",
      title: `Ulangi ${due.length} kartu yang jatuh tempo`,
      description: "Pengulangan singkat hari ini menjaga ingatan tetap kuat tanpa menambah materi baru.",
      reason: "Kartu ini sudah melewati jadwal ulang SRS, jadi paling cepat memudar jika dibiarkan.",
      evidence: `${parts.join(" + ") || "Kartu"} · tertua sejak ${oldestLabel || "hari ini"}.`,
      actionLabel: "Buka ulasan",
      href: "/vocabulary?tab=review",
      icon: "layers",
      tone: "brand",
      priority: 100,
    });
  }

  const words = weakVocabulary(snapshot);
  if (words.length > 0) {
    const worst = words[0];
    recommendations.push({
      id: "weak-vocab",
      kind: "vocabulary",
      title: "Latih ulang kosakata yang sering keliru",
      description: `${words.map((word) => word.label).join("、")} paling sering salah saat latihan atau ulangan.`,
      reason: "Kata dengan tingkat akurasi di bawah 75% dari jawaban yang benar-benar kamu kerjakan.",
      evidence: words
        .map((word) => `${word.label}: ${word.accuracy}% benar dari ${word.attempts} percobaan`)
        .join(" · "),
      actionLabel: "Latih kosakata ini",
      href: `/vocabulary?search=${encodeURIComponent(worst.label)}`,
      icon: "vocab",
      tone: "gold",
      priority: 85,
    });
  }

  const grammar = weakGrammar(snapshot);
  if (grammar.length > 0) {
    const worst = grammar[0];
    recommendations.push({
      id: "weak-grammar",
      kind: "grammar",
      title: `Perkuat pola ${worst.label}`,
      description: "Baca ulang formasi dan kesalahan umum, lalu kerjakan latihan pendeknya.",
      reason: "Akurasi pola ini berada di bawah 70% berdasarkan jawaban latihanmu.",
      evidence: grammar
        .map((point) => `${point.label}: ${point.accuracy}% (${point.wrong} salah dari ${point.attempts})`)
        .join(" · "),
      actionLabel: "Buka tata bahasa",
      href: `/grammar/${worst.id}`,
      icon: "grammar",
      tone: "indigo",
      priority: 80,
    });
  }

  const weakLessons = snapshot.lessons
    .filter((lesson) => lesson.score !== null && lesson.score < 80)
    .sort((a, b) => (a.score ?? 100) - (b.score ?? 100));
  if (weakLessons.length > 0) {
    const progress = weakLessons[0];
    const lesson = lessonForProgressId(progress.lessonId);
    if (lesson) {
      recommendations.push({
        id: `lesson-retry-${lesson.id}`,
        kind: "lesson",
        title: `Ulangi pelajaran "${lesson.title}"`,
        description: "Skor latihan pelajaran ini masih di bawah 80%; satu pengulangan akan menutup celahnya.",
        reason: "Nilai pelajaran tersimpan menunjukkan bagian ini belum dikuasai.",
        evidence: `Skor tersimpan ${progress.score}% dari penyelesaian ${formatShortDate(progress.completedAt)}.`,
        actionLabel: "Buka pelajaran",
        href: `/learn/${lesson.id}`,
        icon: "book",
        tone: "matcha",
        priority: 65,
      });
    }
  }

  const recentExam = [...snapshot.exams].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))[0];
  if (recentExam) {
    const weakSection = [...recentExam.sections]
      .filter((section) => section.points > 0 && section.correct / section.points < 0.7)
      .sort((a, b) => a.correct / a.points - b.correct / b.points)[0];
    if (weakSection) {
      recommendations.push({
        id: `exam-${recentExam.id}`,
        kind: "exam",
        title: `Perbaiki bagian ${weakSection.label}`,
        description: "Bagian ini menjadi titik terlemah pada simulasi terakhirmu.",
        reason: "Skor bagian di bawah 70% pada simulasi yang baru saja kamu selesaikan.",
        evidence: `${weakSection.label}: ${weakSection.correct}/${weakSection.points} benar (${percent(weakSection.correct, weakSection.points)}%).`,
        actionLabel: "Buka ujian",
        href: "/exams",
        icon: "exam",
        tone: "brand",
        priority: 60,
      });
    }
  }

  const next = recommendedLesson(snapshot);
  if (next && !isLessonComplete(snapshot, next)) {
    recommendations.push({
      id: `next-${next.id}`,
      kind: "next",
      title: `Lanjutkan "${next.title}"`,
      description: next.description || "Langkah berikutnya di jalur kurikulummu.",
      reason: "Pelajaran ini adalah bagian berikutnya yang belum selesai di jalur levelmu.",
      evidence: `${next.level} · perkiraan ${next.estimateMinutes} menit · ${next.objectives.length} target belajar.`,
      actionLabel: "Mulai pelajaran",
      href: next.interactive ? `/learn/${next.id}` : next.href,
      icon: "learn",
      tone: "matcha",
      priority: 40,
    });
  }

  const todayActivity = snapshot.activity.find((day) => day.date === dayKey(nowDate.toISOString()));
  const remainingXp = Math.max(0, snapshot.profile.settings.dailyGoalXp - (todayActivity?.xp ?? 0));
  if (remainingXp > 0) {
    recommendations.push({
      id: "daily-goal",
      kind: "practice",
      title: "Tutup target hari ini dengan latihan singkat",
      description: "Latihan campuran 10 soal cukup untuk menambah XP tanpa memulai materi berat.",
      reason: "Target XP harian belum tercapai, dan latihan campuran memberi XP untuk jawaban yang kamu coba.",
      evidence: `${remainingXp} XP lagi menuju target ${snapshot.profile.settings.dailyGoalXp} XP.`,
      actionLabel: "Mulai latihan",
      href: "/practice",
      icon: "target",
      tone: "gold",
      priority: 30,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "maintenance",
      kind: "practice",
      title: "Jaga ritme dengan ulasan ringan",
      description: "Tidak ada kelemahan besar yang terdeteksi. Ulas beberapa kartu atau coba satu permainan.",
      reason: "Semua data yang tersedia menunjukkan tidak ada kartu terlambat, pola lemah, atau skor pelajaran rendah.",
      evidence: "Rekomendasi ini muncul karena belum ada sinyal latihan yang perlu diperbaiki.",
      actionLabel: "Buka latihan",
      href: "/practice",
      icon: "sparkles",
      tone: "indigo",
      priority: 10,
    });
  }

  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, limit);
}
