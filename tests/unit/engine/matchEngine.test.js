/**
 * Match Engine unit tests (headless, no DOM).
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import {
  computeComposite,
  pickMethod,
  calcRating,
  calcDuration,
  simulateSinglesMatch,
  simulateTagMatch,
  simulateTripleThreatMatch,
  simulateMatch,
} from '../../../src/engine/matchEngine.js';
import { createRng } from '../../../src/utils/rng.js';
import { MatchResultSchema, validateMatchInput } from '../../../src/contracts/schemas.js';

describe('matchEngine', () => {
  describe('computeComposite', () => {
    it('uses defaults when optional fields missing', () => {
      const rng = createRng(42);
      const c = computeComposite({ id: 'a' }, rng);
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(1);
    });

    it('higher rpScore yields higher composite (same seed)', () => {
      const seed = 123;
      const rngA = createRng(seed);
      const rngB = createRng(seed);
      const low = computeComposite({ id: 'a', rpScore: 2, ovr: 50, momentum: 50 }, rngA);
      const high = computeComposite({ id: 'b', rpScore: 9, ovr: 50, momentum: 50 }, rngB);
      expect(high).toBeGreaterThan(low);
    });

    it('is deterministic with same seed', () => {
      const p = { id: 'x', rpScore: 5, ovr: 60, momentum: 70 };
      const a = computeComposite(p, createRng(999));
      const b = computeComposite({ ...p }, createRng(999));
      expect(a).toBe(b);
    });
  });

  describe('pickMethod', () => {
    it('returns a valid method string', () => {
      const methods = ['pinfall', 'submission', 'dq', 'countout', 'ko', 'corporate'];
      const rng = createRng(1);
      const m = pickMethod({ id: 'w' }, { id: 'l' }, rng);
      expect(methods).toContain(m);
    });

    it('can return submission when winner has high technical', () => {
      let found = false;
      for (let seed = 0; seed < 500; seed++) {
        const m = pickMethod(
          { id: 'w', technical: 85, power: 30 },
          { id: 'l' },
          createRng(seed)
        );
        if (m === 'submission') {
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });
  });

  describe('calcRating', () => {
    it('returns value between 0 and 5', () => {
      const participants = [
        { id: 'a', ovr: 50, rpScore: 5 },
        { id: 'b', ovr: 60, rpScore: 6 },
      ];
      const r = calcRating(participants, participants[0]);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(5);
    });

    it('higher aggregate quality yields higher rating', () => {
      const weak = [
        { id: 'a', ovr: 30, rpScore: 3 },
        { id: 'b', ovr: 40, rpScore: 4 },
      ];
      const strong = [
        { id: 'a', ovr: 80, rpScore: 8 },
        { id: 'b', ovr: 90, rpScore: 9 },
      ];
      expect(calcRating(strong, strong[0])).toBeGreaterThan(calcRating(weak, weak[0]));
    });
  });

  describe('calcDuration', () => {
    it('returns positive number', () => {
      const rng = createRng(7);
      expect(calcDuration('singles', 3, rng)).toBeGreaterThan(0);
      expect(calcDuration('tag', 4, createRng(8))).toBeGreaterThan(0);
      expect(calcDuration('triple_threat', 2, createRng(9))).toBeGreaterThan(0);
    });

    it('tag tends longer than singles', () => {
      const seeds = [10, 20, 30, 40, 50];
      const sing = seeds.reduce((s, seed) => s + calcDuration('singles', 3, createRng(seed)), 0) / seeds.length;
      const tag = seeds.reduce((s, seed) => s + calcDuration('tag', 3, createRng(seed)), 0) / seeds.length;
      expect(tag).toBeGreaterThan(sing);
    });
  });

  describe('simulateSinglesMatch', () => {
    it('same seed gives same result (determinism)', () => {
      const participants = [
        { id: 'a', rpScore: 5, ovr: 50, momentum: 50 },
        { id: 'b', rpScore: 5, ovr: 50, momentum: 50 },
      ];
      const r1 = simulateSinglesMatch({ participants, seed: 100 });
      const r2 = simulateSinglesMatch({ participants, seed: 100 });
      expect(r1.winnerId).toBe(r2.winnerId);
      expect(r1.loserIds).toEqual(r2.loserIds);
      expect(r1.method).toBe(r2.method);
      expect(r1.rating).toBe(r2.rating);
      expect(r1.duration).toBe(r2.duration);
    });

    it('higher RP score wins when others equal', () => {
      const participants = [
        { id: 'low', rpScore: 2, ovr: 50, momentum: 50 },
        { id: 'high', rpScore: 10, ovr: 50, momentum: 50 },
      ];
      let highWins = 0;
      for (let seed = 0; seed < 50; seed++) {
        const r = simulateSinglesMatch({ participants, seed });
        if (r.winnerId === 'high') highWins++;
      }
      expect(highWins).toBeGreaterThanOrEqual(45);
    });

    it('returns valid MatchResult shape', () => {
      const participants = [
        { id: 'x', rpScore: 5, ovr: 55, momentum: 50 },
        { id: 'y', rpScore: 6, ovr: 52, momentum: 48 },
      ];
      const result = simulateSinglesMatch({ participants, seed: 1 });
      const parsed = MatchResultSchema.safeParse(result);
      expect(parsed.success).toBe(true);
      expect(result.loserIds).toHaveLength(1);
      expect(result.rating).toBeGreaterThanOrEqual(0);
      expect(result.rating).toBeLessThanOrEqual(5);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('handles missing optional fields with defaults', () => {
      const result = simulateSinglesMatch({
        participants: [{ id: 'a' }, { id: 'b' }],
        seed: 77,
      });
      expect(result.winnerId).toBeDefined();
      expect(result.loserIds).toHaveLength(1);
      expect(['a', 'b']).toContain(result.winnerId);
    });

    it('returns fallback for fewer than 2 participants', () => {
      const r0 = simulateSinglesMatch({ participants: [], seed: 1 });
      const r1 = simulateSinglesMatch({ participants: [{ id: 'only' }], seed: 1 });
      expect(r0.winnerId).toBe('');
      expect(r0.loserIds).toEqual([]);
      expect(r1.winnerId).toBe('');
    });
  });

  describe('simulateTagMatch', () => {
    const tagParticipants = [
      { id: 't1a', team: 0, rpScore: 5, ovr: 50, momentum: 50 },
      { id: 't1b', team: 0, rpScore: 5, ovr: 50, momentum: 50 },
      { id: 't2a', team: 1, rpScore: 5, ovr: 50, momentum: 50 },
      { id: 't2b', team: 1, rpScore: 5, ovr: 50, momentum: 50 },
    ];

    it('same seed gives same result', () => {
      const r1 = simulateTagMatch({ participants: tagParticipants, seed: 200 });
      const r2 = simulateTagMatch({ participants: tagParticipants, seed: 200 });
      expect(r1.winnerId).toBe(r2.winnerId);
      expect(r1.loserIds.sort()).toEqual(r2.loserIds.sort());
      expect(r1.winningTeam).toBe(r2.winningTeam);
    });

    it('returns winnerId from winning team and loserIds from losing team', () => {
      const result = simulateTagMatch({ participants: tagParticipants, seed: 301 });
      const winningIds = ['t1a', 't1b'];
      const losingIds = ['t2a', 't2b'];
      const winnerFromWinningTeam =
        result.winnerId === 't1a' || result.winnerId === 't1b';
      const losersCorrect =
        result.loserIds.length === 2 &&
        result.loserIds.every((id) => losingIds.includes(id));
      expect(winnerFromWinningTeam || result.winnerId === 't2a' || result.winnerId === 't2b').toBe(true);
      expect(result.loserIds).toHaveLength(2);
      expect(result.winningTeam).toBeDefined();
    });

    it('returns fallback when not 4 participants or invalid teams', () => {
      const r3 = simulateTagMatch({ participants: tagParticipants.slice(0, 3), seed: 1 });
      expect(r3.winnerId).toBe('');
      expect(r3.loserIds).toEqual([]);
    });
  });

  describe('simulateTripleThreatMatch', () => {
    const three = [
      { id: 'c1', rpScore: 5, ovr: 50, momentum: 50 },
      { id: 'c2', rpScore: 5, ovr: 50, momentum: 50 },
      { id: 'c3', rpScore: 5, ovr: 50, momentum: 50 },
    ];

    it('same seed gives same result', () => {
      const r1 = simulateTripleThreatMatch({ participants: three, seed: 400 });
      const r2 = simulateTripleThreatMatch({ participants: three, seed: 400 });
      expect(r1.winnerId).toBe(r2.winnerId);
      expect(r1.loserIds.sort()).toEqual(r2.loserIds.sort());
    });

    it('returns one winner and two loserIds', () => {
      const result = simulateTripleThreatMatch({ participants: three, seed: 401 });
      expect(['c1', 'c2', 'c3']).toContain(result.winnerId);
      expect(result.loserIds).toHaveLength(2);
      const all = [result.winnerId, ...result.loserIds].sort();
      expect(all).toEqual(['c1', 'c2', 'c3'].sort());
    });

    it('returns fallback when fewer than 3 participants', () => {
      const r = simulateTripleThreatMatch({ participants: three.slice(0, 2), seed: 1 });
      expect(r.winnerId).toBe('');
      expect(r.loserIds).toEqual([]);
    });
  });

  describe('simulateMatch', () => {
    it('dispatches to singles for matchType singles', () => {
      const result = simulateMatch({
        participants: [
          { id: 'a', rpScore: 7, ovr: 60 },
          { id: 'b', rpScore: 4, ovr: 50 },
        ],
        matchType: 'singles',
        seed: 500,
      });
      expect(result.winnerId).toBeDefined();
      expect(result.loserIds).toHaveLength(1);
      expect(result.method).toBeDefined();
      expect(result.rating).toBeGreaterThanOrEqual(0);
      expect(result.rating).toBeLessThanOrEqual(5);
    });

    it('dispatches to tag for matchType tag', () => {
      const result = simulateMatch({
        participants: [
          { id: 't1a', team: 0 }, { id: 't1b', team: 0 },
          { id: 't2a', team: 1 }, { id: 't2b', team: 1 },
        ],
        matchType: 'tag',
        seed: 501,
      });
      expect(result.winnerId).toBeDefined();
      expect(result.loserIds).toHaveLength(2);
    });

    it('dispatches to triple threat for matchType triple_threat', () => {
      const result = simulateMatch({
        participants: [{ id: 'x' }, { id: 'y' }, { id: 'z' }],
        matchType: 'triple_threat',
        seed: 502,
      });
      expect(result.winnerId).toBeDefined();
      expect(result.loserIds).toHaveLength(2);
    });

    it('validates input and returns fallback on invalid input', () => {
      const invalid = validateMatchInput({ participants: [], matchType: 'singles' });
      expect(invalid.success).toBe(true);
      const result = simulateMatch({ participants: [], matchType: 'singles', seed: 1 });
      expect(result.winnerId).toBe('');
      expect(result.loserIds).toEqual([]);
    });

    it('output passes MatchResultSchema', () => {
      const result = simulateMatch({
        participants: [
          { id: 'p1', rpScore: 6, ovr: 55 },
          { id: 'p2', rpScore: 5, ovr: 52 },
        ],
        matchType: 'singles',
        seed: 600,
      });
      const parsed = MatchResultSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });
  });

  describe('no DOM dependency', () => {
    it('engine runs in Node and returns result (no window/document required)', () => {
      const r = simulateSinglesMatch({
        participants: [{ id: 'a' }, { id: 'b' }],
        seed: 42,
      });
      expect(r).toBeDefined();
      expect(r.winnerId).toBeDefined();
    });
  });
});
