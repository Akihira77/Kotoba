# Peta Jalan Fitur — Kotoba

**Versi dokumen:** 2.6  
**Status:** Fase rekayasa 1–19 selesai (UI/UX, kurikulum N5, mesin latihan & kuis, permainan belajar, pelafalan & menyimak, mesin ujian, penemuan budaya, personalisasi, fitur belajar lanjutan, audit kualitas & kesiapan produksi, konsolidasi lintas fase, audit kompatibilitas mobile, studio audio, studio menulis, teater cerita, stabilisasi integrasi); Fase 15 CMS **BLOCKED**; Fase 20 (kedalaman N4 + quality gate) direncanakan; Fase 2 roadmap produk (konten & guardrails) belum dimulai.  
**Tanggal:** 2026-11-09  
**Rujukan produk:** [PROJECT_SPEC.md](PROJECT_SPEC.md)  
**Basis kode:** Kotoba v0.1.0 (fondasi UI/UX Fase 3 + kurikulum N5 Fase 4 + mesin latihan Fase 5 + permainan Fase 6 + pelafalan/menyimak Fase 7 + ujian Fase 8 + penemuan budaya Fase 9 + personalisasi Fase 10 + fitur belajar lanjutan Fase 11 + audit kualitas/kesiapan produksi Fase 12 + konsolidasi lintas fase Fase 13 + audit/perencanaan Fase 14 + audit mobile Fase 14B + studio audio Fase 16 + studio menulis Fase 17 + teater cerita Fase 18 + stabilisasi integrasi Fase 19; Fase 15 CMS diblokir)

---

## 1. Ringkasan

> **Catatan penomoran.** “Fase 2” di [PROJECT_STATUS.md](PROJECT_STATUS.md) dan [ARCHITECTURE.md](ARCHITECTURE.md) adalah **fase rekayasa** (System Architecture & Data Modeling), “Fase 3” adalah **UI/UX Foundation**, “Fase 4” adalah **Learning Materials & N5 Curriculum**, “Fase 5” adalah **Interactive Learning & Quiz Engine**, “Fase 6” adalah **Japanese Learning Games**, “Fase 7” adalah **Japanese Pronunciation, Listening & Speaking**, “Fase 8” adalah **Japanese Language Examinations**, “Fase 9” adalah **Japanese Culture, Anime & Interesting Facts**, “Fase 10” adalah **Personalized Learning Experience**, “Fase 11” adalah **Advanced Learning Features**, “Fase 12” adalah **Final Quality Assurance & Production Readiness**, dan “Fase 13” adalah **Cross-Phase Review, Concern Resolution & Final Refinement**, dan “Fase 14” adalah **Existing System Audit & New Feature Integration Planning** (audit/perencanaan, bukan implementasi fitur), “Fase 14B” adalah **Mobile Compatibility Audit** (learner yang ada), “Fase 16” adalah **Japanese Audio & Pronunciation Studio**, “Fase 17” adalah **Japanese Handwriting & Stroke Order Studio**, dan “Fase 18” adalah **Japanese Story Theater & Animated Conversation**. “Fase 19” yang selesai adalah integrasi, QA, performa, dan aksesibilitas. “Fase 15” adalah permintaan CMS yang **diblokir** karena repo tidak memiliki CMS/admin; tidak ada pekerjaan yang diklaim selesai. “Fase 2” dan “Fase 3” di dokumen ini adalah **fase roadmap produk** (fondasi konten & guardrails; latihan lengkap). Keduanya bukan hal yang sama.

Dokumen ini menerjemahkan visi produk menjadi urutan pekerjaan yang dapat dieksekusi. Karena aplikasi v0.1.0 sudah berjalan, roadmap tidak dimulai dari nol. Fokusnya adalah menutup celah menuju **MVP v0.2**, lalu memperluas fitur P1, dan menunda pekerjaan berisiko tinggi (akun, sinkronisasi, offline penuh) sampai fondasi stabil.

Prinsip prioritas:

1. **Perbaiki kepercayaan lebih dulu.** Akurasi dan kedalaman konten N4–N1 adalah hambatan terbesar menuju produk yang layak dipercaya.
2. **Lengkapi alur belajar.** Variasi latihan dan pengelolaan personal lebih penting daripada menambah permainan baru.
3. **Kunci kualitas sebelum memperluas.** CI, tes, dan audit aksesibilitas harus menjaga fitur yang sudah ada.
4. **Tunda kompleksitas operasional.** Autentikasi, sinkronisasi, dan PWA penuh bukan syarat MVP satu pengguna.
5. **Setiap fase harus dapat dirilis dan diuji.** Tidak ada fase yang bergantung pada penyelesaian sempurna fase berikutnya.

---

## 2. Status baseline v0.1.0 (setelah Fase 19)

| Modul | Status | Catatan |
| --- | --- | --- |
| Dasbor | Sudah (Fase 3, diperluas Fase 10) | Hero, target XP/durasi/kosakata/pelajaran/frekuensi, ringkasan belajar 6 metrik, rekomendasi beralasan/bukti, ujian terbaru, lanjutan belajar, ringkasan ulangan, jalur JLPT, pencapaian, heatmap |
| Belajar | Sudah (Fase 4) | Hub 39 modul / 154 pelajaran, Jalur N5, 70 pelajaran interaktif enam langkah (termasuk 8 membaca/menyimak), gerbang latihan 60%, progres per level |
| Rencana | Sudah (Fase 11) | Target JLPT + rentang minggu, jadwal deterministik dari kurikulum/progres/preferensi, feasibility, tonggak, peringatan pelajaran tertunda; bukan prediksi JLPT |
| Kana | Sudah | 208 karakter, bagan, detail, kuis, mastery |
| Kosakata | Sudah | 214 kata, kamus, filter, SRS, kuis adaptif; simpan ke kamus pribadi (Fase 10) |
| Kanji | Sudah, perlu perluasan | 111 kanji, detail, kuis, SRS, kanji beradikal sama; N2–N1 tipis |
| Tata bahasa | Sudah | 45 pola, penjelasan, contoh, latihan lewat mesin latihan bersama |
| Membaca | Sudah, perlu konten lanjut | 12 teks; N2/N1 masing-masing satu |
| Menyimak | Sudah (Fase 7) | 12 dialog + 15 drill kilat (3 per level), pemutar dengan penanganan gagal, transkrip, 51 soal audio |
| Latihan | Sudah (Fase 5) | Sembilan tipe soal, adaptif, riwayat, retry soal salah; simpan materi dan target mingguan tersedia lewat Fase 10 |
| Permainan | Sudah (Fase 6) | Enam permainan: pembuat kata, cocokkan kana, kejar kosakata, susun kalimat, tantangan kanji, tantangan harian; tiga kesulitan, petunjuk, riwayat, pencapaian |
| Mengetik | Sudah (Fase 11) | Tiga mode: Kana → Romaji, Romaji → Kana, Arti → Kanji; 5/10/15 soal, pemeriksaan lokal, timer, tinjauan, akurasi; dua mode memerlukan IME |
| Percakapan | Sudah (Fase 11) | Enam skenario N5–N4, 19 langkah, tiga pilihan per langkah, umpan balik konteks/register, frasa kunci, catatan budaya; bukan AI |
| Pelafalan | Sudah (Fase 7, audio diperluas Fase 16) | 17 latihan, panduan 6 topik, audio normal/lambat via pemutar global, rekaman lokal 30 detik + replay/hapus, ASR opsional berbasis teks; skor akustik belum dan tidak diklaim |
| Ujian | Sudah (Fase 8) | Empat mode (latihan, simulasi, topik, acak) N5–N1, timer, tandai soal, hasil dengan skor belajar/target 70%, analitik bagian/kategori, area lemah, rekomendasi, review, ulang soal salah, tambah kartu; tren skor dan anti-cheat server belum |
| Budaya | Sudah (Fase 9) | 33 artikel dalam 6 grup, 132 fakta, Fakta Hari Ini + fakta acak, pencarian, favorit tersimpan, kuis 2 soal/artikel, kosakata tertaut kamus, 2–3 sumber organisasi; ilustrasi/audio khusus belum |
| Statistik | Sudah (Fase 10) | Rekap, target harian/mingguan, kalender 17 minggu, tren 30 hari, timeline, mastery, riwayat latihan/ujian/permainan, writing attempt, riwayat cerita, 25 pencapaian |
| Kamus | Sudah (Fase 3, diperluas Fase 10–11) | 370 entri kosakata/kanji/tata bahasa, pencarian, filter level, detail, kosakata terkait, kanji beradikal sama; kamus pribadi dengan catatan/koleksi/ulasan tersimpan |
| Pengaturan | Sudah (Fase 10–12) | Profil, tema, audio, target XP/durasi/kosakata/pelajaran + frekuensi mingguan, target JLPT/rentang minggu, ekspor/impor berkonfirmasi, reset |
| Keamanan lokal | Sudah (Fase 12) | Bind 127.0.0.1, Host allowlist, JSON + same-origin, body 5 MiB, CSP/header, DB 0700/0600, impor berkonfirmasi; **bukan** auth/TLS untuk deployment publik |
| **Studio audio** | **Sudah (Fase 16)** | `/audio` untuk kana/kosakata/kanji/tata bahasa/bacaan/percakapan; hanya voice `ja-JP`, antrean dan kontrol reusable, kecepatan 0,5–1,5×, diagnostik jujur, preferensi tersimpan; tanpa MP3/skor akustik |
| **Menulis** | **Sudah (Fase 17)** | 319 entri (208 kana + 111 kanji) dengan 259 glyph KanjiVG terimpor (CC BY-SA 3.0); animasi urutan, mode tirukan/mandiri, Pointer Events, evaluasi geometri, riwayat attempt, mastery, dua pencapaian; bukan pengenalan tulisan tangan |
| **Cerita** | **Sudah (Fase 18)** | 16 tujuan navigasi; `/stories` dan `/stories/[id]`; 3 cerita orisinal (2 N5 + 1 N4), 9 adegan, 36 baris dialog, 9 soal; panggung generik SVG/CSS dengan 8 latar, karakter/ekspresi/posisi, bubble; mode Belajar/Tonton; audio `ja-JP` per baris, subtitle/furigana/romaji/terjemahan, kamus kosakata, kuis pemahaman/menyimak; `story_attempts`; tanpa klaim sinkronisasi per kata, voice karakter native, ekspor video, atau video AI |

