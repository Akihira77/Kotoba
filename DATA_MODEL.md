# Model Data — Kotoba 言葉

**Versi dokumen:** 1.12  
**Status:** Fase 18 — Japanese Story Theater & Animated Conversation selesai; tabel ke-15 `story_attempts`; Fase 15 CMS tetap blocked  
**Tanggal:** 2026-11-09  
**Basis kode:** Kotoba v0.1.0 + Fase 14 + Fase 14B + Fase 16 + Fase 17 + Fase 18  
**Dokumen terkait:** [ARCHITECTURE.md](ARCHITECTURE.md) · [DECISIONS.md](DECISIONS.md) · [PROJECT_STATUS.md](PROJECT_STATUS.md) · [CONCERNS_BACKLOG.md](CONCERNS_BACKLOG.md) · [ENHANCED_FEATURES_ARCHITECTURE.md](ENHANCED_FEATURES_ARCHITECTURE.md)

---

## 1. Prinsip model data

1. **Konten dan progres adalah dua dunia berbeda.** Konten bersifat statis, ditulis manusia, dan ikut version control. Progres bersifat dinamis, ditulis pengguna, dan hidup di SQLite.
2. **Id konten stabil.** Id tidak boleh berubah setelah dipakai progres atau ekspor. Label tampilan boleh berubah; id tidak.
3. **Normalisasi secukupnya.** Relasi yang perlu query/agregasi masuk tabel. Struktur yang selalu dibaca utuh (formasi grammar, contoh kalimat, bagian ujian) boleh embedded/JSON.
4. **Referensi logis, bukan foreign key ke konten.** Database tidak menyimpan tabel konten, sehingga tidak ada FK fisik. Integritas dijaga validator dan tes.
5. **Agregat diturunkan, bukan diduplikasi tanpa alasan.** XP total, level, streak, dan akurasi dihitung dari state/log. Yang disimpan hanyalah nilai yang mahal atau tidak mungkin direkonstruksi (misalnya state SRS terbaru).
6. **Validasi di batas.** Konten divalidasi saat test/build; payload API divalidasi saat masuk; impor divalidasi sebelum mengganti data.
7. **Tidak ada data ajaib.** Setiap field punya pemilik, tipe, dan aturan. Field yang belum dipakai ditandai eksplisit sebagai “direncanakan”, bukan diam-diam dianggap aktif.

---

## 2. Konvensi

### 2.1 Level

```ts
type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";
type LearningLevel = JLPTLevel;
type CurriculumLevel = JLPTLevel | "semua";
```

`"semua"` hanya dipakai katalog/konten lintas level. Soal, kartu, dan attempt selalu memakai level JLPT konkret.

### 2.2 Identifier

| Entitas | Pola | Contoh |
| --- | --- | --- |
| Kana | `{script}-{char}` | `hiragana-あ`, `katakana-ア` |
| Kosakata | `v-{slug}` | `v-ohayou` |
| Kanji | `kanji-{char}` | `kanji-日` |
| Tata bahasa | `g-{slug}` | `g-desu` |
| Bacaan | `r-{level}-{n}` | `r-n5-1` |
| Menyimak | `l-{level}-{n}` | `l-n5-1` |
| Budaya | `c-{kategori}-{n}` | `c-tradisi-1` |
| Susun kalimat | `s-{level}-{n}` | `s-n5-1` |
| Soal | umumnya `{sourceId}-q{n}` | `r-n5-1-q1` |
| Modul katalog | `mod-{jenis}-{level/varian}` | `mod-vocab-N5` |
| Lesson katalog | `les-{jenis}-{varian}` | `les-grammar-g-desu` |
| Ujian (hasil) | `exam_{timestamp-base36}_{random}` | dibuat server |
| Ulasan (log) | `rev_{timestamp-base36}_{random}` | dibuat server |
| Katalog menulis (kana) | `writing-{script}-{char}` | `writing-hiragana-あ` |
| Katalog menulis (kanji) | `writing-kanji-{char}` | `writing-kanji-日` |
| Attempt menulis | `wrt_{timestamp-base36}_{random}` | dibuat server |

Aturan: id unik secara global di jenisnya, tidak memakai spasi, dan tidak didaur ulang. Soal dari sumber berbeda tetap harus unik; validator seharusnya memeriksa duplikasi lintas sumber (saat ini tes konten memeriksa per sumber dan katalog memeriksa id lesson/modul).

### 2.3 Waktu dan tanggal

- Timestamp disimpan sebagai **ISO 8601 UTC** (`new Date().toISOString()`), misalnya `2026-11-08T05:30:00.000Z`.
- Tanggal aktivitas/streak disimpan sebagai **tanggal lokal** `YYYY-MM-DD` melalui `toDateKey(new Date())`.
- Streak dan “XP hari ini” mengikuti zona waktu perangkat/proses. Saat ini server dan browser berada di mesin yang sama. Jika server dipindah, zona waktu harus dikonfigurasi eksplisit agar batas hari tidak bergeser.
- `activity.date` adalah primary key; satu baris per hari.

### 2.4 Teks Jepang

- Setiap item belajar sedapat mungkin memiliki: tulisan Jepang, bacaan kana, romaji, dan arti Indonesia.
- Romaji adalah **alat bantu opsional**; bukan pengganti kana/kanji.
- Furigana memakai markup `{漢字|かんじ}`. Parser di `src/lib/furigana.ts`; UI dapat menampilkan/menyembunyikannya.
- Register budaya memakai enum `"standar" | "formal" | "kasual" | "slang" | "arkais" | "anime"`. Nilai ini adalah label deskriptif, bukan izin pemakaian; artikel anime wajib menjelaskan konteks dan batas pemakaian sehari-hari.

### 2.5 Status implementasi

Label pada dokumen ini:

- **Aktif** — dipakai runtime dan/atau dipersistensikan.
- **Fondasi** — tipe/katalog sudah ada, tetapi UI/logika belum memakainya.
- **Direncanakan** — disepakati untuk fase berikutnya, belum ada implementasi.

---

## 3. Peta entitas yang diminta

| Entitas yang diminta | Nama kanonis di kode | Status | Persistensi |
| --- | --- | --- | --- |
| LearningLevel | `LearningLevel` (alias `JLPTLevel`) | Fondasi | Tidak disimpan; bagian dari entitas lain |
| Course | `Course` | Fondasi | Tidak disimpan; diturunkan dari konten |
| Module | `CourseModule` | Fondasi | Tidak disimpan |
| Lesson | `Lesson` | Fondasi | Katalog tidak disimpan; penyelesaian disimpan di `lessons` |
| Vocabulary | `VocabWord` | Aktif | Konten statis; progres di `cards`/`reviews` |
| Kanji | `Kanji` | Aktif | Konten statis; progres di `cards`/`reviews` |
| KanaCharacter | `Kana` | Aktif | Konten statis; progres di `kana_progress` |
| GrammarPoint | `GrammarPoint` | Aktif | Konten statis; penyelesaian di `lessons` |
| ExampleSentence | `VocabExample`, `KanjiExample`, `GrammarExample` | Aktif (embedded) | Tidak ada tabel terpisah |
| Exercise | `Exercise` (union) | Aktif | Tidak disimpan sebagai entitas; attempt di `quiz_attempts` |
| Quiz | `QuizDefinition` + builder `buildPracticeQuiz` | Fondasi | Tidak disimpan |
| Question | `QuizQuestion` | Aktif | Embedded di konten; hasil di `exams.review` |
| Exam runtime | `ExamPaper` + `ExamResult` | Aktif | Kertas/hasil di `sessionStorage`; ringkasan di `exams` |
| ExamDefinition (legacy) | `ExamDefinition` | Fondasi | Tidak dipakai runtime |
| Game | `GameDefinition` + `GameAttempt` + komponen game | Aktif | Attempt di `game_attempts`; statistik diturunkan |
| ListeningDrill | `ListeningDrill` | Aktif | Konten statis; attempt di `quiz_attempts` lewat `ExerciseRunner` |
| PronunciationGuideTopic | `PronunciationGuideTopic` | Aktif | Konten statis; tidak disimpan |
| ConversationScenario | `ConversationScenario` | Aktif | Konten statis; progres di `lessons` (kind `conversation`) |
| TypingChallenge | `TypingChallenge` | Aktif (runtime) | Tidak disimpan; sesi di klien, hasil di `lessons` (kind `typing`) |
| StudyPlan | `StudyPlan` | Aktif (runtime) | Tidak disimpan; diturunkan dari snapshot + settings |
| WritingCharacter | `WritingCharacter` + `WritingGlyph` | Aktif | Konten statis (319 entri); data goresan JSON KanjiVG |
| WritingAttempt | `WritingAttempt` + `WritingPayload` | Aktif | Tabel `writing_attempts`; maksimum 400 attempt terbaru di snapshot |
| Story | `Story` + `StoryScene` + `StoryCharacter` + `StoryLine` | Aktif | 3 cerita statis; tidak ada tabel konten |
| StoryAttempt | `StoryAttempt` + `StoryPayload` | Aktif | Tabel `story_attempts`; maksimum 300 attempt terbaru di snapshot |
| Speech playback | `SpeechPlaybackResult` | Aktif (runtime) | Tidak disimpan; hanya hasil sesi di memori |
| Speech transcript | transkrip Web Speech API | Aktif (runtime) | Tidak disimpan; dibandingkan di klien |
| CulturalFact | `CulturalFact` + `CultureFact` | Aktif | 132 fakta diturunkan dari artikel; dipakai Fakta Hari Ini |
| CultureArticle | `CultureArticle` | Aktif | 33 artikel statis; kuis embedded |
| CultureFavorite | `CultureFavorite` | Aktif | Tabel `culture_favorites` + `POST /api/progress/favorite` |
| UserProgress | `UserProgress` (alias `ProgressSnapshot`) | Aktif | Dibaca dari beberapa tabel, termasuk favorit |
| LearningAttempt | `LearningAttempt` | Sebagian | Model khusus `quiz_attempts`/`game_attempts`; belum ada tabel netral |
| ReviewSchedule | `ReviewSchedule` (alias `CardProgress`) | Aktif | `cards` |
| Achievement | `Achievement` | Aktif | 25 definisi terpusat di `src/lib/achievements.ts`; status diturunkan dari snapshot |
| Bookmark | `Bookmark` | Direncanakan | Bookmark umum belum ada; favorit budaya sudah aktif di `culture_favorites` |

Catatan penting: **“Fondasi” bukan berarti fitur pengguna sudah ada.** Tipe dan katalog fase awal disiapkan untuk dipakai fase berikutnya; status “Aktif” berarti ada alur runtime dan persistensi nyata. Halaman Belajar, Dasbor, `/games`, dan `/exams` sudah membaca katalog/registry/engine; `QuizDefinition` dan `ExamDefinition` masih deklaratif.

---

## 4. Relasi

```text
Course 1 ─── * CourseModule 1 ─── * Lesson
                                      │
                                      │ contentRefs *
                                      ▼
                              ContentRef (kind,id)
                                      │ resolve
        ┌──────────────┬──────────────┼──────────────┬──────────────┐
        ▼              ▼              ▼              ▼              ▼
      Kana        VocabWord        Kanji       GrammarPoint   ReadingPassage
        │              │              │              │              │
        │              │              │              │              │
        │              ▼              ▼              │              │
        │        CardProgress  CardProgress         │              │
        │              │              │              │              │
        ▼              ▼              ▼              ▼              ▼
  KanaProgress    ReviewLog     ReviewLog      QuizQuestion   QuizQuestion
                                                    │
                                                    ▼
                                          QuizDefinition / ExamPaper
                                                    │
                                                    ▼
                                              ExamAttempt
```

Relasi lain:

- satu `ContentRef` menunjuk **tepat satu** item konten; satu item dapat dirujuk banyak lesson.
- `VocabWord`/`Kanji` berhubungan **1—0..1** dengan `CardProgress` secara logis; tidak ada FK.
- `Kana` berhubungan **1—0..1** dengan `KanaProgress` melalui `char` (bukan `id`).
- `GrammarPoint`/`ReadingPassage`/`ListeningItem`/`CultureArticle` berhubungan dengan `LessonProgress` melalui id aktivitas yang dikirim halaman, **bukan** melalui `Lesson.id` katalog (lihat §15.1).
- `ReviewLog` adalah catatan kejadian; `CardProgress` adalah state terakhir. Keduanya merujuk `itemId` + `kind`.
- `ExamAttempt` menyimpan salinan hasil dan pembahasan; tidak ada FK ke soal karena konten dapat berubah.
- `ActivityDay` adalah agregat harian dari XP, ulasan, dan menit; bukan log per aksi.

---

## 5. Entitas konten

### 5.1 Kana (`Kana`)

| Field | Tipe | Aturan |
| --- | --- | --- |
| `id` | string | `{script}-{char}`, unik |
| `char` | string | Satu karakter kana |
| `romaji` | string | Transliterasi standar (mis. `shi`, `tsu`) |
| `script` | `"hiragana"` / `"katakana"` | Wajib |
| `group` | `"basic"` / `"dakuten"` / `"handakuten"` / `"yoon"` | Wajib |
| `row` | string | Baris bunyi (a/ka/sa/…) |
| `vowel` | `a`, `i`, `u`, `e`, `o`, `n` | Vokal utama |
| `mnemonic` | string? | Opsional, bahasa Indonesia |
| `examples` | `KanaExample[]` | Umumnya minimal satu; kana usang boleh kosong dengan alasan |

Jumlah saat ini: 104 hiragana + 104 katakana = 208, termasuk dakuten, handakuten, dan yōon.

### 5.2 Kosakata (`VocabWord`)

| Field | Tipe | Aturan |
| --- | --- | --- |
| `id` | string | `v-*`, unik |
| `japanese` | string | Tulisan Jepang |
| `kana` | string | Bacaan kana |
| `romaji` | string | Transliterasi |
| `meaning` | string | Arti Indonesia |
| `level` | JLPTLevel | Wajib |
| `pos` | PartOfSpeech | Enum terbatas |
| `topic` | VocabTopic | Enum topik |
| `examples` | `{jp,reading?,id}[]` | Kalimat orisinal + terjemahan Indonesia |
| `notes` | string? | Catatan nuansa/register |

### 5.3 Kanji (`Kanji`)

Field: `id`, `char`, `level`, `strokes`, `radical`, `radicalMeaning`, `on[]`, `kun[]`, `meanings[]`, `examples[{word,reading,meaning}]`, `mnemonic?`. Bacaan on/kun memakai kana, bukan romaji; arti Indonesia.

### 5.4 Tata bahasa (`GrammarPoint`)

Field: `id`, `level`, `pattern`, `meaning`, `formation[{label,form,note?}]`, `explanation[]`, `examples[{jp,reading,id}]`, `notes?[]`, `mistakes?[{wrong,right,why}]`, `related?[]`, `practice[]`.

Aturan:

- `formation` minimal satu baris; label unik agar tabel tidak ambigu.
- `practice` minimal satu `QuizQuestion`; `answerIndex` valid.
- `related` berisi id grammar lain, bukan teks bebas.
- Penjelasan menjelaskan **kapan dipakai**, bukan sekadar terjemahan pola.

