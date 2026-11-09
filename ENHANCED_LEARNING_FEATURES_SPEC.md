# Spesifikasi Fitur Pembelajaran Lanjutan — Kotoba 言葉

**Versi dokumen:** 1.1  
**Tanggal:** 2026-11-08  
**Status:** Rencana Fase 14 (historis); **Audio diimplementasikan pada Fase 16**, Writing/Story belum, CMS diblokir  
**Cakupan:** Audio & Pronunciation Studio, Handwriting & Stroke Order Studio, Story & Conversation Animation Player  
**Dokumen terkait:** [ENHANCED_FEATURES_ARCHITECTURE.md](ENHANCED_FEATURES_ARCHITECTURE.md) · [ENHANCED_FEATURES_ROADMAP.md](ENHANCED_FEATURES_ROADMAP.md) · [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md) · [CONCERNS_BACKLOG.md](CONCERNS_BACKLOG.md)

> **Status aktual (Fase 16):** Dokumen ini mempertahankan rencana awal Fase 14 beserta penomoran lamanya sebagai catatan historis. Pelaksanaan aktual: **Fase 15 CMS diblokir** (repositori tidak memiliki CMS), **Fase 16 Audio & Pronunciation Studio selesai**, Fase 17 Writing, Fase 18 Story, Fase 19 Animation/polish + Integration/QA. Bagian "Fase 15 — Audio" dan "Fase 16 — Writing" di bawah adalah rencana awal, bukan status saat ini. Status kanonis: [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md). Nomor rute pada bagian historis adalah baseline Fase 14 (29 rute); setelah `/audio` menjadi 30.

---

## 1. Ringkasan eksekutif

Kotoba sudah memiliki aplikasi belajar Jepang–Indonesia yang berjalan: 30 pola rute pengguna (termasuk `/audio` sejak Fase 16), 18 route API, 13 tabel SQLite, 208 kana, 214 kosakata, 111 kanji, 45 pola tata bahasa, 12 bacaan, 12 dialog menyimak, 33 artikel budaya, 28 latihan susun kalimat, 6 skenario percakapan, dan 17 latihan pelafalan. Fase 12–13 menutup audit keamanan lokal, koreksi konten, aksesibilitas, performa, dan quality gate. Aplikasi **bukan** prototipe tampilan.

Fase 14 adalah fase **audit dan perencanaan**, bukan fase implementasi besar. Tiga kemampuan baru dirancang sebagai perluasan:

1. **Audio & Pronunciation Studio** — audio Jepang yang dapat diputar konsisten, dengan fallback yang jujur ketika perangkat tidak memiliki voice Jepang.
2. **Handwriting & Stroke Order Studio** — demonstrasi urutan goresan dan latihan menulis kana/kanji dengan data stroke yang terverifikasi.
3. **Story & Conversation Animation Player** — cerita pendek orisinal dengan beberapa karakter, adegan, subtitle Jepang, terjemahan Indonesia, anotasi kosakata, dan audio.

Prinsip utama: **jangan merusak fitur yang sudah ada**, jangan mengganti arsitektur, jangan menambah layanan berbayar, dan jangan mengklaim kemampuan yang belum benar-benar diuji.

---

## 2. Temuan audit sistem yang ada

### 2.1 Yang sudah ada dan dapat dipakai ulang

