# Track 7: Frontend / UI

## Status

**Phase:** Pending (ongoing)  
**Owner:** AI + User  
**Dependencies:** All tracks (UI for each feature)

## Current Phase

(Not started.) Align with other tracks:

- T7.1: Dark theme, responsive layout; design tokens (CSS variables).
- T7.2: Touch targets min 44×44px; lazy routes + Suspense.
- T7.3: PWA: manifest, service worker, install prompt.
- T7.4: News wire page; chirps/social feed; rankings table.

## Definition of Done (per sub-task)

- Lighthouse PWA 90+; all interactive elements meet touch target size.
- Consistent styling across pages.

## Files to Modify

- `src/App.css`
- `src/pages/*.jsx`
- `public/manifest.webmanifest`, `public/sw.js`
- `src/components/PwaInstallPrompt.jsx` (when added)

## Next Phase (future)

- Accessibility audit (WCAG 2.1 AA); font scale.
