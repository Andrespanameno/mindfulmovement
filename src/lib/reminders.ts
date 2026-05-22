import { useEffect, useState } from "react";

export const MOVEMENT_REMINDERS = [
  "Time for a quick movement reset?",
  "Let's stand and stretch for a minute.",
  "Movement helps reset the mind.",
  "Roll your shoulders — slow and easy.",
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

export function formatHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:00 ${period}`;
}