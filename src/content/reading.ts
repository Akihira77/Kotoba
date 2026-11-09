import type { JLPTLevel, QuizQuestion, ReadingPassage, ReadingVocab } from "@/lib/types";

type VocabRow = [jp: string, reading: string, meaning: string];
type QuestionRow = [prompt: string, options: string[], answerIndex: number, explanation: string];

function toVocab(rows: VocabRow[]): ReadingVocab[] {
  return rows.map(([jp, reading, meaning]) => ({ jp, reading, meaning }));
}

function toQuestions(passageId: string, level: JLPTLevel, rows: QuestionRow[]): QuizQuestion[] {
  return rows.map(
    ([prompt, options, answerIndex, explanation], index): QuizQuestion => ({
      id: `${passageId}-q${index + 1}`,
      type: "reading",
      level,
      prompt,
      options,
      answerIndex,
      explanation,
      sourceId: passageId,
      section: "dokkai",
    }),
  );
}

function passage(
  id: string,
  level: JLPTLevel,
  title: string,
  titleJp: string,
  summary: string,
  text: string,
  translation: string[],
  vocabRows: VocabRow[],
  questionRows: QuestionRow[],
  minutes: number,
): ReadingPassage {
  return {
    id,
    level,
    title,
    titleJp,
    summary,
    text,
    translation,
    vocab: toVocab(vocabRows),
    questions: toQuestions(id, level, questionRows),
    minutes,
  };
}

/**
 * 12 teks bacaan orisinal dengan furigana bertanda `{漢字|かな}`.
 * Tingkat kesulitan naik dari N5 (kalimat pendek) sampai N1 (esai abstrak).
 */
