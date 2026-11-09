# Arsitektur Sistem — Kotoba 言葉

**Versi dokumen:** 1.14  
**Status:** Fase 19 — Integration, QA, Performance & Accessibility selesai; Fase 15 CMS tetap blocked  
**Tanggal:** 2026-11-09  
**Basis kode:** Kotoba v0.1.0 + Fase 14 + Fase 14B + Fase 16 + Fase 17 + Fase 18 + Fase 19  
**Dokumen terkait:** [PROJECT_SPEC.md](PROJECT_SPEC.md) · [DATA_MODEL.md](DATA_MODEL.md) · [DECISIONS.md](DECISIONS.md) · [PROJECT_STATUS.md](PROJECT_STATUS.md) · [CONCERNS_BACKLOG.md](CONCERNS_BACKLOG.md) · [ENHANCED_FEATURES_ARCHITECTURE.md](ENHANCED_FEATURES_ARCHITECTURE.md)

---

## 1. Ringkasan

Kotoba adalah **modular monolith** berbasis Next.js App Router: satu aplikasi, satu proses server, satu file SQLite, dan konten edukatif statis yang bertipe. Tidak ada layanan eksternal wajib, antrean, microservice, atau database terdistribusi.

Arsitektur ini sengaja sederhana karena produk saat ini melayani **satu pelajar lokal** dan seluruh konten masih kecil (ratusan item). Kompleksitas utama bukan pada skala infrastruktur, melainkan pada:

1. akurasi konten bahasa Jepang;
2. konsistensi model data untuk banyak jenis materi;
3. perhitungan progres yang dapat diuji; dan
4. batas modul yang jelas agar fitur baru tidak menumpuk di halaman.

Fase 2 menambahkan **fondasi domain**; Fase 3 memakai katalog di UI; Fase 4 menambahkan lapisan pelajaran interaktif; Fase 5 menyatukan latihan ke satu engine; Fase 6 menambahkan permainan belajar; Fase 7 menambahkan lapisan audio, pelafalan, dan menyimak; Fase 8 menambahkan mesin ujian reusable; Fase 9 memperluas budaya menjadi fitur penemuan; Fase 10 menambahkan lapisan personalisasi yang menurunkan target, streak, rekomendasi, kamus pribadi, dan riwayat dari data belajar yang sudah ada; Fase 11 menambahkan latihan produksi dan perencanaan yang tetap memakai model data yang sama:

- tipe katalog kurikulum (`Course`, `CourseModule`, `Lesson`, `ContentRef`);
- tipe latihan generik (`Exercise`) dan definisi kuis/ujian;
- tipe game, fakta budaya, attempt, achievement, dan bookmark;
- katalog kurikulum turunan di `src/content/curriculum.ts`;
- validator integritas konten di `src/lib/content-validation.ts`;
- rencana pelajaran bertipe (`LessonPlan`) di `src/content/lessons/` untuk 70 pelajaran N5 (termasuk delapan pelajaran membaca/menyimak);
- pemain pelajaran enam langkah dan latihan gerbang 60% di `src/components/lesson-*.tsx`;
- domain permainan murni di `src/lib/games/` dan UI permainan bersama di `src/components/games/`;
- tabel `game_attempts`, `recordGame()`, dan `POST /api/progress/game`;
- registry `SpeechProvider` dengan provider browser sebagai default, hasil pemutaran terstruktur, dan timeout di `src/lib/speech.ts`;
- pengenalan suara opsional berbasis perbandingan teks di `src/lib/speech-recognition.ts` dan `src/lib/use-speech-recognition.ts`;
- panduan bunyi enam topik, perekam lokal, serta 15 drill menyimak bertingkat;
- mesin ujian empat mode di `src/lib/exam-engine.ts`, alur hub/sesi/hasil, dan endpoint `POST /api/progress/card`;
- pabrik artikel budaya dan registry 11 sumber di `src/content/culture/`, dengan 33 artikel dalam enam grup penemuan;
- fakta harian deterministik di `src/lib/culture-facts.ts`, kuis artikel di `src/components/culture-quiz.tsx`, dan favorit budaya di tabel `culture_favorites` + `POST /api/progress/favorite`;
- target harian dan mingguan turunan di `src/lib/goals.ts`, streak di `src/lib/streak.ts`, kalender/tren/timeline di `src/lib/history.ts`;
- rekomendasi explainable di `src/lib/recommendations.ts` dan 25 pencapaian di `src/lib/achievements.ts`;
- kamus pribadi di tabel `saved_items`/`saved_collections` + endpoint `/api/progress/saved` dan `/api/progress/collections`, dengan halaman `/dictionary/collections`;
- skenario percakapan bertipe di `src/content/conversations.ts` (6 skenario, 19 langkah, 18 frasa), dengan register dan umpan balik konteks;
- mesin mengetik lokal di `src/lib/typing.ts` (Kana→Romaji, Romaji→Kana, Arti→Kanji) dan halaman `/typing`;
- perencana belajar deterministik di `src/lib/study-plan.ts` dan halaman `/plan`, diturunkan dari katalog, progres, dan settings;
- pemutar audio global di `src/lib/audio-player.ts`, komponen `src/components/audio.tsx`, dan studio `/audio` yang memutar enam kategori materi memakai Web Speech `ja-JP`;
- katalog menulis 319 entri di `src/lib/writing.ts` (208 kana + 111 kanji), data goresan KanjiVG terimpor di `public/writing/kanjivg/`, evaluasi geometri di `src/lib/writing-geometry.ts`, dan studio `/writing` dengan mode animasi/tirukan/mandiri;
- domain teater cerita di `src/lib/types.ts` dan `src/content/stories.ts` (3 cerita, 9 adegan, 36 dialog, 9 soal), panggung SVG/CSS reusable di `src/components/story/`, serta halaman `/stories` dan `/stories/[id]`.

Fase 12 tidak menambah fitur produk, tabel, atau endpoint. Ia menambahkan **batas keamanan lokal** di depan route handler (loopback bind, Host allowlist, JSON + same-origin, batas body, header), menutup temuan aksesibilitas/konten, dan memindahkan font ke stack sistem.

Fase 13 adalah konsolidasi lintas fase, bukan ekspansi produk. Fase ini menambahkan **delapan LessonPlan N5 membaca/menyimak** (dua blok render baru: `jp-prose` dan `dialog`), **validator QA semantik** untuk bank soal, **backup/restore SQLite**, **CI quality gate**, perbaikan reflow 320 px, serta pemetaan status seluruh concern. Fase 14 hanya audit/perencanaan fitur audio, menulis, dan cerita. Fase 14B mengaudit kompatibilitas mobile **29 rute learner yang ada** pada sembilan viewport (320–1920), memperbaiki overflow `/progress`, pemotongan label, target sentuh, transkrip menyimak, dan beberapa grid; tidak ada perubahan arsitektur, tabel, atau endpoint. CMS/admin, kanvas menulis, dan story theater tidak tersedia sehingga tidak diaudit. Fase 15 (CMS) tetap **blocked** karena repositori tidak memiliki CMS/admin, API konten admin, atau tabel konten. Fase 16 menambahkan **studio audio** dan pemutar global berbasis Web Speech `ja-JP`; ia tidak menambah tabel, endpoint, aset audio, atau skema progres. Fase 17 menambahkan **studio menulis** dengan 259 glyph KanjiVG terimpor, animasi/tirukan/mandiri, evaluasi geometri, dua pencapaian baru (total saat itu 23), dan tabel ke-14 `writing_attempts` melalui endpoint ke-19 `POST /api/progress/writing`. Fase 18 menambahkan **teater cerita** dengan 3 cerita orisinal, 9 adegan, 36 dialog, 9 soal, panggung SVG/CSS reusable, mode belajar/tonton, audio per baris `ja-JP`, kuis, dan tabel ke-15 `story_attempts` melalui endpoint ke-20 `POST /api/progress/story`. Setelah Fase 18 total menjadi **15 tabel dan 20 route API**. Fase 19 adalah stabilisasi, bukan ekspansi: ia menambahkan helper murni `src/lib/writing-links.ts` agar pelajaran kana/kanji dapat menaut ke detail Studio Menulis tanpa menarik katalog menulis yang berat ke bundle pelajaran, mengoreksi salinan urutan goresan yang usang, dan menjalankan regresi lintas viewport. Tidak ada tabel, endpoint, dependensi, CMS, atau pipeline video baru.

Dashboard, hub Belajar, rute `/learn/[lessonId]`, `/games`, `/exams`, `/typing`, `/conversation`, `/plan`, `/audio`, `/writing`, dan `/stories` memakai katalog/registry/engine yang sama. N4–N1 belum memiliki `LessonPlan`; katalognya tetap menjadi kontrak untuk fase berikutnya.


---

## 2. Prinsip arsitektur

| Prinsip | Konsekuensi praktis |
| --- | --- |
| **Konten terpisah dari presentasi** | Materi hidup di `src/content/*.ts` sebagai data bertipe. Halaman dan komponen hanya merender, memfilter, dan menghubungkan interaksi. |
| **Satu sumber kebenaran** | Server SQLite adalah sumber kebenaran progres. `localStorage` hanya cache baca untuk tampilan awal/offline ringan. |
| **Domain murni dapat diuji** | SRS, XP, furigana, pemilihan soal, dan validasi tidak bergantung pada React atau browser. |
| **Tipe sebagai kontrak** | Semua entitas inti memiliki tipe TypeScript. Konten divalidasi saat build/test, bukan hanya dipercaya. |
| **Monolit modular, bukan microservice** | Modul dipisahkan berdasarkan tanggung jawab dan arah dependensi, bukan proses jaringan. |
| **Evolusi bertahap** | Belum ada autentikasi, sinkronisasi, atau offline penuh. Namun tipe dan layanan disiapkan agar penambahan itu tidak merombak domain. |
| **Tidak overengineering** | Tidak ada ORM, state library, CMS, message queue, atau GraphQL selama kebutuhan belum nyata. |

---

## 3. Konteks dan batasan

| Aspek | Kondisi saat ini | Dampak arsitektur |
| --- | --- | --- |
| Pengguna | Satu profil lokal, tanpa login | `profile.id = 1`; belum ada `user_id` di tabel lain |
| Runtime | Node.js >= 22.5 | Memakai `node:sqlite` bawaan; masih eksperimental |
| Framework | Next.js 16 App Router, React 19, TypeScript | Server Components untuk kerangka; komponen interaktif `"use client"` |
| Persistensi | SQLite file `.data/kotoba.db` | Satu penulis proses; WAL dan `busy_timeout` |
| Konten | Modul TypeScript statis | Ikut version control; tidak ada CMS/admin |
| Audio | Web Speech API `ja-JP` melalui registry provider | Kualitas suara bergantung perangkat; tidak ada file audio atau server TTS |
| Tanggal belajar | `ActivityDay.date` lokal server; kalender/target memakai lokal browser | Konsisten pada satu mesin; lintas zona waktu butuh timezone eksplisit |
| Pengenalan suara | Web Speech Recognition opsional (browser) | Tidak semua browser mendukung; audio dapat dikirim ke vendor browser; hanya teks yang dibandingkan |
| Font Jepang | Stack font sistem (Hiragino/Yu Gothic/Noto Sans JP/Meiryo), tanpa font jarak jauh | Ketersediaan mesin lokal memengaruhi tampilan; tidak ada permintaan ke Google Fonts |
| Multi-instance | Tidak didukung | SQLite lokal bukan database terdistribusi |
| Offline | Baca dari cache; tulis membutuhkan server | Tidak ada antrean tulis offline |

Batasan ini bukan kekurangan yang tersembunyi. Semuanya dicatat di [PROJECT_STATUS.md](PROJECT_STATUS.md) dan menjadi syarat sebelum fitur akun/sinkronisasi dibuka.

---

## 4. Lapisan dan arah dependensi

```text
┌─────────────────────────────────────────────────────────────────┐
│ PRESENTASI                                                       │
│ src/app/**/page.tsx, layout.tsx, error/loading/not-found         │
│ src/components/** (app shell, UI kit, quiz, game, player)         │
└───────────────────────────────┬─────────────────────────────────┘
                                │ memanggil hook / fungsi
┌───────────────────────────────▼─────────────────────────────────┐
│ APLIKASI KLIEN                                                   │
│ src/components/providers/progress-provider.tsx                   │
│ src/lib/api-client.ts (fetch ke route handler)                    │
│ src/lib/speech.ts, speech-recognition.ts, theme.ts                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP JSON
┌───────────────────────────────▼─────────────────────────────────┐
│ TRANSPORT                                                        │
│ src/app/api/progress/**/route.ts                                 │
│ src/server/http.ts (ok / fail / parsing)                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │ memanggil service
┌───────────────────────────────▼─────────────────────────────────┐
│ APLIKASI SERVER                                                  │
│ src/server/progress-service.ts                                   │
│ src/server/db.ts                                                 │
└───────────────┬───────────────────────────────┬─────────────────┘
                │                               │
┌───────────────▼───────────────┐ ┌─────────────▼─────────────────┐
│ DOMAIN                        │ │ KONTEN                        │
│ src/lib/types.ts              │ │ src/content/*.ts              │
│ src/lib/srs.ts, xp.ts         │ │ curriculum.ts (turunan)       │
│ src/lib/quiz.ts               │ │ content-validation.ts         │
│ src/lib/furigana.ts           │ │                               │
└───────────────────────────────┘ └───────────────────────────────┘
```

Aturan arah dependensi:

| Lapisan | Boleh mengimpor | Tidak boleh mengimpor |
| --- | --- | --- |
| Kernel (`types.ts`, `constants.ts`, `utils.ts`) | Tidak ada dependensi aplikasi | React, Next, server, konten |
| Konten (`src/content`) | Kernel | React, Next, server, komponen |
| Domain murni (`srs`, `xp`, `furigana`) | Kernel | Konten, React, Next, server |
| Engine (`quiz.ts`) | Kernel + konten + domain | React, Next, server |
| Server | Kernel + domain + konten | Komponen, halaman, provider |
| Provider/API client | Kernel + domain + tipe | `src/server`, akses SQLite langsung |
| Halaman/komponen | Konten, domain, provider, UI kit | `src/server`, SQLite |
| Route handler | Server + domain | Komponen, halaman |

