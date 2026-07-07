import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/useProfile";
import { LIFESTYLES, WELLNESS_GOALS } from "@/lib/lifestyles";
import { getCategoryMeta } from "@/lib/movements";
import {
  getReminderSettings,
  hydrateReminderSettings,
  formatHour,
  type ReminderSettings,
} from "@/lib/reminders";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useContent } from "@/lib/i18n-content";
import { isNative } from "@/lib/native";
import { ensureNativePermissionAndSync } from "@/lib/nativeNotifications";

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

const WINDOWS: { id: string; labelKey: string; start: number; end: number }[] = [
  { id: "morning", labelKey: "onb.window.morning", start: 7, end: 12 },
  { id: "workday", labelKey: "onb.window.workday", start: 9, end: 17 },
  { id: "afternoon", labelKey: "onb.window.afternoon", start: 12, end: 18 },
  { id: "all-day", labelKey: "onb.window.all_day", start: 8, end: 20 },
];

const INTERVALS: { value: ReminderSettings["intervalMin"]; labelKey: string }[] = [
  { value: 30, labelKey: "onb.interval.30" },
  { value: 60, labelKey: "onb.interval.60" },
  { value: 90, labelKey: "onb.interval.90" },
  { value: 120, labelKey: "onb.interval.120" },
];

function OnboardingPage() {
  const { t: tr, lang } = useI18n();
  const content = useContent();
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
  const [sessionMax, setSessionMax] = useState<3 | 4 | 5>(5);
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
      const m = profile.session_max_minutes;
      if (m === 3 || m === 4 || m === 5) setSessionMax(m);
    }
  }, [profile, navigate]);

  const toggleGoal = (g: string) =>
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const next = () => setStep((s) => (s < 2 ? ((s + 1) as Step) : s));
  const back = () => setStep((s) => (s > 0 ? ((s - 1) as Step) : s));

  const finish = async () => {
    if (!lifestyle) {
      toast.error(tr("onb.choose_lifestyle"));
      setStep(0);
      return;
    }
    setBusy(true);
    const win = WINDOWS.find((w) => w.id === windowId)!;
    // Persist reminder settings directly to the DB so the Profile/Reminders
    // page reflects the onboarding selections as the source of truth.
    if (user) {
      const current = getReminderSettings();
      const reminderPatch = {
        user_id: user.id,
        enabled: true,
        start_hour: win.start,
        end_hour: win.end,
        interval_min: interval,
        movement: current.movement,
        hydration: current.hydration,
        breath: current.breath,
        active_days: current.activeDays,
      };
      const { error: remErr } = await supabase
        .from("reminder_settings")
        .upsert(reminderPatch, { onConflict: "user_id" });
      if (remErr) {
        console.error("[onboarding] reminder upsert failed:", remErr.message);
      }
      // Keep local state in sync without triggering a redundant DB write.
      hydrateReminderSettings({
        enabled: true,
        startHour: win.start,
        endHour: win.end,
        intervalMin: interval,
      });
    }
    const lifestyleDef = LIFESTYLES.find((l) => l.id === lifestyle);
    const seededCategories =
      profile?.preferred_categories && profile.preferred_categories.length > 0
        ? profile.preferred_categories
        : (lifestyleDef?.defaultCategories ?? []);
    const { error } = await updateProfile({
      lifestyle,
      wellness_goals: goals,
      preferred_categories: seededCategories,
      session_max_minutes: sessionMax,
      onboarding_completed: true,
    });
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (isNative()) {
      try {
        const perm = await ensureNativePermissionAndSync(getReminderSettings(), lang);
        console.info("[onboarding] native reminder permission ->", perm);
        if (perm === "denied") {
          toast.message(tr("reminders.native_denied_title"), {
            description: tr("reminders.native_denied_body"),
          });
        }
      } catch (e) {
        console.error("[onboarding] native permission flow failed:", e);
      }
    }
    toast.success(tr("onb.welcome"));
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
    { eyebrow: tr("onb.step", { n: 1 }), title: tr("onb.step1.title"), sub: tr("onb.step1.sub") },
    { eyebrow: tr("onb.step", { n: 2 }), title: tr("onb.step2.title"), sub: tr("onb.step2.sub") },
    { eyebrow: tr("onb.step", { n: 3 }), title: tr("onb.step3.title"), sub: tr("onb.step3.sub") },
  ];
  const t = titles[step];
  const canNext = step === 0 ? !!lifestyle : true;

  const lifestyleDef = LIFESTYLES.find((l) => l.id === lifestyle);
  const seededCategoryMetas = (lifestyleDef?.defaultCategories ?? [])
    .map((c) => getCategoryMeta(c))
    .filter(Boolean);

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
                      <p className="text-sm font-medium">{content.lifestyleLabel(id, label)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 text-pretty">
                        {content.lifestyleDesc(id, description)}
                      </p>
                    </div>
                    {selected && <Check className="size-4 text-primary shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <>
              {seededCategoryMetas.length > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-secondary/60 ring-1 ring-black/5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {tr("onb.start_rotation")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {seededCategoryMetas.map((c) => (
                      <span
                        key={c!.id}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-background ring-1 ring-black/5"
                      >
                        {content.categoryShort(c!.id, c!.short)}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">{tr("onb.tune_later")}</p>
                </div>
              )}
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
                      {content.wellnessGoal(g)}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {tr("onb.reminder_window")}
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
                          selected ? "bg-primary/10 ring-primary" : "bg-card ring-black/5",
                        )}
                      >
                        <p className="text-sm font-medium">{tr(w.labelKey)}</p>
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
                  {tr("onb.how_often")}
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
                        {tr(opt.labelKey)}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                  {tr("onb.reminder_note")}
                </p>
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
                {tr("onb.back")}
              </button>
            )}
            {step < 2 ? (
              <button
                type="button"
                onClick={next}
                disabled={!canNext}
                className="flex-1 h-12 rounded-xl bg-foreground text-background font-medium text-sm inline-flex items-center justify-center gap-2 disabled:opacity-40 transition"
              >
                {tr("common.continue")} <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                disabled={busy}
                className="flex-1 h-12 rounded-xl bg-foreground text-background font-medium text-sm disabled:opacity-50 transition"
              >
                {busy ? tr("common.saving") : tr("onb.enter")}
              </button>
            )}
          </div>
          {step === 1 && (
            <button
              type="button"
              onClick={next}
              className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition"
            >
              {tr("common.skip")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
