/**
 * Kayfabe Engine — Runtime schema validation (ADR-002)
 * Zod schemas for world state, RPs, shows, matches, and API boundaries.
 */

import { z } from 'zod';

const alignmentEnum = z.enum(['face', 'heel', 'tweener']);
const conditionEnum = z.enum(['healthy', 'injured', 'suspended']);
const showTypeEnum = z.enum(['weekly', 'ppv', 'special']);
const showStatusEnum = z.enum(['upcoming', 'rp_phase', 'booked', 'completed']);
const matchTypeEnum = z.enum(['singles', 'tag', 'triple_threat', 'fatal_four_way', 'battle_royal', 'cage', 'ladder']);
const methodEnum = z.enum(['pinfall', 'submission', 'dq', 'countout', 'ko', 'corporate']);
const storylineStatusEnum = z.enum(['building', 'climax', 'resolved']);
const roleEnum = z.enum(['wrestler', 'booker', 'owner', 'spectator']);

/** Wrestler stats (0-100) */
export const WrestlerStatsSchema = z.object({
  mic: z.number().min(0).max(100).optional().default(50),
  inRing: z.number().min(0).max(100).optional().default(50),
  charisma: z.number().min(0).max(100).optional().default(50),
  stamina: z.number().min(0).max(100).optional().default(50),
  hardcore: z.number().min(0).max(100).optional().default(50),
  flying: z.number().min(0).max(100).optional().default(50),
  technical: z.number().min(0).max(100).optional().default(50),
  power: z.number().min(0).max(100).optional().default(50),
}).strip();

/** Wrestler */
export const WrestlerSchema = z.object({
  id: z.string(),
  worldId: z.string(),
  federationId: z.string().nullable(),
  controlledBy: z.union([z.string(), z.literal('ai')]),
  ringName: z.string().min(1),
  nickname: z.string().optional().nullable(),
  hometown: z.string().optional().nullable(),
  alignment: alignmentEnum.optional().default('tweener'),
  gimmick: z.string().optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  stats: WrestlerStatsSchema.optional(),
  ovr: z.number().min(0).max(100).optional(),
  popularity: z.number().min(0).max(100).optional().default(50),
  momentum: z.number().min(0).max(100).optional().default(50),
  condition: conditionEnum.optional().default('healthy'),
  injuryWeeks: z.number().int().min(0).optional().default(0),
  wins: z.number().int().min(0).optional().default(0),
  losses: z.number().int().min(0).optional().default(0),
  draws: z.number().int().min(0).optional().default(0),
}).passthrough();

/** Federation */
export const FederationSchema = z.object({
  id: z.string(),
  worldId: z.string(),
  name: z.string().min(1),
  shortName: z.string().optional(),
  logo: z.string().url().optional().nullable(),
  owner: z.union([z.string(), z.literal('ai')]),
  prestige: z.number().min(0).max(100).optional().default(50),
  budget: z.number().optional().default(0),
  roster: z.array(z.string()).optional().default([]),
  championships: z.array(z.string()).optional().default([]),
}).passthrough();

/** Role Play */
export const RolePlaySchema = z.object({
  id: z.string(),
  worldId: z.string(),
  wrestlerId: z.string(),
  authorPlayerId: z.string().optional().nullable(),
  title: z.string(),
  content: z.string(),
  wordCount: z.number().int().min(0).optional(),
  submittedAt: z.union([z.string(), z.date(), z.number()]).optional(),
  forShow: z.string().optional().nullable(),
  forMatch: z.string().optional().nullable(),
  aiScore: z.object({
    creativity: z.number().optional(),
    storytelling: z.number().optional(),
    characterWork: z.number().optional(),
    overall: z.number().optional(),
  }).optional().nullable(),
  bookerScore: z.number().optional().nullable(),
  finalScore: z.number().optional().nullable(),
}).passthrough();

/** Match participant */
export const MatchParticipantSchema = z.object({
  wrestlerId: z.string(),
  team: z.number().int().optional().nullable(),
});

/** Match */
export const MatchSchema = z.object({
  id: z.string(),
  showId: z.string(),
  type: matchTypeEnum,
  stipulation: z.string().optional().nullable(),
  championshipId: z.string().optional().nullable(),
  participants: z.array(MatchParticipantSchema),
  winnerId: z.string().optional().nullable(),
  method: methodEnum.optional().nullable(),
  duration: z.number().optional(),
  rating: z.number().min(0).max(5).optional().nullable(),
  narrative: z.string().optional().nullable(),
  highlights: z.array(z.string()).optional().default([]),
}).passthrough();

/** Show */
export const ShowSchema = z.object({
  id: z.string(),
  worldId: z.string(),
  federationId: z.string(),
  name: z.string(),
  type: showTypeEnum,
  date: z.union([z.string(), z.object({
    year: z.number(),
    month: z.number(),
    day: z.number(),
  })]).optional(),
  venue: z.string().optional().nullable(),
  status: showStatusEnum.optional().default('upcoming'),
  rpDeadline: z.union([z.string(), z.number()]).optional().nullable(),
  card: z.array(MatchSchema).optional().default([]),
  attendance: z.number().optional().nullable(),
  rating: z.number().optional().nullable(),
}).passthrough();

/** Storyline */
export const StorylineSchema = z.object({
  id: z.string(),
  worldId: z.string(),
  federationId: z.string(),
  title: z.string(),
  participants: z.array(z.string()).optional().default([]),
  status: storylineStatusEnum.optional().default('building'),
  heat: z.number().min(0).max(100).optional().default(50),
}).passthrough();

/** World meta */
export const WorldSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  settings: z.object({
    startDate: z.any().optional(),
    currentDate: z.any().optional(),
    isPublic: z.boolean().optional().default(false),
    maxPlayers: z.number().int().optional(),
  }).optional(),
  isPublic: z.boolean().optional().default(false),
}).passthrough();

/** Player (user in a world) */
export const PlayerSchema = z.object({
  id: z.string(),
  displayName: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  worlds: z.array(z.object({
    worldId: z.string(),
    role: roleEnum,
  })).optional().default([]),
  wrestlers: z.array(z.string()).optional().default([]),
}).passthrough();

/** Game state date (for persistence) */
export const GameStateDateSchema = z.object({
  year: z.number().int().min(2000),
  month: z.number().int().min(1).max(12),
  week: z.number().int().min(1).max(4).optional(),
  day: z.number().int().min(1).max(31).optional(),
});

/** Match result (output of matchEngine) */
export const MatchResultSchema = z.object({
  winnerId: z.string(),
  loserId: z.string().optional(),
  method: methodEnum,
  rating: z.number().min(0).max(5),
  duration: z.number().optional(),
}).passthrough();

export function validateWrestler(w) {
  return WrestlerSchema.safeParse(w);
}
export function validateFederation(f) {
  return FederationSchema.safeParse(f);
}
export function validateRolePlay(r) {
  return RolePlaySchema.safeParse(r);
}
export function validateShow(s) {
  return ShowSchema.safeParse(s);
}
export function validateMatch(m) {
  return MatchSchema.safeParse(m);
}
export function validateWorld(w) {
  return WorldSchema.safeParse(w);
}
export function validateGameStateDate(date) {
  return GameStateDateSchema.safeParse(date);
}
export function validateMatchResult(m) {
  return MatchResultSchema.safeParse(m);
}
