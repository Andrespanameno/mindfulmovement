# Native builds (Capacitor)

Mindful Movement ships native reminders via [`@capacitor/local-notifications`](https://capacitorjs.com/docs/apis/local-notifications). The Capacitor config lives in `capacitor.config.ts` at the repo root.

## How the native shell works (read this first)

This app is **server-rendered** (TanStack Start on a Cloudflare Worker). `vite build`
produces a server bundle, not a static site — there is deliberately **no
`.output/public/index.html`**, so a classic `webDir`-based Capacitor build cannot work
and `cap sync` will fail if you point it at the build output.

Instead the native apps are **remote-URL shells**:

```ts
server: { url: 'https://mindfulmovement.lovable.app', androidScheme: 'https' }
webDir: 'capacitor-shell'   // local offline/splash fallback only
```

- The WebView loads the published site over HTTPS, so SSR, server functions, auth,
  email and the database all behave exactly as on the web.
- Native plugins (local notifications, hardware back button, keyboard) still work —
  they live in the Capacitor bridge, not in the page bundle.
- `capacitor-shell/index.html` is a dependency-free splash/offline page. It satisfies
  `cap sync` and is what users see if the device is offline at cold start.
- **`bun run build` is not required** for the native shell.
- Pressing **Publish** in Lovable updates every installed app immediately — no store
  resubmission for UI changes. Treat Publish as a production release.
- The app requires a network connection on cold start; there is no offline mode.

## One-time setup (per workstation)

```bash
bun install
npx cap add ios          # generates the ios/ Xcode project
npx cap add android      # generates the android/ Android Studio project
```

> ⚠️ Confirm the `appId` in `capacitor.config.ts` matches the iOS bundle identifier already used in TestFlight before running `cap add ios`. Default is `app.lovable.mindfulmovement`.

## iOS: sync → run → ship

```bash
npx cap sync ios         # copies the shell + plugins into the iOS project
npx cap open ios         # opens Xcode
```

In Xcode: select the `App` scheme → Product → Archive → upload to App Store Connect (TestFlight).

Re-run `npx cap sync ios` only after changing `capacitor.config.ts`, the shell page,
or installing/removing a Capacitor plugin.

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
- Offline use. The shell page is a fallback, not a cached copy of the app.

## Android build (Capacitor)

The web layer is Android-ready: safe-area insets, `viewport-fit=cover`, hardware
back-button handling, soft-keyboard padding, and ≥48dp tap targets in the tab bar.
`@capacitor/android` and `@capacitor/keyboard` are installed.

```bash
bun install
npx cap add android
npx cap sync android
npx cap open android      # Android Studio
```

### Still required in Android Studio / the `android/` project

- `AndroidManifest.xml`: `POST_NOTIFICATIONS` (Android 13+) and
  `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM` so reminders survive Doze
  (the scheduler uses `allowWhileIdle`).
- Adaptive launcher icons and a monochrome white-on-transparent notification
  small icon in `android/app/src/main/res` (replace `ic_stat_icon_config_sample`).
- `applicationId` must match `app.lovable.mindfulmovement`; set signing config,
  target SDK, and Play Console listing.
- Edge-to-edge / status-bar styling in `styles.xml` for Android 15+.
- **Suppress the default WebView error page** so the branded offline screen in
  `capacitor-shell/index.html` shows instead of "Webpage not available". In
  `MainActivity.java`, after `super.onCreate(...)`:

  ```java
  bridge.getWebView().setWebViewClient(new BridgeWebViewClient(bridge) {
    @Override
    public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError err) {
      if (req.isForMainFrame()) {
        view.loadUrl("file:///android_asset/public/index.html");
      }
    }
  });
  ```

  That local page retries the published URL, offers "Open Network Settings",
  and auto-reloads once `navigator.onLine` flips back to true.
- Device testing of Doze-mode reminder delivery and battery-optimization exemptions.
- Play Console listing should call out the genuine native functionality (scheduled
  local reminders, hardware back handling, keyboard integration) — pure webview
  wrappers are sometimes flagged during review.

## Troubleshooting

- **`cap sync` fails with "Could not find the web assets directory":** you pointed
  `webDir` at a build output. It must stay `capacitor-shell`; see the section above.
- **App shows the "Reconnect" screen:** the device has no network, or the published
  URL in `capacitor.config.ts` is wrong / the site is not published yet.
- **No prompt on first launch:** delete the app on the device, then reinstall. iOS only asks once per install.
- **Notifications not appearing in Settings:** confirm the bundle id / `applicationId` matches and that `npx cap sync` was run after installing `@capacitor/local-notifications`.
- **Duplicates with in-app toasts:** expected when the app is foregrounded near a slot. Native banners are delivered by iOS even while the app is open.
## Email verification deep links (Universal Links / App Links)

Verification emails now point at `https://mindfulmovement.lovable.app/auth/callback`.
That single URL serves three situations:

1. **App installed + links verified** — iOS/Android open the app, Capacitor fires
   `appUrlOpen`, `NativeBridge` completes the Supabase session and hands off to
   `AuthGate`, which lands the user on Profile Setup (or Home if onboarding is done).
2. **App installed but links not verified / scheme blocked** — the browser shows the
   branded "Email verified successfully!" page with an **Open Mindful Movement**
   button (custom scheme first, HTTPS link second).
3. **Desktop browser** — verification completes and the web app continues normally.

Onboarding never continues silently in a mobile browser.

### Association files (served by the app)

- `GET /.well-known/apple-app-site-association` → `application/json`
- `GET /.well-known/assetlinks.json` → `application/json`

Fill them in with project secrets, then re-publish:

| Secret | Value |
| --- | --- |
| `APPLE_APP_SITE_ASSOCIATION_APP_IDS` | `<TEAMID>.app.lovable.mindfulmovement` (comma-separate multiple app IDs) |
| `ANDROID_APP_LINK_FINGERPRINTS` | SHA-256 app-signing fingerprints from Play Console → Setup → App integrity |

Verify with `curl -i https://mindfulmovement.lovable.app/.well-known/assetlinks.json`.

### iOS native setup (Xcode, one time)

1. Target **App** → *Signing & Capabilities* → **+ Capability** → **Associated Domains**.
2. Add `applinks:mindfulmovement.lovable.app`.
3. *Info* → **URL Types** → add identifier `app.lovable.mindfulmovement`, URL Scheme
   `mindfulmovement` (this powers the "Open Mindful Movement" button fallback).
4. Archive and upload; iOS refetches the association file on install.

### Android native setup (`android/app/src/main/AndroidManifest.xml`, one time)

Inside the main `<activity>`:

```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https" android:host="mindfulmovement.lovable.app" />
</intent-filter>
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="mindfulmovement" />
</intent-filter>
```

Check verification with
`adb shell pm get-app-links app.lovable.mindfulmovement`.

> Supabase's confirmation link first hits its own `/auth/v1/verify` endpoint and then
> redirects to `/auth/callback`, so the redirect URL must stay in the allowed redirect
> list. Both the site URL and `https://mindfulmovement.lovable.app/auth/callback` are
> already covered by the wildcard site config.
