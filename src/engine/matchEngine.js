/**
 * Kayfabe Engine – Match Engine (headless)
 * Deterministic match resolution: RP score 60%, stats 20%, momentum 10%, RNG 10%.
 * Phase 1.0 will implement full logic; this is a stub.
 */

import { createRng } from '../utils/rng';

/**
 * Simulate a singles match. Returns { winnerId, loserId, method, rating, duration }.
 * @param {Object} params
 * @param {Array<{id, ovr, momentum, rpScore}>} params.participants
 * @param {number} [params.seed] - Optional seed for deterministic result
 */
export function simulateSinglesMatch({ participants, seed } = {}) {
  if (!participants || participants.length < 2) {
    return { winnerId: null, loserId: null, method: 'pinfall', rating: 0, duration: 0 };
  }
  const random = seed != null ? createRng(seed) : Math.random;
  const [a, b] = participants;
  const scoreA = (a.rpScore ?? 5) * 0.6 + (a.ovr ?? 50) * 0.002 + (a.momentum ?? 50) * 0.001 + random() * 0.1;
  const scoreB = (b.rpScore ?? 5) * 0.6 + (b.ovr ?? 50) * 0.002 + (b.momentum ?? 50) * 0.001 + random() * 0.1;
  const winner = scoreA >= scoreB ? a : b;
  const loser = scoreA >= scoreB ? b : a;
  return {
    winnerId: winner.id,
    loserId: loser.id,
    method: 'pinfall',
    rating: Math.min(5, 2 + (winner.rpScore ?? 5) / 2.5),
    duration: 8 + Math.floor(random() * 12),
  };
}
