# Roadmap Fitur Pembelajaran Lanjutan — Fase 15–19

**Versi dokumen:** 1.1  
**Tanggal:** 2026-11-08  
**Status:** Rencana awal Fase 14 (historis); **Audio selesai sebagai Fase 16**, Writing/Story belum  
**Dokumen terkait:** [ENHANCED_LEARNING_FEATURES_SPEC.md](ENHANCED_LEARNING_FEATURES_SPEC.md) · [ENHANCED_FEATURES_ARCHITECTURE.md](ENHANCED_FEATURES_ARCHITECTURE.md) · [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md) · [CONCERNS_BACKLOG.md](CONCERNS_BACKLOG.md) · [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md)

> **Status aktual (Fase 16):** Dokumen ini mempertahankan rencana awal Fase 14 beserta penomoran lamanya sebagai catatan historis. Pelaksanaan aktual: **Fase 15 CMS diblokir** (repositori tidak memiliki CMS), **Fase 16 Audio & Pronunciation Studio selesai**, Fase 17 Writing, Fase 18 Story, Fase 19 Animation/polish + Integration/QA. Bagian "Fase 15 — Audio" dan "Fase 16 — Writing" di bawah adalah rencana awal, bukan status saat ini. Status kanonis: [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md). Nomor rute pada bagian historis adalah baseline Fase 14 (29 rute); setelah `/audio` menjadi 30.

---

## 1. Tujuan dan batasan

Tujuan fase 15–19 adalah menambahkan tiga kapabilitas pembelajaran ke Kotoba tanpa mengganti arsitektur yang sudah ada:

1. **Audio & Pronunciation Studio** — audio yang dapat diandalkan, transparan, dan tidak bergantung pada satu voice perangkat.
2. **Handwriting & Stroke Order Studio** — data urutan goresan berlisensi, animasi, latihan menulis, dan progres.
3. **Story & Conversation Animation Player** — cerita pendek dengan karakter, adegan, audio, subtitle Jepang–Indonesia, dan anotasi kosakata.

Batasan yang tidak berubah:

- Tidak ada API berbayar, tidak ada langganan, tidak ada pihak ketiga untuk audio/gambar.
- Tidak ada CMS baru pada fase ini.
- Tidak ada klaim pengenalan tulisan tangan atau penilaian akurasi goresan otomatis.
- Tidak ada migrasi framework, penggantian database, atau perubahan data lama yang merusak.
- Tidak ada deployment publik. Aplikasi tetap single-profile, loopback-only, tanpa auth.
- Server yang sedang berjalan pada `http://127.0.0.1:3100` tidak boleh diganggu oleh pekerjaan dokumentasi/perencanaan.
- Setiap fase harus mempertahankan 29 rute lama dan 18 API yang ada; setelah Fase 16 totalnya 30 pola rute. Regresi harus nol.

---

## 2. Ringkasan fase

| Fase | Fokus | Ketergantungan | Estimasi sesi | Gate utama |
| --- | --- | --- | --- | --- |
| 15 | Audio resolver, manifest, AudioControl, studio | Tidak ada | 3–4 | Audio fallback terbukti di browser tanpa voice Jepang |
| 16 | Data KanjiVG, writing hub/detail, animasi, kanvas | Tidak ada (paralel dengan 15) | 4–6 | 259 karakter terverifikasi, atribusi tampil, build stabil |
| 17 | Tipe cerita, 2 cerita, player dasar, audio baris | 15 | 4–5 | 2 cerita lolos validator + review internal, progress tersimpan |
| 18 | Animasi panggung, multi-karakter, 2 cerita lagi | 17 | 4–5 | 4 cerita, reduced motion, mobile 320/390 tanpa overflow |
| 19 | Integrasi, QA, performa, aksesibilitas, docs | 15–18 | 3–4 | Semua gate sebelumnya + audit regresi |

**Total estimasi:** 18–24 sesi kerja, bergantung pada ketersediaan rekaman audio dan hasil review konten. Angka ini bukan komitmen jadwal; ini alat perencanaan.

**Urutan yang disarankan:** 15 dan 16 dapat dikerjakan paralel karena tidak berbagi file inti (audio vs stroke). 17 menunggu 15 karena audio baris memakai resolver. 18 menunggu 17. 19 menunggu semua.

**Urutan alternatif jika ingin demo lebih cepat:** 15 → 17 → 16 → 18 → 19. Ini menunda writing tetapi memberi cerita lebih awal. Tidak disarankan jika targetnya ketiga fitur setara.

---

