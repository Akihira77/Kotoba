import type { GrammarPoint, GrammarExample, JLPTLevel, QuizQuestion } from "@/lib/types";

type Ex = [jp: string, reading: string, meaning: string];
type Formation = [label: string, form: string, note?: string];
type Mistake = [wrong: string, right: string, why: string];

function g(
  id: string,
  level: JLPTLevel,
  pattern: string,
  meaning: string,
  formation: Formation[],
  explanation: string[],
  examples: Ex[],
  practice: QuizQuestion[],
  extra: { notes?: string; mistakes?: Mistake[]; related?: string[] } = {},
): GrammarPoint {
  return {
    id,
    level,
    pattern,
    meaning,
    formation: formation.map(([label, form, note]) => ({ label, form, note })),
    explanation,
    examples: examples.map(([jp, reading, meaning], index) => ({
      jp,
      reading,
      meaning,
      id: id + "-ex" + (index + 1),
    }) as GrammarExample),
    practice,
    notes: extra.notes ? [extra.notes] : undefined,
    mistakes: extra.mistakes?.map(([wrong, right, why]) => ({ wrong, right, why })),
    related: extra.related,
  };
}

function q(
  id: string,
  level: JLPTLevel,
  prompt: string,
  options: string[],
  answerIndex: number,
  explanation: string,
): QuizQuestion {
  return { id, type: "grammar", level, prompt, options, answerIndex, explanation };
}

