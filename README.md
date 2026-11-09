# Kotoba 言葉

Platform belajar bahasa Jepang interaktif untuk penutur bahasa Indonesia. Antarmuka dan penjelasan memakai bahasa Indonesia, sedangkan bahasa Jepang menjadi bahasa target. Konten disusun bertahap mengikuti perkiraan level JLPT N5–N1.

Kotoba bukan sekadar prototipe tampilan: latihan kana, kartu SRS, kuis sembilan tipe, enam permainan edukatif, empat mode ujian, rekaman pelafalan lokal, latihan menyimak, dan progres belajar benar-benar berfungsi dan disimpan di server lokal. Sejak Fase 5, kuis kana, kanji, latihan, kosakata, pelajaran, tata bahasa, membaca, dan menyimak berbagi satu mesin latihan adaptif dengan riwayat per soal; sejak Fase 6, permainan memiliki domain murni, riwayat attempt, dan pencapaian sendiri. Fase 7 menambahkan pemutar audio dengan penanganan kegagalan, panduan bunyi, perekam 30 detik, pengenalan suara opsional berbasis perbandingan teks, dan 15 drill menyimak bertingkat. Fase 8 menambahkan mesin ujian reusable empat mode, analitik hasil, ulang soal salah, dan tambah kartu dari pembahasan. Fase 9 memperluas budaya menjadi fitur penemuan: 33 artikel dalam enam grup, 132 fakta, fakta harian/acak, favorit tersimpan, kuis artikel, kosakata tertaut, dan rujukan organisasi. Fase 10 menambahkan lapisan personalisasi: ringkasan belajar, target durasi/kosakata/pelajaran/frekuensi, streak dan kalender lokal, rekomendasi dengan alasan dan bukti, 21 pencapaian, kamus pribadi dengan catatan/koleksi/ulasan mandiri, serta tren dan timeline belajar. Fase 11 mengevaluasi sembilan kandidat fitur lanjutan dan memilih tiga yang paling berdampak: simulasi percakapan bertipe, latihan mengetik Jepang, dan rencana belajar personal; kamus/kanji diperkuat dengan materi terkait, sementara latihan menulis/urutan goresan, offline/PWA, halaman sumber belajar, dan perluasan bacaan ditunda dengan alasan yang tercatat. Fase 12 adalah audit kualitas menyeluruh: 29 rute dan 18 API diuji, konten Jepang direview ulang, dan lapisan keamanan lokal (loopback-only, same-origin/JSON, batas body, validasi impor), aksesibilitas, serta font mandiri diperbaiki. Fase 13 melakukan retrospektif lintas fase: delapan materi N5 membaca/menyimak kini punya pelajaran interaktif enam langkah, validator QA semantik menolak soal dengan opsi duplikat atau kunci di luar rentang, CLI backup/restore SQLite teruji, CI menjalankan audit dependensi + check + build, dan reflow 320 px diperbaiki. Fase 14 adalah audit dan perencanaan tiga fitur lanjutan — Audio & Pronunciation Studio, Handwriting & Stroke Order Studio, dan Story & Conversation Animation Player — tanpa implementasi: memetakan arsitektur yang ada, memverifikasi cakupan/lisensi KanjiVG untuk 259 karakter, mengevaluasi Web Speech/Open JTalk/KanjiVG/animasi browser, dan menyusun proposal Fase 15–19 beserta concern baru. Tidak ada fitur baru yang diklaim telah selesai. Fase 14B mengaudit kompatibilitas mobile 29 rute learner pada sembilan viewport (261 pemuatan), memperbaiki overflow `/progress` serta pemotongan label/statistik, dan mendokumentasikan batas emulasi; CMS/admin, kanvas menulis, dan story theater tidak tersedia sehingga tidak diaudit. Hasil lengkap ada di [MOBILE_COMPATIBILITY_REPORT.md](MOBILE_COMPATIBILITY_REPORT.md). Fase 16 membangun Studio audio: satu pemutar global untuk kana, kosakata, kanji, tata bahasa, bacaan, dan percakapan; hanya voice `ja-JP`; antrean, jeda/lanjut/berhenti/ulangi, kecepatan 0,5–1,5×, dan diagnostik jujur saat voice Jepang tidak tersedia. Tidak ada MP3, unggahan suara, atau skor akustik. Fase 17 membangun Studio menulis: 319 entri kana/kanji dengan 259 glyph KanjiVG terimpor (CC BY-SA 3.0), animasi urutan goresan, mode tirukan dan mandiri dengan Pointer Events, evaluasi geometri yang jujur, riwayat attempt, mastery, dan dua pencapaian baru; ini bukan pengenalan tulisan tangan. Fase 18 membangun Teater cerita: tiga cerita orisinal (2 N5, 1 N4) dengan 9 adegan dan 36 baris dialog, panggung SVG/CSS generik, karakter/ekspresi/gelembung dialog, mode belajar dan tonton, audio `ja-JP` per baris, kontrol subtitle/furigana/romaji/terjemahan, kamus kosakata, kuis pemahaman/menyimak, progres `story_attempts`, dan dua pencapaian baru. Tidak ada CMS, ekspor video, atau AI video. Fase 19 menstabilkan integrasi ketiga modul: pelajaran kana/kanji sekarang menaut ke Studio Menulis, salinan urutan goresan yang usang dikoreksi, dan regresi 34 pola rute × tiga viewport (102 pemeriksaan) serta enam perjalanan kritis lulus tanpa error. Fase 19 tidak menambah fitur, tabel, endpoint, CMS, atau video.