## 3. Fase 15 — Audio & Pronunciation Studio

### 3.1 Tujuan

Membuat audio Jepang benar-benar dapat diandalkan dan jujur: memakai rekaman bila ada, TTS Jepang bila tersedia, dan menjelaskan dengan tepat bila tidak ada. Membangun studio yang menyatukan latihan pelafalan, perpustakaan audio, dan diagnostik perangkat.

### 3.2 Deliverable

- `src/lib/audio.ts` (baru) — resolver/tipe/fallback; tetap kompatibel dengan `src/lib/speech.ts`.
- `src/content/audio-manifest.ts` — manifest aset (boleh kosong pada awal fase) + validator.
- `src/components/audio-control.tsx` — kontrol reusable: play/pause/replay/rate/status/transcript.
- `src/components/audio-diagnostics.tsx` — status dukungan, jumlah voice Jepang, aset rekaman, alasan.
- `src/app/pronunciation/page.tsx` — tab Latihan / Perpustakaan / Diagnostik; mempertahankan drill yang ada.
- Pembaruan `SpeechProvider` opsional (priority) tanpa memutus kontrak lama.
- `public/audio/` — hanya jika ada rekaman asli; tidak wajib.
- Tes: resolver, manifest, komponen audio, fallback tanpa voice Jepang, keyboard, status live.
- Dokumentasi: PROJECT_STATUS §2.20, DECISIONS ADR-050, ENHANCED_FEATURES_STATUS, CHANGELOG.

### 3.3 Checklist

- [ ] Resolver memilih rekaman → TTS Jepang → TTS lokal (jika ada) → tidak tersedia.
- [ ] Tidak pernah memakai voice non-Jepang secara diam-diam.
- [ ] Manifest memvalidasi file, id, teks, lisensi, hash; gagal build/test jika tidak valid.
- [ ] AudioControl memiliki state loading/playing/error/unavailable dan label aksesibel.
- [ ] Studio menampilkan drill 17 yang ada, normal/lambat, rekaman mikrofon (tetap lokal), self-check.
- [ ] Diagnostik menjelaskan penyebab “tidak ada audio” secara spesifik.
- [ ] Semua pemanggil `SpeakButton` memakai jalur audio yang sama.
- [ ] Tidak ada permintaan jaringan eksternal; CSP `media-src` diperbarui.
- [ ] Mobile 320/390: tidak overflow; kontrol ≥ 44 px.
- [ ] `npm run check` dan `npm run build` lulus; 29 rute lama tetap 200.
- [ ] Tidak ada perubahan skema/tabel/endpoint.

### 3.4 Gate penerimaan

1. Di Chromium tanpa voice Jepang, halaman menampilkan pesan spesifik dan transcript; tidak ada error konsol.
2. Dengan voice Jepang simulasi/tersedia, audio diputar dan status selesai dilaporkan.
3. Jika rekaman contoh ditambahkan, resolver memilih rekaman dan TTS tidak dipanggil.
4. Keyboard: Tab mencapai semua kontrol; Space/Enter memutar; Escape tidak merusak fokus.
5. Semua tes lulus; build 94 static + 5 dynamic + 18 API (atau angka terbaru yang setara).

### 3.5 Risiko khusus

- Kualitas TTS bervariasi; jangan menjanjikan kualitas native.
- Rekaman audio asli mungkin tidak tersedia; studio harus tetap berguna tanpa rekaman.
- Open JTalk tidak wajib; jangan menunda fase karena mesin lokal belum siap.

---

## 4. Fase 16 — Handwriting & Stroke Order Studio

### 4.1 Tujuan

Menyediakan data urutan goresan yang dapat dilacak untuk 259 karakter, animasi yang dapat dipause, latihan menulis dengan umpan balik mandiri, dan progres — tanpa klaim penilaian otomatis.

### 4.2 Deliverable

- `scripts/import-kanjivg.mjs` (atau .py) — importer offline, pin commit, verifikasi, hash.
- `public/stroke/<id>.json` — data per karakter (259 file) atau `src/content/stroke/`.
- `src/lib/stroke.ts` — tipe/loader/validator/urutan.
- `THIRD_PARTY_NOTICES.md`, `public/licenses/kanjivg-CC-BY-SA-3.0.txt`, atribusi UI.
- `src/components/stroke-player.tsx` — SVG animasi, pause/replay, nomor, reduced motion.
- `src/components/writing-canvas.tsx` — kanvas latihan, undo/clear, panduan, self-check.
- `src/app/writing/page.tsx` dan `src/app/writing/[id]/page.tsx` (atau satu halaman + panel jika build terlalu besar).
- `LessonProgressKind` + `writing`; label/icon/XP 10; API lesson.
- Tes: parser 259 karakter, path/urutan, lisensi, komponen, progres.
- Dokumentasi: ADR-051, status, changelog.

