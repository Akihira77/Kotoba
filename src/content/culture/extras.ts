import type { CultureArticle } from "@/lib/types";
import { BUDAYA_EXTRA } from "./extra-budaya";
import { MAKANAN_EXTRA } from "./extra-makanan";
import { GEOGRAFI_EXTRA } from "./extra-geografi";
import { SEJARAH_EXTRA } from "./extra-sejarah";
import { ANIME_EXTRA } from "./extra-anime";
import { BAHASA_EXTRA } from "./extra-bahasa";

/** 19 artikel tambahan untuk kelompok penemuan Phase 9. */
export const EXTRA_CULTURE: CultureArticle[] = [
  ...BUDAYA_EXTRA,
  ...MAKANAN_EXTRA,
  ...GEOGRAFI_EXTRA,
  ...SEJARAH_EXTRA,
  ...ANIME_EXTRA,
  ...BAHASA_EXTRA,
];
