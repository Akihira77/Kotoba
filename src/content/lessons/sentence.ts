import type { LessonBlock, LessonExample, LessonNote, LessonPlan, QuizQuestion } from "@/lib/types";
import { makeQuestion } from "./shared";

interface SentencePlanSpec {
  id: string;
  sourceId: string;
  title: string;
  titleJp: string;
  summary: string;
  goals: string[];
  intro: string[];
  explanation: LessonBlock[];
  examples: LessonExample[];
  notes: LessonNote[];
  practice: QuizQuestion[];
}

const q = (
  id: string,
  prompt: string,
  correct: string,
  pool: string[],
  explanation: string,
  seed: number,
  type: QuizQuestion["type"] = "grammar",
): QuizQuestion =>
  makeQuestion({
    id,
    type,
    level: "N5",
    prompt,
    correct,
    pool,
    seed,
    explanation,
  });

export const SENTENCE_PLANS: LessonPlan[] = ([
  {
    id: "les-sentence-N5",
    sourceId: "s-n5-1",
    title: "Dasar urutan kalimat",
    titleJp: "文の基本",
    summary: "Topik は, keterangan waktu, objek を, lalu kata kerja di akhir kalimat.",
    goals: [
      "Mengenali urutan dasar subjek–objek–kata kerja.",
      "Membedakan fungsi partikel は dan を.",
      "Menempatkan keterangan waktu sebelum objek.",
    ],
    intro: [
      "Bahasa Jepang menempatkan kata kerja di akhir kalimat. Partikel menandai peran setiap kata, sehingga urutan tidak sesederhana bahasa Indonesia.",
      "Pola dasar: topik は + keterangan waktu + objek を + kata kerja.",
    ],
    explanation: [
      {
        type: "prose",
        heading: "Partikel adalah penanda peran",
        paragraphs: [
          "は menandai topik yang sedang dibicarakan, を menandai objek langsung dari kata kerja, dan kata kerja selalu berada di akhir kalimat.",
          "Keterangan waktu seperti 毎朝 (setiap pagi) biasanya diletakkan sebelum objek. Urutan ini terasa paling alami dalam kalimat sehari-hari.",
        ],
      },
      {
        type: "table",
        heading: "Urutan dasar",
        columns: ["Posisi", "Fungsi", "Contoh"],
        rows: [
          { label: "Topik", cells: ["Pelaku atau hal yang dibicarakan", "わたしは"] },
          { label: "Waktu", cells: ["Kapan kegiatan berlangsung", "毎朝"] },
          { label: "Objek", cells: ["Yang dikenai tindakan, ditandai を", "パンを"] },
          { label: "Kata kerja", cells: ["Tindakan, di akhir kalimat", "食べます"] },
        ],
      },
      {
        type: "steps",
        heading: "Cara menyusun",
        items: [
          { title: "Tentukan kata kerja", body: "Mulai dari tindakan yang ingin disampaikan, misalnya 食べます (makan)." },
          { title: "Tambahkan objek", body: "Beri partikel を pada benda yang dimakan: パンを." },
          { title: "Tambahkan topik dan waktu", body: "Letakkan わたしは dan 毎朝 sebelum objek." },
        ],
      },
    ],
    examples: [
      {
        jp: "わたしは毎朝パンを食べます。",
        reading: "わたしは まいあさ パンを たべます。",
        romaji: "Watashi wa maiasa pan o tabemasu.",
        meaning: "Saya setiap pagi makan roti.",
        literal: "Adapun saya, setiap pagi roti makan.",
        note: "Pola lengkap: topik は + waktu + objek を + kata kerja.",
      },
      {
        jp: "毎朝、パンを食べます。",
        reading: "まいあさ、パンを たべます。",
        meaning: "Setiap pagi saya makan roti.",
        note: "Topik わたしは boleh dihilangkan jika sudah jelas dari konteks.",
      },
      {
        jp: "田中さんはコーヒーを飲みます。",
        reading: "たなかさんは コーヒーを のみます。",
        meaning: "Tanaka-san minum kopi.",
      },
    ],
    notes: [
      {
        tone: "important",
        title: "は dibaca wa",
        body: ["Partikel は ditulis は tetapi dibaca wa. Partikel を ditulis を dan dibaca o."],
      },
      {
        tone: "tip",
        title: "Jangan mengulang topik terus-menerus",
        body: ["Jika lawan bicara sudah tahu subjeknya, わたしは dapat dihilangkan. Kalimat tetap jelas karena konteks."],
      },
      {
        tone: "warning",
        title: "Kata kerja tetap di akhir",
        body: ["Dalam kalimat sopan, jangan menaruh kata kerja di tengah lalu menambahkan objek setelahnya. Susun objek sebelum kata kerja."],
      },
    ],
    practice: [
      q(
        "les-sentence-N5-q1",
        "Urutan kata yang paling alami adalah…",
        "わたしは ・ 毎朝 ・ パンを ・ 食べます",
        [
          "わたしは ・ パンを ・ 毎朝 ・ 食べます",
          "毎朝 ・ わたしは ・ 食べます ・ パンを",
          "パンを ・ わたしは ・ 毎朝 ・ 食べます",
          "食べます ・ わたしは ・ 毎朝 ・ パンを",
        ],
        "Keterangan waktu 毎朝 biasanya diletakkan sebelum objek パンを, dan kata kerja 食べます berada di akhir.",
        0,
        "sentence-order",
      ),
      q(
        "les-sentence-N5-q2",
        "Partikel yang tepat untuk menandai objek パン adalah…",
        "を",
        ["は", "が", "に"],
        "パン adalah objek langsung dari 食べます, sehingga memakai を.",
        2,
      ),
      q(
        "les-sentence-N5-q3",
        "Apa arti 毎朝、パンを食べます。?",
        "Setiap pagi saya makan roti.",
        ["Setiap pagi saya membeli roti.", "Setiap malam saya makan roti.", "Saya makan roti di sekolah."],
        "毎朝 berarti setiap pagi, パンを食べます berarti makan roti.",
        3,
      ),
    ],
  },
  {
    id: "les-sentence-N5-2",
    sourceId: "s-n5-2",
    title: "Waktu, teman, dan tempat",
    titleJp: "時間・人・場所",
    summary: "Menyusun keterangan waktu, teman dengan と, tempat dengan で, lalu objek dan kata kerja.",
    goals: [
      "Menempatkan keterangan waktu di awal kalimat.",
      "Menggunakan と untuk teman dan で untuk tempat kegiatan.",
      "Menyusun kalimat lampau yang sopan.",
    ],
    intro: [
      "Kalimat dapat memuat beberapa keterangan sekaligus. Urutan yang wajar: waktu, teman, tempat, objek, lalu kata kerja.",
      "Partikel と menandai teman, sedangkan で menandai tempat berlangsungnya kegiatan.",
    ],
    explanation: [
      {
        type: "prose",
        heading: "Beberapa keterangan dalam satu kalimat",
        paragraphs: [
          "Tidak ada satu urutan yang mutlak, tetapi urutan waktu → teman → tempat → objek → kata kerja mudah dipahami dan terdengar alami.",
          "で berbeda dari に. Partikel で menandai lokasi kegiatan, sedangkan に sering menandai waktu, tujuan, atau penerima.",
        ],
      },
      {
        type: "table",
        heading: "Partikel pada kalimat ini",
        columns: ["Partikel", "Fungsi", "Contoh"],
        rows: [
          { label: "と", cells: ["Bersama dengan", "友だちと"] },
          { label: "で", cells: ["Tempat kegiatan", "学校の近くで"] },
          { label: "を", cells: ["Objek langsung", "映画を"] },
        ],
      },
    ],
    examples: [
      {
        jp: "きのう友だちと学校の近くで映画を見ました。",
        reading: "きのう ともだちと がっこうの ちかくで えいがを みました。",
        romaji: "Kinō tomodachi to gakkō no chikaku de eiga o mimashita.",
        meaning: "Kemarin saya menonton film bersama teman di dekat sekolah.",
        literal: "Kemarin, teman dengan, sekolah dekat di, film menonton.",
        note: "Waktu → teman → tempat → objek → kata kerja.",
      },
      {
        jp: "日曜日に公園で写真を撮りました。",
        reading: "にちようびに こうえんで しゃしんを とりました。",
        meaning: "Pada hari Minggu saya mengambil foto di taman.",
        note: "に menandai waktu 日曜日, で menandai tempat 公園.",
      },
      {
        jp: "家族と駅で会いました。",
        reading: "かぞくと えきで あいました。",
        meaning: "Saya bertemu keluarga di stasiun.",
        note: "会いました berarti bertemu; と menandai orang yang ditemui.",
      },
    ],
    notes: [
      {
        tone: "tip",
        title: "Letakkan tempat sebelum objek",
        body: ["Menaruh で + tempat sebelum を + objek membuat kalimat lebih mudah diikuti."],
      },
      {
        tone: "warning",
        title: "Jangan menukar で dan に",
        body: ["Gunakan で untuk tempat kegiatan seperti 公園で写真を撮ります. Gunakan に untuk tujuan perpindahan seperti 公園に行きます."],
      },
      {
        tone: "info",
        title: "Bentuk lampau",
        body: ["見ました dan 撮りました adalah bentuk lampau sopan dari 見ます dan 撮ります."],
      },
    ],
    practice: [
      q(
        "les-sentence-N5-2-q1",
        "Partikel yang tepat untuk 公園 (tempat kegiatan) adalah…",
        "で",
        ["に", "を", "と"],
        "公園 adalah tempat berlangsungnya 写真を撮りました, sehingga memakai で.",
        1,
      ),
      q(
        "les-sentence-N5-2-q2",
        "Apa arti 友だちと映画を見ました。?",
        "Saya menonton film bersama teman.",
        ["Saya menonton film tentang teman.", "Saya pergi ke film bersama teman.", "Teman saya menonton film sendirian."],
        "と menandai teman, を menandai objek 映画, dan 見ました berarti menonton.",
        2,
      ),
      q(
        "les-sentence-N5-2-q3",
        "Urutan yang paling alami adalah…",
        "きのう ・ 友だちと ・ 学校の近くで ・ 映画を ・ 見ました",
        [
          "映画を ・ きのう ・ 見ました ・ 友だちと ・ 学校の近くで",
          "きのう ・ 映画を ・ 学校の近くで ・ 友だちと ・ 見ました",
          "友だちと ・ 見ました ・ きのう ・ 映画を ・ 学校の近くで",
          "学校の近くで ・ 映画を ・ きのう ・ 見ました ・ 友だちと",
        ],
        "Keterangan waktu, teman, tempat, objek, lalu kata kerja adalah urutan yang wajar.",
        3,
        "sentence-order",
      ),
    ],
  },
  {
    id: "les-sentence-N5-3",
    sourceId: "s-n5-3",
    title: "Menghubungkan kata sifat dengan くて",
    titleJp: "い形容詞のくて",
    summary: "Menggabungkan dua kata sifat い menggunakan bentuk くて.",
    goals: [
      "Mengubah kata sifat い menjadi bentuk くて.",
      "Menghubungkan dua sifat dalam satu kalimat.",
      "Membedakan kata sifat い dan な saat menghubungkan.",
    ],
    intro: [
      "Untuk mengatakan dua sifat sekaligus, kata sifat い diubah: hilangkan い, tambahkan くて.",
      "Contoh: 安い → 安くて, おいしい → おいしくて.",
    ],
    explanation: [
      {
        type: "prose",
        heading: "Bentuk くて",
        paragraphs: [
          "Bentuk くて menghubungkan kata sifat い secara netral. Sifat terakhir tetap dalam bentuk biasa atau sopan sesuai akhir kalimat.",
          "Untuk kata sifat な, gunakan で: 静か → 静かで. Jangan mengubah kata sifat な dengan くて.",
        ],
      },
      {
        type: "table",
        heading: "Perubahan bentuk",
        columns: ["Jenis", "Bentuk kamus", "Bentuk penghubung"],
        rows: [
          { label: "Kata sifat い", cells: ["安い", "安くて"] },
          { label: "Kata sifat い", cells: ["おいしい", "おいしくて"] },
          { label: "Kata sifat な", cells: ["静か", "静かで"] },
          { label: "Negatif い", cells: ["高くない", "高くなくて"] },
        ],
      },
    ],
    examples: [
      {
        jp: "この店のラーメンは安くておいしいです。",
        reading: "この みせの ラーメンは やすくて おいしいです。",
        romaji: "Kono mise no rāmen wa yasukute oishii desu.",
        meaning: "Ramen di toko ini murah dan enak.",
        literal: "Toko ini punya ramen, murah dan enak.",
        note: "安い → 安くて, lalu おいしい tetap di akhir.",
      },
      {
        jp: "この部屋は広くて明るいです。",
        reading: "この へやは ひろくて あかるいです。",
        meaning: "Kamar ini luas dan terang.",
      },
      {
        jp: "その本は面白くてためになります。",
        reading: "その ほんは おもしろくて ためになります。",
        meaning: "Buku itu menarik dan bermanfaat.",
        note: "ためになります berarti bermanfaat; bukan bentuk kata sifat.",
      },
    ],
    notes: [
      {
        tone: "important",
        title: "Hanya kata sifat い",
        body: ["Bentuk くて khusus untuk kata sifat い. Kata sifat な memakai で, misalnya きれいで静かです."],
      },
      {
        tone: "tip",
        title: "Sifat terakhir menentukan kesopanan",
        body: ["Jika kalimat diakhiri です, seluruh kalimat terasa sopan. Bentuk くて sendiri netral."],
      },
      {
        tone: "warning",
        title: "Jangan menambah い",
        body: ["Bentuk yang salah: 安いくて. Bentuk yang benar: 安くて."],
      },
    ],
    practice: [
      q(
        "les-sentence-N5-3-q1",
        "Bentuk くて dari 高い adalah…",
        "高くて",
        ["高いくて", "高で", "高なくて"],
        "Kata sifat い 高い kehilangan い lalu mendapat くて: 高くて.",
        1,
      ),
      q(
        "les-sentence-N5-3-q2",
        "Kalimat yang benar adalah…",
        "この部屋は広くて明るいです。",
        ["この部屋は広いで明るいです。", "この部屋は広いくて明るいです。", "この部屋は広くて明るくです。"],
        "広い berubah menjadi 広くて; 明るい tetap di akhir sebelum です.",
        2,
      ),
      q(
        "les-sentence-N5-3-q3",
        "Apa arti 安くておいしいです。?",
        "Murah dan enak.",
        ["Mahal tetapi enak.", "Murah tetapi tidak enak.", "Tidak murah dan tidak enak."],
        "安くて berarti murah dan, dilanjutkan おいしい enak.",
        3,
      ),
    ],
  },
  {
    id: "les-sentence-N5-4",
    sourceId: "s-n5-4",
    title: "Kegiatan rutin dengan ています",
    titleJp: "〜ています",
    summary: "Menyatakan kegiatan yang sedang berlangsung atau kebiasaan rutin dengan ています.",
    goals: [
      "Membentuk て dari kata kerja sopan.",
      "Menggunakan ています untuk kegiatan berlangsung dan rutin.",
      "Menempatkan 少し dan 毎日 secara alami.",
    ],
    intro: [
      "Bentuk ています dapat berarti sedang melakukan sesuatu, atau melakukan sesuatu secara rutin.",
      "Konteks menentukan maknanya: 今 (sekarang) menunjukkan kegiatan berlangsung, sedangkan 毎日 menunjukkan kebiasaan.",
    ],
    explanation: [
      {
        type: "prose",
        heading: "Dua fungsi utama",
        paragraphs: [
          "ています dibentuk dari bentuk て kata kerja + います. Untuk 勉強します, bentuk て-nya 勉強して, sehingga menjadi 勉強しています.",
          "Kegiatan yang sedang berlangsung: 今、雨が降っています. Kebiasaan rutin: 毎日日本語を勉強しています.",
        ],
      },
      {
        type: "table",
        heading: "Contoh perubahan",
        columns: ["Bentuk ます", "Bentuk て", "Bentuk ています"],
        rows: [
          { label: "勉強します", cells: ["勉強して", "勉強しています"] },
          { label: "働きます", cells: ["働いて", "働いています"] },
          { label: "降ります", cells: ["降って", "降っています"] },
        ],
      },
    ],
    examples: [
      {
        jp: "わたしは毎日日本語を少し勉強しています。",
        reading: "わたしは まいにち にほんごを すこし べんきょうしています。",
        romaji: "Watashi wa mainichi nihongo o sukoshi benkyō shite imasu.",
        meaning: "Saya setiap hari belajar bahasa Jepang sedikit.",
        literal: "Saya, setiap hari, bahasa Jepang, sedikit, sedang belajar.",
        note: "Kebiasaan rutin; 少し ditempatkan sebelum kata kerja.",
      },
      {
        jp: "父は会社で働いています。",
        reading: "ちちは かいしゃで はたらいています。",
        meaning: "Ayah bekerja di perusahaan.",
        note: "Bisa berarti sedang bekerja atau bekerja secara rutin, tergantung konteks.",
      },
      {
        jp: "今、雨が降っています。",
        reading: "いま、あめが ふっています。",
        meaning: "Sekarang sedang hujan.",
        note: "今 menegaskan bahwa kegiatan sedang berlangsung.",
      },
    ],
    notes: [
      {
        tone: "tip",
        title: "Konteks menentukan",
        body: ["Tanpa penanda waktu, ています sering dipahami sebagai kegiatan yang sedang berlangsung. Tambahkan 毎日 untuk memperjelas kebiasaan."],
      },
      {
        tone: "info",
        title: "Bukan untuk rencana masa depan",
        body: ["Untuk rencana yang belum terjadi, gunakan bentuk ます atau つもりです, bukan ています."],
      },
      {
        tone: "warning",
        title: "Perhatikan bentuk て",
        body: ["Bentuk て bergantung pada kelompok kata kerja. 降ります menjadi 降って, bukan 降りて."],
      },
    ],
    practice: [
      q(
        "les-sentence-N5-4-q1",
        "Bentuk ています dari 働きます adalah…",
        "働いています",
        ["働しています", "働くています", "働ってています"],
        "働きます termasuk kata kerja kelompok 1; bentuk て-nya 働いて, sehingga 働いています.",
        1,
      ),
      q(
        "les-sentence-N5-4-q2",
        "Kalimat 今、雨が降っています。 berarti…",
        "Sekarang sedang hujan.",
        ["Kemarin hujan.", "Besok akan hujan.", "Setiap hari hujan."],
        "今 berarti sekarang, dan 降っています menyatakan kegiatan berlangsung.",
        2,
      ),
      q(
        "les-sentence-N5-4-q3",
        "Urutan yang paling alami adalah…",
        "わたしは ・ 毎日 ・ 日本語を ・ 少し ・ 勉強しています",
        [
          "わたしは ・ 日本語を ・ 毎日 ・ 勉強しています ・ 少し",
          "毎日 ・ わたしは ・ 少し ・ 勉強しています ・ 日本語を",
          "少し ・ 日本語を ・ わたしは ・ 毎日 ・ 勉強しています",
          "わたしは ・ 少し ・ 毎日 ・ 勉強しています ・ 日本語を",
        ],
        "Topik, waktu, objek, keterangan jumlah, lalu kata kerja adalah urutan yang wajar.",
        3,
        "sentence-order",
      ),
    ],
  },
  {
    id: "les-sentence-N5-5",
    sourceId: "s-n5-5",
    title: "Partikel arah に, と, dan へ",
    titleJp: "方向の助詞",
    summary: "Menggunakan に untuk waktu, と untuk teman, dan へ untuk arah tujuan.",
    goals: [
      "Membedakan に dan へ pada tujuan perpindahan.",
      "Menggunakan と dan いっしょに untuk kegiatan bersama.",
      "Menyusun kalimat pergi dengan beberapa keterangan.",
    ],
    intro: [
      "Partikel へ menandai arah tujuan, sedangkan に dapat menandai waktu, tujuan, atau penerima.",
      "と menandai orang yang ikut serta; いっしょに memperjelas bahwa kegiatan dilakukan bersama.",
    ],
    explanation: [
      {
        type: "prose",
        heading: "へ dan に",
        paragraphs: [
          "Pada kata kerja perpindahan seperti 行きます, へ dan に sama-sama dapat menandai tujuan: 公園へ行きます / 公園に行きます.",
          "に juga menandai waktu, misalnya 日曜日に. Jangan menukar に waktu dengan へ.",
        ],
      },
      {
        type: "table",
        heading: "Fungsi partikel",
        columns: ["Partikel", "Fungsi", "Contoh"],
        rows: [
          { label: "に", cells: ["Waktu atau tujuan", "日曜日に / 公園に"] },
          { label: "へ", cells: ["Arah tujuan", "公園へ"] },
          { label: "と", cells: ["Bersama", "家族と"] },
        ],
      },
    ],
    examples: [
      {
        jp: "日曜日に家族といっしょに公園へ行きます。",
        reading: "にちようびに かぞくと いっしょに こうえんへ いきます。",
        romaji: "Nichiyōbi ni kazoku to issho ni kōen e ikimasu.",
        meaning: "Pada hari Minggu saya pergi ke taman bersama keluarga.",
        literal: "Hari Minggu pada, keluarga dengan, bersama, taman ke, pergi.",
        note: "に waktu, と teman, へ arah tujuan.",
      },
      {
        jp: "明日、友だちと図書館に行きます。",
        reading: "あした、ともだちと としょかんに いきます。",
        meaning: "Besok saya pergi ke perpustakaan bersama teman.",
        note: "に menandai tujuan; と menandai teman.",
      },
      {
        jp: "来週、大阪へ旅行に行きます。",
        reading: "らいしゅう、おおさかへ りょこうに いきます。",
        meaning: "Minggu depan saya pergi berwisata ke Osaka.",
        note: "へ menandai arah 大阪; 旅行に行きます berarti pergi untuk berwisata.",
      },
    ],
    notes: [
      {
        tone: "tip",
        title: "へ dibaca e",
        body: ["Partikel へ ditulis へ tetapi dibaca e ketika berfungsi sebagai penanda arah."],
      },
      {
        tone: "warning",
        title: "Jangan menumpuk partikel",
        body: ["Pilih satu penanda tujuan: 公園へ行きます atau 公園に行きます. Jangan menulis 公園へに行きます."],
      },
      {
        tone: "info",
        title: "いっしょに opsional",
        body: ["と sudah menunjukkan teman. いっしょに menambahkan penekanan bahwa kegiatannya dilakukan bersama."],
      },
    ],
    practice: [
      q(
        "les-sentence-N5-5-q1",
        "Partikel yang menandai arah tujuan pada 公園＿行きます adalah…",
        "へ",
        ["を", "が", "で"],
        "へ menandai arah tujuan perpindahan. に juga dapat dipakai, tetapi tidak ada dalam pilihan.",
        1,
      ),
      q(
        "les-sentence-N5-5-q2",
        "Apa arti 家族といっしょに公園へ行きます。?",
        "Saya pergi ke taman bersama keluarga.",
        ["Saya pergi ke rumah keluarga.", "Keluarga saya pergi ke taman sendirian.", "Saya bertemu keluarga di taman."],
        "家族と berarti bersama keluarga, 公園へ berarti ke taman, 行きます berarti pergi.",
        2,
      ),
      q(
        "les-sentence-N5-5-q3",
        "Partikel に pada 日曜日に berfungsi menandai…",
        "waktu",
        ["tempat", "objek", "arah"],
        "日曜日に menunjukkan kapan kegiatan dilakukan, sehingga に menandai waktu.",
        3,
      ),
    ],
  },
  {
    id: "les-sentence-N5-6",
    sourceId: "s-n5-6",
    title: "Negatif sopan dan kata ganti の",
    titleJp: "ではありません・の",
    summary: "Membentuk negatif sopan dengan ではありません dan menggunakan の sebagai pengganti kata benda.",
    goals: [
      "Membentuk kalimat negatif sopan dengan ではありません.",
      "Memahami の sebagai pengganti kata benda yang sudah disebut.",
      "Membedakan bentuk sopan dan kasual.",
    ],
    intro: [
      "Bentuk negatif sopan dari です adalah ではありません. Dalam percakapan santai, では sering menjadi じゃ; じゃありません tetap sopan, sedangkan bentuk kasualnya じゃない.",
      "Kata の dapat menggantikan kata benda: わたしの berarti milik saya.",
    ],
    explanation: [
      {
        type: "prose",
        heading: "Negatif sopan",
        paragraphs: [
          "Pola: kata benda + では ありません. Untuk kata sifat い, negatifnya berbeda: 高くないです / 高くありません.",
          "の sebagai pengganti kata benda menghindari pengulangan. このかさはわたしのです berarti payung ini milik saya; かさ tidak perlu diulang.",
        ],
      },
      {
        type: "table",
        heading: "Bentuk negatif",
        columns: ["Bentuk", "Contoh", "Tingkat kesopanan"],
        rows: [
          { label: "Sopan", cells: ["学生ではありません", "Sopan, cocok untuk orang baru"] },
          { label: "Kasual", cells: ["学生じゃない", "Dipakai dengan teman dekat"] },
          { label: "Lampau sopan", cells: ["学生ではありませんでした", "Sopan, bentuk lampau"] },
        ],
      },
    ],
    examples: [
      {
        jp: "この青いかさはわたしのではありません。",
        reading: "この あおい かさは わたしのでは ありません。",
        romaji: "Kono aoi kasa wa watashi no de wa arimasen.",
        meaning: "Payung biru ini bukan milik saya.",
        literal: "Payung biru ini, milik saya, bukan.",
        note: "の menggantikan かさ; ではありません membuat kalimat negatif sopan.",
      },
      {
        jp: "あれは先生の本ではありません。",
        reading: "あれは せんせいの ほんでは ありません。",
        meaning: "Itu bukan buku guru.",
        note: "Di sini の menghubungkan 先生 dan 本, bukan menggantikan kata benda.",
      },
      {
        jp: "ここは図書館ではありません。",
        reading: "ここは としょかんでは ありません。",
        meaning: "Di sini bukan perpustakaan.",
      },
    ],
    notes: [
      {
        tone: "important",
        title: "Dua fungsi の",
        body: ["の dapat menghubungkan dua kata benda (先生の本) atau menggantikan kata benda (わたしの). Perhatikan konteksnya."],
      },
      {
        tone: "info",
        title: "Sopan vs kasual",
        body: ["ではありません terasa sopan. じゃない dipakai dalam percakapan kasual dengan teman atau keluarga."],
      },
      {
        tone: "warning",
        title: "Jangan menambahkan です dua kali",
        body: ["Bentuk yang benar: 学生ではありません. Bentuk yang salah: 学生ではありませんです."],
      },
    ],
    practice: [
      q(
        "les-sentence-N5-6-q1",
        "Bentuk negatif sopan dari 学生です adalah…",
        "学生ではありません",
        ["学生じゃありませんです", "学生ではありませんか", "学生くありません"],
        "Pola negatif sopan kata benda: kata benda + では ありません.",
        1,
      ),
      q(
        "les-sentence-N5-6-q2",
        "Pada このかさはわたしのです, kata の menggantikan…",
        "かさ",
        ["わたし", "この", "です"],
        "の menggantikan かさ yang sudah disebut, sehingga berarti milik saya.",
        2,
      ),
      q(
        "les-sentence-N5-6-q3",
        "Apa arti ここは図書館ではありません。?",
        "Di sini bukan perpustakaan.",
        ["Di sini adalah perpustakaan.", "Saya tidak pergi ke perpustakaan.", "Perpustakaan itu tidak besar."],
        "ここ berarti di sini, 図書館 berarti perpustakaan, dan ではありません menyatakan negatif.",
        3,
      ),
    ],
  },
  {
    id: "les-sentence-N5-7",
    sourceId: "s-n5-7",
    title: "Urutan kegiatan dengan てから",
    titleJp: "〜てから",
    summary: "Menyatakan bahwa satu kegiatan dilakukan setelah kegiatan lain selesai.",
    goals: [
      "Membentuk pola てから dari kata kerja.",
      "Menyusun dua kegiatan sesuai urutan waktu.",
      "Membedakan てから dan ながら.",
    ],
    intro: [
      "Pola てから berarti setelah melakukan sesuatu. Kegiatan pertama memakai bentuk て, lalu から, kemudian kegiatan kedua.",
      "Contoh: 食べてから学校へ行きます = setelah makan, pergi ke sekolah.",
    ],
    explanation: [
      {
        type: "prose",
        heading: "Urutan yang tidak bisa dibalik",
        paragraphs: [
          "Kegiatan sebelum てから terjadi lebih dulu. Karena itu 食べてから行きます berarti makan dulu, baru pergi; bukan pergi dulu, lalu makan.",
          "Bentuk て bergantung pada kelompok kata kerja: 食べる → 食べて, 飲む → 飲んで, する → して.",
        ],
      },
      {
        type: "table",
        heading: "Contoh",
        columns: ["Kegiatan pertama", "Bentuk てから", "Kegiatan kedua"],
        rows: [
          { label: "朝ごはんを食べます", cells: ["朝ごはんを食べてから", "学校へ行きます"] },
          { label: "宿題をします", cells: ["宿題をしてから", "ゲームをします"] },
          { label: "シャワーを浴びます", cells: ["シャワーを浴びてから", "寝ます"] },
        ],
      },
    ],
    examples: [
      {
        jp: "いつも朝ごはんを食べてから学校へ行きます。",
        reading: "いつも あさごはんを たべてから がっこうへ いきます。",
        romaji: "Itsumo asagohan o tabete kara gakkō e ikimasu.",
        meaning: "Saya selalu pergi ke sekolah setelah makan sarapan.",
        literal: "Selalu, sarapan makan setelah, sekolah ke, pergi.",
        note: "食べてから harus mendahului 行きます.",
      },
      {
        jp: "宿題をしてからゲームをします。",
        reading: "しゅくだいを してから ゲームを します。",
        meaning: "Saya bermain game setelah mengerjakan PR.",
      },
      {
        jp: "シャワーを浴びてから寝ます。",
        reading: "シャワーを あびてから ねます。",
        meaning: "Saya tidur setelah mandi.",
      },
    ],
    notes: [
      {
        tone: "important",
        title: "Selesai dulu",
        body: ["てから menekankan bahwa kegiatan pertama sudah selesai sebelum kegiatan kedua dimulai."],
      },
      {
        tone: "warning",
        title: "Bukan ながら",
        body: ["ながら berarti melakukan dua kegiatan bersamaan. てから berarti berurutan, bukan bersamaan."],
      },
      {
        tone: "tip",
        title: "Gunakan bentuk て yang benar",
        body: ["Periksa kelompok kata kerja sebelum menambahkan から. 食べてから benar; 食べから salah."],
      },
    ],
    practice: [
      q(
        "les-sentence-N5-7-q1",
        "Kalimat yang benar adalah…",
        "朝ごはんを食べてから学校へ行きます。",
        ["朝ごはんを食べから学校へ行きます。", "朝ごはんを食べてからだ学校へ行きます。", "朝ごはんを食べて学校へ行きますだ。"],
        "Kata kerja 食べます berbentuk て menjadi 食べて, lalu ditambah から.",
        1,
      ),
      q(
        "les-sentence-N5-7-q2",
        "Apa arti 宿題をしてからゲームをします。?",
        "Saya bermain game setelah mengerjakan PR.",
        ["Saya mengerjakan PR sambil bermain game.", "Saya bermain game sebelum mengerjakan PR.", "Saya tidak mengerjakan PR karena bermain game."],
        "してから berarti setelah melakukan; kegiatan pertama adalah PR, lalu game.",
        2,
      ),
      q(
        "les-sentence-N5-7-q3",
        "Pola てから menyatakan hubungan…",
        "urutan waktu",
        ["pertentangan", "sebab-akibat", "perbandingan"],
        "てから menghubungkan dua kegiatan secara berurutan: yang pertama selesai, lalu yang kedua.",
        3,
      ),
    ],
  },
  {
    id: "les-sentence-N5-8",
    sourceId: "s-n5-8",
    title: "Bertanya kepemilikan dengan だれの",
    titleJp: "だれの〜ですか",
    summary: "Membentuk pertanyaan kepemilikan dengan だれの dan ですか.",
    goals: [
      "Menggunakan だれの untuk menanyakan pemilik.",
      "Meletakkan kata tanya sebelum ですか.",
      "Membedakan だれ, だれの, dan なん.",
    ],
    intro: [
      "Untuk menanyakan siapa pemilik suatu benda, gunakan だれの + kata benda + ですか.",
      "Contoh: これはだれのかばんですか = tas siapa ini?",
    ],
    explanation: [
      {
        type: "prose",
        heading: "Kata tanya kepemilikan",
        paragraphs: [
          "だれ berarti siapa, sedangkan だれの berarti milik siapa. の menghubungkan pemilik dengan benda.",
          "Dalam kalimat sopan, ですか diletakkan di akhir. Intonasi naik, tetapi tanda tanya dalam bahasa Jepang sering tidak ditulis.",
        ],
      },
      {
        type: "table",
        heading: "Kata tanya",
        columns: ["Kata tanya", "Arti", "Contoh"],
        rows: [
          { label: "だれ", cells: ["siapa", "あの人はだれですか"] },
          { label: "だれの", cells: ["milik siapa", "これはだれのかばんですか"] },
          { label: "なん", cells: ["apa", "それはなんですか"] },
        ],
      },
    ],
    examples: [
      {
        jp: "あの赤いかばんはだれのですか。",
        reading: "あの あかい かばんは だれの ですか。",
        romaji: "Ano akai kaban wa dare no desu ka.",
        meaning: "Tas merah itu milik siapa?",
        literal: "Tas merah itu, milik siapa, adalah?",
        note: "の menggantikan かばん yang sudah disebut.",
      },
      {
        jp: "この本はだれのですか。",
        reading: "この ほんは だれの ですか。",
        meaning: "Buku ini milik siapa?",
      },
      {
        jp: "それは何ですか。",
        reading: "それは なんですか。",
        meaning: "Itu apa?",
        note: "何 ditanya dengan なん; bukan pertanyaan kepemilikan.",
      },
    ],
    notes: [
      {
        tone: "important",
        title: "Posisi だれの",
        body: ["だれの dapat langsung diikuti ですか bila bendanya sudah dipahami: これはだれのですか. Bila bendanya disebut, だれの diikuti kata benda: これはだれのかばんですか."],
      },
      {
        tone: "info",
        title: "Tanda tanya opsional",
        body: ["Dalam tulisan Jepang, か di akhir sudah menandai pertanyaan. Tanda ? sering ditambahkan untuk kejelasan, terutama di materi pembelajaran."],
      },
      {
        tone: "tip",
        title: "Jawaban singkat",
        body: ["Jawaban alami: わたしのです (milik saya) atau 田中さんのです (milik Tanaka-san)."],
      },
    ],
    practice: [
      q(
        "les-sentence-N5-8-q1",
        "Kata tanya yang tepat untuk menanyakan pemilik adalah…",
        "だれの",
        ["だれ", "なん", "どこ"],
        "だれの berarti milik siapa; だれ hanya menanyakan orang.",
        1,
      ),
      q(
        "les-sentence-N5-8-q2",
        "Apa arti この本はだれのですか。?",
        "Buku ini milik siapa?",
        ["Buku ini tentang siapa?", "Siapa yang menulis buku ini?", "Buku ini ada di mana?"],
        "この本 adalah buku ini, だれの menanyakan pemilik.",
        2,
      ),
      q(
        "les-sentence-N5-8-q3",
        "Urutan yang paling alami adalah…",
        "あの ・ 赤い ・ かばんは ・ だれの ・ ですか",
        [
          "だれの ・ あの ・ 赤い ・ かばんは ・ ですか",
          "あの ・ だれの ・ 赤い ・ かばんは ・ ですか",
          "あの ・ 赤い ・ だれの ・ かばんは ・ ですか",
          "かばんは ・ あの ・ 赤い ・ ですか ・ だれの",
        ],
        "Kata tanya だれの diletakkan sebelum ですか, setelah topik かばんは.",
        3,
        "sentence-order",
      ),
    ],
  },
] as SentencePlanSpec[]).map((spec) => ({
  id: spec.id,
  title: spec.title,
  titleJp: spec.titleJp,
  summary: spec.summary,
  estimateMinutes: 8,
  goals: spec.goals,
  intro: spec.intro,
  explanation: spec.explanation,
  examples: spec.examples,
  notes: spec.notes,
  practice: spec.practice,
  sourceId: spec.sourceId,
}));
