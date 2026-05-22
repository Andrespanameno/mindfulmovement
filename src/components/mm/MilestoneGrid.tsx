import { useSessionStore } from "@/lib/useSessionStore";
import { milestones } from "@/lib/xp";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export function MilestoneGrid() {
  const s = useSessionStore();
  return (
    <div className="grid grid-cols-3 gap-3">
      {milestones.map((m) => {
        const done = m.achieved(s);
        const Icon = done ? m.icon : Lock;
        return (
          <div
            key={m.id}
            className={cn(
              "aspect-square rounded-2xl p-3 flex flex-col justify-between ring-1 transition",
              done
                ? "bg-card ring-primary/30"
                : "bg-card/60 ring-black/5 opacity-60",
            )}
            title={m.description}
          >
            <div
              className={cn(
                "size-8 rounded-lg grid place-items-center",
                done ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
            </div>
            <div>
              <p className="text-xs font-medium leading-tight">{m.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                {m.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}