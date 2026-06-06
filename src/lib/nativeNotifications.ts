import { LocalNotifications, type ScheduleOptions } from "@capacitor/local-notifications";
import { isNative } from "./native";
import { type ReminderSettings } from "./reminders";

const ID_MIN = 1000;
const ID_MAX = 1999;
const MAX_PENDING = 60; // iOS caps at 64; leave a small buffer
const WINDOW_DAYS = 14;

type Lang = "en" | "es";

const NATIVE_TITLE: Record<Lang, string> = {
  en: "Mindful Movement",
  es: "Mindful Movement",
};

const GENERIC_BODIES: Record<Lang, string[]> = {
  en: [
    "Time for a mindful reset",
    "Ready for a quick movement break?",
    "Take a few minutes to move",
    "Your next reset is ready",
    "A small movement can help",
    "Time to move with intention",
    "Let's take a quick reset",
    "Your mindful movement is ready",
  ],
  es: [
    "Tiempo para un reset consciente",
    "¿Listo para una pausa de movimiento?",
    "Tómate unos minutos para moverte",
    "Tu siguiente reset está listo",
    "Un pequeño movimiento puede ayudar",
    "Es hora de moverte con intención",
    "Hagamos un reset rápido",
    "Tu movimiento consciente está listo",
  ],
};

function pickGenericBody(lang: Lang): string {
  const pool = GENERIC_BODIES[lang] ?? GENERIC_BODIES.en;
  return pool[Math.floor(Math.random() * pool.length)];
}

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

  const slots = generateScheduledSlots(settings, new Date(), WINDOW_DAYS, MAX_PENDING);
  console.info("[nativeNotifications] schedule plan", {
    cadence: settings.intervalMin,
    activeHours: `${settings.startHour}-${settings.endHour}`,
    quietWeekends: settings.quietWeekends,
    count: slots.length,
    times: slots.map((d) => d.toString()),
  });

  if (slots.length === 0) return;

  const notifications: ScheduleOptions["notifications"] = slots.map((at, i) => {
    return {
      id: ID_MIN + i,
      title: NATIVE_TITLE[lang],
      body: pickGenericBody(lang),
      schedule: { at, allowWhileIdle: true },
      extra: { route: "/session" },
    };
  });

  try {
    await LocalNotifications.schedule({ notifications });
    console.info(
      `[nativeNotifications] scheduled ${notifications.length} local notifications`,
    );
  } catch (err) {
    console.error("[nativeNotifications] schedule failed:", err);
  }
}

/**
 * Build the exact list of local notification fire times based on the user's
 * selected cadence + active hours. All times use the device's local
 * timezone. Slots in the past (relative to `now`) are skipped. Duplicate
 * timestamps are removed.
 *
 * Cadence rules:
 *   - 30  → :00 and :30 within active hours
 *   - 60  → :00 of each active hour
 *   - 90  → first slot at (startHour+1):30, then every 90 min (within window)
 *   - 120 → :00 every 2 hours, anchored at startHour (within window)
 */
export function generateScheduledSlots(
  s: ReminderSettings,
  now: Date,
  days: number,
  max: number,
): Date[] {
  const seen = new Set<number>();
  const out: Date[] = [];
  let skippedPast = 0;
  let skippedDup = 0;

  for (let d = 0; d < days && out.length < max; d++) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() + d);

    if (s.quietWeekends) {
      const dow = day.getDay();
      if (dow === 0 || dow === 6) continue;
    }

    const dayStart = new Date(day);
    dayStart.setHours(s.startHour, 0, 0, 0);
    const dayEnd = new Date(day);
    // endHour is exclusive (no notifications at or after endHour:00)
    dayEnd.setHours(s.endHour, 0, 0, 0);
    // If active hours wrap midnight, extend to next day
    if (s.endHour <= s.startHour) {
      dayEnd.setDate(dayEnd.getDate() + 1);
    }

    const slots = slotsForDay(s, dayStart, dayEnd);
    for (const t of slots) {
      if (out.length >= max) break;
      if (t.getTime() <= now.getTime()) {
        skippedPast++;
        continue;
      }
      const key = t.getTime();
      if (seen.has(key)) {
        skippedDup++;
        continue;
      }
      seen.add(key);
      out.push(t);
    }
  }

  if (skippedPast || skippedDup) {
    console.info("[nativeNotifications] slot filter", { skippedPast, skippedDup });
  }
  return out;
}

function slotsForDay(s: ReminderSettings, dayStart: Date, dayEnd: Date): Date[] {
  const out: Date[] = [];
  const startMs = dayStart.getTime();
  const endMs = dayEnd.getTime();

  switch (s.intervalMin) {
    case 30: {
      // :00 and :30 of every active hour
      for (let t = startMs; t < endMs; t += 30 * 60 * 1000) {
        out.push(new Date(t));
      }
      break;
    }
    case 60: {
      for (let t = startMs; t < endMs; t += 60 * 60 * 1000) {
        out.push(new Date(t));
      }
      break;
    }
    case 90: {
      // First slot at (startHour+1):30 local
      const first = new Date(dayStart);
      first.setHours(s.startHour + 1, 30, 0, 0);
      for (let t = first.getTime(); t < endMs; t += 90 * 60 * 1000) {
        if (t >= startMs) out.push(new Date(t));
      }
      break;
    }
    case 120: {
      for (let t = startMs; t < endMs; t += 120 * 60 * 1000) {
        out.push(new Date(t));
      }
      break;
    }
  }
  return out;
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