**Catatan penting:** `src/lib/types.ts` saat ini memuat tipe konten *dan* tipe progres. Itu disengaja agar belum ada pemecahan paket yang rumit. Jika file tumbuh melewati sekitar 600–700 baris, pecah menjadi `types/content.ts`, `types/progress.ts`, dan `types/curriculum.ts` dengan re-export dari `types.ts` agar impor lama tetap valid. Pemecahan belum dilakukan sekarang karena belum ada kebutuhan nyata.

---

## 5. Modul aplikasi

Lima belas modul berikut adalah **batas tanggung jawab**, bukan folder terpisah yang kaku. Beberapa modul berbagi kernel, konten, dan komponen UI.

### M1 — Materi pembelajaran dan kurikulum

- **Tanggung jawab:** menyimpan dan mengatalogkan kana, bacaan, latihan susun kalimat, menyusun rencana pelajaran, serta membentuk urutan kursus/modul/lesson.
- **File utama:** `src/content/kana.ts`, `src/content/reading.ts`, `src/content/sentences.ts`, `src/content/curriculum.ts`, `src/content/lessons/*.ts`, `src/lib/content-validation.ts`.
- **Batas:** tidak menghitung XP, tidak menyimpan progres, tidak merender. Renderer dan pemain pelajaran berada di komponen.
- **Kontrak:** setiap lesson hanya menunjuk materi lewat `ContentRef`; tidak menyalin isi materi. Pelajaran interaktif memakai `LessonPlan` dengan id yang sama dan latihan yang dapat divalidasi.

### M2 — Manajemen kosakata dan kanji

- **Tanggung jawab:** data kosakata/kanji, pencarian, filter, kartu SRS, dan mastery.
- **File utama:** `src/content/vocabulary.ts`, `src/content/kanji.ts`, `src/app/vocabulary/page.tsx`, `src/app/kanji/page.tsx`, `src/components/flashcards.tsx`.
- **Batas:** tidak memiliki tabel sendiri di luar `cards` dan `reviews`; item konten tidak disimpan ke database.
- **Idempotensi:** `itemId` + `kind` mengidentifikasi kartu.

### M3 — Manajemen tata bahasa

- **Tanggung jawab:** pola grammar, formasi, penjelasan Indonesia, contoh, kesalahan umum, latihan.
- **File utama:** `src/content/grammar.ts`, `src/app/grammar/page.tsx`, `src/app/grammar/[id]/page.tsx`, `src/components/lesson-practice.tsx`.
- **Batas:** latihan grammar memakai `QuizQuestion` yang diadaptasi ke engine latihan; XP grammar tetap dicatat oleh `recordLesson` setelah pengguna menyelesaikan latihan.

### M4 — Engine latihan dan kuis

- **Tanggung jawab:** menyediakan kontrak sembilan jenis latihan, menilai jawaban, membangun katalog latihan dari konten, memilih sesi adaptif, dan memetakan drill menyimak ke latihan. Pembangunan kertas ujian adalah tanggung jawab M7.
- **File utama:** `src/lib/types.ts`, `src/lib/exercise-engine.ts`, `src/lib/exercise-catalog.ts`, `src/components/exercise-card.tsx`, `src/components/exercise-runner.tsx`, `src/app/practice/page.tsx`, `src/app/listening/practice/page.tsx`.
- **Batas:** `exercise-engine` adalah fungsi murni tanpa React/API. `exercise-catalog` hanya membaca konten. `ExerciseRunner` mengelola interaksi dan memanggil `recordQuiz` lewat provider; ia tidak menyentuh SQLite. Ujian tidak memakai `ExerciseRunner`; ia memakai `ExamQuestionCard` dan `gradeExam` di M7.
- **Drill menyimak:** `listeningDrillExercises()` mengubah 15 `ListeningDrill` menjadi `ListeningExercise` dengan id stabil `ex-listen-drill-*`; fungsi ini dipakai halaman latihan kilat dan ikut masuk `listeningExercises()` untuk sesi adaptif. Tidak ada jenis latihan baru, sehingga attempt tetap tersimpan di `quiz_attempts`.
- **Determinisme:** pengacakan memakai `rngFromSeed()`; katalog memakai id stabil sehingga attempt dapat ditelusuri kembali ke `contentRef`.
- **Kompatibilitas:** `exercisesFromQuizQuestions()` menjadi adapter untuk `QuizQuestion` lama; `quiz.ts` tetap dipakai untuk membangun bank soal ujian.

### M5 — Engine permainan

- **Tanggung jawab:** enam permainan edukatif — pembuat kata, cocokkan kana, kejar kosakata, susun kalimat, tantangan kanji, dan tantangan harian — beserta aturan ronde, petunjuk, skor, dan hadiah XP.
- **File utama:** `src/lib/games/*` (domain murni), `src/components/games/*` (UI), `src/app/games/page.tsx` (hub server component), `src/lib/types.ts`, `src/server/progress-service.ts`.
- **Batas:** domain permainan tidak mengimpor React/API; komponen tidak menyentuh SQLite. Attempt dikirim lewat `recordGame()` → `POST /api/progress/game`, yang menghitung akurasi/XP di server.
- **Kontrak:** `GameDefinition` di `registry.ts` adalah metadata kanonis (judul, tujuan, level, XP). `checkWordBuild()` hanya menerima kata yang ada di kamus; tantangan harian deterministik dari tanggal + kesulitan.
- **Catatan:** empat komponen permainan lama (typing/memory/listening/sentence) sudah dihapus; jangan menghidupkan kembali jalur tulis `recordSession` untuk permainan.

### M6 — Audio, pengucapan, dan menyimak

- **Tanggung jawab:** memutar suara Jepang dengan locale `ja-JP`, memilih voice/kecepatan, mode lambat, transkrip, perekaman lokal, panduan bunyi, latihan pengenalan suara opsional, serta latihan menyimak bertingkat.
- **File utama:** `src/lib/speech.ts` (registry provider + hasil pemutaran), `src/lib/audio-player.ts` (pemutar global/antrean), `src/components/audio.tsx` (AudioPlayerCard/controls/readiness), `src/lib/furigana.ts`/`src/lib/furigana.tsx` (bacaan kana), `src/lib/speech-recognition.ts` (normalisasi + perbandingan teks), `src/lib/use-speech-recognition.ts` (hook sesi), `src/components/speech-recognition-panel.tsx`, `src/components/pronunciation-guide.tsx`, `src/content/pronunciation-guide.ts`, `src/content/listening.ts`, `src/content/listening-drills.ts`, `src/app/audio/page.tsx`, `src/app/pronunciation/page.tsx`, `src/app/listening/page.tsx`, `src/app/listening/[id]/page.tsx`, `src/app/listening/practice/page.tsx`, `src/components/listening-player.tsx`.
- **Kontrak audio:** `SpeechProvider` memiliki `id`, `label`, `isAvailable()`, `speak()`, dan `cancel()`. `speakDetailed()` mengembalikan `ok/reason/providerId/voiceName/usedJapaneseVoice`; `speak()` lama tetap boolean. Timeout 8–45 detik mencegah tombol menggantung.
- **Kontrak rekaman:** `MediaRecorder` hanya dimulai setelah klik eksplisit, maksimum 30 detik, disimpan sebagai object URL di tab, dapat diputar ulang/dihapus, dan tidak dikirim ke server Kotoba.
- **Kontrak ASR:** hanya perbandingan transkrip. Normalisasi NFKC, buang spasi/tanda baca, katakana→hiragana; hasil `match` bila sama, `close` bila kemiripan ≥ 0,75, selain itu `different`. Ini bukan skor akustik dan tidak memberi XP berdasarkan "akurasi" pelafalan.
- **Batas:** tidak ada server TTS, penyimpanan audio, aset MP3, atau model penilaian pitch. Fallback ketika voice/ASR tidak tersedia adalah pesan informatif dan perekam manual, bukan audio atau skor palsu.
- **Masa depan:** penilaian akustik sungguhan memerlukan model, penyimpanan audio, dan kebijakan privasi tersendiri; jangan mencampurnya ke XP sebelum itu ada. Aset rekaman/Open JTalk tetap seam opsional, bukan fitur yang diklaim berjalan.

### M7 — Sistem ujian

- **Tanggung jawab:** membangun kertas untuk empat mode (latihan, simulasi, topik, acak), timer per level, navigasi bagian, penanda soal, penilaian, analitik kelemahan, rekomendasi, pembahasan, ulang soal salah, dan riwayat.
- **File utama:** `src/lib/exam-engine.ts` (domain murni), `src/lib/exam-storage.ts` (kertas/hasil `sessionStorage`), `src/components/exam-question-card.tsx`, `src/app/exams/page.tsx`, `src/app/exams/session/page.tsx`, `src/app/exams/result/page.tsx`, `recordExam` di `src/server/progress-service.ts`.
- **Kontrak:** `buildMockExam()`, `buildPracticeExam()`, `buildTopicExam()`, `buildRandomExam()`, dan `buildRetryPaper()` menghasilkan `ExamPaper`; `gradeExam()` menghasilkan `ExamResult`; `toExamPayload()` menjadi adaptor ke tabel `exams` yang sudah ada. Target hasil adalah **skor belajar 70%**, bukan ambang JLPT resmi.
- **Batas:** timer, jawaban, penanda, dan kertas aktif hidup di klien/`sessionStorage`; hanya ringkasan hasil yang dikirim ke server. Server menyimpan `sections`/`review` sebagai JSON, bukan menilai ulang dari kunci konten. Mode dan judul tidak disimpan sebagai kolom.
- **Legacy:** `EXAM_COUNTS` + `buildExam()` di `quiz.ts` masih dipakai oleh `quiz.test.ts` untuk kompatibilitas, tetapi tidak dipakai UI. Jangan menambah aturan ujian baru di sana; semua aturan runtime ada di `exam-engine.ts`.
- **Kartu:** tombol "Tambah ke kartu ulangan" memanggil `addCard()` → `POST /api/progress/card`; idempoten, tanpa XP, dan hanya menerima item yang ada di katalog.

### M8 — Penemuan budaya

- **Tanggung jawab:** artikel orisinal, fakta singkat, kuis pemahaman, kosakata budaya, label register, fakta harian/acak, favorit, dan tautan ke materi bahasa terkait.
- **File utama:** `src/content/culture.ts` (14 artikel inti), `src/content/culture/shared.ts` (pabrik artikel, registry 11 sumber, kuis), `src/content/culture/extra-*.ts` + `extras.ts` (19 artikel tambahan), `src/lib/culture-facts.ts`, `src/components/culture-quiz.tsx`, `src/app/culture/page.tsx`, `src/app/culture/[id]/page.tsx`.
- **Kontrak:** `CultureArticle` memuat `group`, `category`, `topics`, `sources`, `quiz`, dan `minutes`; total 33 artikel, 132 fakta, 66 soal kuis. Fakta harian memakai hash deterministik dari tanggal lokal sehingga server dan klien stabil; tanggal server memakai kunci `1970-01-01` sampai hidrasi.
- **Favorit:** tabel `culture_favorites` (artikel unik + `saved_at`), `toggleCultureFavorite()` idempoten, dan `POST /api/progress/favorite`; favorit ikut snapshot, ekspor, impor, dan reset.
- **Batas:** artikel adalah suplemen belajar, bukan feed hiburan atau pembenaran aturan bahasa; label register dan peringatan anime adalah bagian dari data, bukan hiasan UI. Sumber bersifat organisasi/rujukan umum, bukan kutipan per kalimat.
- **Validasi:** `sourceNote`, kategori, register, 4 fakta, 2 soal, 6 kosakata, URL sumber https, dan `minutes` diperiksa oleh `src/content/content.test.ts` serta `src/lib/culture-facts.test.ts`.

### M9 — Progres pengguna

- **Tanggung jawab:** snapshot, transaksi tulis, XP, streak, SRS, penyelesaian lesson, ujian, attempt latihan, statistik soal, pengaturan, ekspor/impor/reset.
- **File utama:** `src/server/progress-service.ts`, `src/server/db.ts`, `src/lib/api-client.ts`, `src/components/providers/progress-provider.tsx`, `src/app/api/progress/**`.
- **Batas:** hanya layer ini yang menyentuh SQLite. Komponen tidak boleh mengimpor `src/server/*`.
- **Kontrak:** semua mutasi mengembalikan `ProgressSnapshot` terbaru; klien mengganti snapshot dan cache. `recordQuizAttempt` menghitung ulang agregat attempt dari daftar jawaban dan memperbarui statistik soal dalam satu transaksi. `recordGame` memvalidasi attempt permainan, menghitung akurasi/XP, menyimpan detail, dan memperbarui activity dalam satu transaksi. `addCard` hanya menyisipkan kartu yang valid secara idempoten dan tidak memberi XP/activity. Sejak Fase 10, `saveSavedItem` dan `saveSavedCollection` memvalidasi id katalog/koleksi dan tidak memberi XP/activity; keduanya ikut snapshot, ekspor, impor, dan reset.

### M10 — Analitik pembelajaran

