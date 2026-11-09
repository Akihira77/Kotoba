import type { Kanji, JLPTLevel } from "@/lib/types";

type Ex = [word: string, reading: string, meaning: string];

function k(
  char: string,
  level: JLPTLevel,
  strokes: number,
  radical: string,
  radicalMeaning: string,
  on: string[],
  kun: string[],
  meanings: string[],
  examples: Ex[],
  mnemonic?: string,
): Kanji {
  return {
    id: "kanji-" + char,
    char,
    level,
    strokes,
    radical,
    radicalMeaning,
    on,
    kun,
    meanings,
    examples: examples.map(([word, reading, meaning]) => ({ word, reading, meaning })),
    mnemonic,
  };
}

export const KANJI: Kanji[] = [
  k("日", "N5", 4, "日", "matahari", ["ニチ", "ジツ"], ["ひ", "か"], ["hari", "matahari"], [
    ["日本", "にほん", "Jepang"],
    ["日曜日", "にちようび", "hari Minggu"],
  ], "Kotak dengan garis tengah: matahari yang bersinar."),
  k("月", "N5", 4, "月", "bulan", ["ゲツ", "ガツ"], ["つき"], ["bulan"], [
    ["月曜日", "げつようび", "hari Senin"],
    ["一月", "いちがつ", "Januari"],
  ], "Bulan sabit dengan dua garis di dalamnya."),
  k("火", "N5", 4, "火", "api", ["カ"], ["ひ"], ["api"], [
    ["火曜日", "かようび", "hari Selasa"],
    ["火山", "かざん", "gunung berapi"],
  ], "Api dengan percikan di kiri dan kanan."),
  k("水", "N5", 4, "水", "air", ["スイ"], ["みず"], ["air"], [
    ["水曜日", "すいようび", "hari Rabu"],
    ["水泳", "すいえい", "renang"],
  ], "Air memancar dari sumbernya."),
  k("木", "N5", 4, "木", "pohon", ["モク", "ボク"], ["き"], ["pohon", "kayu"], [
    ["木曜日", "もくようび", "hari Kamis"],
    ["木村さん", "きむらさん", "Kimura-san"],
  ], "Pohon dengan batang dan dua cabang."),
  k("金", "N5", 8, "金", "logam", ["キン", "コン"], ["かね"], ["emas", "uang", "logam"], [
    ["金曜日", "きんようび", "hari Jumat"],
    ["お金", "おかね", "uang"],
  ], "Butiran logam berharga di bawah atap."),
  k("土", "N5", 3, "土", "tanah", ["ド", "ト"], ["つち"], ["tanah"], [
    ["土曜日", "どようび", "hari Sabtu"],
    ["土地", "とち", "tanah / lahan"],
  ], "Tanah dengan tanaman kecil di atas."),
  k("山", "N5", 3, "山", "gunung", ["サン"], ["やま"], ["gunung"], [
    ["富士山", "ふじさん", "Gunung Fuji"],
    ["山道", "やまみち", "jalan gunung"],
  ], "Tiga puncak gunung."),
  k("川", "N5", 3, "川", "sungai", ["セン"], ["かわ"], ["sungai"], [
    ["川岸", "かわぎし", "tepi sungai"],
    ["小川", "おがわ", "sungai kecil"],
  ], "Aliran air di antara dua tepi."),
  k("田", "N5", 5, "田", "sawah", ["デン"], ["た"], ["sawah"], [
    ["田んぼ", "たんぼ", "sawah"],
    ["田中さん", "たなかさん", "Tanaka-san"],
  ], "Petak sawah dengan pembatas."),
  k("人", "N5", 2, "人", "orang", ["ジン", "ニン"], ["ひと"], ["orang"], [
    ["日本人", "にほんじん", "orang Jepang"],
    ["一人", "ひとり", "satu orang"],
  ], "Dua kaki orang yang berjalan."),
  k("大", "N5", 3, "大", "besar", ["ダイ", "タイ"], ["おお.きい"], ["besar"], [
    ["大学", "だいがく", "universitas"],
    ["大きい", "おおきい", "besar"],
  ], "Orang merentangkan tangan: besar."),
  k("小", "N5", 3, "小", "kecil", ["ショウ"], ["ちい.さい", "こ"], ["kecil"], [
    ["小学校", "しょうがっこう", "sekolah dasar"],
    ["小さい", "ちいさい", "kecil"],
  ], "Sesuatu yang kecil dengan kait di bawah."),
  k("中", "N5", 4, "丨", "garis vertikal", ["チュウ"], ["なか"], ["tengah", "dalam"], [
    ["中国", "ちゅうごく", "Tiongkok"],
    ["中村さん", "なかむらさん", "Nakamura-san"],
  ], "Garis menembus kotak: bagian dalam."),
  k("上", "N5", 3, "一", "garis", ["ジョウ"], ["うえ", "あ.げる", "のぼ.る"], ["atas", "naik"], [
    ["上手", "じょうず", "pandai"],
    ["上着", "うわぎ", "jaket"],
  ], "Garis di atas dasar: di atas."),
  k("下", "N5", 3, "一", "garis", ["カ", "ゲ"], ["した", "さ.げる", "くだ.さい"], ["bawah", "turun"], [
    ["下手", "へた", "tidak mahir"],
    ["地下鉄", "ちかてつ", "kereta bawah tanah"],
  ], "Garis di bawah: di bawah."),
  k("左", "N5", 5, "工", "pekerjaan", ["サ"], ["ひだり"], ["kiri"], [
    ["左手", "ひだりて", "tangan kiri"],
    ["左側", "ひだりがわ", "sisi kiri"],
  ], "Tangan yang membantu di sisi kiri."),
  k("右", "N5", 5, "口", "mulut", ["ウ", "ユウ"], ["みぎ"], ["kanan"], [
    ["右手", "みぎて", "tangan kanan"],
    ["右側", "みぎがわ", "sisi kanan"],
  ], "Mulut di bawah tangan: sisi kanan."),
  k("前", "N5", 9, "刀", "pisau", ["ゼン"], ["まえ"], ["depan", "sebelum"], [
    ["名前", "なまえ", "nama"],
    ["午前", "ごぜん", "AM / pagi"],
  ], "Pisau dan bulan di depan."),
  k("後", "N5", 9, "彳", "langkah", ["ゴ", "コウ"], ["うし.ろ", "あと", "のち"], ["belakang", "setelah"], [
    ["午後", "ごご", "PM / sore"],
    ["後ろ", "うしろ", "belakang"],
  ], "Langkah kaki yang tertinggal di belakang."),
  k("一", "N5", 1, "一", "satu", ["イチ", "イツ"], ["ひと"], ["satu"], [
    ["一つ", "ひとつ", "satu (benda)"],
    ["一人", "ひとり", "satu orang"],
  ], "Satu garis."),
  k("二", "N5", 2, "二", "dua", ["ニ"], ["ふた"], ["dua"], [
    ["二人", "ふたり", "dua orang"],
    ["二階", "にかい", "lantai dua"],
  ], "Dua garis."),
  k("三", "N5", 3, "一", "garis", ["サン"], ["み"], ["tiga"], [
    ["三月", "さんがつ", "Maret"],
    ["三つ", "みっつ", "tiga (benda)"],
  ], "Tiga garis."),
  k("四", "N5", 5, "囗", "kotak", ["シ"], ["よん", "よ"], ["empat"], [
    ["四月", "しがつ", "April"],
    ["四つ", "よっつ", "empat (benda)"],
  ], "Empat sisi di dalam kotak."),
  k("五", "N5", 4, "二", "dua", ["ゴ"], ["いつ"], ["lima"], [
    ["五月", "ごがつ", "Mei"],
    ["五つ", "いつつ", "lima (benda)"],
  ], "Lima dengan dua garis dan kait."),
  k("六", "N5", 4, "八", "delapan", ["ロク"], ["む"], ["enam"], [
    ["六月", "ろくがつ", "Juni"],
    ["六つ", "むっつ", "enam (benda)"],
  ], "Atap dengan dua kaki: enam."),
  k("七", "N5", 2, "一", "garis", ["シチ"], ["なな"], ["tujuh"], [
    ["七月", "しちがつ", "Juli"],
    ["七つ", "ななつ", "tujuh (benda)"],
  ], "Garis yang dibengkokkan: tujuh."),
  k("八", "N5", 2, "八", "delapan", ["ハチ"], ["や"], ["delapan"], [
    ["八月", "はちがつ", "Agustus"],
    ["八つ", "やっつ", "delapan (benda)"],
  ], "Dua garis terbuka ke bawah: delapan."),
  k("九", "N5", 2, "乙", "bengkok", ["キュウ", "ク"], ["ここの"], ["sembilan"], [
    ["九月", "くがつ", "September"],
    ["九つ", "ここのつ", "sembilan (benda)"],
  ], "Angka sembilan dengan ekor melengkung."),
  k("十", "N5", 2, "十", "sepuluh", ["ジュウ"], ["とお"], ["sepuluh"], [
    ["十月", "じゅうがつ", "Oktober"],
    ["十日", "とおか", "tanggal 10"],
  ], "Silang: sepuluh."),
  k("百", "N5", 6, "白", "putih", ["ヒャク"], ["もも"], ["seratus"], [
    ["百円", "ひゃくえん", "100 yen"],
    ["三百", "さんびゃく", "300"],
  ], "Satu dengan kotak putih: seratus."),
  k("千", "N5", 3, "十", "sepuluh", ["セン"], ["ち"], ["seribu"], [
    ["千円", "せんえん", "1.000 yen"],
    ["三千", "さんぜん", "3.000"],
  ], "Sepuluh dengan garis miring: seribu."),
  k("万", "N5", 3, "一", "garis", ["マン"], ["よろず"], ["sepuluh ribu"], [
    ["一万円", "いちまんえん", "10.000 yen"],
    ["万年筆", "まんねんひつ", "fountain pen"],
  ], "Sepuluh ribu adalah banyak; bentuknya seperti sayap."),
  k("円", "N5", 4, "冂", "kotak", ["エン"], ["まる.い"], ["lingkaran", "yen"], [
    ["円い", "まるい", "bulat"],
    ["百円", "ひゃくえん", "100 yen"],
  ], "Koin bundar: yen."),
  k("年", "N5", 6, "干", "kering", ["ネン"], ["とし"], ["tahun"], [
    ["今年", "ことし", "tahun ini"],
    ["去年", "きょねん", "tahun lalu"],
  ], "Panen setiap tahun."),
  k("時", "N5", 10, "日", "matahari", ["ジ"], ["とき"], ["waktu", "jam"], [
    ["時間", "じかん", "waktu"],
    ["時計", "とけい", "jam"],
  ], "Matahari dan kuil: waktu."),
  k("分", "N5", 4, "刀", "pisau", ["フン", "ブン"], ["わ.ける"], ["menit", "membagi"], [
    ["五分", "ごふん", "lima menit"],
    ["分かる", "わかる", "mengerti"],
  ], "Pisau membagi sesuatu: menit."),
  k("半", "N5", 5, "十", "sepuluh", ["ハン"], ["なか.ば"], ["setengah"], [
    ["半分", "はんぶん", "setengah"],
    ["三時半", "さんじはん", "pukul 3.30"],
  ], "Garis membagi sepuluh menjadi setengah."),
  k("今", "N5", 4, "人", "orang", ["コン", "キン"], ["いま"], ["sekarang"], [
    ["今日", "きょう", "hari ini"],
    ["今週", "こんしゅう", "minggu ini"],
  ], "Saat ini, di bawah atap."),
  k("何", "N5", 7, "人", "orang", ["カ"], ["なに", "なん"], ["apa"], [
    ["何時", "なんじ", "jam berapa"],
    ["何か", "なにか", "sesuatu"],
  ], "Orang yang bertanya: apa?"),
  k("私", "N5", 7, "禾", "padi", ["シ"], ["わたし"], ["saya"], [
    ["私立", "しりつ", "swasta"],
    ["私たち", "わたしたち", "kami"],
  ], "Padi yang dipeluk: milik saya."),
  k("男", "N5", 7, "田", "sawah", ["ダン", "ナン"], ["おとこ"], ["laki-laki"], [
    ["男の子", "おとこのこ", "anak laki-laki"],
    ["男性", "だんせい", "pria"],
  ], "Tenaga di sawah: laki-laki."),
  k("女", "N5", 3, "女", "perempuan", ["ジョ"], ["おんな"], ["perempuan"], [
    ["女の子", "おんなのこ", "anak perempuan"],
    ["女性", "じょせい", "wanita"],
  ], "Bentuk duduk anggun: perempuan."),
  k("子", "N5", 3, "子", "anak", ["シ"], ["こ"], ["anak"], [
    ["子供", "こども", "anak"],
    ["子犬", "こいぬ", "anak anjing"],
  ], "Bayi dengan tangan terentang."),
  k("父", "N5", 4, "父", "ayah", ["フ"], ["ちち"], ["ayah"], [
    ["お父さん", "おとうさん", "ayah (sapaan)"],
    ["父親", "ちちおや", "ayah"],
  ], "Dua garis bersilang: figur ayah."),
  k("母", "N5", 5, "母", "ibu", ["ボ"], ["はは"], ["ibu"], [
    ["お母さん", "おかあさん", "ibu (sapaan)"],
    ["母親", "ははおや", "ibu"],
  ], "Dua titik seperti payudara: ibu."),
  k("友", "N5", 4, "又", "tangan kanan", ["ユウ"], ["とも"], ["teman"], [
    ["友達", "ともだち", "teman"],
    ["親友", "しんゆう", "sahabat"],
  ], "Dua tangan yang saling menggenggam."),
  k("学", "N5", 8, "子", "anak", ["ガク"], ["まな.ぶ"], ["belajar", "ilmu"], [
    ["学生", "がくせい", "pelajar"],
    ["学校", "がっこう", "sekolah"],
  ], "Anak di bawah atap belajar."),
  k("校", "N5", 10, "木", "pohon", ["コウ"], [], ["sekolah"], [
    ["学校", "がっこう", "sekolah"],
    ["校長", "こうちょう", "kepala sekolah"],
  ], "Bangunan kayu tempat belajar."),
  k("生", "N5", 5, "生", "hidup", ["セイ", "ショウ"], ["い.きる", "う.まれる", "なま"], ["hidup", "lahir", "mentah"], [
    ["先生", "せんせい", "guru"],
    ["生活", "せいかつ", "kehidupan"],
  ], "Tunas yang tumbuh dari tanah: hidup."),
  k("先", "N5", 6, "儿", "kaki orang", ["セン"], ["さき"], ["dahulu", "depan"], [
    ["先生", "せんせい", "guru"],
    ["先週", "せんしゅう", "minggu lalu"],
  ], "Orang yang berjalan lebih dulu."),
  k("語", "N5", 14, "言", "kata", ["ゴ"], ["かた.る"], ["bahasa", "kata"], [
    ["日本語", "にほんご", "bahasa Jepang"],
    ["英語", "えいご", "bahasa Inggris"],
  ], "Kata-kata yang diucapkan: bahasa."),
  k("本", "N5", 5, "木", "pohon", ["ホン"], ["もと"], ["buku", "asal"], [
    ["日本", "にほん", "Jepang"],
    ["本屋", "ほんや", "toko buku"],
  ], "Pohon dengan garis akar: asal."),
  k("名", "N5", 6, "口", "mulut", ["メイ", "ミョウ"], ["な"], ["nama"], [
    ["名前", "なまえ", "nama"],
    ["有名", "ゆうめい", "terkenal"],
  ], "Mulut di malam hari menyebut nama."),
  k("白", "N5", 5, "白", "putih", ["ハク", "ビャク"], ["しろ"], ["putih"], [
    ["白い", "しろい", "putih"],
    ["白鳥", "はくちょう", "angsa"],
  ], "Matahari dengan sinar putih."),
  k("天", "N5", 4, "大", "besar", ["テン"], ["あま", "あめ"], ["langit"], [
    ["天気", "てんき", "cuaca"],
    ["天国", "てんごく", "surga"],
  ], "Orang besar di atas: langit."),
  k("気", "N5", 6, "气", "uap", ["キ", "ケ"], [], ["semangat", "udara", "perasaan"], [
    ["元気", "げんき", "sehat"],
    ["気持ち", "きもち", "perasaan"],
  ], "Uap yang naik: energi."),
  k("雨", "N5", 8, "雨", "hujan", ["ウ"], ["あめ"], ["hujan"], [
    ["大雨", "おおあめ", "hujan lebat"],
    ["雨具", "あまぐ", "perlengkapan hujan"],
  ], "Atap dengan tetesan air: hujan."),
  k("空", "N5", 8, "穴", "lubang", ["クウ"], ["そら", "あ.く", "から"], ["langit", "kosong"], [
    ["空気", "くうき", "udara"],
    ["青空", "あおぞら", "langit biru"],
  ], "Rongga di atas: langit yang kosong."),
  k("花", "N5", 7, "艹", "rumput", ["カ"], ["はな"], ["bunga"], [
    ["花見", "はなみ", "hanami"],
    ["花瓶", "かびん", "vas bunga"],
  ], "Tumbuhan yang berubah: bunga."),
  k("犬", "N5", 4, "犬", "anjing", ["ケン"], ["いぬ"], ["anjing"], [
    ["犬", "いぬ", "anjing"],
    ["子犬", "こいぬ", "anak anjing"],
  ], "Titik kecil seperti moncong: anjing."),
  k("魚", "N5", 11, "魚", "ikan", ["ギョ"], ["さかな"], ["ikan"], [
    ["金魚", "きんぎょ", "ikan mas"],
    ["魚屋", "さかなや", "toko ikan"],
  ], "Kepala, badan, dan ekor ikan."),
  k("鳥", "N5", 11, "鳥", "burung", ["チョウ"], ["とり"], ["burung"], [
    ["小鳥", "ことり", "burung kecil"],
    ["鳥肉", "とりにく", "daging ayam"],
  ], "Burung dengan sayap dan ekor."),
  k("肉", "N5", 6, "肉", "daging", ["ニク"], [], ["daging"], [
    ["牛肉", "ぎゅうにく", "daging sapi"],
    ["肉屋", "にくや", "toko daging"],
  ], "Potongan daging di dalam pagar."),
  k("食", "N5", 9, "食", "makan", ["ショク"], ["た.べる"], ["makan"], [
    ["食べ物", "たべもの", "makanan"],
    ["食堂", "しょくどう", "kantin"],
  ], "Atap dan mangkuk: makan."),

  k("飲", "N4", 12, "食", "makan", ["イン"], ["の.む"], ["minum"], [
    ["飲み物", "のみもの", "minuman"],
    ["飲食", "いんしょく", "makan dan minum"],
  ], "Makanan dengan air: minum."),
  k("見", "N4", 7, "見", "melihat", ["ケン"], ["み.る"], ["melihat"], [
    ["見る", "みる", "melihat"],
    ["花見", "はなみ", "hanami"],
  ], "Mata di atas kaki: melihat."),
  k("聞", "N4", 14, "門", "gerbang", ["ブン"], ["き.く"], ["mendengar", "bertanya"], [
    ["聞く", "きく", "mendengar / bertanya"],
    ["新聞", "しんぶん", "koran"],
  ], "Telinga di pintu: mendengar."),
  k("話", "N4", 13, "言", "kata", ["ワ"], ["はな.す", "はなし"], ["berbicara", "cerita"], [
    ["話す", "はなす", "berbicara"],
    ["電話", "でんわ", "telepon"],
  ], "Kata-kata keluar dari mulut: bicara."),
  k("読", "N4", 14, "言", "kata", ["ドク"], ["よ.む"], ["membaca"], [
    ["読む", "よむ", "membaca"],
    ["読書", "どくしょ", "membaca buku"],
  ], "Kata-kata yang dijual: membaca."),
  k("書", "N4", 10, "曰", "berkata", ["ショ"], ["か.く"], ["menulis"], [
    ["書く", "かく", "menulis"],
    ["辞書", "じしょ", "kamus"],
  ], "Kuas dan kertas: menulis."),
  k("行", "N4", 6, "行", "berjalan", ["コウ", "ギョウ"], ["い.く", "ゆ.く", "おこな.う"], ["pergi", "melakukan"], [
    ["行く", "いく", "pergi"],
    ["銀行", "ぎんこう", "bank"],
  ], "Dua langkah di persimpangan: pergi."),
  k("来", "N4", 7, "木", "pohon", ["ライ"], ["く.る", "き", "こ"], ["datang"], [
    ["来る", "くる", "datang"],
    ["来週", "らいしゅう", "minggu depan"],
  ], "Pohon dengan buah yang akan datang."),
  k("出", "N4", 5, "凵", "wadah", ["シュツ"], ["で.る", "だ.す"], ["keluar"], [
    ["出す", "だす", "mengeluarkan"],
    ["出口", "でぐち", "pintu keluar"],
  ], "Gunung di atas gunung: keluar."),
  k("入", "N4", 2, "入", "masuk", ["ニュウ"], ["い.れる", "はい.る"], ["masuk"], [
    ["入る", "はいる", "masuk"],
    ["入口", "いりぐち", "pintu masuk"],
  ], "Atap yang terbuka ke bawah: masuk."),
  k("休", "N4", 6, "亻", "orang", ["キュウ"], ["やす.む"], ["istirahat"], [
    ["休む", "やすむ", "beristirahat"],
    ["休み", "やすみ", "libur"],
  ], "Orang bersandar pada pohon: istirahat."),
  k("買", "N4", 12, "貝", "kerang", ["バイ"], ["か.う"], ["membeli"], [
    ["買う", "かう", "membeli"],
    ["買い物", "かいもの", "belanja"],
  ], "Kerang dan jaring: membeli."),
  k("教", "N4", 11, "攵", "memukul", ["キョウ"], ["おし.える", "おそ.わる"], ["mengajar"], [
    ["教える", "おしえる", "mengajar"],
    ["教室", "きょうしつ", "ruang kelas"],
  ], "Anak yang diajarkan dengan telaten."),
  k("車", "N4", 7, "車", "kendaraan", ["シャ"], ["くるま"], ["kendaraan"], [
    ["車", "くるま", "mobil"],
    ["電車", "でんしゃ", "kereta"],
  ], "Kereta dengan roda yang berputar."),
  k("駅", "N4", 14, "馬", "kuda", ["エキ"], [], ["stasiun"], [
    ["駅", "えき", "stasiun"],
    ["駅前", "えきまえ", "depan stasiun"],
  ], "Tempat kuda berhenti: stasiun."),
  k("電", "N4", 13, "雨", "hujan", ["デン"], [], ["listrik"], [
    ["電車", "でんしゃ", "kereta"],
    ["電話", "でんわ", "telepon"],
  ], "Kilat dalam hujan: listrik."),
  k("会", "N4", 6, "人", "orang", ["カイ", "エ"], ["あ.う"], ["bertemu", "perkumpulan"], [
    ["会う", "あう", "bertemu"],
    ["会社", "かいしゃ", "perusahaan"],
  ], "Orang berkumpul di bawah atap: bertemu."),
  k("社", "N4", 7, "示", "altar", ["シャ"], ["やしろ"], ["perusahaan", "kuil"], [
    ["会社", "かいしゃ", "perusahaan"],
    ["神社", "じんじゃ", "kuil Shinto"],
  ], "Altar di atas tanah: tempat berkumpul."),
  k("員", "N4", 10, "口", "mulut", ["イン"], [], ["anggota"], [
    ["会社員", "かいしゃいん", "pegawai perusahaan"],
    ["店員", "てんいん", "pramuniaga"],
  ], "Orang dengan mulut dan harta: anggota."),
  k("新", "N4", 13, "斤", "kapak", ["シン"], ["あたら.しい", "あら.た"], ["baru"], [
    ["新しい", "あたらしい", "baru"],
    ["新聞", "しんぶん", "koran"],
  ], "Kapak menebang pohon: awal yang baru."),
  k("古", "N4", 5, "口", "mulut", ["コ"], ["ふる.い"], ["lama"], [
    ["古い", "ふるい", "lama"],
    ["中古", "ちゅうこ", "barang bekas"],
  ], "Batu nisan tua: lama."),
  k("安", "N4", 6, "宀", "atap", ["アン"], ["やす.い"], ["murah", "aman"], [
    ["安い", "やすい", "murah"],
    ["安全", "あんぜん", "aman"],
  ], "Wanita di bawah atap: tenang dan murah."),
  k("高", "N4", 10, "高", "tinggi", ["コウ"], ["たか.い"], ["tinggi", "mahal"], [
    ["高い", "たかい", "tinggi / mahal"],
    ["高校", "こうこう", "SMA"],
  ], "Menara bertingkat: tinggi."),
  k("長", "N4", 8, "長", "panjang", ["チョウ"], ["なが.い"], ["panjang", "kepala"], [
    ["長い", "ながい", "panjang"],
    ["社長", "しゃちょう", "direktur utama"],
  ], "Rambut panjang: panjang."),
  k("政", "N3", 9, "攵", "memukul", ["セイ"], ["まつりごと"], ["pemerintahan", "politik"], [
    ["政治", "せいじ", "politik"],
    ["政府", "せいふ", "pemerintah"],
  ], "Tangan yang mengatur: pemerintahan."),
  k("治", "N3", 8, "氵", "air", ["ジ", "チ"], ["おさ.める", "なお.る"], ["memerintah", "menyembuhkan"], [
    ["治る", "なおる", "sembuh"],
    ["政治", "せいじ", "politik"],
  ], "Air yang menenangkan: mengatur."),
  k("経", "N3", 11, "糸", "benang", ["ケイ"], ["へ.る"], ["berlalu", "ekonomi"], [
    ["経済", "けいざい", "ekonomi"],
    ["経験", "けいけん", "pengalaman"],
  ], "Benang waktu yang berjalan."),
  k("済", "N3", 11, "氵", "air", ["サイ"], ["す.む"], ["selesai"], [
    ["済む", "すむ", "selesai"],
    ["経済", "けいざい", "ekonomi"],
  ], "Air yang tenang: urusan selesai."),
  k("法", "N3", 8, "氵", "air", ["ホウ"], [], ["hukum", "cara"], [
    ["法律", "ほうりつ", "hukum"],
    ["方法", "ほうほう", "metode"],
  ], "Air yang mengalir teratur: aturan."),
  k("律", "N3", 9, "彳", "langkah", ["リツ"], [], ["hukum", "aturan"], [
    ["法律", "ほうりつ", "hukum"],
    ["規律", "きりつ", "disiplin"],
  ], "Langkah yang teratur: aturan."),
  k("関", "N3", 14, "門", "gerbang", ["カン"], ["せき", "かか.わる"], ["terkait", "gerbang"], [
    ["関係", "かんけい", "hubungan"],
    ["関心", "かんしん", "minat"],
  ], "Gerbang yang menghubungkan: kaitan."),
  k("係", "N3", 9, "亻", "orang", ["ケイ"], ["かか.わる", "かかり"], ["hubungan", "petugas"], [
    ["関係", "かんけい", "hubungan"],
    ["係員", "かかりいん", "petugas"],
  ], "Orang yang terikat tugas: petugas."),
  k("情", "N3", 11, "忄", "hati", ["ジョウ"], ["なさ.け"], ["perasaan", "informasi"], [
    ["情報", "じょうほう", "informasi"],
    ["感情", "かんじょう", "emosi"],
  ], "Hati yang muda: perasaan."),
  k("報", "N3", 12, "土", "tanah", ["ホウ"], [], ["laporan", "membalas"], [
    ["情報", "じょうほう", "informasi"],
    ["報告", "ほうこく", "laporan"],
  ], "Memberitakan hasil panen: laporan."),
  k("問", "N3", 11, "門", "gerbang", ["モン"], ["と.う"], ["bertanya", "masalah"], [
    ["問題", "もんだい", "masalah"],
    ["質問", "しつもん", "pertanyaan"],
  ], "Mulut di gerbang: bertanya."),
  k("題", "N3", 18, "頁", "kepala", ["ダイ"], [], ["topik", "judul"], [
    ["問題", "もんだい", "masalah"],
    ["宿題", "しゅくだい", "PR"],
  ], "Halaman utama: topik."),
  k("影", "N2", 15, "彡", "rambut", ["エイ"], ["かげ"], ["bayangan"], [
    ["影響", "えいきょう", "pengaruh"],
    ["影", "かげ", "bayangan"],
  ], "Cahaya dan bayangan."),
  k("響", "N2", 20, "音", "suara", ["キョウ"], ["ひび.く"], ["gema", "berpengaruh"], [
    ["影響", "えいきょう", "pengaruh"],
    ["響く", "ひびく", "bergema"],
  ], "Suara yang bergema."),
  k("傾", "N2", 13, "亻", "orang", ["ケイ"], ["かたむ.く"], ["condong", "kecenderungan"], [
    ["傾向", "けいこう", "kecenderungan"],
    ["傾く", "かたむく", "condong"],
  ], "Orang yang miring: condong."),
  k("向", "N2", 6, "口", "mulut", ["コウ"], ["む.く"], ["arah", "menuju"], [
    ["方向", "ほうこう", "arah"],
    ["向こう", "むこう", "seberang"],
  ], "Jendela menghadap: arah."),
  k("改", "N2", 7, "攵", "memukul", ["カイ"], ["あらた.める"], ["mengubah", "memperbaiki"], [
    ["改善", "かいぜん", "perbaikan"],
    ["改札", "かいさつ", "gerbang tiket"],
  ], "Memperbaiki dengan tangan: perubahan."),
  k("善", "N2", 12, "口", "mulut", ["ゼン"], ["よ.い"], ["baik"], [
    ["改善", "かいぜん", "perbaikan"],
    ["善い", "よい", "baik"],
  ], "Kata-kata yang baik: kebaikan."),
  k("確", "N2", 15, "石", "batu", ["カク"], ["たし.か"], ["pasti", "memastikan"], [
    ["確認", "かくにん", "konfirmasi"],
    ["確か", "たしか", "pasti"],
  ], "Batu yang kokoh: pasti."),
  k("貢", "N1", 10, "貝", "kerang", ["コウ"], ["みつ.ぐ"], ["kontribusi", "persembahan"], [
    ["貢献", "こうけん", "kontribusi"],
    ["貢ぐ", "みつぐ", "menopang secara finansial"],
  ], "Persembahan harta: kontribusi."),
  k("献", "N1", 13, "犬", "anjing", ["ケン"], ["たてまつ.る"], ["persembahan", "kontribusi"], [
    ["貢献", "こうけん", "kontribusi"],
    ["献立", "こんだて", "menu"],
  ], "Persembahan yang tulus: dedikasi."),
  k("概", "N1", 14, "木", "pohon", ["ガイ"], ["おおむ.ね"], ["garis besar"], [
    ["概念", "がいねん", "konsep"],
    ["概要", "がいよう", "ringkasan"],
  ], "Garis besar bagan: gambaran umum."),
];

export const KANJI_BY_CHAR = new Map(KANJI.map((item) => [item.char, item]));
export const KANJI_BY_ID = new Map(KANJI.map((item) => [item.id, item]));
