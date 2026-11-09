# Status Proyek — Kotoba 言葉

**Versi aplikasi:** 0.1.0 (UI/UX + kurikulum N5 + mesin latihan + permainan + pelafalan & menyimak + mesin ujian + budaya & penemuan + personalisasi + latihan produksi & perencanaan + audit produksi + konsolidasi lintas fase + perencanaan fitur lanjutan + audit kompatibilitas mobile + studio audio + studio menulis + teater cerita + stabilisasi integrasi)  
**Fase saat ini:** 19 — Integration, QA, Performance & Accessibility (selesai; Fase 15 CMS tetap blocked karena repositori tidak memiliki CMS)  
**Terakhir diperbarui:** 2026-11-09  
**Lokasi proyek:** /home/akihira17/personal/kotoba

---

## 1. Ringkasan status

Kotoba 0.1.0 adalah aplikasi full-stack yang berjalan, bukan prototipe tampilan. Aplikasi memiliki 34 pola rute pengguna yang diuji (termasuk rute detail pelajaran, percakapan, `/audio`, `/writing`, `/stories`, dan detail cerita), 20 route API, 15 tabel SQLite, mesin SRS, latihan adaptif sembilan jenis, enam permainan edukatif, empat mode ujian, simulasi percakapan, latihan mengetik, rencana belajar personal, dan konten orisinal Jepang–Indonesia. Fase 12 mengaudit seluruh alur, konten Jepang, keamanan, aksesibilitas, dan performa; temuan blocker/high yang dapat diperbaiki tanpa auth sudah ditutup. Fase 13 mengonsolidasikan 86 concern lintas fase, menutup 11 item yang paling menutup risiko, dan menunda sisanya dengan pemicu tertulis; autentikasi tetap prasyarat deployment publik. Fase 14 mengaudit tiga fitur yang diminta — Audio & Pronunciation Studio, Handwriting & Stroke Order Studio, dan Story & Conversation Animation Player — serta menyusun rencana Fase 15–19; tidak ada kode fitur, tabel, endpoint, atau aset baru pada fase ini. Fase 14B mengaudit kompatibilitas mobile 29 rute learner pada sembilan viewport (261 pemuatan), memperbaiki overflow `/progress`, pemotongan label, target sentuh, transkrip menyimak, dan beberapa grid; CMS/admin, kanvas menulis, serta story theater tidak tersedia sehingga tidak dapat diaudit. Fase 15 (permintaan perluasan CMS) diblokir karena tidak ada CMS/admin, API konten admin, atau tabel konten di repositori; tidak ada implementasi yang dilakukan. Fase 16 mengimplementasikan **Studio audio** untuk kana, kosakata, kanji, tata bahasa, bacaan, dan percakapan memakai Web Speech API `ja-JP` dengan kontrol play/pause/resume/stop/repeat/kecepatan/voice, diagnostik voice jujur, penolakan voice non-Jepang, serta fallback tanpa klaim MP3 atau skor akustik. Fase 16 tidak menambah tabel/endpoint. Fase 17 mengimplementasikan **Studio menulis** dengan data KanjiVG terpin: 319 entri (208 kana + 111 kanji), 259 glyph unik, animasi urutan goresan, kanvas tirukan/mandiri, evaluasi geometri yang jujur, serta progres tersimpan di tabel `writing_attempts`. Fase 17 menambah satu tabel dan satu endpoint, sehingga saat itu menjadi 32 pola rute, 19 route API, dan 14 tabel SQLite. Fase 18 mengimplementasikan **Teater cerita** dengan tiga cerita orisinal, sembilan adegan, 36 baris dialog, dan sembilan soal; panggung SVG/CSS, mode belajar/tonton, kontrol subtitle/furigana/romaji/terjemahan, integrasi audio `ja-JP`, kamus kosakata, kuis, dan progres di tabel `story_attempts`. Fase 18 tidak menambah tabel konten atau CMS; total kini **34 pola rute, 20 route API, dan 15 tabel SQLite**. Fase 19 menstabilkan integrasi tanpa menambah fitur: pelajaran kana/kanji menaut ke Studio Menulis, salinan urutan goresan yang usang dikoreksi, dan regresi 34 rute × tiga viewport (102 pemeriksaan) plus enam perjalanan kritis lulus tanpa error. CMS dan pipeline video tetap tidak dibuat.

Fase 1 menghasilkan spesifikasi produk dan audit. Fase 2 menghasilkan arsitektur, model data, tipe domain, dan katalog kurikulum turunan. Fase 3 menyatukan semuanya menjadi pengalaman aplikasi yang koheren dengan 10 navigasi utama (kini 16 setelah Fase 18). Fase 4 menambahkan mesin pelajaran interaktif dan jalur N5. Fase 5 menyatukan kuis ke satu engine latihan adaptif. Fase 6 menambahkan enam permainan belajar yang benar-benar berfungsi dan tercatat. Fase 7 menambahkan lapisan audio yang dapat diganti, latihan pelafalan dengan rekaman lokal, pengenalan suara opsional, panduan bunyi Jepang, dan 15 drill menyimak bertingkat. Fase 8 menambahkan mesin ujian reusable dengan empat mode, penanda soal, analitik kelemahan, pembahasan, ulang soal salah, dan penambahan kosakata/kanji ke kartu ulangan. Fase 9 menambahkan penemuan budaya terkurasi: 33 artikel dalam enam kelompok, 132 fakta, fakta harian, favorit persisten, kuis mini, rujukan sumber, kosakata terkait, dan materi belajar terkait. **Fase 10 menambahkan lapisan personalisasi: dasbor ringkasan belajar, empat target harian + frekuensi mingguan, streak/kalender lokal, 21 pencapaian, rekomendasi yang menjelaskan alasan & bukti data, kamus pribadi dengan catatan dan koleksi, serta riwayat/tren belajar. Fase 11 mengevaluasi sembilan kandidat fitur lanjutan, lalu menambahkan tiga fitur bernilai tinggi—simulasi percakapan, latihan mengetik Jepang, dan rencana belajar personal—serta penguatan kamus/kanji dengan kosakata terkait dan kanji beradikal sama. Fitur menulis/urutan goresan, offline penuh, halaman resource, dan ekspansi bacaan sengaja ditunda dengan alasan yang dicatat. Fase 12 menutup audit kualitas menyeluruh: keamanan lokal, koreksi konten Jepang, aksesibilitas, font sistem, dan verifikasi ulang alur produksi. Fase 13 melakukan retrospektif lintas fase: delapan materi N5 membaca/menyimak menjadi pelajaran enam langkah, validator QA semantik ditambahkan, CLI backup/restore SQLite diuji, CI quality gate dibuat, reflow 320 px diperbaiki, dan status setiap concern dipetakan.**

Enam permainan Fase 6:

- Pembuat kata dari ubin kana, divalidasi terhadap kamus — bukan rangkaian kana acak;
- Cocokkan kana (hiragana/katakana) dengan romaji, arti, atau audio;
- Kejar kosakata dengan batas waktu dan combo;
- Susun kalimat dengan validasi partikel/urutan dan penjelasan;
- Tantangan kanji (arti, bacaan, pemakaian dalam kata);
- Tantangan harian deterministik yang mencampur kosakata, kanji, kana, dan tata bahasa.

| Item | Status |
| --- | --- |
| Shell + 16 navigasi utama | Selesai + verifikasi browser |
| Hub kurikulum Belajar | Selesai — 39 modul / 154 pelajaran |
| Jalur N5 interaktif | Selesai — 70 pelajaran (termasuk 8 membaca/menyimak) |
| Engine latihan 9 jenis | Selesai — komponen bersama |
| Flashcard + SRS 4 rating | Selesai — audio, romaji, estimasi interval |
| Latihan adaptif | Selesai — bobot berbasis akurasi, kesalahan, jatuh tempo |
| **Enam permainan belajar** | **Selesai — domain murni, 3 tingkat, petunjuk, penjelasan, riwayat** |
| Riwayat kuis + permainan | Selesai — SQLite + Statistik |
| Kamus terpadu | Selesai — 370 entri + kosakata terkait dan kanji beradikal sama |
| **Pelafalan, panduan bunyi, rekaman** | **Selesai — 17 latihan, 6 topik, rekaman lokal 30 detik, ASR opsional berbasis teks** |
| **Drill menyimak** | **Selesai — 15 soal (3 per level) + halaman latihan kilat** |
| **Mesin ujian empat mode** | **Selesai — latihan, simulasi, topik, acak; analitik + ulang soal salah** |
| **Budaya & penemuan** | **Selesai — 33 artikel / 6 kelompok / 132 fakta, favorit, kuis, sumber** |
| Dashboard berbasis tindakan | Selesai — ringkasan 6 metrik, target, saran, ujian terbaru |
| **Rencana belajar personal** | **Selesai — target level/rentang minggu, jadwal deterministik, feasibility, milestones** |
| **Latihan mengetik Jepang** | **Selesai — Kana→Romaji, Romaji→Kana, Arti→Kanji; 5/10/15 soal; penilaian lokal** |
| **Simulasi percakapan** | **Selesai — 6 skenario / 19 langkah; pilihan berlabel register, feedback, transkrip, progres tersimpan** |
| **Target belajar personal** | **Selesai — durasi, kosakata, pelajaran, XP, frekuensi mingguan** |
| **Streak, kalender, riwayat** | **Selesai — kalender lokal, tren 30 hari, timeline aktivitas** |
| **Pencapaian** | **Selesai — 25 pencapaian berbasis data nyata (21 lama + 2 menulis + 2 cerita)** |
| **Rekomendasi explainable** | **Selesai — kartu jatuh tempo, kosakata/tata bahasa lemah, pelajaran/ujian** |
| **Kamus pribadi** | **Selesai — simpan kosakata/kanji/tata bahasa, catatan, koleksi, ulangi** |
| **Studio audio & pelafalan** | **Selesai — Web Speech `ja-JP`, 6 kategori materi, kontrol play/pause/resume/stop/repeat/kecepatan/voice, fallback jujur tanpa voice non-Jepang** |
| **Studio menulis & urutan goresan** | **Selesai — 319 entri (208 kana + 111 kanji), KanjiVG CC BY-SA, animasi, tirukan/tulis mandiri** |
| **Teater cerita & percakapan animasi** | **Selesai — 3 cerita / 9 adegan / 36 dialog / 9 soal, panggung SVG/CSS, mode belajar/tonton, audio `ja-JP`, kuis, progres `story_attempts`** |
| Tes unit | **39 file / 236 tes lulus** |
| Build produksi | Lulus — 101 halaman statis (termasuk 70 pelajaran, `/stories`, 3 detail cerita, `/writing`, dan `_not-found`) + 6 detail dinamis + 20 route API |
| Backup/restore & CI | Selesai — `db:backup` (VACUUM INTO + integrity check + retensi), workflow check/build/audit |
| Validator QA semantik | Selesai — opsi duplikat, kunci di luar rentang, ID ganda dengan isi berbeda |
| Keamanan lokal | Selesai — loopback-only, Host allowlist, JSON + same-origin, batas body 5 MiB, CSP/header, impor berkonfirmasi; belum ada auth/TLS |
| **Fase 14 audit & perencanaan** | **Selesai — tiga fitur lanjutan, verifikasi KanjiVG 259 karakter, empat dokumen, 100 concern awal, ADR-050–054; Audio selesai Fase 16, Writing selesai Fase 17, Story selesai Fase 18** |
| **Fase 15 CMS** | **BLOCKED — tidak ada CMS/admin atau API konten di repositori; menunggu lokasi CMS atau otorisasi membangun fondasi baru** |
| **Fase 16 studio audio** | **Selesai — 30 rute, 14 navigasi, 36/215 tes, build 96 + 5 dinamis + 18 API; browser TTS jujur, tanpa aset audio/caching palsu/skor akustik** |
| **Fase 17 studio menulis** | **Selesai — 319 entri/259 glyph KanjiVG, 32 rute, 15 navigasi, 38/227 tes, build 97 + 6 dinamis + 19 API, tabel `writing_attempts`, evaluasi geometri (bukan pengenalan tulisan)** |
| **Fase 18 teater cerita** | **Selesai — 3 cerita/9 adegan/36 dialog/9 soal, 34 rute, 16 navigasi, 25 pencapaian, 39/235 tes, build 101 + 6 dinamis + 20 API, tabel `story_attempts`, audio `ja-JP` per baris, tanpa video/AI berbayar** |
| **Fase 19 stabilisasi integrasi** | **Selesai — pelajaran→Studio Menulis, koreksi salinan goresan, 39/236 tes, 102 pemeriksaan rute (34 × 3 viewport), 6 perjalanan kritis, audit performa/a11y; tanpa tabel/endpoint/CMS/video baru** |
| **Fase 14B audit mobile learner** | **Selesai — 29 rute × 9 viewport (261 pemuatan), 0 overflow/error; CMS, kanvas menulis, story theater tidak tersedia dan tidak diklaim** |
| Integrasi katalog ke database kanonis | Belum — masih memakai id aktivitas + pemetaan terpusat; fitur Fase 11 mengikuti pola yang sama |
| N4–N1 pelajaran interaktif | Belum — struktur siap, konten belum ditulis |
| Auth, sinkronisasi, PWA | Sengaja ditunda |

---

## 2. Deliverable Fase 6–9 — Permainan, pelafalan/menyimak, ujian, dan budaya

### 2.1 Enam permainan dan cakupannya

| Permainan | Mekanik | Tingkat | Batas waktu | Petunjuk |
| --- | --- | --- | --- | --- |
| Pembuat kata (ことばづくり) | Susun ubin kana menjadi kata yang ada di kamus; tampilkan bacaan, romaji, arti | 5 / 6 / 8 ronde | 240 / 210 / 180 detik | 2 bantuan per ronde |
| Cocokkan kana (かなあわせ) | Pasangkan kana dengan romaji, arti, atau audio | 4 / 6 / 8 pasangan | Tanpa timer; waktu berjalan dihitung | 3 / 3 / 2 |
| Kejar kosakata (ごいラッシュ) | Pilih arti yang tepat sebelum waktu habis; combo dan reaction time | 30 / 36 / 36 soal | 70 / 60 / 50 detik | 3 / 2 / 1 |
| Susun kalimat (ぶんづくり) | Urutkan token menjadi kalimat; validasi partikel dan urutan | 5 / 6 / 7 ronde | Tanpa timer | Biaya 20 / 30 / 40 poin |
| Tantangan kanji (かんじチャレンジ) | Arti, bacaan, dan kanji dalam kata | 10 / 12 / 14 soal | 110 / 90 / 75 detik | 3 / 2 / 1 |
| Tantangan harian (まいにちチャレンジ) | Campuran 3 kosakata, 3 kanji, 2 kana, 2 tata bahasa | 10 soal | 240 detik | 2 |

Semua permainan memiliki tiga tingkat kesulitan (Santai, Standar, Tantangan), tujuan yang ditampilkan sebelum mulai, skor, umpan balik benar/salah, pembahasan setelah selesai, tombol main lagi, dan riwayat sesi. Permainan yang memakai waktu menampilkan timer; permainan tanpa batas waktu tetap mencatat durasi.

### 2.2 Domain permainan murni

Aturan permainan dipisahkan dari React di `src/lib/games/`:

- `shared.ts` — RNG deterministik, pengacakan, `normalizeGameText` (NFKC), `estimateGameXp`, label kesulitan;
- `morae.ts` — penghitungan mora yang memahami yōon, sokuon, dan vokal panjang; validasi ubin;
- `word-builder.ts`, `kana-matching.ts`, `vocabulary-rush.ts`, `sentence-challenge.ts`, `kanji-challenge.ts`, `daily-challenge.ts`;
- `registry.ts` — enam `GameDefinition` (judul, deskripsi, tujuan, level, XP) dan `isGameId`.

Pembuat kata memakai **validasi kamus**: input kana dinormalisasi lalu dicari di peta `VOCAB_BY_KANA`. Hasilnya `correct`, `alternate` (kata sah lain, diterima dengan arti berbeda), `incomplete`, `invalid`, atau `empty`. Aplikasi tidak pernah menerima rangkaian kana sembarang sebagai kata.

Tantangan harian deterministik dari `dateKey` + tingkat kesulitan, sehingga soal hari yang sama konsisten tanpa server antrean. Opsi jawaban selalu unik.

### 2.3 UI bersama dan hub

`src/components/games/game-kit.tsx` menyediakan `GameIntro`, `GameHud`, `QuestionFeedback`, `GameResult`, `GamePanel`, `useCountdown`, dan `useElapsed`. `mcq-game.tsx` menangani permainan pilihan ganda (kejar kosakata, tantangan kanji, tantangan harian) termasuk petunjuk 50:50, combo, dan penjelasan.

`games-hub.tsx` menampilkan statistik permainan, enam kartu, dan lima sesi terakhir. `/games?game=<id>` membuka permainan langsung. Halaman `/games` adalah server component yang hanya mengirim `initialGame` tervalidasi ke hub klien — perbaikan atas bug server-to-client import pada versi pertama.

### 2.4 Persistensi dan statistik

Tabel SQLite kesepuluh, `game_attempts`, menyimpan:

```sql
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
  details TEXT NOT NULL,      -- JSON GameAnswerDetail[]
  started_at TEXT NOT NULL,
  played_at TEXT NOT NULL
)
```

`recordGame()` memvalidasi `gameId`/`difficulty`, menolak `total <= 0`, meng-clamp jawaban/score/durasi/petunjuk, membatasi detail maksimum 100 baris, menghitung akurasi dan XP di server, menyimpan attempt, lalu memperbarui activity. Endpoint: `POST /api/progress/game`.

Snapshot memuat 100 attempt terbaru dan statistik `gameAttempts`, `gameCorrect`, `gameQuestions`, `gameBestScore`. Ekspor/impor/reset menyertakan `game_attempts`.

XP permainan dihitung server dari akurasi (0–1) dan kesulitan: `10 + round(akurasi × 20) + bonus kesulitan (0/5/10) + 5 jika sempurna`. Ini hadiah pengalaman, bukan skor ilmiah.

### 2.5 Pencapaian dan tampilan progres

Tiga pencapaian baru ditambahkan setelah sepuluh pencapaian lama: **Pemain pertama** (1 sesi), **Rutin bermain** (25 sesi), dan **100 jawaban tepat** (100 jawaban benar). Statistik menampilkan kartu Permainan berisi enam sesi terakhir dengan skor, akurasi, kesulitan, durasi, dan tanggal.

### 2.6 File utama Fase 6

