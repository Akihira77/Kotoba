"use client";

import { useState } from "react";
import { useProgress } from "@/components/providers/progress-provider";
import { Button, Modal, Select } from "@/components/ui";
import type { SavedItemKind } from "@/lib/types";

export function SaveButton({
  kind,
  refId,
  compact = false,
  className,
}: {
  kind: SavedItemKind;
  refId: string;
  compact?: boolean;
  className?: string;
}) {
  const { snapshot, saveItem } = useProgress();
  const [busy, setBusy] = useState(false);
  const saved = snapshot.savedItems.some((item) => item.kind === kind && item.refId === refId);

  async function toggle() {
    setBusy(true);
    try {
      await saveItem({ kind, refId, remove: saved });
    } catch {
      // The provider surfaces the error as a toast and keeps local state intact.
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant={saved ? "soft" : "secondary"}
      size="sm"
      className={className}
      aria-pressed={saved}
      aria-label={saved ? "Hapus dari kamus pribadi" : "Simpan ke kamus pribadi"}
      disabled={busy}
      onClick={toggle}
    >
      <svg
        viewBox="0 0 24 24"
        width={15}
        height={15}
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
      </svg>
      {compact ? null : saved ? "Tersimpan" : "Simpan"}
    </Button>
  );
}

export function SavedItemEditor({
  kind,
  refId,
  title = "Kamus pribadi",
}: {
  kind: SavedItemKind;
  refId: string;
  title?: string;
}) {
  const { snapshot, saveItem } = useProgress();
  const saved = snapshot.savedItems.find((item) => item.kind === kind && item.refId === refId);
  const [note, setNote] = useState(saved?.note ?? "");
  const [collectionId, setCollectionId] = useState(saved?.collectionId ?? "");
  const [busy, setBusy] = useState(false);
  const collections = snapshot.savedCollections;

  async function persist(remove = false) {
    setBusy(true);
    try {
      await saveItem({
        kind,
        refId,
        remove,
        note,
        collectionId: collectionId || null,
      });
    } catch {
      // Error toast is handled by the progress provider.
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-line bg-surface-2/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-bold">
          <svg
            viewBox="0 0 24 24"
            width={16}
            height={16}
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
          </svg>
          {title}
        </p>
        {saved ? <span className="text-[11px] text-muted">Tersimpan · perbarui kapan saja</span> : null}
      </div>

      <label className="block text-xs font-semibold text-muted">
        Catatan pribadi (opsional)
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value.slice(0, 1000))}
          rows={3}
          placeholder="Contoh: sering tertukar dengan ことに; ingat dari konteks kalimat."
          className="mt-1 w-full resize-y rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
        />
      </label>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-40 flex-1">
          <Select
            label="Koleksi"
            value={collectionId}
            onChange={(event) => setCollectionId(event.target.value)}
            className="w-full"
          >
            <option value="">Tanpa koleksi</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {saved ? (
            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => void persist(true)}>
              Hapus
            </Button>
          ) : null}
          <Button type="button" size="sm" disabled={busy} onClick={() => void persist(false)}>
            {saved ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed text-muted">
        Catatan dan koleksi hanya tersimpan di profil belajarmu. Materi asli tetap tersedia walau catatan dihapus.
      </p>
    </div>
  );
}

export interface SavedReviewEntry {
  key: string;
  kind: SavedItemKind;
  title: string;
  reading?: string;
  detail: string;
}

const REVIEW_KIND_LABELS: Record<SavedItemKind, string> = {
  vocabulary: "Kosakata",
  kanji: "Kanji",
  grammar: "Tata bahasa",
};

export function SavedItemsReview({
  entries,
  onClose,
}: {
  entries: SavedReviewEntry[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0);
  const [again, setAgain] = useState(0);
  const entry = entries[index];
  const finished = index >= entries.length;

  function advance(remembered: boolean) {
    if (remembered) setKnown((value) => value + 1);
    else setAgain((value) => value + 1);
    setRevealed(false);
    setIndex((value) => value + 1);
  }

  function restart() {
    setIndex(0);
    setRevealed(false);
    setKnown(0);
    setAgain(0);
  }

  return (
    <Modal open onClose={onClose} title="Ulangi materi tersimpan" size="md">
      {finished ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-matcha-soft text-2xl font-bold text-matcha dark:bg-matcha/15">
            {known}
          </div>
          <div>
            <p className="text-lg font-bold">Sesi ulang selesai</p>
            <p className="mt-1 text-sm text-muted">
              {known} materi terasa familier, {again} materi ingin diulang. Ini penilaian mandiri, bukan skor otomatis.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="secondary" size="sm" onClick={restart}>Ulangi sesi</Button>
            <Button size="sm" onClick={onClose}>Tutup</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{index + 1} dari {entries.length}</span>
            <span>{REVIEW_KIND_LABELS[entry.kind]}</span>
          </div>
          <div className="rounded-3xl border border-line bg-surface-2/50 p-5 text-center">
            <p className="font-jp text-3xl font-bold leading-snug">{entry.title}</p>
            <p className="mt-1 text-sm text-muted">{entry.reading ?? "Baca dan pikirkan artinya sebelum membuka jawaban."}</p>
          </div>
          {revealed ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-line p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Jawaban</p>
                <p className="mt-1 text-sm leading-relaxed">{entry.detail}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => advance(false)}>Ulangi nanti</Button>
                <Button size="sm" onClick={() => advance(true)}>Sudah paham</Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button onClick={() => setRevealed(true)}>Tampilkan jawaban</Button>
            </div>
          )}
          <p className="text-center text-[11px] text-muted">
            Latihan ini tidak mengubah jadwal ulangan kartu. Gunakan ulasan kosakata untuk SRS.
          </p>
        </div>
      )}
    </Modal>
  );
}