- **Tanggung jawab:** statistik turunan, heatmap, grafik XP, mastery per level, pencapaian, riwayat ujian, riwayat latihan, dan prioritas sesi adaptif.
- **File utama:** `src/app/progress/page.tsx`, `src/components/heatmap.tsx`, `src/lib/xp.ts`, `src/lib/srs.ts`, `src/lib/exercise-catalog.ts`, `src/lib/achievements.ts`.
- **Batas:** analitik membaca snapshot; tidak menulis database. Perhitungan yang bisa murni diletakkan di `src/lib`, bukan di komponen.
- **Cakupan Fase 6:** riwayat permainan, statistik attempt/benar/soal/skor terbaik, dan tiga pencapaian permainan. Grafik XP 14 hari memakai sumbu tanggal tetap, termasuk batang kosong.
- **Cakupan Fase 8:** performa per bagian/kategori, area lemah (< target 70%), rekomendasi materi dari soal salah, filter review, dan riwayat ujian dengan label target latihan.
- **Cakupan Fase 10:** target harian/mingguan, streak, kalender enam minggu, tren 30 hari, timeline campuran, 21 pencapaian, dan rekomendasi explainable. Semua diturunkan dari snapshot; tidak ada tabel analitik baru.
- **Masa depan:** bobot adaptif harus tetap dapat dijelaskan (aturan/prioritas), bukan kotak hitam.

### M11 — Personalisasi, tujuan, dan kamus pribadi

- **Tanggung jawab:** mengubah data belajar menjadi target, streak, kalender, rekomendasi, pencapaian, riwayat, dan kamus pribadi dengan catatan/koleksi.
- **File utama:** `src/lib/goals.ts`, `src/lib/streak.ts`, `src/lib/history.ts`, `src/lib/recommendations.ts`, `src/lib/achievements.ts`, `src/components/goal-progress.tsx`, `src/components/study-calendar.tsx`, `src/components/recommendations.tsx`, `src/components/saved-item-editor.tsx`, `src/app/dictionary/collections/page.tsx`, `src/app/page.tsx`, `src/app/progress/page.tsx`, dan `src/app/settings/page.tsx`.
- **Batas:** target dan rekomendasi adalah fungsi murni atas snapshot; tidak menulis database dan tidak memanggil layanan luar. Kamus pribadi ditulis lewat service; komponen tidak menyentuh SQLite. Ulasan materi tersimpan tidak mengubah SRS.
- **Kontrak:** target disimpan di `Settings`; progres dihitung dari `activity`/`reviews`/`lessons`; rekomendasi membawa alasan dan bukti; `saved_items` memakai kunci `(kind, ref_id)`.
- **Batas yang disengaja:** tidak ada reminder push, PWA/offline penuh, atau analitik ML. Riwayat dibatasi ukuran snapshot (400 activity, 120 review, 30 quiz, 20 exam, 100 game).

### M12 — Latihan mengetik Jepang

- **Tanggung jawab:** mengubah latihan produksi aksara menjadi sesi mengetik pendek dengan tiga mode, timer, akurasi, dan tinjauan jawaban.
- **File utama:** src/lib/typing.ts, src/lib/typing.test.ts, src/app/typing/page.tsx.
- **Kontrak:** mode kana-romaji, romaji-kana, dan meaning-kanji. Jawaban diperiksa di browser; romaji menerima alias input umum, sedangkan jawaban Jepang memakai NFKC dan trim tanpa menyamakan kana/kanji. Sesi 5/10/15 soal, deterministik dari seed, tanpa unggahan ketikan.
- **Persistensi:** penyelesaian dicatat sebagai LessonProgress kind typing (XP 20) dan satu sesi latihan; tidak ada tabel baru.
- **Batas:** bukan anti-cheat dan bukan penilaian kualitas IME. Dua mode IME memerlukan IME Jepang di perangkat; UI menjelaskan batas ini.

### M13 — Simulasi percakapan

- **Tanggung jawab:** menyediakan dialog bercabang pendek untuk perkenalan, makanan, belanja, arah, pertemanan, dan transportasi.
- **File utama:** src/content/conversations.ts, src/content/conversations.test.ts, src/app/conversation/page.tsx, src/app/conversation/[id]/page.tsx.
- **Kontrak:** 6 skenario orisinal, 19 langkah, 18 frasa kunci; setiap langkah punya tiga pilihan dan satu jawaban yang cocok secara konteks/register. Pilihan salah tetap gramatikal dan diberi umpan balik; skor dihitung dari jawaban benar pada percobaan pertama.
- **Persistensi:** recordLesson dengan kind conversation (XP 20); transkrip hanya hidup di sesi, tidak disimpan.
- **Batas:** bukan AI percakapan dan bukan penilaian pragmatik menyeluruh. Register adalah data, bukan hiasan.

### M14 — Rencana belajar personal

- **Tanggung jawab:** memproyeksikan target JLPT dan rentang minggu menjadi jadwal mingguan, milestone, dan saran yang dapat dijelaskan.
- **File utama:** src/lib/study-plan.ts, src/lib/study-plan.test.ts, src/app/plan/page.tsx.
- **Kontrak:** buildStudyPlan() menerima snapshot, targetLevel, weeks, dan now. Minggu di-clamp 4–104; anggaran mingguan max(30, round(weeklyMinutes × 0,75)); feasibility longgar ≤0,75, realistis ≤1, ketat ≤1,3, tidak-realistis >1,3. Target di bawah level berjalan disesuaikan dan ditandai targetAdjusted.
- **Persistensi:** target level/rentang disimpan di Settings (studyTargetLevel, studyTargetWeeks); rencana tidak disimpan sebagai tabel tugas dan selalu dihitung ulang.
- **Batas:** deterministik dari estimasi menit katalog dan asumsi ulangan; bukan AI, bukan prediksi kelulusan JLPT.

### M15 — Studio audio dan pemutaran Jepang

- **Tanggung jawab:** menyediakan satu jalur pemutaran audio Jepang untuk kana, kosakata, kanji, tata bahasa, bacaan, percakapan, menyimak, pelafalan, dan tombol pelafalan; mengelola antrean, play/pause/resume/stop/repeat, kecepatan, voice, diagnostik ketersediaan, dan fallback yang jujur.
- **File utama:** `src/lib/audio-player.ts`, `src/components/audio.tsx`, `src/app/audio/page.tsx`, `src/components/japanese.tsx`, `src/lib/furigana.ts`/`src/lib/furigana.tsx`, `src/lib/speech.ts`, `src/app/settings/page.tsx`.
- **Kontrak:** hanya voice `ja-JP` yang boleh dipakai; tidak ada fallback diam-diam ke voice bahasa lain. `AudioPlayer` menyimpan antrean, indeks, status, dan kecepatan; `AudioPlayerCard` merender kontrol yang sama di studio dan halaman detail. Bacaan furigana diubah ke kana utuh sebelum diucapkan; kanji/kosakata memakai bacaan terverifikasi bila tersedia. Kecepatan 0,5–1,5× dan voice disimpan di `Settings`, lalu dijepit server.
- **Persistensi:** tidak ada tabel audio, unggahan, URL aset, atau file MP3. Hanya preferensi `speechRate`/`speechVoice` yang sudah ada di `Settings`; riwayat pemutaran tidak disimpan.
- **Batas:** tidak ada skor akustik, penilaian pitch, kualitas native, caching TTS, atau aset rekaman. Voice bergantung perangkat/browser; Chromium uji tidak memiliki voice Jepang sehingga verifikasi memakai mock `ja-JP`. Open JTalk tetap adapter lokal opsional yang belum di-deploy.
- **Integrasi:** perpindahan rute memanggil `stopAudio()`; `SpeakButton` lama tetap tersedia tetapi memakai pemutar yang sama agar tidak terjadi overlap.

### M16 — Studio menulis dan urutan goresan

- **Tanggung jawab:** menyediakan katalog hiragana/katakana/kanji dengan data goresan terverifikasi, animasi urutan, kanvas tirukan/mandiri, evaluasi geometri, riwayat latihan, dan pencapaian menulis.
- **File utama:** `src/lib/writing.ts`, `src/lib/writing-geometry.ts`, `src/content/writing-notes.ts`, `src/content/writing-strokes.ts`, `scripts/import-kanjivg.mjs`, `public/writing/kanjivg/*.json`, `src/components/writing/*`, `src/app/writing/page.tsx`, `src/app/writing/[id]/page.tsx`, `src/app/api/progress/writing/route.ts`, `src/server/db.ts`, `src/server/progress-service.ts`.
- **Katalog:** 319 entri—208 kana + 111 kanji—dalam lima tahap A–E. ID memakai `writing-<script>-<char>` untuk kana dan `writing-kanji-<char>` untuk kanji. Yōon ditampilkan sebagai dua komponen berurutan; tidak ada glyph gabungan yang dikarang.
- **Data goresan:** 259 glyph unik dari KanjiVG commit `610091ce618cf757ed1357a8954cd65283e015d6`, viewBox `0 0 109 109`, path per goresan, nomor, titik awal/akhir, dan 28 titik sampel. Data JSON adalah turunan CC BY-SA 3.0; atribusi Ulrich Apel/KanjiVG dan tautan lisensi wajib dipertahankan.
- **Kontrak animasi:** nomor goresan, arah, titik awal/akhir, main/jeda/ulang, goresan sebelumnya/berikutnya, ulangi goresan aktif, dan kecepatan Lambat/Normal/Cepat. Mode Tirukan menilai tiap goresan terhadap referensi; mode Mandiri menyediakan undo/reset/toggle referensi dan tombol nilai.
- **Evaluasi:** `evaluateWriting()` menyeragamkan jalur ke 24 titik. Skor goresan = 55% bentuk + 12% awal + 12% akhir + 21% arah; skor total = 82% bentuk + 18% jumlah goresan. Goresan hilang bernilai 0; `orderMistakes` hanya dihitung untuk goresan dengan skor ≥45 dan penalti dibatasi 24. Ambang mastery 80. Ini perkiraan geometri, **bukan pengenalan tulisan tangan**.
- **Persistensi:** tabel `writing_attempts` menyimpan character_id, script, mode, score, expected/drawn strokes, order_mistakes, duration, dan created_at. Snapshot memuat 400 attempt terbaru; statistik menghitung attempt, karakter, mastery, dan order mistakes. XP 15 hanya pada attempt pertama per karakter. Tidak ada transcript/koordinat mentah yang disimpan.
- **Batas:** skor sensitif terhadap posisi/ukuran; belum ada pengujian stylus/perangkat fisik; catatan bentuk hanya ±45 karakter; data KanjiVG menuntut share-alike; tidak ada penilaian estetika atau sertifikasi.

### M17 — Teater cerita dan percakapan animasi

- **Tanggung jawab:** memutar cerita Jepang orisinal sebagai pengalaman panggung: karakter, ekspresi, gelembung dialog, latar SVG/CSS, audio per baris, mode belajar/tonton, kamus kosakata, kuis, dan progres.
- **File utama:** `src/content/stories.ts` + `stories.test.ts`, `src/components/story/story-stage.tsx`, `src/components/story/story-theater.tsx`, `src/app/stories/page.tsx`, `src/app/stories/[id]/page.tsx`, `src/app/api/progress/story/route.ts`, `src/server/db.ts`, `src/server/progress-service.ts`, `src/lib/types.ts`, `src/lib/constants.ts`, `src/lib/achievements.ts`, `src/app/globals.css`.
- **Domain:** `Story` memiliki karakter, adegan, baris (penutur, Jepang ber-furigana, reading, romaji, arti, ekspresi, vocab/grammar refs, audioUrl opsional), pertanyaan, tag, dan catatan budaya. `StoryScene` memiliki latar, efek, posisi/ekspresi karakter, dan `videoUrl` opsional. Semua konten adalah modul TypeScript bertipe; tidak ada tabel konten atau CMS.
- **Kontrak panggung:** `story-stage.tsx` merender 8 latar SVG orisinal, karakter dengan 5 ekspresi, posisi far-left/left/center/right/far-right, animasi masuk fade/slide, idle halus, efek hujan/salju/kelopak, dan gelembung dialog. Penutur aktif disorot. Bila `videoUrl` ada dan berhasil dimuat, video same-origin menggantikan latar/karakter; bila gagal, fallback ke SVG. Tidak ada aset video nyata yang dipakai saat ini.
- **Kontrak teater:** dua mode—Belajar (maju manual) dan Tonton (audio lalu maju otomatis). Kontrol play/pause/resume/stop/prev/next/replay/restart, kecepatan 0,75–1,50×, voice, navigasi baris/adegan, progress bar, toggle subtitle/furigana/romaji/terjemahan/mode Jepang saja/vocab/grammar. Sorotan audio hanya per baris; tidak ada klaim sinkronisasi per kata. Voice per karakter hanya dipetakan bila tersedia ≥2 voice Jepang; jika tidak, satu voice dipakai dan UI menjelaskannya.
- **Persistensi:** tabel ke-15 `story_attempts` menyimpan story_id, level, mode, score, correct/total, scenes_completed, duration, dan completed_at. XP 25 hanya pada penyelesaian pertama per cerita; skor ≥60 dihitung selesai untuk statistik. Snapshot memuat 300 attempt terbaru; impor menerima 1.000. Tidak ada transcript/posisi baris yang disimpan.
- **Pembelajaran:** `vocabIds` dan `grammarIds` per baris membuka modal kamus/grammar; kosakata dapat disimpan ke kamus pribadi. Kuis pascacerita mencampur pemahaman dan menyimak, dengan pembahasan dan opsi audio per soal. Ringkasan kosakata/tata bahasa ditampilkan setelah kuis.
- **Batas:** hanya 3 cerita (2 N5, 1 N4); audio per baris; voice per karakter bergantung perangkat; belum ada video export, pipeline aset video/CMS, checkpoint/resume, atau kamus setiap kata. Struktur `videoUrl` adalah seam masa depan, bukan fitur video yang sudah teruji.

---

## 6. Alur runtime utama

### 6.1 Boot dan hidrasi

```text
SSR
 └─ ProgressProvider state = emptySnapshot()   (agar HTML server = HTML klien)
     └─ mount
         ├─ setTimeout(0): baca cache localStorage → setSnapshot(cache)
         ├─ GET /api/progress → setSnapshot(server) → tulis cache
         └─ terapkan tema dari settings
```

Konsekuensi:

