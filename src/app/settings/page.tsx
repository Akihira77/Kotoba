"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { useProgress } from "@/components/providers/progress-provider";
import { useToast } from "@/components/providers/toast-provider";
import {
  Badge,
  Button,
  Card,
  Modal,
  ProgressBar,
  SectionHeading,
  Segmented,
  Select,
  Toggle,
} from "@/components/ui";
import { ALL_KANA } from "@/content/kana";
import { VOCABULARY } from "@/content/vocabulary";
import { KANJI } from "@/content/kanji";
import { GRAMMAR } from "@/content/grammar";
import { READING } from "@/content/reading";
import { LISTENING } from "@/content/listening";
import { CULTURE } from "@/content/culture";
import { SENTENCES } from "@/content/sentences";
import { PRONUNCIATION_DRILLS } from "@/content/pronunciation";
import {
  DAILY_GOAL_OPTIONS,
  DAILY_LESSON_TARGET_OPTIONS,
  DAILY_STUDY_MINUTE_OPTIONS,
  DAILY_VOCAB_TARGET_OPTIONS,
  WEEKLY_FREQUENCY_OPTIONS,
} from "@/lib/constants";
import { useAudioPlayer } from "@/lib/audio-player";
import { describeSpeechFailure } from "@/lib/speech";
import { applyTheme } from "@/lib/theme";
import type { Settings, ThemeMode } from "@/lib/types";
import { levelProgress } from "@/lib/xp";
import { clamp } from "@/lib/utils";

