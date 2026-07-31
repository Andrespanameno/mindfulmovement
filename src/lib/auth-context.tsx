import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { cancelAllReminders } from "@/lib/nativeNotifications";

// Keys that describe the DEVICE (language, theme, remembered email for
// convenience) and should survive sign-out. Everything else in localStorage
// belongs to the previous user and MUST be cleared so the next signed-in
// user (or the same user after a fresh sign-in) starts from DB truth
// instead of stale per-user cache.
const PRESERVE_KEYS = new Set(["mm-lang", "mm-theme", "mm-remembered-email"]);

function clearLocalUserData() {
  if (typeof window === "undefined") return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && !PRESERVE_KEYS.has(k)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch (err) {
    console.error("[auth] clearLocalUserData failed:", err);
  }
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ error: string | null; alreadyRegistered?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp: AuthContextValue["signUp"] = async (email, password, fullName) => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
    // Supabase returns success with an empty `identities` array when the
    // email is already registered — an anti-enumeration behavior that
    // silently skips sending a confirmation email. Surface it so the UI
    // can offer an explicit resend instead of failing silently.
    const alreadyRegistered =
      !error && !!data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;
    return { error: error?.message ?? null, alreadyRegistered };
  };

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    // Cancel any scheduled local notifications so a signed-out device
    // stops receiving reminders until the user signs back in.
    try {
      await cancelAllReminders();
    } catch (err) {
      console.error("[auth] cancelAllReminders on signOut failed:", err);
    }
    await supabase.auth.signOut();
    // Wipe per-user local cache (reminder settings, session/stats snapshot,
    // dedup timestamps, motivational message history, hydration day cache)
    // so nothing bleeds into the next session on this device.
    clearLocalUserData();
  };

  const resetPassword: AuthContextValue["resetPassword"] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, signUp, signIn, signOut, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}