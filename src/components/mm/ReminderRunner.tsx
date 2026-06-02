import { useEffect } from "react";
import { toast } from "sonner";
import {
  useReminderSettings,
  isDispatchSlot,
  pickReminder,
} from "@/lib/reminders";
import { useI18n } from "@/lib/i18n";

const LAST_KEY = "mm-reminder-last-fired";

function readLast(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(LAST_KEY) || 0);
}

function writeLast(t: number) {
  if (typeof window !== "undefined") localStorage.setItem(LAST_KEY, String(t));
}

function notify(title: string, body: string, actionLabel: string) {
  if (typeof window === "undefined") return;
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      const n = new Notification(title, { body, icon: "/favicon.ico", silent: false });
      n.onclick = () => {
        window.focus();
        window.location.assign("/session");
        n.close();
      };
      return;
    } catch {
      /* fall through to toast */
    }
  }
  toast(title, {
    description: body,
    duration: 10000,
    action: {
      label: actionLabel,
      onClick: () => {
        window.location.assign("/session");
      },
    },
  });
}

export function ReminderRunner() {
  const settings = useReminderSettings();
  const { lang, t } = useI18n();

  useEffect(() => {
    const tick = () => {
      const nowDate = new Date();
      if (!isDispatchSlot(settings, nowDate)) return;
      const now = nowDate.getTime();
      const last = readLast();
      // Guard against duplicate fires within the same interval block.
      const intervalMs = settings.intervalMin * 60 * 1000;
      if (now - last < intervalMs - 90 * 1000) return;
      const r = pickReminder(settings, lang);
      if (!r) return;
      writeLast(now);
      const title =
        r.kind === "movement"
          ? t("notif.movement.title")
          : r.kind === "hydration"
            ? t("notif.hydration.title")
            : t("notif.breath.title");
      notify(title, r.text, t("notif.action_start"));
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
  }, [settings, lang, t]);

  return null;
}