| Area | Kondisi saat ini | Reuse untuk fitur baru |
| --- | --- | --- |
| Shell & navigasi | 14 navigasi utama setelah Fase 16 (`/audio`), AppShell, tema terang/gelap, responsif | Semua halaman baru memakai shell, PageHeader, Card, Button, Modal, Badge |
| Audio TTS | `src/lib/speech.ts`: provider `browser-synthesis`, `speak`, `speakDetailed`, `useSpeech`, `registerSpeechProvider` | Jadikan dasar fallback audio; jangan menulis ulang pemanggilan TTS di setiap halaman |
| Tombol audio | `SpeakButton` di `src/components/japanese.tsx`, rate normal/lambat, toast kegagalan | Ganti/dorong ke `AudioControl` yang lebih kaya; pertahankan label aksesibel |
| Pelafalan | `/pronunciation`: 17 drill, MediaRecorder 30 detik, self-check, ASR opsional berbasis teks | Studio audio memperluas halaman ini; rekaman tetap lokal, tidak diunggah |
| Menyimak | 12 dialog, 15 drill, transcript, normal/lambat, per-line audio | Pola audio, transcript, dan status dapat dipakai untuk cerita |
| Kana/kanji | 208 kana, 111 kanji, kartu, kuis, mastery | Writing Studio memakai katalog dan progres yang sama |
| Bacaan/percakapan | 12 bacaan, 6 skenario percakapan bertipe, model `ConversationScenario` | Model cerita baru dapat memakai pola `JpText`, furigana, kosakata, dan latihan |
| Progres | `LessonProgress` + API `/api/progress/lesson`; 12 kind saat ini | Tambah kind `writing` dan `story`; tidak perlu tabel baru untuk MVP |
| Kamus | 370 entri, kosakata terkait, kanji beradikal sama | Anotasi kosakata cerita dapat menautkan kamus |
| Lisensi/aset | `public/` hanya favicon dan manifest; tidak ada audio/gambar/stroke | Tidak ada aset media yang harus dimigrasikan; semua aset baru harus punya lisensi |

### 2.2 Yang tidak ada

- CMS/admin UI, route admin, API konten, atau tabel konten. **Konten adalah kode TypeScript** di `src/content/`.
- Audio statis, rekaman penutur asli, manifest audio, atau fallback audio yang di-host sendiri.
- Data urutan goresan, SVG stroke, canvas menulis, atau validasi tulisan.
- Model cerita, karakter, adegan, latar, animasi panggung, atau player cerita.
- Asset pipeline untuk media, verifikasi lisensi aset, atau hash aset.
- Tabel khusus writing/story. Progres menulis/cerita belum ada.
- Pengujian audio nyata di CI; CI hanya check/build/audit.

### 2.3 Mengapa menu audio menampilkan “no audio”

Gejala yang terlihat: di `/settings`, kartu audio menampilkan “Belum ada voice Jepang…” dan tombol uji tidak menghasilkan suara. Ini **bukan** karena CMS, field konten, atau tombol yang belum dibuat.

Bukti yang diambil pada lingkungan audit (Chromium headless, produksi `127.0.0.1:3100`):

| Pemeriksaan | Hasil |
| --- | --- |
| `'speechSynthesis' in window` | `true` |
| `speechSynthesis.getVoices().length` saat awal | `0` |
| Setelah 1.200 ms | `0` |
| Voice dengan `lang` diawali `ja` | `0` |
| Pesan UI | “Belum ada voice Jepang…” (sesuai kondisi) |
| Kode pemutaran | Ada dan berfungsi: `speakDetailed`, timeout, error, toast |
| Aset audio di `public/` | Tidak ada |

Kesimpulan: **Web Speech API didukung, tetapi lingkungan tersebut tidak memiliki voice Jepang, dan aplikasi belum memiliki audio statis sebagai fallback.** Di perangkat dengan voice Jepang, tombol audio dapat berbicara. Di lingkungan tanpa voice Jepang, aplikasi dengan benar memberi tahu pengguna; ia tidak diam-diam memakai voice non-Jepang. Masalah sebenarnya adalah:

1. ketersediaan voice bergantung perangkat/browser;
2. tidak ada jalur audio statis/rekaman;
3. tidak ada diagnostik yang membedakan “tidak didukung” dari “didukung tetapi tidak ada voice Jepang”;
4. tidak ada kontrol audio terpadu untuk memutar ulang, mengatur kecepatan, dan menampilkan transcript.

**Bukan penyebab:** field CMS yang hilang, endpoint audio yang belum ada, atau implementasi playback yang belum ditulis. Tidak ada CMS di repositori ini.

