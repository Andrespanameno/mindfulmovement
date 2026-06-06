# Native iOS Reminders via Capacitor Local Notifications

## Heads-up before we start

There is no `capacitor.config.ts`, `ios/`, or `@capacitor/*` package in this repo today. The TestFlight build must be wrapping the published web URL from a separate Capacitor shell project. To make local notifications work, **Capacitor needs to live in this repo** (or the existing shell needs the same plugin + JS code added). This plan adds Capacitor here so the same codebase powers both web and the iOS wrapper. If you're maintaining a separate iOS shell repo, we'll need to mirror the native install steps there too — flag that and I'll adjust.

No APNs/FCM. No server changes. Existing `ReminderRunner` (in-app toasts), `reminder_dispatches`, and the settings UI all stay.

## What the user will see

- After completing onboarding (or toggling reminders on), iOS shows the native permission prompt.
- "Mindful Movement" appears under **iOS Settings → Notifications**.
- Reminders fire on the lock screen / banner even when the app is closed, on the cadence and active hours already configured.
- Tapping a notification opens the app to the Guided Session screen.
- If permission is denied, a soft inline message on the Reminders page explains how to enable it in Settings.
- While the app is open, the existing in-app toast/`ReminderRunner` behavior is unchanged.

## Implementation

### 1. Install + configure Capacitor

- `bun add @capacitor/core @capacitor/ios @capacitor/local-notifications @capacitor/app`
- `bun add -d @capacitor/cli`
- Add `capacitor.config.ts` at repo root:
  - `appId`: `app.lovable.mindfulmovement` (confirm exact bundle id used in TestFlight — needs to match)
  - `appName`: `Mindful Movement`
  - `webDir`: `dist` (built output)
  - `server.url`: omit for production (bundled assets); for dev you can point to the preview URL
- Add `npx cap add ios` instructions to README — generates the `ios/` Xcode project. (You/maintainer runs this locally; not something the sandbox does.)
- `ios/App/App/Info.plist`: no extra keys needed for local notifications, but if we want sound/badge we'll add the standard `UIBackgroundModes` entry only if scheduling background tasks (not needed here — local notifications are scheduled in advance and fired by iOS itself).

### 2. Platform detection helper

`src/lib/native.ts` — tiny helper:
```ts
import { Capacitor } from '@capacitor/core';
export const isNative = () => Capacitor.isNativePlatform();
export const isIOS = () => Capacitor.getPlatform() === 'ios';
```

### 3. Notification scheduling module

`src/lib/nativeNotifications.ts`:
- `requestPermission()` → wraps `LocalNotifications.requestPermissions()`, returns `'granted' | 'denied' | 'prompt'`.
- `getPermission()` → wraps `LocalNotifications.checkPermissions()`.
- `scheduleReminders(settings: ReminderSettings, lang: 'en' | 'es')`:
  1. `LocalNotifications.getPending()` → `LocalNotifications.cancel({ notifications })` to clear ours (use a stable id range, e.g. 1000–1999).
  2. If `!settings.enabled` or all channels off, stop here.
  3. Compute the next **64 dispatch slots** (iOS caps pending local notifications at 64 per app) using the existing `isDispatchSlot`/cadence logic in `src/lib/reminders.ts`. Walk forward minute-by-minute from `now`, picking matching slots, skipping weekends if `quietWeekends`, until 64 are collected or 14 days have passed.
  4. For each slot, pick a message via `pickReminder(settings, lang)` and build:
     ```ts
     { id, title, body, schedule: { at: slotDate, allowWhileIdle: true }, extra: { route: '/session' } }
     ```
  5. `LocalNotifications.schedule({ notifications })`.
- `cancelAllReminders()` — cancels our id range.

### 4. Tap handler → deep link to `/session`

In `src/routes/__root.tsx` (or a small `NativeBridge` component mounted there), on native platforms only:
```ts
LocalNotifications.addListener('localNotificationActionPerformed', (e) => {
  const route = e.notification.extra?.route ?? '/session';
  router.navigate({ to: route });
});
```
Plus an `App.addListener('appUrlOpen', …)` no-op stub for future deep-link expansion.

### 5. Wire scheduling into existing flows

- **On reminder settings change:** extend `RemindersSync.tsx` (already debounces local writes). After the local snapshot is captured, also call `scheduleReminders(settings, lang)` when `isNative()`.
- **On app start (native, authenticated):** in `RemindersSync`, after initial hydrate from DB, schedule once.
- **On language change:** subscribe to i18n; reschedule so message text matches.
- **After onboarding completes:** in `src/routes/onboarding.tsx`, at the step where reminders are confirmed, call `requestPermission()` then `scheduleReminders(...)` if granted. (Will read that file during build to find the right hook.)
- **On Reminders page (`src/routes/reminders.tsx`):** replace the existing "enable browser notifications" CTA with a native-aware version:
  - Web: existing Web Notifications flow stays.
  - Native + `prompt`: button calls `requestPermission()`.
  - Native + `denied`: muted inline message — "Notifications are off for Mindful Movement. Open iOS Settings → Notifications → Mindful Movement to turn them on. You'll still see reminders inside the app." (EN + ES i18n keys.)
  - Native + `granted`: small confirmation row.

### 6. Keep in-app behavior intact

`ReminderRunner.tsx` continues to run. On native it's harmless (duplicates only fire if app happens to be open at the slot, which matches user expectation). No changes needed.

### 7. i18n additions (`src/lib/i18n.tsx`)

New keys (EN + ES):
- `reminders.native_denied_title` / `reminders.native_denied_body`
- `reminders.native_enabled`
- `reminders.native_request_cta`

### 8. Build / TestFlight workflow (docs, not code)

Add a short `docs/native-build.md` covering:
- `bun run build` → `npx cap sync ios` → open `ios/App` in Xcode → archive → upload to TestFlight.
- Note the 64-notification cap and that the app reschedules on each open (so daily use keeps the queue topped up).

## Technical notes / constraints

- **64-pending cap on iOS.** Why we pre-compute a rolling window and reschedule on every settings change + app open.
- **Reschedule triggers:** settings change, language change, app foreground (`App` `resume` event), and after onboarding. All funnel through one `scheduleReminders()` call so logic stays in one place.
- **ID range 1000–1999** keeps our notifications cancelable without nuking anything a future feature might schedule.
- **Web build is unaffected** — every native call is guarded by `isNative()`. `@capacitor/core` works in browsers (no-ops `isNativePlatform()`), so SSR/dev preview won't break.
- **Bundle id must match TestFlight's** — confirm before `npx cap add ios`, otherwise the iOS shell won't recognize the plugin registration.

## Out of scope (per your instructions)

- APNs / FCM push.
- Removing `reminder_dispatches` or the `send-reminders` cron.
- Android build (plugin works there too; we can add later with `npx cap add android`).

## One thing I need from you

Confirm the **iOS bundle identifier** currently used in TestFlight (e.g. `com.yourname.mindfulmovement`). I'll set `appId` to match. If it doesn't match, the existing TestFlight build can't be updated in place — you'd have to ship a new app record.