### 5.5 Bacaan (`ReadingPassage`)

Field: `id`, `level`, `title`, `titleJp`, `summary`, `text`, `translation[]`, `vocab[]`, `questions[]`, `minutes`.

- `text` memakai markup furigana; `translation` sejajar paragraf.
- `questions` bertipe `reading`, `section: "dokkai"`, `sourceId` = id bacaan.
- Jumlah soal saat ini 3 per bacaan.

### 5.6 Menyimak (`ListeningItem`)

Field: `id`, `level`, `title`, `titleId`, `scenario`, `lines[{speaker,jp,reading,id}]`, `questions[]`, `keyPhrases[]`.

- `speaker` dibatasi `A | B | Narasi`.
- `audioText` pada soal diisi agar tombol putar tersedia.
- `title` berbahasa Indonesia; `titleId` berisi judul Jepang (konvensi saat ini).
- Tidak ada file audio; teks adalah sumber TTS.

### 5.7 Budaya (`CultureArticle`)

Field: `id`, `group`, `category`, `title`, `titleJp`, `summary`, `body[]`, `facts[{label,value}]`, `vocab[]`, `expressions?[]`, `topics[]`, `quiz[]`, `sources[]`, `minutes`, `sourceNote`.

- Grup penemuan: `budaya`, `makanan`, `geografi`, `sejarah`, `anime`, `bahasa`. Kategori editorial: tradisi, makanan, geografi, etiket, kehidupan, sejarah, anime, bahasa. `CULTURE_GROUP_BY_CATEGORY` memetakan kategori ke grup.
- `expressions` memakai `register` wajib, `usage` (kapan aman dipakai), dan label register mencakup formal/arkais. Artikel anime membedakan fiksi dari percakapan sehari-hari.
- `sources` berisi 2–3 rujukan organisasi (JNTO, Bunka, UNESCO, MAFF, GSI, JMA, Rekihaku, Britannica, AJA, JPF) dengan URL https dan catatan bahwa rujukan bersifat organisasi, bukan kutipan per kalimat.
- `quiz` berisi 2 soal per artikel (arti kosakata + bacaan), 4 opsi unik, `answerIndex` valid. Kuis adalah pemeriksaan belajar, bukan skor JLPT.
- `sourceNote` menegaskan artikel orisinal/edukatif, bukan terjemahan sumber berhak cipta.
- `facts` tetap inline di artikel; `CultureFact` diturunkan untuk Fakta Hari Ini, bukan disimpan terpisah.

#### 5.7.1 Fakta turunan (`CultureFact`)

`src/lib/culture-facts.ts` meratakan 132 fakta (4 per artikel) menjadi `{id, articleId, label, value}` dengan id `{articleId}-fact-{n}`. Fakta harian dipilih dengan FNV-1a atas `"daily:" + YYYY-MM-DD` lokal; hasilnya deterministik pada hari yang sama dan tidak disimpan di database.

### 5.8 Susun kalimat (`SentenceItem`)

Field: `id`, `level`, `tokens[]`, `answer[]`, `translation`, `explanation`.

Aturan: multiset `tokens` harus sama dengan `answer` (kata yang sama, urutan boleh acak); `tokens` tidak boleh sama persis dengan `answer` agar latihan bermakna. Konten saat ini memakai 5–7 token; tes hanya memberlakukan minimum 4, jadi batas 5–8 adalah pedoman konten, bukan validasi tipe.

### 5.9 Soal (`QuizQuestion`)

| Field | Tipe | Aturan |
| --- | --- | --- |
| `id` | string | Unik |
| `type` | QuestionType | Enum 10 tipe |
| `level` | JLPTLevel | Wajib |
| `prompt` | string | Bahasa Indonesia/instruksi |
| `promptJp` | string? | Teks Jepang yang ditanyakan |
| `options` | string[] | Minimal 2; umumnya 4 |
| `answerIndex` | number | `0 <= answerIndex < options.length` |
| `explanation` | string | Wajib, menjelaskan jawaban |
| `audioText` | string? | Untuk soal menyimak |
| `sourceId` | string? | Item asal |
| `section` | QuizSection? | `moji-goi`, `bunpou-dokkai`, `dokkai`, `choukai`, `kana` |

Soal adalah **embedded value object** di konten; tidak ada tabel soal global. Ini disengaja agar menambah bacaan/grammar tidak perlu migrasi database.

### 5.10 Drill menyimak (`ListeningDrill`)

| Field | Tipe | Aturan |
| --- | --- | --- |
| `id` | string | Unik; pola `ld-{level}-{n}` |
| `level` | JLPTLevel | Wajib; 3 item per level |
| `focus` | string | Fokus keterampilan, misalnya Lokasi/Kosakata/Detail |
| `prompt` | string | Pertanyaan bahasa Indonesia |
| `audioText` | string | Teks Jepang yang diucapkan TTS |
| `reading` | string | Bacaan kana penuh dari `audioText` |
| `translation` | string | Terjemahan Indonesia |
| `options` | string[] | 4 opsi unik |
| `answerIndex` | number | `0 <= answerIndex < options.length` |
| `explanation` | string | Alasan jawaban + kosakata kunci |
| `tip` | string | Strategi mendengar |

- Drill adalah **konten atomik**, bukan tabel. `listeningDrillExercises()` memetakannya ke `ListeningExercise` dengan id `ex-listen-drill-{id}` dan `contentRef` ke `/listening/practice`.
- Tidak ada kolom audio; TTS perangkat adalah sumber suara. Tidak ada rekaman penutur asli yang disimpan.
- Hasil pengerjaan tersimpan sebagai `quiz_attempts` (mode `practice`), bukan tabel drill baru.

### 5.11 Panduan pelafalan (`PronunciationGuideTopic`)

| Field | Tipe | Aturan |
| --- | --- | --- |
| `id` | string | Enam topik tetap |
| `title` / `titleJp` | string | Judul Indonesia + Jepang |
| `intro` | string | Ringkasan topik |
| `points` | string[] | 2–4 poin praktis |
| `examples` | `PronunciationGuideExample[]` | `jp`, `reading`, `romaji`, `meaning`, `note?` |
| `contrast?` | `{a,b,note}` | Pasangan kontras opsional (mis. おばさん/おばあさん) |
| `tip` | string | Latihan singkat |

Topik: vokal, konsonan, vokal panjang, sokuon, mora/irama, kesadaran pitch. Panduan tidak menyimpan skor atau audio; tombol putar memakai `reading` agar kanji tidak salah baca oleh TTS.

### 5.12 Skenario percakapan (`ConversationScenario`, Fase 11)

```ts
interface ConversationLine {
  jp: string;
  reading: string;
  romaji: string;
  meaning: string;
}

interface ConversationChoice extends ConversationLine {
  id: string;
  register: Register;
  correct: boolean;
  feedback: string;
}

interface ConversationStep {
  id: string;
  npc: ConversationLine;
  prompt: string;
  choices: ConversationChoice[];
}

interface ConversationPhrase extends ConversationLine {
  register: Register;
  note?: string;
}

interface ConversationScenario {
  id: string;
  level: JLPTLevel;
  category: string;
  title: string;
  titleJp: string;
  summary: string;
  setting: string;
  goals: string[];
  steps: ConversationStep[];
  keyPhrases: ConversationPhrase[];
  culturalNote: string;
  minutes: number;
}
```

Konten saat ini: **6 skenario, 19 langkah, 18 frasa kunci**, semuanya orisinal dan ditulis untuk Kotoba.

Aturan:

- Setiap langkah memiliki tepat **3 pilihan** dan tepat **satu** pilihan dengan `correct: true`.
- Pilihan yang salah tetap gramatikal, tetapi tidak cocok secara konteks/register; `feedback` menjelaskan alasannya. Ini melatih kesesuaian sosial, bukan sekadar mencari bentuk yang valid.
- `register` memakai enum budaya `standar | formal | kasual | slang | arkais | anime`; label deskriptif, bukan izin pemakaian.
- Skor dihitung dari jawaban benar pada percobaan pertama per langkah: `round((langkah - langkahSalahPertama) / langkah × 100)`. Mengulang pilihan di langkah yang sama tidak menambah skor.
- Progres disimpan sebagai baris `lessons` dengan `kind = "conversation"` dan `lessonId = scenario.id`. Transkrip, pilihan, dan riwayat per langkah **tidak** disimpan.
- Tidak ada tabel percakapan; skenario adalah konten statis yang divalidasi tes (`src/content/conversations.test.ts`).

### 5.13 Latihan mengetik (`TypingChallenge`, runtime Fase 11)

```ts
type TypingMode = "kana-romaji" | "romaji-kana" | "meaning-kanji";

interface TypingChallenge {
  id: string;
  mode: TypingMode;
  prompt: string;
  promptSubtitle: string;
  answer: string;
  hint: string;
  level: JLPTLevel;
  kana?: string;
  meaning?: string;
}
```

Tiga mode dipisahkan karena keterampilannya berbeda:

| Mode | Prompt | Jawaban | IME |
| --- | --- | --- | --- |
| `kana-romaji` | karakter kana | romaji | tidak perlu |
| `romaji-kana` | romaji | kana | perlu |
| `meaning-kanji` | arti Indonesia + bacaan | kata Jepang berkanji | perlu |

Aturan pemeriksaan:

- Romaji dinormalisasi NFKC, huruf kecil, trim, lalu spasi/apostrof/tanda hubung dibuang. Alias lazim diterima: `si→shi`, `ti→chi`, `tu→tsu`, `hu→fu`, `zi/di→ji`, `du→zu`, `sya/syu/syo→sha/shu/sho`, `tya/tyu/tyo→cha/chu/cho`, `zya/zyu/zyo/jya/jyu/jyo→ja/ju/jo`.
- Jawaban Jepang dinormalisasi NFKC dan spasinya dibuang; kanji/kana **tidak** disamakan. Ini sengaja agar latihan menulis bentuk benar-benar diperiksa.
- Sesi dibangun deterministik dari `mode`, `level`, `count`, dan `seed`; `count` 5/10/15 di UI, dipotong bila kumpulan soal lebih kecil.
- Pemeriksaan terjadi di klien; tidak ada unggahan ketikan, penilaian akustik, atau analitik per tombol.
- Hasil disimpan sebagai `lessons` (`lessonId = "typing-" + mode`, `kind = "typing"`, `score` = akurasi 0–100). Halaman juga memanggil `recordSession` untuk XP per jawaban benar dan menit belajar.

### 5.14 Rencana belajar (`StudyPlan`, runtime Fase 11)

```ts
type PlanFeasibility = "longgar" | "realistis" | "ketat" | "tidak-realistis";

interface StudyPlanLesson { id; title; level; moduleTitle; minutes; href }
interface StudyPlanWeek {
  week; startDate; endDate; focus;
  lessons: StudyPlanLesson[];
  lessonMinutes; reviewMinutes; totalMinutes;
}
interface StudyPlanMilestone { week; label; detail }

interface StudyPlan {
  currentLevel; targetLevel; targetAdjusted; weeks; daysPerWeek;
  sessionMinutes; weeklyMinutes; totalLessons; completedLessons;
  plannedLessons; unplannedLessons; lessonMinutes; reviewMinutes;
  requiredWeeks; recommendedWeeks; feasibility;
  summary; recommendation; weeksPlan; milestones;
}
```

`buildStudyPlan({ snapshot, targetLevel, weeks, now })` adalah fungsi murni deterministik:

1. Level berjalan dari `currentJlptLevel(snapshot)`; target di bawah level berjalan disesuaikan ke level berjalan dan `targetAdjusted = true`.
2. Cakupan lesson = `CURRICULUM_LESSONS` pada level berjalan sampai target, belum selesai menurut `isLessonComplete()`.
3. `weeks` dibulatkan lalu di-clamp **4–104** (default 12).
4. `weeklyMinutes = dailyStudyMinutes × weeklyFrequency`; `weeklyLessonBudget = max(30, round(weeklyMinutes × 0,75))`; `requiredWeeks = max(1, ceil(totalLessonMinutes / weeklyLessonBudget))`.
5. Rasio `requiredWeeks / weeks` menentukan feasibility: `≤0,75` longgar, `≤1` realistis, `≤1,3` ketat, selain itu tidak-realistis.
6. Alokasi rakus mengisi tiap minggu sampai anggaran; sisa menit menjadi `reviewMinutes`. Milestone menandai awal level baru dan target.

Rencana **tidak disimpan** sebagai tabel atau daftar tugas baru. Ia selalu diturunkan dari snapshot terbaru, sehingga selesainya satu lesson langsung mengubah rencana tanpa risiko jadwal basi. Rencana bukan prediksi kelulusan JLPT dan memakai tanggal lokal proses.

### 5.15 Katalog menulis dan data goresan (Fase 17)

```ts
type WritingScript = "hiragana" | "katakana" | "kanji";
type WritingStage = "A" | "B" | "C" | "D" | "E";
type WritingMode = "guided" | "free";

interface WritingGlyph { char; file; strokes }

interface WritingCharacter {
  id; char; script; stage; level?;
  romaji; reading; strokeCount; glyphs;
  meanings; on; kun; radical?; radicalMeaning?;
  examples: { word; reading; meaning }[];
  notes; mnemonic?; kanaGroup?; kanaRow?;
}

interface WritingPoint { x; y }
interface WritingStrokeData { number; d; start; end; points }
interface WritingGlyphData {
  character; codepoint; viewBox;
  source: { project; commit; url; license; attribution };
  strokes; numbers;
}
interface WritingIndexEntry { id; char; script; stage; level?; romaji; reading; strokeCount; glyphCount; primaryMeaning }
interface WritingAttempt { id; characterId; script; mode; score; expectedStrokes; drawnStrokes; orderMistakes; durationSec; createdAt }
interface WritingPayload { characterId; mode; score; drawnStrokes; orderMistakes?; durationSec }
```

Aturan:

- **319 entri** = 208 kana (tahap A hiragana, B katakana) + 111 kanji (C N5–N4, D N3–N2, E N1). ID `writing-{script}-{char}` atau `writing-kanji-{char}`.
- Kana adalah satuan bunyi, sehingga `meanings` sengaja kosong; contoh kata tetap ditampilkan sebagai contoh, bukan arti karakter.
- Yōon seperti きゃ/ニョ terdiri dari dua codepoint dan dua glyph; ditampilkan berurutan. Tidak ada glyph gabungan buatan.
- **259 glyph unik** dari KanjiVG commit `610091ce618cf757ed1357a8954cd65283e015d6`, viewBox `0 0 109 109`, path per goresan, nomor, titik awal/akhir, dan 28 titik sampel per goresan.
- JSON disimpan per glyph di `public/writing/kanjivg/` dan dimuat saat detail dibuka. Data adalah turunan **CC BY-SA 3.0**; atribusi Ulrich Apel/KanjiVG dan tautan lisensi wajib dipertahankan (lihat `THIRD_PARTY_NOTICES.md`).
- Catatan bentuk/kekeliruan umum adalah konten orisinal untuk sekitar 45 karakter; karakter lain memakai catatan generik.
- Skor memakai `evaluateWriting()` dan `compareStroke()` di `src/lib/writing-geometry.ts`: goresan = 55% bentuk + 12% awal + 12% akhir + 21% arah; total = 82% bentuk + 18% jumlah goresan; `orderMistakes` hanya untuk goresan berskor ≥45 dan penalti maksimum 24; mastery ≥80. Ini **perkiraan geometri**, bukan pengenalan tulisan tangan.

