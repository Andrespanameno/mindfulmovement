import { useState } from "react";
import { Clock, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import type { Movement } from "@/lib/movements";
import { encouragements } from "@/lib/movements";
import { completeMovement, useSessionStore } from "@/lib/useSessionStore";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  movement: Movement;
  variant?: "full" | "compact";
}

export function MovementCard({ movement, variant = "full" }: Props) {
  const { completedToday } = useSessionStore();
  const [justDone, setJustDone] = useState(false);
  const done = completedToday.includes(movement.id);
  const Icon = movement.icon;

  const handleComplete = () => {
    if (done) return;
    completeMovement(movement);
    setJustDone(true);
    const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
    toast.success(`+${movement.xp} XP`, { description: msg });
    setTimeout(() => setJustDone(false), 1400);

    // Persist to backend (fire-and-forget; UI already updated optimistically)
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from("movement_sessions").insert({
        user_id: user.id,
        movement_id: movement.id,
        category: movement.category,
        title: movement.title,
        duration_min: movement.duration,
        reps: movement.reps ?? null,
        reps_type: movement.repsType ?? null,
        xp: movement.xp,
      });
      if (error) console.error("[movement_sessions] insert failed:", error.message);

      // Mirror to breathing_sessions table for breathing-specific aggregations
      if (movement.category === "breath-calm") {
        const { error: bErr } = await supabase.from("breathing_sessions").insert({
          user_id: user.id,
          movement_id: movement.id,
          title: movement.title,
          duration_min: movement.duration,
          xp: movement.xp,
        });
        if (bErr) console.error("[breathing_sessions] insert failed:", bErr.message);
      }
    })();
  };

  if (variant === "compact") {
    return (
      <div className="p-3 pr-4 rounded-2xl bg-card ring-1 ring-black/5 flex items-center gap-4">
        <div className={cn("size-12 rounded-xl flex items-center justify-center", movement.tint)}>
          <Icon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{movement.title}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
            <Clock className="size-3" /> {movement.duration} min • {movement.difficulty}
          </p>
        </div>
        <button
          onClick={handleComplete}
          aria-label={done ? "Completed" : "Mark complete"}
          className={cn(
            "size-9 rounded-full flex items-center justify-center transition-all ring-1",
            done
              ? "bg-primary text-primary-foreground ring-primary"
              : "bg-background ring-black/10 hover:ring-primary/60",
            justDone && "animate-scale-in",
          )}
        >
          <Check className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-5 rounded-3xl bg-card ring-1 ring-black/5 transition-all",
        done && "ring-primary/40",
      )}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className={cn(
            "size-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform",
            movement.tint,
            justDone && "animate-scale-in",
          )}
        >
          <Icon className="size-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {movement.category}
            </span>
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            <span className="text-[10px] font-medium text-muted-foreground">
              {movement.difficulty}
            </span>
          </div>
          <h3 className="font-medium leading-snug">{movement.title}</h3>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-pretty leading-relaxed mb-4">
        {movement.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {movement.duration} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Sparkles className="size-3.5 text-accent" /> +{movement.xp} XP
          </span>
        </div>
        <button
          onClick={handleComplete}
          disabled={done}
          className={cn(
            "h-9 px-4 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all",
            done
              ? "bg-primary/15 text-primary cursor-default"
              : "bg-foreground text-background hover:opacity-90 active:scale-95",
            justDone && "animate-scale-in",
          )}
        >
          {done ? (
            <>
              <Check className="size-4" /> Done
            </>
          ) : (
            "Complete"
          )}
        </button>
      </div>
    </div>
  );
}