# Changelog

All notable changes to the Kayfabe Engine project are documented here.

## [Unreleased]

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
