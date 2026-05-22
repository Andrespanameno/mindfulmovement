import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { Play, Clock } from "lucide-react";

export const Route = createFileRoute("/move")({
  head: () => ({
    meta: [
      { title: "Move — Mindful Movement" },
      { name: "description", content: "Gentle daily movement breaks for busy adults." },
    ],
  }),
  component: MovePage,
});

const categories = ["All", "Desk", "Morning", "Breathing", "Stretch"];

const sessions = [
  { title: "Neck & Shoulder Release", meta: "3 min", level: "Gentle", tint: "bg-primary/25" },
  { title: "Sun Salutation Flow", meta: "8 min", level: "Easy", tint: "bg-warm/40" },
  { title: "Box Breathing", meta: "5 min", level: "Calm", tint: "bg-accent/20" },
  { title: "Hip Opener", meta: "6 min", level: "Gentle", tint: "bg-primary/25" },
  { title: "Standing Reset", meta: "2 min", level: "Quick", tint: "bg-warm/40" },
];

function MovePage() {
  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-sm text-muted-foreground">Today's invitation</p>
        <h1 className="text-2xl font-semibold">Move a little</h1>
      </header>

      <div className="rounded-3xl bg-foreground text-background p-6 mb-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/30 blur-2xl" />
        <p className="text-xs uppercase tracking-widest text-background/60 mb-2">Featured</p>
        <h2 className="text-xl font-semibold mb-1">Morning Awakening</h2>
        <p className="text-sm text-background/70 mb-5 max-w-[260px]">
          A 6-minute flow to wake up your body, gently.
        </p>
        <button className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium">
          <Play className="size-4" /> Begin
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-6 px-6 pb-2 mb-6">
        {categories.map((c, i) => (
          <button
            key={c}
            className={`h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap ring-1 ring-black/5 ${
              i === 0 ? "bg-foreground text-background" : "bg-card text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sessions.map((s) => (
          <div
            key={s.title}
            className="p-3 pr-4 rounded-2xl bg-card ring-1 ring-black/5 flex items-center gap-4"
          >
            <div className={`size-14 rounded-xl flex items-center justify-center ${s.tint}`}>
              <Play className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <Clock className="size-3" /> {s.meta} • {s.level}
              </p>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}