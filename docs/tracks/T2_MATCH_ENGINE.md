# Track 2: Match Engine

## Status

**Phase:** Done (Phase 1.0)  
**Owner:** AI + User  
**Dependencies:** None (headless foundation)

## Completed (Phase 1.0)

- `matchEngine.js`: deterministic outcome from RP score (60%), ovr (20%), momentum (10%), RNG (10%); seeded RNG when seed provided.
- Match types: singles, tag, triple threat. Returns `{ winnerId, loserIds, method, rating, duration }` (and optional `winningTeam` for tag).
- Shared helpers: `computeComposite`, `pickMethod`, `calcRating`, `calcDuration`. Unified API: `simulateMatch({ participants, matchType, seed })`.
- Schemas: `MatchResultSchema` (loserIds, winningTeam, highlights), `MatchInputSchema` / `MatchInputParticipantSchema`, `validateMatchInput`.
- Unit tests: `tests/unit/engine/matchEngine.test.js` (determinism, weights, edge cases, all match types, schema validation); no DOM.

## Files Modified

- `src/engine/matchEngine.js`
- `src/contracts/schemas.js`
- `src/data/movesets.js` (SUBMISSIONS, DQ_SCENARIOS)
- `tests/unit/engine/matchEngine.test.js`
- `tests/unit/contracts/schemas.test.js`

## Next Phase (future)

- Stipulations (cage, ladder, iron man); championship match modifiers.
