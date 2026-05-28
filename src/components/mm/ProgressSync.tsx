import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { hydrateHistory, HYDRATION_GOAL_OZ, localDateKey } from "@/lib/useSessionStore";
import type { DailyEntry } from "@/lib/useSessionStore";

const LOOKBACK_DAYS = 90;

function dateKey(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return localDateKey(dt);
}

function emptyDay(date: string): DailyEntry {
  return {
    date,
    sessions: 0,
    minutes: 0,
    pushups: 0,
    squats: 0,
    breathing: 0,
    ouncesLogged: 0,
    hitHydrationGoal: false,
    xp: 0,
  };
}

/**
 * Loads movement and hydration history from the backend on sign-in
 * and hydrates the local session store so the progress dashboard
 * reflects live, per-user data.
 */
export function ProgressSync() {
  const { user } = useAuth();
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      loadedFor.current = null;
      return;
    }
    if (loadedFor.current === user.id) return;

    let cancelled = false;
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - LOOKBACK_DAYS);
      const sinceIso = since.toISOString();

      const [movementsRes, hydrationRes] = await Promise.all([
        supabase
          .from("movement_sessions")
          .select("category, duration_min, reps, reps_type, xp, completed_at")
          .eq("user_id", user.id)
          .gte("completed_at", sinceIso),
        supabase
          .from("hydration_logs")
          .select("ounces, logged_at")
          .eq("user_id", user.id)
          .gte("logged_at", sinceIso),
      ]);

      if (cancelled) return;

      if (movementsRes.error) {
        console.error("[progress] movement load failed:", movementsRes.error.message);
      }
      if (hydrationRes.error) {
        console.error("[progress] hydration load failed:", hydrationRes.error.message);
      }

      const history: Record<string, DailyEntry> = {};
      const totals = {
        totalSessions: 0,
        totalMinutes: 0,
        totalPushups: 0,
        totalSquats: 0,
        totalBreathing: 0,
      };

      for (const row of movementsRes.data ?? []) {
        const k = dateKey(row.completed_at);
        const day = history[k] ?? emptyDay(k);
        const isBreathing = row.category === "Breathing";
        const pushups = row.reps_type === "pushups" ? row.reps ?? 0 : 0;
        const squats = row.reps_type === "squats" ? row.reps ?? 0 : 0;
        day.sessions += 1;
        day.minutes += row.duration_min ?? 0;
        day.pushups += pushups;
        day.squats += squats;
        day.breathing += isBreathing ? 1 : 0;
        day.xp += row.xp ?? 0;
        history[k] = day;

        totals.totalSessions += 1;
        totals.totalMinutes += row.duration_min ?? 0;
        totals.totalPushups += pushups;
        totals.totalSquats += squats;
        totals.totalBreathing += isBreathing ? 1 : 0;
      }

      for (const row of hydrationRes.data ?? []) {
        const k = dateKey(row.logged_at);
        const day = history[k] ?? emptyDay(k);
        day.ouncesLogged = Math.max(0, day.ouncesLogged + (row.ounces ?? 0));
        day.hitHydrationGoal = day.ouncesLogged >= HYDRATION_GOAL_OZ;
        history[k] = day;
      }

      const t = dateKey(new Date());
      hydrateHistory({
        history,
        totals,
        todayOunces: history[t]?.ouncesLogged ?? 0,
      });

      loadedFor.current = user.id;
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return null;
}