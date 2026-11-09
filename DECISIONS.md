# Keputusan Arsitektur — Kotoba

Dokumen ini mencatat keputusan teknis penting beserta alasannya. Format ringkas menyerupai ADR (Architecture Decision Record). Perubahan besar di fase berikutnya harus menambah atau menggantikan entri di sini, bukan menghapus riwayat.

---

## ADR-001 — Aplikasi baru mandiri di `/home/akihira17/personal/kotoba`

**Konteks.** Workspace `/home/akihira17/personal` berisi beberapa proyek saudara, bukan satu repositori. Tidak ada proyek bahasa Jepang sebelumnya.

**Keputusan.** Membuat proyek Next.js baru yang terisolasi di `kotoba`, mengikuti konvensi proyek saudara terbaru (`tactical-arena-ai`): App Router, TypeScript, Tailwind 4, ESLint flat config, Vitest.

**Alasan.** Tidak mencampur dependensi/konfigurasi proyek lain; menghindari operasi destruktif; tetap konsisten dengan ekosistem yang sudah dikenal di workspace. Stack Next.js/React dipilih karena mendukung halaman interaktif, route API, SSR, dan build produksi tanpa layanan tambahan.

---

## ADR-002 — SQLite lokal melalui `node:sqlite`, bukan ORM/database eksternal

**Keputusan.** Persistensi memakai `DatabaseSync` dari `node:sqlite` di server, dengan file `.data/kotoba.db` (dapat diubah lewat `KOTOBA_DB_PATH`). Akses data dibungkus `src/server/progress-service.ts`; route handler hanya memvalidasi input dan memanggil service.

**Alasan.** Node 24 sudah menyediakan SQLite bawaan sehingga tidak perlu dependensi native (lebih mudah dipasang di berbagai mesin), tidak ada biaya/layanan pihak ketiga, dan data benar-benar persisten di server. Skema kecil (7 tabel) tidak membutuhkan ORM. WAL dan `busy_timeout` diaktifkan untuk konkurensi ringan.

**Konsekuensi.** API `node:sqlite` masih experimental dan mensyaratkan Node >= 22.5. Belum ada migrasi berversi; `migrate()` bersifat idempoten untuk skema awal.

---

## ADR-003 — Konten sebagai modul TypeScript bertipe, bukan CMS/database

**Keputusan.** Semua materi berada di `src/content/*.ts` dengan tipe dari `src/lib/types.ts`; diekspor sebagai array dan `Map` untuk lookup id. Tidak ada API admin/CMS.

**Alasan.** Konten edukatif perlu akurat, dapat di-review di diff, dan tidak boleh berubah diam-diam saat runtime. TypeScript menangkap field yang hilang (mis. bacaan, contoh, kunci jawaban) saat build. Tes konten memvalidasi jumlah, duplikasi id, dan konsistensi jawaban.

**Konsekuensi.** Menambah konten berarti mengubah kode dan melakukan build ulang. Ini disengaja untuk menjaga kualitas fase awal. Fase berikutnya dapat menambahkan pipeline validasi konten tanpa mengubah format data.

---

## ADR-004 — SM-2-lite untuk SRS; rating 0–3 dan XP terpisah

**Status:** Formula awal digantikan oleh ADR-029 pada Fase 5; rating dan pemisahan XP tetap berlaku.

**Keputusan.** `src/lib/srs.ts` mengimplementasikan penjadwalan sederhana: `Lagi` (ease −0.2, ulang 10 menit), `Sulit` (ease −0.15), `Bagus` (interval × ease), `Mudah` (ease +0.15, interval × ease × 1.3). Kartu baru mendapat interval awal 1–2 hari; `ease` dibatasi minimum 1.3. XP review benar 10, salah 3.

**Alasan.** Algoritma penuh SM-2 sulit dijelaskan kepada pemelajar dan sulit diuji; versi ini cukup adaptif, deterministik, dan bisa diverifikasi unit test. Rating 0–3 lebih ramah daripada enam tombol.

**Konsekuensi.** Estimasi interval adalah perkiraan, bukan prediksi memori ilmiah. Semua log review disimpan agar algoritma dapat ditingkatkan kemudian tanpa kehilangan histori.

---

## ADR-005 — Audio memakai Web Speech API, bukan file audio/TTS berbayar

**Keputusan.** `src/lib/speech.ts` membungkus `speechSynthesis` dengan locale `ja-JP`, pemilihan voice Jepang, kecepatan 0.5–1.3, dan mode lambat 0.65. Jika voice tidak tersedia, UI menampilkan catatan fallback dan transkrip.

**Alasan.** Menghindari biaya berulang dan file audio besar; tetap memberi latihan mendengar dan pengucapan. Transkrip selalu tersedia sebagai jalur alternatif.

**Konsekuensi.** Kualitas suara bergantung OS/browser dan tidak seragam. Aplikasi tidak dapat menjamin audio di lingkungan tanpa voice Jepang. Fase berikutnya dapat menambahkan audio statis untuk dialog inti.

---

## ADR-006 — Tailwind 4 dengan token tema dan kelas `.dark`

**Keputusan.** Warna, font, bayangan, dan animasi didefinisikan sebagai token `@theme inline` di `src/app/globals.css`; mode gelap memakai `.dark` pada `<html>` dan `@custom-variant`. Tema disimpan di profil dan dicerminkan ke `localStorage` agar script boot mencegah flash.

**Alasan.** Satu sumber kebenaran visual; komponen memakai utilitas semantik (`bg-surface`, `text-muted`, `border-line`) sehingga tema konsisten. Tailwind 4 menghilangkan kebutuhan file konfigurasi terpisah.

**Konsekuensi.** Menambah warna/varian harus lewat token; nilai hardcoded dihindari agar mode gelap tidak rusak.

---

## ADR-007 — Provider progres dimulai dari snapshot kosong, cache diterapkan setelah mount

**Konteks.** Versi awal membaca `localStorage` di dalam `useState` initializer. Saat pengguna sudah punya progres, HTML server (kosong) berbeda dari render klien pertama (berisi progres) sehingga React memunculkan error hydration #418 pada navigasi berikutnya.

**Keputusan.** `ProgressProvider` selalu memulai dengan `emptySnapshot()` yang identik di server dan klien. Cache lokal dan fetch API diterapkan di dalam `setTimeout(0)` setelah mount.

**Alasan.** Menghilangkan mismatch tanpa mengorbankan tampilan cepat; snapshot server tetap otoritatif. Ini juga menjaga tema dan data awal deterministik.

**Konsekuensi.** Ada satu frame tampilan kosong sebelum cache/fetch masuk; `loading.tsx` dan skeleton menutupi transisi. Cache hanya untuk tampilan awal, bukan sumber kebenaran.

---

## ADR-008 — Ujian memakai blueprint 0–100 dan fallback lintas level

**Keputusan.** `buildExam(level)` menyusun tiga bagian (moji-goi, bunpou-dokkai, choukai) dari bank soal. Untuk level dengan konten sedikit, item level terpilih diprioritaskan lalu bagian diisi dari level lain agar tidak kosong. Skor akhir = persentase benar (0–100), lulus jika >= ambang `LEVEL_META` (N5 80, N4 90, N3 95, N2 90, N1 100).

**Alasan.** JLPT asli memakai sistem poin dan norma yang kompleks; simulasi edukatif tidak boleh mengklaim penilaian resmi. Fallback menjaga ujian tetap dapat dimainkan saat konten level lanjut belum lengkap.

**Konsekuensi.** Ujian N1 saat ini tidak murni berisi soal N1. Batasan ini didokumentasikan di `PROJECT_STATUS.md`; fase konten berikutnya harus mengurangi fallback dengan menambah bank soal per level.

---

## ADR-009 — Satu profil lokal, tanpa autentikasi

**Keputusan.** Tabel `profile` memakai satu baris `id = 1`; tidak ada login, token, atau isolasi pengguna. API dapat diakses siapa pun yang menjalankan server.

**Alasan.** Produk awal ditujukan untuk belajar mandiri di perangkat sendiri; autentikasi akan menambah kompleksitas tanpa nilai langsung. Ekspor/impor JSON sudah menyediakan jalur backup/pindah.

**Konsekuensi.** Jangan mengekspos server ke internet publik tanpa menambahkan autentikasi, rate limit, dan validasi ketat. Fase multi-profil harus memigrasikan skema dan API secara eksplisit.

---

## ADR-010 — Font eksternal opsional dengan fallback sistem

**Keputusan.** `layout.tsx` memuat Plus Jakarta Sans, Noto Sans JP, dan Noto Serif JP melalui `<link>` Google Fonts; stack CSS menyertakan `"Hiragino Sans"`, `"Yu Gothic"`, `"Noto Sans JP"`, `"Droid Sans Fallback"`, dan sans-serif.

**Alasan.** Kualitas tipografi Jepang penting untuk pembelajaran, tetapi mesin pengembangan hanya memiliki Droid Sans Fallback. Memuat font web memberi tampilan konsisten tanpa mengemas file besar.

**Konsekuensi.** Ada ketergantungan jaringan opsional; tanpa jaringan, tampilan memakai font sistem. Fase berikutnya dapat melakukan self-host subset font untuk privasi/offline.

---

## ADR-011 — Kebijakan konten: orisinal, berlabel register, dan tidak mengklaim resmi

**Keputusan.** Semua kalimat, dialog, artikel, dan soal ditulis orisinal. Istilah budaya memakai fakta umum dengan `sourceNote` ringkasan; ungkapan anime dipisahkan dari bahasa standar dan diberi peringatan. Istilah JLPT dipakai sebagai perkiraan level, bukan sertifikasi.

**Alasan.** Memenuhi batasan hak cipta dan menghindari mengajarkan ucapan fiksi sebagai bahasa sehari-hari yang sopan. Akurasi bacaan/kanji diverifikasi lewat tes konten dan review manual.

**Konsekuensi.** Konten tidak boleh disalin dari buku/soal komersial. Klaim sejarah/fakta harus dapat dipertanggungjawabkan; bila ragu, gunakan penjelasan deskriptif, bukan aturan absolut.

---

## ADR-012 — Furigana memakai markup `{漢字|かんじ}` dan parser sendiri

**Keputusan.** Teks Jepang menyimpan furigana inline dalam format `{kanji|kana}`. `parseFurigana` menghasilkan `<ruby><rt>`; `stripFurigana` dipakai untuk teks audio dan pencarian. Preferensi `showFurigana` mengatur tampilan.

**Alasan.** Satu string tetap mudah dibaca di source dan bisa ditampilkan dengan/tanpa furigana tanpa duplikasi konten. Format sederhana lebih mudah divalidasi daripada HTML mentah.

**Konsekuensi.** Konten harus lolos tes yang memastikan tidak ada kurung kurawal tersisa setelah stripping. Teks audio memakai versi tanpa markup.

---

## ADR-013 — State aplikasi memakai React Context, bukan state library

**Keputusan.** `ProgressProvider` dan `ToastProvider` menyediakan state global; sisanya state lokal komponen. Data konten statis diimpor langsung. Tidak ada Redux/Zustand/react-query.

**Alasan.** Skala aplikasi satu pengguna tidak membutuhkan cache server kompleks; Context cukup dan mengurangi dependensi. Mutasi progres mengembalikan snapshot lengkap sehingga sinkronisasi sederhana.

**Konsekuensi.** Setiap mutasi mengganti seluruh snapshot; untuk data besar ini bisa dioptimalkan. Fase berikutnya dapat memperkenalkan query cache bila jumlah konten/pengguna bertambah.

---

## ADR-014 — Verifikasi: typecheck + lint + unit test + build + skrip browser

**Keputusan.** `npm run check` menjalankan typecheck, ESLint, dan Vitest. Verifikasi rilis menambahkan `npm run build`, `scripts/verify-api.mjs`, dan `scripts/verify-ui.cjs` (Playwright) pada server produksi.

**Alasan.** Kombinasi ini menangkap error tipe, pelanggaran lint, regresi logika/data, kegagalan build, error runtime hydration, dan route yang tidak dapat dimuat. Skrip browser memeriksa 20 rute desktop/mobile/dark. Pada Fase 5 ditambahkan verifikasi Playwright fungsional untuk sembilan jenis latihan, flashcard, kuis kosakata, ujian, dan riwayat latihan.

**Konsekuensi.** Skrip Playwright memakai path Chromium khusus mesin pengembang dan belum menjadi CI; tes komponen/E2E alur ujian penuh masih menjadi pekerjaan fase berikutnya.

---

## ADR-015 — Fase 1 mempertahankan arsitektur baseline dan memprioritaskan konten serta pengalaman belajar

**Konteks.** Discovery Fase 1 menemukan aplikasi v0.1.0 yang sudah berjalan dengan Next.js 16 App Router, React Context, konten TypeScript, SQLite/node:sqlite, dan Web Speech API. Tidak ada masalah arsitektur mendasar yang menuntut penulisan ulang.

**Keputusan.** Arsitektur baseline dipertahankan. MVP v0.2 difokuskan pada kedalaman konten N4–N1, variasi latihan (isian rumpang, terjemahan, mencocokkan), pengelolaan personal (bookmark, target mingguan, jadwal ulangan), rekomendasi harian berbasis aturan, serta quality gate (tes komponen/E2E, CI, aksesibilitas). Tidak ada framework, ORM, state library, atau layanan baru pada fase ini.

**Alasan.** Penulisan ulang akan membuang fitur yang sudah terverifikasi dan menambah risiko tanpa manfaat langsung. Celah terbesar produk ada pada cakupan konten dan kelengkapan alur belajar, bukan pada pilihan teknologi. Mempertahankan arsitektur juga menjaga konvensi proyek dan memungkinkan pekerjaan inkremental yang dapat diuji.

**Konsekuensi.** Perubahan berikutnya harus memperluas lapisan yang ada (schema_version, tabel bookmark, domain PracticeExercise, modul rekomendasi) tanpa merombak halaman/API. Keputusan untuk autentikasi, sinkronisasi, atau PWA ditunda sampai MVP stabil. Detail prioritas ada di FEATURE_ROADMAP.md.

---

## ADR-016 — Model domain kanonis berada di `src/lib/types.ts`; konten tetap modul TypeScript

**Konteks.** Fase 2 meminta entitas domain yang dapat dipakai ulang (Course, Lesson, Exercise, ExamDefinition, Achievement, Bookmark, dan seterusnya). Aplikasi sudah memiliki tipe konten/progres di `src/lib/types.ts`, konten statis di `src/content/*.ts`, dan belum memakai ORM/CMS/state library.

**Keputusan.** Tambahkan tipe domain kanonis ke `src/lib/types.ts` tanpa memecah paket atau menambah dependensi. Konten tetap berupa modul TypeScript bertipe. Tidak ada ORM, CMS, GraphQL, atau state library baru. Jika file melewati sekitar 600–700 baris atau batas modul mulai kabur, pecah menjadi `types/content.ts`, `types/progress.ts`, dan `types/curriculum.ts` lalu re-export dari `types.ts`; pemecahan dilakukan saat ada kebutuhan nyata, bukan sekarang.

**Alasan.** Satu permukaan impor menjaga momentum dan menghindari refactor besar yang belum diperlukan. Tipe TypeScript memberi kontrak pada waktu desain/build, sementara validasi runtime tetap ditangani tes dan service. Menambah lapisan abstraksi sekarang hanya akan memindahkan kompleksitas, bukan menghilangkannya.

**Konsekuensi.** `types.ts` memuat konten, progres, dan katalog; pemisahan fisik ditunda. Tipe baru yang belum dipakai runtime harus ditandai sebagai fondasi di dokumentasi, bukan diklaim sebagai fitur selesai.

---

