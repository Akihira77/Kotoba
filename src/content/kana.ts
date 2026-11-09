import type { Kana, KanaGroup, KanaScript } from "@/lib/types";

type Vowel = "a" | "i" | "u" | "e" | "o" | "n";
type ExampleSeed = [word: string, reading: string | null, romaji: string, meaning: string];
type Seed = [char: string, romaji: string, row: string, vowel: Vowel, examples: ExampleSeed[]];

const ex = (seed: ExampleSeed) => ({
  word: seed[0],
  reading: seed[1] ?? undefined,
  romaji: seed[2],
  meaning: seed[3],
});

const HIRAGANA_MNEMONIC: Record<string, string> = {
  "あ": "Seperti huruf A yang duduk santai.",
  "い": "Dua garis seperti sepasang sumpit.",
  "う": "Angka 3 dengan ekor kecil di atas.",
  "え": "Orang mengangkat tangan sambil berkata 'eh'.",
  "お": "Huruf O dengan topi dan ekor melengkung.",
  "か": "Huruf K dengan garis patah seperti pedang.",
  "き": "Kunci (key) dengan dua gigi.",
  "く": "Mulut yang tersenyum miring.",
  "け": "Huruf K yang diberi satu garis tambahan.",
  "こ": "Dua garis pendek seperti dua roti.",
  "さ": "Huruf S dengan garis melengkung.",
  "し": "Kail pancing yang melengkung.",
  "す": "Angka 8 dengan ekor panjang.",
  "せ": "Huruf S dengan garis tegak.",
  "そ": "Seperti huruf Z yang melengkung.",
  "た": "Huruf T dengan dua garis bawah.",
  "ち": "Seperti angka 5 dengan lengkung.",
  "つ": "Gelombang kecil seperti ombak.",
  "て": "Seperti tangan yang melambai.",
  "と": "Seperti huruf T dengan ekor.",
  "な": "Huruf N dengan simpul kecil.",
  "に": "Dua garis vertikal dengan lengkung.",
  "ぬ": "Huruf N dengan ekor berputar seperti mi.",
  "ね": "Seperti angka 7 dengan lingkaran.",
  "の": "Spiral seperti huruf 'no' yang berputar.",
  "は": "Huruf H dengan lengkung di kanan.",
  "ひ": "Seperti senyum lebar.",
  "ふ": "Seperti gunung Fuji dengan dua awan.",
  "へ": "Seperti atap rumah sederhana.",
  "ほ": "Huruf H dengan dua garis horizontal.",
  "ま": "Seperti angka 5 dengan lingkaran.",
  "み": "Seperti huruf M yang melengkung.",
  "む": "Seperti angka 3 dengan ekor melingkar.",
  "め": "Seperti mata (me) dengan kelopak.",
  "も": "Seperti huruf M dengan dua garis.",
  "や": "Seperti huruf Y dengan simpul.",
  "ゆ": "Seperti kail dengan lingkaran.",
  "よ": "Seperti huruf Y dengan garis horizontal.",
  "ら": "Seperti huruf R yang melengkung.",
  "り": "Dua garis vertikal seperti dua batang.",
  "る": "Seperti angka 6 dengan ekor melingkar.",
  "れ": "Seperti huruf R dengan ekor melengkung.",
  "ろ": "Seperti huruf R tanpa lingkaran.",
  "わ": "Seperti huruf W yang melengkung.",
  "を": "Seperti huruf W dengan ekor melingkar.",
  "ん": "Seperti huruf N yang melengkung.",
};

