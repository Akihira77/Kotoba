# Spesifikasi Produk — Kotoba 言葉

**Versi dokumen:** 1.0  
**Status:** Fase 1 — Discovery & Product Planning (selesai untuk ditinjau)  
**Tanggal:** 2026-11-08  
**Basis kode:** Kotoba v0.1.0 di /home/akihira17/personal/kotoba  
**Bahasa produk:** Indonesia (antarmuka dan penjelasan); Jepang (bahasa target)

---

## 1. Ringkasan eksekutif

Kotoba adalah platform web untuk belajar bahasa Jepang bagi penutur bahasa Indonesia. Produk menggabungkan materi terstruktur, latihan interaktif, permainan edukatif, latihan mendengar dan pengucapan, simulasi ujian JLPT, konten budaya, serta pelacakan progres dalam satu aplikasi.

Discovery Fase 1 menemukan bahwa repositori **bukan proyek kosong**. Sebuah aplikasi full-stack v0.1.0 sudah berjalan dan mencakup hampir seluruh modul dasar: 17 halaman, 12 route API, SQLite, mesin SRS, kuis, empat permainan, simulasi ujian, dan 214 kosakata. Karena itu Fase 1 tidak mengusulkan penulisan ulang. Fase ini menetapkan:

1. posisi produk dan pengguna sasaran;
2. batas MVP yang jujur terhadap kondisi kode saat ini;
3. celah antara visi produk dan implementasi;
4. arsitektur yang dipertahankan dan perluasan yang direncanakan;
5. urutan pekerjaan berikutnya yang paling berdampak.

**Keputusan utama:** pertahankan Next.js 16 + React 19 + TypeScript + Tailwind 4 + SQLite, lalu tutup celah produk secara bertahap. Prioritas MVP v0.2 adalah kedalaman konten N3–N1, variasi latihan yang belum ada (isian rumpang, terjemahan, mencocokkan), pengelolaan belajar personal (bookmark dan target mingguan), rekomendasi harian, serta quality gate berupa tes komponen/E2E dan CI.

---

## 2. Konteks dan masalah

### 2.1 Kondisi pengguna

Pembelajar Indonesia sering menghadapi kombinasi masalah berikut:

- materi bahasa Jepang tersebar antara buku, video, aplikasi, dan catatan pribadi;
- penjelasan tata bahasa tersedia dalam bahasa Inggris, bukan Indonesia, sehingga nuansa sulit dipahami;
- latihan terlalu banyak atau terlalu sedikit, tanpa jalur progres yang jelas;
- romaji dipakai sebagai penyangga permanen sehingga kemampuan membaca kana/kanji tidak berkembang;
- ungkapan anime diajarkan sebagai bahasa sehari-hari tanpa konteks register;
- progres belajar tidak persisten atau tidak terlihat;
- aplikasi populer berbayar, memerlukan akun, atau bergantung pada layanan pihak ketiga.

### 2.2 Peluang produk

Kotoba dapat menjadi teman belajar harian yang:

- menjelaskan konsep dalam bahasa Indonesia yang natural;
- memadukan materi, latihan, ulangan berjarak, dan ujian dalam satu alur;
- jujur membedakan bahasa standar, kasual, slang, dan ekspresi anime;
- berjalan lokal tanpa biaya berlangganan dan tetap menyimpan progres;
- cukup ringan untuk ponsel dan nyaman untuk sesi belajar panjang.

### 2.3 Temuan discovery repositori

| Aspek | Temuan |
| --- | --- |
| Jenis proyek | Aplikasi web full-stack yang sudah berjalan, bukan greenfield |
| Framework | Next.js 16.4.5 App Router, React 19.3.0, TypeScript strict |
| Styling | Tailwind CSS 4 dengan token tema terang/gelap |
| Persistensi | SQLite melalui node:sqlite, 7 tabel, WAL |
| Konten | Modul TypeScript bertipe di src/content |
| Tes | Vitest, 6 file/32 tes; belum ada tes komponen atau E2E |
| Status verifikasi | Typecheck, lint, tes, build, dan smoke test browser lulus |
| Repositori | Bukan repositori git; berada di workspace berisi proyek saudara |

Implikasi: pekerjaan berikutnya adalah **evolusi produk**, bukan fondasi ulang. Setiap perubahan harus menjaga fitur yang sudah berjalan dan konvensi proyek.

---

## 3. Visi dan prinsip produk

### 3.1 Visi

Menjadi teman belajar bahasa Jepang harian yang terstruktur, akurat, dan menyenangkan bagi penutur bahasa Indonesia — dari huruf pertama hingga mampu membaca dan memahami teks tingkat lanjut.

### 3.2 Prinsip