## ADR-017 — Katalog kursus diturunkan dari konten, bukan disimpan di database

**Konteks.** Produk membutuhkan struktur Course → Module → Lesson, tetapi materi sudah berupa array bertipe. Menyimpan katalog di database akan menduplikasi konten dan memaksa migrasi setiap kali materi berubah.

**Keputusan.** Buat `src/content/curriculum.ts` yang menurunkan `CURRICULUM` dari konten nyata. Lesson hanya menyimpan `ContentRef` (`kind`, `id`, `href?`), tujuan, level, estimasi waktu, dan urutan. Tidak ada tabel course/module/lesson di SQLite. `validateCurriculum()` dan `curriculum.test.ts` memastikan id unik, urutan valid, ref dapat di-resolve, href internal, dan seluruh konten tercakup.

**Alasan.** Satu sumber kebenaran untuk materi. Menambah kosakata/kanji/grammar/bacaan/budaya otomatis memperluas katalog tanpa mengubah halaman atau engine. Validator menutup risiko ref menggantung dan konten yang tidak pernah tampil.

**Konsekuensi.** Katalog adalah proyeksi runtime, bukan data yang dapat diedit lewat admin. Penambahan jenis konten baru tetap memerlukan perubahan tipe/resolver/UI secara eksplisit. **Diperbarui Fase 3:** katalog kini dipakai dashboard dan `/learn`; `src/lib/learning.ts` menjembatani `Lesson.id` ke id progres aktivitas. Database masih menyimpan id aktivitas, bukan `Lesson.id` kanonis (lihat DATA_MODEL §15.1); migrasi harus memilih satu id kanonis agar XP tidak dapat dihitung dua kali.

---

## ADR-018 — SQLite server otoritatif, localStorage hanya cache baca; XP inti dihitung server

**Konteks.** Aplikasi melayani satu pelajar lokal. Pilihan persistensi berkisar dari localStorage/IndexedDB sampai database server/cloud. Pengguna membutuhkan progres yang tidak hilang saat cache browser dibersihkan, tetapi belum membutuhkan akun atau sinkronisasi.

**Keputusan.** SQLite melalui `node:sqlite` adalah sumber kebenaran untuk profil, kartu, riwayat, dan pengaturan. `localStorage` hanya menyimpan snapshot cache untuk pembacaan awal/offline ringan. Tidak ada antrean tulis offline; kegagalan POST terlihat oleh pengguna. XP ulasan, kana, penyelesaian lesson pertama, dan ujian dihitung server. XP sesi latihan/game masih diterima dari klien dalam batas clamp karena aplikasi satu pengguna dan bukan sistem anti-cheat.

**Alasan.** Transaksi SQLite memberi konsistensi tanpa layanan eksternal, dan file database mudah dibackup. Menjadikan cache sebagai sumber kebenaran akan membuat progres rapuh. Menghitung XP inti di server mencegah payload klien menaikkan hadiah lesson secara sewenang-wenang, sambil menghindari infrastruktur verifikasi jawaban yang tidak sepadan untuk aplikasi lokal.

**Konsekuensi.** Satu proses/satu instance; bukan multi-pengguna. Payload sesi masih dipercaya dalam clamp; deployment publik memerlukan verifikasi jawaban server-side. Sejak Fase 5, XP kuis dihitung server dari skor yang dikirim, tetapi benar/salah tiap jawaban masih berasal dari klien. Cache tidak boleh menimpa server setelah fetch berhasil. `schema_version` dan migrasi formal belum ada.

---

## ADR-019 — Progres adalah gabungan state terbaru dan log kejadian; agregat diturunkan

**Konteks.** SRS membutuhkan state kartu terbaru, analitik membutuhkan riwayat, dan dasbor membutuhkan total/streak dengan cepat. Menyimpan semua nilai turunan akan menduplikasi kebenaran; hanya menyimpan log akan membuat setiap pembacaan mahal.

**Keputusan.** Simpan state SRS di `cards`, state kana di `kana_progress`, penyelesaian di `lessons`, log ulasan di `reviews`, hasil ujian di `exams`, dan agregat harian di `activity`. XP total/level/streak/akurasi/ringkasan dihitung dari state+log saat `getSnapshot()`. Setiap mutasi yang memengaruhi beberapa tabel dibungkus transaksi. Snapshot gabungan dikirim ke klien dan dicache.

**Alasan.** Model hibrida ini sesuai kebutuhan: pembacaan cepat, riwayat tetap ada, dan rumus dapat diuji. Menambahkan tabel agregat baru akan menciptakan risiko drift tanpa manfaat yang jelas pada skala ini.

**Konsekuensi.** Definisi statistik harus eksplisit: `totalReviews` berasal dari activity (termasuk sesi latihan), sedangkan `correctReviews` hanya dari log kartu. Akurasi campuran ini didokumentasikan di DATA_MODEL §10. Fase 5 menambahkan `quiz_attempts` dan `question_stats` sebagai log/agregat khusus latihan; `LearningAttempt` lama tetap tidak dipakai.

---

## ADR-020 — Model latihan/kuis/ujian deklaratif ditambahkan tanpa merombak runtime yang sudah berjalan

**Status:** Digantikan oleh ADR-028 pada Fase 5. Enam jenis latihan fondasi menjadi sembilan jenis yang benar-benar dipakai runtime.

**Konteks.** Fase 2 meminta `Exercise`, `Quiz`, `Question`, `Exam`, dan `Game` yang dapat dipakai ulang. Runtime saat ini sudah berfungsi dengan `QuizQuestion`, `buildPracticeQuiz`, `buildExam`, `SentenceItem`, dan komponen game. Menulis ulang semuanya sekarang berisiko merusak fitur yang sudah terverifikasi.

**Keputusan.** Tambahkan tipe deklaratif `Exercise` (multiple-choice, cloze, translation, matching, ordering, flashcard), `QuizDefinition`, `ExamDefinition`, `GameDefinition`, dan `CulturalFact`. Runtime lama dipertahankan: halaman latihan masih memakai `QuizQuestion`/`SentenceItem`, halaman ujian masih memakai `EXAM_COUNTS`+`buildExam`. Tidak ada migrasi UI prematur. Definisi baru menjadi kontrak untuk fase latihan/ujian berikutnya.

**Alasan.** Tipe baru memberi arah evolusi dan dapat diuji tanpa memaksa perubahan perilaku. Menjaga runtime lama memungkinkan setiap langkah dirilis dan diverifikasi.

**Konsekuensi.** Ada dua representasi ujian sampai migrasi; keduanya harus dijaga konsisten dan diuji. `Exercise` belum dipakai halaman, jadi fitur cloze/translation/matching tidak boleh diklaim aktif. Saat migrasi, pilih satu sumber kebenaran dan hapus representasi lama setelah ekuivalensi terbukti.

---

## ADR-021 — Autentikasi dan sinkronisasi ditunda, tetapi seam `user_id`/sesi disiapkan

**Konteks.** Pengguna meminta dukungan masa depan untuk akun dan sinkronisasi tanpa infrastruktur kompleks sekarang. Aplikasi masih satu profil lokal; menambahkan auth dini akan memperlambat validasi produk inti.

**Keputusan.** Jangan implementasikan auth/sync pada Fase 2. Dokumentasikan seam: tabel `users`, kolom `user_id` pada tabel progres, PK komposit, sesi cookie httpOnly, identitas diambil dari sesi (bukan body), migrasi profil lama menjadi pengguna pertama, `schema_version` + migrasi additive, serta kebijakan konflik sederhana (state kartu berdasarkan `lastReviewedAt`, aktivitas dijumlahkan per tanggal). Ekspor/impor JSON tetap jalur pemindahan manual saat ini.

**Alasan.** Auth dan sinkronisasi adalah fitur produk yang memerlukan keputusan kebijakan (identitas, privasi, konflik, penagihan) dan pengujian tersendiri. Menyiapkannya sebagai seam murah lebih baik daripada membangun infrastruktur yang belum terbukti dibutuhkan.

**Konsekuensi.** Skema saat ini tidak siap multi-pengguna dan tidak boleh diklaim demikian. Sebelum deployment publik, auth, otorisasi route, rate limit, dan backup menjadi prasyarat. Sinkronisasi penuh/offline tulis tetap di luar cakupan.

---

## ADR-022 — Sepuluh tujuan navigasi utama; halaman materi menjadi rute sekunder

**Konteks.** Aplikasi memiliki 20 halaman pengguna. Menampilkan semuanya di sidebar membuat navigasi padat dan menyamakan materi (kana, kosakata, kanji) dengan alur kerja utama (belajar, latihan, ujian). Pengguna meminta tepat 10 tujuan navigasi utama yang semuanya nyata.

**Keputusan.** `NAV_GROUPS` di `src/lib/constants.ts` mendefinisikan 10 tujuan: Dasbor, Belajar, Latihan, Permainan, Pelafalan, Ujian, Budaya, Kamus, Statistik, Pengaturan. Halaman Kana, Kosakata, Kanji, Tata Bahasa, Membaca, dan Menyimak tetap ada dan dapat ditautkan langsung, tetapi tidak muncul sebagai item utama; halaman itu dikelompokkan melalui hub **Belajar** dan daftar `SECONDARY_ROUTES` untuk judul header. Mobile memakai bottom navigation lima tujuan + drawer berisi seluruh navigasi.

**Alasan.** Navigasi utama harus mencerminkan alur belajar, bukan katalog konten. Menyembunyikan halaman materi di sidebar tidak menghapus fitur karena semuanya tetap dapat diakses dari hub dan tautan kontekstual. Bottom navigation lima item menjaga target sentuh dan keterbacaan di layar sempit.

**Konsekuensi.** Halaman materi tidak memiliki item sidebar aktif; pengguna mengandalkan hub Belajar, tautan silang, atau riwayat. Menambah tujuan utama baru memerlukan perubahan shell, mobile nav, tes navigasi, dan dokumentasi. Placeholder tanpa halaman tidak boleh dimasukkan hanya untuk memenuhi jumlah.

---

## ADR-023 — Katalog terhubung ke progres lewat satu jembatan; penyelesaian manual dan ambang 60%

**Konteks.** Fase 2 menemukan bahwa katalog memakai id seperti `les-grammar-g-desu`, sedangkan halaman materi menyimpan id aktivitas seperti `g-desu`. Tanpa pemetaan resmi, status selesai dapat salah atau XP dapat dihitung dua kali. Migrasi database penuh berisiko untuk fitur yang sudah berjalan.

**Keputusan.** Tambahkan `src/lib/learning.ts` sebagai satu-satunya tempat pemetaan `Lesson` → `LessonProgress` (`lessonProgressId`, `lessonProgressKind`, `lessonProgressPayload`, `lessonForProgressId`). Dashboard dan `/learn` memakai pemetaan ini. Pengguna dapat menandai pelajaran selesai dari hub; `recordLesson` menyimpan progres, dan XP pertama tetap dihitung server berdasarkan jenis lesson. Kenaikan level ditentukan aturan **60% pelajaran level berjalan selesai** (`LEVEL_UNLOCK_RATIO`).

**Alasan.** Satu jembatan mencegah setiap halaman menebak-nebak id, tanpa memaksa migrasi data yang berisiko. 60% cukup tinggi untuk mencegah lompatan level karena satu materi, tetapi cukup rendah agar pemelajar tidak terjebak menyelesaikan seluruh katalog. XP server-side menjaga hadiah tetap konsisten.

**Konsekuensi.** Database belum memakai id kanonis; jembatan harus diperbarui jika jenis lesson baru ditambahkan. Penyelesaian manual dapat memberi XP tanpa bukti membaca/menjawab, sehingga Fase 4 perlu menghubungkan penyelesaian dengan aktivitas nyata dan merekonsiliasi XP. Ambang 60% adalah keputusan produk, bukan aturan JLPT.

---

## ADR-024 — Pelafalan memakai rekaman lokal dan cek mandiri, tanpa unggah atau penilaian otomatis

**Konteks.** Latihan pelafalan membutuhkan umpan balik, tetapi layanan pengenalan suara berbayar, pengiriman audio ke server, dan penilaian otomatis memiliki implikasi privasi, biaya, serta akurasi yang belum dapat dijamin.

**Keputusan.** `/pronunciation` memutar contoh melalui Web Speech API (normal/lambat), merekam mikrofon dengan `MediaRecorder` hanya di tab, lalu meminta pengguna memeriksa tiga aspek secara mandiri (vokal panjang, sokuon, intonasi). Rekaman tidak diunggah dan tidak disimpan permanen. Tombol "Tandai sudah dilatih" mencatat penyelesaian dan XP pertama; bukan penilaian kualitas.

**Alasan.** Privasi dan kejujuran lebih penting daripada klaim akurasi palsu. Rekaman lokal sudah memberi manfaat membandingkan diri dengan contoh, sementara cek mandiri mengajarkan aspek bunyi yang perlu diperhatikan. Tidak ada biaya atau dependensi layanan eksternal.

**Konsekuensi.** Tidak ada skor pelafalan otomatis, deteksi kesalahan, atau riwayat audio. Mikrofon memerlukan izin dan konteks aman (HTTPS/localhost); penolakan izin ditangani dengan pesan. Penilaian kualitas hanya dapat ditambahkan jika ada mesin ASR lokal yang andal dan kebijakan privasi yang jelas.

---

## ADR-025 — Dashboard berorientasi tindakan; pencapaian dihitung dari satu modul bersama

**Konteks.** Dashboard lama menampilkan banyak angka, tetapi tidak menjawab "apa yang harus saya lakukan sekarang?". Pencapaian dan statistik juga berisiko berbeda jika dihitung ulang di setiap halaman.

**Keputusan.** `src/app/page.tsx` disusun sebagai alur keputusan: target hari ini → rekomendasi berikutnya → lanjutkan belajar → ringkasan ulangan → jalur JLPT → pencapaian → konsistensi. Rencana harian hanya menampilkan item yang relevan (mis. tidak mencentang ulangan jika tidak ada kartu jatuh tempo). `src/lib/achievements.ts` menjadi satu-satunya definisi pencapaian; dashboard dan Statistik memakainya. Pencapaian terbuka diurutkan lebih dulu, lalu definisi berikutnya.

**Alasan.** Informasi yang dapat ditindaklanjuti lebih berguna daripada metrik pasif. Satu definisi pencapaian mencegah angka berbeda antarhalaman, dan urutan "terbuka dulu" memberi umpan balik termotivasi tanpa menyembunyikan tujuan jangka panjang.

**Konsekuensi.** Dashboard bergantung pada snapshot progres dan katalog; penambahan metrik baru harus ditempatkan pada hierarki yang ada agar tidak kembali menjadi dasbor angka. Pencapaian yang masih terkunci tetap terlihat sebagai tujuan. Tidak ada tabel pencapaian terpisah; semuanya diturunkan dari snapshot.

---

## ADR-026 — LessonPlan deklaratif + pemain enam langkah; N5 lebih dulu, gerbang latihan 60%

**Konteks.** Katalog Fase 2 hanya menunjuk materi lewat ContentRef; belum ada isi pelajaran yang dapat dipelajari berurutan, dan belum ada bukti pemahaman yang menghubungkan materi dengan penyelesaian. Menulis konten langsung di komponen akan membuat setiap pelajaran berbeda, sulit divalidasi, dan sulit diperluas ke level berikutnya.

**Keputusan.** Tambahkan lapisan data LessonPlan bertipe di src/content/lessons/. Setiap rencana memuat tujuan, pengantar, penjelasan, contoh, catatan, dan latihan; UI generik merender blok prose/table/grid/kana-grid/vocab-list/kanji-list/callout/steps. Pemain pelajaran memakai enam langkah (Pengantar, Penjelasan, Contoh, Catatan, Latihan, Selesai), mengunci langkah masa depan, dan hanya membuka Selesai setelah latihan mencapai skor 60 (LESSON_PASS_SCORE). Pelajaran katalog ditandai interactive dan memakai rute /learn/[lessonId]. Fase 4 hanya menulis 62 pelajaran N5; N4–N1 belum dibuat.

