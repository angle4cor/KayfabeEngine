/**
 * Kayfabe Engine — Seeded PRNG (mulberry32)
 * Used by match engine and world simulator for deterministic simulation when seed is provided.
 * When no seed is passed, callers use Math.random for backward compatibility.
 *
 * @see docs/DECISIONS.md ADR-003
 */

/**
 * Create a seeded random number generator (mulberry32).
 * Returns a function that returns values in [0, 1).
 *
 * @param {number} seed - Integer seed (e.g. from Date.now() or fixed value for tests)
 * @returns {() => number} - Function that returns next random in [0, 1)
 */
export function createRng(seed) {
  let s = seed | 0;
  return function random() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
