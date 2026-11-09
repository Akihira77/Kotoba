"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { JpText } from "@/components/japanese";
import { useProgress } from "@/components/providers/progress-provider";
import { Badge, Button, Card, EmptyState, PageHeader, SearchInput, StatTile } from "@/components/ui";
import { CULTURE } from "@/content/culture";
import {
  CULTURE_CATEGORY_ICONS,
  CULTURE_CATEGORY_LABELS,
  CULTURE_GROUP_BY_CATEGORY,
  CULTURE_GROUP_ICONS,
  CULTURE_GROUP_LABELS,
  CULTURE_GROUP_ORDER,
} from "@/lib/constants";
import { CULTURE_FACTS, factForKey, localDateKey } from "@/lib/culture-facts";
import type { CultureGroup } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

type Filter = CultureGroup | "semua" | "favorit";

const GROUP_DESCRIPTIONS: Record<CultureGroup, string> = {
  budaya: "Tradisi, festival, pakaian, etiket, dan kehidupan sehari-hari.",
  makanan: "Masakan rumahan, makanan jalanan, dan kekhasan daerah.",
  geografi: "Kota, prefektur, bentang alam, dan perbedaan antarwilayah.",
  sejarah: "Periode penting, tokoh, dan perkembangan budaya.",
  anime: "Ungkapan, honorifik, dan beda fiksi dengan bahasa nyata.",
  bahasa: "Asal kanji, sejarah kana, idiom, dan konvensi tulisan.",
};

const subscribeDaily = () => () => {};
const getClientDateKey = () => localDateKey(new Date());
const getServerDateKey = () => "1970-01-01";

