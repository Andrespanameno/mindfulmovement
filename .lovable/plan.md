## Why the current build fails

Mindful Movement is a server-rendered TanStack Start app. `vite build` produces a Cloudflare Worker server bundle, not a static site — so there is deliberately no `.output/public/index.html` for Capacitor's `webDir` to point at. There is no official Lovable "export to Capacitor" flow, and no Vite flag will make an SSR build emit a static shell.

The supported way forward is the remote-URL shell you picked: the native Android app is a thin Capacitor wrapper whose WebView loads `https://mindfulmovement.lovable.app`. All SSR, server functions, Cloud auth and email keep working unchanged, and your existing native plugins (local notifications, back button, keyboard) continue to run because they live in the WebView bridge, not the page bundle.

## What changes

**1. `capacitor.config.ts`**
- Add a `server` block: `url: 'https://mindfulmovement.lovable.app'`, `cleartext: false`, `androidScheme: 'https'`.
- Keep `webDir` pointed at a small local folder so `cap sync` always has something valid to copy.
- Existing `ios`, `android`, `LocalNotifications` and `Keyboard` config stays exactly as-is.

**2. New `capacitor-shell/index.html`**
- A minimal branded splash/offline page (dark background, app name, "Reconnect" button) used as `webDir`. It is what the WebView shows if the device is offline at launch, and it satisfies `cap sync`.
- Dependency-free static HTML — no build step, no app imports.

**3. `docs/native-build.md`**
- Replace the Android section with the remote-URL workflow: `npx cap add android`, `npx cap sync android`, `npx cap open android`.
- Note that `bun run build` is no longer a prerequisite for the native shell, and that web changes reach the app as soon as you press Publish — no store resubmission for UI updates.
- Document the Android-side items still required in Android Studio (unchanged from the earlier audit): `POST_NOTIFICATIONS`, exact-alarm permissions, adaptive launcher + monochrome notification icons, `applicationId`, signing, target SDK, edge-to-edge `styles.xml`.
- Add the same remote-URL note for iOS so both platforms behave identically.

## Trade-offs to know

- The app requires a network connection on cold start; there is no offline mode. If you later want offline, that's the separate static/SPA route with real SSR loss.
- Google Play sometimes flags pure webview wrappers. Your app clears that bar because it ships genuine native functionality (scheduled local notifications, hardware back handling, keyboard integration) — worth mentioning in the Play listing.
- Publishing the web app instantly updates every installed Android app. Treat Publish as a production release.

## Nothing else changes

No app code, routes, design, translations, reminder/session logic, hydration, progress, or backend configuration are touched.