const KATAKANA_MNEMONIC: Record<string, string> = {
  "ア": "Huruf A yang miring.",
  "イ": "Dua garis bersudut seperti orang berdiri.",
  "ウ": "Atap rumah dengan garis kecil di atas.",
  "エ": "Huruf E versi lurus.",
  "オ": "Huruf O dengan garis menyilang.",
  "カ": "Huruf K yang tegas dan bersudut.",
  "キ": "Kunci dengan dua gigi lurus.",
  "ク": "Sudut tajam seperti paruh burung.",
  "ケ": "Huruf K dengan garis miring.",
  "コ": "Dua garis bersudut seperti sudut kotak.",
  "サ": "Huruf S bersudut dengan garis miring.",
  "シ": "Tiga garis miring seperti hujan.",
  "ス": "Seperti huruf S yang patah.",
  "セ": "Huruf S dengan garis tegak.",
  "ソ": "Dua garis seperti angsa.",
  "タ": "Huruf T dengan garis miring.",
  "チ": "Huruf T dengan garis atas miring.",
  "ツ": "Tiga garis seperti ombak.",
  "テ": "Huruf T dengan garis bawah.",
  "ト": "Huruf T dengan garis kecil.",
  "ナ": "Huruf N dengan garis silang.",
  "ニ": "Dua garis horizontal (dua).",
  "ヌ": "Seperti huruf N dengan ekor.",
  "ネ": "Huruf N dengan garis tambahan.",
  "ノ": "Garis miring sederhana.",
  "ハ": "Dua garis seperti huruf H tanpa batang.",
  "ヒ": "Huruf H dengan garis lengkung.",
  "フ": "Seperti kail atau huruf F tanpa garis atas.",
  "ヘ": "Seperti atap miring.",
  "ホ": "Huruf H dengan garis silang.",
  "マ": "Huruf M dengan sudut.",
  "ミ": "Tiga garis miring (tiga).",
  "ム": "Seperti segitiga dengan ekor.",
  "メ": "Silang seperti huruf X.",
  "モ": "Huruf M dengan dua garis.",
  "ヤ": "Huruf Y dengan sudut.",
  "ユ": "Seperti huruf U dengan garis tengah.",
  "ヨ": "Seperti huruf E tanpa garis atas.",
  "ラ": "Huruf R bersudut.",
  "リ": "Dua garis vertikal.",
  "ル": "Seperti huruf R dengan ekor.",
  "レ": "Seperti huruf L bersudut.",
  "ロ": "Kotak seperti huruf O persegi.",
  "ワ": "Seperti huruf W bersudut.",
  "ヲ": "Huruf W dengan garis bawah; jarang dipakai.",
  "ン": "Dua garis miring seperti huruf N.",
};

