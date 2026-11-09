"use client";

import { Icon, type IconName } from "@/components/icons";
import { hasJapanese, JpText, SpeakButton } from "@/components/japanese";
import { useProgress } from "@/components/providers/progress-provider";
import { Badge } from "@/components/ui";
import { ALL_KANA } from "@/content/kana";
import { KANJI_BY_ID } from "@/content/kanji";
import { VOCAB_BY_ID } from "@/content/vocabulary";
import { POS_LABELS, TOPIC_LABELS } from "@/lib/constants";
import type { LessonBlock, LessonTone } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONE_STYLES: Record<LessonTone, { icon: IconName; wrap: string; title: string }> = {
  info: {
    icon: "info",
    wrap: "border-indigo/20 bg-indigo-soft/50 dark:border-indigo/30 dark:bg-indigo/10",
    title: "text-indigo-ink dark:text-indigo",
  },
  tip: {
    icon: "lightbulb",
    wrap: "border-matcha/25 bg-matcha-soft/60 dark:border-matcha/30 dark:bg-matcha/10",
    title: "text-matcha",
  },
  important: {
    icon: "flag",
    wrap: "border-gold/30 bg-gold-soft/60 dark:border-gold/30 dark:bg-gold/10",
    title: "text-gold",
  },
  warning: {
    icon: "alert",
    wrap: "border-red-200 bg-red-50/80 dark:border-red-400/25 dark:bg-red-400/10",
    title: "text-red-700 dark:text-red-300",
  },
};

const GRID_COLUMNS: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

function MixedText({ text, className }: { text: string; className?: string }) {
  return <span className={cn(hasJapanese(text) ? "font-jp" : undefined, className)}>{text}</span>;
}

function BlockHeading({ children }: { children: string }) {
  return <h3 className="mb-3 text-base font-bold tracking-tight text-ink">{children}</h3>;
}