**Alasan.** Satu bentuk data dan satu pemain mengurangi duplikasi serta memastikan semua pelajaran memiliki struktur, latihan, dan umpan balik yang konsisten. Gerbang latihan membuat penyelesaian lebih bermakna daripada tombol manual, tanpa memerlukan penilaian esai atau model bahasa. Memprioritaskan N5 menghasilkan jalur pemula yang utuh sebelum memperluas level.

**Konsekuensi.** Menambah jenis blok atau jenis latihan baru memerlukan perubahan renderer/tipe dan tes. Skor latihan adalah skor percobaan terakhir, bukan rata-rata; ini cukup untuk gerbang belajar, bukan sertifikasi. Pelajaran membaca/menyimak N5 serta seluruh N4–N1 masih memakai halaman materi lama dan penyelesaian manual. Ambang 60 adalah keputusan produk, bukan aturan JLPT.

---

## ADR-027 — Jalur N5 sebagai unit progres; modul susun kalimat dipecah menjadi delapan pelajaran

**Konteks.** Sebelum Fase 4, modul susun kalimat hanya memiliki satu pelajaran per level meskipun konten N5 berisi delapan item. Jalur pemula juga belum memiliki ringkasan modul yang menunjukkan urutan belajar yang disarankan.

**Keputusan.** Modul susun kalimat N5 diperluas menjadi delapan pelajaran dari SENTENCE_PLANS; id pelajaran pertama dipertahankan agar progres lama tidak hilang. Hub Belajar menampilkan Jalur N5 berisi enam modul (Hiragana, Katakana, Kanji, Kosakata, Tata Bahasa, Susun Kalimat) dengan progres per modul dan pelajaran berikutnya. Katalog level tetap menghitung seluruh pelajaran N5, termasuk delapan pelajaran membaca/menyimak yang belum interaktif.

**Alasan.** Satu pelajaran untuk delapan item membuat latihan terlalu padat dan progres tidak informatif. Memecahnya memberi langkah kecil yang dapat diselesaikan, sementara mempertahankan id lama mencegah kehilangan data. Jalur N5 memberi pemula urutan yang jelas tanpa menyembunyikan modul lain.

**Konsekuensi.** Pada saat ADR ini ditulis, N5 memiliki 70 pelajaran katalog: 62 interaktif dan 8 membaca/menyimak legacy. Fase 13 memindahkan kedelapan pelajaran itu ke LessonPlan, sehingga seluruh 70 pelajaran N5 kini interaktif. Angka jalur dan angka level bisa berbeda; id progres lama harus dipetakan, bukan didaur ulang.

---

## ADR-028 — Sembilan jenis latihan memakai satu engine dan satu kontrak respons

**Konteks.** Sebelum Fase 5 ada tiga jalur latihan yang terpisah: `QuizRunner` untuk membaca/menyimak, `LessonPractice` untuk pelajaran dan tata bahasa, serta UI ujian sendiri. Ketiganya hanya menangani pilihan ganda. Tipe `Exercise` Fase 2 baru berupa fondasi dan belum dipakai runtime. Pengguna meminta sembilan jenis latihan yang dapat dipakai ulang di semua permukaan.

**Keputusan.** `ExerciseKind` menjadi sembilan nilai: `multiple-choice`, `cloze`, `translation`, `matching`, `reading-recognition`, `listening`, `ordering`, `true-false`, dan `typing`. Flashcard dikeluarkan dari union latihan karena alurnya berbeda. Setiap jenis memakai field datar yang hanya dibaca oleh view-nya. `ExerciseResponse` adalah union respons (pilihan, teks, benar/salah, pasangan, urutan), dan `gradeExercise()` di `src/lib/exercise-engine.ts` menjadi satu-satunya penilai. `ExerciseCard` merender kesembilan jenis; `ExerciseRunner` mengelola sesi, umpan balik, skor, retry, dan penyimpanan. `exercisesFromQuizQuestions()` menjembatani bank soal lama tanpa menulis ulang konten. Kuis kana dan kanji juga memakai runner yang sama; `QuizRunner` lama dihapus setelah seluruh pemakaian bermigrasi. Mode `lesson` dan `exam` tidak memberi XP kuis agar XP lesson/ujian tidak dobel; mode lain memberi XP kuis.

**Alasan.** Satu kontrak membuat perilaku benar/salah, umpan balik, dan ringkasan konsisten di semua halaman. Menghapus duplikasi `QuizRunner`/`LessonPractice` mengurangi risiko perbaikan hanya diterapkan di satu tempat. Memisahkan flashcard menjaga SRS dan reveal tetap independen dari penilaian latihan.

**Konsekuensi.** Setiap jenis latihan membutuhkan data, view, dan tes validasi; konten baru harus menyediakan varian jawaban yang eksplisit. Penilaian berjalan di klien dan server belum memiliki kunci jawaban konten, sehingga payload benar/salah masih dipercaya. Mencocokkan dapat memberi skor parsial, tetapi status benar hanya jika semua pasangan tepat.

---

## ADR-029 — Scheduler SRS SM-2-inspired dengan empat rating dan estimasi interval

**Konteks.** Scheduler lama cukup berfungsi, tetapi rumusnya tidak cukup terdokumentasi, estimasi interval tidak terlihat pengguna, dan perilaku kartu baru/ulangan kedua tidak eksplisit. Pengguna meminta algoritma yang dapat diuji dan empat pilihan Again/Hard/Good/Easy.

**Keputusan.** Rating 0–3 dipetakan ke kualitas SM-2 2–5. Ease awal 2.5, delta `{-0.32, -0.14, 0, +0.10}`, dibatasi 1.3–3.0. Interval: Again 10 menit, interval 0, `lapses+1`; Hard 1 hari untuk kartu baru, selain itu `round(prev × 1.2)`; Good 1 hari untuk kartu baru, 6 hari untuk ulangan kedua, selain itu `round(prev × ease)`; Easy 2 hari baru, 8 hari ulangan kedua, selain itu `max(2, round(prev × ease × 1.3))`. Semua interval dibatasi 3.650 hari, dan `reps` selalu bertambah. `estimateInterval()` dipakai untuk label tombol rating. Sembilan unit test menutup rumus, batas ease, dan urutan interval.

**Alasan.** Pemetaan empat tombol ke SM-2 menjaga model tetap dapat dijelaskan dan diuji tanpa memaksa pengguna memahami enam kualitas. Estimasi interval membuat konsekuensi rating terlihat sebelum dipilih. Interval eksplisit untuk kartu baru/ulangan kedua mencegah lonjakan jadwal yang tidak masuk akal.

**Konsekuensi.** Ini **SM-2-inspired**, bukan implementasi penuh; parameter belum dikalibrasi terhadap data memori nyata. Semua `reviews` tetap disimpan agar formula dapat direvisi tanpa kehilangan histori. Perubahan rumus harus memperbarui tes dan dokumentasi, bukan hanya kode.

---

## ADR-030 — Latihan adaptif berbasis aturan + riwayat kuis dan statistik soal

**Konteks.** Kuis latihan lama memilih soal secara acak. Pengguna meminta soal yang sering salah dan kosakata jatuh tempo diprioritaskan, serta riwayat benar/salah, akurasi, waktu, dan kesalahan berulang. Tanpa data per soal, prioritas hanya bisa menebak.

**Keputusan.** `buildAdaptiveSession()` memberi bobot pada katalog: dasar akurasi `0.55 + (1 − accuracy) × 2.2`; soal salah ≥2 kali `×1.35`; hasil terakhir salah `×1.15`; kartu jatuh tempo `×1.65`; terlambat >3 hari `×1.25`; kartu baru `×1.1`; kartu mastered `×0.45`. Sesi menjamin satu soal per jenis yang tersedia, lalu mengisi kuota secara berbobot, membatasi dua soal per `contentRef`, dan memakai RNG deterministik bila seed diberikan. Dua tabel baru menyimpan `quiz_attempts` dan `question_stats`; `POST /api/progress/quiz` memanggil `recordQuizAttempt()`, yang menghitung ulang total/benar/skor dari daftar jawaban, mencatat XP, dan memperbarui statistik per soal dalam satu transaksi. XP kuis = `10 + round(skor/100 × 20)`, nol untuk mode lesson/exam.

**Alasan.** Aturan berbobot dapat dijelaskan, diuji, dan diubah tanpa model ML atau layanan eksternal. Menyimpan attempt dan statistik per soal memberi riwayat belajar nyata serta bahan untuk kalibrasi berikutnya. Menghitung ulang agregat di server mencegah klien menaikkan skor sesi secara langsung.

**Konsekuensi.** Bobot adalah heuristik, bukan IRT; parameter perlu dikalibrasi jika ada data penggunaan. Server masih mempercayai status benar/salah tiap jawaban dari klien, jadi ini bukan anti-cheat. Riwayat dibatasi 30 attempt di snapshot (UI menampilkan 6) dan 1.000 attempt saat impor; analitik jangka panjang memerlukan pagination/endpoint terpisah.

---

## ADR-031 — Permainan belajar sebagai domain murni + attempt server-authoritative

**Konteks.** Fase 6 meminta enam permainan edukatif dengan beberapa tingkat kesulitan, timer, petunjuk, penjelasan jawaban, pelacakan progres, pencapaian, dan kontrol mobile. Sebelumnya hanya ada empat komponen permainan lama (typing, memory, listening, sentence) yang tidak tercatat dan tidak memiliki validasi jawaban yang dapat diuji. Menambah logika permainan langsung di komponen akan menduplikasi timer, scoring, dan penjelasan di enam tempat serta membuat tes domain sulit.

**Keputusan.** Aturan permainan dipisahkan menjadi modul TypeScript murni di `src/lib/games/` (tanpa React/API): `morae.ts`, `word-builder.ts`, `kana-matching.ts`, `vocabulary-rush.ts`, `sentence-challenge.ts`, `kanji-challenge.ts`, `daily-challenge.ts`, dan `registry.ts`. Semua memakai RNG deterministik bila diberi seed dan mengembalikan struktur ronde yang dapat diperiksa unit test. UI memakai kit bersama `game-kit.tsx` dan `mcq-game.tsx`; empat komponen permainan lama dihapus setelah terbukti tidak diimpor, bukan dibiarkan sebagai kode mati.

Pembuat kata **tidak menerima rangkaian kana sembarang**. Input dinormalisasi NFKC lalu dicari di peta `VOCAB_BY_KANA`; hasilnya `correct`, `alternate` (kata sah lain dengan arti berbeda), `incomplete`, `invalid`, atau `empty`. Tantangan harian memilih soal deterministik dari `dateKey` + tingkat kesulitan dan selalu memakai opsi unik. Enam attempt disimpan di tabel baru `game_attempts`; `recordGame()` memvalidasi id/kesulitan, menolak `total <= 0`, meng-clamp nilai, membatasi detail 100 baris, lalu menghitung akurasi dan XP di server sebelum menulis attempt + activity dalam transaksi. Endpoint `POST /api/progress/game` menjadi satu-satunya jalur tulis; snapshot membawa 100 attempt terbaru dan statistik agregat.

**Alasan.** Domain murni membuat aturan permainan dapat diuji tanpa browser (35 tes baru), mencegah perbedaan perilaku antarpermainan, dan memisahkan konten dari presentasi. Validasi kamus memenuhi prinsip akurasi: aplikasi tidak boleh mengajarkan kata Jepang yang tidak ada. Menyimpan attempt di server memberi riwayat, pencapaian, dan statistik yang bertahan setelah reload, sedangkan pembatasan detail mencegah payload membengkak. Menghapus empat komponen lama menghindari dua implementasi permainan yang bersaing dan membingungkan pemelihara.

**Konsekuensi.** Server masih mempercayai status benar/salah per jawaban dari klien dan belum menilai ulang dari kunci konten; ini bukan anti-cheat. Pembuat kata hanya menerima kata yang ada di dataset 214 kosakata, sehingga kata sah di luar dataset ditolak sebagai `invalid` (bukan diklaim salah secara linguistik). Tantangan harian tidak memiliki rotasi server/kompetisi; determinisme berarti semua pengguna mendapat pola yang sama untuk tanggal+kesulitan. XP permainan adalah perkiraan berbasis akurasi/kesulitan, bukan ukuran penguasaan. Riwayat permainan dibatasi 100 attempt di snapshot, dan analitik jangka panjang memerlukan pagination. Skema bertambah satu tabel (total 10) tanpa `schema_version`; database lama mendapat tabel baru melalui `CREATE TABLE IF NOT EXISTS`.

---

## ADR-032 — Provider audio, rekaman lokal, dan ASR berbasis perbandingan teks

**Konteks.** Fase 7 meminta audio Jepang yang konsisten, latihan pelafalan dengan rekaman, pengenalan suara opsional, latihan menyimak bertingkat, dan panduan bunyi. `src/lib/speech.ts` sebelumnya hanya membungkus `speechSynthesis` dan mengembalikan boolean: kegagalan tidak dapat dibedakan dari pembatalan, tidak ada timeout, tidak ada umpan balik UI, dan tidak ada seam untuk penyedia audio lain. Halaman Pelafalan sudah merekam audio lokal, tetapi belum membatasi durasi, memberi perbandingan terarah, atau menangani browser tanpa pengenalan suara.

**Keputusan.**

1. **Provider audio.** `speech.ts` mengekspor kontrak `SpeechProvider` (`id`, `label`, `isAvailable()`, `speak()`, `cancel()`) dan registry provider. Provider browser `browser-synthesis` tetap default. `speakDetailed()` mengembalikan `SpeechPlaybackResult` berisi `ok`, `reason`, `providerId`, `voiceName`, dan `usedJapaneseVoice`; alasan dibatasi `unsupported | empty | cancelled | blocked | error | timeout`, dengan timeout 8–45 detik menurut panjang teks. `describeSpeechFailure()` memetakan alasan ke pesan Indonesia. `speak()` lama dipertahankan sebagai pembungkus boolean agar pemanggil materi tidak perlu ditulis ulang. Semua pemutaran memakai `lang=ja-JP` dan voice Jepang bila tersedia.

2. **Umpan balik pemutaran.** `SpeakButton` memakai `speakDetailed()` dan menampilkan toast hanya untuk kegagalan yang bukan pembatalan pengguna. `ListeningPlayer` memakai token urutan agar `playAll` dan `playLine` tidak saling tumpang tindih, membatalkan urutan lama, dan menampilkan alasan kegagalan.

3. **Rekaman lokal.** Halaman Pelafalan memakai `MediaRecorder` setelah klik eksplisit, menampilkan durasi, berhenti otomatis pada 30 detik, menyediakan putar ulang dan hapus, serta tidak pernah mengunggah rekaman ke server Kotoba. Izin mikrofon diminta hanya saat pengguna menekan tombol; penolakan/ketiadaan perangkat dipetakan ke pesan yang dapat ditindaklanjuti.

4. **ASR opsional berbasis teks.** `speech-recognition.ts` mendeteksi `SpeechRecognition` atau `webkitSpeechRecognition`, memakai `lang=ja-JP`, dan menyediakan normalisasi teks (NFKC, buang spasi/tanda baca, katakana→hiragana, pertahankan ー/々) serta jarak Levenshtein. Hasil dinilai `match` jika normalisasi sama, `close` jika kemiripan ≥ 0,75, selain itu `different`. Panel menjelaskan bahwa ini **perbandingan transkrip, bukan skor akustik**, bahwa browser/penyedia dapat mengirim audio ke layanan vendor, dan bahwa Kotoba tidak menyimpan audio/transkrip. Hook membatasi satu sesi 15 detik dan menangani `not-allowed`, `no-speech`, `audio-capture`, `network`, dan `language-not-supported`. Jika API tidak ada atau izin ditolak, panel menampilkan fallback dan perekam manual tetap menjadi jalur utama.