const HIRAGANA_BASIC: Seed[] = [
  ["あ", "a", "a", "a", [["あめ", null, "ame", "hujan"]]],
  ["い", "i", "a", "i", [["いぬ", null, "inu", "anjing"]]],
  ["う", "u", "a", "u", [["うみ", null, "umi", "laut"]]],
  ["え", "e", "a", "e", [["えき", "駅", "eki", "stasiun"]]],
  ["お", "o", "a", "o", [["おちゃ", "お茶", "ocha", "teh"]]],
  ["か", "ka", "ka", "a", [["かさ", "傘", "kasa", "payung"]]],
  ["き", "ki", "ka", "i", [["き", "木", "ki", "pohon"]]],
  ["く", "ku", "ka", "u", [["くつ", "靴", "kutsu", "sepatu"]]],
  ["け", "ke", "ka", "e", [["けいたい", "携帯", "keitai", "ponsel"]]],
  ["こ", "ko", "ka", "o", [["こども", "子ども", "kodomo", "anak"]]],
  ["さ", "sa", "sa", "a", [["さくら", "桜", "sakura", "sakura"]]],
  ["し", "shi", "sa", "i", [["しお", "塩", "shio", "garam"]]],
  ["す", "su", "sa", "u", [["すし", "寿司", "sushi", "sushi"]]],
  ["せ", "se", "sa", "e", [["せかい", "世界", "sekai", "dunia"]]],
  ["そ", "so", "sa", "o", [["そら", "空", "sora", "langit"]]],
  ["た", "ta", "ta", "a", [["たまご", "卵", "tamago", "telur"]]],
  ["ち", "chi", "ta", "i", [["ちず", "地図", "chizu", "peta"]]],
  ["つ", "tsu", "ta", "u", [["つき", "月", "tsuki", "bulan"]]],
  ["て", "te", "ta", "e", [["て", "手", "te", "tangan"]]],
  ["と", "to", "ta", "o", [["とり", "鳥", "tori", "burung"]]],
  ["な", "na", "na", "a", [["なつ", "夏", "natsu", "musim panas"]]],
  ["に", "ni", "na", "i", [["にく", "肉", "niku", "daging"]]],
  ["ぬ", "nu", "na", "u", [["ぬの", "布", "nuno", "kain"]]],
  ["ね", "ne", "na", "e", [["ねこ", "猫", "neko", "kucing"]]],
  ["の", "no", "na", "o", [["のり", "海苔", "nori", "rumput laut"]]],
  ["は", "ha", "ha", "a", [["はな", "花", "hana", "bunga"]]],
  ["ひ", "hi", "ha", "i", [["ひこうき", "飛行機", "hikouki", "pesawat terbang"]]],
  ["ふ", "fu", "ha", "u", [["ふゆ", "冬", "fuyu", "musim dingin"]]],
  ["へ", "he", "ha", "e", [["へや", "部屋", "heya", "kamar"]]],
  ["ほ", "ho", "ha", "o", [["ほし", "星", "hoshi", "bintang"]]],
  ["ま", "ma", "ma", "a", [["まど", "窓", "mado", "jendela"]]],
  ["み", "mi", "ma", "i", [["みず", "水", "mizu", "air"]]],
  ["む", "mu", "ma", "u", [["むし", "虫", "mushi", "serangga"]]],
  ["め", "me", "ma", "e", [["め", "目", "me", "mata"]]],
  ["も", "mo", "ma", "o", [["もり", "森", "mori", "hutan"]]],
  ["や", "ya", "ya", "a", [["やま", "山", "yama", "gunung"]]],
  ["ゆ", "yu", "ya", "u", [["ゆき", "雪", "yuki", "salju"]]],
  ["よ", "yo", "ya", "o", [["よる", "夜", "yoru", "malam"]]],
  ["ら", "ra", "ra", "a", [["らいねん", "来年", "rainen", "tahun depan"]]],
  ["り", "ri", "ra", "i", [["りんご", "林檎", "ringo", "apel"]]],
  ["る", "ru", "ra", "u", [["くるま", "車", "kuruma", "mobil"]]],
  ["れ", "re", "ra", "e", [["れきし", "歴史", "rekishi", "sejarah"]]],
  ["ろ", "ro", "ra", "o", [["ろく", "六", "roku", "enam"]]],
  ["わ", "wa", "wa", "a", [["わたし", "私", "watashi", "saya"]]],
  ["を", "o", "wa", "o", [["ほんを よむ", "本を読む", "hon o yomu", "membaca buku"]]],
  ["ん", "n", "n", "n", [["ほん", "本", "hon", "buku"]]],
];

const HIRAGANA_DAKUTEN: Seed[] = [
  ["が", "ga", "ga", "a", [["がっこう", "学校", "gakkou", "sekolah"]]],
  ["ぎ", "gi", "ga", "i", [["ぎん", "銀", "gin", "perak"]]],
  ["ぐ", "gu", "ga", "u", [["ぐあい", "具合", "guai", "kondisi"]]],
  ["げ", "ge", "ga", "e", [["げんき", "元気", "genki", "sehat"]]],
  ["ご", "go", "ga", "o", [["ごはん", "ご飯", "gohan", "nasi"]]],
  ["ざ", "za", "za", "a", [["ざっし", "雑誌", "zasshi", "majalah"]]],
  ["じ", "ji", "za", "i", [["じかん", "時間", "jikan", "waktu"]]],
  ["ず", "zu", "za", "u", [["ずつう", "頭痛", "zutsuu", "sakit kepala"]]],
  ["ぜ", "ze", "za", "e", [["ぜんぶ", "全部", "zenbu", "semua"]]],
  ["ぞ", "zo", "za", "o", [["ぞう", "象", "zou", "gajah"]]],
  ["だ", "da", "da", "a", [["だいがく", "大学", "daigaku", "universitas"]]],
  ["ぢ", "ji", "da", "i", [["ちぢむ", "縮む", "chijimu", "menyusut"]]],
  ["づ", "zu", "da", "u", [["つづく", "続く", "tsuzuku", "berlanjut"]]],
  ["で", "de", "da", "e", [["でんしゃ", "電車", "densha", "kereta"]]],
  ["ど", "do", "da", "o", [["どうぶつ", "動物", "doubutsu", "hewan"]]],
  ["ば", "ba", "ba", "a", [["ばんごう", "番号", "bangou", "nomor"]]],
  ["び", "bi", "ba", "i", [["びょういん", "病院", "byouin", "rumah sakit"]]],
  ["ぶ", "bu", "ba", "u", [["ぶた", "豚", "buta", "babi"]]],
  ["べ", "be", "ba", "e", [["べんきょう", "勉強", "benkyou", "belajar"]]],
  ["ぼ", "bo", "ba", "o", [["ぼうし", "帽子", "boushi", "topi"]]],
];