> Catatan penting: permintaan Fase 14 menyebut “CMS sedang QA”. Repositori Kotoba tidak memiliki CMS/admin. Yang ada adalah konten-sebagai-kode dan proses QA aplikasi. Tidak ditemukan proses QA yang sedang berjalan, dan server produksi lokal tidak dihentikan oleh fase ini. Jika “CMS” merujuk sistem eksternal di luar repositori, sistem itu tidak dapat diaudit dari sini dan tidak boleh diasumsikan sebagai dependensi.

---

## 3. Tujuan produk dan non-tujuan

### 3.1 Tujuan

- Memberi pengalaman audio Jepang yang **konsisten dan jujur** di perangkat yang berbeda.
- Mengajarkan **bentuk, arah, dan urutan goresan** dengan data yang dapat dilacak sumbernya.
- Menghubungkan membaca, mendengar, menulis, dan berbicara dalam alur belajar yang koheren.
- Menambah **cerita pendek orisinal** yang melatih pemahaman konteks, bukan sekadar kalimat lepas.
- Mempertahankan arsitektur, performa, aksesibilitas, dan keamanan lokal yang sudah ada.
- Menjaga lisensi dan atribusi aset pihak ketiga.

### 3.2 Non-tujuan

- Bukan pengganti desain ulang aplikasi.
- Bukan CMS baru atau editor konten visual.
- Bukan layanan cloud, akun, sinkronisasi, atau pembelajaran berbasis AI generatif.
- Bukan penilaian akustik pelafalan atau pengenalan tulisan tangan otomatis.
- Bukan video player atau animasi seperti anime produksi.
- Bukan klaim kesiapan JLPT resmi.
- Bukan penambahan 50–60 pelajaran N4 dalam fase ini; konten N4 tetap backlog terpisah.

---

## 4. Feature A — Audio & Pronunciation Studio

### 4.1 Masalah pengguna

- “Saya menekan tombol audio tetapi tidak ada suara; saya tidak tahu apakah browser saya tidak mendukung, voice Jepang tidak terpasang, atau audio sedang gagal.”
- “Saya ingin mendengar kalimat yang sama dengan kecepatan normal dan lambat, lalu mengulang bagian tertentu.”
- “Saya ingin melihat teks yang dibacakan, bukan hanya mendengar.”
- “Saya ingin latihan pelafalan dan menyimak memakai kontrol audio yang sama.”

### 4.2 Ruang lingkup

Studio memperluas `/pronunciation` yang sudah ada, bukan membuat halaman audio terpisah yang menduplikasi. Tiga tab:

1. **Latihan** — 17 drill yang sudah ada: dengar normal/lambat, rekam lokal, self-check, ASR opsional.
2. **Perpustakaan** — kumpulan frasa pendek terkurasi (dari konten yang sudah ada) dengan transcript, terjemahan, dan audio; pencarian/filter level.
3. **Diagnostik** — status dukungan browser, jumlah voice Jepang, sumber audio yang tersedia (rekaman/TTS), tes suara, dan penjelasan kegagalan.

### 4.3 Kebutuhan fungsional

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| AUD-01 | Semua pemutaran audio memakai satu resolver: rekaman (jika ada) → TTS Jepang → status tidak tersedia. Tidak ada fallback diam-diam ke voice non-Jepang. | P0 |
| AUD-02 | `AudioControl` reusable: play/pause, replay, normal/lambat, status loading/playing/error, transcript opsional. | P0 |
| AUD-03 | Jika tidak ada voice Jepang dan tidak ada rekaman, tampilkan pesan spesifik + saran (pasang voice Jepang, gunakan teks/transcript), bukan tombol mati tanpa alasan. | P0 |
| AUD-04 | Pengaturan kecepatan memakai `speechRate` yang sudah ada; tombol lambat memakai 0.65. Tidak menambah setting baru tanpa kebutuhan. | P1 |
| AUD-05 | Rekaman mikrofon tetap lokal, maksimum 30 detik, berhenti otomatis, tidak diunggah; izin diminta hanya setelah aksi eksplisit. | P0 |
| AUD-06 | Perpustakaan audio menampilkan sumber/lisensi setiap aset dan menandai mana yang TTS vs rekaman. | P1 |
| AUD-07 | Diagnostik dapat menyalin ringkasan status untuk troubleshooting tanpa mengirim data ke server. | P2 |
| AUD-08 | Semua kontrol dapat dioperasikan keyboard; status dibacakan screen reader; hormati `prefers-reduced-motion` untuk animasi gelombang/indikator. | P0 |

