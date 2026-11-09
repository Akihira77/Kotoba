import type {
  Kana,
  KanaGroup,
  KanaScript,
  LessonBlock,
  LessonExample,
  LessonNote,
  LessonPlan,
  QuizQuestion,
} from "@/lib/types";
import { HIRAGANA, KANA_GROUP_LABELS, KANA_SCRIPT_LABELS, KATAKANA } from "@/content/kana";
import { makeQuestion, sampleDistinct } from "./shared";

const GROUP_ORDER: KanaGroup[] = ["basic", "dakuten", "handakuten", "yoon"];

const GROUP_SUMMARY: Record<KanaGroup, { short: string; detail: string }> = {
  basic: {
    short: "46 karakter dasar",
    detail:
      "46 karakter dasar disusun dalam lima baris vokal (a, i, u, e, o). Bentuk dan bunyinya menjadi fondasi seluruh bacaan Jepang.",
  },
  dakuten: {
    short: "20 karakter berdakuten",
    detail:
      "Dakuten (゛) mengubah bunyi dasar menjadi bersuara: k→g, s→z, t→d, dan h→b. Ada juga perubahan khusus yang perlu dihafal sebagai pasangan.",
  },
  handakuten: {
    short: "5 karakter berhandakuten",
    detail:
      "Handakuten (゜) hanya dipakai pada baris h dan mengubah bunyi h menjadi p. Jumlahnya sedikit sehingga mudah dikuasai.",
  },
  yoon: {
    short: "33 kombinasi yōon",
    detail:
      "Yōon menggabungkan kana berakhiran -i dengan ゃ, ゅ, atau ょ berukuran kecil. Satu ketukan suku kata tetap dihitung satu mora.",
  },
};

function kanaFor(script: KanaScript): Kana[] {
  return script === "hiragana" ? HIRAGANA : KATAKANA;
}

function examplesFor(chars: Kana[], script: KanaScript): LessonExample[] {
  const seen = new Set<string>();
  const result: LessonExample[] = [];

  for (const item of chars) {
    for (const example of item.examples) {
      if (seen.has(example.word)) continue;
      seen.add(example.word);
      result.push({
        jp: example.word,
        reading: example.reading,
        romaji: example.romaji,
        meaning: example.meaning,
        note: KANA_SCRIPT_LABELS[script] + " " + item.char + " · " + item.romaji,
      });
      if (result.length >= 6) return result;
    }
  }

  return result;
}

function basicExplanation(script: KanaScript, chars: Kana[]): LessonBlock[] {
  const isKatakana = script === "katakana";
  const blocks: LessonBlock[] = [
    {
      type: "prose",
      heading: "Lima vokal dan urutan gojūon",
      paragraphs: [
        "Setiap baris dimulai dari vokal a, i, u, e, o. Membaca tabel dari kiri ke kanan dan atas ke bawah akan membentuk urutan gojūon yang dipakai kamus Jepang.",
        "Latih satu baris sampai lancar sebelum pindah ke baris berikutnya. Kecepatan membaca lebih penting daripada menghafal seluruh tabel sekaligus.",
      ],
    },
    { type: "kana-grid", heading: "Tabel " + KANA_SCRIPT_LABELS[script] + " dasar", script, chars: chars.map((item) => item.char) },
  ];

  if (isKatakana) {
    blocks.push({
      type: "table",
      heading: "Bunyi khusus dan kata serapan",
      columns: ["Unsur", "Contoh", "Catatan"],
      rows: [
        {
          label: "ー (vokal panjang)",
          cells: ["コーヒー (kōhī) · kopi", "Garis mendatar memperpanjang vokal sebelumnya."],
        },
        {
          label: "ッ (tsu kecil)",
          cells: ["チケット (chiketto) · tiket", "Konsonan berikutnya ditahan satu ketukan."],
        },
        {
          label: "Kata serapan",
          cells: ["パン (pan) · roti", "Ditulis katakana meskipun asalnya dari bahasa Portugis."],
        },
      ],
    });
  } else {
    blocks.push({
      type: "table",
      heading: "Dua bunyi yang mengubah arti",
      columns: ["Unsur", "Contoh", "Catatan"],
      rows: [
        {
          label: "っ (tsu kecil)",
          cells: ["きって (kitte) · perangko", "Konsonan berikutnya ditahan satu ketukan; bukan きて (kite) yang berarti 'datang'."],
        },
        {
          label: "Vokal panjang",
          cells: ["おばあさん (obaasan) · nenek", "おばさん (obasan) berarti tante. Panjang vokal tetap dibaca."],
        },
        {
          label: "ん",
          cells: ["ほん (hon) · buku", "ん bukan vokal; posisinya dapat menjadi suku kata tersendiri."],
        },
      ],
    });
  }

  blocks.push({
    type: "callout",
    tone: "tip",
    title: "Cara mengucapkan",
    paragraphs: [
      "Vokal Jepang a, i, u, e, o relatif pendek dan stabil. Jangan menambahkan bunyi 'ng' atau 'k' di akhir vokal seperti kebiasaan beberapa penutur Indonesia.",
      "Pada akhir kalimat sopan, です sering terdengar seperti 'des', tetapi す tetap ada dalam tulisan dan ucapan formal yang jelas. Dengarkan contoh audio, lalu tirukan tanpa terburu-buru.",
    ],
  });

  return blocks;
}

