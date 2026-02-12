# Track 2: Match Engine

## Status

**Phase:** Next (Phase 1.0)  
**Owner:** AI + User  
**Dependencies:** None (headless foundation)

## Current Phase

- Phase 1.0: Implement `matchEngine.js` with deterministic outcome from RP score (60%), wrestler stats (20%), momentum (10%), RNG (10%). Seeded RNG when seed provided.
- Unit tests: same seed => same result; no DOM/window.

## Definition of Done (per sub-task)

- Match types: singles, tag, triple threat at minimum.
- Returns { winnerId, method, rating, duration }.
- 90%+ coverage for `matchEngine.js`.

## Files to Modify

- `src/engine/matchEngine.js`
- `src/contracts/schemas.js` (MatchSchema, MatchResultSchema)
- `tests/unit/engine/matchEngine.test.js`

## Next Phase (future)

- Stipulations (cage, ladder, iron man); championship match modifiers.