### 4.3 Checklist

- [ ] Cakupan 111/111 kanji dan 208/208 kana (semua komponen) terverifikasi oleh skrip, bukan asumsi.
- [ ] Setiap file minimal punya satu path; urutan `1..n` tanpa lompatan; viewBox `0 0 109 109`.
- [ ] Importer deterministik; commit dan hash tercatat.
- [ ] Atribusi KanjiVG + CC BY-SA 3.0 tampil di halaman dan notices.
- [ ] Yōon ditampilkan sebagai dua komponen; tidak ada glyph gabungan palsu.
- [ ] Animasi dapat dipause, dimajukan, diulang; reduced motion menonaktifkan animasi otomatis.
- [ ] Kanvas menerima pointer/touch, tidak menangkap scroll tanpa affordance; ada alternatif non-kanvas.
- [ ] Self-check menyimpan progres per karakter; skor tidak diklaim sebagai akurasi goresan.
- [ ] Mobile 320/390 tidak overflow; panggung SVG diskalakan.
- [ ] Build: ukur jumlah halaman; jika 259 halaman gagal gate waktu/ukuran, gunakan satu halaman + panel detail.
- [ ] `npm run check`/build lulus; rute lama tetap 200.

### 4.4 Gate penerimaan

1. Membuka 日 menampilkan 4 goresan berurutan; あ menampilkan urutan yang sama setiap muat.
2. Pause/replay berfungsi; reduced motion menampilkan goresan tanpa animasi.
3. Menyelesaikan latihan satu karakter menyimpan baris `lessons` kind writing; reload mempertahankan skor.
4. 259 karakter dapat dimuat tanpa 404; validator gagal jika file hilang.
5. Atribusi/lisensi ada; tidak ada klaim “handwriting recognition”.

### 4.5 Risiko khusus

- Kualitas path KanjiVG bervariasi; review sampel manual diperlukan, bukan hanya otomatis.
- Build 259 halaman dapat memperlambat CI; siapkan fallback.
- Lisensi share-alike membatasi distribusi data turunan; dokumentasikan.

---

## 5. Fase 17 — Story & Conversation Animation Player (fondasi)

### 5.1 Tujuan

Membangun model cerita, dua cerita orisinal, dan player yang berfungsi penuh dengan audio baris, subtitle Jepang, terjemahan Indonesia, anotasi kosakata, dan progres — tanpa animasi panggung kompleks.

### 5.2 Deliverable

- Tipe `Story`, `StoryCharacter`, `StoryScene`, `StoryLine` di `src/lib/types.ts`.
- `src/content/stories.ts` — 2 cerita orisinal (N5, N4), 2–3 karakter, 3–4 adegan.
- `src/lib/story.ts` — validator/helper/progres.
- `src/components/story-player.tsx`, `story-stage.tsx`, `story-line.tsx`.
- `src/app/stories/page.tsx`, `src/app/stories/[id]/page.tsx`.
- Integrasi audio (Fase 15); vocab memakai `VOCAB_BY_ID`; furigana memakai helper yang ada.
- `LessonProgressKind` + `story`; XP 15; API lesson.
- Tes: validasi cerita, player, audio fallback, progres, keyboard.
- Dokumentasi: ADR-052, status, changelog.

### 5.3 Checklist

- [ ] Setiap baris memiliki penutur valid, teks Jepang, reading, romaji, arti Indonesia.
- [ ] Setiap cerita memiliki ≥ 2 karakter dan ≥ 3 adegan; ID unik.
- [ ] Audio per baris memakai resolver; jika gagal, teks tetap terbaca dan status jelas.
- [ ] Terjemahan dapat disembunyikan/ditampilkan; furigana mengikuti setting.
- [ ] Kosakata anotasi menunjuk ID yang valid di `VOCAB_BY_ID`.
- [ ] Navigasi prev/next/play/translate dengan keyboard; fokus tidak hilang.
- [ ] Reduced motion tidak mematikan konten; hanya transisi.
- [ ] Menyelesaikan cerita menyimpan `lessons` kind story; skor pemahaman opsional.
- [ ] Mobile 320/390 tidak overflow.
- [ ] Tidak ada tabel/endpoint baru; 29 rute lama tetap.

### 5.4 Gate penerimaan

