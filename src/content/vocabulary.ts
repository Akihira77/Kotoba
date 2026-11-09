import type { JLPTLevel, PartOfSpeech, VocabTopic, VocabWord } from "@/lib/types";

type ExRow = [jp: string, reading: string, meaning: string];

function v(
  id: string,
  japanese: string,
  kana: string,
  romaji: string,
  meaning: string,
  level: JLPTLevel,
  pos: PartOfSpeech,
  topic: VocabTopic,
  examples: ExRow[] = [],
  notes?: string,
): VocabWord {
  return {
    id,
    japanese,
    kana,
    romaji,
    meaning,
    level,
    pos,
    topic,
    examples: examples.map(([jp, reading, meaning], index) => ({
      jp,
      reading,
      meaning,
      id: id + "-ex" + (index + 1),
    })),
    notes,
  };
}

export const VOCABULARY: VocabWord[] = [
  // Salam
  v("v-ohayou", "おはようございます", "おはようございます", "ohayou gozaimasu", "selamat pagi (sopan)", "N5", "ekspresi", "salam", [
    ["おはようございます、田中先生。", "おはようございます、たなかせんせい。", "Selamat pagi, Guru Tanaka."],
  ], "Dipakai pagi hari, biasanya sampai sekitar pukul 11. Versi kasual: おはよう."),
  v("v-konnichiwa", "こんにちは", "こんにちは", "konnichiwa", "selamat siang / halo", "N5", "ekspresi", "salam", [
    ["こんにちは、いい天気ですね。", "こんにちは、いいてんきですね。", "Halo, cuacanya bagus ya."],
  ], "Partikel は di sini dibaca 'wa'. Dipakai siang sampai sore."),
  v("v-konbanwa", "こんばんは", "こんばんは", "konbanwa", "selamat malam (sapaan)", "N5", "ekspresi", "salam", [
    ["こんばんは、田中さん。", "こんばんは、たなかさん。", "Selamat malam, Tanaka-san."],
  ], "Juga ditulis は tetapi dibaca 'wa'."),
  v("v-oyasuminasai", "おやすみなさい", "おやすみなさい", "oyasuminasai", "selamat tidur", "N5", "ekspresi", "salam", [
    ["もう寝ます。おやすみなさい。", "もうねます。おやすみなさい。", "Saya tidur dulu. Selamat tidur."],
  ]),
  v("v-arigatou", "ありがとうございます", "ありがとうございます", "arigatou gozaimasu", "terima kasih (sopan)", "N5", "ekspresi", "salam", [
    ["手伝ってくれて、ありがとうございます。", "てつだってくれて、ありがとうございます。", "Terima kasih sudah membantu."],
  ], "Versi kasual: ありがとう. Untuk perbuatan yang sudah selesai bisa ありがとうございました."),
  v("v-sumimasen", "すみません", "すみません", "sumimasen", "permisi / maaf / terima kasih", "N5", "ekspresi", "salam", [
    ["すみません、駅はどこですか。", "すみません、えきはどこですか。", "Permisi, di mana stasiun?"],
  ], "Bisa berarti 'permisi', 'maaf', atau 'terima kasih' saat merepotkan orang lain."),
  v("v-hajimemashite", "はじめまして", "はじめまして", "hajimemashite", "salam kenal", "N5", "ekspresi", "salam", [
    ["はじめまして。私はアニサです。", "はじめまして。わたしはアニサです。", "Salam kenal. Saya Anisa."],
  ], "Dipakai saat pertama kali bertemu. Biasanya dilanjutkan どうぞよろしくお願いします."),
  v("v-itadakimasu", "いただきます", "いただきます", "itadakimasu", "saya mulai makan (ucapan sebelum makan)", "N5", "ekspresi", "salam", [
    ["食事の前に「いただきます」と言います。", "しょくじのまえに「いただきます」といいます。", "Sebelum makan, orang Jepang mengucapkan 'itadakimasu'."],
  ], "Ucapan syukur sebelum makan; tidak diterjemahkan harfiah sebagai 'saya menerima'."),
  v("v-gochisousama", "ごちそうさまでした", "ごちそうさまでした", "gochisousama deshita", "terima kasih atas hidangannya (setelah makan)", "N5", "ekspresi", "salam", [
    ["ごちそうさまでした。とても美味しかったです。", "ごちそうさまでした。とてもおいしかったです。", "Terima kasih atas makanannya. Sangat lezat."],
  ]),
  v("v-ittekimasu", "いってきます", "いってきます", "ittekimasu", "saya berangkat dulu", "N5", "ekspresi", "salam", [
    ["行ってきます。", "いってきます。", "Saya berangkat dulu."],
  ], "Diucapkan saat meninggalkan rumah; jawabannya いってらっしゃい."),
  v("v-okaerinasai", "おかえりなさい", "おかえりなさい", "okaerinasai", "selamat datang kembali", "N5", "ekspresi", "salam", [
    ["おかえりなさい。疲れたでしょう。", "おかえりなさい。つかれたでしょう。", "Selamat datang kembali. Kamu pasti lelah."],
  ]),

  // Perkenalan
  v("v-watashi", "私", "わたし", "watashi", "saya", "N5", "nomina", "perkenalan", [
    ["私はインドネシアから来ました。", "わたしはインドネシアからきました。", "Saya datang dari Indonesia."],
  ], "Bentuk kasual: 僕 (boku, biasanya laki-laki) atau あたし (perempuan, kasual)."),
  v("v-anata", "あなた", "あなた", "anata", "Anda / kamu", "N5", "nomina", "perkenalan", [
    ["あなたの名前は何ですか。", "あなたのなまえはなんですか。", "Siapa namamu?"],
  ], "Dalam bahasa Jepang sopan, あなた jarang dipakai; gunakan nama + さん atau sebutan seperti 先生."),
  v("v-namae", "名前", "なまえ", "namae", "nama", "N5", "nomina", "perkenalan", [
    ["私の名前はリナです。", "わたしのなまえはリナです。", "Nama saya Rina."],
  ]),
  v("v-gakusei", "学生", "がくせい", "gakusei", "siswa / mahasiswa", "N5", "nomina", "perkenalan", [
    ["私は日本語を勉強する学生です。", "わたしはにほんごをべんきょうするがくせいです。", "Saya mahasiswa yang belajar bahasa Jepang."],
  ]),
  v("v-sensei", "先生", "せんせい", "sensei", "guru / dosen", "N5", "nomina", "perkenalan", [
    ["田中先生は日本語の先生です。", "たなかせんせいはにほんごのせんせいです。", "Guru Tanaka adalah guru bahasa Jepang."],
  ]),
  v("v-tomodachi", "友達", "ともだち", "tomodachi", "teman", "N5", "nomina", "perkenalan", [
    ["友達と一緒に映画を見ます。", "ともだちといっしょにえいがをみます。", "Saya menonton film bersama teman."],
  ]),
  v("v-nihonjin", "日本人", "にほんじん", "nihonjin", "orang Jepang", "N5", "nomina", "perkenalan", [
    ["私の友達は日本人です。", "わたしのともだちはにほんじんです。", "Teman saya orang Jepang."],
  ]),
  v("v-indonesiajin", "インドネシア人", "インドネシアじん", "indoneshiajin", "orang Indonesia", "N5", "nomina", "perkenalan", [
    ["彼女はインドネシア人です。", "かのじょはインドネシアじんです。", "Dia (perempuan) orang Indonesia."],
  ]),
  v("v-shumi", "趣味", "しゅみ", "shumi", "hobi", "N5", "nomina", "perkenalan", [
    ["私の趣味は写真を撮ることです。", "わたしのしゅみはしゃしんをとることです。", "Hobi saya memotret."],
  ]),
  v("v-shusshin", "出身", "しゅっしん", "shusshin", "asal / daerah asal", "N5", "nomina", "perkenalan", [
    ["ご出身はどちらですか。", "ごしゅっしんはどちらですか。", "Dari mana asal Anda?"],
  ]),
  v("v-ryuugakusei", "留学生", "りゅうがくせい", "ryuugakusei", "mahasiswa asing", "N5", "nomina", "perkenalan", [
    ["私は東京の大学に通う留学生です。", "わたしはとうきょうのだいがくにかようりゅうがくせいです。", "Saya mahasiswa asing yang berkuliah di universitas Tokyo."],
  ]),

  // Angka
  v("v-ichi", "一", "いち", "ichi", "satu", "N5", "bilangan", "angka", [
    ["一から十まで数えます。", "いちからじゅうまでかぞえます。", "Menghitung dari satu sampai sepuluh."],
  ]),
  v("v-ni", "二", "に", "ni", "dua", "N5", "bilangan", "angka", [
    ["二時に会いましょう。", "にじにあいましょう。", "Ayo bertemu pukul dua."],
  ]),
  v("v-san", "三", "さん", "san", "tiga", "N5", "bilangan", "angka", [
    ["三月はまだ寒いです。", "さんがつはまださむいです。", "Bulan Maret masih dingin."],
  ], "Jangan tertukar dengan akhiran さん pada nama orang."),
  v("v-yon", "四", "よん", "yon", "empat", "N5", "bilangan", "angka", [
    ["四人で行きます。", "よにんでいきます。", "Kami pergi berempat."],
  ], "Untuk angka 4 sering dipakai よん; し juga muncul dalam kata seperti 四月 (しがつ) dan 四国 (しこく)."),
  v("v-go", "五", "ご", "go", "lima", "N5", "bilangan", "angka", [
    ["五分待ってください。", "ごふんまってください。", "Tolong tunggu lima menit."],
  ]),
  v("v-roku", "六", "ろく", "roku", "enam", "N5", "bilangan", "angka", [
    ["六時に起きます。", "ろくじにおきます。", "Saya bangun pukul enam."],
  ]),
  v("v-nana", "七", "なな", "nana", "tujuh", "N5", "bilangan", "angka", [
    ["かごに果物が七つあります。", "かごにくだものがななつあります。", "Di keranjang ada tujuh buah."],
  ], "Dibaca なな atau しち."),
  v("v-hachi", "八", "はち", "hachi", "delapan", "N5", "bilangan", "angka", [
    ["八月は暑いです。", "はちがつはあついです。", "Bulan Agustus panas."],
  ]),
  v("v-kyuu", "九", "きゅう", "kyuu", "sembilan", "N5", "bilangan", "angka", [
    ["九月に日本へ行きます。", "くがつににほんへいきます。", "Saya pergi ke Jepang pada bulan September."],
  ], "Dalam 九月 dibaca く; angka umumnya きゅう."),
  v("v-juu", "十", "じゅう", "juu", "sepuluh", "N5", "bilangan", "angka", [
    ["十分間休みましょう。", "じゅっぷんかんやすみましょう。", "Mari beristirahat sepuluh menit."],
  ]),
  v("v-hyaku", "百", "ひゃく", "hyaku", "seratus", "N5", "bilangan", "angka", [
    ["百円で買えます。", "ひゃくえんでかえます。", "Bisa dibeli dengan seratus yen."],
  ]),
  v("v-sen", "千", "せん", "sen", "seribu", "N5", "bilangan", "angka", [
    ["図書館には千冊以上の本があります。", "としょかんにはせんさついじょうのほんがあります。", "Di perpustakaan ada lebih dari seribu buku."],
  ]),

  // Waktu
  v("v-ima", "今", "いま", "ima", "sekarang", "N5", "nomina", "waktu", [
    ["今、何時ですか。", "いま、なんじですか。", "Sekarang jam berapa?"],
  ]),
  v("v-kyou", "今日", "きょう", "kyou", "hari ini", "N5", "nomina", "waktu", [
    ["今日はいい天気ですね。", "きょうはいいてんきですね。", "Hari ini cuacanya bagus ya."],
  ]),
  v("v-ashita", "明日", "あした", "ashita", "besok", "N5", "nomina", "waktu", [
    ["明日、学校へ行きます。", "あした、がっこうへいきます。", "Besok saya pergi ke sekolah."],
  ]),
  v("v-kinou", "昨日", "きのう", "kinou", "kemarin", "N5", "nomina", "waktu", [
    ["昨日は雨でした。", "きのうはあめでした。", "Kemarin hujan."],
  ]),
  v("v-asa", "朝", "あさ", "asa", "pagi", "N5", "nomina", "waktu", [
    ["朝ご飯を食べます。", "あさごはんをたべます。", "Saya makan sarapan."],
  ]),
  v("v-hiru", "昼", "ひる", "hiru", "siang", "N5", "nomina", "waktu", [
    ["昼ご飯は食堂で食べます。", "ひるごはんはしょくどうでたべます。", "Makan siang di kantin."],
  ]),
  v("v-yoru", "夜", "よる", "yoru", "malam", "N5", "nomina", "waktu", [
    ["夜は静かです。", "よるはしずかです。", "Malam itu tenang."],
  ]),
  v("v-jikan", "時間", "じかん", "jikan", "waktu / jam", "N5", "nomina", "waktu", [
    ["時間がありません。", "じかんがありません。", "Tidak ada waktu."],
  ]),
  v("v-fun", "分", "ふん", "fun", "menit", "N5", "klasifikator", "waktu", [
    ["十分待ってください。", "じゅっぷんまってください。", "Tolong tunggu sepuluh menit."],
  ], "Bacaannya berubah: いっぷん, にふん, さんぷん, よんぷん, ごふん, ろっぷん, ななふん, はっぷん, きゅうふん, じゅっぷん."),
  v("v-youbi", "曜日", "ようび", "youbi", "hari dalam seminggu", "N5", "nomina", "waktu", [
    ["今日は何曜日ですか。", "きょうはなんようびですか。", "Hari ini hari apa?"],
  ]),
  v("v-shuumatsu", "週末", "しゅうまつ", "shuumatsu", "akhir pekan", "N5", "nomina", "waktu", [
    ["週末は友達と遊びます。", "しゅうまつはともだちとあそびます。", "Akhir pekan saya bermain dengan teman."],
  ]),
  v("v-rainen", "来年", "らいねん", "rainen", "tahun depan", "N5", "nomina", "waktu", [
    ["来年、日本へ留学します。", "らいねん、にほんへりゅうがくします。", "Tahun depan saya belajar ke Jepang."],
  ]),

  // Keluarga
  v("v-kazoku", "家族", "かぞく", "kazoku", "keluarga", "N5", "nomina", "keluarga", [
    ["家族は四人です。", "かぞくはよにんです。", "Keluarga saya empat orang."],
  ]),
  v("v-chichi", "父", "ちち", "chichi", "ayah (keluarga sendiri)", "N5", "nomina", "keluarga", [
    ["父はインドネシアにいます。", "ちちはインドネシアにいます。", "Ayah saya ada di Indonesia."],
  ], "Menyebut ayah orang lain: お父さん."),
  v("v-haha", "母", "はは", "haha", "ibu (keluarga sendiri)", "N5", "nomina", "keluarga", [
    ["母は料理が上手です。", "はははりょうりがじょうずです。", "Ibu saya pandai memasak."],
  ], "Menyebut ibu orang lain: お母さん."),
  v("v-ani", "兄", "あに", "ani", "kakak laki-laki (sendiri)", "N5", "nomina", "keluarga", [
    ["兄は医者です。", "あにはいしゃです。", "Kakak laki-laki saya seorang dokter."],
  ], "Kakak orang lain: お兄さん."),
  v("v-ane", "姉", "あね", "ane", "kakak perempuan (sendiri)", "N5", "nomina", "keluarga", [
    ["姉は東京に住んでいます。", "あねはとうきょうにすんでいます。", "Kakak perempuan saya tinggal di Tokyo."],
  ]),
  v("v-otouto", "弟", "おとうと", "otouto", "adik laki-laki", "N5", "nomina", "keluarga", [
    ["弟は高校生です。", "おとうとはこうこうせいです。", "Adik laki-laki saya siswa SMA."],
  ]),
  v("v-imouto", "妹", "いもうと", "imouto", "adik perempuan", "N5", "nomina", "keluarga", [
    ["妹はピアノを習っています。", "いもうとはピアノをならっています。", "Adik perempuan saya sedang belajar piano."],
  ]),
  v("v-kodomo", "子供", "こども", "kodomo", "anak", "N5", "nomina", "keluarga", [
    ["子供が公園で遊んでいます。", "こどもがこうえんであそんでいます。", "Anak-anak sedang bermain di taman."],
  ]),
  v("v-otto", "夫", "おっと", "otto", "suami", "N4", "nomina", "keluarga", [
    ["夫と一緒に暮らしています。", "おっとといっしょにくらしています。", "Saya tinggal bersama suami."],
  ]),
  v("v-tsuma", "妻", "つま", "tsuma", "istri", "N4", "nomina", "keluarga", [
    ["妻は先生です。", "つまはせんせいです。", "Istri saya guru."],
  ]),

  // Makanan
  v("v-gohan", "ご飯", "ごはん", "gohan", "nasi / makanan", "N5", "nomina", "makanan", [
    ["ご飯を食べましょう。", "ごはんをたべましょう。", "Ayo makan nasi."],
  ]),
  v("v-pan", "パン", "パン", "pan", "roti", "N5", "nomina", "makanan", [
    ["朝はパンを食べます。", "あさはパンをたべます。", "Pagi saya makan roti."],
  ]),
  v("v-sakana", "魚", "さかな", "sakana", "ikan", "N5", "nomina", "makanan", [
    ["私は魚が好きです。", "わたしはさかながすきです。", "Saya suka ikan."],
  ]),
  v("v-niku", "肉", "にく", "niku", "daging", "N5", "nomina", "makanan", [
    ["この肉は柔らかいです。", "このにくはやわらかいです。", "Daging ini empuk."],
  ]),
  v("v-yasai", "野菜", "やさい", "yasai", "sayur", "N5", "nomina", "makanan", [
    ["毎日野菜を食べます。", "まいにちやさいをたべます。", "Saya makan sayur setiap hari."],
  ]),
  v("v-kudamono", "果物", "くだもの", "kudamono", "buah", "N5", "nomina", "makanan", [
    ["果物は体にいいです。", "くだものはからだにいいです。", "Buah baik untuk tubuh."],
  ]),
  v("v-tamago", "卵", "たまご", "tamago", "telur", "N5", "nomina", "makanan", [
    ["卵を二つ買いました。", "たまごをふたつかいました。", "Saya membeli dua telur."],
  ]),
  v("v-ramen", "ラーメン", "ラーメン", "raamen", "ramen", "N5", "nomina", "makanan", [
    ["ラーメンは人気のある料理です。", "ラーメンはにんきのあるりょうりです。", "Ramen adalah masakan yang populer."],
  ]),
  v("v-sushi", "寿司", "すし", "sushi", "sushi", "N5", "nomina", "makanan", [
    ["寿司を食べたことがありますか。", "すしをたべたことがありますか。", "Apakah kamu pernah makan sushi?"],
  ]),
  v("v-tabemono", "食べ物", "たべもの", "tabemono", "makanan", "N5", "nomina", "makanan", [
    ["好きな食べ物は何ですか。", "すきなたべものはなんですか。", "Apa makanan favoritmu?"],
  ]),

  // Minuman
  v("v-ocha", "お茶", "おちゃ", "ocha", "teh", "N5", "nomina", "minuman", [
    ["お茶を一杯ください。", "おちゃをいっぱいください。", "Tolong satu cangkir teh."],
  ]),
  v("v-mizu", "水", "みず", "mizu", "air", "N5", "nomina", "minuman", [
    ["水を飲みます。", "みずをのみます。", "Saya minum air."],
  ]),
  v("v-koohii", "コーヒー", "コーヒー", "koohii", "kopi", "N5", "nomina", "minuman", [
    ["朝、コーヒーを飲みます。", "あさ、コーヒーをのみます。", "Pagi saya minum kopi."],
  ]),
  v("v-gyuunyuu", "牛乳", "ぎゅうにゅう", "gyuunyuu", "susu sapi", "N5", "nomina", "minuman", [
    ["牛乳は冷たいです。", "ぎゅうにゅうはつめたいです。", "Susunya dingin."],
  ]),
  v("v-juusu", "ジュース", "ジュース", "juusu", "jus", "N5", "nomina", "minuman", [
    ["オレンジジュースが好きです。", "オレンジジュースがすきです。", "Saya suka jus jeruk."],
  ]),
  v("v-osake", "お酒", "おさけ", "osake", "minuman beralkohol / sake", "N5", "nomina", "minuman", [
    ["お酒は二十歳から飲めます。", "おさけははたちからのめます。", "Minuman beralkohol boleh diminum mulai usia 20 tahun."],
  ], "Di Jepang usia legal minum alkohol adalah 20 tahun."),

  // Tempat
  v("v-ie", "家", "いえ", "ie", "rumah", "N5", "nomina", "tempat", [
    ["家に帰ります。", "いえにかえります。", "Saya pulang ke rumah."],
  ]),
  v("v-gakkou", "学校", "がっこう", "gakkou", "sekolah", "N5", "nomina", "tempat", [
    ["学校は駅の近くです。", "がっこうはえきのちかくです。", "Sekolahnya dekat stasiun."],
  ]),
  v("v-kaisha", "会社", "かいしゃ", "kaisha", "perusahaan / kantor", "N5", "nomina", "tempat", [
    ["父は会社で働いています。", "ちちはかいしゃではたらいています。", "Ayah saya bekerja di perusahaan."],
  ]),
  v("v-eki", "駅", "えき", "eki", "stasiun", "N5", "nomina", "tempat", [
    ["駅で待ち合わせましょう。", "えきでまちあわせましょう。", "Ayo bertemu di stasiun."],
  ]),
  v("v-byouin", "病院", "びょういん", "byouin", "rumah sakit", "N5", "nomina", "tempat", [
    ["病院へ行きます。", "びょういんへいきます。", "Saya pergi ke rumah sakit."],
  ]),
  v("v-mise", "店", "みせ", "mise", "toko", "N5", "nomina", "tempat", [
    ["あの店は美味しいです。", "あのみせはおいしいです。", "Toko itu makanannya enak."],
  ]),
  v("v-toshokan", "図書館", "としょかん", "toshokan", "perpustakaan", "N5", "nomina", "tempat", [
    ["図書館で勉強します。", "としょかんでべんきょうします。", "Saya belajar di perpustakaan."],
  ]),
  v("v-kouen", "公園", "こうえん", "kouen", "taman", "N5", "nomina", "tempat", [
    ["公園を散歩します。", "こうえんをさんぽします。", "Saya berjalan-jalan di taman."],
  ]),
  v("v-nihon", "日本", "にほん", "nihon", "Jepang", "N5", "nomina", "tempat", [
    ["いつか日本へ行きたいです。", "いつかにほんへいきたいです。", "Suatu hari saya ingin pergi ke Jepang."],
  ]),
  v("v-indoneshia", "インドネシア", "インドネシア", "indoneshia", "Indonesia", "N5", "nomina", "tempat", [
    ["インドネシアは暑い国です。", "インドネシアはあついくにです。", "Indonesia adalah negara yang panas."],
  ]),

  // Transportasi
  v("v-densha", "電車", "でんしゃ", "densha", "kereta", "N5", "nomina", "transportasi", [
    ["電車で東京へ行きます。", "でんしゃでとうきょうへいきます。", "Saya pergi ke Tokyo dengan kereta."],
  ]),
  v("v-kuruma", "車", "くるま", "kuruma", "mobil", "N5", "nomina", "transportasi", [
    ["車を運転します。", "くるまをうんてんします。", "Saya mengemudi mobil."],
  ]),
  v("v-jitensha", "自転車", "じてんしゃ", "jitensha", "sepeda", "N5", "nomina", "transportasi", [
    ["自転車で学校に行きます。", "じてんしゃでがっこうにいきます。", "Saya pergi ke sekolah naik sepeda."],
  ]),
  v("v-basu", "バス", "バス", "basu", "bus", "N5", "nomina", "transportasi", [
    ["バスは何時に来ますか。", "バスはなんじにきますか。", "Bus datang jam berapa?"],
  ]),
  v("v-hikouki", "飛行機", "ひこうき", "hikouki", "pesawat terbang", "N5", "nomina", "transportasi", [
    ["飛行機で日本へ飛びます。", "ひこうきでにほんへとびます。", "Terbang ke Jepang dengan pesawat."],
  ]),
  v("v-michi", "道", "みち", "michi", "jalan", "N5", "nomina", "transportasi", [
    ["この道をまっすぐ行ってください。", "このみちをまっすぐいってください。", "Tolong jalan lurus di jalan ini."],
  ]),

  // Tubuh
  v("v-atama", "頭", "あたま", "atama", "kepala", "N5", "nomina", "tubuh", [
    ["頭が痛いです。", "あたまがいたいです。", "Kepala saya sakit."],
  ]),
  v("v-me", "目", "め", "me", "mata", "N5", "nomina", "tubuh", [
    ["目が大きいです。", "めがおおきいです。", "Matanya besar."],
  ]),
  v("v-mimi", "耳", "みみ", "mimi", "telinga", "N5", "nomina", "tubuh", [
    ["耳が痛いです。", "みみがいたいです。", "Telinga saya sakit."],
  ]),
  v("v-kuchi", "口", "くち", "kuchi", "mulut", "N5", "nomina", "tubuh", [
    ["口を開けてください。", "くちをあけてください。", "Tolong buka mulut."],
  ]),
  v("v-te", "手", "て", "te", "tangan", "N5", "nomina", "tubuh", [
    ["手を洗ってください。", "てをあらってください。", "Tolong cuci tangan."],
  ]),
  v("v-ashi", "足", "あし", "ashi", "kaki", "N5", "nomina", "tubuh", [
    ["足が速いです。", "あしがはやいです。", "Kakinya cepat."],
  ]),
  v("v-karada", "体", "からだ", "karada", "tubuh", "N5", "nomina", "tubuh", [
    ["体に気をつけてください。", "からだにきをつけてください。", "Tolong jaga kesehatan tubuh."],
  ]),
  v("v-kokoro", "心", "こころ", "kokoro", "hati / perasaan", "N4", "nomina", "tubuh", [
    ["心が温かくなりました。", "こころがあたたかくなりました。", "Hati saya menjadi hangat."],
  ]),

  // Warna
  v("v-aka", "赤", "あか", "aka", "merah", "N5", "nomina", "warna", [
    ["赤が好きです。", "あかがすきです。", "Saya suka merah."],
  ]),
  v("v-ao", "青", "あお", "ao", "biru", "N5", "nomina", "warna", [
    ["空が青いです。", "そらがあおいです。", "Langitnya biru."],
  ]),
  v("v-shiro", "白", "しろ", "shiro", "putih", "N5", "nomina", "warna", [
    ["雪は白いです。", "ゆきはしろいです。", "Salju itu putih."],
  ]),
  v("v-kuro", "黒", "くろ", "kuro", "hitam", "N5", "nomina", "warna", [
    ["黒い猫がいます。", "くろいねこがいます。", "Ada kucing hitam."],
  ]),
  v("v-kiiro", "黄色", "きいろ", "kiiro", "kuning", "N5", "nomina", "warna", [
    ["黄色の花が咲いています。", "きいろのはながさいています。", "Bunga kuning sedang bermekaran."],
  ]),
  v("v-midori", "緑", "みどり", "midori", "hijau", "N5", "nomina", "warna", [
    ["緑がきれいです。", "みどりがきれいです。", "Hijaunya indah."],
  ]),
  v("v-chairo", "茶色", "ちゃいろ", "chairo", "cokelat (warna)", "N5", "nomina", "warna", [
    ["茶色の靴を買いました。", "ちゃいろのくつをかいました。", "Saya membeli sepatu cokelat."],
  ]),
  v("v-iro", "色", "いろ", "iro", "warna", "N5", "nomina", "warna", [
    ["好きな色は何ですか。", "すきないろはなんですか。", "Apa warna favoritmu?"],
  ]),

  // Cuaca
  v("v-tenki", "天気", "てんき", "tenki", "cuaca", "N5", "nomina", "cuaca", [
    ["今日はいい天気ですね。", "きょうはいいてんきですね。", "Hari ini cuacanya bagus ya."],
  ]),
  v("v-ame", "雨", "あめ", "ame", "hujan", "N5", "nomina", "cuaca", [
    ["雨が降っています。", "あめがふっています。", "Sedang turun hujan."],
  ]),
  v("v-yuki", "雪", "ゆき", "yuki", "salju", "N5", "nomina", "cuaca", [
    ["雪が降っています。", "ゆきがふっています。", "Sedang turun salju."],
  ]),
  v("v-hare", "晴れ", "はれ", "hare", "cerah", "N5", "nomina", "cuaca", [
    ["明日は晴れです。", "あしたははれです。", "Besok cuacanya cerah."],
  ]),
  v("v-kumori", "曇り", "くもり", "kumori", "berawan", "N5", "nomina", "cuaca", [
    ["今日は曇りです。", "きょうはくもりです。", "Hari ini berawan."],
  ]),
  v("v-kaze", "風", "かぜ", "kaze", "angin", "N5", "nomina", "cuaca", [
    ["風が強いです。", "かぜがつよいです。", "Anginnya kencang."],
  ], "Jangan tertukar dengan 風邪 (kaze) yang berarti 'pilek' (common cold)."),

  // Alam
  v("v-yama", "山", "やま", "yama", "gunung", "N5", "nomina", "alam", [
    ["富士山は日本で一番高い山です。", "ふじさんはにほんでいちばんたかいやまです。", "Gunung Fuji adalah gunung tertinggi di Jepang."],
  ]),
  v("v-umi", "海", "うみ", "umi", "laut", "N5", "nomina", "alam", [
    ["海で泳ぎたいです。", "うみでおよぎたいです。", "Saya ingin berenang di laut."],
  ]),
  v("v-kawa", "川", "かわ", "kawa", "sungai", "N5", "nomina", "alam", [
    ["川の水はきれいです。", "かわのみずはきれいです。", "Air sungainya bersih."],
  ]),
  v("v-sora", "空", "そら", "sora", "langit", "N5", "nomina", "alam", [
    ["空が青いです。", "そらがあおいです。", "Langitnya biru."],
  ]),
  v("v-mori", "森", "もり", "mori", "hutan", "N5", "nomina", "alam", [
    ["森の中を歩きました。", "もりのなかをあるきました。", "Saya berjalan di dalam hutan."],
  ]),
  v("v-hana", "花", "はな", "hana", "bunga", "N5", "nomina", "alam", [
    ["花が咲きました。", "はながさきました。", "Bunga bermekaran."],
  ]),
  v("v-ki", "木", "き", "ki", "pohon / kayu", "N5", "nomina", "alam", [
    ["木の下で休みましょう。", "きのしたでやすみましょう。", "Ayo beristirahat di bawah pohon."],
  ]),
  v("v-tsuki", "月", "つき", "tsuki", "bulan", "N5", "nomina", "alam", [
    ["今夜は月がきれいです。", "こんやはつきがきれいです。", "Malam ini bulannya indah."],
  ]),

  // Sekolah
  v("v-benkyou", "勉強", "べんきょう", "benkyou", "belajar", "N5", "nomina", "sekolah", [
    ["毎日二時間勉強します。", "まいにちにじかんべんきょうします。", "Saya belajar dua jam setiap hari."],
  ]),
  v("v-shukudai", "宿題", "しゅくだい", "shukudai", "pekerjaan rumah (PR)", "N5", "nomina", "sekolah", [
    ["宿題が終わりました。", "しゅくだいがおわりました。", "PR-nya sudah selesai."],
  ]),
  v("v-kyoushitsu", "教室", "きょうしつ", "kyoushitsu", "ruang kelas", "N5", "nomina", "sekolah", [
    ["教室は三階にあります。", "きょうしつはさんがいにあります。", "Ruang kelas ada di lantai tiga."],
  ]),
  v("v-tesuto", "テスト", "テスト", "tesuto", "ujian / tes", "N5", "nomina", "sekolah", [
    ["明日テストがあります。", "あしたテストがあります。", "Besok ada ujian."],
  ]),
  v("v-shitsumon", "質問", "しつもん", "shitsumon", "pertanyaan", "N5", "nomina", "sekolah", [
    ["質問がありますか。", "しつもんがありますか。", "Apakah ada pertanyaan?"],
  ]),
  v("v-kotoba", "言葉", "ことば", "kotoba", "kata / bahasa", "N5", "nomina", "sekolah", [
    ["この言葉の意味が分かりません。", "このことばのいみがわかりません。", "Saya tidak mengerti arti kata ini."],
  ]),
  v("v-jisho", "辞書", "じしょ", "jisho", "kamus", "N5", "nomina", "sekolah", [
    ["辞書で調べます。", "じしょでしらべます。", "Saya mencari di kamus."],
  ]),
  v("v-hon", "本", "ほん", "hon", "buku", "N5", "nomina", "sekolah", [
    ["本を読みます。", "ほんをよみます。", "Saya membaca buku."],
  ]),

  // Pekerjaan
  v("v-shigoto", "仕事", "しごと", "shigoto", "pekerjaan", "N5", "nomina", "pekerjaan", [
    ["仕事は九時に始まります。", "しごとはくじにはじまります。", "Pekerjaan dimulai pukul sembilan."],
  ]),
  v("v-isha", "医者", "いしゃ", "isha", "dokter", "N5", "nomina", "pekerjaan", [
    ["兄は医者です。", "あにはいしゃです。", "Kakak laki-laki saya dokter."],
  ]),
  v("v-kaishain", "会社員", "かいしゃいん", "kaishain", "pegawai perusahaan", "N5", "nomina", "pekerjaan", [
    ["父は会社員です。", "ちちはかいしゃいんです。", "Ayah saya pegawai perusahaan."],
  ]),
  v("v-kyoushi", "教師", "きょうし", "kyoushi", "guru (profesi)", "N5", "nomina", "pekerjaan", [
    ["母は教師です。", "はははきょうしです。", "Ibu saya guru."],
  ]),
  v("v-enjinia", "エンジニア", "エンジニア", "enjinia", "insinyur", "N5", "nomina", "pekerjaan", [
    ["私はエンジニアです。", "わたしはエンジニアです。", "Saya seorang insinyur."],
  ]),
  v("v-keisatsukan", "警察官", "けいさつかん", "keisatsukan", "polisi", "N4", "nomina", "pekerjaan", [
    ["警察官が道を案内してくれました。", "けいさつかんがみちをあんないしてくれました。", "Polisi menunjukkan jalannya kepada saya."],
  ]),
  v("v-kashu", "歌手", "かしゅ", "kashu", "penyanyi", "N4", "nomina", "pekerjaan", [
    ["彼女は歌手です。", "かのじょはかしゅです。", "Dia (perempuan) penyanyi."],
  ]),
  v("v-koumuin", "公務員", "こうむいん", "koumuin", "pegawai negeri", "N4", "nomina", "pekerjaan", [
    ["公務員として働いています。", "こうむいんとしてはたらいています。", "Saya bekerja sebagai pegawai negeri."],
  ]),

  // Kata kerja
  v("v-taberu", "食べる", "たべる", "taberu", "makan", "N5", "verba", "kata-kerja", [
    ["毎朝パンを食べます。", "まいあさパンをたべます。", "Setiap pagi saya makan roti."],
  ], "Verba ichidan (ru-verb): 食べます, 食べて, 食べた."),
  v("v-nomu", "飲む", "のむ", "nomu", "minum", "N5", "verba", "kata-kerja", [
    ["水を飲みます。", "みずをのみます。", "Saya minum air."],
  ]),
  v("v-iku", "行く", "いく", "iku", "pergi", "N5", "verba", "kata-kerja", [
    ["明日、東京へ行きます。", "あした、とうきょうへいきます。", "Besok saya pergi ke Tokyo."],
  ], "Bentuk て: 行って (itte) — pengecualian."),
  v("v-kuru", "来る", "くる", "kuru", "datang", "N5", "verba", "kata-kerja", [
    ["友達が家に来ます。", "ともだちがいえにきます。", "Teman datang ke rumah."],
  ], "Verba ireguler: 来ます (kimasu), 来て (kite)."),
  v("v-miru", "見る", "みる", "miru", "melihat / menonton", "N5", "verba", "kata-kerja", [
    ["テレビを見ます。", "テレビをみます。", "Saya menonton televisi."],
  ]),
  v("v-kiku", "聞く", "きく", "kiku", "mendengar / bertanya", "N5", "verba", "kata-kerja", [
    ["音楽を聞きます。", "おんがくをききます。", "Saya mendengarkan musik."],
  ], "Juga berarti 'bertanya': 先生に聞きます."),
  v("v-hanasu", "話す", "はなす", "hanasu", "berbicara", "N5", "verba", "kata-kerja", [
    ["日本語で話します。", "にほんごではなします。", "Saya berbicara dalam bahasa Jepang."],
  ]),
  v("v-yomu", "読む", "よむ", "yomu", "membaca", "N5", "verba", "kata-kerja", [
    ["本を読みます。", "ほんをよみます。", "Saya membaca buku."],
  ]),
  v("v-kaku", "書く", "かく", "kaku", "menulis", "N5", "verba", "kata-kerja", [
    ["手紙を書きます。", "てがみをかきます。", "Saya menulis surat."],
  ]),
  v("v-kau", "買う", "かう", "kau", "membeli", "N5", "verba", "kata-kerja", [
    ["野菜を買います。", "やさいをかいます。", "Saya membeli sayur."],
  ]),
  v("v-matsu", "待つ", "まつ", "matsu", "menunggu", "N5", "verba", "kata-kerja", [
    ["駅で待ちます。", "えきでまちます。", "Saya menunggu di stasiun."],
  ]),
  v("v-wakaru", "分かる", "わかる", "wakaru", "mengerti / paham", "N5", "verba", "kata-kerja", [
    ["日本語が少し分かります。", "にほんごがすこしわかります。", "Saya mengerti sedikit bahasa Jepang."],
  ], "Objek memakai が, bukan を: 日本語が分かる."),
  v("v-benkyou-suru", "勉強する", "べんきょうする", "benkyou suru", "belajar", "N5", "verba", "kata-kerja", [
    ["毎日日本語を勉強します。", "まいにちにほんごをべんきょうします。", "Saya belajar bahasa Jepang setiap hari."],
  ]),
  v("v-sumu", "住む", "すむ", "sumu", "tinggal / bermukim", "N5", "verba", "kata-kerja", [
    ["ジャカルタに住んでいます。", "ジャカルタにすんでいます。", "Saya tinggal di Jakarta."],
  ]),

  // Kata sifat
  v("v-ookii", "大きい", "おおきい", "ookii", "besar", "N5", "i-adjektiva", "kata-sifat", [
    ["大きい犬がいます。", "おおきいいぬがいます。", "Ada anjing besar."],
  ]),
  v("v-chiisai", "小さい", "ちいさい", "chiisai", "kecil", "N5", "i-adjektiva", "kata-sifat", [
    ["小さい部屋です。", "ちいさいへやです。", "Ini kamar kecil."],
  ]),
  v("v-atarashii", "新しい", "あたらしい", "atarashii", "baru", "N5", "i-adjektiva", "kata-sifat", [
    ["新しい車を買いました。", "あたらしいくるまをかいました。", "Saya membeli mobil baru."],
  ]),
  v("v-furui", "古い", "ふるい", "furui", "lama / tua (benda)", "N5", "i-adjektiva", "kata-sifat", [
    ["古い寺です。", "ふるいてらです。", "Ini kuil lama."],
  ]),
  v("v-takai", "高い", "たかい", "takai", "mahal / tinggi", "N5", "i-adjektiva", "kata-sifat", [
    ["この時計は高いです。", "このとけいはたかいです。", "Jam ini mahal."],
  ]),
  v("v-yasui", "安い", "やすい", "yasui", "murah", "N5", "i-adjektiva", "kata-sifat", [
    ["野菜が安いです。", "やさいがやすいです。", "Sayurnya murah."],
  ]),
  v("v-atsui", "暑い", "あつい", "atsui", "panas (cuaca)", "N5", "i-adjektiva", "kata-sifat", [
    ["インドネシアは暑いです。", "インドネシアはあついです。", "Indonesia panas."],
  ], "Untuk benda yang panas digunakan 熱い (atsui), dibaca sama tetapi kanji berbeda."),
  v("v-samui", "寒い", "さむい", "samui", "dingin (cuaca)", "N5", "i-adjektiva", "kata-sifat", [
    ["冬は寒いです。", "ふゆはさむいです。", "Musim dingin dingin."],
  ]),
  v("v-oishii", "美味しい", "おいしい", "oishii", "lezat", "N5", "i-adjektiva", "kata-sifat", [
    ["この料理は美味しいです。", "このりょうりはおいしいです。", "Masakan ini lezat."],
  ]),
  v("v-muzukashii", "難しい", "むずかしい", "muzukashii", "sulit", "N5", "i-adjektiva", "kata-sifat", [
    ["漢字は難しいです。", "かんじはむずかしいです。", "Kanji itu sulit."],
  ]),

  // Bisnis
  v("v-kaigi", "会議", "かいぎ", "kaigi", "rapat", "N4", "nomina", "bisnis", [
    ["会議は十時に始まります。", "かいぎはじゅうじにはじまります。", "Rapat dimulai pukul sepuluh."],
  ]),
  v("v-shiryou", "資料", "しりょう", "shiryou", "materi / dokumen", "N4", "nomina", "bisnis", [
    ["会議の資料を準備してください。", "かいぎのしりょうをじゅんびしてください。", "Tolong siapkan materi rapat."],
  ]),
  v("v-yotei", "予定", "よてい", "yotei", "rencana / jadwal", "N4", "nomina", "bisnis", [
    ["明日の予定は何ですか。", "あしたのよていはなんですか。", "Apa rencana besok?"],
  ]),
  v("v-renraku", "連絡", "れんらく", "renraku", "kontak / pemberitahuan", "N4", "nomina", "bisnis", [
    ["後で連絡します。", "あとでれんらくします。", "Saya akan menghubungi nanti."],
  ]),
  v("v-shachou", "社長", "しゃちょう", "shachou", "direktur utama", "N4", "nomina", "bisnis", [
    ["社長は出張中です。", "しゃちょうはしゅっちょうちゅうです。", "Direktur sedang dinas luar kota."],
  ]),
  v("v-okyakusan", "お客さん", "おきゃくさん", "okyakusan", "tamu / pelanggan", "N4", "nomina", "bisnis", [
    ["お客さんが来ました。", "おきゃくさんがきました。", "Tamu sudah datang."],
  ]),
  v("v-keiyaku", "契約", "けいやく", "keiyaku", "kontrak", "N3", "nomina", "bisnis", [
    ["来月契約を結びます。", "らいげつけいやくをむすびます。", "Bulan depan kami menandatangani kontrak."],
  ]),
  v("v-meeru", "メール", "メール", "meeru", "email", "N4", "nomina", "bisnis", [
    ["メールを送りました。", "メールをおくりました。", "Saya sudah mengirim email."],
  ]),

  // Teknologi
  v("v-keitaidenwa", "携帯電話", "けいたいでんわ", "keitaidenwa", "telepon seluler", "N4", "nomina", "teknologi", [
    ["携帯電話を忘れました。", "けいたいでんわをわすれました。", "Saya lupa membawa ponsel."],
  ]),
  v("v-pasokon", "パソコン", "パソコン", "pasokon", "komputer", "N4", "nomina", "teknologi", [
    ["パソコンで仕事をします。", "パソコンでしごとをします。", "Saya bekerja dengan komputer."],
  ]),
  v("v-intaanetto", "インターネット", "インターネット", "intaanetto", "internet", "N4", "nomina", "teknologi", [
    ["インターネットが遅いです。", "インターネットがおそいです。", "Internetnya lambat."],
  ]),
  v("v-apuri", "アプリ", "アプリ", "apuri", "aplikasi", "N3", "nomina", "teknologi", [
    ["このアプリは便利です。", "このアプリはべんりです。", "Aplikasi ini praktis."],
  ]),
  v("v-gamen", "画面", "がめん", "gamen", "layar", "N3", "nomina", "teknologi", [
    ["画面が暗いです。", "がめんがくらいです。", "Layarnya gelap."],
  ]),
  v("v-juuden", "充電", "じゅうでん", "juuden", "pengisian daya", "N3", "nomina", "teknologi", [
    ["充電が切れました。", "じゅうでんがきれました。", "Baterainya habis."],
  ]),
  v("v-douga", "動画", "どうが", "douga", "video", "N3", "nomina", "teknologi", [
    ["動画を見ます。", "どうがをみます。", "Saya menonton video."],
  ]),

  // Emosi
  v("v-ureshii", "嬉しい", "うれしい", "ureshii", "senang / gembira", "N4", "i-adjektiva", "emosi", [
    ["合格して嬉しいです。", "ごうかくしてうれしいです。", "Saya senang karena lulus."],
  ]),
  v("v-kanashii", "悲しい", "かなしい", "kanashii", "sedih", "N4", "i-adjektiva", "emosi", [
    ["悲しい映画でした。", "かなしいえいがでした。", "Itu film yang sedih."],
  ]),
  v("v-tanoshii", "楽しい", "たのしい", "tanoshii", "menyenangkan", "N5", "i-adjektiva", "emosi", [
    ["旅行は楽しかったです。", "りょこうはたのしかったです。", "Perjalanannya menyenangkan."],
  ]),
  v("v-sabishii", "寂しい", "さびしい", "sabishii", "kesepian / sunyi", "N4", "i-adjektiva", "emosi", [
    ["一人で寂しいです。", "ひとりでさびしいです。", "Saya kesepian sendirian."],
  ]),
  v("v-shinpai", "心配", "しんぱい", "shinpai", "khawatir", "N4", "na-adjektiva", "emosi", [
    ["心配しないでください。", "しんぱいしないでください。", "Jangan khawatir."],
  ]),
  v("v-odoroku", "驚く", "おどろく", "odoroku", "terkejut", "N3", "verba", "emosi", [
    ["そのニュースを聞いて驚きました。", "そのニュースをきいておどろきました。", "Saya terkejut mendengar berita itu."],
  ]),
  v("v-okoru", "怒る", "おこる", "okoru", "marah", "N3", "verba", "emosi", [
    ["父は怒りました。", "ちちはおこりました。", "Ayah saya marah."],
  ]),
  v("v-suki", "好き", "すき", "suki", "suka", "N5", "na-adjektiva", "emosi", [
    ["日本のアニメが好きです。", "にほんのアニメがすきです。", "Saya suka anime Jepang."],
  ], "Pola: [objek] が 好きです. 好き bukan verba."),

  // Anime
  v("v-anime", "アニメ", "アニメ", "anime", "anime", "N5", "nomina", "anime", [
    ["週末にアニメを見ます。", "しゅうまつにアニメをみます。", "Akhir pekan saya menonton anime."],
  ]),
  v("v-manga", "漫画", "まんが", "manga", "manga / komik", "N5", "nomina", "anime", [
    ["漫画を読むのが好きです。", "まんがをよむのがすきです。", "Saya suka membaca manga."],
  ]),
  v("v-seiyuu", "声優", "せいゆう", "seiyuu", "pengisi suara", "N3", "nomina", "anime", [
    ["あの声優は有名です。", "あのせいゆうはゆうめいです。", "Pengisi suara itu terkenal."],
  ]),
  v("v-shujinkou", "主人公", "しゅじんこう", "shujinkou", "tokoh utama", "N3", "nomina", "anime", [
    ["主人公は強いです。", "しゅじんこうはつよいです。", "Tokoh utamanya kuat."],
  ]),
  v("v-bouken", "冒険", "ぼうけん", "bouken", "petualangan", "N3", "nomina", "anime", [
    ["冒険の物語が好きです。", "ぼうけんのものがたりがすきです。", "Saya suka cerita petualangan."],
  ]),
  v("v-mahou", "魔法", "まほう", "mahou", "sihir", "N3", "nomina", "anime", [
    ["魔法を使います。", "まほうをつかいます。", "Saya menggunakan sihir."],
  ]),
  v("v-nakama", "仲間", "なかま", "nakama", "teman seperjuangan", "N3", "nomina", "anime", [
    ["仲間と一緒に戦います。", "なかまといっしょにたたかいます。", "Saya bertarung bersama teman-teman."],
  ], "Kata ini sering muncul di anime; dalam percakapan sehari-hari 友達 lebih umum."),
  v("v-yume", "夢", "ゆめ", "yume", "mimpi / impian", "N5", "nomina", "anime", [
    ["夢を追いかけます。", "ゆめをおいかけます。", "Saya mengejar mimpi."],
  ]),

  // Kehidupan
  v("v-seikatsu", "生活", "せいかつ", "seikatsu", "kehidupan sehari-hari", "N3", "nomina", "kehidupan", [
    ["日本の生活に慣れました。", "にほんのせいかつになれました。", "Saya sudah terbiasa dengan kehidupan di Jepang."],
  ]),
  v("v-asagohan", "朝ご飯", "あさごはん", "asagohan", "sarapan", "N5", "nomina", "kehidupan", [
    ["朝ご飯を食べました。", "あさごはんをたべました。", "Saya sudah makan sarapan."],
  ]),
  v("v-souji", "掃除", "そうじ", "souji", "bersih-bersih", "N4", "nomina", "kehidupan", [
    ["部屋を掃除します。", "へやをそうじします。", "Saya membersihkan kamar."],
  ]),
  v("v-sentaku", "洗濯", "せんたく", "sentaku", "mencuci (pakaian)", "N4", "nomina", "kehidupan", [
    ["洗濯をします。", "せんたくをします。", "Saya mencuci pakaian."],
  ]),
  v("v-kaimono", "買い物", "かいもの", "kaimono", "belanja", "N4", "nomina", "kehidupan", [
    ["スーパーで買い物をします。", "スーパーでかいものをします。", "Saya berbelanja di supermarket."],
  ]),
  v("v-sanpo", "散歩", "さんぽ", "sanpo", "jalan-jalan santai", "N4", "nomina", "kehidupan", [
    ["公園を散歩します。", "こうえんをさんぽします。", "Saya berjalan-jalan di taman."],
  ]),
  v("v-denwa", "電話", "でんわ", "denwa", "telepon", "N5", "nomina", "kehidupan", [
    ["母に電話します。", "ははにでんわします。", "Saya menelepon ibu."],
  ]),
  v("v-ryokou", "旅行", "りょこう", "ryokou", "perjalanan", "N4", "nomina", "kehidupan", [
    ["来月、京都へ旅行します。", "らいげつ、きょうとへりょこうします。", "Bulan depan saya berwisata ke Kyoto."],
  ]),

  // Tingkat menengah dan lanjut
  v("v-ganbaru", "頑張る", "がんばる", "ganbaru", "berusaha keras", "N4", "verba", "kata-kerja", [
    ["日本語の勉強を頑張っています。", "にほんごのべんきょうをがんばっています。", "Saya sedang berusaha keras belajar bahasa Jepang."],
  ]),
  v("v-nareru", "慣れる", "なれる", "nareru", "terbiasa", "N3", "verba", "kata-kerja", [
    ["新しい生活に慣れました。", "あたらしいせいかつになれました。", "Saya sudah terbiasa dengan kehidupan baru."],
  ]),
  v("v-hitsuyou", "必要", "ひつよう", "hitsuyou", "diperlukan / kebutuhan", "N4", "na-adjektiva", "kata-sifat", [
    ["パスポートが必要です。", "パスポートがひつようです。", "Paspor diperlukan."],
  ]),
  v("v-junbi", "準備", "じゅんび", "junbi", "persiapan", "N4", "nomina", "kehidupan", [
    ["旅行の準備をします。", "りょこうのじゅんびをします。", "Saya menyiapkan perjalanan."],
  ]),
  v("v-keiken", "経験", "けいけん", "keiken", "pengalaman", "N3", "nomina", "kehidupan", [
    ["海外で働いた経験があります。", "かいがいではたらいたけいけんがあります。", "Saya punya pengalaman bekerja di luar negeri."],
  ]),
  v("v-kankyou", "環境", "かんきょう", "kankyou", "lingkungan", "N3", "nomina", "alam", [
    ["環境を守るために努力しています。", "かんきょうをまもるためにどりょくしています。", "Kami berusaha untuk menjaga lingkungan."],
  ]),
  v("v-eikyou", "影響", "えいきょう", "eikyou", "pengaruh / dampak", "N3", "nomina", "kehidupan", [
    ["天気は気分に影響します。", "てんきはきぶんにえいきょうします。", "Cuaca memengaruhi suasana hati."],
  ]),
  v("v-kaiketsu", "解決", "かいけつ", "kaiketsu", "penyelesaian", "N3", "nomina", "bisnis", [
    ["問題を解決しました。", "もんだいをかいけつしました。", "Masalahnya sudah diselesaikan."],
  ]),
  v("v-kakunin", "確認", "かくにん", "kakunin", "konfirmasi / pengecekan", "N3", "nomina", "bisnis", [
    ["予約を確認してください。", "よやくをかくにんしてください。", "Tolong konfirmasi reservasinya."],
  ]),
  v("v-keizai", "経済", "けいざい", "keizai", "ekonomi", "N2", "nomina", "bisnis", [
    ["日本の経済について勉強しています。", "にほんのけいざいについてべんきょうしています。", "Saya sedang mempelajari ekonomi Jepang."],
  ]),
  v("v-bunka", "文化", "ぶんか", "bunka", "budaya", "N4", "nomina", "kehidupan", [
    ["日本の文化に興味があります。", "にほんのぶんかにきょうみがあります。", "Saya tertarik pada budaya Jepang."],
  ]),
  v("v-houshin", "方針", "ほうしん", "houshin", "kebijakan / arah", "N2", "nomina", "bisnis", [
    ["会社の方針が変わりました。", "かいしゃのほうしんがかわりました。", "Kebijakan perusahaan berubah."],
  ]),
  v("v-kaizen", "改善", "かいぜん", "kaizen", "perbaikan", "N2", "nomina", "bisnis", [
    ["サービスを改善します。", "サービスをかいぜんします。", "Kami akan memperbaiki layanan."],
  ]),
  v("v-taiou", "対応", "たいおう", "taiou", "penanganan / respons", "N2", "nomina", "bisnis", [
    ["お客さんの要望に対応しました。", "おきゃくさんのようぼうにたいおうしました。", "Kami menanggapi permintaan pelanggan."],
  ]),
  v("v-keikou", "傾向", "けいこう", "keikou", "kecenderungan", "N2", "nomina", "kehidupan", [
    ["若い人の傾向を分析します。", "わかいひとのけいこうをぶんせきします。", "Kami menganalisis kecenderungan anak muda."],
  ]),
  v("v-gainen", "概念", "がいねん", "gainen", "konsep", "N1", "nomina", "sekolah", [
    ["この概念を説明するのは難しいです。", "このがいねんをせつめいするのはむずかしいです。", "Menjelaskan konsep ini sulit."],
  ]),
  v("v-kouken", "貢献", "こうけん", "kouken", "kontribusi", "N1", "nomina", "bisnis", [
    ["地域社会に貢献したいです。", "ちいきしゃかいにこうけんしたいです。", "Saya ingin berkontribusi pada masyarakat lokal."],
  ]),
];

export const VOCAB_BY_ID = new Map(VOCABULARY.map((word) => [word.id, word]));
