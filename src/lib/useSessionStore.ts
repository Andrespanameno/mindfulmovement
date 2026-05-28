import { useEffect, useState } from "react";
import type { Movement } from "./movements";

const KEY = "mm-session-state";

export const HYDRATION_GOAL_OZ = 64;
export const HYDRATION_XP_PER_8OZ = 5;
export const QUICK_ADDS_OZ = [8, 12, 16] as const;
export const STREAK_BONUS_XP = 20;
export const HISTORY_DAYS = 90;

export interface DailyEntry {
  date: string;
  sessions: number;
  minutes: number;
  pushups: number;
  squats: number;
  breathing: number;
  ouncesLogged: number;
  hitHydrationGoal: boolean;
  xp: number;
}

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
  totalSessions: number;
  totalMinutes: number;
  totalPushups: number;
  totalSquats: number;
  totalBreathing: number;
  history: Record<string, DailyEntry>;
  lastHydrationAdd: number;
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const today = () => localDateKey(new Date());
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateKey(d);
};
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDateKey(d);
};
export { localDateKey };

function seedHistory(): Record<string, DailyEntry> {
  const h: Record<string, DailyEntry> = {};
  // Two weeks of gentle, realistic activity so trends look meaningful
  const seed = [
    { d: 13, s: 2, m: 7, pu: 0, sq: 0, br: 1, oz: 48, hit: false },
    { d: 12, s: 1, m: 3, pu: 0, sq: 0, br: 1, oz: 56, hit: false },
    { d: 11, s: 3, m: 11, pu: 5, sq: 0, br: 1, oz: 64, hit: true },
    { d: 10, s: 2, m: 7, pu: 0, sq: 6, br: 1, oz: 56, hit: false },
    { d: 9, s: 3, m: 12, pu: 5, sq: 0, br: 1, oz: 64, hit: true },
    { d: 8, s: 1, m: 3, pu: 0, sq: 0, br: 1, oz: 40, hit: false },
    { d: 7, s: 2, m: 8, pu: 0, sq: 6, br: 1, oz: 64, hit: true },
    { d: 6, s: 3, m: 12, pu: 8, sq: 0, br: 1, oz: 56, hit: false },
    { d: 5, s: 3, m: 11, pu: 0, sq: 0, br: 1, oz: 64, hit: true },
    { d: 4, s: 4, m: 15, pu: 0, sq: 12, br: 2, oz: 72, hit: true },
    { d: 3, s: 3, m: 12, pu: 10, sq: 0, br: 1, oz: 64, hit: true },
    { d: 2, s: 4, m: 16, pu: 0, sq: 12, br: 2, oz: 64, hit: true },
    { d: 1, s: 3, m: 11, pu: 10, sq: 0, br: 1, oz: 56, hit: false },
  ];
  for (const r of seed) {
    const date = daysAgo(r.d);
    h[date] = {
      date,
      sessions: r.s,
      minutes: r.m,
      pushups: r.pu,
      squats: r.sq,
      breathing: r.br,
      ouncesLogged: r.oz,
      hitHydrationGoal: r.hit,
      xp: r.s * 35 + (r.hit ? 20 : 0),
    };
  }
  return h;
}

const seededHistory = (typeof window === "undefined" ? {} : seedHistory());
const seedTotals = Object.values(seededHistory).reduce(
  (acc, e) => ({
    sessions: acc.sessions + e.sessions,
    minutes: acc.minutes + e.minutes,
    pushups: acc.pushups + e.pushups,
    squats: acc.squats + e.squats,
    breathing: acc.breathing + e.breathing,
  }),
  { sessions: 0, minutes: 0, pushups: 0, squats: 0, breathing: 0 },
);

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
  totalSessions: seedTotals.sessions,
  totalMinutes: seedTotals.minutes,
  totalPushups: seedTotals.pushups,
  totalSquats: seedTotals.squats,
  totalBreathing: seedTotals.breathing,
  history: seededHistory,
  lastHydrationAdd: 0,
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
        lastHydrationAdd: 0,
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