- Tidak ada pembacaan `localStorage` saat render pertama, sehingga tidak ada hydration mismatch.
- Jika server mati, cache masih memberi tampilan; mutasi akan gagal dengan pesan, bukan diam-diam dianggap tersimpan.
- Jika cache kosong dan server lambat, UI menampilkan keadaan kosong/loading, bukan data karangan.

### 6.2 Ulasan kartu SRS

```text
Flashcards (klien)
  → pilih rating 0–3
  → recordReview({itemId, kind, rating, mode})
  → POST /api/progress/review
  → progress-service: scheduleCard → transaksi (cards + reviews + profile + activity)
  → snapshot baru
  → provider mengganti state + cache
  → halaman menampilkan XP, jadwal berikutnya, dan kartu tersisa
```

Tidak ada optimistic update untuk hasil SRS: jadwal dan XP harus berasal dari server agar tidak berbeda antar-refresh. Kegagalan jaringan berarti rating tidak tersimpan dan pengguna diberi tahu.

### 6.3 Latihan dan kuis

```text
Konten bertipe (kana, kosakata, kanji, grammar, bacaan, menyimak, kalimat)
  → buildExerciseCatalog() / exercisesFromQuizQuestions()
  → buildAdaptiveSession() memilih soal berbobot
  → ExerciseRunner → ExerciseCard (9 jenis)
      → gradeExercise() per soal
      → umpan balik + pembahasan langsung
  → selesai
      → createQuizAttempt() dari jawaban + waktu
      → recordQuiz() → POST /api/progress/quiz
      → progress-service: hitung ulang agregat, simpan attempt + statistik soal + XP
      → snapshot baru → provider/cache
```

- Pemilihan soal, normalisasi jawaban, dan penilaian adalah fungsi murni di `src/lib`; dapat diuji tanpa browser.
- Jawaban dan timer sesi hidup di state klien. Server menghitung ulang total/benar/skor dari daftar jawaban, tetapi belum menilai ulang benar/salah dari kunci konten.
- Ujian memiliki engine dan alur runtime sendiri; lihat §6.9. Attempt kuis mode `exam` tidak memberi XP kuis.
- `sections` dan `review` ujian disimpan sebagai JSON untuk pembahasan; ini pilihan pragmatis karena bentuknya stabil dan tidak perlu query relasional.

### 6.4 Pelajaran interaktif

```text
/learn/[lessonId] (server component)
  → resolve Lesson + LessonPlan + pelajaran berikutnya
  → LessonPlayer (client)
     → langkah Pengantar/Penjelasan/Contoh/Catatan
     → Latihan MCQ, skor 0–100
     → lulus >= 60 → langkah Selesai
     → recordLesson({lessonId, kind, score, xp})
     → POST /api/progress/lesson
     → progress-service: simpan lesson + XP pertama + activity
     → snapshot baru → provider/cache
```

Pelajaran interaktif ditandai `Lesson.interactive` dan memakai id progres dari `src/lib/learning.ts`. Latihan pelajaran memakai `ExerciseRunner` melalui `LessonPractice`, dengan gerbang 60% yang sama. Server tetap menjadi otoritas XP penyelesaian pertama; skor latihan berasal dari klien dan bukan penilaian anti-curang. Pelajaran tanpa `LessonPlan` tetap memakai alur materi lama dan penyelesaian manual.

### 6.5 Menambah materi

```text
Tambah item di src/content/<jenis>.ts
  → katalog konten mengekspor item
  → curriculum.ts membentuk/memperluas modul & lesson (otomatis untuk jenis yang sudah didukung)
  → content.test.ts + curriculum.test.ts memvalidasi id, field, ref, dan cakupan
  → halaman daftar/detail menampilkan item tanpa perubahan logika
```

Untuk **jenis konten baru** (misalnya “percakapan”), perlu perubahan eksplisit: tambah tipe, tambah modul konten, tambah resolver `ContentRef`, tambah UI. Itu bukan pelanggaran fleksibilitas; itu batas yang disengaja agar tipe tetap jujur.

### 6.6 Impor, ekspor, dan reset

- Ekspor mengambil snapshot server dan mengunduh JSON.
- Impor memvalidasi bentuk minimum, lalu mengganti tabel progres dalam satu transaksi; `game_attempts` termasuk.
- Reset menghapus progres tetapi mempertahankan nama dan pengaturan.
- Semua jalur ini hanya menyentuh progres, bukan konten statis.

### 6.7 Permainan belajar

```text
/games (server component) → validasi ?game= → GamesHub (client)
  → pilih permainan + kesulitan
  → domain murni di src/lib/games membangun ronde deterministik
  → UI (game-kit + komponen permainan) mengelola timer/petunjuk/feedback
  → selesai → GameAttempt lokal (score, correct, details)
  → recordGame() → POST /api/progress/game
  → progress-service: validasi, hitung akurasi/XP, simpan game_attempts + activity
  → snapshot baru → provider/cache
```

- Pembuat kata memvalidasi input terhadap kamus; hasil `alternate` diterima dengan arti kata lain, sedangkan `invalid` tidak pernah dianggap benar.
- Timer, combo, dan petunjuk hidup di state klien; server menghitung ulang akurasi/XP dari attempt yang dikirim.
- Tantangan harian memakai `dateKey` + kesulitan sebagai seed, sehingga pola soal tetap sama sepanjang hari tanpa server penjadwal.
- Riwayat attempt dibatasi 100 di snapshot; UI menampilkan lima sesi terakhir di hub dan enam di Statistik.

### 6.8 Audio, pelafalan, dan menyimak

```text
SpeakButton / ListeningPlayer / Pronunciation
  → useSpeech().speakDetailed(text, { rate, voiceURI })
  → getActiveSpeechProvider() → browser-synthesis
  → SpeechSynthesisUtterance(lang=ja-JP, voice Jepang bila ada)
  → hasil { ok, reason, providerId, voiceName, usedJapaneseVoice }
  → sukses: UI selesai; gagal: describeSpeechFailure() → toast
```

```text
/pronunciation → klik "Mulai rekam" (izin mikrofon eksplisit)
  → MediaRecorder 30 detik → object URL lokal → putar ulang / hapus
  → tidak ada upload ke server

/pronunciation → panel pengenalan suara (opsional)
  → browser SpeechRecognition(lang=ja-JP)
  → transkrip → normalizeSpeechText() → compareSpeechTranscript([jp, reading], transcript)
  → match / close / different (perbandingan teks, bukan akustik)
  → tanpa dukungan/izin: fallback perekam manual
```

```text
/listening/practice → pilih level
  → listeningDrillExercises(level) → ExerciseRunner
  → per soal: audio TTS normal/lambat → pilih jawaban → cek
  → transkrip + terjemahan + penjelasan
  → selesai → recordQuiz() → quiz_attempts
```

- Semua audio tetap berasal dari perangkat. Registry provider memberi seam untuk penyedia audio lain tanpa mengubah tombol materi.
- `ListeningPlayer` memakai token urutan agar "putar semua" dan "putar baris" tidak tumpang tindih; hasil gagal dilaporkan ke toast, bukan diabaikan.
- Pengenalan suara adalah fitur progresif: tidak tersedia di semua browser dan dapat memerlukan jaringan. UI menyatakan bahwa browser/penyedia dapat mengirim audio ke vendor, sedangkan Kotoba tidak menyimpan audio/transkrip.
- Drill menyimak tidak menambah tabel: 15 item dipetakan ke latihan dan hasilnya masuk `quiz_attempts`, sehingga Statistik dan prioritas adaptif memakai read model yang sama.

### 6.9 Ujian empat mode

```text
/exams (hub)
  → pilih level + mode (latihan/simulasi/topik/acak) + kategori/topik
  → buildPracticeExam / buildMockExam / buildTopicExam / buildRandomExam
  → ExamPaper + pratinjau jumlah soal/durasi/umpan balik
  → saveActiveExam(sessionStorage) → /exams/session

/exams/session
  → timer dihitung dari startedAt (refresh-safe)
  → latihan/topik: periksa per soal + pembahasan langsung
  → simulasi/acak: navigasi, tandai soal, kumpulkan di akhir
  → gradeExam() → saveExamResult(sessionStorage) + clearActiveExam()
  → recordExam(toExamPayload(result)) → POST /api/progress/exam
  → /exams/result

/exams/result
  → skor belajar + target 70%, benar/salah/kosong, durasi
  → performa bagian/kategori, area lemah, rekomendasi
  → review semua/benar/salah/kosong + pembahasan
  → buildRetryPaper() untuk soal salah/kosong
  → AddToCards → POST /api/progress/card (idempoten, tanpa XP)
```

- Timer, jawaban, penanda, dan kertas aktif hanya hidup di klien/`sessionStorage`; server menerima ringkasan hasil.
- Mode simulasi memakai tiga bagian tetap (Moji & Goi, Bunpou & Dokkai, Choukai). Mode latihan/topik tidak bertimer dan memberi pembahasan langsung.
- Soal membaca membawa teks bacaan; soal menyimak membawa dialog lengkap. Transkrip/terjemahan tidak ditampilkan sebelum jawaban diperiksa/dikumpulkan.
- Pemilihan soal memprioritaskan level terpilih lalu fallback lintas level; `paper.mixedLevels` ditampilkan di hub.
- Target 70% adalah target belajar Kotoba, bukan ambang kelulusan JLPT. Kolom `passed` lama menyimpan status target ini.
- Kartu dari hasil ujian ditambahkan lewat `addCard()`, bukan `recordReview`, sehingga tidak ada XP atau activity palsu.

### 6.10 Dasbor personal, target, dan kamus pribadi

```text
GET /api/progress → snapshot
  → goalProgress(snapshot)        (activity + reviews + lessons hari ini)
  → weeklyGoal(snapshot)          (Senin–Minggu, hari aktif)
  → streakSummary(snapshot)       (tanggal lokal)
  → buildRecommendations(snapshot)(maks. 4, alasan + bukti)
  → dashboard: ringkasan 6 metrik, target, saran, ujian terbaru

/dictionary/collections
  → simpan materi (kind/refId)    → POST /api/progress/saved
  → buat/ubah/hapus koleksi       → POST /api/progress/collections
  → hapus koleksi mengosongkan collection_id item, tidak menghapus materi
  → ulasan tersimpan: tampilkan jawaban / ulangi nanti (tanpa recordReview)
```

- Tidak ada tabel target/analitik. Semua angka diturunkan dari snapshot yang sudah ada, sehingga ekspor/impor tetap satu kontrak.
- `saved_items` memakai kunci `(kind, ref_id)`; satu materi hanya disimpan sekali. Simpan/hapus tidak memberi XP atau activity.
- Ulasan materi tersimpan adalah pengulangan mandiri, bukan SRS. `dueAt`, `ease`, `reps`, dan statistik review tidak berubah.
- Tanggal kalender/target memakai `toDateKey()` lokal; activity ditulis dengan tanggal lokal server. Batas lintas zona waktu dicatat di §15.

### 6.11 Rencana belajar, mengetik, dan percakapan

```text
/plan
  → settings.studyTargetLevel / studyTargetWeeks (draft lokal)
  → buildStudyPlan({snapshot, targetLevel, weeks, now})
  → jadwal mingguan + feasibility + milestone + saran
  → "Simpan target" → POST /api/progress/settings

/typing
  → buildTypingSession({mode, count, seed})   (deterministik)
  → checkTypingAnswer() di browser            (tanpa upload)
  → selesai → recordLesson(kind typing) + recordSession

/conversation/[id]
  → CONVERSATION_BY_ID → langkah + pilihan berlabel register
  → pilih benar/salah → umpan balik + transkrip sesi
  → selesai → recordLesson(kind conversation)
```

- Rencana tidak punya tabel sendiri. Mengubah target atau menyelesaikan pelajaran langsung mengubah proyeksi; tidak ada jadwal basi yang perlu dimigrasikan.
- Mengetik dan percakapan memakai tabel lessons yang sama; tidak ada tabel attempt baru. Keduanya mencatat penyelesaian pertama untuk XP.
- Pemeriksaan mengetik, pilihan percakapan, dan skor percakapan berjalan di klien. Server menyimpan hasil penyelesaian, bukan menilai ulang dialog; ini konsisten dengan batas single-player yang sudah ada.
- Rencana memakai tanggal lokal untuk batas minggu. Deployment lintas zona waktu memerlukan timezone profil; batas ini dicatat di §15.

### 6.12 Studio audio dan pemutaran lintas modul

```text
/audio
  → pilih tab (kana/kosakata/kanji/tata bahasa/bacaan/percakapan)
  → filter + cari → daftar materi (24 per halaman)
  → pilih materi → player.playQueue(bagian)
  → AudioPlayerCard: play/pause/resume/stop/repeat/prev/next/rate/voice
  → SpeechProvider browser (ja-JP) → speakDetailed()
  → voice Jepang tidak ada → status "tidak tersedia" + pesan, bukan voice lain

/reading/[id], /conversation/[id], /listening/[id], /pronunciation
  → AudioPlayerCard dengan antrean halaman (queueColumns=1)
  → bacaan kana / baris dialog / frasa kunci
  → perpindahan rute → AppShell stopAudio()
```

- Satu pemutar global mencegah dua utterance overlap; memulai antrean baru menghentikan antrean lama.
- Bacaan yang ditampilkan dengan ruby dikonversi ke kana utuh sebelum diucapkan; kanji memakai bacaan terverifikasi. Voice non-Jepang tidak pernah dipakai sebagai fallback.
- Preferensi kecepatan/voice disimpan di `Settings`; tidak ada riwayat pemutaran, unggahan, atau aset audio.
- Keterbatasan voice perangkat dan verifikasi mock dicatat di §12/§15.

### 6.13 Studio menulis dan penyimpanan attempt

