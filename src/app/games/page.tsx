import type { Metadata } from "next";
import { GamesHub } from "@/components/games/games-hub";
import { isGameId } from "@/lib/games/registry";

export const metadata: Metadata = {
  title: "Permainan",
  description: "Enam permainan belajar bahasa Jepang: pembuat kata, kana, kosakata, kalimat, kanji, dan tantangan harian.",
};

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.game) ? params.game[0] : params.game;
  return <GamesHub initialGame={raw && isGameId(raw) ? raw : null} />;
}
