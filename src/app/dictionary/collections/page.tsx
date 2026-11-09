"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { useProgress } from "@/components/providers/progress-provider";
import { SavedItemEditor, SavedItemsReview, type SavedReviewEntry } from "@/components/saved-item-editor";
import { Badge, Button, Card, EmptyState, LinkButton, Modal, PageHeader, SearchInput, SectionHeading, Select, StatTile } from "@/components/ui";
import { GRAMMAR } from "@/content/grammar";
import { KANJI } from "@/content/kanji";
import { VOCABULARY } from "@/content/vocabulary";
import { LEVEL_LABELS } from "@/lib/constants";
import type { GrammarPoint, Kanji, SavedCollection, SavedItem, SavedItemKind, VocabWord } from "@/lib/types";

type Entry =
  | { kind: "vocabulary"; item: VocabWord }
  | { kind: "kanji"; item: Kanji }
  | { kind: "grammar"; item: GrammarPoint };

type SavedEntry = { saved: SavedItem; entry: Entry };

const KIND_META: Record<SavedItemKind, { label: string; icon: "vocab" | "kanji" | "grammar"; tone: "brand" | "indigo" | "gold" }> = {
  vocabulary: { label: "Kosakata", icon: "vocab", tone: "brand" },
  kanji: { label: "Kanji", icon: "kanji", tone: "indigo" },
  grammar: { label: "Tata bahasa", icon: "grammar", tone: "gold" },
};

function entryFromSaved(saved: SavedItem): Entry | null {
  if (saved.kind === "vocabulary") {
    const item = VOCABULARY.find((word) => word.id === saved.refId);
    return item ? { kind: "vocabulary", item } : null;
  }
  if (saved.kind === "kanji") {
    const item = KANJI.find((kanji) => kanji.id === saved.refId);
    return item ? { kind: "kanji", item } : null;
  }
  const item = GRAMMAR.find((point) => point.id === saved.refId);
  return item ? { kind: "grammar", item } : null;
}

function entryTitle(entry: Entry): string {
  if (entry.kind === "vocabulary") return entry.item.japanese;
  if (entry.kind === "kanji") return entry.item.char;
  return entry.item.pattern;
}

function entryReading(entry: Entry): string {
  if (entry.kind === "vocabulary") return entry.item.kana + " · " + entry.item.romaji;
  if (entry.kind === "kanji") return entry.item.meanings.join(", ");
  return entry.item.meaning;
}

function entryDetail(entry: Entry): string {
  if (entry.kind === "vocabulary") {
    const example = entry.item.examples[0];
    return entry.item.meaning + (example ? " — " + example.jp + " (" + example.meaning + ")" : "");
  }
  if (entry.kind === "kanji") {
    return (
      entry.item.meanings.join(", ") +
      " · " +
      entry.item.strokes +
      " goresan · On: " +
      (entry.item.on.join("、") || "—") +
      " · Kun: " +
      (entry.item.kun.join("、") || "—")
    );
  }
  return entry.item.meaning + " — " + entry.item.explanation[0];
}

function entryHref(entry: Entry): string {
  if (entry.kind === "grammar") return "/grammar/" + entry.item.id;
  if (entry.kind === "vocabulary") return "/vocabulary?q=" + encodeURIComponent(entry.item.japanese);
  return "/kanji?level=" + entry.item.level;
}

function reviewEntry(entry: Entry, saved: SavedItem): SavedReviewEntry {
  return {
    key: saved.kind + ":" + saved.refId,
    kind: saved.kind,
    title: entryTitle(entry),
    reading: entryReading(entry),
    detail: entryDetail(entry),
  };
}