### 5.16 Cerita dan teater cerita (Fase 18)

```ts
type StoryLine = {
  id: string;
  speakerId: string;
  jp: string;              // markup furigana {漢字|かんじ}
  reading: string;         // kana lengkap, harus sama dengan furiganaReading(jp)
  romaji: string;
  meaning: string;         // terjemahan Indonesia
  expression?: StoryExpression;
  vocabIds?: string[];
  grammarIds?: string[];
  audioUrl?: string;       // opsional, same-origin; TTS tetap fallback
  note?: string;
};

type StoryExpression = "neutral" | "happy" | "surprised" | "worried" | "thinking";
type StoryBackground = "station" | "platform" | "train" | "cafe" | "table" | "park-rain" | "library" | "street";
type StoryStagePosition = "far-left" | "left" | "center" | "right" | "far-right";
type StoryMode = "study" | "watch";

interface StoryStageCharacter {
  characterId: string;
  position: StoryStagePosition;
  expression?: StoryExpression;
  enter?: "fade" | "slide-left" | "slide-right";
  facing?: "left" | "right";
}

interface StoryCharacter {
  id: string;
  name: string;           // nama tampilan, mis. Aki
  nameJp: string;
  role: string;
  tone: string;           // warna aksen karakter
  hair: string;
  accent: string;
}

interface StoryScene {
  id: string;
  title: string;
  titleJp: string;
  setting: string;
  background: StoryBackground;
  effect?: "rain" | "snow" | "petals" | null;
  characters: StoryStageCharacter[];
  lines: StoryLine[];
  videoUrl?: string;      // seam aset pra-render same-origin; tidak dipakai saat ini
}

interface StoryQuestion {
  id: string;
  kind: "comprehension" | "listening";
  prompt: string;
  audioText?: string;     // wajib untuk soal listening
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface Story {
  id: string;
  title: string;
  titleJp: string;
  summary: string;
  level: JLPTLevel;
  difficulty: 1 | 2 | 3 | 4 | 5;
  minutes: number;
  tags: string[];
  characters: StoryCharacter[];
  scenes: StoryScene[];
  vocabIds: string[];
  grammarIds: string[];
  questions: StoryQuestion[];
  culturalNote?: string;
}

interface StoryAttempt {
  id: string;
  storyId: string;
  level: JLPTLevel;
  mode: StoryMode;
  score: number;          // 0–100
  correct: number;
  total: number;
  scenesCompleted: number;
  durationSec: number;
  completedAt: string;    // ISO
}

interface StoryPayload {
  storyId: string;
  mode: StoryMode;
  score: number;
  correct: number;
  total: number;
  scenesCompleted: number;
  durationSec: number;
}
```

Aturan:

- **3 cerita orisinal, 9 adegan, 36 baris dialog, 9 soal** (`story-eki-hajimete`, `story-kafe-koohii`, `story-haru-ame`). Dua cerita N5 dan satu N4; setiap cerita memiliki 3 adegan dan 12 baris.
- Setiap baris wajib memiliki `reading` kana lengkap yang sama dengan hasil `furiganaReading(jp)`; `romaji` dan `meaning` tidak boleh kosong. Tes konten memeriksa ini.
- `speakerId` dan `characterId` pada adegan harus ada di `characters` cerita; posisi panggung hanya lima nilai di atas. Satu baris hanya satu pembicara.
- Setiap `vocabIds` harus ada di `VOCAB_BY_ID` dan `grammarIds` di `GRAMMAR_BY_ID`. Ini bukan dekorasi: chip kosakata/gramatika membuka detail dan menyimpan ke kamus pribadi.
- Soal memiliki minimal 3 opsi, `answerIndex` valid, prompt/penjelasan tidak kosong; soal `listening` wajib punya `audioText`.
- Delapan latar SVG/CSS orisinal: stasiun, peron, kereta, kafe, meja, taman hujan, perpustakaan, jalan. Efek hanya hujan, salju, atau kelopak; tidak ada aset gambar/video eksternal.
- `videoUrl` adalah **seam** opsional untuk video pra-render same-origin di masa depan; tidak ada aset, unggahan, CMS, atau ekspor video yang diimplementasikan. Selama kosong, adegan dirender SVG/CSS.
- Tidak ada tabel konten atau CMS. Cerita adalah modul TypeScript bertipe di `src/content/stories.ts`; `STORY_BY_ID` adalah indeks runtime.

Catatan audio: pemutar memakai Web Speech `ja-JP` per baris dan sinkronisasi **tingkat kalimat**, bukan kata. Bila hanya satu voice Jepang tersedia, semua karakter memakai voice yang sama; Kotoba tidak memalsukan voice karakter berbeda. `audioUrl` per baris adalah fallback opsional ke aset rekaman.

---

## 6. Katalog kurikulum (Fase 2)

### 6.1 Tipe

```ts
interface ContentRef {
  kind: ContentKind;      // kana | vocabulary | kanji | grammar | reading | listening | culture | sentence
  id: string;
  href?: string;          // link internal opsional
}

interface Lesson {
  id: string;
  moduleId: string;
  order: number;          // mulai 1
  title: string;
  titleJp?: string;
  description: string;
  kind: LessonKind;       // ContentKind | practice | game | exam
  level: CurriculumLevel;
  estimateMinutes: number;
  objectives: string[];
  contentRefs: ContentRef[];
  href: string;
  interactive?: boolean;  // true bila memiliki LessonPlan
}

interface CourseModule {
  id: string;
  courseId: string;
  order: number;
  title: string;
  titleJp?: string;
  description: string;
  kind: LessonKind;
  level: CurriculumLevel;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  titleJp: string;
  description: string;
  levels: JLPTLevel[];
  modules: CourseModule[];
}
```

### 6.2 Cara katalog dibentuk

`src/content/curriculum.ts` menurunkan katalog dari array konten nyata:

| Modul | Jumlah lesson | Aturan pembentukan |
| --- | ---: | --- |
| Kana hiragana | 4 | per grup (basic, dakuten, handakuten, yōon) |
| Kana katakana | 4 | per grup |
| Kosakata per level | 20/9/7/2/2 | dikelompokkan per `topic` |
| Kanji per level | 6/2/1/1/1 | set 12 kanji |
| Tata bahasa per level | 20/11/9/3/2 | satu lesson per `GrammarPoint` |
| Bacaan per level | 4/3/3/1/1 | satu lesson per passage |
| Menyimak per level | 4/3/2/1/2 | satu lesson per item |
| Susun kalimat per level | 8/1/1/1/1 | N5 dipecah per item; level lain satu lesson |
| Budaya per kategori | 2–5 per kategori | satu lesson per artikel; 33 artikel dalam 6 grup |

Total saat ini: **39 modul, 154 lesson, 644 `ContentRef`**. Dari jumlah itu, **70 lesson N5 memiliki `LessonPlan` interaktif** (termasuk delapan pelajaran membaca/menyimak). Angka ini diuji; lihat `src/content/curriculum.test.ts` dan `src/content/lessons.test.ts`.

#### 6.2.1 LessonPlan (Fase 4)

`LessonPlan` adalah **data statis bertipe**, bukan tabel database:

```ts
interface LessonPlan {
  id: string;
  title: string;
  titleJp?: string;
  summary: string;
  estimateMinutes: number;
  goals: string[];
  intro: string[];
  explanation: LessonBlock[];
  examples: LessonExample[];
  notes: LessonNote[];
  practice: QuizQuestion[];
  sourceId?: string;
}
```

- Satu `LessonPlan.id` harus sama dengan id lesson katalog yang `interactive`.
- `explanation` memakai union `LessonBlock` (prose, **jp-prose**, **dialog**, table, grid, kana-grid, vocab-list, kanji-list, callout, steps).
- Blok `jp-prose` memuat paragraf Jepang dengan markup furigana `{漢字|かな}` dan dirender sebagai `JpText`; blok `dialog` memuat `speaker`, `jp`, `reading`, dan `meaning` opsional untuk pelajaran menyimak.
- `practice` memakai `QuizQuestion` yang sudah ada; id soal berawalan id rencana, opsi unik, dan `answerIndex` valid.
- Tidak ada tabel `lesson_plans`; konten tetap statis dan divalidasi saat tes/build.
- Delapan LessonPlan N5 membaca/menyimak memakai `sourceId` passage/dialog dan soal sumber; ID rencana tetap `les-reading-*`/`les-listening-*` agar sama dengan lesson katalog interaktif.

### 6.3 Hubungan dengan materi

- `Lesson.contentRefs` adalah **satu-satunya** penghubung katalog ke materi.
- `ContentRef.kind` menentukan map resolver:
  - `kana` → `KANA`/id;
  - `vocabulary` → `VOCAB_BY_ID`;
  - `kanji` → `KANJI_BY_ID`;
  - `grammar` → `GRAMMAR_BY_ID`;
  - `reading` → `READING_BY_ID`;
  - `listening` → `LISTENING_BY_ID`;
  - `culture` → `CULTURE_BY_ID`;
  - `sentence` → `SENTENCES_BY_ID`.
- Validator `validateCurriculum()` memastikan setiap ref dapat di-resolve, id modul/lesson unik, urutan valid, dan **seluruh konten tercakup minimal satu kali**. Konten yang tidak masuk katalog akan menggagalkan tes. Duplikasi ref yang disengaja belum dicek; katalog saat ini memakai satu ref per item.

### 6.4 Mengapa katalog tidak disimpan

Katalog adalah **proyeksi** dari konten. Menyimpannya di database akan menciptakan dua sumber kebenaran dan memaksa migrasi setiap kali materi berubah. Katalog dibentuk deterministik saat runtime/test. Yang disimpan hanyalah penyelesaian lesson.

---

## 7. Latihan dan asesmen (Fase 2–5)

### 7.1 Union `Exercise` (Fase 5, aktif)

Semua latihan memiliki basis:

```ts
interface ExerciseBase {
  id: string;
  level: JLPTLevel;
  prompt: string;
  instructions?: string;
  explanation: string;
  tags: string[];
  contentRef?: ContentRef;
  points?: number;
}
```

Sembilan jenis yang benar-benar dipakai `ExerciseRunner`:

| Kind | Field khusus | Validasi minimum |
| --- | --- | --- |
| `multiple-choice` | `options[]`, `answerIndex`, `promptJp?`, `audioText?`, `questionType?` | `answerIndex` valid; opsi ≥2 dan unik |
| `cloze` | `text`, `answer`, `acceptedAnswers[]`, `hint?` | `answer` ada di `acceptedAnswers`; teks memiliki bagian kosong |
| `translation` | `source`, `direction`, `acceptedAnswers[]`, `keywords[]`, `reference` | Arah `id-to-ja`/`ja-to-id`; minimal satu jawaban diterima |
| `matching` | `pairs[{id,left,right,leftReading?,leftRomaji?}]` | ≥2 pasangan; id unik; kiri/kanan tidak kosong |
| `reading-recognition` | `word`, `options[]`, `answerIndex`, `reading` | Bacaan benar tersedia; opsi ≥2 |
| `listening` | `audioText`, `script?`, `options[]`, `answerIndex`, `promptJp?` | Audio/teks tidak kosong; opsi ≥2 |
| `ordering` | `tokens[]`, `answer[]`, `translation?` | Multiset token = answer; token ≥2 |
| `true-false` | `statement`, `promptJp?`, `answer`, `correction?` | `answer` boolean; koreksi tersedia bila salah |
| `typing` | `answer`, `acceptedAnswers[]`, `hint?`, `inputMode?`, `meaning?` | Minimal satu varian diterima; mode kana/kanji/romaji |

`flashcard` **bukan** bagian union latihan; ia dikelola `FlashcardData` dan komponen `Flashcards` karena alurnya reveal + rating SRS, bukan penilaian soal.

Respons dan penilaian:

```ts
type ExerciseResponse =
  | { kind: "multiple-choice" | "reading-recognition" | "listening"; selectedIndex: number }
  | { kind: "cloze" | "translation" | "typing"; text: string }
  | { kind: "true-false"; value: boolean | null }
  | { kind: "matching"; matches: Record<string, string> } // pairId kiri -> pairId kanan
  | { kind: "ordering"; order: number[] };

interface ExerciseGrade {
  correct: boolean;
  score: number;       // 0..1; matching boleh parsial
  expected: string;
  feedback: string;
}
```

**Status runtime:** `ExerciseRunner` + `ExerciseCard` dipakai di /practice, /vocabulary, pelajaran, tata bahasa, membaca, dan menyimak. Ujian memakai `ExamQuestionCard` + `gradeExam()` dari engine terpisah. `QuizQuestion` lama tetap menjadi sumber bank soal dan diadaptasi lewat `exercisesFromQuizQuestions()` maupun builder ujian. Penilaian latihan ada di `src/lib/exercise-engine.ts`; normalisasi tidak menyamakan kanji/kana secara otomatis.

### 7.2 Respons, attempt, dan statistik soal (Fase 5)

`ExerciseAttemptAnswer` menyimpan `exerciseId`, `kind`, `response`, `correct`, `score` (0..1), dan `timeMs`.

`QuizAttempt` menyimpan:

- identitas: `id`, `mode` (`practice|topic|review|lesson|vocabulary|exam`), `title`, `level?`;
- nilai: `total`, `correct`, `score`, `durationSec`;
- waktu: `startedAt`, `finishedAt`;
- rincian: `answers[]`.

`QuestionStat` menyimpan `questionId`, `attempts`, `correct`, `wrong`, `accuracy` (persen 0–100), `lastResult`, `lastAttemptAt`, dan `averageTimeMs`. Statistik ini dipakai `buildAdaptiveSession()` untuk memprioritaskan soal yang sering salah.

### 7.3 `QuizDefinition`

```ts
interface QuizDefinition {
  id: string;
  title: string;
  description: string;
  mode: "practice" | "topic" | "review" | "exam";
  level: CurriculumLevel;
  questionIds: string[];
}
```

Aturan:

- `questionIds` unik dan dapat di-resolve oleh registry soal.
- Definisi tidak menyalin soal; hanya id. Ini memungkinkan satu soal dipakai beberapa kuis.
- Engine runtime latihan membangun soal langsung dari konten (`buildPracticeQuiz`), dan ujian memakai `exam-engine.ts`; keduanya belum membaca `QuizDefinition`.

### 7.4 `ExamPaper` (runtime, Fase 8)

`ExamPaper` adalah kertas yang dibangun engine dari bank soal dan konten, bukan entitas yang disimpan di SQLite:

