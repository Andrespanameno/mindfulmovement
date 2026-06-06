# Native iOS build (Capacitor)

Mindful Movement ships native iOS reminders via [`@capacitor/local-notifications`](https://capacitorjs.com/docs/apis/local-notifications). The Capacitor config lives in `capacitor.config.ts` at the repo root.

## One-time setup (per workstation)

```bash
bun install
npx cap add ios          # generates the ios/ Xcode project
```

> ⚠️ Confirm the `appId` in `capacitor.config.ts` matches the iOS bundle identifier already used in TestFlight before running `cap add ios`. Default is `app.lovable.mindfulmovement`.

## Build → run → ship

```bash
bun run build            # produces dist/
npx cap sync ios         # copies web build + plugins into the iOS project
npx cap open ios         # opens Xcode
```

In Xcode: select the `App` scheme → Product → Archive → upload to App Store Connect (TestFlight).

## How reminders work on device

- After onboarding, the app requests notification permission. If granted, "Mindful Movement" appears under **iOS Settings → Notifications**.
- The app pre-schedules up to ~60 local notifications (iOS caps pending notifications at 64 per app) using the user's active hours and cadence.
- The queue is refilled whenever:
  - reminder settings change,
  - the language changes,
  - the app returns to the foreground (`appStateChange`),
  - the user signs in and settings hydrate from the database.
- Tapping a notification opens the app and navigates to `/session`.

## What is **not** implemented

- APNs / FCM remote push. Reminders are device-local only.
- Android wrapper. The plugin works on Android too — add later with `npx cap add android`.

## Troubleshooting

- **No prompt on first launch:** delete the app on the device, then reinstall. iOS only asks once per install.
- **Notifications not appearing in Settings:** confirm the bundle id matches and that `npx cap sync ios` was run after installing `@capacitor/local-notifications`.
- **Duplicates with in-app toasts:** expected when the app is foregrounded near a slot. Native banners are delivered by iOS even while the app is open.