| File | Perubahan |
| --- | --- |
| src/lib/games/*.ts | Enam domain permainan + registry + mora + util bersama |
| src/lib/games/*.test.ts | 35 tes domain (morae, validasi kata, kana, rush, kalimat, kanji, harian) |
| src/lib/types.ts | GameId, GameDifficulty, GameAttempt, GameAnswerDetail, statistik game |
| src/lib/progress-defaults.ts | Snapshot `games` + statistik default |
| src/lib/achievements.ts | Tiga pencapaian permainan; total 13 |
| src/components/games/*.tsx | Enam permainan, game kit, hub, MCQ engine |
| src/app/games/page.tsx | Hub server component + deep link tervalidasi |
| src/app/api/progress/game/route.ts | Endpoint penyimpanan attempt |
| src/server/db.ts | Tabel `game_attempts` + index |
| src/server/progress-service.ts | recordGame, readGames, statistik, impor/ekspor/reset |
| src/app/progress/page.tsx | Kartu Permainan + pencapaian 13 |

### 2.7 Deliverable Fase 7 — Pelafalan, menyimak, dan berbicara

Fase 7 memenuhi permintaan audio Jepang, latihan pelafalan, pengenalan suara opsional, latihan menyimak bertingkat, dan panduan bunyi. Tidak ada tabel, kolom, atau route API baru: attempt drill menyimak memakai jalur latihan yang sudah ada.

| Kebutuhan Fase 7 | Implementasi |
| --- | --- |
| Audio untuk kana, kosakata, bacaan kanji, contoh tata bahasa, dan kalimat | `SpeakButton` memakai `ja-JP`, kecepatan profil, voice Jepang bila tersedia; tombol tersedia di seluruh permukaan materi |
| Umpan balik kegagalan/loading pemutaran | `speakDetailed()` mengembalikan alasan terstruktur; `SpeakButton` dan pemutar dialog menampilkan toast Bahasa Indonesia; antrean dialog dibatalkan dengan token agar tidak tumpang tindih |
| Latihan pelafalan | 17 drill N5–N1; audio normal dan lambat; rekaman mikrofon hanya setelah klik eksplisit; durasi maksimal 30 detik; putar ulang dan hapus rekaman |
| Pengenalan suara opsional | `SpeechRecognition`/`webkitSpeechRecognition` dengan `lang=ja-JP`, satu sesi 15 detik, hanya setelah klik; fallback eksplisit bila browser tidak mendukung atau izin ditolak |
| Perbandingan ucapan | Normalisasi NFKC, buang spasi/tanda baca, katakana→hiragana, pertahankan ー/々; jarak Levenshtein; verdict Cocok/Hampir cocok/Belum cocok — **perbandingan teks, bukan skor akustik** |
| Privasi mikrofon | Rekaman tetap di tab dan tidak diunggah ke Kotoba; panel menjelaskan bahwa browser/penyedia ASR dapat mengirim audio ke layanan vendor |
| Latihan menyimak | 12 dialog + 15 drill audio baru (3 N5, 3 N4, 3 N3, 3 N2, 3 N1); 51 soal audio total; halaman `/listening/practice` dengan filter level |
| Panduan pelafalan | Enam topik: vokal, konsonan, vokal panjang, sokuon, mora/irama, dan kesadaran pitch accent; contoh audio dan kontras pasangan bunyi |

**Lapisan audio.** `src/lib/speech.ts` sekarang memiliki kontrak `SpeechProvider` dan registry provider (provider browser `browser-synthesis` menjadi default). `speakDetailed()` mengembalikan `{ ok, reason, providerId, voiceName, usedJapaneseVoice }` dengan alasan `unsupported | empty | cancelled | blocked | error | timeout`; `describeSpeechFailure()` menerjemahkan alasan ke pesan Indonesia. Timeout menyesuaikan panjang teks (8–45 detik). API lama `speak()` tetap kompatibel untuk pemanggil yang hanya membutuhkan boolean. Ini adalah seam untuk penyedia audio eksternal pada fase berikutnya tanpa mengubah komponen materi.

**Pelafalan dan pengenalan suara.** Halaman `/pronunciation` menampilkan panduan bunyi di atas ruang latihan. Perbandingan ucapan memakai `compareSpeechTranscript()` dan tidak pernah menyebut hasilnya sebagai penilaian akustik. Jika ASR tidak tersedia, perekam manual tetap menjadi jalur utama. Tidak ada rekaman yang disimpan di SQLite atau diunggah.

**Menyimak.** `src/content/listening-drills.ts` berisi 15 soal orisinal dengan audioText, bacaan kana, terjemahan Indonesia, empat opsi unik, jawaban, penjelasan, dan tips. `listeningDrillExercises()` memetakannya ke `Exercise` tipe `listening`, lalu `ExerciseRunner` menyimpan attempt melalui `recordQuiz` ke `quiz_attempts`. Hub Menyimak menambahkan kartu CTA "Latihan menyimak kilat"; halaman `/listening/practice` menyediakan filter Semua/N5–N1.

### 2.8 File utama Fase 7

| File | Perubahan |
| --- | --- |
| src/lib/speech.ts | Provider registry, `SpeechPlaybackResult`, `speakDetailed`, timeout, alasan kegagalan, `describeSpeechFailure` |
| src/lib/speech-recognition.ts | Deteksi API, normalisasi teks, Levenshtein, verdict perbandingan, pesan error |
| src/lib/use-speech-recognition.ts | Hook ASR: dukungan hydration-safe, sesi 15 detik, izin, status, fallback |
| src/components/speech-recognition-panel.tsx | Panel ASR + transparansi privasi + hasil perbandingan teks |
| src/components/japanese.tsx | `SpeakButton` memakai `speakDetailed` dan toast kegagalan |
| src/components/listening-player.tsx | Antrean playback bertoken, pembatalan, umpan balik kegagalan |
| src/content/pronunciation-guide.ts | Enam topik panduan bunyi + contoh dan kontras |
| src/components/pronunciation-guide.tsx | Akordeon panduan dengan audio per contoh |
| src/app/pronunciation/page.tsx | Panduan, perekam 30 detik dengan consent, hapus rekaman, panel ASR |
| src/content/listening-drills.ts | 15 drill menyimak orisinal, 3 per level |
| src/lib/exercise-catalog.ts | `listeningDrillExercises()`; drill masuk katalog latihan menyimak/adaptif |
| src/app/listening/page.tsx | Statistik soal audio + CTA latihan kilat |
| src/app/listening/practice/page.tsx | Halaman latihan menyimak dengan filter level dan ExerciseRunner |
| src/lib/speech-recognition.test.ts | Tes normalisasi, kecocokan, ambang, dan pesan error |
| src/content/listening-drills.test.ts | Tes jumlah, sebaran level, opsi, jawaban, dan pemetaan Exercise |

Tidak ada perubahan skema database; total tetap 10 tabel.

### 2.9 Deliverable Fase 8 — Mesin ujian empat mode

Fase 8 memenuhi kebutuhan ujian bergaya JLPT yang dapat dipakai ulang untuk N5–N1. N5 menjadi level default dan memiliki bank soal paling lengkap; level lain memakai soal yang tersedia dengan fallback lintas level yang ditandai di UI.

| Kebutuhan Fase 8 | Implementasi |
| --- | --- |
| Level N5–N1 | Semua level dapat dipilih. Simulasi N5 29 soal/25 menit; N4 32/30; N3 36/40; N2 39/50; N1 41/60. |
| Kategori | Kosakata, kanji, tata bahasa, membaca, dan menyimak. Soal membaca membawa teks bacaan; soal menyimak membawa dialog lengkap dan transkrip yang baru terbuka setelah diperiksa/dikumpulkan. |
| Latihan (practice) | Tanpa batas waktu, periksa jawaban satu per satu, pembahasan langsung, lalu ulangi soal yang salah. Jumlah default 10 soal; kategori campuran atau satu kategori. |
| Simulasi (mock) | Timer sesuai level (25/30/40/50/60 menit), tiga bagian Moji & Goi, Bunpou & Dokkai, Choukai, navigasi sebelumnya/berikutnya, tandai soal, dan kumpulkan di akhir. Timer dihitung dari `startedAt` sehingga refresh tidak mereset waktu. |
| Topik (topic) | Fokus pada satu topik kosakata atau satu pola tata bahasa; tanpa timer dan dengan pembahasan langsung. |
| Acak (random) | 20 soal seimbang (6 kosakata, 4 kanji, 4 tata bahasa, 3 membaca, 3 menyimak) dengan timer level 20–35 menit. |
| Hasil | Skor belajar 0–100, target belajar 70%, benar/salah/kosong, akurasi, durasi, performa per bagian dan kategori, area lemah, serta rekomendasi materi. **Bukan skor atau sertifikasi JLPT resmi.** |
| Review | Filter semua/benar/salah/kosong, jawaban benar vs jawaban pengguna, pembahasan, transkrip/terjemahan, ulang soal salah, dan tambah kosakata/kanji ke kartu ulangan. |
| Soal orisinal | Semua soal dibangun dari konten Kotoba; tidak menyalin soal JLPT atau bank soal komersial. |

**Engine reusable.** `src/lib/exam-engine.ts` adalah modul murni yang membangun `ExamPaper` untuk empat mode, menilai jawaban, menghasilkan `ExamResult`, memilih area lemah, menyusun rekomendasi, dan membuat kertas ulangan dari soal salah/kosong. Pemilihan soal memprioritaskan level yang dipilih; fallback lintas level dicatat sebagai `mixedLevels`. Opsi selalu dinormalisasi menjadi empat pilihan unik dengan jawaban benar yang dipertahankan.

**Alur halaman.** Hub `/exams` menyusun pratinjau dan menyimpan kertas aktif ke `sessionStorage`; `/exams/session` menjalankan timer, navigasi, penanda, dan pengumpulan; `/exams/result` menampilkan analitik dan review. Hasil akhir tetap dikirim ke `recordExam` dan masuk tabel `exams`, sehingga riwayat bertahan di SQLite. Mode dan judul ujian tidak disimpan sebagai kolom; `passed` pada skema lama kini bermakna "target latihan tercapai" (skor ≥ 70), bukan kelulusan JLPT.

**Kartu dari ujian.** `POST /api/progress/card` menambahkan kosakata/kanji yang divalidasi terhadap katalog ke tabel `cards`. Operasi ini idempoten, tidak memberi XP, dan tidak mencatat activity — berbeda dari `recordReview` yang mencatat ulasan dan XP.

### 2.10 File utama Fase 8

| File | Perubahan |
| --- | --- |
| src/lib/exam-engine.ts | Tipe dan builder empat mode, section/category, konteks bacaan/audio, penilaian, analitik, rekomendasi, retry, `toExamPayload` |
| src/lib/exam-engine.test.ts | 17 tes mode, level, keseimbangan, validitas opsi, penilaian, retry, dan payload |
| src/lib/exam-storage.ts | Penyimpanan kertas aktif dan hasil di `sessionStorage` dengan guard |
| src/components/exam-question-card.tsx | Kartu soal ujian: konteks bacaan, audio normal/lambat, opsi, pembahasan, transkrip, tambah kartu |
| src/components/add-to-cards.tsx | Tombol idempoten "Tambah ke kartu ulangan" + status sudah ada |
| src/app/exams/page.tsx | Hub mode/level/kategori/topik, pratinjau, disclaimer, riwayat |
| src/app/exams/session/page.tsx | Timer, navigasi, penanda, auto-submit, konfirmasi keluar, persistensi hasil |
| src/app/exams/result/page.tsx | Skor belajar, statistik, performa bagian/kategori, area lemah, rekomendasi, review, retry |
| src/lib/types.ts | `AddCardPayload` |
| src/server/progress-service.ts | `addCard()` validasi katalog + `INSERT ... ON CONFLICT DO NOTHING` tanpa XP |
| src/app/api/progress/card/route.ts | Endpoint `POST /api/progress/card` |
| src/lib/api-client.ts, src/components/providers/progress-provider.tsx | Jalur `addCard` ke UI |
| src/server/progress-service.test.ts | Tes idempotensi kartu dan penolakan item di luar katalog |
| src/app/progress/page.tsx | Label riwayat ujian memakai "Target tercapai", bukan "Lulus" |
| scripts/verify-ui.cjs | Daftar rute uji diperluas ke 23 rute |

Tidak ada tabel atau kolom baru; total tetap 10 tabel dan 15 route API.

### 2.11 Deliverable Fase 9 — Budaya, anime, dan fakta bahasa

Fase 9 memenuhi kebutuhan penemuan budaya yang menghubungkan bahasa Jepang dengan masyarakat, makanan, geografi, sejarah, anime, dan fakta bahasa. Fokusnya bukan feed hiburan: setiap artikel mempunyai fakta, kosakata, rujukan, kuis, dan tautan ke materi belajar.

| Kebutuhan Fase 9 | Implementasi |
| --- | --- |
| Enam kelompok penemuan | Budaya & Tradisi, Makanan, Geografi, Sejarah, Anime & Hiburan, Fakta Bahasa. Delapan kategori artikel dipetakan ke kelompok melalui `CULTURE_GROUP_BY_CATEGORY`. |
| 33 artikel terkurasi | 14 artikel lama + 19 artikel baru: 9 budaya, 7 makanan, 5 geografi, 4 sejarah, 5 anime, 3 fakta bahasa. Setiap artikel 3 paragraf, 4 fakta, 6 kosakata, sumber, kuis, dan estimasi waktu baca. |
| Fakta harian | `factOfDay()` memilih deterministik dari 132 fakta memakai tanggal lokal; kartu "Fakta hari ini" menautkan artikel sumber. Tanggal klien dibaca melalui `useSyncExternalStore` agar tidak terjadi hydration mismatch. |
| Fakta acak | Tombol "Fakta lain" memilih fakta deterministik dari tanggal + offset dan menyediakan tautan "Baca artikelnya". |
| Kategori dan pencarian | Enam kartu kelompok + chip filter; pencarian mencakup judul, ringkasan, isi, topik, fakta, kosakata, dan ungkapan. Empty state untuk hasil kosong dan favorit kosong. |
| Favorit | Tabel `culture_favorites` (artikel + waktu simpan). Toggle idempoten, divalidasi terhadap `CULTURE_BY_ID`, ikut ekspor/impor/reset. Filter "Favorit" dan tombol bintang pada kartu/detail. |
| Kuis mini | Dua soal per artikel dibangun dari dua kosakata pertama: arti dan bacaan. Empat opsi unik, umpan balik langsung, penjelasan, hitung benar, dan tombol ulangi. Kuis adalah pemeriksaan belajar, bukan skor resmi. |
| Rujukan sumber | Registry `CULTURE_SOURCES` menyimpan label dan URL organisasi (JNTO, Bunka, UNESCO, MAFF, GSI, JMA, Rekihaku, Britannica, AJA, JPF). Setiap artikel menampilkan tiga rujukan bacaan lanjutan dengan `target="_blank" rel="noopener noreferrer"`. |
| Kosakata terkait | Setiap istilah budaya menaut ke `/vocabulary?q=...`; halaman Kosakata kini membaca parameter `q` dan `topic` sehingga pencarian langsung terisi. |
| Materi belajar terkait | Tiap kelompok menampilkan tiga tautan relevan: bacaan, menyimak, tata bahasa, permainan, kanji, kana, ujian, pelafalan, kamus, atau budaya. |
| Register anime | Register diperluas menjadi `standar`, `formal`, `kasual`, `slang`, `arkais`, dan `anime`. Artikel anime menjelaskan makna, konteks, dan kelayakan pemakaian; ada peringatan eksplisit agar ucapan fiksi tidak dipakai di situasi formal. |
| Akurasi dan hak cipta | Artikel adalah ringkasan edukatif orisinal, bukan terjemahan sumber. Rujukan berupa halaman organisasi tingkat lanjut, bukan kutipan per kalimat. Tidak ada gambar karakter anime berhak cipta atau dialog karakter yang disalin. |

**Pemisahan model.** Tipe `CultureArticle` sekarang mewajibkan `topics`, `sources`, `quiz`, dan `minutes`; `CultureGroup` terpisah dari `CultureCategory` agar artikel lama tidak perlu ditulis ulang. `src/content/culture/shared.ts` menjadi pabrik artikel, registry sumber, penghasil kuis deterministik, dan penghitung durasi baca. 14 artikel inti tetap di `src/content/culture.ts`; 19 artikel baru berada di `src/content/culture/extra-*.ts` dan digabung melalui `extras.ts`.

**Fakta dan kuis murni.** `src/lib/culture-facts.ts` meratakan seluruh fakta menjadi `CultureFact[]` dengan id stabil, hash FNV-1a, dan pemilihan deterministik. `src/components/culture-quiz.tsx` adalah komponen klien terpisah yang tidak menulis skor ke server; ini menjaga kuis tetap ringan dan tidak mencampur pemeriksaan belajar dengan ujian.

**Persistensi.** `culture_favorites(article_id TEXT PRIMARY KEY, saved_at TEXT NOT NULL)` adalah tabel kesebelas. `toggleCultureFavorite()` memakai `INSERT ... ON CONFLICT DO NOTHING` untuk simpan idempoten dan `DELETE` untuk hapus. `getSnapshot()` membawa maksimal 2.000 favorit; impor membuang id yang tidak ada di katalog; reset menghapus tabel. Endpoint baru: `POST /api/progress/favorite`.

**UI.** Hub `/culture` menampilkan 4 statistik (artikel, dibaca, favorit, fakta), fakta harian + fakta acak, enam kartu kelompok, pencarian, filter, dan 33 kartu artikel. Detail `/culture/[id]` menampilkan fakta singkat, ungkapan berlabel register, kuis, kosakata bertaut kamus, sumber eksternal, progres artikel, favorit, materi terkait, panduan register, dan navigasi sebelumnya/berikutnya. Pada mobile semua bagian ditumpuk; pada mode gelap token tema yang sama dipakai.

### 2.12 File utama Fase 9

| File | Perubahan |
| --- | --- |
| src/lib/types.ts | `CultureGroup`, register baru, `CultureSource`, `CultureQuizQuestion`, `CultureFavorite`, `favorites` di snapshot |
| src/lib/constants.ts | Label/ikon kategori `bahasa`, enam kelompok, pemetaan kategori→kelompok, label register baru |
| src/content/culture/shared.ts | Registry 11 sumber, pabrik artikel, kuis dari kosakata, catatan orisinal, estimasi menit |
| src/content/culture.ts | 14 artikel inti + penggabungan 19 artikel baru |
| src/content/culture/extra-*.ts, extras.ts | 19 artikel baru: matsuri, kimono/yukata, musim, sushi, ramen, tempura, onigiri, masakan daerah, kota, markah tanah, perbedaan daerah, garis waktu sejarah, tokoh, honorifik, role language, ungkapan anime, asal kanji, sejarah kana, kata & idiom |
| src/lib/culture-facts.ts | Perataan 132 fakta, hash, fakta harian, fakta acak |
| src/components/culture-quiz.tsx | Kuis dua soal dengan umpan balik dan ulangi |
| src/app/culture/page.tsx | Hub penemuan, fakta harian/acak, enam kelompok, pencarian, favorit, kartu artikel |
| src/app/culture/[id]/page.tsx | Detail artikel, sumber, kuis, kosakata bertaut, materi terkait, favorit, progres |
| src/app/vocabulary/page.tsx | Parameter URL `q` dan `topic` |
| src/server/db.ts | Tabel + index `culture_favorites` |
| src/server/progress-service.ts | `readFavorites`, `toggleCultureFavorite`, ekspor/impor/reset favorit |
| src/app/api/progress/favorite/route.ts | Endpoint toggle favorit |
| src/lib/api-client.ts, src/components/providers/progress-provider.tsx | Jalur favorit ke UI + toast |
| src/lib/culture-facts.test.ts | 132 fakta, id unik, tanggal lokal, determinisme |
| src/server/progress-service.test.ts | Favorit idempoten, id tidak dikenal ditolak, ekspor/impor/reset |
| src/content/content.test.ts | 33 artikel, sebaran kelompok/kategori, sumber https, kuis valid |

Tidak ada perubahan pada tabel lain. Skema bertambah satu tabel (total 11) tanpa `schema_version`; database lama mendapat tabel baru melalui `CREATE TABLE IF NOT EXISTS`. Route API bertambah satu (total 16).

---

### 2.13 Deliverable Fase 10 — Personalisasi pembelajaran

Fase 10 mengubah data belajar yang sudah tersimpan menjadi pengalaman yang personal. Fokusnya bukan menambah gamifikasi, melainkan membantu pengguna melihat kemajuan, menetapkan target yang realistis, memahami kelemahan, dan menyimpan materi yang penting.

| Kebutuhan Fase 10 | Implementasi |
| --- | --- |
| Dasbor personal | Kartu **Ringkasan belajar** menampilkan level, persentase kurikulum, pelajaran selesai, kosakata dan kanji yang pernah diulas, pelajaran tata bahasa selesai, total menit belajar, dan jumlah ujian. Hero menampilkan level JLPT, streak, dan target XP; sidebar menampilkan **Ujian terbaru**. |
| Target harian | Empat target dapat diatur di Pengaturan: durasi belajar (15–90 menit), kosakata baru/diulas (5–50), pelajaran (1–4), dan XP (20–200). Target frekuensi mingguan 3/5/7 hari ditambahkan. `goalProgress()` menghitung progres dari `activity`, `reviews`, dan `lessons` hari ini; `weeklyGoal()` menghitung hari aktif dalam minggu Senin–Minggu. |
| Streak dan kalender | `streakSummary()` menghitung streak saat ini, rekor, total hari aktif, dan tujuh hari terakhir dari tanggal lokal; `StudyCalendar` menampilkan grid 42 sel dengan navigasi bulan. Statistik menampilkan chip mingguan dan kalender intensitas. |
| Pencapaian | `buildAchievements()` kini berisi 21 pencapaian, termasuk pelajaran pertama, 100 kosakata, master hiragana, master katakana, ujian pertama, kuis sempurna, dan 50 kanji. Setiap pencapaian menampilkan progres nyata dan status terkunci/terbuka. |
| Rekomendasi | `buildRecommendations()` memprioritaskan kartu jatuh tempo, kosakata dengan akurasi rendah, tata bahasa lemah dari `questionStats`, pelajaran bernilai <80, bagian ujian <70%, pelajaran berikutnya, dan sisa target XP. Setiap saran menampilkan **Alasan** dan **Bukti** dari data yang tersimpan, tanpa klaim di luar data. |
| Kamus pribadi | Tabel `saved_items` menyimpan kosakata/kanji/tata bahasa, catatan pribadi (maks. 1.000 karakter), dan koleksi. Tabel `saved_collections` menyimpan nama/deskripsi koleksi. UI tersedia di kartu kamus, detail tata bahasa, modal kosakata/kanji, dan halaman `/dictionary/collections`. |
| Ulasan materi tersimpan | `SavedItemsReview` menampilkan flashcard materi tersimpan dengan tombol tampilkan jawaban, "Ulangi nanti", dan "Sudah paham". Ini adalah pengulangan mandiri; **tidak mengubah jadwal SRS**. |
| Riwayat dan tren | `studyTimeline()` menggabungkan pelajaran, ujian, kuis, permainan, dan hari aktivitas; `studyTrend()` menghasilkan 30 hari data; `studySummary()` merangkum tujuh hari terakhir, akurasi, dan hari aktif. Statistik menampilkan timeline, tren, kalender, target, dan seluruh pencapaian. |
| Ekspor/impor/reset | Materi tersimpan dan koleksi ikut `exportSnapshot`, `importProgress`, dan `resetProgress`; impor memvalidasi id katalog dan koleksi, lalu membuang referensi yang tidak valid. |

**Batas yang disengaja.** Tidak ada reminder push, PWA/offline penuh, atau analitik ML. Rekomendasi adalah aturan deterministik yang dapat dijelaskan, bukan model prediktif. Catatan pribadi tidak mengubah konten asli atau jadwal SRS.

### 2.14 File utama Fase 10

| File | Perubahan |
| --- | --- |
| src/lib/types.ts | `Settings` empat target baru; `SavedItemKind`, `SavedItem`, `SavedCollection`, payload; snapshot `savedItems`/`savedCollections` |
| src/lib/constants.ts | Default target, opsi durasi/kosakata/pelajaran/frekuensi |
| src/server/db.ts | Tabel `saved_items`, `saved_collections` + index |
| src/server/progress-service.ts | Normalisasi settings, baca/simpan item dan koleksi, validasi katalog, ikut ekspor/impor/reset |
| src/app/api/progress/saved/route.ts, collections/route.ts | Endpoint kamus pribadi |
| src/lib/goals.ts, streak.ts, history.ts | Perhitungan target, streak, kalender, tren, timeline |
| src/lib/recommendations.ts | Aturan rekomendasi dengan prioritas, alasan, dan bukti |
| src/lib/achievements.ts | 13 → 21 pencapaian |
| src/components/goal-progress.tsx, study-calendar.tsx, recommendations.tsx | Kartu target, kalender, daftar saran |
| src/components/saved-item-editor.tsx | Tombol simpan, editor catatan/koleksi, ulasan materi tersimpan |
| src/app/dictionary/collections/page.tsx | Halaman koleksi belajar, catatan, filter, ulangi |
| src/app/dictionary/page.tsx | Ikon simpan, detail dengan editor catatan, tautan koleksi |
| src/app/grammar/[id]/page.tsx, vocabulary/page.tsx, kanji/page.tsx | Tombol/editor simpan materi |
| src/app/page.tsx | Ringkasan belajar, target, rekomendasi, ujian terbaru |
| src/app/progress/page.tsx | Kalender, tren 30 hari, timeline, target, 21 pencapaian |
| src/app/settings/page.tsx | Kontrol empat target + frekuensi mingguan |
| src/lib/goals.test.ts, streak.test.ts, history.test.ts, recommendations.test.ts, achievements.test.ts | Tes unit fitur personalisasi |
| src/server/progress-service.test.ts | Tes target, koleksi, catatan, validasi, ekspor/impor |

### 2.15 Deliverable Fase 11 — Evaluasi fitur lanjutan, latihan produksi, dan rencana belajar

Fase 11 dimulai dengan evaluasi sembilan kandidat fitur, bukan langsung menambah semua yang diminta. Penilaian memakai nilai edukasi, dampak UX, kompleksitas teknis, risiko pemeliharaan, dan performa. Hasilnya: tiga fitur inti ditambahkan, dua fitur lama diperkuat, dan empat kandidat ditunda secara sadar.

| Kandidat | Nilai edukasi | Dampak UX | Kompleksitas / risiko | Keputusan |
| --- | --- | --- | --- | --- |
| Kamus Jepang | Tinggi, tetapi sebagian besar sudah ada | Tinggi | Rendah | **Diperkuat**: kosakata terkait di detail kamus |
| Kanji Explorer | Tinggi | Tinggi | Sedang | **Diperkuat**: kanji beradikal sama; urutan goresan tetap ditunda |
| Latihan menulis | Tinggi | Tinggi | Tinggi: data urutan goresan belum terverifikasi | **Ditunda**; tidak mengarang goresan |
| Latihan membaca | Tinggi | Sedang | Rendah, tetapi sudah matang | **Tidak diduplikasi**; 12 bacaan + furigana/terjemahan/soal sudah ada |
| Simulasi percakapan | Tinggi | Tinggi | Sedang | **Dipilih** — 6 skenario orisinal |
| Latihan mengetik Jepang | Tinggi | Tinggi | Sedang | **Dipilih** — 3 mode, penilaian lokal |
| Rencana belajar personal | Tinggi | Tinggi | Sedang | **Dipilih** — deterministik dari katalog + progres |
| Pembelajaran offline | Sedang | Sedang | Tinggi: sinkronisasi dan konflik data | **Ditunda** |
| Halaman sumber belajar | Rendah–sedang | Rendah | Rendah, tetapi statis | **Ditunda** |

**Yang diimplementasikan.**

- **Simulasi percakapan** — enam skenario orisinal N5–N4: perkenalan formal, memesan makanan, membeli pakaian, menanyakan arah, bertemu teman lama, dan membeli tiket kereta. Total 19 langkah, 18 frasa kunci, catatan budaya, dan tiga pilihan jawaban per langkah dengan satu jawaban yang cocok secara konteks/register. Pilihan yang salah tetap gramatikal, tetapi diberi umpan balik mengapa tidak cocok. Skor dihitung dari langkah yang benar pada percobaan pertama, lalu disimpan sebagai lesson kind "conversation".
- **Latihan mengetik Jepang** — tiga mode: **Kana → Romaji** (tanpa IME), **Romaji → Kana** (IME), dan **Arti → Kanji** (IME). Pemeriksaan dilakukan lokal; romaji menerima alias umum (si/shi, ti/chi, tu/tsu, sya/sha, dan sejenisnya), sedangkan jawaban Jepang dinormalisasi NFKC tanpa mengorbankan perbedaan kana/kanji. Sesi 5/10/15 soal, timer, akurasi, tinjauan jawaban, lalu recordLesson + recordSession. Tidak ada ketikan yang dikirim ke server.
- **Rencana belajar personal** — target JLPT dan rentang 4–104 minggu (UI 8/12/16/24/36) disimpan di Settings. buildStudyPlan menyusun jadwal mingguan dari level berjalan, pelajaran yang belum selesai, estimasi menit, durasi sesi, dan frekuensi mingguan. Rencana menampilkan pelajaran terjadwal, ulangan, total materi, feasibility (longgar/realistis/ketat/tidak realistis), rekomendasi memperpanjang target, dan milestones. Rencana **tidak disimpan sebagai tabel tugas**; selalu diturunkan ulang agar tidak basi.
- **Penguatan kamus/kanji** — detail kosakata menampilkan hingga empat kosakata terkait (topik/jenis kata sama), dan detail kanji menampilkan kanji beradikal sama. Keduanya diturunkan dari konten, tanpa tabel atau kolom baru.

**Yang sengaja tidak dikerjakan.**

- **Latihan menulis dan penelusuran urutan goresan** ditunda karena belum ada data urutan goresan yang terverifikasi di proyek. Menampilkan urutan yang tidak akurat lebih berbahaya daripada tidak menampilkannya.
- **PWA/offline penuh** ditunda karena membutuhkan strategi cache, konflik tulis, dan sinkronisasi; aplikasi saat ini hanya menjanjikan cache baca.
- **Halaman resource belajar** ditunda karena nilai tambahnya lebih kecil daripada biaya kurasi dan pemeliharaan tautan.
- **Ekspansi bacaan** tidak dijadikan fitur Fase 11 karena pipeline bacaan sudah bekerja; yang dibutuhkan adalah penambahan konten, bukan UI baru.

Tidak ada tabel atau endpoint baru pada Fase 11. Skema tetap **13 tabel** dan **18 route API**; field target rencana disimpan di JSON settings yang sudah ada, dan kind lesson baru memakai kolom kind yang sudah ada.

### 2.16 File utama Fase 11

| File | Perubahan |
| --- | --- |
| src/lib/types.ts | Tipe ConversationLine/Choice/Step/Phrase/Scenario; studyTargetLevel, studyTargetWeeks; kind lesson typing/conversation |
| src/lib/constants.ts | Navigasi Rencana, Mengetik, Percakapan; default target rencana; opsi 8–36 minggu; XP lesson typing/conversation 20 |
| src/lib/learning.ts, src/components/icons.tsx | Label/ikon modul baru dan ikon percakapan |
| src/content/conversations.ts + .test.ts | Enam skenario orisinal, 19 langkah, 18 frasa kunci, validasi satu jawaban benar per langkah |
| src/lib/typing.ts + .test.ts | Tiga mode, alias romaji, normalisasi Jepang, sesi deterministik, akurasi |
| src/lib/study-plan.ts + .test.ts | Planner deterministik: level, minggu, feasibility, jadwal, milestone |
| src/app/conversation/page.tsx, src/app/conversation/[id]/page.tsx | Hub skenario dan pemain dialog dengan feedback/register/transkrip |
| src/app/typing/page.tsx | Pemilihan mode, sesi, timer, hasil, tinjauan jawaban |
| src/app/plan/page.tsx | Rencana mingguan, target, feasibility, milestone, simpan target |
| src/app/dictionary/page.tsx | Kosakata terkait dan kanji beradikal sama |
| src/server/progress-service.ts | Validasi target rencana; whitelist kind lesson typing/conversation |
| scripts/verify-ui.cjs | Daftar rute uji diperluas menjadi 29 pola rute |

### 2.17 Deliverable Fase 12 — Audit kualitas menyeluruh dan kesiapan produksi

Fase 12 adalah audit read-only atas seluruh aplikasi, dilanjutkan perbaikan temuan yang tidak memerlukan keputusan produk baru. Audit mencakup fungsionalitas, akurasi bahasa Jepang, kualitas teknis, UI/UX dan aksesibilitas, performa, keamanan, serta dokumentasi. Tidak ada fitur produk baru, tabel baru, atau endpoint baru; skema tetap 13 tabel dan 18 route API.

**Hasil audit dan perbaikan.**

| Area | Temuan | Tindakan |
| --- | --- | --- |
| Keamanan | 1 blocker, 2 high, 4 medium, 6 low: API progres tanpa auth; CSRF karena JSON diproses tanpa Content-Type/origin; server bind semua antarmuka; body/snapshot tak dibatasi; impor menimpa tanpa konfirmasi; DNS rebinding; error/health membocorkan internal; header/izin file lemah | Server bind 127.0.0.1, proxy menolak Host non-loopback (421), tulisan wajib JSON + same-origin (415/403), batas body 5 MiB (413), CSP + nosniff/frame/referrer/permissions, health minimal, DB 0700/0600, impor berkonfirmasi + validasi ketat, error disanitasi. Auth/TLS tetap belum ada dan didokumentasikan sebagai blocker deployment publik |
| UI/UX & a11y | 0 blocker, 4 high, 21 medium, 10 low; audit lanjutan 0 blocker, 3 high, 3 medium, 4 low | lang=ja pada teks Jepang, h1 duplikat dihapus, kontras tombol gelap 6,44:1, overflow /plan dan /kana 390px diperbaiki, fokus soal pindah ke prompt, target sentuh minimal 24px, heading transkrip benar, drawer fokus terkelola, live region untuk simpan/feedback |
| Konten Jepang | 4 high, 6 medium, 7 low, 1 uncertain; soal ambigu, bacaan tidak konsisten, salah baca, contoh tidak cocok | 21 koreksi + review kedua: opsi pengecoh dibuat tidak gramatikal, kunci susun kalimat diperbaiki, bacaan/terjemahan diselaraskan, 天/来/四/風邪/エンジニア diperbaiki, percakapan restoran tidak kontradiktif, alias romaji wo/nn ditambah, label register diperjelas. Gaya romaji/loanword yang tidak seragam dicatat sebagai batasan, bukan fakta salah |
| Performa | Google Fonts render-blocking ~183 KiB gzip, Noto Serif tidak dipakai; katalog konten ~33 KiB gzip di banyak rute; permainan dan exam engine eager | Font jarak jauh dihapus, stack sistem Jepang; game di-next/dynamic; pengukuran warm: / 475 KB total (403 KB skrip), /games 51 KB, /exams/session 64 KB, /settings 56 KB, /typing 47 KB. Katalog masih satu chunk bersama dan menjadi batasan |
| Teknis | Baseline 30/190, 29 rute, 18 API, build 87 | check 32 file/199 tes, typecheck + ESLint bersih, build 87 halaman statis + /conversation/[id] dinamis + 18 API; 29 rute HTTP 200, 0 console error |

**Perbaikan fungsional yang terverifikasi.** Alur ujian simulasi 29 soal selesai (skor 10/29 = 34%, analitik bagian/kategori, review); percakapan 3 langkah selesai dan tersimpan; mengetik 5 soal sampai hasil dan tersimpan; impor menampilkan pratinjau "Timpa seluruh progres?", Batal mempertahankan data, dan "Ya, timpa" mengganti profil; tema gelap + mobile 390px tanpa overflow; fokus soal pertama dan berikutnya berpindah ke prompt; kontras, lang=ja, dan target sentuh lolos probe browser.

**File utama Fase 12.**

| File | Perubahan |
| --- | --- |
| src/proxy.ts, src/server/http.ts | Host allowlist loopback; validasi JSON + same-origin; batas body 5 MiB; ClientError/errorStatus; sanitasi pesan |
| next.config.ts, package.json | CSP + header keamanan; dev/start mengikat 127.0.0.1; body proxy 6 MB; poweredByHeader false |
| src/server/db.ts, src/app/api/health/route.ts | Izin direktori/DB 0700/0600; transaksi BEGIN IMMEDIATE + guard; health minimal |
| Route API progres + progress-service.ts + settings/page.tsx | Validasi impor, batas array, konfirmasi impor, error status, sanitasi; reset/import/export tetap satu profil |
| src/app/layout.tsx, src/app/globals.css | Google Fonts dihapus; stack font sistem; token kontras gelap; scroll padding mobile; reduced motion |
| src/components/app-shell.tsx, ui.tsx, exercise-runner.tsx, listening-player.tsx, exam-question-card.tsx, culture-quiz.tsx, flashcards.tsx, games-hub.tsx | Fokus dialog/soal, label/aria, heading, live region, proteksi rating ganda, code splitting permainan |
| src/lib/theme.ts + theme.test.ts, progress-provider.tsx | Prioritas tema lokal eksplisit vs server sistem; tes preferensi tema |
| src/content/grammar.ts, reading.ts, vocabulary.ts, kana.ts, kanji.ts, conversations.ts, lessons/sentence.ts, culture/extra-*.ts | 21+ koreksi konten Jepang dan konsistensi terjemahan |
| scripts/verify-ui.cjs, scripts/verify-api.mjs | Smoke 29 rute + alur API terisolasi |

**Verifikasi.** Audit keamanan diuji dengan curl: JSON same-origin reset 400 (konfirmasi wajib), origin localhost 400/200 sesuai, cross-origin 403, text/plain 415, Host evil.example 421, CSP/header ada. Audit UI diuji dengan Playwright pada 69 pemuatan halaman (23 rute x 3 viewport): 0 console/page error, tanpa overflow horizontal, fokus drawer terperangkap, Escape mengembalikan fokus. Verifikasi browser utama memakai DB terisolasi .data/kotoba-qa2.db di port 3102. Database pengguna sempat tercemar oleh smoke API awal dan telah direset ke kondisi bersih; verifikasi berikutnya tidak menyentuh DB pengguna.

### 2.18 Tata kelola concern lintas fase

Seluruh temuan, rekomendasi, risiko, dan fitur opsional dari Fase 1–12 dikonsolidasikan ke [CONCERNS_BACKLOG.md](CONCERNS_BACKLOG.md). Register ini adalah sumber tunggal status concern: setiap item memiliki ID stabil, fase asal, alasan, risiko/dependensi, prioritas P0–P3, kompleksitas S/M/L/XL, status, dan keputusan. Kebijakan ini dicatat sebagai ADR-046.

Pada penutupan Fase 12 tercatat **86 concern**: 15 RESOLVED (pekerjaan Fase 12 yang terverifikasi), 22 ACCEPTED untuk Fase 13, 44 DEFERRED dengan pemicu, 2 BLOCKED oleh dataset eksternal (urutan goresan dan komponen kanji), dan 3 REJECTED dengan alasan (skor akustik pelafalan, halaman sumber belajar statis, percakapan bebas AI). Tidak ada item OPEN atau IN_PROGRESS yang belum dievaluasi. `ACCEPTED` berarti disetujui untuk perencanaan, bukan sudah diimplementasikan.

### 2.19 Deliverable Fase 13 — Konsolidasi lintas fase dan penyelesaian concern

Fase 13 tidak menambah fitur produk baru. Fase ini menutup item backlog yang paling menutup risiko correctness, data, dan quality gate, lalu mencatat alasan penundaan item lain. Hasilnya: **11 concern menjadi RESOLVED**, **11 dipindahkan ke DEFERRED dengan pemicu**, dan tidak ada item ACCEPTED yang tersisa tanpa keputusan. Register lengkap ada di [CONCERNS_BACKLOG.md](CONCERNS_BACKLOG.md); keputusan arsitektur di ADR-047–ADR-049.

**Yang diselesaikan.**

| Area | Perubahan | Bukti |
| --- | --- | --- |
| Backup/restore | CLI `scripts/backup-db.mjs`: backup `VACUUM INTO` bertimestamp, `PRAGMA integrity_check`, retensi 7, restore dengan `--yes` dan salinan pre-restore, mode 0700/0600 | 3 tes; backup 151.552 byte; 13 tabel; roundtrip terverifikasi |
| Delapan pelajaran N5 membaca/menyimak | `READING_PLANS` + `LISTENING_PLANS`, ID `les-reading-*`/`les-listening-*`, memakai soal sumber; blok `jp-prose` (furigana) dan `dialog` | 70 LessonPlan; halaman `/learn/les-reading-r-n5-1` dan `/learn/les-listening-l-n5-1` dirender |
| Validator QA semantik | `src/lib/content-qa.ts`: prompt kosong, opsi duplikat setelah normalisasi, `answerIndex` di luar rentang, ID ganda dengan isi berbeda; mencakup bank grammar/reading/listening/culture/drill/LessonPlan | 4 tes; dataset nyata 0 error struktural |
| CI quality gate | `.github/workflows/quality.yml`: `npm ci`, `npm run audit:prod`, `npm run check`, `npm run build` pada Node 24 | Workflow tersimpan; audit produksi 0 kerentanan |
| Reflow 320 px | Perbaikan grid/min-width di dasbor, kosakata, ujian, pengaturan, dan `StatTile` | 29 rute x 320/400 px: 0 overflow, 0 error |
| Status non-warna & label | Kana/kanji memakai aria-label mastery, kalender/heatmap memakai role list + label, blok pelajaran memakai `lang=ja` | Probe aksesibilitas dan pembacaan DOM |
| CHANGELOG | Ringkasan perubahan Fase 1–13 | `CHANGELOG.md` |

**Yang ditunda dan alasannya.** N4 50–60 pelajaran dan pendalaman N3–N1 (fase konten berikutnya; menulis konten N4 tergesa-gesa melemahkan akurasi), E2E/axe/tes komponen/perf budget (butuh dependency dan baseline stabil; belum masuk `npm test`), Git (keputusan operasional; proyek masih non-repo), refaktor katalog kode klien dan exam chunk (belum ada bukti dampak yang cukup setelah pengukuran), observability (belum ada deployment publik), serta autentikasi/TLS/rate limit/audit log (keputusan produk dan operasional; bukan pekerjaan setengah jadi).

**File utama Fase 13.**

| File | Peran |
| --- | --- |
| `src/content/lessons/reading.ts`, `listening.ts`, `index.ts` | Delapan LessonPlan turunan + dua path modul N5; total 70 rencana dan 8 jalur |
| `src/lib/types.ts`, `src/components/lesson-blocks.tsx` | Blok `jp-prose` dan `dialog`; furigana via `JpText`, `lang=ja` |
| `src/lib/content-qa.ts`, `content-qa.test.ts` | Validator soal semantik dan regresi bank soal |
| `scripts/backup-db.mjs`, `src/lib/backup-db.test.ts` | Backup/verify/restore/retensi SQLite |
| `.github/workflows/quality.yml`, `CHANGELOG.md` | Quality gate CI dan riwayat perubahan |
| `src/app/page.tsx`, `vocabulary/page.tsx`, `exams/page.tsx`, `settings/page.tsx`, `components/ui.tsx` | Perbaikan reflow 320 px |
| `src/app/kana/page.tsx`, `kanji/page.tsx`, `components/study-calendar.tsx`, `heatmap.tsx` | Status mastery non-warna dan label aksesibel |

**Verifikasi.** `npm run check` lulus **34 berkas / 206 tes**, typecheck dan ESLint bersih. `npm run build` lulus **94 halaman statis** (termasuk 70 pelajaran) + 5 rute detail dinamis + 18 API. Smoke 29 rute HTTP 200. Reflow 320/400 px pada 29 rute tanpa overflow/error. `npm audit --omit=dev` menemukan 0 kerentanan produksi (17 dependensi produksi); audit penuh masih mencatat 8 isu moderat dev-only. Tidak ada perubahan skema: tetap **13 tabel** dan **18 endpoint**.

### 2.20 Deliverable Fase 14 — Audit sistem dan rencana integrasi fitur lanjutan

Fase 14 **tidak mengimplementasikan fitur baru**. Fase ini mengaudit sistem yang ada, memverifikasi kelayakan teknis dan lisensi, lalu menyusun rencana Fase 15–19 untuk tiga kemampuan: **Audio & Pronunciation Studio**, **Handwriting & Stroke Order Studio**, dan **Story & Conversation Animation Player**. Tidak ada perubahan kode aplikasi, tabel, endpoint, atau aset audio/gambar; produksi di `:3100` tidak dijalankan ulang.

**Keadaan aman sebelum audit.** Tidak ada proses QA, test, build, atau Playwright yang berjalan. Aplikasi produksi aktif di `http://127.0.0.1:3100` dengan health `{ok:true,version:"0.1.0"}`. Repositori bukan Git repo; tidak ada QA yang terganggu dan tidak ada proses yang dimatikan.

**Yang sudah ada dan dapat dipakai ulang.**

| Area | Kondisi saat ini | Dapat dipakai ulang untuk |
| --- | --- | --- |
| Audio | `src/lib/speech.ts`: `SpeechProvider`, `browserSpeechProvider`, `SpeakOptions`, `SpeechPlaybackResult`; `utterance.lang = ja-JP`; `SpeakButton`, `useSpeech`, `getJapaneseVoices`, retry/voiceschanged/timeout | Sumber audio default; seam provider untuk rekaman/Open JTalk; kontrol audio baru |
| Pelafalan | `/pronunciation` 17 drill + 6 topik panduan; rekaman lokal 30 detik; ASR opsional berbasis teks; mode normal/lambat | Studio pelafalan, waveform/status rekaman, diagnostik voice |
| Menyimak | `/listening` 12 dialog + 15 drill; play-all/per-line, transkrip, soal | Audio per baris untuk story player |
| Kanji/kana | 111 kanji + 208 kana; jumlah goresan, radikal, on/kun, arti, contoh, mnemonik | Data teks dasar; belum ada path/urutan goresan |
| Percakapan | 6 skenario / 19 langkah / 18 frasa kunci; pemain `/conversation/[id]`; register formal/kasual/standar | Model dialog, alur pilihan, transkrip, frasa kunci, catatan budaya |
| Bacaan | 12 teks dengan furigana, terjemahan, kosakata, soal | Sumber cerita tambahan; belum ada panggung/ilustrasi/animasi |
| Progress | 13 tabel SQLite; `LessonProgressKind` sudah mencakup banyak jenis; XP/lesson/activity | Asumsi awal Fase 14: menyimpan hasil menulis/cerita sebagai lesson. Implementasi akhir memilih tabel khusus `writing_attempts` dan `story_attempts` agar statistik dan percobaan berulang terlacak |
| Content pipeline | Konten TypeScript bertipe di `src/content`, validator build/test | Cerita/audio/stroke manifest dapat memakai pola konten-kode + validator |

**Akar masalah pesan audio tidak tersedia.** Pesan di menu audio bukan disebabkan field CMS yang hilang, karena **tidak ada CMS/admin maupun content API** di repositori ini. Konten adalah modul TypeScript bertipe dan database hanya menyimpan progres. Bukti runtime (Chromium headless 1248, `/settings`): `speechSynthesis` tersedia `true`, tetapi `getVoices()` mengembalikan `0` voice saat awal dan tetap `0` setelah 1.200 ms; tidak ada voice `ja`. Kode playback sudah ada, tetapi `public/` tidak berisi file audio (hanya `favicon.svg` dan `manifest.webmanifest`). Jadi penyebabnya adalah **lingkungan tanpa voice Jepang + tidak adanya fallback audio statis**, bukan CMS, metadata, atau tombol yang belum dibuat. Di perangkat dengan voice `ja-JP`, tombol yang sama dapat berbunyi.

**Verifikasi KanjiVG untuk studio menulis.**

| Pemeriksaan | Hasil |
| --- | --- |
| Commit yang dipin | `610091ce618cf757ed1357a8954cd65283e015d6` (2026-11-05) |
| Kanji aplikasi tercakup | **111 / 111** |
| Kana aplikasi tercakup | **208 / 208** (setiap komponen karakter yōon tersedia) |
| Karakter unik yang dibutuhkan | **259**, 0 file hilang |
| Ukuran 259 SVG | **690.664 byte**; rata-rata 2.667 byte; maksimum 6.276 byte |
| Lisensi | **CC BY-SA 3.0**, © Ulrich Apel 2009–2026; atribusi + tautan lisensi wajib, data turunan share-alike |
| Format | SVG per karakter, `viewBox 109x109`, grup `StrokePaths` berurutan + `StrokeNumbers` opsional |

Rencana memakai **KanjiVG sebagai satu-satunya sumber urutan goresan**, diimpor selektif saat build (bukan seluruh 11.961 entri), dengan halaman atribusi/lisensi. Tidak ada klaim pengenalan tulisan tangan otomatis dan tidak ada goresan yang difabrikasi.

**Keputusan arsitektur yang dicatat.** ADR-050 (rantai fallback audio berlapis: rekaman → TTS browser `ja-JP` → TTS lokal opsional → status tidak tersedia; tidak pernah diam-diam memakai voice non-Jepang), ADR-051 (KanjiVG, lisensi, tanpa handwriting recognition), ADR-052 (story player DOM/SVG/CSS/Web Animations, konten-kode, tanpa video/CMS), ADR-053 (tidak membangun CMS sekarang), dan ADR-054 (Fase 14 hanya audit/perencanaan; implementasi mulai Fase 15).

**Rencana implementasi yang diusulkan.**

| Fase | Fokus | Ketergantungan | Perkiraan |
| --- | --- | --- | --- |
| 15 | Audio Studio: resolver + manifest + `AudioControl`, diagnostik voice, fallback rekaman/TTS, aksesibilitas | — | 3–4 sesi |
| 16 | Writing Studio: pipeline KanjiVG, `/writing`, detail kana/kanji, animasi SVG, kanvas latihan, progres | 15 untuk kontrol audio; data stroke | 4–6 sesi |
| 17 | Story foundation: tipe cerita/karakter/scene, 2 cerita orisinal, player, audio per baris, transkrip/terjemahan | 15 | 4–5 sesi |
| 18 | Animasi panggung, multi-karakter, 2 cerita tambahan (total 4), polish transisi | 17; 16 opsional untuk anotasi kanji | 4–5 sesi |
| 19 | Integrasi, QA, performa/aksesibilitas, dokumentasi, verifikasi rute lama | 15–18 | 3–4 sesi |

Total perkiraan **18–24 sesi**. Setiap fase wajib lulus `npm run check`, `npm run build`, 29 rute lama tetap 200/0 error, tidak ada permintaan eksternal baru, dan tidak ada perubahan DB yang merusak.

**Catatan penomoran (Fase 16).** Rencana di atas disusun pada Fase 14 dengan asumsi audio menjadi Fase 15. Eksekusinya berubah: Fase 15 (perluasan CMS) **diblokir** karena repositori tidak memiliki CMS; audio dikerjakan sebagai **Fase 16**; writing bergeser ke **Fase 17**; story foundation ke **Fase 18**; animasi/integrasi ke **Fase 19**. Nomor pada tabel di atas adalah rencana awal, bukan penomoran final. Rekaman audio dan konten cerita adalah konten orisinal; KanjiVG tetap CC BY-SA. Open JTalk hanya opsi server lokal loopback, bukan dependensi default, karena lisensi voice data harus diverifikasi terpisah.

**Dokumen dan backlog.** Spesifikasi, arsitektur, roadmap, dan status ada di [ENHANCED_LEARNING_FEATURES_SPEC.md](ENHANCED_LEARNING_FEATURES_SPEC.md), [ENHANCED_FEATURES_ARCHITECTURE.md](ENHANCED_FEATURES_ARCHITECTURE.md), [ENHANCED_FEATURES_ROADMAP.md](ENHANCED_FEATURES_ROADMAP.md), dan [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md). [CONCERNS_BACKLOG.md](CONCERNS_BACKLOG.md) mencatat **100 concern pada penutupan Fase 14**, **102 setelah Fase 14B**, **104 setelah Fase 16**, **107 setelah Fase 17**, dan **114 setelah Fase 18**: 37 RESOLVED, 5 ACCEPTED, 68 DEFERRED, 1 BLOCKED, 3 REJECTED. RES-16 (audit mobile), RES-17/RES-18 (audio global dan cakupan kategori), RES-20 (batas snapshot cerita), CNT-07/CNT-22/UX-12 (writing), serta ARC-14/ARC-15/CNT-23/UX-13 (cerita) selesai. UX-14/UX-15/UX-16/UX-17/UX-18 (perangkat fisik/stylus, timing kata, resume cerita, kamus per kata) ditunda; CNT-08 (komponen kanji), PRD-10 (video export), dan PRD-11 (pipeline video/CMS) tetap backlog/BLOCKED.

**Verifikasi.** Audit read-only: tidak ada QA/test/build yang berjalan; health produksi `ok` versi `0.1.0`; tidak ada mutasi database. Pemeriksaan KanjiVG memakai GitHub tree dan unduhan contoh file; 259 karakter yang dibutuhkan tersedia. Dokumen dibuat tanpa mengubah kode. `npm run check` dijalankan setelah perubahan dokumen untuk memastikan baseline tetap **34 berkas / 206 tes**.

### 2.21 Deliverable Fase 14B — Audit kompatibilitas mobile (aplikasi learner)

Fase 14B menguji **seluruh 29 rute learner yang ada** pada sembilan viewport: 320×568, 360×740, 375×667, 390×844, 430×932, 768×1024, 1024×768, 1366×768, dan 1920×1080. Total **261 pemuatan** mencapai HTTP 200, tanpa error konsol/page, dan **0 halaman dengan overflow horizontal** pada audit final. Nilai `documentElement.scrollWidth` sama dengan lebar viewport di setiap ukuran.

**Cakupan yang tidak tersedia saat audit Fase 14B.** Tidak ada CMS/admin, route admin, API konten admin, kanvas menulis/animasi goresan, atau story theater ketika audit dilakukan. Permukaan tersebut **tidak diaudit dan tidak diklaim lulus**; CMS masih backlog (PRD-08), sedangkan menulis kemudian diimplementasikan pada Fase 17 dan cerita pada Fase 18.

| Area | Hasil Fase 14B |
| --- | --- |
| 29 rute × 9 viewport | 261/261 HTTP 200; 0 error runtime; 0 overflow halaman |
| 320/360/375/390/430 px | Tata letak satu kolom, navigasi bawah, drawer, modal, dan form tetap dapat dipakai |
| 768/1024/1366/1920 px | Grid dua/tiga kolom dan sidebar tampil tanpa tumpang tindih |
| Tema terang/gelap | Diperiksa pada dashboard, materi, latihan, dan pengaturan; kontras teks utama tetap terbaca |
| Jepang/furigana | Teks Jepang memakai `lang=ja`; furigana/ruby tidak memotong baris atau tumpang tindih |
| Audio | Kontrol pemutaran dan status kegagalan tetap terlihat; pemutaran bergantung voice perangkat |
| Ujian | Timer, navigasi soal, penanda, dan hasil tetap dapat digunakan di 390 px |
| Target sentuh | Tombol utama dan kontrol penting diperbesar; hitungan mentah target kecil didominasi tautan inline dan checkbox 16 px di dalam label |
| Keyboard/fokus | Drawer, modal, latihan, dan navigasi tetap dapat difokuskan; tidak ada perangkap fokus baru |
| CMS/admin | **Tidak tersedia — tidak diuji** |
| Kanvas menulis/story theater | **Tidak tersedia saat audit Fase 14B — tidak diuji** (menulis selesai Fase 17; cerita selesai Fase 18) |

**Perbaikan yang diterapkan.**

- `src/app/progress/page.tsx` — grid dasar `minmax(0,1fr)` dan anak `min-w-0`; menghilangkan overflow 394 px pada 320–390 dan 1050 px pada 1024.
- `src/components/ui.tsx` — `StatTile` tidak lagi memotong label, petunjuk, atau nilai.
- `src/app/plan/page.tsx` — statistik 1/2/4 kolom dan judul pelajaran membungkus, bukan terpotong.
- `src/app/typing/page.tsx` — kartu rekap 1/2 kolom; label mode tidak terpotong.
- `src/app/page.tsx` — kartu JLPT 2 kolom pada layar sempit dan 5 kolom mulai 380 px; deskriptor tidak dipotong.
- `src/app/settings/page.tsx` — label tema “Sistem” dan kontrol segmented ukuran kecil muat di 320 px.
- `src/app/kana/page.tsx`, `src/components/listening-player.tsx` — pola dekoratif yang menutupi header dihapus; transkrip menyimak menampilkan bacaan kana, bukan ID internal.
- `src/app/practice/page.tsx`, `src/components/goal-progress.tsx` — target sentuh tautan kecil dinaikkan ke tinggi minimum 24 px.

**Alur fungsional mobile.** Satu sesi Playwright pada 390×844 lulus 18 langkah tanpa error: drawer (aria-expanded, Escape), pelajaran enam langkah, kuis kana, ulasan kosakata, tata bahasa, bacaan (toggle terjemahan), menyimak, latihan, permainan, ujian 10 soal, mengetik, percakapan, rencana, pengaturan tema, kamus, dan statistik. Data uji memakai database QA terisolasi.

**Verifikasi.** `npm run check` lulus **34 berkas / 206 tes**; `npm run build` lulus **94 halaman statis + 5 rute detail dinamis + 18 API**. Audit memakai Chromium Playwright yang diemulasikan, bukan perangkat fisik. Detail metode, temuan, dan batasan ada di [MOBILE_COMPATIBILITY_REPORT.md](MOBILE_COMPATIBILITY_REPORT.md).

### 2.22 Deliverable Fase 16 — Japanese Audio & Pronunciation Studio

Fase 16 mengimplementasikan studio audio yang memakai **Web Speech API bawaan browser** sebagai mesin utama. Tidak ada layanan TTS berbayar, unggahan teks ke server, file audio statis, atau klaim bahwa browser SpeechSynthesis menghasilkan MP3. Semua materi audio diturunkan dari konten terketik yang sudah ada; bacaan furigana diubah ke kana utuh melalui `furiganaReading()`, dan kanji/kosakata memakai bacaan terverifikasi alih-alih karakter mentah bila bacaan tersedia.

**Cakupan materi.** Enam tab studio: kana (208 karakter, filter hiragana/katakana dan kelompok dasar/dakuten/handakuten/yōon), kosakata (214 kata), kanji (111 karakter), tata bahasa (45 pola beserta contoh), bacaan (12 teks lengkap + kosakata), dan percakapan (6 skenario; seluruh dialog, baris lawan bicara, dan jawaban benar). Pencarian, filter level, pemuatan 24 materi, serta antrean putar tersedia.

**Kontrol dan fallback.** `src/lib/audio-player.ts` menyediakan satu pemutar global dengan play, pause, resume, stop, repeat, sebelumnya/berikutnya, kecepatan 0,75/1,00/1,25/1,50×, dan pemilihan voice Jepang. `src/components/audio.tsx` dipakai ulang di studio, bacaan, percakapan, menyimak, pelafalan, dan tombol pelafalan. Playback baru menghentikan playback sebelumnya; perpindahan rute memanggil `stopAudio()`. Bila perangkat tidak memiliki voice `ja-JP`, Kotoba menampilkan penjelasan bahasa Indonesia dan **tidak** memakai voice bahasa lain. Preferensi kecepatan/voice disimpan ke `Settings` yang sudah ada.

**Yang tidak diklaim.** Tidak ada penilaian akustik, skor pelafalan, kualitas native, atau unduhan audio. Open JTalk hanya dievaluasi sebagai adapter lokal opsional (mesin BSD-3; lisensi voice data terpisah; belum di-deploy). Seam audio rekaman sudah ada tetapi belum ada aset yang diisi. Perangkat tanpa voice Jepang tetap dapat membaca transkrip dan latihan tertulis.

| Area | Hasil Fase 16 |
| --- | --- |
| 30 rute pengguna | Semua HTTP 200, H1 sesuai, 0 console/page error pada Chromium teremulasi |
| Tes otomatis | 36 berkas / 215 tes lulus; typecheck + ESLint bersih |
| Build | 96 halaman statis (termasuk 70 pelajaran dan `_not-found`) + 5 rute detail dinamis + 18 API |
| Voice Jepang tidak tersedia | Pesan jelas di studio dan Pengaturan; tombol putar gagal dengan toast, bukan suara bahasa lain |
| Voice Jepang tersedia (mock) | Play/pause/resume/stop, pemilihan voice, kecepatan, dan penghentian saat pindah rute terverifikasi |
| Integrasi | Bacaan, percakapan, menyimak, pelafalan, tombol pelafalan, dan studio memakai bacaan kana terverifikasi |
| Mobile 390 px | Tidak ada overflow halaman; pemutar dan daftar materi dapat dipakai |
| Skor akustik/MP3 | Tidak ada dan tidak diklaim |

**Verifikasi browser.** Playwright pada QA terisolasi memakai Chromium 1248: pemuatan studio, fallback tanpa voice Jepang, mock voice `ja-JP` untuk play/pause/resume/stop, penghentian saat navigasi, pengaturan kecepatan, serta kehadiran kontrol di bacaan/percakapan/menyimak/pelafalan. Hasil: 0 error konsol/page; mobile 390 px `scrollWidth = clientWidth`. Screenshot di `.screenshots/audio/`: `audio-no-voice.png`, `audio-voice.png`, `audio-no-voice-settings.png`, `audio-reading.png`, `audio-conversation.png`, `audio-listening.png`, `audio-pronunciation.png`, `audio-mobile-390.png`.

**Batasan.** Voice bergantung pada sistem/browser; Chromium uji tidak memiliki voice Jepang sehingga sebagian verifikasi memakai mock, bukan perangkat fisik. Kualitas pelafalan berbeda antardevice. Belum ada aset rekaman, caching TTS, mode offline audio, atau evaluasi Open JTalk yang di-deploy. Fase 15 (CMS) tetap blocked.

### 2.23 Deliverable Fase 17 — Japanese Handwriting & Stroke Order Studio

Fase 17 mengimplementasikan **Studio menulis** untuk hiragana, katakana, dan kanji. Data goresan berasal dari **KanjiVG commit `610091ce618cf757ed1357a8954cd65283e015d6`**, bukan gambar ulang atau urutan karangan. Importer `scripts/import-kanjivg.mjs` menghasilkan **259 glyph unik** (111 kanji + komponen 148 kana unik) dan menempatkannya di `public/writing/kanjivg/` bersama manifest. Katalog menulis memiliki **319 entri**: 208 kana (termasuk yōon) dan 111 kanji. Karena yōon terdiri dari dua karakter, UI menampilkan komponen secara berurutan dan tidak mengarang satu glyph gabungan.

**Lisensi dan atribusi.** KanjiVG oleh Ulrich Apel dan kontributor berlisensi **CC BY-SA 3.0**. Atribusi, tautan sumber, dan catatan share-alike tersedia di `THIRD_PARTY_NOTICES.md`, `public/licenses/kanjivg-CC-BY-SA-3.0.txt`, `public/writing/kanjivg/README.txt`, dan panel “Sumber data goresan” pada halaman karakter. Data turunan (JSON koordinat) tetap tunduk pada lisensi yang sama; aplikasi tidak mengklaim kepemilikan atas data goresan.

**Tiga mode latihan.**

| Mode | Perilaku |
| --- | --- |
| Animasi | Menampilkan nomor, arah, titik awal/akhir, dan animasi goresan; kontrol main/jeda/ulang, sebelumnya/berikutnya, ulangi goresan aktif, serta kecepatan Lambat/Normal/Cepat |
| Tirukan | Referensi samar + grid; Pointer Events untuk mouse, sentuhan, dan stylus; setiap goresan dibandingkan dengan goresan referensi dan dinilai otomatis |
| Mandiri | Kanvas kosong, pilihan grid, undo, reset, toggle referensi, dan tombol “Nilai gambar” untuk membandingkan hasil dengan data goresan |

**Evaluasi geometri, bukan pengenalan tulisan tangan.** `src/lib/writing-geometry.ts` menyeragamkan jalur ke 24 titik, lalu menghitung kemiripan bentuk, jarak titik awal/akhir, dan arah. Skor per goresan adalah 55% bentuk + 12% awal + 12% akhir + 21% arah; skor keseluruhan 82% bentuk + 18% jumlah goresan. Goresan yang hilang bernilai 0. `orderMistakes` hanya dihitung untuk goresan yang cukup cocok (≥45) dan penalti urutan dibatasi 24 poin. Ambang “dikuasai” adalah 80. UI menyebutnya **perkiraan geometri** dan secara eksplisit menyatakan bahwa ini bukan pengenalan tulisan tangan, bukan penilaian estetika, dan bukan sertifikasi. Pengguna tetap dapat menilai sendiri hasilnya.

**Konten per karakter.** Setiap entri menampilkan karakter, jenis, romaji, jumlah goresan, contoh kata, dan catatan kesalahan umum. Kanji juga menampilkan arti, on’yomi, kun’yomi, radikal, mnemonic, dan contoh kata. Kana tidak diberi “arti” palsu; `meanings` sengaja kosong karena kana adalah bunyi. Lima tahap katalog: **A Hiragana, B Katakana, C kanji N5–N4, D kanji N3–N2, E kanji N1**. Catatan bentuk orisinal mencakup sekitar 45 karakter yang mudah tertukar; karakter lain memakai panduan umum dari data goresan.

**Progres dan integrasi.** Tabel ke-14, `writing_attempts`, menyimpan mode, skor, jumlah goresan yang diharapkan/digambar, kesalahan urutan, durasi, dan waktu. XP 15 hanya diberikan pada percobaan pertama per karakter. Snapshot memuat maksimal 400 attempt; statistik menampilkan karakter dilatih, dikuasai, total latihan, dan kesalahan urutan. Dua pencapaian baru—**Langkah pertama menulis** dan **20 karakter dikuasai**—menjadikan total 23. Dasbor menampilkan kartu Menulis; detail kana/kanji menautkan ke halaman latihan; ekspor/impor/reset mencakup writing. Tidak ada endpoint baru selain `POST /api/progress/writing`.

**Verifikasi.** `npm run check` lulus **38 berkas / 227 tes**; `npm run build` lulus **97 halaman statis + 6 rute detail dinamis + 19 API**. Playwright pada build produksi/DB terisolasi memeriksa 319 kartu, detail 日, kontrol animasi, tirukan yang menyimpan skor 46, riwayat setelah reload, kanvas mandiri, pointer sentuh/undo, 320 px tanpa overflow, mode gelap 1440 px, reduced-motion, serta ekspor–reset–impor yang memulihkan attempt writing. Screenshot di `.screenshots/writing/`.

**Batasan.** Skor adalah kemiripan geometri, bukan pengenalan tulisan tangan; posisi, ukuran, dan perangkat pointer dapat mengubah hasil. Belum ada pengujian stylus/perangkat fisik. Catatan bentuk hanya terkurasi untuk sekitar 45 karakter. Snapshot membatasi 400 attempt meski impor menerima hingga 5.000. Data KanjiVG mewajibkan atribusi dan share-alike untuk distribusi turunan. CMS tetap blocked.

### 2.24 Deliverable Fase 18 — Japanese Story Theater & Animated Conversation

Fase 18 menambahkan **Teater cerita** untuk membaca, mendengar, dan menonton cerita Jepang orisinal. Fitur ini bukan pengganti modul percakapan: `/conversation` dan enam skenario lamanya tetap utuh. Teater cerita memakai domain baru, rute baru, dan mesin panggung yang dapat dipakai ulang oleh cerita lain tanpa menulis ulang adegan.

**Konten awal.** Tiga cerita orisinal dengan total **9 adegan, 36 baris dialog, dan 9 soal**:

| Cerita | Level | Adegan | Baris | Latar | Fokus |
| --- | --- | ---: | ---: | --- | --- |
| Hari Pertama di Stasiun | N5 | 3 | 12 | `station`, `platform`, `train` | Perkenalan, tiket, arah, percakapan sopan |
| Kafe Kecil | N5 | 3 | 12 | `cafe`, `table` | Memesan, rasa, ucapan terima kasih |
| Rencana di Hari Hujan | N4 | 3 | 12 | `park-rain`, `library` | Cuaca, rencana, ajakan, `tara`/`teiru` |

Setiap baris memuat penutur, teks Jepang ber-furigana, reading kana, romaji, arti Indonesia, ekspresi, dan referensi kosakata/tata bahasa. Semua `vocabIds` dan `grammarIds` diverifikasi terhadap katalog nyata; tes konten memastikan `furiganaReading(line.jp)` sama dengan `line.reading`, ID unik, penutur berada di daftar karakter, karakter panggung valid, dan indeks jawaban berada dalam batas. Cerita juga memiliki ringkasan, level, kesulitan, estimasi menit, tag, catatan budaya, dan pertanyaan pemahaman/menyimak.

**Mesin panggung.** `src/components/story/story-stage.tsx` merender latar SVG orisinal untuk delapan jenis latar (`station`, `platform`, `train`, `cafe`, `table`, `park-rain`, `library`, `street`), karakter SVG dengan lima ekspresi (netral, senang, terkejut, khawatir, berpikir), posisi panggung (jauh kiri, kiri, tengah, kanan, jauh kanan), animasi masuk fade/slide, idle halus, efek hujan/salju/kelopak, dan gelembung dialog. Penutur aktif diberi sorotan. Animasi dinetralkan oleh aturan `prefers-reduced-motion` global. Tidak ada aset gambar eksternal atau karakter berhak cipta.

Panggung menerima `StoryScene.videoUrl` opsional sebagai seam untuk video pra-render same-origin. Bila kosong, latar SVG/CSS dipakai; bila gagal dimuat, panggung kembali ke SVG. Tidak ada cerita yang memakai video saat ini, tidak ada pipeline aset/CMS, dan ekspor video belum diimplementasikan.

**Mode dan kontrol.** `/stories` adalah hub dengan filter level, statistik percobaan/cerita selesai/skor terbaik, dan kartu cerita. `/stories/[id]` adalah teater dengan dua mode:

| Mode | Perilaku |
| --- | --- |
| Belajar | Dialog dimajukan manual; pengguna dapat memutar baris, mengulang, memilih baris/adegan, dan membaca penjelasan |
| Tonton | Audio diputar dan dialog maju otomatis setelah baris selesai, dengan jeda pendek; panggung berpindah mengikuti dialog |

Kontrol mencakup putar/jeda/lanjut, hentikan, sebelumnya/berikutnya, ulangi baris, mulai ulang, kecepatan 0,75–1,50×, pilihan voice Jepang, navigasi 12 baris dan tiga adegan, progress bar, serta toggle subtitle Jepang, furigana, romaji, terjemahan Indonesia, mode Jepang saja, kosakata, dan tata bahasa. Mode Jepang saja menyembunyikan terjemahan/romaji dan memaksa gelembung dialog tampil.

**Audio.** Teater memakai pemutar audio global Fase 16 dan hanya voice `ja-JP`. Setiap baris dapat memiliki `audioUrl` same-origin sebagai aset rekaman opsional; bila tidak ada atau gagal, browser TTS menjadi fallback. Bila tersedia minimal dua voice Jepang, teater memetakan voice berbeda per karakter secara round-robin; bila hanya satu, semua karakter memakai voice yang sama dan UI menyatakan bahwa Kotoba tidak memalsukan beberapa voice native. Sorotan bersifat **per baris**, bukan per kata; tidak ada klaim sinkronisasi kata karena Web Speech tidak memberi timing yang andal.

**Pembelajaran dan progres.** Kosakata pada dialog dapat dibuka sebagai modal kamus dan disimpan ke kamus pribadi. Tata bahasa membuka modal pola/penjelasan/formasi. Setelah cerita, kuis berisi pertanyaan pemahaman dan menyimak (opsi audio per soal) dengan pembahasan. Hasil disimpan ke tabel ke-15 `story_attempts`; XP 25 hanya diberikan pada penyelesaian pertama per cerita. Skor ≥60 dihitung sebagai cerita selesai untuk statistik, tetapi bukan sertifikasi JLPT. Ringkasan kosakata dan tautan tata bahasa ditampilkan setelah kuis, bersama tombol ulangi cerita. Dua pencapaian baru—**Cerita pertama** dan **Tiga cerita selesai**—menjadikan total 25. Endpoint ke-20 adalah `POST /api/progress/story`; ekspor/impor/reset mencakup cerita, dengan batas snapshot 300 attempt dan impor 1.000 baris.

**Verifikasi.** `npm run check` lulus **39 berkas / 235 tes**; `npm run build` lulus **101 halaman statis + 6 rute detail dinamis + 20 API**. Smoke QA 34 pola rute HTTP 200, H1 sesuai, 0 error konsol. Playwright memeriksa hub, tiga cerita, toggle terjemahan/furigana, navigasi baris, mode tonton yang maju otomatis, kuis 100% dan penyimpanan, kamus, fallback tanpa voice Jepang, persistensi attempt, mobile 390 px, serta 0 error halaman. Screenshot di `.screenshots/story/`.

**Batasan.** Hanya tiga cerita (dua N5, satu N4); belum ada cerita N3–N1. Sinkronisasi audio hanya per baris. Voice per karakter bergantung pada ketersediaan beberapa voice Jepang di perangkat. Belum ada video export, CMS, atau pipeline aset video; seam `videoUrl` belum diuji dengan aset nyata. Belum ada checkpoint/resume cerita. Snapshot membatasi 300 attempt meski impor menerima 1.000. Kamus hanya membuka kosakata yang dikurasi pada baris, bukan setiap kata. Verifikasi audio memakai mock voice di Chromium; belum ada pengujian perangkat fisik atau screen reader.

### 2.25 Deliverable Fase 19 — Integration, QA, Performance & Accessibility

Fase 19 adalah **stabilisasi lanjutan**, bukan ekspansi produk. Setelah Fase 16–18 menambahkan studio audio, studio menulis, dan teater cerita, fase ini memeriksa apakah ketiganya terhubung dengan alur belajar yang ada, apakah salinan produk masih benar, dan apakah tidak ada regresi lintas rute. Tidak ada modul, tabel, endpoint, dependensi, CMS, atau pipeline video baru.

**Perubahan kode.**

| Berkas | Perubahan | Alasan |
| --- | --- | --- |
| `src/lib/writing-links.ts` (baru) | Helper murni `writingHrefForContentRef(ref)`: hanya `kana`/`kanji` yang dipetakan ke `/writing/writing-<id>` terenkode; `vocabulary` dan id kosong/diawali `writing-` menghasilkan `null` | Pelajaran perlu menaut ke detail menulis tanpa mengimpor katalog KanjiVG/writing yang berat ke bundle pelajaran |
| `src/components/lesson-player.tsx` | Tombol **Latihan menulis** muncul bila `contentRefs` pelajaran memuat kana/kanji; memakai helper di atas | Menutup integrasi pelajaran→Studio Menulis yang sebelumnya hanya bisa dicapai lewat menu |
| `src/content/lessons/kanji.ts` | Salinan instruksi goresan dikoreksi: animasi ada di Studio Menulis, data mengikuti KanjiVG, dan pembaca diminta memverifikasi kamus tepercaya | Menghapus klaim usang bahwa urutan goresan dapat dilihat langsung di pelajaran |
| `src/lib/writing-links.test.ts` (baru), `src/lib/writing.test.ts` | Tes memastikan referensi hiragana/katakana/kanji menghasilkan ID detail yang valid setelah `decodeURIComponent`, sedangkan referensi kosakata menghasilkan `null` | Mencegah tautan mati saat katalog berubah |

Tidak ada perubahan pada 15 tabel SQLite atau 20 route API. `POST /api/progress/writing` dan `POST /api/progress/story` tetap satu-satunya endpoint progres khusus fitur baru.

**QA integrasi.** Build produksi dijalankan pada server QA terisolasi dengan `KOTOBA_DB_PATH=.data/kotoba-phase19-qa.db`, lalu diperiksa memakai Playwright Chromium:

| Pemeriksaan | Cakupan | Hasil |
| --- | --- | --- |
| Sapuan rute | 34 pola rute × desktop 1440×900, mobile 390×844, mobile 320×720 | **102/102 lulus**: HTTP 200, tepat satu `h1`, `lang=id`, overflow halaman ≤2 px, 0 error konsol, 0 request gagal |
| Perjalanan A — kana tanpa voice | `/kana`, buka あ, putar pelafalan | Toast jujur "Belum ada suara Jepang (ja-JP)"; tidak ada crash atau fallback voice non-Jepang |
| Perjalanan B — tata bahasa | `/grammar/g-desu`, audio kalimat contoh | Fallback tanpa voice tampil benar; tidak ada klaim audio tersedia |
| Perjalanan C — menulis hiragana | `/writing/writing-hiragana-あ`, tirukan + mandiri + simpan | 1 glyph dimuat, goresan tercatat, skor 18, `POST` 200, label "Tersimpan" muncul, snapshot writing bertambah 1 |
| Perjalanan D — animasi kanji | `/writing/writing-kanji-日` | "Goresan 2 dari 4" berpindah dari 1 ke 2; kontrol animasi berfungsi |
| Perjalanan E — teater cerita | `/stories/story-eki-hajimete` | Adegan 1 tampil, peringatan tanpa voice tampil, terjemahan true→false, baris maju/putar, kuis 3 grup, simpan 200, snapshot cerita bertambah 1, 0 request eksternal |
| Perjalanan F — CMS | `/admin`, `/api/admin`, tautan CMS di `/settings` | Keduanya 404 dan tidak ada tautan CMS. Ini menegaskan **Fase 15 tetap blocked**, bukan fitur yang lulus |

Satu observasi awal menunjukkan dua `h1` pada `/dictionary/collections` di desktop 1440; halaman memiliki satu `PageHeader` dan fenomena itu tidak dapat direproduksi pada muat baru, `networkidle`, maupun pengulangan urutan rute yang sama. Karena tidak ada bukti produk yang konsisten, observasi dicatat sebagai flaky dan **tidak diklaim sebagai bug yang diperbaiki**.

**Performa.** Pengukuran transfer Chromium untuk halaman utama fitur:

| Rute | Total transfer | JS | CSS | fetch | Glyph KanjiVG |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/writing` | 610.351 B | 517.820 B | 21.065 B | 70.892 B | 0 |
| `/writing/writing-kanji-日` | 584.552 B | 511.087 B | — | — | 1 |
| `/writing/writing-hiragana-あ` | 584.490 B | 511.087 B | — | — | 1 |
| `/stories/story-eki-hajimete` | 572.832 B | 500.873 B | — | — | 0 |
| `/kana` | 581.102 B | — | — | — | — |
| `/grammar/g-desu` | 602.419 B | — | — | — | — |
| `/learn/les-kana-hiragana-basic` | 585.286 B | — | — | — | — |

Angka total mencakup prefetch/RSC Next.js, bukan hanya muatan awal. Glyph KanjiVG dimuat per detail (0 di hub, 1 di detail). Tidak ada gambar, video, atau aset media eksternal pada teater cerita. Optimasi bundle lebih lanjut tetap menjadi pekerjaan Fase 20, bukan klaim selesai.

**Aksesibilitas.** Lima rute sampel (`/`, `/kana`, `/writing`, `/stories/story-eki-hajimete`, `/audio`) diperiksa untuk kontrol tanpa nama aksesibel: **0 tombol/tautan tanpa nama**. Audit screen reader penuh, urutan fokus seluruh alur, dan pengujian perangkat fisik belum dilakukan dan tetap tercatat sebagai concern.

**Verifikasi.** `npm run check` lulus **39 berkas / 236 tes**; `npm run build` lulus **101 halaman statis + 6 rute detail dinamis + 20 route API**; `npm run typecheck` dan `npm run lint` bersih. Laporan QA tersimpan di `.data/phase19-report.json` (waktu selesai 2026-11-08T21:23:37Z; tanggal lokal 2026-11-09).

**Batasan.** Pengujian browser memakai Chromium teremulasi, bukan iOS Safari/Android fisik; audio memakai kondisi tanpa voice Jepang dan mock voice, bukan perangkat bersuara Jepang. Audit aksesibilitas terbatas pada nama kontrol di lima rute. Angka transfer ~500 KB JS tidak boleh disebut sebagai seluruh dataset dimuat. CMS, pipeline video, ekspor video, checkpoint cerita, dan kamus kata arbitrer tetap tidak ada. Deployment publik tetap diblokir sampai auth, TLS, dan rate limiting tersedia.

---

## 3. Arsitektur singkat

```text
Halaman App Router + komponen fitur
  → AppShell (16 navigasi, tema, drawer, mobile nav)
  → ProgressProvider / ToastProvider (React Context)
  → ExerciseRunner → ExerciseCard (9 jenis)
  → GamesHub → enam permainan → domain murni di lib/games
  → ExamHub → ExamEngine (4 mode) → halaman sesi/hasil → recordExam
  → PlanPage → StudyPlan (jadwal deterministik dari katalog + progres + Settings)
  → TypingPage → TypingEngine (3 mode, pemeriksaan lokal) → recordLesson/recordSession
  → ConversationHub → ConversationPlayer (6 skenario) → recordLesson
  → AudioStudio (6 kategori) + AudioPlayerCard → AudioPlayer (Web Speech `ja-JP`, antrean, play/pause/resume/stop/repeat, kecepatan, voice)
  → WritingHub → WritingStudio (Animasi/Tirukan/Mandiri) → evaluasi geometri → recordWriting
  → StoryHub → StoryTheater → StoryStage (SVG/CSS, karakter, gelembung, audio `ja-JP`, kuis) → recordStory
  → lib (exercise-engine, exam-engine, SRS, XP, speech, speech-recognition, audio-player, furigana, quiz, games, culture-facts, goals, streak, history, recommendations, typing, study-plan, writing, writing-geometry, content-qa)
  → scripts/backup-db.mjs + .github/workflows/quality.yml (operasional)
  → Route Handlers /api/progress/* (termasuk /card, /exam, /favorite, /saved, /collections, /writing, /story)
  → server/progress-service.ts (validasi + transaksi)
  → node:sqlite (.data/kotoba.db, 15 tabel)
Konten: src/content/*.ts (bertipe)
  → lessons/ (70 LessonPlan N5, termasuk 8 membaca/menyimak)
  → curriculum.ts (39 modul / 154 pelajaran / 644 ref)
  → listening-drills.ts (15 drill) + pronunciation-guide.ts (6 topik)
  → conversations.ts (6 skenario / 19 langkah / 18 frasa kunci)
  → writing-notes.ts + public/writing/kanjivg/*.json (319 entri / 259 glyph)
  → stories.ts (3 cerita / 9 adegan / 36 dialog / 9 soal)
  → culture/ (33 artikel + registry sumber + kuis + fakta)
```

Persistensi tetap **SQLite server-side sebagai sumber kebenaran**; localStorage hanya cache baca. Tidak ada auth, sinkronisasi, atau tulis offline. Detail ada di [ARCHITECTURE.md](ARCHITECTURE.md) dan ADR-018/028/029/030/031/032/033/034/038/039/040/041/047/048/049/050/051/052/053/054/055/056/057/058/059/060/061/062/063.

---

## 4. Modul pengguna

| Modul | Status |
| --- | --- |
| Dasbor | Selesai — ringkasan 6 metrik, target, rekomendasi explainable, ujian terbaru, lanjutan, ulangan, pencapaian, JLPT, heatmap |
| Belajar | Selesai — 39 modul / 154 pelajaran, Jalur N5, 70 pelajaran interaktif, 60% unlock |
| Kana | 208 karakter: bagan, detail, mnemonik, TTS, kuis, mastery |
| Kosakata | 214 kata: pencarian/filter, contoh, SRS, kuis engine |
| Kanji | 111 kanji: on/kun, radikal, contoh, kuis, SRS |
| Tata bahasa | 45 pola N5–N1: formasi, penjelasan, kesalahan umum, latihan engine |
| Membaca | 12 teks: furigana, terjemahan, kosakata, soal engine |
| Menyimak | 12 dialog + 15 drill kilat: Web Speech, mode lambat, transkrip, soal engine, filter level |
| Latihan | Kuis adaptif 9 jenis + susun kalimat |
| **Permainan** | **Enam permainan: pembuat kata, cocokkan kana, kejar kosakata, susun kalimat, tantangan kanji, tantangan harian** |
| Pelafalan | 17 latihan + 6 topik panduan: audio normal/lambat, rekaman lokal 30 detik, ASR opsional berbasis teks, cek mandiri |
| Ujian | Empat mode: latihan, simulasi, topik, acak; timer, penanda, analitik, pembahasan, ulang soal salah, tambah kartu |
| Budaya | 33 artikel / 6 kelompok / 8 kategori: fakta harian & acak, favorit persisten, kuis mini, sumber, kosakata bertaut kamus, materi terkait, label register |
| Kamus | 370 entri kosakata/kanji/tata bahasa, pencarian + detail, kosakata terkait, kanji beradikal sama; kamus pribadi dengan simpan, catatan, koleksi, dan ulasan tersimpan |
| **Rencana belajar** | **Target level/rentang minggu, jadwal mingguan deterministik, feasibility, milestone, dan saran durasi** |
| **Mengetik** | **Tiga mode: Kana→Romaji (tanpa IME), Romaji→Kana, Arti→Kanji; 5/10/15 soal, akurasi, tinjauan** |
| **Percakapan** | **Enam skenario / 19 langkah: pilihan berlabel register, feedback, transkrip, frasa kunci, catatan budaya** |
| Statistik | Statistik, heatmap, tren 30 hari, kalender bulanan, timeline, target, mastery, 25 pencapaian, riwayat latihan/game/ujian/menulis/cerita |
| **Studio audio** | **Selesai — 6 kategori materi, Web Speech `ja-JP`, play/pause/resume/stop/repeat, kecepatan 0,75–1,50×, pemilihan voice, diagnostik jujur, fallback tanpa voice non-Jepang** |
| **Studio menulis** | **Selesai — 319 entri/259 glyph KanjiVG, 5 tahap, animasi + kontrol per goresan, kanvas tirukan/mandiri dengan Pointer Events, evaluasi geometri jujur, progres dan 2 pencapaian** |
| Pengaturan | Profil, tema, romaji/furigana, kecepatan audio 0,5–1,5×, voice Jepang, empat target + frekuensi, XP, ekspor/impor/reset |
| **Teater cerita** | **Selesai — 3 cerita / 9 adegan / 36 dialog / 9 soal; panggung SVG/CSS, karakter/ekspresi, mode belajar/tonton, audio `ja-JP`, kamus, kuis, tabel `story_attempts`** |

---

## 5. Jumlah konten v0.1.0

| Jenis | Jumlah |
| --- | ---: |
| Kana | 208 (104 hiragana + 104 katakana) |
| Kosakata | 214 (N5 159, N4 29, N3 19, N2 5, N1 2) |
| Kanji | 111 (N5 65, N4 24, N3 12, N2 7, N1 3) |
| Tata bahasa | 45 (N5 20, N4 11, N3 9, N2 3, N1 2) |
| Bacaan | 12 (N5 4, N4 3, N3 3, N2 1, N1 1) |
| Menyimak (dialog) | 12 (N5 4, N4 3, N3 2, N2 1, N1 2) |
| Drill menyimak | 15 (N5 3, N4 3, N3 3, N2 3, N1 3) |
| Soal audio | 51 (12 dialog × 3 + 15 drill) |
| Budaya | 33 (9 budaya, 7 makanan, 5 geografi, 4 sejarah, 5 anime, 3 fakta bahasa) |
| Fakta budaya | 132 (4 per artikel) |
| Kuis budaya | 66 (2 per artikel) |
| Susun kalimat | 28 (N5 8, N4 8, N3 6, N2 4, N1 2) |
| Pelafalan | 17 (N5 5, N4 4, N3 4, N2 2, N1 2) |
| Panduan pelafalan | 6 topik bunyi |
| Rencana pelajaran interaktif | 70 (semua N5, termasuk 8 membaca/menyimak) |
| Simulasi percakapan | 6 skenario / 19 langkah / 18 frasa kunci |
| Mode latihan mengetik | 3 (Kana→Romaji, Romaji→Kana, Arti→Kanji) |
| Rencana belajar | Diturunkan; tidak disimpan sebagai tabel |
| Entri studio menulis | 319 (208 kana + 111 kanji) dalam 5 tahap |
| Glyph KanjiVG terimpor | 259 glyph unik; 111 kanji + komponen 148 kana; ±1,6 MB JSON + manifest; CC BY-SA 3.0 |
| Catatan bentuk menulis | ±45 karakter yang mudah tertukar |
| Cerita orisinal | 3 (N5 2, N4 1) |
| Adegan cerita | 9 (3 per cerita) |
| Baris dialog cerita | 36 (12 per cerita) |
| Soal cerita | 9 (3 per cerita; pemahaman + menyimak) |
| Latar panggung | 8 jenis SVG orisinal |

Katalog turunan: **39 modul, 154 pelajaran, 644 referensi konten**. Jalur N5 memiliki 70 pelajaran katalog dan **seluruhnya interaktif**, termasuk delapan pelajaran membaca/menyimak N5 yang memakai blok `jp-prose`/`dialog` dan soal sumber yang telah diaudit. Kamus terpadu menampilkan 370 entri. Budaya mencakup 33 artikel dengan 132 fakta dan 66 soal kuis mini; favorit disimpan di SQLite, bukan hanya di browser.

---

## 6. Verifikasi

Dijalankan pada 2026-11-09 dari /home/akihira17/personal/kotoba:

| Perintah | Hasil |
| --- | --- |
| npm run typecheck | Lulus, 0 error |
| npm run lint | Lulus, 0 error / 0 warning |
| npm run test | **39 file, 236 tes lulus** |
| npm run build | Lulus; 101 halaman statis (termasuk 70 halaman pelajaran, `/stories`, 3 detail cerita, `/writing`, dan `_not-found`), 6 rute detail dinamis, + 20 route API |
| Verifikasi browser produksi | 34 pola rute pengguna HTTP 200, H1 sesuai, 0 console error; termasuk `/writing`, `/stories`, dan detail cerita |
| Playwright Fase 17 | Studio menulis: 319 kartu, detail 日, kontrol animasi, tirukan menyimpan skor 46, riwayat setelah reload, kanvas mandiri, pointer sentuh/undo, 320 px tanpa overflow, mode gelap 1440 px, reduced-motion, ekspor–reset–impor writing; 0 console/page error |
| Smoke QA Fase 17 | 32 pola rute HTTP 200 dengan H1 sesuai, 0 error konsol; `/writing` dan `/writing/writing-kanji-%E6%97%A5` termasuk |
| Playwright Fase 18 | Teater cerita: 3 cerita, toggle terjemahan/furigana, navigasi baris, mode tonton maju otomatis, kuis 100% tersimpan, kamus, fallback tanpa voice Jepang, persistensi attempt, mobile 390 px; 24 pemeriksaan, 0 console/page error |
| Smoke QA Fase 18 | 34 pola rute HTTP 200 dengan H1 sesuai, 0 error konsol; `/stories` dan `/stories/story-eki-hajimete` termasuk |
| Playwright Fase 19 | Integrasi lintas fitur: 34 pola rute × desktop 1440/mobile 390/mobile 320 = **102/102** HTTP 200, satu `h1`, `lang=id`, 0 overflow/error; 6 perjalanan kritis (kana tanpa voice, tata bahasa, menulis hiragana, animasi kanji, teater cerita, CMS blocked) lulus; 0 kontrol tanpa nama di 5 rute sampel |
| Smoke QA Fase 19 | Build produksi + DB QA terisolasi: sapuan rute dan 6 perjalanan selesai tanpa kegagalan; satu observasi `h1` ganda di `/dictionary/collections` tidak dapat direproduksi dan tidak diklaim sebagai bug |
| Playwright Fase 16 | Studio audio: fallback tanpa voice Jepang, mock voice `ja-JP` untuk play/pause/resume/stop, kecepatan 0,75–1,50×, penghentian saat pindah rute, kontrol di bacaan/percakapan/menyimak/pelafalan, mobile 390 px; 0 console/page error |
| Smoke QA Fase 16 | 30 pola rute HTTP 200 dengan H1 sesuai, 0 error konsol; `/audio` termasuk |
| Playwright Fase 12 | Simulasi ujian 29 soal selesai (34%, analitik/review); percakapan 3 langkah 100% tersimpan; mengetik 5 soal 0/5 tersimpan; impor: pratinjau modal, Batal mempertahankan profil, Ya timpa mengganti profil; mobile gelap 390px; 0 console error |
| Pengamanan Fase 12 | Same-origin JSON reset 400, origin localhost 400, cross-origin 403, text/plain 415, Host evil.example 421, CSP/header ada; DB 0600, direktori 0700 |
| Probe UI Fase 12 | Tema lokal gelap bertahan vs server sistem; kontras tombol 6,44:1; satu h1 desktop; /plan & /kana tanpa overflow 390px; target sentuh 24px; 0 teks Jepang tanpa lang=ja; fokus soal berpindah ke prompt |
| Playwright Fase 11 | Skenario percakapan dijawab salah lalu benar sampai selesai dan tersimpan; mengetik 5 soal sampai hasil dan tersimpan; rencana N4/8 minggu disimpan dan persist setelah reload; kamus 黒 menampilkan kosakata terkait; kanji 日 menampilkan kanji beradikal sama; halaman baru diuji desktop/mobile; 0 console error |
| Playwright Fase 10 | Build final setelah polish: 24 rute HTTP 200, Dasbor (ringkasan, target, saran, ujian), Statistik (kalender, timeline, tren 30 hari), koleksi (catatan, buat koleksi, modal ulasan, badge level tunggal), simpan kosakata baru, target 45 menit persist setelah reload, mode gelap + mobile; 0 console error |
| Penyelarasan Fase 12 | `npm run check` ulang (32 file/199 tes), `npm run build` ulang (87 rute + dinamis + 18 API), dan smoke 29 rute; tidak ada error konsol |
| Reflow Fase 13 | 29 pola rute pada 320 dan 400 px: 0 overflow, 0 error konsol, 0 non-200; `/`, `/vocabulary`, `/exams`, `/settings` diperbaiki di 320 px |
| Konten Fase 13 | 8 pelajaran membaca/menyimak dirender; validator QA semantik 0 error struktural pada dataset nyata |
| Backup Fase 13 | Backup 151.552 byte, integrity ok, 13 tabel, restore roundtrip, retensi; direktori 0700/file 0600 |
| Penyelarasan akhir Fase 13 | `npm run check` ulang (34 file/206 tes), `npm run build` ulang (94 halaman statis + 5 route detail dinamis + 18 API), smoke 29 rute |
| Audit Fase 14 | Read-only; tidak ada QA/test/build berjalan; health produksi ok versi 0.1.0; 111/111 kanji + 208/208 kana KanjiVG; 259 karakter/690.664 byte; tidak ada mutasi DB atau kode |
| Audit mobile Fase 14B | 29 rute × 9 viewport = 261 pemuatan; semua HTTP 200; 0 error runtime; 0 overflow halaman; `scrollWidth` = viewport di 320–1920 |
| Playwright mobile Fase 14B | 18 langkah fungsional pada 390×844 lulus: drawer, pelajaran, kana, kosakata, tata bahasa, bacaan, menyimak, latihan, permainan, ujian, mengetik, percakapan, rencana, tema, kamus, statistik |
| Penyelarasan akhir Fase 14B | `npm run check` ulang (34 file/206 tes); `npm run build` ulang (94 statis + 5 dinamis + 18 API); audit final 9 viewport 0 overflow |
| Penyelarasan akhir Fase 18 | `npm run check` ulang (39 file/235 tes); `npm run build` ulang (101 statis + 6 dinamis + 20 API); smoke 34 rute 0 error |
| Playwright Fase 9 | Hub 33 artikel, fakta harian, enam kelompok, pencarian/filter, favorit via API + persist setelah reload, filter favorit, detail "Tersimpan", kuis mini dengan umpan balik, 3 sumber eksternal, tautan kosakata ke kamus terisi, mode gelap + mobile; 0 console error |
| Playwright Fase 8 | Latihan kosakata 5 soal (cek langsung, pembahasan, tanda soal, tambah kartu), hasil skor belajar, filter review, ulang soal salah, simulasi bertimer + navigasi + submit, riwayat 2 attempt, empty state sesi/hasil, mobile; 0 console error |
| Playwright Fase 7 | Panduan 6 topik, perekam mikrofon palsu + replay + hapus, fallback ASR tanpa API, filter N3, latihan menyimak; 0 console error |
| Playwright Fase 6 | Enam permainan dimainkan sampai selesai, riwayat tersimpan (6 attempt, skor terbaik 491, 0 console error) |
| Playwright Fase 5 | 9 jenis latihan tampil dan dapat dijawab; retry soal salah; flashcard reveal/rating; kuis kosakata; ujian timer + submit; riwayat tersimpan — lulus |
| API snapshot | Attempt permainan dan statistik terhitung; ekspor/impor termasuk permainan — lulus |

Verifikasi browser memakai **build produksi** di port uji terisolasi (3102/3103/3104) dengan `KOTOBA_DB_PATH` terpisah. Dev server tidak dipakai untuk verifikasi karena Next dev memblokir resource lintas-origin pada lingkungan ini dan halaman tidak terhidrasi. Pada awal Fase 12, smoke API sempat dijalankan ke server produksi dan menulis contoh ke database pengguna; data tersebut telah direset, dan seluruh verifikasi berikutnya memakai DB terisolasi. Pengujian Fase 7 memakai Chromium dengan mikrofon palsu dan memeriksa fallback dengan menghapus konstruktor `SpeechRecognition`/`webkitSpeechRecognition` dari window. Pengujian Fase 8 memakai DB terisolasi `kotoba-phase8-verify.db` dan menguji alur ujian lengkap, termasuk panggilan `POST /api/progress/card`. Pengujian Fase 9 memakai DB terisolasi `kotoba-phase9-verify.db` dan memeriksa favorit melalui `POST /api/progress/favorite`; build produksi akhir kemudian dijalankan pada database pengguna tanpa mengubah data belajar. Pengujian Fase 10 memakai DB terisolasi `kotoba-phase10-verify.db` dengan data contoh (profil 640 XP, 18 hari aktivitas, kartu jatuh tempo, attempt ujian/kuis/permainan, catatan dan koleksi). Pengujian Fase 11 memakai DB terisolasi `kotoba-phase11-verify.db` dan memeriksa penyimpanan lesson percakapan/mengetik, target rencana N4/8 minggu, kamus/kanji terkait, serta tampilan mobile. Pengujian Fase 12 memakai DB terisolasi `kotoba-qa2.db` di port 3102; smoke API awal sempat menulis ke DB pengguna, lalu DB pengguna direset ke kondisi bersih sebelum build final dijalankan. API diuji terpisah: simpan/hapus materi, koleksi, validasi id katalog, persistensi target, snapshot lesson baru, dan penolakan request lintas-origin/konten non-JSON.

Screenshot Fase 11 tersimpan di `.screenshots/`: `kotoba_phase11_conversation_list.png`, `kotoba_phase11_conversation_dialog.png`, `kotoba_phase11_conversation_feedback.png`, `kotoba_phase11_conversation_result.png`, `kotoba_phase11_conversation_mobile.png`, `kotoba_phase11_typing_start.png`, `kotoba_phase11_typing_result.png`, `kotoba_phase11_typing_mobile.png`, `kotoba_phase11_plan.png`, `kotoba_phase11_plan_saved.png`, `kotoba_phase11_plan_mobile.png`, `kotoba_phase11_dictionary_related.png`, dan `kotoba_phase11_kanji_related.png`. Screenshot Fase 12: `kotoba_phase12_mobile_dark.png` dan `kotoba_phase12_plan_mobile_fixed.png`. Screenshot Fase 14B tersimpan di `.screenshots/mobile-audit/`. Screenshot Fase 16 tersimpan di `.screenshots/audio/`: `audio-no-voice.png`, `audio-voice.png`, `audio-no-voice-settings.png`, `audio-reading.png`, `audio-conversation.png`, `audio-listening.png`, `audio-pronunciation.png`, dan `audio-mobile-390.png`. Screenshot Fase 17 tersimpan di `.screenshots/writing/`: `writing-hiragana.png`, `writing-hub-320.png`, `writing-hub-mobile.png`, `writing-detail-mobile.png`, `writing-detail-dark-1440.png`, dan `writing-guided-result.png`. Screenshot Fase 18 tersimpan di `.screenshots/story/`: `story-hub.png`, `story-study.png`, `story-watch.png`, `story-quiz.png`, `story-no-voice.png`, dan `story-mobile-390.png`. Screenshot Fase 6–13 tetap tersimpan sebagai riwayat.

---

## 7. Batasan dan gap yang diketahui

1. **Penilaian latihan dan permainan berjalan di klien.** Server menghitung ulang agregat dan statistik, tetapi belum menilai ulang jawaban dari kunci konten. Ini bukan anti-cheat; deployment publik memerlukan verifikasi server-side.
2. **Mengetik memakai pencocokan string, bukan konversi IME/romaji otomatis.** Varian yang diterima harus ditulis eksplisit di `acceptedAnswers`; kanji dan kana tidak disamakan otomatis.
3. **Mencocokkan memberi skor parsial, tetapi status benar hanya jika semua pasangan tepat.** UI belum menampilkan skor per pasangan saat diperiksa.
4. **Cocokkan kana tidak memberi skor parsial per pasangan.** Skor dihitung dari pasangan selesai, kesalahan, petunjuk, dan waktu; status benar tetap seluruh pasangan.
5. **Bobot adaptif adalah heuristik**, bukan model IRT/memori ilmiah. Parameter perlu dikalibrasi jika ada data penggunaan nyata.
6. **Tantangan harian deterministik** dari tanggal dan tingkat kesulitan; tidak ada rotasi server atau kompetisi harian.
7. **XP permainan adalah perkiraan** berbasis akurasi/kesulitan, bukan ukuran penguasaan bahasa.
8. **Baru N5 yang memiliki pelajaran interaktif.** N4–N1 masih memakai halaman materi/kuis non-LessonPlan; struktur LessonPlan siap, tetapi konten belum ditulis.
9. **Validator QA semantik bukan pengganti review manusia.** Ia menangkap opsi duplikat, kunci di luar rentang, prompt kosong, dan ID ganda dengan isi berbeda, tetapi tidak membuktikan bahwa hanya satu jawaban yang benar secara pragmatik.
10. **Id kanonis belum dimigrasikan.** Database masih menyimpan id aktivitas; `learning.ts` memetakannya ke katalog.
11. **Halaman Belajar sangat panjang di mobile.** Belum ada mode ringkas per level; daftar permainan sudah responsif.
12. **Pelafalan memakai perbandingan teks, bukan skor akustik.** Pengenalan suara opsional membandingkan transkrip yang dinormalisasi; ia tidak mengukur pitch, panjang vokal, atau kualitas bunyi. Rekaman tetap lokal dan tidak diunggah.
13. **Konten N3–N1 masih tipis**, terutama N1. Ujian level tinggi memakai fallback lintas level.
14. **Satu profil lokal, tanpa auth.** Siapa pun dengan akses file/instance dapat melihat progres. Fase 12 menambahkan loopback/Host allowlist/JSON same-origin/body cap, tetapi itu batas lokal, bukan autentikasi atau isolasi pengguna.
15. **Belum ada sinkronisasi/offline tulis.** Ekspor/impor JSON adalah jalur pemindahan data.
16. **Audio bergantung pada voice perangkat dan belum ada aset rekaman.** Fase 16 menyediakan rantai TTS browser `ja-JP` dengan fallback status tidak tersedia dan penolakan voice non-Jepang, tetapi belum ada rekaman statis, caching MP3, atau adapter Open JTalk yang di-deploy. Lingkungan tanpa voice Jepang tetap dapat membaca transkrip dan latihan tertulis.
17. **CI baru mencakup check/build/audit, belum E2E/axe/tes komponen.** `.github/workflows/quality.yml` menjalankan `npm ci`, `npm run audit:prod`, `npm run check`, dan `npm run build`; Playwright masih verifikasi ad hoc dan belum masuk `npm test`.
18. **node:sqlite eksperimental**, membutuhkan Node >= 22.5; satu proses/satu instance.
19. **Font memakai stack sistem** (Hiragino/Yu Gothic/Noto Sans JP/Meiryo/Droid Sans Fallback); tidak ada lagi Google Fonts, sehingga rendering Jepang bergantung perangkat.
20. **Pengenalan suara tidak tersedia di semua browser.** Chrome/Edge dan sebagian browser berbasis Chromium mendukungnya; Firefox/Safari dapat menolak. Browser dapat mengirim audio ke layanan vendor, dan Kotoba tidak menyimpan audio atau transkrip. Fallback perekam manual tetap tersedia.
21. **TTS dan kualitas audio tidak seragam.** Studio dan latihan hanya memakai voice berbahasa Jepang; bila tidak ada, Kotoba menampilkan status tidak tersedia dan **tidak** memakai voice bahasa lain. Latihan menyimak memakai audio sintetis, bukan rekaman penutur asli; karena itu latihan ini bukan pengganti percakapan nyata atau sertifikasi JLPT.
22. **Ujian memakai skor belajar, bukan ambang JLPT resmi.** Target 70% adalah target latihan Kotoba. Kolom `passed` pada tabel `exams` dipertahankan untuk kompatibilitas dan kini berarti "target latihan tercapai", bukan kelulusan sertifikasi. Riwayat ujian lama dapat menampilkan target yang sama meskipun dibuat dengan label lama.
23. **Sesi ujian hidup di `sessionStorage`.** Timer dipulihkan dari `startedAt`, tetapi menutup tab menghapus kertas aktif. Hasil terakhir juga disimpan di `sessionStorage` untuk halaman hasil; riwayat jangka panjang tetap di SQLite. Tidak ada resume lintas tab/perangkat.
24. **Mode dan judul ujian tidak dipersistensikan.** Tabel `exams` menyimpan level, skor, bagian, jawaban, dan review, tetapi tidak menyimpan mode (latihan/simulasi/topik/acak) atau judul kertas. Riwayat dapat menampilkan skor dan level, bukan mode asal.
25. **Penilaian ujian terjadi di klien.** `exam-engine` menilai jawaban di browser, lalu server menyimpan payload hasil. Server belum menilai ulang dari kunci konten, sehingga ini bukan anti-cheat; deployment publik memerlukan verifikasi server-side.
26. **Rujukan budaya bersifat tingkat organisasi, bukan kutipan per kalimat.** Setiap artikel menautkan halaman resmi/lembaga sebagai bacaan lanjutan, tetapi ringkasan tetap disusun orisinal dan tidak mengklaim setiap detail berasal dari satu halaman tertentu. Kebiasaan dapat berbeda menurut daerah, generasi, dan konteks; UI menampilkan disclaimer variasi budaya.
27. **Kuis budaya adalah pemeriksaan kosakata, bukan ujian pemahaman menyeluruh.** Dua soal per artikel dibuat dari arti dan bacaan dua kosakata pertama; kuis tidak menilai pemahaman seluruh isi dan tidak memberi XP, skor resmi, atau sertifikasi.
28. **Fakta harian bergantung pada tanggal lokal perangkat.** Pengguna di zona waktu berbeda dapat melihat fakta berbeda pada saat yang sama; tidak ada kurasi editorial harian dari server. Fakta acak deterministik dari tanggal + offset, bukan sumber acak kriptografis.
29. **Artikel budaya berupa teks terkurasi, tanpa ilustrasi.** Tidak ada gambar karakter anime atau aset berhak cipta; keputusan ini menjaga hak cipta tetapi membatasi daya tarik visual. 33 artikel belum mewakili seluruh wilayah dan tradisi Jepang.
30. **Daftar 33 artikel ditampilkan penuh tanpa paginasi.** Di mobile halaman hub menjadi panjang; pencarian, filter kelompok, dan filter favorit tersedia, tetapi belum ada infinite scroll/load more. Favorit dan progres tetap terikat pada satu profil lokal.
31. **Simulasi percakapan bukan percakapan dengan AI atau penutur asli.** Enam skenario ditulis orisinal; pilihan salah tetap gramatikal tetapi tidak cocok dengan konteks/register. Skor dihitung lokal dari langkah yang benar pada percobaan pertama, bukan penilaian pragmatik menyeluruh.
32. **Latihan mengetik memeriksa string di browser.** Tidak ada IME bawaan; mode Romaji→Kana dan Arti→Kanji memerlukan IME Jepang di perangkat. Server hanya menyimpan hasil lesson/sesi, bukan setiap ketikan.
33. **Rencana belajar adalah jadwal deterministik, bukan prediksi kelulusan JLPT.** Perhitungan memakai kurikulum, progres, estimasi menit, target level, dan preferensi pengguna; tanggal mengikuti zona waktu lokal. Rencana tidak disimpan sebagai tabel sehingga selalu dihitung ulang.
34. **Studio menulis memakai evaluasi geometri, bukan pengenalan tulisan tangan.** Fase 17 mengimpor 259 glyph KanjiVG (CC BY-SA 3.0) untuk 319 entri, menyediakan animasi, tirukan, kanvas mandiri, dan progres. Skor membandingkan jalur yang diseragamkan, arah, serta titik awal/akhir; ia tidak memahami karakter tulisan tangan bebas, tidak menilai estetika, dan dapat berubah karena posisi/ukuran goresan. Jangan menyebutnya pengenalan tulisan tangan atau penilaian resmi.
35. **Offline penuh, halaman resource belajar, dan ekspansi bacaan belum dikerjakan.** Ketiganya dievaluasi pada Fase 11 dan ditunda dengan alasan yang dicatat; bukan requirement yang disembunyikan.
36. **Keamanan lokal bukan keamanan publik.** Loopback + Host allowlist + JSON/same-origin + batas body mengurangi risiko pada satu perangkat, tetapi tidak ada autentikasi, TLS, rate limit, audit log, atau isolasi multi-pengguna. Jangan mengekspos port ke LAN/publik sebelum auth selesai.
37. **Katalog konten masih ikut bundle klien.** Chunk VOCABULARY/KANJI/GRAMMAR sekitar 33 KiB gzip dimuat di banyak rute; ini batasan performa yang belum direfaktor karena perubahan arsitektur data berisiko.
38. **Tidak ada font web.** Tampilan Jepang dapat berbeda antar perangkat; keuntungannya tidak ada permintaan pihak ketiga dan tetap berfungsi offline.
39. **Sebagian gaya romanisasi/loanword belum seragam.** Perbedaan macron vs wapuro dan beberapa kata serapan Inggris di teks budaya adalah soal gaya, bukan fakta linguistik yang salah; dibiarkan agar tidak menimbulkan churn konten.
40. **Backup berada di mesin yang sama dan tidak terenkripsi.** CLI membantu mencegah kehilangan data lokal, tetapi bukan disaster recovery; salinan off-site tetap tanggung jawab operator.
41. **Audio, writing, dan story sudah berjalan.** Fase 16 mengimplementasikan studio audio berbasis Web Speech; Fase 17 mengimplementasikan studio menulis dengan KanjiVG; Fase 18 mengimplementasikan teater cerita. Fase 15 CMS tetap blocked karena tidak ada CMS di repositori.
42. **Tidak ada CMS/admin atau content API.** Konten adalah modul TypeScript bertipe; perubahan konten dilakukan lewat kode, validasi build/test, dan review. Ini disengaja sampai ada kebutuhan editor non-teknis atau volume konten yang membenarkan CMS.
43. **Delapan pelajaran membaca/menyimak memakai soal sumber.** Perbaikan soal sumber otomatis mengubah latihan pelajaran; tidak ada snapshot terpisah, yang disengaja agar satu sumber kebenaran.
44. **Audit mobile Fase 14B memakai Chromium yang diemulasikan, bukan perangkat fisik.** iOS Safari, Android Chrome, kamera/file picker asli, audio perangkat, dan pembaca layar belum diuji; hasil tidak boleh disebut kompatibilitas penuh.
45. **CMS/admin tidak tersedia.** Kanvas menulis tersedia sejak Fase 17 dan teater cerita sejak Fase 18, tetapi CMS tetap backlog. Permukaan yang belum ada tidak boleh diklaim tersedia atau teruji.
46. **Snapshot writing dibatasi 400 attempt.** Impor menerima hingga 5.000 attempt, tetapi snapshot UI hanya memuat 400 terbaru; riwayat lebih lama tetap tersimpan di SQLite namun tidak ditampilkan. Belum ada pagination.
47. **Data KanjiVG menuntut atribusi dan share-alike.** 259 glyph JSON adalah data turunan CC BY-SA 3.0; distribusi modifikasi harus mempertahankan atribusi Ulrich Apel/KanjiVG, tautan lisensi, dan ketentuan share-alike. Ini bukan kode MIT proyek.
48. **Verifikasi menulis belum memakai stylus/perangkat fisik.** Pointer Events diuji dengan mouse dan sentuhan emulasi Chromium; tekanan stylus, latency perangkat, dan perilaku iOS Safari/Android Chrome belum diukur.
49. **Sinkronisasi audio cerita hanya per baris.** Web Speech tidak memberi timing per kata yang andal; teater menyorot baris aktif dan tidak mengklaim sinkronisasi kata. Metadata timing untuk aset rekaman belum diimplementasikan.
50. **Voice per karakter bergantung pada perangkat.** Jika hanya ada satu voice Jepang, semua karakter memakai voice yang sama dan UI menyatakannya. Tidak ada voice native terpisah yang dipalsukan.
51. **Ekspor video dan AI video berbayar tidak diimplementasikan.** MediaRecorder/Canvas/FFmpeg hanya dievaluasi; tidak ada ekspor, encoding, atau pipeline render video. Struktur menyediakan `StoryScene.videoUrl`, tetapi belum ada aset, CMS, atau pengujian video nyata.
52. **Teater cerita belum memiliki checkpoint/resume.** Progres yang disimpan adalah hasil penyelesaian (attempt), bukan posisi baris/adegan. Menutup tab memulai alur dari awal.
53. **Snapshot cerita dibatasi 300 attempt.** Impor menerima 1.000 baris, tetapi UI hanya memuat 300 attempt terbaru; belum ada pagination. Tiga cerita saat ini juga belum mencakup N3–N1.
54. **Kamus dalam cerita hanya membuka kosakata terkurasi.** Setiap baris menautkan `vocabIds` terpilih; tidak semua kata Jepang dapat diklik. Ini menghindari pencocokan morfologis yang belum akurat.
55. **Audio cerita diuji dengan mock voice.** Chromium QA tidak memiliki voice Jepang; verifikasi memakai dua voice mock. Perangkat fisik, iOS Safari, Android Chrome, dan screen reader belum diuji.
56. **QA Fase 19 memakai Chromium teremulasi.** Sapuan 102 pemeriksaan dan enam perjalanan berjalan di desktop/mobile emulasi, bukan perangkat fisik. Satu observasi `h1` ganda pada `/dictionary/collections` tidak dapat direproduksi; fenomena itu dicatat sebagai flaky, bukan bug yang diperbaiki.
57. **Angka transfer Fase 19 mencakup prefetch.** Total ~572–610 KB per halaman mencakup chunk prefetch/RSC Next.js, sedangkan glyph KanjiVG hanya dimuat di detail. Angka itu tidak boleh disebut sebagai seluruh dataset dimuat atau sebagai bukti optimasi selesai.

Tidak ada requirement Fase 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, atau 19 yang disembunyikan atau diklaim selesai tanpa implementasi. Enam permainan memiliki aturan, validasi, tingkat kesulitan, petunjuk, skor, pembahasan, persistensi, dan riwayat nyata; Fase 7 memiliki pemutar audio dengan penanganan kegagalan, perekam lokal, fallback ASR, dan 15 drill yang tersimpan melalui mesin latihan; Fase 8 memiliki empat mode ujian, timer, penanda, analitik, review, retry, dan penambahan kartu; Fase 9 memiliki 33 artikel dengan fakta, sumber, kuis, favorit persisten, dan tautan materi; Fase 10 memiliki target yang tersimpan, ringkasan turunan, streak/kalender lokal, 21 pencapaian, rekomendasi beralasan, dan kamus pribadi yang persisten; Fase 11 memiliki enam skenario percakapan yang tersimpan sebagai lesson, tiga mode mengetik dengan hasil tersimpan, rencana belajar yang dapat disimpan targetnya, serta kosakata/kanji terkait yang diturunkan dari konten; Fase 12 memiliki audit keamanan/UI/konten/performa yang terdokumentasi, batas lokal yang diuji, koreksi konten, dan verifikasi ulang alur produksi; Fase 13 memiliki delapan pelajaran membaca/menyimak yang dirender, validator QA semantik, backup/restore teruji, CI check/build/audit, dan reflow 320 px yang diprobe. Fase 14 hanya menghasilkan audit, verifikasi KanjiVG, evaluasi teknologi, empat dokumen perencanaan, backlog 100 concern, dan ADR-050–054; tidak ada fitur yang diklaim berjalan. Fase 14B hanya mengaudit dan memperbaiki tampilan mobile learner yang sudah ada; CMS, kanvas menulis, dan story theater tidak diklaim tersedia atau kompatibel. Fase 16 menyediakan studio audio dan kontrol pemutaran yang dapat dipakai ulang, tanpa klaim MP3, skor akustik, kualitas native, atau ketersediaan voice di semua perangkat. Fase 17 menyediakan 319 entri menulis dengan data KanjiVG terverifikasi/berlisensi, animasi, tirukan, kanvas mandiri, progres, dan evaluasi geometri; ia tidak mengklaim pengenalan tulisan tangan, penilaian estetika, atau kualitas goresan manusia. Fase 18 menyediakan tiga cerita orisinal dengan panggung SVG/CSS, audio per baris, mode belajar/tonton, kamus kosakata, kuis, dan progres; ia tidak mengklaim sinkronisasi per kata, voice native per karakter, video export, atau AI video. Klaim skor akustik, kelulusan JLPT resmi, pengenalan tulisan tangan, kualitas native, dan kutipan budaya per kalimat sengaja tidak dibuat.

Fase 19 tidak menambah fitur yang bisa diklaim berlebih: ia hanya menautkan pelajaran ke studio menulis, mengoreksi salinan, dan menjalankan regresi. CMS tetap tidak tersedia (`/admin` dan `/api/admin` 404, tanpa tautan), sehingga Fase 15 tetap **BLOCKED**. Tidak ada klaim pengujian perangkat fisik, screen reader penuh, atau deployment publik.

---

## 8. Rekomendasi fase berikutnya

**Fase berikutnya — 20 Content Depth & Quality Gate.** Fase 19 sudah selesai: 102 pemeriksaan rute, enam perjalanan kritis, integrasi pelajaran→menulis, dan dokumentasi diperbarui. Fase 15 tetap **BLOCKED** karena repositori tidak memiliki CMS/admin; jangan memulai CMS tanpa lokasi atau otorisasi eksplisit.

1. **Kedalaman N4 (P0 konten)** — tulis `LessonPlan` N4 pertama (tata bahasa, membaca, menyimak) dan perluas bank soal N4 dengan kunci/pembahasan yang diaudit. Jangan mengklaim N3–N1 selesai; katalognya masih berupa struktur.
2. **Quality gate yang dapat diulang** — pindahkan skrip QA Fase 19 yang masih sementara di `.data/phase19-qa.cjs` menjadi suite Playwright/E2E yang di-commit dan dijalankan CI dengan DB terisolasi. Pertahankan 102 pemeriksaan rute, enam perjalanan, `npm run check`, dan build sebagai ambang rilis.
3. **Aksesibilitas dan perangkat** — audit screen reader/keyboard penuh untuk audio, menulis, dan cerita; uji iOS Safari/Android Chrome fisik untuk kanvas sentuh dan voice. Ini menutup UX-11 dan UX-14 hanya setelah ada bukti, bukan asumsi.
4. **Performa terukur** — selidiki prefetch/RSC dan bundle katalog (~500 KB transfer JS yang mencakup prefetch, bukan seluruh dataset), pertimbangkan route loading skeleton, lalu ukur cold/warm load sebelum menyebut optimasi berhasil.
5. **Operasional dan kesiapan rilis** — pertahankan backup/restore, smoke, dan dokumentasi konsisten; keputusan CMS/video tetap menunggu produk dan lisensi.
6. **Keputusan CMS/video** — putuskan apakah CMS, aset rekaman, metadata timing, ekspor video, dan `StoryScene.videoUrl` akan dikerjakan. Jangan mengimplementasikan tanpa keputusan produk dan lisensi.

**Fase konten N4 tetap jalur P0 terpisah.** Kedalaman N4 dan bank soal N3–N1 tidak boleh diklaim selesai oleh Fase 18/19. **Auth + TLS + rate limit tetap prasyarat sebelum deployment publik.**

**Alasan urutan.** Integrasi audio/menulis/cerita sudah diverifikasi lokal; risiko berikutnya adalah kedalaman konten, QA yang dapat diulang, aksesibilitas/perangkat, dan performa terukur. Menambah fitur baru sebelum itu hanya memperbesar permukaan regresi.

---

## 9. Riwayat fase

- **Fase 19 — Integration, QA, Performance & Accessibility:** stabilisasi tanpa fitur baru; helper `writingHrefForContentRef` + tombol **Latihan menulis** di pelajaran kana/kanji, koreksi salinan urutan goresan, dan tes tautan; QA Playwright 34 rute × 3 viewport = 102/102, enam perjalanan kritis (kana tanpa voice, tata bahasa, menulis hiragana, animasi kanji, teater cerita, CMS blocked) 0 kegagalan, 0 kontrol tanpa nama di 5 rute; performa tercatat 572–610 KB transfer per halaman (termasuk prefetch) dan 0–1 glyph KanjiVG; observasi `h1` ganda tidak dapat direproduksi; 39/236 tes; build 101 statis + 6 dinamis + 20 API; tanpa tabel/endpoint/CMS/video baru.
- **Fase 18 — Japanese Story Theater & Animated Conversation:** tiga cerita orisinal (2 N5, 1 N4), 9 adegan, 36 dialog, 9 soal; panggung SVG/CSS dengan 8 latar, karakter/ekspresi/posisi, animasi masuk dan efek hujan; mode belajar/tonton, kontrol subtitle/furigana/romaji/terjemahan, audio `ja-JP` per baris, voice per karakter hanya bila ≥2 voice, kamus kosakata, kuis dan XP 25; tabel ke-15 `story_attempts`, endpoint ke-20 `POST /api/progress/story`, 2 pencapaian baru (total 25); 39 file/235 tes; build 101 statis + 6 dinamis + 20 API; 34 rute; 24 pemeriksaan Playwright, mobile 390 px, fallback tanpa voice.
- **Fase 17 — Japanese Handwriting & Stroke Order Studio:** 319 entri (208 kana + 111 kanji) dari 259 glyph KanjiVG berlisensi CC BY-SA 3.0; tabel ke-14 `writing_attempts`; animasi/nomor/arah goresan, mode Tirukan dan Mandiri dengan Pointer Events, undo/reset/referensi; evaluasi geometri (bukan pengenalan tulisan tangan); 2 pencapaian baru (total 23); 38 file/227 tes; build 97 statis + 6 detail dinamis + 19 API; 32 pola rute; 320 px/1440 px, sentuhan, ekspor–impor writing, dan reduced-motion diuji.
- **Fase 16 — Japanese Audio & Pronunciation Studio:** studio 6 kategori (kana, kosakata, kanji, tata bahasa, bacaan, percakapan), pemutar global Web Speech `ja-JP` dengan play/pause/resume/stop/repeat/kecepatan/voice, diagnostik voice jujur, penolakan voice non-Jepang, integrasi bacaan/percakapan/menyimak/pelafalan; 36 file/215 tes; build 96 statis + 5 dinamis + 18 API; 30 rute lulus smoke; Playwright memakai mock voice karena Chromium uji tidak memiliki voice Jepang.
- **Fase 14B — Mobile Compatibility Audit (learner):** audit 29 rute × 9 viewport (261 pemuatan) dengan Chromium teremulasi; 0 overflow halaman dan 0 error setelah perbaikan `/progress`, StatTile, grid rencana/mengetik, kartu JLPT, tema 320 px, target sentuh, dan transkrip menyimak; 18 langkah fungsional 390×844; CMS/admin, kanvas menulis, dan story theater tidak tersedia dan dilaporkan tidak diuji; 34 file/206 tes; build 94 statis + 5 dinamis + 18 API.
- **Fase 14 — Existing System Audit & New Feature Integration Planning:** audit sistem, akar masalah audio (speechSynthesis ada, 0 voice Jepang, tanpa aset audio), verifikasi KanjiVG 111/111 kanji + 208/208 kana + 259 karakter/690.664 byte (CC BY-SA 3.0), evaluasi Web Speech/Open JTalk/Canvas/SVG/Web Animations, empat dokumen enhanced, backlog 100 concern (26 RESOLVED/13 ACCEPTED/57 DEFERRED/1 BLOCKED/3 REJECTED), ADR-050–054; tidak ada implementasi fitur, kode, tabel, endpoint, atau aset baru.
- **Fase 13 — Cross-Phase Review, Concern Resolution & Final Refinement:** retrospektif 86 concern; 11 RESOLVED dan 11 DEFERRED dengan pemicu; 8 pelajaran membaca/menyimak N5; validator QA semantik; backup/restore SQLite; CI quality gate; reflow 320 px; 34 file/206 tes; build 94 statis + 5 detail dinamis + 18 API; 29 rute.
- **Fase 12 — Final Quality Assurance & Production Readiness:** audit keamanan (1 blocker/2 high/4 medium/6 low), UI/a11y (0 blocker/4 high/21 medium/10 low), konten Jepang (4 high/6 medium/7 low/1 uncertain), performa; loopback + Host allowlist + JSON/same-origin + batas body + CSP + impor berkonfirmasi; font Google dihapus; code splitting permainan; 21+ koreksi konten; 32 file/199 tes; build 87 + dinamis + 18 API; 29 rute; Playwright ujian/percakapan/mengetik/impor/mobile gelap.
- **Fase 11 — Advanced Learning Features:** evaluasi sembilan kandidat, enam skenario percakapan (19 langkah/18 frasa kunci), tiga mode mengetik, planner belajar deterministik dengan target 4–104 minggu, penguatan kamus/kanji, 17 tes baru (30 file/190 tes), build 87 rute + rute dinamis, smoke 29 rute, Playwright alur percakapan/mengetik/rencana/kamus/kanji/mobile.
- **Fase 10 — Personalized Learning Experience:** dasbor personal, empat target + frekuensi mingguan, streak/kalender, 21 pencapaian, rekomendasi explainable, kamus pribadi dengan catatan/koleksi, tabel `saved_items`/`saved_collections`, 27 file/173 tes, build 84 rute + 18 API.
- **Fase 9 — Japanese Culture, Anime & Interesting Facts:** 33 artikel dalam enam kelompok (9 budaya, 7 makanan, 5 geografi, 4 sejarah, 5 anime, 3 fakta bahasa), 132 fakta, fakta harian/acak, tabel `culture_favorites`, kuis mini dua soal per artikel, registry 11 sumber, tautan kosakata ke kamus, materi belajar terkait, label register formal/arkais/anime, 23 file/153 tes, build + Playwright alur budaya termasuk favorit dan kuis.
- **Fase 8 — Japanese Language Examinations:** mesin ujian reusable empat mode, timer per level, penanda soal, analitik bagian/kategori/area lemah, rekomendasi, review, ulang soal salah, endpoint `/api/progress/card` idempoten, 22 file/149 tes, build + Playwright alur ujian lengkap.
- **Fase 7 — Pronunciation, Listening & Speaking:** provider audio + hasil pemutaran terstruktur, panduan 6 topik, perekam lokal 30 detik, ASR opsional berbasis perbandingan teks, 15 drill menyimak + halaman latihan, 21 file/131 tes, build + verifikasi Playwright dengan mikrofon palsu dan fallback ASR.
- **Fase 6 — Japanese Learning Games:** enam permainan, domain murni, tabel `game_attempts`, endpoint game, pencapaian dan statistik permainan, 19 file/117 tes, build + verifikasi Playwright enam permainan.
- **Fase 5 — Interactive Learning and Quiz Engine:** 9 jenis latihan, ExerciseRunner/ExerciseCard bersama, flashcard romaji/audio, SRS SM-2-inspired, sesi adaptif, tabel quiz_attempts/question_stats, endpoint /api/progress/quiz, riwayat latihan, QuizRunner lama dihapus, 13 file/81 tes.
- **Fase 4 — Learning Materials & N5 Curriculum:** 62 pelajaran N5 interaktif, mesin 6 langkah, latihan gerbang 60%, Jalur N5, katalog 39/154/644, 11 file/60 tes, build + verifikasi 62 rute pelajaran.
- **Fase 3 — UI/UX Foundation:** shell awal 10 navigasi (kini 15), dashboard baru, hub Belajar, Kamus 370 entri, Pelafalan 17 latihan, Statistik terpadu, 10 file/53 tes, verifikasi browser produksi.
- **Fase 2 — System Architecture & Data Modeling:** ARCHITECTURE.md, DATA_MODEL.md, ADR-016–021; tipe domain; katalog 39 modul/147 pelajaran/644 ref; validator; XP lesson server-side.
- **Fase 1 — Discovery & Product Planning:** audit, PROJECT_SPEC.md, FEATURE_ROADMAP.md; tidak ada perubahan kode.
- **Fase fondasi:** baseline v0.1.0 (17 halaman, 12 API, 7 tabel).

---

## 10. Dokumen terkait

- [ARCHITECTURE.md](ARCHITECTURE.md) — arsitektur sistem dan batas modul.
- [DATA_MODEL.md](DATA_MODEL.md) — entitas, relasi, skema, dan rumus.
- [DECISIONS.md](DECISIONS.md) — ADR-001 sampai ADR-063.
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) — atribusi dan lisensi data KanjiVG (CC BY-SA 3.0).
- [CONCERNS_BACKLOG.md](CONCERNS_BACKLOG.md) — register 116 concern lintas fase: 39 selesai, 5 diterima untuk perencanaan, 68 ditunda dengan pemicu, 1 diblokir, 3 ditolak.
- [MOBILE_COMPATIBILITY_REPORT.md](MOBILE_COMPATIBILITY_REPORT.md) — audit kompatibilitas mobile learner Fase 14B, termasuk batas emulasi dan permukaan yang tidak tersedia.
- [ENHANCED_LEARNING_FEATURES_SPEC.md](ENHANCED_LEARNING_FEATURES_SPEC.md) — spesifikasi fitur audio, menulis, dan cerita.
- [ENHANCED_FEATURES_ARCHITECTURE.md](ENHANCED_FEATURES_ARCHITECTURE.md) — rancangan integrasi dan lisensi.
- [ENHANCED_FEATURES_ROADMAP.md](ENHANCED_FEATURES_ROADMAP.md) — rencana Fase 15–19.
- [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md) — status implementasi audio, writing, story, integrasi Fase 19, dan CMS.
- [PROJECT_SPEC.md](PROJECT_SPEC.md) — visi dan kebutuhan produk.
- [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md) — prioritas dan kriteria rilis.
- [README.md](README.md) — ringkasan dan cara menjalankan.