## Fitur utama

Aplikasi memiliki **16 tujuan navigasi utama**: Dasbor, Belajar, Rencana, Latihan, Permainan, Audio, Menulis, Mengetik, Percakapan, Cerita, Pelafalan, Ujian, Budaya, Kamus, Statistik, dan Pengaturan. Halaman materi (kana, kosakata, kanji, tata bahasa, membaca, menyimak) diakses langsung atau melalui hub Belajar.

- **Dasbor** — sapaan personal, target XP/durasi/kosakata/pelajaran/frekuensi, ringkasan belajar enam metrik, streak, rekomendasi harian dengan alasan dan bukti, ujian terbaru, daftar lanjutkan belajar, ringkasan ulangan kosakata, pencapaian, jalur JLPT, rencana hari ini, dan heatmap.
- **Belajar** — hub kurikulum terpandu: 39 modul, 154 pelajaran, 644 referensi konten; Jalur N5 dengan **70 pelajaran interaktif** enam langkah (pengantar, penjelasan, contoh, catatan, latihan, selesai), filter level N5–N1, progres per modul, dan rekomendasi berikutnya.
- **Rencana** — pilih target JLPT dan rentang minggu; Kotoba menyusun jadwal deterministik dari kurikulum, progres, durasi sesi, dan frekuensi mingguan. Menampilkan pelajaran terjadwal/tertunda, feasibility, tonggak, dan peringatan bila target terlalu ketat. Bukan prediksi kelulusan JLPT.
- **Kana** — bagan hiragana & katakana lengkap (dasar, dakuten, handakuten, yōon), detail karakter, mnemonik Indonesia, contoh kata, latihan baca/tulis, dan pelacakan mastery.
- **Kosakata** — kamus dengan pencarian, filter level & topik, detail contoh kalimat, ulasan kartu SRS, dan kuis adaptif 10 soal.
- **Kanji** — daftar kanji dengan arti, on/kun, radikal, jumlah goresan, contoh kata, mnemonik, kuis, dan ulasan SRS.
- **Tata bahasa** — 45 pola N5–N1 dengan penjelasan Indonesia, formasi, contoh, kesalahan umum, pola terkait, dan latihan berbagi mesin latihan.
- **Membaca** — 12 teks bertingkat dengan furigana opsional, terjemahan, kosakata, dan pertanyaan pemahaman.
- **Menyimak** — 12 dialog dengan pemutar suara, mode lambat, transkrip opsional, frasa kunci, dan pertanyaan; ditambah **15 drill kilat** (3 per level N5–N1) di `/listening/practice` untuk pengenalan kosakata, detail, maksud tersirat, dan nuansa.
- **Latihan** — mesin latihan adaptif dengan sembilan tipe soal: pilihan ganda, isi rumpang, terjemahan, mencocokkan, baca kana, menyimak, susun kalimat, benar/salah, dan mengetik. Soal yang sering salah dan kartu jatuh tempo diprioritaskan.
- **Permainan** — enam permainan dengan tiga tingkat kesulitan: Pembuat kata (susun ubin kana, divalidasi kamus), Cocokkan kana (hiragana/katakana dengan romaji, arti, atau audio), Kejar kosakata (pilihan arti berbatas waktu), Susun kalimat (validasi partikel dan urutan), Tantangan kanji (arti, bacaan, pemakaian), dan Tantangan harian (campuran kosakata, kanji, kana, tata bahasa; deterministik per tanggal). Setiap sesi punya skor, timer bila relevan, petunjuk, penjelasan jawaban, riwayat, dan pencapaian.
- **Studio audio** — satu pemutar untuk kana, kosakata, kanji, contoh tata bahasa, bacaan, dan dialog; voice hanya `ja-JP` dengan deteksi `voiceschanged`, antrean, putar/jeda/lanjut/berhenti/ulangi, kecepatan 0,5–1,5×, dan pilihan voice. Bila perangkat tidak punya voice Jepang, status menjelaskan batasnya dan pemutaran tidak memakai voice bahasa lain. Tidak ada MP3 atau klaim penilaian akustik.
- **Menulis** — studio urutan goresan untuk hiragana, katakana, dan kanji. Katalog 319 karakter (208 kana + 111 kanji) memakai 259 glyph KanjiVG; lima tahap A–E, animasi main/jeda/ulang/ganti goresan/kecepatan, mode Tirukan dengan penilaian per goresan, dan mode Mandiri dengan kanvas kosong, undo, reset, referensi, serta evaluasi. Skor adalah perkiraan geometri, bukan pengenalan tulisan tangan; riwayat attempt, statistik mastery, dan catatan bentuk tersimpan.
- **Mengetik** — tiga mode latihan produksi: Kana → Romaji (tanpa IME), Romaji → Kana, dan Arti → Kanji (IME Jepang). Sesi 5/10/15 soal, pemeriksaan lokal, timer, tinjauan jawaban, akurasi, dan rekap. Tidak ada ketikan yang dikirim ke server.
- **Percakapan** — enam skenario orisinal N5–N4 (perkenalan, restoran, belanja, arah, pertemuan santai, transportasi) dengan 19 langkah, tiga pilihan per langkah, umpan balik konteks/register, transkrip, frasa kunci, dan catatan budaya. Skor memakai kesalahan percobaan pertama; bukan percakapan AI.
- **Cerita** — teater cerita dengan panggung SVG/CSS generik: tiga cerita orisinal, sembilan adegan, 36 baris dialog, karakter/ekspresi/gelembung, delapan latar, mode Belajar dan Tonton, audio `ja-JP` per baris, subtitle/furigana/romaji/terjemahan, kamus kosakata, dan kuis pemahaman/menyimak. Tidak ada sinkronisasi kata, video, atau AI; voice karakter hanya berbeda bila perangkat menyediakan minimal dua voice Jepang.
- **Pelafalan** — 17 kalimat N5–N1 dengan audio normal/lambat, panduan enam topik (vokal, konsonan, vokal panjang, sokuon, mora, kesadaran pitch), rekaman mikrofon lokal maksimum 30 detik dengan putar ulang/hapus, dan pengenalan suara opsional. Rekaman tidak diunggah; pengenalan suara hanya membandingkan transkrip, bukan menilai akustik.
- **Ujian** — empat mode untuk N5–N1: **Latihan** (tanpa timer, pembahasan langsung), **Simulasi** (timer, tiga bagian, navigasi, tandai soal, kumpulkan di akhir), **Topik** (satu topik kosakata atau satu pola tata bahasa), dan **Acak** (20 soal seimbang lintas kategori). Hasil memuat skor belajar, benar/salah/kosong, akurasi, durasi, performa bagian/kategori, area lemah, rekomendasi, review semua soal, ulang soal salah, dan tambah kosakata/kanji ke kartu.
- **Budaya** — 33 artikel orisinal dalam enam grup penemuan (budaya & tradisi, makanan, geografi, sejarah, anime & hiburan, fakta bahasa), 132 fakta, Fakta Hari Ini, fakta acak, pencarian, filter grup/favorit, favorit tersimpan, kuis dua soal per artikel, kosakata yang menaut ke kamus, dan 2–3 rujukan organisasi per artikel. Semua ungkapan diberi label register dan artikel anime memperingatkan bahasa fiksi.
- **Kamus** — pencarian terpadu 370 entri kosakata, kanji, dan tata bahasa; filter jenis/level, detail, audio, kosakata terkait satu topik/jenis kata, kanji beradikal sama, serta **kamus pribadi**: simpan materi, catatan sampai 1.000 karakter, koleksi buatan sendiri, dan ulasan tersimpan. Ulasan ini mandiri dan tidak mengubah jadwal SRS.
- **Statistik** — rekap belajar, target harian/mingguan, kalender 17 minggu, tren XP 30 hari, timeline belajar, mastery kosakata/kanji/kana, grafik XP, 25 pencapaian, riwayat ujian, riwayat latihan, riwayat permainan, writing attempt, riwayat cerita, dan ulasan terakhir.
- **Pengaturan** — nama, tema terang/gelap/sistem, romaji, furigana, kecepatan suara, voice Jepang, target XP/durasi/kosakata/pelajaran per hari, frekuensi mingguan, target JLPT/rentang minggu untuk Rencana, ekspor/impor JSON, dan reset progres.