export const READING: ReadingPassage[] = [
  passage(
    "r-n5-1",
    "N5",
    "Keluarga Kecilku",
    "わたしの家族",
    "Seorang pelajar memperkenalkan anggota keluarganya dan kebiasaan makan malam bersama.",
    "{私|わたし}の{家族|かぞく}は{四人|よにん}です。{父|ちち}と{母|はは}と{妹|いもうと}と{私|わたし}です。{父|ちち}は{会社員|かいしゃいん}で、{母|はは}は{先生|せんせい}です。\n\n{妹|いもうと}は{中学生|ちゅうがくせい}で、{毎日|まいにち}{学校|がっこう}へ{行|い}きます。{日曜日|にちようび}には、みんなで{晩|ばん}ごはんを{食|た}べます。{母|はは}の{料理|りょうり}はとてもおいしいです。{私|わたし}は{家族|かぞく}が{大好|だいす}きです。",
    [
      "Keluarga saya ada empat orang. Ayah, ibu, adik perempuan, dan saya. Ayah seorang pegawai perusahaan, dan ibu seorang guru.",
      "Adik perempuan saya duduk di bangku SMP dan setiap hari pergi ke sekolah. Pada hari Minggu, kami semua makan malam bersama. Masakan ibu sangat lezat. Saya sangat menyayangi keluarga saya.",
    ],
    [
      ["家族", "かぞく", "keluarga"],
      ["会社員", "かいしゃいん", "pegawai perusahaan"],
      ["中学生", "ちゅうがくせい", "siswa sekolah menengah pertama"],
      ["料理", "りょうり", "masakan"],
      ["毎日", "まいにち", "setiap hari"],
      ["四人", "よにん", "empat orang"],
    ],
    [
      ["Berapa jumlah anggota keluarga penulis?", ["Tiga orang", "Empat orang", "Lima orang", "Enam orang"], 1, "Teks menyebut 家族は四人です, yaitu ayah, ibu, adik perempuan, dan penulis sendiri."],
      ["Apa pekerjaan ibu penulis?", ["Guru", "Pegawai perusahaan", "Dokter", "Siswa SMP"], 0, "Teks menyebut 母は先生です, jadi ibu bekerja sebagai guru."],
      ["Apa arti kata 妹 dalam teks?", ["Kakak perempuan", "Adik perempuan", "Kakak laki-laki", "Adik laki-laki"], 1, "妹 (いもうと) berarti adik perempuan. Kakak perempuan adalah 姉 (あね), adik laki-laki adalah 弟 (おとうと)."],
    ],
    3,
  ),
  passage(
    "r-n5-2",
    "N5",
    "Pagi yang Sibuk",
    "あさのじゅんび",
    "Rutinitas pagi seorang pelajar: bangun, sarapan, lalu berangkat dengan kereta.",
    "{私|わたし}は{毎朝|まいあさ}{六時|ろくじ}に{起|お}きます。まず{顔|かお}を{洗|あら}って、それから{朝|あさ}ごはんを{食|た}べます。{朝|あさ}ごはんはパンと{卵|たまご}と{牛乳|ぎゅうにゅう}です。コーヒーも{飲|の}みます。\n\n{七時半|しちじはん}に{家|いえ}を{出|で}て、{電車|でんしゃ}で{学校|がっこう}へ{行|い}きます。{学校|がっこう}まで{三十分|さんじゅっぷん}ぐらいかかります。{朝|あさ}は{少|すこ}し{忙|いそが}しいですが、{毎日|まいにち}が{楽|たの}しいです。",
    [
      "Saya bangun setiap pagi pukul enam. Pertama saya mencuci muka, lalu sarapan. Sarapannya roti, telur, dan susu. Saya juga minum kopi.",
      "Pukul setengah delapan saya keluar rumah dan pergi ke sekolah dengan kereta. Perjalanan ke sekolah memakan waktu sekitar tiga puluh menit. Pagi hari memang agak sibuk, tetapi setiap hari menyenangkan.",
    ],
    [
      ["起きる", "おきる", "bangun (tidur)"],
      ["顔", "かお", "wajah"],
      ["卵", "たまご", "telur"],
      ["牛乳", "ぎゅうにゅう", "susu"],
      ["家を出る", "いえをでる", "keluar rumah"],
      ["忙しい", "いそがしい", "sibuk"],
    ],
    [
      ["Pukul berapa penulis bangun?", ["五時", "六時", "六時半", "七時半"], 1, "Teks menyebut 毎朝六時に起きます, jadi penulis bangun pukul enam."],
      ["Naik apa penulis pergi ke sekolah?", ["バス", "電車", "自転車", "車"], 1, "Teks menyebut 電車で学校へ行きます, yaitu naik kereta."],
      ["Berapa lama perjalanan ke sekolah?", ["十分ぐらい", "二十分ぐらい", "三十分ぐらい", "一時間ぐらい"], 2, "Teks menyebut 学校まで三十分ぐらいかかります, jadi sekitar 30 menit."],
    ],
    3,
  ),
  passage(
    "r-n5-3",
    "N5",
    "Di Minimarket",
    "コンビニで",
    "Pengalaman malam membeli susu, roti, dan onigiri di minimarket dekat stasiun.",
    "{昨日|きのう}の{夜|よる}、{私|わたし}は{近|ちか}くのコンビニへ{行|い}きました。{牛乳|ぎゅうにゅう}とパンとおにぎりを{買|か}いました。\n\n{店|みせ}の{人|ひと}が「{袋|ふくろ}は{要|い}りますか」と{聞|き}きました。{私|わたし}は「いいえ、{大丈夫|だいじょうぶ}です」と{答|こた}えました。{全部|ぜんぶ}で{五百八十|ごひゃくはちじゅう}{円|えん}でした。コンビニは{駅|えき}の{前|まえ}にあるので、とても{便利|べんり}です。また{今度|こんど}{来|き}ます。",
    [
      "Tadi malam saya pergi ke minimarket di dekat stasiun. Saya membeli susu, roti, dan onigiri.",
      "Petugas toko bertanya, ‘Apakah perlu kantong?’ Saya menjawab, ‘Tidak, tidak apa-apa.’ Totalnya lima ratus delapan puluh yen. Minimarket itu ada di depan stasiun, jadi sangat praktis. Saya akan datang lagi lain kali.",
    ],
    [
      ["近く", "ちかく", "dekat"],
      ["袋", "ふくろ", "kantong"],
      ["要る", "いる", "perlu"],
      ["全部で", "ぜんぶで", "seluruhnya / totalnya"],
      ["便利", "べんり", "praktis"],
      ["今度", "こんど", "lain kali"],
    ],
    [
      ["Apa saja yang dibeli penulis?", ["牛乳とパンとおにぎり", "牛乳と卵とおにぎり", "パンとおにぎりとお茶", "牛乳とパンとコーヒー"], 0, "Teks menyebut 牛乳とパンとおにぎりを買いました, jadi hanya tiga barang itu."],
      ["Berapa total belanja penulis?", ["四百八十円", "五百円", "五百八十円", "六百八十円"], 2, "Teks menyebut 全部で五百八十円でした, yaitu 580 yen."],
      ["Apa makna また今度 pada akhir teks?", ["Sekarang juga", "Nanti lain kali", "Besok pagi", "Tadi malam"], 1, "今度 berarti kesempatan berikutnya, sehingga また今度 berarti 'nanti lain kali'."],
    ],
    3,
  ),
  passage(
    "r-n5-4",
    "N5",
    "Hari Minggu di Taman",
    "日曜日の公園",
    "Piknik hanami bersama teman yang berakhir lebih cepat karena hujan sore hari.",
    "{日曜日|にちようび}に、{私|わたし}は{友|とも}だちと{公園|こうえん}へ{行|い}きました。{公園|こうえん}は{駅|えき}から{歩|ある}いて{十分|じゅっぷん}です。{春|はる}なので、{桜|さくら}がとてもきれいでした。\n\n{私|わたし}たちは{桜|さくら}の{下|した}でお{弁当|べんとう}を{食|た}べました。{午後|ごご}から{雨|あめ}が{降|ふ}ったので、{早|はや}く{家|いえ}へ{帰|かえ}りました。{楽|たの}しい{一日|いちにち}でした。また{来年|らいねん}、{一緒|いっしょ}に{花見|はなみ}をしたいです。",
    [
      "Pada hari Minggu, saya pergi ke taman bersama teman. Taman itu berjarak sepuluh menit berjalan kaki dari stasiun. Karena musim semi, bunga sakuranya sangat indah.",
      "Kami makan bekal di bawah pohon sakura. Karena sore hari hujan, kami pulang lebih awal. Itu hari yang menyenangkan. Tahun depan saya ingin melihat sakura bersama lagi.",
    ],
    [
      ["公園", "こうえん", "taman"],
      ["桜", "さくら", "bunga sakura"],
      ["お弁当", "おべんとう", "bekal"],
      ["雨が降る", "あめがふる", "hujan turun"],
      ["花見", "はなみ", "menikmati bunga sakura"],
      ["来年", "らいねん", "tahun depan"],
    ],
    [
      ["Kapan penulis pergi ke taman?", ["土曜日", "日曜日", "月曜日", "金曜日"], 1, "Kalimat pertama menyebut 日曜日に, yaitu hari Minggu."],
      ["Mengapa mereka pulang lebih awal?", ["Karena lapar", "Karena hujan", "Karena hari sudah malam", "Karena taman tutup"], 1, "Teks menyebut 午後から雨が降ったので、早く家へ帰りました, jadi penyebabnya hujan sore hari."],
      ["Apa arti 花見 dalam konteks teks ini?", ["Menikmati pemandangan bunga sakura", "Membeli bunga", "Menanam bunga", "Memotong bunga"], 0, "花見 adalah tradisi menikmati bunga (biasanya sakura) sambil berkumpul, bukan kegiatan membeli atau menanam bunga."],
    ],
    3,
  ),
  passage(
    "r-n4-1",
    "N4",
    "Rencana Akhir Pekan",
    "週末の予定",
    "Rencana menonton film bersama teman dengan dua kemungkinan tergantung cuaca.",
    "{来週|らいしゅう}の{土曜日|どようび}に、{友|とも}だちと{映画|えいが}を{見|み}に{行|い}きます。{映画|えいが}は{駅|えき}の{近|ちか}くの{映画館|えいがかん}で{見|み}ます。{安|やす}い{日|ひ}なので、{切符|きっぷ}は{千二百|せんにひゃく}{円|えん}です。\n\nもし{雨|あめ}が{降|ふ}ったら、{映画|えいが}のあとで{家|いえ}で{昼|ひる}ごはんを{食|た}べます。{晴|は}れたら、{公園|こうえん}を{散歩|さんぽ}してから{帰|かえ}ります。{友|とも}だちは{仕事|しごと}が{終|お}わってから{来|く}るので、{少|すこ}し{遅|おく}れるかもしれません。",
    [
      "Sabtu depan saya akan pergi menonton film bersama teman. Filmnya kami tonton di bioskop dekat stasiun. Karena hari itu hari diskon, tiketnya seribu dua ratus yen.",
      "Kalau hujan, setelah film kami makan siang di rumah. Kalau cerah, kami berjalan-jalan di taman dulu baru pulang. Karena teman saya baru datang setelah pekerjaannya selesai, dia mungkin sedikit terlambat.",
    ],
    [
      ["映画館", "えいがかん", "bioskop"],
      ["切符", "きっぷ", "tiket"],
      ["散歩", "さんぽ", "jalan-jalan santai"],
      ["遅れる", "おくれる", "terlambat"],
      ["晴れる", "はれる", "cerah (cuaca)"],
      ["予定", "よてい", "rencana"],
    ],
    [
      ["Apa yang akan mereka lakukan kalau hujan?", ["Menonton film lalu pulang langsung", "Makan siang di rumah", "Berjalan di taman", "Menunda ke hari Minggu"], 1, "Teks menyebut もし雨が降ったら、映画のあとで家で昼ごはんを食べます."],
      ["Mengapa teman mungkin terlambat?", ["Karena rumahnya jauh", "Karena harus pulang kerja dulu", "Karena cuaca buruk", "Karena kereta berhenti"], 1, "Teks menyebut 友だちは仕事が終わってから来るので、少し遅れるかもしれません."],
      ["Pola apa yang ditunjukkan oleh 〜たら dalam teks ini?", ["Syarat/situasi: 'kalau/jika'", "Alasan: 'karena'", "Tujuan: 'untuk'", "Perintah: 'lakukanlah'"], 0, "〜たら menyatakan syarat atau situasi yang menjadi pemicu: もし雨が降ったら = 'jika turun hujan'."],
    ],
    4,
  ),
  passage(
    "r-n4-2",
    "N4",
    "Peraturan Perpustakaan",
    "図書館のきまり",
    "Penjelasan aturan meminjam buku dan tata tertib di perpustakaan sekolah.",
    "{私|わたし}の{学校|がっこう}の{図書館|としょかん}には、いくつか{決|き}まりがあります。{本|ほん}は{二週間|にしゅうかん}まで{借|か}りることができますが、{返|かえ}さなければなりません。{返|かえ}すのが{遅|おく}れたら、{次|つぎ}の{週|しゅう}は{借|か}りられません。\n\n{図書館|としょかん}の{中|なか}では、{静|しず}かにしなければなりません。{飲|の}み{物|もの}を{持|も}って{入|はい}ってはいけません。{分|わ}からない{言葉|ことば}があったら、{辞書|じしょ}を{使|つか}ってもいいです。{係|かかり}の{人|ひと}に{聞|き}いてもいいです。みんなが{気持|きも}ちよく{使|つか}えるように、{決|き}まりを{守|まも}りましょう。",
    [
      "Perpustakaan sekolah saya punya beberapa peraturan. Buku boleh dipinjam paling lama dua minggu, tetapi harus dikembalikan. Jika terlambat mengembalikan, minggu berikutnya tidak boleh meminjam.",
      "Di dalam perpustakaan, kita harus tenang. Tidak boleh membawa minuman ke dalam. Kalau ada kata yang tidak dipahami, boleh menggunakan kamus. Boleh juga bertanya kepada petugas. Mari patuhi peraturan agar semua orang nyaman menggunakan perpustakaan.",
    ],
    [
      ["図書館", "としょかん", "perpustakaan"],
      ["二週間", "にしゅうかん", "dua minggu"],
      ["返す", "かえす", "mengembalikan"],
      ["辞書", "じしょ", "kamus"],
      ["係の人", "かかりのひと", "petugas"],
      ["守る", "まもる", "menaati"],
    ],
    [
      ["Berapa lama buku boleh dipinjam?", ["Satu minggu", "Dua minggu", "Tiga minggu", "Satu bulan"], 1, "Teks menyebut 本は二週間まで借りることができます."],
      ["Apa yang terjadi jika terlambat mengembalikan buku?", ["Dikenai denda uang", "Tidak boleh meminjam minggu berikutnya", "Harus membeli buku baru", "Kartu perpustakaannya dicabut"], 1, "Teks menyebut 返すのが遅れたら、次の週は借りられません."],
      ["Mengapa penulis menambahkan kalimat terakhir tentang 守りましょう?", [
        "Untuk menyatakan aturan resmi baru",
        "Untuk mengajak pembaca bersama-sama menaati aturan demi kenyamanan bersama",
        "Untuk melarang siswa masuk perpustakaan",
        "Untuk menawarkan bantuan petugas",
      ], 1, "Kalimat みんなが気持ちよく使えるように mengarah pada tujuan bersama, jadi ini ajakan, bukan aturan baru atau larangan."],
    ],
    4,
  ),
  passage(
    "r-n4-3",
    "N4",
    "Tetangga Baru",
    "新しいアパート",
    "Pengalaman pindah ke apartemen baru dan kebaikan tetangga saat hari kepindahan.",
    "{先月|せんげつ}、{私|わたし}は{新|あたら}しいアパートに{引|ひ}っ{越|こ}しました。{前|まえ}の{部屋|へや}は{駅|えき}から{遠|とお}かったですが、{今|いま}の{部屋|へや}は{駅|えき}まで{五分|ごふん}しかかかりません。{部屋|へや}は{少|すこ}し{狭|せま}いですが、{日|ひ}{当|あ}たりがいいです。\n\n{隣|となり}の{人|ひと}はとても{親切|しんせつ}で、{引|ひ}っ{越|こ}しの{日|ひ}に「{何|なに}か{手伝|てつだ}いましょうか」と{言|い}ってくれました。{私|わたし}は{自分|じぶん}で{荷物|にもつ}を{運|はこ}びましたが、とても{嬉|うれ}しかったです。{今|いま}も{会|あ}うと、{挨拶|あいさつ}をしています。",
    [
      "Bulan lalu saya pindah ke apartemen baru. Kamar lama saya jauh dari stasiun, tetapi kamar yang sekarang hanya butuh lima menit ke stasiun. Kamarnya agak sempit, tetapi cahaya mataharinya bagus.",
      "Tetangga saya sangat baik; pada hari kepindahan dia berkata, ‘Mau saya bantu sesuatu?’ Saya memindahkan barang-barang sendiri, tetapi saya sangat senang. Sekarang pun setiap bertemu kami saling menyapa.",
    ],
    [
      ["引っ越す", "ひっこす", "pindah rumah"],
      ["隣", "となり", "tetangga sebelah"],
      ["親切", "しんせつ", "baik hati"],
      ["手伝う", "てつだう", "membantu"],
      ["荷物", "にもつ", "barang bawaan"],
      ["挨拶", "あいさつ", "sapaan"],
    ],
    [
      ["Naik apa penulis pergi ke stasiun dari apartemen baru?", ["Tidak disebutkan, hanya waktu tempuhnya", "Bus", "Sepeda", "Taxi"], 0, "Teks hanya menyebut 駅まで五分しかかかりません tanpa menyebut alat transportasi."],
      ["Apa yang ditawarkan tetangga pada hari kepindahan?", ["Meminjamkan uang", "Membantu membawa barang", "Mengantar ke stasiun", "Memperkenalkan diri ke sekolah"], 1, "Tetangga berkata 何か手伝いましょうか, yaitu menawarkan bantuan."],
      ["Apa makna kata 狭い pada teks?", ["Gelap", "Sempit", "Luas", "Berisik"], 1, "狭い (せまい) berarti sempit; teks menyebut kamarnya 少し狭い tetapi 日当たりがいい."],
    ],
    4,
  ),
  passage(
    "r-n3-1",
    "N3",
    "Perubahan Cara Kerja",
    "働き方の変化",
    "Esai pendek tentang pergeseran gaya kerja di Jepang, termasuk pindah kerja dan kerja jarak jauh.",
    "{日本|にほん}では、{働|はたら}き{方|かた}が{少|すこ}しずつ{変|か}わってきています。{以前|いぜん}は、{一|ひと}つの{会社|かいしゃ}で{定年|ていねん}まで{働|はたら}く{人|ひと}が{多|おお}くいました。しかし{最近|さいきん}は、{転職|てんしょく}する{人|ひと}や、{副業|ふくぎょう}をする{人|ひと}も{増|ふ}えてきました。\n\nまた、{会社|かいしゃ}に{行|い}かないで{家|いえ}で{仕事|しごと}をする「テレワーク」も{広|ひろ}がっています。テレワークには、{通勤|つうきん}の{時間|じかん}が{短|みじか}くなるという{利点|りてん}がある{一方|いっぽう}、{同僚|どうりょう}と{話|はな}しにくいという{問題|もんだい}もあります。{働|はたら}く{人|ひと}にとって、{自分|じぶん}に{合|あ}った{働|はたら}き{方|かた}を{選|えら}べることは、とても{大切|たいせつ}です。",
    [
      "Di Jepang, cara bekerja perlahan-lahan berubah. Dulu banyak orang bekerja di satu perusahaan yang sama sampai usia pensiun. Namun akhir-akhir ini, orang yang berganti pekerjaan atau mengambil pekerjaan sampingan juga bertambah.",
      "Selain itu, ‘telework’ — bekerja dari rumah tanpa pergi ke kantor — juga makin menyebar. Telework punya keunggulan berupa waktu perjalanan yang lebih singkat, tetapi di sisi lain ada masalah susahnya berbicara dengan rekan kerja. Bagi para pekerja, bisa memilih cara kerja yang cocok dengan diri sendiri adalah hal yang sangat penting.",
    ],
    [
      ["働き方", "はたらきかた", "cara bekerja"],
      ["転職", "てんしょく", "ganti pekerjaan"],
      ["副業", "ふくぎょう", "pekerjaan sampingan"],
      ["通勤", "つうきん", "perjalanan pulang-pergi kerja"],
      ["利点", "りてん", "keunggulan"],
      ["一方", "いっぽう", "di sisi lain"],
    ],
    [
      ["Apa perubahan yang disebutkan pada paragraf pertama?", ["Banyak orang pensiun lebih cepat", "Makin banyak yang ganti kerja dan punya pekerjaan sampingan", "Perusahaan mulai tutup", "Waktu kerja menjadi lebih panjang"], 1, "Teks menyebut 転職する人や、副業をする人も増えてきました."],
      ["Apa keunggulan telework menurut teks?", ["Gaji lebih besar", "Waktu perjalanan (通勤) lebih singkat", "Tidak perlu bertemu orang", "Bisa bekerja tanpa belajar"], 1, "Teks menyebut 通勤の時間が短くなるという利点がある."],
      ["Apa maksud 一方 dalam kalimat 〜利点がある一方、〜問題もあります?", ["Menyatakan sebab", "Menyatakan dua sisi yang berlawanan", "Menyatakan urutan waktu", "Menyatakan contoh"], 1, "一方 menghubungkan dua hal yang berkebalikan: keunggulan di satu sisi, masalah di sisi lain."],
    ],
    5,
  ),
  passage(
    "r-n3-2",
    "N3",
    "Minimarket dan Kehidupan Lokal",
    "コンビニと地域",
    "Fungsi minimarket Jepang sebagai pendukung kehidupan sehari-hari, termasuk bagi warga lanjut usia.",
    "{日本|にほん}のコンビニは、{商品|しょうひん}を{売|う}るだけでなく、{地域|ちいき}の{生活|せいかつ}を{支|ささ}える{場所|ばしょ}にもなっています。{例|たと}えば、{電気|でんき}や{水道|すいどう}の{料金|りょうきん}を{払|はら}うことができます。また、{宅配便|たくはいびん}を{送|おく}ったり、{荷物|にもつ}を{受|う}け{取|と}ったりすることもできます。\n\n{高齢|こうれい}の{人|ひと}にとって、{近|ちか}くのコンビニは{大切|たいせつ}な{存在|そんざい}です。しかし、{店|みせ}が{少|すく}ない{地域|ちいき}では、{買|か}い{物|もの}が{難|むずか}しい{人|ひと}もいます。{最近|さいきん}は、{移動|いどう}スーパーや{宅配|たくはい}サービスなど、{新|あたら}しい{取|と}り{組|く}みも{増|ふ}えています。",
    [
      "Minimarket di Jepang tidak hanya menjual barang, tetapi juga menjadi tempat yang menopang kehidupan masyarakat setempat. Misalnya, kita bisa membayar tagihan listrik dan air di sana. Selain itu, kita juga bisa mengirim paket atau menerima barang.",
      "Bagi warga lanjut usia, minimarket yang dekat adalah keberadaan yang penting. Namun, di daerah dengan sedikit toko, ada orang yang kesulitan berbelanja. Belakangan ini, inisiatif baru seperti supermarket keliling dan layanan antar juga makin bertambah.",
    ],
    [
      ["料金", "りょうきん", "tarif / tagihan"],
      ["宅配便", "たくはいびん", "jasa kirim paket"],
      ["高齢", "こうれい", "lanjut usia"],
      ["地域", "ちいき", "daerah / wilayah"],
      ["取り組み", "とりくみ", "inisiatif / upaya"],
      ["移動", "いどう", "perpindahan / berkeliling"],
    ],
    [
      ["Layanan apa saja yang disebut dapat dilakukan di minimarket?", ["Membayar tagihan listrik dan air", "Mendaftar sekolah", "Membuat paspor", "Menukar uang asing"], 0, "Teks menyebut 電気や水道の料金を払うことができます."],
      ["Apa masalah yang disebutkan bagi sebagian warga lanjut usia?", ["Mereka tidak bisa membaca harga", "Sulit berbelanja di daerah yang tokonya sedikit", "Mereka tidak suka minimarket", "Mereka tidak bisa mengirim paket"], 1, "Teks menyebut 店が少ない地域では、買い物が難しい人もいます."],
      ["Apa tujuan penulis menyebut 移動スーパー dan 宅配サービス?", ["Mengkritik minimarket", "Menunjukkan solusi baru untuk masalah tersebut", "Menyebut contoh produk", "Menjelaskan sejarah minimarket"], 1, "Inisiatif itu disebut setelah masalah, sehingga berfungsi sebagai alternatif/solusi baru."],
    ],
    5,
  ),
  passage(
    "r-n3-3",
    "N3",
    "Empat Musim Jepang",
    "春夏秋冬",
    "Penjelasan singkat empat musim di Jepang dan maknanya bagi pemahaman budaya.",
    "{日本|にほん}には{春夏秋冬|しゅんかしゅうとう}という{四|よっ}つの{季節|きせつ}があります。{春|はる}は{暖|あたた}かくなり、{桜|さくら}が{咲|さ}きます。{夏|なつ}は{暑|あつ}くて{湿度|しつど}も{高|たか}いので、{体調|たいちょう}に{気|き}をつける{必要|ひつよう}があります。{秋|あき}は{涼|すず}しくなり、{紅葉|こうよう}がきれいです。{冬|ふゆ}は{寒|さむ}く、{北|きた}の{地方|ちほう}では{雪|ゆき}がたくさん{降|ふ}ります。\n\n{季節|きせつ}によって{食|た}べ{物|もの}や{行事|ぎょうじ}が{変|か}わるので、{一年|いちねん}を{通|つう}じて{様々|さまざま}な{楽|たの}しみがあります。{外国人|がいこくじん}にとって、{季節|きせつ}の{変化|へんか}を{感|かん}じることは、{日本|にほん}の{文化|ぶんか}を{理解|りかい}するよい{機会|きかい}になるでしょう。",
    [
      "Di Jepang ada empat musim yang disebut shunkashuutou. Musim semi menjadi hangat dan bunga sakura bermekaran. Musim panas panas dan kelembapannya juga tinggi, jadi kita perlu menjaga kondisi badan. Musim gugur menjadi sejuk dan daun-daunnya memerah indah. Musim dingin dingin, dan di daerah utara banyak turun salju.",
      "Karena makanan dan acara berubah menurut musim, ada berbagai kesenangan sepanjang tahun. Bagi orang asing, merasakan perubahan musim akan menjadi kesempatan baik untuk memahami budaya Jepang.",
    ],
    [
      ["季節", "きせつ", "musim"],
      ["湿度", "しつど", "kelembapan"],
      ["紅葉", "こうよう", "daun musim gugur yang memerah"],
      ["行事", "ぎょうじ", "acara / perayaan"],
      ["変化", "へんか", "perubahan"],
      ["体調", "たいちょう", "kondisi badan"],
    ],
    [
      ["Apa yang dinasihatkan untuk musim panas?", ["Banyak berjalan di luar", "Menjaga kondisi badan karena panas dan lembap", "Menanam sakura", "Pergi ke daerah utara"], 1, "Teks menyebut 夏は暑くて湿度も高いので、体調に気をつける必要があります."],
      ["Di daerah mana salju banyak turun?", ["Daerah selatan", "Daerah utara", "Daerah pantai", "Seluruh Jepang sama"], 1, "Teks menyebut 北の地方では雪がたくさん降ります."],
      ["Apa maksud 一年を通じて dalam teks?", ["Selama satu tahun penuh / sepanjang tahun", "Hanya di musim semi", "Setiap tahun baru", "Selama satu bulan"], 0, "〜を通じて berarti 'melalui/sepanjang', jadi 一年を通じて = sepanjang tahun."],
    ],
    5,
  ),
  passage(
    "r-n2-1",
    "N2",
    "Membaca Pikiran dan Menyatakan Kata",
    "察する文化と伝える力",
    "Esai tentang budaya 'menebak perasaan lawan bicara' di tempat kerja Jepang dan perlunya menyatakan maksud secara jelas.",
    "{日本|にほん}の{職場|しょくば}では、{相手|あいて}の{気持|きも}ちを{察|さっ}して{行動|こうどう}することが{求|もと}められる{場面|ばめん}が{少|すく}なくありません。{言葉|ことば}にしない{期待|きたい}を{読|よ}み{取|と}る、いわゆる「{察|さっ}する」{文化|ぶんか}です。\n\nしかし、{多様|たよう}な{背景|はいけい}を{持|も}つ{人|ひと}が{増|ふ}えた{現在|げんざい}、すべてを{暗黙|あんもく}の{了解|りょうかい}に{任|まか}せるのは{難|むずか}しくなっています。{指示|しじ}や{意図|いと}を{明確|めいかく}に{伝|つた}えることは、{冷|つめ}たいことではありません。むしろ、{誤解|ごかい}を{防|ふせ}ぎ、{互|たが}いの{時間|じかん}を{大切|たいせつ}にすることにつながります。{察|さっ}する{力|ちから}と{言葉|ことば}で{伝|つた}える{力|ちから}の{両方|りょうほう}を{育|はぐく}んでいくことが{必要|ひつよう}でしょう。",
    [
      "Di tempat kerja Jepang, tidak sedikit situasi yang menuntut orang bertindak setelah membaca perasaan lawan bicara. Itulah yang disebut budaya ‘menebak’ (sassuru), yaitu membaca harapan yang tidak diucapkan.",
      "Namun, kini ketika orang dengan latar belakang beragam makin banyak, menyerahkan semuanya pada kesepahaman implisit menjadi sulit. Menyampaikan instruksi dan maksud secara jelas bukan berarti bersikap dingin. Justru itu membantu mencegah kesalahpahaman dan menghargai waktu satu sama lain. Kita perlu mengembangkan kemampuan membaca sekaligus kemampuan menyampaikan dengan kata-kata.",
    ],
    [
      ["察する", "さっする", "menebak / membaca perasaan"],
      ["暗黙", "あんもく", "implisit / tanpa diucapkan"],
      ["了解", "りょうかい", "pemahaman / persetujuan"],
      ["意図", "いと", "maksud"],
      ["明確", "めいかく", "jelas"],
      ["育む", "はぐくむ", "membina / memupuk"],
    ],
    [
      ["Apa yang dimaksud dengan 「察する」文化 dalam teks?", ["Budaya membaca harapan/pikiran lawan bicara yang tidak diucapkan", "Budaya berbicara terus terang", "Budaya menulis surat resmi", "Budaya bekerja lembur"], 0, "Teks menjelaskan 言葉にしない期待を読み取ること, yaitu membaca harapan yang tidak diucapkan."],
      ["Apa pandangan penulis tentang menyampaikan maksud secara jelas?", ["Itu tanda orang yang tidak sopan", "Itu tidak perlu di tempat kerja", "Itu bukan sikap dingin, melainkan mencegah kesalahpahaman", "Itu hanya perlu bagi orang asing"], 2, "Teks menyebut 明確に伝えることは、冷たいことではありません。むしろ、誤解を防ぎ…."],
      ["Mengapa penulis memakai むしろ pada paragraf kedua?", ["Untuk memperbaiki kesan yang mungkin timbul dari kalimat sebelumnya", "Untuk menyatakan pengecualian", "Untuk menyimpulkan", "Untuk memberi contoh"], 0, "むしろ menegaskan koreksi: 'bukan seperti dugaan itu, justru sebaliknya', sehingga memperbaiki kesan negatif dari kalimat sebelumnya."],
    ],
    7,
  ),
  passage(
    "r-n1-1",
    "N1",
    "Makna Diam",
    "沈黙の重み",
    "Esai abstrak tentang peran keheningan dalam percakapan dan bahayanya bergantung pada kesepahaman yang tidak diucapkan.",
    "{私|わたし}たちは{日常|にちじょう}の{会話|かいわ}において、{言葉|ことば}そのものよりも、{背後|はいご}の{沈黙|ちんもく}や{間|ま}から{多|おお}くの{情報|じょうほう}を{受|う}け{取|と}っている。{日本語|にほんご}では、{相手|あいて}の{状況|じょうきょう}を{考|かんが}えながら{発言|はつげん}を{控|ひか}えることが{礼儀|れいぎ}とされるため、{無言|むごん}の{時間|じかん}が{必|かなら}ずしも{拒絶|きょぜつ}や{無関心|むかんしん}を{意味|いみ}するわけではない。\n\nもっとも、{沈黙|ちんもく}に{依存|いぞん}しすぎる{伝達|でんたつ}は、{共有|きょうゆう}されていない{前提|ぜんてい}の{上|うえ}に{成|な}り{立|た}っている{危|あや}うさを{抱|かか}えている。{異|こと}なる{文化|ぶんか}や{世代|せだい}の{人|ひと}と{向|む}き{合|あ}うとき、{私|わたし}たちは{沈黙|ちんもく}の{意味|いみ}を{過大|かだい}に{評価|ひょうか}しない{慎重|しんちょう}さと、{言葉|ことば}に{変|か}える{勇気|ゆうき}の{両方|りょうほう}を{持|も}つべきだろう。",
    [
      "Dalam percakapan sehari-hari, kita menerima lebih banyak informasi dari keheningan dan jeda di balik kata-kata daripada dari kata-kata itu sendiri. Khususnya dalam bahasa Jepang, karena menahan diri untuk berbicara sambil mempertimbangkan keadaan lawan bicara dianggap sebagai sopan santun, waktu tanpa suara tidak selalu berarti penolakan atau ketidakpedulian.",
      "Meskipun begitu, komunikasi yang terlalu bergantung pada keheningan mengandung bahaya karena berdiri di atas prasyarat yang tidak pernah dibagikan bersama. Ketika berhadapan dengan orang dari budaya atau generasi yang berbeda, kita sebaiknya memiliki keduanya: kehati-hatian agar tidak menilai makna keheningan secara berlebihan, dan keberanian untuk mengubahnya menjadi kata-kata.",
    ],
    [
      ["沈黙", "ちんもく", "keheningan / diam"],
      ["間", "ま", "jeda"],
      ["無関心", "むかんしん", "tidak peduli"],
      ["前提", "ぜんてい", "prasyarat / asumsi dasar"],
      ["過大", "かだい", "berlebihan"],
      ["慎重", "しんちょう", "hati-hati"],
    ],
    [
      ["Apa makna 無言の時間 dalam teks?", ["Waktu yang selalu berarti penolakan", "Waktu diam yang belum tentu berarti penolakan atau ketidakpedulian", "Waktu untuk berbicara keras", "Waktu istirahat kerja"], 1, "Teks menegaskan 無言の時間が必ずしも拒絶や無関心を意味するわけではない."],
      ["Apa bahaya yang disebutkan pada paragraf kedua?", ["Keheningan membuat orang bosan", "Komunikasi yang terlalu bergantung pada keheningan berdiri di atas asumsi yang tidak dibagi bersama", "Orang Jepang terlalu banyak bicara", "Keheningan membuat bahasa hilang"], 1, "Teks menyebut 共有されていない前提の上に成り立っている危うさ."],
      ["Apa nada keseluruhan esai ini?", ["Menolak budaya diam sepenuhnya", "Mengagumi diam tanpa syarat", "Menimbang dua sisi dan menyarankan keseimbangan", "Menjelaskan tata bahasa Jepang"], 2, "Penulis menunjukkan nilai keheningan sekaligus bahayanya, lalu menyarankan memiliki keduanya (慎重さと勇気)."],
    ],
    8,
  ),
];

export const READING_BY_ID: Map<string, ReadingPassage> = new Map(
  READING.map((item) => [item.id, item] as const),
);
