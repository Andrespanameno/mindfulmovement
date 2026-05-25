import type { DailyEntry, SessionState } from "./useSessionStore";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function daysBetween(start: Date, end: Date): string[] {
  const out: string[] = [];
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const stop = new Date(end);
  stop.setHours(0, 0, 0, 0);
  while (d <= stop) {
    out.push(dayKey(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

// Monday as the start of the week
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return d;
}

function endOfWeek(date: Date): Date {
  const s = startOfWeek(date);
  s.setDate(s.getDate() + 6);
  return s;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function currentWeekDays(now: Date = new Date()): string[] {
  return daysBetween(startOfWeek(now), endOfWeek(now));
}

export function currentMonthDays(now: Date = new Date()): string[] {
  return daysBetween(startOfMonth(now), endOfMonth(now));
}

export function previousWeekDays(now: Date = new Date()): string[] {
  const s = startOfWeek(now);
  s.setDate(s.getDate() - 7);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  return daysBetween(s, e);
}

export function previousMonthDays(now: Date = new Date()): string[] {
  const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const e = new Date(now.getFullYear(), now.getMonth(), 0);
  return daysBetween(s, e);
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
  monthlyConsistencyTrend: number;
  daily7: DailyEntry[];
  daily30: DailyEntry[];
  weekPushupGrowth: { from: number; to: number };
  weekSquatGrowth: { from: number; to: number };
  monthPushupGrowth: { from: number; to: number };
  monthSquatGrowth: { from: number; to: number };
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
  const now = new Date();
  const week = currentWeekDays(now);
  const prevWeek = previousWeekDays(now);
  const month = currentMonthDays(now);
  const prevMonth = previousMonthDays(now);

  const thisWeek = buildSummary(s, week);
  const lastWeek = buildSummary(s, prevWeek);
  const thisMonth = buildSummary(s, month);
  const lastMonth = buildSummary(s, prevMonth);

  const weeklySessionsTrend = pct(thisWeek.sessions, lastWeek.sessions);
  const weeklyMinutesTrend = pct(thisWeek.minutes, lastWeek.minutes);
  const weeklyConsistencyTrend =
    thisWeek.hydrationConsistencyPct - lastWeek.hydrationConsistencyPct;
  const monthlyConsistencyTrend =
    thisMonth.hydrationConsistencyPct - lastMonth.hydrationConsistencyPct;
  const monthlySessionsTrend = pct(thisMonth.sessions, lastMonth.sessions);

  const weekPushupGrowth = { from: lastWeek.pushups, to: thisWeek.pushups };
  const weekSquatGrowth = { from: lastWeek.squats, to: thisWeek.squats };
  const monthPushupGrowth = { from: lastMonth.pushups, to: thisMonth.pushups };
  const monthSquatGrowth = { from: lastMonth.squats, to: thisMonth.squats };

  return {
    thisWeek,
    lastWeek,
    thisMonth,
    lastMonth,
    weeklySessionsTrend,
    weeklyMinutesTrend,
    weeklyConsistencyTrend,
    monthlySessionsTrend,
    monthlyConsistencyTrend,
    daily7: dailySeries(s, week),
    daily30: dailySeries(s, month),
    weekPushupGrowth,
    weekSquatGrowth,
    monthPushupGrowth,
    monthSquatGrowth,
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