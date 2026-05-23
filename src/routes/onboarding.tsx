import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/useProfile";
import { LIFESTYLES, WELLNESS_GOALS } from "@/lib/lifestyles";
import {
  getReminderSettings,
  updateReminderSettings,
  formatHour,
  type ReminderSettings,
} from "@/lib/reminders";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Personalize your space — Mindful Movement" },
      { name: "description", content: "Tell us about your day so we can support it." },
    ],
  }),
  component: OnboardingPage,
});

type Step = 0 | 1 | 2;

const WINDOWS: { id: string; label: string; start: number; end: number }[] = [
  { id: "morning", label: "Morning", start: 7, end: 12 },
  { id: "workday", label: "Workday", start: 9, end: 17 },
  { id: "afternoon", label: "Afternoon", start: 12, end: 18 },
  { id: "all-day", label: "All day", start: 8, end: 20 },
];

const INTERVALS: { value: ReminderSettings["intervalMin"]; label: string }[] = [
  { value: 30, label: "Every 30 min" },
  { value: 60, label: "Every hour" },
  { value: 90, label: "Every 90 min" },
  { value: 120, label: "Every 2 hours" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading, updateProfile } = useProfile();

  const [step, setStep] = useState<Step>(0);
  const [lifestyle, setLifestyle] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const initial = useMemo(() => getReminderSettings(), []);
  const [windowId, setWindowId] = useState<string>(() => {
    const match = WINDOWS.find((w) => w.start === initial.startHour && w.end === initial.endHour);
    return match?.id ?? "workday";
  });
  const [interval, setInterval] = useState<ReminderSettings["intervalMin"]>(initial.intervalMin);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/", replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate({ to: "/home", replace: true });
    } else if (profile) {
      if (profile.lifestyle) setLifestyle(profile.lifestyle);
      if (profile.wellness_goals?.length) setGoals(profile.wellness_goals);
    }
  }, [profile, navigate]);

  const toggleGoal = (g: string) =>
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const next = () => setStep((s) => (s < 2 ? ((s + 1) as Step) : s));
  const back = () => setStep((s) => (s > 0 ? ((s - 1) as Step) : s));

  const finish = async () => {
    if (!lifestyle) {
      toast.error("Choose a lifestyle to continue.");
      setStep(0);
      return;
    }
    setBusy(true);
    const win = WINDOWS.find((w) => w.id === windowId)!;
    updateReminderSettings({
      startHour: win.start,
      endHour: win.end,
      intervalMin: interval,
      enabled: true,
    });
    const { error } = await updateProfile({
      lifestyle,
      wellness_goals: goals,
      onboarding_completed: true,
    });
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Welcome in. Your space is ready.");
    navigate({ to: "/home", replace: true });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const titles = [
    { eyebrow: "Step 1 of 3", title: "What does your day look like?", sub: "Pick the lifestyle that fits best. You can change this anytime." },
    { eyebrow: "Step 2 of 3", title: "What feels most supportive?", sub: "Choose any goals that matter to you. Skip if you'd rather explore." },
    { eyebrow: "Step 3 of 3", title: "When should we check in?", sub: "Gentle reminders, on your schedule." },
  ];
  const t = titles[step];
  const canNext = step === 0 ? !!lifestyle : true;

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="w-full max-w-[520px] flex flex-col px-6 pt-12 pb-8">
        <div className="flex items-center gap-1.5 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition",
                i <= step ? "bg-primary" : "bg-secondary",
              )}
            />
          ))}
        </div>

        <p className="text-xs font-medium text-muted-foreground mb-2">{t.eyebrow}</p>
        <h1 className="text-2xl font-semibold leading-tight text-balance mb-2">{t.title}</h1>
        <p className="text-sm text-muted-foreground text-pretty mb-6">{t.sub}</p>

        <div className="flex-1">
          {step === 0 && (
            <div className="grid grid-cols-1 gap-2.5">
              {LIFESTYLES.map(({ id, label, description, icon: Icon }) => {
                const selected = lifestyle === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLifestyle(id)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl ring-1 transition flex items-start gap-3",
                      selected
                        ? "bg-primary/10 ring-primary"
                        : "bg-card ring-black/5 hover:ring-black/10",
                    )}
                  >
                    <div
                      className={cn(
                        "size-10 rounded-xl grid place-items-center shrink-0",
                        selected ? "bg-primary text-primary-foreground" : "bg-secondary",
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 text-pretty">
                        {description}
                      </p>
                    </div>
                    {selected && <Check className="size-4 text-primary shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-2.5">
              {WELLNESS_GOALS.map((g) => {
                const selected = goals.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGoal(g)}
                    className={cn(
                      "p-3.5 rounded-2xl ring-1 text-left text-sm transition",
                      selected
                        ? "bg-primary/10 ring-primary font-medium"
                        : "bg-card ring-black/5",
                    )}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Reminder window
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {WINDOWS.map((w) => {
                    const selected = windowId === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setWindowId(w.id)}
                        className={cn(
                          "p-3.5 rounded-2xl ring-1 text-left transition",
                          selected
                            ? "bg-primary/10 ring-primary"
                            : "bg-card ring-black/5",
                        )}
                      >
                        <p className="text-sm font-medium">{w.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {formatHour(w.start)} – {formatHour(w.end)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  How often?
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {INTERVALS.map((opt) => {
                    const selected = interval === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setInterval(opt.value)}
                        className={cn(
                          "p-3.5 rounded-2xl ring-1 text-left text-sm transition",
                          selected
                            ? "bg-primary/10 ring-primary font-medium"
                            : "bg-card ring-black/5",
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 pt-6 mt-6 bg-gradient-to-t from-background via-background to-transparent">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                disabled={busy}
                className="h-12 px-5 rounded-xl bg-secondary text-sm font-medium"
              >
                Back
              </button>
            )}
            {step < 2 ? (
              <button
                type="button"
                onClick={next}
                disabled={!canNext}
                className="flex-1 h-12 rounded-xl bg-foreground text-background font-medium text-sm inline-flex items-center justify-center gap-2 disabled:opacity-40 transition"
              >
                Continue <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                disabled={busy}
                className="flex-1 h-12 rounded-xl bg-foreground text-background font-medium text-sm disabled:opacity-50 transition"
              >
                {busy ? "Saving…" : "Enter your space"}
              </button>
            )}
          </div>
          {step === 1 && (
            <button
              type="button"
              onClick={next}
              className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}