5. **Latihan menyimak.** 15 drill orisinal (3 per level N5–N1) disimpan sebagai konten bertipe `ListeningDrill`, dipetakan ke `Exercise` tipe `listening` oleh `listeningDrillExercises()`, dan dijalankan oleh `ExerciseRunner`. Karena `ExerciseRunner` sudah menyimpan attempt lewat `recordQuiz` ke `quiz_attempts`, tidak ada tabel atau endpoint baru. Halaman `/listening/practice` memfilter drill per level; dialog lama tetap tersedia untuk latihan percakapan.

6. **Panduan pelafalan.** Enam topik (vokal, konsonan, vokal panjang, sokuon, mora/irama, kesadaran pitch) disimpan di `pronunciation-guide.ts`, ditampilkan sebagai akordeon dengan audio per contoh, dan tidak mengklaim pengukuran pitch otomatis. Haiku Bashō yang dipakai adalah teks domain publik.

**Alasan.** Seam provider memungkinkan audio statis atau layanan TTS lain ditambahkan tanpa mengubah tombol materi. Hasil pemutaran terstruktur membuat kegagalan dapat dilaporkan jujur, bukan diam-diam dianggap berhasil. Membandingkan transkrip dapat diuji sepenuhnya di Node dan berguna tanpa layanan berbayar, tetapi tidak boleh dipresentasikan sebagai penilaian pelafalan akustik. Menyimpan rekaman hanya di tab menghormati privasi dan menghindari kebutuhan penyimpanan audio. Memakai `quiz_attempts` untuk drill menyimak menjaga model data tetap kecil.

**Konsekuensi.** Kualitas suara tetap bergantung perangkat; `ja-JP` dan pemilihan voice tidak menjamin voice Jepang terpasang. ASR tidak tersedia di semua browser, dapat memerlukan jaringan, dan dapat mengirim audio ke vendor; hasil teks juga bisa salah karena aksen atau kebisingan. Perbandingan Levenshtein tidak mengukur pitch, panjang vokal, sokuon, atau kualitas resonansi, sehingga UI tidak boleh memberi skor akustik. Rekaman hilang saat halaman ditutup dan dibatasi 30 detik. Latihan menyimak memakai TTS sintetis, bukan penutur asli. Provider eksternal dan penilaian akustik sesungguhnya memerlukan kebijakan privasi, penyimpanan audio, dan model evaluasi tersendiri sebelum diaktifkan.

---

## ADR-033 — Mesin ujian empat mode, skor belajar, dan kartu dari hasil ujian

**Konteks.** Fase 8 meminta ujian bergaya JLPT dengan lima level, lima kategori, empat mode (latihan, simulasi, topik, acak), timer, penanda soal, analitik kelemahan, pembahasan, ulang soal salah, dan penambahan kosakata sulit ke kartu. Modul lama hanya memiliki satu simulasi per level: `buildExam()` di `quiz.ts`, timer, tiga bagian, dan hasil dalam satu halaman. `ExerciseCard` tidak menampilkan teks bacaan, soal menyimak hanya memutar satu kalimat kunci, dan hasil tidak memiliki area lemah, rekomendasi, atau retry terarah. Ambang "lulus" lama (N5 80, N4 90, N3 95, N2 90, N1 100) juga tidak dapat dipertanggungjawabkan sebagai ambang JLPT resmi.

**Keputusan.**

1. **Engine murni dan reusable.** `src/lib/exam-engine.ts` menjadi satu-satunya pembangun kertas ujian untuk empat mode. `ExamPaper` membawa level, mode, timer, umpan balik, target, bagian, dan soal; `ExamQuestion` membawa kategori, konteks bacaan, transkrip, sumber konten, dan item kosakata/kanji. `buildMockExam()` memakai komposisi per level (N5 29 soal/25 menit sampai N1 41/60); `buildPracticeExam()` mendukung kategori tunggal/campuran; `buildTopicExam()` memfilter satu topik kosakata atau satu pola tata bahasa; `buildRandomExam()` memakai 20 soal seimbang; `buildRetryPaper()` hanya mempertahankan soal salah/kosong. Semua builder menerima RNG untuk tes deterministik.
2. **Level-first, fallback transparan.** Pemilihan soal memprioritaskan level yang dipilih lalu level lain bila konten kurang. `paper.mixedLevels` memberi tahu UI. Ini membuat N5 kaya tidak tercampur tanpa sengaja, tetapi level tinggi tetap dapat berlatih dengan jujur.
3. **Skor belajar, bukan kelulusan JLPT.** Hasil memakai `score = round(correct / total × 100)` dan `targetScore = 70`. UI menampilkan "Skor belajar", "Target latihan tercapai", dan disclaimer bahwa ini bukan nilai/sertifikasi JLPT. Kolom `passed` di tabel `exams` tidak diubah; nilainya kini berarti target latihan tercapai agar riwayat dan ekspor lama tetap kompatibel.
4. **Alur hub → sesi → hasil dengan `sessionStorage`.** Hub menyimpan `{ paper, startedAt }`; halaman sesi memulihkan timer dari `startedAt`, mendukung navigasi, penanda, periksa langsung untuk mode latihan/topik, dan konfirmasi keluar. Hasil lengkap disimpan di `sessionStorage`, lalu `recordExam(toExamPayload(result))` menyimpan ringkasan ke SQLite. Memisahkan halaman membuat hasil dapat dibuka ulang, refresh tidak menghapus timer, dan komponen sesi tidak menjadi satu halaman monolitik.
5. **Konteks soal nyata.** Soal membaca membawa judul, teks berfurigana, dan terjemahan; soal menyimak membawa dialog lengkap (bukan satu kalimat) dan transkrip yang baru terbuka setelah jawaban diperiksa/dikumpulkan. Ini menutup celah pemahaman yang sebelumnya tidak dapat diuji.
6. **Kartu dari hasil ujian.** `POST /api/progress/card` menerima `{ itemId, kind }`, memvalidasi item terhadap katalog Kosakata/Kanji, lalu `INSERT ... ON CONFLICT(item_id) DO NOTHING`. Operasi ini idempoten dan **tidak memberi XP atau activity**, karena menambah kartu bukan sesi ulasan. Ini mencegah petualangan XP lewat tombol berulang.
7. **Konten orisinal.** Semua soal dibangun dari konten Kotoba; tidak ada salinan soal JLPT atau bank soal komersial.

**Alasan.** Engine murni membuat empat mode, penilaian, dan analitik dapat diuji tanpa browser (17 tes baru) dan mencegah logika ujian tersebar di halaman. Memisahkan halaman sesuai fase ujian memberi alur yang dapat dipulihkan dan hasil yang dapat dibaca ulang, tanpa menambah tabel. Target 70% lebih jujur daripada ambang pseudo-JLPT yang tidak dapat diverifikasi. Validasi katalog pada `addCard` mencegah id palsu masuk ke SRS. Menampilkan bacaan dan dialog lengkap memenuhi kebutuhan pemahaman, bukan sekadar pilihan ganda.

**Konsekuensi.** Penilaian masih di klien dan server belum menilai ulang dari kunci konten; ini bukan anti-cheat. Mode/judul tidak disimpan di tabel `exams`, sehingga riwayat hanya menampilkan level/skor. Menutup tab menghapus sesi aktif; hasil terakhir juga hilang dari `sessionStorage` (riwayat SQLite tetap). N3–N1 masih bergantung pada fallback lintas level karena bank soal tipis. `buildExam()` lama tetap ada untuk tes kompatibilitas dan tidak dipakai UI; hapus atau migrasikan pada fase pembersihan. Tidak ada tabel/kolom baru; total tetap 10 tabel, dengan satu endpoint baru `/api/progress/card`.

---

## ADR-034 — Penemuan budaya enam kelompok, fakta deterministik, favorit server, dan kuis dari kosakata

**Konteks.** Fase 9 meminta bagian penemuan budaya yang menghubungkan bahasa Jepang dengan masyarakat dan hiburan: budaya, makanan, geografi, sejarah, anime, dan fakta bahasa. Fitur yang diminta mencakup fakta harian, fakta acak, penjelajahan kategori, favorit, kosakata terkait, kuis mini, materi belajar terkait, dan referensi yang dapat dipercaya. Konten anime harus menjelaskan makna, konteks, register, dan kelayakan pemakaian; ucapan fiksi yang dilebih-lebihkan tidak boleh diajarkan sebagai bahasa sehari-hari. Sebelumnya hanya ada 14 artikel dengan 7 kategori, tanpa sumber per artikel, kuis, favorit, atau penemuan fakta.

**Keputusan.**

1. **Dua sumbu taksonomi.** `CultureCategory` tetap menjadi kategori editorial artikel (tradisi, makanan, geografi, etiket, kehidupan, sejarah, anime, bahasa). `CultureGroup` adalah enam kelompok penemuan yang dipakai navigasi: budaya, makanan, geografi, sejarah, anime, bahasa. Pemetaan `CULTURE_GROUP_BY_CATEGORY` menggabungkan tradisi/etiket/kehidupan ke kelompok budaya. Ini menambah `bahasa` tanpa menulis ulang 14 artikel lama dan menjaga label kategori yang sudah dikenal.
2. **Artikel sebagai pabrik bertipe.** `src/content/culture/shared.ts` menyediakan `article()`, registry `CULTURE_SOURCES` (JNTO, Bunka, UNESCO, MAFF, GSI, JMA, Rekihaku, Britannica, Britannica Language, AJA, JPF), `buildCultureQuiz()`, `ORIGINAL_NOTE`, dan estimasi menit. Setiap artikel wajib memiliki `topics`, `sources`, `quiz`, dan `minutes`. 14 artikel inti dipertahankan; 19 artikel baru dipecah ke `src/content/culture/extra-*.ts` dan digabung `extras.ts`; total 33 artikel, 132 fakta, 66 soal kuis.
3. **Fakta harian yang aman untuk hidrasi.** `src/lib/culture-facts.ts` meratakan fakta menjadi `CultureFact[]` dengan id stabil. Fakta harian dipilih dari `daily:{YYYY-MM-DD}` menggunakan tanggal lokal. Hub memakai `useSyncExternalStore` dengan server snapshot `1970-01-01`, sehingga server dan klien tidak menghasilkan markup berbeda; setelah mount tanggal klien dipakai. Fakta acak memakai `random:{tanggal}:{offset}` dan menyediakan tautan ke artikel sumber.
4. **Favorit sebagai data server.** Tabel kesebelas `culture_favorites(article_id PRIMARY KEY, saved_at)` menyimpan artikel yang disimpan. `toggleCultureFavorite()` memvalidasi id terhadap `CULTURE_BY_ID`, memakai `INSERT ... ON CONFLICT DO NOTHING` agar idempoten, dan `DELETE` untuk menghapus. Favorit ikut `getSnapshot()`, ekspor, impor (divalidasi, maksimum 2.000), dan reset. Endpoint `POST /api/progress/favorite`. Favorit sengaja tidak memberi XP karena menyimpan bacaan bukan sesi belajar.
5. **Kuis mini dari kosakata, bukan skor pemahaman.** Setiap artikel menghasilkan dua soal dari dua kosakata pertama: arti dan bacaan. Pengecoh diambil dari kosakata artikel lain dan dirotasi deterministik. Kuis menampilkan umpan balik langsung, penjelasan, jumlah benar, dan tombol ulangi; tidak menulis attempt, tidak memberi XP, dan tidak mengklaim menilai pemahaman seluruh artikel. Ini menjaga kuis tetap jujur dan tidak menggandakan mesin ujian.
6. **Sumber dan batas klaim budaya.** Setiap artikel menampilkan tiga tautan organisasi sebagai bacaan lanjutan dengan `rel="noopener noreferrer"`, plus `sourceNote` bahwa teks adalah ringkasan edukatif orisinal, bukan terjemahan sumber. UI menyatakan bahwa kebiasaan Jepang bervariasi menurut daerah, generasi, dan konteks; tidak ada klaim bahwa semua orang Jepang berperilaku sama. Ini adalah atribusi tingkat organisasi, bukan kutipan per kalimat.
7. **Anime sebagai materi kesadaran register.** Register diperluas menjadi `standar`, `formal`, `kasual`, `slang`, `arkais`, dan `anime`. Artikel honorifik, role language, dan ungkapan anime menjelaskan makna, konteks, dan kelayakan; ada peringatan agar ucapan karakter fiksi tidak dipakai di situasi formal. Konten hanya memakai ungkapan generik (mis. 行くぞ, やれやれ, しょうがない) tanpa menyalin dialog atau gambar karakter berhak cipta.
8. **Jembatan ke materi belajar.** Setiap istilah budaya menaut ke `/vocabulary?q=...`; halaman Kosakata membaca `q` dan `topic` dari URL. Detail artikel menampilkan tiga materi terkait sesuai kelompok. Ini memenuhi prinsip bahwa budaya adalah suplemen belajar, bukan feed terpisah.

**Alasan.** Memisahkan kategori editorial dari kelompok navigasi menghindari migrasi konten yang tidak perlu dan memberi enam pintu masuk yang jelas. Pabrik artikel memastikan setiap artikel baru otomatis memiliki kuis, sumber, dan estimasi menit, sehingga kualitas tidak bergantung pada ingatan penulis. Favorit di server membuat status bertahan setelah reload dan ikut ekspor, sementara kuis yang dihasilkan dari kosakata tidak memerlukan bank soal tambahan dan tetap dapat diuji. Fakta harian deterministik memberi pengalaman “hari ini” tanpa endpoint baru; tanggal lokal lebih ramah daripada memaksa UTC. Sumber tingkat organisasi adalah kompromi yang jujur: lebih baik daripada tanpa rujukan, tetapi tidak berpura-pura menjadi sitasi akademik per kalimat.

**Konsekuensi.** 33 artikel masih teks tanpa ilustrasi dan belum mewakili seluruh wilayah/tradisi. Kuis hanya menguji arti dan bacaan kosakata, bukan pemahaman menyeluruh. Fakta harian bergantung tanggal perangkat; pengguna di zona waktu berbeda dapat melihat fakta berbeda. Semua fakta berasal dari 33 artikel; menambah fakta berarti menambah artikel atau mengubah artikel. Daftar artikel ditampilkan penuh tanpa paginasi sehingga halaman mobile panjang. Favorit mengikuti satu profil lokal dan belum ada sinkronisasi. Skema bertambah satu tabel (total 11) tanpa `schema_version`; database lama mendapat tabel baru lewat `CREATE TABLE IF NOT EXISTS`. Route API bertambah satu (total 16).

---

## ADR-035 — Target belajar personal dihitung dari data yang sudah ada, bukan tabel target terpisah

**Konteks.** Sebelum Fase 10, pengguna hanya dapat mengatur target XP harian. Fase 10 meminta target durasi belajar, jumlah kosakata, jumlah pelajaran, frekuensi mingguan, serta dasbor yang dapat menunjukkan kemajuan terhadap target tersebut. Pilihan pertama adalah menambah tabel `goals` berisi target dan progres harian; pilihan kedua adalah menyimpan konfigurasi target di `settings` dan menghitung progres dari `activity`, `reviews`, dan `lessons`.