1. **Learning-first.** Setiap fitur harus meningkatkan pemahaman atau retensi, bukan sekadar menambah kesan interaktif.
2. **Progresif.** Materi dan latihan mengikuti perkiraan JLPT N5–N1, dengan prasyarat yang jelas.
3. **Ramah Indonesia.** Antarmuka, penjelasan, umpan balik, dan contoh budaya memakai bahasa Indonesia; bahasa Jepang adalah target.
4. **Akurasi di atas volume.** Lebih baik lebih sedikit tetapi benar daripada banyak tetapi meragukan. Klaim yang tidak pasti tidak dipresentasikan sebagai fakta.
5. **Register transparan.** Bahasa standar, kasual, slang, dan ekspresi anime selalu dibedakan dan diberi konteks.
6. **Orisinal dan etis.** Tidak menyalin buku teks, bank soal komersial, naskah anime, atau dialog berhak cipta.
7. **Aktif, bukan pasif.** Pengguna membaca, mendengar, memilih, menyusun, mengingat, dan menguji diri.
8. **Tenang dan fokus.** Desain mendukung sesi panjang: kontras nyaman, navigasi konsisten, animasi halus, tanpa gangguan berlebih.
9. **Lokal-first.** Data belajar tetap milik pengguna, tersimpan di perangkat/server lokal, dan dapat diekspor.
10. **Dapat dirawat.** Konten bertipe, komponen modular, alur data jelas, dan keputusan teknis terdokumentasi.

---

## 4. Pengguna sasaran dan persona

### Persona utama — Rina, pelajar mandiri

- **Usia/konteks:** 19–24 tahun, mahasiswa, memakai ponsel, anggaran terbatas.
- **Tujuan:** bisa membaca kana, memahami anime dan percakapan sederhana, lalu bepergian ke Jepang.
- **Waktu:** 10–20 menit per hari, sering terputus.
- **Masalah:** mudah bosan, takut kanji, bingung memilih materi berikutnya, tergoda romaji.
- **Kebutuhan:** pelajaran pendek, umpan balik cepat, permainan, streak yang memotivasi, penjelasan Indonesia.
- **Ukuran keberhasilan:** menyelesaikan sesi pertama, kembali dalam 7 hari, menyelesaikan target harian, meningkat dari kana ke kosakata/grammar.

### Persona sekunder — Dimas, profesional

- **Usia/konteks:** 26–35 tahun, bekerja dengan tim Jepang, memakai laptop.
- **Tujuan:** N4–N3, mampu membaca email/dokumen dan mengikuti rapat sederhana.
- **Waktu:** 30–45 menit, beberapa kali per minggu.
- **Masalah:** materi terlalu kekanak-kanakan, latihan mendengar kurang, butuh contoh formal/keigo.
- **Kebutuhan:** tata bahasa yang dijelaskan konteksnya, bacaan bertingkat, menyimak dengan transkrip, ujian dan pembahasan.
- **Ukuran keberhasilan:** naik level materi, akurasi ulangan meningkat, menyelesaikan simulasi ujian.

### Persona tersier — Sari, penggemar anime

- **Usia/konteks:** 16–18 tahun, menonton anime, aktif di komunitas.
- **Tujuan:** memahami frasa anime, menulis komentar, bermain sambil belajar.
- **Masalah:** mencampur bahasa anime dengan bahasa sopan; tidak tahu mana yang aman dipakai.
- **Kebutuhan:** label register, peringatan konteks, permainan kosakata, penjelasan singkat.
- **Ukuran keberhasilan:** dapat membedakan ekspresi anime dari bahasa standar.

**Persona non-target:** pembelajar yang membutuhkan sertifikasi JLPT resmi, kelas tatap muka, atau fitur sosial multi-pengguna pada MVP.

---

## 5. Tujuan, non-tujuan, dan metrik

### 5.1 Tujuan MVP v0.2

1. Menyediakan alur belajar lengkap: pelajari → latih → ulangi → uji → refleksikan.
2. Menutup celah variasi latihan yang diminta visi produk.
3. Menjadikan progres personal lebih bermakna melalui bookmark, target mingguan, dan rekomendasi.
4. Menaikkan kedalaman konten ke ambang minimum yang kredibel untuk N5–N1.
5. Menetapkan quality gate yang mencegah regresi saat konten bertambah.

### 5.2 Non-tujuan MVP

- Sertifikasi atau klaim skor JLPT resmi.
- Akun pengguna, sinkronisasi cloud, dan multi-profil.
- Aplikasi native iOS/Android.
- Kelas langsung, tutor, atau fitur sosial.
- Pembayaran, langganan, atau iklan.
- Mesin rekomendasi berbasis ML; MVP memakai aturan yang dapat dijelaskan.
- Pengenalan suara wajib; fitur pengucapan harus punya fallback.

### 5.3 Metrik keberhasilan

Karena MVP tidak memakai analitik pihak ketiga, metrik diukur dari data belajar lokal dan kriteria rilis:

| Dimensi | Metrik |
| --- | --- |
| Aktivasi | Pengguna dapat menyelesaikan satu pelajaran/kuis pertama tanpa bantuan |
| Kebiasaan | Target harian dan streak tampil konsisten; pengguna dapat kembali setelah beberapa hari tanpa kehilangan progres |
| Pembelajaran | Ulangan SRS terjadwal, akurasi per topik terlihat, pembahasan salah dapat dibaca |
| Cakupan | Semua level N5–N1 memiliki konten di atas ambang MVP |
| Kualitas | npm run check lulus, build sukses, tidak ada console error pada alur kritis |
| Aksesibilitas | Tidak ada pelanggaran serius pada audit otomatis; navigasi keyboard pada alur utama |
| Kinerja | LCP p75 < 2,5 detik pada mobile mid-range; CLS < 0,1 |
| Kepercayaan | Ekspor/impor mempertahankan progres; reset hanya setelah konfirmasi |