### 4.4 Perilaku fallback

```text
request(text, audioId?)
  ├─ audioId ada dan aset rekaman valid?  → putar rekaman
  ├─ browser punya voice ja-JP?           → SpeechSynthesis
  ├─ provider TTS lokal dikonfigurasi?    → coba provider lokal (opsional)
  └─ tidak ada                          → tampilkan status + transcript
```

Aturan:

- Jangan memutar voice non-Jepang untuk teks Jepang; itu menyesatkan pembelajaran.
- Jangan mengklaim “audio tersedia” hanya karena `speechSynthesis` ada.
- Jangan autoplay; semua audio dimulai dari gestur pengguna.
- Jika sebuah rekaman gagal dimuat, coba TTS Jepang; jika TTS gagal, tampilkan error yang dapat ditindaklanjuti.
- Timeout tetap ada; audio yang menggantung tidak boleh mengunci UI.

### 4.5 Kriteria penerimaan

- Di lingkungan tanpa voice Jepang: UI menampilkan alasan spesifik; tidak ada error konsol; tidak ada suara non-Jepang.
- Di lingkungan dengan voice Jepang: play/pause/replay/normal/lambat berfungsi; transcript dan status benar.
- Tombol audio di halaman lain memakai kontrol/resolver yang sama; tidak ada duplikasi logika pemutaran.
- Rekaman 30 detik dibersihkan setelah selesai; tidak ada unggahan jaringan.
- Tes unit untuk resolusi fallback, manifest, dan pesan kegagalan; tes browser untuk status UI.

---

## 5. Feature B — Handwriting & Stroke Order Studio

### 5.1 Masalah pengguna

- “Saya bisa membaca kana, tetapi tidak tahu harus mulai dari mana saat menulis.”
- “Saya menulis kanji dari ingatan, tetapi bentuk dan urutannya salah.”
- “Saya ingin melihat animasi goresan, lalu mencoba sendiri.”

### 5.2 Ruang lingkup

- Kana: 208 entri (termasuk dakuten, handakuten, yōon).
- Kanji: 111 entri yang sudah ada.
- Dua mode: **Lihat** (animasi urutan goresan, nomor, arah) dan **Latihan** (kanvas tracing dengan panduan, penilaian mandiri).
- Progres per karakter disimpan sebagai `LessonProgress` kind `writing`; bukan tabel baru pada MVP.
- Tidak ada pengenalan tulisan tangan otomatis; tidak ada klaim “benar/salah” dari bentuk goresan.
- Yōon ditampilkan sebagai dua kana komponen; tidak dibuat glyph tunggal palsu.

### 5.3 Sumber data dan lisensi

- **KanjiVG** adalah sumber SVG urutan goresan. Lisensi **CC BY-SA 3.0**, atribusi Ulrich Apel/KanjiVG.
- Audit Fase 14 memverifikasi pohon KanjiVG pada commit `610091ce618cf757ed1357a8954cd65283e015d6`:
  - 111/111 kanji aplikasi memiliki SVG;
  - 208/208 entri kana aplikasi memiliki SVG untuk setiap karakter komponen;
  - total 259 karakter unik, 0 file hilang;
  - total ukuran SVG mentah sekitar 690.664 byte (rata-rata 2.667 byte/karakter).
