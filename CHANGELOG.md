# Changelog

Semua perubahan penting Kotoba dicatat di sini. Proyek belum memakai nomor rilis
publik; versi mengikuti fase pengembangan.

## Fase 19 — Integration, QA, Performance & Accessibility

- Fase stabilisasi, bukan ekspansi fitur: tidak ada modul, tabel, endpoint,
  dependensi, CMS, atau pipeline video baru.
- Menambahkan helper murni `writingHrefForContentRef` dan tombol **Latihan
  menulis** di pelajaran yang memiliki referensi kana/kanji. Katalog menulis yang
  berat tidak ikut masuk ke bundle pelajaran.
- Mengoreksi salinan urutan goresan di pelajaran kanji yang menyiratkan animasi
  tersedia langsung di pelajaran; sekarang mengarah ke Studio Menulis dengan
  peringatan verifikasi kamus tepercaya.
- Menambahkan tes tautan kana/kanji ke detail menulis yang valid dan memastikan
  referensi kosakata tidak menghasilkan tautan; total **39 berkas/236 tes**.
- QA integrasi pada build produksi + DB terisolasi: 34 pola rute × desktop
  1440/mobile 390/mobile 320 = **102/102** (HTTP 200, satu `h1`, `lang=id`,
  0 overflow/error), enam perjalanan kritis lulus (kana tanpa voice, tata bahasa,
  menulis hiragana simpan, animasi kanji, teater cerita, CMS blocked), dan
  0 kontrol tanpa nama di lima rute sampel.
- Performa tercatat 572–610 KB transfer per halaman fitur, termasuk prefetch/RSC
  Next.js; 0 glyph KanjiVG di hub dan 1 glyph di detail. Angka ini bukan muatan
  awal murni dan tidak diklaim sebagai optimasi selesai.
- Satu observasi `h1` ganda di `/dictionary/collections` tidak dapat
  direproduksi pada muat baru/pengulangan rute dan tidak diklaim sebagai bug.
- Build: **101 halaman statis + 6 route detail dinamis + 20 API**; typecheck dan
  ESLint bersih.
- Fase 15 (CMS) tetap **blocked**; `/admin` dan `/api/admin` 404, tanpa tautan
  CMS. Ekspor video dan pipeline aset video tetap ditunda.

## Fase 18 — Japanese Story Theater & Animated Conversation

- Menambahkan `/stories` dan `/stories/[id]`: 3 cerita orisinal (2 N5 + 1 N4),
  9 adegan, 36 baris dialog ber-furigana, dan 9 soal pemahaman/menyimak.
- Menambahkan `StoryStage` generik dengan 8 latar SVG/CSS orisinal, posisi dan
  ekspresi karakter, bubble dialog, efek hujan/salju, serta reduced motion.
- Mode Belajar (manual) dan Tonton (audio per baris lalu maju otomatis), kontrol
  putar/jeda/henti/sebelumnya/berikutnya/ulangi/mulai ulang/kecepatan/voice,
  navigasi adegan/dialog, dan progres.
- Subtitle Jepang, furigana, romaji, terjemahan Indonesia, mode Jepang saja,
  anotasi kosakata dan tata bahasa; kosakata dapat disimpan ke kamus pribadi.
- Audio memakai pemutar global Fase 16 dan hanya voice `ja-JP`; highlight per
  baris, tanpa klaim sinkronisasi per kata. Voice karakter hanya dipetakan bila
  tersedia minimal dua voice Jepang; bila tidak ada voice, cerita tetap terbaca.
- Menambahkan tabel ke-15 `story_attempts`, endpoint ke-20
  `POST /api/progress/story`, XP 25 pada penyelesaian pertama per cerita, batas
  300 attempt pada snapshot dan 1.000 saat impor, serta pencapaian `story-first`
  dan `story-3` (total 25).
- `StoryScene.videoUrl` disediakan sebagai seam same-origin opsional; tidak ada
  ekspor video, video AI, aset video, atau CMS pada fase ini.
- Verifikasi: 39 berkas/235 tes, build 101 halaman statis + 6 route detail dinamis
  + 20 API, 34 pola rute HTTP 200, Playwright 24 pemeriksaan (mode tonton, kuis,
  kamus, tanpa voice, mobile 390) tanpa error.
- Fase 15 (CMS) tetap **blocked**.

## Fase 17 — Japanese Handwriting & Stroke Order Studio

- Menambahkan halaman `/writing` dan `/writing/[id]` untuk 319 entri menulis:
  208 kana dan 111 kanji, dipetakan ke 259 glyph KanjiVG yang dipin pada commit
  `610091ce618cf757ed1357a8954cd65283e015d6`.
- Mengimpor data goresan ke JSON lokal dengan viewBox 0 0 109 109, nomor goresan,
  titik awal/akhir, dan sampel geometri; yōon ditampilkan sebagai dua komponen
  berurutan, bukan glyph gabungan buatan.
- Menambahkan animasi SVG, kontrol play/pause/restart/sebelumnya/berikutnya/ulangi,
  kecepatan, mode Tirukan dan Mandiri, Pointer Events untuk mouse/sentuh/stylus,
  undo/reset, grid, dan reduced motion.
- Evaluasi memakai perkiraan geometri bentuk/arah/urutan; UI menegaskan ini bukan
  pengenalan tulisan tangan, bukan nilai estetika, dan bukan sertifikasi.