**Keputusan.** Target disimpan sebagai empat field baru di `Settings`: `dailyStudyMinutes` (default 30), `dailyVocabTarget` (default 10), `dailyLessonTarget` (default 1), dan `weeklyFrequency` (default 5). Nilai di-clamp server-side: menit 5–240, kosakata 1–100, pelajaran 1–10, frekuensi 1–7; UI menawarkan pilihan yang lebih sempit (15–90 menit, 5–50 kata, 1–4 pelajaran, 3/5/7 hari). Target XP tetap `dailyGoalXp`. Tidak ada tabel target dan tidak ada penulisan progres target terpisah.

`goalProgress()` di `src/lib/goals.ts` menurunkan progres hari ini dari data yang sudah tersimpan: menit/XP dari `activity`, kosakata dari `reviews.kind === "vocab"` yang tanggal lokalnya hari ini (unik per item), dan pelajaran dari `lessons.completedAt`. `weeklyGoal()` menghitung hari aktif Senin–Minggu dari activity (XP, ulasan, atau menit > 0) dan menampilkan tujuh chip harian. Progres mingguan adalah **indikator konsistensi**, bukan syarat membuka fitur, dan nilainya dibatasi pada target agar UI tidak menampilkan “6/5”.

**Alasan.** Menyimpan target di settings menghindari duplikasi sumber kebenaran: tidak mungkin ada baris target yang tertinggal saat activity berubah, ekspor/impor tetap satu snapshot, dan target dapat diubah tanpa migrasi tabel. Menurunkan progres dari log juga membuat angka dapat diaudit: setiap angka di UI dapat ditelusuri ke activity/review/lesson yang benar-benar ada. Tidak ada hukuman atau penguncian saat target tidak tercapai; target adalah alat bantu, bukan gamifikasi paksa.

**Konsekuensi.** Perubahan target berlaku surut untuk hari yang sedang berjalan, karena progres dihitung ulang dari data hari itu. Riwayat target tidak disimpan; ekspor hanya membawa target saat ini. Tanggal “hari ini” memakai tanggal lokal perangkat untuk tampilan dan tanggal lokal server saat menulis activity. Pada deployment dengan server dan pengguna berbeda zona waktu, batas hari dapat bergeser; ini dicatat sebagai batasan dan solusi masa depannya adalah timezone profil atau tanggal lokal klien yang tervalidasi. Snapshot activity dibatasi 400 hari, sehingga target mingguan yang lebih lama tidak dapat direkonstruksi dari UI.

---

## ADR-036 — Kamus pribadi memakai saved_items/saved_collections, terpisah dari SRS

**Konteks.** Roadmap menyebut “bookmark” sebagai fitur P0, tetapi kebutuhan Fase 10 lebih luas: menyimpan kosakata, kanji, dan pola tata bahasa; menambahkan catatan pribadi; mengelompokkan ke koleksi; dan mengulas materi tersimpan. Tata bahasa tidak memiliki kartu SRS, sehingga memaksakan semua materi ke tabel `cards` akan merusak model SRS yang sudah ada. Sebaliknya, membuat tabel bookmark generik tanpa catatan/koleksi tidak memenuhi kebutuhan.

**Keputusan.** Dua tabel baru ditambahkan secara additive:

```sql
saved_collections(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)

saved_items(
  kind TEXT NOT NULL CHECK (kind IN ('vocabulary','kanji','grammar')),
  ref_id TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  collection_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (kind, ref_id)
)
```

`kind + refId` adalah identitas item; satu materi hanya dapat disimpan sekali. Catatan dibatasi 1.000 karakter di UI/service. `collectionId` boleh null; menghapus koleksi mengosongkan referensi item (`UPDATE ... SET collection_id = NULL`), bukan menghapus materi. Nama koleksi dibatasi 60 karakter dan deskripsi 240 karakter. Id koleksi baru dibuat server. Endpoint `POST /api/progress/saved` dan `POST /api/progress/collections` memakai pola `{ ...payload, remove?: boolean }` untuk simpan/hapus; keduanya idempoten dan **tidak memberi XP atau activity**.

Halaman `/dictionary/collections` menampilkan materi tersimpan, filter jenis/koleksi, pencarian catatan, serta `SavedItemsReview` untuk mengulang materi secara mandiri. Ulasan tersimpan **tidak** memanggil `recordReview`, tidak mengubah `dueAt/ease/reps`, dan tidak masuk statistik SRS. Tombol “Buka materi” menaut ke halaman asli.

**Alasan.** Memisahkan kamus pribadi dari SRS menjaga dua makna yang berbeda: SRS menjadwalkan ingatan jangka panjang untuk kosakata/kanji, sedangkan kamus pribadi adalah kumpulan materi yang disengaja pengguna, termasuk tata bahasa yang tidak punya jadwal. Catatan dan koleksi membutuhkan kolom sendiri; menumpangkannya ke `cards` akan membuat kartu tanpa jadwal dan merusak query due. Operasi tanpa XP mencegah pengguna mengumpulkan XP hanya dengan menekan simpan berulang kali.

**Konsekuensi.** Materi tersimpan dan koleksi ikut `exportSnapshot`, `importProgress`, dan `resetProgress`; impor memvalidasi id katalog dan hanya mempertahankan `collectionId` yang ada di snapshot. Tidak ada pencarian teks penuh atau pagination server; snapshot membawa semua item tersimpan, sehingga koleksi yang sangat besar akan memperbesar payload. Ini bukan pengganti bookmark bacaan/budaya yang lebih umum; `Bookmark` tetap tipe yang direncanakan. Skema bertambah dua tabel (total 13) tanpa `schema_version`; database lama mendapat tabel kosong lewat `CREATE TABLE IF NOT EXISTS`.

---

## ADR-037 — Rekomendasi explainable berbasis aturan dan tanggal lokal

**Konteks.** Dasbor sudah menampilkan “rekomendasi berikutnya” dari katalog, tetapi belum memakai kelemahan nyata pengguna. Fase 10 meminta rekomendasi yang dapat dijelaskan dan berbasis data: pelajaran yang perlu diperbaiki, kosakata yang sering salah, tata bahasa berakurasi rendah, kartu jatuh tempo, dan latihan. Pilihan ML/embedding ditolak karena data satu pengguna masih kecil, tidak ada layanan model, dan rekomendasi harus dapat diaudit.

**Keputusan.** `src/lib/recommendations.ts` menghasilkan maksimal empat kartu dengan urutan prioritas: kartu jatuh tempo (100), kosakata lemah (80), tata bahasa lemah (70), pelajaran bernilai <80 (60), bagian ujian <70% (50), pelajaran berikutnya (40), dan sisa target XP (30). Setiap objek membawa `id`, `kind`, `title`, `description`, `reason`, `evidence`, `actionLabel`, `href`, ikon, tone, dan `priority`.

Sumber bukti dibatasi pada data snapshot: `questionStats` (minimal 2 percobaan) dipetakan ke kosakata lewat pola id `ex-vocab-...` dan ke tata bahasa lewat `ex-grammar-...`/id praktik; kartu dengan `lapses >= 2` dapat menjadi bukti tambahan; `lessons` dibandingkan dengan `CURRICULUM_LESSONS`; `exams[].sections` dipakai untuk bagian di bawah 70%. Rekomendasi “pelajaran berikutnya” tidak pernah menunjuk pelajaran yang sudah selesai. `evidence` menampilkan angka yang dipakai (mis. “20% benar dari 5 percobaan”), dan `reason` menjelaskan mengapa angka itu penting. Jika tidak ada data yang cukup, kartu tidak dibuat; UI menampilkan empty state yang jujur, bukan rekomendasi palsu.

Semua perhitungan tanggal untuk target, streak, kalender, tren, dan rekomendasi memakai `toDateKey()` (tanggal lokal) dan minggu dimulai Senin. Tidak ada panggilan jaringan atau data yang dikirim ke layanan luar.

**Alasan.** Aturan deterministik dapat diuji tanpa browser, mudah dijelaskan kepada pemelajar, dan tidak menyembunyikan keputusan di balik model yang tidak transparan. Menampilkan alasan dan bukti memenuhi prinsip “explainable”: pengguna dapat menilai apakah saran relevan. Prioritas berbasis tindakan mendahulukan ulangan yang sudah jatuh tempo, lalu kelemahan yang terbukti, sebelum menambah materi baru.

**Konsekuensi.** Bobot dan ambang adalah heuristik, bukan model pedagogis tervalidasi; perlu kalibrasi jika ada data penggunaan nyata. Rekomendasi hanya sebaik data yang tersimpan: snapshot membatasi 400 activity, 120 review, 30 quiz attempt, 20 exam, dan 100 game, sehingga kelemahan lama bisa hilang dari saran. Pola id soal harus dijaga saat konten berubah; jika pola berubah, tes rekomendasi dan pemetaan harus ikut diperbarui. Tanggal lokal konsisten untuk satu mesin, tetapi deployment lintas zona waktu memerlukan timezone eksplisit; tanpa itu, “hari ini” dapat berbeda antara server dan browser.

---

## ADR-038 — Fase 11 memilih fitur lanjutan berdasarkan nilai edukasi, bukan mengejar seluruh daftar

**Konteks.** Permintaan Fase 11 mencantumkan sembilan kandidat: kamus Jepang, Kanji Explorer, latihan menulis, latihan membaca, simulator percakapan, latihan mengetik, rencana belajar personal, pembelajaran offline, dan halaman sumber belajar. Sebagian sudah ada sebagian atau seluruhnya; sebagian lain berisiko tinggi. Menambahkan semuanya akan memperbesar permukaan aplikasi tanpa jaminan peningkatan belajar.

**Keputusan.** Kandidat dinilai dari nilai edukasi, dampak UX, kompleksitas, risiko pemeliharaan, dan performa. Yang dipilih: **simulator percakapan**, **latihan mengetik Jepang**, dan **rencana belajar personal**, ditambah penguatan kecil kamus (kosakata terkait) dan kanji (kanji beradikal sama). Latihan menulis/urutan goresan, PWA/offline penuh, halaman resource, dan ekspansi bacaan ditunda. Kamus, Kanji Explorer, dan latihan membaca tidak diduplikasi karena sudah berfungsi; yang ditambahkan hanya bagian yang benar-benar kosong.

**Alasan.** Tiga fitur terpilih menutup celah yang berbeda: produksi bahasa (mengetik), penggunaan bahasa dalam konteks (percakapan), dan perencanaan belajar (rencana). Latihan menulis membutuhkan data urutan goresan yang belum ada; menampilkan data karangan akan melanggar prinsip akurasi. Offline penuh membutuhkan sinkronisasi dan penanganan konflik yang belum menjadi masalah nyata pada aplikasi satu perangkat. Halaman resource statis mudah usang dan nilai tambahnya lebih kecil daripada biaya kurasi.

**Konsekuensi.** Fase 11 tidak menambah tabel atau endpoint; semua fitur memakai settings, lessons, dan recordSession yang sudah ada. Fitur yang ditunda tetap tercatat di PROJECT_STATUS/FEATURE_ROADMAP, bukan dianggap selesai. Penambahan berikutnya harus melewati evaluasi yang sama, bukan hanya mengejar daftar fitur.

---

## ADR-039 — Simulator percakapan memakai skenario orisinal dan penilaian lokal, bukan AI percakapan

**Konteks.** Percakapan sehari-hari adalah keterampilan yang tidak tercakup oleh kartu SRS dan kuis. Pilihan implementasi: (a) integrasi model bahasa/chatbot, (b) API percakapan berbayar, atau (c) skenario bertipe dengan pilihan jawaban. Opsi (a)/(b) menambah biaya, ketergantungan jaringan, dan risiko jawaban tidak konsisten; aplikasi juga belum memiliki auth atau moderasi.

**Keputusan.** Enam skenario orisinal N5–N4 ditulis sebagai data bertipe: perkenalan formal, restoran, toko pakaian, arah, teman lama, dan tiket kereta. Setiap skenario memiliki 3–4 langkah (total 19), tiga pilihan per langkah, satu jawaban yang cocok secara konteks/register, umpan balik untuk pilihan yang tidak cocok, frasa kunci, dan catatan budaya. Pilihan salah tetap gramatikal; kesalahannya adalah register/konteks. Skor dihitung dari langkah yang benar pada percobaan pertama, disimpan melalui recordLesson dengan kind conversation (XP 20). Tidak ada tabel baru; transkrip hanya ditampilkan di sesi dan tidak disimpan.

**Alasan.** Skenario bertipe dapat diuji tanpa jaringan, konsisten untuk semua pengguna, dan memungkinkan penjelasan why yang spesifik. Ini lebih jujur daripada chatbot yang dapat menghasilkan bahasa tidak akurat atau menilai percakapan tanpa dasar. Register adalah bagian data, bukan hiasan; pilihan formal/kasual diberi label agar pemelajar tidak menyimpulkan bahwa semua bentuk sopan sama.

**Konsekuensi.** Konten percakapan terbatas pada enam situasi dan tidak dapat berimprovisasi. Skor bukan penilaian pragmatik menyeluruh dan tidak menggantikan percakapan nyata. Menambah skenario berarti menambah data + tes validasi satu jawaban benar per langkah. Integrasi AI dapat dipertimbangkan nanti sebagai fitur opsional dengan fallback, bukan jalur utama.

---

## ADR-040 — Latihan mengetik memakai pemeriksaan string lokal dan alias romaji eksplisit

**Konteks.** Pemelajar perlu berlatih menghasilkan bahasa Jepang, bukan hanya memilih jawaban. Mengetik dengan IME adalah keterampilan nyata, tetapi tidak semua perangkat memiliki IME Jepang. Pemeriksaan server-side per ketikan akan memperlambat latihan dan menyimpan data yang tidak diperlukan.

**Keputusan.** Tiga mode: **Kana → Romaji** (tanpa IME), **Romaji → Kana**, dan **Arti → Kanji** (dua mode terakhir memerlukan IME). Jawaban diperiksa di browser. Romaji dinormalisasi (huruf kecil, spasi dibuang) dan menerima alias umum: si→shi, ti→chi, tu→tsu, hu→fu, zi/di→ji, du→zu, sya/syu/syo→sha/shu/sho, tya/tyu/tyo→cha/chu/cho, zya/zyu/zyo/jya/jyu/jyo→ja/ju/jo. Jawaban Jepang memakai NFKC, trim, dan pembuangan spasi tanpa menyamakan kana/kanji. Sesi 5/10/15 soal, deterministik dengan seed, timer, akurasi, dan tinjauan. Penyelesaian disimpan sebagai lesson typing (XP 20) dan sesi latihan; tidak ada ketikan yang dikirim ke server.

**Alasan.** Latihan mengetik harus responsif dan privat; memeriksa lokal menghilangkan latensi dan mengurangi data sensitif. Alias romaji mencerminkan input nyata tanpa menerima ejaan yang salah. Memisahkan mode tanpa IME memberi jalur masuk bagi pemula, sementara mode IME mengajarkan produksi aksara yang sebenarnya.

**Konsekuensi.** Pemeriksaan lokal bukan anti-cheat dan tidak menilai kualitas IME secara mendalam. Mode IME tidak dapat dipakai di perangkat tanpa IME; UI menjelaskan batas ini. Normalisasi sengaja tidak menyamakan kana dan kanji karena perbedaan tulisan adalah bagian dari latihan.

---

## ADR-041 — Rencana belajar adalah proyeksi deterministik dari katalog, progres, dan preferensi

**Konteks.** Pengguna membutuhkan jadwal yang realistis menuju level JLPT tertentu. Pilihan pertama adalah menyimpan daftar tugas/jadwal di database; pilihan kedua adalah menghasilkan rencana saat dibutuhkan dari data yang sudah ada. Pilihan pertama mudah menjadi basi ketika pengguna menyelesaikan pelajaran atau mengubah target.