## Teknologi

| Bagian | Pilihan |
| --- | --- |
| Framework | Next.js 16.4.5 (App Router, Turbopack) |
| UI | React 19.3, TypeScript 5, Tailwind CSS 4 |
| Persistensi | SQLite melalui `node:sqlite` (built-in Node.js) |
| API | Route Handlers Next.js (`/api/progress/*`) |
| Audio | Web Speech API (`speechSynthesis`, locale `ja-JP`) melalui registry provider |
| Pengenalan suara | Web Speech Recognition opsional; normalisasi + perbandingan teks |
| Ujian | Engine murni `exam-engine.ts`; sesi/hasil di `sessionStorage`; ringkasan di tabel `exams` |
| Latihan produksi | Mesin percakapan dan pengetikan lokal; rencana belajar deterministik; tanpa layanan AI/berbayar |
| Menulis | KanjiVG commit tetap (CC BY-SA 3.0) → JSON per glyph; animasi SVG; kanvas Pointer Events; evaluasi geometri lokal |
| Cerita | Konten TypeScript bertipe; panggung SVG/CSS generik; audio Web Speech per baris; hasil di `story_attempts` |
| Tes | Vitest |

Tidak ada layanan berbayar, akun pihak ketiga, font jarak jauh, atau database eksternal. Data belajar disimpan pada file SQLite lokal (15 tabel) dan dicache di browser untuk tampilan awal/offline ringan. Favorit budaya memakai `culture_favorites`; kamus pribadi memakai `saved_items`/`saved_collections`, terpisah dari SRS. Server produksi mengikat `127.0.0.1` secara default dan menolak `Host` non-loopback.