**Total konten baseline:** kana 208; kosakata 214; kanji 111; tata bahasa 45; bacaan 12; dialog menyimak 12; drill menyimak 15; budaya 33 artikel (132 fakta, 66 soal kuis); susun kalimat 28; latihan pelafalan 17; panduan pelafalan 6 topik; skenario percakapan 6 (19 langkah, 18 frasa kunci); mode mengetik 3; entri kamus 370; katalog belajar 39 modul / 154 pelajaran, dengan 70 pelajaran N5 interaktif (8 di antaranya membaca/menyimak yang ditambahkan Fase 13). Fase 12 mengoreksi 21+ item dan menutup ambiguitas soal; Fase 13 menambah delapan LessonPlan dari konten yang sudah diaudit, bukan konten baru. Fase 14 memverifikasi 259 karakter KanjiVG (111/111 kanji, 208/208 kana, 690.664 byte, CC BY-SA 3.0) untuk rencana writing. Fase 14B mengaudit 29 rute learner pada sembilan viewport (261 pemuatan) dan memperbaiki overflow `/progress` serta pemotongan statistik. Fase 16 menambahkan studio audio tanpa konten baru. Fase 17 menambahkan 319 entri menulis yang dipetakan ke 259 glyph KanjiVG, tabel ke-14 `writing_attempts`, endpoint ke-19 `/api/progress/writing`, dan dua pencapaian baru; evaluasinya adalah perkiraan geometri, bukan pengenalan tulisan tangan. Fase 18 menambahkan 3 cerita orisinal, 9 adegan, 36 baris dialog, 9 soal, 8 latar SVG/CSS, tabel ke-15 `story_attempts`, endpoint ke-20 `/api/progress/story`, dan dua pencapaian cerita; total menjadi 25 pencapaian, 16 tujuan navigasi, 15 tabel, dan 20 endpoint.

### Capaian rekayasa Fase 3 — UI/UX Foundation

Fase ini **bukan** Fase 3 roadmap produk di bawah; ini fase rekayasa yang diminta pada 2026-11-08.

- [x] Shell dengan 10 tujuan navigasi utama saat itu (kini 13 setelah Fase 11), sidebar desktop, bottom navigation + drawer mobile, judul rute, tema terang/gelap/sistem.
- [x] Dasbor berorientasi tindakan: target hari ini, rekomendasi, lanjutan belajar, ringkasan ulangan, jalur JLPT, pencapaian, konsistensi.
- [x] Hub Belajar: 39 modul, 154 pelajaran, progres per level, penyelesaian dan XP server-side, gerbang level 60%.
- [x] Kamus: 370 entri dengan pencarian Jepang/romaji/arti, filter jenis dan level, detail.
- [x] Pelafalan: 17 latihan, audio normal/lambat, rekaman mikrofon lokal, cek mandiri, tanpa unggah audio.
- [x] Komponen bersama: kartu, tombol, dialog, toast, skeleton, empty/error state, progress, heatmap, kartu statistik.
- [x] Verifikasi: `npm run check` (typecheck, lint, 10 file / 53 tes), build produksi, 20 rute HTTP 200 tanpa error konsol, uji fungsional Playwright untuk penyelesaian pelajaran, kamus, dan penolakan izin mikrofon.
- [x] Dokumentasi: PROJECT_STATUS, README, DECISIONS (ADR-022–ADR-025).

Fase 3 tidak menambah tabel, kolom, atau endpoint API baru; ia memakai data dan endpoint yang sudah ada. Pekerjaan MVP v0.2 di bawah tetap belum selesai.

### Capaian rekayasa Fase 4 — Learning Materials & N5 Curriculum

Fase ini **bukan** Fase 2 roadmap produk di bawah; ini fase rekayasa yang diminta pada 2026-11-08.

- [x] Lapisan `LessonPlan` bertipe di `src/content/lessons/` untuk 62 pelajaran N5: 8 kana, 20 topik kosakata, 6 set kanji, 20 tata bahasa, 8 susun kalimat.
- [x] Pemain enam langkah: Pengantar, Penjelasan, Contoh, Catatan, Latihan, Selesai; langkah masa depan terkunci.
- [x] Latihan MCQ per pelajaran dengan pembahasan, retry, skor 0–100, dan ambang lulus 60%; Selesai hanya terbuka setelah lulus.
- [x] Halaman `/learn/[lessonId]` untuk 62 pelajaran dengan metadata, target, ringkasan, dan penyimpanan penyelesaian server-side.
- [x] Jalur N5 di hub Belajar: enam modul dengan progres dan pelajaran berikutnya; katalog menjadi 39 modul / 154 pelajaran / 644 ref.
- [x] Validasi konten: 11 file / 60 tes, termasuk integritas 62 rencana, opsi jawaban, blok, dan relasi katalog.
- [x] Verifikasi: typecheck, lint, build produksi, 20 rute pengguna + 62 rute pelajaran HTTP 200, uji fungsional gating/latihan/penyimpanan 20 XP.
- [x] Dokumentasi: PROJECT_STATUS, README, ARCHITECTURE, DATA_MODEL, DECISIONS (ADR-026–ADR-027).

Fase 4 juga tidak menambah tabel, kolom, atau endpoint API baru. Delapan pelajaran N5 membaca/menyimak dan seluruh N4–N1 masih memakai halaman materi lama; itu menjadi pekerjaan roadmap produk berikutnya.

### Capaian rekayasa Fase 5 — Interactive Learning and Quiz Engine

Fase ini **bukan** Fase 5 roadmap produk (laboratorium pelafalan) di bawah; ini fase rekayasa yang diminta pada 2026-11-08.

- [x] Sembilan jenis latihan bertipe: pilihan ganda, isi rumpang, terjemahan, mencocokkan, baca kana, menyimak, susun kalimat, benar/salah, dan mengetik.
- [x] `ExerciseRunner` + `ExerciseCard` bersama dipakai di Kana, Kanji, Latihan, Kosakata, pelajaran, tata bahasa, membaca, menyimak, dan ujian; penilaian terpusat di `gradeExercise`; `QuizRunner` lama dihapus.
- [x] Normalisasi jawaban eksplisit untuk varian yang dapat diterima; kanji/kana tidak disamakan otomatis.
- [x] Kartu flashcard dengan bacaan, romaji, arti, contoh, audio, reveal, pintasan keyboard, dan label interval berikutnya.
- [x] Penjadwal SRS bergaya SM-2 dengan rating Lagi/Sulit/Bagus/Mudah, rumus interval terdokumentasi, dan sembilan unit test.
- [x] Sesi adaptif memprioritaskan kartu jatuh tempo dan soal yang sering salah, sambil menjamin keragaman tipe soal.
- [x] Riwayat latihan dan statistik per soal tersimpan di SQLite (`quiz_attempts`, `question_stats`) lewat `POST /api/progress/quiz`; server menghitung ulang agregat.
- [x] Ringkasan hasil: skor, akurasi, waktu, rincian per tipe, pembahasan, retry soal salah, dan tautan riwayat di Statistik.
- [x] Verifikasi: 13 berkas / 81 tes, typecheck, lint, build produksi 80 halaman statis, 20 rute pengguna HTTP 200, uji Playwright untuk sembilan tipe, flashcard, kuis kosakata, kuis kana/kanji, ujian, dan persistensi.
- [x] Dokumentasi: PROJECT_STATUS, README, ARCHITECTURE, DATA_MODEL, DECISIONS (ADR-028–ADR-030).

Fase 5 menambah dua tabel, satu route API, dan komponen mesin latihan bersama. Bookmark/target mingguan kemudian ditutup Fase 10; jadwal ulangan beberapa hari dan tes komponen masih terbuka, jadi P0 v0.2 belum selesai.

### Capaian rekayasa Fase 6 — Japanese Learning Games

Fase ini **bukan** Fase 6 roadmap produk (Ujian 2.0) di bawah; ini fase rekayasa yang diminta pada 2026-11-08.

- [x] Enam permainan dengan tiga tingkat kesulitan: Pembuat kata, Cocokkan kana (4 mode), Kejar kosakata, Susun kalimat, Tantangan kanji, dan Tantangan harian.
- [x] Domain permainan murni di `src/lib/games/` (tanpa React/API): morae yōon/sokuon/vokal panjang, validasi kata berbasis kamus, pemeriksaan partikel, opsi unik, dan RNG deterministik.
- [x] Pembuat kata **hanya** menerima kata yang ada di dataset; hasil `alternate` diterima dengan arti berbeda, `invalid` tidak pernah dianggap benar.
- [x] Tantangan harian deterministik dari tanggal + kesulitan: 10 soal campuran kosakata, kanji, kana, dan tata bahasa.
- [x] UI bersama `game-kit.tsx`/`mcq-game.tsx`: timer, combo, petunjuk 50:50, umpan balik, hasil, tinjauan jawaban, dan penjelasan; hub responsif dengan deep link `/games?game=...`.
- [x] Persistensi server: tabel `game_attempts`, `recordGame()`, `POST /api/progress/game`, validasi/clamp, akurasi & XP dihitung server, dan `GET /api/progress` membawa 100 attempt terbaru.
- [x] Statistik permainan (attempt, benar, soal, skor terbaik), riwayat di Dasbor/Statistik, dan tiga pencapaian baru (total 13).
- [x] Verifikasi: 19 berkas / 117 tes, typecheck, lint, build produksi 80 halaman statis, 20 rute HTTP 200, dan Playwright enam permainan + riwayat + mobile tanpa error konsol.
- [x] Dokumentasi: PROJECT_STATUS, README, ARCHITECTURE, DATA_MODEL, DECISIONS (ADR-031); empat komponen permainan lama dihapus.

Fase 6 menambah satu tabel (total 10), satu route API, dan komponen permainan bersama. Yang **belum** selesai: penilaian otomatis pelafalan, suite E2E permanen/CI, dan pendalaman konten N4–N1. Permainan tidak mengubah status P0 v0.2.

### Capaian rekayasa Fase 7 — Japanese Pronunciation, Listening & Speaking

Fase ini **bukan** Fase 7 roadmap produk (akun/sinkronisasi) di bawah; ini fase rekayasa yang diminta pada 2026-11-08.

- [x] Registry SpeechProvider dengan browser TTS ja-JP sebagai default, hasil pemutaran terstruktur, timeout, pesan kegagalan, dan seam penyedia audio lain; SpeakButton/ListeningPlayer melaporkan gagal alih-alih diam.
- [x] Panduan pelafalan enam topik (vokal, konsonan, vokal panjang, sokuon, mora/irama, kesadaran pitch) dengan contoh audio dan kontras.
- [x] Halaman Pelafalan: perekam mikrofon setelah izin eksplisit, batas 30 detik, putar ulang dan hapus, tanpa unggah; cek mandiri tetap.
- [x] Pengenalan suara opsional dengan deteksi dukungan, izin eksplisit, batas 15 detik, normalisasi teks, dan penilaian match/close/different; fallback perekam manual; tidak ada klaim skor akustik.
- [x] 15 drill menyimak orisinal (3 per level N5–N1) untuk kosakata, detail, maksud tersirat, dan nuansa; halaman /listening/practice dengan filter level, transkrip setelah menjawab, dan penyimpanan otomatis.
- [x] Integrasi katalog latihan: drill dipetakan ke ListeningExercise, ikut sesi adaptif, dan attempt tersimpan di quiz_attempts tanpa tabel baru.
- [x] Verifikasi: 21 berkas / 131 tes, typecheck, lint, build produksi 81 halaman statis, 21 rute HTTP 200, dan Playwright panduan/rekaman/fallback ASR/drill menyimak tanpa error konsol.
- [x] Dokumentasi: PROJECT_STATUS, README, ARCHITECTURE, DATA_MODEL, DECISIONS (ADR-032).

Fase 7 **tidak menambah tabel, kolom, atau endpoint API**. Rekaman, transkrip, dan hasil pemutaran tidak dipersistensikan. Skor pelafalan akustik, riwayat audio, dan voice Jepang yang dijamin tersedia tetap di luar cakupan; E2E permanen/CI dan pendalaman konten N4–N1 juga belum selesai.

