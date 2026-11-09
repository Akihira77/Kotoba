import type { ContentKind } from "./types";

/**
 * Menautkan item kurikulum kana/kanji ke detail Studio Menulis.
 *
 * ID katalog menulis memakai awalan "writing-" diikuti ID konten, mis.
 * "hiragana-あ" menjadi "writing-hiragana-あ" dan "kanji-日" menjadi
 * "writing-kanji-日". Path di-encode agar karakter Jepang aman di URL.
 */
export function writingHrefForContentRef(ref: { kind: ContentKind; id: string }): string | null {
  if (ref.kind !== "kana" && ref.kind !== "kanji") return null;
  if (!ref.id || ref.id.startsWith("writing-")) return null;
  return "/writing/" + encodeURIComponent("writing-" + ref.id);
}
