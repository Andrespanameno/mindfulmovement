import { useEffect, useState } from "react";

const KEY = "mm-session-state";

export interface SessionState {
  xpToday: number;
  totalXp: number;
  completedToday: string[]; // movement ids
  lastDate: string; // YYYY-MM-DD
}

const today = () => new Date().toISOString().slice(0, 10);

const initial: SessionState = {
  xpToday: 450,
  totalXp: 2140,
  completedToday: [],
  lastDate: today(),
};

function read(): SessionState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as SessionState;
    if (parsed.lastDate !== today()) {
      return { ...parsed, xpToday: 0, completedToday: [], lastDate: today() };
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

export function completeMovement(id: string, xp: number) {
  setState((s) => {
    if (s.completedToday.includes(id)) return s;
    return {
      ...s,
      xpToday: s.xpToday + xp,
      totalXp: s.totalXp + xp,
      completedToday: [...s.completedToday, id],
    };
  });
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