1. Dua cerita dapat dibaca dari awal sampai selesai; audio baris diputar/dihentikan.
2. Progress muncul di hub setelah reload; XP diberikan sekali.
3. Cerita lolos validator dan review internal (bukan klaim native-speaker).
4. Tidak ada console error; keyboard dan screen reader dasar berfungsi.

### 5.5 Risiko khusus

- Konten cerita membutuhkan waktu penulisan dan review; jangan mengorbankan akurasi demi jumlah.
- Audio baris dapat memperbanyak permintaan; muat sesuai interaksi.
- Tanpa animasi, fase ini mungkin terasa “belum selesai”; komunikasikan bahwa 18 menambah polish.

---

## 6. Fase 18 — Panggung animasi dan multi-karakter

### 6.1 Tujuan

Membuat cerita terasa hidup tanpa video: panggung SVG/CSS, transisi adegan, highlight pembicara, dua cerita tambahan, dan polish aksesibilitas/performa.

### 6.2 Deliverable

- `src/components/story-stage.tsx` ditingkatkan: background SVG/CSS per setting, karakter, highlight aktif.
- Transisi Web Animations/CSS; reduced motion; tanpa layout shift.
- 2 cerita lagi (total 4), minimal satu N4.
- Integrasi hub: `/stories` di nav atau tab `/conversation`; kartu dasbor.
- Tes visual/regresi terbatas; perf budget cerita.
- Dokumentasi: ADR-052 update, status, changelog.

### 6.3 Checklist

- [ ] 4 cerita, total ≥ 12 adegan, ≥ 8 karakter unik.
- [ ] Panggung tidak menyebabkan overflow 320/390; aspect-ratio stabil.
- [ ] Transisi 200–300 ms; reduced motion menonaktifkan.
- [ ] Pembicara aktif ditandai dengan lebih dari warna (label/opacity/posisi).
- [ ] Audio tidak autoplay kecuali diaktifkan.
- [ ] Semua cerita lolos validator; tidak ada ID vocab/audio yang hilang.
- [ ] Bundle cerita ≤ budget; tidak ada permintaan eksternal.
- [ ] Regresi 29 rute lama nol.

### 6.4 Gate penerimaan

1. Empat cerita dapat diselesaikan; dua dengan panggung penuh.
2. Reduced motion dan keyboard lulus uji manual.
3. Mobile tidak overflow; tidak ada console error.
4. Perf: delta JS route story ≤ 60 KiB gzip atau justifikasi terukur.

### 6.5 Risiko khusus

- Animasi berlebihan mengganggu belajar; batasi.
- Ilustrasi asli membutuhkan waktu; gunakan bentuk SVG sederhana, bukan aset berhak cipta.
- Menambah nav dapat membingungkan; gunakan tab jika cerita < 3.

---

## 7. Fase 19 — Integrasi, QA, dan kesiapan rilis

### 7.1 Tujuan

Menyatukan ketiga fitur ke pengalaman aplikasi, menutup regresi, mengukur performa/aksesibilitas, dan memperbarui dokumentasi sehingga fitur dapat dianggap selesai secara lokal.

### 7.2 Deliverable

- Integrasi dasbor: kartu “Audio”, “Menulis”, “Cerita” bila relevan; rekomendasi mempertimbangkan progres baru.
- Navigasi final (maksimal 16 item) dan hub silang.
- E2E/Playwright untuk audio fallback, writing, story, progres.
- Audit a11y (axe/manual), 320/390, dark/light, reduced motion.
- Audit performa build/resource; perbaikan jika melewati budget.
- Review konten: audio scripts, stroke sample, cerita, terjemahan.
- Docs: PROJECT_STATUS, ARCHITECTURE, DATA_MODEL, DECISIONS, README, FEATURE_ROADMAP, CONCERNS_BACKLOG, CHANGELOG.
- Release candidate lokal; tidak deploy publik.

### 7.3 Checklist

- [ ] Semua gate fase 15–18 terpenuhi.
- [ ] 29 rute lama + rute baru 200; tidak ada console error.
- [ ] `npm run check`, build, verify-ui lulus.
- [ ] Tidak ada permintaan eksternal; CSP ketat.
- [ ] Semua aset memiliki lisensi/atribusi.
- [ ] Tidak ada klaim yang tidak terverifikasi di UI/docs.
- [ ] Backup DB dibuat sebelum perubahan data; restore diuji.
- [ ] Docs final dan konsisten; concern backlog diperbarui.
- [ ] Laporan akhir dengan limitation jujur.

### 7.4 Gate penerimaan

