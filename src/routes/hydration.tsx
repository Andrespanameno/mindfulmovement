import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/mm/AppShell";
import { Droplet, Undo2, ArrowLeft, Bell, BellOff, Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMotivationalMessage } from "@/hooks/useMotivationalMessage";
import { useI18n } from "@/lib/i18n";
import {
  useSessionStore,
  logHydration,
  undoLastHydration,
  setRemindersEnabled,
  markReminderShown,
  HYDRATION_GOAL_OZ,
  HYDRATION_XP_PER_8OZ,
  QUICK_ADDS_OZ,
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
  const { ouncesToday, lastHydrationAdd, remindersEnabled, reminderIntervalMin, lastReminderAt } =
    useSessionStore();
  const todayKey = new Date().toISOString().slice(0, 10);
  const baselineStorageKey = `mm-hydration-baseline-${todayKey}`;
  const [bonusBaseline, setBonusBaseline] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem(baselineStorageKey);
    return raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
  });
  // Clear stale baseline if ounces reset below it (e.g. daily rollover or undo)
  useEffect(() => {
    if (bonusBaseline > 0 && ouncesToday < bonusBaseline) {
      setBonusBaseline(0);
      if (typeof window !== "undefined") window.localStorage.removeItem(baselineStorageKey);
    }
  }, [ouncesToday, bonusBaseline, baselineStorageKey]);

  const roundOunces = Math.max(0, ouncesToday - bonusBaseline);
  const roundNumber = Math.floor(bonusBaseline / HYDRATION_GOAL_OZ) + 1;
  const pct = Math.min(100, Math.round((roundOunces / HYDRATION_GOAL_OZ) * 100));
  const roundComplete = roundOunces >= HYDRATION_GOAL_OZ;
  const r = 86;
  const c = 2 * Math.PI * r;
  const reachedRef = useRef(ouncesToday >= HYDRATION_GOAL_OZ);

  const startNewRound = () => {
    const newBaseline = bonusBaseline + HYDRATION_GOAL_OZ;
    setBonusBaseline(newBaseline);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(baselineStorageKey, String(newBaseline));
    }
    reachedRef.current = false;
    toast.success(t("hydration.keep_going_started") || "New round started", {
      description: t("hydration.keep_going_sub") || "Keep the momentum — every sip counts.",
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
    const before = ouncesToday;
    const after = Math.min(HYDRATION_GOAL_OZ, before + oz);
    const xp = Math.max(
      0,
      Math.floor(after / 8) * HYDRATION_XP_PER_8OZ -
        Math.floor(Math.min(before, HYDRATION_GOAL_OZ) / 8) * HYDRATION_XP_PER_8OZ,
    );
    logHydration(oz);
    toast.success(t("hydration.toast.logged", { n: oz }), {
      description: xp > 0 ? t("hydration.toast.xp", { xp }) : t("hydration.toast.keep"),
    });
    void persistHydration(oz);
  };

  useEffect(() => {
    if (ouncesToday >= HYDRATION_GOAL_OZ && !reachedRef.current) {
      reachedRef.current = true;
      toast.success(t("hydration.toast.goal"), {
        description: hydrationMsg?.message ?? t("hydration.toast.goal_sub"),
      });
      nextHydrationMsg();
    }
    if (ouncesToday < HYDRATION_GOAL_OZ) reachedRef.current = false;
  }, [ouncesToday, hydrationMsg, nextHydrationMsg]);

  // Gentle reminders while the page is open
  useEffect(() => {
    if (!remindersEnabled) return;
    const id = window.setInterval(() => {
      const last = lastReminderAt ?? 0;
      const due = Date.now() - last >= reminderIntervalMin * 60 * 1000;
      if (due && ouncesToday < HYDRATION_GOAL_OZ) {
        toast(t("hydration.toast.sip"), { description: t("hydration.toast.sip_sub") });
        markReminderShown();
      }
    }, 30 * 1000);
    return () => window.clearInterval(id);
  }, [remindersEnabled, reminderIntervalMin, lastReminderAt, ouncesToday]);

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
        <div className="size-10" />
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
            <p className="text-4xl font-semibold tabular-nums">{roundOunces}</p>
            <p className="text-xs text-muted-foreground">{t("hydration.of_today", { goal: HYDRATION_GOAL_OZ })}</p>
            {bonusBaseline > 0 && (
              <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
                {(t("hydration.total_today") || "Total today")}: {ouncesToday} oz · {(t("hydration.round") || "Round")} {roundNumber}
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
            : t("hydration.to_go", { n: HYDRATION_GOAL_OZ - roundOunces })}
        </p>
        {roundComplete && (
          <button
            onClick={startNewRound}
            className="mt-4 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.98] transition"
          >
            <Plus className="size-4" /> {t("hydration.keep_going") || "Keep Going"}
          </button>
        )}
      </div>

      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {t("hydration.quick_add")}
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {QUICK_ADDS_OZ.map((oz) => (
          <button
            key={oz}
            onClick={() => add(oz)}
            className="h-20 rounded-2xl bg-primary/10 ring-1 ring-primary/20 text-primary font-semibold flex flex-col items-center justify-center gap-1 active:scale-[0.97] transition"
          >
            <Droplet className="size-4" />
            <span className="text-lg leading-none">{oz}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">oz</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleUndo}
        disabled={ouncesToday === 0 || lastHydrationAdd === 0}
        className="w-full h-11 rounded-2xl bg-card ring-1 ring-black/5 text-sm font-medium text-muted-foreground flex items-center justify-center gap-2 mb-8 disabled:opacity-40"
      >
        <Undo2 className="size-4" /> {t("hydration.undo", { n: lastHydrationAdd || 8 })}
      </button>

      <div className="grid grid-cols-8 gap-1.5 mb-8">
        {Array.from({ length: 8 }).map((_, i) => {
          const filled = roundOunces >= (i + 1) * 8;
          return (
            <div
              key={i}
              className={`h-10 rounded-md transition ${
                filled ? "bg-primary" : "bg-secondary"
              }`}
              title={`${(i + 1) * 8} oz`}
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