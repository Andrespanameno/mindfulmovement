import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
const KEY = "mm-theme";
const listeners = new Set<(t: Theme) => void>();
let current: Theme = "light";
let initialized = false;

function read(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
}

export function initTheme() {
  if (initialized || typeof window === "undefined") return;
  current = read();
  apply(current);
  initialized = true;
}

export function getTheme(): Theme {
  if (!initialized) initTheme();
  return current;
}

export function setTheme(t: Theme) {
  current = t;
  if (typeof window !== "undefined") localStorage.setItem(KEY, t);
  apply(t);
  listeners.forEach((l) => l(t));
}

export function toggleTheme() {
  setTheme(current === "dark" ? "light" : "dark");
}

export function useTheme(): Theme {
  const [t, setT] = useState<Theme>(() => (initialized ? current : "light"));
  useEffect(() => {
    initTheme();
    setT(current);
    const l = (next: Theme) => setT(next);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return t;
}