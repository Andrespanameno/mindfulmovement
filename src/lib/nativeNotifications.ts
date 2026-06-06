import { LocalNotifications, type ScheduleOptions } from "@capacitor/local-notifications";
import { isNative } from "./native";
import { isDispatchSlot, pickReminder, type ReminderSettings } from "./reminders";

const ID_MIN = 1000;
const ID_MAX = 1999;
const MAX_PENDING = 60; // iOS caps at 64; leave a small buffer
const WINDOW_DAYS = 14;

type Lang = "en" | "es";

const TITLES: Record<"movement" | "hydration" | "breath", Record<Lang, string>> = {
  movement: { en: "Mindful Movement", es: "Hora de moverte" },
  hydration: { en: "Hydration check", es: "Pausa de hidratación" },
  breath: { en: "Breath check", es: "Pausa para respirar" },
};

export type NativePermissionState = "granted" | "denied" | "prompt";

function normalizeDisplay(state: string | undefined): NativePermissionState {
  if (state === "granted") return "granted";
  if (state === "denied") return "denied";
  return "prompt";
}

export async function getNativePermission(): Promise<NativePermissionState> {
  if (!isNative()) return "prompt";
  try {
    const res = await LocalNotifications.checkPermissions();
    const state = normalizeDisplay(res.display);
    console.info("[nativeNotifications] checkPermissions ->", state);
    return state;
  } catch (err) {
    console.error("[nativeNotifications] checkPermissions failed:", err);
    return "prompt";
  }
}

export async function requestNativePermission(): Promise<NativePermissionState> {
  if (!isNative()) return "prompt";
  try {
    const res = await LocalNotifications.requestPermissions();
    const state = normalizeDisplay(res.display);
    console.info("[nativeNotifications] requestPermissions ->", state);
    return state;
  } catch (err) {
    console.error("[nativeNotifications] requestPermissions failed:", err);
    return "denied";
  }
}

export async function ensureNativePermissionAndSync(
  settings: ReminderSettings,
  lang: Lang = "en",
): Promise<NativePermissionState> {
  if (!isNative()) return "prompt";

  const checked = await getNativePermission();
  console.info("[nativeNotifications] checkPermissions ->", checked, settings);

  let permission = checked;
  if (permission === "prompt") {
    permission = await requestNativePermission();
  }

  if (permission === "granted") {
    await scheduleReminders(settings, lang);
  } else {
    await cancelOurs();
  }

  return permission;
}

async function cancelOurs(): Promise<void> {
  try {
    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter(
      (n) => typeof n.id === "number" && n.id >= ID_MIN && n.id <= ID_MAX,
    );
    if (ours.length === 0) return;
    await LocalNotifications.cancel({
      notifications: ours.map((n) => ({ id: n.id })),
    });
  } catch (err) {
    console.error("[nativeNotifications] cancel failed:", err);
  }
}

/**
 * Computes the next batch of dispatch slots using the same cadence rules as
 * the in-app `ReminderRunner`, then schedules them as native local
 * notifications. Always clears previously-scheduled reminders first.
 */
export async function scheduleReminders(
  settings: ReminderSettings,
  lang: Lang = "en",
): Promise<void> {
  if (!isNative()) return;

  const perm = await getNativePermission();
  if (perm !== "granted") {
    await cancelOurs();
    return;
  }

  await cancelOurs();

  if (!settings.enabled) return;
  if (!settings.movement && !settings.hydration && !settings.breath) return;

  // Walk forward minute by minute, picking matching dispatch slots.
  const slots: Date[] = [];
  const start = new Date();
  // Round up to the next minute boundary so we never schedule in the past.
  start.setSeconds(0, 0);
  start.setMinutes(start.getMinutes() + 1);
  const horizon = new Date(start.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const cursor = new Date(start);
  while (cursor < horizon && slots.length < MAX_PENDING) {
    if (isDispatchSlot(settings, cursor)) {
      slots.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  if (slots.length === 0) return;

  const notifications: ScheduleOptions["notifications"] = slots.map((at, i) => {
    const r = pickReminder(settings, lang) ?? {
      kind: "movement" as const,
      text: lang === "es" ? "Pausa breve." : "Quick reset.",
    };
    return {
      id: ID_MIN + i,
      title: TITLES[r.kind][lang],
      body: r.text,
      schedule: { at, allowWhileIdle: true },
      extra: { route: "/session" },
    };
  });

  try {
    await LocalNotifications.schedule({ notifications });
  } catch (err) {
    console.error("[nativeNotifications] schedule failed:", err);
  }
}

export async function cancelAllReminders(): Promise<void> {
  if (!isNative()) return;
  await cancelOurs();
}

export async function scheduleTestNotification(lang: Lang = "en"): Promise<boolean> {
  if (!isNative()) return false;

  try {
    const at = new Date(Date.now() + 10_000);
    console.info("[nativeNotifications] scheduling test notification for", at.toISOString());
    await LocalNotifications.schedule({
      notifications: [
        {
          id: ID_MAX + 1,
          title: lang === "es" ? "Prueba de Mindful Movement" : "Mindful Movement test",
          body:
            lang === "es"
              ? "Si ves esto, las notificaciones nativas están funcionando."
              : "If you see this, native notifications are working.",
          schedule: { at, allowWhileIdle: true },
          extra: { route: "/session", test: true },
        },
      ],
    });
    return true;
  } catch (err) {
    console.error("[nativeNotifications] test notification schedule failed:", err);
    return false;
  }
}
