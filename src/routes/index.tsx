import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/mm/LanguageToggle";
import { ThemeToggle } from "@/components/mm/ThemeToggle";

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
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  const titles: Record<Mode, { title: string; sub: string; cta: string }> = {
    signin: { title: t("auth.signin.title"), sub: t("auth.signin.sub"), cta: t("auth.signin.cta") },
    signup: { title: t("auth.signup.title"), sub: t("auth.signup.sub"), cta: t("auth.signup.cta") },
    forgot: { title: t("auth.forgot.title"), sub: t("auth.forgot.sub"), cta: t("auth.forgot.cta") },
  };
  const tt = titles[mode];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.includes("Invalid") ? t("auth.invalid") : error);
        } else {
          navigate({ to: "/home" });
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, fullName || undefined);
        if (error) {
          toast.error(error);
        } else {
          toast.success(t("auth.signup.success"));
          setMode("signin");
        }
      } else {
        const { error } = await resetPassword(email);
        if (error) toast.error(error);
        else toast.success(t("auth.reset.success"));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col px-8 pt-20 pb-10">
        <div className="flex items-center justify-between mb-8">
          <div className="size-12 bg-primary/25 rounded-2xl flex items-center justify-center">
            <div className="size-4 rounded-full bg-primary" />
          </div>
          <LanguageToggle />
        </div>
        <h1 className="text-3xl font-semibold leading-tight text-balance mb-3">
          {tt.title}
        </h1>
        <p className="text-base text-muted-foreground text-pretty mb-10">
          {tt.sub}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1">
                {t("auth.name")}
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
              {t("auth.email")}
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
                {t("auth.password")}
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
            {busy ? t("common.one_moment") : tt.cta}
          </button>

          {mode === "signin" && (
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition"
            >
              {t("auth.forgot_link")}
            </button>
          )}
        </form>

        <div className="mt-auto pt-12 text-center">
          {mode === "signin" ? (
            <p className="text-sm text-muted-foreground">
              {t("auth.new_here")}{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-foreground font-medium"
              >
                {t("auth.begin")}
              </button>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-foreground font-medium"
              >
                {t("auth.back_signin")}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
