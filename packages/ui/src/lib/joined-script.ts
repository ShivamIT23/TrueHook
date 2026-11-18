/**
 * Detects scripts where characters join cursively (e.g., Arabic, Syriac, Thaana, Mongolian).
 * Breaking text into individual graphemes in these scripts disrupts glyph shaping/ligatures,
 * so text is revealed word-by-word instead of grapheme-by-grapheme.
 */
const JOINING_SCRIPTS =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0700-\u074F\u1800-\u18AF]/;

export function joinsLetters(text: string): boolean {
  return JOINING_SCRIPTS.test(text);
}