function GoalOptions({
  label,
  description,
  options,
  value,
  onChange,
  unit,
}: {
  label: string;
  description: string;
  options: readonly number[];
  value: number;
  onChange: (value: number) => void;
  unit: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold">{label}</p>
      <p className="mt-0.5 text-[11px] text-muted">{description}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
              value === option
                ? "border-brand bg-brand text-white"
                : "border-line bg-surface text-ink hover:border-brand/40"
            }`}
          >
            {option} {unit}
          </button>
        ))}
      </div>
    </div>
  );
}

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string }> = [
  { value: "light", label: "Terang" },
  { value: "dark", label: "Gelap" },
  { value: "system", label: "Sistem" },
];

const TEST_SENTENCE = "こんにちは。今日はいい天気ですね。";

interface PendingImport {
  fileName: string;
  data: unknown;
  profileName: string;
  cards: number;
  lessons: number;
  savedItems: number;
}

function describeImport(fileName: string, raw: unknown): PendingImport {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("File bukan snapshot Kotoba.");
  const snapshot = raw as Record<string, unknown>;
  const profile = snapshot.profile;
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    throw new Error("File tidak memiliki profil Kotoba yang valid.");
  }
  const name = (profile as Record<string, unknown>).name;
  if (typeof name !== "string" || name.trim().length === 0) throw new Error("Nama profil pada file tidak valid.");
  return {
    fileName,
    data: raw,
    profileName: name,
    cards: Array.isArray(snapshot.cards) ? snapshot.cards.length : 0,
    lessons: Array.isArray(snapshot.lessons) ? snapshot.lessons.length : 0,
    savedItems: Array.isArray(snapshot.savedItems) ? snapshot.savedItems.length : 0,
  };
}

export default function SettingsPage() {
  const { snapshot, saveSettings, rename, reset, exportSnapshot, importSnapshot, loading } = useProgress();
  const toast = useToast();
  const player = useAudioPlayer();
  const { supported, voices, hasJapaneseVoice } = player;
  const speaking = player.status === "playing";
  const settings = snapshot.profile.settings;

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const name = nameDraft ?? snapshot.profile.name;
  const [savingName, setSavingName] = useState(false);
  const [importing, setImporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const level = levelProgress(snapshot.profile.xp);
  const contentCounts = [
    { label: "Kana", value: ALL_KANA.length },
    { label: "Kosakata", value: VOCABULARY.length },
    { label: "Kanji", value: KANJI.length },
    { label: "Tata bahasa", value: GRAMMAR.length },
    { label: "Bacaan", value: READING.length },
    { label: "Menyimak", value: LISTENING.length },
    { label: "Budaya", value: CULTURE.length },
    { label: "Susun kalimat", value: SENTENCES.length },
    { label: "Pelafalan", value: PRONUNCIATION_DRILLS.length },
  ];

  function update(patch: Partial<Settings>) {
    // Keep the local boot preference in sync so an explicit "system" choice is
    // not overridden by a previously stored light/dark value on next reload.
    if (patch.theme) applyTheme(patch.theme);
    void saveSettings(patch);
  }

  async function handleSaveName() {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 24) {
      toast.error("Nama harus 2–24 karakter.");
      return;
    }
    setSavingName(true);
    try {
      await rename(trimmed);
      setNameDraft(null);
      toast.success("Nama berhasil diperbarui.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan nama.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleExport() {
    try {
      await exportSnapshot();
      toast.success("Data progres diunduh sebagai JSON.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengekspor data.");
    }
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      setPendingImport(describeImport(file.name, parsed));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "File tidak valid atau gagal dibaca.");
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleConfirmImport() {
    if (!pendingImport) return;
    setImporting(true);
    try {
      await importSnapshot(pendingImport.data);
      setPendingImport(null);
      toast.success("Data progres berhasil diimpor.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "File tidak valid atau gagal diimpor.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleReset() {
    setResetting(true);
    try {
      await reset();
      setResetOpen(false);
      toast.success("Progres belajar telah dihapus. Nama dan pengaturan tetap disimpan.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mereset progres.");
    } finally {
      setResetting(false);
    }
  }

  async function testVoice() {
    if (speaking) {
      player.stop();
      return;
    }
    const result = await player.play(
      { id: "settings-test", text: TEST_SENTENCE, speech: TEST_SENTENCE, reading: TEST_SENTENCE },
      { rate: settings.speechRate, voiceURI: settings.voiceURI },
    );
    if (!result.ok && result.reason !== "cancelled") toast.error(describeSpeechFailure(result.reason));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Preferensi · 設定</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Pengaturan</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Atur tampilan, audio, target harian, dan kelola data belajarmu. Perubahan langsung diterapkan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <Card className="p-5 sm:p-6">
          <SectionHeading title="Profil" description="Nama ini muncul di dasbor dan halaman progres." icon="user" />
          <div className="mt-4 flex items-center gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-xl font-bold text-brand">
              {(name.trim() || "P").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <label htmlFor="profile-name" className="text-xs font-medium text-muted">
                Nama panggilan
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setNameDraft(event.target.value)}
                  maxLength={24}
                  className="h-11 w-full min-w-0 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
                  placeholder="Nama kamu"
                />
                <Button size="sm" onClick={() => void handleSaveName()} disabled={savingName || name.trim() === snapshot.profile.name}>
                  {savingName ? "Menyimpan…" : "Simpan"}
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-line bg-surface-2/60 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">Level {level.level} · {level.title}</span>
              <span className="text-muted">{snapshot.profile.xp} XP</span>
            </div>
            <ProgressBar value={level.current} max={level.needed} className="mt-2" barClassName="bg-brand" label="Progres level" />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl border border-line p-3">
              <dt className="text-muted">Streak saat ini</dt>
              <dd className="mt-0.5 text-lg font-bold">{snapshot.profile.streak} hari</dd>
            </div>
            <div className="rounded-xl border border-line p-3">
              <dt className="text-muted">Rekor streak</dt>
              <dd className="mt-0.5 text-lg font-bold">{snapshot.profile.bestStreak} hari</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5 sm:p-6">
          <SectionHeading title="Tampilan" description="Sesuaikan kenyamanan membaca dan belajar." icon="sun" />
          <div className="mt-4 space-y-5">
            <div>
              <p className="mb-2 text-xs font-medium text-muted">Tema</p>
              <Segmented options={THEME_OPTIONS} value={settings.theme} size="sm" onChange={(value) => update({ theme: value })} />
              <p className="mt-2 text-[11px] text-muted">
                Tema gelap memakai latar hangat yang nyaman untuk sesi malam. Pilihan sistem mengikuti pengaturan
                perangkat.
              </p>
            </div>
            <div className="space-y-3 border-t border-line pt-4">
              <Toggle
                checked={settings.showRomaji}
                onChange={(value) => update({ showRomaji: value })}
                label="Tampilkan romaji"
                description="Bantuan baca huruf Latin. Matikan saat sudah nyaman membaca kana dan kanji."
              />
              <Toggle
                checked={settings.showFurigana}
                onChange={(value) => update({ showFurigana: value })}
                label="Tampilkan furigana"
                description="Bacaan kana di atas kanji, ditulis dengan format {漢字|かんじ} pada konten."
              />
              <Toggle
                checked={settings.autoPlayAudio}
                onChange={(value) => update({ autoPlayAudio: value })}
                label="Putar audio otomatis"
                description="Putar pelafalan saat halaman latihan menyimak dibuka, bila peramban mengizinkan."
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <SectionHeading title="Audio & pelafalan" description="Memakai Web Speech API bawaan peramban." icon="volume" />
          <div className="mt-4 space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="speech-rate" className="font-medium text-muted">Kecepatan bicara</label>
                <span className="font-semibold tabular-nums">{settings.speechRate.toFixed(2)}×</span>
              </div>
              <input
                id="speech-rate"
                type="range"
                min={0.5}
                max={1.5}
                step={0.05}
                value={settings.speechRate}
                onChange={(event) => update({ speechRate: clamp(Number(event.target.value), 0.5, 1.5) })}
                className="mt-2 min-h-6 w-full accent-brand"
              />
              <div className="flex justify-between text-[10px] text-muted">
                <span>Lambat 0,5×</span>
                <span>Normal 1,0×</span>
                <span>Cepat 1,5×</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Pilih kecepatan cepat">
                {[0.75, 1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    aria-pressed={Math.abs(settings.speechRate - rate) < 0.001}
                    onClick={() => update({ speechRate: rate })}
                    className={
                      Math.abs(settings.speechRate - rate) < 0.001
                        ? "rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand-strong dark:bg-brand/20 dark:text-brand"
                        : "rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-muted hover:bg-surface-2 hover:text-ink"
                    }
                  >
                    {rate.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}×
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Select
                label="Voice Jepang"
                value={settings.voiceURI ?? ""}
                onChange={(event) => update({ voiceURI: event.target.value || null })}
                disabled={voices.length === 0}
              >
                <option value="">Otomatis (pilih voice Jepang pertama)</option>
                {voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} · {voice.lang}
                  </option>
                ))}
              </Select>
              {supported ? (
                hasJapaneseVoice ? (
                  <p className="mt-2 text-[11px] text-muted">
                    {voices.length} voice Jepang terdeteksi. Kualitas suara bergantung pada sistem operasi.
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] text-brand">
                    Belum ada voice Jepang. Kotoba tidak akan memakai voice bahasa lain. Pasang atau aktifkan voice
                    Jepang di pengaturan sistem/peramban, lalu muat ulang halaman. Transkrip dan latihan tertulis tetap
                    bisa dipakai.
                  </p>
                )
              ) : (
                <p className="mt-2 text-[11px] text-brand">
                  Peramban ini tidak mendukung Web Speech API. Pelajari kana dengan membaca dan latihan tertulis.
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="soft" size="sm" onClick={() => void testVoice()} disabled={!supported}>
                <Icon name={speaking ? "pause" : "volume"} size={16} />
                {speaking ? "Hentikan" : "Uji pelafalan"}
              </Button>
              <span className="text-xs text-muted" lang="ja">「{TEST_SENTENCE}」</span>
            </div>
          </div>
        </Card>

        <Card id="target" className="scroll-mt-24 p-5 sm:p-6">
          <SectionHeading
            title="Target belajar"
            description="Target yang realistis membantumu belajar konsisten tanpa merasa dikejar."
            icon="target"
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <GoalOptions
              label="Durasi belajar per hari"
              description="Dihitung dari menit aktivitas yang tercatat di perangkat ini."
              options={DAILY_STUDY_MINUTE_OPTIONS}
              value={settings.dailyStudyMinutes}
              onChange={(value) => update({ dailyStudyMinutes: value })}
              unit="menit"
            />
            <GoalOptions
              label="Kosakata baru per hari"
              description="Jumlah kata berbeda yang diulas hari ini."
              options={DAILY_VOCAB_TARGET_OPTIONS}
              value={settings.dailyVocabTarget}
              onChange={(value) => update({ dailyVocabTarget: value })}
              unit="kata"
            />
            <GoalOptions
              label="Pelajaran per hari"
              description="Pelajaran kurikulum yang diselesaikan hari ini."
              options={DAILY_LESSON_TARGET_OPTIONS}
              value={settings.dailyLessonTarget}
              onChange={(value) => update({ dailyLessonTarget: value })}
              unit="pelajaran"
            />
            <GoalOptions
              label="Frekuensi belajar per minggu"
              description="Jumlah hari aktif yang ingin kamu capai setiap minggu."
              options={WEEKLY_FREQUENCY_OPTIONS}
              value={settings.weeklyFrequency}
              onChange={(value) => update({ weeklyFrequency: value })}
              unit="hari"
            />
            <div className="border-t border-line pt-4 sm:col-span-2">
              <p className="text-xs font-semibold">Target XP harian</p>
              <p className="mt-1 text-[11px] text-muted">Target XP tetap memengaruhi ring di dasbor dan rekomendasi latihan.</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DAILY_GOAL_OPTIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update({ dailyGoalXp: value })}
                    aria-pressed={settings.dailyGoalXp === value}
                    className={`rounded-xl border p-2.5 text-left transition ${settings.dailyGoalXp === value ? "border-brand bg-brand-soft/70" : "border-line bg-surface hover:border-brand/40"}`}
                  >
                    <span className="text-lg font-bold">{value}</span>
                    <span className="ml-1 text-xs text-muted">XP</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Ulasan benar memberi 10 XP, jawaban keliru tetap memberi 3 XP agar kamu tidak takut mencoba. Target mingguan
            dihitung dari hari lokal perangkat, bukan zona waktu server.
          </p>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <SectionHeading
          title="Data belajar"
          description="Progres disimpan di server lokal (SQLite) dan di-cache di peramban untuk mode luring."
          icon="download"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-line p-4">
            <p className="text-sm font-semibold">Ekspor</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Unduh snapshot JSON berisi profil, kartu SRS, pelajaran, ujian, dan aktivitas. Berguna untuk backup atau
              pindah perangkat.
            </p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => void handleExport()} disabled={loading}>
              <Icon name="download" size={16} />
              Unduh JSON
            </Button>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="text-sm font-semibold">Impor</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Ganti seluruh progres dengan file ekspor Kotoba. Data saat ini akan ditimpa setelah file valid dibaca.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleImportFile(file);
              }}
            />
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => fileRef.current?.click()} disabled={importing}>
              <Icon name="upload" size={16} />
              {importing ? "Mengimpor…" : "Pilih file JSON"}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/25 bg-brand-soft/40 p-4">
          <div>
            <p className="text-sm font-semibold text-brand-strong">Zona bahaya</p>
            <p className="mt-0.5 text-xs text-muted">Hapus semua kartu, riwayat, dan nilai ujian. Nama serta pengaturan dipertahankan.</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setResetOpen(true)}>
            <Icon name="trash" size={16} />
            Reset progres
          </Button>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <SectionHeading title="Tentang Kotoba" description="Konten orisinal untuk pembelajar Indonesia, disusun mengikuti alur JLPT N5–N1." icon="info" />
        <div className="mt-4 flex flex-wrap gap-2">
          {contentCounts.map((item) => (
            <Badge key={item.label} tone="muted">
              {item.label}: {item.value}
            </Badge>
          ))}
        </div>
        <ul className="mt-4 space-y-2 text-xs leading-relaxed text-muted">
          <li>
            • Konten ditulis orisinal; tidak menyalin buku teks, bank soal komersial, atau dialog anime berhak cipta.
          </li>
          <li>• Audio memakai Web Speech API; tidak ada layanan berbayar atau pengiriman suara ke server.</li>
          <li>• Bila server lokal tidak tersedia, aplikasi memakai cache peramban dan mengantrekan pembaruan saat koneksi pulih.</li>
          <li>• Versi 0.1.0 · Next.js + SQLite lokal · dibuat untuk latihan mandiri, bukan sertifikasi resmi JLPT.</li>
        </ul>
      </Card>

      <Modal
        open={pendingImport !== null}
        onClose={() => {
          if (importing) return;
          setPendingImport(null);
          if (fileRef.current) fileRef.current.value = "";
        }}
        title="Timpa seluruh progres?"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPendingImport(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              disabled={importing}
            >
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={() => void handleConfirmImport()} disabled={importing}>
              <Icon name="upload" size={16} />
              {importing ? "Mengimpor…" : "Ya, timpa progres"}
            </Button>
          </>
        }
      >
        {pendingImport ? (
          <div className="space-y-3 text-sm">
            <p className="leading-relaxed text-muted">
              File <span className="font-semibold text-ink">{pendingImport.fileName}</span> akan mengganti semua kartu,
              riwayat, pelajaran, ujian, dan aktivitas saat ini. Tindakan ini tidak dapat dibatalkan.
            </p>
            <dl className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-surface-2/40 p-3 text-xs">
              <div><dt className="text-muted">Profil</dt><dd className="font-semibold">{pendingImport.profileName}</dd></div>
              <div><dt className="text-muted">Kartu SRS</dt><dd className="font-semibold tnum">{pendingImport.cards}</dd></div>
              <div><dt className="text-muted">Pelajaran</dt><dd className="font-semibold tnum">{pendingImport.lessons}</dd></div>
              <div><dt className="text-muted">Kamus pribadi</dt><dd className="font-semibold tnum">{pendingImport.savedItems}</dd></div>
            </dl>
            <p className="text-xs text-muted">Sebaiknya unduh ekspor data saat ini sebelum melanjutkan.</p>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Hapus semua progres?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setResetOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={() => void handleReset()} disabled={resetting}>
              <Icon name="trash" size={16} />
              {resetting ? "Menghapus…" : "Ya, hapus progres"}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          Tindakan ini menghapus permanen kartu SRS, riwayat ulasan, pelajaran, ujian, dan aktivitas. Nama serta
          pengaturan tetap disimpan. Sebaiknya ekspor data terlebih dahulu.
        </p>
      </Modal>
    </div>
  );
}
