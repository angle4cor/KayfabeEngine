# Track 1: RP System

## Status

**Phase:** Pending (post–Phase 1)  
**Owner:** AI + User  
**Dependencies:** T2 (match engine uses RP scores), T6 (persistence)

## Current Phase

(Not started.) After Phase 1:

- T1.1: RP editor (Tiptap or similar): rich text, draft auto-save, word count.
- T1.2: RP upload: paste, .txt/.md file upload.
- T1.3: AI scoring pipeline: `rpScorer.js` + `/api/ai-rp-score`; creativity, storytelling, character work (0–10).
- T1.4: RP board: list RPs by show/wrestler, read-only view.

## Definition of Done (per sub-task)

- Editor persists draft to localStorage; submit writes to Firestore with validation.
- AI score returned and stored on RolePlay document; match engine consumes it.

## Files to Modify

- `src/engine/rpScorer.js`
- `src/pages/WriteRP.jsx`
- `src/components/RpEditor.jsx` (new)
- `src/contracts/schemas.js` (RolePlaySchema)
- `server/index.js` (ai-rp-score route)

## Next Phase (future)

- RP comments, likes; booker override score (optional).
