"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CultureQuiz } from "@/components/culture-quiz";
import { Icon, type IconName } from "@/components/icons";
import { JpText, SpeakButton } from "@/components/japanese";
import { useProgress } from "@/components/providers/progress-provider";
import { Badge, Button, Card, EmptyState, LinkButton, SectionHeading } from "@/components/ui";
import { CULTURE, CULTURE_BY_ID } from "@/content/culture";
import {
  CULTURE_CATEGORY_ICONS,
  CULTURE_CATEGORY_LABELS,
  CULTURE_GROUP_BY_CATEGORY,
  CULTURE_GROUP_LABELS,
  REGISTER_LABELS,
  XP_RULES,
} from "@/lib/constants";
import type { CultureGroup, Register } from "@/lib/types";
import { cn } from "@/lib/utils";

const REGISTER_TONE: Record<Register, "matcha" | "indigo" | "gold" | "brand" | "anime"> = {
  standar: "matcha",
  formal: "indigo",
  kasual: "indigo",
  slang: "gold",
  arkais: "anime",
  anime: "brand",
};

const REGISTER_ORDER: Register[] = ["standar", "formal", "kasual", "slang", "arkais", "anime"];

interface RelatedMaterial {
  href: string;
  title: string;
  description: string;
  icon: IconName;
}

const RELATED_MATERIALS: Record<CultureGroup, RelatedMaterial[]> = {
  budaya: [
    { href: "/reading", title: "Bacaan bertema", description: "Latih pemahaman teks dengan furigana.", icon: "reading" },
    { href: "/listening", title: "Dialog sehari-hari", description: "Dengar percakapan bertema budaya.", icon: "listening" },
    { href: "/grammar", title: "Tata bahasa", description: "Pola yang sering muncul dalam percakapan.", icon: "grammar" },
  ],
  makanan: [
    { href: "/vocabulary", title: "Kosakata makanan", description: "Cari istilah masakan di kamus.", icon: "vocab" },
    { href: "/reading", title: "Bacaan", description: "Teks pendek tentang kehidupan Jepang.", icon: "reading" },
    { href: "/games", title: "Permainan kata", description: "Latih kosakata sambil bermain.", icon: "games" },
  ],
  geografi: [
    { href: "/kanji", title: "Kanji tempat & arah", description: "Baca nama tempat dan kanji umum.", icon: "kanji" },
    { href: "/reading", title: "Bacaan perjalanan", description: "Latih pemahaman teks deskriptif.", icon: "reading" },
    { href: "/culture", title: "Artikel daerah lain", description: "Bandingkan kota dan wilayah.", icon: "map" },
  ],
  sejarah: [
    { href: "/reading", title: "Bacaan", description: "Teks naratif dan informatif.", icon: "reading" },
    { href: "/grammar", title: "Tata bahasa", description: "Pola untuk menjelaskan urutan dan sebab.", icon: "grammar" },
    { href: "/exams", title: "Ujian", description: "Uji pemahaman bacaan bergaya JLPT.", icon: "exam" },
  ],
  anime: [
    { href: "/listening", title: "Menyimak", description: "Bandingkan dialog fiksi dan percakapan nyata.", icon: "listening" },
    { href: "/pronunciation", title: "Pelafalan", description: "Latih ritme dan intonasi.", icon: "pronunciation" },
    { href: "/dictionary", title: "Kamus", description: "Cari arti dan register kata.", icon: "dictionary" },
  ],
  bahasa: [
    { href: "/kana", title: "Kana", description: "Sejarah huruf dan latihan membaca.", icon: "kana" },
    { href: "/kanji", title: "Kanji", description: "Bentuk, bacaan, dan radikal.", icon: "kanji" },
    { href: "/dictionary", title: "Kamus", description: "Telusuri istilah dan contoh.", icon: "dictionary" },
  ],
};

