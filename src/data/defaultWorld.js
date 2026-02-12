/**
 * Default starter world for Kayfabe Engine.
 */

export const defaultWorldMeta = {
  name: 'Starter World',
  description: 'A single federation with a small roster to get started.',
  currentDate: { year: 2025, month: 1, week: 1, day: 1 },
  isPublic: false,
};

export const defaultFederation = {
  id: 'fed_default',
  worldId: 'world_default',
  name: 'Championship Wrestling',
  shortName: 'CW',
  owner: 'ai',
  prestige: 50,
  budget: 10000,
  roster: [],
  championships: [],
};

export const defaultWrestlers = [];
