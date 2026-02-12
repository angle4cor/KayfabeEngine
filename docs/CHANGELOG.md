# Changelog

All notable changes to the Kayfabe Engine project are documented here.

## [Unreleased]

### Added (Phase 2.0 — World Management)

- **Firestore:** `src/utils/worldFirestore.js` — loadWorld, subscribeWorld, createWorld, updateWorld, listWorlds; structure worlds/{worldId}, federations, wrestlers, shows, storylines, news.
- **WorldContext:** Uses worldSimulator.advanceDay/advanceWeek; loadWorld, createWorld, createLocalWorld; Firestore realtime subscribe when worldId set; persist localStorage for local/offline worlds.
- **WorldSelect:** Create new world (name + Firestore), Play offline (demo), My worlds list (when logged in); enter world → career.
- **Routing:** `/world/:worldId` redirects to `/world/:worldId/career`.
- **Locales:** worlds.create, playOffline, myWorlds, loading, error, enterWorld (en/pl).

### Added (Phase 1.0 — Core Schemas + Match Engine)

- **Schemas:** `MatchResultSchema` extended with `loserIds` (array), `winningTeam`, `highlights`; deprecated `loserId` kept for transition. New `MatchInputSchema` and `MatchInputParticipantSchema` for match engine input validation; `validateMatchInput` helper.
- **Match engine:** Full deterministic simulation in `matchEngine.js`: `computeComposite`, `pickMethod`, `calcRating`, `calcDuration`; `simulateSinglesMatch`, `simulateTagMatch`, `simulateTripleThreatMatch`; unified `simulateMatch({ participants, matchType, seed })` with input/output schema validation. Weighting: RP 60%, ovr 20%, momentum 10%, RNG 10%.
- **Movesets:** `SUBMISSIONS` and `DQ_SCENARIOS` arrays in `src/data/movesets.js` for future narrative/highlights.
- **Tests:** `tests/unit/engine/matchEngine.test.js` (determinism, weights, edge cases, all match types, schema validation); `tests/unit/contracts/schemas.test.js` (round-trip and rejection).

### Added (Phase 0.0 — Bootstrap)

- Project scaffold at `E:\Skrypty\KayfabeEngine\`.
- Config: `package.json`, `vite.config.js` (port 5174, proxy 3002), `index.html`, `.gitignore`, `.env.example`, `firebase.json`, Firestore/Storage rules.
- Cursor rule: `.cursor/rules/kayfabe-agent.mdc` (phase, file map, checklists, decision gates).
- Docs: `MASTER_ROADMAP.md`, `CHANGELOG.md`, `DECISIONS.md`, `ARCHITECTURE.md`, tracks T1–T8.
- Source stubs: `WorldContext.jsx`, `SettingsContext.jsx`, `schemas.js`, `App.jsx`, pages (Home, WorldSelect, MyCareer, WriteRP, ShowView, Roster), engine (matchEngine, rpScorer, bookerAI, worldSimulator, tewConverter), hooks (useWorld, useMyCareer).
- Utilities copied/adapted from PWQ: `rng.js`, `aiCostHelper.js`, `logger.js`, `aiClient.js`, `AuthContext.jsx`, `i18n.js`, `firebase.js`, `main.jsx`.
- Server: Express API skeleton with `/api/health`, KE-specific AI routes stubbed.
- Tests: `tests/setup.js`, `tests/smoke.test.jsx`.
- Public: `manifest.webmanifest`, `sw.js`.
- Locales: `en.json`, `pl.json` with initial keys.

### Changed

- (none yet)

### Fixed

- (none yet)