## Menjalankan

Prasyarat: **Node.js >= 22.5** (karena memakai `node:sqlite`).

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

Produksi:

```bash
npm run build
npm run start
```

`npm run start` mengikat `127.0.0.1` (bukan semua antarmuka). Buka http://127.0.0.1:3000. Tidak ada environment variable wajib. Lokasi database default: `.data/kotoba.db` (dibuat otomatis, direktori `0700`, file `0600`). Ubah bila perlu:

```bash
KOTOBA_DB_PATH=/path/ke/kotoba.db npm run start
```

**Deployment.** Build ini dirancang untuk satu perangkat lokal dan **belum memiliki autentikasi**. Jangan mengekspos port ke jaringan publik/LAN. Jika suatu saat dipublikasikan, tambahkan reverse proxy dengan TLS dan autentikasi, ubah allowlist `Host` di `src/proxy.ts`, dan selesaikan ADR auth di `ARCHITECTURE.md` §12; jangan hanya menghapus guard loopback. Aplikasi tidak mengirim progres ke layanan luar dan tidak memerlukan kredensial.

Perintah lain:

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run test       # Vitest
npm run check      # typecheck + lint + test
npm run db         # ringkasan tabel & jumlah baris database
npm run db:backup  # backup SQLite bertimestamp + integrity check
npm run audit:prod # npm audit untuk dependensi produksi
```

**Backup dan restore.** Backup membuat salinan konsisten dengan `VACUUM INTO` di `.data/backups/` (direktori `0700`, file `0600`), memeriksa `PRAGMA integrity_check`, dan menyimpan tujuh salinan terbaru. Untuk memulihkan, hentikan server lalu jalankan `node scripts/backup-db.mjs --restore .data/backups/<file>.db --yes`. Perintah restore menyimpan salinan `pre-restore` sebelum menimpa dan memverifikasi hasil. Backup berada di mesin yang sama dan tidak terenkripsi, jadi simpan salinan off-site bila data penting.

Tes saat ini mencakup **39 berkas / 236 tes** untuk konten, SRS, XP, target/streak/kalender/tren, rekomendasi, 25 pencapaian, katalog latihan, katalog kurikulum, mesin ujian empat mode, enam domain permainan, normalisasi/perbandingan pengenalan suara, drill menyimak, fakta budaya, favorit, kamus pribadi/koleksi, skenario percakapan, mesin mengetik, rencana belajar, pemutar audio/antrean/fallback, katalog menulis, geometri menulis, tautan pelajaran→menulis, cerita/teater, addCard, API, dan persistensi SQLite termasuk roundtrip writing/cerita, backup/restore SQLite, serta validator QA semantik.

## Struktur proyek

```
src/
  app/                 # halaman App Router + route handler API
    api/progress/      # snapshot, session, review, kana, lesson, exam, quiz, game, card, favorite, saved, collections, settings, export/import/reset
    exams/             # hub, sesi ujian, hasil/review
    learn/[lessonId]/  # pemain pelajaran interaktif
    plan/              # rencana belajar personal dari target + progres
    typing/            # latihan mengetik tiga mode
    conversation/      # hub dan pemain skenario percakapan
    writing/           # hub dan studio menulis per karakter
    stories/           # hub teater cerita dan pemain per cerita
  components/          # app shell, UI kit, exercise runner/card, flashcards, games (kit + 6 permainan), writing studio, story theater/stage, lesson player, provider
  content/             # konten edukatif bertipe, LessonPlan N5, katalog kurikulum turunan, catatan bentuk menulis, cerita teater
  lib/                 # tipe domain, mesin latihan/ujian & katalog adaptif, domain games, SRS, XP, furigana, speech, writing, quiz, learning, API client
  server/              # koneksi SQLite, progress service, helper HTTP