---

## 6. Ruang lingkup dan batas MVP

### 6.1 Baseline yang sudah ada

Aplikasi v0.1.0 sudah menyediakan dasbor, kana, kosakata, kanji, tata bahasa, membaca, menyimak, latihan campuran, permainan (empat pada baseline awal; menjadi enam setelah Fase 6), simulasi ujian, budaya, kemajuan, pengaturan, dan persistensi SQLite. Baseline ini **tidak dibangun ulang**.

### 6.2 MVP v0.2 = baseline + celah P0

MVP dianggap tercapai bila seluruh butir P0 di bawah selesai dan lolos kriteria rilis:

| Area | Butir P0 |
| --- | --- |
| Konten | Mencapai ambang konten per level (lihat 7.2); validasi konten otomatis |
| Latihan | Isian rumpang, terjemahan, mencocokkan kosakata, dan alur flashcards/sentence order yang konsisten |
| Personalisasi | Bookmark/favorit, target mingguan, rekomendasi harian berbasis aturan |
| Dasbor | Aksi berikutnya yang jelas: ulangi kartu, lanjut materi, atau latihan kelemahan |
| Ujian | Bank soal bertag level/topik yang cukup untuk mengurangi fallback |
| Kualitas | Tes komponen untuk alur kritis, E2E Playwright, CI yang menjalankan check + build |
| Aksesibilitas | Audit dasar, keyboard, fokus, kontras, reduced motion |

### 6.3 Di luar MVP (Should/Could/Won't)

| Prioritas | Butir |
| --- | --- |
| P1 — Should | Topik-specific tests, pronunciation lab dengan rekaman/opsional speech recognition, word builder, kana puzzle, vocab matching, gamifikasi lebih kaya, statistik kelemahan |
| P2 — Could | PWA offline penuh, audio statis, multi-profil, sinkronisasi, pengingat belajar |
| Won't (MVP) | Sertifikasi JLPT, live tutor, sosial, pembayaran, aplikasi native, AI chat |

---

## 7. Kebutuhan konten

### 7.1 Struktur wajib per jenis materi

- **Kana:** karakter, romaji, script, grup, baris, vokal, mnemonik Indonesia, contoh kata + arti.
- **Kosakata:** Jepang, kana, romaji, arti Indonesia, level, kelas kata, topik, minimal satu contoh kalimat dengan bacaan dan arti; catatan bila ada nuansa.
- **Kanji:** karakter, level, jumlah goresan, radikal + arti radikal, on/kun, arti Indonesia, contoh kata, mnemonik.
- **Tata bahasa:** pola, arti, formasi, penjelasan Indonesia, contoh + bacaan, kesalahan umum, pola terkait, latihan dengan kunci dan pembahasan.
- **Membaca:** judul Jepang/Indonesia, teks berfuri, terjemahan, kosakata, pertanyaan pemahaman, estimasi waktu.
- **Menyimak:** dialog dengan pembicara, teks Jepang, bacaan kana, frasa kunci, pertanyaan, konteks.
- **Budaya:** kategori, ringkasan, isi, fakta, kosakata, ekspresi dengan register, catatan sumber.
- **Susun kalimat:** token, jawaban, terjemahan, penjelasan urutan.

Furigana memakai markup kurung kurawal dengan format karakter Jepang|bacaan kana. Teks audio memakai versi tanpa markup.

### 7.2 Ambang konten MVP

Angka ini adalah ambang **minimum kredibel untuk MVP**, bukan kurikulum JLPT lengkap. Full curriculum tetap menjadi arah jangka panjang.

| Level | Kosakata | Kanji | Tata bahasa | Bacaan | Menyimak |
| --- | ---: | ---: | ---: | ---: | ---: |
| N5 | 180 | 80 | 20 | 4 | 4 |
| N4 | 100 | 50 | 15 | 3 | 3 |
| N3 | 80 | 40 | 12 | 3 | 3 |
| N2 | 50 | 25 | 8 | 2 | 2 |
| N1 | 40 | 20 | 6 | 2 | 2 |

Baseline saat ini: kosakata 214, kanji 111, tata bahasa 45, bacaan 12, menyimak 12. Kekurangan terbesar ada di N4–N1, terutama kosakata dan kanji. Penambahan harus disertai validasi tipe, bacaan, dan penjelasan.

### 7.3 Akurasi dan keterlambatan