**Keputusan.** Dua field baru di Settings: studyTargetLevel (N5–N1 atau null) dan studyTargetWeeks (clamp 4–104; UI 8/12/16/24/36; default 12). buildStudyPlan() menerima snapshot, target, dan tanggal, lalu: menentukan level berjalan dari progres; mengambil pelajaran yang belum selesai pada rentang level; menghitung anggaran mingguan max(30, round(weeklyMinutes × 0.75)); membagi pelajaran secara greedy ke minggu; menghitung requiredWeeks, recommendedWeeks, dan feasibility (longgar ≤0.75, realistis ≤1, ketat ≤1.3, tidak-realistis >1.3); serta menghasilkan milestone dan saran. Rencana **tidak disimpan** sebagai tabel tugas; selalu dihitung ulang.

**Alasan.** Proyeksi dari data nyata tidak bisa basi dan tidak memerlukan migrasi. Pengguna dapat melihat konsekuensi target secara langsung: memperpendek minggu meningkatkan kepadatan, dan UI menawarkan minggu yang lebih panjang bila tidak realistis. Tidak ada klaim AI atau prediksi kelulusan; ini alat bantu ritme.

**Konsekuensi.** Rencana bergantung pada estimasi menit katalog dan asumsi ulangan 25%—bukan jadwal personal yang dioptimalkan. Tanggal memakai zona waktu lokal, sehingga deployment lintas zona waktu memerlukan timezone eksplisit. Jika target di bawah level berjalan, rencana menyesuaikan ke level berjalan dan menandai targetAdjusted. Perubahan target langsung mengubah rencana, bukan histori.

---

## ADR-042 — Tidak menampilkan urutan goresan atau komponen kanji tanpa data yang terverifikasi

**Konteks.** Permintaan Fase 11 mencakup latihan menulis dan Kanji Explorer dengan urutan goresan/komponen. Proyek memiliki jumlah goresan, radikal, on/kun, arti, dan contoh kata, tetapi tidak memiliki data urutan goresan per kanji yang terverifikasi maupun lisensi dataset komponen. Menampilkan animasi atau urutan yang ditebak akan melanggar prinsip akurasi dan berpotensi mengajarkan cara menulis yang salah.

**Keputusan.** Fase 11 tidak membuat animasi urutan goresan, penelusuran goresan, atau klaim komponen kanji. Detail kanji hanya menampilkan data yang sudah terverifikasi: jumlah goresan, radikal, on/kun, arti, contoh, mnemonik, dan **kanji beradikal sama**. Latihan menulis ditunda sampai ada dataset urutan goresan yang jelas asal-usulnya dan lisensinya.

**Alasan.** Lebih baik tidak memiliki fitur daripada menampilkan data linguistik yang tidak dapat dipertanggungjawabkan. Jumlah goresan dapat diperiksa, tetapi arah dan urutan goresan tidak dapat disimpulkan hanya dari bentuk akhir. Menambahkan gambar berhak cipta juga bukan pilihan.

**Konsekuensi.** Kanji Explorer belum menjadi alat menulis; pengguna diarahkan ke kamus kanji tepercaya untuk urutan goresan. Jika dataset terverifikasi tersedia, fitur dapat ditambahkan sebagai lapisan baru tanpa mengubah model kanji saat ini.

---

## ADR-043 — Batas keamanan lokal, bukan autentikasi setengah jadi

**Konteks.** Audit Fase 12 menemukan blocker: seluruh API progres terbuka tanpa autentikasi, dan server default mengikat semua antarmuka. Aplikasi memang dirancang satu pengguna/satu perangkat, tetapi binding publik + API tanpa auth membuat siapa pun di jaringan dapat membaca, mereset, atau mengimpor progres. Pilihan yang dipertimbangkan: (a) menambahkan autentikasi penuh sekarang, (b) membiarkan dan mendokumentasikan risiko, (c) memperkeras batas lokal tanpa mengklaim multi-pengguna.

**Keputusan.** Memilih (c) untuk Fase 12, dengan seam auth ADR-016 tetap terbuka. Implementasi: `dev`/`start` mengikat `127.0.0.1`; `src/proxy.ts` menolak Host non-loopback dengan 421; semua tulisan wajib `application/json` dan same-origin (415/403) memakai `Sec-Fetch-Site`/`Origin`; body maksimum 5 MiB (413); CSP + nosniff + frame DENY + referrer + permissions + COOP; health hanya `{ok,version}`; error internal disanitasi; DB/direktori 0700/0600; impor memakai envelope `{confirm:true,snapshot}` dan pratinjau. Auth/TLS/rate limit tetap **tidak** ada.

**Alasan.** Auth setengah jadi (misalnya token statis di klien) akan memberi rasa aman palsu dan menambah permukaan serangan. Batas lokal menutup vektor nyata (CSRF sederhana, DNS rebinding, body raksasa, kebocoran error) tanpa mengubah alur belajar satu pengguna. Ini juga menjaga kompatibilitas database dan tidak memaksa login pada aplikasi lokal.

**Konsekuensi.** Aplikasi **tidak boleh** diekspos ke LAN/publik sebagaimana adanya; reverse proxy harus menambah TLS + auth dan allowlist Host perlu disesuaikan. Request non-browser dengan header lengkap masih dapat menulis; progres tetap client-authoritative. CSP memakai `unsafe-inline` karena theme boot script; nonce/hash belum ada. Host allowlist bukan pengganti auth, dan pengguna lokal lain/malware tetap dapat membaca file DB.

---

## ADR-044 — Koreksi konten adalah bagian dari quality gate, bukan penambahan materi

**Konteks.** Audit konten Fase 12 menemukan 4 temuan high, 6 medium, 7 low, dan 1 uncertain. Contoh: soal grammar dengan lebih dari satu jawaban benar, soal pemahaman yang menanyakan frasa yang tidak ada di bacaan, opsi pengecoh yang sebenarnya gramatikal, salah baca pada contoh kosakata, serta beberapa ketidaktepatan terjemahan/register. Tes struktural yang ada memeriksa bentuk dan referensi, tetapi tidak dapat menangkap ambiguitas semantik.

**Keputusan.** Memperbaiki temuan sebagai koreksi linguistik, bukan menambah pelajaran baru. Perbaikan mencakup: mengganti pengecoh ambigu dengan bentuk yang jelas tidak gramatikal; memperbaiki kunci susun kalimat yang menunjuk urutan tidak valid; menambahkan frasa yang ditanyakan pada bacaan dan menyelaraskan terjemahan; memperbaiki bacaan 九/月, 天, 来, 四, 風邪, エンジニア; menghapus kontradiksi percakapan restoran; menambah alias romaji `wo`/`nn`; memperjelas label register dan catatan budaya. Gaya romanisasi/loanword yang tidak seragam dicatat sebagai batasan, bukan dipaksa seragam.

**Alasan.** Akurasi bahasa adalah prinsip produk. Jawaban benar ganda membuat latihan tidak adil dan merusak kepercayaan; teks yang menanyakan hal yang tidak ada membuat soal tidak dapat dijawab. Memperbaiki konten yang ada lebih berharga daripada menambah 10 soal baru dengan kualitas serupa.

**Konsekuensi.** Beberapa id/kunci soal berubah, sehingga attempt lama yang merujuk soal tersebut tetap tersimpan sebagai histori tetapi tidak dapat dibandingkan satu per satu dengan kunci baru. Jumlah konten tidak bertambah. Tes tetap tidak menggantikan review penutur asli; audit berikutnya perlu memasukkan pemeriksaan semantik/soal, bukan hanya validasi bentuk.

---

## ADR-045 — Font sistem, tanpa font web pihak ketiga

**Konteks.** Audit performa menemukan Google Fonts sebagai stylesheet render-blocking: sekitar 693 KB / 183 KB gzip, 764 `@font-face`, dan Noto Serif JP tidak dipakai di UI (hanya didefinisikan). Ini juga bertentangan dengan klaim aplikasi tanpa layanan pihak ketiga dan menambah ketergantungan jaringan saat belajar.

**Keputusan.** Menghapus seluruh `preconnect` dan stylesheet Google Fonts dari `src/app/layout.tsx`. Tipografi memakai stack sistem: sans untuk UI, stack Jepang (Hiragino/Yu Gothic/Noto Sans JP/Meiryo/Droid Sans Fallback) untuk teks Jepang, dan serif Jepang sebagai fallback. CSP `font-src 'self' data:`; tidak ada permintaan font eksternal.

**Alasan.** Font sistem tidak menambah transfer, tidak memblokir render, tetap bekerja offline, dan menghilangkan permintaan ke pihak ketiga. Noto Serif yang tidak dipakai adalah dead weight. Untuk aplikasi belajar teks Jepang, keterbacaan stack sistem sudah memadai dan pengguna dapat memakai font pilihan perangkat.

**Konsekuensi.** Tampilan Jepang dapat berbeda antar perangkat; bentuk kanji bergantung font yang tersedia. Tidak ada jaminan tampilan identik atau bobot font tertentu. Jika suatu saat perlu font khusus, gunakan `next/font/local` dengan subset yang di-host sendiri, bukan stylesheet remote; ukur dampak sebelum menambah.


---

## ADR-046 — Backlog concern terpusat dan triase lintas fase

**Konteks.** Dua belas fase pengembangan menghasilkan temuan keamanan, konten, aksesibilitas, performa, arsitektur, dan fitur opsional yang tersebar di PROJECT_STATUS, ARCHITECTURE, DATA_MODEL, DECISIONS, dan FEATURE_ROADMAP. Beberapa item sudah diperbaiki, beberapa ditunda, beberapa ditolak, dan beberapa bergantung pada data eksternal. Tanpa satu register status, item yang ditunda mudah hilang, keputusan penolakan mudah dibuka ulang tanpa konteks, dan rekomendasi audit dapat disalahartikan sebagai kewajiban implementasi.

**Keputusan.** Menetapkan `CONCERNS_BACKLOG.md` sebagai sumber tunggal status concern lintas fase. Setiap concern memiliki ID stabil, fase asal, alasan pentingnya, risiko/dependensi, prioritas P0–P3, kompleksitas S/M/L/XL, status (OPEN, ACCEPTED, IN_PROGRESS, RESOLVED, DEFERRED, REJECTED, BLOCKED), dan keputusan/target. `ACCEPTED` berarti disetujui untuk perencanaan fase berikutnya, bukan sudah diimplementasikan. `DEFERRED` wajib punya pemicu; `BLOCKED` wajib menyebut dependensi; `REJECTED` wajib punya alasan. Register ditinjau pada setiap penutupan fase dan pada fase konsolidasi akhir. ADR tetap menjadi tempat keputusan arsitektur; backlog tidak menggantikan ADR. Tidak ada kewajiban mengimplementasikan seluruh item.

**Alasan.** Traceability lebih penting daripada daftar tugas yang terus bertambah. Memisahkan status (“apa yang belum selesai”) dari keputusan (“mengapa arah ini dipilih”) mencegah duplikasi, memudahkan handoff, dan menjaga agar audit berikutnya tidak mengulang perdebatan yang sama. Register juga memaksa setiap penolakan dan penundaan memiliki alasan yang dapat diperiksa.

**Konsekuensi.** Dokumentasi harus diselaraskan dengan register; jumlah dan status dapat berubah setiap fase. Register bukan mandate implementasi dan tidak boleh dipakai untuk memasukkan scope baru tanpa persetujuan. Item P0/P1 yang diterima tetap memerlukan tugas, tes, dan review tersendiri. Pada penutupan Fase 12 register berisi 86 concern: 15 RESOLVED, 22 ACCEPTED untuk Fase 13, 44 DEFERRED, 2 BLOCKED, dan 3 REJECTED.



---

## ADR-047 — Konsolidasi Fase 13: pilih item yang menutup risiko, bukan seluruh backlog

**Konteks.** Register Fase 12 memuat 86 concern dengan 22 item ACCEPTED untuk Fase 13. Mengerjakan semuanya berarti menulis 50–60 pelajaran N4, bank soal N3–N1, E2E/axe/testing-library, Git, observability, refaktor katalog, dan migrasi id dalam satu fase. Itu bukan konsolidasi; itu perluasan scope yang berisiko menurunkan kualitas fitur yang sudah berjalan.

**Keputusan.** Fase 13 mengimplementasikan item yang menutup risiko correctness/data/quality gate dan dapat diselesaikan tanpa mengubah skema: backup/restore SQLite; delapan LessonPlan N5 membaca/menyimak; validator QA semantik; CI check + build + audit produksi; perbaikan reflow 320 px; label/aria status non-warna; CHANGELOG; dan pemetaan status seluruh concern. Item lain ditunda dengan pemicu tertulis: N4/N3–N1 (fase konten berikutnya), E2E/axe/tes komponen/perf budget (butuh dependency dan baseline stabil), Git (keputusan operasional), refaktor katalog/exam chunk (belum ada bukti dampak yang cukup), observability (belum ada deployment publik). Tidak ada item REJECTED yang dibuka kembali.

**Alasan.** Prioritas diberikan pada hal yang mencegah kehilangan data, menangkap soal ambigu, dan menjaga regresi, bukan pada penambahan permukaan produk. Delapan LessonPlan memakai konten yang sudah diaudit sehingga nilai belajar naik tanpa menulis klaim linguistik baru. Backup/restore dan CI adalah prasyarat operasional yang murah dan teruji. Sebaliknya, menulis konten N4 secara tergesa-gesa akan melemahkan prinsip akurasi.

**Konsekuensi.** Status backlog berubah dari 22 ACCEPTED menjadi 11 RESOLVED dan 11 DEFERRED (lihat register). Fase 13 tidak menambah tabel/endpoint. Pengguna belum mendapatkan konten N4; itu tetap celah terbesar dan menjadi fokus jalur konten P0 terpisah, bukan Fase 14 yang hanya audit/perencanaan. E2E/axe tetap manual, sehingga regresi browser tidak otomatis tertangkap.

---

## ADR-048 — Backup/restore SQLite eksplisit, bukan backup otomatis di server

**Konteks.** Impor mengganti seluruh progres dan SQLite adalah satu file. Sebelum Fase 13 tidak ada prosedur backup/restore yang teruji; pengguna hanya bisa mengekspor JSON manual.

**Keputusan.** Menambahkan CLI `scripts/backup-db.mjs` dengan perintah backup, verify, restore, retensi `--keep` (default 7), dan output JSON. Backup memakai `VACUUM INTO` ke file bertimestamp, lalu `PRAGMA integrity_check`; direktori backup 0700 dan file 0600. Restore memerlukan `--yes`, memverifikasi sumber, menyimpan salinan `pre-restore`, dan memverifikasi hasil. Backup tidak berjalan otomatis di server dan tidak diunggah.

**Alasan.** Backup otomatis di proses yang sama dapat menyalin database yang sedang rusak atau menambah I/O pada request belajar. CLI eksplisit mudah diuji, tidak menambah dependensi, dan tidak memerlukan background worker. `VACUUM INTO` menghasilkan salinan konsisten tanpa menghentikan server; `integrity_check` memastikan file dapat dibaca.

**Konsekuensi.** Backup berada di mesin yang sama dan tidak terenkripsi; bukan jaminan bencana. Pengguna/operator harus menjalankan `npm run db:backup` dan menyimpan salinan off-site. Restore menimpa database target dan memerlukan `--yes`; prosedur didokumentasikan di README.

---

## ADR-049 — LessonPlan membaca/menyimak memakai blok presentasi baru dan validator QA semantik

**Konteks.** Delapan materi N5 membaca/menyimak sudah ada sebagai `ReadingPassage`/`ListeningItem` dengan soal, tetapi belum menjadi LessonPlan enam langkah. Menyalin teks ke `prose` akan kehilangan furigana dan dialog; menambahkan tipe konten baru akan menduplikasi sumber. Di sisi lain, tes struktur tidak menangkap opsi duplikat atau kunci jawaban ganda.