export const GRAMMAR: GrammarPoint[] = [
  g(
    "g-desu",
    "N5",
    "N + です",
    "adalah / merupakan (sopan)",
    [
      ["Positif", "N + です", "Untuk kata benda dan kata sifat na."],
      ["Negatif", "N + じゃありません / ではありません", "じゃ lebih kasual, では lebih formal."],
      ["Lampau", "N + でした"],
      ["Tanya", "N + です + か", "Naikkan intonasi atau tambahkan か."],
    ],
    [
      "です adalah kopula sopan yang setara dengan 'adalah'. Dipakai setelah kata benda, kata sifat na, dan kata sifat i (面白いです), bukan langsung setelah kata kerja.",
      "Dalam percakapan santai, です sering diganti だ, tetapi だ tidak sopan bila dipakai kepada orang yang baru dikenal, guru, atau atasan.",
    ],
    [
      ["私は学生です。", "わたしはがくせいです。", "Saya seorang pelajar."],
      ["田中さんは先生ではありません。", "たなかさんはせんせいではありません。", "Tanaka-san bukan guru."],
    ],
    [
      q("g-desu-q1", "N5", "Lengkapi: 私はインドネシア人 ___。", ["です", "だです", "ます", "でしたか"], 0, "Kata benda + です membentuk kalimat sopan 'Saya orang Indonesia'."),
    ],
    {
      mistakes: [["私は学生だです。", "私は学生です。", "です dan だ tidak dipakai bersamaan."]],
      related: ["g-wa", "g-masu"],
    },
  ),
  g(
    "g-wa",
    "N5",
    "N + は + predikat",
    "topik kalimat: 'mengenai N, ...'",
    [
      ["Pola", "N + は + predikat", "は dibaca 'wa'."],
      ["Negatif", "N + は + predikat + ません / じゃありません"],
    ],
    [
      "Partikel は menandai topik yang sedang dibicarakan, bukan selalu subjek tata bahasa. Informasi setelah は adalah komentar tentang topik tersebut.",
      "Jangan tertukar dengan が yang menandai subjek atau informasi baru. Bila topik sudah dikenal, gunakan は.",
    ],
    [
      ["私はインドネシアから来ました。", "わたしはインドネシアからきました。", "Saya datang dari Indonesia."],
      ["この本は面白いです。", "このほんはおもしろいです。", "Buku ini menarik."],
    ],
    [
      q("g-wa-q1", "N5", "Partikel yang tepat: 私 ___ 学生です。", ["は", "を", "に", "で"], 0, "は menandai 'saya' sebagai topik kalimat."),
    ],
    {
      mistakes: [["私を学生です。", "私は学生です。", "を menandai objek; predikat 学生です membutuhkan は sebagai penanda topik. 私が学生です tetap sah bila が menekankan informasi baru."]],
      related: ["g-ga"],
    },
  ),
  g(
    "g-ga",
    "N5",
    "N + が + predikat",
    "penanda subjek / informasi baru",
    [["Pola", "N + が + predikat"]],
    [
      "が menandai subjek kalimat, terutama saat memperkenalkan informasi baru atau menjawab 'siapa/apa'.",
      "Pada pola 〜が好きです, 〜が分かります, dan 〜があります, objek/sasaran memakai が, bukan を.",
    ],
    [
      ["誰が来ましたか。 — 田中さんが来ました。", "だれがきましたか。 — たなかさんがきました。", "Siapa yang datang? — Tanaka-san yang datang."],
      ["私は猫が好きです。", "わたしはねこがすきです。", "Saya suka kucing."],
    ],
    [
      q("g-ga-q1", "N5", "Partikel yang tepat: 私は日本語 ___ 分かります。", ["が", "を", "は", "に"], 0, "Pola 分かります memakai が untuk hal yang dimengerti."),
    ],
    {
      notes: "が juga dipakai dalam pola 〜があります/います untuk menyatakan keberadaan.",
      related: ["g-wa", "g-suki"],
    },
  ),
  g(
    "g-wo",
    "N5",
    "N + を + verba",
    "penanda objek langsung",
    [["Pola", "N + を + verba transitif", "を dibaca 'o'."]],
    [
      "を menandai objek langsung dari kata kerja transitif, misalnya 本を読む (membaca buku).",
      "Tidak semua verba memakai を: verba gerak seperti 行く memakai に/へ untuk tujuan, dan 分かる memakai が.",
    ],
    [
      ["毎朝、パンを食べます。", "まいあさ、パンをたべます。", "Setiap pagi saya makan roti."],
      ["音楽を聞きます。", "おんがくをききます。", "Saya mendengarkan musik."],
    ],
    [
      q("g-wo-q1", "N5", "Partikel yang tepat: 水 ___ 飲みます。", ["を", "が", "に", "で"], 0, "を menandai air sebagai objek dari verba 飲みます."),
    ],
    { related: ["g-ni", "g-de"] },
  ),
  g(
    "g-ni",
    "N5",
    "N + に",
    "waktu, tujuan, atau keberadaan",
    [
      ["Waktu", "waktu + に + verba", "Contoh: 七時に起きます."],
      ["Tujuan", "tempat + に + 行きます/来ます", "に dan へ sering dapat bertukar."],
      ["Keberadaan", "tempat + に + あります/います"],
    ],
    [
      "に memiliki banyak fungsi. Yang paling dasar: menunjuk titik waktu tertentu, arah tujuan, dan tempat keberadaan.",
      "Untuk waktu relatif seperti 今日, 明日, 今朝, partikel に biasanya tidak dipakai.",
    ],
    [
      ["七時に起きます。", "しちじにおきます。", "Saya bangun pukul tujuh."],
      ["駅の前にコンビニがあります。", "えきのまえにコンビニがあります。", "Di depan stasiun ada minimarket."],
    ],
    [
      q("g-ni-q1", "N5", "Partikel yang tepat: 明日、東京 ___ 行きます。", ["に", "を", "で", "が"], 0, "に menandai tujuan pergerakan. へ juga bisa dipakai."),
    ],
    { notes: "Untuk tempat melakukan aksi gunakan で, bukan に: 図書館で勉強します." },
  ),
  g(
    "g-de",
    "N5",
    "N + で",
    "tempat aksi / alat / bahasa",
    [
      ["Tempat aksi", "tempat + で + verba", "Contoh: 食堂で食べます."],
      ["Alat", "alat + で + verba", "Contoh: ペンで書きます."],
      ["Bahasa", "bahasa + で + verba", "Contoh: 日本語で話します."],
    ],
    [
      "で menunjukkan tempat berlangsungnya tindakan, alat yang dipakai, atau media/bahasa.",
      "Bandingkan: 駅にいます (berada di stasiun) vs 駅で待ちます (menunggu di stasiun — ada aksi).",
    ],
    [
      ["図書館で勉強します。", "としょかんでべんきょうします。", "Saya belajar di perpustakaan."],
      ["日本語で話してください。", "にほんごではなしてください。", "Tolong berbicara dalam bahasa Jepang."],
    ],
    [
      q("g-de-q1", "N5", "Partikel yang tepat: 食堂 ___ 昼ご飯を食べます。", ["で", "に", "を", "へ"], 0, "で menandai tempat berlangsungnya aksi makan."),
    ],
    { related: ["g-ni"] },
  ),
  g(
    "g-e",
    "N5",
    "N + へ",
    "menuju arah",
    [["Pola", "tempat + へ + verba gerak", "へ dibaca 'e'."]],
    [
      "へ menandai arah pergerakan. Pada banyak kalimat, へ dapat digantikan に tanpa perbedaan besar.",
      "Karena dibaca 'e', jangan tertukar dengan partikel で atau kata 絵 (gambar).",
    ],
    [
      ["来年、日本へ行きます。", "らいねん、にほんへいきます。", "Tahun depan saya pergi ke Jepang."],
      ["家へ帰ります。", "いえへかえります。", "Saya pulang ke rumah."],
    ],
    [
      q("g-e-q1", "N5", "Partikel yang tepat: 明日、京都 ___ 行きます。", ["へ", "を", "で", "が"], 0, "へ menandai arah tujuan pergerakan."),
    ],
    { notes: "Dalam pola へ行きます, に juga lazim dan maknanya serupa." },
  ),
  g(
    "g-to",
    "N5",
    "N + と + N",
    "dan (hanya untuk kata benda) / bersama",
    [
      ["Daftar benda", "N と N", "Hanya menghubungkan kata benda."],
      ["Bersama", "orang + と + verba", "Contoh: 友達と行きます."],
    ],
    [
      "と menghubungkan dua kata benda secara lengkap, misalnya パンと卵 (roti dan telur).",
      "Untuk menghubungkan kalimat atau kata sifat, gunakan て形 atau それに, bukan と.",
      "と juga berarti 'bersama' ketika dipakai dengan orang: 友達と映画を見ます.",
    ],
    [
      ["パンと卵を買いました。", "パンとたまごをかいました。", "Saya membeli roti dan telur."],
      ["友達と映画を見ます。", "ともだちとえいがをみます。", "Saya menonton film bersama teman."],
    ],
    [
      q("g-to-q1", "N5", "Kalimat yang benar:", ["パンと卵を買いました。", "パンと美味しいです。", "パンと買いました。", "美味しいとパンです。"], 0, "と hanya menghubungkan kata benda; untuk kata sifat gunakan bentuk lain."),
    ],
    { mistakes: [["パンと美味しいです。", "パンは美味しいです。", "と tidak menghubungkan kata benda dengan kata sifat."]] },
  ),
  g(
    "g-mo",
    "N5",
    "N + も",
    "juga / pun",
    [["Pola", "N + も + predikat", "Menggantikan は atau が."]],
    [
      "も berarti 'juga'. Ketika digunakan, も menggantikan は atau が, bukan ditambahkan setelahnya.",
      "も juga dapat berarti 'pun' dalam kalimat negatif, misalnya お金も時間もありません.",
    ],
    [
      ["私も学生です。", "わたしもがくせいです。", "Saya juga pelajar."],
      ["水もお茶もありません。", "みずもおちゃもありません。", "Tidak ada air maupun teh."],
    ],
    [
      q("g-mo-q1", "N5", "Kalimat yang benar untuk 'Saya juga orang Indonesia':", ["私もインドネシア人です。", "私はもインドネシア人です。", "私がもインドネシア人です。", "私もはインドネシア人です。"], 0, "も menggantikan は; jangan digabung menjadi はも."),
    ],
    { mistakes: [["私はも学生です。", "私も学生です。", "も sudah menggantikan は."]] },
  ),
  g(
    "g-no",
    "N5",
    "N1 + の + N2",
    "milik / penjelas: 'N2 milik N1' atau 'N2 tentang N1'",
    [["Pola", "N1 の N2", "N1 menjelaskan N2."]],
    [
      "の menghubungkan dua kata benda. Urutannya: pemilik/penjelas dulu, lalu benda yang dijelaskan.",
      "Dalam bahasa Indonesia urutannya terbalik: 私の本 = buku saya (bukan 'saya buku').",
      "の juga bisa menggantikan kata benda yang sudah disebut: 私のより新しいです.",
    ],
    [
      ["これは私の本です。", "これはわたしのほんです。", "Ini buku saya."],
      ["日本語の先生は田中さんです。", "にほんごのせんせいはたなかさんです。", "Guru bahasa Jepang adalah Tanaka-san."],
    ],
    [
      q("g-no-q1", "N5", "Urutan yang benar untuk 'buku teman saya':", ["私の友達の本", "本の私の友達", "友達の本の私", "私の本の友達"], 0, "Pemilik berada sebelum の, lalu benda yang dimiliki."),
    ],
  ),
  g(
    "g-masu",
    "N5",
    "verba + ます / ません",
    "bentuk sopan (sekarang / kebiasaan)",
    [
      ["Positif", "V-ます", "Bentuk kamus diganti akhiran ます."],
      ["Negatif", "V-ません"],
      ["Lampau", "V-ました / V-ませんでした"],
    ],
    [
      "ます adalah bentuk sopan untuk kata kerja. Bentuk ini dipakai dalam percakapan formal dan dengan orang yang belum akrab.",
      "Bentuk kamus (食べる, 飲む, 行く) dipakai dalam percakapan santai, kamus, dan bentuk terhubung seperti て形.",
    ],
    [
      ["毎日日本語を勉強します。", "まいにちにほんごをべんきょうします。", "Saya belajar bahasa Jepang setiap hari."],
      ["お酒を飲みません。", "おさけをのみません。", "Saya tidak minum alkohol."],
    ],
    [
      q("g-masu-q1", "N5", "Bentuk sopan dari 食べる:", ["食べます", "食べるます", "食べります", "食べでした"], 0, "Verba ichidan: 食べる → 食べます."),
    ],
    { related: ["g-mashita"] },
  ),
  g(
    "g-mashita",
    "N5",
    "V-ました / V-ませんでした",
    "lampau sopan: 'sudah melakukan' / 'tidak melakukan'",
    [
      ["Positif lampau", "V-ました"],
      ["Negatif lampau", "V-ませんでした"],
    ],
    [
      "ました menyatakan tindakan yang sudah terjadi atau selesai. ませんでした menyatakan tindakan yang tidak terjadi di masa lampau.",
      "Tidak seperti bahasa Inggris, bentuk lampau Jepang tidak selalu berarti 'jauh di masa lalu'; konteks yang menentukan.",
    ],
    [
      ["昨日、映画を見ました。", "きのう、えいがをみました。", "Kemarin saya menonton film."],
      ["朝ご飯を食べませんでした。", "あさごはんをたべませんでした。", "Saya tidak makan sarapan."],
    ],
    [
      q("g-mashita-q1", "N5", "Bentuk lampau sopan dari 行きます:", ["行きました", "行きますした", "行ったです", "行きでした"], 0, "ます → ました untuk bentuk lampau."),
    ],
    {},
  ),
  g(
    "g-te-kudasai",
    "N5",
    "V-て + ください",
    "tolong lakukan ...",
    [["Pola", "verba bentuk て + ください"]],
    [
      "Pola ini adalah cara sopan meminta seseorang melakukan sesuatu. Verba harus dalam bentuk て.",
      "Bentuk て dibentuk berbeda menurut kelompok verba: 食べる→食べて, 飲む→飲んで, 行く→行って, する→して, 来る→来て.",
    ],
    [
      ["ここに名前を書いてください。", "ここになまえをかいてください。", "Tolong tulis nama di sini."],
      ["少し待ってください。", "すこしまってください。", "Tolong tunggu sebentar."],
    ],
    [
      q("g-tekudasai-q1", "N5", "Bentuk て dari 飲む:", ["飲んで", "飲みて", "飲んでください", "飲むて"], 0, "Verba godan berakhiran む berubah menjadi んで: 飲む → 飲んで."),
    ],
    { related: ["g-teiru"] },
  ),
  g(
    "g-teiru",
    "N5",
    "V-て + います",
    "sedang melakukan / keadaan berlangsung",
    [["Pola", "verba bentuk て + います"]],
    [
      "ています dapat berarti (1) sedang melakukan sesuatu sekarang, atau (2) keadaan yang berlangsung sebagai hasil tindakan.",
      "Contoh: 今、本を読んでいます (sedang membaca) vs 東京に住んでいます (tinggal di Tokyo — keadaan).",
    ],
    [
      ["今、音楽を聞いています。", "いま、おんがくをきいています。", "Sekarang saya sedang mendengarkan musik."],
      ["私はジャカルタに住んでいます。", "わたしはジャカルタにすんでいます。", "Saya tinggal di Jakarta."],
    ],
    [
      q("g-teiru-q1", "N5", "Kalimat 'Saya sedang belajar':", ["私は勉強しています。", "私は勉強しますです。", "私は勉強するています。", "私は勉強してです。"], 0, "Pola ています memakai bentuk て dari する: して + います."),
    ],
  ),
  g(
    "g-tai",
    "N5",
    "V-ます (tanpa ます) + たいです",
    "ingin melakukan ...",
    [["Pola", "bentuk ます tanpa ます + たい", "Contoh: 食べます → 食べたい."]],
    [
      "たい mengekspresikan keinginan pembicara. Subjek biasanya orang pertama; untuk orang ketiga gunakan たがっています.",
      "Meskipun menyatakan keinginan, objek dapat memakai が atau を: 水が飲みたい / 水を飲みたい.",
    ],
    [
      ["日本へ行きたいです。", "にほんへいきたいです。", "Saya ingin pergi ke Jepang."],
      ["冷たい水が飲みたいです。", "つめたいみずがのみたいです。", "Saya ingin minum air dingin."],
    ],
    [
      q("g-tai-q1", "N5", "Bentuk yang benar untuk 'ingin makan':", ["食べたい", "食べるたい", "食べますたい", "食べたかった"], 0, "Bentuk ます tanpa ます + たい."),
    ],
    { notes: "Bentuk lampau: たかったです (ingin pada waktu lampau)." },
  ),
  g(
    "g-mashou",
    "N5",
    "V-ましょう",
    "mari / ayo melakukan bersama",
    [["Pola", "bentuk ます + ましょう"]],
    [
      "ましょう mengajak lawan bicara melakukan sesuatu bersama-sama. Sifatnya sopan dan sering dipakai dalam kelas atau rapat.",
      "Bentuk kasualnya よう untuk ichidan (食べよう) dan おう untuk godan (行こう).",
    ],
    [
      ["一緒に昼ご飯を食べましょう。", "いっしょにひるごはんをたべましょう。", "Mari makan siang bersama."],
      ["駅で待ちましょう。", "えきでまちましょう。", "Mari menunggu di stasiun."],
    ],
    [
      q("g-mashou-q1", "N5", "Bentuk yang benar untuk 'mari pergi':", ["行きましょう", "行くましょう", "行ってましょう", "行きました"], 0, "ます-stem 行き + ましょう."),
    ],
  ),
  g(
    "g-kara-made",
    "N5",
    "N + から / N + まで",
    "dari ... / sampai ...",
    [
      ["Waktu", "九時から五時まで", "Dari pukul 9 sampai 5."],
      ["Tempat", "駅から学校まで", "Dari stasiun sampai sekolah."],
    ],
    [
      "から menandai titik awal (waktu atau tempat), まで menandai titik akhir.",
      "Keduanya bisa dipakai terpisah: 三時から勉強します (belajar mulai pukul tiga).",
    ],
    [
      ["授業は九時から十二時までです。", "じゅぎょうはくじからじゅうにじまでです。", "Pelajaran dari pukul sembilan sampai dua belas."],
      ["駅から家まで歩きます。", "えきからいえまであるきます。", "Saya berjalan dari stasiun sampai rumah."],
    ],
    [
      q("g-karamade-q1", "N5", "Partikel untuk 'sampai': 駅 ___ 歩きます。", ["まで", "から", "で", "に"], 0, "まで menandai batas akhir."),
    ],
  ),
  g(
    "g-yori",
    "N5",
    "A は B より + adj / A のほうが B より + adj",
    "perbandingan: A lebih ... daripada B",
    [
      ["Banding", "A は B より + sifat", "B adalah pembanding."],
      ["Pilih", "A のほうが B より + sifat", "Menegaskan A lebih."],
    ],
    [
      "より menandai pembanding: 'daripada'. Pola のほうが menegaskan pilihan di antara dua hal.",
      "Untuk bertanya, gunakan どちらのほうが: 電車とバスとどちらのほうが速いですか.",
    ],
    [
      ["電車はバスより速いです。", "でんしゃはバスよりはやいです。", "Kereta lebih cepat daripada bus."],
      ["夏より冬のほうが好きです。", "なつよりふゆのほうがすきです。", "Saya lebih suka musim dingin daripada musim panas."],
    ],
    [
      q("g-yori-q1", "N5", "Partikel pembanding: 東京は大阪 ___ 大きいです。", ["より", "まで", "から", "の"], 0, "より menandai pembanding: 'daripada Osaka'."),
    ],
  ),
  g(
    "g-ichiban",
    "N5",
    "lingkup + で + いちばん + sifat",
    "paling ... di antara ...",
    [["Pola", "lingkup + で + いちばん + kata sifat"]],
    [
      "いちばん berarti 'nomor satu / paling'. Partikel で menandai lingkup perbandingannya.",
      "Untuk kata benda: 日本で一番人気のある食べ物は何ですか.",
    ],
    [
      ["富士山は日本で一番高い山です。", "ふじさんはにほんでいちばんたかいやまです。", "Gunung Fuji adalah gunung tertinggi di Jepang."],
      ["このクラスで一番速い人は誰ですか。", "このクラスでいちばんはやいひとはだれですか。", "Siapa orang tercepat di kelas ini?"],
    ],
    [
      q("g-ichiban-q1", "N5", "Partikel yang tepat: 日本 ___ 一番きれいな季節は春です。", ["で", "に", "を", "へ"], 0, "で menandai lingkup 'di Jepang'."),
    ],
  ),
  g(
    "g-suki",
    "N5",
    "N + が + 好きです / 嫌いです / 上手です / 分かります",
    "menyatakan suka, tidak suka, pandai, mengerti",
    [["Pola", "topik + は + objek + が + 好きです", "Objek memakai が."]],
    [
      "好き, 嫌い, 上手, 下手, 分かる, できる adalah kata sifat/verba yang mengambil objek dengan が, bukan を.",
      "Karena itu, 'Saya suka kucing' adalah 私は猫が好きです, bukan 猫を好きです.",
    ],
    [
      ["私は猫が好きです。", "わたしはねこがすきです。", "Saya suka kucing."],
      ["彼は日本語が上手です。", "かれはにほんごがじょうずです。", "Dia pandai bahasa Jepang."],
    ],
    [
      q("g-suki-q1", "N5", "Partikel yang tepat: 私は寿司 ___ 好きです。", ["が", "を", "に", "で"], 0, "好き mengambil objek dengan が."),
    ],
    {
      mistakes: [["私は猫を好きです。", "私は猫が好きです。", "好き bukan verba transitif; gunakan が."]],
      related: ["g-ga"],
    },
  ),

  g(
    "g-te-mo-ii",
    "N4",
    "V-て + もいいです",
    "boleh melakukan ... (izin)",
    [["Izin", "V-て + もいいです"], ["Tanya", "V-て + もいいですか", "Minta izin."]],
    [
      "Pola ini meminta atau memberi izin: 'boleh ...'. Bentuk tanya てもいいですか adalah cara sopan meminta izin.",
      "Untuk menawarkan bantuan atau mengajak, gunakan ませんか atau ましょうか, bukan てもいいですか.",
    ],
    [
      ["このペンを使ってもいいですか。", "このペンをつかってもいいですか。", "Bolehkah saya memakai pena ini?"],
      ["ここに座ってもいいですよ。", "ここにすわってもいいですよ。", "Silakan duduk di sini."],
    ],
    [
      q("g-temoi-q1", "N4", "Lengkapi: 写真を撮って ___ いいですか。", ["は", "も", "が", "に"], 1, "Pola izin: て形 + もいいですか."),
    ],
    { related: ["g-te-wa-ikenai"] },
  ),
  g(
    "g-te-wa-ikenai",
    "N4",
    "V-て + はいけません",
    "tidak boleh melakukan ...",
    [["Larangan", "V-て + はいけません", "Bentuk kasual: てはだめだ."]],
    [
      "てはいけません menyatakan larangan. Sering dipakai untuk aturan sekolah, tempat umum, dan nasihat.",
      "Jangan tertukar dengan なくてはいけません yang justru berarti 'harus'.",
    ],
    [
      ["ここで写真を撮ってはいけません。", "ここでしゃしんをとってはいけません。", "Dilarang mengambil foto di sini."],
      ["教室で食べてはいけません。", "きょうしつでたべてはいけません。", "Tidak boleh makan di kelas."],
    ],
    [
      q("g-tewa-q1", "N4", "Lengkapi: ここに車を止めて ___ いけません。", ["は", "も", "が", "を"], 0, "Larangan memakai ては + いけません."),
    ],
    {
      mistakes: [["ここで写真を撮るはだめです。", "ここで写真を撮ってはだめです。", "Pola larangan memakai bentuk て: 撮って + は + だめです. てはだめです lebih kasual daripada てはいけません."]],
    },
  ),
  g(
    "g-nakereba",
    "N4",
    "V-ない → なければなりません",
    "harus melakukan ...",
    [
      ["Pola", "bentuk ない (tanpa い) + ければなりません"],
      ["Alternatif", "なくてはなりません", "Lebih formal."],
      ["Kasual", "なきゃ / なくちゃ"],
    ],
    [
      "Pola ini menyatakan kewajiban: 'harus'. Bentuk ない dari verba diubah: 飲まない → 飲まなければ; する → しなければ; 来る → 来なければ.",
      "Dalam percakapan santai, なければ sering disingkat なきゃ, dan なくては menjadi なくちゃ.",
    ],
    [
      ["毎日薬を飲まなければなりません。", "まいにちくすりをのまなければなりません。", "Saya harus minum obat setiap hari."],
      ["明日までに宿題をしなければなりません。", "あしたまでにしゅくだいをしなければなりません。", "Saya harus mengerjakan PR sebelum besok."],
    ],
    [
      q("g-nakereba-q1", "N4", "Bentuk yang benar dari 行く:", ["行かなければなりません", "行きなければなりません", "行くなければなりません", "行けなければなりません"], 0, "Bentuk ない 行かない → 行かなければ."),
    ],
    { related: ["g-nakute-mo-ii"] },
  ),
  g(
    "g-nakute-mo-ii",
    "N4",
    "V-ない → なくてもいいです",
    "tidak perlu melakukan ...",
    [["Pola", "bentuk ない (tanpa い) + くてもいいです"]],
    [
      "Pola ini menyatakan bahwa suatu tindakan tidak wajib: 'tidak perlu'. Bentuknya kebalikan dari なければなりません.",
      "Hati-hati: なくてもいいです bukan larangan, melainkan pembebasan dari kewajiban.",
    ],
    [
      ["明日は来なくてもいいです。", "あしたはこなくてもいいです。", "Besok tidak perlu datang."],
      ["全部覚えなくてもいいです。", "ぜんぶおぼえなくてもいいです。", "Tidak perlu menghafal semuanya."],
    ],
    [
      q("g-nakutemo-q1", "N4", "Lengkapi: 今日は働か ___ いいです。", ["なくても", "ないても", "なけても", "なくては"], 0, "Pola 'tidak perlu': なくてもいい."),
    ],
  ),
  g(
    "g-ta-koto-ga-aru",
    "N4",
    "V-た + ことがある",
    "pernah melakukan ...",
    [["Pengalaman", "V-た + ことがあります"], ["Negatif", "V-た + ことがありません"]],
    [
      "Pola ini menyatakan pengalaman: 'pernah'. Verba memakai bentuk lampau た.",
      "Bandingkan dengan V-る + ことがある yang berarti 'kadang-kadang melakukan' — konteks dan bentuk verba membedakannya.",
    ],
    [
      ["富士山に登ったことがあります。", "ふじさんにのぼったことがあります。", "Saya pernah mendaki Gunung Fuji."],
      ["納豆を食べたことがありません。", "なっとうをたべたことがありません。", "Saya belum pernah makan natto."],
    ],
    [
      q("g-takoto-q1", "N4", "Lengkapi (pengalaman): 日本に ___ ことがあります。", ["行った", "行く", "行き", "行って"], 0, "Pengalaman memakai bentuk lampau た + ことがある."),
    ],
    { notes: "V-る + ことがある (bukan lampau) berarti 'kadang-kadang': 週末に映画を見ることがあります." },
  ),
  g(
    "g-tsumori",
    "N4",
    "V-る / V-ない + つもりです",
    "berniat melakukan ...",
    [["Niat", "V-る + つもりです"], ["Negatif", "V-ない + つもりです"], ["Lampau", "つもりでした", "Niat yang ternyata tidak terjadi."]],
    [
      "つもり menyatakan niat atau rencana pribadi yang sudah dipikirkan. Tidak sekuat 予定 (jadwal yang ditetapkan).",
      "Untuk orang ketiga, biasanya ditambahkan らしい/ようです karena つもり langsung terdengar seperti mengklaim isi pikiran orang lain.",
    ],
    [
      ["来年日本に留学するつもりです。", "らいねんにほんにりゅうがくするつもりです。", "Saya berniat belajar di Jepang tahun depan."],
      ["今日は出かけないつもりです。", "きょうはでかけないつもりです。", "Hari ini saya berniat tidak keluar."],
    ],
    [
      q("g-tsumori-q1", "N4", "Lengkapi: 週末に映画を ___ つもりです。", ["見る", "見た", "見て", "見ます"], 0, "Niat memakai bentuk kamus V-る + つもり."),
    ],
  ),
  g(
    "g-kamoshirenai",
    "N4",
    "bentuk biasa + かもしれません",
    "mungkin / bisa jadi ...",
    [["Pola", "plain form + かもしれません"], ["Kasual", "かも", "Sering tanpa しれない."]],
    [
      "かもしれません menyatakan kemungkinan yang tidak pasti: 'mungkin'. Tingkat kepastiannya lebih rendah daripada でしょう.",
      "Bentuk kasualnya かも (明日は雨かも). Dalam tulisan formal gunakan かもしれません.",
    ],
    [
      ["明日は雨が降るかもしれません。", "あしたはあめがふるかもしれません。", "Besok mungkin turun hujan."],
      ["彼はもう帰ったかもしれません。", "かれはもうかえったかもしれません。", "Dia mungkin sudah pulang."],
    ],
    [
      q("g-kamo-q1", "N4", "Lengkapi: 電車が ___ かもしれません。", ["遅れる", "遅れて", "遅れたら", "遅れます"], 0, "Sebelum かもしれません dipakai bentuk biasa V-る."),
    ],
  ),
  g(
    "g-nagara",
    "N4",
    "V-ます (tanpa ます) + ながら",
    "sambil melakukan ...",
    [["Pola", "bentuk ます tanpa ます + ながら + aksi utama"]],
    [
      "ながら menggabungkan dua tindakan yang dilakukan bersamaan oleh subjek yang sama. Tindakan utama ada di klausa kedua.",
      "Karena subjek harus sama, kalimat seperti 'Saya makan sambil dia membaca' tidak bisa memakai ながら.",
    ],
    [
      ["音楽を聞きながら勉強します。", "おんがくをききながらべんきょうします。", "Saya belajar sambil mendengarkan musik."],
      ["彼は笑いながら話しました。", "かれはわらいながらはなしました。", "Dia berbicara sambil tersenyum."],
    ],
    [
      q("g-nagara-q1", "N4", "Lengkapi: コーヒーを ___ 本を読みます。", ["飲みながら", "飲むながら", "飲んでながら", "飲みますながら"], 0, "ながら menempel pada bentuk ます tanpa ます."),
    ],
  ),
  g(
    "g-node",
    "N4",
    "bentuk biasa + ので",
    "karena ... (lebih sopan/objektif)",
    [["Pola", "plain form + ので"], ["Kata benda / na-adj", "N + なので / na-adj + なので"]],
    [
      "ので menyatakan sebab dengan nada lebih sopan dan objektif daripada から. Sering dipakai saat meminta izin atau menjelaskan alasan.",
      "Karena ので bersifat menjelaskan keadaan, ia terasa lebih halus ketika menolak atau meminta maaf.",
    ],
    [
      ["寒いので、窓を閉めます。", "さむいので、まどをしめます。", "Karena dingin, saya menutup jendela."],
      ["今日は休みなので、家にいます。", "きょうはやすみなので、いえにいます。", "Karena hari ini libur, saya di rumah."],
    ],
    [
      q("g-node-q1", "N4", "Lengkapi: 雨が ___ 、試合は中止です。", ["降っているので", "降るだので", "降りので", "降っただので"], 0, "Alasan memakai bentuk biasa + ので; di sini keadaan berlangsung 降っている."),
    ],
    { related: ["g-noni"] },
  ),
  g(
    "g-noni",
    "N4",
    "bentuk biasa + のに",
    "meskipun / padahal ...",
    [["Pola", "plain form + のに"], ["Kata benda / na-adj", "N + なのに / na-adj + なのに"]],
    [
      "のに menyatakan kontras yang mengejutkan atau mengecewakan: 'padahal', 'meskipun'. Nada emosinya lebih kuat daripada ても.",
      "Berbeda dengan ても yang netral, のに sering membawa rasa kecewa atau tidak puas.",
    ],
    [
      ["一生懸命勉強したのに、試験に落ちました。", "いっしょうけんめいべんきょうしたのに、しけんにおちました。", "Padahal sudah belajar keras, saya gagal ujian."],
      ["安いのに美味しいです。", "やすいのに おいしいです。", "Meskipun murah, rasanya enak."],
    ],
    [
      q("g-noni-q1", "N4", "Lengkapi: 日曜日 ___ 、仕事をしました。", ["なのに", "のに", "なので", "では"], 0, "Kata benda memerlukan な sebelum のに."),
    ],
  ),
  g(
    "g-sou",
    "N4",
    "V-ます stem / adj stem + そうです",
    "tampak / kelihatannya ...",
    [["Verba", "bentuk ます tanpa ます + そうです"], ["い-adj", "buang い + そうです"], ["na-adj", "na-adj + そうです"]],
    [
      "Pola ini menyatakan kesan yang ditangkap indra: 'kelihatannya'. Contoh: 美味しそうです (kelihatan enak), 雨が降りそうです (kelihatannya akan hujan).",
      "Untuk い-adj, buang い: 高い → 高そうです. Untuk いい, bentuknya よさそうです (tidak beraturan).",
    ],
    [
      ["このケーキは美味しそうです。", "このケーキはおいしそうです。", "Kue ini kelihatan enak."],
      ["雨が降りそうです。", "あめがふりそうです。", "Sepertinya akan turun hujan."],
    ],
    [
      q("g-sou-q1", "N4", "Bentuk 'kelihatannya enak' dari 美味しい:", ["美味しそうです", "美味しいそうです", "美味しくそうです", "美味しくそうでした"], 0, "い-adj: buang い lalu tambahkan そうです."),
    ],
    { notes: "Jangan tertukar dengan そうです (kabar): bentuk biasa + そうです berarti 'katanya'." },
  ),

  g(
    "g-you-ni-suru",
    "N3",
    "V-る / V-ない + ようにする",
    "berusaha agar / membiasakan ...",
    [["Usaha", "V-る / V-ない + ようにする"], ["Kebiasaan", "V-る / V-ない + ようにしています"]],
    [
      "ようにする menyatakan usaha sadar agar suatu keadaan terjadi. ようにしています menekankan kebiasaan yang sedang dijalankan.",
      "Bentuk ない + ようにする berarti berusaha untuk tidak melakukan sesuatu.",
    ],
    [
      ["毎日野菜を食べるようにしています。", "まいにちやさいをたべるようにしています。", "Saya berusaha makan sayur setiap hari."],
      ["遅れないようにしてください。", "おくれないようにしてください。", "Tolong usahakan agar tidak terlambat."],
    ],
    [
      q("g-younisuru-q1", "N3", "Lengkapi: 健康のために、毎朝走る ___ しています。", ["ように", "ために", "そうに", "らしく"], 0, "Kebiasaan usaha memakai ようにしている."),
    ],
    { related: ["g-you-ni-naru"] },
  ),
  g(
    "g-you-ni-naru",
    "N3",
    "V-る / V-ない + ようになる",
    "menjadi bisa / mulai ... (perubahan)",
    [["Perubahan", "V-る + ようになる"], ["Kemampuan", "V-可能形 + ようになる"], ["Negatif", "V-ない → なくなる"]],
    [
      "ようになる menyatakan perubahan keadaan atau kemampuan dari waktu ke waktu: 'akhirnya bisa', 'mulai terbiasa'.",
      "Untuk perubahan kebiasaan, gunakan V-る + ようになる; untuk hilangnya kebiasaan, V-ない + なくなる.",
    ],
    [
      ["日本語が話せるようになりました。", "にほんごがはなせるようになりました。", "Saya sekarang bisa berbicara bahasa Jepang."],
      ["毎朝走るようになりました。", "まいあさはしるようになりました。", "Saya mulai berlari setiap pagi."],
    ],
    [
      q("g-youninaru-q1", "N3", "Lengkapi: 練習して、漢字が ___ ようになりました。", ["読める", "読む", "読んだ", "読み"], 0, "Kemampuan memakai bentuk potensial 読める + ようになる."),
    ],
  ),
  g(
    "g-ba",
    "N3",
    "V-ば / adj-ければ",
    "jika ... (kondisional)",
    [
      ["Godan", "akhir -u → -e + ば", "行く → 行けば."],
      ["Ichidan", "stem + れば", "食べる → 食べれば."],
      ["Ireguler", "する → すれば, 来る → くれば"],
      ["い-adj", "い → ければ", "高い → 高ければ."],
    ],
    [
      "ば menyatakan kondisi hipotetis: 'jika'. Sering dipakai untuk kebenaran umum, saran, dan kondisi yang wajar.",
      "Dalam kalimat utama, ば umumnya tidak diikuti permintaan atau perintah langsung; untuk itu gunakan たら.",
    ],
    [
      ["時間があれば、映画を見ます。", "じかんがあれば、えいがをみます。", "Kalau ada waktu, saya menonton film."],
      ["安ければ買います。", "やすければ かいます。", "Kalau murah, saya akan membelinya."],
    ],
    [
      q("g-ba-q1", "N3", "Bentuk kondisional dari 行く:", ["行けば", "行けれべ", "行くば", "行きば"], 0, "Godan: 行く → 行け + ば."),
    ],
  ),
  g(
    "g-tara",
    "N3",
    "V-た / adj + ら",
    "jika / setelah ... (kondisional)",
    [
      ["Verba", "V-た + ら", "着いたら, 食べたら."],
      ["い-adj", "かったら"],
      ["N / na-adj", "だったら"],
    ],
    [
      "たら adalah kondisional paling fleksibel. Bisa berarti 'jika' (hipotetis) atau 'setelah' (berurutan).",
      "Karena fleksibel, たら dapat diikuti permintaan atau perintah: 家に着いたら、電話してください.",
    ],
    [
      ["もし雨が降ったら、家にいます。", "もしあめがふったら、いえにいます。", "Kalau turun hujan, saya di rumah."],
      ["家に着いたら、電話してください。", "いえについたら、でんわしてください。", "Setelah sampai rumah, tolong telepon."],
    ],
    [
      q("g-tara-q1", "N3", "Lengkapi: 時間が ___ 、遊びに行きます。", ["あったら", "あるたら", "ありたら", "あったれば"], 0, "たら dibentuk dari bentuk lampau: あった + ら."),
    ],
    { related: ["g-ba"] },
  ),
  g(
    "g-temo",
    "N3",
    "V-て + も / adj + ても",
    "meskipun ... / walaupun ...",
    [
      ["Verba", "V-て + も"],
      ["い-adj", "くても", "高くても."],
      ["N / na-adj", "でも", "雨でも."],
    ],
    [
      "ても menyatakan konsesi: 'meskipun'. Klausa utama tetap berlaku tanpa terpengaruh kondisi tersebut.",
      "Untuk penekanan, gunakan どんなに〜ても atau たとえ〜ても.",
    ],
    [
      ["雨が降っても、試合はあります。", "あめがふっても、しあいはあります。", "Meskipun turun hujan, pertandingan tetap ada."],
      ["高くても買います。", "たかくてもかいます。", "Meskipun mahal, saya akan membelinya."],
    ],
    [
      q("g-temo-q1", "N3", "Lengkapi: 雨 ___ 、出かけます。", ["でも", "ても", "くても", "のに"], 0, "Kata benda memakai でも: 雨でも."),
    ],
  ),
  g(
    "g-tame-ni",
    "N3",
    "V-る + ために / N + の + ために",
    "untuk ... / demi ...",
    [["Tujuan", "V-る + ために"], ["Kepentingan", "N + の + ために"], ["Sebab", "plain form + ために", "Lebih formal."]],
    [
      "ために menyatakan tujuan ('untuk') atau pihak yang diuntungkan ('demi'). Subjek klausa tujuan dan klausa utama biasanya sama.",
      "ために juga bisa menyatakan sebab formal, misalnya 台風のために電車が止まりました. Konteks menentukan arti.",
    ],
    [
      ["日本で働くために、日本語を勉強しています。", "にほんではたらくために、にほんごをべんきょうしています。", "Saya belajar bahasa Jepang untuk bekerja di Jepang."],
      ["家族のために料理します。", "かぞくのためにりょうりします。", "Saya memasak demi keluarga."],
    ],
    [
      q("g-tameni-q1", "N3", "Lengkapi: 試験に合格する ___ 勉強します。", ["ために", "そうに", "らしく", "ながら"], 0, "Tujuan memakai V-る + ために."),
    ],
  ),
  g(
    "g-tokoro",
    "N3",
    "V-る / V-ている / V-た + ところ",
    "akan / sedang / baru saja ...",
    [
      ["Akan", "V-る + ところ", "Baru akan dilakukan."],
      ["Sedang", "V-ている + ところ", "Sedang berlangsung."],
      ["Baru", "V-た + ところ", "Baru saja selesai."],
    ],
    [
      "ところ menyatakan tahap suatu tindakan. Perhatikan bentuk verba: る = akan, ている = sedang, た = baru saja.",
      "Jangan tertukar dengan ところで yang berarti 'ngomong-ngomong' sebagai penghubung topik.",
    ],
    [
      ["今から出かけるところです。", "いまからでかけるところです。", "Saya baru akan keluar sekarang."],
      ["さっき駅に着いたところです。", "さっきえきについたところです。", "Saya baru saja tiba di stasiun."],
    ],
    [
      q("g-tokoro-q1", "N3", "Lengkapi (sedang berlangsung): 今、昼ご飯を ___ ところです。", ["食べている", "食べる", "食べた", "食べ"], 0, "Sedang berlangsung: ている + ところ."),
    ],
  ),
  g(
    "g-hazu",
    "N3",
    "bentuk biasa + はずです",
    "seharusnya / semestinya ...",
    [["Keyakinan", "plain form + はずです"], ["Tidak mungkin", "はずがありません"]],
    [
      "はず menyatakan kesimpulan logis berdasarkan bukti atau alasan: 'seharusnya'. Bukan sekadar dugaan.",
      "はずがない menyatakan ketidakmungkinan yang kuat: 'tidak mungkin'.",
    ],
    [
      ["彼はもう知っているはずです。", "かれはもうしっているはずです。", "Dia seharusnya sudah tahu."],
      ["そんなはずはありません。", "そんなはずはありません。", "Itu tidak mungkin."],
    ],
    [
      q("g-hazu-q1", "N3", "Lengkapi: 彼は約束を忘れる ___ がありません。", ["はず", "つもり", "そう", "らしい"], 0, "Ketidakmungkinan memakai はずがない."),
    ],
  ),
  g(
    "g-rashii",
    "N3",
    "bentuk biasa + らしい",
    "tampaknya / kelihatannya (berdasarkan informasi)",
    [["Dugaan", "plain form + らしい"], ["Khas", "N + らしい", "Berarti 'khas/tipikal'."]],
    [
      "らしい menyatakan dugaan berdasarkan informasi atau ciri yang terlihat. Nada lebih objektif daripada ようです.",
      "Sebagai sufiks, らしい berarti 'khas': 学生らしい (seperti layaknya pelajar).",
    ],
    [
      ["明日は雪が降るらしいです。", "あしたはゆきがふるらしいです。", "Sepertinya besok akan turun salju."],
      ["彼は日本人らしいです。", "かれはにほんじんらしいです。", "Sepertinya dia orang Jepang."],
    ],
    [
      q("g-rashii-q1", "N3", "Lengkapi: 天気予報によると、台風が来る ___ です。", ["らしい", "らしく", "はず", "わけ"], 0, "Dugaan dari informasi luar memakai らしい."),
    ],
  ),
  g(
    "g-wake-dewa-nai",
    "N2",
    "bentuk biasa + わけではありません",
    "tidak berarti bahwa ...",
    [["Pola", "plain form + わけではない"], ["Bentuk tegas", "わけがない", "Tidak mungkin."]],
    [
      "わけではない menyangkal kesimpulan yang mungkin diambil: 'bukan berarti'. Sering dipakai untuk mengoreksi generalisasi.",
      "わけがない berbeda: berarti 'tidak mungkin' dan menyatakan keyakinan kuat.",
    ],
    [
      ["全部が嫌いなわけではありません。", "ぜんぶがきらいなわけではありません。", "Bukan berarti saya tidak suka semuanya."],
      ["お金があれば幸せというわけではない。", "おかねがあればしあわせというわけではない。", "Bukan berarti kalau punya uang lalu bahagia."],
    ],
    [
      q("g-wakedehanai-q1", "N2", "Lengkapi: 日本に住んでいるからといって、日本語が上手な ___ ではない。", ["わけ", "はず", "そう", "らしい"], 0, "Penyangkalan kesimpulan memakai わけではない."),
    ],
  ),
  g(
    "g-zaru-wo-enai",
    "N2",
    "V-ない → V-ず + ざるを得ない",
    "terpaksa melakukan ...",
    [
      ["Pola", "bentuk ない tanpa い + ざるを得ない"],
      ["Ireguler", "する → せざるを得ない, 来る → 来ざるを得ない"],
    ],
    [
      "Pola ini menyatakan bahwa tidak ada pilihan lain: 'terpaksa'. Nada formal dan tertulis.",
      "Perhatikan bentuk khusus する: せざるを得ない, bukan しざる.",
    ],
    [
      ["バスがないので、歩かざるを得ません。", "バスがないので、あるかざるをえません。", "Karena tidak ada bus, saya terpaksa berjalan."],
      ["上司の命令なので、やらざるを得ない。", "じょうしのめいれいなので、やらざるをえない。", "Karena perintah atasan, mau tidak mau harus dilakukan."],
    ],
    [
      q("g-zaru-q1", "N2", "Bentuk yang benar dari する:", ["せざるを得ない", "しざるを得ない", "するざるを得ない", "さざるを得ない"], 0, "する memiliki bentuk khusus せざるを得ない."),
    ],
    { notes: "Bentuk ざるを得ません dipakai dalam kalimat sopan; bentuk kamus ざるを得ない untuk tulisan." },
  ),
  g(
    "g-ni-chigai-nai",
    "N2",
    "bentuk biasa + に違いない",
    "pasti ...",
    [["Pola", "plain form + に違いない"]],
    [
      "に違いない menyatakan keyakinan kuat berdasarkan bukti: 'pasti'. Lebih kuat daripada でしょう dan かもしれません.",
      "Dalam percakapan, きっと〜と思う sering dipakai sebagai padanan yang lebih ringan.",
    ],
    [
      ["彼はもう家に帰ったに違いない。", "かれはもういえにかえったにちがいない。", "Dia pasti sudah pulang ke rumah."],
      ["この方法が一番いいに違いありません。", "このほうほうがいちばんいいにちがいありません。", "Metode ini pasti yang terbaik."],
    ],
    [
      q("g-chigainai-q1", "N2", "Lengkapi dengan keyakinan kuat: 電気がついているから、彼はまだ起きている ___ 。", ["に違いない", "かもしれない", "らしい", "そうだ"], 0, "Keyakinan kuat berdasarkan bukti memakai に違いない."),
    ],
  ),
  g(
    "g-to-wa-ie",
    "N1",
    "klausa + とはいえ",
    "meskipun begitu / walaupun demikian",
    [["Pola", "klausa + とはいえ"]],
    [
      "とはいえ mengakui suatu fakta lalu menambahkan pembatasan: 'meskipun begitu'. Nada formal, sering dalam tulisan dan pidato.",
      "Berbeda dengan しかし yang netral, とはいえ secara eksplisit mengakui klausa sebelumnya.",
    ],
    [
      ["便利とはいえ、使い方は難しい。", "べんりとはいえ、つかいかたはむずかしい。", "Meskipun praktis, cara memakainya sulit."],
      ["安いとはいえ、品質はいい。", "やすいとはいえ、ひんしつはいい。", "Meskipun murah, kualitasnya bagus."],
    ],
    [
      q("g-towaie-q1", "N1", "Lengkapi: 日本に住んでいる ___ 、日本語が完璧なわけではない。", ["とはいえ", "ために", "ように", "そうに"], 0, "Konsesi formal memakai とはいえ."),
    ],
  ),
  g(
    "g-wo-megutte",
    "N1",
    "N + をめぐって",
    "seputar / mengenai ... (perdebatan)",
    [["Pola", "N + をめぐって + verba komunikasi/konflik"]],
    [
      "をめぐって dipakai ketika beberapa pihak berbeda pendapat atau berkonflik tentang suatu topik: 'seputar'.",
      "Sering muncul dengan verba seperti 議論する, 争う, 意見が分かれる. Untuk topik netral, について lebih aman.",
    ],
    [
      ["その問題をめぐって、議論が続いている。", "そのもんだいをめぐって、ぎろんがつづいている。", "Diskusi seputar masalah itu masih berlanjut."],
      ["新しい法律をめぐって、意見が分かれた。", "あたらしいほうりつをめぐって、いけんがわかれた。", "Pendapat terbelah seputar undang-undang baru."],
    ],
    [
      q("g-womegutte-q1", "N1", "Lengkapi (situasi konflik): 新しい計画 ___ 、住民の意見が対立している。", ["をめぐって", "について", "によって", "に対して"], 0, "Konflik/persetujuan memakai をめぐって."),
    ],
  )
];

export const GRAMMAR_BY_ID = new Map(GRAMMAR.map((point) => [point.id, point]));
