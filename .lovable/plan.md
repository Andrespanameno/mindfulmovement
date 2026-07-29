## Goal

Make the app behave correctly when wrapped with Capacitor on Android, without changing design, features, backend, translations, or any of the existing logic. iOS behavior stays identical.

## What the audit found

- **No Android platform support at all.** Only `@capacitor/ios` is installed; `capacitor.config.ts` has an `ios` block and a `LocalNotifications` icon name, but no Android config.
- **No safe-area handling for system bars.** `AppShell` uses fixed `pt-12` / `pb-28`, and `BottomNav` is `fixed bottom-0` with no `env(safe-area-inset-bottom)`. On Android gesture-nav and 3-button-nav devices the nav bar overlaps the tab bar, and the status bar overlaps the header. Only the toast component currently uses safe-area insets.
- **Viewport meta lacks `viewport-fit=cover`** (in `src/routes/__root.tsx`), which is required for safe-area insets to report real values inside a Capacitor WebView.
- **No hardware back-button handling.** Android's back button will exit the app from any screen; there is no `App.addListener('backButton')` anywhere (only `appStateChange` in `NativeBridge` / `session.tsx`).
- **Keyboard behavior unmanaged.** Auth, onboarding, and dialog forms can be covered by the Android soft keyboard; the sticky onboarding footer sits on top of inputs, and no `@capacitor/keyboard` handling or resize mode is configured.
- **Touch targets below Android's 48dp guidance** in the bottom nav (36px icon buttons) and a few small icon-only controls.
- **PWA/service worker:** no service worker is registered (good) — only a manifest. The manifest is fine for Android install but is missing a `maskable` icon purpose, which Android requires for a proper adaptive launcher icon.
- **iOS-only assumptions:** `capacitor.config.ts` sets an iOS-only `contentInset`; `src/lib/native.ts` exposes `isIOS()` but no `isAndroid()`; the notification scheduler comments/limits are written around iOS's 64-notification cap (harmless on Android but a channel is required for Android 8+ delivery).
- **Docs** (`docs/native-build.md`) explicitly say Android is not implemented.

## Planned changes (web/config only)

1. `src/routes/__root.tsx` — add `viewport-fit=cover` to the viewport meta; add `theme-color` meta so the Android status bar matches the app background.
2. `src/styles.css` — add safe-area CSS variables/utilities (top/bottom insets) used by the shell and nav. No color or design-token changes.
3. `src/components/mm/AppShell.tsx` — add top padding for the status bar and bottom padding for the nav bar using safe-area insets, keeping current spacing as the minimum so iOS/web look unchanged.
4. `src/components/mm/BottomNav.tsx` — add `padding-bottom: env(safe-area-inset-bottom)` and raise tap targets to ≥48px min height without changing icon/label appearance.
5. `src/routes/onboarding.tsx` — make the sticky footer respect the safe-area inset and stay above the keyboard.
6. New `src/lib/androidBack.ts` + wire into `src/components/mm/NativeBridge.tsx` — hardware back button: close open dialogs/overlays first, otherwise navigate back in history, and only exit the app from the root screen. No route or navigation logic changes elsewhere.
7. New keyboard handling in `NativeBridge` (via `@capacitor/keyboard`) — apply a body class/inset while the keyboard is open so focused inputs scroll into view; guarded to native Android only.
8. `src/lib/native.ts` — add `isAndroid()` helper (additive).
9. `capacitor.config.ts` — add an `android` block (`resizeOnFullScreen`/keyboard resize, web contents debugging off in release) and a `LocalNotifications` Android notification channel/icon config. iOS block untouched.
10. `public/manifest.json` — add a `maskable` icon purpose entry for the Android launcher/install icon.
11. `package.json` — add `@capacitor/android` and `@capacitor/keyboard`.
12. `docs/native-build.md` — add an Android build section and the remaining native steps.

Explicitly untouched: reminder scheduling logic, guided-session logic, hydration, breathing, progress, auth, Supabase, i18n strings, colors/typography.

## Technical notes

- Safe areas rely on `viewport-fit=cover`; without it Android WebView reports `env(safe-area-inset-*)` as `0px`, so step 1 is a prerequisite for steps 3–5.
- All new native listeners are guarded by `isNative()` (and `isAndroid()` where Android-specific), so iOS and browser behavior is unchanged.
- Local notifications on Android 13+ need runtime `POST_NOTIFICATIONS`; the existing `requestPermissions()` call already covers it once the Android platform exists.

## Still requires native Android work outside this codebase

- `npx cap add android` to generate the `android/` project, then `npx cap sync android`.
- `AndroidManifest.xml`: `POST_NOTIFICATIONS`, and `SCHEDULE_EXACT_ALARM`/`USE_EXACT_ALARM` if exact reminder times must survive Doze (the scheduler uses `allowWhileIdle`).
- Adaptive launcher icons + notification small icon (monochrome white-on-transparent) in `android/app/src/main/res`.
- Signing config, `applicationId` matching `app.lovable.mindfulmovement`, target SDK, and Play Console setup.
- Edge-to-edge / status-bar color styling in `styles.xml` for Android 15+ enforced edge-to-edge.
- Device testing of Doze-mode reminder delivery and battery-optimization exemptions.