```text
/writing
  → pilih tahap/pencarian → 30 kartu per halaman → /writing/[id]
  → fetch public/writing/kanjivg/<codepoint>.json (cache modul + force-cache)
  → mode Animasi: SVG pathLength + nomor/titik + kontrol kecepatan
  → mode Tirukan: Pointer Events → stroke selesai → evaluateWriting()
  → mode Mandiri: undo/reset/referensi → tombol “Nilai gambar”
  → hasil skor/jumlah/urutan + disclaimer geometri
  → recordWriting({characterId, script, mode, score, ...})
  → POST /api/progress/writing → progress-service validasi + INSERT writing_attempts
  → snapshot baru (writing maksimal 400) → provider/cache → riwayat karakter
```

- Pemuatan glyph per karakter menghindari pengiriman 259 JSON sekaligus; kegagalan fetch menampilkan retry dan tidak mengarang goresan.
- Penilaian berjalan lokal; server menyimpan hasil dan menghitung statistik/XP. Server tidak menilai ulang geometri, sehingga ini bukan anti-cheat.
- Data goresan tidak diubah menjadi gambar/video; animasi memakai SVG asli dan menghormati `prefers-reduced-motion`.

### 6.14 Teater cerita dan penyimpanan attempt

```text
/stories
  → filter level → kartu 3 cerita + statistik attempt/completed/best
  → /stories/[id] → StoryTheater
  → StoryStage (latar SVG/CSS, karakter/ekspresi, gelembung)
  → audio per baris: AudioTrack(audioUrl? → TTS ja-JP)
  → mode Belajar: maju manual; mode Tonton: playAudio lalu auto-advance
  → kuis pemahaman/menyimak → recordStory({storyId, mode, score, ...})
  → POST /api/progress/story → INSERT story_attempts + XP 25 pertama kali
  → snapshot baru (stories maksimal 300) → hub/riwayat/pencapaian
```

- Panggung tidak di-hardcode per cerita; latar/karakter/posisi/ekspresi berasal dari data cerita.
- Audio memakai pemutar global; bila voice Jepang tidak tersedia, cerita tetap terbaca dan statusnya jujur. Tidak ada klaim sinkronisasi per kata atau voice native per karakter.
- Video hanya dipakai bila `StoryScene.videoUrl` diisi aset same-origin; tidak ada pipeline ekspor atau AI video.

---

## 7. Struktur konten yang fleksibel

Konten dipisahkan menjadi dua tingkat:

1. **Materi atomik** — `Kana`, `VocabWord`, `Kanji`, `GrammarPoint`, `ReadingPassage`, `ListeningItem`, `ListeningDrill`, `PronunciationGuideTopic`, `CultureArticle`, `SentenceItem`.
2. **Katalog turunan** — `Course` → `CourseModule` → `Lesson` → `ContentRef`.

`Lesson` tidak memiliki field materi yang diduplikasi. Ia hanya menyimpan:

- identitas dan urutan;
- level dan estimasi waktu;
- tujuan pembelajaran;
- daftar `ContentRef` (`kind` + `id` + `href` opsional).

Dengan pola ini:

- satu kosakata bisa muncul di modul N5 dan di sesi ulangan tanpa menyalin data;
- lesson dapat diurutkan ulang tanpa menyentuh materi;
- UI baru cukup membaca katalog dan me-resolve ref;
- validasi dapat memastikan tidak ada ref yang menggantung.

Katalog saat ini berisi **39 modul, 154 lesson, dan 644 referensi konten**. Dari jumlah itu, **70 lesson N5 memiliki LessonPlan interaktif**, termasuk delapan pelajaran membaca/menyimak; lesson N4–N1 masih memakai halaman materi lama. Angka ini diturunkan dari konten nyata, bukan didefinisikan manual, sehingga tidak bisa “menyesuaikan diri” secara palsu.

---

## 8. Keputusan persistensi

### 8.1 Alternatif yang dipertimbangkan

| Pendekatan | Kelebihan | Kekurangan | Keputusan |
| --- | --- | --- | --- |
| `localStorage` saja | Sangat sederhana, offline penuh | Per-perangkat, mudah hilang, tidak ada sumber otoritatif, sulit dianalisis | Ditolak sebagai sumber kebenaran; dipakai sebagai cache baca |
| IndexedDB | Kapasitas lebih besar, offline kaya | Kompleksitas migrasi/transaksi, tetap per-perangkat | Ditunda sampai kebutuhan offline tulis nyata |
| SQLite lokal via `node:sqlite` | Transaksi, query, tanpa layanan eksternal, file mudah dibackup | Hanya satu proses, bukan multi-pengguna, Node >= 22.5 | **Dipilih** |
| PostgreSQL/cloud | Multi-pengguna, sinkronisasi | Infrastruktur, biaya, auth, latensi | Ditunda ke fase akun/sinkronisasi |

### 8.2 Model yang dipilih: server-authoritative dengan cache baca

- Server SQLite adalah **sumber kebenaran** untuk XP, streak, kartu, riwayat, dan pengaturan.
- Browser menyimpan snapshot terakhir sebagai **cache baca** agar tampilan awal cepat dan tidak kosong saat offline.
- Tidak ada tulis offline yang diantrekan. Jika `POST` gagal, pengguna melihat pesan dan dapat mencoba lagi.
- Tidak ada sinkronisasi antarperangkat. Ekspor/impor JSON adalah jalur pemindahan data manual.

Model ini menghindari dua ekstrem yang tidak perlu sekarang: (a) aplikasi lokal yang kehilangan data saat browser dibersihkan, dan (b) infrastruktur cloud multi-pengguna sebelum ada autentikasi.

---

## 9. Perhitungan dan persistensi progres

Detail field dan rumus ada di [DATA_MODEL.md](DATA_MODEL.md). Ringkasan arsitekturalnya:

- **State tersimpan:** profil, kartu SRS, mastery kana, lesson selesai, log ulasan, attempt ujian, attempt latihan, statistik per soal, attempt permainan, aktivitas harian.
- **Agregat turunan:** total XP, level, persentase level, streak, total ulasan, akurasi, menit belajar, jumlah ujian/kuis/permainan, kartu jatuh tempo, skor permainan terbaik.
- **Event vs state:** `reviews` adalah log kejadian; `cards` adalah state terbaru. `quiz_attempts`/`game_attempts` menyimpan riwayat sesi; `question_stats` adalah agregat per soal untuk prioritas adaptif. Semuanya disimpan karena analitik membutuhkan riwayat, sedangkan SRS/prioritas membutuhkan state cepat.
- **Transaksi:** setiap mutasi yang memengaruhi XP + kartu + aktivitas dibungkus satu transaksi agar snapshot tidak setengah jadi.
- **Waktu:** timestamp ISO 8601; tanggal aktivitas/streak memakai tanggal lokal proses (saat ini perangkat pengguna). Ini disengaja untuk “hari belajar” yang terasa alami, tetapi perlu didokumentasikan jika server dipindah lintas zona waktu.

---

## 10. Validasi dan penanganan kesalahan

| Lapisan | Validasi | Perilaku gagal |
| --- | --- | --- |
| Konten | Tes: id unik, field wajib, `answerIndex` dalam rentang, token/answer cocok, `ContentRef` ada, cakupan katalog lengkap | Test/build gagal; konten tidak boleh dirilis |
| Curriculum | `validateCurriculum()` memeriksa duplikasi, urutan, href internal, ref menggantung | `assertValidCurriculum()` melempar daftar masalah |
| API | `progress-service` meng-clamp angka, memvalidasi kind/rating/bentuk payload, mode kuis, dan 1–100 jawaban | `fail()` dengan status 4xx; tidak ada tulis parsial |
| Penilaian latihan | `gradeExercise` memeriksa jenis respons, indeks, urutan, pasangan, dan varian teks | Jawaban salah/tipe tidak cocok menghasilkan skor 0 + umpan balik, bukan crash |
| Impor | Bentuk snapshot minimum; nilai di-clamp; transaksi; attempt/statistik opsional diturunkan bila tidak ada | 400/422; data lama tidak dihapus jika validasi gagal |
| Audio | Provider tersedia, teks tidak kosong, timeout; hasil pemutaran terstruktur | Toast alasan (unsupported/blocked/error/timeout), bukan diam |
| Pengenalan suara | Deteksi API, izin mikrofon, normalisasi transkrip, batas 15 detik | Fallback perekam manual; tidak ada klaim skor akustik |
| UI | Loading, empty, error, success state; toast untuk mutasi | Pesan jelas; tombol dapat dicoba lagi |

Prinsip: **jangan menelan error secara diam-diam**. Kegagalan penyimpanan harus terlihat oleh pengguna karena progres belajar adalah janji produk.

---

## 11. Kesalahan umum arsitektur yang harus dihindari

1. **Menaruh logika SRS/XP di komponen.** Semua rumus harus di `src/lib` atau `src/server`, agar bisa diuji dan konsisten.
2. **Menyalin materi ke database progres.** Konten tetap statis; database hanya menyimpan referensi id dan hasil belajar.
3. **Mengimpor `src/server` dari komponen klien.** Ini akan membocorkan `node:sqlite` ke bundle browser dan merusak build.
4. **Menambah `useEffect` sinkronisasi state turunan.** Gunakan derived value/useMemo; effect hanya untuk sistem eksternal (localStorage, fetch, speech).
5. **Menjadikan cache sebagai sumber kebenaran.** Cache tidak boleh menimpa server setelah fetch berhasil.
6. **Menambah tipe baru tanpa validator.** Tipe TypeScript hilang saat runtime; data impor/konten tetap harus divalidasi.
7. **Membuat abstraksi generik sebelum ada dua pengguna nyata.** `Exercise` dan `Course` cukup; jangan membuat plugin system/CMS.

---

## 12. Batas keamanan lokal dan dukungan autentikasi

### 12.1 Batas keamanan lokal Fase 12

Kotoba adalah aplikasi **satu pengguna, satu perangkat**. Fase 12 tidak menambahkan autentikasi, tetapi memperkeras batas lokal agar API progres tidak mudah dipanggil dari halaman lintas-origin atau perangkat lain:

| Lapisan | Implementasi | Batas |
| --- | --- | --- |
| Jaringan | `npm run dev`/`start` mengikat `127.0.0.1`; `src/proxy.ts` menolak Host selain localhost/127.0.0.1/::1 dengan 421 | Bukan auth; reverse proxy tetap perlu TLS + auth |
| Asal permintaan | `isSameOriginRequest()` memeriksa `Sec-Fetch-Site` dan `Origin` terhadap Host/URL; tulisan wajib `application/json` | Request non-browser dengan header lengkap masih mungkin; bukan otorisasi |
| Body | `readJson()` membatasi 5 MiB; proxy 6 MB; skema per payload + validasi katalog | Mencegah body raksasa, bukan penyalahgunaan request kecil |
| Impor/reset | Reset wajib `{confirm:true}`; impor memakai envelope + pratinjau modal dan validasi sebelum DELETE | Tetap operasi destruktif lokal; backup/ekspor disarankan |
| Header | CSP, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, COOP | CSP memakai `unsafe-inline` untuk theme boot; belum ada nonce/hash |
| Data | DB dan direktori `.data` 0700/0600; health hanya `{ok,version}`; error internal disanitasi | File tetap dapat dibaca proses pengguna yang sama |
| Transaksi | `BEGIN IMMEDIATE` + guard kedalaman; rollback meneruskan error asli | SQLite sinkron memblokir event loop; bukan antrean/rate limit |

**Threat model.** Batas ini melindungi dari CSRF sederhana, DNS rebinding, body besar, dan kebocoran error/health pada mesin lokal. Batas ini **tidak** melindungi dari pengguna lokal lain, malware, pencurian file, atau deployment publik tanpa auth/TLS. API progres tetap menerima klien sebagai sumber data aktivitas; penilaian ulang server-side bukan tujuan Fase 12.

### 12.2 Seam autentikasi dan sinkronisasi

Belum diimplementasikan. Namun arsitektur menyediakan seam berikut:

| Seam | Rencana | Alasan |
| --- | --- | --- |
| Identitas | Tabel `users`; `profile.user_id`; semua tabel progres mendapat `user_id` | Satu baris `profile.id=1` tidak cukup untuk multi-pengguna |
| Kunci | `cards` menjadi PK komposit `(user_id, item_id, kind)`; `kana_progress` `(user_id, char)`; `lessons` `(user_id, lesson_id)`; `activity` `(user_id, date)` | Mencegah tabrakan antar pengguna |
| Auth | Sesi server (cookie httpOnly) + route handler membaca user dari sesi | Jangan mempercayai `userId` dari body klien |
| API | Semua endpoint tetap `/api/progress/*`; user diambil dari sesi; tambah `/api/auth/*` | Klien tidak perlu mengirim identitas |
| Migrasi | Profil lama menjadi pengguna pertama; data lama diberi `user_id` | Tidak menghapus progres pengguna awal |
| Ekspor | Snapshot per pengguna; format `version` | Backup dan pindah perangkat |
| Konflik sinkronisasi | Server otoritatif per operasi; state kartu digabung berdasarkan `lastReviewedAt` terbaru; aktivitas dijumlahkan per tanggal | Sederhana dan dapat dijelaskan; bukan CRDT |
| Versi | `schema_version` + migrasi additive; `export.version` | Perubahan skema harus dapat dilacak |

Sinkronisasi penuh, offline tulis, dan resolusi konflik kompleks **tidak** termasuk fase ini. Menambahkannya sebelum ada autentikasi akan menghasilkan solusi yang salah.

---

## 13. Strategi verifikasi

