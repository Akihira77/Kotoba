# Concerns Backlog — Kotoba 言葉

**Versi dokumen:** 1.7  
**Tanggal:** 2026-11-09  
**Cakupan:** seluruh fase rekayasa 1–19, ditinjau pada penutupan Fase 12, Fase 13, perencanaan Fase 14, audit mobile Fase 14B, implementasi Audio Studio Fase 16, Writing Studio Fase 17, Story Theater Fase 18, dan stabilisasi integrasi Fase 19  
**Status:** aktif; ditinjau pada setiap penutupan fase dan pada fase konsolidasi akhir  
**Dokumen sumber:** [PROJECT_STATUS.md](PROJECT_STATUS.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [DATA_MODEL.md](DATA_MODEL.md) · [DECISIONS.md](DECISIONS.md) · [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md) · [MOBILE_COMPATIBILITY_REPORT.md](MOBILE_COMPATIBILITY_REPORT.md) · [ENHANCED_LEARNING_FEATURES_SPEC.md](ENHANCED_LEARNING_FEATURES_SPEC.md) · [ENHANCED_FEATURES_ARCHITECTURE.md](ENHANCED_FEATURES_ARCHITECTURE.md) · [ENHANCED_FEATURES_ROADMAP.md](ENHANCED_FEATURES_ROADMAP.md) · [ENHANCED_FEATURES_STATUS.md](ENHANCED_FEATURES_STATUS.md)

---

## 1. Tujuan dan aturan tata kelola

Dokumen ini adalah **sumber tunggal status concern lintas fase**: masalah teknis, rekomendasi arsitektur, risiko, item kualitas, dan fitur opsional yang tidak boleh hilang hanya karena berada di luar lingkup fase saat ditemukan.

Aturan:

1. Setiap concern memiliki **ID stabil** dan tidak dihapus. Item yang selesai tetap disimpan sebagai `RESOLVED`; item yang ditolak tetap disimpan sebagai `REJECTED`.
2. Setiap item wajib memiliki **fase asal**, alasan pentingnya, risiko/dependensi, prioritas, kompleksitas, status, dan keputusan.
3. Status yang digunakan: **OPEN**, **ACCEPTED**, **IN_PROGRESS**, **RESOLVED**, **DEFERRED**, **REJECTED**, **BLOCKED**.
4. `ACCEPTED` berarti disetujui untuk direncanakan pada fase berikutnya, **bukan** berarti sudah diimplementasikan. Implementasi tetap memerlukan tugas, tes, dan review tersendiri.
5. `DEFERRED` wajib memiliki pemicu yang jelas. `BLOCKED` wajib menyebut dependensi yang belum tersedia. `REJECTED` wajib memiliki alasan produk/teknis, bukan sekadar “tidak sempat”.
6. Keputusan arsitektur yang mengubah batas sistem dicatat sebagai ADR di [DECISIONS.md](DECISIONS.md). Dokumen ini tidak menggantikan ADR.
7. Pada setiap penutupan fase: tinjau item `ACCEPTED`, `DEFERRED`, dan `BLOCKED`; jangan menambah fitur baru sebelum item P0/P1 yang relevan dinilai.
8. Jangan mengimplementasikan seluruh backlog secara otomatis. Prioritas utama adalah nilai belajar, akurasi, keamanan, maintainability, dan lingkup produk.

### Skala prioritas

| Prioritas | Arti |
| --- | --- |
| **P0** | Blocker deployment publik atau koreksi belajar inti; harus selesai sebelum klaim produksi publik. |
| **P1** | Nilai tinggi; target 1–2 fase berikutnya. |
| **P2** | Penting untuk skala/kualitas jangka panjang; ditunda dengan pemicu. |
| **P3** | Opsional/nice-to-have; hanya jika ada kapasitas dan bukti kebutuhan. |

### Skala kompleksitas

| Kompleksitas | Perkiraan |
| --- | --- |
| **S** | Di bawah 1 hari; perubahan terisolasi. |
| **M** | 1–3 hari; beberapa file/tes. |
| **L** | 4–10 hari; lintas modul atau data. |
| **XL** | Lebih dari 10 hari; perubahan arsitektur/produk besar. |

---

## 2. Ringkasan status

Total concern tercatat: **116**. Tidak ada item `OPEN` atau `IN_PROGRESS` yang belum dievaluasi pada penutupan Fase 19; setiap item sudah memiliki disposisi.

| Status | Jumlah |
| --- | ---: |
| RESOLVED | 39 |
| ACCEPTED | 5 |
| DEFERRED | 68 |
| REJECTED | 3 |
| BLOCKED | 1 |
| IN_PROGRESS | 0 |
| OPEN | 0 |

**Cara membaca ringkasan:** `RESOLVED` adalah pekerjaan yang sudah diverifikasi, termasuk audit mobile Fase 14B. `ACCEPTED` berarti disetujui untuk fase berikutnya, bukan sudah diimplementasikan. Fase 14 memindahkan CNT-07 dari `BLOCKED` ke `ACCEPTED` setelah cakupan KanjiVG diverifikasi, dan menambahkan 14 concern perencanaan fitur audio/writing/story. Fase 14B menambahkan RES-16 (audit lintas viewport) dan UX-14 (verifikasi perangkat fisik). Fase 16 menambahkan RES-17 (pemutar audio/fallback jujur) dan RES-18 (cakupan audio enam kategori). Fase 17 menyelesaikan ARC-13, CNT-07, CNT-22, dan UX-12, lalu menambahkan CNT-24 (catatan bentuk terkurasi), UX-15 (stylus/perangkat fisik), dan RES-19 (batas snapshot writing). Fase 18 menyelesaikan ARC-14, ARC-15, CNT-23, dan UX-13, lalu menambahkan tujuh concern: UX-16 (timing TTS per baris), UX-17 (resume cerita), UX-18 (kamus per kata arbitrer), PRD-10 (ekspor video), PRD-11 (pipeline aset video/CMS), RES-20 (batas snapshot cerita), dan CNT-25 (perluasan cerita). Fase 19 menyelesaikan RES-21 (regresi 102 pemeriksaan rute/performa/a11y) dan RES-22 (integrasi pelajaran→menulis serta koreksi salinan goresan); tidak ada concern baru, karena fase ini tidak menambah fitur. `DEFERRED` memiliki pemicu; `BLOCKED` hanya CNT-08 (komponen kanji) yang menunggu dataset terverifikasi. `REJECTED` sengaja tidak dikerjakan dengan alasan yang tercatat.

### Disposisi Fase 13

| Hasil | Item |
| --- | --- |
| **RESOLVED (11)** | SEC-07 backup/restore; ARC-04 loading skeleton akar; CNT-03 delapan LessonPlan N5; CNT-05 validator semantik; UX-01 reflow 320 px; UX-04 status non-warna; UX-06 label pencarian; ENG-01 CI; ENG-05 audit produksi; ENG-07 tata kelola dokumen; ENG-08 CHANGELOG |
| **DEFERRED (11)** | ARC-01 bundle katalog; ARC-03 id kanonis; ARC-08 exam chunk; ARC-09 observability; CNT-01 N4; CNT-02 N3–N1; UX-02 axe/CI; ENG-02 E2E; ENG-03 tes komponen; ENG-04 perf budget; ENG-06 Git |

Alasan lengkap ada di ADR-047 dan baris masing-masing. Yang `DEFERRED` bukan berarti tidak penting; pemicunya harus dicek pada awal fase berikutnya. `CNT-01`/`CNT-02` tetap DEFERRED pada jalur konten P0 terpisah (bukan Fase 14) karena keduanya membutuhkan penulisan dan review konten, bukan sekadar pekerjaan teknis.

### Disposisi Fase 14

Fase 14 adalah audit/perencanaan untuk tiga fitur baru; tidak ada implementasi. Disposisi di bawah mencatat kesiapan dan keputusan untuk Fase 15–19.

| Hasil | Item |
| --- | --- |
| **Dipindahkan dari BLOCKED ke ACCEPTED (1)** | CNT-07 latihan menulis/urutan goresan — data KanjiVG diverifikasi 259 karakter; implementasi Fase 16 setelah pipeline lisensi |
| **Tetap BLOCKED (1)** | CNT-08 komponen kanji — belum ada dataset komponen yang divalidasi independen |
| **Baru, ACCEPTED (12)** | ARC-12 resolver/manifest audio; ARC-13 pipeline stroke/lisensi; ARC-14 model cerita; ARC-15 renderer animasi/reduced motion; CNT-21 konten cerita/karakter/audio orisinal; CNT-22 kebijakan yoon; CNT-23 konsistensi vocab/furigana cerita; UX-11 a11y audio; UX-12 a11y kanvas; UX-13 a11y story player; ENG-13 verifikasi aset/lisensi deterministik; PRD-09 kebijakan aset media |
| **Baru, DEFERRED (2)** | ENG-14 visual regression/perf budget; PRD-08 trigger CMS |

Semua item baru belum diimplementasikan. `ACCEPTED` hanya berarti disetujui untuk direncanakan pada fase yang disebut; gate implementasi tetap berlaku.

### Disposisi Fase 14B

Fase 14B adalah audit kompatibilitas mobile aplikasi learner; tidak ada fitur, tabel, endpoint, atau redesign. CMS/admin, kanvas menulis, dan story theater tidak ada sehingga tidak diaudit.

| Hasil | Item |
| --- | --- |
| **RESOLVED (1)** | RES-16 audit 29 rute × 9 viewport; overflow `/progress` dan pemotongan label diperbaiki; 0 overflow/error |
| **DEFERRED (1)** | UX-14 verifikasi perangkat fisik, iOS Safari/Android Chrome, kamera/file picker, audio perangkat, dan screen reader |
| **Tidak diaudit** | Permukaan CMS/admin, kanvas menulis, animasi goresan, dan story theater — tidak tersedia di repositori; jangan klaim lulus |

### Disposisi Fase 15–16

Fase 15 (CMS) **tidak dieksekusi** karena tidak ada CMS/admin, API konten, atau tabel konten di repo; keputusan menunggu lokasi CMS atau otorisasi membangun fondasi. Fase 16 mengimplementasikan Audio Studio di atas konten dan Settings yang ada.

| Hasil | Item |
| --- | --- |
| **RESOLVED Fase 16 (2)** | RES-17 pemutar audio global/antrean/fallback hanya `ja-JP`; RES-18 cakupan audio kana/kosakata/kanji/tata bahasa/bacaan/percakapan + kontrol reusable + preferensi |
| **Saat penutupan Fase 16, ACCEPTED (13)** | ARC-12 tanpa manifest audio statis; ARC-13–15 writing/story; CNT-07/21/22/23; UX-11–13; ENG-13; PRD-09 — target fase diperbarui |
| **Tetap BLOCKED (1)** | CNT-08 komponen kanji — dataset belum tersedia |
| **Fase 15** | Tidak ada perubahan status CMS; PRD-08 tetap DEFERRED/BLOCKED secara operasional sampai keputusan dibuat |
| **Tidak diaudit** | CMS mobile, kanvas menulis, story theater, dan audio perangkat fisik tetap tidak diklaim |

### Disposisi Fase 17

Fase 17 mengimplementasikan Writing Studio di atas data KanjiVG terpin, tanpa CMS dan tanpa story player. Tidak ada redesign aplikasi.

| Hasil | Item |
| --- | --- |
| **RESOLVED Fase 17 (4)** | ARC-13 pipeline stroke berlisensi; CNT-07 latihan menulis/urutan goresan; CNT-22 kebijakan yōon; UX-12 aksesibilitas kanvas menulis |
| **Baru, DEFERRED (3)** | CNT-24 catatan bentuk terkurasi baru ±45 karakter; UX-15 verifikasi stylus/perangkat sentuh fisik; RES-19 batas 400 attempt menulis pada snapshot |
| **Tetap ACCEPTED (9)** | ARC-12 manifest audio statis; ARC-14–15 story model/renderer; CNT-21/23 cerita; UX-11/13 audio/story a11y; ENG-13 verifikasi lisensi otomatis penuh; PRD-09 manifest media |
| **Tetap BLOCKED (1)** | CNT-08 komponen kanji — dataset komponen independen belum tersedia |
| **Fase 15** | CMS tetap tidak ada dan tidak diklaim; PRD-08 tetap DEFERRED |

Lisensi KanjiVG (CC BY-SA 3.0) dicatat di `THIRD_PARTY_NOTICES.md`, teks lisensi, dan UI. Evaluasi menulis adalah perkiraan geometri; tidak ada klaim pengenalan tulisan tangan.

### Disposisi Fase 18

Fase 18 mengimplementasikan Story Theater di atas konten bertipe dan pemutar audio Fase 16. Tidak ada CMS, video AI, ekspor video, atau redesign.

| Hasil | Item |
| --- | --- |
| **RESOLVED Fase 18 (4)** | ARC-14 model cerita/karakter/adegan; ARC-15 renderer panggung SVG/CSS + reduced motion; CNT-23 konsistensi vocab/furigana; UX-13 aksesibilitas story player |
| **Baru, DEFERRED (7)** | UX-16 timing TTS per baris/tanpa sinkronisasi per kata; UX-17 resume/checkpoint cerita; UX-18 kamus per kata arbitrer; PRD-10 ekspor video; PRD-11 pipeline aset video/CMS; RES-20 batas snapshot 300 attempt cerita; CNT-25 perluasan katalog cerita |
| **Tetap ACCEPTED (5)** | ARC-12 manifest audio statis/rekaman; CNT-21 cerita keempat dan karakter lebih kaya; UX-11 audit screen reader/keyboard fisik audio; ENG-13 verifikasi lisensi otomatis penuh; PRD-09 manifest media |
| **Tetap BLOCKED (1)** | CNT-08 komponen kanji — dataset komponen independen belum tersedia |
| **Fase 15** | CMS tetap tidak ada dan tidak diklaim; PRD-08 tetap DEFERRED |

Cerita yang dikirim adalah 3 (2 N5 + 1 N4), bukan empat seperti rencana awal, sehingga CNT-21 tetap ACCEPTED. Audio hanya memakai voice `ja-JP`; highlight per baris, bukan per kata. Pemetaan voice karakter hanya dilakukan bila tersedia ≥2 voice Jepang. `StoryScene.videoUrl` adalah seam opsional tanpa aset/CMS, dan ekspor video tidak diimplementasikan.

### Disposisi Fase 19

Fase 19 adalah stabilisasi integrasi audio/menulis/cerita, bukan ekspansi fitur. Tidak ada tabel, endpoint, CMS, atau video baru.

| Hasil | Item |
| --- | --- |
| **RESOLVED Fase 19 (2)** | RES-21 regresi 34 rute × 3 viewport = 102/102, 6 perjalanan kritis, audit performa dan nama kontrol; RES-22 integrasi pelajaran→Studio Menulis, koreksi salinan goresan usang, dan tes tautan |
| **Baru, DEFERRED (0)** | Tidak ada concern baru; skrip QA masih sementara dan menjadi pekerjaan Fase 20 |
| **Tetap ACCEPTED (5)** | ARC-12 manifest audio statis/rekaman; CNT-21 cerita keempat dan karakter lebih kaya; UX-11 audit screen reader/keyboard fisik audio; ENG-13 verifikasi lisensi otomatis penuh; PRD-09 manifest media |
| **Tetap DEFERRED** | UX-14 verifikasi perangkat fisik; UX-16 timing TTS; UX-17 resume cerita; UX-18 kamus per kata; PRD-10 ekspor video; PRD-11 pipeline aset video/CMS; RES-19/20 batas snapshot; CNT-24/25 dan item lama lain |
| **Tetap BLOCKED (1)** | CNT-08 komponen kanji — dataset komponen independen belum tersedia |
| **Fase 15** | CMS tetap tidak ada: `/admin` dan `/api/admin` 404, tanpa tautan CMS; PRD-08 tetap DEFERRED |

---

## 3. Daftar concern

### Keamanan, privasi, dan deployment

| ID | Concern | Fase | Mengapa penting | Risiko / dependensi | Prioritas | Kompleksitas | Status | Keputusan / target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SEC-01 | Autentikasi dan otorisasi API progres belum ada. | Fase 2 (seam), Fase 12 (audit) | Siapa pun yang dapat menjangkau port dapat membaca, mereset, mengekspor, atau mengimpor seluruh progres. Ini blocker deployment publik. | Desain sesi, migrasi profil tunggal, isolasi data, UX login, dan pengujian keamanan. Bergantung pada keputusan produk tentang akun. | P0 (publik) | XL | **DEFERRED** | Ditunda selama mode satu perangkat dipertahankan. Wajib diselesaikan sebelum deployment publik; lihat ADR-043 dan FEATURE_ROADMAP Fase 7. |
| SEC-02 | TLS/HTTPS belum tersedia. | Fase 12 | Tanpa TLS, kredensial dan progres dapat disadap bila aplikasi diekspos. Saat ini hanya loopback sehingga risikonya rendah. | Reverse proxy, sertifikat, konfigurasi domain, dan HSTS. Bergantung pada SEC-01. | P0 (publik) | L | **DEFERRED** | Ditunda bersama deployment publik. Jangan ekspos port sebelum TLS dan auth siap. |
| SEC-03 | Rate limiting dan perlindungan penyalahgunaan belum ada. | Fase 12 | Endpoint tulis dan impor besar dapat dibanjiri; SQLite sinkron membuat serangan sederhana lebih berdampak. | Membutuhkan identitas atau pembatas per IP; dapat mengganggu pemakaian lokal. Bergantung pada SEC-01. | P1 (publik) | M | **DEFERRED** | Ditunda sampai deployment publik; batas body 5 MiB sudah mengurangi risiko saat ini. |
| SEC-04 | Audit log keamanan dan aktivitas admin belum ada. | Fase 12 | Tanpa jejak reset/impor/login, insiden tidak dapat diselidiki dan perubahan data tidak dapat diaudit. | Penyimpanan tambahan, retensi, privasi, dan integrasi auth. Bergantung pada SEC-01. | P2 | M | **DEFERRED** | Ditunda sampai ada mode multi-pengguna atau deployment publik. |
| SEC-05 | Isolasi multi-pengguna dan kepemilikan data belum ada. | Fase 2, Fase 12 | Semua tabel progres mengasumsikan satu profil. Dua pengguna pada instance yang sama akan berbagi data. | Kolom user_id/tenant, migrasi data lama, query terfilter, dan pengujian isolasi. Bergantung pada SEC-01. | P0 (publik) | XL | **DEFERRED** | Ditunda; aplikasi secara eksplisit satu profil lokal. Termasuk roadmap Fase 7 produk. |
| SEC-06 | Progres dan skor bersifat client-authoritative. | Fase 5, Fase 8, Fase 12 | Server memvalidasi bentuk dan katalog, tetapi tidak menilai ulang jawaban. Pengguna dapat memanipulasi XP, skor, atau riwayat. | Kunci jawaban server-side, validasi sesi, dan perubahan kontrak API. Dapat menambah latensi. | P1 (publik) | L | **DEFERRED** | Diterima untuk latihan mandiri satu pengguna; wajib ditinjau sebelum klaim sertifikasi atau deployment publik. |
| SEC-07 | Backup dan restore otomatis belum ada. | Fase 12 (konsolidasi) | Impor mengganti seluruh progres; database SQLite dapat rusak atau hilang. Pengguna saat ini harus mengekspor manual. | Penyimpanan backup, rotasi, enkripsi, privasi, dan uji restore. Tidak bergantung pada auth. | P1 | M | **RESOLVED** | Selesai Fase 13: scripts/backup-db.mjs (VACUUM INTO, integrity_check, retensi 7, restore --yes + pre-restore); 3 tes dan roundtrip terverifikasi. |
| SEC-08 | Belum ada schema_version dan migrasi database berversi. | Fase 2, Fase 12 | Perubahan skema berikutnya berisiko merusak data lama; impor lintas versi belum memiliki penanda kompatibilitas. | Migrasi bertahap, backup sebelum migrasi, dan tes roundtrip. Bergantung pada SEC-07. | P1 | M | **DEFERRED** | Ditunda dengan pemicu: sebelum perubahan tabel/kolom pertama atau deployment multi-perangkat. |
| SEC-09 | CSP masih memakai unsafe-inline untuk theme boot script. | Fase 12 | CSP lebih lemah dari yang seharusnya; XSS yang menyuntikkan script inline dapat lolos. | Nonce/hash harus diteruskan ke script boot dan layout; perlu pengujian hidrasi/tema. | P2 | S | **DEFERRED** | Ditunda; tanpa auth dan dengan React escaping, risiko saat ini terbatas. Tinjau ulang saat publik. |
| SEC-10 | Konfigurasi Host allowlist dan reverse proxy untuk publik belum ada. | Fase 12 | Allowlist saat ini hanya loopback. Deployment publik harus mengubahnya tanpa membuka DNS rebinding. | Konfigurasi deployment, domain, dan pengujian header. Bergantung pada SEC-01/SEC-02. | P0 (publik) | S | **DEFERRED** | Ditunda bersama deployment publik; jangan hanya menghapus guard loopback. |
| SEC-11 | Alur privasi, ekspor, dan penghapusan akun belum ada. | Fase 12 | Multi-pengguna memerlukan hak akses, ekspor, dan penghapusan data yang jelas; saat ini reset menghapus progres tetapi bukan identitas. | Kebijakan retensi, auth, dan audit. Bergantung pada SEC-01/SEC-05. | P2 | M | **DEFERRED** | Ditunda sampai model akun diputuskan. |

### Arsitektur, data, dan performa

| ID | Concern | Fase | Mengapa penting | Risiko / dependensi | Prioritas | Kompleksitas | Status | Keputusan / target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ARC-01 | Katalog kosakata/kanji/tata bahasa masih ikut bundle klien sekitar 33 KiB gzip. | Fase 12 | Chunk katalog dimuat di banyak rute dan memperbesar JavaScript awal, terutama di mobile. | Server component, endpoint katalog, atau slicing per rute; refaktor berisiko mengubah data flow. | P1 | M | **DEFERRED** | Ditunda: pengukuran setelah font remote dihapus/code splitting belum menunjukkan urgensi; pemicu: chunk katalog >40 KiB gzip pada rute inti. |
| ARC-02 | SQLite sinkron dan snapshot penuh dihitung pada setiap mutasi. | Fase 12 | DatabaseSync memblokir event loop; snapshot dan agregat tumbuh seiring data. Pada 2 kartu masih 2–6 ms, tetapi tidak akan tetap demikian. | Delta response, pagination, caching, atau migrasi Postgres. Perubahan kontrak snapshot dan UI. | P2 | L | **DEFERRED** | Ditunda dengan pemicu: snapshot melebihi sekitar 100 KB atau TTFB mutasi melebihi 200 ms. |
| ARC-03 | Id progres belum memakai id kanonis katalog. | Fase 4, Fase 12 | Pemetaan implisit di learning.ts menyulitkan analitik, migrasi, dan penamaan aktivitas yang konsisten. | Data lama harus dialias atau dimigrasi; semua halaman progres dan tes terdampak. | P1 | M | **DEFERRED** | Ditunda: migrasi id menyentuh data lama dan 70 LessonPlan; pemicu: sebelum penambahan N4 atau perubahan skema. |
| ARC-04 | Hanya 4 dari 29 rute memiliki loading.tsx. | Fase 12 | Rute berat seperti katalog dan statistik dapat tampak kosong saat navigasi; pengalaman mobile kurang halus. | Skeleton yang terlalu mirip konten dapat menyesatkan; perlu komponen bersama. | P2 | S | **RESOLVED** | Selesai sebagian Fase 13: PageSkeleton/loading akar dan rute utama ada; belum semua 29 rute punya loading.tsx. |
| ARC-05 | GET snapshot belum memakai ETag, Cache-Control, atau delta. | Fase 12 | Setiap navigasi mengambil snapshot penuh; cache dan delta dapat mengurangi transfer serta beban SQLite. | Invalidasi cache setelah mutasi; kompleksitas sinkronisasi klien. | P2 | M | **DEFERRED** | Ditunda bersama ARC-02 setelah ada pengukuran produksi nyata. |
| ARC-06 | Provider progres mengganti seluruh snapshot dan merender ulang banyak konsumen. | Fase 10, Fase 12 | Setiap mutasi mengganti objek snapshot dan menulis localStorage; pada data besar ini memicu render berlebih. | Selektor granular, normalized store, atau React Query. Perubahan arsitektur state. | P2 | M | **DEFERRED** | Ditunda; optimasi awal adalah mengurangi ukuran snapshot dan frekuensi mutasi. |
| ARC-07 | Belum ada versi API atau kontrak OpenAPI. | Fase 12 | Perubahan endpoint dapat memutus klien lama; dokumentasi kontrak tersebar di docs dan kode. | Versioning route, skema validasi, dan dokumentasi. Tidak mendesak untuk satu klien. | P2 | M | **DEFERRED** | Ditunda sampai ada klien eksternal atau API publik. |
| ARC-08 | Exam engine masih dimuat eager di /exams/session. | Fase 12 | Chunk ujian sekitar 100 KiB gzip ditambahkan ke rute sesi; hanya sebagian fitur dibutuhkan saat mulai. | Code splitting dapat mempersulit state timer dan navigasi; perlu pengukuran. | P2 | S | **DEFERRED** | Ditunda: belum ada bukti waktu interaktif memburuk; pemicu: p75 TTI /exams/session >2,5 dtk pada perangkat target. |
| ARC-09 | Belum ada observability, structured logging, atau error reporting. | Fase 12 | Kegagalan produksi hanya terlihat di console pengguna; tidak ada jejak yang dapat dianalisis. | Log lokal, rotasi, privasi, dan alarm. Jangan mengirim data ke pihak ketiga tanpa persetujuan. | P2 | M | **DEFERRED** | Ditunda: belum ada deployment publik; pemicu: sebelum server dipakai di luar satu perangkat. |
| ARC-10 | node:sqlite masih eksperimental dan aplikasi satu proses/satu instance. | Fase 2, Fase 12 | API dapat berubah pada Node baru; SQLite tidak cocok untuk multi-instance atau beban tulis paralel. | Pin versi Node, evaluasi driver alternatif, atau migrasi Postgres saat sync. | P2 | L | **DEFERRED** | Ditunda; Node >=22.5 dipin dan migrasi hanya jika skala/multi-pengguna menuntut. |
| ARC-11 | Tidak ada font web; rendering Jepang bergantung perangkat. | Fase 12 | Bentuk kanji dan metrik baris dapat berbeda antar perangkat, sehingga konsistensi visual tidak dijamin. | Self-host subset font menambah aset dan lisensi; dapat memperlambat muat awal. | P3 | M | **DEFERRED** | Ditunda; stack sistem dipertahankan sesuai ADR-045. Tinjau jika ada kebutuhan merek atau konsistensi ketat. |
| ARC-12 | Belum ada resolver audio terpadu dan manifest aset. | Fase 14 | Audio saat ini bergantung pada TTS perangkat; rekaman tidak dapat ditambahkan tanpa jalur yang konsisten. | Perlu kompatibilitas dengan SpeechProvider, validasi file/hash/lisensi, dan fallback yang jelas. | P1 | M | **ACCEPTED** | Fase 16 menyelesaikan resolver TTS `ja-JP` + pemutar global; manifest/rekaman statis tetap ditunda sampai ada aset berlisensi. |
| ARC-13 | Belum ada pipeline data stroke berlisensi. | Fase 14 | Tulisan membutuhkan path/urutan yang benar; data mentah KanjiVG tidak boleh dimuat semua ke bundle. | Impor offline, pin commit, verifikasi 259 karakter, atribusi/share-alike, dan fallback build. | P1 | L | **RESOLVED** | Selesai Fase 17: importer deterministik, commit terpin, 259 JSON per glyph, tes memeriksa file/viewBox/urutan/geometri; atribusi di UI dan notices. |
| ARC-14 | Belum ada model domain cerita/karakter/adegan. | Fase 14 | Cerita tidak dapat dirender atau diproses tanpa tipe dan validator yang stabil. | Menyentuh `src/lib/types.ts`, konten baru, progres, dan API story; jangan menduplikasi tipe conversation. | P1 | M | **RESOLVED** | Selesai Fase 18: tipe Story/Character/Scene/Line/Question + validator; 3 cerita/9 adegan/36 baris; reuse JpText/audio; tidak ada tabel konten. |
| ARC-15 | Belum ada renderer panggung/animasi cerita. | Fase 14 | Cerita perlu panggung yang ringan, aksesibel, dan tidak bergantung video. | CSS/Web Animations, reduced motion, layout stabil, dan performa mobile. | P2 | M | **RESOLVED** | Selesai Fase 18: `StoryStage` generik, 8 latar SVG/CSS, posisi/ekspresi/bubble, transisi ringan, reduced motion; tanpa library animasi baru. |

### Konten dan kualitas pembelajaran

| ID | Concern | Fase | Mengapa penting | Risiko / dependensi | Prioritas | Kompleksitas | Status | Keputusan / target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CNT-01 | Belum ada 50–60 pelajaran N4 interaktif. | Fase 4, Fase 12 | Setelah N5, pengguna kehabisan jalur LessonPlan; ini celah konten terbesar. | Beban penulisan dan review linguistik; harus memakai validator dan struktur LessonPlan. | P0 | L | **DEFERRED** | Jalur konten P0 terpisah (bukan Fase 14): 50–60 pelajaran N4 adalah fokus konten berikutnya; menulis tergesa-gesa melemahkan akurasi. |
| CNT-02 | Konten N3–N1 masih tipis; ujian memakai fallback lintas level. | Fase 4, Fase 12 | Simulasi level tinggi tidak konsisten dan tidak mewakili tingkat kesulitan sebenarnya. | Penulisan bank soal besar, review bahasa, dan kalibrasi tingkat. Bergantung pada CNT-01. | P0/P1 | L | **DEFERRED** | Ditunda bersama CNT-01; pemicu: N4 selesai dan bank soal per level mencapai ambang minimum. |
| CNT-03 | Delapan pelajaran N5 membaca/menyimak belum menjadi LessonPlan. | Fase 4 | Jalur N5 belum sepenuhnya interaktif; pengguna masih memakai tombol selesai manual. | Perubahan progres id dan integrasi halaman materi lama. | P0 | M | **RESOLVED** | Selesai Fase 13: 8 LessonPlan les-reading-*/les-listening-*, blok jp-prose/dialog, soal sumber; total 70 rencana. |
| CNT-04 | Belum ada review oleh penutur asli atau ahli bahasa Jepang. | Fase 12 | Audit internal menemukan kesalahan; review eksternal diperlukan untuk kualitas dan kepercayaan. | Ketersediaan reviewer, biaya, dan proses revisi. Bergantung pada sumber daya manusia. | P1 | M | **DEFERRED** | Ditunda dengan pemicu: reviewer tersedia atau sebelum klaim kualitas produksi. |
| CNT-05 | Validator konten baru memeriksa struktur, belum makna atau ambiguitas jawaban. | Fase 2, Fase 12 | Kesalahan seperti dua jawaban benar tidak tertangkap tes otomatis. | Validasi semantik sulit diotomatisasi; perlu aturan khusus dan review manusia. | P1 | M | **RESOLVED** | Selesai Fase 13: content-qa.ts memeriksa opsi duplikat, answerIndex, prompt kosong, ID ganda/isi berbeda; 4 tes. |
| CNT-06 | Gaya romanisasi dan kata serapan belum seragam. | Fase 12 | Inkonsistensi macron/wapuro dan istilah Inggris dapat membingungkan pemula. | Perubahan massal menimbulkan churn dan risiko salah edit; perlu pedoman gaya. | P3 | S | **DEFERRED** | Ditunda; dokumentasikan pedoman, perbaiki saat menyentuh konten terkait. |
| CNT-07 | Latihan menulis dan urutan goresan belum ada. | Fase 11; audit Fase 14 | Menulis adalah keterampilan inti. Fase 14 memverifikasi KanjiVG mencakup 111/111 kanji dan 208/208 kana (259 karakter unik), sehingga data yang dapat dilacak tersedia. | Data dan lisensi CC BY-SA 3.0 (atribusi + share-alike); aksesibilitas kanvas; kualitas urutan tetap perlu review sampel. | P2 | L | **RESOLVED** | Selesai Fase 17: 319 entri/259 glyph, impor KanjiVG, animasi, mode tirukan/mandiri, evaluasi geometri, `writing_attempts`; tetap tanpa klaim handwriting recognition. |
| CNT-08 | Komponen kanji dan kanji mirip belum ditampilkan. | Fase 11 | Pemahaman komponen membantu belajar kanji, tetapi data komponen harus terverifikasi. | Sumber data, lisensi, dan risiko salah dekomposisi. | P2 | M | **BLOCKED** | Diblokir oleh dataset komponen terverifikasi; jangan menebak. |
| CNT-09 | Tidak ada audio statis atau rekaman penutur asli. | Fase 7, Fase 12 | Kualitas menyimak bergantung pada TTS perangkat; latihan tidak setara antar perangkat. | Biaya rekaman, lisensi suara, ukuran aset, dan distribusi. | P2 | L | **DEFERRED** | Ditunda; TTS dengan fallback tetap jalur utama sampai ada anggaran audio. |
| CNT-10 | Tidak ada skor akustik pelafalan. | Fase 7 | Pengguna mungkin mengira cocok/tidak cocok adalah penilaian pitch atau panjang vokal. | ASR browser tidak akurat untuk skor akustik; layanan berbayar menambah biaya dan privasi. | P3 | L | **REJECTED** | Ditolak untuk lingkup ini. UI tetap menyebut perbandingan teks, bukan skor pelafalan. |
| CNT-11 | TTS dan ASR bergantung browser/perangkat. | Fase 7, Fase 12 | Voice Jepang tidak selalu ada; sebagian browser tidak mendukung ASR atau mengirim audio ke vendor. | Dukungan browser berubah dan tidak dapat diuji penuh otomatis. | P2 | M | **DEFERRED** | Ditunda; deteksi, fallback, dan disclosure sudah ada. Audio statis dapat menjadi solusi jangka panjang. |
| CNT-12 | Ekspansi bacaan dan budaya belum dikerjakan. | Fase 11 | Konten 12 bacaan dan 33 artikel sudah ada, tetapi variasi dan kedalaman masih terbatas. | Beban kurasi, hak cipta, dan review bahasa. | P2 | L | **DEFERRED** | Ditunda setelah N4 dan quality gate; bukan blocker MVP. |
| CNT-13 | Halaman sumber belajar eksternal belum ada. | Fase 11 | Pengguna mungkin mencari buku/kamus rujukan, tetapi halaman statis mudah usang dan nilai tambahnya kecil. | Kurasi dan pemeliharaan tautan; tidak ada data belajar baru. | P3 | S | **REJECTED** | Ditolak untuk lingkup ini; rujukan budaya dan kamus sudah menautkan sumber yang relevan. |
| CNT-14 | Percakapan bebas dengan AI belum ada. | Fase 11 | Simulasi saat ini terbatas pada pilihan; percakapan bebas lebih kaya tetapi berisiko tidak konsisten. | Biaya model, latensi, moderasi, dan jawaban tidak akurat. Bergantung pada penyedia eksternal. | P3 | L | **REJECTED** | Ditolak sebagai jalur utama; skenario bertipe dipertahankan. Dapat ditinjau kembali sebagai fitur opsional dengan fallback. |
| CNT-15 | Parameter SRS dan bobot adaptif adalah heuristik. | Fase 5, Fase 12 | Jadwal dan prioritas belum dikalibrasi dengan data belajar nyata; pengguna dapat merasa terlalu sering atau terlalu jarang. | Butuh data penggunaan dan eksperimen; perubahan rumus memengaruhi retensi. | P2 | M | **DEFERRED** | Ditunda sampai ada data nyata; parameter tetap terpusat dan teruji. |
| CNT-16 | Keseimbangan XP, skor permainan, dan pencapaian belum ditinjau. | Fase 6, Fase 10 | Gamifikasi dapat mendorong mengejar XP daripada belajar; pencapaian mungkin terlalu mudah atau terlalu sulit. | Perubahan dapat mengubah histori dan ekspektasi pengguna. | P3 | S | **DEFERRED** | Ditunda; tinjau dengan data penggunaan, bukan asumsi. |
| CNT-17 | Streak, kalender, dan rencana memakai tanggal lokal proses/perangkat. | Fase 10, Fase 11 | Server dan pengguna di zona waktu berbeda dapat menghitung hari yang berbeda. | Menyimpan timezone profil dan mengubah query tanggal; migrasi data lama. | P2 | M | **DEFERRED** | Ditunda sampai multi-zona atau multi-perangkat menjadi kebutuhan. |
| CNT-18 | Hub budaya menampilkan 33 artikel penuh tanpa pagination. | Fase 9, Fase 12 | Halaman mobile menjadi panjang; filter dan pencarian membantu tetapi tidak mengurangi beban awal. | Pagination atau virtualisasi dapat mengubah URL/filter dan UX. | P2 | S | **DEFERRED** | Ditunda; tambahkan load more jika jumlah artikel bertambah. |
| CNT-19 | Mode/judul ujian tidak disimpan; kertas aktif hanya di sessionStorage. | Fase 8, Fase 12 | Riwayat tidak menunjukkan mode asal dan menutup tab menghapus ujian aktif. | Perubahan skema exams dan state sesi; resume lintas tab membutuhkan server. | P2 | M | **DEFERRED** | Ditunda bersama penyimpanan sesi ujian; bukan blocker latihan. |
| CNT-20 | Keselarasan JLPT bersifat perkiraan, belum divalidasi eksternal. | Fase 8, Fase 12 | Pengguna dapat menganggap level atau skor sebagai sertifikasi resmi. | Review ahli dan pemetaan level; klaim yang salah dapat menyesatkan. | P2 | M | **DEFERRED** | Ditunda; disclaimer sudah ada. Validasi eksternal hanya jika produk mengklaim kesiapan JLPT. |
| CNT-21 | Belum ada cerita/karakter/dialog orisinal untuk story player. | Fase 14 | Tanpa konten orisinal, player tidak dapat diuji dan tidak memberi nilai belajar. | Penulisan, review bahasa, furigana, vocab, audio; hindari dialog anime berhak cipta. | P1 | L | **ACCEPTED** | Fase 18 mengirim 3 cerita orisinal (2 N5, 1 N4), 9 adegan, 36 baris, 9 soal. Cerita keempat, karakter lebih kaya, dan audio rekaman tetap ditunda; pemicu: perluasan konten cerita berikutnya. |
| CNT-22 | Kebijakan yoon/komposit belum ditetapkan untuk writing. | Fase 14 | きゃ/ニョ adalah dua kana; menggabungkannya menjadi satu glyph akan menyesatkan. | Data stroke per komponen; UI dan progres harus menjelaskan dua langkah. | P2 | S | **RESOLVED** | Selesai Fase 17: yōon seperti きゃ/ニョ ditampilkan sebagai dua komponen berurutan; tes menolak asumsi glyph gabungan. |
| CNT-23 | Belum ada aturan konsistensi vocab/furigana untuk cerita. | Fase 14 | Cerita dapat memakai bentuk yang tidak konsisten dengan kamus/furigana aplikasi. | Validator harus memeriksa ID vocab, furigana, dan pembacaan; beberapa istilah mungkin perlu ditambah ke katalog. | P2 | S | **RESOLVED** | Selesai Fase 18: tes memastikan `reading === furiganaReading(jp)`, semua `vocabIds`/`grammarIds` ada di katalog, dan speaker/stage valid. |
| CNT-24 | Catatan bentuk dan kesalahan umum menulis baru mencakup sekitar 45 karakter dari 319. | Fase 17 | Karakter tanpa catatan tetap dapat dilatih, tetapi bimbingan bentuk untuk pemula tidak merata. | Penulisan dan review linguistik; risiko catatan generik atau menyesatkan. | P3 | S | **DEFERRED** | Pemicu: umpan balik pengguna pada karakter tertentu atau perluasan konten menulis; jangan mengarang catatan massal. |
| CNT-25 | Katalog cerita baru 3 judul (2 N5 + 1 N4); belum ada cerita N3–N1 atau cerita keempat. | Fase 18 | Variasi dan tangga kesulitan cerita masih terbatas; pembelajar lanjut cepat kehabisan materi teater. | Penulisan/review konten, anotasi vocab/grammar, audio, dan soal; jangan mengklaim cakupan JLPT penuh. | P2 | L | **DEFERRED** | Pemicu: setelah alur teater stabil dan ada review bahasa; tambah cerita bertahap, bukan mengejar jumlah. |

### UI, aksesibilitas, dan responsif

| ID | Concern | Fase | Mengapa penting | Risiko / dependensi | Prioritas | Kompleksitas | Status | Keputusan / target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UX-01 | Reflow 320 px dan zoom 400% belum diaudit menyeluruh. | Fase 12 | Audit mobile berfokus pada 390 px; perangkat kecil dan zoom tinggi dapat mengalami overflow atau kontrol terpotong. | Perubahan layout lintas halaman; perlu uji visual dan keyboard. | P2 | S | **RESOLVED** | Selesai Fase 13: 29 rute x 320/400 px, 0 overflow; 4 rute diperbaiki; zoom 400% belum diuji terpisah. |
| UX-02 | Belum ada tes aksesibilitas otomatis (axe/pa11y) di pipeline. | Fase 12 | Perbaikan manual mudah mengalami regresi; temuan kontras/lang/fokus tidak terdeteksi otomatis. | False positive dan biaya setup; perlu baseline dan pengecualian terdokumentasi. | P1 | M | **DEFERRED** | Ditunda: axe/pa11y belum masuk CI; pemicu: setelah E2E stabil dan baseline a11y disepakati. |
| UX-03 | Belum ada audit manual dengan screen reader nyata. | Fase 12 | Pemeriksaan statis dan Playwright tidak menangkap pengalaman NVDA/VoiceOver secara penuh. | Ketersediaan perangkat/waktu; temuan dapat memicu perubahan besar. | P2 | M | **DEFERRED** | Ditunda sampai alur inti stabil; jadwalkan sebelum rilis publik. |
| UX-04 | Beberapa status masih disampaikan terutama lewat warna. | Fase 12 | Heatmap, streak, dan mastery dapat sulit dibaca pengguna dengan buta warna. | Perlu ikon/teks/aria tambahan tanpa membuat UI ramai. | P2 | M | **RESOLVED** | Selesai Fase 13: aria-label mastery kana/kanji, kalender/heatmap role list + label; status tidak hanya warna. |
| UX-05 | Sebagian target sentuh masih di bawah 44 px. | Fase 12 | WCAG 2.5.8 minimum 24 px sudah terpenuhi, tetapi 44 px lebih nyaman di mobile. | Memperbesar kontrol dapat mengubah layout padat dan tabel. | P2 | M | **DEFERRED** | Ditunda; prioritaskan kontrol yang sering dipakai di mobile. |
| UX-06 | Beberapa input pencarian hanya memakai placeholder sebagai label. | Fase 12 | Placeholder hilang saat mengetik dan tidak selalu dibacakan dengan baik. | Menambah label visual dapat mengubah estetika; bisa memakai sr-only label. | P2 | S | **RESOLVED** | Selesai Fase 13: SearchInput/aria-label eksplisit pada pencarian utama; label sr-only tersedia. |
| UX-07 | Jumlah hasil filter belum diumumkan lewat live region. | Fase 12 | Pengguna screen reader tidak tahu hasil berubah setelah filter/pencarian. | Live region terlalu sering dapat mengganggu; perlu debounce. | P2 | S | **DEFERRED** | Ditunda; gabungkan dengan UX-02. |
| UX-08 | Halaman detail yang tidak ditemukan belum selalu memiliki h1 yang bermakna. | Fase 12 | Struktur heading memengaruhi navigasi screen reader dan kualitas SEO internal. | Perubahan kecil pada beberapa halaman not-found. | P3 | S | **DEFERRED** | Ditunda; perbaiki saat menyentuh halaman terkait. |
| UX-09 | Halaman Belajar sangat panjang di mobile. | Fase 12 | Daftar 154 pelajaran dan budaya membuat pengguna banyak menggulir. | Mode ringkas/filter level dapat mengubah navigasi dan state. | P2 | M | **DEFERRED** | Ditunda; pertimbangkan mode ringkas per level setelah N4 ditambahkan. |
| UX-10 | Toast belum berhenti saat hover/focus. | Fase 12 | Pengguna dengan motorik lambat atau screen reader dapat kehilangan pesan sebelum dibaca. | Timer dan live region perlu dijeda dengan benar. | P3 | S | **DEFERRED** | Ditunda; tombol tutup sudah ada, jeda hover dapat ditambahkan nanti. |
| UX-11 | Kontrol audio baru belum dirancang untuk status/keyboard/live region. | Fase 14 | Audio bisa tampak “mati” tanpa penjelasan; pengguna keyboard/screen reader butuh status yang jelas. | Perlu label dinamis, play/pause, transkrip, fallback, dan pengujian tanpa voice Jepang. | P1 | M | **ACCEPTED** | Fase 16 sudah mengirim kontrol/status/live region; residual: audit screen reader dan keyboard fisik pada Fase 19. |
| UX-12 | Kanvas latihan menulis berisiko tidak aksesibel dan menangkap scroll. | Fase 14 | Pengguna keyboard/screen reader harus tetap bisa belajar urutan goresan. | Alternatif non-kanvas, pointer/touch, fokus, reduced motion, dan target sentuh. | P1 | M | **RESOLVED** | Selesai Fase 17: animasi SVG, daftar goresan bernomor, mode tirukan/mandiri, Pointer Events; kanvas bukan satu-satunya jalur belajar. |
| UX-13 | Story player berisiko mengandalkan animasi/warna dan kehilangan fokus. | Fase 14 | Perubahan baris dan pembicara harus terbaca tanpa warna/animasi. | Live region, label pembicara, keyboard, reduced motion, subtitle selalu ada. | P1 | M | **RESOLVED** | Selesai Fase 18: kontrol eksplisit, label pembicara, status live, reduced motion, subtitle/furigana, dan urutan heading; belum diuji screen reader fisik. |
| UX-14 | Audit mobile belum diverifikasi pada perangkat fisik, iOS Safari, atau Android Chrome. | Fase 14B | Emulasi Chromium tidak menangkap perilaku keyboard virtual, safe-area, audio, kamera/file picker, atau screen reader nyata. | Perlu perangkat/akses; temuan dapat mengubah layout atau kontrol. | P2 | M | **DEFERRED** | Pemicu: sebelum klaim kompatibilitas mobile penuh atau rilis ke pengguna nyata. Uji iOS Safari + Android Chrome, orientasi, upload, dan VoiceOver/TalkBack. |
| UX-15 | Kanvas menulis belum diuji dengan stylus fisik, tekanan, palm rejection, atau tablet sentuh nyata. | Fase 17 | Pointer Events di Chromium/CDP membuktikan alur sentuh dasar, bukan kenyamanan menulis di iPad/Android tablet. | Perlu perangkat dan waktu uji; gestur scroll/palm dapat mengganggu kanvas. | P2 | M | **DEFERRED** | Pemicu: sebelum klaim kompatibilitas menulis penuh di tablet; uji Apple Pencil/stylus Android, orientasi, dan reduced motion. |
| UX-16 | Cerita memakai TTS dengan highlight per baris; tidak ada timing per kata atau metadata subtitle untuk audio rekaman. | Fase 18 | Sinkronisasi per kata dapat menyesatkan karena Web Speech tidak memberi batas kata yang andal; audio rekaman belum memiliki timing. | Perlu timing metadata/forced alignment untuk rekaman; TTS tetap perkiraan per baris. | P2 | M | **DEFERRED** | Sebut eksplisit di UI bahwa highlight adalah per baris. Pemicu: ada audio rekaman berlisensi atau API timing yang terverifikasi. |
| UX-17 | Cerita tidak memiliki checkpoint/resume; menutup halaman mengulang dari awal. | Fase 18 | Sesi panjang di mobile dapat terputus dan pengguna kehilangan posisi dialog. | Perlu state posisi per cerita, penyimpanan ringan, dan UX lanjutkan; jangan memperbesar snapshot tanpa batas. | P2 | M | **DEFERRED** | Pemicu: keluhan pengguna atau cerita bertambah panjang; simpan hanya posisi adegan/baris, bukan audio. |
| UX-18 | Kamus dalam cerita hanya membuka chip kosakata terkurasi; klik kata Jepang arbitrer belum didukung. | Fase 18 | Pembelajar mungkin ingin mencari kata di luar anotasi, tetapi tokenisasi Jepang tanpa batas dapat salah. | Perlu tokenizer/dictionary lookup yang menghormati furigana dan konteks; berisiko menambah bundle. | P2 | M | **DEFERRED** | Pemicu: ada kebutuhan nyata dan tokenizer lokal teruji; jangan menebak batas kata secara sembarangan. |

### Kualitas rekayasa dan operasi

| ID | Concern | Fase | Mengapa penting | Risiko / dependensi | Prioritas | Kompleksitas | Status | Keputusan / target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ENG-01 | Belum ada CI yang menjalankan check, build, dan smoke. | Fase 1, Fase 12 | Regresi hanya tertangkap saat audit manual; kualitas bergantung pada disiplin lokal. | Ketersediaan runner dan waktu build; perlu cache dependency. | P0 | M | **RESOLVED** | Selesai Fase 13: .github/workflows/quality.yml menjalankan npm ci, audit:prod, check, build pada Node 24. |
| ENG-02 | Suite E2E Playwright belum masuk repositori/CI. | Fase 5, Fase 12 | Alur ujian, percakapan, impor, dan mobile pernah diuji manual, tetapi tidak otomatis. | Flakiness, data uji, dan browser binary; perlu DB terisolasi. | P0 | M | **DEFERRED** | Ditunda: Playwright masih ad hoc; pemicu: dependency E2E disetujui dan DB uji terisolasi masuk CI. |
| ENG-03 | Tes komponen untuk alur kritis masih minim. | Fase 3, Fase 12 | Unit test domain kuat, tetapi interaksi UI seperti modal, fokus, dan status async belum tercakup. | Membutuhkan Testing Library dan setup DOM; dapat duplikasi E2E. | P1 | M | **DEFERRED** | Ditunda: butuh Testing Library + jsdom; pemicu: setup komponen disetujui. |
| ENG-04 | Belum ada anggaran performa atau Lighthouse CI. | Fase 12 | Bundle katalog dan rute berat dapat membesar tanpa terdeteksi. | Ambang yang terlalu ketat menghambat pengembangan; perlu baseline stabil. | P2 | M | **DEFERRED** | Ditunda: butuh baseline performa stabil; pemicu: setelah ARC-01/ARC-08 diputuskan. |
| ENG-05 | Belum ada pemindaian kerentanan dependensi. | Fase 12 | Dependensi dapat memiliki CVE; npm audit tidak dijalankan dalam pipeline. | Ketersediaan jaringan/registry dan false positive. | P1 | S | **RESOLVED** | Selesai Fase 13: npm run audit:prod (0 kerentanan produksi, 17 deps); audit dev masih 8 isu moderat. |
| ENG-06 | Proyek belum berupa repositori Git. | Fase 12 (operasional) | Tidak ada riwayat perubahan, rollback, atau review diff; deployment dan kolaborasi berisiko. | Perlu inisialisasi, .gitignore yang benar, dan kebijakan commit. Jangan commit database/data pribadi. | P1 | S | **DEFERRED** | Ditunda: inisialisasi Git adalah keputusan operasional; .gitignore sudah memuat .data/.next/.env. |
| ENG-07 | Dokumentasi dan backlog tersebar di banyak file. | Fase 12 | Keputusan, batasan, dan item tertunda sulit dilacak; risiko duplikasi dan kontradiksi. | Dokumen dapat menjadi basi; perlu pemilik dan jadwal review. | P0 | S | **RESOLVED** | Selesai Fase 13: backlog menjadi sumber tunggal status concern (ADR-046), dengan rujukan ADR/roadmap. |
| ENG-08 | Belum ada CHANGELOG atau catatan rilis. | Fase 12 | Pengguna/operator tidak punya ringkasan perubahan dan migrasi yang perlu dilakukan. | Perlu disiplin menulis setiap rilis; dapat dihasilkan dari commit setelah Git tersedia. | P2 | S | **RESOLVED** | Selesai Fase 13: CHANGELOG.md merangkum Fase 1–13. |
| ENG-09 | Belum ada tes regresi visual. | Fase 12 | Perubahan CSS/layout dapat merusak tampilan tanpa gagal tes unit. | Baseline screenshot besar dan flaky; perlu halaman representatif. | P2 | M | **DEFERRED** | Ditunda setelah E2E stabil; fokus pada 5 rute inti. |
| ENG-10 | Belum ada lingkungan staging terpisah. | Fase 12 | Verifikasi memakai build produksi dengan DB sementara; belum ada lingkungan yang mencerminkan deployment. | Biaya operasional dan konfigurasi; belum ada deployment publik. | P2 | M | **DEFERRED** | Ditunda sampai keputusan deployment/auth. |
| ENG-11 | Belum ada ambang coverage otomatis. | Fase 12 | 199 tes kuat, tetapi tidak ada sinyal jika cakupan modul baru turun. | Coverage bukan jaminan kualitas; ambang dapat mendorong tes dangkal. | P2 | S | **DEFERRED** | Ditunda; ukur baseline dulu, lalu tetapkan ambang konservatif. |
| ENG-12 | Belum ada kontrak OpenAPI untuk 20 route API. | Fase 12 | Perubahan request/response tidak terdokumentasi mesin; klien hanya satu sehingga risiko rendah. | Menambah maintenance dan generasi tipe; belum ada klien eksternal. | P3 | M | **DEFERRED** | Ditunda sampai API dibuka ke klien lain. |
| ENG-13 | Belum ada verifikasi aset/lisensi yang deterministik. | Fase 14 | Audio/stroke baru menambah risiko file hilang, hash salah, atau atribusi terlupa. | Skrip build/test harus memeriksa file, hash, lisensi, cakupan, dan notices. | P1 | S | **ACCEPTED** | Fase 15–16: tes/pipeline aset wajib; build gagal jika manifest/stroke tidak valid atau atribusi hilang. |
| ENG-14 | Belum ada visual regression/perf budget untuk fitur baru. | Fase 14 | Animasi dan player dapat menambah bundle atau merusak layout tanpa terdeteksi unit test. | Screenshot baseline dan ambang ukuran; flaky dan biaya setup. | P2 | M | **DEFERRED** | Ditunda; pemicu: E2E stabil dan minimal 3 rute baru selesai. |

### Fitur produk dan roadmap

| ID | Concern | Fase | Mengapa penting | Risiko / dependensi | Prioritas | Kompleksitas | Status | Keputusan / target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PRD-01 | PWA/offline penuh belum ada. | Fase 11 | Belajar tanpa jaringan dan antrean mutasi dapat meningkatkan ketahanan, tetapi kompleksitas sinkronisasi tinggi. | Service worker, konflik data, storage, dan keamanan cache. Bergantung pada auth/sync. | P2 | L | **DEFERRED** | Ditunda; offline baca ringan saat ini cukup untuk satu perangkat. |
| PRD-02 | Akun dan sinkronisasi antarperangkat belum ada. | Fase 10/roadmap | Pengguna tidak dapat melanjutkan progres di perangkat lain atau memisahkan profil. | Auth, isolasi data, konflik, dan migrasi. Bergantung pada SEC-01/SEC-05. | P2 | XL | **DEFERRED** | Ditunda sampai keputusan produk tentang akun dan deployment publik. |
| PRD-03 | Pengingat belajar/notifikasi belum ada. | Fase 10/roadmap | Pengingat dapat meningkatkan konsistensi, tetapi dapat mengganggu dan membutuhkan izin. | Notification API, preferensi, dan privasi; tidak semua browser mendukung. | P3 | M | **DEFERRED** | Ditunda; streak dan target sudah memberi umpan balik tanpa notifikasi. |
| PRD-04 | Jadwal ulangan multi-hari/forecast belum ada. | Fase 1/roadmap F-06 | SRS memiliki dueAt, tetapi pengguna belum melihat beban ulangan beberapa hari ke depan. | Agregasi jadwal dan UI kalender; tidak perlu tabel baru. | P1 | M | **DEFERRED** | Ditunda setelah N4/quality gate; kandidat kuat untuk Fase 14. |
| PRD-05 | Puzzle kana tambahan belum ada. | Fase 6/roadmap F-21 | Variasi permainan kana dapat memperkuat pengenalan, tetapi sudah ada Cocokkan kana. | Nilai tambah rendah dan menambah permukaan permainan. | P3 | S | **DEFERRED** | Ditunda; evaluasi hanya jika ada celah belajar yang jelas. |
| PRD-06 | Rekomendasi bacaan/kanji/budaya yang lebih kaya belum ada. | Fase 10/roadmap F-24 | Rekomendasi saat ini terfokus pada SRS, pelajaran, dan ujian; belum menghubungkan minat budaya/bacaan. | Perlu data minat dan aturan tambahan; hindari rekomendasi palsu. | P2 | M | **DEFERRED** | Ditunda setelah konten N4 dan data penggunaan cukup. |
| PRD-07 | Agregat akurasi latihan per tipe belum ada. | Fase 5/roadmap F-31 | Pengguna dapat melihat sesi, tetapi belum tahu tipe soal mana yang paling lemah secara agregat. | Query agregat dan UI statistik; snapshot sudah membatasi riwayat. | P2 | M | **DEFERRED** | Ditunda bersama analitik jangka panjang dan ARC-05. |
| PRD-08 | Belum ada CMS/editor konten. | Fase 14 | Konten masih dapat dikelola sebagai TypeScript; CMS belum dibutuhkan untuk satu editor teknis. | CMS menambah auth, penyimpanan, validasi, dan permukaan serangan; dapat memutus validasi build-time. | P2 | L | **DEFERRED** | Ditunda; trigger: editor non-teknis rutin atau konten >500 item. Keputusan ADR-053. Fase 14B tidak dapat mengaudit CMS karena memang belum ada; permukaan CMS tidak diklaim kompatibel. |
| PRD-09 | Belum ada kebijakan aset media dan rekaman. | Fase 14 | Audio/gambar baru membutuhkan lisensi, ukuran, kredit, dan alur penggantian yang jelas. | Perlu manifest, validasi, dan keputusan sumber (rekaman sendiri/CC). | P1 | S | **ACCEPTED** | Fase 15: manifest + lisensi + batas ukuran; hanya aset orisinal/berlisensi; tanpa layanan berbayar. |
| PRD-10 | Ekspor video cerita belum diimplementasikan. | Fase 18 | Video dapat berguna untuk berbagi, tetapi bukan kebutuhan belajar inti dan berisiko mengorbankan player. | MediaRecorder/Canvas/FFmpeg perlu uji stabilitas, ukuran, lisensi, dan waktu render; tidak ada layanan AI berbayar. | P3 | L | **DEFERRED** | Pemicu: player stabil, ada permintaan nyata, dan ADR ekspor disetujui; jangan mengejar video sebelum Fase 19. |
| PRD-11 | Belum ada pipeline aset video/CMS untuk scene cerita. | Fase 18 | `StoryScene.videoUrl` baru seam; tanpa CMS/aset, video pre-render tidak dapat dikelola atau divalidasi. | Bergantung pada PRD-08 CMS, penyimpanan, lisensi, ukuran, dan fallback animasi. | P3 | L | **DEFERRED** | Tetap seam same-origin; pemicu: CMS disetujui dan ada aset video berlisensi. Tidak ada API key di frontend. |

### Diselesaikan pada Fase 12–16

| ID | Concern | Fase | Mengapa penting | Risiko / dependensi | Prioritas | Kompleksitas | Status | Keputusan / target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RES-01 | Server mengikat semua antarmuka; Host tidak divalidasi; CSRF sederhana; body tanpa batas. | Fase 12 | Membuka reset/impor lintas origin dan DNS rebinding pada mesin lokal. | Mitigasi: loopback bind, proxy Host allowlist 421, JSON + same-origin 415/403, batas 5 MiB 413. | P0 | M | **RESOLVED** | Selesai Fase 12; bukti curl 421/403/415 dan http.test.ts. |
| RES-02 | Impor mengganti seluruh data tanpa konfirmasi dan validasi memadai. | Fase 12 | Satu file salah dapat menghapus progres tanpa disadari. | Mitigasi: envelope confirm true, pratinjau modal, batas array, validasi sebelum DELETE, transaksi. | P0 | M | **RESOLVED** | Selesai Fase 12; diuji Batal dan Ya timpa. |
| RES-03 | Health/error membocorkan detail; header keamanan dan izin DB belum ada. | Fase 12 | Informasi internal dan file database dapat diakses lebih luas dari perlu. | Mitigasi: health minimal, error disanitasi, CSP/header, DB 0700/0600. | P1 | S | **RESOLVED** | Selesai Fase 12; diverifikasi header dan permission. |
| RES-04 | Empat temuan konten berisiko tinggi: distractor benar ganda, kunci hilang, teks sumber tidak ada. | Fase 12 | Latihan dapat menilai jawaban benar sebagai salah atau tidak dapat dijawab. | Mitigasi: soal diganti, passage dilengkapi, kunci kalimat diperbaiki. | P0 | M | **RESOLVED** | Selesai Fase 12; audit konten dan tes struktur lulus. |
| RES-05 | Enam temuan medium dan tujuh low pada bacaan, kosakata, grammar, kanji, percakapan. | Fase 12 | Kesalahan bacaan/terjemahan/penjelasan menurunkan kepercayaan dan akurasi. | Mitigasi: 21+ koreksi; gaya romanisasi tersisa didokumentasikan. | P1 | M | **RESOLVED** | Selesai Fase 12; detail di ADR-044. |
| RES-06 | Overflow mobile /plan dan /kana; kontras tombol gelap rendah; teks Jepang tanpa lang. | Fase 12 | Layout rusak di 390 px, tombol sulit dibaca, dan screen reader salah melafalkan bahasa Jepang. | Mitigasi: min-w-0/grid, override kontras 6,44:1, lang=ja pada JpText/ruby dan halaman. | P0 | M | **RESOLVED** | Selesai Fase 12; probe Playwright 390 px, kontras, dan hitung lang. |
| RES-07 | Fokus hilang setelah kuis/soal, drawer tanpa focus trap, radio ujian tidak bisa panah. | Fase 12 | Navigasi keyboard dan screen reader terputus pada alur utama. | Mitigasi: dialog drawer, fokus prompt, roving tabindex, live region. | P1 | M | **RESOLVED** | Selesai Fase 12; probe fokus dan keyboard lulus. |
| RES-08 | Google Fonts memblokir render; game dimuat eager; theme flash. | Fase 12 | CSS font 183 KiB gzip dan JS permainan memperlambat muat; tema berkedip. | Mitigasi: font sistem, dynamic import enam game, prioritas tema lokal eksplisit. | P1 | S | **RESOLVED** | Selesai Fase 12; tanpa request eksternal, route lebih ringan. |
| RES-09 | Transkrip menyimak menampilkan id internal seperti l-n5-1-1. | Fase 12 | Pengguna melihat data teknis, bukan bacaan Jepang. | Mitigasi: render line.reading, bukan line.id. | P1 | S | **RESOLVED** | Selesai Fase 12; halaman listening diuji. |
| RES-10 | Dua h1 desktop, urutan heading melompat, target sentuh 24 px belum seragam. | Fase 12 | Struktur heading membingungkan screen reader dan tampilan tidak konsisten. | Mitigasi: h1 shell jadi p, heading games/listening diperbaiki, kontrol kunci dinaikkan. | P2 | S | **RESOLVED** | Selesai Fase 12; probe heading dan ukuran target. |
| RES-11 | Dokumentasi, jumlah tes, dan build tidak konsisten antar file. | Fase 12 | Status yang saling bertentangan membuat verifikasi dan handoff tidak dapat dipercaya. | Mitigasi: semua dokumen diselaraskan ke 32 file/199 tes, build 87 + dinamis + 18 API. | P1 | S | **RESOLVED** | Selesai Fase 12; pemeriksaan lintas dokumen dan build ulang. |
| RES-12 | Smoke API awal menulis data uji ke database produksi. | Fase 12 | Data pengguna tercampur data uji; verifikasi berikutnya tidak bersih. | Mitigasi: reset terkonfirmasi, verifikasi memakai DB terisolasi, database produksi bersih 13 tabel. | P0 | S | **RESOLVED** | Selesai Fase 12; snapshot produksi 0 kartu/0 XP, hanya profil. |
| RES-13 | Penyimpanan progres gagal secara diam-diam. | Fase 12 | Pengguna mengira progres tersimpan padahal request gagal. | Mitigasi: error provider ditampilkan sebagai banner role alert dengan tombol muat ulang. | P1 | S | **RESOLVED** | Selesai Fase 12; error state diuji. |
| RES-14 | Flashcard dapat dinilai dua kali dan shortcut tetap aktif setelah selesai. | Fase 12 | Skor SRS dan UX menjadi tidak konsisten. | Mitigasi: ratingLock dan penghentian handler setelah selesai. | P2 | S | **RESOLVED** | Selesai Fase 12; tes interaksi. |
| RES-15 | Tidak ada global error boundary dan beberapa status loading tidak diumumkan. | Fase 12 | Kegagalan render dapat menampilkan layar kosong; pengguna screen reader tidak tahu proses berjalan. | Mitigasi: global-error.tsx, PageSkeleton role status, live region status. | P2 | S | **RESOLVED** | Selesai Fase 12; build dan probe UI. |
| RES-16 | Halaman `/progress` overflow horizontal di 320–1024 px; beberapa label/statistik terpotong di layar sempit. | Fase 14B | Scroll horizontal dan teks terpotong membuat aplikasi sulit dipakai di ponsel. | Mitigasi: grid `minmax(0,1fr)` + `min-w-0`, StatTile tanpa truncate, grid rencana/mengetik, kartu JLPT, kontrol tema, target sentuh. | P1 | S | **RESOLVED** | Selesai Fase 14B: 29 rute × 9 viewport, 0 overflow halaman, 0 error; detail di MOBILE_COMPATIBILITY_REPORT.md. |
| RES-17 | Audio bergantung pada voice perangkat tanpa status/fallback yang konsisten; pemutaran dapat tampak mati atau overlap. | Fase 14, Fase 16 | Pengguna tidak tahu mengapa audio tidak berbunyi, dan beberapa kontrol dapat memutar suara bersamaan. | Voice Jepang tidak selalu tersedia; perlu satu pemutar, antrean, deteksi `voiceschanged`, dan larangan fallback bahasa lain. | P1 | M | **RESOLVED** | Selesai Fase 16: AudioPlayer global, hanya `ja-JP`, status jujur, antrean/kontrol/kecepatan, stop saat pindah rute; suite audio termasuk fallback/overlap. |
| RES-18 | Cakupan audio tidak konsisten: kana/kosakata/kanji/tata bahasa/bacaan/percakapan memakai kontrol berbeda dan tidak semua dapat memutar bacaan. | Fase 14, Fase 16 | Materi utama harus dapat didengar dengan kontrol yang sama agar latihan menyimak dan pelafalan tidak terputus. | Perlu pemetaan bacaan/furigana, halaman `/audio`, dan integrasi detail. | P1 | M | **RESOLVED** | Selesai Fase 16: `/audio` enam kategori, bacaan furigana→kana, AudioPlayerCard di membaca/percakapan, kontrol di menyimak/pelafalan; 30 pola rute 200. |
| RES-19 | Snapshot hanya menyimpan 400 attempt menulis; attempt lama tidak dapat diakses dari UI atau API. | Fase 17 | Riwayat jangka panjang dan analitik menulis terpotong pada penggunaan intensif. | Perlu pagination/endpoint riwayat dan UI; dapat menambah beban snapshot jika tidak dibatasi. | P2 | S | **DEFERRED** | Pemicu: pengguna rutin melampaui 400 attempt atau kebutuhan analitik menulis; jangan memperbesar snapshot tanpa pagination. |
| RES-20 | Snapshot hanya menyimpan 300 attempt cerita; riwayat lama tidak dapat diakses dari UI/API. | Fase 18 | Riwayat dan analitik cerita terpotong pada penggunaan intensif; import dibatasi 1.000. | Perlu pagination/endpoint riwayat dan UI; snapshot penuh membebani SQLite. | P2 | S | **DEFERRED** | Pemicu: pengguna rutin melampaui 300 attempt atau ada kebutuhan analitik cerita; jangan memperbesar snapshot tanpa pagination. |
| RES-21 | Tidak ada regresi lintas fitur yang dapat diulang setelah audio, menulis, dan cerita ditambahkan; performa dan nama kontrol belum diukur pada satu laporan. | Fase 19 | Integrasi yang tampak benar dapat regresi tanpa bukti rute/perjalanan, dan angka performa tanpa konteks prefetch mudah disalahartikan. | Perlu Playwright, DB terisolasi, dan interpretasi prefetch; pengujian tetap Chromium teremulasi. | P1 | M | **RESOLVED** | Selesai Fase 19: 34 rute × 3 viewport = 102/102; 6 perjalanan kritis 0 gagal; 0 kontrol tanpa nama di 5 rute sampel; semua HTTP 200/0 error. |
| RES-22 | Pelajaran kana/kanji tidak menaut ke Studio Menulis, dan salinan pelajaran kanji menyiratkan animasi goresan tersedia langsung di pelajaran. | Fase 19 | Pengguna harus mencari menu Menulis secara manual, dan salinan usang menyesatkan tentang cara melihat urutan goresan. | Perlu helper tanpa katalog berat, tombol kondisional, dan koreksi konten; tanpa perubahan tabel/API. | P1 | S | **RESOLVED** | Selesai Fase 19: `writingHrefForContentRef` + tombol **Latihan menulis**; salinan `src/content/lessons/kanji.ts` dikoreksi; tes tautan kana/kanji valid dan kosakata `null`. |


---

## 4. Keputusan penolakan yang perlu dipertahankan

| ID | Yang ditolak | Alasan | Kapan boleh ditinjau ulang |
| --- | --- | --- | --- |
| CNT-10 | Skor pelafalan akustik | ASR browser tidak cukup akurat untuk pitch/panjang vokal; layanan berbayar menambah biaya/privasi. Perbandingan teks sudah jujur sebagai latihan. | Jika ada model akustik lokal/terverifikasi dan anggaran evaluasi. |
| CNT-13 | Halaman sumber belajar statis | Nilai tambah kecil dibanding biaya kurasi dan risiko tautan usang; rujukan budaya sudah ada. | Jika ada kurasi berkelanjutan dan kebutuhan pengguna yang terbukti. |
| CNT-14 | Percakapan bebas dengan AI | Biaya, latensi, moderasi, dan jawaban tidak konsisten; skenario bertipe lebih dapat diuji dan diaudit. | Sebagai fitur opsional dengan fallback dan anggaran yang disetujui. |

Penolakan ini bukan klaim bahwa idenya buruk. Mereka ditolak **untuk lingkup dan bukti saat ini**; keputusan dapat dibuka kembali bila pemicunya berubah.

---

## 5. Item yang harus ditinjau pada fase konsolidasi akhir

1. **Auth/TLS/rate limit:** putuskan apakah produk tetap satu perangkat atau menjadi layanan publik. Jika publik, SEC-01, SEC-02, SEC-03, SEC-05, dan SEC-10 harus selesai sebelum rilis.
2. **Backup/restore:** uji restore dari backup, bukan hanya membuat file backup.
3. **Schema migration:** jika ada perubahan tabel, SEC-08 harus dikerjakan lebih dulu.
4. **Kualitas konten:** tinjau CNT-04 dan CNT-20; pastikan disclaimer JLPT dan review bahasa tetap akurat.
5. **Konten yang diblokir:** CNT-08 hanya dibuka dengan dataset komponen terverifikasi dan lisensi jelas; CNT-07 sudah selesai di Fase 17 dengan KanjiVG.
6. **Performa:** ukur ulang ARC-01/ARC-02 setelah perubahan besar; jangan optimasi tanpa pengukuran.
7. **Aksesibilitas:** jalankan UX-02 dan UX-03; pastikan perbaikan Fase 12 tidak regresi.
8. **Quality gate:** ENG-01/ENG-02 harus hijau dan menjadi syarat rilis.
9. **Dokumentasi:** selaraskan jumlah tes, rute, tabel, dan ADR di seluruh dokumen; periksa ulang setiap item DEFERRED.
10. **Kebersihan operasional:** pastikan database produksi bersih, tidak ada script/data uji, dan tidak ada data pribadi yang tidak disengaja masuk ke repositori. Skrip QA Fase 19 di `.data/phase19-qa.cjs` dan DB QA harus dipindahkan/dibersihkan sebelum dianggap artefak rilis.
11. **Quality gate yang dapat diulang:** ubah QA Fase 19 menjadi suite E2E yang di-commit dengan DB terisolasi; jangan mengandalkan skrip sementara di `.data`.

---

## 6. Riwayat dokumen

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 1.0 | 2026-11-08 | Dibuat pada penutupan Fase 12; mengonsolidasikan temuan audit keamanan, konten, UI/a11y, performa, serta backlog roadmap dan batasan arsitektur. |
| 1.1 | 2026-11-08 | Penutupan Fase 13: 11 item menjadi RESOLVED, 11 dipindahkan ke DEFERRED dengan pemicu, 0 ACCEPTED; total 26/0/55/2/3. Menambahkan disposisi dan alasan ADR-047. |
| 1.2 | 2026-11-08 | Perencanaan Fase 14: CNT-07 BLOCKED→ACCEPTED setelah verifikasi KanjiVG; menambahkan 14 concern fitur lanjutan (ARC-12–15, CNT-21–23, UX-11–13, ENG-13–14, PRD-08–09); total 100 dengan 26 RESOLVED/13 ACCEPTED/57 DEFERRED/1 BLOCKED/3 REJECTED. Tidak ada implementasi. |
| 1.3 | 2026-11-08 | Audit mobile Fase 14B: menambahkan RES-16 (audit 29 rute × 9 viewport, perbaikan overflow) dan UX-14 (verifikasi perangkat fisik); total 102 dengan 27 RESOLVED/13 ACCEPTED/58 DEFERRED/1 BLOCKED/3 REJECTED. CMS/menulis/cerita tidak diaudit karena tidak tersedia. |
| 1.4 | 2026-11-08 | Fase 15 CMS tetap BLOCKED; Fase 16 Audio Studio menambahkan RES-17 (pemutar/fallback `ja-JP`) dan RES-18 (cakupan enam kategori); target writing/story diperbarui ke Fase 17–19. Total 104 dengan 29 RESOLVED/13 ACCEPTED/58 DEFERRED/1 BLOCKED/3 REJECTED. |
| 1.5 | 2026-11-09 | Fase 17 Writing Studio menyelesaikan ARC-13, CNT-07, CNT-22, dan UX-12; menambahkan CNT-24 (catatan bentuk), UX-15 (stylus/perangkat fisik), dan RES-19 (batas snapshot 400). Total 107 dengan 33 RESOLVED/9 ACCEPTED/61 DEFERRED/1 BLOCKED/3 REJECTED. Lisensi KanjiVG dicatat; story dan CMS tetap terbuka. |
| 1.6 | 2026-11-09 | Fase 18 Story Theater menyelesaikan ARC-14, ARC-15, CNT-23, dan UX-13; menambahkan UX-16 (timing TTS), UX-17 (resume cerita), UX-18 (kamus per kata), PRD-10 (ekspor video), PRD-11 (pipeline aset video/CMS), RES-20 (batas snapshot 300), dan CNT-25 (perluasan cerita). Total 114 dengan 37 RESOLVED/5 ACCEPTED/68 DEFERRED/1 BLOCKED/3 REJECTED. CMS tetap BLOCKED. |
| 1.7 | 2026-11-09 | Fase 19 stabilisasi integrasi: RES-21 (102/102 rute, 6 perjalanan, performa/a11y) dan RES-22 (pelajaran→menulis, koreksi salinan) menjadi RESOLVED; tidak ada concern baru. Total 116 dengan 39 RESOLVED/5 ACCEPTED/68 DEFERRED/1 BLOCKED/3 REJECTED. CMS tetap BLOCKED. |
