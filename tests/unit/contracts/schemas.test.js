/**
 * Schema validation unit tests.
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import {
  WrestlerSchema,
  FederationSchema,
  MatchSchema,
  MatchResultSchema,
  MatchInputSchema,
  WorldSchema,
  validateWrestler,
  validateFederation,
  validateMatch,
  validateMatchResult,
  validateMatchInput,
  validateWorld,
} from '../../../src/contracts/schemas.js';

describe('schemas', () => {
  describe('WrestlerSchema', () => {
    const validWrestler = {
      id: 'w1',
      worldId: 'world1',
      federationId: 'fed1',
      controlledBy: 'ai',
      ringName: 'Test Wrestler',
    };

    it('accepts valid wrestler', () => {
      const result = WrestlerSchema.safeParse(validWrestler);
      expect(result.success).toBe(true);
    });

    it('rejects missing required id', () => {
      const { id, ...rest } = validWrestler;
      expect(WrestlerSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects empty ringName', () => {
      expect(WrestlerSchema.safeParse({ ...validWrestler, ringName: '' }).success).toBe(false);
    });

    it('rejects ovr out of range', () => {
      expect(WrestlerSchema.safeParse({ ...validWrestler, ovr: 101 }).success).toBe(false);
      expect(WrestlerSchema.safeParse({ ...validWrestler, ovr: -1 }).success).toBe(false);
    });

    it('round-trip with defaults', () => {
      const parsed = WrestlerSchema.safeParse(validWrestler);
      expect(parsed.success).toBe(true);
      const data = parsed.data;
      expect(data.alignment).toBe('tweener');
      expect(data.popularity).toBe(50);
      expect(data.momentum).toBe(50);
    });
  });

  describe('FederationSchema', () => {
    const validFed = {
      id: 'fed1',
      worldId: 'world1',
      name: 'Test Fed',
      owner: 'ai',
    };

    it('accepts valid federation', () => {
      expect(FederationSchema.safeParse(validFed).success).toBe(true);
    });

    it('rejects empty name', () => {
      expect(FederationSchema.safeParse({ ...validFed, name: '' }).success).toBe(false);
    });
  });

  describe('MatchSchema', () => {
    const validMatch = {
      id: 'm1',
      showId: 's1',
      type: 'singles',
      participants: [
        { wrestlerId: 'w1' },
        { wrestlerId: 'w2' },
      ],
    };

    it('accepts valid match', () => {
      expect(MatchSchema.safeParse(validMatch).success).toBe(true);
    });

    it('rejects invalid match type', () => {
      expect(MatchSchema.safeParse({ ...validMatch, type: 'invalid' }).success).toBe(false);
    });
  });

  describe('MatchResultSchema', () => {
    it('accepts valid result with loserIds', () => {
      const result = MatchResultSchema.safeParse({
        winnerId: 'w1',
        loserIds: ['w2'],
        method: 'pinfall',
        rating: 3.5,
        duration: 12,
      });
      expect(result.success).toBe(true);
    });

    it('accepts result with winningTeam', () => {
      const result = MatchResultSchema.safeParse({
        winnerId: 't1a',
        loserIds: ['t2a', 't2b'],
        winningTeam: 0,
        method: 'pinfall',
        rating: 4,
        duration: 15,
      });
      expect(result.success).toBe(true);
    });

    it('rejects rating out of range', () => {
      expect(MatchResultSchema.safeParse({
        winnerId: 'w1',
        loserIds: [],
        method: 'pinfall',
        rating: 6,
      }).success).toBe(false);
    });

    it('rejects invalid method', () => {
      expect(MatchResultSchema.safeParse({
        winnerId: 'w1',
        loserIds: [],
        method: 'invalid',
        rating: 3,
      }).success).toBe(false);
    });
  });

  describe('MatchInputSchema', () => {
    it('accepts valid match input', () => {
      const result = MatchInputSchema.safeParse({
        participants: [
          { id: 'a', rpScore: 5, ovr: 50 },
          { id: 'b', rpScore: 6, ovr: 52 },
        ],
        matchType: 'singles',
        seed: 42,
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid matchType', () => {
      expect(MatchInputSchema.safeParse({
        participants: [{ id: 'a' }, { id: 'b' }],
        matchType: 'invalid',
      }).success).toBe(false);
    });

    it('rejects participant without id', () => {
      expect(MatchInputSchema.safeParse({
        participants: [{ ovr: 50 }, { id: 'b' }],
        matchType: 'singles',
      }).success).toBe(false);
    });
  });

  describe('WorldSchema', () => {
    it('accepts valid world', () => {
      const result = WorldSchema.safeParse({
        id: 'world1',
        name: 'Test World',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('validate* helpers', () => {
    it('validateWrestler returns success for valid data', () => {
      const r = validateWrestler({
        id: 'w1',
        worldId: 'w',
        federationId: null,
        controlledBy: 'ai',
        ringName: 'Name',
      });
      expect(r.success).toBe(true);
    });

    it('validateMatchResult returns success for valid result', () => {
      const r = validateMatchResult({
        winnerId: 'w1',
        loserIds: ['w2'],
        method: 'pinfall',
        rating: 3,
      });
      expect(r.success).toBe(true);
    });

    it('validateMatchInput returns success for valid input', () => {
      const r = validateMatchInput({
        participants: [{ id: 'a' }, { id: 'b' }],
        matchType: 'singles',
      });
      expect(r.success).toBe(true);
    });
  });
});
