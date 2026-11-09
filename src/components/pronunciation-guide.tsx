import { SpeakButton } from "@/components/japanese";
import { Badge, Card } from "@/components/ui";
import { PRONUNCIATION_GUIDE, type PronunciationGuideExample } from "@/content/pronunciation-guide";

function ExampleRow({ example }: { example: PronunciationGuideExample }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3">
      <div className="min-w-0">
        <p className="font-jp text-lg leading-snug text-ink">{example.jp}</p>
        <p className="mt-0.5 text-xs text-muted">
          {example.reading} · {example.romaji}
        </p>
        <p className="mt-1 text-sm text-ink">{example.meaning}</p>
        {example.note && <p className="mt-1 text-xs leading-relaxed text-muted">{example.note}</p>}
      </div>
      <SpeakButton text={example.reading} label={"Putar " + example.romaji} size={15} />
    </div>
  );
}

export function PronunciationGuide() {
  return (
    <section aria-labelledby="panduan-pelafalan" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Dasar bunyi</p>
          <h2 id="panduan-pelafalan" className="mt-1 text-2xl font-semibold text-ink">
            Panduan pelafalan Jepang
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">
            Enam topik singkat untuk membangun kesadaran bunyi sebelum berlatih. Dengarkan contoh, tiru iramanya,
            lalu gunakan rekaman dan pengenalan suara sebagai alat bantu — bukan penilaian akustik.
          </p>
        </div>
        <Badge tone="muted">6 topik</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {PRONUNCIATION_GUIDE.map((topic, index) => (
          <Card key={topic.id} className="overflow-hidden p-0">
            <details open={index === 0} className="group">
              <summary className="flex cursor-pointer list-none items-start gap-3 px-5 py-4 transition-colors hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-sm font-semibold text-brand-strong">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-lg font-semibold text-ink">{topic.title}</span>
                    <span className="font-jp text-sm text-muted">{topic.titleJp}</span>
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{topic.intro}</span>
                </span>
                <span
                  aria-hidden
                  className="mt-1 shrink-0 text-muted transition-transform group-open:rotate-180"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </summary>

              <div className="space-y-4 border-t border-line px-5 py-4">
                <ul className="space-y-2 text-sm leading-relaxed text-ink">
                  {topic.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="grid gap-2 sm:grid-cols-2">
                  {topic.examples.map((example, exampleIndex) => (
                    <ExampleRow key={topic.id + "-" + exampleIndex} example={example} />
                  ))}
                </div>

                {topic.contrast && (
                  <div className="rounded-2xl border border-line bg-surface-2 p-3.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Bandingkan</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <ExampleRow example={topic.contrast.a} />
                      <ExampleRow example={topic.contrast.b} />
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted">{topic.contrast.note}</p>
                  </div>
                )}

                <p className="rounded-2xl bg-gold-soft px-3.5 py-3 text-sm leading-relaxed text-ink">
                  <span className="font-semibold">Latihan: </span>
                  {topic.tip}
                </p>
              </div>
            </details>
          </Card>
        ))}
      </div>
    </section>
  );
}
