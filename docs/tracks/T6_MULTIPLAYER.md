# Track 6: Multiplayer

## Status

**Phase:** Pending (post–Phase 5)  
**Owner:** AI + User  
**Dependencies:** T3 (world state in Firestore), Auth

## Current Phase

(Not started.) After Phase 5:

- T6.1: Firestore realtime: `onSnapshot` on `worlds/{worldId}` (or subcollections) so all clients see updates.
- T6.2: Player invites: add player to world (by email or link); role (wrestler/booker/owner).
- T6.3: RP deadlines: real-world deadline per show; lock RP submission after deadline.
- T6.4: Concurrent edit safety: optimistic updates + conflict resolution or last-write-wins with clear rules.

## Definition of Done (per sub-task)

- Two browsers in same world see show results and new RPs without refresh.
- Invite flow allows a second player to join and create a wrestler.

## Files to Modify

- `src/context/WorldContext.jsx` (realtime listeners)
- `src/hooks/useWorld.js`
- `src/pages/WorldSelect.jsx` (invite UI)
- `firestore.rules` (per-world access)

## Next Phase (future)

- Presence (who is online); in-world chat.
