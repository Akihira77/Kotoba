# Arsitektur Fitur Pembelajaran Lanjutan — Kotoba 言葉

**Versi dokumen:** 1.1  
**Tanggal:** 2026-11-08  
**Status:** Rencana arsitektur Fase 14 (historis); **subset Audio diimplementasikan pada Fase 16**  
**Cakupan:** integrasi Audio & Pronunciation Studio, Handwriting & Stroke Order Studio, dan Story & Conversation Animation Player ke aplikasi Kotoba yang sudah berjalan  
**Dokumen terkait:** [ENHANCED_LEARNING_FEATURES_SPEC.md](ENHANCED_LEARNING_FEATURES_SPEC.md) · [ENHANCED_FEATURES_ROADMAP.md](ENHANCED_FEATURES_ROADMAP.md) · [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [DATA_MODEL.md](DATA_MODEL.md) · [DECISIONS.md](DECISIONS.md)

> **Status aktual (Fase 16):** Dokumen ini mempertahankan rencana awal Fase 14 beserta penomoran lamanya sebagai catatan historis. Pelaksanaan aktual: **Fase 15 CMS diblokir** (repositori tidak memiliki CMS), **Fase 16 Audio & Pronunciation Studio selesai**, Fase 17 Writing, Fase 18 Story, Fase 19 Animation/polish + Integration/QA. Bagian "Fase 15 — Audio" dan "Fase 16 — Writing" di bawah adalah rencana awal, bukan status saat ini. Status kanonis: [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md). Nomor rute pada bagian historis adalah baseline Fase 14 (29 rute); setelah `/audio` menjadi 30.

---

## 1. Prinsip integrasi

1. **Perluasan, bukan penggantian.** Shell, tema, provider progres, mesin latihan, API, dan SQLite tetap. Tidak ada migrasi framework.
2. **Konten tetap sebagai kode.** Tidak ada CMS baru. Tipe dan validator diperluas; konten baru masuk ke `src/content/`.
3. **Satu resolver audio.** Semua halaman memakai kontrol/resolver yang sama; jangan menduplikasi logika TTS di setiap komponen.
4. **Data stroke yang dapat dilacak.** Hanya KanjiVG (CC BY-SA 3.0) dengan commit yang dipin, atribusi, dan verifikasi cakupan.
5. **Tidak ada klaim yang tidak terverifikasi.** Tidak ada pengenalan tulisan tangan, skor akustik, atau penilaian urutan goresan otomatis.
6. **Lokal-first.** Tidak ada API berbayar, tidak ada permintaan media eksternal, tidak ada upload audio/gambar.
7. **Aditif dan dapat dihapus.** Route/tipe baru tidak mengubah data lama; fitur dapat dinonaktifkan tanpa merusak fitur inti.
8. **Ukur sebelum optimasi.** Data stroke/audio dimuat sesuai kebutuhan; bundle diukur di build produksi.

---

## 2. Peta arsitektur saat ini yang relevan

```text
Next.js App Router (client pages)
  ├─ AppShell / ProgressProvider / ToastProvider
  ├─ Halaman: /, /learn, /kana, /vocabulary, /kanji, /grammar,
  │            /reading, /listening, /pronunciation, /practice,
  │            /games, /exams, /culture, /dictionary, /progress,
  │            /settings, /plan, /typing, /conversation
  ├─ Komponen bersama: JpText, SpeakButton, ExerciseRunner,
  │                    ListeningPlayer, PronunciationGuide
  ├─ src/lib: speech.ts, progress, srs, achievements, recommendations,
  │           study-plan, typing, content-qa
  ├─ src/content: kana, vocabulary, kanji, grammar, reading, listening,
  │               pronunciation, conversations, culture, lessons
  └─ API routes: /api/progress/*, /api/health (18 route)

SQLite 13 tabel: profile, cards, reviews, lessons, kana_progress,
exams, quiz_attempts, question_stats, game_attempts, activity,
culture_favorites, saved_items, saved_collections
```

Fakta yang membatasi desain:

- Semua halaman saat ini client component; tidak ada server component untuk katalog.
- `LessonProgressKind` memiliki 12 nilai; penambahan kind adalah perubahan tipe + validasi API, bukan migrasi tabel.
- `SpeechProvider` sudah menjadi seam; halaman memanggil `speakDetailed`/`useSpeech`, bukan langsung Web Speech API.
- Tidak ada pipeline aset media; `public/` hanya favicon/manifest.
- Tidak ada CMS/admin/route konten; konten divalidasi oleh tes.
- Progres satu profil, tanpa auth; server loopback-only. Fitur baru tidak boleh memperluas permukaan jaringan.

---

## 3. Arsitektur Audio & Pronunciation Studio

### 3.1 Komponen

```text
AudioControl (UI reusable)
  ├─ useAudio() / playAudio()
  ├─ AudioResolver
  │   ├─ RecordedAudioProvider  (public/audio + manifest)
  │   ├─ browserSpeechProvider  (Web Speech API, ja-JP)
  │   └─ LocalTtsProvider       (opsional, loopback, tidak default)
  ├─ AudioCapabilityReport      (dukungan, voices, aset, alasan)
  └─ Transcript / status / rate
```

### 3.2 Kontrak yang diusulkan (aditif)

Kontrak lama tetap dipertahankan agar halaman yang sudah ada tidak rusak:

```ts
// src/lib/audio.ts (baru; bukan pengganti speech.ts)
export type AudioSource = "recorded" | "browser-synthesis" | "local-tts";

export interface AudioAsset {
  id: string;
  text: string;
  lang: "ja-JP";
  src: string;                 // /audio/...
  mime: "audio/mpeg" | "audio/ogg" | "audio/wav";
  source: "recorded" | "synthesized";
  license: string;             // mis. "original", "CC-BY-4.0"
  credit?: string;
  durationMs?: number;
  sha256?: string;
}

export interface AudioRequest extends SpeakOptions {
  text: string;
  audioId?: string;
}

export interface AudioPlaybackResult extends SpeechPlaybackResult {
  source: AudioSource;
  assetId?: string;
}
```

- `playAudio(request): Promise<AudioPlaybackResult>` memilih sumber.
- `speakDetailed` tetap ada untuk kompatibilitas; ia dapat memanggil resolver dengan `audioId` tidak ada.
- `registerSpeechProvider` tetap; `SpeechProvider` boleh mendapat `priority?: number` opsional. Provider dengan prioritas tertinggi yang `isAvailable()` dipilih. Browser default prioritas 0.
- Jangan mengubah signature `SpeakOptions` yang sudah dipakai halaman; tambahkan field opsional.

### 3.3 Urutan fallback

1. **Rekaman** jika `audioId` ada, manifest valid, file ada, dan hash/lisensi valid.
2. **TTS browser** jika ada voice `ja`; pilih voice pengguna, lalu voice Jepang pertama.
3. **TTS lokal opsional** jika dikonfigurasi dan tersedia (loopback).
4. **Tidak tersedia** — tampilkan transcript dan alasan spesifik; jangan memakai voice non-Jepang.

Kegagalan rekaman (404/decode) tidak boleh langsung menampilkan “tidak ada audio”; coba TTS. Jika TTS juga gagal, tampilkan alasan.

### 3.4 Manifest dan pipeline aset

- `public/audio/<id>.<ext>` menyimpan rekaman; manifest `src/content/audio-manifest.ts` (typed) atau JSON yang divalidasi.
- Setiap aset wajib: id unik, teks yang cocok, bahasa `ja-JP`, lisensi, kredit, mime, hash.
- Build/test memeriksa: file ada, ukuran > 0, hash cocok, tidak ada id duplikat, tidak ada teks kosong, tidak ada aset tanpa lisensi.
- Pada Fase 15 manifest boleh kosong (belum ada rekaman); UI harus tetap berfungsi dengan TTS dan menampilkan “belum ada rekaman” secara jujur.
- Jangan meng-host audio pihak ketiga tanpa izin; jangan mengunduh audio dari layanan TTS berbayar.

### 3.5 Open JTalk (opsional, tidak default)

Open JTalk adalah mesin TTS Jepang lokal (HTS + MeCab/NAIST dictionary). Core dilaporkan BSD-3-Clause; voice HTS memiliki lisensi terpisah. Karena itu:

- Jangan menambahkan Open JTalk sebagai dependensi npm default.
- Jangan mengasumsikan semua voice model boleh didistribusikan.
- Jika diimplementasikan, gunakan adapter server lokal: `POST /api/tts` dengan body `{ text, rate }`, hanya loopback, same-origin, batas body, timeout, tanpa logging teks, dan feature flag `KOTOBA_TTS_MODE=local`.
- Route ini bukan bagian dari Fase 15 wajib; ia adalah spike opsional setelah audio fallback stabil.
- Tanpa server TTS, browser TTS + rekaman tetap menjadi jalur utama.

### 3.6 UI dan status

`AudioControl` memiliki state: `idle | loading | playing | paused | error | unavailable`.

- Tombol play/pause dengan `aria-pressed`; label memuat teks yang diputar (dipotong).
- Status `role="status"`/`aria-live="polite"` untuk “memuat”, “diputar”, “gagal”; jangan mengumumkan setiap frame.
- Transcript selalu tersedia (bisa toggle), bukan pengganti audio.
- Kecepatan: normal (setting), lambat 0.65; tidak menambah preferensi baru.
- Jika tidak ada voice Jepang: pesan “Voice Jepang tidak ditemukan di perangkat ini. Kamu masih bisa membaca transcript atau memasang voice Jepang.” Tombol tetap ada tetapi menjelaskan; jangan tombol mati tanpa alasan.
- Jika `speechSynthesis` tidak didukung: pesan berbeda; tidak menyalahkan konten.

### 3.7 Halaman

- `/pronunciation` menjadi studio dengan tab **Latihan**, **Perpustakaan**, **Diagnostik**.
- Tidak menambah route audio baru pada Fase 15; menghindari duplikasi dan nav tambahan.
- `SpeakButton` di seluruh aplikasi dapat tetap sebagai wrapper tipis di atas `AudioControl`, atau dipertahankan dengan resolver baru; semua halaman harus memakai jalur yang sama.

---

## 4. Arsitektur Writing & Stroke Order Studio

### 4.1 Pipeline data KanjiVG

Sumber: [KanjiVG](https://kanjivg.tagaini.net/), lisensi [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Commit yang diaudit: `610091ce618cf757ed1357a8954cd65283e015d6` (2026-11-05).

Hasil verifikasi Fase 14:

| Pemeriksaan | Hasil |
| --- | --- |
| Entri pohon KanjiVG | 11.961, tidak terpotong |
| Kanji aplikasi | 111/111 memiliki SVG |
| Entri kana aplikasi | 208/208 memiliki SVG untuk setiap karakter komponen |
| Karakter unik | 259 |
| File hilang | 0 |
| Total SVG mentah | 690.664 byte; rata-rata 2.667 byte; maksimum 6.276 byte |

Ini membuktikan **ketersediaan path**, bukan kebenaran linguistik independen. Urutan mengikuti KanjiVG.

### 4.2 Format data turunan

Jangan memuat SVG mentah semua karakter ke bundle. Hasilkan data per karakter:

```ts
export interface StrokePath {
  d: string;          // path SVG
  order: number;      // 1-based
  type?: string;      // metadata opsional
}

export interface StrokeCharacter {
  id: string;         // "hiragana-a", "kanji-nichi"
  char: string;
  script: "hiragana" | "katakana" | "kanji";
  viewBox: "0 0 109 109";
  strokes: StrokePath[];
  numbers?: Array<{ order: number; x: number; y: number }>;
  source: "kanjivg";
  sourceCommit: string;
  license: "CC-BY-SA-3.0";
}
```

- Importer offline (Node/Python stdlib) membaca SVG KanjiVG, mengekstrak path dalam urutan `kvg:...-s1`, `-s2`, dan menghasilkan JSON per karakter.
- Data disimpan di `src/content/stroke/` atau `public/stroke/`; jika di `public/`, fetch per karakter; jika di `src/content/`, dynamic import per karakter.
- Rekomendasi: **public JSON per karakter** agar tidak memperbesar bundle dan bisa di-cache; halaman detail memuat satu file.
- Build script wajib memverifikasi 259 karakter, tidak ada path kosong, urutan kontinu, viewBox benar, dan hash sumber.
- Jangan mengubah path menjadi format proprietary; data turunan tetap CC BY-SA 3.0.

### 4.3 Lisensi dan atribusi

Wajib:

- `THIRD_PARTY_NOTICES.md` berisi “Stroke data © Ulrich Apel / KanjiVG, CC BY-SA 3.0” + tautan.
- Halaman writing menampilkan atribusi singkat dan tautan lisensi.
- Salinan lisensi CC BY-SA 3.0 di `public/licenses/kanjivg-CC-BY-SA-3.0.txt`.
- Jangan menghapus atribusi dari file/metadata.
- Jangan mencampur data stroke ke dalam dataset tertutup.

### 4.4 Renderer

- **Lihat**: inline SVG, `viewBox="0 0 109 109"`, path dengan `stroke-dasharray`/`stroke-dashoffset`, animasi berurutan memakai Web Animations API atau CSS transition. Nomor goresan sebagai `<text>` atau overlay.
- **Latihan**: SVG outline + canvas overlay; pointer events untuk menggambar; tombol undo/clear; panduan goresan berikutnya; self-check.
- **Tanpa kanvas**: tombol “tampilkan urutan” + daftar goresan; latihan dapat diselesaikan dengan menandai “sudah mencoba” tanpa menggambar.
- **Reduced motion**: animasi diganti tampilan statis per goresan; kontrol manual.
- **Ukuran**: SVG diskalakan responsif; target sentuh tombol ≥ 44 px; kanvas tidak menyebabkan overflow 320 px.

### 4.5 Yōon dan karakter komposit

- Aplikasi memiliki entri seperti `きゃ`, `しゃ`, `ニョ`. Ini adalah dua kana, bukan satu glyph.
- Jangan membuat SVG gabungan palsu atau mengklaim satu urutan goresan untuk keseluruhan yōon.
- UI menampilkan dua komponen, urutan menulis komponen pertama lalu kedua, dan penjelasan singkat.
- Progres dapat disimpan untuk pasangan yōon, tetapi data stroke tetap per komponen.

### 4.6 Route dan progres

- `/writing` — hub/filter/progres.
- `/writing/[id]` — detail; `generateStaticParams` untuk 259 item (ukur build). Fallback jika build terlalu besar: satu halaman hub + panel detail, tanpa 259 halaman.
- Progres: `LessonProgress` kind `writing`, `lessonId` = `writing-<script>-<slug>`, skor 0–100 self-assessment/coverage.
- XP: 10 per penyelesaian pertama (usulan; final di `XP_RULES`).
- Tidak ada tabel baru. Jika nanti butuh per-goresan/attempt, itu fase migrasi terpisah (SEC-08).

---

## 5. Arsitektur Story & Conversation Animation Player

### 5.1 Model domain

Tambahan di `src/lib/types.ts` (usulan; belum diimplementasikan):

```ts
export interface StoryCharacter {
  id: string;
  name: string;
  nameJp: string;
  role: string;
  color: string;          // token warna, bukan gambar berhak cipta
  position: "left" | "right" | "center";
}

export interface StoryLine {
  id: string;
  characterId: string;
  jp: string;
  reading: string;
  romaji: string;
  meaning: string;
  audioId?: string;
  vocab?: string[];
  register?: "standar" | "formal" | "kasual";
}

export interface StoryScene {
  id: string;
  title: string;
  setting: string;
  background: "room" | "street" | "cafe" | "station" | "park";
  lines: StoryLine[];
}

export interface Story {
  id: string;
  level: JLPTLevel;
  title: string;
  titleJp: string;
  summary: string;
  characters: StoryCharacter[];
  scenes: StoryScene[];
  keyPhrases: StoryPhrase[];
  culturalNote?: string;
  minutes: number;
}
```

Konten disimpan di `src/content/stories.ts` (atau `src/content/stories/*.ts`) dengan factory + validator. Tidak ada tabel konten.

### 5.2 Player dan state

```text
StoryPlayer
  ├─ StoryHeader (level, durasi, progres)
  ├─ Stage
  │   ├─ SceneBackground (SVG/CSS)
  │   ├─ CharacterLayer (posisi, active speaker)
  │   └─ SpeechBubble (JpText + reading + translation toggle)
  ├─ Controls (prev/next/play line/auto, keyboard)
  ├─ VocabPanel / KeyPhrases
  └─ Completion / comprehension
```

State minimal: `sceneIndex`, `lineIndex`, `translationOpen`, `playing`, `autoPlay`, `vocabOpen`, `finished`, `saveStatus`.
Tidak perlu state global baru; gunakan `useState`/ref lokal dan `recordLesson` untuk penyelesaian.

### 5.3 Animasi

- Transisi adegan: opacity/translate ringan (200–300 ms); tidak ada video.
- Karakter aktif: highlight/scale kecil; bukan animasi berlebihan.
- `prefers-reduced-motion`: matikan transisi dan auto-advance; tampilkan perubahan langsung.
- Tidak menambah library animasi; gunakan CSS/Web Animations.
- Panggung tidak boleh menggeser layout (CLS); beri aspect-ratio/min-height.

### 5.4 Audio

- Setiap baris dapat memiliki `audioId`; jika tidak ada, TTS Jepang.
- Audio line memakai resolver yang sama dengan Audio Studio.
- Jangan memutar audio otomatis saat baris berubah kecuali pengguna mengaktifkan auto-play audio secara eksplisit.
- Jika audio gagal, teks tetap terbaca; status jelas.

### 5.5 Route dan progres

- `/stories` — hub.
- `/stories/[id]` — player; 4 cerita pada akhir Fase 18.
- Integrasi: tab “Cerita” di `/conversation` dan kartu dasbor; nav “Cerita” ditambahkan hanya jika minimal 3 cerita sudah ada.
- Progres: `LessonProgress` kind `story`, `lessonId` = `story-<id>`, skor pemahaman; XP 15 per penyelesaian pertama.
- Resume baris tidak dipersistensikan lintas sesi pada MVP; `sessionStorage` boleh untuk sesi tab, tetapi bukan sumber kebenaran.

---

## 6. Data model dan persistensi

### 6.1 Perubahan minimal

| Perubahan | Dampak |
| --- | --- |
| `LessonProgressKind` tambah `writing` dan `story` | Tipe + validasi server + label/icon + XP rules; tidak ada tabel |
| `XP_RULES.lesson.writing = 10`, `story = 15` | XP konsisten; bukan klaim final |
| `recordLesson` whitelist | API lesson menerima kind baru |
| Tidak ada tabel/kolom baru | Tidak ada migrasi; data lama aman |
| Tidak ada endpoint baru (wajib) | API lesson yang ada dipakai |

### 6.2 Mengapa tidak langsung membuat tabel

- `lessons` sudah menyimpan `lessonId, kind, score, completedAt`; cukup untuk “selesai + skor terbaik”.
- Per-goresan/attempt dan resume lintas perangkat belum dibutuhkan untuk MVP.
- Menghindari migrasi sebelum ada `schema_version` (SEC-08) dan sebelum kebutuhan analitik terbukti.
- Jika nanti perlu, tambahkan `writing_attempts` dan `story_progress` dengan migrasi bertahap + backup.

### 6.3 Sinkronisasi dan reset

- `recordLesson` tetap memicu snapshot dan XP seperti kind lain.
- Reset/export/import otomatis mencakup baris `lessons` baru; tidak ada perubahan format snapshot.
- Import tidak perlu field baru; data lama tetap valid.
- Jangan menyimpan audio/gambar pengguna di database.

---

## 7. API dan keamanan

### 7.1 API

- Tidak ada endpoint baru untuk audio rekaman/TTS browser; audio adalah aset statis + API browser.
- Writing dan story memakai `POST /api/progress/lesson` yang sudah ada (dengan kind baru).
- Jika TTS lokal opsional diimplementasikan: `POST /api/tts` hanya loopback, same-origin, JSON, body cap, timeout, tanpa logging teks. Ini bukan bagian Fase 15 wajib.
- Semua route baru mengikuti guard lokal yang ada (loopback, Host allowlist, JSON + same-origin untuk mutasi).

### 7.2 CSP dan header

- Tambah `media-src 'self' blob:` untuk audio rekaman/local TTS blob.
- `img-src` tetap `'self' data:`; SVG inline tidak butuh `unsafe-inline` script.
- Tidak ada font/audio/gambar eksternal.
- Jangan melemahkan CSP untuk memudahkan animasi; animasi CSS/Web Animations tidak memerlukan inline script.

### 7.3 Privasi

- Rekaman mikrofon tetap di memori/tab; tidak diunggah.
- Teks yang dikirim ke TTS browser diproses browser; beri disclosure singkat di diagnostik.
- TTS lokal tidak boleh menulis teks ke log atau database.
- Tidak ada analytics pihak ketiga.

---

## 8. Performa

### 8.1 Anggaran

| Area | Target |
| --- | --- |
| Delta JS route audio | ≤ 40 KiB gzip |
| Delta JS route writing | ≤ 50 KiB gzip (canvas/renderer) |
| Data stroke per karakter | ≤ 10 KiB gzip; hanya satu karakter per halaman |
| Delta JS route story | ≤ 60 KiB gzip |
| Audio | dimuat saat diputar; tidak preload semua |
| Permintaan eksternal | 0 |
| Build writing | ukur; jika 259 halaman > 60 dtk atau output > 2×, fallback ke panel detail |

Angka ini target, bukan janji. Ukur dengan build produksi dan resource timing.

### 8.2 Teknik

- Dynamic import untuk player/canvas jika perlu.
- Data stroke per karakter di `public/stroke/<id>.json`; cache immutable.
- Audio `<audio preload="none">`; muat saat play.
- Story content diimpor per cerita, bukan seluruh katalog di setiap halaman.
- Jangan menambahkan library animasi/audio besar; gunakan API browser.
- Jangan memuat seluruh manifest audio di bundle awal jika jumlah aset besar; manifest kecil saat ini, tetapi desain harus siap.

---

## 9. Aksesibilitas

### 9.1 Audio

- `AudioControl` memakai `<button>` nyata, label yang menyebut teks, `aria-pressed`, status live.
- Transcript toggle `aria-expanded`/`aria-controls`.
- Tidak ada autoplay; audio tidak boleh menjadi satu-satunya cara memahami materi.
- Jika tidak ada voice Jepang, pesan harus dapat dibaca screen reader dan tidak hanya warna.

### 9.2 Writing

- Alternatif kanvas: tampilan SVG + tombol “tampilkan goresan” + daftar urutan; latihan dapat diselesaikan tanpa menggambar.
- Fokus terlihat; keyboard dapat memilih goresan berikutnya/memutar animasi.
- Kanvas tidak menangkap scroll halaman tanpa affordance; pointer/touch divalidasi.
- `prefers-reduced-motion` menghentikan animasi otomatis.
- Jangan mengandalkan warna untuk status “sudah dilatih”.

### 9.3 Story

- Subtitle selalu tersedia; terjemahan toggle.
- Perubahan baris diumumkan dengan live region yang sopan; fokus tetap pada kontrol, bukan hilang.
- Nama pembicara dan karakter terbaca; warna bukan satu-satunya pembeda.
- Navigasi keyboard: prev/next/play/translate.
- Reduced motion mematikan transisi/auto-advance.

---

## 10. Pengujian

### 10.1 Unit

- Audio resolver: urutan rekaman → TTS → unavailable; asset hilang; TTS gagal; tidak ada voice Jepang; timeout.
- Manifest: id unik, teks, lisensi, file, hash.
- Stroke: parser menghasilkan urutan kontinu; 259 karakter; viewBox; path tidak kosong; lisensi/atribusi.
- Story: validasi karakter/adegan/baris, ID unik, vocab valid, audioId valid, level.
- Progress: kind writing/story diterima API; nilai lama tetap valid.

### 10.2 Komponen/browser

- AudioControl play/pause/replay/rate/error/unsupported; keyboard; live status.
- Writing: buka karakter, animasi, pause, canvas pointer, self-check, progress reload.
- Story: next/prev, translation, vocab, audio fallback, completion save, reduced motion, mobile 320/390.
- Tidak ada console error; tidak ada horizontal overflow.

### 10.3 Build/QA

- `npm run check`, `npm run build`; route smoke; bundle/resource measurement.
- License/attribution check; no external requests.
- Manual content review untuk cerita dan contoh; tidak ada klaim review ahli tanpa reviewer.

---

## 11. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Voice Jepang tidak tersedia | Audio tampak rusak | Resolver + pesan spesifik + transcript; rekaman opsional |
| KanjiVG berubah/berhenti | Data tidak dapat diregenerasi | Pin commit + hash + simpan salinan JSON; atribusi |
| Lisensi CC BY-SA dilanggar | Masalah hukum/reputasi | `THIRD_PARTY_NOTICES.md`, lisensi, atribusi UI; data turunan tetap CC BY-SA |
| Urutan goresan dianggap “benar” | Klaim berlebihan | Sebut sumber; no auto-grading; review data |
| 259 halaman writing memperlambat build | Build/CI lebih lama | Ukur; fallback satu halaman + panel |
| Audio rekaman tidak ada | Kualitas TTS bervariasi | Fase 15 siapkan manifest; rekaman adalah enhancement, bukan blocker |
| Animasi cerita berlebihan | Distraksi/a11y | Reduced motion; transisi ringan; kontrol manual |
| Cerita tidak lolos review bahasa | Konten tidak akurat | Review internal + validator; jangan klaim production-quality sebelum review |
| Bundle player membesar | Mobile lambat | Code splitting; data per cerita; budget |
| TTS lokal menambah permukaan server | Keamanan | Opsional, loopback, no log, timeout; bukan default |

---

## 12. Keputusan arsitektur yang dicatat

- **ADR-050** — fallback audio berlapis; browser TTS default, rekaman opsional, TTS lokal opsional; tidak ada voice non-Jepang diam-diam.
- **ADR-051** — KanjiVG sebagai sumber stroke, CC BY-SA 3.0, atribusi, data turunan share-alike; tidak ada klaim handwriting recognition.
- **ADR-052** — story player memakai DOM/SVG/CSS/Web Animations, konten-sebagai-kode, tanpa video/CMS.
- **ADR-053** — tidak membangun CMS sekarang; konten tetap typed modules; CMS ditinjau hanya jika editor non-teknis/konten tumbuh.
- **ADR-054** — Fase 14 hanya audit/perencanaan; implementasi fitur dimulai Fase 15 dan tidak mengubah skema pada MVP.

Lihat [DECISIONS.md](DECISIONS.md) untuk konteks lengkap.

---

## 13. Pemetaan ke fase

| Fase | Fokus | Ketergantungan |
| --- | --- | --- |
| 15 | Audio resolver, manifest, AudioControl, studio | Tidak ada |
| 16 | KanjiVG pipeline, writing hub/detail, animasi, canvas | Tidak ada (dapat paralel dengan 15) |
| 17 | Story types, 2 cerita, player statis, audio baris | 15 (audio) |
| 18 | Animasi panggung, 2 cerita lagi, polish | 17 |
| 19 | Integrasi, QA, performa, a11y, docs | 15–18 |

Konten N4 tetap menjadi pekerjaan terpisah setelah fase fitur ini; lihat [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md).
