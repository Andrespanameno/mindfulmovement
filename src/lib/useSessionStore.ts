import { useEffect, useState } from "react";

const KEY = "mm-session-state";

export const HYDRATION_GOAL_OZ = 64;
export const HYDRATION_XP_PER_8OZ = 5;
export const QUICK_ADDS_OZ = [8, 12, 16] as const;
export const STREAK_BONUS_XP = 20;

export interface SessionState {
  xpToday: number;
  totalXp: number;
  completedToday: string[]; // movement ids
  lastDate: string; // YYYY-MM-DD
  ouncesToday: number;
  hydrationXpToday: number;
  hydrationGoalReachedDates: string[];
  remindersEnabled: boolean;
  reminderIntervalMin: number;
  lastReminderAt: number | null;
  streak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  streakBonusDate: string | null;
}

const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

const initial: SessionState = {
  xpToday: 0,
  totalXp: 2140,
  completedToday: [],
  lastDate: today(),
  ouncesToday: 0,
  hydrationXpToday: 0,
  hydrationGoalReachedDates: [],
  remindersEnabled: true,
  reminderIntervalMin: 60,
  lastReminderAt: null,
  streak: 12,
  bestStreak: 14,
  lastActiveDate: yesterday(),
  streakBonusDate: null,
};

function read(): SessionState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = { ...initial, ...(JSON.parse(raw) as Partial<SessionState>) } as SessionState;
    if (parsed.lastDate !== today()) {
      return {
        ...parsed,
        xpToday: 0,
        completedToday: [],
        ouncesToday: 0,
        hydrationXpToday: 0,
        lastDate: today(),
      };
    }
    return parsed;
  } catch {
    return initial;
  }
}

const listeners = new Set<() => void>();
let state: SessionState = initial;
let hydrated = false;

function setState(updater: (s: SessionState) => SessionState) {
  state = updater(state);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

function applyActivity(s: SessionState, xpGained: number): SessionState {
  let { streak, bestStreak, lastActiveDate, streakBonusDate, xpToday, totalXp } = s;
  const t = today();
  let bonus = 0;

  if (lastActiveDate !== t) {
    if (lastActiveDate === yesterday()) {
      streak = streak + 1;
    } else {
      streak = 1;
    }
    lastActiveDate = t;
    bestStreak = Math.max(bestStreak, streak);
    if (streakBonusDate !== t) {
      bonus = STREAK_BONUS_XP;
      streakBonusDate = t;
    }
  }

  const gain = xpGained + bonus;
  return {
    ...s,
    xpToday: xpToday + gain,
    totalXp: totalXp + gain,
    streak,
    bestStreak,
    lastActiveDate,
    streakBonusDate,
  };
}

export function completeMovement(id: string, xp: number) {
  setState((s) => {
    if (s.completedToday.includes(id)) return s;
    const next = applyActivity(s, xp);
    return { ...next, completedToday: [...s.completedToday, id] };
  });
}

export function logHydration(deltaOz: number) {
  setState((s) => {
    const max = HYDRATION_GOAL_OZ + 32;
    const nextOz = Math.max(0, Math.min(max, s.ouncesToday + deltaOz));
    if (nextOz === s.ouncesToday) return s;
    const cappedPrev = Math.min(s.ouncesToday, HYDRATION_GOAL_OZ);
    const cappedNext = Math.min(nextOz, HYDRATION_GOAL_OZ);
    const xpDelta = Math.max(
      0,
      Math.floor((cappedNext / 8)) * HYDRATION_XP_PER_8OZ -
        Math.floor((cappedPrev / 8)) * HYDRATION_XP_PER_8OZ,
    );
    const t = today();
    const reached =
      nextOz >= HYDRATION_GOAL_OZ && !s.hydrationGoalReachedDates.includes(t)
        ? [...s.hydrationGoalReachedDates, t]
        : s.hydrationGoalReachedDates;
    const base: SessionState = {
      ...s,
      ouncesToday: nextOz,
      hydrationXpToday: s.hydrationXpToday + xpDelta,
      hydrationGoalReachedDates: reached,
    };
    if (xpDelta <= 0) return base;
    return applyActivity(base, xpDelta);
  });
}

export function setRemindersEnabled(enabled: boolean) {
  setState((s) => ({ ...s, remindersEnabled: enabled, lastReminderAt: Date.now() }));
}

export function setReminderInterval(min: number) {
  setState((s) => ({ ...s, reminderIntervalMin: min }));
}

export function markReminderShown() {
  setState((s) => ({ ...s, lastReminderAt: Date.now() }));
}

export function useSessionStore(): SessionState {
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