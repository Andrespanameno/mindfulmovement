## Add app icon for home screen installs

I'll wire up your 512×512 logo so iOS and Android use it when adding the app to the home screen.

### Steps
1. Save the uploaded PNG to `public/icon-512.png` and generate a `public/icon-192.png` (resized copy) and `public/apple-touch-icon.png` (180×180 for iOS).
2. Create `public/manifest.json` with app name "Mindful Movement", `display: "standalone"`, theme/background colors matching the app, and both icon sizes.
3. Update `src/routes/__root.tsx` `head()` to add:
   - `<link rel="manifest" href="/manifest.json">`
   - `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`
   - `<link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png">`

### Notes
- No service worker / PWA plugin — manifest-only is enough for installability and avoids preview issues.
- Existing users who already added the app will need to **remove and re-add** it to pick up the new icon (iOS/Android cache the icon at install time).
- After I implement, you'll need to click **Publish → Update** for the published link to serve the new icon.