- Setiap item baru melewati dua lapis pemeriksaan: validasi otomatis (bentuk data, duplikasi, kunci jawaban, furigana) dan review manusia terhadap bacaan/arti/register.
- Istilah JLPT adalah perkiraan level, bukan klaim resmi.
- Fakta budaya/sejarah memakai ringkasan orisinal dan catatan sumber; klaim yang tidak dapat dipastikan tidak ditulis sebagai fakta.
- Ekspresi anime hanya diajarkan sebagai pemahaman, bukan rekomendasi pemakaian formal.

### 7.4 Hak cipta

Seluruh teks, dialog, soal, dan artikel ditulis orisinal. Tidak boleh menyalin buku teks, bank soal komersial, subtitle/naskah anime, lirik, atau terjemahan berhak cipta. Referensi faktual boleh dipakai dengan atribusi yang tepat.

---

## 8. Informasi arsitektur dan navigasi

### 8.1 Struktur navigasi

| Grup | Rute | Fungsi |
| --- | --- | --- |
| Belajar | / | Dasbor dan aksi harian |
| Belajar | /kana | Bagan, detail, kuis kana |
| Belajar | /vocabulary | Kamus, filter, ulangan SRS |
| Belajar | /kanji | Daftar, detail, kuis kanji |
| Belajar | /grammar, /grammar/[id] | Daftar dan detail tata bahasa |
| Latihan | /reading, /reading/[id] | Bacaan bertingkat |
| Latihan | /listening, /listening/[id] | Dialog menyimak |
| Latihan | /practice | Kuis campuran dan susun kalimat |
| Latihan | /games | Empat permainan |
| Latihan | /exams | Simulasi JLPT, hasil, riwayat |
| Jelajahi | /culture, /culture/[id] | Artikel budaya |
| Jelajahi | /progress | Statistik, mastery, pencapaian |
| Jelajahi | /settings | Profil dan preferensi |

Navigasi desktop memakai sidebar tiga grup. Navigasi mobile memakai bottom bar lima tujuan utama: Dasbor, Kana, Kosakata, Latihan, Kemajuan; tujuan lain tersedia lewat menu.

### 8.2 Prinsip antarmuka

- Satu aksi utama yang jelas per layar.
- Progres dan konteks level selalu terlihat tanpa mengganggu konten.
- Umpan balik benar/salah langsung disertai alasan, bukan hanya skor.
- Romaji dan furigana adalah bantuan opsional yang dapat dimatikan.
- Desain hangat seperti kertas, aksen Jepang secukupnya, tidak kekanak-kanakan.
- Empty state selalu menawarkan langkah berikutnya; error state menjelaskan pemulihan.
- Mobile-first pada 360–430 px; tabel lebar boleh menggulir horizontal dengan indikator.

---

## 9. Perjalanan pengguna utama

### J1 — Kunjungan pertama dan sesi pertama

1. Pengguna membuka dasbor dan melihat penjelasan singkat, target harian, dan aksi mulai.
2. Pengguna memilih Kana atau langsung latihan campuran.
3. Setelah menjawab, pengguna mendapat umpan balik dan XP.
4. Dasbor menampilkan progres, streak, dan kartu yang akan datang.
5. **Kriteria sukses:** satu sesi selesai, progres tersimpan, pengguna tahu apa yang harus dilakukan besok.

**Celah saat ini:** belum ada onboarding terpandu; rekomendasi masih statis/berbasis checklist.

### J2 — Rutinitas harian 15 menit

1. Dasbor menampilkan kartu jatuh tempo dan target XP.
2. Pengguna membuka ulangan kosakata/kanji, menilai kartu.
3. Pengguna menyelesaikan satu pelajaran atau kuis singkat.
4. Ringkasan sesi menampilkan XP, akurasi, dan langkah berikutnya.

**Celah:** alur ini sudah berfungsi, tetapi rekomendasi belum memilih materi berdasarkan kelemahan.

### J3 — Mempelajari tata bahasa baru

1. Pengguna memfilter level dan membuka pola.
2. Membaca penjelasan, formasi, contoh, dan kesalahan umum.
3. Mengerjakan latihan; melihat pembahasan.
4. Menandai selesai; progres muncul di dasbor.

**Celah:** latihan masih pilihan ganda; belum ada isian rumpang/terjemahan terstruktur.

### J4 — Membaca bertingkat

1. Pengguna memilih teks sesuai level.
2. Membaca dengan furigana; dapat menyembunyikan furigana/terjemahan.
3. Membuka kosakata dan mendengar pengucapan.
4. Menjawab pertanyaan dan membaca pembahasan.

**Kriteria sukses:** pengguna dapat membaca tanpa romaji, memahami ide utama, dan menyimpan teks untuk diulang.

**Celah:** bookmark teks belum ada; jumlah teks N2–N1 masih tipis.

### J5 — Menyimak dan pengucapan

1. Pengguna memutar dialog, dapat memperlambat suara.
2. Menyembunyikan transkrip, menjawab pertanyaan.
3. Membuka frasa kunci dan menirukan ucapan.

**Celah:** belum ada mode shadowing, rekaman, atau umpan balik pengucapan.

### J6 — Simulasi ujian

