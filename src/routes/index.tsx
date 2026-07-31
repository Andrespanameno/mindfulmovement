import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/mm/LanguageToggle";
import { ThemeToggle } from "@/components/mm/ThemeToggle";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Mindful Movement" },
      { name: "description", content: "Welcome back to your center. Sign in to Mindful Movement." },
    ],
  }),
  component: LoginPage,
});

type Mode = "signin" | "signup" | "forgot" | "verify";

const REMEMBER_KEY = "mm-remembered-email";
const RESEND_TS_KEY = "mm-verify-resend-at";
const RESEND_COOLDOWN_MS = 60_000;

function computeRemaining(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(RESEND_TS_KEY);
  if (!raw) return 0;
  const sentAt = Number(raw);
  if (!Number.isFinite(sentAt)) return 0;
  const remainingMs = sentAt + RESEND_COOLDOWN_MS - Date.now();
  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
}

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [verifyReason, setVerifyReason] = useState<"new" | "existing">("new");
  const [resendCooldown, setResendCooldown] = useState(0);
  const passwordRef = useRef<HTMLInputElement>(null);

  const setEmailValidity = (input: HTMLInputElement) => {
    const v = input.validity;
    if (v.valueMissing) {
      input.setCustomValidity(t("auth.validation.email_required"));
    } else if (v.typeMismatch) {
      // Distinguish "no @" vs "nothing after @"
      const val = input.value;
      const atIdx = val.indexOf("@");
      if (atIdx >= 0 && atIdx === val.length - 1) {
        input.setCustomValidity(t("auth.validation.email_incomplete"));
      } else {
        input.setCustomValidity(t("auth.validation.email_invalid"));
      }
    } else {
      input.setCustomValidity("");
    }
  };

  const setPasswordValidity = (input: HTMLInputElement) => {
    const v = input.validity;
    if (v.valueMissing) {
      input.setCustomValidity(t("auth.validation.password_required"));
    } else if (v.tooShort) {
      input.setCustomValidity(t("auth.validation.password_short"));
    } else {
      input.setCustomValidity("");
    }
  };

  const setNameValidity = (input: HTMLInputElement) => {
    if (input.validity.valueMissing) {
      input.setCustomValidity(t("auth.validation.name_required"));
    } else {
      input.setCustomValidity("");
    }
  };

  const titles: Record<Mode, { title: string; sub: string; cta: string }> = {
    signin: { title: t("auth.signin.title"), sub: t("auth.signin.sub"), cta: t("auth.signin.cta") },
    signup: { title: t("auth.signup.title"), sub: t("auth.signup.sub"), cta: t("auth.signup.cta") },
    forgot: { title: t("auth.forgot.title"), sub: t("auth.forgot.sub"), cta: t("auth.forgot.cta") },
    verify: { title: t("auth.verify.title"), sub: "", cta: "" },
  };
  const tt = titles[mode];

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
      setTimeout(() => passwordRef.current?.focus(), 0);
    }
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setTimeout(() => setResendCooldown(computeRemaining()), 1000);
    return () => window.clearTimeout(id);
  }, [resendCooldown]);

  useEffect(() => {
    const recalc = () => setResendCooldown(computeRemaining());
    const onVisibility = () => {
      if (document.visibilityState === "visible") recalc();
    };
    window.addEventListener("focus", recalc);
    window.addEventListener("pageshow", recalc);
    document.addEventListener("visibilitychange", onVisibility);
    // Initial hydrate in case a cooldown is already active from a prior session.
    recalc();
    return () => {
      window.removeEventListener("focus", recalc);
      window.removeEventListener("pageshow", recalc);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const startVerify = (addr: string, reason: "new" | "existing" = "new") => {
    setPendingEmail(addr);
    setVerifyReason(reason);
    setMode("verify");
    try {
      localStorage.setItem(RESEND_TS_KEY, String(Date.now()));
    } catch {
      /* ignore storage errors */
    }
    setResendCooldown(computeRemaining());
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !pendingEmail) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t("auth.verify.resend_success"));
        try {
          localStorage.setItem(RESEND_TS_KEY, String(Date.now()));
        } catch {
          /* ignore storage errors */
        }
        setResendCooldown(computeRemaining());
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRememberChange = (checked: boolean) => {
    setRememberMe(checked);
    if (checked) {
      if (email) localStorage.setItem(REMEMBER_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
      toast.success(t("auth.email_removed"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) {
          const lower = error.toLowerCase();
          if (lower.includes("not confirmed") || lower.includes("not verified") || lower.includes("email_not_confirmed")) {
            toast.error(t("auth.verify.not_confirmed"));
            startVerify(email);
          } else {
            toast.error(error.includes("Invalid") ? t("auth.invalid") : error);
          }
        } else {
          if (rememberMe && email) {
            localStorage.setItem(REMEMBER_KEY, email);
          } else {
            localStorage.removeItem(REMEMBER_KEY);
          }
          navigate({ to: "/home" });
        }
      } else if (mode === "signup") {
        const { error, alreadyRegistered } = await signUp(email, password, fullName || undefined);
        if (error) {
          toast.error(error);
        } else if (alreadyRegistered) {
          // Existing account — Supabase suppressed the confirmation email.
          // Trigger an explicit resend and route to the verify screen.
          toast.message(t("auth.verify.existing_account"));
          const { error: resendError } = await supabase.auth.resend({
            type: "signup",
            email,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          });
          if (resendError && !/already confirmed/i.test(resendError.message)) {
            toast.error(resendError.message);
          }
          startVerify(email, "existing");
        } else {
          startVerify(email);
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
        <h1 className="text-3xl font-semibold leading-tight text-balance mb-3">
          {tt.title}
        </h1>
        {mode === "verify" ? (
          <div className="mb-8 space-y-3">
            {verifyReason === "existing" && (
              <p className="text-sm rounded-xl bg-secondary/60 ring-1 ring-black/5 p-3 text-foreground">
                {t("auth.verify.existing_unverified")}
              </p>
            )}
            <p className="text-base text-muted-foreground text-pretty">
              {t("auth.verify.sub").replace("{email}", pendingEmail)}
            </p>
          </div>
        ) : (
          <p className="text-base text-muted-foreground text-pretty mb-10">
            {tt.sub}
          </p>
        )}

        {mode === "verify" ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={busy || resendCooldown > 0}
              className="w-full h-12 bg-foreground text-background rounded-xl font-medium text-sm hover:opacity-90 transition disabled:opacity-60"
            >
              {resendCooldown > 0
                ? t("auth.verify.resend_in").replace("{s}", String(resendCooldown))
                : t("auth.verify.resend")}
            </button>
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition"
            >
              {t("auth.verify.back")}
            </button>
          </div>
        ) : (
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
                onInvalid={(e) => setNameValidity(e.currentTarget)}
                onInput={(e) => setNameValidity(e.currentTarget)}
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
              onInvalid={(e) => setEmailValidity(e.currentTarget)}
              onInput={(e) => setEmailValidity(e.currentTarget)}
            />
          </div>
          {mode === "signin" && (
            <label className="flex items-center gap-2 cursor-pointer ml-1">
              <Checkbox
                checked={rememberMe}
                onCheckedChange={(checked) => handleRememberChange(checked === true)}
              />
              <span className="text-sm text-muted-foreground">{t("auth.remember_me")}</span>
            </label>
          )}
          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1">
                {t("auth.password")}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-xl bg-secondary/60 ring-1 ring-black/5 focus:ring-2 focus:ring-primary outline-none transition"
                ref={passwordRef}
                onInvalid={(e) => setPasswordValidity(e.currentTarget)}
                onInput={(e) => setPasswordValidity(e.currentTarget)}
              />
              <label className="flex items-center gap-2 cursor-pointer ml-1 pt-1">
                <Checkbox
                  checked={showPassword}
                  onCheckedChange={(checked) => setShowPassword(checked === true)}
                />
                <span className="text-sm text-muted-foreground">{t("auth.see_password")}</span>
              </label>
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
        )}

        <div className="mt-auto pt-12 text-center">
          {mode === "verify" ? null : mode === "signin" ? (
            <p className="text-sm text-muted-foreground">
              {t("auth.new_here")}{" "}
              <button
                type="button"
                onClick={() => {
                  setEmail("");
                  setPassword("");
                  setFullName("");
                  setShowPassword(false);
                  setMode("signup");
                }}
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
