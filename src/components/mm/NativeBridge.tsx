import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { App } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Keyboard } from "@capacitor/keyboard";
import { isNative, isAndroid } from "@/lib/native";
import { registerAndroidBackHandler } from "@/lib/androidBack";
import { getReminderSettings } from "@/lib/reminders";
import { scheduleReminders } from "@/lib/nativeNotifications";
import { useI18n } from "@/lib/i18n";
import { completeAuthFromUrl, hasAuthCallbackPayload } from "@/lib/authCallback";
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

  // Android hardware back button.
  useEffect(() => registerAndroidBackHandler(), []);

  // Universal Links (iOS) / App Links (Android) / custom-scheme deep links.
  // Email verification links land here when the app is installed: complete
  // the session in-app, then let AuthGate route to onboarding or home.
  useEffect(() => {
    if (!isNative()) return;

    const handleUrl = async (rawUrl: string) => {
      let path = "/";
      try {
        const parsed = new URL(rawUrl);
        path = parsed.pathname || "/";
      } catch {
        /* keep default */
      }
      if (hasAuthCallbackPayload(rawUrl) || path.startsWith("/auth/callback")) {
        console.info("[NativeBridge] auth deep link received");
        await completeAuthFromUrl(rawUrl);
        // "/" lets AuthGate decide: onboarding for first-time users, home
        // for anyone who already finished profile setup, sign-in if the link
        // was invalid or expired.
        const target = "/";
        try {
          router.navigate({ to: target, replace: true });
        } catch {
          window.location.assign(target);
        }
        return;
      }
      if (path && path !== "/") {
        try {
          router.navigate({ to: path });
        } catch {
          window.location.assign(path);
        }
      }
    };

    const urlHandle = App.addListener("appUrlOpen", (event) => {
      void handleUrl(event.url);
    });

    // Cold start from a link.
    void App.getLaunchUrl().then((launch) => {
      if (launch?.url) void handleUrl(launch.url);
    });

    return () => {
      void Promise.resolve(urlHandle).then((h) => h.remove());
    };
  }, [router]);

  // Android soft-keyboard: pad the body so focused inputs and sticky
  // footers are never covered, and scroll the focused field into view.
  useEffect(() => {
    if (!isNative() || !isAndroid()) return;

    const showHandle = Keyboard.addListener("keyboardWillShow", (info) => {
      document.body.classList.add("kb-open");
      document.body.style.setProperty("--kb-height", `${info.keyboardHeight}px`);
      const active = document.activeElement as HTMLElement | null;
      if (active && typeof active.scrollIntoView === "function") {
        setTimeout(
          () => active.scrollIntoView({ block: "center", behavior: "smooth" }),
          50,
        );
      }
    });

    const hideHandle = Keyboard.addListener("keyboardWillHide", () => {
      document.body.classList.remove("kb-open");
      document.body.style.removeProperty("--kb-height");
    });

    return () => {
      void Promise.resolve(showHandle).then((h) => h.remove());
      void Promise.resolve(hideHandle).then((h) => h.remove());
      document.body.classList.remove("kb-open");
      document.body.style.removeProperty("--kb-height");
    };
  }, []);

  return null;
}