const HIRAGANA_HANDAKUTEN: Seed[] = [
  ["ぱ", "pa", "pa", "a", [["ぱらぱら", null, "parapara", "rintik-rintik"]]],
  ["ぴ", "pi", "pa", "i", [["ぴかぴか", null, "pikapika", "berkilau"]]],
  ["ぷ", "pu", "pa", "u", [["ぷかぷか", null, "pukapuka", "mengapung"]]],
  ["ぺ", "pe", "pa", "e", [["ぺらぺら", null, "perapera", "fasih berbicara"]]],
  ["ぽ", "po", "pa", "o", [["ぽかぽか", null, "pokapoka", "hangat"]]],
];

const HIRAGANA_YOON: Seed[] = [
  ["きゃ", "kya", "kya", "a", [["きゃく", "客", "kyaku", "tamu"]]],
  ["きゅ", "kyu", "kya", "u", [["きゅうり", "胡瓜", "kyuuri", "mentimun"]]],
  ["きょ", "kyo", "kya", "o", [["きょう", "今日", "kyou", "hari ini"]]],
  ["しゃ", "sha", "sha", "a", [["しゃしん", "写真", "shashin", "foto"]]],
  ["しゅ", "shu", "sha", "u", [["しゅみ", "趣味", "shumi", "hobi"]]],
  ["しょ", "sho", "sha", "o", [["しょくどう", "食堂", "shokudou", "kantin"]]],
  ["ちゃ", "cha", "cha", "a", [["おちゃ", "お茶", "ocha", "teh"]]],
  ["ちゅ", "chu", "cha", "u", [["ちゅうごく", "中国", "chuugoku", "Tiongkok"]]],
  ["ちょ", "cho", "cha", "o", [["ちょっと", null, "chotto", "sebentar"]]],
  ["にゃ", "nya", "nya", "a", [["こんにゃく", "蒟蒻", "konnyaku", "konnyaku"]]],
  ["にゅ", "nyu", "nya", "u", [["にゅうがく", "入学", "nyuugaku", "masuk sekolah"]]],
  ["にょ", "nyo", "nya", "o", [["にょきにょき", null, "nyokinyoki", "muncul satu per satu"]]],
  ["ひゃ", "hya", "hya", "a", [["ひゃく", "百", "hyaku", "seratus"]]],
  ["ひゅ", "hyu", "hya", "u", []],
  ["ひょ", "hyo", "hya", "o", [["ひょう", "表", "hyou", "tabel"]]],
  ["みゃ", "mya", "mya", "a", [["みゃく", "脈", "myaku", "nadi"]]],
  ["みゅ", "myu", "mya", "u", []],
  ["みょ", "myo", "mya", "o", [["みょうじ", "名字", "myouji", "nama keluarga"]]],
  ["りゃ", "rya", "rya", "a", [["りゃくご", "略語", "ryakugo", "singkatan"]]],
  ["りゅ", "ryu", "rya", "u", [["りゅう", "龍", "ryuu", "naga"]]],
  ["りょ", "ryo", "rya", "o", [["りょこう", "旅行", "ryokou", "perjalanan"]]],
  ["ぎゃ", "gya", "gya", "a", [["ぎゃく", "逆", "gyaku", "kebalikan"]]],
  ["ぎゅ", "gyu", "gya", "u", [["ぎゅうにゅう", "牛乳", "gyuunyuu", "susu sapi"]]],
  ["ぎょ", "gyo", "gya", "o", [["ぎょぎょう", "漁業", "gyogyou", "perikanan"]]],
  ["じゃ", "ja", "ja", "a", [["じゃがいも", null, "jagaimo", "kentang"]]],
  ["じゅ", "ju", "ja", "u", [["じゅぎょう", "授業", "jugyou", "pelajaran"]]],
  ["じょ", "jo", "ja", "o", [["じょせい", "女性", "josei", "perempuan"]]],
  ["びゃ", "bya", "bya", "a", [["さんびゃく", "三百", "sanbyaku", "tiga ratus"]]],
  ["びゅ", "byu", "bya", "u", []],
  ["びょ", "byo", "bya", "o", [["びょういん", "病院", "byouin", "rumah sakit"]]],
  ["ぴゃ", "pya", "pya", "a", [["ろっぴゃく", "六百", "roppyaku", "enam ratus"]]],
  ["ぴゅ", "pyu", "pya", "u", []],
  ["ぴょ", "pyo", "pya", "o", [["ぴょんぴょん", null, "pyonpyon", "melompat-lompat"]]],
];

