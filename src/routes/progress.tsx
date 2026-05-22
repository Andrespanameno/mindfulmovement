import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { Smile, Clock, Droplet, Wind } from "lucide-react";
import type { ReactNode } from "react";

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
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-6">Your Journey</h1>

      <div className="p-6 rounded-3xl bg-foreground text-background mb-8 relative overflow-hidden">
        <p className="text-xs text-background/60 mb-1">Level 14</p>
        <p className="text-lg font-medium mb-4">Mindful Seeker</p>
        <div className="w-full h-1.5 bg-background/15 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-primary rounded-full" style={{ width: "70%" }} />
        </div>
        <p className="text-[10px] text-background/60">2,140 / 3,000 XP to Level 15</p>
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

      <h3 className="text-sm font-semibold mb-3">Recent wins</h3>
      <div className="grid grid-cols-3 gap-3">
        {["7-day streak", "First flow", "Hydrated week"].map((b) => (
          <div
            key={b}
            className="aspect-square rounded-2xl bg-card ring-1 ring-black/5 p-3 flex flex-col justify-between"
          >
            <div className="size-8 rounded-lg bg-primary/25" />
            <p className="text-xs font-medium leading-tight">{b}</p>
          </div>
        ))}
      </div>
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