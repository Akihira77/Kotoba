import type { IconName } from "@/components/icons";
import { HIRAGANA, KATAKANA } from "@/content/kana";
import type { ProgressSnapshot } from "@/lib/types";
import { levelProgress } from "@/lib/xp";

export interface AchievementView {
  id: string;
  label: string;
  description: string;
  icon: IconName;
  tone: "matcha" | "brand" | "indigo" | "gold";
  unlocked: boolean;
  progress: string;
}

/**
 * Pencapaian dihitung dari snapshot, bukan data contoh. Definisi ini dipakai
 * bersama oleh dasbor dan halaman Statistik agar angkanya selalu sama.
 */
export function buildAchievements(snapshot: ProgressSnapshot): AchievementView[] {
  const { profile, cards, kana, exams, lessons, quizAttempts, stats } = snapshot;
  const level = levelProgress(profile.xp);
  const masteredKana = kana.filter((item) => item.mastery >= 4).length;
  const vocabLearned = cards.filter((card) => card.kind === "vocab" && card.reps > 0).length;
  const kanjiLearned = cards.filter((card) => card.kind === "kanji" && card.reps > 0).length;
  const mastered = new Map(kana.map((item) => [`${item.script}:${item.char}`, item.mastery]));
  const hiraganaBasic = HIRAGANA.filter((item) => item.group === "basic");
  const katakanaBasic = KATAKANA.filter((item) => item.group === "basic");
  const hiraganaMastered = hiraganaBasic.filter((item) => (mastered.get(`hiragana:${item.char}`) ?? 0) >= 4).length;
  const katakanaMastered = katakanaBasic.filter((item) => (mastered.get(`katakana:${item.char}`) ?? 0) >= 4).length;
  const perfectQuiz = quizAttempts.some((attempt) => attempt.total > 0 && attempt.score >= 100);

  return [
    {
      id: "first-review",
      label: "Langkah pertama",
      description: "Selesaikan satu ulasan kartu.",
      icon: "sparkles",
      tone: "matcha",
      unlocked: stats.totalReviews >= 1,
      progress: Math.min(1, stats.totalReviews) + "/1 ulasan",
    },
    {
      id: "first-lesson",
      label: "Pelajaran pertama",
      description: "Selesaikan satu pelajaran di kurikulum.",
      icon: "book",
      tone: "matcha",
      unlocked: lessons.length >= 1,
      progress: Math.min(1, lessons.length) + "/1 pelajaran",
    },
    {
      id: "vocab-50",
      label: "50 kosakata",
      description: "Pelajari lima puluh kosakata berbeda.",
      icon: "vocab",
      tone: "matcha",
      unlocked: vocabLearned >= 50,
      progress: Math.min(50, vocabLearned) + "/50 kata",
    },
    {
      id: "vocab-100",
      label: "100 kosakata",
      description: "Pelajari seratus kosakata berbeda.",
      icon: "vocab",
      tone: "indigo",
      unlocked: vocabLearned >= 100,
      progress: Math.min(100, vocabLearned) + "/100 kata",
    },
    {
      id: "hiragana-master",
      label: "Hiragana master",
      description: "Kuasai seluruh 46 hiragana dasar.",
      icon: "kana",
      tone: "brand",
      unlocked: hiraganaMastered >= hiraganaBasic.length,
      progress: Math.min(hiraganaBasic.length, hiraganaMastered) + "/" + hiraganaBasic.length + " hiragana",
    },
    {
      id: "katakana-master",
      label: "Katakana master",
      description: "Kuasai seluruh 46 katakana dasar.",
      icon: "kana",
      tone: "gold",
      unlocked: katakanaMastered >= katakanaBasic.length,
      progress: Math.min(katakanaBasic.length, katakanaMastered) + "/" + katakanaBasic.length + " katakana",
    },
    {
      id: "first-exam",
      label: "Simulasi pertama",
      description: "Selesaikan satu simulasi atau latihan ujian.",
      icon: "exam",
      tone: "indigo",
      unlocked: exams.length >= 1,
      progress: Math.min(1, exams.length) + "/1 simulasi",
    },
    {
      id: "perfect-quiz",
      label: "Skor sempurna",
      description: "Dapatkan nilai 100% pada satu sesi latihan.",
      icon: "target",
      tone: "gold",
      unlocked: perfectQuiz,
      progress: perfectQuiz ? "Selesai" : "Belum ada",
    },
    {
      id: "kanji-50",
      label: "50 kanji",
      description: "Pelajari lima puluh kanji berbeda.",
      icon: "kanji",
      tone: "matcha",
      unlocked: kanjiLearned >= 50,
      progress: Math.min(50, kanjiLearned) + "/50 kanji",
    },
    {
      id: "streak-3",
      label: "Tiga hari berturut",
      description: "Belajar tiga hari berturut-turut.",
      icon: "flame",
      tone: "brand",
      unlocked: profile.bestStreak >= 3,
      progress: Math.min(3, profile.bestStreak) + "/3 hari",
    },
    {
      id: "streak-7",
      label: "Seminggu penuh",
      description: "Jaga streak selama tujuh hari.",
      icon: "calendar",
      tone: "gold",
      unlocked: profile.bestStreak >= 7,
      progress: Math.min(7, profile.bestStreak) + "/7 hari",
    },
    {
      id: "reviews-100",
      label: "100 ulasan",
      description: "Total seratus ulasan kartu.",
      icon: "layers",
      tone: "indigo",
      unlocked: stats.totalReviews >= 100,
      progress: Math.min(100, stats.totalReviews) + "/100 ulasan",
    },
    {
      id: "xp-500",
      label: "500 XP",
      description: "Kumpulkan 500 poin pengalaman.",
      icon: "zap",
      tone: "gold",
      unlocked: profile.xp >= 500,
      progress: Math.min(500, profile.xp) + "/500 XP",
    },
    {
      id: "exam-pass",
      label: "Lulus simulasi",
      description: "Lulus satu simulasi JLPT.",
      icon: "award",
      tone: "matcha",
      unlocked: exams.some((exam) => exam.passed),
      progress: exams.some((exam) => exam.passed) ? "Selesai" : "Belum ada",
    },
    {
      id: "cards-100",
      label: "Kolektor kartu",
      description: "Simpan 100 kartu belajar.",
      icon: "book",
      tone: "indigo",
      unlocked: cards.length >= 100,
      progress: Math.min(100, cards.length) + "/100 kartu",
    },
    {
      id: "kana-46",
      label: "Kuasai 46 kana",
      description: "Kuasai 46 karakter kana dasar.",
      icon: "kana",
      tone: "brand",
      unlocked: masteredKana >= 46,
      progress: Math.min(46, masteredKana) + "/46 kana",
    },
    {
      id: "study-300",
      label: "300 menit belajar",
      description: "Total waktu belajar 300 menit.",
      icon: "clock",
      tone: "gold",
      unlocked: stats.studyMinutes >= 300,
      progress: Math.min(300, stats.studyMinutes) + "/300 menit",
    },
    {
      id: "level-5",
      label: "Level 5",
      description: "Capai level 5 perjalananmu.",
      icon: "trophy",
      tone: "matcha",
      unlocked: level.level >= 5,
      progress: "Level " + level.level + "/5",
    },
    {
      id: "first-game",
      label: "Pemain pertama",
      description: "Selesaikan satu permainan edukatif.",
      icon: "games",
      tone: "brand",
      unlocked: stats.gameAttempts >= 1,
      progress: Math.min(1, stats.gameAttempts) + "/1 permainan",
    },
    {
      id: "games-25",
      label: "Rutin bermain",
      description: "Selesaikan 25 sesi permainan.",
      icon: "grid",
      tone: "indigo",
      unlocked: stats.gameAttempts >= 25,
      progress: Math.min(25, stats.gameAttempts) + "/25 sesi",
    },
    {
      id: "game-correct-100",
      label: "100 jawaban tepat",
      description: "Kumpulkan 100 jawaban benar dari permainan.",
      icon: "target",
      tone: "gold",
      unlocked: stats.gameCorrect >= 100,
      progress: Math.min(100, stats.gameCorrect) + "/100 benar",
    },
    {
      id: "writing-first",
      label: "Goresan pertama",
      description: "Selesaikan satu latihan menulis karakter Jepang.",
      icon: "writing",
      tone: "brand",
      unlocked: stats.writingAttempts >= 1,
      progress: Math.min(1, stats.writingAttempts) + "/1 latihan",
    },
    {
      id: "writing-20",
      label: "20 karakter dikuasai",
      description: "Capai skor geometri minimal 80 pada dua puluh karakter berbeda.",
      icon: "writing",
      tone: "gold",
      unlocked: stats.writingMastered >= 20,
      progress: Math.min(20, stats.writingMastered) + "/20 karakter",
    },
    {
      id: "story-first",
      label: "Cerita pertama",
      description: "Selesaikan satu cerita di teater cerita.",
      icon: "story",
      tone: "brand",
      unlocked: stats.storyAttempts >= 1,
      progress: Math.min(1, stats.storyAttempts) + "/1 cerita",
    },
    {
      id: "story-3",
      label: "Tiga cerita selesai",
      description: "Selesaikan tiga cerita berbeda dengan skor minimal 60.",
      icon: "story",
      tone: "gold",
      unlocked: stats.storiesCompleted >= 3,
      progress: Math.min(3, stats.storiesCompleted) + "/3 cerita",
    },
  ];
}

/** Pencapaian terdekat untuk ditampilkan di dasbor: yang terbuka lebih dulu, lalu urutan definisi. */
export function recentAchievements(snapshot: ProgressSnapshot, limit = 3): AchievementView[] {
  const achievements = buildAchievements(snapshot);
  const unlocked = achievements.filter((achievement) => achievement.unlocked);
  const locked = achievements.filter((achievement) => !achievement.unlocked);
  return [...unlocked, ...locked].slice(0, limit);
}