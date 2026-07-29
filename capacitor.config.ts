import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'app.lovable.mindfulmovement',
  appName: 'Mindful Movement',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
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