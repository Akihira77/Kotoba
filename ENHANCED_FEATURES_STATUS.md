# Enhanced Learning Features — Status

**Versi dokumen:** 1.5  
**Tanggal:** 2026-11-09  
**Fase:** 14 — audit/perencanaan; 14B — audit mobile learner; 15 — CMS **BLOCKED**; 16 — Audio & Pronunciation Studio; 17 — Writing & Stroke Order Studio; 18 — Story Theater & Animated Conversation; 19 — integrasi, QA, performa & aksesibilitas  
**Status:** Audio Studio, Writing Studio, dan Story Theater **sudah diimplementasikan, diintegrasikan, dan diuji**; CMS **tidak tersedia dan diblokir**  
**Basis kode:** Kotoba v0.1.0 (34 pola rute learner, 20 API, 15 tabel, 39 berkas/236 tes, 25 pencapaian, 16 tujuan navigasi)  
**Dokumen terkait:** [ENHANCED_LEARNING_FEATURES_SPEC.md](ENHANCED_LEARNING_FEATURES_SPEC.md) · [ENHANCED_FEATURES_ARCHITECTURE.md](ENHANCED_FEATURES_ARCHITECTURE.md) · [ENHANCED_FEATURES_ROADMAP.md](ENHANCED_FEATURES_ROADMAP.md) · [MOBILE_COMPATIBILITY_REPORT.md](MOBILE_COMPATIBILITY_REPORT.md) · [CONCERNS_BACKLOG.md](CONCERNS_BACKLOG.md) · [PROJECT_STATUS.md](PROJECT_STATUS.md) · [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

---

## 1. Ringkasan eksekutif

Fase 14 mengaudit sistem dan merencanakan tiga kemampuan. Fase 14B menguji mobile learner. Fase 15, yang meminta perluasan CMS “yang sudah ada”, **tidak dapat dijalankan** karena repo tidak memiliki CMS/admin, API konten, atau tabel konten; tidak ada kode yang diubah. Fase 16 mengimplementasikan **Audio & Pronunciation Studio**. Fase 17 mengimplementasikan **Writing & Stroke Order Studio** di atas data KanjiVG yang diverifikasi. Fase 18 mengimplementasikan **Story Theater** generik dengan tiga cerita orisinal, tanpa video AI atau CMS. Fase 19 menstabilkan integrasi: pelajaran kana/kanji menaut ke Studio Menulis, salinan goresan dikoreksi, dan regresi 102 pemeriksaan rute serta enam perjalanan kritis lulus. Tidak ada fitur, tabel, endpoint, CMS, atau video baru.

| Fitur | Status | Fase | Kondisi saat ini |
| --- | --- | --- | --- |
| Audio & Pronunciation Studio | **Sudah** | 16 | `/audio` 6 kategori; pemutar global; hanya voice `ja-JP`; antrean/kontrol/kecepatan/voice; diagnostik jujur; tanpa MP3/skor akustik |
| Handwriting & Stroke Order Studio | **Sudah** | 17 | `/writing` 319 entri (208 kana + 111 kanji), 259 glyph KanjiVG, animasi, mode tirukan/mandiri, evaluasi geometri, riwayat attempt, mastery |
| Story & Conversation Animation Player | **Sudah** | 18 | `/stories` + teater; 3 cerita (2 N5 + 1 N4), 9 adegan, 36 baris, 9 soal; panggung SVG/CSS; mode Belajar/Tonton; audio per baris; kuis; `story_attempts` |
| CMS/admin | **BLOCKED** | 15 | Tidak ada route, API, atau tabel CMS; konten adalah modul TypeScript. Butuh keputusan lokasi/otorisasi |
| Mobile learner | **Audit selesai** | 14B | 29 rute × 9 viewport; 0 overflow halaman, 0 error; writing dan story diuji terpisah pada 320/390/1440 |
| Mobile CMS/video pipeline | **Tidak dapat diaudit** | — | Permukaan belum ada; tidak diklaim kompatibel |

**Kesimpulan:** audio berfungsi tanpa layanan berbayar dan tanpa aset audio, tetapi hanya jika perangkat menyediakan voice Jepang. Menulis dapat dipelajari dari data goresan berlisensi, tetapi skornya adalah perkiraan geometri, bukan pengenalan tulisan tangan. Story Theater berjalan sepenuhnya lokal dengan panggung SVG/CSS dan TTS; tidak ada klaim sinkronisasi per kata, voice karakter native, ekspor video, atau video AI. CMS dan pipeline video tetap tidak ada dan tidak boleh dilaporkan seolah-olah sudah tersedia.

---

## 2. Audio & Pronunciation Studio (Fase 16, selesai)

### 2.1 Perilaku yang dikirim

- **Sumber:** Web Speech API `speechSynthesis` dengan utterance `lang=ja-JP`; pemilihan voice hanya dari voice berbahasa Jepang.
- **Deteksi:** `getVoices()` dan listener `voiceschanged`; pemilihan ulang saat daftar voice berubah.
- **Fallback jujur:** bila tidak ada voice Jepang, UI menampilkan status dan tidak memakai voice bahasa lain. Transkrip dan teks latihan tetap dapat dibaca.
- **Satu pemutar global:** antrean, putar/jeda/lanjut/berhenti, sebelumnya/berikutnya, ulangi, kecepatan 0,5–1,5×, dan pilihan voice. Berpindah rute menghentikan audio agar tidak overlap.
- **Cakupan:** kana, kosakata, kanji, contoh tata bahasa, bacaan, percakapan; halaman menyimak dan pelafalan memakai kontrol audio yang sama; cerita memakai pemutar yang sama per baris.
- **Persistensi:** `speechRate`, `voiceURI`, dan `autoPlayAudio` di Settings yang sudah ada. Tidak ada tabel audio, riwayat pemutaran, atau unggahan suara.
- **Batas yang disengaja:** tidak ada MP3/audio statis, tidak ada caching TTS, tidak ada skor akustik, dan tidak ada klaim kualitas native. Open JTalk tetap adapter lokal opsional yang belum di-deploy.

### 2.2 Akar masalah “menu audio tanpa suara”

Audit Fase 14 menemukan `speechSynthesis` tersedia, tetapi `getVoices()` mengembalikan 0 voice dan 0 voice Jepang pada Chromium uji. Tidak ada file audio di `public/`. Jadi masalahnya bukan field CMS yang hilang, melainkan **voice perangkat tidak tersedia** dan belum ada fallback. Fase 16 tidak memalsukan suara: ia menjelaskan kondisi tersebut. Pada perangkat dengan voice Jepang, pemutaran berjalan; pada perangkat tanpa voice Jepang, status “belum tersedia” adalah perilaku yang benar.

### 2.3 Verifikasi

- Saat penutupan Fase 16: **36 berkas / 215 tes**, typecheck + ESLint bersih; build **96 halaman statis** (70 pelajaran + `_not-found`) + 5 route detail dinamis + 18 route API; 30 pola rute HTTP 200.
- Playwright Fase 16 memakai mock voice untuk menguji kontrol, pembacaan, percakapan, menyimak, pelafalan, dan mobile 390 tanpa error; fallback/overlap juga ditambahkan ke unit test.
- Screenshot: `.screenshots/audio/audio-no-voice.png`, `audio-voice.png`, `audio-reading.png`, `audio-conversation.png`, `audio-listening.png`, `audio-pronunciation.png`, `audio-mobile-390.png`.

---

## 3. Writing & Stroke Order Studio (Fase 17, selesai)

### 3.1 Data dan lisensi

- Sumber tunggal: **KanjiVG**, commit `610091ce618cf757ed1357a8954cd65283e015d6`.
- 319 entri katalog memakai **259 glyph unik**: 208 entri kana (termasuk yōon sebagai dua komponen) dan 111 kanji.
- JSON turunan disimpan di `public/writing/kanjivg/` (±1,6 MB) dengan `viewBox 0 0 109 109`, path per goresan, nomor, titik awal/akhir, dan 28 titik sampel.
- Lisensi **CC BY-SA 3.0**, © Ulrich Apel dan kontributor KanjiVG. Atribusi, tautan sumber, dan teks lisensi ada di `THIRD_PARTY_NOTICES.md`, `public/licenses/kanjivg-CC-BY-SA-3.0.txt`, `public/writing/kanjivg/README.txt`, dan UI.
- Tidak ada glyph gabungan yōon yang difabrikasi; komponen ditampilkan berurutan.

### 3.2 Studio

- `/writing`: 319 karakter, lima tahap A–E, filter Kana/Kanji, pencarian, mastery, 30 kartu per halaman.
- `/writing/[id]`: animasi SVG bernomor; mode Animasi, Tirukan, dan Mandiri; kontrol play/pause/restart/sebelumnya/berikutnya/ulangi goresan; kecepatan Lambat/Normal/Cepat.
- Input memakai Pointer Events untuk mouse, sentuh, dan stylus; undo/reset; referensi dapat disembunyikan; grid dan reduced motion didukung.
- Konten per karakter: romaji/pelafalan, jumlah goresan, contoh kata, mnemonic, ±45 catatan bentuk, kesalahan umum; kanji menambah arti, on/kun, radikal, level, dan kosakata contoh.
- Cross-link dari detail kana dan kanji; kartu Menulis di dasbor; dua pencapaian baru (`writing-first`, `writing-20`), total 23 saat Fase 17 dan 25 setelah Fase 18.

### 3.3 Evaluasi dan persistensi

- Evaluasi adalah **perkiraan geometri**, bukan pengenalan tulisan tangan: goresan 55% bentuk + 12% awal + 12% akhir + 21% arah; total 82% bentuk + 18% jumlah; penalti urutan; mastery ≥80.
- UI menyebut “perkiraan geometri”, bukan skor estetika, sertifikasi, atau handwriting recognition.
- Tabel ke-14 `writing_attempts` menyimpan karakter, script, mode, skor, jumlah goresan, goresan digambar, kesalahan urutan, durasi, dan waktu. XP 15 hanya pada attempt pertama per karakter.
- Snapshot membatasi 400 attempt terbaru; tidak ada koordinat mentah, gambar, atau timing per goresan yang disimpan.

---

## 4. Story Theater & Animated Conversation (Fase 18, selesai)

### 4.1 Konten dan model

- `src/content/stories.ts` berisi **3 cerita orisinal**: 2 N5 dan 1 N4, total 9 adegan, 36 baris dialog, dan 9 soal. Tidak ada tabel konten, CMS, atau aset eksternal.
- Cerita: `story-eki-hajimete` (Hari Pertama di Stasiun), `story-kafe-koohii` (Kafe Kecil), `story-haru-ame` (Rencana di Hari Hujan).
- Setiap baris memiliki speaker, teks Jepang ber-furigana, reading kana, romaji, arti Indonesia, ekspresi, anotasi kosakata/tata bahasa, dan opsional `audioUrl`.
- Validator memastikan reading sama dengan `furiganaReading(jp)`, semua ID kosakata/tata bahasa ada di katalog, speaker/karakter panggung valid, dan kunci kuis dalam rentang.

### 4.2 Panggung dan mode

- Satu `StoryStage` generik merender 8 latar SVG/CSS orisinal: stasiun, peron, kereta, kafe, meja, taman hujan, perpustakaan, dan jalan.
- Mendukung posisi karakter (far-left sampai far-right), lima ekspresi, bubble dialog, efek hujan/salju, animasi masuk ringan, dan idle yang dinonaktifkan oleh reduced motion.
- **Mode Belajar:** dialog dimajukan manual; pengguna dapat memutar ulang baris, membaca terjemahan, membuka kosakata/tata bahasa, dan berpindah baris.
- **Mode Tonton:** audio per baris diputar lalu maju otomatis; dapat dijeda, dihentikan, dan dilanjutkan dari baris mana pun. Tidak ada klaim sinkronisasi per kata.
- Kontrol: putar/jeda/lanjut/hentikan, sebelumnya/berikutnya, ulangi, mulai ulang, kecepatan 0,75–1,5×, voice, lompat dialog/adegan, progres, serta toggle subtitle/furigana/romaji/terjemahan/mode Jepang saja/kosakata/tata bahasa.

### 4.3 Audio dan pembicara

- Memakai satu pemutar global Fase 16 dan hanya voice `ja-JP`; highlight bersifat per baris.
- Bila tersedia ≥2 voice Jepang, voice dipetakan ke karakter secara round-robin; bila hanya satu, semua karakter memakai voice yang sama dengan keterangan jujur bahwa Kotoba tidak memalsukan voice karakter native.
- Bila tidak ada voice Jepang, cerita tetap terbaca dan kuis tetap dapat dikerjakan; status audio menjelaskan kondisinya.
- `StoryScene.videoUrl` adalah seam same-origin opsional untuk video pre-render; belum ada aset, CMS, atau pipeline. Tidak ada ekspor video, video AI, atau API key di frontend.

### 4.4 Kuis, progres, dan pencapaian

- Setelah cerita: kuis pemahaman dan menyimak (3 soal per cerita), ringkasan kosakata yang dapat disimpan ke kamus pribadi, catatan tata bahasa, dan opsi mengulang.
- Skor kuis disimpan lewat `POST /api/progress/story` ke tabel ke-15 `story_attempts`; XP 25 hanya pada penyelesaian pertama per cerita; skor ≥60 dihitung sebagai cerita selesai.
- Snapshot menyimpan 300 attempt terbaru; impor dibatasi 1.000. Tidak ada posisi dialog, audio, atau jawaban yang disimpan.
- Pencapaian `story-first` dan `story-3` ditambahkan; total menjadi 25.

### 4.5 Verifikasi

- Suite saat ini: **39 berkas / 236 tes**, typecheck + ESLint bersih.
- Build: **101 halaman statis** (70 pelajaran + `/stories` + 3 cerita SSG + `_not-found`) + 6 route detail dinamis + 20 route API.
- **34 pola rute** HTTP 200 dengan H1 yang diharapkan; 0 error konsol pada smoke QA.
- Playwright Fase 18: 24 pemeriksaan lulus — hub, terjemahan/furigana, navigasi baris, mode tonton, kuis 100% tersimpan, kamus, tanpa voice tetap terbaca, mobile 390 tanpa overflow, dan persistensi.
- Screenshot: `.screenshots/story/story-hub.png`, `story-study.png`, `story-watch.png`, `story-quiz.png`, `story-no-voice.png`, `story-mobile-390.png`.

Batas: hanya 3 cerita; TTS tidak memberi timing per kata; voice bergantung perangkat; belum ada resume/checkpoint; kamus hanya chip kosakata terkurasi; pengujian memakai Chromium emulasi + mock voice, bukan perangkat fisik.

---

## 5. CMS — blocked, bukan selesai

Tidak ada route `/admin` atau `/cms`, API konten admin, tabel konten, unggahan media, alur draft/publish, atau preview. Konten tetap modul TypeScript bertipe dan ADR-003/ADR-053 menunda CMS. Permintaan Fase 15 untuk memperluas CMS yang “sudah ada” tidak dapat dieksekusi tanpa keputusan lokasi CMS atau otorisasi membangun fondasi baru. Fase 19 memverifikasi kembali `/admin` 404, `/api/admin` 404, dan tidak ada tautan CMS di `/settings`; ini bukti bahwa CMS tidak ada, bukan bukti fitur selesai. Karena itu audit mobile CMS juga tidak dapat dilakukan. Pipeline aset video cerita (PRD-11) bergantung pada keputusan yang sama.

---

## 6. Hasil audit mobile Fase 14B (learner)

**Cakupan:** 29 rute learner × 9 viewport = **261 pemuatan**, Chromium Playwright teremulasi. Viewport: 320×568, 360×740, 375×667, 390×844, 430×932, 768×1024, 1024×768, 1366×768, 1920×1080.

| Viewport | Overflow halaman | Error runtime | HTTP non-200 |
| --- | ---: | ---: | ---: |
| 320 / 360 / 375 / 390 / 430 | 0 | 0 | 0 |
| 768 / 1024 / 1366 / 1920 | 0 | 0 | 0 |

- Perbaikan utama: `src/app/progress/page.tsx` (overflow 394/1050 px), `src/components/ui.tsx` (StatTile tidak memotong), `src/app/plan/page.tsx`, `src/app/typing/page.tsx`, `src/app/page.tsx` (kartu JLPT), `src/app/settings/page.tsx`, `src/components/listening-player.tsx` (transkrip menampilkan bacaan, bukan ID), `src/app/kana/page.tsx`, dan target sentuh `/practice`/`Ubah target`.
- Suite fungsional 390×844: 18/18 langkah lulus, termasuk drawer + Escape, pelajaran, kuis kana, SRS kosakata, tata bahasa, bacaan, menyimak, latihan, permainan, ujian, mengetik, percakapan, rencana, tema, kamus, dan statistik.
- Writing diuji terpisah setelah Fase 17 pada 320/390/1440, termasuk touch via CDP. Story hub/detail diuji pada 390 setelah Fase 18 tanpa overflow. Keduanya bukan bagian dari 261 pemuatan Fase 14B.
- **Batas:** emulasi bukan perangkat fisik. iOS Safari, Android Chrome, kamera/file picker asli, audio perangkat, orientasi nyata, dan pembaca layar belum diuji. CMS tidak ada sehingga tidak diuji.

---

## 7. Integrasi lintas fitur (Fase 19)

Fase 19 tidak menambah kemampuan baru. Fase ini menutup dua celah integrasi yang tersisa setelah Fase 16–18 dan menjalankan regresi lintas fitur pada build produksi dengan DB terisolasi.

**Perubahan.**

| Area | Perubahan |
| --- | --- |
| Pelajaran → menulis | Helper murni `writingHrefForContentRef` memetakan referensi kana/kanji ke `/writing/writing-<id>`; `lesson-player.tsx` menampilkan tombol **Latihan menulis** hanya bila pelajaran memiliki referensi kana/kanji. Katalog menulis yang berat tidak masuk ke bundle pelajaran |
| Salinan | Instruksi di `src/content/lessons/kanji.ts` yang menyiratkan animasi goresan tersedia langsung di pelajaran dikoreksi; sekarang mengarah ke Studio Menulis dan meminta verifikasi kamus tepercaya |
| Tes | Tes tautan memastikan hiragana/katakana/kanji menghasilkan detail valid dan kosakata menghasilkan `null`; total menjadi 39 berkas/236 tes |

**QA.** Playwright Chromium pada 34 pola rute × desktop 1440×900, mobile 390×844, dan mobile 320×720 menghasilkan **102/102 lulus** (HTTP 200, satu `h1`, `lang=id`, overflow ≤2 px, 0 error konsol/request gagal). Enam perjalanan kritis lulus: kana tanpa voice, tata bahasa tanpa voice, menulis hiragana (tirukan + mandiri + simpan), animasi kanji, teater cerita (terjemahan/kuis/simpan/tanpa request eksternal), dan CMS blocked. Satu observasi `h1` ganda di `/dictionary/collections` tidak dapat direproduksi dan tidak diklaim sebagai bug.

**Performa dan a11y.** Transfer halaman fitur tercatat 572–610 KB (termasuk prefetch/RSC Next.js), dengan 0 glyph KanjiVG di hub menulis dan 1 glyph di detail. Lima rute sampel memiliki **0 kontrol tanpa nama aksesibel**. Audit screen reader penuh dan perangkat fisik belum dilakukan.

**Batas.** Chromium teremulasi dan mock voice; angka transfer tidak boleh disebut seluruh dataset dimuat; CMS/video tetap tidak ada. Laporan QA ada di `.data/phase19-report.json`.

---

## 8. Deliverable dan keputusan

| Deliverable | Status |
| --- | --- |
| Spesifikasi, arsitektur, roadmap enhanced | Selesai Fase 14; status diperbarui hingga Fase 19 |
| `MOBILE_COMPATIBILITY_REPORT.md` | Selesai Fase 14B |
| ADR-050 | Rantai audio berlapis |
| ADR-051 | KanjiVG sumber tunggal, tanpa handwriting recognition |
| ADR-052 | Story player DOM/SVG, tanpa video/CMS |
| ADR-053 | Tidak membangun CMS sekarang |
| ADR-054 | Fase 14 audit/perencanaan |
| ADR-055 | Web Speech `ja-JP`, satu pemutar, fallback jujur |
| ADR-056 | Tanpa MP3/skor akustik/klaim native |
| ADR-057 | KanjiVG dipin, JSON turunan, yōon berurutan, CC BY-SA |
| ADR-058 | Tabel `writing_attempts`, XP 15 pertama per karakter, batas 400 |
| ADR-059 | Evaluasi geometri, bukan pengenalan tulisan tangan |
| ADR-060 | Cerita bertipe + stage SVG/CSS generik + seam `videoUrl` |
| ADR-061 | Tabel `story_attempts`, XP 25 pertama per cerita, completion ≥60, snapshot 300 |
| ADR-062 | Audio per baris, voice karakter hanya bila ≥2 voice, tanpa ekspor video/AI |
| ADR-063 | Stabilisasi Fase 19: helper tautan menulis, koreksi salinan, tanpa CMS/video, angka transfer mencakup prefetch |
| `CONCERNS_BACKLOG.md` | 116 concern: 39 RESOLVED, 5 ACCEPTED, 68 DEFERRED, 1 BLOCKED, 3 REJECTED |
| QA integrasi Fase 19 | 34 rute × 3 viewport = 102/102, 6 perjalanan kritis, 0 kontrol tanpa nama di 5 rute sampel |

**Pilihan teknologi:** Web Speech API untuk audio; KanjiVG selektif untuk stroke; SVG/Canvas/Web Animations untuk animasi dan tracing; story stage DOM/SVG; konten TypeScript bertipe; tanpa layanan berbayar dan tanpa aset audio/gambar tanpa lisensi.

---

## 9. Risiko dan batasan terbuka

1. **Audio bergantung voice perangkat.** Tanpa voice Jepang, tidak ada suara; status menjelaskan dan transkrip tetap tersedia. Chromium uji memakai mock voice.
2. **Tidak ada audio statis/MP3.** Pemutaran tidak dapat diandalkan sepenuhnya lintas perangkat sampai ada rekaman berlisensi atau TTS lokal yang diuji.
3. **Data goresan berasal dari KanjiVG.** 259 glyph terimpor dan teruji, tetapi urutan KanjiVG bukan satu-satunya variasi penulisan yang sah. Lisensi CC BY-SA mewajibkan atribusi dan share-alike untuk data turunan.
4. **Evaluasi menulis adalah geometri.** Skor dapat berbeda pada gaya tulisan yang sah; tidak ada penilaian estetika, pengenalan tulisan tangan, atau umpan balik per stroke yang sempurna.
5. **Stylus/perangkat fisik belum diuji.** Touch via CDP membuktikan alur dasar, bukan kenyamanan Apple Pencil/tablet Android atau palm rejection.
6. **Snapshot writing dibatasi 400 attempt; cerita 300.** Riwayat jangka panjang belum memiliki pagination/endpoint khusus.
7. **Story Theater baru 3 cerita (2 N5 + 1 N4).** Belum ada N3–N1, cerita keempat, atau CMS; jangan mengklaim cakupan JLPT penuh.
8. **Audio cerita hanya per baris.** Web Speech tidak memberi timing kata yang andal; metadata subtitle untuk audio rekaman belum ada.
9. **Tidak ada resume/checkpoint cerita.** Menutup halaman mengulang dari awal.
10. **Tidak ada ekspor video atau pipeline aset video.** `StoryScene.videoUrl` baru seam tanpa aset/CMS.
11. **Kamus cerita hanya chip kosakata terkurasi.** Klik kata arbitrer belum didukung.
12. **CMS tidak ada.** Permukaan CMS tidak dapat diaudit atau dipakai; ini disengaja sampai ada keputusan.
13. **Mobile hanya Chromium teremulasi.** Perangkat fisik dan screen reader belum diverifikasi.
14. **Katalog konten masih ikut bundle klien** (~33 KiB gzip di banyak rute); belum direfaktor.
15. **Auth/TLS/rate limit tetap prasyarat deployment publik.** Fase 14–19 tidak mengubah batas keamanan lokal.
16. **Angka performa Fase 19 mencakup prefetch.** Transfer 572–610 KB per halaman bukan muatan awal murni; chunk RSC/prefetch Next.js ikut terhitung. Optimasi nyata belum diklaim.
17. **Observasi h1 ganda tidak direproduksi.** Satu kemunculan di `/dictionary/collections` tidak dapat diulang pada muat baru/pengulangan rute; dicatat sebagai flaky, bukan bug yang diperbaiki.

---

## 10. Rencana berikutnya

| Fase | Fokus | Prasyarat |
| --- | --- | --- |
| 15 | CMS: **BLOCKED** sampai ada lokasi CMS atau otorisasi membangun fondasi | Keputusan pengguna |
| 16 | Audio Studio | **Selesai** |
| 17 | Writing & Stroke Order Studio | **Selesai** |
| 18 | Story Theater: model, stage, 3 cerita, audio per baris, kuis, progress | **Selesai** |
| 19 | Integrasi/QA/performa/a11y lintas audio, writing, story; regresi 34 rute | **Selesai** — 102/102 pemeriksaan, 6 perjalanan, 236 tes |
| 20 | Kedalaman konten N4, E2E CI, aksesibilitas/perangkat, performa terukur | Fase 19 |

**P0 terpisah:** kedalaman konten N4 dan bank soal N3–N1. **Prasyarat publik:** autentikasi, TLS, rate limit, isolasi pengguna. **Blocked:** komponen kanji (CNT-08) dan CMS (Fase 15). **Deferred:** ekspor video, pipeline aset video/CMS, resume cerita, dan perluasan katalog cerita. Skrip QA Fase 19 masih sementara di `.data` dan harus dipindahkan ke suite E2E yang di-commit pada Fase 20.

---

## 11. Status jujur

- **Selesai:** audit Fase 14, verifikasi KanjiVG, empat dokumen perencanaan, ADR-050–054, audit mobile learner 14B, perbaikan layout mobile, Audio Studio Fase 16, Writing Studio Fase 17, Story Theater Fase 18, integrasi & QA Fase 19, ADR-055–063, dan pembaruan backlog menjadi 116 concern.
- **Belum selesai:** CMS, audio statis, komponen kanji, ekspor video, pipeline aset video, resume cerita, perluasan cerita N3–N1, E2E CI yang permanen, dan kedalaman konten N4.
- **Tidak diuji:** perangkat fisik, iOS Safari/Android Chrome nyata, screen reader, kamera/file picker, audio perangkat nyata, stylus/palm rejection, dan CMS.