```ts
interface ExamPaper {
  id: string;
  mode: "practice" | "mock" | "topic" | "random";
  level: JLPTLevel;
  title: string;              // Indonesia
  titleJp: string;
  minutes: number;            // 0 untuk mode tanpa timer
  timed: boolean;
  immediateFeedback: boolean;
  targetScore: number;        // 70, target belajar Kotoba
  mixedLevels: boolean;
  focus?: ExamFocus;          // topik kosakata / pola grammar
  sections: ExamSection[];    // id, label, labelJp, questions
}

interface ExamQuestion {
  id: string;
  question: QuizQuestion;
  category: "vocabulary" | "kanji" | "grammar" | "reading" | "listening";
  sectionId: "moji-goi" | "bunpou-dokkai" | "choukai" | "latihan" | "topik";
  passage?: { id; title; titleJp; text; translation[] };  // soal membaca
  transcript?: string;        // soal menyimak, baru ditampilkan setelah diperiksa
  translation?: string;
  itemKind?: "vocab" | "kanji";  // untuk tombol tambah kartu
  itemId?: string;
  sourceKind?: "vocabulary" | "kanji" | "grammar" | "reading" | "listening" | "listening-drill";
  sourceId?: string;
}
```

Kertas aktif dan `startedAt` disimpan di `sessionStorage` (`kotoba.exam.active.v1`), hasil di `kotoba.exam.result.v1`. Pilihan ini membuat refresh mempertahankan timer dan halaman hasil dapat dibaca ulang tanpa menambah tabel. Konsekuensinya, menutup tab menghapus kertas/hasil lokal; riwayat ringkasan tetap di `exams`.

### 7.5 Hasil ujian (Fase 8)

`ExamResult` adalah hasil penilaian murni di klien:

- identitas: `id`, `paper`, `startedAt`, `finishedAt`, `durationSec`;
- nilai: `score`, `targetScore`, `targetMet`, `correct`, `answered`, `unanswered`, `totalQuestions`, `accuracy`;
- analitik: `sections[]`, `categoryStats[]`, `weakAreas[]`, `recommendations[]`;
- jawaban: `answers: Record<questionId, number>`.

Yang dikirim ke server adalah `toExamPayload(result)`: `level`, `score`, `total=100`, `passed=targetMet`, `sections`, `correct`, `answered`, `totalQuestions`, `durationSec`, `startedAt`, dan `review[]`. `ExamAttempt` menyimpan `id`, `level`, `startedAt`, `finishedAt`, nilai tersebut, serta JSON `sections`/`review`.

Skor: `score = round(correct / total × 100)`, `targetScore = 70`, `targetMet = score >= 70`, `accuracy = round(correct / answered × 100)` (0 bila belum menjawab). **Bukan ambang JLPT resmi.** Kolom `passed` dipertahankan untuk kompatibilitas dan kini berarti target latihan tercapai. Tidak ada tabel/kolom baru: `sections` dan `review` tetap JSON, dan ujian tetap disimpan lewat `recordExam`, bukan `quiz_attempts`.

### 7.6 `ExamDefinition` (legacy)

`ExamDefinition` dan `EXAM_COUNTS` + `buildExam()` di `quiz.ts` adalah jalur lama. UI tidak memakainya lagi; `buildExam()` dipertahankan hanya untuk tes kompatibilitas sampai dihapus. Semua aturan runtime baru ada di `exam-engine.ts`.

### 7.7 Permainan (Fase 6)

Enam permainan memakai domain murni dan satu read model attempt:

```ts
type GameId =
  | "word-builder"
  | "kana-matching"
  | "vocabulary-rush"
  | "sentence-builder"
  | "kanji-challenge"
  | "daily-challenge";

type GameDifficulty = "easy" | "standard" | "hard";

interface GameDefinition {
  id: GameId;
  title: string;
  titleJp?: string;
  description: string;
  objectives: string[];
  kind: GameId;
  level: CurriculumLevel;
  href: string;
  xpReward: number;
}

interface GameAnswerDetail {
  id: string;
  prompt: string;
  expected: string;
  response: string;
  correct: boolean;
  explanation: string;
  timeMs?: number;
  hintUsed?: boolean;
}

interface GameAttempt {
  id: string;
  gameId: GameId;
  difficulty: GameDifficulty;
  score: number;
  correct: number;
  total: number;
  accuracy: number;        // 0..100, dihitung server
  durationSec: number;
  hintsUsed: number;
  details: GameAnswerDetail[];
  startedAt: string;
  playedAt: string;
}
```

Aturan domain:

- **Pembuat kata** menyusun kata dari ubin kana dan memvalidasi input NFKC terhadap `VOCAB_BY_KANA`. Hasil `alternate` berarti kata sah lain (diterima, arti berbeda); `invalid`/incomplete tidak pernah benar.
- **Cocokkan kana** memakai 4 mode (hiragana–romaji, katakana–romaji, kana–arti, kana–audio), 4/6/8 pasangan, tanpa batas waktu keseluruhan; skor mempertimbangkan kesalahan dan petunjuk.
- **Kejar kosakata** memakai urutan level dan batas waktu per kesulitan; opsi arti dideduplikasi sebelum dipilih.
- **Susun kalimat** memeriksa urutan token dan partikel; petunjuk memotong skor.
- **Tantangan kanji** mencampur arti, bacaan, dan pemakaian kanji dalam kata.
- **Tantangan harian** deterministik dari `dateKey` + kesulitan: 10 soal (3 kosakata, 3 kanji, 2 kana, 2 tata bahasa), opsi unik.

`recordGame()` adalah satu-satunya penulis:

- `gameId` harus terdaftar; `difficulty` fallback ke `standard` bila tidak dikenal;
- `total` 0–200 dan wajib > 0; `correct` 0–total; `score` 0–100.000; `durationSec` 0–7.200; `hintsUsed` 0–100;
- `accuracy = round(correct / total × 100)`;
- maksimal 100 detail; id/prompt/expected/response/explanation dipotong sesuai batas;
- XP = `10 + round(accuracy/100 × 20) + bonus kesulitan (0/5/10) + 5 jika sempurna`;
- attempt + activity ditulis dalam satu transaksi; durasi dibulatkan ke menit, minimal 1 menit.

Tantangan harian tidak disimpan sebagai definisi terpisah; pola dibangun ulang dari tanggal+kesulitan, sehingga tidak ada state server yang harus dijadwalkan.

---

## 8. Progres pengguna

### 8.1 `Profile`

| Field | Tipe | Aturan |
| --- | --- | --- |
| `name` | string | UI membatasi 2–24 karakter; server memangkas dan membatasi 40; default “Pelajar” |
| `xp` | number | ≥0; only bertambah lewat service |
| `streak` | number | ≥0; dihitung dari tanggal lokal |
| `bestStreak` | number | ≥ streak |
| `lastStudyDate` | string? | `YYYY-MM-DD` |
| `settings` | `Settings` | JSON di database |
| `createdAt` | string | ISO timestamp |

`Settings` default:

```ts
{
  dailyGoalXp: 50,
  dailyStudyMinutes: 30,
  dailyVocabTarget: 10,
  dailyLessonTarget: 1,
  weeklyFrequency: 5,
  studyTargetLevel: null,
  studyTargetWeeks: 12,
  theme: "system",
  showRomaji: true,
  showFurigana: true,
  speechRate: 0.9,
  voiceURI: null,
  autoPlayAudio: false,
}
```

Clamp API: `dailyGoalXp` 10–500, `dailyStudyMinutes` 5–240, `dailyVocabTarget` 1–100, `dailyLessonTarget` 1–10, `weeklyFrequency` 1–7, `studyTargetLevel` N5–N1 atau `null`, `studyTargetWeeks` 4–104 (UI 8/12/16/24/36), `speechRate` 0.5–1.5 (slider dan preset UI 0,5–1,5), tema hanya light/dark/system. `voiceURI` adalah string voice perangkat atau `null` (otomatis); tidak ada validasi katalog voice di server.

Target tidak punya tabel sendiri. Progres target dihitung dari `activity`, `reviews`, dan `lessons` hari ini; mengubah target hanya mengubah pembanding, bukan histori.

### 8.2 `CardProgress` / `ReviewSchedule`

| Field | Tipe | Catatan |
| --- | --- | --- |
| `itemId` | string | Id kosakata/kanji |
| `kind` | `"vocab"` / `"kanji"` | Menentukan jenis deck |
| `ease` | number | 1.3–3.0 |
| `intervalDays` | number | ≥0; 0 berarti baru/ulang cepat |
| `dueAt` | ISO string | Waktu jatuh tempo |
| `reps` | number | Jumlah ulasan |
| `lapses` | number | Jumlah lupa |
| `lastRating` | number? | 0–3 |
| `lastReviewedAt` | ISO string? | Null jika belum pernah |

Primary key database: `item_id` saja. Karena id kosakata dan kanji memakai prefix berbeda, tabrakan lintas jenis saat ini tidak terjadi. Jika kelak id dapat sama, PK harus menjadi `(item_id, kind)`.

`addCard` (Fase 8) menyisipkan kartu baru dari hasil ujian dengan nilai awal `ease=2.5`, `intervalDays=0`, `reps=0`, `lapses=0`, `dueAt=now`. Operasi bersifat idempoten (`ON CONFLICT(item_id) DO NOTHING`), memvalidasi id terhadap katalog, dan **tidak** memberi XP/activity karena bukan sesi ulasan. Payload: `AddCardPayload { itemId: string; kind: "vocab" | "kanji" }`.

### 8.3 `KanaProgress`

Field: `char`, `script`, `correct`, `wrong`, `mastery`, `lastSeen`. Primary key `char`. Mastery 0–5; naik 1 saat benar, turun 1 saat salah. UI menganggap `mastery >= 4` sebagai “dikuasai” dan `>= 2` sebagai “familiar”.

### 8.4 `LessonProgress`

Field: `lessonId`, `kind`, `score`, `completedAt`. Primary key `lesson_id`.

`kind` dibatasi `grammar | reading | listening | culture | vocabulary | kanji | sentence | pronunciation | kana-set | game | typing | conversation`. XP hanya diberikan pada penyelesaian pertama. Nilai `game` adalah jalur legacy; permainan Fase 6 memakai `game_attempts`, bukan `lessons`.

**Penting:** `lessonId` saat ini diisi id aktivitas/sumber oleh halaman (mis. `g-desu`, id artikel, `game-typing`), bukan `Lesson.id` katalog (`les-grammar-g-desu`). Lihat §15.1. Latihan mengetik memakai `typing-{mode}`; percakapan memakai id skenario.

### 8.5 `ReviewLog`

Field: `id`, `itemId`, `kind`, `rating`, `correct`, `mode`, `createdAt`.

- `correct = rating >= 2`.
- Log ditulis setiap `recordReview`; tidak ditulis untuk ulasan agregat `recordSession`.
- Tidak ada FK; kartu dapat dihapus tanpa menghapus riwayat.

### 8.6 `ExamAttempt`

Field seperti §7.5. Disimpan di tabel `exams`; `sections` dan `review` JSON. `passed` kini berarti target belajar 70% tercapai, dikirim klien dan server menyimpannya sebagai boolean; XP dihitung dari `score/total`, bukan dari `passed`.

### 8.7 `ActivityDay`

Field: `date` (`YYYY-MM-DD`), `xp`, `reviews`, `minutes`. Satu baris per hari, di-upsert secara aditif. Heatmap dan grafik XP membaca array ini (maksimum 400 hari terakhir dari query).

### 8.8 `ProgressSnapshot` / `UserProgress`

Snapshot adalah read model gabungan:

```ts
interface ProgressSnapshot {
  profile: Profile;
  cards: CardProgress[];       // semua kartu
  kana: KanaProgress[];        // semua karakter yang pernah dilatih
  lessons: LessonProgress[];   // semua lesson yang pernah selesai
  reviews: ReviewLog[];        // 120 terbaru
  exams: ExamAttempt[];        // 20 terbaru
  activity: ActivityDay[];     // 400 terbaru
  quizAttempts: QuizAttempt[]; // 30 terbaru
  questionStats: QuestionStat[];
  games: GameAttempt[];        // 100 terbaru
  favorites: CultureFavorite[]; // semua favorit artikel
  savedItems: SavedItem[];      // semua materi kamus pribadi
  savedCollections: SavedCollection[]; // semua koleksi, termasuk kosong
  writing: WritingAttempt[];    // 400 attempt terbaru
  stories: StoryAttempt[];      // 300 attempt terbaru
  stats: ProgressStats;
}
```

`ProgressStats` juga memuat `quizAttempts`, `quizAnswers`, dan `quizCorrect`, serta `gameAttempts`, `gameCorrect`, `gameQuestions`, dan `gameBestScore`, selain statistik ulasan/lesson/ujian yang lama. Sejak Fase 17, stats juga memuat `writingAttempts`, `writingCharacters`, `writingMastered`, dan `writingOrderMistakes`. Sejak Fase 18, stats memuat `storyAttempts`, `storiesCompleted`, dan `storyBestScore`. `favorites` memuat semua artikel yang disimpan (`articleId`, `savedAt`). `savedItems`/`savedCollections` selalu dimuat utuh (bukan sampel) karena dipakai untuk kamus pribadi dan ikut ekspor/impor.

Batasan array adalah keputusan ukuran payload, bukan aturan domain. Ekspor/impor memakai snapshot read model ini (termasuk batas array), bukan dump SQL mentah; jika data tumbuh, endpoint perlu pagination/streaming.

### 8.9 `Achievement`

25 definisi pencapaian dipusatkan di `src/lib/achievements.ts`: `AchievementDefinition` memuat `id`, `title`, `description`, `metric`, `target`, `tier`, dan `icon`. Metrik dihitung dari snapshot (contoh `lessonCount`, `vocabLearned`, `kanaMastered`, `streak`, `examPassed`, `perfectQuiz`, `kanjiLearned`); pencapaian menulis/cerita memakai statistik `writingAttempts`/`writingMastered`/`storyAttempts`/`storiesCompleted` dari snapshot yang sama. Tidak ada state “achievement terbuka” di database; status diturunkan setiap snapshot sehingga reset/impor konsisten.

`SavedItem` adalah pengganti konkret `Bookmark` umum untuk kosakata, kanji, dan tata bahasa. Favorit budaya tetap model khusus `CultureFavorite` di `culture_favorites`; keduanya tidak saling menggantikan.

### 8.10 `LearningAttempt`

Tipe netral untuk analitik (`kind`, `activityId`, benar/total, durasi, XP). Belum ada tabel. Saat ini:

- ulasan → `reviews` + `activity`;
- lesson → `lessons` + `activity`;
- ujian → `exams` + `activity`;
- kuis/latihan → `quiz_attempts` + `question_stats` + `activity` (rincian per soal);
- permainan → `game_attempts` + `activity` (rincian per soal di kolom JSON `details`).

`LearningAttempt` netral tetap belum dipersistensikan; `quiz_attempts` dan `game_attempts` adalah model khusus yang sudah aktif.

### 8.11 `SavedItem` / `SavedCollection` (Fase 10)

```ts
type SavedItemKind = "vocabulary" | "kanji" | "grammar";

interface SavedItem {
  kind: SavedItemKind;
  refId: string;            // id VocabWord/Kanji/GrammarPoint
  note: string;             // maksimum 1.000 karakter
  collectionId: string | null;
  savedAt: string;          // ISO
  updatedAt: string;        // ISO
}

interface SavedCollection {
  id: string;               // kolom_simpan_<uuid>
  name: string;             // 1–60 karakter
  description: string;      // maksimum 240 karakter
  createdAt: string;
  updatedAt: string;
}
```