1. Pengguna memilih level, melihat struktur dan durasi.
2. Mengerjakan tiga bagian dengan timer dan navigasi soal.
3. Mendapat skor, ambang lulus, rincian bagian, dan pembahasan.
4. Riwayat tersimpan; pengguna dapat mengulang.

**Celah:** ujian level lanjut memakai fallback lintas level; belum ada tes per topik.

### J7 — Menjelajahi budaya

1. Pengguna memfilter kategori.
2. Membaca artikel, fakta, kosakata, dan ekspresi.
3. Melihat label register dan peringatan penggunaan.
4. Menandai selesai.

**Status:** sudah kuat; perlu penambahan artikel bertahap dan tautan ke materi terkait.

---

## 10. Kebutuhan fungsional

Status baseline: **Sudah** = berfungsi; **Sebagian** = ada tetapi belum memenuhi visi; **Belum** = belum ada. Prioritas hanya untuk celah.

### 10.1 Dasbor

| ID | Kebutuhan | Status | Prioritas |
| --- | --- | --- | --- |
| FR-DASH-01 | Menampilkan sapaan, level, XP, streak, dan target harian | Sudah | — |
| FR-DASH-02 | Menampilkan kartu jatuh tempo dan tautan ke ulangan | Sudah | — |
| FR-DASH-03 | Menampilkan aktivitas belajar dan heatmap | Sudah | — |
| FR-DASH-04 | Menampilkan rencana harian adaptif | Sebagian | P0 |
| FR-DASH-05 | Memberi rekomendasi aksi berikutnya berbasis aturan | Belum | P0 |
| FR-DASH-06 | Menampilkan rekomendasi pelajaran dan ulangan mendatang | Sebagian | P0 |

### 10.2 Materi belajar

| ID | Kebutuhan | Status | Prioritas |
| --- | --- | --- | --- |
| FR-KANA-01 | Bagan hiragana/katakana lengkap dengan filter grup | Sudah | — |
| FR-KANA-02 | Detail karakter, mnemonik, contoh, audio, mastery | Sudah | — |
| FR-KANA-03 | Kuis baca/tulis dan pencatatan mastery | Sudah | — |
| FR-VOCAB-01 | Kamus dengan pencarian, filter level/topik, contoh | Sudah | — |
| FR-VOCAB-02 | Flashcards SRS dengan rating 0–3 | Sudah | — |
| FR-VOCAB-03 | Bookmark/favorit kosakata | Belum | P0 |
| FR-VOCAB-04 | Latihan mencocokkan kosakata–arti | Belum | P0 |
| FR-KANJI-01 | Daftar/detail kanji dengan bacaan, radikal, goresan | Sudah | — |
| FR-KANJI-02 | Kuis kanji dan ulangan SRS | Sudah | — |
| FR-KANJI-03 | Bookmark kanji dan latihan menulis | Belum | P1 |
| FR-GRAM-01 | 45 pola N5–N1 dengan penjelasan Indonesia | Sudah | — |
| FR-GRAM-02 | Formasi, contoh, kesalahan umum, pola terkait | Sudah | — |
| FR-GRAM-03 | Isian rumpang dan terjemahan terstruktur | Belum | P0 |
| FR-READ-01 | Bacaan bertingkat dengan furigana/terjemahan | Sudah | — |
| FR-READ-02 | Kosakata, pertanyaan, pembahasan | Sudah | — |
| FR-READ-03 | Bookmark bacaan dan rekomendasi teks berikutnya | Belum | P1 |
| FR-LIST-01 | Pemutar dialog dengan mode lambat dan transkrip | Sudah | — |
| FR-LIST-02 | Pertanyaan pemahaman dan frasa kunci | Sudah | — |
| FR-LIST-03 | Dikte/shadowing dengan umpan balik | Belum | P1 |

### 10.3 Latihan interaktif

| ID | Kebutuhan | Status | Prioritas |
| --- | --- | --- | --- |
| FR-PRAC-01 | Kuis pilihan ganda campuran dengan filter | Sudah | — |
| FR-PRAC-02 | Flashcards dengan penjadwalan SRS | Sudah | — |
| FR-PRAC-03 | Susun kalimat dari token | Sudah | — |
| FR-PRAC-04 | Isian rumpang (pilih/ketik) dengan pembahasan | Belum | P0 |
| FR-PRAC-05 | Terjemahan Indonesia–Jepang dan sebaliknya | Belum | P0 |
| FR-PRAC-06 | Mencocokkan kosakata/kanji dengan arti | Belum | P0 |
| FR-PRAC-07 | Sesi latihan adaptif berdasarkan kelemahan | Belum | P1 |
| FR-PRAC-08 | Riwayat latihan dan ringkasan akurasi per tipe | Sebagian | P1 |

### 10.4 Permainan

| ID | Kebutuhan | Status | Prioritas |
| --- | --- | --- | --- |
| FR-GAME-01 | Typing race kana dengan timer | Sudah | — |
| FR-GAME-02 | Memory match | Sudah | — |
| FR-GAME-03 | Listening choice | Sudah | — |
| FR-GAME-04 | Sentence builder | Sudah | — |
| FR-GAME-05 | Word builder dan kana puzzle | Belum | P1 |
| FR-GAME-06 | Vocabulary matching berbasis arti | Belum | P0 |
| FR-GAME-07 | Timed challenge dengan variasi level | Sebagian | P1 |

