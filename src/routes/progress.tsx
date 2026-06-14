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
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Mindful Movement" },
      { name: "description", content: "Your micro actions in a macro view: sessions, reps, minutes, hydration, breathing." },
    ],
  }),
  component: ProgressPage,
});

const DAY_LABELS_EN = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_LABELS_ES = ["D", "L", "M", "M", "J", "V", "S"];

function ProgressPage() {
  const { t, lang } = useI18n();
  const dayLabels = lang === "es" ? DAY_LABELS_ES : DAY_LABELS_EN;
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
  const hours = (summary.minutes / 60).toFixed(1);
  const hydrationDelta =
    range === "week" ? insights.weeklyConsistencyTrend : insights.monthlyConsistencyTrend;
  const pushupGrowth = range === "week" ? insights.weekPushupGrowth : insights.monthPushupGrowth;
  const squatGrowth = range === "week" ? insights.weekSquatGrowth : insights.monthSquatGrowth;
  const todayKey = new Date().toISOString().slice(0, 10);

  const summaries = useMemo(() => {
    const out: string[] = [];
    const n = summary.sessions;
    if (n > 0) {
      out.push(
        t(
          n === 1
            ? `progress.sum.sessions_one_${range}`
            : `progress.sum.sessions_many_${range}`,
          { n },
        ),
      );
    }
    if (summary.minutes > 0) {
      out.push(t(`progress.sum.hours_${range}`, { h: hours }));
    }
    if (sessionsTrend > 0) {
      out.push(t(`progress.sum.consistency_${range}`, { n: sessionsTrend }));
    }
    return out;
  }, [t, range, summary, hours, sessionsTrend]);

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{t("progress.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("progress.sub")}</p>
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
            {r === "week" ? t("progress.this_week") : t("progress.this_month")}
          </button>
        ))}
      </div>

      {summaries.length > 0 && (
        <div className="p-5 rounded-3xl bg-card ring-1 ring-black/5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-accent" />
            <h3 className="text-sm font-semibold">{t("progress.highlights")}</h3>
          </div>
          <ul className="space-y-2">
            {summaries.slice(0, 4).map((line, i) => (
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
          label={range === "week" ? t("progress.active_days_week") : t("progress.active_days_month")}
          value={`${summary.activeDays}/${summary.totalDays}`}
          hint={t("progress.active_days_hint")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <Stat
          icon={<Activity className="size-4 text-primary" />}
          label={t("progress.sessions")}
          value={summary.sessions}
          trend={sessionsTrend}
        />
        <Stat
          icon={<Clock className="size-4 text-primary" />}
          label={t("progress.minutes")}
          value={summary.minutes}
          hint={range === "week" ? t("progress.minutes_hint_week", { h: hours }) : t("progress.minutes_hint_month", { h: hours })}
        />
        <Stat
          icon={<Hand className="size-4 text-accent" />}
          label={t("progress.pushups")}
          value={summary.pushups}
          prev={prev.pushups}
        />
        <Stat
          icon={<Dumbbell className="size-4 text-accent" />}
          label={t("progress.squats")}
          value={summary.squats}
          prev={prev.squats}
        />
        <Stat
          icon={<Wind className="size-4 text-accent" />}
          label={t("progress.breathing")}
          value={summary.breathing}
          prev={prev.breathing}
        />
        <Stat
          icon={<Droplet className="size-4 text-primary" />}
          label={t("progress.hydration")}
          value={`${summary.hydrationConsistencyPct}%`}
          hint={`${hydrationDelta >= 0 ? "+" : ""}${hydrationDelta} ${range === "week" ? t("progress.pp_week") : t("progress.pp_month")}`}
        />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{t("progress.movement_minutes")}</h3>
        <span className="text-xs text-muted-foreground">
          {range === "week" ? t("progress.this_week") : t("progress.this_month")}
        </span>
      </div>
      <div className="p-4 rounded-3xl bg-card ring-1 ring-black/5 mb-8">
        <div className="flex items-end justify-between gap-1 h-28">
          {daily.map((d, i) => {
            const h = Math.max(4, Math.round((d.minutes / maxMin) * 100));
            const isToday = d.date === todayKey;
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
                  {dayLabels[date.getDay()]}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{t("progress.streak_history")}</h3>
        <span className="text-xs text-muted-foreground">{t("progress.this_month")}</span>
      </div>
      <div className="p-4 rounded-3xl bg-card ring-1 ring-black/5 mb-8">
        <div
          className="grid gap-[3px] mb-3"
          style={{ gridTemplateColumns: `repeat(${streakSeries.length}, 1fr)` }}
        >
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
              title={`${t("progress.day_label", { n: i + 1 })} · ${t("progress.streak_label", { n: p.current })}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Flame className="size-3 text-accent" />
            {t(session.streak === 1 ? "progress.current_streak_one" : "progress.current_streak_other", { n: session.streak })}
          </span>
          <span>
            {t(session.bestStreak === 1 ? "progress.best_streak_one" : "progress.best_streak_other", { n: session.bestStreak })}
          </span>
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-card ring-1 ring-black/5 space-y-4 mb-8">
        <h3 className="text-sm font-semibold">{t("progress.lifetime")}</h3>
        <Row
          icon={<Activity className="size-4 text-primary" />}
          label={t("progress.total_sessions")}
          value={String(session.totalSessions)}
        />
        <Row
          icon={<Clock className="size-4 text-primary" />}
          label={t("progress.total_minutes")}
          value={`${session.totalMinutes} (${(session.totalMinutes / 60).toFixed(1)} hrs)`}
        />
        <Row
          icon={<Hand className="size-4 text-accent" />}
          label={t("progress.total_pushups")}
          value={String(session.totalPushups)}
        />
        <Row
          icon={<Dumbbell className="size-4 text-accent" />}
          label={t("progress.total_squats")}
          value={String(session.totalSquats)}
        />
        <Row
          icon={<Wind className="size-4 text-accent" />}
          label={t("progress.total_breathing")}
          value={String(session.totalBreathing)}
        />
      </div>

      <h3 className="text-sm font-semibold mb-3">{t("progress.milestones")}</h3>
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
  const { t } = useI18n();
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
          {trend}% {t("progress.vs_prev")}
        </p>
      )}
      {!showTrend && showDelta && (
        <p className="text-[11px] text-muted-foreground mt-1">
          {prev === 0 && value === 0 ? t("progress.ready") : t("progress.from_prev", { n: prev })}
        </p>
      )}
      {hint && !showTrend && !showDelta && (
        <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>
      )}
    </div>
  );
}