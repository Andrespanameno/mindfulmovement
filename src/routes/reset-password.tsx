import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      </div>
    </div>
  );
}