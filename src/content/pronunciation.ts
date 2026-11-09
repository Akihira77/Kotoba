import type { JLPTLevel } from "@/lib/types";

export interface PronunciationDrill {
  id: string;
  level: JLPTLevel;
  jp: string;
  reading: string;
  romaji: string;
  meaning: string;
  focus: string;
  tip: string;
}

/**
 * Kalimat latihan pelafalan orisinal untuk penutur Indonesia.
 * Fokus kolom "focus" adalah ciri bunyi yang sering terlewat, bukan penilaian
 * otomatis. Semua kalimat memakai pola yang lazim dalam bahasa Jepang standar.
 */
export const PRONUNCIATION_DRILLS: PronunciationDrill[] = [
  {
    id: "p-n5-1",
    level: "N5",
    jp: "おはようございます。",
    reading: "おはようございます",
    romaji: "ohayou gozaimasu",
    meaning: "Selamat pagi.",
    focus: "Vokal panjang ou",
    tip: "Ucapkan bagian akhir sebagai “gozai-MAS”, bukan “gozai-masu” yang dipotong. Vokal “ou” dibaca panjang seperti “ō”.",
  },
  {
    id: "p-n5-2",
    level: "N5",
    jp: "ありがとうございます。",
    reading: "ありがとうございます",
    romaji: "arigatou gozaimasu",
    meaning: "Terima kasih.",
    focus: "Tekanan dan vokal panjang",
    tip: "Beri tekanan ringan pada “ga” dan panjangkan “tou” menjadi “tō”. Jangan memberi tekanan seperti bahasa Indonesia pada suku kata terakhir.",
  },
  {
    id: "p-n5-3",
    level: "N5",
    jp: "すみません。",
    reading: "すみません",
    romaji: "sumimasen",
    meaning: "Permisi / maaf.",
    focus: "Bunyi s dan vokal pendek",
    tip: "Semua vokal pendek: su-mi-ma-sen. Bunyi “u” pada “su” sering terdengar pendek, hampir seperti “s’mimasen”.",
  },
  {
    id: "p-n5-4",
    level: "N5",
    jp: "私は学生です。",
    reading: "わたしはがくせいです",
    romaji: "watashi wa gakusei desu",
    meaning: "Saya seorang pelajar.",
    focus: "Partikel wa dan bunyi desu",
    tip: "Partikel は dalam kalimat ini dibaca “wa”. Kata “desu” diucapkan “des”, dengan vokal akhir yang sangat lembut.",
  },
  {
    id: "p-n5-5",
    level: "N5",
    jp: "東京は今日、雨です。",
    reading: "とうきょうはきょう、あめです",
    romaji: "Toukyou wa kyou, ame desu",
    meaning: "Tokyo hari ini hujan.",
    focus: "Vokal panjang tou dan kyou",
    tip: "“Toukyou” memiliki dua vokal panjang (tōkyō). Tahan bunyi “o” sedikit lebih lama, jangan dipecah menjadi “to-u-ki-yo-u”.",
  },
  {
    id: "p-n4-1",
    level: "N4",
    jp: "もう一度言ってください。",
    reading: "もういちどいってください",
    romaji: "mou ichido itte kudasai",
    meaning: "Tolong ucapkan sekali lagi.",
    focus: "Sokuon っ (hentian bunyi)",
    tip: "Pada “itte”, tahan napas sejenak sebelum “te”. Jangan mengucapkannya seperti “ite” tanpa hentian.",
  },
  {
    id: "p-n4-2",
    level: "N4",
    jp: "この電車は新宿に行きますか。",
    reading: "このでんしゃはしんじゅくにいきますか",
    romaji: "kono densha wa Shinjuku ni ikimasu ka",
    meaning: "Apakah kereta ini menuju Shinjuku?",
    focus: "Bunyi sh dan jeda antarsuku",
    tip: "Ucapkan “den-sha” dengan “sh” lembut, lalu “Shin-ju-ku” sebagai tiga suku yang jelas. Partikel は dibaca “wa”.",
  },
  {
    id: "p-n4-3",
    level: "N4",
    jp: "日本料理が大好きです。",
    reading: "にほんりょうりがだいすきです",
    romaji: "Nihon ryouri ga daisuki desu",
    meaning: "Saya sangat menyukai masakan Jepang.",
    focus: "Kombinasi ry dan vokal panjang",
    tip: "“ryou” diucapkan dalam satu tarikan, bukan “ri-yo-u”. Panjangkan “ryō” dan “dai” tetap pendek.",
  },
  {
    id: "p-n4-4",
    level: "N4",
    jp: "図書館で勉強しています。",
    reading: "としょかんでべんきょうしています",
    romaji: "toshokan de benkyou shite imasu",
    meaning: "Saya sedang belajar di perpustakaan.",
    focus: "Bunyi sho dan kyou",
    tip: "“sho” pada “toshokan” pendek, sedangkan “kyou” pada “benkyou” panjang. Bedakan keduanya agar tidak terdengar seperti “benkyo”.",
  },
  {
    id: "p-n3-1",
    level: "N3",
    jp: "環境を守るために、できることから始めましょう。",
    reading: "かんきょうをまもるために、できることからはじめましょう",
    romaji: "kankyou o mamoru tame ni, dekiru koto kara hajimemashou",
    meaning: "Mari mulai dari hal yang bisa dilakukan untuk menjaga lingkungan.",
    focus: "Vokal panjang kyou dan shou",
    tip: "Pertahankan panjang “kyō” dan “shō”. Beri jeda kecil setelah “tame ni” agar makna kalimat tetap jelas.",
  },
  {
    id: "p-n3-2",
    level: "N3",
    jp: "電車が遅れているらしいです。",
    reading: "でんしゃがおくれているらしいです",
    romaji: "densha ga okurete iru rashii desu",
    meaning: "Sepertinya kereta sedang terlambat.",
    focus: "Bunyi rashii",
    tip: "“rashii” bukan “raishii”. Bunyi “shi” diikuti vokal “i” panjang: ra-shi-i. Jangan menambahkan bunyi “a” di tengah.",
  },
  {
    id: "p-n3-3",
    level: "N3",
    jp: "発表の準備がまだ終わっていません。",
    reading: "はっぴょうのじゅんびがまだおわっていません",
    romaji: "happyyou no junbi ga mada owatte imasen",
    meaning: "Persiapan presentasi belum selesai.",
    focus: "Sokuon dan vokal panjang hyou",
    tip: "Tahan hentian pada “hap-pyō”. Bunyi “hyou” panjang, sedangkan “owatte” memakai hentian ganda pada “tt”.",
  },
  {
    id: "p-n3-4",
    level: "N3",
    jp: "会議の資料を確認しておいてください。",
    reading: "かいぎのしりょうをかくにんしておいてください",
    romaji: "kaigi no shiryou o kakunin shite oite kudasai",
    meaning: "Mohon periksa dokumen rapat terlebih dahulu.",
    focus: "Vokal panjang shiryou dan iramanya",
    tip: "Ucapkan “shi-ryō” dalam satu tarikan. Frasa “shite oite” sering diucapkan cepat, tetapi kedua “o” harus tetap terdengar.",
  },
  {
    id: "p-n2-1",
    level: "N2",
    jp: "努力すればするほど、上達します。",
    reading: "どりょくすればするほど、じょうたつします",
    romaji: "doryoku sureba suru hodo, joutatsu shimasu",
    meaning: "Semakin berusaha, semakin mahir.",
    focus: "Bunyi r dan vokal panjang",
    tip: "Bunyi “r” bahasa Jepang berada di antara “r” dan “l”. Panjangkan “jō” pada “joutatsu”, tetapi jaga “ta-tsu” tetap pendek.",
  },
  {
    id: "p-n2-2",
    level: "N2",
    jp: "お忙しいところ恐れ入りますが、ご確認いただけますか。",
    reading: "おいそがしいところおそれいりますが、ごかくにんいただけますか",
    romaji: "oisogashii tokoro osoreirimasu ga, gokakunin itadakemasu ka",
    meaning: "Maaf mengganggu saat sibuk, tetapi bisakah Anda memeriksanya?",
    focus: "Kalimat sopan panjang dan napas",
    tip: "Bagi kalimat menjadi dua kelompok napas: “oisogashii tokoro / osoreirimasu ga”. Jangan mempercepat bagian sopan hingga bunyi “su” hilang.",
  },
  {
    id: "p-n1-1",
    level: "N1",
    jp: "昨今の状況を踏まえ、計画を見直す必要があります。",
    reading: "さっこんのじょうきょうをふまえ、けいかくをみなおすひつようがあります",
    romaji: "sakkon no joukyou o fumae, keikaku o minaosu hitsuyou ga arimasu",
    meaning: "Dengan mempertimbangkan situasi terkini, rencana perlu ditinjau ulang.",
    focus: "Sokuon sakkon dan joukyou",
    tip: "Hentikan bunyi pada “sak-kon” dan panjangkan “jōkyō”. Beri jeda setelah “fumae” agar hubungan sebab-akibat terdengar alami.",
  },
  {
    id: "p-n1-2",
    level: "N1",
    jp: "その提案は現実的とは言い難い。",
    reading: "そのていあんはげんじつてきとはいいがたい",
    romaji: "sono teian wa genjitsuteki to wa iigatai",
    meaning: "Sulit mengatakan bahwa usulan itu realistis.",
    focus: "Bunyi iigatai dan aksen kalimat",
    tip: "Pisahkan “ii” yang panjang dari “gatai”. Beri tekanan ringan pada “genjitsuteki”, lalu turunkan nada pada “iigatai”.",
  },
];

export const PRONUNCIATION_BY_ID = new Map(PRONUNCIATION_DRILLS.map((drill) => [drill.id, drill]));