### Capaian rekayasa Fase 8 — Japanese Language Examinations

Fase ini **bukan** Fase 8 roadmap produk (belum ada fase bernomor 8 di roadmap produk); ini fase rekayasa yang diminta pada 2026-11-08.

- [x] Mesin ujian murni `exam-engine.ts`: empat mode (latihan, simulasi, topik, acak), lima level, lima kategori, komposisi bagian, RNG deterministik, penilaian, analitik, rekomendasi, dan `buildRetryPaper()`.
- [x] Simulasi N5 29 soal/25 menit (N1 41/60), tiga bagian tetap, pemilihan soal level-first dengan fallback transparan (`mixedLevels`).
- [x] Alur hub → sesi → hasil: timer refresh-safe, navigasi sebelumnya/berikutnya, tandai soal, palet bagian, konfirmasi keluar, dan pengumpulan otomatis saat waktu habis.
- [x] Latihan/topik memberi pembahasan langsung; simulasi/acak mengumpulkan di akhir. Soal membaca membawa teks bacaan; soal menyimak membawa dialog lengkap dan transkrip setelah diperiksa.
- [x] Hasil: skor belajar (target 70%), benar/salah/kosong, akurasi, durasi, performa bagian/kategori, area lemah, rekomendasi, filter review, ulang soal salah, dan tambah kosakata/kanji ke kartu.
- [x] Persistensi: ringkasan attempt di tabel `exams`; `POST /api/progress/card` idempoten tanpa XP; kertas/hasil aktif di `sessionStorage`.
- [x] Verifikasi: 22 berkas / 149 tes, typecheck, lint, build produksi 82 rute prerender + 15 route API, 23 rute HTTP 200, dan Playwright alur latihan/simulasi/hasil/review/retry/add-card/mobile tanpa error konsol.
- [x] Dokumentasi: PROJECT_STATUS, README, ARCHITECTURE, DATA_MODEL, DECISIONS (ADR-033).

Fase 8 **tidak menambah tabel/kolom** dan hanya menambah satu endpoint. Batasan: skor dinilai di klien, mode/judul tidak disimpan, sesi aktif hilang saat tab ditutup, N3–N1 masih memakai fallback. Tes topik dan analisis kelemahan roadmap produk Fase 6 kini tercapai; tren skor per bagian lintas attempt dan anti-cheat server belum.

### Capaian rekayasa Fase 9 — Japanese Culture, Anime & Interesting Facts

Fase ini **bukan** fase roadmap produk bernomor 9; ini fase rekayasa yang diminta pada 2026-11-08.

- [x] 33 artikel orisinal dalam enam grup penemuan: budaya & tradisi (9), makanan (7), geografi (5), sejarah (4), anime & hiburan (5), fakta bahasa (3).
- [x] 132 fakta (4 per artikel), Fakta Hari Ini deterministik, tombol fakta acak, dan tautan ke artikel sumber fakta.
- [x] Pencarian lintas judul/isi/topik/fakta/kosakata/ungkapan, filter grup + Favorit, kartu artikel dengan status dibaca dan jumlah kosakata.
- [x] Detail artikel: fakta singkat, ungkapan + label register (termasuk formal/arkais/anime), peringatan bahasa fiksi, kuis 2 soal, kosakata menaut ke kamus, 2–3 sumber organisasi, catatan orisinalitas, progres artikel, dan materi terkait.
- [x] Favorit persisten di tabel `culture_favorites` + `POST /api/progress/favorite`, ikut snapshot/ekspor/impor/reset; tidak memberi XP.
- [x] 11 sumber organisasi (JNTO, Bunka, UNESCO, MAFF, GSI, JMA, Rekihaku, Britannica, Britannica Language, AJA, JPF); tidak ada gambar/audio anime berhak cipta.
- [x] Verifikasi: 23 berkas / 153 tes, typecheck, lint, build produksi 83 rute prerender + 16 route API, 23 rute HTTP 200, dan Playwright favorit/kuis/tautan kosakata/dark/mobile tanpa error konsol.
- [x] Dokumentasi: PROJECT_STATUS, README, ARCHITECTURE, DATA_MODEL, DECISIONS (ADR-034).

Fase 9 menambah **satu tabel** (`culture_favorites`) dan **satu endpoint** (`POST /api/progress/favorite`). Batasan: sumber bersifat organisasi/rujukan umum, bukan kutipan per kalimat; kuis hanya memeriksa arti kosakata dan bacaan; fakta harian mengikuti tanggal lokal; artikel belum berilustrasi; daftar 33 kartu belum berpaginasi di mobile.

### Capaian rekayasa Fase 10 — Personalized Learning Experience

Fase ini **bukan** fase roadmap produk bernomor 10; ini fase rekayasa yang diminta pada 2026-11-08.

- [x] Dasbor personal: ringkasan belajar (pelajaran, kosakata, kanji, tata bahasa, menit belajar, ujian), level, target, rekomendasi, dan ujian terbaru.
- [x] Target dapat diatur: XP, durasi belajar, kosakata baru, pelajaran per hari, dan frekuensi hari aktif per minggu; server meng-clamp dan UI memberi pilihan realistis.
- [x] Streak: current, longest, hari aktif minggu ini, dan kalender 17 minggu; tanggal memakai `toDateKey()` lokal.
- [x] 21 pencapaian dengan definisi terpusat: pelajaran pertama, 100 kosakata, Hiragana/Katakana master, streak 7 hari, ujian pertama/lulus, kuis sempurna, kanji, dan lain-lain.
- [x] Rekomendasi explainable (maksimum 4) dari kartu jatuh tempo, kosakata/tata bahasa lemah, skor lesson, bagian ujian lemah, pelajaran berikutnya, dan target XP; setiap item menampilkan alasan + bukti.
- [x] Kamus pribadi: simpan kosakata/kanji/tata bahasa, catatan, koleksi, filter, dan ulasan tersimpan; tersimpan di `saved_items`/`saved_collections` dan ikut ekspor/impor/reset.
- [x] Riwayat/tren: kalender, tren XP 30 hari, timeline belajar, target harian, dan ringkasan mingguan.
- [x] Verifikasi: 27 berkas / 173 tes, typecheck, lint, build produksi **84 rute prerender + 18 route API**, 24 rute HTTP 200, Playwright dasbor/statistik/kamus pribadi/pengaturan dark/mobile tanpa error konsol.
- [x] Dokumentasi: PROJECT_STATUS, ARCHITECTURE, DATA_MODEL, DECISIONS (ADR-035–ADR-037), README, ROADMAP.

Fase 10 menambah **dua tabel** (`saved_items`, `saved_collections`) dan **dua endpoint** (`/api/progress/saved`, `/api/progress/collections`), sehingga totalnya menjadi **13 tabel** dan **18 route handler API**. Batasan: target/streak memakai tanggal lokal server, jadi lintas zona waktu belum dijamin; snapshot membatasi activity/review/kuis/ujian/permainan; ulasan kamus pribadi bukan SRS dan tidak mengubah jadwal; rekomendasi adalah aturan deterministik tanpa ML; belum ada pengingat kalender, PWA penuh, atau sinkronisasi multi-perangkat.

### Capaian rekayasa Fase 11 — Advanced Learning Features

Fase ini **bukan** fase roadmap produk bernomor 11; ini fase rekayasa yang diminta pada 2026-11-08. Sembilan kandidat dievaluasi, lalu hanya fitur yang memberi nilai edukatif tinggi tanpa mengorbankan kesederhanaan yang diimplementasikan.

| Kandidat | Nilai edukatif | Keputusan Fase 11 |
| --- | --- | --- |
| Kamus Jepang | Tinggi | Dipertahankan dan diperkaya: kosakata terkait, kanji beradikal sama, audio/contoh yang sudah ada |
| Kanji Explorer | Tinggi | Dipertahankan: arti, on/kun, radikal, goresan, contoh, mnemonik, kuis, kanji beradikal sama; komponen/urutan goresan ditunda |
| Latihan menulis | Sedang | Ditunda: belum ada dataset urutan goresan terverifikasi; risiko akurasi dan aksesibilitas tinggi |
| Latihan membaca | Tinggi | Sudah kuat (furigana, terjemahan, kosakata, pemahaman); delapan N5 menjadi LessonPlan di Fase 13; perluasan konten tetap jalur P0 terpisah |
| Simulasi percakapan | Tinggi | **Dibangun**: 6 skenario orisinal N5–N4, 19 langkah, 3 pilihan/langkah, umpan balik konteks/register |
| Latihan mengetik | Tinggi | **Dibangun**: 3 mode, 5/10/15 soal, pemeriksaan lokal, timer, tinjauan, akurasi |
| Rencana belajar personal | Tinggi | **Dibangun**: target JLPT + rentang minggu, jadwal deterministik, feasibility, tonggak |
| Offline/PWA | Sedang | Ditunda: konflik sinkronisasi dan kompleksitas penyimpanan belum sepadan |
| Sumber belajar | Rendah/opsional | Ditunda: halaman statis tidak menambah banyak nilai dibanding materi yang sudah tertaut |

- [x] Enam skenario percakapan bertipe di `src/content/conversations.ts`: perkenalan, restoran, belanja, arah, pertemuan santai, dan transportasi; 19 langkah, 18 frasa kunci, catatan budaya, dan tiga pilihan per langkah dengan satu jawaban paling sesuai konteks/register.
- [x] Pemain percakapan: umpan balik pilihan yang kurang tepat, transkrip, skor berbasis kesalahan percobaan pertama, penyimpanan `LessonProgress` kind `conversation` (20 XP), tanpa menyimpan transkrip/audio.
- [x] Mesin mengetik lokal di `src/lib/typing.ts`: Kana → Romaji, Romaji → Kana, Arti → Kanji; normalisasi romaji/kanji, alias umum, sesi deterministik, akurasi, tanpa unggah ketikan.
- [x] Rencana belajar deterministik di `src/lib/study-plan.ts`: level saat ini sampai target, anggaran menit/minggu, alokasi pelajaran, sisa waktu ulangan, feasibility `longgar`/`realistis`/`ketat`/`tidak-realistis`, tonggak, dan peringatan pelajaran yang belum terjadwal.
- [x] Pengaturan baru `studyTargetLevel` (N5–N1/null) dan `studyTargetWeeks` (4–104; pilihan UI 8/12/16/24/36); berlaku tanpa tabel baru.
- [x] Kamus/kanji: bagian kosakata terkait dan kanji beradikal sama, masing-masing maksimum empat item dan dapat membuka detail berikutnya.
- [x] Verifikasi: **30 berkas / 190 tes**, typecheck dan ESLint bersih; build produksi **87 halaman prerender + rute dinamis `/conversation/[id]` + 18 route API**; 29 pola rute HTTP 200 tanpa error konsol; Playwright menyelesaikan percakapan dan mengetik, menyimpan target N4/8 minggu, serta memeriksa kamus/kanji dan mobile.
- [x] Dokumentasi: PROJECT_STATUS, ARCHITECTURE, DATA_MODEL, DECISIONS (ADR-038–ADR-042), README, ROADMAP.

