# Mobile Compatibility Report — Kotoba 言葉

**Versi dokumen:** 1.0  
**Tanggal:** 2026-11-08  
**Fase:** 14B — Mobile Compatibility Audit  
**Target:** aplikasi learner Kotoba v0.1.0 + perbaikan Fase 14B  
**Status:** audit browser teremulasi selesai; **bukan verifikasi perangkat fisik dan bukan klaim kompatibilitas penuh**  
**Dokumen terkait:** [PROJECT_STATUS.md](PROJECT_STATUS.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [CONCERNS_BACKLOG.md](CONCERNS_BACKLOG.md) · [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md)

> **Catatan pasca-Fase 14B (2026-11-09).** Laporan ini adalah snapshot audit Fase 14B. Setelahnya Fase 16 menambahkan `/audio` dan Fase 17 menambahkan `/writing` serta `/writing/[id]`; keduanya tidak termasuk 261 pemuatan di bawah. Fase 17 menguji writing terpisah pada 320/390/1440 px dengan mouse dan sentuhan emulasi CDP, bukan perangkat fisik. CMS dan story theater tetap tidak tersedia. Angka **29 rute, 34 berkas/206 tes, build 94+5+18** adalah snapshot Fase 14B; status terkini ada di [PROJECT_STATUS.md](PROJECT_STATUS.md) (32 rute, 38/227 tes, build 97+6+19).

---

## 1. Ringkasan eksekutif

Audit menguji **29 rute learner Kotoba** pada **9 ukuran viewport** (320–1920 px) dengan Chromium Playwright yang diemulasikan. Total **261 pemuatan halaman**.

| Metrik | Hasil |
| --- | --- |
| HTTP 200 | **261 / 261** |
| Error konsol/page | **0** |
| Halaman dengan overflow horizontal | **0** pada audit final |
| `scrollWidth` dokumen | sama dengan lebar viewport di semua ukuran |
| Route dengan elemen melewati viewport | 10/8/8/8/7/4/3/0/0 — umumnya scroller chip yang disengaja atau glyph dekoratif |
| Target sentuh mentah < 44 px | 143–156 per viewport; mayoritas tautan inline dan checkbox 16 px di dalam label |
| Alur fungsional 390×844 | **18 / 18 langkah lulus**, 0 error |
| Tes otomatis | **34 berkas / 206 tes** lulus |
| Build | **94 halaman statis + 5 rute detail dinamis + 18 route API** |

**Perbaikan utama:** overflow `/progress` di 320–1024 px, pemotongan label/statistik di layar sempit, kartu JLPT 320 px, kontrol tema, transkrip menyimak, dan beberapa target sentuh.

**Yang tidak dapat diaudit:** CMS/admin, kanvas menulis, animasi urutan goresan, dan story theater **tidak ada di repositori ini**. Permukaan tersebut tidak diuji dan tidak boleh disebut kompatibel. Verifikasi ini juga **tidak mencakup perangkat fisik**, iOS Safari, Android Chrome nyata, kamera/file picker asli, audio perangkat, atau pembaca layar.

---

## 2. Lingkup dan batasan

### 2.1 Termasuk

- Dashboard, kurikulum, pelajaran, kana, kosakata, kanji, tata bahasa, bacaan, menyimak, pelafalan, latihan campuran, permainan, ujian, budaya, kamus, kamus pribadi/koleksi, statistik, pengaturan, rencana belajar, mengetik, dan percakapan.
- 29 pola rute learner yang terdaftar di `scripts/verify-ui.cjs` dan audit mobile.
- Tata letak, navigasi mobile (drawer + bottom nav), modal, form, kartu, tabel, kontrol audio, timer ujian, state kosong, dan status error.
- Tema terang dan gelap pada halaman perwakilan.
- Keyboard dan fokus pada drawer, modal, latihan, dan navigasi.

### 2.2 Tidak termasuk / tidak tersedia

| Permukaan | Alasan |
| --- | --- |
| CMS/admin dashboard, listing, editor, media upload, publishing | **Tidak ada route, API, tabel, atau UI CMS di repositori** |
| Kanvas menulis, animasi urutan goresan | Tidak ada saat audit Fase 14B. Sejak Fase 17 fitur ini tersedia, tetapi tidak termasuk 261 pemuatan dan tidak diuji di perangkat fisik. |
| Story theater, karakter, scene, animasi panggung | Fitur baru direncanakan Fase 17–18; belum ada model/player |
| Perangkat fisik iOS/Android | Tidak tersedia dalam sesi ini; hanya emulasi Chromium |
| Kamera/file picker asli | Tidak ada alur unggah media; tidak dapat diuji |
| Screen reader NVDA/VoiceOver/TalkBack | Tidak tersedia; hanya struktur DOM dan keyboard yang diperiksa |
| Firefox/Safari | Tidak dijalankan |

Permintaan menyebut “CMS yang sedang QA”. Di repositori Kotoba **tidak ada proses QA CMS yang berjalan** dan tidak ada CMS. Jika CMS berada di sistem lain, sistem itu di luar cakupan audit ini dan tidak disentuh.

---

## 3. Metode

### 3.1 Perangkat lunak

- Node v24.14.0.
- Chromium Playwright build **1248** di `/home/akihira17/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome`.
- `playwright-core` dari instalasi lokal DSH: `/home/akihira17/.dsh/dsh-kanban-agent/node_modules/playwright-core`.
- Build produksi Next.js 16.4.5, React 19.3, TypeScript 5.9, Tailwind 4.
- Server QA terisolasi di `http://127.0.0.1:3102` dengan `KOTOBA_DB_PATH=.data/kotoba-mobile-qa.db`.

### 3.2 Viewport

| Nama | Ukuran | Kelas perangkat |
| --- | --- | --- |
| 320 | 320×568 | ponsel sangat kecil |
| 360 | 360×740 | Android umum |
| 375 | 375×667 | iPhone SE/8 |
| 390 | 390×844 | iPhone 12–14 |
| 430 | 430×932 | iPhone Pro Max |
| 768 | 768×1024 | tablet portrait |
| 1024 | 1024×768 | tablet landscape / laptop kecil |
| 1366 | 1366×768 | laptop |
| 1920 | 1920×1080 | desktop |

### 3.3 Rute yang diuji (29)

`/`, `/learn`, `/learn/les-kana-hiragana-basic`, `/dictionary`, `/dictionary/collections`, `/pronunciation`, `/kana`, `/vocabulary`, `/kanji`, `/grammar`, `/grammar/g-desu`, `/reading`, `/reading/r-n5-1`, `/listening`, `/listening/l-n5-1`, `/listening/practice`, `/practice`, `/games`, `/exams`, `/exams/session`, `/exams/result`, `/culture`, `/culture/c-tradisi-1`, `/typing`, `/conversation`, `/conversation/conv-salam`, `/plan`, `/progress`, `/settings`.

### 3.4 Yang dicatat per rute

- Status HTTP dan error konsol/page.
- `document.documentElement.scrollWidth` vs `clientWidth`.
- Elemen dengan kotak melewati viewport.
- Elemen dengan teks terpotong (`scrollWidth > clientWidth`).
- Jumlah target sentuh di bawah 44 px (lalu diklasifikasi manual).
- Jumlah dan isi `h1`.

---

## 4. Hasil per viewport

| Viewport | HTTP 200 | Error runtime | Overflow halaman | Halaman dengan elemen melewati viewport | `maxScrollWidth` |
| --- | ---: | ---: | ---: | ---: | ---: |
| 320×568 | 29/29 | 0 | 0 | 10 | 320 |
| 360×740 | 29/29 | 0 | 0 | 8 | 360 |
| 375×667 | 29/29 | 0 | 0 | 8 | 375 |
| 390×844 | 29/29 | 0 | 0 | 8 | 390 |
| 430×932 | 29/29 | 0 | 0 | 7 | 430 |
| 768×1024 | 29/29 | 0 | 0 | 4 | 768 |
| 1024×768 | 29/29 | 0 | 0 | 3 | 1024 |
| 1366×768 | 29/29 | 0 | 0 | 0 | 1366 |
| 1920×1080 | 29/29 | 0 | 0 | 0 | 1920 |

**Catatan penting:** “halaman dengan elemen melewati viewport” bukan berarti halaman dapat digulir horizontal. Elemen tersebut berada di dalam `overflow-x-auto` yang disengaja (chip filter level/kategori) atau merupakan glyph dekoratif yang dipotong oleh container. Tidak ada satu pun yang memperlebar dokumen.

### 4.1 Observasi visual per kelompok

| Kelompok | 320–430 px | 768–1024 px | 1366–1920 px |
| --- | --- | --- | --- |
| Dashboard | Satu kolom, kartu target dan JLPT membungkus; tidak terpotong | Dua/tiga kolom | Grid penuh, sidebar kanan |
| Belajar/kurikulum | Daftar panjang namun dapat digulir; chip level di scroller | Dua kolom modul | Tiga kolom |
| Kana/kanji/kosakata | Kartu satu/dua kolom; filter chip dapat digeser | Grid lebih lebar | Grid penuh |
| Pelajaran/latihan | Prompt, opsi, dan tombol membungkus; fokus soal terlihat | Nyaman | Lebar baca terkendali |
| Ujian | Timer, navigasi soal, dan opsi muat; bottom nav tidak menutupi tombol submit | Panel ringkasan tampil | Panel samping |
| Kamus/modal | Modal hampir penuh layar, konten dapat digulir, tombol tutup terjangkau | Modal terpusat | Modal terpusat |
| Statistik | Kalender/heatmap dapat digulir; kartu metrik satu kolom | Dua kolom | Grid penuh |
| Pengaturan | Segmented tema muat; target dan data belajar satu kolom | Dua kolom | Dua kolom |
| Rencana/mengetik/percakapan | Kartu dan statistik membungkus, tidak terpotong | Grid lebih lebar | Grid penuh |

---

## 5. Temuan dan perbaikan

| ID | Temuan | Tingkat | Dampak | Perbaikan | Status |
| --- | --- | --- | --- | --- | --- |
| M-01 | `/progress` overflow horizontal 394 px pada 320–390 dan 1050 px pada 1024 | **High** | Halaman dapat digulir ke samping; tabel tren terpotong | Grid dasar `minmax(0,1fr)`, `min-w-0` pada anak, kolom kanan 360 px hanya di `lg` | **Selesai** |
| M-02 | `StatTile` memotong label/petunjuk/nilai di kartu sempit | **High** (sistemik) | Statistik tidak terbaca di 320 px | Hapus `truncate`; izinkan wrap | **Selesai** |
| M-03 | Kartu JLPT di dashboard memotong deskriptor level pada 320 px | Medium | Informasi level hilang | Grid 2 kolom, 5 kolom mulai 380 px; teks `leading-tight` | **Selesai** |
| M-04 | Statistik rencana belajar terpotong pada 320 px | Medium | Angka/statistik tidak terbaca | Grid 1/2/4 kolom; judul pelajaran wrap | **Selesai** |
| M-05 | Rekap mengetik terpotong pada 320 px | Medium | Statistik mode/akurasi tidak terbaca | Grid 1/2 kolom | **Selesai** |
| M-06 | Label segmented tema terpotong pada 320 px | Medium | Pilihan “Sistem” tidak jelas | Label “Sistem”, ukuran `sm`, kontrol lebih ringkas | **Selesai** |
| M-07 | Pola dekoratif header kana/menyimak menutupi teks | Medium | Kontras/teks sulit dibaca | Hapus opasitas pola pada header | **Selesai** |
| M-08 | Transkrip menyimak menampilkan ID internal | Medium | Pengguna melihat `l-n5-1-1`, bukan bacaan | Render `line.reading` | **Selesai** (diverifikasi ulang) |
| M-09 | Beberapa tautan/kontrol penting < 24 px | Low–Medium | Sulit disentuh di ponsel | Tinggi minimum 24 px pada “Beralih ke Katakana”, “Semua jenis”, “Ubah target”, slider kecepatan | **Selesai** |
| M-10 | Chip filter di luar layar tanpa affordance jelas | Low | Pengguna mungkin tidak tahu ada pilihan lain | Scroller tetap; dapat digeser; belum ada tombol panah | **Diterima sebagai batasan** |
| M-11 | Target sentuh mentah < 44 px (143–156/viewport) | Low | Sebagian kontrol kecil | Sebagian besar tautan inline/checkbox dalam label; kontrol utama diperbaiki | **Sebagian, sesuai WCAG 2.5.8** |

**Tidak ada temuan Critical.** Temuan High sudah diperbaiki dan diverifikasi ulang pada build final. Tidak dilakukan redesign.

### 5.1 Perubahan file

| File | Perubahan |
| --- | --- |
| `src/app/progress/page.tsx` | Grid `minmax(0,1fr)`, `min-w-0`, kolom kanan hanya `lg` |
| `src/components/ui.tsx` | `StatTile` tidak memotong teks |
| `src/app/plan/page.tsx` | Grid statistik 1/2/4 kolom; judul pelajaran wrap |
| `src/app/typing/page.tsx` | Grid rekap 1/2 kolom |
| `src/app/page.tsx` | Kartu JLPT 2/5 kolom; tanpa truncate |
| `src/app/settings/page.tsx` | Label tema “Sistem”; segmented kecil; slider `min-h-6` |
| `src/app/kana/page.tsx` | Hapus pola header detail; grid dasar; target tombol lebih besar |
| `src/components/listening-player.tsx` | Hapus pola header; transkrip memakai `line.reading` |
| `src/app/practice/page.tsx`, `src/components/goal-progress.tsx` | Tinggi minimum tautan kecil |

---

## 6. Alur fungsional mobile

Dijalankan pada 390×844, sentuhan aktif, build produksi, database QA terisolasi. **18 langkah lulus, 0 error.**

1. Drawer: `aria-expanded=true`, `aria-labelledby`, Escape menutup dan mengembalikan fokus.
2. Pelajaran: tiga langkah “Lanjut”, mulai latihan, enam soal, jawaban benar, “Selesaikan pelajaran”, layar “Kerja bagus”.
3. Kuis kana: modal 12 soal, opsi A–D, periksa jawaban.
4. Kosakata: “Ulasan” kartu 1/8, “Lagi” pindah ke kartu 2, total ulasan bertambah.
5. Tata bahasa: jawaban benar, “Tandai selesai” tersimpan.
6. Bacaan: toggle terjemahan `aria-pressed` berubah, teks “TERJEMAHAN INDONESIA” muncul; jawaban benar.
7. Menyimak: header bersih, transkrip “図書館”, jawaban benar.
8. Latihan: fokus berpindah ke “Soal 1 dari 10”; “Ganti sesi” berfungsi.
9. Permainan: petunjuk menyorot pasangan; klik pasangan dihitung.
10. Ujian: mode latihan 10 soal, submit, hasil 20% (2/10), tidak ada jawaban kosong.
11. Mengetik: lima jawaban salah, hasil 0/5, tombol ulangi.
12. Percakapan: `conv-salam` tiga langkah, selesai, progres tersimpan.
13. Rencana: target N4 + 8 minggu disimpan dan persist setelah reload.
14. Pengaturan: “Gelap” menambah `html.dark`; “Sistem” mengembalikan preferensi.
15. Kamus: modal 黒 menampilkan “KOSAKATA TERKAIT” dan 赤.
16. Statistik: 30 batang tren, detail 8 November (145 XP, 1 menit, 1 ulasan).
17. Navigasi bawah dan judul halaman konsisten.
18. Tidak ada scroll horizontal pada halaman yang diuji.

**Data uji:** snapshot QA berisi XP 145, streak 1, 1 kartu, 4 lesson, 1 review, 1 ujian. Data ini tidak menyentuh database produksi.

---

## 7. CMS/admin — tidak tersedia

Audit mobile CMS **tidak dapat dilakukan**. Repositori tidak memiliki:

- route `/admin`, `/cms`, atau dashboard admin;
- API konten admin;
- tabel konten atau media;
- editor pelajaran/kosakata/kanji/grammar/kuis/ujian/audio/cerita/scene/karakter/dialog;
- unggahan media, file picker, progress upload, preview, draft/publish;
- pengguna/izin CMS.

Konten adalah modul TypeScript bertipe di `src/content`, divalidasi build/test. Keputusan menunda CMS ada di ADR-053. Karena itu:

- **Jangan** menyatakan CMS “mobile-compatible”;
- **Jangan** menyatakan alur upload/publish sudah diuji;
- jika CMS dibangun kelak, audit mobile baru harus mencakup drawer, listing, form satu kolom, file picker kamera/galeri, progress upload, error upload, preview, editor scene berurutan, dan draft/publish.

---

## 8. Menulis dan story theater — tidak tersedia

- Tidak ada kanvas, SVG stroke, animasi urutan goresan, atau halaman `/writing`.
- Tidak ada model cerita/karakter/scene, stage, animasi, atau audio per baris.
- Yang ada hanya 6 skenario percakapan bertipe dan player pilihan ganda; itu **bukan** story theater.

Keduanya tidak dapat diuji pada orientasi portrait/landscape karena belum ada. Jangan mengklaim kompatibilitas mobile untuk fitur yang belum dibangun.

---

## 9. Kompatibilitas browser dan perangkat

| Lingkungan | Status |
| --- | --- |
| Chromium 1248 (Playwright, emulasi) | Diuji; hasil utama laporan ini |
| Chrome desktop | Tidak diuji terpisah |
| Firefox | Tidak diuji |
| Safari desktop | Tidak diuji |
| iOS Safari | **Tidak diuji** |
| Android Chrome fisik | **Tidak diuji** |
| Samsung Internet/Opera | Tidak diuji |
| Screen reader NVDA/JAWS/VoiceOver/TalkBack | **Tidak diuji** |
| Keyboard virtual (Gboard/iOS) | **Tidak diuji** |
| Kamera/file picker asli | Tidak ada alur; tidak diuji |
| Audio perangkat | Tidak diuji; TTS bergantung voice |
| Orientasi landscape ponsel | Tidak diuji terpisah |
| Safe-area notch/home indicator | Tidak diuji pada perangkat nyata |
| Zoom browser 400% | Tidak diuji pada Fase 14B |

Emulasi Chromium tidak menangkap perbedaan rendering font Jepang, keyboard virtual, gesture, safe-area, audio, dan perilaku file picker. Karena itu laporan ini **tidak boleh** dipakai untuk klaim “100% mobile compatible”.

---

## 10. Keterbatasan dan risiko yang tersisa

1. **Perangkat fisik belum diuji.** Hasil hanya berlaku untuk Chromium teremulasi.
2. **iOS Safari belum diuji.** Perilaku viewport, safe-area, dan audio dapat berbeda.
3. **Screen reader belum diuji.** Struktur ARIA dan keyboard diperiksa, tetapi pengalaman nyata belum.
4. **CMS, menulis, dan cerita tidak ada.** Tidak dapat diaudit.
5. **Chip filter horizontal** tetap membutuhkan gestur geser; belum ada tombol panah.
6. **Beberapa target sentuh < 44 px**; WCAG 2.5.8 24 px sebagian besar terpenuhi, tetapi kenyamanan 44 px belum menyeluruh.
7. **TTS tidak selalu tersedia.** Perangkat tanpa voice Jepang tetap tidak dapat memutar audio sampai Fase 15.
8. **Katalog konten masih ikut bundle klien** (~33 KiB gzip di banyak rute); bukan masalah mobile khusus, tetapi memengaruhi waktu muat.
9. **Tidak ada CI E2E/axe.** Audit ini ad hoc, bukan regression suite otomatis.

---

## 11. Bukti dan artefak

- Hasil mentah audit: `.data/mobile-audit.json`, ringkasan `.data/mobile-summary.json`, log `.data/mobile-audit-final.log` (artefak sementara; tidak menjadi sumber kebenaran jangka panjang).
- Skrip audit: `.data/mobile-audit.cjs` (sementara; memakai Chromium/Playwright lokal).
- Skrip alur: `.data/mobile-flows.cjs`; hasil `.data/mobile-flow-results.json`.
- Screenshot: `.screenshots/mobile-audit/` — 44 tangkapan dasar pada 320/390/768/1920, terang/gelap, drawer, modal; ditambah `320-plan-fixed.png`, `320-plan-stats-fixed.png`, `320-settings-fixed.png`, `390-listening-fixed.png`, `390-kana-fixed.png`.
- `npm run check`: 34 berkas / 206 tes, typecheck + ESLint bersih.
- `npm run build`: 94 halaman statis (70 pelajaran) + 5 rute detail dinamis + 18 route API.

**Catatan tentang screenshot full-page:** navigasi bawah yang tetap dapat muncul di tengah gambar adalah artefak pengambilan full-page, bukan bug aplikasi. Modal dengan latar gelap juga dapat terpotong di batas viewport pada screenshot full-page.

---

## 12. Rekomendasi

1. **Sebelum klaim kompatibilitas penuh:** uji iPhone Safari dan Android Chrome fisik, portrait + landscape, dengan keyboard virtual, audio, dan safe-area.
2. **Uji screen reader** pada dashboard, pelajaran, ujian, dan pengaturan.
3. **Audit CMS** hanya setelah CMS benar-benar ada; gunakan checklist drawer, listing, form, file picker, upload, preview, publish.
4. **Audit writing/story** setelah Fase 16–18; fokus pada kanvas, reduced motion, orientasi, dan kontrol audio.
5. **Tambahkan suite E2E mobile ke CI** (Playwright + DB terisolasi) agar regresi layout/error tertangkap.
6. **Pertahankan probe 320 px** dan audit viewport sebagai gate rilis.
7. **Naikkan target sentuh utama** ke 44 px bila layout memungkinkan.
8. **Pertimbangkan tombol panah** pada chip filter horizontal agar affordance lebih jelas.
9. **Selesaikan Audio Studio Fase 15** untuk fallback audio di perangkat tanpa voice Jepang.

---

## 13. Kesimpulan jujur

- **Aplikasi learner yang ada** lulus audit layout pada 29 rute × 9 viewport Chromium teremulasi: 261/261 HTTP 200, 0 error, 0 overflow halaman setelah perbaikan.
- **Alur fungsional utama** pada 390×844 lulus 18 langkah, termasuk ujian, percakapan, mengetik, rencana, kamus, dan statistik.
- **Temuan High** (terutama overflow `/progress` dan pemotongan statistik) sudah diperbaiki dan diverifikasi ulang.
- **CMS/admin, kanvas menulis, dan story theater tidak ada**, sehingga tidak diaudit dan tidak boleh disebut kompatibel.
- **Perangkat fisik, iOS Safari, Android Chrome nyata, kamera/file picker, audio perangkat, dan screen reader belum diuji.**
- Karena itu status yang benar adalah: **mobile-compatible pada Chromium teremulasi untuk permukaan learner yang ada; verifikasi perangkat fisik dan permukaan yang belum dibangun masih tertunda.**

---

## 14. Adendum Fase 17–18 (writing dan story)

Audit utama di atas dilakukan pada Fase 14B, sebelum Writing Studio Fase 17 dan Story Theater Fase 18. Kedua permukaan baru diuji terpisah, bukan bagian dari 261 pemuatan awal.

| Permukaan | Viewport | Hasil | Batas |
| --- | --- | --- | --- |
| `/writing`, `/writing/[id]` | 320, 390, 1440 | Tanpa overflow halaman; kanvas Pointer Events, undo/reset, mode tirukan/mandiri, reduced motion, dark mode | Touch via CDP; stylus fisik, palm rejection, dan tablet nyata belum diuji |
| `/stories`, `/stories/[id]` | 390 (plus desktop pada verifikasi fitur) | Tanpa overflow; teks Jepang terbaca; kontrol audio/opsi kuis tetap dapat dipakai tanpa voice Jepang | Chromium emulasi + mock voice; iOS/Android fisik, screen reader, dan orientasi nyata belum diuji |

Status keseluruhan tidak berubah: **mobile-compatible pada Chromium teremulasi untuk permukaan learner yang ada; verifikasi perangkat fisik, CMS, pipeline video, dan kanvas/stylus nyata masih tertunda.**
