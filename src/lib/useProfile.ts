import { useEffect, useState, useCallback } from "react";
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
}

export type ProfileUpdate = Partial<
  Pick<Profile, "full_name" | "fitness_level" | "work_style" | "lifestyle" | "wellness_goals" | "daily_water_goal" | "preferred_categories" | "onboarding_completed">
>;

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (error) setError(error.message);
    else setProfile(data as Profile | null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

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
      setProfile(data as Profile);
      return { error: null };
    },
    [user],
  );

  return { profile, loading, error, reload: load, updateProfile };
}