const KATAKANA_BASIC: Seed[] = [
  ["ア", "a", "a", "a", [["アイス", null, "aisu", "es krim"]]],
  ["イ", "i", "a", "i", [["イス", null, "isu", "kursi"]]],
  ["ウ", "u", "a", "u", [["ウイスキー", null, "uisukii", "wiski"]]],
  ["エ", "e", "a", "e", [["エレベーター", null, "erebeetaa", "lift"]]],
  ["オ", "o", "a", "o", [["オレンジ", null, "orenji", "jeruk"]]],
  ["カ", "ka", "ka", "a", [["カメラ", null, "kamera", "kamera"]]],
  ["キ", "ki", "ka", "i", [["キー", null, "kii", "kunci"]]],
  ["ク", "ku", "ka", "u", [["クラス", null, "kurasu", "kelas"]]],
  ["ケ", "ke", "ka", "e", [["ケーキ", null, "keeki", "kue"]]],
  ["コ", "ko", "ka", "o", [["コーヒー", null, "koohii", "kopi"]]],
  ["サ", "sa", "sa", "a", [["サッカー", null, "sakkaa", "sepak bola"]]],
  ["シ", "shi", "sa", "i", [["シャツ", null, "shatsu", "kemeja"]]],
  ["ス", "su", "sa", "u", [["スープ", null, "suupu", "sup"]]],
  ["セ", "se", "sa", "e", [["セーター", null, "seetaa", "sweter"]]],
  ["ソ", "so", "sa", "o", [["ソファ", null, "sofa", "sofa"]]],
  ["タ", "ta", "ta", "a", [["タクシー", null, "takushii", "taksi"]]],
  ["チ", "chi", "ta", "i", [["チーズ", null, "chiizu", "keju"]]],
  ["ツ", "tsu", "ta", "u", [["ツアー", null, "tsuaa", "tur"]]],
  ["テ", "te", "ta", "e", [["テレビ", null, "terebi", "televisi"]]],
  ["ト", "to", "ta", "o", [["トマト", null, "tomato", "tomat"]]],
  ["ナ", "na", "na", "a", [["ナイフ", null, "naifu", "pisau"]]],
  ["ニ", "ni", "na", "i", [["ニュース", null, "nyuusu", "berita"]]],
  ["ヌ", "nu", "na", "u", [["ヌードル", null, "nuudoru", "mi"]]],
  ["ネ", "ne", "na", "e", [["ネクタイ", null, "nekutai", "dasi"]]],
  ["ノ", "no", "na", "o", [["ノート", null, "nooto", "buku catatan"]]],
  ["ハ", "ha", "ha", "a", [["ハンバーガー", null, "hanbaagaa", "hamburger"]]],
  ["ヒ", "hi", "ha", "i", [["ヒーター", null, "hiitaa", "pemanas"]]],
  ["フ", "fu", "ha", "u", [["フォーク", null, "fooku", "garpu"]]],
  ["ヘ", "he", "ha", "e", [["ヘリコプター", null, "herikoputaa", "helikopter"]]],
  ["ホ", "ho", "ha", "o", [["ホテル", null, "hoteru", "hotel"]]],
  ["マ", "ma", "ma", "a", [["マンゴー", null, "mangoo", "mangga"]]],
  ["ミ", "mi", "ma", "i", [["ミルク", null, "miruku", "susu"]]],
  ["ム", "mu", "ma", "u", [["ムード", null, "muudo", "suasana"]]],
  ["メ", "me", "ma", "e", [["メニュー", null, "menyuu", "menu"]]],
  ["モ", "mo", "ma", "o", [["モデル", null, "moderu", "model"]]],
  ["ヤ", "ya", "ya", "a", [["ダイヤ", null, "daiya", "berlian"]]],
  ["ユ", "yu", "ya", "u", [["ユニフォーム", null, "yunifoomu", "seragam"]]],
  ["ヨ", "yo", "ya", "o", [["ヨーグルト", null, "yooguruto", "yogurt"]]],
  ["ラ", "ra", "ra", "a", [["ラジオ", null, "rajio", "radio"]]],
  ["リ", "ri", "ra", "i", [["リスト", null, "risuto", "daftar"]]],
  ["ル", "ru", "ra", "u", [["ルール", null, "ruuru", "aturan"]]],
  ["レ", "re", "ra", "e", [["レモン", null, "remon", "lemon"]]],
  ["ロ", "ro", "ra", "o", [["ロボット", null, "robotto", "robot"]]],
  ["ワ", "wa", "wa", "a", [["ワイン", null, "wain", "anggur"]]],
  ["ヲ", "o", "wa", "o", []],
  ["ン", "n", "n", "n", [["パン", null, "pan", "roti"]]],
];

