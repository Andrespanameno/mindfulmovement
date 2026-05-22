import type { DailyEntry, SessionState } from "./useSessionStore";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function range(daysBack: number, endOffset = 0): string[] {
  const out: string[] = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i - endOffset);
    out.push(dayKey(d));
  }
  return out;
}

function sumWindow(s: SessionState, days: string[]) {
  return days.reduce(
    (acc, k) => {
      const e = s.history[k];
      if (!e) return acc;
      return {
        sessions: acc.sessions + e.sessions,
        minutes: acc.minutes + e.minutes,
        pushups: acc.pushups + e.pushups,
        squats: acc.squats + e.squats,
        breathing: acc.breathing + e.breathing,
        ouncesLogged: acc.ouncesLogged + e.ouncesLogged,
        goalDays: acc.goalDays + (e.hitHydrationGoal ? 1 : 0),
        activeDays: acc.activeDays + (e.sessions > 0 ? 1 : 0),
      };
    },
    {
      sessions: 0,
      minutes: 0,
      pushups: 0,
      squats: 0,
      breathing: 0,
      ouncesLogged: 0,
      goalDays: 0,
      activeDays: 0,
    },
  );
}

export interface PeriodSummary {
  sessions: number;
  minutes: number;
  pushups: number;
  squats: number;
  breathing: number;
  hydrationConsistencyPct: number; // % of days that hit goal
  activeDays: number;
  totalDays: number;
}

function buildSummary(s: SessionState, days: string[]): PeriodSummary {
  const w = sumWindow(s, days);
  return {
    sessions: w.sessions,
    minutes: w.minutes,
    pushups: w.pushups,
    squats: w.squats,
    breathing: w.breathing,
    hydrationConsistencyPct: Math.round((w.goalDays / days.length) * 100),
    activeDays: w.activeDays,
    totalDays: days.length,
  };
}

export interface ProgressInsights {
  thisWeek: PeriodSummary;
  lastWeek: PeriodSummary;
  thisMonth: PeriodSummary;
  lastMonth: PeriodSummary;
  weeklySessionsTrend: number; // %
  weeklyMinutesTrend: number; // %
  weeklyConsistencyTrend: number; // pp change
  monthlySessionsTrend: number;
  daily7: DailyEntry[];
  daily30: DailyEntry[];
  pushupGrowth: { from: number; to: number };
  squatGrowth: { from: number; to: number };
  summaries: string[];
}

function pct(curr: number, prev: number): number {
  if (prev <= 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

function dailySeries(s: SessionState, days: string[]): DailyEntry[] {
  return days.map(
    (date) =>
      s.history[date] ?? {
        date,
        sessions: 0,
        minutes: 0,
        pushups: 0,
        squats: 0,
        breathing: 0,
        ouncesLogged: 0,
        hitHydrationGoal: false,
        xp: 0,
      },
  );
}

export function computeInsights(s: SessionState): ProgressInsights {
  const week = range(7);
  const prevWeek = range(7, 7);
  const month = range(30);
  const prevMonth = range(30, 30);

  const thisWeek = buildSummary(s, week);
  const lastWeek = buildSummary(s, prevWeek);
  const thisMonth = buildSummary(s, month);
  const lastMonth = buildSummary(s, prevMonth);

  const weeklySessionsTrend = pct(thisWeek.sessions, lastWeek.sessions);
  const weeklyMinutesTrend = pct(thisWeek.minutes, lastWeek.minutes);
  const weeklyConsistencyTrend =
    thisWeek.hydrationConsistencyPct - lastWeek.hydrationConsistencyPct;
  const monthlySessionsTrend = pct(thisMonth.sessions, lastMonth.sessions);

  const pushupGrowth = { from: lastWeek.pushups, to: thisWeek.pushups };
  const squatGrowth = { from: lastWeek.squats, to: thisWeek.squats };

  const hours = (thisMonth.minutes / 60).toFixed(1);
  const summaries: string[] = [];

  summaries.push(
    `You completed ${thisMonth.sessions} mindful movement${thisMonth.sessions === 1 ? "" : "s"} this month.`,
  );
  if (thisMonth.minutes > 0) {
    summaries.push(`You accumulated ${hours} hours of intentional movement.`);
  }
  if (pushupGrowth.to > pushupGrowth.from && pushupGrowth.from >= 0) {
    summaries.push(
      `Your pushups improved from ${pushupGrowth.from} to ${pushupGrowth.to}.`,
    );
  }
  if (squatGrowth.to > squatGrowth.from && squatGrowth.from >= 0) {
    summaries.push(
      `Your squats improved from ${squatGrowth.from} to ${squatGrowth.to}.`,
    );
  }
  if (weeklyConsistencyTrend > 0) {
    summaries.push(
      `Your hydration consistency improved this week (+${weeklyConsistencyTrend} points).`,
    );
  } else if (weeklySessionsTrend > 0) {
    summaries.push(`Your consistency improved this week (+${weeklySessionsTrend}%).`);
  }
  if (thisWeek.breathing > 0) {
    summaries.push(
      `You took ${thisWeek.breathing} mindful breathing session${thisWeek.breathing === 1 ? "" : "s"} this week.`,
    );
  }

  return {
    thisWeek,
    lastWeek,
    thisMonth,
    lastMonth,
    weeklySessionsTrend,
    weeklyMinutesTrend,
    weeklyConsistencyTrend,
    monthlySessionsTrend,
    daily7: dailySeries(s, week),
    daily30: dailySeries(s, month),
    pushupGrowth,
    squatGrowth,
    summaries,
  };
}

export function streakHistoryFromDaily(daily: DailyEntry[]): {
  current: number;
  longest: number;
}[] {
  // Return rolling streak counts per day for sparkline-style display
  let run = 0;
  let best = 0;
  return daily.map((d) => {
    if (d.sessions > 0) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
    return { current: run, longest: best };
  });
}