Fase 11 **tidak menambah tabel, kolom, atau endpoint API**; total tetap **13 tabel** dan **18 route handler API**. Batasan: percakapan adalah konten bertipe, bukan AI/native speaker; dua mode mengetik memerlukan IME dan penilaiannya lokal (bukan anti-kecurangan); rencana belajar adalah estimasi deterministik, bukan prediksi kelulusan JLPT; latihan menulis/urutan goresan dan offline/PWA tetap ditunda sampai ada data serta desain sinkronisasi yang layak.

### Capaian rekayasa Fase 12 — Final Quality Assurance & Production Readiness

Fase ini **bukan** fase roadmap produk bernomor 12; ini audit kualitas menyeluruh dan perbaikan temuan yang tidak memerlukan keputusan produk baru. Tidak ada fitur, tabel, atau endpoint baru.

| Area audit | Temuan | Tindakan |
| --- | --- | --- |
| Keamanan | 1 blocker (API tanpa auth), 2 high (CSRF; bind semua antarmuka), 4 medium, 6 low | Bind loopback, Host allowlist, JSON + same-origin, body 5 MiB, CSP/header, health minimal, DB 0700/0600, impor berkonfirmasi; auth/TLS tetap belum ada |
| UI/UX & a11y | 0 blocker, 4 high, 21 medium, 10 low; audit lanjutan 0 blocker, 3 high, 3 medium, 4 low | lang=ja, h1 duplikat, kontras gelap, overflow /plan dan /kana 390px, fokus soal, target sentuh, heading transkrip, drawer fokus, live region |
| Konten Jepang | 4 high, 6 medium, 7 low, 1 uncertain | 21+ koreksi: pengecoh ambigu, kunci susun kalimat, frasa bacaan, bacaan 天/来/四/風邪/エンジニア, kontradiksi percakapan, alias romaji wo/nn |
| Performa | Font Google render-blocking ~183 KiB gzip; Noto Serif tidak dipakai; permainan/exam eager | Font jarak jauh dihapus, stack sistem, game via next/dynamic; katalog konten masih satu chunk bersama (~33 KiB gzip) |
| Teknis | Baseline 30/190 | check 32/199, typecheck + ESLint bersih, build 87 prerender + dinamis + 18 API, 29 rute HTTP 200, 0 console error |

- [x] **Keamanan lokal:** loopback bind, Host allowlist (421), JSON + same-origin (415/403), body 5 MiB (413), CSP + nosniff/frame/referrer/permissions/COOP, transaksi `BEGIN IMMEDIATE`, sanitasi error, impor envelope `{confirm:true,snapshot}` + pratinjau modal dan validasi sebelum DELETE.
- [x] **Aksesibilitas & responsif:** `lang=ja` pada teks Jepang, satu h1 desktop, kontras tombol gelap 6,44:1, /plan dan /kana tanpa overflow 390px, target sentuh minimal 24px, fokus soal berpindah ke prompt, drawer fokus terkelola, live region simpan/feedback.
- [x] **Konten:** koreksi soal berkunci ganda/ambigu, frasa bacaan yang hilang, bacaan kanji/kosakata, kontradiksi percakapan, label register, dan alias romaji; gaya romanisasi/loanword yang tidak seragam dicatat sebagai batasan.
- [x] **Font & performa:** Google Fonts dihapus; stack sistem Jepang; tidak ada permintaan font eksternal; pengukuran warm `/` 475 KB total (403 KB skrip), `/games` 51 KB, `/exams/session` 64 KB, `/settings` 56 KB, `/typing` 47 KB.
- [x] **Verifikasi:** 32 berkas/199 tes, build 87 + dinamis + 18 API, 29 rute, 69 pemuatan halaman (23 rute x 3 viewport) tanpa error; Playwright ujian 29 soal (34%), percakapan 100% tersimpan, mengetik 0/5 tersimpan, impor pratinjau/Batal/Ya timpa, mobile gelap 390px.
- [x] **Dokumentasi:** PROJECT_STATUS, ARCHITECTURE, DATA_MODEL, DECISIONS (ADR-043–ADR-045), README, ROADMAP, CONCERNS_BACKLOG.

Fase 12 **tidak menambah tabel/kolom/endpoint**; total tetap **13 tabel** dan **18 route API**. Batasan: keamanan lokal bukan keamanan publik (tanpa auth/TLS/rate limit/audit log/isolasi pengguna); progres tetap client-authoritative; katalog konten masih ikut bundle klien; tidak ada CI/E2E otomatis; rendering Jepang bergantung font perangkat.

### Capaian rekayasa Fase 13 — Cross-Phase Review, Concern Resolution & Final Refinement

Fase ini **bukan** fase roadmap produk bernomor 13; ini retrospektif lintas fase. Tidak ada fitur produk, tabel, atau endpoint baru. Fokusnya menutup concern yang menutup risiko correctness/data/quality gate dan mencatat alasan penundaan item lain.

| Kandidat concern | Nilai | Keputusan Fase 13 |
| --- | --- | --- |
| Backup/restore SQLite | Tinggi | **Dibangun**: CLI `VACUUM INTO`, integrity check, retensi, restore berkonfirmasi |
| Delapan pelajaran N5 membaca/menyimak | Tinggi | **Dibangun**: LessonPlan dari konten yang sudah diaudit, blok `jp-prose`/`dialog` |
| Validator QA semantik | Tinggi | **Dibangun**: opsi duplikat, kunci di luar rentang, ID ganda/isi berbeda |
| CI quality gate | Tinggi | **Dibangun**: audit produksi + check + build; E2E/axe belum |
| Reflow 320 px | Tinggi | **Diperbaiki**: empat rute + `StatTile`; 29 rute x 320/400 bersih |
| N4 50–60 pelajaran / bank N3–N1 | Tinggi | **Jalur konten P0 terpisah** (bukan Fase 14): menulis konten secara tergesa-gesa melemahkan akurasi |
| E2E/axe/tes komponen/perf budget | Sedang | **Ditunda**: dependency dan baseline; CI dasar sudah ada |
| Git, observability, refaktor katalog | Sedang | **Ditunda**: keputusan operasional / belum ada bukti dampak cukup |
| Auth/TLS/rate limit/audit log | Tinggi | **Ditunda**: keputusan produk dan operasional; bukan pekerjaan setengah jadi |

- [x] `scripts/backup-db.mjs` + `src/lib/backup-db.test.ts`: backup, verify, restore, retensi 7, mode 0700/0600; backup database produksi 151.552 byte, 13 tabel, roundtrip terverifikasi.
- [x] `src/content/lessons/reading.ts` dan `listening.ts`: 8 LessonPlan N5 dengan ID `les-reading-*`/`les-listening-*`, soal sumber, blok `jp-prose`/dialog; total 70 LessonPlan dan 8 jalur N5.
- [x] `src/lib/content-qa.ts` + tes: prompt kosong, opsi duplikat setelah normalisasi, `answerIndex` di luar rentang, ID ganda dengan isi berbeda; 0 error struktural pada dataset nyata.
- [x] `.github/workflows/quality.yml` + `CHANGELOG.md`: Node 24, `npm ci`, `npm run audit:prod`, `npm run check`, `npm run build`.
- [x] Reflow 320 px pada `/`, `/vocabulary`, `/exams`, `/settings`; label mastery non-warna pada kana/kanji, kalender/heatmap, dan `lang=ja` pada blok pelajaran.
- [x] Verifikasi: **34 berkas / 206 tes**, typecheck dan ESLint bersih; build **94 halaman statis** (70 pelajaran) + 5 route detail dinamis + 18 API; 29 rute x 320/400 px tanpa overflow/error; audit produksi 0 kerentanan (8 isu moderat dev-only).
- [x] Dokumentasi: PROJECT_STATUS §2.19, ARCHITECTURE v1.8, DATA_MODEL v1.8, DECISIONS ADR-047–ADR-049, README, ROADMAP, CONCERNS_BACKLOG, CHANGELOG.

Fase 13 **tidak menambah tabel/kolom/endpoint**; total tetap **13 tabel** dan **18 route API**. Batasan: validator bukan pengganti reviewer manusia; backup tidak terenkripsi/off-site; N4–N1 belum diperluas; E2E/axe tidak masuk CI; auth/TLS tetap prasyarat deployment publik.

### Capaian rekayasa Fase 14 — Existing System Audit & New Feature Integration Planning

Fase ini **bukan** fase roadmap produk bernomor 14 dan **tidak mengimplementasikan fitur**. Fase ini mengaudit tiga kemampuan yang diminta, memverifikasi kelayakan teknis/lisensi, dan menyusun rencana Fase 15–19. Tidak ada kode aplikasi, tabel, endpoint, atau aset baru; produksi `:3100` tidak dijalankan ulang.

| Kandidat | Nilai | Keputusan Fase 14 |
| --- | --- | --- |
| Audio & Pronunciation Studio | Tinggi | **Direncanakan Fase 15**: resolver berlapis rekaman → TTS browser `ja-JP` → TTS lokal opsional → status tidak tersedia; kontrol audio reusable; diagnostik voice |
| Handwriting & Stroke Order Studio | Tinggi | **Direncanakan Fase 16**: KanjiVG terverifikasi (111/111 kanji, 208/208 kana, 259 karakter, CC BY-SA 3.0), animasi SVG, kanvas latihan, progres; tanpa klaim handwriting recognition |
| Story & Conversation Animation Player | Tinggi | **Direncanakan Fase 17–18**: model cerita/karakter/scene, dua cerita awal, audio per baris, subtitle Jepang, terjemahan Indonesia, anotasi kosakata, animasi panggung |
| CMS/admin sekarang | Rendah | **Tidak dibangun**: konten-kode bertipe + validator; ditinjau hanya jika ada editor non-teknis/kebutuhan volume |
| Video/rekaman penuh | Rendah | **Tidak dipakai**: DOM/SVG/CSS/Web Animations; tidak ada media berhak cipta |

- [x] Audit arsitektur, 29 rute, 18 API, 13 tabel, konten, audio, writing, story, dan CMS. Tidak ada CMS/admin atau content API; konten adalah modul TypeScript bertipe. Tidak ada proses QA/test/build yang berjalan.
- [x] Akar masalah audio: `speechSynthesis` tersedia `true`, tetapi `getVoices()` = 0 dan voice `ja` = 0 pada Chromium headless; tidak ada aset audio di `public/`. Kode playback sudah ada; ini masalah lingkungan + tidak ada fallback, bukan field CMS.
- [x] Verifikasi KanjiVG pada commit `610091ce618cf757ed1357a8954cd65283e015d6`: 259 karakter dibutuhkan, 0 hilang, 690.664 byte; lisensi CC BY-SA 3.0 dengan atribusi/share-alike.
- [x] Evaluasi Web Speech/SpeechSynthesis, Open JTalk (BSD-3-Clause; voice data perlu verifikasi terpisah), Canvas/SVG, Web Animations, dan scene DOM. Tidak ada API berbayar atau dependensi baru.
- [x] Empat dokumen: [ENHANCED_LEARNING_FEATURES_SPEC.md](ENHANCED_LEARNING_FEATURES_SPEC.md), [ENHANCED_FEATURES_ARCHITECTURE.md](ENHANCED_FEATURES_ARCHITECTURE.md), [ENHANCED_FEATURES_ROADMAP.md](ENHANCED_FEATURES_ROADMAP.md), [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md).
- [x] Backlog v1.2: **100 concern** — 26 RESOLVED, 13 ACCEPTED, 57 DEFERRED, 1 BLOCKED, 3 REJECTED. CNT-07 (stroke order) dipindahkan ke ACCEPTED; CNT-08 (komponen kanji) tetap BLOCKED.
- [x] ADR-050–ADR-054: fallback audio berlapis, KanjiVG/tanpa handwriting recognition, story player DOM/SVG, tanpa CMS sekarang, dan Fase 14 hanya audit/perencanaan.
- [x] Verifikasi dokumen: baseline tetap **34 berkas / 206 tes**; tidak ada perubahan kode, tabel, endpoint, atau database.