public/writing/kanjivg/ # JSON goresan turunan KanjiVG + lisensi
scripts/               # utilitas database, impor KanjiVG, verifikasi lokal
```

## Jumlah konten (v0.1.0)

| Jenis | Jumlah |
| --- | ---: |
| Kana | 208 (104 hiragana + 104 katakana) |
| Kosakata | 214 |
| Kanji | 111 |
| Pola tata bahasa | 45 |
| Bacaan | 12 |
| Dialog menyimak | 12 |
| Drill menyimak | 15 (3 per level) |
| Panduan pelafalan | 6 topik |
| Artikel budaya | 33 (6 grup, 132 fakta, 66 soal kuis) |
| Latihan susun kalimat | 28 |
| Latihan pelafalan | 17 |
| Skenario percakapan | 6 (19 langkah, 18 frasa kunci) |
| Cerita teater | 3 (9 adegan, 36 baris dialog, 9 soal, 8 latar) |
| Mode mengetik | 3 |
| Entri studio menulis | 319 (208 kana + 111 kanji) |
| Glyph goresan KanjiVG | 259 unik (JSON lokal, ±1,6 MB) |
| Pelajaran interaktif | 70 (62 lama + 8 membaca/menyimak N5) |
| Entri kamus terpadu | 370 (214 kosakata + 111 kanji + 45 tata bahasa) |
| Soal ujian simulasi | 29 (N5) – 41 (N1), dibangun dari bank soal |

Sebaran level masih condong ke N5–N4. Level lanjut (khususnya N1) memiliki konten lebih sedikit; lihat `PROJECT_STATUS.md` untuk batasan yang diketahui. Budaya juga belum memiliki ilustrasi atau audio khusus; semua artikel berupa teks orisinal dengan rujukan organisasi.

Katalog **39 modul / 154 pelajaran / 644 referensi konten** diturunkan dari materi di atas (`src/content/curriculum.ts`) dan dipakai oleh dashboard serta halaman **Belajar**. Dari jumlah itu, **70 pelajaran N5** memiliki rencana interaktif di `src/content/lessons/` dan dibuka lewat `/learn/[lessonId]`; latihan harus lulus 60% sebelum pelajaran ditandai selesai. Pemetaan ke progres aktivitas ada di `src/lib/learning.ts`.

## Fitur lanjutan (Fase 14–19)

Fase 14 menghasilkan proposal. Fase 16 mengimplementasikan Audio & Pronunciation Studio, Fase 17 mengimplementasikan Handwriting & Stroke Order Studio, Fase 18 mengimplementasikan Japanese Story Theater, dan Fase 19 menstabilkan integrasi ketiganya. Rencana Fase 15–19:

| Fase | Fokus | Status |
| --- | --- | --- |
| 15 | CMS untuk audio/stroke/story: **BLOCKED** karena tidak ada CMS di repo; perlu lokasi atau otorisasi membangun fondasi | Tertunda |
| 16 | Audio & Pronunciation Studio: Web Speech `ja-JP`, satu pemutar, antrean, diagnostik, persistensi preferensi | **Selesai** |
| 17 | Handwriting & Stroke Order Studio: 319 entri, 259 glyph KanjiVG, animasi SVG, kanvas tirukan/mandiri, evaluasi geometri, progres | **Selesai** |
| 18 | Story & Conversation Animation Player: tiga cerita orisinal, 9 adegan, panggung SVG/CSS, mode belajar/tonton, audio baris, kuis, hasil `story_attempts` | **Selesai** |
| 19 | Integrasi, QA, performa, aksesibilitas, dokumentasi | **Selesai** — 102 pemeriksaan rute, 6 perjalanan kritis, integrasi pelajaran→menulis, audit performa/a11y; CMS tetap blocked |

Rincian kebutuhan, arsitektur, dependensi, gate, dan batasan ada di [ENHANCED_LEARNING_FEATURES_SPEC.md](ENHANCED_LEARNING_FEATURES_SPEC.md), [ENHANCED_FEATURES_ARCHITECTURE.md](ENHANCED_FEATURES_ARCHITECTURE.md), [ENHANCED_FEATURES_ROADMAP.md](ENHANCED_FEATURES_ROADMAP.md), dan [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md). Tidak ada API berbayar; data stroke memakai KanjiVG CC BY-SA 3.0; writing tidak mengklaim pengenalan tulisan tangan; cerita tidak mengklaim sinkronisasi kata, voice karakter native, ekspor video, atau AI video.

## Catatan penting

- **Konten orisinal.** Materi disusun untuk proyek ini; bukan salinan buku teks, bank soal komersial, atau naskah anime. Penyelarasan JLPT bersifat perkiraan edukatif, bukan sertifikasi resmi.
- **Register bahasa.** Ungkapan anime diberi label dan peringatan agar tidak dipakai sebagai bahasa sopan sehari-hari.
- **Audio.** Kualitas dan ketersediaan suara Jepang bergantung pada voice Web Speech API di perangkat. Jika tidak tersedia, UI menampilkan fallback dan transkrip.
- **Pengenalan suara.** Tidak semua browser mendukungnya; browser/penyedia dapat mengirim audio ke layanan vendor. Kotoba tidak mengunggah atau menyimpan rekaman/transkrip, dan hasil cocok/hampir cocok/belum cocok adalah perbandingan teks, bukan skor pelafalan akustik.
- **Font.** Tidak ada font jarak jauh. Halaman memakai font sistem (termasuk Hiragino/Yu Gothic/Noto Sans JP/Meiryo/Droid Sans Fallback untuk Jepang), sehingga tampilan tetap berfungsi offline dan tidak ada permintaan ke Google Fonts.
- **Satu profil lokal.** Belum ada autentikasi/multi-pengguna. Aplikasi dirancang untuk belajar mandiri di satu perangkat. API menolak `Host` non-loopback, mewajibkan `application/json` + origin same-origin untuk tulisan, membatasi body 5 MiB, dan meminta konfirmasi sebelum impor menimpa data. Ini bukan pengganti autentikasi untuk deployment publik.
- **Ujian.** Target 70% adalah target belajar Kotoba, bukan ambang kelulusan JLPT resmi. Hasil diberi label skor belajar/estimasi performa. Kertas dan hasil aktif disimpan di `sessionStorage` (hilang saat tab ditutup); ringkasan attempt tetap tersimpan di SQLite. Mode dan judul tidak dipersistensikan, dan penilaian berjalan di klien.
- **Cakupan level.** Bank soal N3–N1 masih tipis, sehingga pemilihan soal memprioritaskan level terpilih lalu memakai fallback lintas level; hub menampilkan peringatan bila kertas bercampur level.
- **Mengetik.** Mode Romaji → Kana dan Arti → Kanji memerlukan IME Jepang di perangkat. Jawaban diperiksa lokal; ini latihan, bukan uji anti-kecurangan.
- **Rencana belajar.** Jadwal dihitung dari data lokal dan preferensi; durasi bersifat perkiraan dan bukan prediksi kelulusan JLPT. Tanggal memakai zona waktu perangkat.
- **Menulis kanji.** Data goresan berasal dari KanjiVG commit tetap dan dilisensikan CC BY-SA 3.0; atribusi serta share-alike wajib dipertahankan (lihat [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)). Skor adalah perkiraan geometri, bukan pengenalan tulisan tangan, penilaian estetika, atau sertifikasi; varian urutan di luar KanjiVG tidak dinilai benar. Kanvas belum diuji di perangkat fisik/stylus, snapshot dibatasi 400 attempt, dan catatan bentuk khusus baru mencakup sekitar 45 karakter.
- **Cerita.** Tersedia tiga cerita orisinal (2 N5, 1 N4); belum ada cerita N3–N1 atau CMS. Audio memakai Web Speech `ja-JP` per kalimat, bukan sinkronisasi kata; voice berbeda per karakter hanya bila perangkat punya minimal dua voice Jepang. Tidak ada checkpoint/resume, ekspor video, atau AI video; `videoUrl` adalah seam opsional yang belum diuji. Snapshot dibatasi 300 attempt cerita dan kamus hanya membuka kosakata terkurasi, bukan setiap kata.

## Dokumentasi

- [PROJECT_SPEC.md](PROJECT_SPEC.md) — spesifikasi produk, persona, batas MVP, kebutuhan, dan arsitektur yang diusulkan.
- [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md) — prioritas fitur, fase pengembangan, dependensi, dan kriteria rilis.
- [ARCHITECTURE.md](ARCHITECTURE.md) — lapisan, batas modul, alur runtime, persistensi, dan rencana auth/sync.
- [DATA_MODEL.md](DATA_MODEL.md) — entitas, relasi, skema SQLite, rumus progres, validasi, dan migrasi.
- [PROJECT_STATUS.md](PROJECT_STATUS.md) — status implementasi, hasil verifikasi, batasan, dan rencana berikutnya.
- [DECISIONS.md](DECISIONS.md) — keputusan arsitektur dan alasannya (ADR-001–ADR-063).
- [CHANGELOG.md](CHANGELOG.md) — ringkasan perubahan per fase.
- [CONCERNS_BACKLOG.md](CONCERNS_BACKLOG.md) — register 116 concern lintas fase: status, prioritas, kompleksitas, risiko, dan keputusan.
- [ENHANCED_LEARNING_FEATURES_SPEC.md](ENHANCED_LEARNING_FEATURES_SPEC.md) — audit dan kebutuhan Audio & Pronunciation Studio, Handwriting & Stroke Order Studio, dan Story & Conversation Animation Player.
- [ENHANCED_FEATURES_ARCHITECTURE.md](ENHANCED_FEATURES_ARCHITECTURE.md) — desain integrasi resolver audio, pipeline stroke KanjiVG, model cerita, performa, aksesibilitas, dan risiko.
- [ENHANCED_FEATURES_ROADMAP.md](ENHANCED_FEATURES_ROADMAP.md) — proposal Fase 15–19, dependensi, gate, estimasi, dan rollback.
- [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md) — status perencanaan, matriks kesiapan, fakta audit, integrasi Fase 19, dan langkah berikutnya.
- [MOBILE_COMPATIBILITY_REPORT.md](MOBILE_COMPATIBILITY_REPORT.md) — audit kompatibilitas mobile learner Fase 14B, termasuk batas emulasi dan permukaan yang tidak tersedia.
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) — atribusi dan lisensi data goresan KanjiVG (CC BY-SA 3.0).
