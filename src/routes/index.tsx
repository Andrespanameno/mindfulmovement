import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Mindful Movement" },
      { name: "description", content: "Welcome back to your center. Sign in to Mindful Movement." },
    ],
  }),
  component: LoginPage,
});

type Mode = "signin" | "signup" | "forgot";

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  const titles: Record<Mode, { title: string; sub: string; cta: string }> = {
    signin: {
      title: "Welcome back to your center",
      sub: "Take a deep breath. Let's start your day with intention.",
      cta: "Enter your space",
    },
    signup: {
      title: "Begin your gentle journey",
      sub: "Small actions create big change. Create your space.",
      cta: "Create account",
    },
    forgot: {
      title: "Let's get you back in",
      sub: "We'll send a reset link to your email.",
      cta: "Send reset link",
    },
  };
  const t = titles[mode];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.includes("Invalid") ? "Invalid email or password." : error);
        } else {
          navigate({ to: "/home" });
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, fullName || undefined);
        if (error) {
          toast.error(error);
        } else {
          toast.success("Account created. Check your email to confirm, then sign in.");
          setMode("signin");
        }
      } else {
        const { error } = await resetPassword(email);
        if (error) toast.error(error);
        else toast.success("Reset link sent. Check your email.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col px-8 pt-20 pb-10">
        <div className="size-12 bg-primary/25 rounded-2xl flex items-center justify-center mb-8">
          <div className="size-4 rounded-full bg-primary" />
        </div>
        <h1 className="text-3xl font-semibold leading-tight text-balance mb-3">
          {t.title}
        </h1>
        <p className="text-base text-muted-foreground text-pretty mb-10">
          {t.sub}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1">
                Your name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full h-12 px-4 rounded-xl bg-secondary/60 ring-1 ring-black/5 focus:ring-2 focus:ring-primary outline-none transition"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground ml-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              className="w-full h-12 px-4 rounded-xl bg-secondary/60 ring-1 ring-black/5 focus:ring-2 focus:ring-primary outline-none transition"
            />
          </div>
          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1">
                Password
              </label>
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
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 bg-foreground text-background rounded-xl font-medium text-sm hover:opacity-90 transition"
          >
            {busy ? "One moment…" : t.cta}
          </button>

          {mode === "signin" && (
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition"
            >
              Forgot your password?
            </button>
          )}
        </form>

        <div className="mt-auto pt-12 text-center">
          {mode === "signin" ? (
            <p className="text-sm text-muted-foreground">
              New to Mindful Movement?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-foreground font-medium"
              >
                Begin journey
              </button>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-foreground font-medium"
              >
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