Rencana awal Fase 15–19 membutuhkan **18–24 sesi** (audio 3–4; writing 4–6; story 4–5; animasi/2 cerita 4–5; integrasi/QA 3–4). Eksekusi berubah: Fase 15 CMS diblokir, audio dikerjakan pada Fase 16, dan writing/story bergeser ke Fase 17–19. Setiap fase wajib menjaga rute lama tetap 200/0 error, tidak menambah permintaan eksternal, dan memperbarui dokumentasi. Fase konten N4 dan bank soal N3–N1 tetap jalur P0 terpisah; auth/TLS/rate limit tetap prasyarat deployment publik.

### Capaian rekayasa Fase 14B — Mobile Compatibility Audit (learner)

Fase ini mengaudit aplikasi learner yang ada, bukan CMS. Tidak ada CMS/admin, kanvas menulis, atau story theater di repo; area itu dilaporkan tidak tersedia dan tidak diklaim kompatibel.

- [x] Audit Playwright 29 rute x 9 viewport (320, 360, 375, 390, 430, 768, 1024, 1366, 1920) = **261 pemuatan**, semuanya HTTP 200, 0 error konsol/halaman, 0 overflow dokumen.
- [x] Perbaikan High: grid `/progress` memakai `minmax(0,1fr)` + `min-w-0`; `StatTile` tidak memotong label/nilai; kartu JLPT 320 px, grid statistik Rencana/Mengetik, label tema Pengaturan, target sentuh, dan opacity dekoratif header.
- [x] Suite fungsional mobile 390x844: 18/18 langkah lulus (drawer, pelajaran, kana, SRS kosakata, tata bahasa, membaca, menyimak, fokus latihan, permainan, ujian, mengetik, percakapan, rencana, tema, kamus, statistik).
- [x] Bukti: [MOBILE_COMPATIBILITY_REPORT.md](MOBILE_COMPATIBILITY_REPORT.md); screenshot di .screenshots/mobile-audit.
- [x] Batas: hanya Chromium emulasi; tidak ada perangkat fisik, iOS Safari, Android Chrome, screen reader, kamera/file picker, atau audio nyata yang diuji.

### Capaian rekayasa Fase 15–16 — CMS blocker dan Audio Studio

**Fase 15 — BLOCKED.** Permintaan memperluas CMS yang “sudah ada” tidak dapat dieksekusi: repo tidak memiliki route /admin atau /cms, API konten, tabel konten/media, maupun proses CMS QA. Konten adalah modul TypeScript bertipe dan ADR-003/ADR-053 memang menunda CMS. Tidak ada kode yang diubah; keputusan yang dibutuhkan adalah lokasi CMS yang dimaksud, otorisasi membangun fondasi CMS baru, atau pass model konten saja.

**Fase 16 — Japanese Audio & Pronunciation Studio (selesai).**

| Area | Keputusan/implementasi |
| --- | --- |
| Sumber suara | Web Speech API `speechSynthesis`, hanya voice `ja-JP`; deteksi `getVoices()` + `voiceschanged` |
| Fallback | Bila voice Jepang tidak ada, tampilkan status dan jangan memakai voice bahasa lain; transkrip tetap terbaca |
| Pemutar | Satu AudioPlayer global: antrean, putar/jeda/lanjut/berhenti, sebelumnya/berikutnya, ulangi, kecepatan 0,5–1,5×, pilihan voice |
| Cakupan | `/audio` untuk kana, kosakata, kanji, tata bahasa, bacaan, percakapan; detail membaca/percakapan memakai kartu audio; menyimak/pelafalan memakai kontrol yang sama |
| Persistensi | `speechRate`, `voiceURI`, `autoPlayAudio` di Settings yang sudah ada; tidak ada tabel/rahasia/riwayat pemutaran |
| Batas | Tanpa MP3, tanpa unggahan suara, tanpa skor akustik, tanpa klaim kualitas native; Open JTalk tetap opsional dan belum di-deploy |

- [x] Navigasi menjadi **14 tujuan** dengan Audio; `SpeakButton` dan pemutar memakai satu provider sehingga tidak ada overlap.
- [x] Preferensi kecepatan 0,5–1,5× (server clamp) dan pilihan voice disimpan; berpindah rute menghentikan audio.
- [x] Diagnostik jujur saat tidak ada voice Jepang; pemutaran materi yang gagal memberi toast, bukan diam.
- [x] Verifikasi: **36 berkas / 215 tes**, typecheck + ESLint bersih; build **96 halaman statis** (70 pelajaran + `_not-found`) + 5 route detail dinamis + 18 API; 30 pola rute HTTP 200; Playwright audio dengan mock voice, kontrol, pembacaan, percakapan, menyimak, pelafalan, dan mobile 390 tanpa error.
- [x] Dokumentasi: PROJECT_STATUS §2.22, ARCHITECTURE v1.11, DATA_MODEL v1.10, DECISIONS ADR-055–ADR-056, README, ROADMAP, ENHANCED_FEATURES_STATUS, CONCERNS_BACKLOG.

Pada akhir Fase 16, Fase 14B dan 16 **tidak menambah tabel, kolom, atau endpoint**; total saat itu **13 tabel** dan **18 API**. Batasan: voice bergantung perangkat; Chromium uji memakai mock; tidak ada audio statis; writing/story belum ada; CMS tetap blocked.

### Capaian rekayasa Fase 17 — Japanese Handwriting & Stroke Order Studio

**Status: selesai.** Modul menulis dibangun di atas data KanjiVG yang dipin dan diverifikasi, bukan data goresan buatan.

| Area | Keputusan/implementasi |
| --- | --- |
| Sumber data | KanjiVG commit `610091ce618cf757ed1357a8954cd65283e015d6`; 259 glyph unik untuk 319 entri (208 kana + 111 kanji); JSON turunan lokal, `viewBox 0 0 109 109`, 28 titik sampel per goresan |
| Lisensi | CC BY-SA 3.0, atribusi Ulrich Apel/KanjiVG; `THIRD_PARTY_NOTICES.md`, teks lisensi penuh, dan README aset; yōon ditampilkan berurutan sebagai dua komponen, bukan glyph gabungan buatan |
| Katalog | `/writing` dengan 319 karakter, lima tahap A–E, filter Kana/Kanji, pencarian, mastery, 30 kartu per halaman |
| Studio | `/writing/[id]`: animasi SVG dengan nomor goresan, mode Animasi/Tirukan/Mandiri, kontrol play/pause/restart/sebelumnya/berikutnya/ulangi goresan, kecepatan Lambat/Normal/Cepat |
| Input | Pointer Events untuk mouse, sentuh, dan stylus; kanvas responsif; undo/reset; referensi dapat disembunyikan |
| Evaluasi | Perkiraan geometri: goresan 55% bentuk + 12% awal + 12% akhir + 21% arah; total 82% bentuk + 18% jumlah; penalti urutan; mastery ≥80; **bukan** pengenalan tulisan tangan atau nilai estetika |
| Konten | Romaji, pelafalan, jumlah goresan, arti/on/kun/radikal untuk kanji, contoh kata, mnemonic, ±45 catatan bentuk, kesalahan umum |
| Persistensi | Tabel ke-14 `writing_attempts`; XP 15 pada attempt pertama per karakter; snapshot 400 attempt; reset/impor mencakup tabel ini |
| Pencapaian | 23 total; `writing-first` dan `writing-20` ditambahkan |
| Batas | Tanpa rekognisi tulisan tangan, tanpa penilaian akustik/estetika, tanpa data stylus fisik teruji; KanjiVG bukan satu-satunya variasi urutan yang sah; lisensi CC BY-SA mewajibkan atribusi dan share-alike untuk data turunan |

- [x] Pipeline impor `scripts/import-kanjivg.mjs`, 259 JSON + manifest, semua titik sebagai objek `{x,y}`; perbaikan jumlah goresan 貢 (7 → 10) dari KanjiVG.
- [x] Tabel `writing_attempts` + endpoint `POST /api/progress/writing`; total menjadi **14 tabel** dan **19 API**.
- [x] Cross-link dari detail kana dan kanji; kartu Menulis di dasbor; navigasi menjadi **15 tujuan**.
- [x] Verifikasi: **38 berkas / 227 tes**, typecheck + ESLint bersih; build **97 halaman statis** (70 pelajaran + `/writing` + `_not-found`) + 6 route detail dinamis + 19 API; **32 pola rute** HTTP 200; Playwright writing desktop/mobile 320/390/1440, touch via CDP, undo/reset, animasi, reduced-motion, ekspor/impor roundtrip, tanpa error.
- [x] Dokumentasi: PROJECT_STATUS §2.23, ARCHITECTURE v1.12, DATA_MODEL v1.11, DECISIONS ADR-057–ADR-059, README, ROADMAP, ENHANCED_FEATURES_STATUS, CONCERNS_BACKLOG.

Fase 17 menambah satu tabel dan satu endpoint.

### Capaian rekayasa Fase 18 — Japanese Story Theater & Animated Conversation

**Status: selesai.** Teater cerita dibangun sebagai renderer generik dari data cerita bertipe, bukan kode per adegan dan bukan video AI berbayar. Modul percakapan Fase 11 tetap dipertahankan.

| Area | Keputusan/implementasi |
| --- | --- |
| Model cerita | Story + StoryCharacter + StoryScene + StoryLine + StoryQuestion; 3 cerita orisinal (2 N5, 1 N4), 9 adegan, 36 baris dialog, 9 soal; tidak ada tabel konten/CMS |
| Panggung | Satu `StoryStage` generik: 8 latar SVG/CSS orisinal (stasiun, peron, kereta, kafe, meja, taman hujan, perpustakaan, jalan), 5 posisi, 5 ekspresi, bubble dialog, efek hujan/salju, animasi masuk/idle ringan; reduced-motion dihormati |
| Mode | **Belajar** manual (putar baris, ulangi, navigasi) dan **Tonton** otomatis (audio per baris lalu maju); bisa dihentikan dan dilanjutkan dari baris mana pun |
| Kontrol | Putar/jeda/lanjut/hentikan, sebelumnya/berikutnya, ulangi baris, mulai ulang, kecepatan 0,75–1,5×, pilihan voice, lompat ke dialog/adegan, progres |
| Tampilan belajar | Subtitle Jepang, furigana, romaji, terjemahan Indonesia, mode Jepang saja, anotasi kosakata, catatan tata bahasa; kosakata dapat dibuka dan disimpan ke kamus pribadi |
| Audio | Memakai pemutar global Fase 16 dan hanya voice `ja-JP`; highlight per baris (bukan per kata); bila ≥2 voice Jepang tersedia, voice karakter dipetakan round-robin, bila hanya satu voice semua karakter memakai voice yang sama dengan keterangan jujur |
| Kuis & progres | Kuis pemahaman + menyimak setelah cerita; skor disimpan lewat `recordStory`; XP 25 hanya pada penyelesaian pertama per cerita; tabel ke-15 `story_attempts` |
| Pencapaian | 25 total; `story-first` dan `story-3` ditambahkan |
| Ekstensi video | `StoryScene.videoUrl` adalah seam opsional same-origin; belum ada aset, CMS, atau pipeline video. Ekspor video (MediaRecorder/Canvas/FFmpeg) dan video AI tidak diimplementasikan |
| Batas | Hanya 3 cerita (2 N5 + 1 N4); TTS tidak memberi timing per kata; voice bergantung perangkat; belum ada checkpoint/resume; kamus hanya chip kosakata terkurasi; snapshot 300 attempt/import 1.000; pengujian Chromium emulasi + mock voice |