- Data yang diadaptasi (JSON path, metadata) tetap berada di bawah CC BY-SA 3.0; atribusi dan tautan lisensi wajib terlihat di UI/dokumen `THIRD_PARTY_NOTICES.md`.
- Jangan mencampur data stroke dengan aset proprietary atau menghapus atribusi.

### 5.4 Kebutuhan fungsional

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| WRT-01 | Halaman `/writing` menampilkan kana/kanji, filter level/jenis, dan progres. | P0 |
| WRT-02 | Detail karakter menampilkan SVG, jumlah goresan, radical (kanji), on/kun, arti, contoh, dan sumber lisensi. | P0 |
| WRT-03 | Animasi urutan goresan: path digambar berurutan, nomor goresan opsional, kontrol putar/ulang/pause, kecepatan. | P0 |
| WRT-04 | Mode latihan: outline karakter, goresan panduan berikutnya, kanvas pointer/touch, tombol hapus/ulang, self-check “sudah sesuai?”. | P0 |
| WRT-05 | Tidak ada penilaian otomatis bentuk; skor adalah self-assessment atau coverage goresan yang ditandai pengguna. | P0 |
| WRT-06 | Progres per karakter (selesai, skor terbaik, terakhir dilatih) disimpan melalui API lesson; tidak ada tabel baru. | P1 |
| WRT-07 | Yōon: tampilkan dua komponen dan latihan terpisah; jelaskan bahwa keduanya ditulis berurutan. | P0 |
| WRT-08 | Aksesibilitas: alternatif non-canvas (SVG + tombol “tampilkan goresan”), fokus, kontras, `prefers-reduced-motion`, target sentuh. | P0 |
| WRT-09 | Halaman menampilkan atribusi KanjiVG dan tautan lisensi; tidak menyembunyikan sumber data. | P0 |

### 5.5 Kriteria penerimaan

- Semua 111 kanji dan 208 kana dapat dibuka; tidak ada karakter tanpa data.
- Animasi SVG mengikuti urutan path; dapat dijeda/diulang; nomor goresan opsional.
- Kanvas menerima pointer/touch; ada alternatif keyboard; tidak ada upload gambar.
- Progres tersimpan dan muncul kembali setelah reload; reset data menghapusnya.
- Atribusi dan lisensi terlihat; tidak ada klaim kepemilikan eksklusif.
- Tidak ada klaim “tulisan benar” dari sistem.

---

## 6. Feature C — Story & Conversation Animation Player

### 6.1 Masalah pengguna

- “Dialog pendek membantu, tetapi saya ingin mengikuti cerita yang berlanjut.”
- “Saya ingin melihat siapa yang berbicara, bukan hanya teks.”
- “Saya ingin membaca subtitle Jepang, membuka terjemahan, dan memeriksa kosakata tanpa keluar dari cerita.”

### 6.2 Ruang lingkup

- Cerita pendek orisinal, 2–3 karakter, 3 adegan per cerita, 8–12 baris dialog/narasi.
- Level N5–N4 untuk rilis awal; minimal 4 cerita pada akhir Fase 18.
- Player dengan:
  - panggung adegan (latar SVG/CSS, bukan video);
  - karakter dengan posisi kiri/kanan/tengah dan penanda pembicara;
  - subtitle Jepang dengan furigana mengikuti setting;
  - terjemahan Indonesia yang dapat dibuka/tutup;
  - anotasi kosakata yang menaut ke kamus;
  - audio per baris (rekaman jika ada, TTS Jepang sebagai fallback);
  - transisi adegan sederhana, kontrol manual/auto, reduced motion;
  - progres penyelesaian dan skor pemahaman.
- Tidak memakai karakter atau dialog anime berhak cipta. Karakter dan ilustrasi dibuat orisinal.

### 6.3 Model konten (ringkas)

