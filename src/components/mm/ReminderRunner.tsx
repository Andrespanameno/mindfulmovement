import { useEffect } from "react";
import { toast } from "sonner";
import {
  useReminderSettings,
  isWithinActiveWindow,
  pickReminder,
} from "@/lib/reminders";

const LAST_KEY = "mm-reminder-last-fired";

function readLast(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(LAST_KEY) || 0);
}

function writeLast(t: number) {
  if (typeof window !== "undefined") localStorage.setItem(LAST_KEY, String(t));
}

function notify(title: string, body: string) {
  if (typeof window === "undefined") return;
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, { body, icon: "/favicon.ico", silent: false });
      return;
    } catch {
      /* fall through to toast */
    }
  }
  toast(title, { description: body, duration: 6000 });
}

export function ReminderRunner() {
  const settings = useReminderSettings();

  useEffect(() => {
    const tick = () => {
      if (!isWithinActiveWindow(settings)) return;
      const now = Date.now();
      const last = readLast();
      const intervalMs = settings.intervalMin * 60 * 1000;
      if (now - last < intervalMs - 30 * 1000) return;
      const r = pickReminder(settings);
      if (!r) return;
      writeLast(now);
      const title =
        r.kind === "movement"
          ? "Mindful Movement"
          : r.kind === "hydration"
            ? "Hydration check"
            : "Breath check";
      notify(title, r.text);
    };

    // schedule at the next minute boundary so hourly fires land near :00
    const now = new Date();
    const msToNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    let interval: number | undefined;
    const startTimer = window.setTimeout(() => {
      tick();
      interval = window.setInterval(tick, 60 * 1000);
    }, msToNextMinute);

    return () => {
      window.clearTimeout(startTimer);
      if (interval) window.clearInterval(interval);
    };
  }, [settings]);

  return null;
}