Aturan:

- kunci utama `(kind, ref_id)`: satu materi disimpan sekali; menyimpan ulang memperbarui catatan/koleksi, bukan menduplikasi;
- referensi harus ada di konten; id tak dikenal ditolak server;
- menghapus koleksi mengosongkan `collectionId` item terkait, **tidak** menghapus item;
- `savedItems`/`savedCollections` ikut ekspor/impor/reset;
- simpan/hapus/ubah catatan tidak memberi XP atau activity;
- ulasan materi tersimpan adalah pengulangan mandiri dan **tidak** memanggil `recordReview`, sehingga `dueAt`, `ease`, `reps`, dan statistik SRS tidak berubah.

### 8.12 Latihan mengetik dan percakapan (Fase 11)

Keduanya **tidak** memiliki tabel baru. Hasil sesi disimpan sebagai baris `lessons`:

| Aktivitas | `lessonId` | `kind` | `score` | XP |
| --- | --- | --- | --- | --- |
| Mengetik | `typing-{mode}` | `typing` | akurasi 0–100 | 20 pada penyelesaian pertama |
| Percakapan | id skenario | `conversation` | skor percobaan pertama 0–100 | 20 pada penyelesaian pertama |

- Halaman mengetik juga memanggil `recordSession` untuk XP per jawaban benar dan menit belajar; halaman percakapan hanya memanggil `recordLesson`.
- Tidak ada transkrip percakapan, pilihan per langkah, ketikan mentah, atau waktu per tombol yang dipersistensikan.
- Mengulang sesi memperbarui skor terbaru pada baris lesson yang sama dan tidak memberi XP penyelesaian kedua.
- Karena tidak ada tabel/kolom baru, database lama tetap kompatibel; tidak perlu migrasi.

### 8.13 Impor berkonfirmasi dan batas payload (Fase 12)

Impor tetap mengganti seluruh progres, tetapi sejak Fase 12 tidak dapat dijalankan sebagai efek samping request sederhana:

| Lapisan | Aturan |
| --- | --- |
| Transport | Wajib `Content-Type: application/json`, same-origin, body maksimum 5 MiB; pelanggaran 415/403/413 |
| Envelope | Body harus `{ confirm: true, snapshot }`; tanpa konfirmasi eksplisit ditolak 400 |
| Pratinjau | UI menampilkan modal “Timpa seluruh progres?” berisi profil dan jumlah koleksi sebelum mengirim |
| Validasi | Profil, settings, dan setiap array diperiksa; referensi saved item harus ada di katalog; bentuk salah ditolak **sebelum** DELETE |
| Batas array | cards 20.000; kana 1.000; lessons 5.000; reviews 5.000; exams 500; quizAttempts 1.000; questionStats 5.000; games 500; activity 1.000; favorites 2.000; savedCollections 200; savedItems 5.000; writing 5.000; stories 1.000 |
| Atomisitas | Semua DELETE + INSERT dalam satu transaksi; gagal di tengah tidak menyisakan state separuh |
| Batas produk | Impor adalah **replace**, bukan merge; tidak membuat backup otomatis; pengguna harus mengekspor lebih dulu bila perlu |

Tidak ada tabel/kolom baru. Batas ini melengkapi §12.4, bukan menggantinya.

### 8.14 Preferensi audio dan cakupan pemutaran (Fase 16)

Fase 16 tidak menambah tabel. Preferensi audio memakai `Settings` yang sudah ada:

| Field | Nilai | Perilaku |
| --- | --- | --- |
| `speechRate` | 0,5–1,5 | Dipakai pemutar global; server menjepit nilai di luar rentang |
| `voiceURI` | string atau `null` | `null` = pilih voice Jepang otomatis; voice non-Jepang tidak dipakai |
| `autoPlayAudio` | boolean | Hanya memulai pemutaran saat halaman latihan menyimak dibuka bila peramban mengizinkan |

- Tidak ada riwayat pemutaran, antrean yang dipersistensikan, unggahan, transkrip audio, atau aset MP3 di database.
- Studio `/audio`, bacaan, percakapan, menyimak, pelafalan, dan tombol pelafalan memakai satu `AudioPlayer` global; perpindahan rute menghentikan utterance aktif.
- Voice Jepang yang tidak tersedia menghasilkan status “tidak tersedia” dan pesan; tidak ada fallback ke voice bahasa lain dan tidak ada skor akustik.

### 8.15 Persistensi attempt menulis (Fase 17)

Attempt disimpan di tabel khusus `writing_attempts`, **bukan** di `lessons`:

```sql
writing_attempts(
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  script TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('guided','free')),
  score INTEGER NOT NULL,
  expected_strokes INTEGER NOT NULL,
  drawn_strokes INTEGER NOT NULL,
  order_mistakes INTEGER NOT NULL DEFAULT 0,
  duration_sec INTEGER NOT NULL,
  created_at TEXT NOT NULL
)
CREATE INDEX idx_writing_attempts_created ON writing_attempts (created_at);
CREATE INDEX idx_writing_attempts_character ON writing_attempts (character_id);
```

Aturan:

- `characterId` harus ada di `WRITING_BY_ID`; `script` diambil dari katalog, bukan dipercaya dari klien.
- `mode` hanya `guided`/`free`; `score` dijepit 0–100; `drawnStrokes`/`orderMistakes` 0–80; `durationSec` 0–3.600.
- XP 15 hanya pada attempt **pertama** untuk karakter tersebut; attempt berikutnya tetap disimpan dan menambah menit belajar tanpa XP penyelesaian.
- Snapshot memuat maksimum **400 attempt terbaru**; statistik memakai seluruh tabel: jumlah attempt, karakter unik, mastery (`MAX(score) ≥ 80`), dan total order mistakes.
- Tidak ada koordinat goresan mentah, snapshot kanvas, gambar, atau waktu per goresan yang dipersistensikan.
- Reset/impor menghapus dan mengisi ulang tabel ini bersama tabel progres lain; impor memvalidasi `characterId`, mode, dan skor.

### 8.16 Persistensi attempt cerita (Fase 18)

Hasil teater cerita disimpan di tabel khusus `story_attempts`, **bukan** di `lessons`:

```sql
story_attempts(
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL,
  level TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('study','watch')),
  score INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  total INTEGER NOT NULL,
  scenes_completed INTEGER NOT NULL,
  duration_sec INTEGER NOT NULL,
  completed_at TEXT NOT NULL
)
CREATE INDEX idx_story_attempts_completed ON story_attempts (completed_at);
CREATE INDEX idx_story_attempts_story ON story_attempts (story_id);
```

Aturan:

- `storyId` harus ada di `STORY_BY_ID`; `level` diambil dari katalog, bukan dari klien.
- `mode` hanya `study`/`watch`; `score` dijepit 0–100; `correct` 0–`total`; `total` 1–20; `scenesCompleted` 1–30 dan tidak melebihi jumlah adegan cerita; `durationSec` 0–3.600.
- XP **25** hanya pada attempt **pertama** untuk cerita tersebut; attempt berikutnya tetap disimpan dan menambah menit belajar tanpa XP penyelesaian.
- Statistik server: jumlah attempt, jumlah cerita unik, jumlah cerita selesai (ada attempt dengan skor ≥ 60), dan skor terbaik.
- Snapshot memuat maksimum **300 attempt terbaru**; impor dibatasi 1.000 attempt. Tidak ada transkrip, posisi baris, jawaban per soal, atau audio yang dipersistensikan.
- Reset/impor menghapus dan mengisi ulang tabel ini bersama tabel progres lain; impor memvalidasi `storyId`, mode, dan angka.
- Tabel ditambahkan secara additive; database lama mendapat tabel kosong dan tetap kompatibel tanpa `schema_version`.

---

## 9. Skema persistensi

Database: SQLite melalui `node:sqlite`; file dari `KOTOBA_DB_PATH` atau `<cwd>/.data/kotoba.db`. Mode WAL, `busy_timeout=5000`.

### 9.1 Tabel

```sql
profile(
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_study_date TEXT,
  settings TEXT NOT NULL,          -- JSON Settings
  created_at TEXT NOT NULL
)

cards(
  item_id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('vocab','kanji')),
  ease REAL NOT NULL,
  interval_days INTEGER NOT NULL,
  due_at TEXT NOT NULL,
  reps INTEGER NOT NULL,
  lapses INTEGER NOT NULL,
  last_rating INTEGER,
  last_reviewed_at TEXT
)

kana_progress(
  char TEXT PRIMARY KEY,
  script TEXT NOT NULL,
  correct INTEGER NOT NULL,
  wrong INTEGER NOT NULL,
  mastery INTEGER NOT NULL,
  last_seen TEXT
)

lessons(
  lesson_id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  score INTEGER,
  completed_at TEXT NOT NULL
)

reviews(
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  rating INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  mode TEXT NOT NULL,
  created_at TEXT NOT NULL
)

exams(
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  passed INTEGER NOT NULL,
  sections TEXT NOT NULL,          -- JSON ExamSectionResult[]
  correct INTEGER NOT NULL,
  answered INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  duration_sec INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT NOT NULL,
  review TEXT NOT NULL             -- JSON ExamAnswerReview[]
)

activity(
  date TEXT PRIMARY KEY,           -- YYYY-MM-DD lokal
  xp INTEGER NOT NULL,
  reviews INTEGER NOT NULL,
  minutes INTEGER NOT NULL
)

quiz_attempts(
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,
  title TEXT NOT NULL,
  level TEXT,
  total INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  score INTEGER NOT NULL,
  duration_sec INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT NOT NULL,
  answers TEXT NOT NULL            -- JSON ExerciseAttemptAnswer[]
)

question_stats(
  question_id TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  wrong INTEGER NOT NULL,
  last_result TEXT NOT NULL,
  last_attempt_at TEXT NOT NULL,
  total_time_ms INTEGER NOT NULL
)

game_attempts(
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  total INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  duration_sec INTEGER NOT NULL,
  hints_used INTEGER NOT NULL,
  details TEXT NOT NULL,           -- JSON GameAnswerDetail[]
  started_at TEXT NOT NULL,
  played_at TEXT NOT NULL
)

culture_favorites(
  article_id TEXT PRIMARY KEY,     -- id CultureArticle yang ada di katalog
  saved_at TEXT NOT NULL
)

saved_collections(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)

saved_items(
  kind TEXT NOT NULL CHECK (kind IN ('vocabulary','kanji','grammar')),
  ref_id TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  collection_id TEXT,              -- NULL = tanpa koleksi; tanpa FK fisik
  saved_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (kind, ref_id)
)

writing_attempts(
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  script TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('guided','free')),
  score INTEGER NOT NULL,
  expected_strokes INTEGER NOT NULL,
  drawn_strokes INTEGER NOT NULL,
  order_mistakes INTEGER NOT NULL DEFAULT 0,
  duration_sec INTEGER NOT NULL,
  created_at TEXT NOT NULL
)

story_attempts(
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL,
  level TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('study','watch')),
  score INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  total INTEGER NOT NULL,
  scenes_completed INTEGER NOT NULL,
  duration_sec INTEGER NOT NULL,
  completed_at TEXT NOT NULL
)
```

Index: `idx_cards_due(due_at)`, `idx_reviews_created(created_at)`, `idx_activity_date(date)`, `idx_quiz_attempts_finished(finished_at)`, `idx_question_stats_attempted(last_attempt_at)`, `idx_game_attempts_played(played_at)`, `idx_culture_favorites_saved(saved_at)`, `idx_saved_items_collection(collection_id)`, `idx_saved_items_saved(saved_at)`, `idx_writing_attempts_created(created_at)`, `idx_writing_attempts_character(character_id)`, `idx_story_attempts_completed(completed_at)`, `idx_story_attempts_story(story_id)`.

Total **15 tabel**: `profile`, `cards`, `kana_progress`, `lessons`, `reviews`, `exams`, `activity`, `quiz_attempts`, `question_stats`, `game_attempts`, `culture_favorites`, `saved_collections`, `saved_items`, `writing_attempts`, `story_attempts`.

Fase 11 **tidak menambah tabel atau kolom**. Latihan mengetik dan percakapan memakai `lessons`; rencana belajar adalah proyeksi runtime. Fase 12 juga **tidak menambah tabel/kolom/endpoint**; skema tetap 13 tabel saat itu. Fase 16 juga **tidak menambah tabel/kolom/endpoint**; hanya preferensi audio yang sudah ada di `Settings` yang dipakai.

Fase 17 menambah tabel **`writing_attempts`** secara additive (CREATE TABLE IF NOT EXISTS + dua index) dan endpoint **`POST /api/progress/writing`**. Tidak ada kolom tabel lama yang berubah; database lama mendapat tabel kosong dan tetap kompatibel tanpa `schema_version`.

Fase 18 menambah tabel **`story_attempts`** secara additive (CREATE TABLE IF NOT EXISTS + dua index) dan endpoint **`POST /api/progress/story`**. Tidak ada kolom tabel lama yang berubah; database lama mendapat tabel kosong, total menjadi 15 tabel dan 20 endpoint, tetap tanpa `schema_version`.

### 9.2 Yang **tidak** ada di database

- tabel konten/kursus/lesson katalog/soal;
- data goresan/koordinat menulis (JSON KanjiVG statis di `public/`);
- tabel target/streak/pencapaian (semuanya diturunkan);
- achievement definitions;
- `LearningAttempt` netral (model khusus `quiz_attempts`/`game_attempts` sudah aktif);
- `schema_version` (belum dibuat);
- foreign key ke konten (memang tidak mungkin tanpa tabel konten).

### 9.3 Transaksi

Setiap mutasi yang menyentuh lebih dari satu tabel dibungkus `BEGIN/COMMIT/ROLLBACK`:

- `recordReview`: kartu + review log + profil/XP + activity;
- `recordSession`: profil/XP/streak + activity;
- `recordKana`: kana_progress + profil/XP + activity;
- `recordLesson`: lesson + profil/XP (hanya pertama) + activity;
- `recordExam`: exam + profil/XP + activity;
- `recordQuizAttempt`: quiz_attempts + upsert question_stats + profil/XP + activity;
- `recordGame`: game_attempts + profil/XP + activity;
- `recordWriting`: writing_attempts + profil/XP (hanya attempt pertama) + activity;
- `recordStory`: story_attempts + profil/XP (hanya attempt pertama per cerita) + activity;
- `saveItem`: upsert/delete saved_items + validasi referensi (tanpa XP/activity);
- `saveCollection`: insert/update/delete saved_collections; hapus koleksi mengosongkan `saved_items.collection_id` dalam transaksi yang sama;
- `importProgress`: hapus + isi ulang seluruh tabel progres (termasuk attempt kuis/permainan, writing, statistik soal, favorit budaya, saved collections/items).

Jika satu langkah gagal, tidak ada state setengah jadi.

---

## 10. Statistik dan nilai turunan

`getSnapshot()` menghitung:

