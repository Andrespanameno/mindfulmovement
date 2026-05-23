# Replace stick figures with hand-drawn sketch illustrations

## Goal

Swap the SVG stick-figure poses on movement cards for warm, hand-drawn sketch-style illustrations that are easier to understand at a glance. Keep the breathing animations (box + pulsing circle) untouched — they already work well.

## Scope

- 8 illustrations needed (one per non-breathing movement):
  Wall Push-Ups, Calf Raises, Chair Squats, Shoulder Rolls, Neck Stretch, March In Place, Overhead Stretch, Posture Reset.
- Breathing exercises (Box Breathing, Deep Breathing Reset): no change.
- Card layout, timer, instruction text, and all other logic: no change.

## Visual style

- Hand-drawn sketch aesthetic: loose pencil/ink lines with soft color washes.
- Single friendly character per illustration showing the movement clearly (no 2-frame start→end split — one expressive pose reads better at small sizes than two tiny ones).
- Warm, calm palette aligned with the wellness theme (soft creams, sage, muted terracotta, gentle blue accents).
- Transparent background so the illustration sits cleanly inside the existing rounded visual container.
- Consistent character + line weight across all 8 so the set feels like one family.

## Implementation

1. Generate 8 PNG illustrations into `src/assets/movements/` using the agent's image generation (premium tier for consistent style, transparent background).
2. Update `src/components/mm/MovementVisual.tsx`:
   - Remove the 8 stick-figure pose components and the `TwoFrame` / `Frame` helpers.
   - Keep `BoxBreathing` and `DeepBreathing` exactly as they are.
   - Replace each pose entry in the `visuals` map with a simple `<SketchImage src={...} alt={...} />` component that renders the imported PNG at a fixed height (~120px) inside the existing container.
3. No changes to `MovementCard.tsx`, `movements.ts`, routes, or any other file.

## Tradeoffs / notes

- Image weight: 8 illustrations × ~30–60KB each = ~300–500KB total. Lazy-loaded via native `loading="lazy"`. No measurable performance impact.
- Illustrations are a visual cue, not a form tutorial. The short instruction text remains the source of truth for "how to do it."
- If a generated illustration ever looks off, it can be regenerated individually without touching code.

## Out of scope

- No looping animations / Lottie / video.
- No changes to breathing visuals.
- No changes to card structure, timer, XP, or completion logic.
