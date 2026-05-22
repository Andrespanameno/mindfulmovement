import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { Flame, Sparkles, Droplet, Play, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Today — Mindful Movement" },
      { name: "description", content: "Your daily dashboard: XP, streak, hydration, and gentle movement suggestions." },
    ],
  }),
  component: HomePage,
});

const suggestions = [
  { title: "Neck & Shoulder Release", meta: "3 minutes • Gentle", tint: "bg-primary/20" },
  { title: "Box Breathing", meta: "5 minutes • Focus", tint: "bg-warm/40" },
  { title: "Mindful Walk Break", meta: "10 minutes • Refresh", tint: "bg-accent/20" },
];

function HomePage() {
  const hydrationPct = 64;
  return (
    <AppShell>
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-muted-foreground">Good morning, Alex</p>
          <h1 className="text-2xl font-semibold">Today is a fresh start</h1>
        </div>
        <Link to="/profile" className="size-10 rounded-full bg-secondary ring-1 ring-black/5" />
      </header>

      <section className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-secondary/60 ring-1 ring-black/5">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="size-4 text-accent" />
            <span className="text-xs font-medium text-muted-foreground">Streak</span>
          </div>
          <p className="text-2xl font-semibold">
            12 <span className="text-sm font-medium text-muted-foreground">days</span>
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-secondary/60 ring-1 ring-black/5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">XP Today</span>
          </div>
          <p className="text-2xl font-semibold">450</p>
        </div>
      </section>

      <Link
        to="/hydration"
        className="block p-6 rounded-3xl bg-card ring-1 ring-black/5 mb-8"
      >
        <div className="flex items-center gap-6">
          <HydrationRing pct={hydrationPct} />
          <div className="flex-1">
            <h3 className="font-medium flex items-center gap-2">
              <Droplet className="size-4 text-primary" /> Hydration Goal
            </h3>
            <p className="text-sm text-muted-foreground text-pretty mt-1">
              Almost there. Just two more glasses to reach your mark.
            </p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground shrink-0" />
        </div>
      </Link>

      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Suggested Movement
      </h4>
      <div className="space-y-3 mb-8">
        {suggestions.map((s) => (
          <Link
            key={s.title}
            to="/move"
            className="p-3 pr-4 rounded-2xl bg-card ring-1 ring-black/5 flex items-center gap-4 hover:ring-primary/60 transition"
          >
            <div className={`size-12 rounded-xl flex items-center justify-center ${s.tint}`}>
              <Play className="size-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.meta}</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <div className="pt-6 border-t border-border">
        <p className="text-sm italic text-muted-foreground text-pretty leading-relaxed">
          "Movement is a medicine for creating change in a person's physical, emotional, and
          mental states."
        </p>
        <p className="text-xs font-medium text-muted-foreground mt-2">— Carol Welch</p>
      </div>
    </AppShell>
  );
}

function HydrationRing({ pct }: { pct: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-20 shrink-0">
      <svg className="size-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} strokeWidth="6" fill="none" className="stroke-secondary" />
        <circle
          cx="40"
          cy="40"
          r={r}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          className="stroke-primary transition-all"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xs font-semibold">
        {pct}%
      </span>
    </div>
  );
}