| Statistik | Sumber | Catatan |
| --- | --- | --- |
| `totalReviews` | `SUM(activity.reviews)` | Termasuk ulasan agregat dari sesi latihan, tidak hanya log kartu |
| `correctReviews` | `COUNT(reviews WHERE correct=1)` | Hanya log `recordReview` |
| `studyMinutes` | `SUM(activity.minutes)` | Akumulasi semua aktivitas |
| `lessonsCompleted` | `COUNT(lessons)` | Jumlah baris lesson unik |
| `examsTaken` | `COUNT(exams)` | Semua attempt |
| `quizAttempts` | `COUNT(quiz_attempts)` | Semua mode latihan/kuis |
| `quizAnswers` | `SUM(quiz_attempts.total)` | Termasuk jawaban benar dan salah |
| `quizCorrect` | `SUM(quiz_attempts.correct)` | Dasar akurasi latihan |
| `gameAttempts` | `COUNT(game_attempts)` | Semua sesi permainan |
| `gameCorrect` | `SUM(game_attempts.correct)` | Jawaban benar permainan |
| `gameQuestions` | `SUM(game_attempts.total)` | Total soal permainan |
| `gameBestScore` | `MAX(game_attempts.score)` | Skor tertinggi, bukan skor terbaru |
| `writingAttempts` | `COUNT(writing_attempts)` | Semua attempt, termasuk ulangan |
| `writingCharacters` | `COUNT(DISTINCT character_id)` | Karakter yang pernah dilatih |
| `writingMastered` | `COUNT(DISTINCT character_id WHERE score >= 80)` | Mastery memakai skor terbaik |
| `writingOrderMistakes` | `SUM(order_mistakes)` | Akumulasi indikasi urutan salah |
| `storyAttempts` | `COUNT(story_attempts)` | Semua attempt, termasuk ulangan |
| `storiesCompleted` | `COUNT(DISTINCT CASE WHEN score >= 60 THEN story_id END)` | Cerita dianggap selesai bila ada attempt dengan skor ≥ 60 |
| `storyBestScore` | `MAX(story_attempts.score)` | Skor terbaik lintas cerita |
| `dueCards` | `cards.dueAt <= now` | Dihitung di server |
| `newCardsAvailable` | konstanta `0` | Placeholder; belum dihitung |

**Konsekuensi:** akurasi ulasan `correctReviews / totalReviews` dapat terlihat lebih rendah jika ada sesi latihan yang menambah `totalReviews` tanpa log rinci. Jika analitik akurasi menjadi fitur utama, tambahkan definisi terpisah: akurasi kartu = `correctReviews / COUNT(reviews)`, dan tampilkan label yang sesuai.

Nilai turunan lain (Fase 10):

- **XP hari ini** = `activity` hari ini `xp`;
- **target XP** = `profile.settings.dailyGoalXp`; persentase = `min(100, round(xpHariIni / target * 100))`;
- **target durasi** = `dailyStudyMinutes` dibanding `activity.minutes` hari ini;
- **target kosakata** = `dailyVocabTarget` dibanding jumlah item unik yang diulas/dipelajari hari ini (bukan jumlah ulasan);
- **target pelajaran** = `dailyLessonTarget` dibanding jumlah lesson unik yang selesai hari ini;
- **frekuensi mingguan** = `weeklyFrequency` dibanding jumlah hari aktif Senin–Minggu berjalan; hari aktif dihitung dari `activity.xp > 0`;
- **streak** = `streakSummary()`: current, longest (`profile.bestStreak`), hari aktif minggu ini, kalender 17 minggu; tanggal memakai `toDateKey()` lokal;
- **level** = `levelFromXp(profile.xp)`;
- **mastery kana** = `kana_progress.mastery`;
- **kartu jatuh tempo** = `CardProgress.dueAt <= now`;
- **rekomendasi** = `buildRecommendations()`: maksimum 4 item, masing-masing `priority`, `reason`, dan `evidence`; aturan deterministik, tanpa ML/panggilan jaringan;
- **pencapaian** = 25 definisi di `src/lib/achievements.ts`, status dihitung dari snapshot;
- **kamus pribadi** = `saved_items` + `saved_collections`; bukan SRS dan tidak menambah XP;
- **mastery menulis** = skor tertinggi per `character_id` ≥ 80; attempt terbaru tidak menurunkan mastery;
- **statistik cerita** = jumlah attempt, jumlah cerita unik, cerita selesai bila skor terbaik ≥ 60, dan skor terbaik; diturunkan dari `story_attempts`, tanpa tabel tambahan;
- **kemajuan teater** = skor/cerita terbaru dibaca dari snapshot; pemutaran tidak memengaruhi statistik sampai kuis disimpan;
- **rencana belajar** = `buildStudyPlan()` dari level berjalan, `CURRICULUM_LESSONS`, `MODULE_BY_ID`, dan settings; deterministik, tanpa tabel rencana.

Target/streak/kalender tidak disimpan sebagai tabel. Mengubah target mengubah pembanding hari ini, bukan histori; ini disengaja agar target tetap alat bantu, bukan data imutabel.

---

## 11. Aturan perhitungan

### 11.1 XP dan level

```ts
xpForLevel(level) = 150 * n + 50 * n * n, n = max(1, level) - 1
```

Contoh ambang: Level 1 = 0, Level 2 = 200, Level 3 = 500, Level 4 = 900, Level 5 = 1.400, Level 6 = 2.000. `levelFromXp` menaikkan level selama ambang berikutnya tercapai (maksimum 99). Persentase level = `min(99, floor(current / needed * 100))`; sengaja tidak menampilkan 100% sebelum naik level.

Sumber XP:

| Aksi | XP | Penentu |
| --- | ---: | --- |
| Ulasan benar | 10 | server (`rating >= 2`) |
| Ulasan salah | 3 | server |
| Kana benar | 4 | server |
| Kana salah | 2 | server |
| Lesson grammar | 30 | server dari jenis, penyelesaian pertama |
| Lesson reading | 25 | server |
| Lesson listening | 20 | server |
| Lesson culture | 15 | server |
| Lesson kana-set | 20 | server |
| Lesson typing | 20 | server, penyelesaian pertama |
| Lesson conversation | 20 | server, penyelesaian pertama |
| Lesson game | 10 | server |
| Attempt menulis (pertama per karakter) | 15 | server |
| Penyelesaian cerita (pertama per cerita) | 25 | server, saat kuis disimpan |
| Ujian | `40 + round(score/total * 60)` | server |
| Kuis/latihan (selain lesson/exam) | `10 + round(skor/100 * 20)` | server dari skor attempt |
| Permainan | `10 + round(akurasi/100 * 20) + bonus 0/5/10 + 5 jika sempurna` | server dari correct/total + kesulitan |
| Sesi latihan legacy | dikirim klien, clamp 0–2000 | klien (single-player); bukan jalur permainan |

**Catatan integritas:** `recordSession` menerima `xp`, `minutes`, dan `reviews` dari klien lalu meng-clamp. `recordGame` menghitung XP dari `correct/total` + kesulitan, tetapi tetap menerima status benar/salah per detail dari klien. Ini bukan anti-cheat; ini aplikasi belajar lokal satu pengguna. Untuk deployment multi-pengguna, hasil latihan harus dihitung/diverifikasi server dari jawaban, bukan dari angka ringkasan klien.

### 11.2 SRS (SM-2-inspired, Fase 5)

State awal: `ease=2.5`, `intervalDays=0`, `reps=0`, `lapses=0`, `dueAt=now`.

Rating 0–3 dipetakan ke kualitas SM-2 2–5. Delta ease: `{0: -0.32, 1: -0.14, 2: 0, 3: +0.10}`, dibatasi 1.3–3.0.

| Rating | Ease | Interval | Efek lain |
| --- | --- | --- | --- |
| 0 Lagi | `-0.32` | 0; due = now + 10 menit | `lapses += 1` |
| 1 Sulit | `-0.14` | baru: 1 hari; selain itu `round(prev × 1.2)` | minimal 1 hari |
| 2 Bagus | 0 | baru: 1 hari; ulangan kedua: 6 hari; selain itu `round(prev × ease)` | — |
| 3 Mudah | `+0.10` | baru: 2 hari; ulangan kedua: 8 hari; selain itu `max(2, round(prev × ease × 1.3))` | — |

Semua interval dibatasi `MAX_INTERVAL_DAYS = 3650`. Setelah itu `reps += 1`, ease dibulatkan 2 desimal, `lastRating = r`, `lastReviewedAt = now`. `estimateInterval()` memakai rumus yang sama tanpa mengubah kartu untuk label tombol.

Label mastery kartu: `reps=0` Baru; `reps<3` atau `lapses>2` Belajar; `reps<6` Familiar; selain itu Dikuasai.

Ini **bukan** implementasi penuh SM-2: parameter belum dikalibrasi terhadap data memori nyata, tetapi rumus deterministik dan ditutup sembilan unit test.

### 11.3 Streak

Saat `touchStudy` dipanggil:

- jika `lastStudyDate == hari ini`: streak tidak berubah;
- jika `lastStudyDate == kemarin`: streak += 1;
- selain itu: streak = 1;
- `bestStreak = max(bestStreak, streak)`.

Perhitungan memakai tanggal lokal proses. Belajar dua kali dalam sehari tidak menambah streak; melewatkan satu hari mereset.

### 11.4 Ujian

- Skor = `round(correct / totalQuestions * 100)`; total = 100.
- Lulus = skor ≥ ambang level (N5 80, N4 90, N3 95, N2 90, N1 100).
- XP = `40 + round(skor/100 * 60)` (maksimum 100).
- Durasi = `minutes*60 - secondsLeft`, minimal 1 detik.
- Sejak Fase 5, benar/salah memakai `gradeExercise` yang sama dengan latihan; attempt ujian tetap disimpan di tabel `exams`, bukan `quiz_attempts`.
- `sections[].score` = persentase benar per bagian; `points` = jumlah soal bagian.

---

## 12. Aturan validasi

### 12.1 Konten

`src/content/content.test.ts` memeriksa:

- jumlah minimum dan keunikan id per jenis;
- field wajib (bacaan, arti, contoh, formasi, register, dll.);
- `answerIndex` di dalam rentang opsi;
- furigana valid setelah markup dilepas;
- multiset token susun kalimat = jawaban;
- kategori/grup budaya lengkap, `sourceNote`, 4 fakta, 2 soal, 6 kosakata, URL sumber https, dan `minutes` ada;
- pembangun kuis/ujian menghasilkan bagian non-kosong.

Fase 7 menambah dua berkas tes:

- `src/lib/speech-recognition.test.ts` — normalisasi NFKC/tanda baca, katakana→hiragana, ー/々, batas `match`/`close` (≥0,75)/`different`, input kosong, dan pesan galat izin/perangkat;
- `src/content/listening-drills.test.ts` — 15 drill, tepat 3 per level, id unik, 4 opsi unik, `answerIndex` valid, teks Jepang, terjemahan/penjelasan/tip, serta pemetaan ke `listeningDrillExercises()`.

Fase 8 menambah:

- `src/lib/exam-engine.test.ts` — 17 tes: empat mode × lima level, komposisi bagian, opsi unik/`answerIndex`, fallback level, determinisme RNG, penilaian/akurasi/kosong, area lemah, rekomendasi, retry, dan adaptor payload;
- `addCard` di `src/server/progress-service.test.ts` — idempoten, tanpa XP, menolak id katalog yang tidak dikenal.

Fase 9 menambah:

- `src/lib/culture-facts.test.ts` — 132 fakta, id/rujukan unik, padding tanggal lokal, determinisme hari yang sama, kunci stabil;
- perluasan `src/content/content.test.ts` — 33 artikel, cakupan grup/kategori, fakta/kuis/kosakata/topik/menit/sumber, register formal/arkais, opsi kuis unik dan `answerIndex` valid;
- perluasan `src/server/progress-service.test.ts` — favorit idempoten, artikel tak dikenal ditolak, ekspor/reset/impor termasuk favorit.

Fase 11 menambah:

- `src/lib/typing.test.ts` — alias romaji, normalisasi Jepang, tiga mode, sesi deterministik, kana romaji unik, mode arti→kanji berisi kanji, batas jumlah soal, dan akurasi 0/70/100;
- `src/lib/study-plan.test.ts` — tanggal 12 minggu, total terencana/belum, judul modul (bukan id mentah), milestone target, cakupan N4, penyesuaian target saat N5 selesai, rencana 4 minggu yang ketat, dan clamp minggu 4–104;
- `src/content/conversations.test.ts` — id/level/kategori/tujuan valid, tepat satu pilihan benar dan id pilihan unik, teks/reading valid, 3 frasa kunci dengan catatan.

Fase 17 menambah:

- `src/lib/writing.test.ts` — katalog 319 entri, tahap/level, id unik, bentuk data goresan, dan arti kana kosong;
- `src/lib/writing-geometry.test.ts` — perbandingan goresan, jumlah goresan, urutan, skor, dan label mastery;
- perluasan `src/server/progress-service.test.ts` — attempt menulis, XP pertama, dan roundtrip impor;
- perluasan `src/lib/achievements.test.ts` — dua pencapaian menulis.

Fase 18 menambah:

- `src/content/stories.test.ts` — 3/9/36/9, id unik, reading = `furiganaReading(jp)`, referensi kosakata/gramatika, pembicara/karakter panggung, opsi/answerIndex, dan soal listening;
- perluasan `src/server/progress-service.test.ts` — dua attempt cerita: XP hanya pada attempt pertama, hitungan attempt/cerita selesai/skor terbaik, mode `watch`, dan id cerita tak dikenal ditolak;
- perluasan `src/lib/achievements.test.ts` — `story-first`/`story-3` dan total 25 definisi.

### 12.2 Katalog

`src/lib/content-validation.ts` memeriksa:

- id modul/lesson unik;
- `courseId`/`moduleId` konsisten;
- `order >= 1`;
- lesson tidak kosong dan punya objectives/refs;
- estimasi menit > 0;
- `href` internal;
- setiap ref ada di map konten;
- seluruh konten tercakup katalog.

`assertValidCurriculum()` melempar daftar masalah dengan path yang dapat ditelusuri.

### 12.3 Payload API