function rolloverIfNeeded() {
  if (state.lastDate === today()) return;
  setState((s) => ({
    ...s,
    xpToday: 0,
    completedToday: [],
    ouncesToday: 0,
    hydrationXpToday: 0,
    lastDate: today(),
    lastHydrationAdd: 0,
  }));
}

let midnightTimer: number | null = null;
function scheduleMidnightRollover() {
  if (typeof window === "undefined") return;
  if (midnightTimer !== null) window.clearTimeout(midnightTimer);
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 5, 0); // 12:00:05 AM next day (a few seconds past midnight)
  const ms = Math.max(1000, next.getTime() - now.getTime());
  midnightTimer = window.setTimeout(() => {
    rolloverIfNeeded();
    scheduleMidnightRollover();
  }, ms);
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") rolloverIfNeeded();
  });
  window.addEventListener("focus", () => rolloverIfNeeded());
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

function ensureDay(history: Record<string, DailyEntry>, date: string): DailyEntry {
  return (
    history[date] ?? {
      date,
      sessions: 0,
      minutes: 0,
      pushups: 0,
      squats: 0,
      breathing: 0,
      ouncesLogged: 0,
      hitHydrationGoal: false,
      xp: 0,
    }
  );
}

function trimHistory(history: Record<string, DailyEntry>): Record<string, DailyEntry> {
  const cutoff = daysAgo(HISTORY_DAYS);
  const out: Record<string, DailyEntry> = {};
  for (const [k, v] of Object.entries(history)) {
    if (k >= cutoff) out[k] = v;
  }
  return out;
}

export function completeMovement(movement: Movement) {
  setState((s) => {
    if (s.completedToday.includes(movement.id)) return s;
    const afterActivity = applyActivity(s, movement.xp);
    const t = today();
    const day = ensureDay(afterActivity.history, t);
    const isBreathing = movement.category === "breath-calm";
    const updated: DailyEntry = {
      ...day,
      sessions: day.sessions + 1,
      minutes: day.minutes + movement.duration,
      pushups: day.pushups + (movement.repsType === "pushups" ? movement.reps ?? 0 : 0),
      squats: day.squats + (movement.repsType === "squats" ? movement.reps ?? 0 : 0),
      breathing: day.breathing + (isBreathing ? 1 : 0),
      xp: day.xp + movement.xp,
    };
    return {
      ...afterActivity,
      completedToday: [...s.completedToday, movement.id],
      totalSessions: s.totalSessions + 1,
      totalMinutes: s.totalMinutes + movement.duration,
      totalPushups:
        s.totalPushups + (movement.repsType === "pushups" ? movement.reps ?? 0 : 0),
      totalSquats:
        s.totalSquats + (movement.repsType === "squats" ? movement.reps ?? 0 : 0),
      totalBreathing: s.totalBreathing + (isBreathing ? 1 : 0),
      history: trimHistory({ ...afterActivity.history, [t]: updated }),
    };
  });
}

export function uncompleteMovement(movement: Movement) {
  setState((s) => {
    if (!s.completedToday.includes(movement.id)) return s;
    const t = today();
    const day = ensureDay(s.history, t);
    const pushups = movement.repsType === "pushups" ? movement.reps ?? 0 : 0;
    const squats = movement.repsType === "squats" ? movement.reps ?? 0 : 0;
    const isBreathing = movement.category === "breath-calm";
    const updatedDay: DailyEntry = {
      ...day,
      sessions: Math.max(0, day.sessions - 1),
      minutes: Math.max(0, day.minutes - movement.duration),
      pushups: Math.max(0, day.pushups - pushups),
      squats: Math.max(0, day.squats - squats),
      breathing: Math.max(0, day.breathing - (isBreathing ? 1 : 0)),
      xp: Math.max(0, day.xp - movement.xp),
    };
    return {
      ...s,
      completedToday: s.completedToday.filter((id) => id !== movement.id),
      xpToday: Math.max(0, s.xpToday - movement.xp),
      totalXp: Math.max(0, s.totalXp - movement.xp),
      totalSessions: Math.max(0, s.totalSessions - 1),
      totalMinutes: Math.max(0, s.totalMinutes - movement.duration),
      totalPushups: Math.max(0, s.totalPushups - pushups),
      totalSquats: Math.max(0, s.totalSquats - squats),
      totalBreathing: Math.max(0, s.totalBreathing - (isBreathing ? 1 : 0)),
      history: { ...s.history, [t]: updatedDay },
    };
  });
}

