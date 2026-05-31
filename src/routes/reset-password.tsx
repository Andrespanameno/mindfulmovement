import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Mindful Movement" },
      { name: "description", content: "Set a new password for your Mindful Movement account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "invalid">("loading");

  useEffect(() => {
    let cancelled = false;

    const markReady = () => {
      if (!cancelled) setStatus("ready");
    };
    const markInvalid = () => {
      if (!cancelled) setStatus("invalid");
    };

    // Supabase fires PASSWORD_RECOVERY once the recovery session is established.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        markReady();
      }
    });

    const restore = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : "";
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const errorDescription =
          url.searchParams.get("error_description") ||
          hashParams.get("error_description");

        if (errorDescription) {
          markInvalid();
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            markInvalid();
            return;
          }
          // Clean the URL so the code isn't reusable from history.
          window.history.replaceState({}, "", url.pathname);
          markReady();
          return;
        }

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            markInvalid();
            return;
          }
          window.history.replaceState({}, "", url.pathname);
          markReady();
          return;
        }

        // No params in URL — maybe the session was already restored
        // (e.g. detectSessionInUrl ran before we mounted).
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          markReady();
        } else {
          markInvalid();
        }
      } catch {
        markInvalid();
      }
    };

    restore();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "ready") return;
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated. Welcome back.");
      navigate({ to: "/home" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col px-8 pt-20 pb-10">
        <div className="size-12 bg-primary/25 rounded-2xl flex items-center justify-center mb-8">
          <div className="size-4 rounded-full bg-primary" />
        </div>
        <h1 className="text-3xl font-semibold leading-tight mb-3">Set a new password</h1>
        <p className="text-base text-muted-foreground mb-10">
          Choose something you'll remember. Small steps, fresh start.
        </p>

        {status === "loading" && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Verifying your reset link…
          </div>
        )}

        {status === "invalid" && (
          <div className="space-y-4">
            <p className="text-sm text-foreground">
              This reset link is expired or invalid. Please request a new password reset link.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="w-full h-12 bg-foreground text-background rounded-xl font-medium text-sm hover:opacity-90 transition"
            >
              Back to sign in
            </button>
          </div>
        )}

        {status === "ready" && (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground ml-1">New password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl bg-secondary/60 ring-1 ring-black/5 focus:ring-2 focus:ring-primary outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 bg-foreground text-background rounded-xl font-medium text-sm hover:opacity-90 transition"
          >
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}