- [x] Data: 3 cerita/9 adegan/36 dialog/9 soal; setiap `reading` konsisten dengan `furiganaReading(jp)`; seluruh `vocabIds`/`grammarIds` menunjuk katalog nyata; setiap speaker/karakter panggung valid.
- [x] UI: hub `/stories` dengan filter level dan statistik; teater `/stories/[id]` dengan panggung, kontrol, kuis, ringkasan kosakata/tata bahasa, dan tautan kamus; navigasi menjadi **16 tujuan**.
- [x] Persistensi: `story_attempts` + `POST /api/progress/story`; total **15 tabel** dan **20 API**; reset/impor/ekspor mencakup cerita; snapshot 300 dan import 1.000.
- [x] Verifikasi: **39 berkas / 235 tes**, typecheck + ESLint bersih; build **101 halaman statis** (70 pelajaran + `/stories` + 3 cerita SSG + `_not-found`) + 6 route detail dinamis + 20 API; **34 pola rute** HTTP 200/0 error; Playwright Fase 18: 24 pemeriksaan, mode tonton, toggle terjemahan/furigana, kuis tersimpan 100%, kamus, tanpa voice tetap terbaca, mobile 390 tanpa overflow, 0 error.
- [x] Dokumentasi: PROJECT_STATUS §2.24, ARCHITECTURE v1.13, DATA_MODEL v1.12, DECISIONS ADR-060–ADR-062, README, ROADMAP, ENHANCED_FEATURES_STATUS, CONCERNS_BACKLOG, CHANGELOG.

Fase 18 menambah satu tabel dan satu endpoint. Rencana empat cerita awal belum sepenuhnya terpenuhi: tiga cerita sudah ada (CNT-21 tetap ACCEPTED); CMS tetap BLOCKED; ekspor video dan pipeline aset video tetap DEFERRED. Fase 19 kemudian menstabilkan integrasi audio/menulis/cerita tanpa menambah tabel atau endpoint.

### Capaian rekayasa Fase 19 — Integration, QA, Performance & Accessibility

**Status: selesai.** Fase 19 adalah stabilisasi lintas fitur, bukan ekspansi produk.

| Area | Keputusan/implementasi |
| --- | --- |
| Integrasi pelajaran→menulis | Helper murni `writingHrefForContentRef` memetakan referensi kana/kanji ke `/writing/writing-<id>`; tombol **Latihan menulis** muncul di pelajaran yang memiliki referensi kana/kanji; katalog menulis berat tidak masuk bundle pelajaran |
| Koreksi salinan | Instruksi urutan goresan di `src/content/lessons/kanji.ts` yang usang dikoreksi; sekarang mengarah ke Studio Menulis dan meminta verifikasi kamus tepercaya |
| QA | 34 pola rute × desktop 1440/mobile 390/mobile 320 = **102/102**; enam perjalanan kritis lulus; 0 kontrol tanpa nama di 5 rute sampel; 0 error konsol/request |
| Performa | Transfer 572–610 KB per halaman fitur (termasuk prefetch/RSC Next.js); 0 glyph KanjiVG di hub dan 1 glyph di detail; tidak ada aset video/eksternal di teater |
| Batas | Chromium teremulasi; belum ada perangkat fisik/screen reader penuh; angka transfer bukan muatan awal murni; CMS/video tetap tidak ada |
| Tabel/API | Tidak ada tabel, endpoint, dependensi, CMS, atau pipeline video baru |

- [x] Data/kode: helper + tombol kondisional + koreksi salinan + tes tautan; total **39 berkas/236 tes**, typecheck/ESLint bersih.
- [x] Build: **101 halaman statis + 6 rute detail dinamis + 20 route API**.
- [x] QA: laporan `.data/phase19-report.json`; 102/102 rute, enam perjalanan, CMS `/admin`/`/api/admin` 404 tanpa tautan; satu observasi `h1` ganda tidak dapat direproduksi.
- [x] Dokumentasi: PROJECT_STATUS §2.25, ARCHITECTURE v1.14, DECISIONS ADR-063, README, ROADMAP, ENHANCED_FEATURES_STATUS, CONCERNS_BACKLOG (116 concern; RES-21/RES-22), CHANGELOG.

Fase 19 tidak menambah tabel atau endpoint. Skrip QA masih sementara di `.data/phase19-qa.cjs` dan harus menjadi suite E2E yang di-commit pada Fase 20. CMS tetap BLOCKED; ekspor video/pipeline aset tetap DEFERRED.

---



---

## 3. Legenda prioritas dan status

### Prioritas

| Kode | Arti | Aturan |
| --- | --- | --- |
| P0 | Wajib untuk MVP v0.2 | Menghambat rilis MVP; harus selesai dan diuji |
| P1 | Penting setelah MVP | Meningkatkan kedalaman/engagement; boleh menyusul |
| P2 | Opsional/eksperimental | Ditunda sampai fondasi stabil atau ada kebutuhan nyata |

### Status

| Status | Arti |
| --- | --- |
| Sudah | Berfungsi dan terverifikasi |
| Sebagian | Ada, tetapi belum memenuhi kebutuhan |
| Belum | Belum diimplementasikan |
| Direncanakan | Sudah dipetakan, belum dikerjakan |

### Ukuran pekerjaan

S = kecil (satu modul/komponen), M = sedang (beberapa modul + migrasi/tes), L = besar (batch konten atau lintas lapisan).

---

## 4. Batas MVP v0.2

MVP v0.2 tercapai bila **seluruh P0** selesai:

### 4.1 P0 — Konten

- [ ] Ambang konten N5–N1 sesuai PROJECT_SPEC.md 7.2 tercapai.
- [ ] Validator konten menolak field wajib yang kosong, duplikasi id, kunci jawaban tidak valid, dan sisa markup furigana.
- [ ] Setiap soal baru memiliki level dan tag topik yang konsisten.
- [ ] Tidak ada klaim JLPT resmi atau fakta budaya tanpa catatan.

### 4.2 P0 — Latihan dan personalisasi

- [x] Isian rumpang (pilih/ketik) dengan pembahasan. (Fase 5)
- [x] Terjemahan Indonesia–Jepang dengan strategi penilaian yang jelas. (Fase 5)
- [x] Mencocokkan kosakata/kanji dengan arti. (Fase 5)
- [x] Bookmark kosakata (inti); diperluas ke kanji dan tata bahasa lewat kamus pribadi. (Fase 10)
- [x] Target mingguan di samping target harian. (Fase 10)
- [ ] Tampilan jadwal ulangan beberapa hari ke depan.
- [x] Rekomendasi harian berbasis aturan dan dapat diuji. (Fase 10)
- [x] Permainan vocabulary matching berbasis arti. (Fase 6: Kejar kosakata)

### 4.3 P0 — Kualitas

- [ ] CI menjalankan typecheck, lint, unit test, dan build pada setiap perubahan.
- [ ] Tes komponen untuk alur kuis, flashcards, dan form pengaturan.
- [ ] E2E Playwright untuk alur kuis, ulangan SRS, ujian, dan ekspor/impor. (verifikasi manual Fase 5 selesai; belum dijadikan suite CI)
- [ ] Audit aksesibilitas dasar dan perbaikan temuan serius.
- [ ] Anggaran kinerja diukur pada halaman utama, kosakata, dan ujian.
- [x] Dokumentasi status/keputusan diperbarui. (Fase 5)

---

## 5. Urutan fase roadmap produk yang diusulkan

Semua fase bernomor di bagian ini adalah **fase roadmap produk**, bukan fase rekayasa. Fase rekayasa 1–6 sudah selesai; fase produk 2–8 belum sepenuhnya, meskipun Fase 5 dan 6 rekayasa menutup sebagian besar pekerjaan latihan dan permainan di Fase 3/5 roadmap produk.

### Fase 2 roadmap produk — Fondasi konten dan guardrails (P0)

**Tujuan:** membuat penambahan konten aman, terukur, dan dapat diverifikasi.

**Pekerjaan:**
1. Tambahkan validator konten yang lebih ketat (field wajib, id unik, level, tag, furigana, answer index, multiset token).
2. Tambahkan metadata tag/topik pada soal dan materi yang relevan.
3. Perluas kosakata dan kanji N4–N1 secara bertahap, mulai dari N4 lalu N3, N2, N1.
4. Tambahkan minimal dua bacaan (N2, N1) dan tiga dialog menyimak (N3, N2, N1).
5. Tambahkan CI yang menjalankan npm ci, check, dan build.
6. Perbarui laporan cakupan konten per level di CI atau skrip.

**Deliverable:**
- Dataset konten memenuhi ambang MVP.
- Validator dan tes konten baru.
- Pipeline CI dasar.
- Laporan coverage per level.

**Exit criteria:**
- Semua ambang 7.2 terpenuhi.
- check + build lulus di CI.
- Tidak ada penurunan hasil tes baseline.

**Dependensi:** skema konten stabil; tidak ada perubahan arsitektur besar.

**Ukuran:** L (konten) + M (validasi/CI).

---

### Fase 3 roadmap produk — Latihan lengkap dan pengelolaan personal (P0 — sebagian selesai lewat Fase 5 rekayasa)

**Tujuan:** melengkapi alur belajar dan memberi pengguna kendali atas materi yang ingin diulang.

**Pekerjaan:**
1. [x] Definisikan domain PracticeExercise (mcq, cloze, translation, matching, ordering, flashcards) dan validasi jawaban. → diperluas menjadi sembilan jenis latihan pada Fase 5 rekayasa.
2. [x] Implementasikan isian rumpang dengan pembahasan.
3. [x] Implementasikan terjemahan dengan normalisasi jawaban dan fallback pembahasan.
4. [x] Implementasikan matching kosakata/kanji–arti.
5. [x] Tambahkan penyimpanan materi, migrasi, endpoint, dan UI kamus pribadi kosakata/kanji/tata bahasa. (Fase 10: `saved_items`/`saved_collections`, bukan tabel bookmarks generik)
6. [x] Tambahkan target mingguan (frekuensi hari aktif) pada pengaturan dan ringkasan progres. (Fase 10)
7. [ ] Tambahkan tampilan jadwal ulangan beberapa hari.
8. [x] Implementasikan rekomendasi harian berbasis aturan dan aksi berikutnya di dasbor. (Fase 10)
9. [x] Tambahkan permainan vocabulary matching. (Fase 6: Kejar kosakata)
10. [ ] Tambahkan tes komponen untuk alur baru.

