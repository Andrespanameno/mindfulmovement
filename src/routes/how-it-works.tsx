import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { ArrowLeft, Heart, Clock, TrendingUp, Droplets, Wind, Sparkles } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Mindful Movement" },
      { name: "description", content: "Learn how Mindful Movement helps you build healthier daily habits." },
    ],
  }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  const features = [
    { icon: Heart, label: "Micro workouts" },
    { icon: TrendingUp, label: "Mobility" },
    { icon: Sparkles, label: "Posture resets" },
    { icon: Wind, label: "Breathing exercises" },
    { icon: Droplets, label: "Hydration reminders" },
    { icon: Clock, label: "Mindful wellness prompts" },
  ];

  return (
    <AppShell>
      <header className="mb-6">
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </header>

      <div className="flex flex-col items-center text-center mb-8">
        <div className="size-14 rounded-full bg-secondary ring-1 ring-black/5 mb-3 grid place-items-center">
          <Sparkles className="size-6 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold">How It Works</h1>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl bg-card ring-1 ring-black/5 p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Mindful Movement helps busy adults build healthier daily habits through small intentional movement sessions that fit naturally into real life.
          </p>
        </div>

        <div className="rounded-2xl bg-card ring-1 ring-black/5 p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Set your preferred reminder schedule and complete short guided movement resets throughout the day based on your lifestyle and routine.
          </p>
        </div>

        <div className="rounded-2xl bg-card ring-1 ring-black/5 p-6">
          <p className="text-sm font-medium text-foreground mb-4">The app combines:</p>
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl bg-secondary/60 px-3 py-2.5"
              >
                <Icon className="size-4 text-primary shrink-1" />
                <span className="text-sm text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card ring-1 ring-black/5 p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Track your consistency, movement, hydration, breathing, and progress over time — one small action at a time.
          </p>
        </div>

        <div className="rounded-2xl bg-warm/40 ring-1 ring-black/5 p-6 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Core Philosophy
          </p>
          <p className="text-lg font-semibold text-foreground italic">
            "Micro actions. Macro results."
          </p>
        </div>
      </div>
    </AppShell>
  );
}