**Keputusan.** Menambahkan dua blok presentasi di `LessonBlock`: `jp-prose` (paragraf dengan markup furigana, dirender `JpText`) dan `dialog` (speaker, jp, reading, meaning). Delapan LessonPlan `les-reading-*`/`les-listening-*` memakai `sourceId` dan soal sumber, bukan konten baru. Menambahkan `src/lib/content-qa.ts` yang memeriksa prompt kosong, opsi duplikat setelah normalisasi, `answerIndex` di luar rentang, dan ID ganda dengan isi berbeda; validator dijalankan di tes dan mencakup bank grammar, reading, listening, culture, drill, serta LessonPlan.

**Alasan.** Satu sumber konten mengurangi risiko teks/terjemahan berbeda antar halaman. Blok presentasi menjaga furigana, `lang=ja`, dan struktur dialog tanpa mengubah model data. Validator menangkap kelas kesalahan yang menyebabkan soal tidak adil; ia bukan pengganti review manusia, tetapi menaikkan lantai kualitas otomatis.

**Konsekuensi.** `LessonBlock` bertambah dua anggota; renderer dan tes harus menanganinya. ID soal LessonPlan membaca/menyimak sama dengan ID soal sumber, sehingga pemeriksaan ID ganda harus membedakan konten identik dari konten berbeda. Validator tidak membuktikan kebenaran linguistik; temuan gaya dan nuansa tetap memerlukan reviewer.

---

## ADR-050 — Audio berlapis: rekaman, TTS browser, TTS lokal opsional

**Konteks.** Audit Fase 14 menemukan bahwa `speechSynthesis` tersedia tetapi `getVoices()` mengembalikan nol voice, termasuk nol voice `ja`. UI settings sudah menampilkan pesan yang benar, tetapi aplikasi tidak memiliki audio alternatif. Ketergantungan pada voice perangkat membuat pengalaman belajar berbeda antar perangkat dan dapat tampak “rusak” di lingkungan tanpa data suara Jepang. Menambahkan API TTS berbayar akan melanggar batas tanpa layanan berbayar; mengandalkan satu voice juga rapuh.

**Keputusan.** Memakai resolver audio berlapis dengan urutan: (1) rekaman yang tercatat di manifest, (2) TTS browser dengan voice `ja`, (3) TTS lokal opsional yang dikonfigurasi, (4) status tidak tersedia yang menjelaskan alasan. Tidak pernah memakai voice non-Jepang secara diam-diam. `SpeechProvider` yang ada dipertahankan sebagai seam; provider rekaman dan TTS lokal dapat ditambahkan tanpa memutus halaman yang sudah memanggil `speakDetailed`/`useSpeech`. Manifest aset wajib memuat teks, bahasa, lisensi, kredit, mime, dan hash; file/validitas diperiksa build/test. Rekaman bersifat enhancement, bukan blocker. TTS lokal (misalnya Open JTalk) hanya adapter opsional loopback, bukan dependensi default, karena lisensi voice HTS terpisah dari core.

**Alasan.** Pengguna tetap bisa belajar tanpa voice Jepang melalui transkrip dan teks; jika voice tersedia, audio bekerja; jika rekaman tersedia, kualitas tidak bergantung perangkat. Lapisan ini menjaga aplikasi tetap lokal, gratis, dan jujur. Tidak memilih voice non-Jepang mencegah pelafalan yang salah tanpa peringatan. Menunda rekaman sebagai enhancement menghindari fase terblokir oleh produksi audio.

**Konsekuensi.** UI harus memiliki state tidak tersedia/error dan diagnostik yang spesifik. Rekaman menambah aset dan kewajiban lisensi; manifest harus dirawat. TTS lokal menambah permukaan server jika diaktifkan, sehingga wajib loopback, same-origin, batas body, timeout, dan tanpa log teks. Kualitas audio tetap bervariasi; tidak ada klaim suara native. Sumber: [MDN SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis), [getVoices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices). Detail di [ENHANCED_FEATURES_ARCHITECTURE.md](ENHANCED_FEATURES_ARCHITECTURE.md).

---

## ADR-051 — KanjiVG untuk stroke, CC BY-SA 3.0, tanpa klaim pengenalan tulisan

**Konteks.** Fitur menulis membutuhkan path dan urutan goresan untuk 208 kana dan 111 kanji. Tidak ada data stroke di repo. Fase 11 menunda fitur ini karena belum ada dataset terverifikasi. Audit Fase 14 memeriksa KanjiVG: 111/111 kanji dan 208/208 entri kana (setiap karakter komponen) memiliki SVG; 259 karakter unik; 0 file hilang; 259 file yang dibutuhkan berukuran total 690.664 byte. KanjiVG memiliki path dalam urutan stroke dan lisensi CC BY-SA 3.0.

**Keputusan.** Memakai KanjiVG sebagai satu-satunya sumber stroke pada fase ini, dengan commit yang dipin (`610091ce618cf757ed1357a8954cd65283e015d6`), importer offline deterministik, dan verifikasi cakupan/urutan/path. Data turunan disimpan per karakter (bukan seluruh katalog di bundle), tetap CC BY-SA 3.0. Atribusi “© Ulrich Apel / KanjiVG, CC BY-SA 3.0” ditampilkan di halaman dan `THIRD_PARTY_NOTICES.md`; salinan lisensi disertakan. Tidak ada klaim pengenalan tulisan tangan atau penilaian otomatis akurasi goresan. Latihan bersifat self-check/coverage; yōon ditampilkan sebagai dua komponen, bukan glyph gabungan.

**Alasan.** KanjiVG adalah data terbuka yang dapat diaudit, mencakup seluruh karakter yang dibutuhkan, dan menyediakan urutan yang dapat dianimasikan tanpa API berbayar. Memilih data yang jelas lisensinya lebih baik daripada menggambar/mengarang urutan sendiri. Tidak mengklaim handwriting recognition menghindari produk menilai hal yang tidak dapat dipertanggungjawabkan.

