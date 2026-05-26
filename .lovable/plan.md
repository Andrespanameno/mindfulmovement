## Plan: Add Lottie animation to 4-7-8 breathing exercise

**Steps**

1. Install `lottie-react` via `bun add lottie-react`.
2. Copy the upload to `src/assets/lottie/4-7-8-breathing.json`.
3. Update `src/components/mm/MovementVisual.tsx`:
   - Import `Lottie` from `lottie-react` and the JSON file.
   - Remove the `if (movementId === "4-7-8-breathing") return null;` early-return.
   - Add a branch that renders the Lottie animation for `4-7-8-breathing` inside the existing wrapper (same `rounded-2xl bg-background/60 ring-1 ring-black/5 px-4 py-3 mb-4` + ~h-32 sizing so layout doesn't shift).
   - Pass `loop` and `autoplay={running}` so the animation pauses when the session timer is paused, matching the existing `BreathingCircle` behavior.
4. Leave `box-breathing` and all other breath visuals untouched (waiting on the separate box-breathing file you mentioned earlier).

No other files change; no logic outside the visual component is touched.