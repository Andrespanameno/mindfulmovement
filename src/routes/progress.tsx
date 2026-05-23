import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  Clock,
  Droplet,
  Wind,
  Hand,
  Dumbbell,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Flame,
} from "lucide-react";
import { AppShell } from "@/components/mm/AppShell";
import { XPBar } from "@/components/mm/XPBar";
import { StreakBadge } from "@/components/mm/StreakBadge";
import { MilestoneGrid } from "@/components/mm/MilestoneGrid";
import { useSessionStore } from "@/lib/useSessionStore";
import { computeInsights, streakHistoryFromDaily } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { InspirationCard } from "@/components/mm/InspirationCard";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Mindful Movement" },
      { name: "description", content: "Your micro actions in a macro view: sessions, reps, minutes, hydration, breathing." },
    ],
  }),
  component: ProgressPage,
});

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function ProgressPage() {
  const session = useSessionStore();
  const insights = useMemo(() => computeInsights(session), [session]);
  const [range, setRange] = useState<"week" | "month">("week");
  const summary = range === "week" ? insights.thisWeek : insights.thisMonth;
  const prev = range === "week" ? insights.lastWeek : insights.lastMonth;
  const sessionsTrend =
    range === "week" ? insights.weeklySessionsTrend : insights.monthlySessionsTrend;
  const daily = range === "week" ? insights.daily7 : insights.daily30;
  const maxMin = Math.max(1, ...daily.map((d) => d.minutes));
  const streakSeries = streakHistoryFromDaily(insights.daily30);
  const peakStreak = streakSeries.reduce((m, x) => Math.max(m, x.longest), 0);
  const hours = (summary.minutes / 60).toFixed(1);
  const hydrationDelta =
    insights.thisWeek.hydrationConsistencyPct - insights.lastWeek.hydrationConsistencyPct;

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Your Journey</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Small actions, real change — here's how it's adding up.
        </p>
      </header>

      <div className="flex p-1 bg-secondary/60 rounded-full mb-6 text-xs font-medium">
        {(["week", "month"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "flex-1 h-9 rounded-full transition-colors capitalize",
              range === r ? "bg-background shadow-sm text-foreground" : "text-muted-foreground",
            )}
          >
            This {r}
          </button>
        ))}
      </div>

      {insights.summaries.length > 0 && (
        <div className="p-5 rounded-3xl bg-card ring-1 ring-black/5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-accent" />
            <h3 className="text-sm font-semibold">Highlights</h3>
          </div>
          <ul className="space-y-2">
            {insights.summaries.slice(0, 4).map((line, i) => (
              <li key={i} className="text-sm text-foreground/85 text-pretty leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6">
        <XPBar variant="dark" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StreakBadge />
        <Stat
          label="Active days"
          value={`${summary.activeDays}/${summary.totalDays}`}
          hint="You showed up."
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <Stat
          icon={<Activity className="size-4 text-primary" />}
          label="Sessions"
          value={summary.sessions}
          trend={sessionsTrend}
        />
        <Stat
          icon={<Clock className="size-4 text-primary" />}
          label="Minutes moved"
          value={summary.minutes}
          hint={`${hours} hrs this ${range}`}
        />
        <Stat
          icon={<Hand className="size-4 text-accent" />}
          label="Pushups"
          value={summary.pushups}
          prev={prev.pushups}
        />
        <Stat
          icon={<Dumbbell className="size-4 text-accent" />}
          label="Squats"
          value={summary.squats}
          prev={prev.squats}
        />
        <Stat
          icon={<Wind className="size-4 text-accent" />}
          label="Breathing"
          value={summary.breathing}
          prev={prev.breathing}
        />
        <Stat
          icon={<Droplet className="size-4 text-primary" />}
          label="Hydration"
          value={`${summary.hydrationConsistencyPct}%`}
          hint={`${hydrationDelta >= 0 ? "+" : ""}${hydrationDelta}pp wk/wk`}
        />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Movement minutes</h3>
        <span className="text-xs text-muted-foreground">
          {range === "week" ? "Last 7 days" : "Last 30 days"}
        </span>
      </div>
      <div className="p-4 rounded-3xl bg-card ring-1 ring-black/5 mb-8">
        <div className="flex items-end justify-between gap-1 h-28">
          {daily.map((d, i) => {
            const h = Math.max(4, Math.round((d.minutes / maxMin) * 100));
            const isToday = i === daily.length - 1;
            return (
              <div
                key={d.date}
                className="flex-1 h-full flex flex-col items-center justify-end"
                title={`${d.date}: ${d.minutes} min`}
              >
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all",
                    isToday ? "bg-primary" : d.minutes > 0 ? "bg-primary/40" : "bg-secondary",
                  )}
                  style={{ height: `${h}%` }}
                />
              </div>
            );
          })}
        </div>
        {range === "week" && (
          <div className="flex justify-between mt-2 px-0.5">
            {daily.map((d) => {
              const date = new Date(d.date);
              return (
                <span key={d.date} className="flex-1 text-center text-[10px] text-muted-foreground">
                  {DAY_LABELS[date.getDay()]}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Streak history</h3>
        <span className="text-xs text-muted-foreground">Last 30 days</span>
      </div>
      <div className="p-4 rounded-3xl bg-card ring-1 ring-black/5 mb-8">
        <div className="grid grid-cols-[repeat(30,1fr)] gap-[3px] mb-3">
          {streakSeries.map((p, i) => (
            <div
              key={i}
              className={cn(
                "h-8 rounded-sm",
                p.current === 0
                  ? "bg-secondary"
                  : p.current < 3
                    ? "bg-primary/30"
                    : p.current < 7
                      ? "bg-primary/60"
                      : "bg-primary",
              )}
              title={`Day ${i + 1}: streak ${p.current}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Flame className="size-3 text-accent" /> Current {session.streak} · Best{" "}
            {session.bestStreak}
          </span>
          <span>Peak run: {peakStreak} days</span>
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-card ring-1 ring-black/5 space-y-4 mb-8">
        <h3 className="text-sm font-semibold">Lifetime totals</h3>
        <Row
          icon={<Activity className="size-4 text-primary" />}
          label="Movement sessions"
          value={String(session.totalSessions)}
        />
        <Row
          icon={<Clock className="size-4 text-primary" />}
          label="Movement minutes"
          value={`${session.totalMinutes} (${(session.totalMinutes / 60).toFixed(1)} hrs)`}
        />
        <Row
          icon={<Hand className="size-4 text-accent" />}
          label="Total pushups"
          value={String(session.totalPushups)}
        />
        <Row
          icon={<Dumbbell className="size-4 text-accent" />}
          label="Total squats"
          value={String(session.totalSquats)}
        />
        <Row
          icon={<Wind className="size-4 text-accent" />}
          label="Breathing sessions"
          value={String(session.totalBreathing)}
        />
      </div>

      <h3 className="text-sm font-semibold mb-3">Milestones</h3>
      <MilestoneGrid />
      <InspirationCard placement="progress_summary" variant="bare" className="mt-6" />
    </AppShell>
  );
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-secondary grid place-items-center">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  trend,
  prev,
}: {
  icon?: ReactNode;
  label: string;
  value: number | string;
  hint?: string;
  trend?: number;
  prev?: number;
}) {
  const showTrend = typeof trend === "number" && Number.isFinite(trend);
  const showDelta = typeof prev === "number" && typeof value === "number";
  const TrendIcon = showTrend
    ? trend! > 0
      ? TrendingUp
      : trend! < 0
        ? TrendingDown
        : Minus
    : null;
  return (
    <div className="p-4 rounded-2xl bg-card ring-1 ring-black/5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      {showTrend && TrendIcon && (
        <p
          className={cn(
            "text-[11px] mt-1 inline-flex items-center gap-1 font-medium",
            trend! > 0 ? "text-primary" : "text-muted-foreground",
          )}
        >
          <TrendIcon className="size-3" />
          {trend! > 0 ? "+" : ""}
          {trend}% vs prev
        </p>
      )}
      {!showTrend && showDelta && (
        <p className="text-[11px] text-muted-foreground mt-1">
          {prev === 0 && value === 0 ? "Ready when you are" : `from ${prev} last ${"period"}`}
        </p>
      )}
      {hint && !showTrend && !showDelta && (
        <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>
      )}
    </div>
  );
}