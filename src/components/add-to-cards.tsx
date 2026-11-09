"use client";

import { useState } from "react";
import { useProgress } from "@/components/providers/progress-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui";
import { Icon } from "@/components/icons";
import type { ItemKind } from "@/lib/types";

export function AddToCards({
  itemId,
  kind,
  label = "Tambah ke kartu ulangan",
}: {
  itemId: string;
  kind: ItemKind;
  label?: string;
}) {
  const { snapshot, addCard } = useProgress();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const exists = snapshot.cards.some((card) => card.itemId === itemId);

  async function add() {
    setBusy(true);
    try {
      await addCard({ itemId, kind });
      toast.success("Ditambahkan ke kartu ulangan.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menambahkan kartu.");
    } finally {
      setBusy(false);
    }
  }

  if (exists) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-matcha-soft px-3 py-1.5 text-xs font-semibold text-matcha">
        <Icon name="check" size={14} /> Sudah di kartu
      </span>
    );
  }

  return (
    <Button type="button" variant="soft" size="sm" onClick={() => void add()} disabled={busy} aria-label={label}>
      <Icon name="plus" size={14} /> {busy ? "Menambahkan…" : label}
    </Button>
  );
}
