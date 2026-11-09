"use client";

import { useState } from "react";

import { JpText } from "@/components/japanese";
import type {
  Story,
  StoryBackground,
  StoryCharacter,
  StoryExpression,
  StoryLine,
  StoryScene,
  StoryStageCharacter,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const POSITION_CLASS: Record<StoryStageCharacter["position"], string> = {
  "far-left": "left-[9%]",
  left: "left-[27%]",
  center: "left-1/2",
  right: "left-[73%]",
  "far-right": "left-[91%]",
};

const ENTER_CLASS: Record<NonNullable<StoryStageCharacter["enter"]>, string> = {
  fade: "story-enter-fade",
  "slide-left": "story-enter-left",
  "slide-right": "story-enter-right",
};

function SceneBackground({ kind }: { kind: StoryBackground }) {
  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <rect width="800" height="450" fill="#eadfce" />
      {kind === "station" ? (
        <>
          <rect width="800" height="300" fill="#d8e3e9" />
          <rect y="300" width="800" height="150" fill="#c9c0af" />
          <path d="M0 300h800v14H0z" fill="#a9a294" />
          <g fill="#b3bec4">
            <rect x="30" y="90" width="120" height="210" />
            <rect x="590" y="70" width="130" height="230" />
            <rect x="690" y="140" width="80" height="160" />
          </g>
          <g fill="#e7edf0" opacity="0.75">
            <rect x="48" y="112" width="34" height="44" />
            <rect x="96" y="112" width="34" height="44" />
            <rect x="48" y="176" width="34" height="44" />
            <rect x="610" y="96" width="38" height="46" />
            <rect x="662" y="96" width="38" height="46" />
          </g>
          <path d="M170 120h470v38H170z" fill="#9d5b4b" />
          <path d="M150 158h510l-26 22H176z" fill="#7f473b" />
          <rect x="335" y="104" width="126" height="46" rx="6" fill="#f8f3e9" />
          <text x="398" y="138" textAnchor="middle" fontSize="30" fill="#3f3a33" lang="ja">駅</text>
          <rect x="210" y="180" width="18" height="120" fill="#7d6a58" />
          <rect x="575" y="180" width="18" height="120" fill="#7d6a58" />
          <rect x="0" y="380" width="800" height="12" fill="#d8b53c" />
          <path d="M0 392h800" stroke="#efe6d2" strokeWidth="5" />
        </>
      ) : null}
      {kind === "platform" ? (
        <>
          <rect width="800" height="330" fill="#d9e4ea" />
          <rect y="330" width="800" height="120" fill="#c8bfae" />
          <path d="M80 70h650l40 52H40z" fill="#7e4a3e" />
          <path d="M46 122h710v16H46z" fill="#613a31" />
          <g fill="#8a7560">
            <rect x="128" y="138" width="16" height="192" />
            <rect x="430" y="138" width="16" height="192" />
            <rect x="700" y="138" width="16" height="192" />
          </g>
          <rect y="360" width="800" height="10" fill="#d8b53c" />
          <rect y="386" width="800" height="64" fill="#a7a294" />
          <path d="M0 400h800" stroke="#e8dfcf" strokeWidth="4" />
          <rect x="-20" y="210" width="250" height="160" rx="10" fill="#b9c6cb" />
          <rect x="30" y="240" width="66" height="54" rx="4" fill="#8ba3ad" />
          <rect x="110" y="240" width="66" height="54" rx="4" fill="#8ba3ad" />
          <rect x="30" y="314" width="66" height="54" rx="4" fill="#8ba3ad" />
          <rect x="110" y="314" width="66" height="54" rx="4" fill="#8ba3ad" />
          <circle cx="260" cy="392" r="8" fill="#5b5a55" />
          <circle cx="320" cy="392" r="8" fill="#5b5a55" />
        </>
      ) : null}
      {kind === "train" ? (
        <>
          <rect width="800" height="450" fill="#efe3d2" />
          <rect y="300" width="800" height="150" fill="#cbb89f" />
          <rect x="55" y="65" width="300" height="170" rx="14" fill="#b8d3de" />
          <rect x="445" y="65" width="300" height="170" rx="14" fill="#b8d3de" />
          <g fill="#7f9a70" opacity="0.85">
            <rect x="55" y="190" width="300" height="45" />
            <rect x="445" y="190" width="300" height="45" />
          </g>
          <g fill="#9db7c1" opacity="0.8">
            <rect x="120" y="90" width="55" height="80" />
            <rect x="220" y="90" width="55" height="80" />
            <rect x="510" y="90" width="55" height="80" />
            <rect x="610" y="90" width="55" height="80" />
          </g>
          <rect x="35" y="270" width="730" height="16" rx="6" fill="#b3a28c" />
          <rect x="80" y="318" width="270" height="58" rx="12" fill="#6f8f78" />
          <rect x="450" y="318" width="270" height="58" rx="12" fill="#6f8f78" />
          <g stroke="#77644f" strokeWidth="5" fill="none">
            <path d="M60 65v-30M745 65v-30" />
            <path d="M60 35h120M620 35h125" />
          </g>
          <g fill="none" stroke="#77644f" strokeWidth="4">
            <path d="M150 35v36M300 35v36M500 35v36M650 35v36" />
          </g>
          <circle cx="130" cy="84" r="8" fill="#c9a24c" />
          <circle cx="520" cy="84" r="8" fill="#c9a24c" />
        </>
      ) : null}
      {kind === "cafe" ? (
        <>
          <rect width="800" height="450" fill="#eee0cf" />
          <rect y="320" width="800" height="130" fill="#c4a281" />
          <rect x="55" y="60" width="260" height="190" rx="12" fill="#bfd6d3" />
          <path d="M55 60h260v190H55z" fill="none" stroke="#9a7557" strokeWidth="12" />
          <path d="M185 60v190M55 155h260" stroke="#9a7557" strokeWidth="7" />
          <rect x="520" y="70" width="220" height="210" rx="10" fill="#c9ab84" />
          <g fill="#a9825e">
            <rect x="540" y="88" width="180" height="6" />
            <rect x="540" y="120" width="180" height="6" />
            <rect x="540" y="152" width="180" height="6" />
          </g>
          <g fill="#f6e8cf">
            <rect x="552" y="98" width="24" height="18" rx="3" />
            <rect x="586" y="98" width="24" height="18" rx="3" />
            <rect x="620" y="98" width="24" height="18" rx="3" />
            <rect x="654" y="98" width="24" height="18" rx="3" />
          </g>
          <g stroke="#6f5a45" strokeWidth="4" fill="#f4dfb6">
            <path d="M250 0v72" />
            <path d="M610 0v48" />
          </g>
          <circle cx="250" cy="78" r="27" fill="#f0cf8f" />
          <circle cx="610" cy="56" r="22" fill="#f0cf8f" />
          <g fill="#8b6349">
            <rect x="70" y="330" width="230" height="18" rx="8" />
            <rect x="92" y="348" width="14" height="68" />
            <rect x="262" y="348" width="14" height="68" />
          </g>
          <g fill="#f5ead9">
            <ellipse cx="450" cy="350" rx="70" ry="14" />
            <rect x="392" y="322" width="116" height="30" rx="10" />
          </g>
        </>
      ) : null}
      {kind === "table" ? (
        <>
          <rect width="800" height="450" fill="#ecdfcd" />
          <rect y="280" width="800" height="170" fill="#b9845e" />
          <path d="M0 300h800" stroke="#a37352" strokeWidth="10" />
          <ellipse cx="420" cy="380" rx="285" ry="52" fill="#a87250" />
          <ellipse cx="420" cy="372" rx="250" ry="42" fill="#c79a75" />
          <g>
            <ellipse cx="380" cy="345" rx="48" ry="16" fill="#f2e5d2" />
            <path d="M350 330h60v24a30 18 0 0 1-60 0z" fill="#f8f1e4" />
            <path d="M406 334h16a11 11 0 0 1 0 22h-16" fill="none" stroke="#cbb79c" strokeWidth="5" />
            <ellipse cx="380" cy="333" rx="27" ry="7" fill="#7c4b2f" />
            <path d="M362 300c0-12 10-16 10-27M380 298c0-12 10-15 10-26M397 301c0-12 9-16 9-25" stroke="#d4c0a4" strokeWidth="4" fill="none" opacity="0.8" />
          </g>
          <g>
            <ellipse cx="565" cy="352" rx="48" ry="14" fill="#f4e8d4" />
            <path d="M522 338h86l-9 22h-68z" fill="#f9f2e6" />
            <path d="M545 326l16-16 16 16z" fill="#d98d7d" />
          </g>
        </>
      ) : null}
      {kind === "park-rain" ? (
        <>
          <rect width="800" height="300" fill="#9fabb4" />
          <rect y="300" width="800" height="150" fill="#7d8a72" />
          <path d="M0 302h800v18H0z" fill="#a3ad96" />
          <g fill="#5c7056">
            <circle cx="120" cy="170" r="88" />
            <circle cx="205" cy="195" r="66" />
            <circle cx="665" cy="160" r="94" />
            <circle cx="580" cy="196" r="64" />
            <rect x="112" y="240" width="18" height="100" fill="#66503f" />
            <rect x="660" y="235" width="20" height="105" fill="#66503f" />
          </g>
          <path d="M300 450c30-70 80-100 160-100s120 30 150 100z" fill="#a99d84" />
          <g fill="#6f5a45">
            <rect x="360" y="330" width="180" height="12" rx="6" />
            <rect x="374" y="342" width="12" height="38" />
            <rect x="512" y="342" width="12" height="38" />
          </g>
          <g stroke="#d3d9dc" strokeWidth="3" opacity="0.75">
            <path d="M100 40l-18 46M230 20l-20 50M360 50l-18 44M500 30l-20 48M640 45l-18 46M760 20l-20 50" />
          </g>
        </>
      ) : null}
      {kind === "library" ? (
        <>
          <rect width="800" height="450" fill="#e9dfce" />
          <rect y="330" width="800" height="120" fill="#b99a78" />
          <rect x="50" y="55" width="285" height="260" fill="#a7805d" />
          <rect x="465" y="55" width="285" height="260" fill="#a7805d" />
          <g>
            {Array.from({ length: 5 }).map((_, row) => (
              <g key={row}>
                <rect x="65" y={76 + row * 47} width="255" height="8" fill="#8a6547" />
                <rect x="480" y={76 + row * 47} width="255" height="8" fill="#8a6547" />
              </g>
            ))}
            {Array.from({ length: 18 }).map((_, index) => (
              <rect
                key={index}
                x={75 + (index % 9) * 27}
                y={40 + Math.floor(index / 9) * 47 + ((index * 7) % 12)}
                width="16"
                height="36"
                rx="2"
                fill={["#8f5a4a", "#6f8261", "#6c7f97", "#b18b4e"][index % 4]}
              />
            ))}
            {Array.from({ length: 18 }).map((_, index) => (
              <rect
                key={"r" + index}
                x={490 + (index % 9) * 27}
                y={40 + Math.floor(index / 9) * 47 + ((index * 5) % 12)}
                width="16"
                height="36"
                rx="2"
                fill={["#8f5a4a", "#6f8261", "#6c7f97", "#b18b4e"][(index + 2) % 4]}
              />
            ))}
          </g>
          <rect x="365" y="80" width="70" height="150" rx="6" fill="#cfdde0" />
          <path d="M400 80v150M365 150h70" stroke="#a7805d" strokeWidth="7" />
          <rect x="250" y="356" width="300" height="16" rx="6" fill="#8a6547" />
          <rect x="272" y="372" width="16" height="60" fill="#8a6547" />
          <rect x="512" y="372" width="16" height="60" fill="#8a6547" />
        </>
      ) : null}
      {kind === "street" ? (
        <>
          <rect width="800" height="320" fill="#c9d9e4" />
          <rect y="320" width="800" height="130" fill="#a7a294" />
          <g fill="#b0aaa0">
            <rect x="20" y="95" width="150" height="225" />
            <rect x="190" y="55" width="120" height="265" />
            <rect x="520" y="80" width="130" height="240" />
            <rect x="670" y="120" width="110" height="200" />
          </g>
          <g fill="#e6edf0" opacity="0.8">
            <rect x="42" y="120" width="30" height="38" />
            <rect x="90" y="120" width="30" height="38" />
            <rect x="42" y="180" width="30" height="38" />
            <rect x="210" y="82" width="30" height="38" />
            <rect x="258" y="82" width="30" height="38" />
            <rect x="210" y="142" width="30" height="38" />
            <rect x="548" y="106" width="30" height="38" />
            <rect x="596" y="106" width="30" height="38" />
          </g>
          <rect y="350" width="800" height="8" fill="#d8b53c" />
          <path d="M0 395h800" stroke="#efe6d2" strokeWidth="6" />
          <path d="M400 320v-170" stroke="#6e6255" strokeWidth="9" />
          <path d="M360 150h80l-12 24h-56z" fill="#6e6255" />
          <circle cx="400" cy="150" r="13" fill="#f0d38b" />
        </>
      ) : null}
    </svg>
  );
}

