import { useSessionStore } from "@/lib/useSessionStore";
import { milestones } from "@/lib/xp";
import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";
import { useContent } from "@/lib/i18n-content";
import { useI18n } from "@/lib/i18n";

function computeActiveDayStreaks(history: Record<string, { sessions: number }>) {
  const keys = Object.keys(history).sort();
  let run = 0;
  let best = 0;
  let current = 0;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();
  let lastActive: string | null = null;
  for (const k of keys) {
    if ((history[k]?.sessions ?? 0) > 0) {
      run += 1;
      best = Math.max(best, run);
      lastActive = k;
    } else {
      run = 0;
    }
  }
  if (lastActive && (lastActive === today || lastActive === yesterday)) {
    // walk backward to count current streak
    const d = new Date(lastActive);
    while (true) {
      const k = d.toISOString().slice(0, 10);
      if ((history[k]?.sessions ?? 0) > 0) {
        current += 1;
        d.setDate(d.getDate() - 1);
      } else break;
    }
  }
  return { current, best };
}

export function MilestoneGrid() {
  const s = useSessionStore();
  const c = useContent();
  const { lang } = useI18n();
  const achievedLabel = lang === "es" ? "Logrado" : "Achieved";
  const derived = computeActiveDayStreaks(s.history);
  const bestStreak = Math.max(s.bestStreak, derived.best);
  const streak = Math.max(s.streak, derived.current);
  const stateForMilestones = { ...s, streak, bestStreak };
  return (
    <div className="grid grid-cols-3 gap-3">
      {milestones.map((m) => {
        const done = m.achieved(stateForMilestones);
        const Icon = done ? m.icon : Lock;
        const label = c.milestoneLabel(m.id, m.label);
        const desc = c.milestoneDesc(m.id, m.description);
        return (
          <div
            key={m.id}
            className={cn(
              "aspect-square rounded-2xl p-3 flex flex-col justify-between ring-1 transition",
              done
                ? "bg-card ring-primary/30"
                : "bg-card/60 ring-black/5 opacity-60",
            )}
            title={desc}
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "size-8 rounded-lg grid place-items-center",
                  done ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
              </div>
              {done && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
                  <Check className="size-3" />
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-medium leading-tight">{label}</p>
              <p
                className={cn(
                  "text-[10px] mt-0.5 leading-tight",
                  done ? "text-primary font-medium" : "text-muted-foreground",
                )}
              >
                {done ? achievedLabel : desc}
              </p>
            </div>
            </div>
        );
      })}
    </div>
  );
}