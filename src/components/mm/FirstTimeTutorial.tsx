import { useEffect, useState } from "react";
import { Sparkles, Award, Droplet, Compass, TrendingUp, User, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/useProfile";
import { cn } from "@/lib/utils";

type Step = {
  icon: typeof Sparkles;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "Guided sessions",
    body: "Your guided sessions help you reset, move, and recharge in just a few minutes throughout the day.",
  },
  {
    icon: Award,
    title: "XP & leveling",
    body: "Completing movements earns XP. Levels are a gentle reflection of your consistency over time.",
  },
  {
    icon: Droplet,
    title: "Hydration goal",
    body: "Log water through the day to build a steady hydration habit, sip by sip.",
  },
  {
    icon: Compass,
    title: "Movement tab",
    body: "Tap here to explore all movements, stretches, breathing exercises, and resets.",
  },
  {
    icon: TrendingUp,
    title: "Progress tab",
    body: "Track your weekly and monthly progress: consistency, movement, hydration, and milestones.",
  },
  {
    icon: User,
    title: "Profile",
    body: "Manage your preferences, reminders, language, and settings anytime.",
  },
];

export function FirstTimeTutorial() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
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
  const { icon: Icon, title, body } = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-end sm:place-items-center bg-foreground/30 backdrop-blur-sm px-4 pb-6 sm:pb-0 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome tour"
    >
      <div className="w-full max-w-[420px] rounded-3xl bg-card ring-1 ring-border shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {step + 1} of {STEPS.length}
          </p>
          <button
            type="button"
            onClick={close}
            className="size-8 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition"
            aria-label="Skip tour"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="size-12 rounded-2xl bg-primary/15 text-primary grid place-items-center mb-4">
          <Icon className="size-6" strokeWidth={2} />
        </div>

        <h2 className="text-lg font-semibold mb-2 text-balance">{title}</h2>
        <p className="text-sm text-muted-foreground text-pretty leading-relaxed mb-6">
          {body}
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
            Skip
          </button>
          <button
            type="button"
            onClick={() => (isLast ? close() : setStep((s) => s + 1))}
            className="flex-1 h-11 rounded-xl bg-foreground text-background text-sm font-medium inline-flex items-center justify-center gap-2 transition"
          >
            {isLast ? "Got it" : (
              <>
                Next <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
