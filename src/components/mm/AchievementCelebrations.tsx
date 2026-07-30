import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useSessionStore } from "@/lib/useSessionStore";
import { isGuidedSessionActive } from "@/lib/reminderDedup";
import {
  checkAchievementUnlocks,
  dismissCurrentCelebration,
  initAchievementCelebrations,
  resetAchievementCelebrations,
  useAchievementCelebration,
} from "@/lib/achievementCelebrations";
import { AchievementUnlockedModal } from "./AchievementUnlockedModal";

/**
 * Single host for achievement celebrations. Watches the shared progress
 * store, queues newly earned achievements (one at a time) and holds the
 * pop-up back while a guided session is still running.
 */
export function AchievementCelebrations() {
  const { user } = useAuth();
  const state = useSessionStore();
  const { current } = useAchievementCelebration();
  const navigate = useNavigate();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!user) {
      resetAchievementCelebrations();
      return;
    }
    let cancelled = false;
    (async () => {
      await initAchievementCelebrations(user.id, state);
      if (cancelled) return;
      await checkAchievementUnlocks(state);
    })();
    return () => {
      cancelled = true;
    };
    // `state` changes whenever progress is saved — that's the trigger.
  }, [user, state]);

  // Don't interrupt an active guided session / timer step.
  useEffect(() => {
    if (!current) {
      setBlocked(false);
      return;
    }
    const check = () => setBlocked(isGuidedSessionActive());
    check();
    const id = window.setInterval(check, 500);
    return () => window.clearInterval(id);
  }, [current]);

  const dismiss = useCallback(() => dismissCurrentCelebration(), []);
  const view = useCallback(() => {
    dismissCurrentCelebration();
    void navigate({ to: "/progress" });
  }, [navigate]);

  if (!current || blocked) return null;

  return (
    <AchievementUnlockedModal
      achievementId={current}
      onDismiss={dismiss}
      onViewAchievements={view}
    />
  );
}