```ts
type StoryLine = {
  id: string;
  characterId: string;
  jp: string;          // markup furigana
  reading: string;     // kana
  romaji: string;
  meaning: string;     // Indonesia
  audioId?: string;    // rekaman opsional
  vocab?: string[];    // id kosakata
};

type StoryScene = {
  id: string;
  title: string;
  setting: string;     // deskripsi latar, bukan aset berhak cipta
  background: "room" | "street" | "cafe" | "station" | "park";
  lines: StoryLine[];
};

type Story = {
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
};
```

### 6.4 Kebutuhan fungsional

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| STY-01 | Hub cerita dengan filter level, daftar cerita, progres, dan durasi. | P0 |
| STY-02 | Player menampilkan karakter, pembicara aktif, subtitle Jepang, dan terjemahan toggle. | P0 |
| STY-03 | Audio per baris memakai resolver yang sama; putar normal/lambat; transcript selalu tersedia. | P0 |
| STY-04 | Anotasi kosakata dapat dibuka dan menaut ke kamus; furigana mengikuti setting. | P1 |
| STY-05 | Navigasi baris: sebelumnya/berikutnya, keyboard, progress; auto-play opsional dengan reduced-motion. | P1 |
| STY-06 | Progres penyelesaian dan skor pemahaman disimpan via API lesson kind `story`. | P1 |
| STY-07 | Tidak ada autoplay audio; tidak ada animation yang tidak dapat dimatikan. | P0 |
| STY-08 | Semua teks Jepang memakai `lang="ja"`; terjemahan Indonesia diberi label bahasa. | P0 |
| STY-09 | Karakter/ilustrasi orisinal; tidak ada kemiripan dengan karakter anime berhak cipta. | P0 |

### 6.5 Kriteria penerimaan

- Empat cerita dapat diselesaikan; setiap cerita 3 adegan, 2–3 karakter, 8–12 baris.
- Subtitle Jepang, furigana, terjemahan, kosakata, dan audio bekerja di desktop/mobile.
- Keyboard: next/prev, play/pause, buka terjemahan; fokus tidak hilang.
- Reduced motion menghentikan transisi; audio tidak autoplay.
- Progres dan skor tersimpan; tidak ada tabel baru.
- Tidak ada aset/teks berhak cipta; atribusi aset pihak ketiga (jika ada) tercatat.

---

## 7. Kebutuhan lintas fitur

### 7.1 Bahasa dan akurasi

- UI utama Indonesia; Jepang adalah bahasa target.
- Setiap item Jepang memiliki tulisan, bacaan kana, romaji opsional, arti Indonesia, dan contoh bila relevan.
- Jangan mengarang aturan bahasa atau urutan goresan. Jika data tidak tersedia, tampilkan “belum tersedia”.
- Register (standar/formal/kasual/slang/anime) tetap ditandai; ekspresi anime tidak diajarkan sebagai bahasa sehari-hari universal.

### 7.2 Aksesibilitas

- Semua kontrol audio/writing/story dapat dioperasikan keyboard.
- Status audio, penyimpanan, dan perubahan baris diumumkan melalui live region yang tidak berisik.
- Kanvas menulis memiliki alternatif non-pointer dan tidak menjadi satu-satunya cara menyelesaikan latihan.
- Teks Jepang memakai `lang="ja"`; kontrol memiliki nama aksesibel; warna bukan satu-satunya penanda.
- Hormati `prefers-reduced-motion`; target sentuh minimal 24 px (idealnya 44 px).

### 7.3 Performa

- Tidak memuat seluruh data stroke/audio di bundle awal.
- Data stroke per karakter dimuat sesuai kebutuhan; audio dimuat saat diputar.
- Player cerita di-code-split; tidak menambah library animasi besar.
- Target: delta JS route baru ≤ 60 KiB gzip; data stroke per karakter ≤ 10 KiB gzip; tidak ada permintaan pihak ketiga.
- Ukur dengan build produksi dan browser, bukan asumsi.

### 7.4 Keamanan dan privasi

