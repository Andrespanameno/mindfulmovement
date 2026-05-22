import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { AppShell } from "@/components/mm/AppShell";
import { Droplet, Undo2, ArrowLeft, Bell, BellOff, Check } from "lucide-react";
import { toast } from "sonner";
import {
  useSessionStore,
  logHydration,
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
  const { ouncesToday, remindersEnabled, reminderIntervalMin, lastReminderAt } =
    useSessionStore();
  const pct = Math.min(100, Math.round((ouncesToday / HYDRATION_GOAL_OZ) * 100));
  const r = 86;
  const c = 2 * Math.PI * r;
  const reachedRef = useRef(ouncesToday >= HYDRATION_GOAL_OZ);

  const add = (oz: number) => {
    const before = ouncesToday;
    const after = Math.min(HYDRATION_GOAL_OZ, before + oz);
    const xp = Math.max(
      0,
      Math.floor(after / 8) * HYDRATION_XP_PER_8OZ -
        Math.floor(Math.min(before, HYDRATION_GOAL_OZ) / 8) * HYDRATION_XP_PER_8OZ,
    );
    logHydration(oz);
    toast.success(`+${oz} oz logged`, {
      description: xp > 0 ? `+${xp} XP · Small sips, big impact.` : "Keep sipping gently.",
    });
  };

  useEffect(() => {
    if (ouncesToday >= HYDRATION_GOAL_OZ && !reachedRef.current) {
      reachedRef.current = true;
      toast.success("Daily hydration goal reached 🌿", {
        description: "Beautifully done. Your body thanks you.",
      });
    }
    if (ouncesToday < HYDRATION_GOAL_OZ) reachedRef.current = false;
  }, [ouncesToday]);

  // Gentle reminders while the page is open
  useEffect(() => {
    if (!remindersEnabled) return;
    const id = window.setInterval(() => {
      const last = lastReminderAt ?? 0;
      const due = Date.now() - last >= reminderIntervalMin * 60 * 1000;
      if (due && ouncesToday < HYDRATION_GOAL_OZ) {
        toast("Time for a sip 💧", { description: "A quick glass keeps you steady." });
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
        <h1 className="text-base font-semibold">Hydration</h1>
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
            <p className="text-4xl font-semibold tabular-nums">{ouncesToday}</p>
            <p className="text-xs text-muted-foreground">of {HYDRATION_GOAL_OZ} oz today</p>
            {pct >= 100 && (
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                <Check className="size-3" /> Goal complete
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-pretty">
          {pct >= 100
            ? "Goal reached. Beautifully done."
            : `${HYDRATION_GOAL_OZ - ouncesToday} oz to go · small sips, steady progress.`}
        </p>
      </div>

      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Quick add
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
        onClick={() => logHydration(-8)}
        disabled={ouncesToday === 0}
        className="w-full h-11 rounded-2xl bg-card ring-1 ring-black/5 text-sm font-medium text-muted-foreground flex items-center justify-center gap-2 mb-8 disabled:opacity-40"
      >
        <Undo2 className="size-4" /> Undo last 8 oz
      </button>

      <div className="grid grid-cols-8 gap-1.5 mb-8">
        {Array.from({ length: 8 }).map((_, i) => {
          const filled = ouncesToday >= (i + 1) * 8;
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
          <p className="text-sm font-medium">Hydration reminders</p>
          <p className="text-xs text-muted-foreground">
            {remindersEnabled
              ? `Gentle nudge every ${reminderIntervalMin} min while open`
              : "Off — turn on to get a gentle nudge"}
          </p>
        </div>
        <span
          className={`text-xs font-medium ${
            remindersEnabled ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {remindersEnabled ? "On" : "Off"}
        </span>
      </button>
    </AppShell>
  );
}