export default function SavedCollectionsPage() {
  const { snapshot, saveCollection, loading } = useProgress();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SavedItemKind | "semua">("semua");
  const [collectionFilter, setCollectionFilter] = useState<string>("semua");
  const [editing, setEditing] = useState<SavedEntry | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [collectionDraft, setCollectionDraft] = useState<{ id?: string; name: string; description: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedCollection | null>(null);
  const [busy, setBusy] = useState(false);

  const savedEntries = useMemo<SavedEntry[]>(
    () =>
      snapshot.savedItems.flatMap((saved) => {
        const entry = entryFromSaved(saved);
        return entry ? [{ saved, entry }] : [];
      }),
    [snapshot.savedItems],
  );

  const collections = snapshot.savedCollections;
  const collectionCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of savedEntries) {
      if (!item.saved.collectionId) continue;
      counts.set(item.saved.collectionId, (counts.get(item.saved.collectionId) ?? 0) + 1);
    }
    return counts;
  }, [savedEntries]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return savedEntries.filter(({ saved, entry }) => {
      if (kind !== "semua" && saved.kind !== kind) return false;
      if (collectionFilter === "none" && saved.collectionId) return false;
      if (collectionFilter !== "semua" && collectionFilter !== "none" && saved.collectionId !== collectionFilter) return false;
      if (!needle) return true;
      return [entryTitle(entry), entryReading(entry), saved.note].join(" ").toLowerCase().includes(needle);
    });
  }, [collectionFilter, kind, query, savedEntries]);

  const notes = savedEntries.filter(({ saved }) => saved.note.trim().length > 0).length;
  const collectionName = (id: string | null) => collections.find((collection) => collection.id === id)?.name ?? null;

  async function submitCollection() {
    if (!collectionDraft) return;
    setBusy(true);
    try {
      await saveCollection({
        id: collectionDraft.id,
        name: collectionDraft.name.trim() || "Koleksi tanpa nama",
        description: collectionDraft.description.trim(),
      });
      setCollectionDraft(null);
    } catch {
      // Provider shows the error toast.
    } finally {
      setBusy(false);
    }
  }

  async function removeCollection(target: SavedCollection) {
    setBusy(true);
    try {
      await saveCollection({ id: target.id, name: target.name, remove: true });
      setDeleteTarget(null);
      if (collectionFilter === target.id) setCollectionFilter("semua");
    } catch {
      // Provider shows the error toast.
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Kamus pribadi"
        title="Koleksi belajar"
        titleJp="自分の辞書"
        icon="bookmark"
        description="Simpan kosakata, kanji, dan pola tata bahasa yang ingin kamu ingat lagi. Tambahkan catatan pribadi, kelompokkan ke koleksi, lalu ulangi kapan saja."
        actions={
          <>
            <LinkButton href="/dictionary" variant="secondary" size="sm">
              <Icon name="arrowLeft" size={15} /> Kembali ke kamus
            </LinkButton>
            <Button size="sm" disabled={filtered.length === 0} onClick={() => setReviewing(true)}>
              <Icon name="rotate" size={15} /> Ulangi materi
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Materi tersimpan" value={savedEntries.length} hint={savedEntries.length === 0 ? "Belum ada materi" : "Kosakata, kanji, tata bahasa"} icon="bookmark" />
        <StatTile label="Koleksi" value={collections.length} hint="Kelompok buatanmu" icon="folder" tone="indigo" />
        <StatTile label="Dengan catatan" value={notes} hint="Catatan pribadi" icon="note" tone="gold" />
        <StatTile label="Siap diulang" value={filtered.length} hint="Sesuai filter saat ini" icon="rotate" tone="matcha" />
      </div>

      <Card className="space-y-4 p-4 sm:p-5">
        <SectionHeading
          title="Koleksi"
          description="Kelompokkan materi sesuai tujuanmu. Menghapus koleksi tidak menghapus materinya."
          icon="folder"
          action={
            <Button size="sm" variant="secondary" onClick={() => setCollectionDraft({ name: "", description: "" })}>
              <Icon name="plus" size={15} /> Koleksi baru
            </Button>
          }
        />
        {collections.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-surface-2/40 px-4 py-3 text-sm text-muted">
            Belum ada koleksi. Kamu tetap bisa menyimpan materi tanpa koleksi, atau buat koleksi seperti “Kanji N5” atau “Tata bahasa untuk ujian”.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => (
              <div key={collection.id} className="rounded-2xl border border-line bg-surface-2/30 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{collection.name}</p>
                    <p className="text-xs text-muted">{collectionCount.get(collection.id) ?? 0} materi</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCollectionDraft({ id: collection.id, name: collection.name, description: collection.description })}
                      className="rounded-full p-2 text-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      aria-label={"Ubah koleksi " + collection.name}
                    >
                      <Icon name="edit" size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(collection)}
                      className="rounded-full p-2 text-muted transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:hover:bg-brand/15"
                      aria-label={"Hapus koleksi " + collection.name}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
                {collection.description ? <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{collection.description}</p> : null}
                <button
                  type="button"
                  onClick={() => setCollectionFilter(collection.id)}
                  className="mt-3 text-xs font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Lihat materi koleksi ini →
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-3 p-4 sm:p-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Cari materi atau catatan pribadi…" />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Jenis materi tersimpan">
            {(["semua", "vocabulary", "kanji", "grammar"] as const).map((option) => {
              const active = kind === option;
              const meta = option === "semua" ? null : KIND_META[option];
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setKind(option)}
                  aria-pressed={active}
                  className={
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand " +
                    (active ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:bg-surface-2")
                  }
                >
                  {meta ? <Icon name={meta.icon} size={14} /> : <Icon name="grid" size={14} />}
                  {meta ? meta.label : "Semua"}
                </button>
              );
            })}
          </div>
          <Select label="Koleksi" value={collectionFilter} onChange={(event) => setCollectionFilter(event.target.value)}>
            <option value="semua">Semua koleksi</option>
            <option value="none">Tanpa koleksi</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>{collection.name}</option>
            ))}
          </Select>
        </div>
        <p className="text-xs text-muted">{filtered.length} dari {savedEntries.length} materi tersimpan</p>
      </Card>

      {loading && savedEntries.length === 0 ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((key) => <div key={key} className="h-28 animate-pulse rounded-3xl bg-surface-2" />)}
        </div>
      ) : savedEntries.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="Kamus pribadimu masih kosong"
          description="Buka kamus, tekan ikon simpan pada materi yang menarik, lalu kembali ke sini untuk menulis catatan dan mengelompokkannya."
          action={<LinkButton href="/dictionary" size="sm">Jelajahi kamus</LinkButton>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="Tidak ada materi yang cocok"
          description="Coba kata kunci lain atau longgarkan filter jenis dan koleksi."
          action={<Button variant="secondary" size="sm" onClick={() => { setQuery(""); setKind("semua"); setCollectionFilter("semua"); }}>Bersihkan filter</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(({ saved, entry }) => {
            const meta = KIND_META[saved.kind];
            const name = collectionName(saved.collectionId);
            return (
              <Card key={saved.kind + ":" + saved.refId} className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={meta.tone}><Icon name={meta.icon} size={12} /> {meta.label}</Badge>
                      <Badge tone="muted">{LEVEL_LABELS[entry.item.level]}</Badge>
                      {name ? <Badge tone="indigo"><Icon name="folder" size={11} /> {name}</Badge> : null}
                    </div>
                    <p className="mt-2 font-jp text-2xl font-bold leading-snug">{entryTitle(entry)}</p>
                    <p className="mt-0.5 text-sm text-muted">{entryReading(entry)}</p>
                    <p className="mt-2 line-clamp-2 text-sm">{entryDetail(entry)}</p>
                    {saved.note ? (
                      <p className="mt-3 rounded-2xl bg-gold-soft/50 px-3 py-2 text-sm leading-relaxed text-ink dark:bg-gold/10">
                        <span className="font-semibold">Catatanmu: </span>{saved.note}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
                    <Link
                      href={entryHref(entry)}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-3 text-sm font-semibold transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      Buka materi <Icon name="arrowUpRight" size={14} />
                    </Link>
                    <Button variant="secondary" size="sm" onClick={() => setEditing({ saved, entry })}>
                      <Icon name="note" size={14} /> Catatan
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={collectionDraft !== null}
        onClose={() => setCollectionDraft(null)}
        title={collectionDraft?.id ? "Ubah koleksi" : "Koleksi baru"}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCollectionDraft(null)}>Batal</Button>
            <Button size="sm" disabled={busy || !collectionDraft?.name.trim()} onClick={() => void submitCollection()}>
              {collectionDraft?.id ? "Simpan perubahan" : "Buat koleksi"}
            </Button>
          </div>
        }
      >
        {collectionDraft ? (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-muted">
              Nama koleksi
              <input
                value={collectionDraft.name}
                maxLength={60}
                onChange={(event) => setCollectionDraft({ ...collectionDraft, name: event.target.value })}
                placeholder="Contoh: Kanji N5"
                className="mt-1 h-11 w-full rounded-full border border-line bg-surface px-4 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
              />
            </label>
            <label className="block text-xs font-semibold text-muted">
              Deskripsi (opsional)
              <textarea
                value={collectionDraft.description}
                maxLength={240}
                rows={3}
                onChange={(event) => setCollectionDraft({ ...collectionDraft, description: event.target.value })}
                placeholder="Apa tujuan koleksi ini?"
                className="mt-1 w-full resize-y rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
              />
            </label>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Hapus koleksi?"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="danger" size="sm" disabled={busy} onClick={() => deleteTarget && void removeCollection(deleteTarget)}>
              Hapus koleksi
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          Koleksi <span className="font-semibold text-ink">{deleteTarget?.name}</span> akan dihapus. Materi di dalamnya tetap tersimpan di kamus pribadi tanpa koleksi.
        </p>
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Catatan materi"
        size="md"
      >
        {editing ? (
          <div className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone={KIND_META[editing.saved.kind].tone}>{KIND_META[editing.saved.kind].label}</Badge>
                <Badge tone="muted">{editing.entry.item.level}</Badge>
              </div>
              <p className="mt-2 font-jp text-2xl font-bold">{entryTitle(editing.entry)}</p>
              <p className="text-sm text-muted">{entryReading(editing.entry)}</p>
            </div>
            <SavedItemEditor
              key={editing.saved.kind + ":" + editing.saved.refId}
              kind={editing.saved.kind}
              refId={editing.saved.refId}
            />
            <div className="flex justify-end">
              <LinkButton href={entryHref(editing.entry)} variant="secondary" size="sm">
                Buka materi <Icon name="arrowUpRight" size={14} />
              </LinkButton>
            </div>
          </div>
        ) : null}
      </Modal>

      {reviewing && filtered.length > 0 ? (
        <SavedItemsReview
          key={filtered.map(({ saved }) => saved.kind + ":" + saved.refId).join("|")}
          entries={filtered.map(({ saved, entry }) => reviewEntry(entry, saved))}
          onClose={() => setReviewing(false)}
        />
      ) : null}
    </div>
  );
}