**Konsekuensi.** Lisensi share-alike membatasi distribusi data turunan; dokumentasi dan notices wajib. Kualitas urutan tetap perlu review sampel; data tersedia bukan jaminan sempurna. Importer harus diperbarui jika KanjiVG berubah, dengan commit/hash tercatat. Build dapat membesar jika 259 halaman dibuat; rencana menyediakan fallback satu halaman + panel detail. Sumber: [KanjiVG](https://kanjivg.tagaini.net/), [format SVG](https://kanjivg.tagaini.net/svg-format.html), [lisensi CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

---

## ADR-052 — Story player memakai DOM/SVG/CSS/Web Animations, bukan video

**Konteks.** Cerita dengan karakter dan adegan membutuhkan presentasi visual. Video/animasi kompleks memerlukan aset besar, alat produksi, dan waktu; CMS video juga menambah permukaan. Aplikasi sudah memiliki JpText, SpeakButton, audio resolver, dan komponen latihan yang dapat dipakai ulang.

**Keputusan.** Membangun player berbasis DOM/SVG/CSS/Web Animations: panggung dengan background sederhana, karakter sebagai elemen visual, highlight pembicara, dan transisi ringan. Konten cerita adalah modul TypeScript tervalidasi (`Story`, `StoryCharacter`, `StoryScene`, `StoryLine`), bukan video/CMS. Audio per baris memakai resolver; subtitle Jepang selalu ada, terjemahan Indonesia dapat di-toggle. `prefers-reduced-motion` menonaktifkan transisi dan auto-advance. Tidak menambahkan library animasi/audio baru.

**Alasan.** DOM/SVG cukup untuk cerita pendek, ringan, dapat diakses, dan tidak memerlukan aset video. Konten-sebagai-kode mempertahankan validasi build-time dan menghindari CMS/auth yang belum ada. Web Animations/CSS adalah API browser yang sudah tersedia.

**Konsekuensi.** Hasil visual lebih sederhana daripada animasi/video penuh; itu batasan yang harus dikomunikasikan. Penulisan cerita dan ilustrasi sederhana membutuhkan waktu. Panggung harus menjaga layout stabil dan tidak mengorbankan keterbacaan. Jika kebutuhan video muncul, itu keputusan produk baru, bukan perpanjangan otomatis ADR ini. Sumber: [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), [SVG stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-dasharray).

---

## ADR-053 — Tidak membangun CMS pada Fase 14–19

**Konteks.** Permintaan Fase 14 menyebut “CMS architecture” dan “CMS content models”. Audit repo tidak menemukan CMS/admin/route konten; konten adalah modul TypeScript yang divalidasi build/test, dan database hanya menyimpan progres. Menambahkan CMS berarti auth, editor, penyimpanan konten, validasi runtime, dan permukaan serangan baru — semuanya di luar kebutuhan satu editor teknis saat ini.

**Keputusan.** Tidak membangun CMS pada fase fitur ini. Konten baru tetap di `src/content/` dengan tipe dan validator. “CMS” yang dimaksud dalam dokumen perencanaan adalah model konten dan pipeline aset, bukan aplikasi admin. Jika kelak ada editor non-teknis rutin atau konten melewati sekitar 500 item, buat ADR baru untuk CMS ringan; jangan menyisipkannya diam-diam ke fase fitur.

**Alasan.** Content-as-code memberi review diff, validasi build, dan rollback yang jelas tanpa biaya infrastruktur. CMS akan memperlambat ketiga fitur dan menambah risiko keamanan yang belum siap (tidak ada auth). Tidak ada bukti kebutuhan editor non-teknis saat ini.

**Konsekuensi.** Penulis konten harus nyaman dengan TypeScript dan menjalankan tes. Tidak ada pratinjau editorial terpisah. Jika kebutuhan CMS muncul, migrasi harus mempertahankan validasi dan tidak mengubah data progres. Concern PRD-08 mencatat pemicunya.

---

## ADR-054 — Fase 14 hanya audit dan perencanaan; implementasi dimulai Fase 15

**Konteks.** Permintaan Fase 14 meminta proposal implementasi Fase 15–19 dan secara eksplisit menyatakan “Do not begin large-scale implementation in this phase.” Aplikasi sedang dianggap dalam QA; server mungkin tidak tersedia. Perubahan besar tanpa rencana dapat mengganggu pekerjaan yang ada.

**Keputusan.** Fase 14 tidak mengubah kode aplikasi, skema, endpoint, dependensi, atau aset. Deliverable hanya empat dokumen perencanaan, pembaruan backlog, ADR, dan penyelarasan dokumentasi. Audit read-only boleh memeriksa server yang berjalan, tetapi tidak melakukan mutasi. Implementasi fitur dimulai Fase 15 setelah gate perencanaan disetujui. Tidak ada klaim bahwa fitur sudah ada.

**Alasan.** Memisahkan perencanaan dari implementasi mencegah scope creep, memungkinkan review arsitektur sebelum data/aset ditambahkan, dan menghormati proses QA. Dokumen yang dapat diaudit lebih berharga daripada prototipe setengah jadi yang tidak teruji.

**Konsekuensi.** Pengguna belum mendapatkan fitur baru pada Fase 14. Keputusan teknologi yang belum final (misalnya TTS lokal) tetap terbuka dan harus diuji pada fase implementasi. Dokumen harus diperlakukan sebagai rencana, bukan status implementasi; status ada di [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md).

---

## ADR-055 — Web Speech API ja-JP sebagai jalur utama, satu pemutar global, dan fallback yang jujur

**Konteks.** Fase 16 meminta studio audio dan pelafalan yang dapat dipakai tanpa layanan berbayar. Web Speech API tersedia di banyak browser, tetapi voice Jepang bergantung pada sistem operasi, paket bahasa, dan browser. Menambahkan file MP3 untuk seluruh katalog berarti aset besar, lisensi suara, dan pemeliharaan yang belum ada. Memakai voice bahasa lain secara diam-diam akan mengajarkan pelafalan yang salah.

**Keputusan.** Semua audio memakai SpeechSynthesis dengan utterance.lang = "ja-JP". Voice dipilih hanya dari daftar voice berbahasa Jepang; bila tidak ada, UI menampilkan status “voice Jepang belum tersedia” dan pemutaran tidak dipaksakan. Deteksi voice memakai getVoices() dan listener voiceschanged, dengan pemilihan ulang saat voice berubah. Satu AudioPlayer global di provider menangani antrean, play/pause/resume/stop, sebelumnya/berikutnya, ulangi, kecepatan 0,5–1,5×, dan pilihan voice; berpindah rute menghentikan audio. Preferensi speechRate, voiceURI, dan autoplay disimpan di Settings yang sudah ada. Tidak ada server TTS, unggahan teks, atau tabel audio baru.

**Alasan.** Web Speech API tidak memerlukan aset, biaya, atau kunci API, dan memakai voice Jepang yang sudah dipasang pengguna. Kebijakan hanya-ja-JP mencegah fallback yang terdengar meyakinkan tetapi salah bahasa. Satu pemutar mencegah overlap dan memberi kontrol yang konsisten di kana, kosakata, kanji, tata bahasa, bacaan, dialog, dan latihan pelafalan.

**Konsekuensi.** Perangkat tanpa voice Jepang tidak dapat memutar audio sampai paket bahasa dipasang; ini batasan perangkat, bukan bug yang bisa ditutup dengan data palsu. Kualitas dan ketersediaan voice berbeda antarperangkat, dan voiceURI dapat menjadi usang sehingga pemutar kembali ke mode otomatis. Tes browser memakai mock voice karena Chromium uji tidak memiliki voice Jepang. Open JTalk tetap adapter lokal opsional dengan lisensi voice yang harus diverifikasi, bukan dependensi default.

---

## ADR-056 — Tanpa audio statis/MP3, tanpa skor akustik, dan tanpa klaim kualitas native

**Konteks.** Permintaan studio audio mencakup rekaman, TTS browser, dan fallback. Ada godaan untuk menyimpan hasil TTS sebagai MP3, mengunggah rekaman untuk dinilai, atau memberi angka “pelafalan 90%”. Ketiganya membutuhkan penyimpanan, layanan, dan model penilaian yang belum divalidasi; menyajikannya sebagai fakta akan melanggar prinsip akurasi.

**Keputusan.** Kotoba tidak membuat, mengunduh, atau menyimpan MP3 dari TTS; tidak menyimpan rekaman pengguna di server; dan tidak menghitung skor akustik. Latihan pelafalan tetap memakai rekaman lokal sementara (maksimal 30 detik), pemutaran ulang, daftar cek mandiri, dan opsional pengenalan suara yang hanya membandingkan teks yang dikenali. Transkrip dan bacaan tetap tersedia tanpa audio. UI menyatakan bahwa audio bergantung pada voice perangkat dan bukan penilaian native. Open JTalk tidak di-deploy pada fase ini.

**Alasan.** Menyimpan audio menambah data pribadi, ukuran, dan permukaan keamanan tanpa kebutuhan yang terbukti. Skor akustik tanpa model yang divalidasi akan menyesatkan pemelajar. Membandingkan teks ASR sudah cukup untuk latihan kesadaran, asalkan batasnya dijelaskan. Tidak mengklaim kualitas native menjaga kepercayaan pada konten dan alat.

**Konsekuensi.** Pengguna tanpa voice Jepang hanya mendapat transkrip dan latihan tertulis; pengguna dengan voice mendapat kualitas yang bergantung perangkat. Umpan balik pelafalan terbatas pada cek mandiri dan kecocokan teks, bukan penilaian fonetik menyeluruh. Bila audio statis atau penilaian akustik akan ditambahkan, diperlukan ADR baru, lisensi aset, model yang diuji, dan kebijakan privasi yang jelas.

---

## ADR-057 — KanjiVG sebagai satu-satunya sumber data goresan; data turunan dan atribusi wajib

**Konteks.** Fase 17 membutuhkan urutan goresan yang benar untuk 208 kana dan 111 kanji. Menulis urutan dari ingatan berisiko mengajarkan bentuk yang salah; menggambar SVG manual untuk 259 glyph tidak realistis dan sulit diverifikasi. KanjiVG menyediakan path per goresan, nomor, dan titik awal untuk karakter kanji maupun kana, dengan lisensi CC BY-SA 3.0.

**Keputusan.** Memakai KanjiVG commit tetap `610091ce618cf757ed1357a8954cd65283e015d6` sebagai satu-satunya sumber. Skrip `scripts/import-kanjivg.mjs` mengunduh SVG per codepoint, mengambil path dari grup `StrokePaths`, menghitung titik awal/akhir dan 28 sampel, lalu menulis JSON per glyph + manifest ke `public/writing/kanjivg/`. Katalog menulis memuat 319 entri; 259 glyph unik dipakai karena yōon seperti きゃ/ニョ adalah dua codepoint dan ditampilkan sebagai dua komponen berurutan. Atribusi Ulrich Apel/KanjiVG, tautan sumber, dan teks CC BY-SA disimpan di `THIRD_PARTY_NOTICES.md`, `public/licenses/kanjivg-CC-BY-SA-3.0.txt`, dan README data. Tidak ada glyph gabungan atau path tambahan yang dikarang.

**Alasan.** Dataset ini menyediakan geometri yang dapat dirender dan diverifikasi, mencakup kanji dan kana, serta dapat diproses lokal tanpa API berbayar. Commit tetap membuat build reproduksibel. Memisahkan komponen yōon lebih jujur daripada membuat bentuk gabungan yang tidak ada di dataset.

**Konsekuensi.** Distribusi data turunan mengikuti CC BY-SA 3.0 dan atribusi tidak boleh dihapus. Pembaruan KanjiVG harus berupa commit baru yang diuji ulang, bukan unduhan “latest” saat build. Perbedaan varian tulisan tangan di luar KanjiVG tidak dinilai. Ukuran aset sekitar 1,6 MB untuk 259 JSON; data dimuat per karakter agar tidak dikirim sekaligus.

---

## ADR-058 — Progres menulis memakai tabel `writing_attempts`, bukan `lessons`

**Konteks.** Attempt menulis memiliki atribut yang tidak dimiliki lesson biasa: mode guided/free, jumlah goresan yang digambar, perkiraan urutan salah, dan durasi. Menyimpannya di `lessons` akan memaksa kolom tambahan atau JSON yang sulit diagregasi; membuat satu baris lesson per attempt juga akan mengacaukan penyelesaian lesson dan XP.

**Keputusan.** Menambah tabel ke-14 `writing_attempts` (id, character_id, script, mode, score, expected_strokes, drawn_strokes, order_mistakes, duration_sec, created_at) + dua index. Server memvalidasi `characterId` terhadap `WRITING_BY_ID`, mengambil script/jumlah goresan dari katalog, menjepit skor 0–100 dan durasi 0–3.600, lalu menyimpan. XP 15 hanya pada attempt pertama per karakter; attempt berikutnya tetap menambah menit belajar tanpa XP penyelesaian. Snapshot memuat 400 attempt terbaru; statistik memakai seluruh tabel. Tidak ada koordinat mentah, gambar, atau waktu per goresan yang disimpan. Reset/impor mencakup tabel ini.

**Alasan.** Tabel khusus memberi agregasi mastery/order mistakes yang jelas, tidak mencampur attempt dengan penyelesaian lesson, dan memungkinkan ekspor/impor yang konsisten. Batas 400 menjaga ukuran snapshot; data lama tetap ada di database meski tidak dimuat.

**Konsekuensi.** Ada tabel dan endpoint baru (`POST /api/progress/writing`), sehingga jumlah menjadi 14 tabel/19 endpoint. Database lama mendapat tabel kosong secara additive. Riwayat di luar 400 attempt belum dapat dilihat tanpa pagination. Karena skor dinilai di klien lalu disimpan server, ini bukan anti-cheat.

---

## ADR-059 — Skor menulis adalah perkiraan geometri, bukan pengenalan tulisan tangan

**Konteks.** Validasi tulisan tangan yang sesungguhnya memerlukan model terlatih, dataset besar, dan pengujian lintas perangkat. Fase 17 meminta umpan balik yang berguna tanpa mengklaim kemampuan yang tidak ada. Pengguna tetap perlu tahu kapan bentuk/urutan sudah mendekati contoh.

**Keputusan.** `evaluateWriting()` menyeragamkan jalur ke 24 titik dan membandingkan bentuk, titik awal/akhir, serta arah. Skor satu goresan = 55% bentuk + 12% awal + 12% akhir + 21% arah; skor total = 82% bentuk + 18% jumlah goresan. Goresan hilang bernilai 0; `orderMistakes` hanya dihitung untuk pasangan berskor ≥45 dan penalti dibatasi 24; mastery = skor terbaik ≥80. UI menyebut hasil sebagai “perkiraan geometri”, menampilkan rincian per goresan, dan menyatakan bukan pengenalan tulisan tangan, bukan penilaian estetika, dan bukan sertifikasi. Mode Tirukan memberi umpan balik per goresan; mode Mandiri memberi skor keseluruhan setelah pengguna menekan nilai.

**Alasan.** Geometri deterministik dapat diuji, berjalan lokal, dan cukup untuk latihan menulis pemula tanpa menambah model/dependensi. Formula yang transparan lebih jujur daripada skor “AI” yang tidak dapat dijelaskan. Penalti urutan yang dibatasi menghindari skor menghukum hanya karena variasi kecil.

**Konsekuensi.** Skor peka terhadap posisi/ukuran dan dapat berbeda dari penilaian guru. Varian urutan yang sah di luar KanjiVG tidak diakui sebagai benar. Tidak ada umpan balik tekanan/kecepatan atau deteksi karakter bebas. Perangkat fisik/stylus belum diuji. Bila model pengenalan nyata akan ditambahkan, perlu ADR baru, dataset berlisensi, evaluasi akurasi, dan kebijakan privasi.

---

## ADR-060 — Cerita adalah konten bertipe dengan panggung SVG/CSS generik, bukan CMS atau video

**Konteks.** Fase 18 meminta teater cerita yang terasa seperti animasi tanpa layanan AI video berbayar. Belum ada CMS, aset video, atau anggaran media. Membangun editor cerita dan pipeline aset lebih besar daripada fitur pembelajarannya sendiri, sedangkan video per adegan membutuhkan penyimpanan, transkode, dan pengujian yang belum ada.

**Keputusan.** Cerita disimpan sebagai modul TypeScript bertipe di `src/content/stories.ts`, dengan 3 cerita orisinal (2 N5, 1 N4), 9 adegan, 36 baris dialog, dan 9 soal. Satu mesin panggung generik `StoryStage` merender 8 latar SVG/CSS orisinal, 5 posisi, 5 ekspresi, gelembung dialog, dan efek hujan/salju/kelopak. Teater `StoryTheater` menyediakan mode belajar dan tonton, kontrol subtitle/furigana/romaji/terjemahan, audio per baris, kamus kosakata, kuis, dan penyimpanan hasil. Tidak ada tabel konten, CMS, unggahan, atau aset gambar eksternal. `StoryScene.videoUrl` hanya seam opsional same-origin; tidak ada aset atau jalur unggah.

**Alasan.** Content-as-code menjaga validasi build, diff review, dan rollback tanpa menambah permukaan admin yang belum memiliki auth. Mesin panggung generik membuktikan bahwa cerita berbeda dapat dirender tanpa hardcode per adegan, dan SVG/CSS cukup untuk pengalaman visual ringan di perangkat mobile. Seam video memberi jalur masa depan tanpa mengklaim fitur yang belum ada.

**Konsekuensi.** Menambah cerita berarti menambah data TypeScript dan tes, bukan entri CMS. Penulis harus nyaman dengan tipe dan furigana. Tidak ada pratinjau editorial terpisah, analitik per adegan, atau video. Panggung bergantung pada CSS/SVG dan preferensi reduced-motion, bukan render video. Jika CMS/video akan dibuat, perlu ADR baru, auth, penyimpanan aset, dan kebijakan biaya.

---

## ADR-061 — Progres cerita memakai `story_attempts`, XP 25 pada penyelesaian pertama, dan skor 60 sebagai ambang selesai

**Konteks.** Hasil teater cerita memiliki atribut yang tidak dimiliki lesson: cerita, mode study/watch, jumlah adegan selesai, skor kuis, benar/total, dan durasi. Menyimpannya di `lessons` akan mencampur penyelesaian lesson dengan attempt cerita dan menyulitkan statistik cerita yang bermakna.

**Keputusan.** Menambah tabel ke-15 `story_attempts` (id, story_id, level, mode, score, correct, total, scenes_completed, duration_sec, completed_at) + dua index. Server memvalidasi `storyId` terhadap `STORY_BY_ID`, mengambil level dari katalog, menjepit mode/skor/angka/durasi, lalu menyimpan. XP 25 hanya pada attempt pertama per cerita; attempt berikutnya menambah menit belajar tanpa XP penyelesaian. Cerita dianggap selesai untuk statistik bila ada attempt dengan skor ≥60. Snapshot memuat 300 attempt terbaru; impor dibatasi 1.000. Tidak ada transkrip, posisi baris, jawaban per soal, atau audio yang disimpan. Reset/impor mencakup tabel ini.

**Alasan.** Tabel khusus memberi agregasi attempt/cerita selesai/skor terbaik yang jelas, tidak mengacaukan lesson, dan konsisten dengan pola `writing_attempts`. XP 25 mencerminkan durasi dan cakupan cerita yang lebih besar daripada drill, tetapi hanya sekali agar mengulang cerita tetap bermanfaat tanpa farming XP. Ambang 60 sama dengan target belajar yang sudah dipakai di latihan lain, bukan kelulusan JLPT.

**Konsekuensi.** Jumlah menjadi 15 tabel/20 endpoint; database lama mendapat tabel kosong secara additive. Riwayat di luar 300 attempt belum dapat dilihat tanpa pagination. Skor dan agregat berasal dari klien setelah validasi bentuk/katalog; server tidak menilai ulang jawaban kuis, jadi ini bukan anti-cheat. Menutup tab sebelum kuis tidak menyimpan posisi.

---

## ADR-062 — Audio cerita jujur pada tingkat kalimat; tanpa voice karakter palsu, ekspor video, atau AI video

**Konteks.** Web Speech API tidak menyediakan timing kata yang andal, dan jumlah voice Jepang bergantung perangkat. Fase 18 meminta voice karakter berbeda bila tersedia, audio per baris, dan pengalaman mirip video. Memberi setiap karakter voice berbeda dengan memilih voice non-Jepang, atau mengklaim sinkronisasi kata, akan menyesatkan pemelajar. Ekspor video memerlukan render canvas, MediaRecorder/FFmpeg, dan pengujian codec yang belum ada.

**Keputusan.** Audio cerita memakai pemutar global Fase 16 dengan utterance `ja-JP`; sorotan mengikuti baris aktif (sinkronisasi tingkat kalimat), bukan kata. Bila perangkat menyediakan minimal dua voice Jepang, karakter dipetakan round-robin ke voice tersebut; bila hanya satu, semua karakter memakai voice yang sama dan UI menyatakan bahwa Kotoba tidak memalsukan voice karakter. `audioUrl` per baris adalah fallback opsional ke aset rekaman same-origin, tanpa aset yang dikirim saat ini. Tidak ada ekspor video (MediaRecorder/Canvas/FFmpeg), AI video, atau klaim kualitas native. Cerita tetap terbaca dan kuis tetap dapat dikerjakan tanpa audio.

**Alasan.** Hanya voice Jepang yang menjaga pelafalan; mengklaim sinkronisasi kata atau voice aktor tanpa bukti melanggar prinsip akurasi. Sinkronisasi kalimat cukup untuk membaca mengikuti dialog dan dapat diuji. Menunda ekspor video menjaga fokus pada pengalaman belajar yang andal dan menghindari dependensi berat.

**Konsekuensi.** Perangkat tanpa voice Jepang tidak memutar audio; pengguna tetap mendapat teks, terjemahan, dan kuis. Voice dapat berubah antarperangkat, dan metadata timing belum didukung. Ekspor video/AI video serta pipeline aset `videoUrl` memerlukan ADR baru, biaya, penyimpanan, dan pengujian perangkat. Verifikasi hanya memakai Chromium teremulasi dan mock voice, bukan perangkat fisik.

---

## ADR-063 — Fase 19 menstabilkan integrasi yang ada; CMS/video tetap diblokir dan deployment publik tidak diklaim

**Konteks.** Setelah Fase 16–18, audio, menulis, dan cerita sudah berjalan masing-masing, tetapi ada tiga risiko integrasi: pelajaran kana/kanji tidak menautkan ke latihan menulis, salinan pelajaran kanji masih menyuruh pengguna mencari urutan goresan di tempat lain meski Studio Menulis sudah tersedia, dan belum ada regresi lintas viewport yang mencakup permukaan baru. Permintaan Fase 19 adalah integrasi, QA, performa, dan aksesibilitas — bukan fitur baru. Repositori juga masih tidak memiliki CMS/admin, dan deployment publik tetap terhalang oleh tidak adanya auth/TLS/rate limit.

**Keputusan.** Fase 19 tidak menulis ulang arsitektur dan tidak menambah framework/dependensi. Integrasi pelajaran–menulis dilakukan lewat helper murni kecil `writingHrefForContentRef()` di `src/lib/writing-links.ts`, yang hanya memetakan referensi kana/kanji ke `/writing/writing-<id>` dan mengembalikan `null` untuk jenis lain. Helper ini dipakai `src/components/lesson-player.tsx` dan diuji terhadap katalog menulis nyata, sehingga katalog 319 entri tidak ikut masuk ke bundle pelajaran. Salinan usang di `src/content/lessons/kanji.ts` dikoreksi agar menyebut tombol/menu Studio Menulis dan sumber KanjiVG, tanpa mengklaim animasi sebagai pengganti verifikasi kamus. Konten tetap berupa modul TypeScript bertipe; tidak ada CMS, tabel konten, API admin, ekspor video, atau pipeline aset video yang dibuat. Semua klaim Fase 19 dibatasi pada apa yang benar-benar dijalankan: unit test, typecheck/lint, build produksi, regresi rute pada viewport teremulasi, perjalanan browser, dan pengukuran resource.

**Alasan.** Menautkan fitur yang sudah ada memberi nilai belajar tanpa memperbesar permukaan produk. Helper terpisah menjaga batas modul dan menghindari regresi performa pada 70 halaman pelajaran. Menolak CMS/video tanpa keputusan produk, lisensi, dan infrastruktur mencegah pekerjaan yang tidak dapat dipertanggungjawabkan. Menyatakan batas keamanan secara eksplisit lebih jujur daripada menyebut aplikasi “siap produksi” hanya karena build dan QA lokal lulus.

**Konsekuensi.** Tautan menulis hanya tersedia untuk pelajaran dengan referensi kana/kanji pertama; pelajaran yang tidak memilikinya tidak menampilkan tombol. CMS, video, checkpoint cerita, timing TTS per kata, dan pengujian perangkat fisik/screen reader tetap terbuka sebagai concern. Regresi browser tetap ad hoc (belum masuk CI), dan hasil Chromium teremulasi bukan bukti kompatibilitas semua perangkat. Sebelum deployment publik, auth, TLS, rate limiting, dan audit keamanan baru tetap wajib.



