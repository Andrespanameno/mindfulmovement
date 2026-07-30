import { useCallback, useEffect, useState } from "react";
import { CloudOff, RotateCw } from "lucide-react";
import { isNative, isAndroid } from "@/lib/native";

/**
 * Full-screen, branded offline experience.
 *
 * Replaces the WebView's default "Webpage not available" error for any
 * in-app navigation/fetch that fails while the device is offline. Auto-
 * dismisses (and reloads) as soon as connectivity returns.
 */
export function OfflineOverlay() {
  const [offline, setOffline] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setOffline(navigator.onLine === false);

    const goOffline = () => setOffline(true);
    const goOnline = () => {
      setOffline(false);
      // Connection restored: reload so the app fetches whatever failed.
      window.location.reload();
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  const retry = useCallback(() => {
    setRetrying(true);
    window.location.reload();
  }, []);

  const openNetworkSettings = useCallback(() => {
    if (isNative() && isAndroid()) {
      // Android intent URL — handled by the system when supported.
      window.location.href =
        "intent://settings#Intent;action=android.settings.WIFI_SETTINGS;end";
      return;
    }
    if (isNative()) {
      window.location.href = "App-Prefs:root=WIFI";
      return;
    }
    window.location.reload();
  }, []);

  if (!offline) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="mm-offline-title"
      aria-describedby="mm-offline-desc"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background px-6 animate-fade-in"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.5rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
      }}
    >
      <div className="w-full max-w-[400px] rounded-3xl border border-border bg-card p-8 text-center shadow-sm animate-scale-in">
        <div
          aria-hidden="true"
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary"
        >
          <CloudOff className="h-8 w-8 text-muted-foreground" />
        </div>

        <h1
          id="mm-offline-title"
          className="text-xl font-semibold tracking-tight text-card-foreground"
        >
          Let's Get You Moving
        </h1>
        <p
          id="mm-offline-desc"
          className="mx-auto mt-3 max-w-[19rem] text-sm leading-relaxed text-muted-foreground"
        >
          Mindful Movement needs an internet connection to load your
          personalized experience. Reconnect to continue your wellness journey.
        </p>

        <button
          type="button"
          onClick={retry}
          className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[0.9375rem] font-semibold text-primary-foreground transition-opacity active:opacity-85"
        >
          <RotateCw
            className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          Retry
        </button>

        <button
          type="button"
          onClick={openNetworkSettings}
          className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Open Network Settings
        </button>
      </div>
    </div>
  );
}