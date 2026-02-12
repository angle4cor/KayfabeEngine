# Track 8: TEW Integration

## Status

**Phase:** Pending (post–Phase 7)  
**Owner:** AI + User  
**Dependencies:** Schemas (Wrestler, Federation, etc.)

## Current Phase

(Not started.) After Phase 7:

- T8.1: Research TEW database/export format (workers, promotions, titles, events).
- T8.2: `tewConverter.js`: parse TEW data; map to KE WrestlerSchema, FederationSchema, etc.
- T8.3: Import wizard: upload file → validate → create world or merge into existing.
- T8.4: Export: export current world to TEW-compatible format.

## Definition of Done (per sub-task)

- At least one TEW format (e.g. CSV/JSON export) can be imported into a new world.
- Export produces a file that can be documented for TEW modders.

## Files to Modify

- `src/engine/tewConverter.js`
- `src/pages/WorldSelect.jsx` (import/export UI)
- `src/contracts/schemas.js` (TEW-specific schemas if needed)

## Next Phase (future)

- Full TEW database compatibility; historical results import.
