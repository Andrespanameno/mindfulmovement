import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/mm/AppShell";
import { Droplet, Undo2, ArrowLeft, Bell, BellOff, Check, Plus } from "lucide-react";
import { notify } from "@/lib/notify";
import { supabase } from "@/integrations/supabase/client";
import { useMotivationalMessage } from "@/hooks/useMotivationalMessage";
import { useI18n } from "@/lib/i18n";
import { useProfile } from "@/lib/useProfile";
import { HydrationUnitToggle } from "@/components/mm/HydrationUnitToggle";
import { formatAmount, mlToOz, ML_PER_OZ, QUICK_ADDS_ML, type HydrationUnit } from "@/lib/hydrationUnit";
import {
  useSessionStore,
  logHydration,
  undoLastHydration,
  setRemindersEnabled,
  markReminderShown,
  HYDRATION_GOAL_OZ as DEFAULT_HYDRATION_GOAL_OZ,
  HYDRATION_XP_PER_8OZ,
  QUICK_ADDS_OZ,
  localDateKey,
} from "@/lib/useSessionStore";

export const Route = createFileRoute("/hydration")({
  head: () => ({
    meta: [
      { title: "Hydration — Mindful Movement" },
      { name: "description", content: "Track your daily water intake gently." },
    ],
  }),
  component: HydrationPage,
});