### 10.5 Pengucapan dan menyimak

| ID | Kebutuhan | Status | Prioritas |
| --- | --- | --- | --- |
| FR-PRON-01 | Audio Jepang untuk kata/kalimat | Sudah | — |
| FR-PRON-02 | Kecepatan bicara dan mode lambat | Sudah | — |
| FR-PRON-03 | Latihan menirukan (shadowing) dengan petunjuk | Belum | P1 |
| FR-PRON-04 | Rekaman/opsional pengenalan suara dengan fallback | Belum | P1 |
| FR-PRON-05 | Fallback dan transkrip saat voice tidak tersedia | Sudah | — |

### 10.6 Ujian

| ID | Kebutuhan | Status | Prioritas |
| --- | --- | --- | --- |
| FR-EXAM-01 | Simulasi JLPT per level dengan timer | Sudah | — |
| FR-EXAM-02 | Tiga bagian: moji-goi, bunpou-dokkai, choukai | Sudah | — |
| FR-EXAM-03 | Skor, ambang lulus, pembahasan, riwayat | Sudah | — |
| FR-EXAM-04 | Tes per topik (kana/kosakata/kanji/grammar) | Belum | P1 |
| FR-EXAM-05 | Bank soal bertag level/topik untuk mengurangi fallback | Belum | P0 |
| FR-EXAM-06 | Analisis kelemahan setelah ujian dan tautan belajar | Belum | P1 |

### 10.7 Budaya

| ID | Kebutuhan | Status | Prioritas |
| --- | --- | --- | --- |
| FR-CULT-01 | Tujuh kategori budaya dengan artikel orisinal | Sudah | — |
| FR-CULT-02 | Fakta, kosakata, dan catatan sumber | Sudah | — |
| FR-CULT-03 | Label register standar/kasual/slang/anime | Sudah | — |
| FR-CULT-04 | Peringatan eksplisit untuk ekspresi anime | Sudah | — |
| FR-CULT-05 | Tautan ke materi bahasa terkait | Sebagian | P1 |

### 10.8 Pengelolaan belajar personal

| ID | Kebutuhan | Status | Prioritas |
| --- | --- | --- | --- |
| FR-PROG-01 | Statistik XP, ulasan, menit belajar, pelajaran, ujian | Sudah | — |
| FR-PROG-02 | Heatmap aktivitas dan grafik XP | Sudah | — |
| FR-PROG-03 | Mastery kosakata/kanji/kana per level | Sudah | — |
| FR-PROG-04 | Riwayat ujian dan ulasan terakhir | Sudah | — |
| FR-PROG-05 | Bookmark kosakata (inti); perluasan ke jenis materi lain bertahap | Belum | P0 |
| FR-PROG-06 | Target harian dan mingguan yang dapat diatur | Sebagian | P0 |
| FR-PROG-07 | Jadwal ulangan yang dapat dilihat lebih dari satu hari | Sebagian | P0 |
| FR-PROG-08 | Pencapaian yang bermakna dan tidak hanya jumlah | Sebagian | P1 |

### 10.9 Pengaturan dan sistem

| ID | Kebutuhan | Status | Prioritas |
| --- | --- | --- | --- |
| FR-SET-01 | Nama profil, tema, romaji, furigana, audio | Sudah | — |
| FR-SET-02 | Target harian, kecepatan suara, voice Jepang | Sudah | — |
| FR-SET-03 | Ekspor/impor JSON dan reset dengan konfirmasi | Sudah | — |
| FR-SYS-01 | Loading, empty, success, error state | Sudah | — |
| FR-SYS-02 | Persistensi server dan cache lokal | Sudah | — |
| FR-SYS-03 | Responsif desktop/tablet/mobile | Sudah | — |
| FR-SYS-04 | Tema terang/gelap/sistem tanpa flash | Sudah | — |
| FR-SYS-05 | Aksesibilitas keyboard dan reduced motion | Sebagian | P0 |
| FR-SYS-06 | Penanganan offline baca dari cache | Sebagian | P2 |

---

## 11. Kebutuhan non-fungsional