function CharacterFigure({
  character,
  expression,
  active,
  facing,
}: {
  character: StoryCharacter;
  expression: StoryExpression;
  active: boolean;
  facing: "left" | "right";
}) {
  const eyes = () => {
    if (expression === "happy") {
      return (
        <>
          <path d="M36 58q6-6 12 0" stroke="#3a2e28" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M62 58q6-6 12 0" stroke="#3a2e28" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
    }
    if (expression === "surprised") {
      return (
        <>
          <circle cx="43" cy="58" r="4.5" fill="#3a2e28" />
          <circle cx="67" cy="58" r="4.5" fill="#3a2e28" />
        </>
      );
    }
    if (expression === "worried" || expression === "thinking") {
      return (
        <>
          <path d="M36 53l12 3" stroke="#3a2e28" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M74 53l-12 3" stroke="#3a2e28" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="43" cy="60" r="3.4" fill="#3a2e28" />
          <circle cx="67" cy="60" r="3.4" fill="#3a2e28" />
        </>
      );
    }
    return (
      <>
        <circle cx="43" cy="58" r="3.6" fill="#3a2e28" />
        <circle cx="67" cy="58" r="3.6" fill="#3a2e28" />
      </>
    );
  };

  return (
    <svg viewBox="0 0 110 160" className="h-full w-full overflow-visible" aria-hidden="true">
      <ellipse cx="55" cy="154" rx="30" ry="5" fill="#3a2e28" opacity="0.15" />
      <path d="M27 78q28-12 56 0l8 68H19z" fill={character.accent} />
      <path d="M42 76h26v16H42z" fill={character.tone} />
      <path d="M25 88q-10 22-4 46" stroke={character.tone} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M85 88q10 22 4 46" stroke={character.tone} strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx="55" cy="52" r="28" fill={character.tone} />
      <path
        d="M29 50c0-24 11-34 26-34s26 10 26 34c-7-11-16-15-26-15S36 39 29 50z"
        fill={character.hair}
      />
      <path d="M30 45c8-8 16-11 25-11s17 3 25 11" stroke={character.hair} strokeWidth="5" fill="none" strokeLinecap="round" />
      <g transform={facing === "left" ? "translate(110 0) scale(-1 1)" : undefined}>
        {eyes()}
        {expression === "surprised" ? (
          <ellipse cx="55" cy="74" rx="5" ry="6" fill="#8d4f4a" />
        ) : expression === "happy" ? (
          <path d="M48 72q7 7 14 0" stroke="#8d4f4a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        ) : expression === "worried" ? (
          <path d="M49 76q6-5 12 0" stroke="#8d4f4a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M49 73h12" stroke="#8d4f4a" strokeWidth="2.6" strokeLinecap="round" />
        )}
      </g>
      <path d="M39 111q16 10 32 0v20H39z" fill="#f6efe3" opacity="0.35" />
      {active ? <path d="M18 72v78M92 72v78" stroke="#f0c774" strokeWidth="2" strokeDasharray="4 5" opacity="0.75" /> : null}
    </svg>
  );
}

export interface StoryStageProps {
  story: Story;
  scene: StoryScene;
  line: StoryLine;
  sceneIndex: number;
  showSubtitles: boolean;
  showFurigana: boolean;
  showRomaji: boolean;
  showTranslation: boolean;
  japaneseOnly: boolean;
  className?: string;
}

export function StoryStage({
  story,
  scene,
  line,
  sceneIndex,
  showSubtitles,
  showFurigana,
  showRomaji,
  showTranslation,
  japaneseOnly,
  className,
}: StoryStageProps) {
  const [failedVideo, setFailedVideo] = useState<string | null>(null);
  const speaker = story.characters.find((character) => character.id === line.speakerId);
  const characters = new Map(story.characters.map((character) => [character.id, character]));
  const showVideo = Boolean(scene.videoUrl) && failedVideo !== scene.videoUrl;
  const subtitleVisible = showSubtitles || japaneseOnly;
  const translationVisible = showTranslation && !japaneseOnly;
  const romajiVisible = showRomaji && !japaneseOnly;

  return (
    <div
      className={cn(
        "story-stage relative isolate aspect-[4/3] w-full overflow-hidden rounded-3xl border border-line bg-surface shadow-soft sm:aspect-[16/9]",
        className,
      )}
      role="group"
      aria-label={`Adegan ${sceneIndex + 1}: ${scene.title}`}
    >
      {showVideo ? (
        <video
          key={scene.videoUrl}
          src={scene.videoUrl}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          onError={() => setFailedVideo(scene.videoUrl ?? null)}
        />
      ) : (
        <SceneBackground kind={scene.background} />
      )}
      {scene.effect ? (
        <div className={cn("story-effect pointer-events-none absolute inset-0", scene.effect === "rain" && "story-rain", scene.effect === "snow" && "story-snow")} aria-hidden="true">
          {scene.effect === "rain"
            ? Array.from({ length: 22 }).map((_, index) => (
                <span
                  key={index}
                  className="story-rain-drop"
                  style={{ left: `${(index * 47) % 100}%`, animationDelay: `${(index % 7) * 0.18}s`, animationDuration: `${0.9 + (index % 4) * 0.14}s` }}
                />
              ))
            : null}
          {scene.effect === "snow"
            ? Array.from({ length: 18 }).map((_, index) => (
                <span
                  key={index}
                  className="story-snow-flake"
                  style={{ left: `${(index * 59) % 100}%`, animationDelay: `${(index % 6) * 0.4}s` }}
                />
              ))
            : null}
        </div>
      ) : null}

      <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2 sm:left-4 sm:top-4">
        <span className="rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          Adegan {sceneIndex + 1}/{story.scenes.length}
        </span>
        <span className="max-w-full truncate rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-[#3f3a33] shadow-sm backdrop-blur-sm">
          {scene.title}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[86%]">
        {showVideo ? null : scene.characters.map((staged) => {
          const character = characters.get(staged.characterId);
          if (!character) return null;
          const active = line.speakerId === character.id;
          return (
            <div
              key={character.id}
              className={cn(
                "story-character absolute bottom-0 -translate-x-1/2 transition-all duration-500",
                POSITION_CLASS[staged.position],
                staged.enter ? ENTER_CLASS[staged.enter] : "story-enter-fade",
                active ? "z-20 scale-[1.03] opacity-100" : "z-10 opacity-75 saturate-[0.85]",
              )}
              style={{ width: "clamp(88px, 24%, 168px)" }}
            >
              <div className={cn("story-idle h-full w-full", active && "story-idle-active")}>
                <CharacterFigure
                  character={character}
                  expression={active ? line.expression ?? staged.expression ?? "neutral" : staged.expression ?? "neutral"}
                  active={active}
                  facing={staged.facing ?? (staged.position === "left" || staged.position === "far-left" ? "right" : "left")}
                />
              </div>
              {active ? (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-[#3f3a33] shadow-sm">
                  {character.name}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {subtitleVisible ? (
        <div className="absolute inset-x-3 bottom-3 z-30 sm:inset-x-5 sm:bottom-5" aria-live="polite">
          <div className="story-bubble mx-auto max-w-2xl rounded-2xl border border-white/70 bg-[#fffaf0]/95 px-4 py-3 shadow-lg backdrop-blur-sm">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#a14432]">{speaker?.name ?? "Narator"}</span>
              {speaker ? <span lang="ja" className="font-jp text-[10px] text-[#7a6a59]">{speaker.nameJp}</span> : null}
              {romajiVisible ? (
                <span className="ml-auto hidden items-center gap-1 text-[10px] text-[#7a6a59] sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#a14432]" aria-hidden="true" />
                  Suara aktif
                </span>
              ) : null}
            </div>
            <JpText
              text={line.jp}
              as="p"
              showFurigana={showFurigana}
              className="text-[15px] font-semibold leading-relaxed text-[#2d2721] sm:text-lg"
            />
            {romajiVisible ? <p className="mt-1 text-xs italic text-[#7a6a59]">{line.romaji}</p> : null}
            {translationVisible ? <p className="mt-1 text-xs leading-relaxed text-[#5b4d40] sm:text-sm">{line.meaning}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
