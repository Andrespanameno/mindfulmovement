import { useEffect, useState } from "react";
import { Sparkles, Award, Droplet, TrendingUp, User, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/useProfile";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

type Step = {
  icon: typeof Sparkles;
  titleKey: string;
  bodyKey: string;
};

const STEPS: Step[] = [
  { icon: Sparkles, titleKey: "tutorial.guided.title", bodyKey: "tutorial.guided.body" },
  { icon: Award, titleKey: "tutorial.xp.title", bodyKey: "tutorial.xp.body" },
  { icon: Droplet, titleKey: "tutorial.hydration.title", bodyKey: "tutorial.hydration.body" },
  { icon: TrendingUp, titleKey: "tutorial.progress.title", bodyKey: "tutorial.progress.body" },
  { icon: User, titleKey: "tutorial.profile.title", bodyKey: "tutorial.profile.body" },
];

export function FirstTimeTutorial() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user || !profile?.onboarding_completed) return;
    if (profile.tutorial_seen) return;
    setOpen(true);
    setStep(0);
  }, [user, profile?.onboarding_completed, profile?.tutorial_seen]);

  const close = async () => {
    // Close immediately so a slow/failed backend write never traps the user.
    setOpen(false);
    if (user) {
      try {
        await updateProfile({ tutorial_seen: true });
      } catch (err) {
        console.error("[tutorial] failed to persist tutorial_seen", err);
      }
    }
  };

  if (!open) return null;

  const isLast = step === STEPS.length - 1;
  const { icon: Icon, titleKey, bodyKey } = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-end sm:place-items-center bg-foreground/30 backdrop-blur-sm px-4 pb-6 sm:pb-0 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={t("tutorial.aria")}
    >
      <div className="w-full max-w-[420px] rounded-3xl bg-card ring-1 ring-border shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("tutorial.step_of", { a: step + 1, b: STEPS.length })}
          </p>
          <button
            type="button"
            onClick={close}
            className="size-8 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition"
            aria-label={t("tutorial.skip_aria")}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="size-12 rounded-2xl bg-primary/15 text-primary grid place-items-center mb-4">
          <Icon className="size-6" strokeWidth={2} />
        </div>

        <h2 className="text-lg font-semibold mb-2 text-balance">{t(titleKey)}</h2>
        <p className="text-sm text-muted-foreground text-pretty leading-relaxed mb-6">
          {t(bodyKey)}
        </p>

        <div className="flex items-center gap-1.5 mb-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-secondary",
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={close}
            className="text-xs text-muted-foreground hover:text-foreground transition px-2"
          >
            {t("tutorial.skip")}
          </button>
          <button
            type="button"
            onClick={() => (isLast ? close() : setStep((s) => s + 1))}
            className="flex-1 h-11 rounded-xl bg-foreground text-background text-sm font-medium inline-flex items-center justify-center gap-2 transition"
          >
            {isLast ? t("tutorial.got_it") : (
              <>
                {t("tutorial.next")} <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
