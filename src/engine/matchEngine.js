/**
 * Kayfabe Engine – Match Engine (headless)
 * Deterministic match resolution: RP score 60%, stats 20%, momentum 10%, RNG 10%.
 */

import { createRng } from '../utils/rng';
import { MatchResultSchema, validateMatchInput, validateMatchResult } from '../contracts/schemas';

/**
 * Compute composite score for a participant (0–1 scale).
 * Formula: RP 60%, ovr 20%, momentum 10%, RNG 10%. Defaults: rpScore=5, ovr=50, momentum=50.
 * @param {Object} participant - { id, rpScore?, ovr?, momentum? }
 * @param {() => number} rng - Random in [0, 1)
 * @returns {number}
 */
export function computeComposite(participant, rng) {
  const rp = (Number(participant.rpScore) || 5) / 10;
  const ovr = (Number(participant.ovr) || 50) / 100;
  const mom = (Number(participant.momentum) || 50) / 100;
  return rp * 0.6 + ovr * 0.2 + mom * 0.1 + rng() * 0.1;
}

/**
 * Pick finish method from methodEnum. Biases: high technical → submission, high power → ko; else pinfall-heavy.
 * @param {Object} winner - participant with optional technical, power
 * @param {Object} loser - participant
 * @param {() => number} rng
 * @returns {string}
 */
export function pickMethod(winner, loser, rng) {
  const tech = Number(winner.technical) || 0;
  const power = Number(winner.power) || 0;
  const roll = rng();
  if (tech >= 70 && roll < 0.25) return 'submission';
  if (power >= 70 && roll < 0.2) return 'ko';
  if (roll < 0.05) return 'dq';
  if (roll < 0.1) return 'countout';
  return 'pinfall';
}

/**
 * Match rating 0–5 stars from aggregate participant quality and winner RP.
 * @param {Array<Object>} participants
 * @param {Object} winner
 * @returns {number}
 */
export function calcRating(participants, winner) {
  if (!participants.length) return 0;
  const avgOvr = participants.reduce((s, p) => s + (Number(p.ovr) || 50), 0) / participants.length;
  const avgRp = participants.reduce((s, p) => s + (Number(p.rpScore) || 5), 0) / participants.length;
  const base = (avgOvr / 100) * 2.5 + (avgRp / 10) * 2.5;
  return Math.max(0, Math.min(5, Math.round(base * 10) / 10));
}

/**
 * Match duration in minutes. Tag longer, triple threat mid, singles base. Better rating → slightly longer.
 * @param {string} matchType
 * @param {number} rating
 * @param {() => number} rng
 * @returns {number}
 */
export function calcDuration(matchType, rating, rng) {
  let base = 8 + Math.floor(rng() * 10);
  if (matchType === 'tag') base += 4 + Math.floor(rng() * 6);
  else if (matchType === 'triple_threat' || matchType === 'fatal_four_way') base += 2 + Math.floor(rng() * 4);
  const bonus = rating >= 4 ? 2 : rating >= 3 ? 1 : 0;
  return Math.max(5, base + bonus);
}

/**
 * Simulate a singles match. Returns MatchResult (winnerId, loserIds, method, rating, duration).
 * @param {Object} params
 * @param {Array<{id, ovr?, momentum?, rpScore?, technical?, power?}>} params.participants
 * @param {number} [params.seed]
 */
export function simulateSinglesMatch({ participants, seed } = {}) {
  if (!participants || participants.length < 2) {
    const fallback = { winnerId: '', loserIds: [], method: 'pinfall', rating: 0, duration: 0 };
    const parsed = MatchResultSchema.safeParse(fallback);
    return parsed.success ? parsed.data : fallback;
  }
  const rng = seed != null ? createRng(seed) : () => Math.random();
  const [a, b] = participants.slice(0, 2);
  const scoreA = computeComposite(a, rng);
  const scoreB = computeComposite(b, rng);
  const winner = scoreA >= scoreB ? a : b;
  const loser = scoreA >= scoreB ? b : a;
  const method = pickMethod(winner, loser, rng);
  const rating = calcRating(participants, winner);
  const duration = calcDuration('singles', rating, rng);
  const result = {
    winnerId: winner.id,
    loserIds: [loser.id],
    method,
    rating,
    duration,
  };
  const parsed = MatchResultSchema.safeParse(result);
  return parsed.success ? parsed.data : result;
}

/**
 * Simulate a tag match. Expects 4 participants with team 0 and team 1. Winner = pin-taker (best on winning team).
 * @param {Object} params
 * @param {Array<{id, ovr?, momentum?, rpScore?, team?}>} params.participants
 * @param {number} [params.seed]
 */