export default function CulturePage() {
  const { snapshot, toggleCultureFavorite } = useProgress();
  const [filter, setFilter] = useState<Filter>("semua");
  const [search, setSearch] = useState("");
  const [randomOffset, setRandomOffset] = useState(0);
  const [pendingFavorite, setPendingFavorite] = useState<string | null>(null);
  const dateKey = useSyncExternalStore(subscribeDaily, getClientDateKey, getServerDateKey);

  const completed = useMemo(
    () => new Set(snapshot.lessons.filter((lesson) => lesson.kind === "culture").map((lesson) => lesson.lessonId)),
    [snapshot.lessons],
  );
  const favorites = useMemo(() => new Set(snapshot.favorites.map((favorite) => favorite.articleId)), [snapshot.favorites]);

  const dailyFact = useMemo(() => factForKey(`daily:${dateKey}`), [dateKey]);
  const randomFact = useMemo(() => factForKey(`random:${dateKey}:${randomOffset}`), [dateKey, randomOffset]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return CULTURE.filter((article) => {
      if (filter === "favorit" && !favorites.has(article.id)) return false;
      if (filter !== "semua" && filter !== "favorit" && CULTURE_GROUP_BY_CATEGORY[article.category] !== filter) return false;
      if (!query) return true;
      const fields = [
        article.title,
        article.titleJp,
        article.summary,
        ...article.body,
        ...article.topics,
        ...article.facts.flatMap((fact) => [fact.label, fact.value]),
        ...article.vocab.flatMap((term) => [term.jp, term.reading, term.romaji, term.meaning]),
        ...(article.expressions ?? []).flatMap((expression) => [expression.jp, expression.reading, expression.meaning]),
      ];
      return fields.some((field) => field.toLowerCase().includes(query));
    });
  }, [favorites, filter, search]);

  async function handleFavorite(articleId: string, favorite: boolean) {
    setPendingFavorite(articleId);
    try {
      await toggleCultureFavorite(articleId, !favorite);
    } catch {
      // The provider already surfaces the server error in a toast.
    } finally {
      setPendingFavorite(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Budaya & penemuan · 文化"
        title="Jelajahi Jepang"
        titleJp="日本を知る"
        icon="culture"
        description="Kaitkan bahasa Jepang dengan masyarakat, makanan, geografi, sejarah, anime, dan fakta bahasanya. Setiap artikel punya sumber, kosakata, dan kuis singkat."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Artikel" value={formatNumber(CULTURE.length)} hint="Enam kelompok belajar" icon="culture" tone="brand" />
        <StatTile label="Sudah dibaca" value={formatNumber(completed.size)} hint={`dari ${CULTURE.length} artikel`} icon="checkCircle" tone="matcha" />
        <StatTile label="Favorit" value={formatNumber(favorites.size)} hint="Tersimpan di server lokal" icon="star" tone="gold" />
        <StatTile label="Fakta" value={formatNumber(CULTURE_FACTS.length)} hint="Dengan rujukan artikel" icon="sparkles" tone="indigo" />
      </div>

      <Card className="overflow-hidden border-brand/20">
        <div className="grid md:grid-cols-[1.35fr_1fr]">
          <div className="relative overflow-hidden bg-brand-soft/50 p-6 sm:p-7 dark:bg-brand/10">
            <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-9 font-jp text-[110px] font-bold leading-none text-brand/5">今日</span>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand">
              <Icon name="sparkles" size={14} /> Fakta hari ini
            </p>
            <p className="relative mt-3 max-w-xl text-base font-semibold leading-relaxed sm:text-lg">{dailyFact.value}</p>
            <p className="mt-2 text-xs text-muted">{dailyFact.label} · {dailyFact.articleTitle}</p>
            <Link href={`/culture/${dailyFact.articleId}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
              Baca artikelnya <Icon name="arrowRight" size={14} />
            </Link>
          </div>
          <div className="border-t border-line p-6 sm:p-7 md:border-l md:border-t-0">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-muted">
                <Icon name="shuffle" size={14} /> Fakta acak
              </p>
              <Badge tone="muted">日本語</Badge>
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed">{randomFact.value}</p>
            <p className="mt-1 text-[11px] text-muted">{randomFact.articleTitle}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => setRandomOffset((value) => value + 1)}>
                <Icon name="shuffle" size={14} /> Fakta lain
              </Button>
              <Link href={`/culture/${randomFact.articleId}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
                Baca artikelnya <Icon name="arrowRight" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Enam cara menjelajah</h2>
            <p className="mt-0.5 text-sm text-muted">Pilih kelompok, lalu persempit dengan pencarian atau favorit.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CULTURE_GROUP_ORDER.map((group) => {
            const articles = CULTURE.filter((article) => CULTURE_GROUP_BY_CATEGORY[article.category] === group);
            const read = articles.filter((article) => completed.has(article.id)).length;
            const active = filter === group;
            return (
              <button
                key={group}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(active ? "semua" : group)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-left transition",
                  active
                    ? "border-brand/40 bg-brand-soft/45 shadow-soft dark:bg-brand/10"
                    : "border-line bg-surface hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-soft",
                )}
              >
                <span className="rounded-xl bg-brand-soft p-2 text-brand dark:bg-brand/15">
                  <Icon name={CULTURE_GROUP_ICONS[group] as IconName} size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-bold">{CULTURE_GROUP_LABELS[group]}</span>
                    <span className="text-[11px] text-muted">{read}/{articles.length}</span>
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">{GROUP_DESCRIPTIONS[group]}</span>
                  <span className="mt-2 block text-[11px] font-semibold text-brand">
                    {articles.reduce((sum, article) => sum + article.facts.length, 0)} fakta
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Card className="p-4 sm:p-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari tradisi, makanan, kota, kanji, idiom…" />
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilter("semua")}
            aria-pressed={filter === "semua"}
            className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", filter === "semua" ? "bg-brand text-white" : "bg-surface-2 text-muted hover:text-ink")}
          >
            <Icon name="grid" size={13} /> Semua
          </button>
          <button
            type="button"
            onClick={() => setFilter("favorit")}
            aria-pressed={filter === "favorit"}
            className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", filter === "favorit" ? "bg-brand text-white" : "bg-surface-2 text-muted hover:text-ink")}
          >
            <Icon name="star" size={13} /> Favorit {favorites.size}
          </button>
          {CULTURE_GROUP_ORDER.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setFilter(group)}
              aria-pressed={filter === group}
              className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", filter === group ? "bg-brand text-white" : "bg-surface-2 text-muted hover:text-ink")}
            >
              <Icon name={CULTURE_GROUP_ICONS[group] as IconName} size={13} /> {CULTURE_GROUP_LABELS[group]}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            {filter === "semua" ? "Semua artikel" : filter === "favorit" ? "Artikel favorit" : CULTURE_GROUP_LABELS[filter]}
          </h2>
          <p className="mt-0.5 text-sm text-muted">{filtered.length} artikel pada tampilan ini.</p>
        </div>
        {filter !== "semua" && (
          <Button variant="ghost" size="sm" onClick={() => setFilter("semua")}>
            <Icon name="x" size={14} /> Hapus filter
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={filter === "favorit" ? "star" : "search"}
          title={filter === "favorit" ? "Belum ada artikel favorit" : "Artikel tidak ditemukan"}
          description={
            filter === "favorit"
              ? "Tekan ikon bintang pada artikel untuk menyimpannya di sini."
              : "Coba kata kunci lain, atau kembali ke semua kelompok budaya."
          }
          action={
            <Button variant="secondary" onClick={() => { setSearch(""); setFilter("semua"); }}>
              Tampilkan semua artikel
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((article) => {
            const isDone = completed.has(article.id);
            const isFavorite = favorites.has(article.id);
            return (
              <article key={article.id} className="group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-lift">
                <div className="flex items-start justify-between gap-2">
                  <Badge tone="indigo">
                    <Icon name={CULTURE_CATEGORY_ICONS[article.category] as IconName} size={11} /> {CULTURE_CATEGORY_LABELS[article.category]}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    {isDone && <Badge tone="matcha"><Icon name="check" size={11} /> Dibaca</Badge>}
                    <button
                      type="button"
                      aria-label={isFavorite ? `Hapus ${article.title} dari favorit` : `Simpan ${article.title} ke favorit`}
                      aria-pressed={isFavorite}
                      disabled={pendingFavorite === article.id}
                      onClick={() => void handleFavorite(article.id, isFavorite)}
                      className={cn(
                        "rounded-full border p-1.5 transition disabled:opacity-50",
                        isFavorite ? "border-gold/40 bg-gold-soft text-gold" : "border-line text-muted hover:border-gold/40 hover:text-gold",
                      )}
                    >
                      <Icon name="star" size={14} className={isFavorite ? "fill-current" : undefined} />
                    </button>
                  </div>
                </div>
                <h2 className="mt-3 text-lg font-bold group-hover:text-brand">
                  <Link href={`/culture/${article.id}`}>{article.title}</Link>
                </h2>
                <JpText text={article.titleJp} className="mt-0.5 text-sm text-muted" />
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{article.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {article.topics.slice(0, 3).map((topic) => (
                    <Badge key={topic} tone="muted" className="text-[10px]">{topic}</Badge>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11px] text-muted">
                  <span className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1"><Icon name="clock" size={12} /> {article.minutes} menit</span>
                    <span>{article.vocab.length} istilah</span>
                  </span>
                  <Link href={`/culture/${article.id}`} className="inline-flex items-center gap-1 font-semibold text-brand">
                    Baca <Icon name="arrowRight" size={13} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="rounded-xl border border-line bg-surface-2/40 p-3 text-[11px] leading-relaxed text-muted">
        Materi ini ringkasan edukatif orisinal, bukan klaim bahwa semua orang Jepang berperilaku sama. Kebiasaan dapat berbeda menurut daerah, generasi, dan konteks. Rujukan bacaan tersedia di setiap artikel; tidak ada gambar karakter anime berhak cipta yang digunakan.
      </p>
    </div>
  );
}