| Tingkat | Alat | Cakupan saat ini |
| --- | --- | --- |
| Tipe | npx tsc --noEmit | Seluruh src |
| Lint | npx eslint . | Aturan Next + hooks |
| Unit domain | Vitest (39 file / 236 tes) | SRS, engine latihan/ujian, katalog/adaptif, XP, furigana, quiz, content, curriculum, 6 domain permainan, normalisasi/perbandingan ASR, 15 drill menyimak, fakta budaya, target/streak/kalender/tren, rekomendasi, 25 pencapaian, rencana belajar, mengetik, skenario percakapan, pemutar audio/fallback, preferensi tema, boundary HTTP, validator QA semantik, backup/restore, katalog menulis, geometri menulis, roundtrip writing, konten cerita, recordStory berulang |
| Integrasi server | Vitest + DB sementara | Snapshot, review, kana, lesson (termasuk typing/conversation), exam, writing attempt, story attempt (termasuk percobaan kedua tanpa XP), addCard idempoten, kuis/statistik soal, permainan, settings, saved items/collections, import/reset, validasi same-origin/Content-Type/body |
| Build | npm run build | 101 halaman statis (termasuk 70 pelajaran, `/stories`, 3 detail cerita, `/writing`, dan `_not-found`), 6 route detail dinamis, 20 route handler API |
| Browser | Skrip Playwright lokal | 34 pola rute utama, desktop/mobile/dark, console error |
| Playwright Fase 10 | Build produksi + DB terisolasi | Dasbor personal, target, saran, ujian terbaru, kalender/timeline/tren, koleksi/catatan/review modal, simpan kosakata, persistensi target, dark/mobile |
| Playwright Fase 11 | Build produksi + DB terisolasi | Percakapan (salah lalu benar, simpan), mengetik 5 soal sampai hasil, rencana N4 8 minggu + persistensi, kamus 黒 terkait, kanji 日 beradikal sama, mobile |
| Playwright Fase 12 | Build produksi + DB terisolasi | Simulasi 29 soal selesai (34%, analitik/review), percakapan 100% tersimpan, mengetik 0/5 tersimpan, impor pratinjau/Batal/Ya timpa, mobile gelap 390px, 0 console error |
| Pengamanan Fase 12 | curl pada build produksi | JSON same-origin reset 400, origin localhost 400, cross-origin 403, text/plain 415, Host evil.example 421, CSP/header ada; DB 0600 dan direktori 0700 |
| Probe UI Fase 12 | Playwright + evaluasi DOM | Tema lokal gelap bertahan vs server sistem, kontras tombol 6,44:1, satu h1 desktop, /plan dan /kana tanpa overflow 390px, target sentuh 24px, 0 teks Jepang tanpa lang=ja, fokus soal berpindah ke prompt |
| Reflow Fase 13 | Playwright 320/400 px | 29 rute × 2 lebar; 400 px bersih; 320 px diperbaiki di `/`, `/vocabulary`, `/exams`, `/settings`; 0 console/page error |
| Konten Fase 13 | Vitest validator + browser | 8 LessonPlan membaca/menyimak dirender dengan furigana/dialog; validator semantik 0 error struktural pada dataset |
| Backup Fase 13 | CLI + Vitest | Backup, verifikasi integrity_check, restore, retensi; DB uji 13 tabel; izin 0700/0600 |
| E2E fungsional | Playwright pada build produksi + DB terisolasi | 9 jenis latihan, retry, flashcard, kuis kosakata, empat mode ujian, hasil/review/retry/add-card, enam permainan, panduan pelafalan, rekaman/replay/hapus, fallback ASR, drill menyimak |
| API smoke | Skrip Node | Alur tulis dan snapshot pada DB terisolasi; 34 pola rute pengguna HTTP 200; penolakan request lintas-origin/non-JSON |
| Audit mobile Fase 14B | Playwright Chromium teremulasi, 9 viewport | 29 rute × 9 lebar = 261 pemuatan; 0 overflow halaman, 0 error runtime; `scrollWidth` = viewport di 320–1920 |
| Playwright fungsional Fase 14B | Build produksi + DB terisolasi, 390×844 | 18 langkah (drawer, pelajaran, kana, kosakata, tata bahasa, bacaan, menyimak, latihan, permainan, ujian, mengetik, percakapan, rencana, tema, kamus, statistik); 0 error |
| Playwright Fase 16 | Chromium teremulasi + DB terisolasi, 390×844 | Studio audio: status tanpa voice Jepang, mock voice `ja-JP` untuk play/pause/resume/stop, repeat/kecepatan, penghentian saat pindah rute, kontrol bacaan/percakapan/menyimak/pelafalan; 0 error |
| Smoke QA Fase 16 | verify-ui.cjs pada build + DB terisolasi | 30 pola rute HTTP 200, H1 sesuai, 0 error konsol; `/audio` termasuk |
| Playwright Fase 17 | Chromium teremulasi + DB terisolasi | Hub 319 kartu, detail 日, semua kontrol animasi, tirukan skor 46 tersimpan, riwayat setelah reload, kanvas mandiri, pointer sentuh/undo, 320 px tanpa overflow, gelap 1440 px, reduced-motion, ekspor–reset–impor writing; 0 error |
| Smoke QA Fase 17 | verify-ui.cjs pada build + DB terisolasi | 32 pola rute HTTP 200, H1 sesuai, 0 error konsol; `/writing` dan `/writing/writing-kanji-%E6%97%A5` termasuk |
| Playwright Fase 18 | Chromium teremulasi + DB terisolasi | Teater cerita: 3 cerita, toggle terjemahan/furigana, navigasi baris, mode tonton maju otomatis, kuis 100% tersimpan, kamus, fallback tanpa voice Jepang, persistensi attempt, mobile 390 px; 24 pemeriksaan, 0 error |
| Smoke QA Fase 18 | verify-ui.cjs pada build + DB terisolasi | 34 pola rute HTTP 200, H1 sesuai, 0 error konsol; `/stories` dan `/stories/story-eki-hajimete` termasuk |
| QA integrasi Fase 19 | Playwright Chromium + DB terisolasi | 34 pola rute × desktop 1440/mobile 390/mobile 320 = 102 pemeriksaan, semua HTTP 200, satu h1, `lang=id`, 0 overflow/error konsol; 6 perjalanan (kana tanpa voice, tata bahasa, menulis hiragana, animasi kanji, teater cerita, CMS blocked) lulus; 0 kontrol tanpa nama pada 5 rute sampel |

Fase 17 menambahkan tes katalog/geometri writing dan roundtrip impor; Fase 18 menambahkan tes konten cerita (volume, ID unik, furigana/reading, referensi vocab/grammar, posisi panggung, batas jawaban) dan tes recordStory berulang. Fase 19 menambahkan tes tautan kana/kanji ke detail menulis dan regresi integrasi 102 pemeriksaan rute; satu observasi h1 ganda pada `/dictionary/collections` tidak dapat direproduksi pada muat baru maupun pengulangan urutan rute, sehingga tidak diklaim sebagai bug produk. Verifikasi browser memakai Chromium teremulasi dan DB terisolasi, bukan perangkat fisik. Fase 13 menambahkan **CI quality gate** (`.github/workflows/quality.yml`) yang menjalankan `npm ci`, `npm run audit:prod`, `npm run check`, dan `npm run build`. **E2E alur pengguna, axe, dan tes komponen** belum masuk `npm test`; skrip Playwright fase 7–18 tetap verifikasi ad hoc dengan DB terisolasi dan tidak dijalankan di CI. Ini adalah batasan yang disengaja sampai biaya flakiness dan dependency browser dikelola.

### 13.1 Metode audit mobile Fase 14B

Audit memakai Chromium Playwright yang diemulasikan pada 320×568, 360×740, 375×667, 390×844, 430×932, 768×1024, 1024×768, 1366×768, dan 1920×1080. Untuk setiap rute, skrip mencatat status HTTP, error konsol/page, `documentElement.scrollWidth` versus `clientWidth`, elemen yang melewati viewport, elemen terpotong, h1, dan target sentuh di bawah ambang. Audit final: **0 halaman overflow**, 0 error runtime, 261/261 HTTP 200.

Hitungan target sentuh mentah tidak dipakai sebagai vonis karena mencakup tautan inline (pengecualian WCAG) dan checkbox 16 px di dalam label yang dapat diklik. Kontrol utama yang terlalu kecil diperbaiki secara terarah. **Keterbatasan:** emulasi bukan perangkat fisik; iOS Safari, Android Chrome, kamera/file picker asli, audio perangkat, orientasi perangkat nyata, dan pembaca layar belum diuji. Saat audit Fase 14B, CMS/admin, kanvas menulis, animasi goresan, dan story theater belum ada di repositori ini sehingga tidak dapat diaudit. Detail lengkap ada di [MOBILE_COMPATIBILITY_REPORT.md](MOBILE_COMPATIBILITY_REPORT.md).


---

## 14. Peta file

```text
src/
  app/                    # route + UI (App Router)
    api/progress/         # transport HTTP; tipis, tanpa logika domain
  components/             # UI kit, shell, quiz, flashcards, games, providers
  content/                # materi statis + katalog kurikulum + validator
  lib/                    # tipe, domain murni, engine, adapter browser
  server/                 # SQLite + service progres + helper HTTP
scripts/                  # verifikasi API/UI + info DB
```

File Fase 2 yang ditambahkan:

- `src/content/curriculum.ts` — katalog turunan;
- `src/lib/content-validation.ts` — validator integritas;
- `src/content/curriculum.test.ts` — tes katalog;
- tipe domain tambahan di `src/lib/types.ts`;
- `KANJI_BY_ID` di `src/content/kanji.ts`.

File Fase 5 yang ditambahkan/diperbarui:

- `src/lib/exercise-engine.ts` + `.test.ts` — penilaian, normalisasi, attempt, RNG;
- `src/lib/exercise-catalog.ts` + `.test.ts` — katalog stabil + sesi adaptif;
- `src/components/exercise-card.tsx` dan `exercise-runner.tsx` — UI 9 jenis;
- `src/app/api/progress/quiz/route.ts` — endpoint attempt;
- `quiz_attempts` dan `question_stats` di `src/server/db.ts`, `recordQuizAttempt` di service;
- pembaruan `flashcards.tsx`, `lesson-practice.tsx`, halaman practice/vocabulary/exams/reading/listening, dan `progress/page.tsx`.

File Fase 6 yang ditambahkan/diperbarui:

- `src/lib/games/shared.ts`, `morae.ts`, `word-builder.ts`, `kana-matching.ts`, `vocabulary-rush.ts`, `sentence-challenge.ts`, `kanji-challenge.ts`, `daily-challenge.ts`, `registry.ts`;
- enam file tes domain di `src/lib/games/` (35 tes);
- `src/components/games/game-kit.tsx`, `mcq-game.tsx`, `games-hub.tsx`, dan enam komponen permainan;
- `src/app/games/page.tsx` sebagai server component dengan deep link tervalidasi;
- `src/app/api/progress/game/route.ts`, `recordGame/readGames` di service, tabel `game_attempts`;
- pembaruan `types.ts`, `progress-defaults.ts`, `achievements.ts`, `progress/page.tsx`; empat komponen game lama dihapus.

Tidak ada dependensi baru. Skema bertambah satu tabel (total 10) dan snapshot bertambah koleksi `games` + empat statistik permainan.

File Fase 7 yang ditambahkan/diperbarui:

- `src/lib/speech.ts` — registry `SpeechProvider`, `speakDetailed()`, timeout, alasan kegagalan, `describeSpeechFailure()`; `speak()` tetap kompatibel;
- `src/lib/speech-recognition.ts` + `.test.ts` — deteksi API, normalisasi teks, Levenshtein, pesan galat;
- `src/lib/use-speech-recognition.ts` — sesi pengenalan suara, batas 15 detik, status izin;
- `src/components/speech-recognition-panel.tsx` — panel opsional + disclosure privasi + fallback;
- `src/content/pronunciation-guide.ts`, `src/components/pronunciation-guide.tsx` — enam topik bunyi;
- `src/content/listening-drills.ts` + `.test.ts` — 15 drill orisinal (3 per level);
- `src/app/listening/practice/page.tsx` — latihan menyimak kilat;
- `src/lib/exercise-catalog.ts` — `listeningDrillExercises()`, integrasi ke `listeningExercises()`;
- `src/app/pronunciation/page.tsx` — panduan, perekam 30 detik, hapus rekaman, panel ASR;
- `src/app/listening/page.tsx` — statistik dan CTA drill;
- `src/components/japanese.tsx`, `src/components/listening-player.tsx` — umpan balik kegagalan audio dan token urutan.

Tidak ada tabel/endpoint baru. Attempt drill memakai `quiz_attempts`; rekaman dan transkrip tidak dipersistensikan.

File Fase 8 yang ditambahkan/diperbarui:

- `src/lib/exam-engine.ts` + `.test.ts` — empat builder mode, penilaian, analitik, rekomendasi, retry, adaptor payload;
- `src/lib/exam-storage.ts` — kertas aktif dan hasil di `sessionStorage`;
- `src/components/exam-question-card.tsx`, `src/components/add-to-cards.tsx`;
- `src/app/exams/page.tsx` (hub), `src/app/exams/session/page.tsx`, `src/app/exams/result/page.tsx`;
- `src/app/api/progress/card/route.ts` + `addCard()` di `src/server/progress-service.ts`;
- `AddCardPayload` di `types.ts`, `api-client.ts`, dan `progress-provider.tsx`;
- `src/server/progress-service.test.ts` — tes addCard idempoten/validasi katalog;
- `scripts/verify-ui.cjs` — 23 rute; label target di `src/app/progress/page.tsx`.

Tidak ada dependensi baru. Tidak ada tabel/kolom baru; satu endpoint baru (`/api/progress/card`). Mode/judul ujian belum dipersistensikan, hanya ringkasan hasil.

File Fase 9 yang ditambahkan/diperbarui:

