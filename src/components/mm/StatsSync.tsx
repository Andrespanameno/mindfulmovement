import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  getStatsSnapshot,
  hydrateStats,
  subscribeToStats,
  type StatsSnapshot,
} from "@/lib/useSessionStore";

/**
 * Bridges the local session store and the `user_stats` table.
 * - On sign-in: pulls stats from DB into local store (DB is source of truth).
 * - On any local stats change: debounced upsert back to DB.
 */
export function StatsSync() {
  const { user } = useAuth();
  const hydratedRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastSentRef = useRef<string>("");

  // Hydrate from DB when the authenticated user changes
  useEffect(() => {
    if (!user) {
      hydratedRef.current = null;
      return;
    }
    if (hydratedRef.current === user.id) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("user_stats")
        .select("total_xp, xp_today, streak, best_streak, last_active_date, streak_bonus_date")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error("[user_stats] load failed:", error.message);
        return;
      }
      if (data) {
        const snap: Partial<StatsSnapshot> = {
          totalXp: data.total_xp,
          xpToday: data.xp_today,
          streak: data.streak,
          bestStreak: data.best_streak,
          lastActiveDate: data.last_active_date,
          streakBonusDate: data.streak_bonus_date,
        };
        hydrateStats(snap);
        lastSentRef.current = JSON.stringify(snap);
      }
      hydratedRef.current = user.id;
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Write-through: debounced upsert on local changes
  useEffect(() => {
    if (!user) return;

    const flush = async () => {
      if (hydratedRef.current !== user.id) return;
      const s = getStatsSnapshot();
      const payload = {
        user_id: user.id,
        total_xp: s.totalXp,
        xp_today: s.xpToday,
        streak: s.streak,
        best_streak: s.bestStreak,
        last_active_date: s.lastActiveDate,
        streak_bonus_date: s.streakBonusDate,
      };
      const sig = JSON.stringify({
        totalXp: s.totalXp,
        xpToday: s.xpToday,
        streak: s.streak,
        bestStreak: s.bestStreak,
        lastActiveDate: s.lastActiveDate,
        streakBonusDate: s.streakBonusDate,
      });
      if (sig === lastSentRef.current) return;
      lastSentRef.current = sig;
      const { error } = await supabase.from("user_stats").upsert(payload, {
        onConflict: "user_id",
      });
      if (error) console.error("[user_stats] upsert failed:", error.message);
    };

    const unsub = subscribeToStats(() => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(flush, 800);
    });

    return () => {
      unsub();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [user]);

  return null;
}