1. Pengguna dapat belajar audio, menulis, dan cerita dari UI tanpa membaca dokumentasi teknis.
2. Semua fitur baru dapat diselesaikan dan progres bertahan setelah reload.
3. Aksesibilitas dasar dan mobile lulus; tidak ada regresi.
4. Dokumen menyatakan dengan jelas apa yang belum: rekaman native, handwriting recognition, CMS, auth, deploy publik.

---

## 8. Dependensi dan paralelisasi

```text
Fase 15 (Audio)
   └── Fase 17 (Story foundation)
          └── Fase 18 (Animation + 2 stories)
                 └── Fase 19 (Integration/QA)

Fase 16 (Writing) ──────────────────┘
```

- 15 dan 16 tidak berbagi file inti; dapat paralel.
- 17 membutuhkan resolver audio dari 15.
- 18 membutuhkan model/player dari 17.
- 19 membutuhkan semua.
- Jangan memulai 17 sebelum 15 stabil; jika audio belum siap, 17 dapat memakai TTS lama sementara, tetapi harus ada rencana migrasi ke resolver.

---

## 9. Gate kualitas lintas fase

Setiap fase wajib:

1. `npm run check` (typecheck, ESLint, Vitest) lulus.
2. `npm run build` lulus; jumlah halaman/route dilaporkan.
3. `scripts/verify-ui.cjs` (atau pengganti) 29 rute lama 200, 0 error.
4. Tidak ada permintaan jaringan eksternal baru.
5. Tidak ada perubahan destruktif pada DB; backup jika ada perubahan data.
6. Docs diperbarui: status, keputusan, batasan.
7. Tidak ada klaim “selesai” jika tes/gate belum lulus.

---

## 10. Rollback dan feature flag

- Tidak ada flag global yang rumit. Jika fitur bermasalah, route baru dapat disembunyikan dari nav, tetapi kode tetap ada.
- Perubahan tipe `LessonProgressKind` aditif; data lama tetap valid. Rollback kode tidak menghapus baris `lessons` baru; baris itu diabaikan UI lama.
- Aset audio/stroke bersifat statis; menghapusnya tidak merusak data progres.
- Jangan menghapus/mereset DB saat rollback.
- Untuk TTS lokal opsional, gunakan env `KOTOBA_TTS_MODE`; default `browser`. Jangan mengaktifkan default tanpa evaluasi lisensi voice.

---

## 11. Di luar cakupan (fase 15–19)

- CMS/admin panel.
- Auth, multi-user, sinkronisasi cloud.
- Deployment publik/TLS.
- Pengenalan tulisan tangan otomatis.
- Skor pengucapan akustik.
- Video/animasi karakter kompleks.
- Rekaman suara native profesional (boleh ditambahkan jika tersedia, bukan blocker).
- Konten N4 lengkap (tetap prioritas terpisah di FEATURE_ROADMAP).
- Terjemahan bahasa selain Indonesia.
- API berbayar.

---

## 12. Definisi selesai

Fase 15–19 dianggap selesai secara lokal jika:

- Ketiga fitur dapat diakses dari UI, digunakan, dan progresnya tersimpan.
- Data stroke berlisensi dan terverifikasi; audio memiliki fallback yang jelas.
- 4 cerita orisinal dengan audio/TTS, subtitle, terjemahan, dan kosakata.
- Semua gate tes/build/route/a11y/perf terpenuhi atau limitationnya didokumentasikan.
- Dokumentasi dan concern backlog mencerminkan keadaan sebenarnya.
- Tidak ada klaim bahwa aplikasi siap deploy publik tanpa auth/TLS.

---

## 13. Rekomendasi urutan kerja

1. **Fase 15** — mulai dari resolver + manifest + kontrol; tambahkan diagnostik; baru polish studio. Ini memberi fondasi untuk cerita.
2. **Fase 16** — mulai dari importer + verifikasi 259 karakter; baru renderer; kanvas terakhir. Jangan menulis UI sebelum data terbukti.
3. **Fase 17** — mulai dari tipe + validator + satu cerita; player minimal; baru cerita kedua dan audio.
4. **Fase 18** — mulai dari reduced motion + layout panggung; baru animasi; tambah cerita setelah panggung stabil.
5. **Fase 19** — audit regresi lebih dulu, lalu integrasi, lalu docs.

Jika waktu terbatas, prioritas nilai belajar: **15 (audio) → 17 (cerita) → 16 (menulis) → 18 → 19**. Namun urutan ini menunda fitur yang secara eksplisit diminta; keputusan harus disetujui sebelum mulai.
