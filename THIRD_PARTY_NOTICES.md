# Third-party notices

Kotoba includes derived stroke-order data from **KanjiVG**.

## KanjiVG

- Project: KanjiVG (Kanji Vector Graphics)
- Source: https://github.com/KanjiVG/kanjivg
- Pinned commit: `610091ce618cf757ed1357a8954cd65283e015d6`
- Copyright: Ulrich Apel and KanjiVG contributors
- License: Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)
- License text: `public/licenses/kanjivg-CC-BY-SA-3.0.txt`
- Attribution page: https://kanjivg.tagaini.net/

Kotoba extracts stroke paths, stroke order, stroke-number positions, and sampled start/end geometry from KanjiVG SVG files into compact JSON under `public/writing/kanjivg/`. The derived data remains available under CC BY-SA 3.0. Kotoba does not claim ownership of the stroke data. The application code itself is not a KanjiVG derivative.

The importer is `scripts/import-kanjivg.mjs`. It verifies that every kanji catalog stroke count matches the KanjiVG stroke count before writing a file, and fails when a glyph is missing. Kana are drawn from their verified KanjiVG glyphs; yōon such as きゃ are presented as two sequential component glyphs rather than a fabricated single character.