| ID | Kebutuhan | Kriteria penerimaan |
| --- | --- | --- |
| NFR-01 | Kinerja | LCP p75 < 2,5 detik pada mobile mid-range; CLS < 0,1; tidak ada layout shift besar saat font/audio dimuat |
| NFR-02 | Aksesibilitas | WCAG 2.2 AA untuk alur utama; fokus terlihat; semua kontrol dapat dijangkau keyboard; target sentuh memadai; aria-live untuk umpan balik |
| NFR-03 | Responsif | 360–430 px, tablet, dan desktop; tidak ada horizontal scroll tak disengaja |
| NFR-04 | Tema | Terang/gelap/sistem konsisten; kontras teks minimal 4,5:1; tidak ada flash saat memuat |
| NFR-05 | Persistensi | Progres bertahan setelah reload/restart; transaksi atomik; ekspor/impor mempertahankan data inti |
| NFR-06 | Privasi/keamanan | Tidak ada pelacakan pihak ketiga; API lokal tidak diekspos publik tanpa autentikasi; input divalidasi |
| NFR-07 | Keandalan | Error state dapat dipulihkan; tidak ada kehilangan data diam-diam; DB memakai WAL dan busy timeout |
| NFR-08 | Maintainability | TypeScript strict; modul konten bertipe; lint/typecheck/test lulus; keputusan dicatat di DECISIONS.md |
| NFR-09 | Kompatibilitas | Chrome/Edge/Firefox/Safari versi terkini; audio memakai fallback bila voice Jepang tidak ada |
| NFR-10 | Akurasi konten | Validasi otomatis + review; tidak ada klaim resmi JLPT; register eksplisit |
| NFR-11 | Bahasa | UI dan penjelasan Indonesia; istilah Jepang dijelaskan; tidak mencampur bahasa tanpa alasan |
| NFR-12 | Keterbatasan lingkungan | Node >= 22.5 untuk node:sqlite; peringatan experimental didokumentasikan |

---

## 12. Arsitektur teknis yang diusulkan

### 12.1 Prinsip arsitektur

**Pertahankan arsitektur yang sudah terbukti.** Tidak ada penulisan ulang, penggantian framework, ORM, atau state library pada MVP. Perubahan harus inkremental dan dapat diuji.

### 12.2 Lapisan saat ini