export function simulateTagMatch({ participants, seed } = {}) {
  if (!participants || participants.length < 4) {
    const fallback = { winnerId: '', loserIds: [], method: 'pinfall', rating: 0, duration: 0 };
    const parsed = MatchResultSchema.safeParse(fallback);
    return parsed.success ? parsed.data : fallback;
  }
  const rng = seed != null ? createRng(seed) : () => Math.random();
  const team0 = participants.filter((p) => (p.team ?? 0) === 0);
  const team1 = participants.filter((p) => (p.team ?? 1) === 1);
  if (team0.length !== 2 || team1.length !== 2) {
    const fallback = { winnerId: '', loserIds: [], method: 'pinfall', rating: 0, duration: 0 };
    const parsed = MatchResultSchema.safeParse(fallback);
    return parsed.success ? parsed.data : fallback;
  }
  const comp = (p) => ({ p, c: computeComposite(p, rng) });
  const s0 = team0.map(comp);
  const s1 = team1.map(comp);
  const teamScore0 = (s0[0].c + s0[1].c) / 2 + rng() * 0.05;
  const teamScore1 = (s1[0].c + s1[1].c) / 2 + rng() * 0.05;
  const winningTeam = teamScore0 >= teamScore1 ? 0 : 1;
  const winningSide = winningTeam === 0 ? s0 : s1;
  const losingSide = winningTeam === 0 ? s1 : s0;
  const pinTaker = winningSide[0].c >= winningSide[1].c ? winningSide[0].p : winningSide[1].p;
  const loserIds = losingSide.map((x) => x.p.id);
  const method = pickMethod(pinTaker, losingSide[0].p, rng);
  const rating = calcRating(participants, pinTaker);
  const duration = calcDuration('tag', rating, rng);
  const result = {
    winnerId: pinTaker.id,
    loserIds,
    winningTeam,
    method,
    rating,
    duration,
  };
  const parsed = MatchResultSchema.safeParse(result);
  return parsed.success ? parsed.data : result;
}

/**
 * Simulate a triple threat. Winner = highest composite; two losers. Slight RNG chaos factor.
 * @param {Object} params
 * @param {Array<{id, ovr?, momentum?, rpScore?}>} params.participants
 * @param {number} [params.seed]
 */
export function simulateTripleThreatMatch({ participants, seed } = {}) {
  if (!participants || participants.length < 3) {
    const fallback = { winnerId: '', loserIds: [], method: 'pinfall', rating: 0, duration: 0 };
    const parsed = MatchResultSchema.safeParse(fallback);
    return parsed.success ? parsed.data : fallback;
  }
  const rng = seed != null ? createRng(seed) : () => Math.random();
  const withScores = participants.slice(0, 3).map((p) => ({
    p,
    c: computeComposite(p, rng) + rng() * 0.08,
  }));
  withScores.sort((a, b) => b.c - a.c);
  const winner = withScores[0].p;
  const loserIds = [withScores[1].p.id, withScores[2].p.id];
  const method = rng() < 0.85 ? 'pinfall' : rng() < 0.5 ? 'submission' : 'ko';
  const rating = calcRating(participants, winner);
  const duration = calcDuration('triple_threat', rating, rng);
  const result = {
    winnerId: winner.id,
    loserIds,
    method,
    rating,
    duration,
  };
  const parsed = MatchResultSchema.safeParse(result);
  return parsed.success ? parsed.data : result;
}

/**
 * Unified entry point. Dispatches by matchType; validates input and output.
 * @param {Object} params - { participants, matchType, seed? }
 * @returns {Object} MatchResult
 */
export function simulateMatch({ participants = [], matchType, seed } = {}) {
  const inputParse = validateMatchInput({ participants, matchType: matchType || 'singles', seed });
  if (!inputParse.success) {
    const fallback = { winnerId: '', loserIds: [], method: 'pinfall', rating: 0, duration: 0 };
    const parsed = MatchResultSchema.safeParse(fallback);
    return parsed.success ? parsed.data : fallback;
  }
  const { participants: p, matchType: type } = inputParse.data;
  let result;
  if (type === 'tag') {
    result = simulateTagMatch({ participants: p, seed });
  } else if (type === 'triple_threat') {
    result = simulateTripleThreatMatch({ participants: p, seed });
  } else {
    result = simulateSinglesMatch({ participants: p, seed });
  }
  const out = validateMatchResult(result);
  return out.success ? out.data : result;
}