- `rating` 0–3; `kind` hanya vocab/kanji;
- `itemId` non-kosong, maksimum 120 karakter;
- `addCard`: `kind` vocab/kanji dan `itemId` harus ada di `VOCAB_BY_ID`/`KANJI_BY_ID`; id tak dikenal ditolak; operasi idempoten tanpa XP;
- `xp` sesi 0–2000; `minutes` 0–600; `reviews` 0–1000;
- `lessonId` non-kosong, maksimum 160; `score` 0–100;
- `level` harus salah satu N5–N1;
- `total` ujian 1–300 (default 180); `score` 0–total;
- payload kuis: `mode` salah satu practice/topic/review/lesson/vocabulary/exam; `title` maksimum 160; `answers` 1–100; `score` jawaban 0–1; `timeMs` 0–600.000; `durationSec` 0–4 jam;
- server menghitung ulang `total`, `correct`, dan `score` attempt dari `answers`, bukan mempercayai agregat klien;
- payload permainan: `gameId` harus terdaftar; `difficulty` easy/standard/hard; `total` 1–200; `correct` 0–total; `score` 0–100.000; `durationSec` 0–7.200; `hintsUsed` 0–100; `details` maksimal 100; server menghitung `accuracy` dan XP;
- payload favorit: `articleId` harus ada di `CULTURE_BY_ID`; operasi idempoten dan tidak memberi XP;
- payload saved item: `kind` vocabulary/kanji/grammar; `refId` harus ada di `VOCAB_BY_ID`/`KANJI_BY_ID`/`GRAMMAR_BY_ID`; `note` maksimum 1.000; `collectionId` harus ada atau null; `remove: true` menghapus;
- payload koleksi: `name` 1–60 karakter, `description` maksimum 240; koleksi yang dihapus mengosongkan item terkait;
- hasil mengetik/percakapan memakai endpoint lesson yang sudah ada; `kind` harus typing/conversation dan `score` 0–100; server tidak menilai ulang jawaban;
- payload menulis: `characterId` harus ada di `WRITING_BY_ID`; `mode` guided/free; `score` 0–100; `drawnStrokes`/`orderMistakes` 0–80; `durationSec` 0–3.600; `script` dan `expectedStrokes` diambil dari katalog; server tidak menilai ulang geometri;
- payload cerita: `storyId` harus ada di `STORY_BY_ID`; `mode` study/watch; `score` 0–100; `correct` 0–`total`; `total` 1–20; `scenesCompleted` 1–30 dan ≤ jumlah adegan; `durationSec` 0–3.600; server tidak menilai ulang jawaban kuis;
- settings target belajar: `studyTargetLevel` N5–N1 atau null; `studyTargetWeeks` 4–104; tidak ada endpoint baru;
- `sections` maksimum 6; `review` maksimum 300; `passed` berarti target belajar 70%, bukan kelulusan JLPT resmi;
- pengaturan di-clamp seperti §8.1.

### 12.4 Impor

Impor menerima envelope `{ confirm: true, snapshot }` dan menolak body tanpa konfirmasi eksplisit. Server memvalidasi profil dan pengaturan (termasuk `studyTargetLevel`/`studyTargetWeeks`), membatasi array (cards 20.000; kana 1.000; lessons 5.000; reviews 5.000; exams 500; quizAttempts 1.000; questionStats 5.000; games 500; activity 1.000; favorites 2.000; savedCollections 200; savedItems 5.000; writing 5.000; stories 1.000), memeriksa id artikel/saved item/writing/cerita terhadap katalog, lalu mengganti data dalam transaksi. Setiap attempt cerita juga harus merujuk `STORY_BY_ID` dengan mode `study`/`watch`. Bentuk yang tidak valid ditolak sebelum penghapusan. UI menampilkan pratinjau “Timpa seluruh progres?” dan tidak mengirim apa pun sampai pengguna memilih “Ya, timpa”. Impor adalah replace, bukan merge; tidak ada backup otomatis. Detail implementasi ada di `assertImportShape`/`importProgress`.

### 12.5 Database

- `profile.id = 1`;
- `cards.kind` check vocab/kanji;
- primary key mencegah duplikasi kartu/lesson/hari;
- tidak ada FK ke konten; integritas id adalah tanggung jawab aplikasi/validator.

---

## 13. Siklus hidup data

```text
Startup
  → buka SQLite, WAL, busy_timeout
  → migrate() membuat tabel + seed profil
  → getSnapshot() membaca state + agregat
  → API mengirim snapshot

Aksi pengguna
  → route handler memvalidasi payload
  → progress-service membuka transaksi
  → menulis state + log + activity
  → commit
  → getSnapshot() baru
  → klien mengganti snapshot + cache

Reset
  → hapus cards, kana, lessons, reviews, exams, quiz_attempts, question_stats, game_attempts, culture_favorites, saved_items, saved_collections, writing_attempts, story_attempts, activity
  → pertahankan nama + settings
  → snapshot kosong

Impor
  → pratinjau modal + konfirmasi eksplisit
  → validasi envelope + clamp
  → tolak sebelum DELETE bila bentuk salah
  → hapus tabel progres + isi ulang dalam transaksi
  → snapshot baru
```

Cache browser (`kotoba.snapshot.v1`) bukan sumber kebenaran. Cache ditulis setiap snapshot berhasil diterima; cache dibaca setelah mount untuk menghindari hydration mismatch.

---

## 14. Rencana versi dan migrasi

Belum ada `schema_version`. Sebelum perubahan skema berikutnya:

1. tambah tabel `schema_version(version INTEGER, applied_at TEXT)`;
2. setiap migrasi idempoten dan additive (tambah kolom/tabel, jangan hapus data aktif);
3. backup otomatis/ekspor sebelum migrasi destruktif;
4. tambah `version` pada JSON ekspor/impor;
5. uji migrasi dari DB v1 kosong dan DB v1 berisi data.

Perubahan yang diperkirakan memerlukan migrasi:

- `user_id` untuk multi-profil;
- `bookmarks`;
- `attempts` untuk analitik per aktivitas;
- PK komposit kartu jika id lintas jenis dapat bertabrakan;
- kolom `lesson_uid` untuk memisahkan id aktivitas dari id katalog.

Fase 6 menambahkan `game_attempts` secara additive; database lama mendapat tabel baru lewat `CREATE TABLE IF NOT EXISTS` tanpa migrasi destruktif.

Fase 7 **tidak menambah tabel atau kolom**. Drill menyimak memakai `quiz_attempts` yang sudah ada; rekaman, transkrip ASR, dan hasil pemutaran tidak dipersistensikan. Karena itu database lama tetap kompatibel tanpa migrasi.

Fase 8 juga **tidak menambah tabel atau kolom**. Ujian memakai `exams` yang sudah ada; kertas/hasil aktif berada di `sessionStorage`, dan `addCard` hanya menyisipkan baris `cards`. Satu endpoint baru ditambahkan (`POST /api/progress/card`), bukan migrasi skema. Karena itu database pengguna lama tetap kompatibel.

Fase 9 menambah tabel **`culture_favorites`** secara additive (`CREATE TABLE IF NOT EXISTS` + index) dan endpoint `POST /api/progress/favorite`. Tidak ada kolom tabel lama yang berubah; database pengguna lama mendapat tabel kosong dan tetap kompatibel. Tidak ada `schema_version`, jadi urutan `CREATE TABLE` di `migrate()` adalah mekanisme migrasinya.

Fase 10 menambah dua tabel additive, **`saved_collections`** dan **`saved_items`** (plus index), untuk kamus pribadi. Tidak ada kolom tabel lama yang berubah dan tidak ada endpoint yang menghapus data saat migrasi; database lama mendapat dua tabel kosong. Reset/impor memperlakukan kedua tabel seperti tabel progres lain.

Fase 11 **tidak menambah tabel/kolom maupun endpoint baru**. Dua jenis lesson baru (`typing`, `conversation`) ditulis ke tabel `lessons` yang sudah ada; target belajar ditambahkan ke JSON `profile.settings`; rencana belajar dihitung runtime. Database lama tetap kompatibel tanpa migrasi.

Fase 12 **tidak menambah tabel/kolom/endpoint**. Perubahan ada di transport (JSON + same-origin + body 5 MiB), validasi/konfirmasi impor, izin file 0700/0600, dan health minimal. Tidak ada migrasi; database Fase 11 dapat langsung dipakai.

Fase 13 juga **tidak menambah tabel/kolom/endpoint**. Delapan LessonPlan membaca/menyimak adalah konten statis; validator QA dan backup/restore berjalan di luar skema. Saat itu total tetap **13 tabel dan 18 endpoint**. Backup memakai `VACUUM INTO` ke file terpisah dan restore menyalin file, bukan operasi SQL yang mengubah skema.

Fase 17 menambah **`writing_attempts`** secara additive melalui `CREATE TABLE IF NOT EXISTS` + dua index, serta endpoint `POST /api/progress/writing`. Tidak ada kolom lama yang berubah dan tidak ada migrasi destruktif; database Fase 16 mendapat tabel kosong saat startup. Karena belum ada `schema_version`, urutan CREATE TABLE di `migrate()` tetap menjadi mekanisme migrasinya.

Fase 18 menambah **`story_attempts`** secara additive melalui `CREATE TABLE IF NOT EXISTS` + dua index, serta endpoint `POST /api/progress/story`. Tidak ada kolom lama yang berubah; database Fase 17 mendapat tabel kosong saat startup. Total menjadi **15 tabel dan 20 endpoint**, tetap tanpa `schema_version`.

---

## 15. Konsistensi dan keterbatasan yang diketahui

### 15.1 Id lesson: katalog vs progres

Ini gap paling penting untuk fase berikutnya.

- Katalog menghasilkan `Lesson.id = "les-grammar-g-desu"`.
- Halaman grammar memanggil `recordLesson({ lessonId: "g-desu" })`.
- Halaman budaya memanggil `lessonId: article.id`; game memakai `game-*`; kana memakai id set.
- Akibatnya, `LessonProgress` **tidak dapat dicocokkan langsung** dengan `CURRICULUM_LESSONS` untuk menampilkan status selesai.

Pilihan penyelesaian (belum dipilih/diimplementasikan):

1. **Kanonik katalog:** ubah halaman mengirim `Lesson.id`; migrasikan baris lama dengan tabel alias; simpan `contentId` terpisah untuk analitik.
2. **Kanonik konten:** ubah id katalog agar sama dengan id aktivitas; lebih sulit untuk lesson gabungan (kana set, game).
3. **Tabel pemetaan:** simpan `lesson_uid` + `activity_id`; paling fleksibel, tetapi menambah kompleksitas.

Rekomendasi: opsi 1, karena katalog adalah kontrak kurikulum. Jangan memakai dua id untuk satu aktivitas tanpa alias, karena pengguna bisa mendapat XP dua kali. Sejak Fase 10, `lessonForProgressId()` memetakan baris progres lama ke katalog untuk judul/level di rekomendasi, tetapi skema id tetap belum disatukan.

### 15.2 Tidak ada FK ke konten

Menghapus/mengganti id konten dapat meninggalkan kartu, lesson, atau review yatim. Konten saat ini statis dan id stabil, jadi risiko rendah. Sebelum ada CMS/import konten, tambahkan pemeriksaan “id progres ada di konten” dan kebijakan arsip, bukan penghapusan diam-diam.

### 15.3 Statistik campuran

`totalReviews` berasal dari activity; `correctReviews` dari log. Akurasi bisa menyesatkan jika sesi latihan menambah review tanpa log. Statistik kuis (`quizAttempts`, `quizAnswers`, `quizCorrect`) berasal dari `quiz_attempts`; statistik permainan (`gameAttempts`, `gameCorrect`, `gameQuestions`, `gameBestScore`) berasal dari `game_attempts`. Keempat kelompok ini tidak boleh dicampur dengan `reviews` tanpa label. Jika fitur akurasi dipromosikan, definisikan ulang dan beri label.

### 15.4 Kepercayaan klien

- `recordSession` menerima XP/menit/review dari klien (clamp saja).
- `recordExam.passed` (target belajar) dan `score` diterima dari klien; server hanya meng-clamp, tidak menilai ulang jawaban; XP dihitung dari skor, bukan pass.
- `recordLesson.score` dari klien; XP kini dihitung server dari jenis.
- `recordQuizAttempt` menerima benar/salah per jawaban dari klien, tetapi menghitung ulang total/skor dan XP di server; server belum menilai ulang isi jawaban.
- `recordGame` menerima benar/salah per detail dan skor mentah, tetapi menghitung ulang akurasi/XP dari `correct/total` + kesulitan; server belum menilai ulang isi jawaban.
- Drill menyimak memakai `ExerciseRunner` sehingga benar/salah per soal tetap berasal dari klien; sama seperti latihan lain, server hanya menghitung ulang agregat.
- `recordWriting` menerima skor geometri dan jumlah goresan dari klien; server memvalidasi katalog/rentang, bukan menilai ulang gambar.
- `recordStory` menerima skor kuis dan agregat attempt dari klien; server memvalidasi cerita/mode/rentang, bukan menilai ulang jawaban kuis.
- Ini dapat diterima untuk aplikasi lokal satu pengguna, tetapi **bukan** model anti-cheat. Deployment publik memerlukan kunci jawaban dan penilaian server-side.

### 15.5 Ujian: engine baru dan jalur legacy

Sejak Fase 8, UI ujian memakai `exam-engine.ts` (empat mode, `ExamPaper`/`ExamResult`, `gradeExam`, `toExamPayload`), bukan `ExamDefinition`/`buildExam()`. `EXAM_COUNTS` + `buildExam()` tinggal sebagai jalur legacy yang diuji kompatibilitasnya dan tidak boleh dipakai halaman baru. Mode/judul tidak disimpan; riwayat hanya memuat level, skor, bagian, jawaban, dan waktu. Skor bersifat belajar (target 70%), bukan sertifikasi.

### 15.6 Placeholder dan fitur yang belum ada

- `newCardsAvailable` selalu 0.
- Favorit budaya (`culture_favorites`) dan kamus pribadi (`saved_items`) adalah dua model berbeda; tidak ada bookmark umum generik di luar itu.
- `LearningAttempt` netral belum dipersistensikan; `quiz_attempts` dan `game_attempts` sudah aktif.
- `QuizDefinition` belum dibaca engine; `ExamDefinition` adalah kontrak legacy.
- `GameDefinition` sudah menjadi sumber metadata UI permainan; `CulturalFact` masih tipe deklaratif.
- 25 definisi pencapaian kini dipusatkan di `src/lib/achievements.ts`; cerita menambah `story-first` dan `story-3`.
- Tidak ada `schema_version`.
- Tidak ada penyimpanan rekaman atau transkrip ASR; keduanya hanya hidup di memori tab. Ini disengaja untuk privasi, tetapi berarti tidak ada riwayat audio.
- Skor pelafalan akustik belum ada; `match/close/different` adalah perbandingan teks, bukan pengukuran pitch/panjang vokal.
- Pemutaran audio bergantung voice `ja-JP` perangkat; tidak ada file audio atau server TTS.

### 15.7 Zona waktu

Tanggal lokal proses menentukan streak/activity; UI menghitung kalender/tren dengan `toDateKey()` lokal. Jika server dan pengguna berbeda zona waktu, “hari” bisa bergeser (misalnya target hari ini dan streak mingguan tidak cocok). Solusi masa depan: simpan timezone profil dan hitung tanggal berdasarkan zona itu, atau kirim tanggal lokal klien yang divalidasi server. Saat ini batas tersebut didokumentasikan, bukan diklaim selesai.

### 15.8 Batas snapshot dan kamus pribadi

Snapshot membatasi activity 400, review 120, kuis 30, ujian 20, permainan 100, attempt menulis 400, dan attempt cerita 300. `savedItems`/`savedCollections` dimuat utuh; jumlah kecil karena hanya materi yang disimpan pengguna. Rekomendasi/statistik jangka panjang yang membutuhkan data di luar batas tersebut belum tersedia. Kamus pribadi tidak mengubah SRS: ulasan tersimpan hanya pengulangan mandiri.

### 15.9 Batas latihan produksi dan rencana belajar (Fase 11)

