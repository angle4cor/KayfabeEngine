# Architecture Decision Records (ADR)

Non-obvious decisions that affect tracks or contracts. Update when making design choices.

---

## ADR-001: Firestore Per-World Structure

- **Date:** 2026-02-12
- **Status:** Accepted
- **Decision:** Each "world" (game instance) is a logical unit. Firestore structure: `worlds/{worldId}/federations/{fedId}`, `worlds/{worldId}/wrestlers/{wrestlerId}`, `worlds/{worldId}/shows/{showId}`, `worlds/{worldId}/roleplays/{rpId}`, etc. One world = one multiplayer room.
- **Alternatives:** Single global collection with `worldId` field; separate database per world.
- **Why:** Per-world subcollections allow clean realtime listeners per world and simple access rules. Separate DB per world would complicate auth and billing.
- **Tracks affected:** T3, T6

---

## ADR-002: Zod for Runtime Schema Validation

- **Date:** 2026-02-12
- **Status:** Accepted
- **Decision:** Use Zod at boundaries: world state persistence, API responses, RP submission, TEW import.
- **Alternatives:** Ajv (JSON Schema); manual validation; TypeScript migration.
- **Why:** Zod is composable and works at runtime. Same pattern as PWQ Quiz.
- **Tracks affected:** T1, T2, T6, T8

---

## ADR-003: Headless Engine Layer

- **Date:** 2026-02-12
- **Status:** Accepted
- **Decision:** All game logic in `src/engine/` must be headless: no `window`, `document`, or React. Deterministic when seeded RNG is provided.
- **Why:** Enables unit testing in Node, reproducible simulations, and future server-side tick.
- **Tracks affected:** T2, T3, T4
