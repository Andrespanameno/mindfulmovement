import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export interface Profile {
  id: string;
  full_name: string | null;
  fitness_level: string | null;
  work_style: string | null;
  lifestyle: string | null;
  wellness_goals: string[] | null;
  daily_water_goal: number;
  preferred_categories: string[];
  onboarding_completed: boolean;
  tutorial_seen: boolean;
  language: string;
  has_seen_welcome_modal: boolean;
  hydration_unit: "oz" | "ml";
  daily_water_goal_display: number | null;
  daily_water_goal_display_unit: "oz" | "ml" | null;
  in_app_notifications: boolean;
  avatar_preset: string | null;
}

export type ProfileUpdate = Partial<
  Pick<Profile, "full_name" | "fitness_level" | "work_style" | "lifestyle" | "wellness_goals" | "daily_water_goal" | "preferred_categories" | "onboarding_completed" | "tutorial_seen" | "has_seen_welcome_modal" | "hydration_unit" | "daily_water_goal_display" | "daily_water_goal_display_unit" | "in_app_notifications" | "avatar_preset">
>;

// Shared module-level store so every useProfile() consumer (AuthGate,
// onboarding, home, etc.) sees the same profile state. Without this,
// onboarding's local updateProfile() does not propagate to AuthGate, which
// then re-reads stale onboarding_completed=false and bounces the user back
// to /onboarding after they finish the final step.
type State = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  userId: string | null;
};

let state: State = { profile: null, loading: true, error: null, userId: null };
const listeners = new Set<() => void>();

function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

async function loadFor(userId: string | null) {
  if (!userId) {
    setState({ profile: null, loading: false, error: null, userId: null });
    return;
  }
  setState({ loading: true, userId });
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) setState({ error: error.message, loading: false });
  else setState({ profile: data as Profile | null, loading: false, error: null });
}

export function getProfileSnapshot(): Profile | null {
  return state.profile;
}

export function useProfile() {
  const { user } = useAuth();
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );

  useEffect(() => {
    const uid = user?.id ?? null;
    if (state.userId !== uid) {
      loadFor(uid);
    }
  }, [user]);

  const reload = useCallback(() => loadFor(user?.id ?? null), [user]);

  const updateProfile = useCallback(
    async (patch: ProfileUpdate) => {
      if (!user) return { error: "Not signed in" };
      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id)
        .select()
        .maybeSingle();
      if (error) return { error: error.message };
      setState({ profile: data as Profile });
      return { error: null };
    },
    [user],
  );

  return {
    profile: snapshot.profile,
    loading: snapshot.loading,
    error: snapshot.error,
    reload,
    updateProfile,
  };
}