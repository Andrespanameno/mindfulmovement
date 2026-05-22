import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { Droplet, Minus, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useSessionStore, logHydration, HYDRATION_GOAL, HYDRATION_XP } from "@/lib/useSessionStore";

export const Route = createFileRoute("/hydration")({
  head: () => ({
    meta: [
      { title: "Hydration — Mindful Movement" },
      { name: "description", content: "Track your daily water intake gently." },
    ],
  }),
  component: HydrationPage,
});

function HydrationPage() {
  const { glasses } = useSessionStore();
  const pct = Math.min(100, Math.round((glasses / HYDRATION_GOAL) * 100));
  const r = 86;
  const c = 2 * Math.PI * r;

  const add = () => {
    if (glasses < HYDRATION_GOAL) {
      toast.success(`+${HYDRATION_XP} XP`, { description: "Small sips, big impact." });
    }
    logHydration(1);
  };

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-6">
        <Link
          to="/home"
          className="size-10 rounded-full bg-card ring-1 ring-black/5 grid place-items-center"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-base font-semibold">Hydration</h1>
        <div className="size-10" />
      </header>

      <div className="rounded-3xl bg-card ring-1 ring-black/5 p-8 mb-6 text-center">
        <div className="relative mx-auto size-48 mb-4">
          <svg className="size-48 -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={r} strokeWidth="14" fill="none" className="stroke-secondary" />
            <circle
              cx="100"
              cy="100"
              r={r}
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c - (c * pct) / 100}
              className="stroke-primary transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplet className="size-5 text-primary mb-1" />
            <p className="text-4xl font-semibold">{glasses}</p>
            <p className="text-xs text-muted-foreground">of {HYDRATION_GOAL} glasses</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-pretty">
          {pct >= 100 ? "Goal reached. Beautifully done." : "Small sips, steady progress."}
        </p>
      </div>

      <div className="flex items-center justify-center gap-6 mb-8">
        <button
          onClick={() => logHydration(-1)}
          className="size-14 rounded-full bg-card ring-1 ring-black/5 grid place-items-center"
        >
          <Minus className="size-5" />
        </button>
        <button
          onClick={add}
          className="h-14 px-8 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2"
        >
          <Plus className="size-5" /> Add a glass
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: HYDRATION_GOAL }).map((_, i) => (
          <div
            key={i}
            className={`aspect-[3/4] rounded-2xl ring-1 ring-black/5 flex items-end justify-center pb-2 transition ${
              i < glasses ? "bg-primary/20" : "bg-card"
            }`}
          >
            <Droplet
              className={`size-4 ${i < glasses ? "text-primary" : "text-muted-foreground/40"}`}
            />
          </div>
        ))}
      </div>
    </AppShell>
  );
}