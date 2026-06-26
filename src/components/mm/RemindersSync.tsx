import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { isNative } from "@/lib/native";
import { scheduleReminders } from "@/lib/nativeNotifications";
import {
  getReminderSettings,
  hydrateReminderSettings,
  subscribeToReminderSettings,
  type ReminderSettings,
} from "@/lib/reminders";

/**
 * Bridges local reminder settings and the `reminder_settings` table.
 * - On sign-in: pulls from DB into local state (DB is source of truth).
 * - On local changes: debounced upsert back to DB.
 */
export function RemindersSync() {
  const { user } = useAuth();
  const { lang } = useI18n();
  const hydratedRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastSentRef = useRef<string>("");

  useEffect(() => {
    if (!user) {
      hydratedRef.current = null;
      return;
    }
    if (hydratedRef.current === user.id) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("reminder_settings")
        .select(
          "enabled, start_hour, end_hour, interval_min, movement, hydration, breath, active_days",
        )
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error("[reminder_settings] load failed:", error.message);
        return;
      }
      if (data) {
        const snap: Partial<ReminderSettings> = {
          enabled: data.enabled,
          startHour: data.start_hour,
          endHour: data.end_hour,
          intervalMin: data.interval_min as ReminderSettings["intervalMin"],
          movement: data.movement,
          hydration: data.hydration,
          breath: data.breath,
          activeDays: data.active_days ?? 127,
        };
        hydrateReminderSettings(snap);
        lastSentRef.current = JSON.stringify(snap);
      }
      hydratedRef.current = user.id;
      if (isNative()) {
        void scheduleReminders(getReminderSettings(), lang);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, lang]);

  useEffect(() => {
    if (!user) return;

    const flush = async () => {
      if (hydratedRef.current !== user.id) return;
      const s = getReminderSettings();
      const snap = {
        enabled: s.enabled,
        startHour: s.startHour,
        endHour: s.endHour,
        intervalMin: s.intervalMin,
        movement: s.movement,
        hydration: s.hydration,
        breath: s.breath,
        activeDays: s.activeDays,
      };
      const sig = JSON.stringify(snap);
      if (sig === lastSentRef.current) return;
      lastSentRef.current = sig;
      const { error } = await supabase.from("reminder_settings").upsert(
        {
          user_id: user.id,
          enabled: s.enabled,
          start_hour: s.startHour,
          end_hour: s.endHour,
          interval_min: s.intervalMin,
          movement: s.movement,
          hydration: s.hydration,
          breath: s.breath,
          active_days: s.activeDays,
        },
        { onConflict: "user_id" },
      );
      if (error) console.error("[reminder_settings] upsert failed:", error.message);
      if (isNative()) {
        void scheduleReminders(s, lang);
      }
    };

    const unsub = subscribeToReminderSettings(() => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(flush, 800);
    });

    return () => {
      unsub();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [user, lang]);

  return null;
}