const KATAKANA_DAKUTEN: Seed[] = [
  ["ガ", "ga", "ga", "a", [["ガラス", null, "garasu", "kaca"]]],
  ["ギ", "gi", "ga", "i", [["ギター", null, "gitaa", "gitar"]]],
  ["グ", "gu", "ga", "u", [["グラス", null, "gurasu", "gelas"]]],
  ["ゲ", "ge", "ga", "e", [["ゲーム", null, "geemu", "permainan"]]],
  ["ゴ", "go", "ga", "o", [["ゴール", null, "gooru", "gol"]]],
  ["ザ", "za", "za", "a", [["ピザ", null, "piza", "pizza"]]],
  ["ジ", "ji", "za", "i", [["ジーンズ", null, "jiinzu", "jeans"]]],
  ["ズ", "zu", "za", "u", [["ズボン", null, "zubon", "celana"]]],
  ["ゼ", "ze", "za", "e", [["ゼロ", null, "zero", "nol"]]],
  ["ゾ", "zo", "za", "o", [["ゾーン", null, "zoon", "zona"]]],
  ["ダ", "da", "da", "a", [["ダンス", null, "dansu", "tari"]]],
  ["ヂ", "ji", "da", "i", []],
  ["ヅ", "zu", "da", "u", []],
  ["デ", "de", "da", "e", [["デザイン", null, "dezain", "desain"]]],
  ["ド", "do", "da", "o", [["ドア", null, "doa", "pintu"]]],
  ["バ", "ba", "ba", "a", [["バス", null, "basu", "bus"]]],
  ["ビ", "bi", "ba", "i", [["ビル", null, "biru", "gedung"]]],
  ["ブ", "bu", "ba", "u", [["ブルー", null, "buruu", "biru"]]],
  ["ベ", "be", "ba", "e", [["ベッド", null, "beddo", "tempat tidur"]]],
  ["ボ", "bo", "ba", "o", [["ボール", null, "booru", "bola"]]],
];

