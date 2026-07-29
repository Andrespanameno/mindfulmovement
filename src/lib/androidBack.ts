import { App } from "@capacitor/app";
import { isNative } from "./native";

/** Routes considered "root" — pressing back here exits the app. */
const ROOT_ROUTES = ["/", "/home"];

/**
 * Android hardware back button handling.
 *
 * Priority:
 *  1. Dismiss any open overlay (Radix dialog/sheet/popover or custom modal).
 *  2. Go back in history when there is somewhere to go.
 *  3. Exit the app only from a root route.
 *
 * No-op on iOS and the web (there is no `backButton` event there), so
 * existing behavior is unchanged.
 */
export function registerAndroidBackHandler(): () => void {
  if (!isNative()) return () => {};

  const handle = App.addListener("backButton", ({ canGoBack }) => {
    if (dismissTopOverlay()) return;

    const path = window.location.pathname;
    if (canGoBack && !ROOT_ROUTES.includes(path)) {
      window.history.back();
      return;
    }

    if (ROOT_ROUTES.includes(path)) {
      void App.exitApp();
      return;
    }

    window.history.back();
  });

  return () => {
    void Promise.resolve(handle).then((h) => h.remove());
  };
}

/** Closes the top-most open overlay, if any. Returns true when one was closed. */
function dismissTopOverlay(): boolean {
  if (typeof document === "undefined") return false;

  const radix = Array.from(
    document.querySelectorAll<HTMLElement>("[data-state='open'][role='dialog'], [data-radix-popper-content-wrapper]"),
  );
  if (radix.length > 0) {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    );
    return true;
  }

  // Custom overlays (WelcomeModal / FirstTimeTutorial) listen for Escape too.
  const custom = document.querySelector<HTMLElement>("[data-mm-overlay='open']");
  if (custom) {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    );
    return true;
  }

  return false;
}
