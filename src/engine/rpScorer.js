/**
 * Kayfabe Engine – RP Scorer (headless)
 * Delegates to AI via aiClient.aiRPScore(); this module normalizes and combines scores.
 * Phase 3 will integrate; this is a stub that returns a default score.
 */

/**
 * Compute final RP score from AI response. Returns 0–10.
 * @param {Object} aiScore - { creativity, storytelling, characterWork, overall }
 * @returns {number}
 */
export function computeFinalRPScore(aiScore) {
  if (!aiScore) return 5;
  const o = Number(aiScore.overall);
  if (Number.isFinite(o)) return Math.max(0, Math.min(10, o));
  const c = Number(aiScore.creativity) ?? 5;
  const s = Number(aiScore.storytelling) ?? 5;
  const ch = Number(aiScore.characterWork) ?? 5;
  return Math.max(0, Math.min(10, (c + s + ch) / 3));
}
