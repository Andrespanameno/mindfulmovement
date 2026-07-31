import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'app.lovable.mindfulmovement',
  appName: 'Mindful Movement',
  // The app is server-rendered, so the Vite build never emits a static
  // index.html. The native shell loads the published site over HTTPS instead;
  // `webDir` only provides the local offline/splash fallback that `cap sync`
  // copies into the native projects.
  webDir: 'capacitor-shell',
  server: {
    url: 'https://mindfulmovement.lovable.app',
    androidScheme: 'https',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',
    // Custom scheme used as the browser -> app handoff fallback on the
    // "Email verified" page. Register `mindfulmovement` under
    // Info.plist -> CFBundleURLTypes (see docs/native-build.md).
    scheme: 'Mindful Movement',
  },
  android: {
    // Resize the WebView when the soft keyboard opens so focused inputs and
    // sticky footers stay visible.
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#7C7CFF',
    },
    Keyboard: {
      resize: KeyboardResize.Native,
      resizeOnFullScreen: true,
    },
  },
};

export default config;