function otherExplanation(script: KanaScript, group: KanaGroup, chars: Kana[]): LessonBlock[] {
  const blocks: LessonBlock[] = [
    {
      type: "prose",
      heading: GROUP_SUMMARY[group].short,
      paragraphs: [GROUP_SUMMARY[group].detail],
    },
    { type: "kana-grid", heading: "Karakter " + KANA_GROUP_LABELS[group], script, chars: chars.map((item) => item.char) },
  ];

  if (group === "dakuten") {
    blocks.push({
      type: "prose",
      heading: "Pasangan yang perlu diperhatikan",
      paragraphs: [
        "じ dan ぢ sama-sama dapat dibaca 'ji' dalam konteks tertentu, tetapi ぢ jarang muncul dan biasanya terkait perubahan bunyi dalam kata majemuk. Untuk pemula, kenali じ terlebih dahulu.",
        "Demikian pula ず dan づ. Ejaan resmi modern mempertahankan づ pada kata tertentu seperti つづく (tsuzuku, berlanjut).",
      ],
    });
  }

  if (group === "handakuten") {
    blocks.push({
      type: "callout",
      tone: "info",
      title: "Hanya lima",
      paragraphs: [
        "Handakuten hanya mengubah は行: は→ぱ, ひ→ぴ, ふ→ぷ, へ→ぺ, ほ→ぽ. Tidak ada handakuten pada baris lain dalam kana standar.",
      ],
    });
  }

  if (group === "yoon") {
    blocks.push({
      type: "table",
      heading: "Contoh kombinasi",
      columns: ["Kana", "Romaji", "Contoh kata"],
      rows: sampleDistinct(chars, 4, 2).map((item) => ({
        label: item.char,
        cells: [item.romaji, item.examples[0] ? item.examples[0].word + " · " + item.examples[0].meaning : "—"],
      })),
    });
  }

  return blocks;
}

function notesFor(script: KanaScript, group: KanaGroup): LessonNote[] {
  const notes: LessonNote[] = [
    {
      tone: "tip",
      title: "Latihan lima karakter",
      body: [
        "Pelajari lima karakter per sesi, lalu ulangi besok sebelum menambah karakter baru. Tulis sambil mengucapkan bunyinya agar bentuk dan suara terhubung.",
      ],
    },
    {
      tone: "warning",
      title: "Romaji hanya jembatan",
      body: [
        "Setelah satu karakter dikenali, tutup kolom romaji dan baca kana langsung. Ketergantungan pada romaji akan memperlambat membaca teks Jepang yang sebenarnya.",
      ],
    },
  ];

  if (group === "basic") {
    notes.push({
      tone: "important",
      title: "Kecil tetapi penting",
      body: [
        "っ berukuran kecil bukan huruf つ biasa. Ia menahan konsonan berikutnya, sedangkan vokal panjang dipertahankan. Keduanya dapat membedakan arti kata.",
      ],
    });
  }

  if (script === "katakana") {
    notes.push({
      tone: "info",
      title: "Kapan katakana dipakai",
      body: [
        "Katakana dipakai untuk kata serapan (コーヒー), nama asing, onomatope, penekanan, dan beberapa istilah teknis. Jangan menganggap semua kata asing selalu ditulis katakana; ejaan resmi dapat berbeda.",
      ],
    });
  }

  return notes;
}