const KATAKANA_HANDAKUTEN: Seed[] = [
  ["パ", "pa", "pa", "a", [["パン", null, "pan", "roti"]]],
  ["ピ", "pi", "pa", "i", [["ピアノ", null, "piano", "piano"]]],
  ["プ", "pu", "pa", "u", [["プール", null, "puuru", "kolam renang"]]],
  ["ペ", "pe", "pa", "e", [["ペン", null, "pen", "pulpen"]]],
  ["ポ", "po", "pa", "o", [["ポスト", null, "posuto", "kotak pos"]]],
];

const KATAKANA_YOON: Seed[] = [
  ["キャ", "kya", "kya", "a", [["キャンプ", null, "kyanpu", "kemah"]]],
  ["キュ", "kyu", "kya", "u", [["キュート", null, "kyuuto", "imut"]]],
  ["キョ", "kyo", "kya", "o", [["キョロキョロ", null, "kyorokyoro", "melihat sekeliling"]]],
  ["シャ", "sha", "sha", "a", [["シャワー", null, "shawaa", "pancuran"]]],
  ["シュ", "shu", "sha", "u", [["シュークリーム", null, "shuukuriimu", "kue sus"]]],
  ["ショ", "sho", "sha", "o", [["ショップ", null, "shoppu", "toko"]]],
  ["チャ", "cha", "cha", "a", [["チャンス", null, "chansu", "kesempatan"]]],
  ["チュ", "chu", "cha", "u", [["チューリップ", null, "chuurippu", "tulip"]]],
  ["チョ", "cho", "cha", "o", [["チョコレート", null, "chokoreeto", "cokelat"]]],
  ["ニャ", "nya", "nya", "a", []],
  ["ニュ", "nyu", "nya", "u", [["ニュース", null, "nyuusu", "berita"]]],
  ["ニョ", "nyo", "nya", "o", [["ニョッキ", null, "nyokki", "gnocchi"]]],
  ["ヒャ", "hya", "hya", "a", []],
  ["ヒュ", "hyu", "hya", "u", [["ヒューズ", null, "hyuuzu", "sekring"]]],
  ["ヒョ", "hyo", "hya", "o", []],
  ["ミャ", "mya", "mya", "a", []],
  ["ミュ", "myu", "mya", "u", [["ミュージック", null, "myuujikku", "musik"]]],
  ["ミョ", "myo", "mya", "o", []],
  ["リャ", "rya", "rya", "a", []],
  ["リュ", "ryu", "rya", "u", [["リュック", null, "ryukku", "ransel"]]],
  ["リョ", "ryo", "rya", "o", []],
  ["ギャ", "gya", "gya", "a", [["ギャラリー", null, "gyararii", "galeri"]]],
  ["ギュ", "gyu", "gya", "u", [["ギュッ", null, "gyu", "suara memeluk erat"]]],
  ["ギョ", "gyo", "gya", "o", [["ギョーザ", null, "gyooza", "pangsit goreng"]]],
  ["ジャ", "ja", "ja", "a", [["ジャム", null, "jamu", "selai"]]],
  ["ジュ", "ju", "ja", "u", [["ジュース", null, "juusu", "jus"]]],
  ["ジョ", "jo", "ja", "o", [["ジョギング", null, "jogingu", "joging"]]],
  ["ビャ", "bya", "bya", "a", []],
  ["ビュ", "byu", "bya", "u", [["ビュッフェ", null, "byuffe", "prasmanan"]]],
  ["ビョ", "byo", "bya", "o", []],
  ["ピャ", "pya", "pya", "a", []],
  ["ピュ", "pyu", "pya", "u", [["ピュア", null, "pyua", "murni"]]],
  ["ピョ", "pyo", "pya", "o", [["ピョンヤン", null, "pyonyan", "Pyongyang"]]],
];

const GROUP_LABELS: Record<KanaGroup, string> = {
  basic: "Dasar",
  dakuten: "Dakuten",
  handakuten: "Handakuten",
  yoon: "Yōon",
};

export const KANA_GROUP_LABELS = GROUP_LABELS;