- `src/content/culture/shared.ts` — pabrik artikel, registry 11 sumber, `buildCultureQuiz()`, catatan orisinalitas;
- `src/content/culture/extra-{budaya,makanan,geografi,sejarah,anime,bahasa}.ts`, `src/content/culture/extras.ts`, dan `src/content/culture.ts` — 33 artikel;
- `src/lib/culture-facts.ts` + `.test.ts` — 132 fakta, hash FNV-1a, fakta harian deterministik;
- `src/components/culture-quiz.tsx` — kuis 2 soal per artikel tanpa XP;
- `src/app/culture/page.tsx`, `src/app/culture/[id]/page.tsx` — penemuan, pencarian, filter grup/favorit, fakta harian/acak, detail dan sumber;
- `src/app/api/progress/favorite/route.ts`, `toggleCultureFavorite()`/`readFavorites()` di service, tabel `culture_favorites` di `src/server/db.ts`;
- `CultureGroup`/`CultureSource`/`CultureQuizQuestion`/`CultureFavorite` di `types.ts`, label register baru di `constants.ts`, dan `favorites` di snapshot;
- `src/app/vocabulary/page.tsx` — parameter `q` dan `topic` dari tautan kosakata budaya;
- `src/content/content.test.ts`, `src/lib/culture-facts.test.ts`, `src/content/curriculum.ts` — validasi dan estimasi menit artikel.

Skema bertambah satu tabel (total 11) dan satu endpoint (total 16). Tidak ada dependensi baru.

File Fase 10 yang ditambahkan/diperbarui:

- `src/lib/types.ts`, `src/lib/constants.ts` — empat target baru, tipe `SavedItem`/`SavedCollection`, snapshot `savedItems`/`savedCollections`;
- `src/server/db.ts` — tabel `saved_items` dan `saved_collections` + index, total 13 tabel;
- `src/server/progress-service.ts`, `src/app/api/progress/saved/route.ts`, `src/app/api/progress/collections/route.ts` — validasi, simpan/hapus, ikut ekspor/impor/reset;
- `src/lib/goals.ts`, `streak.ts`, `history.ts`, `recommendations.ts`, `achievements.ts` + tes masing-masing — target, streak, kalender/tren/timeline, saran explainable, 21 pencapaian;
- `src/components/goal-progress.tsx`, `study-calendar.tsx`, `recommendations.tsx`, `saved-item-editor.tsx` — UI personalisasi;
- `src/app/page.tsx`, `src/app/progress/page.tsx`, `src/app/settings/page.tsx` — ringkasan belajar, target, kalender, tren, timeline, 21 pencapaian, kontrol target;
- `src/app/dictionary/page.tsx`, `src/app/dictionary/collections/page.tsx` — simpan/catatan/koleksi/ulasan;
- `src/app/grammar/[id]/page.tsx`, `src/app/vocabulary/page.tsx`, `src/app/kanji/page.tsx` — tombol/editor simpan materi;
- `src/lib/goals.test.ts`, `streak.test.ts`, `history.test.ts`, `recommendations.test.ts`, `achievements.test.ts` — 20 tes baru;
- `scripts/verify-ui.cjs` — 24 rute saat Fase 10, menjadi 29 setelah Fase 11.

Skema bertambah dua tabel (total 13) dan dua endpoint (total 18). Tidak ada dependensi baru.

File Fase 11 yang ditambahkan/diperbarui:

- src/lib/types.ts — ConversationLine/Choice/Step/Phrase/Scenario, Settings.studyTargetLevel/studyTargetWeeks, LessonProgressKind typing/conversation;
- src/lib/constants.ts — NAV_GROUPS 13 tujuan, DEFAULT_SETTINGS target rencana, STUDY_TARGET_WEEK_OPTIONS (8/12/16/24/36), XP_RULES lesson typing/conversation 20;
- src/lib/study-plan.ts + study-plan.test.ts — perencana deterministik, feasibility, milestone;
- src/lib/typing.ts + typing.test.ts — tiga mode, normalisasi/alias romaji, sesi deterministik, akurasi;
- src/content/conversations.ts + conversations.test.ts — 6 skenario / 19 langkah / 18 frasa, validasi satu jawaban benar per langkah;
- src/app/plan/page.tsx, src/app/typing/page.tsx, src/app/conversation/page.tsx, src/app/conversation/[id]/page.tsx — UI baru;
- src/lib/learning.ts, src/components/icons.tsx — label/ikon typing dan conversation;
- src/server/progress-service.ts — normalisasi studyTargetLevel/studyTargetWeeks dan whitelist kind typing/conversation;
- src/app/dictionary/page.tsx — kosakata terkait dan kanji beradikal sama;
- scripts/verify-ui.cjs — 29 pola rute.

Tidak ada tabel/endpoint baru pada Fase 11. Total tetap 13 tabel dan 18 route API.

File Fase 12 yang ditambahkan/diperbarui:

- `src/proxy.ts` — Host allowlist loopback (421);
- `src/server/http.ts` + `http.test.ts` — `ClientError`, validasi JSON + same-origin, batas body 5 MiB, sanitasi error/status;
- `next.config.ts`, `package.json` — CSP dan header keamanan, bind 127.0.0.1, body proxy 6 MB, `poweredByHeader: false`;
- `src/server/db.ts`, `src/app/api/health/route.ts` — izin 0700/0600, transaksi `BEGIN IMMEDIATE`, health minimal;
- route API progres + `src/server/progress-service.ts` + `src/app/settings/page.tsx` — validasi impor, batas array, konfirmasi pratinjau, error status, sanitasi;
- `src/app/layout.tsx`, `src/app/globals.css` — Google Fonts dihapus, stack font sistem, token kontras gelap, scroll padding mobile, reduced motion;
- `src/components/app-shell.tsx`, `ui.tsx`, `exercise-runner.tsx`, `listening-player.tsx`, `exam-question-card.tsx`, `culture-quiz.tsx`, `flashcards.tsx`, `games-hub.tsx` — fokus dialog/soal, label/aria, heading, live region, proteksi rating ganda, code splitting permainan;
- `src/lib/theme.ts` + `theme.test.ts`, `providers/progress-provider.tsx` — prioritas tema lokal eksplisit vs server sistem;
- `src/content/grammar.ts`, `reading.ts`, `vocabulary.ts`, `kana.ts`, `kanji.ts`, `conversations.ts`, `lessons/sentence.ts`, `culture/extra-*.ts` — 21+ koreksi konten Jepang dan konsistensi terjemahan;
- `scripts/verify-ui.cjs`, `scripts/verify-api.mjs` — smoke 29 rute dan alur API terisolasi.

Tidak ada tabel/kolom/endpoint baru pada Fase 12. Total tetap 13 tabel dan 18 route API. Tidak ada dependensi baru.

File Fase 13 yang ditambahkan/diperbarui:

- `src/content/lessons/reading.ts`, `src/content/lessons/listening.ts` — delapan LessonPlan N5 dari bacaan/dialog yang sudah ada;
- `src/content/lessons/index.ts`, `src/content/lessons.test.ts` — registrasi 70 rencana, delapan jalur N5, pemeriksaan ID;
- `src/lib/types.ts`, `src/components/lesson-blocks.tsx` — blok `jp-prose` dan `dialog`; renderer sadar furigana dan `lang=ja`;
- `src/lib/content-qa.ts`, `src/lib/content-qa.test.ts` — validator opsi duplikat, kunci jawaban, dan bank soal;
- `scripts/backup-db.mjs`, `src/lib/backup-db.test.ts` — backup/verify/restore/retensi SQLite;
- `.github/workflows/quality.yml`, `CHANGELOG.md` — quality gate dan riwayat rilis;
- `src/app/{page,vocabulary,exams,settings}.tsx`, `src/components/ui.tsx`, `src/app/globals.css` — perbaikan reflow 320 px dan label/aria;
- `src/components/{kana,kanji,study-calendar,heatmap,lesson-blocks}*` — label mastery, status non-warna, dan `lang=ja`.

Tidak ada tabel/kolom/endpoint baru pada Fase 13. Total tetap 13 tabel dan 18 route API.

File Fase 14–16 yang ditambahkan/diperbarui:

- Fase 14: `ENHANCED_LEARNING_FEATURES_SPEC.md`, `ENHANCED_FEATURES_ARCHITECTURE.md`, `ENHANCED_FEATURES_ROADMAP.md`, `ENHANCED_FEATURES_STATUS.md`, `CONCERNS_BACKLOG.md` (v1.2), ADR-050–054; tidak ada kode/tabel/endpoint/aset baru;
- Fase 14B: `src/app/progress/page.tsx` (grid `minmax(0,1fr)` + `min-w-0`), `src/components/ui.tsx` (StatTile tanpa truncate), `src/app/plan/page.tsx`, `src/app/typing/page.tsx`, `src/app/settings/page.tsx`, `src/app/page.tsx`, `src/components/listening-player.tsx`, `src/app/kana/page.tsx`, `src/lib/types.ts` (blok `jp-prose`/`dialog` sudah ada), `MOBILE_COMPATIBILITY_REPORT.md`; tidak ada tabel/endpoint baru;
- Fase 16: `src/lib/audio-player.ts` + `.test.ts`, `src/components/audio.tsx`, `src/app/audio/page.tsx`, `src/lib/furigana.ts`/`furigana.tsx` + tes, `src/components/japanese.tsx`, `src/components/listening-player.tsx`, `src/app/{reading,conversation,listening,pronunciation}/**`, `src/components/app-shell.tsx` (`stopAudio`), `src/app/settings/page.tsx` (kecepatan/voice), `src/server/progress-service.ts` (clamp 1,5), `src/lib/speech.ts`, `src/lib/constants.ts` (nav 14), dan `scripts/verify-ui.cjs` (30 pola);
- Fase 17: `scripts/import-kanjivg.mjs`, `public/writing/kanjivg/*.json` + manifest, `src/content/writing-strokes.ts`, `src/content/writing-notes.ts`, `src/lib/writing.ts` + `.test.ts`, `src/lib/writing-geometry.ts` + `.test.ts`, `src/components/writing/*`, `src/app/writing/page.tsx`, `src/app/writing/[id]/page.tsx`, `src/app/api/progress/writing/route.ts`, `src/server/db.ts` (tabel `writing_attempts` + index), `src/server/progress-service.ts` (recordWriting/readWriting/import), `src/lib/{types,constants,progress-defaults,api-client,achievements}.ts`, `src/components/providers/progress-provider.tsx`, `src/components/icons.tsx`, `src/app/{page,kana,kanji,globals.css}` terkait, `src/components/{kana,kanji}` tautan ke writing, `THIRD_PARTY_NOTICES.md`, `public/licenses/kanjivg-CC-BY-SA-3.0.txt`, `public/writing/kanjivg/README.txt`, dan `scripts/verify-ui.cjs` (32 pola).

- Fase 18: `src/lib/types.ts` (Story, StoryScene, StoryCharacter, StoryLine, StoryQuestion, StoryAttempt, StoryPayload), `src/content/stories.ts` + `stories.test.ts`, `src/components/story/story-stage.tsx`, `src/components/story/story-theater.tsx`, `src/app/stories/page.tsx`, `src/app/stories/[id]/page.tsx`, `src/app/api/progress/story/route.ts`, `src/server/db.ts` (tabel `story_attempts` + index), `src/server/progress-service.ts` (readStories/recordStory/import/reset), `src/lib/{constants,progress-defaults,api-client,achievements}.ts`, `src/components/providers/progress-provider.tsx`, `src/components/icons.tsx`, `src/app/{page,globals.css}` terkait, `scripts/verify-ui.cjs` (34 pola), serta dokumentasi Fase 18;
- Fase 19: `src/lib/writing-links.ts` + `writing-links.test.ts`, `src/components/lesson-player.tsx` (tombol Latihan menulis), `src/content/lessons/kanji.ts` (koreksi salinan urutan goresan), `src/lib/writing.test.ts` (tautan kana/kanji), `package.json` tidak berubah dependensi, serta dokumentasi Fase 19; tidak ada tabel/endpoint baru.

Fase 14–16 tidak menambah tabel/endpoint. Fase 17 menambahkan tabel ke-14 `writing_attempts` dan endpoint ke-19; Fase 18 menambahkan tabel ke-15 `story_attempts` dan endpoint ke-20. Total menjadi **15 tabel dan 20 route API**.

---