- **Percakapan bukan AI.** Enam skenario adalah dialog bercabang statis dengan pilihan terkurasi, bukan percakapan bebas atau penutur asli. Umpan balik menjelaskan konteks/register, tetapi tidak menilai pelafalan atau produksi bebas.
- **Dua mode mengetik memerlukan IME Jepang.** `romaji-kana` dan `meaning-kanji` tidak dapat dikerjakan tanpa IME; Kotoba tidak menyediakan keyboard Jepang internal. Pemeriksaan terjadi di klien dan bukan anti-cheat; tidak ada analitik per tombol.
- **Rencana belajar adalah estimasi deterministik.** Perhitungan memakai kurikulum, progres, dan settings saat ini, bukan prediksi kemampuan atau kelulusan JLPT. Rencana memakai tanggal lokal proses dan dapat berubah setelah satu lesson selesai.
- **Saat Fase 11 belum ada latihan menulis.** Sejak Fase 17, data goresan KanjiVG terverifikasi dipakai; batasnya dijelaskan di §15.13.

### 15.10 Batas keamanan dan impor (Fase 12)

- **Impor tetap mengganti seluruh progres.** Konfirmasi + validasi mencegah impor tak sengaja, bukan kesalahan pengguna yang tetap menekan “Ya, timpa”; tidak ada backup otomatis, jadi ekspor dulu.
- **Batas keamanan bersifat lokal.** Loopback bind, Host allowlist, JSON + same-origin, dan body 5 MiB melindungi mesin lokal dari CSRF/rebinding sederhana; tidak ada auth, TLS, rate limit, audit log, atau isolasi pengguna. Jangan ekspos port sebelum auth selesai.
- **Progres tetap client-authoritative.** Server memvalidasi bentuk dan katalog, tetapi tidak menilai ulang jawaban/skor; data aktivitas dari klien dapat dimanipulasi. Ini dapat diterima untuk latihan mandiri, bukan sertifikasi.
- **Tidak ada `schema_version`.** Migrasi masih berupa `CREATE TABLE IF NOT EXISTS`; Fase 12 tidak mengubah skema sehingga belum ada kebutuhan migrasi bertanda versi.
- **SQLite sinkron memblokir event loop.** Snapshot penuh dan body impor besar dapat memperlambat request lain; batas body/array mengurangi risiko, bukan menghilangkannya.

### 15.11 Batas konsolidasi Fase 13

- **Validator QA bersifat sintaktik/semantik terbatas.** `validateContentQa()` menangkap prompt kosong, opsi duplikat setelah normalisasi, `answerIndex` di luar rentang, dan ID ganda dengan isi berbeda; validator tidak membuktikan bahwa satu-satunya jawaban benar secara linguistik. Review manusia tetap wajib.
- **Backup bukan jaminan pemulihan bencana.** `scripts/backup-db.mjs` membuat salinan konsisten + `PRAGMA integrity_check` dan mendukung retensi, tetapi file backup berada di mesin yang sama dan tidak terenkripsi. Simpan salinan off-site secara manual untuk deployment nyata.
- **Delapan LessonPlan baru adalah turunan konten yang sudah diaudit.** Teks, terjemahan, dan soal berasal dari `reading.ts`/`listening.ts`; tidak ada klaim linguistik baru. Blok `jp-prose`/`dialog` hanya mengubah presentasi.
- **Reflow 320 px diuji pada 29 pola rute, bukan semua kemungkinan konten.** Empat overflow ditemukan dan diperbaiki; data pengguna yang panjang (nama, catatan) tetap dibatasi validasi.
- **N4–N1, E2E/axe, dan Git tetap belum dikerjakan.** Lihat CONCERNS_BACKLOG untuk status dan pemicu; tidak ada klaim bahwa konsolidasi ini menutup seluruh backlog.

### 15.12 Batas studio audio (Fase 16)

- **Tidak ada aset audio atau caching TTS.** Materi diucapkan langsung oleh Web Speech API perangkat; tidak ada MP3, URL audio, atau unggahan teks ke layanan TTS berbayar.
- **Voice bergantung perangkat/browser.** Chromium uji tidak memiliki voice Jepang sehingga verifikasi memakai mock; perangkat fisik dapat berbeda. Bila voice Jepang tidak ada, Kotoba menampilkan status dan tidak memakai voice bahasa lain.
- **Tidak ada penilaian akustik.** Pemutar tidak mengukur pitch, panjang vokal, atau kualitas pelafalan; latihan pelafalan tetap memakai rekaman lokal dan cek mandiri/ASR berbasis teks.
- **Bacaan kana/kanji berasal dari konten.** Furigana diubah ke kana utuh; kanji/kosakata memakai bacaan terverifikasi. Tidak ada romanisasi otomatis sebagai pengganti bacaan Jepang.
- **Open JTalk belum di-deploy.** Adapter lokal tetap opsional dan memerlukan lisensi voice yang diverifikasi; jangan menambah dependensi default tanpa keputusan eksplisit.

### 15.13 Batas studio menulis (Fase 17)

- **Skor adalah perkiraan geometri.** `evaluateWriting()` membandingkan jalur yang diseragamkan, bukan mengenali tulisan tangan, bukan menilai estetika/tekanan pena, dan bukan sertifikasi. Skor dapat berubah karena posisi/ukuran; UI menampilkan rincian dan disclaimer.
- **Tidak ada pengujian perangkat fisik/stylus.** Verifikasi memakai Chromium teremulasi dengan pointer mouse/touch; latensi, tekanan, dan palm rejection iOS/Android belum diuji.
- **Data goresan adalah turunan KanjiVG CC BY-SA 3.0.** Atribusi Ulrich Apel/KanjiVG dan lisensi wajib dipertahankan; distribusi turunan mengikuti share-alike. 259 glyph mencakup 111 kanji dan 148 glyph kana unik; yōon ditulis sebagai dua komponen.
- **Urutan mengikuti KanjiVG.** Varian tulisan tangan yang sah di luar urutan standar tidak dinilai sebagai “benar”; jangan mengklaim satu-satunya urutan yang mungkin.
- **Catatan bentuk tidak lengkap.** Catatan khusus tersedia untuk sekitar 45 karakter; sisanya memakai catatan generik. Ini bantuan, bukan kamus lengkap.
- **Snapshot dibatasi 400 attempt.** Riwayat lebih lama tetap tersimpan tetapi tidak dimuat karena alasan ukuran payload; belum ada pagination.
- **Penilaian terjadi di klien.** Server memvalidasi bentuk dan katalog lalu menyimpan skor; server tidak menilai ulang geometri. Ini bukan anti-cheat.

### 15.14 Batas teater cerita (Fase 18)

- **Hanya tersedia 3 cerita.** Dua N5 dan satu N4; belum ada cerita N3–N1, dan tidak ada CMS/editor cerita. Menambah cerita berarti menambah modul TypeScript dan tes, bukan entri database.
- **Audio tersinkron per kalimat, bukan per kata.** Web Speech API tidak memberi timing kata yang andal; sorotan mengikuti baris aktif. Metadata timing untuk aset rekaman belum diimplementasikan.
- **Voice karakter tidak dipalsukan.** Bila hanya ada satu voice Jepang, semua karakter memakai voice itu; voice berbeda per karakter hanya dipakai bila perangkat menyediakan minimal dua voice Jepang. Tidak ada klaim voice native atau voice aktor.
- **Tidak ada ekspor video atau AI video.** `videoUrl` adalah seam opsional untuk aset pra-render same-origin; tidak ada aset, pipeline unggah, CMS, MediaRecorder/FFmpeg, atau layanan AI berbayar yang dipakai. Jalur video belum diuji.
- **Tidak ada checkpoint/resume.** Progres yang dipersistensikan adalah hasil kuis setelah selesai; posisi baris/adegan tidak disimpan. Menutup tab berarti mulai dari awal.
- **Snapshot dibatasi 300 attempt dan impor 1.000.** Riwayat lebih lama tetap tersimpan di SQLite tetapi tidak dimuat; belum ada pagination.
- **Kamus hanya untuk kosakata terkurasi.** Chip `vocabIds` membuka entri katalog; tidak ada tokenisasi kalimat bebas atau lookup otomatis setiap kata.
- **Skor kuis dihitung di klien.** Server memvalidasi bentuk dan katalog, lalu menyimpan agregat; bukan penilaian ulang jawaban dan bukan anti-cheat.
- **Verifikasi memakai Chromium teremulasi dan mock voice.** Perilaku audio iOS Safari/Android Chrome, pembaca layar, dan perangkat fisik belum diuji.

---

## 16. Contoh penambahan data

### 16.1 Menambah kosakata

1. Tambah `VocabWord` di `src/content/vocabulary.ts` dengan id `v-*`, level, topic, bacaan, arti, dan contoh.
2. Katalog otomatis menambahkannya ke modul level/topic (jika topic sudah ada); jika topic baru, satu lesson baru muncul di modul level tersebut.
3. Jalankan `npm test`: tes konten memeriksa field, dan tes katalog memeriksa ref/cakupan.
4. Tidak perlu migrasi database; kartu baru dibuat saat pengguna pertama kali mengulas.

### 16.2 Menambah tata bahasa

1. Tambah `GrammarPoint` dengan formasi, penjelasan, contoh, dan `practice` minimal satu soal.
2. Katalog otomatis membuat `les-grammar-{id}`.
3. Halaman daftar/detail membacanya tanpa perubahan komponen.
4. Untuk progress, ingat gap §15.1: halaman mencatat id grammar, bukan id lesson katalog; gunakan `lessonForProgressId()` saat menampilkan judul.

### 16.3 Menambah jenis konten baru

Perlu perubahan eksplisit:

- tambah anggota `ContentKind`/`LessonKind`;
- tambah file konten + tipe;
- tambah resolver `contentRefExists`;
- tambah builder modul di `curriculum.ts`;
- tambah UI daftar/detail;
- tambah tes.

Ini sengaja: tipe harus jujur, bukan menerima semua string.

---

## 17. Ringkasan kontrak

1. Konten statis bertipe; progres SQLite; tidak ada tabel konten.
2. Katalog adalah proyeksi konten; `ContentRef` mencegah duplikasi materi.
3. Snapshot adalah read model; server otoritatif untuk penyimpanan, bukan anti-cheat.
4. SRS menyimpan state kartu + log; XP/level/streak dihitung dengan rumus yang diuji.
5. Validasi konten dan katalog adalah bagian dari build/test.
6. Enam permainan memakai domain murni; attempt `game_attempts` dan statistiknya adalah read model server.
7. Drill menyimak adalah konten atomik yang dipetakan ke latihan; attempt-nya memakai `quiz_attempts`, tanpa tabel drill baru.
8. Ujian memakai `ExamPaper`/`ExamResult` di klien dengan target belajar 70%; ringkasan attempt masuk `exams`, mode/judul tidak disimpan.
9. Rekaman dan transkrip pengenalan suara tidak dipersistensikan; perbandingan teks bukan skor akustik.
10. Favorit budaya aktif di `culture_favorites`.
11. Target personal (durasi, kosakata, pelajaran, frekuensi mingguan, XP) disimpan di settings; progresnya diturunkan dari activity/review/lesson, tanpa tabel target.
12. Kamus pribadi memakai `saved_items`/`saved_collections`, terpisah dari SRS dan tanpa XP; ulasan tersimpan bukan penjadwalan ulang.
13. Streak/kalender/tren memakai tanggal lokal; batas lintas zona waktu didokumentasikan di §15.7.
14. Rekomendasi adalah aturan deterministik dengan alasan + bukti, maksimum 4, tanpa ML/data eksternal.
15. Auth/sync multi-perangkat dan analitik per aktivitas belum ada. Seam-nya didokumentasikan, bukan diklaim selesai.
16. Percakapan adalah skenario statis bertipe; skor memakai percobaan pertama per langkah; hanya hasil lesson yang disimpan, tanpa transkrip.
17. Latihan mengetik memeriksa jawaban di klien dengan normalisasi romaji/Jepang; dua mode memerlukan IME; tidak ada unggahan ketikan.
18. Rencana belajar diturunkan deterministik dari kurikulum, progres, dan settings; tidak ada tabel rencana dan bukan prediksi JLPT.
19. Menulis memakai KanjiVG terpin: 319 entri katalog (208 kana + 111 kanji), 259 glyph JSON, atribusi CC BY-SA 3.0, dan komponen yōon berurutan—bukan glyph gabungan buatan.
20. Impor memakai envelope konfirmasi eksplisit, validasi sebelum DELETE, dan transaksi all-or-nothing; impor adalah replace, bukan merge, dan bukan backup.
21. Saat Fase 12 skema tetap 13 tabel/18 endpoint dan database Fase 11 kompatibel; Fase 17 kemudian menambah tabel ke-14 dan endpoint ke-19.
22. Batas keamanan lokal (loopback, Host allowlist, JSON + same-origin, body 5 MiB, header) bukan autentikasi; deployment publik tetap memerlukan auth/TLS/rate limit.
23. Server menyimpan progres yang dikirim klien setelah validasi bentuk/katalog; penilaian ulang server-side bukan bagian dari model data saat ini.
24. Delapan LessonPlan N5 membaca/menyimak adalah konten statis turunan; tidak menambah tabel dan memakai `sourceId` untuk soal sumber.
25. Validator QA semantik adalah quality gate tambahan di tes, bukan pengganti review bahasa manusia.
26. Backup/restore adalah operasi file SQLite di luar skema; pada Fase 13 jumlahnya 13 tabel/18 endpoint dan tidak berubah saat itu.
27. Studio audio memakai Web Speech `ja-JP` dan preferensi `Settings` yang ada; tidak ada tabel audio, aset MP3, unggahan, atau riwayat pemutaran.
28. Voice non-Jepang tidak pernah dipakai sebagai fallback; bila voice Jepang tidak tersedia, status dan transkrip tetap tersedia tanpa skor akustik.
29. Fase 16 tidak mengubah skema; saat itu total 13 tabel dan 18 endpoint.
30. Progres menulis memakai tabel `writing_attempts` (bukan `lessons`), XP 15 pada attempt pertama per karakter, dan snapshot maksimum 400 attempt; reset/impor mencakup tabel ini.
31. Katalog menulis adalah konten statis + JSON KanjiVG terimpor; data goresan tidak berada di database dan tidak diubah menjadi gambar/video.
32. Skor menulis adalah perkiraan geometri jalur, bukan pengenalan tulisan tangan, penilaian estetika, atau sertifikasi; server menyimpan skor klien setelah validasi bentuk/katalog.
33. Cerita adalah konten statis bertipe (3 cerita/9 adegan/36 baris/9 soal) dengan panggung SVG/CSS generik; tidak ada tabel konten/CMS. `videoUrl` hanya seam opsional.
34. Progres cerita memakai tabel `story_attempts` (bukan `lessons`), XP 25 pada attempt pertama per cerita, cerita dianggap selesai bila ada attempt skor ≥60, snapshot maksimum 300, impor 1.000; reset/impor mencakup tabel ini.
35. Audio cerita memakai Web Speech `ja-JP` tingkat kalimat; tidak ada klaim sinkronisasi kata/timing atau voice karakter native. Bila voice Jepang tidak tersedia, cerita tetap terbaca tanpa audio.
36. Tidak ada ekspor video, AI video, atau pipeline aset video. `videoUrl` belum diuji dan tidak boleh diklaim sebagai fitur yang selesai.
