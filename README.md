# Kayfabe Engine

Interactive E-Fed wrestling game: write Role Plays (RPs), book shows, and build your wrestling world with real players and AI.

## Quick start

```bash
cd E:\Skrypty\KayfabeEngine
npm install
npm test
npm run dev
```

- **Frontend:** http://localhost:5174 (Vite)
- **API:** http://localhost:3002 (run `npm run server` in another terminal for full AI features)

Copy `.env.example` to `.env` and set `XAI_API_KEY` (and optional Firebase vars) for AI and cloud features.

## Project structure

- `src/` – React app (context, pages, engine, contracts, utils)
- `server/` – Express API (xAI proxy, RP score, match narrative, world generation)
- `docs/` – MASTER_ROADMAP.md, ARCHITECTURE.md, DECISIONS.md, tracks T1–T8
- `.cursor/rules/kayfabe-agent.mdc` – Cursor AI rule (phase, file map, checklists)

## Ports

- **Kayfabe Engine:** Vite 5174, Express 3002
- **PWQ Quiz** (separate project): Vite 5173, Express 3001

## Development

1. Run `npm test` before and after changes.
2. Update `docs/CHANGELOG.md` and `docs/MASTER_ROADMAP.md` when completing phases.
3. Record decisions in `docs/DECISIONS.md`.
4. See `.cursor/rules/kayfabe-agent.mdc` for conventions and decision gates.

## Phase 0 (Bootstrap)

Scaffold, docs, copied utilities from PWQ Quiz, Zod schemas, WorldContext, page and engine stubs. Next: Phase 1 (Core Schemas + Match Engine).