- Tidak ada upload audio/gambar ke server; rekaman mikrofon tetap lokal.
- Aset statis dari `public/`; tidak ada URL eksternal.
- Jika TTS lokal opsional dipakai, hanya loopback, tanpa logging teks, dengan timeout dan body cap.
- Progres tetap melalui API yang sudah ada; tidak ada endpoint baru tanpa kebutuhan.
- Jangan menambahkan dependensi yang meminta izin jaringan/mikrofon di luar aksi pengguna.

### 7.5 Lisensi dan hak cipta

- Konten cerita, karakter, ilustrasi, dan contoh kalimat: orisinal.
- KanjiVG: CC BY-SA 3.0, atribusi dan lisensi disertakan.
- Audio rekaman: hanya dengan lisensi/izin yang jelas; TTS-generated audio mengikuti lisensi voice engine.
- Open JTalk: core BSD-3-Clause; voice model memiliki lisensi terpisah dan harus diverifikasi sebelum redistribusi.
- Tidak ada kutipan dialog anime, manga, atau buku teks komersial.

### 7.6 Progres dan data

- Tidak ada tabel baru pada MVP; tambahkan kind `writing` dan `story` ke `LessonProgressKind`.
- `writing`: `lessonId` = `writing-<script>-<slug>`; skor self-assessment/coverage.
- `story`: `lessonId` = `story-<id>`; skor pemahaman; penyelesaian.
- Jika analitik per goresan atau resume lintas perangkat dibutuhkan, itu fase terpisah dan memerlukan migrasi.

---

## 8. Definisi selesai Fase 15–19

Fitur baru tidak dianggap selesai hanya karena halaman dapat dibuka. Definisi selesai:

1. Perilaku utama diuji di browser desktop dan mobile.
2. Fallback/kegagalan memiliki UI yang jelas, bukan tombol mati.
3. Tes unit/komponen untuk logika baru; build dan lint bersih.
4. Aksesibilitas dasar lolos pemeriksaan manual (fokus, keyboard, label, reduced motion).
5. Tidak ada permintaan jaringan eksternal atau layanan berbayar.
6. Lisensi/atribusi aset tercatat.
7. Dokumentasi diperbarui; tidak ada klaim yang tidak diuji.
8. Tidak ada regresi pada 29 rute lama; setelah Fase 16 total 30 pola rute dan 18 API.

---

## 9. Batasan dan pertanyaan terbuka

- Ketersediaan voice Jepang tidak dapat dijamin oleh aplikasi; audio statis adalah satu-satunya jaminan kualitas, tetapi membutuhkan rekaman berlisensi.
- KanjiVG adalah sumber pihak ketiga; akurasi urutan goresan mengikuti data tersebut, bukan verifikasi ahli independen.
- Belum ada penutur asli untuk merekam audio; TTS tetap default.
- Belum ada review ahli untuk cerita baru; perlu proses review sebelum dianggap “production-quality”.
- 259 halaman writing dapat menambah waktu build; perlu diukur dan fallback ke satu halaman pemilih jika perlu.
- Penambahan nav “Cerita” ditunda sampai ada minimal 3 cerita agar navigasi tidak membengkak.

---

## 10. Rekomendasi

Status pelaksanaan berbeda dari urutan awal: **Fase 15 (perluasan CMS) diblokir** karena repositori tidak memiliki CMS/admin; **Fase 16 Audio sudah diimplementasikan**; berikutnya **Fase 17 Writing** (KanjiVG), **Fase 18 Story foundation**, lalu **Fase 19 Animation/polish + Integration/QA**. Jangan mengerjakan ketiganya sekaligus. Audio menjadi fondasi audio cerita; writing independen; cerita membutuhkan model dan audio. Detail teknis ada di [ENHANCED_FEATURES_ARCHITECTURE.md](ENHANCED_FEATURES_ARCHITECTURE.md), urutan kerja di [ENHANCED_FEATURES_ROADMAP.md](ENHANCED_FEATURES_ROADMAP.md), dan status di [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md).