export function logHydration(deltaOz: number) {
  setState((s) => {
    const nextOz = Math.max(0, s.ouncesToday + deltaOz);
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
    const day = ensureDay(s.history, t);
    const updatedDay: DailyEntry = {
      ...day,
      ouncesLogged: nextOz,
      hitHydrationGoal: nextOz >= HYDRATION_GOAL_OZ,
      xp: day.xp + xpDelta,
    };
    const base: SessionState = {
      ...s,
      ouncesToday: nextOz,
      hydrationXpToday: s.hydrationXpToday + xpDelta,
      hydrationGoalReachedDates: reached,
      history: trimHistory({ ...s.history, [t]: updatedDay }),
      lastHydrationAdd: deltaOz > 0 ? deltaOz : s.lastHydrationAdd,
    };
    if (xpDelta <= 0) return base;
    return applyActivity(base, xpDelta);
  });
}

export function undoLastHydration() {
  const amount = state.lastHydrationAdd;
  if (amount <= 0 || state.ouncesToday === 0) return;
  logHydration(-amount);
  setState((s) => ({ ...s, lastHydrationAdd: 0 }));
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

export interface StatsSnapshot {
  totalXp: number;
  xpToday: number;
  streak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  streakBonusDate: string | null;
}

export function getStatsSnapshot(): StatsSnapshot {
  return {
    totalXp: state.totalXp,
    xpToday: state.xpToday,
    streak: state.streak,
    bestStreak: state.bestStreak,
    lastActiveDate: state.lastActiveDate,
    streakBonusDate: state.streakBonusDate,
  };
}

export function hydrateStats(snap: Partial<StatsSnapshot>) {
  setState((s) => ({
    ...s,
    totalXp: snap.totalXp ?? s.totalXp,
    xpToday: snap.xpToday ?? s.xpToday,
    streak: snap.streak ?? s.streak,
    bestStreak: snap.bestStreak ?? s.bestStreak,
    lastActiveDate: snap.lastActiveDate ?? s.lastActiveDate,
    streakBonusDate: snap.streakBonusDate ?? s.streakBonusDate,
  }));
}

export function subscribeToStats(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export interface HistoryHydration {
  history: Record<string, DailyEntry>;
  totals: {
    totalSessions: number;
    totalMinutes: number;
    totalPushups: number;
    totalSquats: number;
    totalBreathing: number;
  };
  todayOunces?: number;
}

export function hydrateHistory(payload: HistoryHydration) {
  setState((s) => {
    const t = today();
    const dbToday = payload.history[t];
    return {
      ...s,
      history: trimHistory(payload.history),
      totalSessions: payload.totals.totalSessions,
      totalMinutes: payload.totals.totalMinutes,
      totalPushups: payload.totals.totalPushups,
      totalSquats: payload.totals.totalSquats,
      totalBreathing: payload.totals.totalBreathing,
      ouncesToday: payload.todayOunces ?? dbToday?.ouncesLogged ?? s.ouncesToday,
      lastHydrationAdd: 0,
    };
  });
}

export function useSessionStore(): SessionState {
  const [, force] = useState(0);
  useEffect(() => {
    if (!hydrated) {
      state = read();
      hydrated = true;
      rolloverIfNeeded();
      scheduleMidnightRollover();
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