function HydrationPage() {
  const { t } = useI18n();
  const { profile, updateProfile } = useProfile();
  const unit: HydrationUnit = profile?.hydration_unit ?? "oz";
  const goalOz = profile?.daily_water_goal ?? DEFAULT_HYDRATION_GOAL_OZ;
  // Prefer the user's exact saved display value when the unit matches, so
  // 1000 mL stays 1000 mL (avoid round-tripping mL → oz → mL).
  const goalDisplay: number =
    profile?.daily_water_goal_display != null &&
    profile?.daily_water_goal_display_unit === unit
      ? Number(profile.daily_water_goal_display)
      : formatAmount(goalOz, unit);
  // Single source of truth for the goal in oz, derived from the user's
  // exact saved display value when available — avoids the int-rounded
  // `daily_water_goal` column (which turns 1000 mL → 34 oz → 1005 mL).
  const effectiveGoalOz: number =
    profile?.daily_water_goal_display != null && profile?.daily_water_goal_display_unit
      ? profile.daily_water_goal_display_unit === "ml"
        ? Number(profile.daily_water_goal_display) / ML_PER_OZ
        : Number(profile.daily_water_goal_display)
      : goalOz;
  const setUnit = (next: HydrationUnit) => {
    if (next === unit) return;
    void updateProfile({ hydration_unit: next });
  };
  const ouncesToday = useSessionStore((s) => s.ouncesToday);
  const lastHydrationAdd = useSessionStore((s) => s.lastHydrationAdd);
  const remindersEnabled = useSessionStore((s) => s.remindersEnabled);
  const reminderIntervalMin = useSessionStore((s) => s.reminderIntervalMin);
  const lastReminderAt = useSessionStore((s) => s.lastReminderAt);
  const todayKey = localDateKey(new Date());
  const baselineStorageKey = `mm-hydration-baseline-${todayKey}`;
  const roundsStorageKey = `mm-hydration-rounds-${todayKey}`;
  const [bonusBaseline, setBonusBaseline] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem(baselineStorageKey);
    return raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
  });
  const [roundsCompleted, setRoundsCompleted] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem(roundsStorageKey);
    return raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
  });
  // Clear stale baseline if ounces reset below it (e.g. daily rollover or undo)
  useEffect(() => {
    if (bonusBaseline > 0 && ouncesToday < bonusBaseline) {
      setBonusBaseline(0);
      setRoundsCompleted(0);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(baselineStorageKey);
        window.localStorage.removeItem(roundsStorageKey);
      }
    }
  }, [ouncesToday, bonusBaseline, baselineStorageKey, roundsStorageKey]);

  const roundOunces = Math.max(0, ouncesToday - bonusBaseline);
  const roundNumber = roundsCompleted + 1;
  const pct = Math.min(100, Math.round((roundOunces / effectiveGoalOz) * 100));
  // Small tolerance so display "1000 of 1000 mL" reads as complete even
  // when the internal oz sum is 999.99…
  const roundComplete = roundOunces >= effectiveGoalOz - 0.05;
  const r = 86;
  const c = 2 * Math.PI * r;
  const reachedRef = useRef(ouncesToday >= effectiveGoalOz - 0.05);

  const startNewRound = () => {
    const newBaseline = ouncesToday;
    const newRounds = roundsCompleted + 1;
    setBonusBaseline(newBaseline);
    setRoundsCompleted(newRounds);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(baselineStorageKey, String(newBaseline));
      window.localStorage.setItem(roundsStorageKey, String(newRounds));
    }
    reachedRef.current = false;
    notify.success(t("hydration.keep_going_started"), {
      description: t("hydration.keep_going_sub"),
    });
  };

  const { message: hydrationMsg, next: nextHydrationMsg } = useMotivationalMessage({
    placement: "hydration_completion",
  });

  const persistHydration = async (oz: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("hydration_logs").insert({
      user_id: user.id,
      ounces: oz,
    });
    if (error) console.error("[hydration_logs] insert failed:", error.message);
  };

  const handleUndo = () => {
    if (ouncesToday === 0 || lastHydrationAdd === 0) return;
    undoLastHydration();
    void persistHydration(-lastHydrationAdd);
  };

  const add = (oz: number) => {
    if (roundComplete) return;
    const beforeRound = Math.min(roundOunces, goalOz);
    const afterRound = Math.min(goalOz, roundOunces + oz);
    const xp = Math.max(
      0,
      Math.floor(afterRound / 8) * HYDRATION_XP_PER_8OZ -
        Math.floor(beforeRound / 8) * HYDRATION_XP_PER_8OZ,
    );
    logHydration(oz);
    const displayN = unit === "ml" ? Math.round(oz * 29.5735) : oz;
    notify.success(t("hydration.toast.logged_u", { n: displayN, unit: t(unit === "ml" ? "unit.ml" : "unit.oz") }), {
      description: xp > 0 ? t("hydration.toast.xp", { xp }) : t("hydration.toast.keep"),
    });
    void persistHydration(oz);
  };

  useEffect(() => {
    if (roundOunces >= effectiveGoalOz - 0.05 && !reachedRef.current) {
      reachedRef.current = true;
      notify.success(t("hydration.toast.goal"), {
        description: hydrationMsg?.message ?? t("hydration.toast.goal_sub"),
      });
      nextHydrationMsg();
    }
    if (roundOunces < effectiveGoalOz - 0.05) reachedRef.current = false;
  }, [roundOunces, effectiveGoalOz, hydrationMsg, nextHydrationMsg]);

  // Gentle reminders while the page is open
  useEffect(() => {
    if (!remindersEnabled) return;
    const id = window.setInterval(() => {
      const last = lastReminderAt ?? 0;
      const due = Date.now() - last >= reminderIntervalMin * 60 * 1000;
      if (due && ouncesToday < effectiveGoalOz - 0.05) {
        notify(t("hydration.toast.sip"), { description: t("hydration.toast.sip_sub") });
        markReminderShown();
      }
    }, 30 * 1000);
    return () => window.clearInterval(id);
  }, [remindersEnabled, reminderIntervalMin, lastReminderAt, ouncesToday, effectiveGoalOz]);

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-6">
        <Link
          to="/home"
          className="size-10 rounded-full bg-card ring-1 ring-black/5 grid place-items-center"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-base font-semibold">{t("hydration.title")}</h1>
        <HydrationUnitToggle value={unit} onChange={setUnit} />
      </header>

      <div className="rounded-3xl bg-card ring-1 ring-black/5 p-8 mb-6 text-center">
        <div className="relative mx-auto size-48 mb-4">
          <svg className="size-48 -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={r} strokeWidth="14" fill="none" className="stroke-secondary" />
            <circle
              cx="100"
              cy="100"
              r={r}
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c - (c * pct) / 100}
              className="stroke-primary transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplet className="size-5 text-primary mb-1" />
            <p className="text-4xl font-semibold tabular-nums">{formatAmount(roundOunces, unit)}</p>
            <p className="text-xs text-muted-foreground">
              {t("hydration.of_today_u", {
                goal: goalDisplay,
                unit: t(unit === "ml" ? "unit.ml" : "unit.oz"),
              })}
            </p>
            {bonusBaseline > 0 && (
              <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
                {t("hydration.total_today")}: {formatAmount(ouncesToday, unit)} {t(unit === "ml" ? "unit.ml" : "unit.oz")} · {t("hydration.round")} {roundNumber}
              </p>
            )}
            {roundComplete && (
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                <Check className="size-3" /> {t("hydration.goal_complete")}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-pretty">
          {roundComplete
            ? t("home.hydration.reached")
            : t("hydration.to_go_u", {
                n: Math.max(0, goalDisplay - formatAmount(roundOunces, unit)),
                unit: t(unit === "ml" ? "unit.ml" : "unit.oz"),
              })}
        </p>
        {roundComplete && (
          <button
            onClick={startNewRound}
            className="mt-4 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.98] transition"
          >
            <Plus className="size-4" /> {t("hydration.keep_going")}
          </button>
        )}
      </div>

      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {t("hydration.quick_add")}
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {(unit === "ml" ? QUICK_ADDS_ML : QUICK_ADDS_OZ).map((amount) => {
          const oz = unit === "ml" ? mlToOz(amount) : amount;
          return (
            <button
              key={amount}
              onClick={() => add(oz)}
              disabled={roundComplete}
              className="h-20 rounded-2xl bg-primary/10 ring-1 ring-primary/20 text-primary font-semibold flex flex-col items-center justify-center gap-1 active:scale-[0.97] transition disabled:opacity-40 disabled:active:scale-100 disabled:cursor-not-allowed"
            >
              <Droplet className="size-4" />
              <span className="text-lg leading-none">{amount}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">{unit === "ml" ? "mL" : "oz"}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleUndo}
        disabled={ouncesToday === 0 || lastHydrationAdd === 0}
        className="w-full h-11 rounded-2xl bg-card ring-1 ring-black/5 text-sm font-medium text-muted-foreground flex items-center justify-center gap-2 mb-8 disabled:opacity-40"
      >
        <Undo2 className="size-4" /> {t("hydration.undo_u", {
          n: formatAmount(lastHydrationAdd || 8, unit),
          unit: t(unit === "ml" ? "unit.ml" : "unit.oz"),
        })}
      </button>

      <div className="grid grid-cols-8 gap-1.5 mb-8">
        {Array.from({ length: 8 }).map((_, i) => {
          const segment = effectiveGoalOz / 8;
          const filled = roundOunces >= (i + 1) * segment;
          return (
            <div
              key={i}
              className={`h-10 rounded-md transition ${
                filled ? "bg-primary" : "bg-secondary"
              }`}
              title={`${Math.round((i + 1) * segment)} oz`}
            />
          );
        })}
      </div>

      <button
        onClick={() => setRemindersEnabled(!remindersEnabled)}
        className="w-full p-4 rounded-2xl bg-card ring-1 ring-black/5 flex items-center gap-3 text-left"
      >
        <div
          className={`size-10 rounded-xl grid place-items-center ${
            remindersEnabled ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
          }`}
        >
          {remindersEnabled ? <Bell className="size-4" /> : <BellOff className="size-4" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{t("hydration.reminders_label")}</p>
          <p className="text-xs text-muted-foreground">
            {remindersEnabled
              ? t("hydration.reminders_on", { n: reminderIntervalMin })
              : t("hydration.reminders_off")}
          </p>
        </div>
        <span
          className={`text-xs font-medium ${
            remindersEnabled ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {remindersEnabled ? t("common.on") : t("common.off")}
        </span>
      </button>
    </AppShell>
  );
}