"use client";

import { useCallback, useEffect, useState } from "react";
import type { WritingGlyph, WritingGlyphData } from "@/lib/types";
import { writingGlyphUrl } from "@/lib/writing";

const cache = new Map<string, WritingGlyphData>();

async function loadGlyph(glyph: WritingGlyph): Promise<WritingGlyphData> {
  const cached = cache.get(glyph.file);
  if (cached) return cached;
  const response = await fetch(writingGlyphUrl(glyph.file), { cache: "force-cache" });
  if (!response.ok) throw new Error("Data goresan tidak ditemukan.");
  const data = (await response.json()) as WritingGlyphData;
  if (!Array.isArray(data.strokes) || data.strokes.length === 0) {
    throw new Error("Data goresan kosong.");
  }
  cache.set(glyph.file, data);
  return data;
}

interface GlyphDataState {
  data: WritingGlyphData[] | null;
  error: string | null;
  loading: boolean;
  retry: () => void;
}

export function useGlyphData(glyphs: WritingGlyph[]): GlyphDataState {
  const [data, setData] = useState<WritingGlyphData[] | null>(() => {
    const cached = glyphs.map((item) => cache.get(item.file));
    return cached.every(Boolean) ? (cached as WritingGlyphData[]) : null;
  });
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const key = glyphs.map((item) => item.file).join(",");
  const error = failure?.key === key ? failure.message : null;

  useEffect(() => {
    let cancelled = false;
    Promise.all(glyphs.map(loadGlyph))
      .then((items) => {
        if (!cancelled) setData(items);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setFailure({
            key,
            message: cause instanceof Error ? cause.message : "Data goresan tidak dapat dimuat.",
          });
          setData(null);
        }
      });
    return () => {
      cancelled = true;
    };
    // key merangkum isi glyphs; attempt memaksa percobaan ulang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const retry = useCallback(() => {
    setData(null);
    setFailure(null);
    setAttempt((value) => value + 1);
  }, []);

  return { data, error, loading: !data && !error, retry };
}