~~~text
Browser
  └─ App Router pages (client components untuk alur interaktif)
       ├─ components/ (app shell, UI kit, quiz, flashcards, games)
       ├─ providers/ (progress snapshot, toast, theme)
       └─ lib/ (srs, xp, furigana, speech, quiz builders, api client)
            │
            ▼
  Route Handlers /api/progress/* (runtime nodejs, force-dynamic)
            │
            ▼
  server/progress-service.ts (validasi + domain + transaksi)
            │
            ▼
  node:sqlite → .data/kotoba.db (7 tabel, WAL)

Konten statis: src/content/*.ts → tipe src/lib/types.ts → validasi Vitest
~~~

### 12.3 Keputusan yang dipertahankan

- **Next.js App Router** untuk halaman + API dalam satu deployment.
- **React Context** untuk snapshot progres dan toast; state lokal untuk interaksi.
- **Konten TypeScript** sebagai sumber kebenaran, bukan CMS runtime.
- **SQLite/node:sqlite** untuk persistensi lokal tanpa layanan berbayar.
- **Web Speech API** untuk audio dengan fallback transkrip.
- **Tailwind token** untuk tema dan konsistensi visual.
- **Tanpa autentikasi** pada MVP; satu profil lokal.

### 12.4 Perluasan yang direncanakan

1. **Bookmark:** tabel baru (item_id, kind, created_at) + endpoint GET/POST/DELETE; snapshot menyertakan bookmark. MVP memulai dari kosakata, lalu diperluas ke kanji, bacaan, dan budaya.
2. **Target mingguan:** perluas settings JSON atau tabel target; hitung progres dari activity; tampilkan di dasbor dan halaman kemajuan.
3. **Latihan baru:** domain PracticeExercise yang eksplisit (mcq, cloze, translation, matching, ordering, flashcards) dengan validasi jawaban dan pembahasan; jangan memaksa semuanya menjadi QuizQuestion.
4. **Rekomendasi:** modul src/lib/recommendations.ts berbasis aturan: kartu jatuh tempo → kelemahan akurasi → materi belum selesai → latihan singkat. Hasilnya deterministik dan dapat diuji.
5. **Tag soal:** perluas metadata QuizQuestion dengan topik/tag level agar tes per topik dan analisis kelemahan mungkin.
6. **Tes:** Vitest untuk unit/domain, Testing Library untuk komponen kritis, Playwright untuk alur kuis/ujian/SRS, CI menjalankan check + build.
7. **Migrasi skema:** tabel schema_version dan migrasi bertahap sebelum menambah bookmark/multi-profil.
8. **Multi-profil (P2):** tambah user_id pada tabel progres, autentikasi minimal, dan migrasi data profil tunggal; jangan dilakukan sebelum MVP stabil.

### 12.5 Model data

Tabel saat ini: profile, cards, kana_progress, lessons, reviews, exams, activity.

Rencana penambahan MVP:

~~~text
bookmarks(item_id TEXT PRIMARY KEY, kind TEXT NOT NULL, created_at TEXT NOT NULL)
schema_version(version INTEGER NOT NULL)
~~~

Pengaturan profil tetap JSON agar fleksibel; target mingguan ditambahkan ke Settings dengan nilai default dan validasi.

### 12.6 API dan validasi

- Route handler tetap tipis: baca JSON, validasi bentuk, panggil service, kembalikan snapshot/kegagalan.
- Semua route dinamis dan tidak di-cache.
- Batasi panjang array/string; tolak nilai enum yang tidak dikenal.
- Jangan mengekspos error internal/SQL ke klien.
- API publik memerlukan autentikasi dan rate limit sebelum deployment internet.

### 12.7 Deployment

- Satu proses Node (next start) + volume persisten untuk SQLite.
- Reverse proxy HTTPS; backup file DB berkala.
- Tidak disarankan serverless karena SQLite dan proses lokal.
- Font eksternal opsional; pertimbangkan self-host subset pada fase P2.

---

## 13. Dependensi implementasi

| Pekerjaan | Bergantung pada | Catatan |
| --- | --- | --- |
| Ekspansi konten | Skema konten + validasi + review akurasi | Mulai dari kosakata/kanji N4–N1; jangan menambah tanpa tes |
| Bookmark | Migrasi DB + service + snapshot + UI | Perlu keputusan bentuk data sebelum coding |
| Target mingguan | Settings + agregasi activity | Bisa memakai JSON yang sudah ada |
| Latihan baru | Domain PracticeExercise + bank soal bertag | Desain tipe dulu, lalu UI |
| Rekomendasi | Data due/lesson/riwayat + aturan | Harus deterministik dan dapat diuji |
| Tes per topik | Tag soal + bank soal cukup | Setelah konten dan tag stabil |
| Tes komponen/E2E | Alur kritis stabil | Tambahkan Testing Library/jsdom; Playwright sudah tersedia lokal |
| Pengucapan lanjutan | Web Speech + dukungan browser | Wajib fallback; jangan menjadikan blocker |
| Multi-profil | Autentikasi + migrasi | P2; jangan mencampur dengan MVP |
| PWA/offline | Service worker + antrean mutasi | P2; baca cache dulu, tulis offline nanti |

---

## 14. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Kualitas/akurasi konten baru | Tinggi | Dua lapis review, validasi otomatis, daftar istilah sensitif |
| Volume konten N4–N1 besar | Tinggi | Ambang MVP per level, batch kecil, ukur coverage di CI |
| Scope creep fitur P1/P2 | Sedang | Batas MVP di dokumen ini; perubahan scope lewat keputusan tertulis |
| Voice Jepang tidak tersedia | Sedang | Transkrip, fallback UI, audio statis di fase later |
| node:sqlite experimental | Sedang | Kunci versi Node, uji upgrade, siapkan jalur better-sqlite3 bila perlu |
| Data hilang saat migrasi | Tinggi | Backup sebelum migrasi, transaksi, uji ekspor/impor |
| API terekspos publik | Tinggi | Dokumentasikan single-user; tambahkan auth sebelum deploy internet |
| Perubahan Next.js 16 | Sedang | Baca dokumentasi versi, jangan mengandalkan pengetahuan lama |

---

## 15. Asumsi dan pertanyaan terbuka

### Asumsi

- MVP ditujukan untuk satu pembelajar di satu perangkat; tanpa akun.
- Bahasa utama Indonesia; tidak ada lokalisasi Inggris pada MVP.
- Tidak ada layanan berbayar atau API AI.
- Konten orisinal; level JLPT adalah perkiraan.
- Pengguna memakai browser modern dengan JavaScript.
- Kualitas audio bergantung perangkat; transkrip adalah fallback resmi.

### Pertanyaan yang perlu diputuskan sebelum fase berikutnya

1. Apakah target konten MVP di 7.2 disetujui, atau perlu ambang yang lebih tinggi?
2. Apakah bookmark cukup untuk kosakata/kanji/bacaan, atau semua jenis materi?
3. Apakah latihan terjemahan memakai input bebas (perlu normalisasi jawaban) atau pilihan ganda?
4. Apakah tes per topik masuk MVP atau P1?
5. Apakah pengucapan dengan rekaman/speech recognition masuk roadmap v0.3 atau ditunda?

Keputusan yang belum dijawab tidak menghalangi pekerjaan P0; default di dokumen ini dipakai sampai ada keputusan baru.

---

## 16. Definisi selesai MVP

MVP v0.2 dinyatakan selesai bila:

1. Seluruh butir P0 di Bagian 6.2 terimplementasi dan diterima.
2. Ambang konten di 7.2 tercapai untuk semua level.
3. npm run check, build, dan E2E alur kritis lulus.
4. Tidak ada error console/page pada rute utama; tidak ada pelanggaran aksesibilitas serius pada audit dasar.
5. Bookmark dan target mingguan bertahan setelah reload, ekspor, dan impor.
6. Rekomendasi harian menghasilkan aksi yang masuk akal dan tidak mengarah ke halaman kosong.
7. Dokumentasi PROJECT_STATUS.md, DECISIONS.md, dan roadmap diperbarui.
8. Tidak ada regresi pada fitur baseline yang sudah berjalan.

---

## 17. Dokumen terkait

- [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md) — prioritas, fase, dependensi, dan kriteria rilis.
- [PROJECT_STATUS.md](PROJECT_STATUS.md) — status implementasi dan hasil verifikasi.
- [DECISIONS.md](DECISIONS.md) — catatan keputusan arsitektur.
- [README.md](README.md) — cara menjalankan dan ringkasan fitur.