## 15. Risiko dan batas yang diketahui

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| `node:sqlite` masih eksperimental | API dapat berubah di Node baru | Pin Node >= 22.5; pantau rilis; pertimbangkan driver alternatif jika perlu |
| SQLite satu file, satu proses | Tidak cocok untuk multi-instance | Tetap monolith; migrasi ke Postgres saat sync multi-pengguna |
| Konten statis tumbuh besar | Bundle awal membesar | Pisahkan per jenis/level bila perlu; code splitting; tetap validasi saat build |
| Tidak ada auth | Siapa pun dengan akses file dapat melihat progres | Aplikasi lokal; auth menjadi prasyarat deployment publik |
| Keamanan lokal bukan keamanan publik | Loopback/Host allowlist/JSON same-origin mengurangi CSRF/rebinding, tetapi tidak menggantikan auth/TLS/rate limit | Jangan ekspos port; gunakan reverse proxy dengan TLS + auth; selesaikan seam ADR-016 sebelum publik |
| Katalog konten masuk bundle klien | Chunk VOCABULARY/KANJI/GRAMMAR ~33 KiB gzip di banyak rute | Batasi data per rute; pertimbangkan server component/endpoint katalog; ukur ulang sebelum refaktor besar |
| Tidak ada font web | Rendering Jepang bergantung perangkat; bentuk kanji dapat berbeda | Stack sistem Jepang + fallback; jangan klaim tampilan identik; self-host subset hanya jika perlu |
| CI ada, E2E/axe belum | Regresi alur browser dan a11y masih bergantung audit manual | CI menjalankan check/build/audit; tambahkan E2E/axe bertahap setelah stabil |
| Reflow 320 px | Perangkat kecil dapat terpotong | Diuji ulang dan diperbaiki di empat rute utama; uji 320 px dipertahankan sebagai probe rilis |
| Validator semantik terbatas | Tidak menangkap semua ambiguitas bahasa | Validator menangkap duplikat/kunci/struktur; review manusia tetap diperlukan |
| TTS perangkat | Pelafalan bisa tidak tersedia | Studio memakai hanya voice `ja-JP`; bila tidak ada, tampilkan status dan jangan memakai voice lain; jangan mengklaim audio selalu ada |
| Tidak ada aset audio statis | Perangkat tanpa TTS tidak dapat mendengar materi | Transcript/latihan tertulis tetap tersedia; aset rekaman/Open JTalk tetap seam opsional yang belum di-deploy |
| Verifikasi voice memakai mock | Perilaku perangkat nyata dapat berbeda | Uji perangkat fisik sebelum mengklaim kualitas; catat mock di laporan |
| Cerita hanya 3 judul | Cakupan level dan variasi terbatas | Katalog bertipe siap ditambah; jangan klaim cakupan N3–N1 |
| Sinkronisasi audio cerita per baris | Tidak ada sorotan per kata | Gunakan level baris; timing metadata hanya untuk aset rekaman di masa depan |
| Video cerita hanya seam | `videoUrl` belum diuji dengan aset nyata | Jangan aktifkan video tanpa pipeline aset/CMS, lisensi, dan pengujian fallback |
| Tidak ada resume cerita | Menutup tab mengulang dari awal | Attempt tersimpan; checkpoint posisi baris adalah backlog UX-17 |
| ASR hanya di sebagian browser | Fitur tidak tersedia / hasil teks salah | Deteksi API, fallback perekam manual, label "perbandingan teks" |
| Privasi ASR | Browser dapat mengirim audio ke vendor | Disclosure di panel; Kotoba tidak menyimpan audio/transkrip |
| Perbandingan teks bukan akustik | Pitch/panjang vokal tidak terukur | Jangan tampilkan skor pelafalan; panduan pitch hanya kesadaran |
| Rekaman lokal hilang saat tab ditutup | Tidak ada riwayat audio | Batas 30 detik; ekspor tidak menyertakan audio |
| Engine ujian vs legacy `buildExam` | Dua jalur bisa menyimpang | UI hanya memakai `exam-engine.ts`; `buildExam()` dipertahankan untuk tes kompatibilitas dan dijadwalkan dihapus |
| Sesi ujian di `sessionStorage` | Menutup tab menghapus kertas aktif dan hasil terakhir | Timer dipulihkan dari `startedAt`; riwayat ringkasan tetap di SQLite; tambahkan resume berbasis server pada fase berikutnya |
| Skor ujian dinilai di klien | Skor dapat dimanipulasi | Server menyimpan hasil untuk latihan, bukan sertifikasi; jangan gunakan sebagai penilaian resmi |
| Fallback lintas level | N3–N1 dapat memuat soal level lain | `mixedLevels` ditampilkan di hub; tambah konten per level |
| Statistik dari sumber campuran | `totalReviews` dari activity, `correctReviews` dari log; `questionStats` dari klien | Dokumentasikan; beri label; verifikasi jawaban server-side sebelum deployment publik |
| Penilaian latihan di klien | Skor/benar dapat dimanipulasi | Server menghitung ulang agregat; tambahkan kunci jawaban server-side untuk anti-cheat |
| Penilaian permainan di klien | Attempt/benar dapat dimanipulasi | Server memvalidasi bentuk dan menghitung ulang akurasi/XP; bukan anti-cheat |
| Validasi kata hanya pada kamus | Kata sah di luar 214 kosakata ditolak | Jelaskan cakupan; perluas dataset atau tambahkan kamus validasi lebih besar |
| Bobot adaptif heuristik | Prioritas tidak optimal | Parameter terpusat + tes; kalibrasi setelah ada data nyata |
| Hanya N5 yang punya LessonPlan | N4–N1 memakai alur materi lama | Tulis rencana per level dengan validator sebelum mengklaim jalur lengkap |
| Tanggal lokal server vs browser | Target/streak dapat berbeda di lintas zona waktu | Dokumentasikan batas satu mesin; simpan timezone profil atau kirim tanggal lokal klien yang tervalidasi |
| Target dihitung surut dari data | Mengubah target langsung mengubah progres hari ini | Disengaja; target adalah alat bantu, bukan histori imutabel |
| Snapshot membatasi riwayat | Rekomendasi/tren lama hilang dari UI | Tampilkan batas; tambahkan endpoint pagination bila analitik jangka panjang dibutuhkan |
| Ulasan kamus pribadi bukan SRS | Pengguna dapat mengira sudah dijadwalkan | Label eksplisit “ulasan mandiri, tidak mengubah jadwal SRS” |
| Mode mengetik IME | Perangkat tanpa IME tidak dapat menyelesaikan Romaji→Kana/Arti→Kanji | Mode Kana→Romaji tersedia tanpa IME; UI menjelaskan kebutuhan IME |
| Rencana memakai estimasi | Jadwal bisa terasa terlalu padat/ringan | Tampilkan feasibility + saran minggu; rencana dihitung ulang, bukan janji |
| Percakapan bukan AI | Variasi jawaban terbatas pada pilihan | Nyatakan sebagai latihan konteks; pilihan salah tetap gramatikal dan diberi alasan |
| Evaluasi menulis adalah geometri | Skor dapat berbeda karena posisi/ukuran; bukan pengenalan tulisan tangan | Label “perkiraan geometri”, tampilkan rincian goresan, jangan gunakan untuk sertifikasi/anti-cheat |
| Data KanjiVG CC BY-SA | Distribusi turunan wajib atribusi dan share-alike | Pertahankan THIRD_PARTY_NOTICES, lisensi, tautan sumber; jangan mengklaim kepemilikan data goresan |
| Snapshot writing dibatasi 400 | Riwayat lama tidak tampil walau tersimpan | Tampilkan batas; tambahkan pagination/endpoint riwayat bila dibutuhkan |
| Stylus/perangkat fisik belum diuji | Latensi/tekanan dapat berbeda dari emulasi | Uji iOS/Android/stylus sebelum klaim kualitas menulis; catat batas |
| Audit mobile hanya emulasi | Perangkat fisik/iOS Safari dapat berperilaku berbeda | Uji perangkat nyata sebelum klaim kompatibilitas penuh; catat batas di laporan |
| CMS dan pipeline aset video tidak ada | Teater cerita ada, tetapi tidak dapat ditambah/diubah lewat CMS; seam `videoUrl` belum punya aset atau pipeline | Jangan klaim CMS/video tersedia; CMS tetap blocked, story sudah berjalan dengan SVG/CSS |
| Studio audio belum punya aset rekaman | Kualitas/voice tidak seragam; perangkat tanpa voice tidak berbunyi | Status jujur, transkrip, dan latihan tertulis; aset/manifest hanya setelah lisensi dan verifikasi |

---

## 16. Ringkasan keputusan

1. Modular monolith Next.js + SQLite; bukan microservice/cloud.
2. Konten statis bertipe + katalog turunan; bukan CMS/database konten.
3. Server otoritatif; localStorage hanya cache baca.
4. Domain murni untuk SRS/XP/penilaian latihan; komponen tidak menyimpan rumus.
5. Sembilan jenis latihan berbagi satu `ExerciseRunner`/`gradeExercise`; flashcard terpisah karena alur SRS-nya berbeda.
6. Pelajaran interaktif memakai LessonPlan deklaratif + pemain enam langkah; N5 lebih dulu.
7. Latihan adaptif memakai bobot aturan yang dapat diuji; attempt dan statistik soal disimpan di SQLite.
8. Enam permainan memakai domain murni + registry; pembuat kata divalidasi kamus; attempt permainan disimpan server-side.
9. Audio memakai registry provider dengan browser TTS sebagai default; kegagalan pemutaran dilaporkan, bukan ditelan.
10. Pelafalan memakai rekaman lokal + panduan bunyi; ASR opsional hanya membandingkan transkrip, bukan menilai akustik.
11. Latihan menyimak memakai 15 drill bertipe yang dipetakan ke engine latihan; tidak ada tabel baru.
12. Ujian memakai satu engine empat mode dengan target belajar 70%, bukan ambang JLPT resmi; sesi/hasil di `sessionStorage`, ringkasan di SQLite.
13. Kartu dari hasil ujian ditambahkan lewat endpoint idempoten tanpa XP, bukan lewat `recordReview`.
14. Auth/sync disiapkan lewat seam `user_id`/sesi, belum diimplementasikan.
15. Validasi konten adalah bagian dari build/test, bukan opsional.
16. Target personal disimpan di settings dan progresnya diturunkan dari activity/review/lesson; tidak ada tabel target.
17. Kamus pribadi memakai `saved_items`/`saved_collections`, terpisah dari SRS dan tanpa XP.
18. Rekomendasi adalah aturan deterministik yang menampilkan alasan dan bukti; bukan ML atau data eksternal.
19. Skenario percakapan adalah konten bertipe dengan register dan umpan balik konteks; bukan AI dan tanpa tabel baru.
20. Latihan mengetik memeriksa jawaban di browser dengan alias romaji eksplisit; tidak mengunggah ketikan.
21. Rencana belajar diproyeksikan ulang dari katalog/progres/settings; tidak disimpan sebagai tabel tugas dan bukan prediksi JLPT.
22. Menulis memakai KanjiVG terpin dan terverifikasi; komponen kanji yang tidak tersedia tetap tidak dikarang.
23. Fase 12 memilih batas keamanan lokal (loopback, Host allowlist, JSON + same-origin, batas body, header) alih-alih auth setengah jadi; deployment publik tetap diblokir sampai auth/TLS.
24. Temuan konten diperbaiki sebagai koreksi linguistik, bukan penambahan materi; soal ambigu/berkunci ganda dihilangkan dan gaya romanisasi dicatat sebagai batasan.
25. Font web pihak ketiga dihapus; Kotoba memakai stack sistem agar offline, tanpa permintaan ke Google, dan tanpa dead weight Noto Serif.
26. Impor tetap mengganti seluruh progres, tetapi hanya setelah pratinjau eksplisit dan validasi; bukan merge, dan bukan pengganti backup.
27. Concern lintas fase dilacak di CONCERNS_BACKLOG.md dengan ID stabil, status, prioritas, dan pemicu; ACCEPTED bukan berarti sudah diimplementasikan.
28. Fase 13 memilih konsolidasi terkontrol: backup/restore, delapan LessonPlan N5, validator semantik, CI, reflow 320 px, dan label a11y; N4/N3–N1 tetap jalur konten P0 terpisah, sedangkan E2E/axe dan Git ditunda dengan alasan tertulis. Fase 14 hanya audit/perencanaan fitur audio, menulis, dan cerita.
29. Backup memakai `VACUUM INTO` + `PRAGMA integrity_check`, retensi terbatas, dan restore eksplisit `--yes`; bukan pengganti auth atau backup off-site.
30. LessonPlan membaca/menyimak memakai konten yang sudah diaudit dan blok render baru, sehingga tidak menduplikasi teks atau membuat klaim linguistik baru.
31. Fase 14B memilih audit dan perbaikan terarah pada aplikasi learner yang ada, bukan redesign; CMS, menulis, dan cerita tidak dibuat hanya agar dapat diaudit.
32. Verifikasi mobile memakai Chromium teremulasi dan diakui sebagai bukti terbatas; perangkat fisik, pembaca layar, dan alur kamera/file picker belum diuji.
33. Audio memakai Web Speech `ja-JP` sebagai mesin utama dengan satu pemutar global; voice non-Jepang tidak pernah dipakai sebagai fallback dan ketersediaan voice dilaporkan secara jujur.
34. Studio audio tidak menyimpan atau menghasilkan aset MP3, tidak memberi skor akustik, dan tidak mengklaim kualitas native; verifikasi memakai mock voice saat perangkat tidak punya voice Jepang.
35. Fase 15 CMS diblokir karena tidak ada CMS/admin/content API di repositori; jangan membangun CMS atau mengklaim perluasannya tanpa lokasi/otorisasi eksplisit.
36. Writing memakai KanjiVG commit terpin, konversi JSON per glyph, dan komponen yōon berurutan; data adalah turunan CC BY-SA 3.0 dengan atribusi wajib, bukan gambar ulang.
37. Progres menulis memakai tabel khusus `writing_attempts` (bukan tabel lesson) dengan XP 15 pada attempt pertama per karakter dan snapshot 400 attempt.
38. Skor menulis adalah perkiraan geometri jalur—bukan pengenalan tulisan tangan, penilaian estetika, atau sertifikasi; UI menampilkan rincian dan disclaimer.
39. Teater cerita memakai konten TypeScript bertipe dan panggung SVG/CSS generik; tidak ada CMS, video wajib, atau AI video. `StoryScene.videoUrl` disediakan sebagai seam same-origin opsional dengan fallback SVG.
40. Progres cerita memakai tabel khusus `story_attempts` (bukan lesson), XP 25 hanya pada penyelesaian pertama, skor ≥60 dihitung selesai untuk statistik, snapshot 300, impor 1.000.
41. Integrasi audio cerita jujur: hanya voice `ja-JP`; voice per karakter hanya bila ≥2 voice tersedia; sorotan per baris, bukan per kata; tidak ada klaim kualitas native atau video export.
42. Fase 19 memilih stabilisasi, bukan penambahan fitur: helper `writingHrefForContentRef` menjaga katalog menulis yang berat tetap di luar bundle pelajaran, salinan goresan yang menyesatkan dikoreksi, dan regresi 102 rute memperkuat integrasi audio/menulis/cerita. CMS dan pipeline video tetap tidak dibuat; pengukuran transfer ~500 KB JS mencakup prefetch Next.js dan tidak boleh disebut seluruh dataset dimuat di halaman awal.

Keputusan rinci dan alasannya ada di [DECISIONS.md](DECISIONS.md) (ADR-016 sampai ADR-063). Rencana fitur lanjutan dan batas CMS/video ada di [ENHANCED_FEATURES_ARCHITECTURE.md](ENHANCED_FEATURES_ARCHITECTURE.md).
