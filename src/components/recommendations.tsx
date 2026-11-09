"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import type { Recommendation, RecommendationTone } from "@/lib/recommendations";

const TONE_CLASSES: Record<RecommendationTone, string> = {
  brand: "bg-brand-soft text-brand dark:bg-brand/15",
  matcha: "bg-matcha-soft text-matcha dark:bg-matcha/15",
  gold: "bg-gold-soft text-gold dark:bg-gold/15",
  indigo: "bg-indigo-soft text-indigo-ink dark:bg-indigo/15",
};

/** Daftar saran yang selalu menampilkan alasan dan bukti datanya. */
export function RecommendationList({
  recommendations,
  compact = false,
}: {
  recommendations: Recommendation[];
  compact?: boolean;
}) {
  if (recommendations.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-surface-2/40 px-4 py-6 text-center text-xs text-muted">
        Belum ada data latihan yang cukup untuk menyusun saran. Mulai satu sesi singkat terlebih dahulu.
      </p>
    );
  }

  return (
    <ul className={compact ? "space-y-2.5" : "space-y-3"}>
      {recommendations.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className="group flex items-start gap-3 rounded-2xl border border-line bg-surface-2/25 p-3.5 transition hover:-translate-y-0.5 hover:border-brand/30 hover:bg-surface"
          >
            <span className={`mt-0.5 shrink-0 rounded-xl p-2.5 ${TONE_CLASSES[item.tone]}`}>
              <Icon name={item.icon} size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold leading-snug group-hover:text-brand">{item.title}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">{item.description}</span>
              <span className="mt-2 grid gap-1 text-[11px] leading-relaxed">
                <span className="text-ink/80">
                  <span className="font-semibold text-muted">Alasan: </span>
                  {item.reason}
                </span>
                <span className="text-muted">
                  <span className="font-semibold">Bukti: </span>
                  {item.evidence}
                </span>
              </span>
            </span>
            <span className="mt-1 hidden shrink-0 items-center gap-1 text-[11px] font-semibold text-brand sm:flex">
              {item.actionLabel}
              <Icon name="arrowRight" size={13} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
