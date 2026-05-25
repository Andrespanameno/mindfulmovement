import { useState, useEffect, useRef } from "react";
import { Clock, Sparkles, Check, Undo2, Play, Pause, Square } from "lucide-react";
import { toast } from "sonner";
import type { Movement } from "@/lib/movements";
import { encouragements } from "@/lib/movements";
import { completeMovement, uncompleteMovement, useSessionStore } from "@/lib/useSessionStore";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { MovementVisual } from "./MovementVisual";
import { useI18n } from "@/lib/i18n";
import { useContent } from "@/lib/i18n-content";

interface Props {
  movement: Movement;
  variant?: "full" | "compact";
}

export function MovementCard({ movement, variant = "full" }: Props) {
  const { completedToday } = useSessionStore();
  const { t } = useI18n();
  const c = useContent();
  const [justDone, setJustDone] = useState(false);
  const done = completedToday.includes(movement.id);
  const Icon = movement.icon;
  const title = c.movementTitle(movement.id, movement.title);
  const desc = c.movementDesc(movement.id, movement.description);
  const instr = c.movementInstr(movement.id, movement.instruction) ?? desc;
  const difficulty = c.difficulty(movement.difficulty);
  const categoryLabel = c.categoryLabel(movement.category, movement.category);

  const totalSeconds = Math.max(1, Math.round(movement.duration * 60));
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const timerReady = secondsLeft === 0;
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setStarted(true);
    setRunning(true);
  };
  const handlePause = () => setRunning(false);
  const handleResume = () => setRunning(true);
  const handleStop = () => {
    setRunning(false);
    setStarted(false);
    setSecondsLeft(totalSeconds);
  };

  const handleComplete = () => {
    if (done) return;
    if (!timerReady) return;
    completeMovement(movement);
    setJustDone(true);
    const rawMsg = encouragements[Math.floor(Math.random() * encouragements.length)];
    toast.success(t("mv.toast.xp", { xp: movement.xp }), { description: c.encouragement(rawMsg) });
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

  const handleUndo = () => {
    if (!done) return;
    uncompleteMovement(movement);
    toast(t("mv.toast.undone", { xp: movement.xp }), { description: t("mv.toast.undone_sub") });
    setSecondsLeft(totalSeconds);
    setStarted(false);
    setRunning(false);

    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from("movement_sessions")
        .delete()
        .eq("user_id", user.id)
        .eq("movement_id", movement.id)
        .gte("completed_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());
      if (error) console.error("[movement_sessions] delete failed:", error.message);

      if (movement.category === "breath-calm") {
        const { error: bErr } = await supabase
          .from("breathing_sessions")
          .delete()
          .eq("user_id", user.id)
          .eq("movement_id", movement.id)
          .gte("completed_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());
        if (bErr) console.error("[breathing_sessions] delete failed:", bErr.message);
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
          <p className="text-sm font-medium truncate">{title}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
            <Clock className="size-3" /> {movement.duration} {t("mv.min_short")} • {difficulty}
          </p>
        </div>
        <button
          onClick={done ? handleUndo : handleComplete}
          aria-label={done ? "Undo completion" : "Mark complete"}
          title={done ? "Tap to undo" : "Mark complete"}
          className={cn(
            "size-9 rounded-full flex items-center justify-center transition-all ring-1",
            done
              ? "bg-primary text-primary-foreground ring-primary hover:bg-primary/90"
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
              {categoryLabel}
            </span>
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            <span className="text-[10px] font-medium text-muted-foreground">
              {difficulty}
            </span>
          </div>
          <h3 className="font-medium leading-snug">{title}</h3>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-pretty leading-relaxed mb-4">
        {instr}
      </p>

      <MovementVisual movementId={movement.id} running={running} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {started ? formatTime(secondsLeft) : `${movement.duration} ${t("mv.min_short")}`}
          </span>
          <span className="inline-flex items-center gap-1">
            <Sparkles className="size-3.5 text-accent" /> +{movement.xp} XP
          </span>
        </div>
        {done ? (
          <button
            onClick={handleUndo}
            aria-label="Undo completion"
            title="Tap to undo"
            className={cn(
              "h-9 px-4 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all group",
              "bg-primary/15 text-primary hover:bg-primary/25 active:scale-95",
              justDone && "animate-scale-in",
            )}
          >
            <Check className="size-4 group-hover:hidden" />
            <Undo2 className="size-4 hidden group-hover:inline" />
            <span className="group-hover:hidden">{t("mv.done")}</span>
            <span className="hidden group-hover:inline">{t("mv.undo")}</span>
          </button>
        ) : !started ? (
          <button
            onClick={handleStart}
            aria-label="Start timer"
            className="h-9 px-4 rounded-full text-sm font-medium inline-flex items-center gap-2 bg-foreground text-background hover:opacity-90 active:scale-95 transition-all"
          >
            <Play className="size-4" /> {t("mv.start")}
          </button>
        ) : !timerReady ? (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background pl-3 pr-1 h-9 text-sm font-medium">
            <span className="tabular-nums">{formatTime(secondsLeft)}</span>
            <button
              onClick={running ? handlePause : handleResume}
              aria-label={running ? "Pause timer" : "Resume timer"}
              className="size-7 rounded-full bg-background/15 hover:bg-background/25 flex items-center justify-center transition-colors"
            >
              {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </button>
            <button
              onClick={handleStop}
              aria-label="Stop and reset timer"
              className="size-7 rounded-full bg-background/15 hover:bg-background/25 flex items-center justify-center transition-colors"
            >
              <Square className="size-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleComplete}
            aria-label="Mark done"
            className={cn(
              "h-9 px-4 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all",
              "bg-foreground text-background hover:opacity-90 active:scale-95",
              justDone && "animate-scale-in",
            )}
          >
            <Check className="size-4" /> {t("mv.done")}
          </button>
        )}
      </div>
    </div>
  );
}