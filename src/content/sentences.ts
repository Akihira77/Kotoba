import type { JLPTLevel, SentenceItem } from "@/lib/types";

/**
 * Latihan urutan kata (文の組み立て).
 *
 * Setiap item berisi potongan kata/partikel yang diacak serta urutan
 * jawaban yang benar. UI menampilkan token dalam keadaan acak, tetapi
 * urutan di `tokens` tetap sengaja dibuat berbeda dari `answer` agar
 * data tidak bisa dipakai untuk menebak jawaban secara langsung.
 */

const scramble = (tokens: string[], salt: number): string[] => {
  const result = tokens.slice();

  for (let step = 0; step < 3; step += 1) {
    const left = (salt * 3 + step * 5 + 1) % result.length;
    const right = (salt * 7 + step * 4 + 2) % result.length;

    if (left !== right) {
      [result[left], result[right]] = [result[right], result[left]];
    }
  }

  if (result.join("") === tokens.join("")) {
    result.reverse();
  }

  return result;
};

const s = (
  id: string,
  level: JLPTLevel,
  answer: string[],
  translation: string,
  explanation: string,
  salt: number,
): SentenceItem => ({
  id,
  level,
  tokens: scramble(answer, salt),
  answer,
  translation,
  explanation,
});

export const SENTENCES: SentenceItem[] = [
  // ── N5 (8) ──────────────────────────────────────────────────────────
  s(
    "s-n5-1",
    "N5",
    ["わたし", "は", "毎朝", "パンを", "食べます"],
    "Saya setiap pagi makan roti.",
    "Partikel は menandai topik, sedangkan を menandai objek dari kata kerja 食べます. Keterangan waktu seperti 毎朝 biasanya diletakkan sebelum objek.",
    1,
  ),
  s(
    "s-n5-2",
    "N5",
    ["きのう", "友だちと", "学校の近くで", "映画を", "見ました"],
    "Kemarin saya menonton film bersama teman di dekat sekolah.",
    "Partikel と berarti ’bersama’, dan で menandai tempat berlangsungnya kegiatan. Urutan yang wajar adalah waktu, pelaku/teman, tempat, objek, lalu kata kerja.",
    2,
  ),
  s(
    "s-n5-3",
    "N5",
    ["この", "店の", "ラーメンは", "安くて", "おいしいです"],
    "Ramen di toko ini murah dan enak.",
    "Bentuk くて menghubungkan dua kata sifat い, yaitu 安い dan おいしい. Partikel の pada 店の menghubungkan dua kata benda.",
    3,
  ),
  s(
    "s-n5-4",
    "N5",
    ["わたしは", "毎日", "日本語を", "少し", "勉強しています"],
    "Saya setiap hari belajar bahasa Jepang sedikit.",
    "Bentuk ています menyatakan kegiatan yang sedang atau rutin dilakukan. Partikel を menandai objek 日本語.",
    4,
  ),
  s(
    "s-n5-5",
    "N5",
    ["日曜日に", "家族と", "いっしょに", "公園へ", "行きます"],
    "Pada hari Minggu saya pergi ke taman bersama keluarga.",
    "Partikel に menandai waktu, と menandai teman, dan へ menandai arah tujuan. いっしょに memperjelas bahwa kegiatan dilakukan bersama.",
    5,
  ),
  s(
    "s-n5-6",
    "N5",
    ["この", "青い", "かさは", "わたしのでは", "ありません"],
    "Payung biru ini bukan milik saya.",
    "Bentuk negatif sopan dari です adalah では ありません. Kata の menggantikan kata benda yang sudah disebut, sehingga わたしの berarti ’milik saya’.",
    6,
  ),
  s(
    "s-n5-7",
    "N5",
    ["いつも", "朝ごはんを", "食べてから", "学校へ", "行きます"],
    "Saya selalu pergi ke sekolah setelah makan sarapan.",
    "Pola てから berarti ’setelah melakukan sesuatu’. Karena itu, 食べてから harus mendahului 行きます.",
    7,
  ),
  s(
    "s-n5-8",
    "N5",
    ["あの", "赤い", "かばんは", "だれの", "ですか"],
    "Tas merah itu milik siapa?",
    "Kata tanya だれの (’milik siapa’) diletakkan sebelum ですか. Partikel は menandai かばん sebagai topik pertanyaan.",
    8,
  ),

  // ── N4 (8) ──────────────────────────────────────────────────────────
  s(
    "s-n4-1",
    "N4",
    ["雨が", "降りそうなので", "傘を", "持って", "出かけます"],
    "Karena sepertinya akan hujan, saya keluar dengan membawa payung.",
    "Bentuk そうです setelah kata kerja ます (di sini 降り) menyatakan dugaan. Partikel ので menyatakan alasan secara lebih lembut daripada から.",
    9,
  ),
  s(
    "s-n4-2",
    "N4",
    ["日本語が", "もっと", "話せるように", "毎日", "練習しています"],
    "Saya berlatih setiap hari agar bisa berbicara bahasa Jepang lebih baik.",
    "Pola ように menyatakan tujuan, dan 話せる adalah bentuk potensial dari 話す. Partikel が dipakai karena 話せる adalah kata kerja kemampuan.",
    10,
  ),
  s(
    "s-n4-3",
    "N4",
    ["先生に", "聞いたら", "答えを", "教えて", "くれました"],
    "Setelah saya bertanya kepada guru, beliau memberi tahu jawabannya.",
    "Pola たら menyatakan ’setelah’ atau ’jika’. Bentuk てくれました menunjukkan bahwa tindakan orang lain menguntungkan pembicara.",
    11,
  ),
  s(
    "s-n4-4",
    "N4",
    ["この", "仕事は", "思ったより", "時間が", "かかりません"],
    "Pekerjaan ini tidak memakan waktu sebanyak yang saya kira.",
    "より menandai pembanding, sehingga 思ったより berarti ’dibandingkan perkiraan saya’. Kata kerja かかります dipakai untuk waktu atau biaya.",
    12,
  ),
  s(
    "s-n4-5",
    "N4",
    ["友だちに", "誕生日の", "プレゼントを", "買って", "あげました"],
    "Saya membelikan hadiah ulang tahun untuk teman.",
    "Bentuk てあげる menunjukkan tindakan memberi manfaat kepada orang lain. Partikel に menandai penerima hadiah.",
    13,
  ),
  s(
    "s-n4-6",
    "N4",
    ["電車が", "遅れたので", "待ち合わせの", "時間に", "間に合いませんでした"],
    "Karena kereta terlambat, saya tidak tepat waktu untuk janji temu.",
    "Pola ので menyatakan sebab dari kejadian berikutnya. Ungkapan 間に合う berarti ’tepat waktu’, dan partikel に menandai waktu yang dituju.",
    14,
  ),
  s(
    "s-n4-7",
    "N4",
    ["もし", "時間が", "あったら", "いっしょに", "映画を", "見ませんか"],
    "Kalau ada waktu, mau menonton film bersama?",
    "もし menegaskan pengandaian, dan あったら adalah bentuk kondisional dari ある. Ajakan sopan dibentuk dengan ませんか.",
    15,
  ),
  s(
    "s-n4-8",
    "N4",
    ["この", "本は", "読めば", "読むほど", "おもしろく", "なります"],
    "Semakin saya membaca buku ini, semakin menarik rasanya.",
    "Pola ば〜ほど menyatakan ’semakin … semakin …’. Kata sifat い おもしろい berubah menjadi おもしろく sebelum なります.",
    16,
  ),

  // ── N3 (6) ──────────────────────────────────────────────────────────
  s(
    "s-n3-1",
    "N3",
    ["彼が", "何を", "言いたいのか", "よく", "分かりません"],
    "Saya tidak begitu mengerti apa yang ingin dia katakan.",
    "Pola のか menyisipkan pertanyaan ke dalam kalimat, sehingga 何を言いたいのか berarti ’apa yang ingin dikatakan’. よく dengan bentuk negatif berarti ’tidak begitu’.",
    17,
  ),
  s(
    "s-n3-2",
    "N3",
    ["忙しくても", "週に", "一度は", "運動する", "ように", "しています"],
    "Meskipun sibuk, saya berusaha berolahraga setidaknya sekali seminggu.",
    "Pola ても menyatakan ’meskipun’, dan ようにしている menyatakan kebiasaan yang diusahakan. Partikel に pada 週に menandai hitungan frekuensi.",
    18,
  ),
  s(
    "s-n3-3",
    "N3",
    ["最近", "日本語を", "勉強し始めた", "ばかりなので", "まだ", "話せません"],
    "Karena baru mulai belajar bahasa Jepang, saya belum bisa berbicara.",
    "Pola たばかり berarti ’baru saja’, dan ので menyatakan alasan. Perhatikan bentuk 話せません (potensial negatif) yang berarti ’belum bisa berbicara’.",
    19,
  ),
  s(
    "s-n3-4",
    "N3",
    ["この", "店は", "安い", "わりに", "味が", "いいです"],
    "Toko ini, meskipun murah, rasanya enak.",
    "Pola わりに menyatakan bahwa hasilnya tidak sesuai dengan perkiraan dari kondisi sebelumnya. Di sini, harga murah biasanya membuat orang tidak berharap banyak, tetapi rasanya justru enak.",
    20,
  ),
  s(
    "s-n3-5",
    "N3",
    ["彼女は", "雨が", "降っているのに", "傘を", "持たずに", "出かけた"],
    "Dia keluar tanpa membawa payung padahal sedang hujan.",
    "Pola のに menyatakan pertentangan atau rasa heran. Bentuk ずに berarti ’tanpa melakukan’, sehingga 持たずに berarti ’tanpa membawa’.",
    21,
  ),
  s(
    "s-n3-6",
    "N3",
    ["会議の", "資料を", "忘れない", "ように", "気を", "つけてください"],
    "Tolong berhati-hati agar tidak lupa membawa dokumen rapat.",
    "Pola ないように menyatakan tujuan agar sesuatu yang tidak diinginkan tidak terjadi. Ungkapan 気をつける berarti ’berhati-hati’.",
    22,
  ),

  // ── N2 (4) ──────────────────────────────────────────────────────────
  s(
    "s-n2-1",
    "N2",
    ["環境問題に", "関しては", "市民の", "意識が", "もっと", "必要だ"],
    "Mengenai masalah lingkungan, kesadaran warga lebih diperlukan.",
    "Pola に関しては berarti ’mengenai’. Partikel が menandai 意識 sebagai hal yang dibutuhkan, bukan sebagai topik kalimat.",
    23,
  ),
  s(
    "s-n2-2",
    "N2",
    ["どんなに", "忙しくても", "健康を", "犠牲に", "すべきではない"],
    "Betapa pun sibuknya, kesehatan tidak boleh dikorbankan.",
    "Pola どんなに〜ても berarti ’betapa pun’. Bentuk すべきではない menyatakan larangan atau penilaian moral yang kuat.",
    24,
  ),
  s(
    "s-n2-3",
    "N2",
    ["彼女が", "留学を", "決めた", "のは", "家族の", "支えが", "あったからだ"],
    "Alasan dia memutuskan untuk belajar ke luar negeri adalah karena ada dukungan dari keluarganya.",
    "Pola のは〜からだ memindahkan fokus ke alasan. Kalimat ini menekankan bahwa dukungan keluarga adalah penyebab keputusannya.",
    25,
  ),
  s(
    "s-n2-4",
    "N2",
    ["予約を", "取って", "おいた", "ほうが", "いいですよ"],
    "Sebaiknya kita sudah memesan tempat sebelumnya.",
    "Pola ておく menyatakan tindakan persiapan yang dilakukan lebih dulu. ほうがいい memberi saran, dan よ di akhir menambahkan nada menyarankan.",
    26,
  ),

  // ── N1 (2) ──────────────────────────────────────────────────────────
  s(
    "s-n1-1",
    "N1",
    ["彼が", "反対した", "にもかかわらず", "計画は", "予定通り", "進められた"],
    "Meskipun dia menolak, rencana tetap dijalankan sesuai jadwal.",
    "Pola にもかかわらず menyatakan pertentangan yang tegas dalam gaya formal. Bentuk pasif 進められた menekankan bahwa rencana dijalankan oleh pihak lain.",
    27,
  ),
  s(
    "s-n1-2",
    "N1",
    ["この", "失敗を", "他人の", "せいに", "する", "わけには", "いかない"],
    "Atas kegagalan ini, kita tidak bisa begitu saja menyalahkan orang lain.",
    "Pola わけにはいかない menyatakan bahwa sesuatu tidak boleh dilakukan karena alasan moral atau tanggung jawab. Ungkapan せいにする berarti ’menyalahkan’.",
    28,
  ),
];

export const SENTENCES_BY_ID: Map<string, SentenceItem> = new Map(
  SENTENCES.map((item) => [item.id, item] as const),
);