- Menambahkan tabel ke-14 `writing_attempts`, endpoint ke-19
  `POST /api/progress/writing`, XP 15 pada attempt pertama per karakter, batas
  400 attempt pada snapshot, serta dua pencapaian baru (total 23).
- Menambahkan atribusi dan lisensi KanjiVG CC BY-SA 3.0 di
  `THIRD_PARTY_NOTICES.md`, `public/licenses/`, README aset, dan UI.
- Verifikasi: 38 berkas/227 tes, build 97 halaman statis + 6 route detail dinamis
  + 19 API, 32 pola rute HTTP 200, Playwright desktop/mobile/touch tanpa error.
- Fase 15 (CMS) tetap **blocked**; Story Player belum dimulai.

## Fase 16 — Japanese Audio & Pronunciation Studio

- Menambahkan halaman `/audio` dengan enam kategori materi (kana, kosakata, kanji,
  tata bahasa, bacaan, percakapan), pencarian, filter level/kelompok kana, dan pemuatan bertahap.
- Menyatukan pemutaran ke satu AudioPlayer global: play/pause/resume/stop, antrean,
  sebelumnya/berikutnya, ulangi, kecepatan 0,5–1,5×, dan pemilihan voice.
- Hanya memakai voice `ja-JP`; jika tidak tersedia, UI menjelaskan kondisi dan tidak
  diam-diam memakai voice bahasa lain. Transkrip dan latihan tertulis tetap dapat dipakai.
- Mengintegrasikan pemutar ke bacaan, percakapan, menyimak, pelafalan, dan tombol
  pelafalan; berpindah rute menghentikan audio.
- Menyimpan `speechRate`, `voiceURI`, dan `autoPlayAudio` di Settings; server
  membatasi kecepatan 0,5–1,5×. Tidak ada tabel/endpoint baru, MP3, unggahan audio,
  caching TTS, atau skor akustik.
- Fase 15 (perluasan CMS) tetap **blocked** karena repositori tidak memiliki CMS/admin.

## Fase 13 — Cross-phase review, concern resolution, dan refinement

- Menambahkan CLI backup/verifikasi/restore SQLite tanpa dependensi eksternal
  (`npm run db:backup`) dengan retensi backup, integrity check, dan pengaman restore.
- Menambahkan delapan LessonPlan N5 untuk empat bacaan dan empat dialog menyimak,
  termasuk blok `jp-prose` dan `dialog` yang sadar furigana.
- Menambahkan validator QA konten untuk pilihan duplikat, kunci jawaban di luar
  rentang, prompt/pembahasan kosong, dan ID soal yang bentrok.
- Memperbarui dokumentasi, backlog concerns, dan quality gate CI.
- Tidak ada perubahan skema database atau API.

## Fase 12 — Final quality assurance dan production readiness

- Audit menyeluruh keamanan, aksesibilitas, konten Jepang, performa, dan alur uji.
- Membatasi server ke loopback, menambahkan allowlist Host, pemeriksaan same-origin,
  batas body, header keamanan, dan impor berkonfirmasi.
- Memperbaiki kontras mode gelap, overflow mobile, label bahasa Jepang, fokus latihan,
  dan bug transkrip menyimak.
- Menghapus Google Fonts, memakai font sistem, dan memecah bundel permainan.

## Fase 11 — Advanced learning features

- Simulator percakapan bertipe dengan enam skenario, 19 langkah, dan 18 frasa kunci.
- Latihan mengetik tiga mode dengan pemeriksaan lokal dan dukungan alias romaji.
- Rencana belajar deterministik berdasarkan target JLPT, progres, dan preferensi.
- Kosakata terkait dan kanji dengan radikal yang sama di kamus.

## Fase 10 — Personalisasi dan konsistensi belajar

- Target harian/mingguan, streak, kalender aktivitas, tren, dan pencapaian.
- Rekomendasi yang dapat dijelaskan, kamus pribadi, koleksi, dan catatan.
- Ekspor/impor progres dan pengaturan target belajar.

## Fase 9 — Budaya Jepang

- 33 artikel budaya orisinal dengan fakta, kuis, penanda register, dan sumber.
- Peringatan eksplisit agar ekspresi anime tidak dianggap percakapan sehari-hari.

## Fase 8 — Ujian JLPT-style

- Empat mode ujian, timer, penanda soal, analitik bagian/kategori, dan pembahasan.
- Simulasi memakai soal orisinal; skor adalah skor belajar, bukan sertifikasi JLPT.

## Fase 7 — Pelafalan dan menyimak

- Latihan mendengar, dialog, transkrip, mode lambat, dan drill pelafalan.
- Rekaman mikrofon lokal tanpa unggahan; pengenalan suara browser bersifat opsional.

## Fase 6 — Permainan edukatif

- Enam permainan: pembuat kata, cocokkan kana, kejar kosakata, susun kalimat,
  tantangan kanji, dan tantangan harian.

## Fase 5 — Latihan adaptif dan SRS

- Katalog latihan, sesi adaptif, pengulangan berjarak, dan statistik soal.

## Fase 4 — Kurikulum dan LessonPlan

- Kurikulum N5–N1, 154 lesson katalog, serta pemain pelajaran bertahap.

## Fase 3 — Konten inti

- Kana, kosakata, kanji, tata bahasa, bacaan, menyimak, dan kalimat.

## Fase 2 — Fondasi aplikasi

- Next.js App Router, Tailwind, SQLite, API progres, tema, dan shell aplikasi.

## Fase 1 — Discovery dan arsitektur

- Audit workspace, pemilihan stack, model data, dan rencana fase.
