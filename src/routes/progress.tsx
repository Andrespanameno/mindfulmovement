import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { Smile, Clock, Droplet, Wind } from "lucide-react";
import type { ReactNode } from "react";
import { XPBar } from "@/components/mm/XPBar";
import { StreakBadge } from "@/components/mm/StreakBadge";
import { MilestoneGrid } from "@/components/mm/MilestoneGrid";
import { useSessionStore } from "@/lib/useSessionStore";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Mindful Movement" },
      { name: "description", content: "Your gentle journey: streaks, weekly consistency, and wins." },
    ],
  }),
  component: ProgressPage,
});

const days = [
  { d: "M", h: 40 },
  { d: "T", h: 65 },
  { d: "W", h: 55 },
  { d: "T", h: 90, today: true },
  { d: "F", h: 30 },
  { d: "S", h: 75 },
  { d: "S", h: 50 },
];

function ProgressPage() {
  const { xpToday } = useSessionStore();
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-6">Your Journey</h1>

      <div className="mb-6">
        <XPBar variant="dark" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <StreakBadge />
        <div className="p-4 rounded-2xl bg-secondary/60 ring-1 ring-black/5">
          <p className="text-xs font-medium text-muted-foreground mb-3">XP Today</p>
          <p className="text-2xl font-semibold">{xpToday}</p>
          <p className="text-[11px] text-muted-foreground mt-1">You're building momentum.</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Weekly Consistency</h3>
        <span className="text-xs text-muted-foreground">Last 7 days</span>
      </div>
      <div className="flex justify-between items-end h-28 gap-2 px-1 mb-8">
        {days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
            <div className="w-full flex-1 flex items-end">
              <div
                className={`w-full rounded-t-md ${d.today ? "bg-primary" : "bg-secondary"}`}
                style={{ height: `${d.h}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{d.d}</span>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl bg-card ring-1 ring-black/5 space-y-4 mb-6">
        <Row icon={<Smile className="size-4 text-accent" />} bg="bg-warm/40" label="Daily Mindfulness" trend="+12%" />
        <Row icon={<Clock className="size-4 text-primary" />} bg="bg-primary/25" label="Active Minutes" trend="+5%" />
        <Row icon={<Droplet className="size-4 text-primary" />} bg="bg-primary/25" label="Hydration" trend="+8%" />
        <Row icon={<Wind className="size-4 text-accent" />} bg="bg-accent/20" label="Breathing Sessions" trend="+3%" />
      </div>

      <h3 className="text-sm font-semibold mb-3">Milestones</h3>
      <MilestoneGrid />
      <p className="text-xs text-muted-foreground italic mt-4 text-center">
        Small actions create big change.
      </p>
    </AppShell>
  );
}

function Row({
  icon,
  bg,
  label,
  trend,
}: {
  icon: ReactNode;
  bg: string;
  label: string;
  trend: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`size-8 rounded-lg flex items-center justify-center ${bg}`}>{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-xs font-medium text-primary-foreground bg-primary/80 px-2 py-0.5 rounded-full">
        {trend}
      </span>
    </div>
  );
}