**Deliverable:**
- Jenis latihan baru berfungsi dan tercatat di riwayat.
- Bookmark persisten dan ikut ekspor/impor.
- Target mingguan dan rekomendasi tampil di dasbor.
- Tes komponen untuk alur kritis.

**Exit criteria:**
- Semua P0 latihan/personalisasi lolos tes.
- Bookmark bertahan setelah reload dan roundtrip ekspor/impor.
- Rekomendasi tidak pernah menaut ke konten kosong.
- Tidak ada regresi pada SRS dan ujian.

**Dependensi:** Fase 2 roadmap produk (tag soal + konten), migrasi DB.

**Ukuran:** L.

---

### Fase 4 roadmap produk — Release gate MVP (P0)

**Tujuan:** memastikan MVP stabil, aksesibel, dan layak dirilis sebagai v0.2.

**Pekerjaan:**
1. E2E Playwright untuk: sesi kuis, ulangan SRS, ujian lengkap, bookmark, ekspor/impor, tema.
2. Audit aksesibilitas: keyboard, fokus, label form, kontras, aria-live, reduced motion.
3. Ukur kinerja halaman utama/kosakata/ujian; perbaiki regresi besar.
4. Uji fallback audio dan tampilan tanpa voice Jepang.
5. Uji build produksi + smoke test rute.
6. Perbarui PROJECT_STATUS.md dan DECISIONS.md.
7. Buat catatan rilis v0.2.

**Deliverable:**
- E2E suite dan laporan a11y/kinerja.
- Build produksi terverifikasi.
- Dokumentasi rilis.

**Exit criteria:**
- Seluruh P0 selesai.
- CI lulus.
- Tidak ada error console pada alur kritis.
- Tidak ada temuan aksesibilitas serius yang belum ditangani.
- Ekspor/impor dan reset aman.

**Dependensi:** Fase 2 dan 3 roadmap produk.

**Ukuran:** M.

---

### Fase 5 roadmap produk — Laboratorium pelafalan dan perluasan permainan (P1)

**Tujuan:** memperdalam latihan produktif dan variasi belajar.

**Pekerjaan:**
1. Mode shadowing terarah: putar frasa, jeda otomatis, pengguna menirukan, transkrip opsional. *(Fase 3 rekayasa baru menyediakan alur manual: dengar, rekam, bandingkan.)*
2. Rekaman audio lokal (MediaRecorder) dengan pemutaran ulang; tanpa unggah ke server. *(Sudah ada di Fase 3 rekayasa.)*
3. Pengenalan suara opsional (Web Speech Recognition) dengan feature detection dan fallback. *(Belum.)*
4. [x] Word builder Jepang (susun kata dari kana/kanji). (Fase 6: Pembuat kata)
5. [ ] Kana puzzle (kelompokkan/urutkan karakter). (Fase 6 baru menyediakan Cocokkan kana, belum puzzle susun/kelompokkan)
6. [x] Timed challenge dengan level dan kategori. (Fase 6: Kejar kosakata + tiga kesulitan)
7. [x] Latihan adaptif berbasis akurasi terakhir. (Fase 5)

**Exit criteria:**
- Semua fitur memiliki fallback saat API browser tidak tersedia.
- Tidak ada rekaman yang dikirim ke pihak ketiga.
- Tes unit untuk logika permainan.

**Dependensi:** Fase 4 roadmap produk (alur stabil); tidak menghambat MVP.

**Ukuran:** L.

---

### Fase 6 roadmap produk — Ujian 2.0 dan tes per topik (P1)

**Tujuan:** membuat ujian lebih diagnostik, bukan hanya skor.

**Pekerjaan:**
1. Tes per topik: kana, kosakata, kanji, tata bahasa, membaca, menyimak.
2. Bank soal bertag dan pemilihan soal yang seimbang.
3. Analisis kelemahan setelah ujian dengan tautan ke materi terkait.
4. Rencana ulangan yang dihasilkan dari kesalahan ujian.
5. Kurangi fallback lintas level saat konten mencukupi.
6. Riwayat ujian dengan tren skor per bagian.

**Exit criteria:**
- Tes topik dapat diselesaikan dan dinilai.
- Analisis kelemahan mengarah ke materi yang ada.
- Ujian level dengan konten cukup tidak lagi memakai fallback berlebih.

**Status implementasi (Fase 8 rekayasa):** tes topik kosakata/tata bahasa, bank soal seimbang, area lemah + rekomendasi, dan ulang soal salah sudah ada. Riwayat masih menampilkan skor total per attempt, belum tren per bagian; fallback lintas level masih dipakai untuk N3–N1. Exit criterion ketiga belum sepenuhnya terpenuhi.

**Dependensi:** Fase 2 roadmap produk (tag + konten), Fase 4 roadmap produk.

**Ukuran:** M/L.

---

### Fase 7 roadmap produk — Akun dan sinkronisasi (P2)

**Tujuan:** mendukung lebih dari satu perangkat/pengguna tanpa mengorbankan mode lokal.

**Pekerjaan:**
1. Desain autentikasi ringan dan migrasi data profil tunggal.
2. Tambahkan user_id/tenant pada tabel progres.
3. Sinkronisasi snapshot dengan penanganan konflik.
4. Privasi, ekspor, dan penghapusan akun.
5. Rate limit dan validasi API untuk deployment publik.

**Exit criteria:**
- Data pengguna terisolasi.
- Migrasi tidak kehilangan progres lokal.
- Mode lokal tetap tersedia.

**Dependensi:** MVP stabil; keputusan produk tentang model akun.

**Ukuran:** L.

---

### Fase 8 roadmap produk — PWA, offline, dan polish produksi (P2)

**Tujuan:** meningkatkan ketahanan dan kenyamanan harian.

**Pekerjaan:**
1. Service worker untuk aset dan halaman inti.
2. Antrean mutasi offline dan sinkronisasi saat online.
3. Self-host subset font Jepang untuk privasi/offline.
4. Audio statis untuk dialog inti sebagai fallback TTS.
5. Pengingat belajar opsional.
6. Audit performa lanjutan dan pemantauan error lokal.

**Exit criteria:**
- Halaman inti dapat dibuka offline.
- Tidak ada kehilangan mutasi saat koneksi kembali.
- Bundle dan font memenuhi anggaran.

**Dependensi:** Fase 4 dan 7 roadmap produk (jika sinkronisasi).

**Ukuran:** L.

---

## 6. Backlog fitur terprioritas

| ID | Fitur | Prioritas | Fase | Status | Dependensi |
| --- | --- | --- | --- | --- | --- |
| F-01 | Ekspansi konten N4–N1 ke ambang MVP | P0 | 2 | Direncanakan | Validator konten |
| F-02 | Validator konten dan tag soal | P0 | 2 | Direncanakan | Skema konten |
| F-03 | CI: check + build | P0 | 2 | Selesai (Fase 13: workflow quality) | Tidak ada |
| F-04 | Bookmark kosakata (inti) | P0 | 3 | Selesai (Fase 10: kamus pribadi kosakata/kanji/tata bahasa) | Migrasi DB |
| F-05 | Target mingguan | P0 | 3 | Selesai (Fase 10: frekuensi hari aktif/minggu) | Settings/activity |
| F-06 | Jadwal ulangan beberapa hari | P0 | 3 | Direncanakan | Data cards |
| F-07 | Rekomendasi harian berbasis aturan | P0 | 3 | Selesai (Fase 10: alasan + bukti, maks. 4) | Due/riwayat/konten |
| F-08 | Isian rumpang | P0 | 3 | Selesai (Fase 5) | Domain PracticeExercise |
| F-09 | Terjemahan terstruktur | P0 | 3 | Selesai (Fase 5) | Domain PracticeExercise |
| F-10 | Matching kosakata/kanji–arti | P0 | 3 | Selesai sebagai tipe latihan (Fase 5); game khusus belum | Bank konten |
| F-11 | Vocabulary matching game | P0 | 3 | Selesai (Fase 6: Kejar kosakata) | F-10 |
| F-12 | Tes komponen alur kritis | P0 | 3 | Direncanakan | Testing Library |
| F-13 | E2E alur kritis | P0 | 4 | Sebagian (Playwright manual Fase 5–12; suite CI belum) | F-12 |
| F-14 | Audit dan perbaikan aksesibilitas | P0 | 4 | Sebagian (audit + perbaikan Fase 12; belum otomatis) | Alur stabil |
| F-15 | Anggaran/audit kinerja | P0 | 4 | Sebagian (diukur Fase 12; katalog masih bundle klien) | Build produksi |
| F-16 | Tes per topik | P1 | 6 | Selesai (Fase 8: mode Topik kosakata/tata bahasa) | F-02, konten |
| F-17 | Analisis kelemahan ujian | P1 | 6 | Selesai (Fase 8: area lemah + rekomendasi + ulang soal salah) | F-16 |
| F-18 | Shadowing dan rekaman lokal | P1 | 5 | Selesai (Fase 7: 17 drill + panduan bunyi, rekaman 30 detik, replay/hapus; tanpa skor akustik) | MediaRecorder |
| F-19 | Pengenalan suara opsional | P1 | 5 | Selesai (Fase 7: Web Speech API opsional, fallback, perbandingan teks) | Dukungan browser |
| F-20 | Word builder | P1 | 5 | Selesai (Fase 6: Pembuat kata) | Bank kana/kata |
| F-21 | Kana puzzle | P1 | 5 | Sebagian (Cocokkan kana Fase 6; puzzle susun/kelompokkan belum) | Bank kana |
| F-22 | Timed challenge lanjutan | P1 | 5 | Selesai (Fase 6: Kejar kosakata, Tantangan harian) | Game framework |
| F-23 | Latihan adaptif | P1 | 5 | Selesai (Fase 5) | Riwayat akurasi |
| F-24 | Perluas rekomendasi bacaan/kanji/budaya + jadwal ulangan | P1 | 6 | Sebagian (Fase 10: simpan kanji/tata bahasa; rekomendasi bacaan/budaya belum) | F-04 |
| F-25 | Pencapaian lebih bermakna | P1 | 6 | Sebagian (Fase 17–18: 25 definisi, termasuk writing dan cerita; belum ada pencapaian sosial/mingguan lanjutan) | Statistik |
| F-26 | Akun dan multi-profil | P2 | 7 | Direncanakan | MVP + auth |
| F-27 | Sinkronisasi antarperangkat | P2 | 7 | Direncanakan | F-26 |
| F-28 | PWA offline penuh | P2 | 8 | Direncanakan | F-26/F-27 |
| F-29 | Font/audio self-host | P2 | 8 | Selesai (Fase 12: font sistem, tanpa font remote; audio tetap TTS perangkat) | Anggaran aset |
| F-30 | Pengingat belajar | P2 | 8 | Direncanakan | Preferensi pengguna |
| F-31 | Ringkasan akurasi latihan per tipe | P1 | 6 | Sebagian (rincian per sesi Fase 5; agregat per tipe belum) | Riwayat review |
| F-32 | Latihan menulis/urutan goresan kanji | P1 | 17 | Selesai (Fase 17: 319 entri, 259 glyph KanjiVG, animasi, tirukan/mandiri, geometri) | KanjiVG terverifikasi (Fase 14) + pipeline impor |
| F-33 | Tautan budaya ke materi bahasa terkait | P1 | 6 | Selesai (Fase 9: kosakata budaya → kamus, kana/kanji/kamus per artikel) | Konten budaya |
| F-34 | Penemuan budaya: fakta harian/acak, favorit, kuis | P1 | 6 | Selesai (Fase 9) | Konten budaya |
| F-35 | Simulasi percakapan bertipe | P1 | 11 | Selesai (Fase 11: 6 skenario/19 langkah) | Konten percakapan |
| F-36 | Latihan mengetik Jepang | P1 | 11 | Selesai (Fase 11: 3 mode, pemeriksaan lokal) | Bank kana/kosakata |
| F-37 | Rencana belajar personal | P1 | 11 | Selesai (Fase 11: target JLPT + rentang minggu) | Kurikulum/progres |
| F-38 | Audit keamanan lokal + impor berkonfirmasi | P0 | 12 | Selesai (Fase 12: loopback, same-origin/JSON, body cap, header, pratinjau impor) | API stabil |
| F-39 | Audit UI/a11y/responsif | P0 | 12 | Selesai (Fase 12: lang=ja, kontras, fokus, overflow, target sentuh) | UI stabil |
| F-40 | Koreksi konten hasil audit | P0 | 12 | Selesai (Fase 12: 21+ koreksi soal/bacaan/percakapan) | Review konten |
| F-41 | Audit performa + font sistem | P1 | 12 | Selesai (Fase 12: font remote dihapus; katalog masih bundle) | Build produksi |
| F-42 | Backup/restore SQLite + retensi | P0 | 13 | Selesai (Fase 13: CLI, integrity check, restore berkonfirmasi) | Database stabil |
| F-43 | Delapan pelajaran N5 membaca/menyimak | P0 | 13 | Selesai (Fase 13: 8 LessonPlan, blok jp-prose/dialog) | Konten diaudit |
| F-44 | Validator QA semantik + CI quality gate + reflow 320 px | P0 | 13 | Selesai (Fase 13: content-qa, workflow, 4 rute) | Build stabil |
| F-45 | Audit & rencana Audio/Writing/Story Fase 15–19 | P1 | 14 | Selesai (Fase 14: empat dokumen, KanjiVG 259 karakter, backlog, ADR-050–054) | Dokumen & data |
| F-46 | Audio & Pronunciation Studio `ja-JP` | P1 | 16 | Selesai (Fase 16: pemutar global, diagnostik, 6 kategori, preferensi; tanpa MP3/skor akustik) | ADR-050/ADR-055–056 |
| F-47 | CMS audio/stroke/story | P2 | 15 | BLOCKED (tidak ada CMS/admin di repo; butuh keputusan lokasi/otorisasi) | Keputusan produk |
| F-48 | Japanese Handwriting & Stroke Order Studio | P1 | 17 | Selesai (Fase 17: `/writing`, 14 tabel, 19 API, 2 pencapaian, CC BY-SA) | F-32, KanjiVG |
| F-49 | Teater cerita animasi + kuis | P1 | 18 | Selesai (Fase 18: 3 cerita, 9 adegan, 36 dialog, 8 latar, mode Belajar/Tonton, `story_attempts`, 2 pencapaian) | F-46, model cerita |
| F-50 | Ekspor video cerita | P2 | 19 | Ditunda (MediaRecorder/Canvas/FFmpeg belum diuji; tidak boleh mengorbankan player) | F-49, keputusan produk |
| F-51 | Pipeline aset video/CMS cerita | P2 | 15/19 | BLOCKED (CMS tidak ada; `StoryScene.videoUrl` baru seam opsional) | F-47, keputusan produk |

