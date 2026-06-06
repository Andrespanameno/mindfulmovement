import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { App } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";
import { isNative } from "@/lib/native";
import { getReminderSettings } from "@/lib/reminders";
import { scheduleReminders } from "@/lib/nativeNotifications";
import { useI18n } from "@/lib/i18n";
import {
  markReminderHandled,
  isOnSessionRoute,
  isGuidedSessionActive,
} from "@/lib/reminderDedup";

/**
 * Native-only glue:
 * - Routes notification taps to /session.
 * - Reschedules local notifications when the app returns to the foreground
 *   so the rolling 14-day window stays topped up.
 */
export function NativeBridge() {
  const router = useRouter();
  const { lang } = useI18n();

  useEffect(() => {
    if (!isNative()) return;

    const tapHandle = LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (event) => {
        const route =
          (event.notification.extra as { route?: string } | undefined)?.route ??
          "/session";
        // Mark this reminder event as handled so any in-app toast
        // for the same scheduled window is suppressed.
        markReminderHandled();
        console.info("[NativeBridge] notification tapped -> route", route);
        // Guard: don't restart an active guided session.
        if (route === "/session" && (isOnSessionRoute() || isGuidedSessionActive())) {
          console.info("[NativeBridge] guided session already active; skipping navigate");
          return;
        }
        try {
          router.navigate({ to: route });
        } catch {
          window.location.assign(route);
        }
      },
    );

    const appHandle = App.addListener("appStateChange", (state) => {
      if (state.isActive) {
        void scheduleReminders(getReminderSettings(), lang);
      }
    });

    return () => {
      void Promise.resolve(tapHandle).then((h) => h.remove());
      void Promise.resolve(appHandle).then((h) => h.remove());
    };
  }, [router, lang]);

  return null;
}