export default function CultureDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const article = CULTURE_BY_ID.get(id);
  const { snapshot, recordLesson, toggleCultureFavorite } = useProgress();
  const [pendingFavorite, setPendingFavorite] = useState(false);

  if (!article) {
    return (
      <EmptyState
        icon="culture"
        title="Artikel tidak ditemukan"
        description="Artikel ini mungkin sudah dipindahkan. Kembali ke daftar budaya untuk menjelajah topik lain."
        action={<LinkButton href="/culture">Kembali ke daftar</LinkButton>}
      />
    );
  }

  const articleId = article.id;
  const done = snapshot.lessons.some((lesson) => lesson.lessonId === articleId && lesson.kind === "culture");
  const favorite = snapshot.favorites.some((entry) => entry.articleId === articleId);
  const group = CULTURE_GROUP_BY_CATEGORY[article.category];
  const index = CULTURE.findIndex((entry) => entry.id === article.id);
  const previous = CULTURE[index - 1];
  const next = CULTURE[index + 1];

  async function handleFavorite() {
    setPendingFavorite(true);
    try {
      await toggleCultureFavorite(articleId, !favorite);
    } catch {
      // The provider already reports the failure in a toast.
    } finally {
      setPendingFavorite(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <LinkButton href="/culture" variant="ghost" size="sm" className="-ml-2 mb-2">
          <Icon name="arrowLeft" size={15} /> Semua budaya
        </LinkButton>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="indigo">
              <Icon name={CULTURE_CATEGORY_ICONS[article.category] as IconName} size={11} /> {CULTURE_CATEGORY_LABELS[article.category]}
            </Badge>
            {CULTURE_GROUP_LABELS[group] !== CULTURE_CATEGORY_LABELS[article.category] && (
              <Badge tone="muted">{CULTURE_GROUP_LABELS[group]}</Badge>
            )}
            <Badge tone="muted"><Icon name="clock" size={11} /> {article.minutes} menit</Badge>
            {done && <Badge tone="matcha"><Icon name="check" size={11} /> Selesai</Badge>}
          </div>
          <Button
            variant={favorite ? "secondary" : "soft"}
            size="sm"
            aria-pressed={favorite}
            disabled={pendingFavorite}
            onClick={() => void handleFavorite()}
          >
            <Icon name="star" size={15} className={favorite ? "fill-current text-gold" : undefined} />
            {favorite ? "Tersimpan" : "Simpan"}
          </Button>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{article.title}</h1>
        <JpText text={article.titleJp} className="mt-1 text-lg text-muted" />
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{article.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {article.topics.map((topic) => (
            <Badge key={topic} tone="brand" className="text-[10px]">{topic}</Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-7">
            <div className="space-y-4">
              {article.body.map((paragraph, idx) => (
                <p key={idx} className="text-sm leading-[1.9] sm:text-[15px]">{paragraph}</p>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading title="Fakta singkat" icon="info" />
            <dl className="grid gap-3 sm:grid-cols-2">
              {article.facts.map((fact) => (
                <div key={fact.label} className="rounded-xl border border-line bg-surface-2/40 p-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted">{fact.label}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {article.expressions && article.expressions.length > 0 && (
            <Card className="p-5 sm:p-6">
              <SectionHeading
                title="Ungkapan & register"
                icon="sparkles"
                description="Setiap ungkapan diberi label agar kamu tahu kapan aman menggunakannya."
              />
              <div className="space-y-3">
                {article.expressions.map((expression) => (
                  <div key={expression.jp} className="rounded-2xl border border-line p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="flex items-center gap-2">
                          <span className="font-jp text-lg font-semibold">{expression.jp}</span>
                          <Badge tone={REGISTER_TONE[expression.register]}>{REGISTER_LABELS[expression.register].label}</Badge>
                        </p>
                        <p className="text-xs text-muted">{expression.reading} · {expression.romaji} · {expression.meaning}</p>
                      </div>
                      <SpeakButton text={expression.jp} speech={expression.reading} size={14} />
                    </div>
                    <p className="mt-2 text-sm"><span className="font-semibold">Kapan dipakai: </span>{expression.usage}</p>
                    {expression.note && <p className="mt-1 text-xs text-muted">{expression.note}</p>}
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-brand/20 bg-brand-soft/30 p-3 text-xs leading-relaxed">
                <p className="flex items-center gap-1.5 font-semibold text-brand"><Icon name="alert" size={14} /> Penting</p>
                <p className="mt-1 text-muted">
                  Ungkapan berlabel <strong>anime</strong> dan <strong>arkais</strong> sering sengaja dilebih-lebihkan untuk
                  karakter fiksi. Gunakan hanya untuk memahami tontonan atau bercanda dengan teman dekat — bukan untuk
                  percakapan sopan sehari-hari.
                </p>
              </div>
            </Card>
          )}

          <CultureQuiz questions={article.quiz} />

          <Card className="p-5 sm:p-6">
            <SectionHeading
              title="Kosakata budaya"
              icon="vocab"
              description="Istilah yang muncul dalam artikel ini. Tekan kata untuk mencarinya di kamus."
            />
            <ul className="grid gap-2 sm:grid-cols-2">
              {article.vocab.map((term) => (
                <li key={term.jp} className="flex items-center justify-between gap-2 rounded-xl border border-line p-3">
                  <div className="min-w-0">
                    <Link
                      href={`/vocabulary?q=${encodeURIComponent(term.jp)}`}
                      className="font-jp text-base font-medium hover:text-brand hover:underline"
                    >
                      {term.jp}
                    </Link>
                    <p className="text-[11px] text-muted">{term.reading} · {term.romaji}</p>
                    <p className="text-xs">{term.meaning}</p>
                  </div>
                  <SpeakButton text={term.jp} speech={term.reading} size={14} />
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading
              title="Sumber & bacaan lanjutan"
              icon="book"
              description="Rujukan institusi untuk memeriksa fakta dan memperdalam topik."
            />
            <ul className="space-y-2">
              {article.sources.map((source) => (
                <li key={`${source.label}-${source.url}`}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-3 rounded-xl border border-line p-3 transition hover:border-brand/35 hover:bg-surface-2/60"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{source.label}</span>
                      {source.note && <span className="mt-0.5 block text-xs text-muted">{source.note}</span>}
                    </span>
                    <Icon name="external" size={15} className="mt-0.5 shrink-0 text-muted" />
                  </a>
                </li>
              ))}
            </ul>
            {article.sourceNote && (
              <p className="mt-3 rounded-xl border border-line bg-surface-2/40 p-3 text-[11px] leading-relaxed text-muted">
                {article.sourceNote}
              </p>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-bold">Progres artikel</h2>
            <Button
              className="mt-3 w-full"
              variant={done ? "secondary" : "primary"}
              disabled={done}
              onClick={() => {
                if (done) return;
                void recordLesson({ lessonId: article.id, kind: "culture", score: 100, xp: XP_RULES.lesson.culture });
              }}
            >
              <Icon name={done ? "checkCircle" : "check"} size={16} /> {done ? "Sudah selesai" : "Tandai selesai"}
            </Button>
            {!done && <p className="mt-2 text-[11px] text-muted">Dapatkan {XP_RULES.lesson.culture} XP setelah selesai membaca.</p>}
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
              <Icon name="star" size={13} className={favorite ? "fill-current text-gold" : undefined} />
              {favorite ? "Tersimpan di favorit." : "Simpan artikel untuk dibaca nanti."}
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold"><Icon name="learn" size={17} className="text-brand" /> Materi terkait</h2>
            <ul className="mt-3 space-y-2">
              {RELATED_MATERIALS[group].map((material) => (
                <li key={material.href}>
                  <Link href={material.href} className="flex items-start gap-2.5 rounded-xl border border-line p-2.5 transition hover:border-brand/35 hover:bg-surface-2/60">
                    <Icon name={material.icon} size={16} className="mt-0.5 shrink-0 text-brand" />
                    <span>
                      <span className="block text-xs font-semibold">{material.title}</span>
                      <span className="mt-0.5 block text-[11px] text-muted">{material.description}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Panduan register</h3>
            <ul className="mt-2 space-y-2">
              {REGISTER_ORDER.map((register) => (
                <li key={register} className="text-xs">
                  <Badge tone={REGISTER_TONE[register]}>{REGISTER_LABELS[register].label}</Badge>
                  <p className="mt-1 text-muted">{REGISTER_LABELS[register].description}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex justify-between gap-2 text-xs">
              {previous ? <Link href={`/culture/${previous.id}`} className="text-brand hover:underline">← Sebelumnya</Link> : <span />}
              {next ? <Link href={`/culture/${next.id}`} className="text-brand hover:underline">Berikutnya →</Link> : <span />}
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-[11px] text-muted">
              <Icon name={CULTURE_CATEGORY_ICONS[article.category] as IconName} size={13} />
              <span className={cn("truncate")}>{article.titleJp}</span>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