export const KANA_ROW_LABELS: Record<string, string> = {
  a: "A",
  ka: "Ka",
  sa: "Sa",
  ta: "Ta",
  na: "Na",
  ha: "Ha",
  ma: "Ma",
  ya: "Ya",
  ra: "Ra",
  wa: "Wa",
  n: "N",
  ga: "Ga",
  za: "Za",
  da: "Da",
  ba: "Ba",
  pa: "Pa",
  kya: "Kya",
  sha: "Sha",
  cha: "Cha",
  nya: "Nya",
  hya: "Hya",
  mya: "Mya",
  rya: "Rya",
  gya: "Gya",
  ja: "Ja",
  bya: "Bya",
  pya: "Pya",
};

export const KANA_ROW_ORDER: Record<KanaGroup, string[]> = {
  basic: ["a", "ka", "sa", "ta", "na", "ha", "ma", "ya", "ra", "wa", "n"],
  dakuten: ["ga", "za", "da", "ba"],
  handakuten: ["pa"],
  yoon: ["kya", "sha", "cha", "nya", "hya", "mya", "rya", "gya", "ja", "bya", "pya"],
};

const YOON_VOWEL_COLUMN: Record<string, number> = { a: 0, u: 2, o: 4 };

function build(script: KanaScript, seeds: Seed[], group: KanaGroup, mnemonics: Record<string, string>): Kana[] {
  return seeds.map(([char, romaji, row, vowel, examples]) => ({
    id: script + "-" + char,
    char,
    romaji,
    script,
    group,
    row,
    vowel,
    mnemonic: mnemonics[char],
    examples: examples.map(ex),
  }));
}

export const HIRAGANA: Kana[] = [
  ...build("hiragana", HIRAGANA_BASIC, "basic", HIRAGANA_MNEMONIC),
  ...build("hiragana", HIRAGANA_DAKUTEN, "dakuten", {}),
  ...build("hiragana", HIRAGANA_HANDAKUTEN, "handakuten", {}),
  ...build("hiragana", HIRAGANA_YOON, "yoon", {}),
];

export const KATAKANA: Kana[] = [
  ...build("katakana", KATAKANA_BASIC, "basic", KATAKANA_MNEMONIC),
  ...build("katakana", KATAKANA_DAKUTEN, "dakuten", {}),
  ...build("katakana", KATAKANA_HANDAKUTEN, "handakuten", {}),
  ...build("katakana", KATAKANA_YOON, "yoon", {}),
];

export const ALL_KANA: Kana[] = [...HIRAGANA, ...KATAKANA];

export const KANA_BY_ID = new Map(ALL_KANA.map((item) => [item.id, item]));

export function getKana(script: KanaScript): Kana[] {
  return script === "hiragana" ? HIRAGANA : KATAKANA;
}

export function getKanaGroups(script: KanaScript): Array<{ group: KanaGroup; label: string; items: Kana[] }> {
  const items = getKana(script);
  return (["basic", "dakuten", "handakuten", "yoon"] as KanaGroup[]).map((group) => ({
    group,
    label: GROUP_LABELS[group],
    items: items.filter((item) => item.group === group),
  }));
}

export interface KanaChartRow {
  row: string;
  label: string;
  cells: Array<Kana | null>;
}

export function getKanaChart(script: KanaScript, group: KanaGroup): KanaChartRow[] {
  const items = getKana(script).filter((item) => item.group === group);
  const columns = group === "yoon" ? 3 : 5;
  return KANA_ROW_ORDER[group]
    .map((row) => {
      const cells: Array<Kana | null> = Array.from({ length: columns }, () => null);
      for (const item of items.filter((entry) => entry.row === row)) {
        const index = group === "yoon" ? YOON_VOWEL_COLUMN[item.vowel] : ["a", "i", "u", "e", "o"].indexOf(item.vowel);
        if (index >= 0 && index < columns) cells[index] = item;
        else if (item.vowel === "n") cells[0] = item;
      }
      return { row, label: KANA_ROW_LABELS[row] ?? row, cells };
    })
    .filter((row) => row.cells.some(Boolean));
}

export const KANA_SCRIPT_LABELS: Record<KanaScript, string> = {
  hiragana: "Hiragana",
  katakana: "Katakana",
};

export const KANA_TOTALS = {
  hiragana: HIRAGANA.length,
  katakana: KATAKANA.length,
};