function ProseBlock({ block }: { block: Extract<LessonBlock, { type: "prose" }> }) {
  return (
    <section>
      {block.heading ? <BlockHeading>{block.heading}</BlockHeading> : null}
      <div className="space-y-3">
        {block.paragraphs.map((paragraph, index) => (
          <p key={index} className="text-sm leading-7 text-ink/90 sm:text-[15px]">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}


function JpProseBlock({ block }: { block: Extract<LessonBlock, { type: "jp-prose" }> }) {
  return (
    <section>
      {block.heading ? <BlockHeading>{block.heading}</BlockHeading> : null}
      <div className="space-y-3">
        {block.paragraphs.map((paragraph, index) => (
          <JpText key={index} text={paragraph} as="p" className="text-sm leading-8 text-ink/90 sm:text-[15px]" />
        ))}
      </div>
    </section>
  );
}

function DialogBlock({ block }: { block: Extract<LessonBlock, { type: "dialog" }> }) {
  return (
    <section>
      {block.heading ? <BlockHeading>{block.heading}</BlockHeading> : null}
      <div className="space-y-2.5">
        {block.lines.map((line, index) => (
          <article key={line.jp + index} className="rounded-2xl border border-line bg-surface-2/40 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{line.speaker}</p>
            <JpText text={line.jp} as="p" className="mt-1 text-lg font-semibold leading-8" />
            <p lang="ja" className="font-jp mt-0.5 text-xs leading-5 text-muted">{line.reading}</p>
            {line.meaning ? <p className="mt-1.5 text-sm leading-6 text-ink/85">{line.meaning}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function TableBlock({ block }: { block: Extract<LessonBlock, { type: "table" }> }) {
  return (
    <section>
      {block.heading ? <BlockHeading>{block.heading}</BlockHeading> : null}
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
          <thead className="bg-surface-2/80">
            <tr>
              {block.columns.map((column, index) => (
                <th
                  key={column + index}
                  scope="col"
                  className={cn(
                    "border-b border-line px-3.5 py-2.5 text-xs font-bold uppercase tracking-wide text-muted",
                    index === 0 && "w-28",
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={row.label + rowIndex} className="align-top even:bg-surface-2/35">
                <th scope="row" lang={hasJapanese(row.label) ? "ja" : undefined} className="border-b border-line px-3.5 py-3 text-left text-xs font-semibold text-muted last:border-b-0">
                  {row.label}
                </th>
                {row.cells.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border-b border-line px-3.5 py-3 leading-6 last:border-b-0">
                    <MixedText text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GridBlock({ block }: { block: Extract<LessonBlock, { type: "grid" }> }) {
  const columns = block.columns ?? 3;
  return (
    <section>
      {block.heading ? <BlockHeading>{block.heading}</BlockHeading> : null}
      <div className={cn("grid grid-cols-2 gap-2.5", GRID_COLUMNS[columns])}>
        {block.items.map((item, index) => (
          <div key={item.main + index} className="rounded-2xl border border-line bg-surface-2/45 px-3.5 py-3">
            <p className="text-sm font-bold leading-6">
              <MixedText text={item.main} />
            </p>
            {item.sub ? (
              <p className="mt-0.5 text-xs leading-5 text-muted">
                <MixedText text={item.sub} />
              </p>
            ) : null}
            {item.extra ? (
              <p className="mt-1 text-[11px] leading-5 text-muted">
                <MixedText text={item.extra} />
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function KanaGridBlock({ block }: { block: Extract<LessonBlock, { type: "kana-grid" }> }) {
  const byChar = new Map(ALL_KANA.map((kana) => [kana.char, kana]));
  return (
    <section>
      {block.heading ? <BlockHeading>{block.heading}</BlockHeading> : null}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        {block.chars.map((char) => {
          const kana = byChar.get(char);
          return (
            <div
              key={char}
              className="flex aspect-square flex-col items-center justify-center rounded-xl border border-line bg-surface transition-colors hover:border-brand/40"
            >
              <span className="font-jp text-2xl font-semibold leading-none" lang="ja">{char}</span>
              <span className="mt-1 text-[11px] font-medium text-muted">{kana?.romaji ?? ""}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function VocabListBlock({ block, showRomaji }: { block: Extract<LessonBlock, { type: "vocab-list" }>; showRomaji: boolean }) {
  const words = block.wordIds.map((id) => VOCAB_BY_ID.get(id)).filter((word): word is NonNullable<typeof word> => Boolean(word));
  return (
    <section>
      {block.heading ? <BlockHeading>{block.heading}</BlockHeading> : null}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {words.map((word) => (
          <div key={word.id} className="rounded-2xl border border-line bg-surface-2/40 p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-jp text-xl font-bold leading-7" lang="ja">{word.japanese}</p>
                <p className="font-jp mt-0.5 text-xs text-muted" lang="ja">{word.kana}</p>
                {showRomaji ? <p className="text-[11px] italic text-muted">{word.romaji}</p> : null}
              </div>
              <SpeakButton text={word.japanese} speech={word.kana} />
            </div>
            <p className="mt-1.5 text-sm font-semibold">{word.meaning}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge tone="muted">{word.level}</Badge>
              <Badge tone="muted">{POS_LABELS[word.pos]}</Badge>
              <Badge tone="muted">{TOPIC_LABELS[word.topic]}</Badge>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function KanjiListBlock({ block }: { block: Extract<LessonBlock, { type: "kanji-list" }> }) {
  const items = block.kanjiIds.map((id) => KANJI_BY_ID.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  return (
    <section>
      {block.heading ? <BlockHeading>{block.heading}</BlockHeading> : null}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((kanji) => (
          <div key={kanji.id} className="rounded-2xl border border-line bg-surface-2/40 p-3.5">
            <div className="flex gap-3">
              <span className="font-jp flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-3xl font-semibold" lang="ja">
                {kanji.char}
              </span>
              <div className="min-w-0 text-xs leading-5">
                <p className="font-bold text-ink">{kanji.meanings.join(", ")}</p>
                <p className="text-muted">On: <span className="font-jp" lang="ja">{kanji.on.join("、") || "—"}</span></p>
                <p className="text-muted">Kun: <span className="font-jp" lang="ja">{kanji.kun.join("、") || "—"}</span></p>
                <p className="text-muted">{kanji.strokes} goresan · {kanji.radical} ({kanji.radicalMeaning})</p>
              </div>
            </div>
            {kanji.examples[0] ? (
              <p className="mt-2 border-t border-line pt-2 text-xs text-muted">
                <span className="font-jp text-sm font-semibold text-ink" lang="ja">{kanji.examples[0].word}</span>
                <span className="font-jp" lang="ja"> ({kanji.examples[0].reading})</span> · {kanji.examples[0].meaning}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function CalloutBlock({ block }: { block: Extract<LessonBlock, { type: "callout" }> }) {
  const tone = TONE_STYLES[block.tone];
  return (
    <section className={cn("rounded-2xl border p-4", tone.wrap)}>
      <p className={cn("flex items-center gap-2 text-sm font-bold", tone.title)}>
        <Icon name={tone.icon} size={16} /> {block.title}
      </p>
      <div className="mt-2 space-y-2">
        {block.paragraphs.map((paragraph, index) => (
          <p key={index} className="text-sm leading-6 text-ink/85">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

function StepsBlock({ block }: { block: Extract<LessonBlock, { type: "steps" }> }) {
  return (
    <section>
      {block.heading ? <BlockHeading>{block.heading}</BlockHeading> : null}
      <ol className="space-y-2.5">
        {block.items.map((item, index) => (
          <li key={item.title + index} className="flex gap-3 rounded-2xl border border-line bg-surface-2/35 p-3.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-strong dark:bg-brand/15 dark:text-brand">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-bold">{item.title}</p>
              <p className="mt-0.5 text-sm leading-6 text-muted">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  const { snapshot } = useProgress();
  const showRomaji = snapshot.profile.settings.showRomaji;
  return (
    <div className="space-y-7">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "prose":
            return <ProseBlock key={index} block={block} />;
          case "jp-prose":
            return <JpProseBlock key={index} block={block} />;
          case "dialog":
            return <DialogBlock key={index} block={block} />;
          case "table":
            return <TableBlock key={index} block={block} />;
          case "grid":
            return <GridBlock key={index} block={block} />;
          case "kana-grid":
            return <KanaGridBlock key={index} block={block} />;
          case "vocab-list":
            return <VocabListBlock key={index} block={block} showRomaji={showRomaji} />;
          case "kanji-list":
            return <KanjiListBlock key={index} block={block} />;
          case "callout":
            return <CalloutBlock key={index} block={block} />;
          case "steps":
            return <StepsBlock key={index} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
