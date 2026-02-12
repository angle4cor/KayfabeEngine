# Kayfabe Engine — Master Roadmap

Living document for AI agents and the developer. Read this first before any task.

## Current Sprint

**Phase:** 0.0 complete; next Phase 1.0 (Core Schemas + Match Engine).  
**Goal:** See `docs/tracks/` and `.cursor/rules/kayfabe-agent.mdc` for file map and checklists.

### Active Tasks

- Phase 1.0: Zod schemas for all entities; `matchEngine.js` with unit tests.

### Completed

- [x] Phase 0.0: Bootstrap — project scaffold, configs, docs, Cursor rule, copied utilities from PWQ, stubs (WorldContext, pages, engine, schemas).

## Phase Plan

| Phase | Focus | Status |
|-------|--------|--------|
| 0 | Bootstrap | Done |
| 1 | Core Schemas + Match Engine | Next |
| 2 | World Management (WorldContext, Firestore, worldSimulator) | Pending |
| 3 | RP System (Tiptap editor, upload, AI scoring, RP board) | Pending |
| 4 | Booking System (bookerAI, show card, simulation, results) | Pending |
| 5 | MyCareer (wrestler creation, booker dashboard, owner mode) | Pending |
| 6 | Multiplayer (Firestore realtime, invites, RP deadlines) | Pending |
| 7 | Social & Polish (news wire, chirps, rankings, PWA) | Pending |
| 8 | TEW Integration (tewConverter, import/export wizard) | Pending |

## Track Map

| Track | Focus | Status |
|-------|--------|--------|
| T1 RP System | RP editor, scoring, upload | Pending |
| T2 Match Engine | Headless match simulation | Pending |
| T3 World Sim | Day ticker, contracts, news | Pending |
| T4 Booking | AI booking, show cards, feuds | Pending |
| T5 MyCareer | Wrestler/Booker/Owner | Pending |
| T6 Multiplayer | Firestore realtime, sync | Pending |
| T7 Frontend | UI/UX, responsive, PWA | Pending |
| T8 TEW | Import/export TEW data | Pending |

## Agent Rules

1. Read `.cursor/rules/kayfabe-agent.mdc` and this file first, then the relevant `docs/tracks/T*.md`.
2. Run `npm test` before and after changes.
3. Tests must exist before a task is considered done.
4. Max 6 files modified per task.
5. Update the track doc and `CHANGELOG.md` after each session.
6. Record non-obvious decisions in `docs/DECISIONS.md`.
7. Never modify `src/contracts/schemas.js` or API contracts without user approval.
8. Engine code must stay headless (no window/document/React).

## References

- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- Decisions: [DECISIONS.md](DECISIONS.md)
- Tracks: [docs/tracks/](tracks/)
