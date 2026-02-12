# Track 3: World Simulation

## Status

**Phase:** In progress (Phase 2 world structure done)  
**Owner:** AI + User  
**Dependencies:** T2 (match engine), T6 (Firestore structure)

## Done in Phase 2

- WorldContext uses worldSimulator.advanceDay/advanceWeek; Firestore load/subscribe/create; localStorage for offline.
- worldFirestore.js: loadWorld, subscribeWorld, createWorld, updateWorld, listWorlds.

## Current Phase

- T3.1: `worldSimulator.js`: advanceDay / advanceWeek; update currentDate.
- T3.2: Contract expiry, injury duration countdown, momentum decay.
- T3.3: AI wrestler RP generation (optional) for upcoming show.
- T3.4: News generation (headlines from recent shows, feuds).

## Definition of Done (per sub-task)

- advanceDay/advanceWeek pure functions; no side effects except when persisting state.
- State shape validated with Zod before/after.

## Files to Modify

- `src/engine/worldSimulator.js`
- `src/context/WorldContext.jsx` (advanceDay, advanceWeek)
- `src/utils/aiClient.js` (news generation)
- `server/index.js` (if server-side tick later)

## Next Phase (future)

- World ticker (scheduled advance); inter-federation events.
