import { useEffect, useState } from "react";

export const MOVEMENT_REMINDERS = [
  "Time for a quick movement reset?",
  "Let's stand and stretch for a minute.",
  "Movement helps reset the mind.",
  "Roll your shoulders, slow and easy.",
  "A small walk now will feel great later.",
];

export const HYDRATION_REMINDERS = [
  "Hydration checkpoint.",
  "A glass of water is a gentle reset.",
  "Small sips, steady focus.",
];

export const BREATH_REMINDERS = [
  "Take a few intentional breaths.",
  "Inhale slow, exhale slower.",
  "One mindful breath, right now.",
];

export type ReminderKind = "movement" | "hydration" | "breath";

export interface ReminderSettings {
  enabled: boolean;
  startHour: number; // 0-23
  endHour: number; // 0-23, exclusive
  intervalMin: 30 | 60 | 90 | 120;
  movement: boolean;
  hydration: boolean;
  breath: boolean;
  quietWeekends: boolean;
}

const KEY = "mm-reminder-settings";

const defaults: ReminderSettings = {
  enabled: true,
  startHour: 8,
  endHour: 16,
  intervalMin: 60,
  movement: true,
  hydration: true,
  breath: true,
  quietWeekends: false,
};

let state: ReminderSettings = defaults;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): ReminderSettings {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) as Partial<ReminderSettings>) };
  } catch {
    return defaults;
  }
}

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

export function updateReminderSettings(patch: Partial<ReminderSettings>) {
  state = { ...state, ...patch };
  persist();
}

export function hydrateReminderSettings(patch: Partial<ReminderSettings>) {
  state = { ...state, ...patch };
  hydrated = true;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

export function subscribeToReminderSettings(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useReminderSettings(): ReminderSettings {
  const [, force] = useState(0);
  useEffect(() => {
    if (!hydrated) {
      state = read();
      hydrated = true;
    }
    const l = () => force((n) => n + 1);
    listeners.add(l);
    force((n) => n + 1);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return state;
}

export function getReminderSettings(): ReminderSettings {
  if (!hydrated && typeof window !== "undefined") {
    state = read();
    hydrated = true;
  }
  return state;
}

export function pickReminder(s: ReminderSettings): { kind: ReminderKind; text: string } | null {
  const pool: { kind: ReminderKind; text: string }[] = [];
  if (s.movement) MOVEMENT_REMINDERS.forEach((t) => pool.push({ kind: "movement", text: t }));
  if (s.hydration) HYDRATION_REMINDERS.forEach((t) => pool.push({ kind: "hydration", text: t }));
  if (s.breath) BREATH_REMINDERS.forEach((t) => pool.push({ kind: "breath", text: t }));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function isWithinActiveWindow(s: ReminderSettings, d = new Date()): boolean {
  if (!s.enabled) return false;
  const day = d.getDay();
  if (s.quietWeekends && (day === 0 || day === 6)) return false;
  const h = d.getHours();
  if (s.startHour <= s.endHour) return h >= s.startHour && h < s.endHour;
  // wraps midnight
  return h >= s.startHour || h < s.endHour;
}

/**
 * Returns true if `d` falls on a scheduled dispatch slot for the user's
 * interval. Dispatch slots are tuned to give the user time to complete a
 * 5–6 minute session before the next interval ends:
 *   - 30 min  → fire at :30 every active hour
 *   - 60 min  → fire at :55 every active hour (near end of hour)
 *   - 90 min  → fire at the next full hour after startHour, then +90m
 *               (i.e. (startHour+1):00, +1:30, +3:00, +4:30…)
 *   - 120 min → fire at :55 every other active hour, anchored at startHour
 */
export function isDispatchSlot(s: ReminderSettings, d = new Date()): boolean {
  if (!isWithinActiveWindow(s, d)) return false;
  const h = d.getHours();
  const m = d.getMinutes();
  switch (s.intervalMin) {
    case 30:
      return m === 30;
    case 60:
      return m === 55;
    case 90: {
      const base = s.startHour + 1; // next full hour after window begins
      const minutesFromBase = (h - base) * 60 + m;
      return minutesFromBase >= 0 && minutesFromBase % 90 === 0;
    }
    case 120:
      return m === 55 && ((h - s.startHour) % 2 === 0);
    default:
      return false;
  }
}

/** Server-side variant that uses UTC hours/minutes (the cron path). */
export function isDispatchSlotUTC(
  s: {
    enabled: boolean;
    start_hour: number;
    end_hour: number;
    interval_min: number;
    quiet_weekends: boolean;
  },
  d: Date,
): boolean {
  if (!s.enabled) return false;
  const day = d.getUTCDay();
  if (s.quiet_weekends && (day === 0 || day === 6)) return false;
  const h = d.getUTCHours();
  const inWindow =
    s.start_hour <= s.end_hour
      ? h >= s.start_hour && h < s.end_hour
      : h >= s.start_hour || h < s.end_hour;
  if (!inWindow) return false;
  const m = d.getUTCMinutes();
  switch (s.interval_min) {
    case 30:
      return m === 30;
    case 60:
      return m === 55;
    case 90: {
      const base = s.start_hour + 1;
      const minutesFromBase = (h - base) * 60 + m;
      return minutesFromBase >= 0 && minutesFromBase % 90 === 0;
    }
    case 120:
      return m === 55 && ((h - s.start_hour) % 2 === 0);
    default:
      return false;
  }
}

export function formatHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:00 ${period}`;
}