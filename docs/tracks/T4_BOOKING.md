# Track 4: Booking System

## Status

**Phase:** Pending (post–Phase 3)  
**Owner:** AI + User  
**Dependencies:** T2 (match engine), T3 (world state)

## Current Phase

(Not started.) After Phase 3:

- T4.1: `bookerAI.js`: suggest card from roster, storylines, championships.
- T4.2: Show card builder UI (drag-and-drop or list): add/remove matches, set stipulations, title on line.
- T4.3: Run show: for each match, resolve via matchEngine (using RP scores), then AI narrative; update standings, titles.
- T4.4: Show view page: results, narratives, highlights.

## Definition of Done (per sub-task)

- Booker can build a card and run simulation; results persist to world state.
- Championship changes reflected in wrestler and title history.

## Files to Modify

- `src/engine/bookerAI.js`
- `src/pages/ShowView.jsx`, `src/pages/BookShow.jsx` (or equivalent)
- `src/components/ShowCard.jsx`, `src/components/MatchResult.jsx`
- `src/context/WorldContext.jsx` (bookShow, simulateShow)

## Next Phase (future)

- Feud planner; long-term storyline arcs.