function practiceFor(planId: string, script: KanaScript, group: KanaGroup, chars: Kana[]): QuizQuestion[] {
  const level = "N5" as const;
  const reading = sampleDistinct(chars, 4, 1);
  const uniqueWriting = chars.filter((item) => chars.filter((other) => other.romaji === item.romaji).length === 1);
  const writing = sampleDistinct(uniqueWriting.length >= 2 ? uniqueWriting : chars, 2, 3);
  const romajiPool = chars.map((item) => item.romaji);
  const charPool = chars.map((item) => item.char);
  const questions: QuizQuestion[] = [];

  reading.forEach((item, index) => {
    questions.push(
      makeQuestion({
        id: planId + "-q" + (index + 1),
        type: "kana-reading",
        level,
        prompt: "Kana 「" + item.char + "」 dibaca…",
        promptJp: item.char,
        correct: item.romaji,
        pool: romajiPool,
        seed: index + 2,
        explanation: `「${item.char}」 dibaca ${item.romaji}.`,
        audioText: item.char,
      }),
    );
  });

  writing.forEach((item, index) => {
    questions.push(
      makeQuestion({
        id: planId + "-q" + (reading.length + index + 1),
        type: "kana-writing",
        level,
        prompt: `Romaji "${item.romaji}" ditulis dengan kana ${script === "hiragana" ? "hiragana" : "katakana"}…`,
        correct: item.char,
        pool: charPool,
        seed: index + 5,
        explanation: `Bunyi "${item.romaji}" ditulis 「${item.char}」.`,
      }),
    );
  });

  return questions;
}

function buildKanaPlan(script: KanaScript, group: KanaGroup): LessonPlan {
  const chars = kanaFor(script).filter((item) => item.group === group);
  const id = "les-kana-" + script + "-" + group;
  const scriptLabel = KANA_SCRIPT_LABELS[script];
  const summary =
    GROUP_SUMMARY[group].short +
    " " +
    scriptLabel +
    " untuk membaca dan menulis dengan urutan yang benar.";
  const goals = [
    "Mengenali bentuk dan bunyi " + chars.length + " karakter " + scriptLabel + ".",
    "Membaca karakter tanpa bergantung pada romaji.",
    group === "basic"
      ? "Membedakan bunyi dasar, っ kecil, dan vokal panjang."
      : "Menghubungkan bentuk " + KANA_GROUP_LABELS[group] + " dengan bunyinya.",
    "Menulis karakter dari ingatan setelah latihan.",
  ];
  const intro = [
    "Pelajaran ini membahas " + KANA_GROUP_LABELS[group] + " dalam " + scriptLabel + ". Fokusnya bukan menghafal seluruh tabel sekaligus, tetapi mengenali pola dan berlatih membaca.",
    GROUP_SUMMARY[group].detail,
  ];

  return {
    id,
    title: scriptLabel + " · " + KANA_GROUP_LABELS[group],
    titleJp: script === "hiragana" ? "ひらがな" : "カタカナ",
    summary,
    estimateMinutes: group === "basic" ? 20 : 12,
    goals,
    intro,
    explanation: group === "basic" ? basicExplanation(script, chars) : otherExplanation(script, group, chars),
    examples: examplesFor(chars, script),
    notes: notesFor(script, group),
    practice: practiceFor(id, script, group, chars),
  };
}

export const KANA_PLANS: LessonPlan[] = (["hiragana", "katakana"] as KanaScript[]).flatMap((script) =>
  GROUP_ORDER.map((group) => buildKanaPlan(script, group)),
);
