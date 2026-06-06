/**
 * Cross-surface dedup for reminders. Prevents native notification taps and
 * in-app toasts from triggering overlapping guided sessions for the same
 * scheduled reminder window.
 */

const HANDLED_KEY = "mm-reminder-handled-at";
const SESSION_ACTIVE_KEY = "mm-session-active";

// A reminder is considered "the same event" within this window.
export const DEDUP_WINDOW_MS = 5 * 60 * 1000;

export function markReminderHandled(at: number = Date.now()): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HANDLED_KEY, String(at));
  } catch {
    /* ignore */
  }
}

export function wasReminderRecentlyHandled(
  windowMs: number = DEDUP_WINDOW_MS,
): boolean {
  if (typeof window === "undefined") return false;
  const raw = Number(localStorage.getItem(HANDLED_KEY) || 0);
  if (!raw) return false;
  return Date.now() - raw < windowMs;
}

export function setGuidedSessionActive(active: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (active) sessionStorage.setItem(SESSION_ACTIVE_KEY, "1");
    else sessionStorage.removeItem(SESSION_ACTIVE_KEY);
  } catch {
    /* ignore */
  }
}

export function isGuidedSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_ACTIVE_KEY) === "1";
  } catch {
    return false;
  }
}

/** True if the user is already on the guided session route. */
export function isOnSessionRoute(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/session");
}

/**
 * Should we suppress a new reminder surface (toast or auto-navigation)?
 * Suppress if a native tap was just handled, or a guided session is active,
 * or the user is already on /session.
 */
export function shouldSuppressReminder(): boolean {
  return (
    wasReminderRecentlyHandled() ||
    isGuidedSessionActive() ||
    isOnSessionRoute()
  );
}