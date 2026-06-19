import { SpeechResult, WordScore } from "./types";

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9' ]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * v1 scoring (matches the design prototype): sequentially match each target
 * word against the recognized word stream; unmatched target words are
 * flagged "missing". Swap for phoneme-level GOP scoring later (see
 * IMPLEMENTATION.md §3) without changing this return shape.
 */
export function scoreSpeech(target: string, recognized: string): SpeechResult {
  const targetWords = normalize(target);
  const heardWords = normalize(recognized);

  const words: WordScore[] = [];
  const missing: string[] = [];
  let heardIndex = 0;
  let matched = 0;

  for (const word of targetWords) {
    const foundAt = heardWords.indexOf(word, heardIndex);
    if (foundAt !== -1) {
      words.push({ word, ok: true });
      matched += 1;
      heardIndex = foundAt + 1;
    } else {
      words.push({ word, ok: false });
      missing.push(word);
    }
  }

  const score = targetWords.length
    ? Math.round((matched / targetWords.length) * 100)
    : 0;

  const note =
    score >= 90 ? "Perfect! 🌟" : score >= 70 ? "Great job! 🎉" : "Keep practicing! 💪";

  return { score, words, note, missing, recognized };
}
