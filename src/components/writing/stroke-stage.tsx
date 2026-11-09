import type { WritingGlyphData } from "@/lib/types";
import { WRITING_VIEWBOX, combinedWidth } from "@/lib/writing-geometry";
import { cn } from "@/lib/utils";

interface StrokeStageProps {
  glyphs: WritingGlyphData[];
  activeStroke?: number;
  doneStrokes?: number;
  animateActive?: boolean;
  showNumbers?: boolean;
  showGrid?: boolean;
  className?: string;
  label?: string;
}

export function StrokeStage({
  glyphs,
  activeStroke,
  doneStrokes = 0,
  animateActive = false,
  showNumbers = true,
  showGrid = true,
  className,
  label = "Diagram urutan goresan",
}: StrokeStageProps) {
  const width = combinedWidth(glyphs.length);
  const glyphOffsets = glyphs.reduce<number[]>((offsets, glyph, index) => {
    offsets.push(index === 0 ? 0 : offsets[index - 1] + glyphs[index - 1].strokes.length);
    return offsets;
  }, []);

  return (
    <svg
      viewBox={`0 0 ${width} ${WRITING_VIEWBOX}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={label}
    >
      {glyphs.map((glyph, glyphIndex) => {
        const offset = glyphIndex * WRITING_VIEWBOX;
        return (
          <g key={glyph.character + glyphIndex} transform={`translate(${offset} 0)`}>
            {showGrid ? (
              <g aria-hidden="true">
                <rect x="0" y="0" width={WRITING_VIEWBOX} height={WRITING_VIEWBOX} fill="none" className="writing-grid-line" />
                <line x1={WRITING_VIEWBOX / 2} y1="0" x2={WRITING_VIEWBOX / 2} y2={WRITING_VIEWBOX} className="writing-grid-line" />
                <line x1="0" y1={WRITING_VIEWBOX / 2} x2={WRITING_VIEWBOX} y2={WRITING_VIEWBOX / 2} className="writing-grid-line" />
                <line x1="0" y1="0" x2={WRITING_VIEWBOX} y2={WRITING_VIEWBOX} className="writing-grid-line opacity-40" />
                <line x1={WRITING_VIEWBOX} y1="0" x2="0" y2={WRITING_VIEWBOX} className="writing-grid-line opacity-40" />
              </g>
            ) : null}
            {glyph.strokes.map((stroke, strokeIndex) => {
              const index = glyphOffsets[glyphIndex] + strokeIndex;
              let className = "writing-reference-stroke";
              if (activeStroke !== undefined) {
                if (index < doneStrokes) className = "writing-done-stroke";
                else if (index === activeStroke) {
                  className = cn("writing-active-stroke", animateActive && "writing-stroke-animated");
                } else className = "writing-guide-stroke";
              }
              return (
                <path
                  key={stroke.number}
                  d={stroke.d}
                  pathLength={1}
                  className={className}
                  aria-hidden="true"
                />
              );
            })}
            {showNumbers
              ? glyph.numbers.map((number) => {
                  const index = glyphOffsets[glyphIndex] + Number(number.number) - 1;
                  return (
                    <text
                      key={"n" + number.number}
                      x={number.x}
                      y={number.y}
                      textAnchor="middle"
                      className={cn(
                        "writing-stroke-number",
                        activeStroke === index && "writing-stroke-number-active",
                      )}
                      aria-hidden="true"
                    >
                      {number.number}
                    </text>
                  );
                })
              : null}
          </g>
        );
      })}
    </svg>
  );
}
