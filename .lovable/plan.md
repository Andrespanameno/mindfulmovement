## Remove Suggested Movement Section from Home Page

### Summary
Remove the "Suggested Movement" box (Shoulder Rolls, Chin Tucks, Seated Spinal Twist cards) from `/home` while keeping everything else intact.

### What to change
- **File**: `src/routes/home.tsx`
  - Delete the `<h4>Suggested Movement</h4>` heading and the `<div className="space-y-3 mb-8">` block containing the mapped `MovementCard` list (lines 105-112).
  - Remove now-unused imports: `movements` and `MovementCard`.
  - Remove the `suggestions` constant (line 29).

### What stays untouched
- The Guided session CTA
- Hydration Goal card  
- XP bar, streak badge, XP today grid
- InspirationCard at the bottom
- All route metadata and helper components (`XpToday`, `HydrationRing`)
- `movements.ts` data and `MovementCard.tsx` component remain in the codebase for use elsewhere (session page, etc.).