import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { Play } from "lucide-react";
import { useMemo, useState } from "react";
import { movements, CATEGORIES, type MovementCategory } from "@/lib/movements";
import { MovementCard } from "@/components/mm/MovementCard";
import { useSessionStore } from "@/lib/useSessionStore";
import { useProfile } from "@/lib/useProfile";

export const Route = createFileRoute("/move")({
  head: () => ({
    meta: [
      { title: "Move — Mindful Movement" },
      { name: "description", content: "Gentle daily movement breaks for busy adults." },
    ],
  }),
  component: MovePage,
});

type Filter = "All" | MovementCategory;
const FILTERS: { id: Filter; label: string }[] = [
  { id: "All", label: "All" },
  ...CATEGORIES.map((c) => ({ id: c.id as Filter, label: c.short })),
];

function MovePage() {
  const [active, setActive] = useState<Filter>("All");
  const { completedToday } = useSessionStore();
  const { profile } = useProfile();
  const prefs = profile?.preferred_categories ?? [];

  const filtered = useMemo(() => {
    if (active !== "All") return movements.filter((m) => m.category === active);
    if (prefs.length === 0) return movements;
    // Preferred categories first, then the rest — keeps variety without hiding anything.
    const preferred = movements.filter((m) => prefs.includes(m.category));
    const others = movements.filter((m) => !prefs.includes(m.category));
    return [...preferred, ...others];
  }, [active, prefs]);

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
        <p className="text-sm text-background/70 max-w-[260px]">
          {completedToday.length > 0
            ? `${completedToday.length} session${completedToday.length > 1 ? "s" : ""} completed today. Keep flowing.`
            : "A few minutes is all it takes to feel a shift."}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-6 px-6 pb-2 mb-6">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap ring-1 ring-black/5 ${
              active === id ? "bg-foreground text-background" : "bg-card text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((m) => (
          <MovementCard key={m.id} movement={m} />
        ))}
      </div>
    </AppShell>
  );
}