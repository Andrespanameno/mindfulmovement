import { useEffect, useState } from "react";
import { isNative } from "@/lib/native";
import pkg from "../../package.json";

export interface AppVersionInfo {
  /** Marketing version, e.g. "1.0.1". */
  version: string;
  /** Native build number, e.g. "12". Empty on web. */
  build: string;
}

/** Web/PWA fallback: env override first, then package metadata. */
function webVersion(): AppVersionInfo {
  const envVersion = import.meta.env.VITE_APP_VERSION as string | undefined;
  return {
    version: (envVersion && envVersion.trim()) || (pkg as { version?: string }).version || "",
    build: "",
  };
}

/**
 * Resolves the installed app version. On iOS/Android this comes straight
 * from the native bundle via Capacitor, so TestFlight / App Store / Play
 * builds report their real version with no code change.
 */
export async function getAppVersion(): Promise<AppVersionInfo> {
  if (isNative()) {
    try {
      const { App } = await import("@capacitor/app");
      const info = await App.getInfo();
      return {
        version: info.version ?? "",
        build: info.build ?? "",
      };
    } catch {
      /* fall through to web metadata */
    }
  }
  return webVersion();
}

/** React hook wrapper for `getAppVersion`. */
export function useAppVersion(): AppVersionInfo | null {
  const [info, setInfo] = useState<AppVersionInfo | null>(null);
  useEffect(() => {
    let cancelled = false;
    void getAppVersion().then((v) => {
      if (!cancelled) setInfo(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return info;
}
