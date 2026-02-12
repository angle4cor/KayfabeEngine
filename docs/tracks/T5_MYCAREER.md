# Track 5: MyCareer

## Status

**Phase:** Pending (post–Phase 4)  
**Owner:** AI + User  
**Dependencies:** T1 (RP), T4 (booking), T6 (multiplayer)

## Current Phase

(Not started.) After Phase 4:

- T5.1: Wrestler creation: gimmick, stats, alignment, avatar upload; assign to federation (or free agent).
- T5.2: Career hub: view my wrestler(s), upcoming matches, rankings, titles.
- T5.3: Booker dashboard: build show, view roster, manage storylines (if booker role).
- T5.4: Owner mode: budget, contracts, create show/PPV schedule.

## Definition of Done (per sub-task)

- Player can create a wrestler and see them in roster and show cards.
- Booker can build and run a show; owner can manage federation settings.

## Files to Modify

- `src/pages/MyCareer.jsx`
- `src/hooks/useMyCareer.js`
- `src/components/WrestlerProfile.jsx`, `src/components/FederationDash.jsx`
- `src/context/WorldContext.jsx` (player role, wrestlers owned)

## Next Phase (future)

- Progression (popularity, momentum over time); achievements.
