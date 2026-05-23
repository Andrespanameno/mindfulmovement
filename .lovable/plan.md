## Curated Inspirational Message System

### 1. Database — new `motivational_messages` table

Migration creating:
- `id` uuid PK (default `gen_random_uuid()`)
- `message` text not null
- `author` text default `'Mindful Movement'`
- `category` text not null — check constraint: `movement | consistency | hydration | breathing | stress_relief | progress | encouragement`
- `placement` text not null — check constraint: `home_page | session_completion | hydration_completion | progress_summary`
- `active` boolean not null default true
- `created_at` timestamptz default `now()`

RLS: enable, single policy `SELECT` for `authenticated` where `active = true`. No insert/update/delete policies (seeded server-side; admins manage via migrations).

Indexes: `(placement, active)` for fast rotation queries.

**Seed data** (~40–50 original messages, mostly authored "Mindful Movement"), spread across all categories and placements. Tone: calm, optimistic, gentle, supportive, non-judgmental. Examples already provided by user will be included.

### 2. Rotation logic — avoid repeats

Client-side rotation using `localStorage` to track recently-shown message IDs per placement (last N = 10 ring buffer).

New hook: `src/hooks/useMotivationalMessage.ts`
- Args: `placement` (required), `category` (optional filter)
- Fetches all active messages for that placement once (React Query, long stale time)
- Picks a message not in the recently-shown ring; appends id to ring
- Returns `{ message, author }`
- Refresh helper `next()` to manually rotate (e.g., on session completion mount)

### 3. UI integration

- **`src/routes/home.tsx`** — replace any existing static greeting/tagline area with a small quote card using `useMotivationalMessage({ placement: 'home_page' })`. Calm typography, muted background, author line if not "Mindful Movement".
- **`src/routes/session.tsx`** — on the completion screen, swap the current hardcoded `sessionCompletionMessages` random pick with `useMotivationalMessage({ placement: 'session_completion' })`. Keep existing completion layout/animation.
- **Hydration completion** — wire into the existing hydration log toast/celebration (placement: `hydration_completion`).
- **Progress summary** — wire into the profile/stats summary block (placement: `progress_summary`).

A shared `<InspirationCard placement="..." />` component will encapsulate look + hook usage so all four placements stay consistent.

### 4. What is NOT changing

- No internet quote scraping; all content is original and seeded via migration.
- Onboarding, reminders, timers, XP, and session selection logic remain untouched.
- `sessionCompletionMessages` array in `src/lib/movements.ts` will be removed after the session screen migrates to the DB-driven hook.

### Technical notes

- Data access via a `createServerFn` (`getMessagesByPlacement`) using `requireSupabaseAuth`, called from the hook via `useQuery`. Keeps RLS in effect and matches existing patterns.
- Ring-buffer key: `mm:recent-messages:<placement>`.
- If the fetched pool has ≤ ring size, rotation falls back to "anything except the immediately previous one" so users still get variety.