---

## 7. Grafik dependensi

~~~text
Fase 2: Konten + tag + CI
   │
   ├──► Fase 3: Latihan + bookmark + target + rekomendasi
   │        │
   │        └──► Fase 4: E2E + a11y + rilis MVP
   │                 │
   │                 ├──► Fase 5: Pengucapan + permainan
   │                 ├──► Fase 6: Ujian 2.0 + tes topik
   │                 └──► Fase 7: Akun/sinkronisasi
   │                          │
   │                          └──► Fase 8: PWA/offline/polish
   │
   └──► Fase 6 membutuhkan bank soal bertag
~~~

Aturan:

- Fase 5 dan 6 roadmap produk boleh dikerjakan setelah Fase 4 roadmap produk; keduanya tidak saling menghambat.
- Fase 7 hanya dimulai setelah MVP stabil dan keputusan produk tentang akun disetujui.
- Fase 8 setelah akun/sinkronisasi bila ingin offline multi-perangkat; offline baca sederhana dapat dimulai lebih awal bila dibutuhkan.

---

## 8. Kriteria rilis

### MVP v0.2

- Semua P0 di Bagian 4 selesai.
- check, build, E2E alur kritis lulus.
- Tidak ada error console pada rute utama.
- Bookmark/target/ekspor-impor terverifikasi.
- Audit aksesibilitas tidak memiliki temuan serius yang belum ditangani.
- Dokumentasi dan catatan rilis diperbarui.

### v0.3 — P1

- Minimal satu dari Fase 5 atau 6 roadmap produk selesai penuh; tidak harus keduanya.
- Fitur baru memiliki tes dan fallback.
- Tidak ada regresi P0.

### v1.0 — P2

- Akun/sinkronisasi (bila dipilih) aman dan teruji.
- PWA/offline stabil atau secara eksplisit tidak menjadi target.
- Audit keamanan untuk deployment publik selesai.
- Semua konten memenuhi standar akurasi dan hak cipta.

---

## 9. Risiko roadmap

| Risiko | Kemungkinan | Dampak | Mitigasi |
| --- | --- | --- | --- |
| Ekspansi konten melebihi kapasitas | Tinggi | Tinggi | Batch per level, ambang minimum, validasi otomatis, review bertahap |
| Kualitas terjemahan/penjelasan menurun | Sedang | Tinggi | Checklist review, istilah baku, contoh sumber, tes konten |
| Perubahan skema merusak data | Sedang | Tinggi | Migrasi berversi, backup, tes roundtrip |
| Scope P1 masuk sebelum MVP | Tinggi | Sedang | Gate P0, backlog terpisah, review roadmap |
| Speech recognition tidak seragam | Tinggi | Rendah | Opsional, fallback rekaman lokal, jangan jadi blocker |
| CI tidak tersedia di lingkungan | Sedang | Sedang | Minimal jalankan check/build lokal; siapkan workflow generik |
| Waktu habis untuk tes E2E | Sedang | Sedang | Prioritaskan alur kritis, bukan semua halaman |

---

## 10. Langkah berikutnya yang direkomendasikan

**Fokus berikutnya: Fase 20 kedalaman konten N4 dan quality gate yang dapat diulang; Fase 19 sudah selesai; Fase 15 tetap BLOCKED menunggu keputusan CMS; Fase 18 teater cerita selesai.** Fase 19 tidak menambah fitur, hanya stabilisasi dan bukti regresi.

1. **Kedalaman N4 (P0 konten):** tulis `LessonPlan` N4 pertama untuk tata bahasa, membaca, dan menyimak; perluas bank soal N4 dengan kunci/pembahasan teraudit. N3–N1 tetap belum diklaim.
2. **E2E yang di-commit:** pindahkan skrip QA Fase 19 dari `.data/phase19-qa.cjs` ke suite Playwright dengan DB terisolasi dan jalankan di CI. Pertahankan 102 pemeriksaan rute, enam perjalanan, `npm run check`, dan build sebagai ambang rilis.
3. **Aksesibilitas dan perangkat:** audit screen reader/keyboard penuh untuk audio, menulis, dan cerita; uji iOS Safari/Android Chrome fisik untuk kanvas sentuh dan voice. UX-11/UX-14 hanya ditutup dengan bukti perangkat.
4. **Performa terukur:** selidiki prefetch/RSC dan bundle katalog (transfer ~500 KB JS mencakup prefetch, bukan seluruh dataset); pertimbangkan loading skeleton rute; ukur cold/warm load sebelum menyebut optimasi berhasil.
5. **Fase 15/CMS:** minta lokasi CMS yang dimaksud atau otorisasi eksplisit untuk membangun fondasi lokal; jangan mengarang CMS atau mengubah konten menjadi tabel tanpa keputusan. Pipeline `StoryScene.videoUrl` tetap seam sampai ada aset/CMS.
6. **Deployment:** auth + TLS + rate limit sebelum publik; Host allowlist lokal bukan pengganti auth. Backup/restore dan smoke tetap dipertahankan.
7. **Video:** ekspor video cerita hanya ditinjau setelah player dan pipeline aset stabil; perlu ADR terpisah dan uji MediaRecorder/Canvas/FFmpeg, tanpa layanan video AI berbayar.

Alasan: Fase 16–18 membuktikan audio jujur, pipeline KanjiVG, dan renderer cerita generik; Fase 19 memverifikasi integrasi ketiganya pada 102 pemeriksaan rute dan enam perjalanan, serta menemukan/menutup celah pelajaran→menulis. Risiko berikutnya bukan penambahan modul, melainkan kedalaman konten N4, QA yang dapat diulang di CI, aksesibilitas/perangkat, dan performa yang diukur. Menambah fitur baru sebelum itu hanya memperbesar permukaan regresi.

---

## 11. Dokumen terkait

- [PROJECT_SPEC.md](PROJECT_SPEC.md) — visi, kebutuhan, arsitektur, definisi MVP.
- [ARCHITECTURE.md](ARCHITECTURE.md) — arsitektur runtime dan batas modul.
- [DATA_MODEL.md](DATA_MODEL.md) — model data dan rumus progres.
- [PROJECT_STATUS.md](PROJECT_STATUS.md) — status implementasi dan verifikasi.
- [DECISIONS.md](DECISIONS.md) — catatan keputusan teknis.
- [CONCERNS_BACKLOG.md](CONCERNS_BACKLOG.md) — register concern lintas fase, status, dan keputusan.
- [ENHANCED_LEARNING_FEATURES_SPEC.md](ENHANCED_LEARNING_FEATURES_SPEC.md) — spesifikasi fitur audio, menulis, dan cerita.
- [ENHANCED_FEATURES_ARCHITECTURE.md](ENHANCED_FEATURES_ARCHITECTURE.md) — rancangan integrasi dan lisensi.
- [ENHANCED_FEATURES_ROADMAP.md](ENHANCED_FEATURES_ROADMAP.md) — rencana fitur lanjutan dan status eksekusi.
- [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md) — status implementasi audio, menulis, story, CMS, dan bukti.
- [MOBILE_COMPATIBILITY_REPORT.md](MOBILE_COMPATIBILITY_REPORT.md) — audit mobile learner Fase 14B dan batas emulasi.
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) — atribusi dan lisensi KanjiVG (CC BY-SA 3.0).
- [README.md](README.md) — ringkasan produk dan cara menjalankan.
