export interface PronunciationGuideExample {
  jp: string;
  reading: string;
  romaji: string;
  meaning: string;
  note?: string;
}

export interface PronunciationGuideContrast {
  a: PronunciationGuideExample;
  b: PronunciationGuideExample;
  note: string;
}

export interface PronunciationGuideTopic {
  id: string;
  title: string;
  titleJp: string;
  intro: string;
  points: string[];
  examples: PronunciationGuideExample[];
  contrast?: PronunciationGuideContrast;
  tip: string;
}

/**
 * Original Indonesian-language explanations for Japanese pronunciation.
 * The guide teaches awareness of rhythm and pitch; it does not claim to score
 * a learner's acoustics. TTS and speech recognition are practice aids only.
 */
export const PRONUNCIATION_GUIDE: PronunciationGuideTopic[] = [
  {
    id: "vokal",
    title: "Vokal Jepang",
    titleJp: "母音",
    intro:
      "Jepang memiliki lima vokal dasar: a, i, u, e, o. Panjang pendeknya penting, tetapi kualitas vokalnya relatif bersih dan tidak berubah menjadi diftong seperti pada beberapa bahasa.",
    points: [
      "Ucapkan setiap vokal pendek dan jelas; jangan menambahkan bunyi glide seperti 'ai' atau 'au' pada satu vokal.",
      "Vokal u dalam bahasa Jepang sering diucapkan dengan bibir kurang dibulatkan dibandingkan u bahasa Indonesia.",
      "Semua mora mendapat waktu yang kurang lebih sama. Vokal yang dipanjangkan akan dibahas di topik vokal panjang.",
    ],
    examples: [
      { jp: "あさ", reading: "あさ", romaji: "asa", meaning: "pagi" },
      { jp: "いえ", reading: "いえ", romaji: "ie", meaning: "rumah" },
      { jp: "うみ", reading: "うみ", romaji: "umi", meaning: "laut" },
      { jp: "えき", reading: "えき", romaji: "eki", meaning: "stasiun" },
      { jp: "おと", reading: "おと", romaji: "oto", meaning: "bunyi" },
    ],
    tip: "Mulai dengan lima vokal terpisah: a, i, u, e, o. Setelah nyaman, gabungkan dengan konsonan tanpa mengubah kualitas vokalnya.",
  },
  {
    id: "konsonan",
    title: "Konsonan yang sering keliru",
    titleJp: "子音",
    intro:
      "Sebagian konsonan Jepang terasa lebih ringan daripada padanan Indonesianya. Yang paling sering perlu perhatian adalah ら行, ふ, し, ち, dan つ.",
    points: [
      "ら行 (ra, ri, ru, re, ro) memakai hentakan lidah ringan seperti antara r dan d, bukan getaran r panjang.",
      "ふ diucapkan dengan gesekan dua bibir, bukan seperti f yang menekan gigi bawah. し, ち, dan つ juga berbeda dari versi Indonesianya.",
      "ん berubah warna bunyi tergantung konsonan berikutnya, misalnya sebelum m, b, dan p terdengar lebih seperti m.",
    ],
    examples: [
      { jp: "さくら", reading: "さくら", romaji: "sakura", meaning: "bunga sakura", note: "Konsonan ringan, setiap mora jelas." },
      { jp: "ラーメン", reading: "ラーメン", romaji: "rāmen", meaning: "ramen", note: "ら行 dengan hentakan ringan." },
      { jp: "ふじさん", reading: "ふじさん", romaji: "fujisan", meaning: "Gunung Fuji", note: "ふ memakai gesekan dua bibir." },
      { jp: "しちじ", reading: "しちじ", romaji: "shichiji", meaning: "pukul tujuh", note: "Perhatikan し dan ち." },
      { jp: "つくえ", reading: "つくえ", romaji: "tsukue", meaning: "meja", note: "つ diawali bunyi ts." },
    ],
    tip: "Jangan menggetarkan ら行. Mulai lambat, lalu percepat sampai terasa ringan seperti satu hentakan.",
  },
  {
    id: "vokal-panjang",
    title: "Vokal panjang",
    titleJp: "長音",
    intro:
      "Vokal panjang ditahan kira-kira dua kali lebih lama daripada vokal pendek. Dalam hiragana sering ditulis dengan あ, い, う, え, atau お; dalam katakana sering memakai tanda ー.",
    points: [
      "Panjang pendek vokal dapat membedakan makna. おばさん (bibi) dan おばあさん (nenek) bukan kata yang sama.",
      "Jangan mengubah vokal panjang menjadi tekanan keras. Tahan vokalnya dengan tenang selama satu mora tambahan.",
      "Ejaan tidak selalu sama dengan bunyi. Dalam banyak kata, えい dibaca seperti vokal panjang e dan おう seperti vokal panjang o.",
    ],
    examples: [
      { jp: "おばあさん", reading: "おばあさん", romaji: "obāsan", meaning: "nenek", note: "Vokal a ditahan lebih lama." },
      { jp: "おかあさん", reading: "おかあさん", romaji: "okāsan", meaning: "ibu", note: "Bandingkan dengan おばさん." },
      { jp: "ゆうき", reading: "ゆうき", romaji: "yūki", meaning: "keberanian", note: "ゆう bukan dua suku kata terpisah." },
      { jp: "コーヒー", reading: "コーヒー", romaji: "kōhī", meaning: "kopi", note: "Tanda ー menandai vokal panjang." },
    ],
    contrast: {
      a: { jp: "おばさん", reading: "おばさん", romaji: "obasan", meaning: "bibi / perempuan paruh baya" },
      b: { jp: "おばあさん", reading: "おばあさん", romaji: "obāsan", meaning: "nenek" },
      note: "Dengarkan panjang vokal a. Perbedaan satu mora dapat mengubah makna.",
    },
    tip: "Tepuk satu ketukan untuk setiap mora. Untuk おばあさん, tepuk o-ba-a-san; untuk おばさん, o-ba-san.",
  },
  {
    id: "sokuon",
    title: "Sokuon: hentian っ",
    titleJp: "促音",
    intro:
      "っ kecil disebut sokuon. Ia bukan vokal tambahan, melainkan satu mora berupa hentian singkat sebelum konsonan berikutnya.",
    points: [
      "Tahan aliran udara sejenak, lalu lepaskan konsonan berikutnya dengan tegas. Jangan sekadar memperpanjang vokal sebelumnya.",
      "Sokuon juga dihitung sebagai satu mora, sehingga がっこう berjumlah empat mora: ga-k-ko-u.",
      "Dalam kata serapan katakana, sokuon tetap muncul, misalnya ベッド (beddo).",
    ],
    examples: [
      { jp: "がっこう", reading: "がっこう", romaji: "gakkō", meaning: "sekolah", note: "Hentian sebelum k." },
      { jp: "きっぷ", reading: "きっぷ", romaji: "kippu", meaning: "tiket", note: "Hentian sebelum p." },
      { jp: "ずっと", reading: "ずっと", romaji: "zutto", meaning: "terus / sejak tadi", note: "Hentian sebelum t." },
      { jp: "きって", reading: "きって", romaji: "kitte", meaning: "perangko", note: "Bandingkan dengan きて (datang)." },
    ],
    contrast: {
      a: { jp: "きて", reading: "きて", romaji: "kite", meaning: "datang (bentuk て)" },
      b: { jp: "きって", reading: "きって", romaji: "kitte", meaning: "perangko" },
      note: "Pada きって, tahan konsonan t selama satu mora sebelum melepasnya.",
    },
    tip: "Letakkan tangan di depan mulut. Saat mengucapkan きって, kamu harus merasakan udara tertahan sebentar sebelum t dilepas.",
  },
  {
    id: "mora",
    title: "Mora dan irama",
    titleJp: "拍",
    intro:
      "Irama Jepang dihitung dalam mora. Satu mora biasanya satu kana dasar, tetapi っ, ー, dan ん juga masing-masing satu mora; bunyi gabungan seperti きょ dihitung satu mora.",
    points: [
      "Jangan menghitung suku kata bahasa Indonesia. とうきょう adalah empat mora: to-u-kyo-u.",
      "Vokal panjang, sokuon, dan ん menambah mora. Karena itu ここ (2 mora) terasa jauh lebih pendek daripada こうこう (4 mora).",
      "Irama yang rata lebih penting daripada menekan satu mora dengan keras. Gunakan ketukan atau tepukan untuk merasakan panjangnya.",
    ],
    examples: [
      { jp: "とうきょう", reading: "とうきょう", romaji: "tōkyō", meaning: "Tokyo", note: "4 mora." },
      { jp: "がっこう", reading: "がっこう", romaji: "gakkō", meaning: "sekolah", note: "4 mora, termasuk っ." },
      { jp: "おおさか", reading: "おおさか", romaji: "ōsaka", meaning: "Osaka", note: "4 mora." },
      { jp: "こうこう", reading: "こうこう", romaji: "kōkō", meaning: "sekolah menengah atas", note: "4 mora; bandingkan dengan ここ (2 mora)." },
    ],
    contrast: {
      a: { jp: "ここ", reading: "ここ", romaji: "koko", meaning: "di sini (2 mora)" },
      b: { jp: "こうこう", reading: "こうこう", romaji: "kōkō", meaning: "sekolah menengah atas (4 mora)" },
      note: "Tepuk dua kali untuk ここ dan empat kali untuk こうこう. Jaga jarak ketukan tetap rata.",
    },
    tip: "Bacalah haiku berikut dengan ketukan 5-7-5. Karya Matsuo Bashō (1644–1694) ini berada dalam domain publik: ふるいけや / かわずとびこむ / みずのおと.",
  },
  {
    id: "pitch",
    title: "Kesadaran pitch accent",
    titleJp: "アクセント",
    intro:
      "Bahasa Jepang memakai perbedaan tinggi-rendah nada (pitch accent), bukan tekanan keras seperti beberapa bahasa lain. Pola pitch dapat membantu membedakan kata, tetapi bervariasi antardialek dan konteks.",
    points: [
      "Anggap pitch sebagai naik-turun relatif di dalam kata, bukan aksen keras pada satu suku kata.",
      "Pasangan seperti はし (jembatan) dan はし (sumpit) sering dipakai untuk menunjukkan bahwa pitch dapat membedakan makna. Pola pastinya berbeda antarvarietas bahasa Jepang.",
      "Fokus pada mendengar dan meniru pola secara utuh. Jangan menebak pitch hanya dari ejaan, dan jangan menganggap suara TTS browser sebagai penilaian native yang otoritatif.",
    ],
    examples: [
      { jp: "橋", reading: "はし", romaji: "hashi", meaning: "jembatan", note: "Dengarkan pola nadanya, lalu bandingkan dengan 箸." },
      { jp: "箸", reading: "はし", romaji: "hashi", meaning: "sumpit", note: "Bacaan sama, makna berbeda menurut konteks dan pitch." },
      { jp: "雨", reading: "あめ", romaji: "ame", meaning: "hujan", note: "Dengarkan pola nadanya, lalu bandingkan dengan 飴." },
      { jp: "飴", reading: "あめ", romaji: "ame", meaning: "permen", note: "Jangan mengandalkan romaji untuk membedakan pitch." },
    ],
    tip: "Dengarkan satu kata utuh, tiru naik-turunnya, lalu rekam dirimu. Untuk saat ini, fokus pada kesadaran pola — bukan mengejar skor.",
  },
];

export const PRONUNCIATION_TOPIC_BY_ID: Record<string, PronunciationGuideTopic> = Object.fromEntries(
  PRONUNCIATION_GUIDE.map((topic) => [topic.id, topic]),
);
