import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, SkipForward, X, Check, Sparkles } from "lucide-react";
import { AppShell } from "@/components/mm/AppShell";
import { buildGuidedSession, type SessionStep } from "@/lib/movements";
import { useProfile } from "@/lib/useProfile";
import { completeMovement } from "@/lib/useSessionStore";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { InspirationCard } from "@/components/mm/InspirationCard";
import { useI18n } from "@/lib/i18n";
import { MovementVisual } from "@/components/mm/MovementVisual";
import { getMovementImage } from "@/lib/movementImages";

export const Route = createFileRoute("/session")({
  head: () => ({
    meta: [
      { title: "Session — Mindful Movement" },
      { name: "description", content: "A short guided movement session, 5–6 minutes." },
    ],
  }),
  component: SessionPage,
});

function format(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function SessionPage() {
  const { t } = useI18n();
  const { profile } = useProfile();
  const navigate = useNavigate();

  // Build once per mount so the session feels consistent through.
  const [steps, setSteps] = useState<SessionStep[]>(() => buildGuidedSession(profile?.preferred_categories));
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(steps[0]?.seconds ?? 60);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loggedRef = useRef<Set<string>>(new Set());
  const [imgFailed, setImgFailed] = useState(false);

  // Reset image error state when the current step changes
  useEffect(() => {
    setImgFailed(false);
  }, [index]);

  // Rebuild when profile loads (if initial render had no prefs yet).
  useEffect(() => {
    if (!profile) return;
    if (steps.length === 0) {
      const next = buildGuidedSession(profile.preferred_categories);
      setSteps(next);
      setRemaining(next[0]?.seconds ?? 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const current = steps[index];
  const totalSeconds = useMemo(() => steps.reduce((a, s) => a + s.seconds, 0), [steps]);
  const elapsed = useMemo(() => {
    const past = steps.slice(0, index).reduce((a, s) => a + s.seconds, 0);
    const inStep = (current?.seconds ?? 0) - remaining;
    return past + Math.max(0, inStep);
  }, [steps, index, remaining, current]);
  const overallPct = totalSeconds > 0 ? Math.min(100, (elapsed / totalSeconds) * 100) : 0;
  const stepPct = current ? Math.min(100, ((current.seconds - remaining) / current.seconds) * 100) : 0;

  // Persist a completed step as a movement_session (one-shot per id).
  const logStep = (step: SessionStep) => {
    if (loggedRef.current.has(step.movement.id)) return;
    loggedRef.current.add(step.movement.id);
    completeMovement(step.movement);
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const minutes = Math.max(1, Math.round(step.seconds / 60));
      const { error } = await supabase.from("movement_sessions").insert({
        user_id: user.id,
        movement_id: step.movement.id,
        category: step.movement.category,
        title: step.movement.title,
        duration_min: minutes,
        reps: step.movement.reps ?? null,
        reps_type: step.movement.repsType ?? null,
        xp: step.movement.xp,
      });
      if (error) console.error("[movement_sessions] insert failed:", error.message);
      if (step.movement.category === "breath-calm") {
        await supabase.from("breathing_sessions").insert({
          user_id: user.id,
          movement_id: step.movement.id,
          title: step.movement.title,
          duration_min: minutes,
          xp: step.movement.xp,
        });
      }
    })();
  };

  // Advance only after the user confirms completion of the current step.
  const confirmStep = () => {
    if (!current) return;
    if (remaining > 0 || confirmed) return;
    logStep(current);
    setConfirmed(true);
  };

  const advanceToNext = () => {
    if (!current) return;
    if (!confirmed) return;
    if (index + 1 >= steps.length) {
      setDone(true);
      setRunning(false);
      return;
    }
    const next = steps[index + 1];
    setIndex(index + 1);
    setRemaining(next.seconds);
    setConfirmed(false);
    setRunning(true);
  };

  // Ticker
  useEffect(() => {
    if (!running || done) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) return 0;
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, done, index]);

  // Stop the ticker when a step's timer hits zero; user must tap Done to continue.
  useEffect(() => {
    if (remaining === 0 && running) setRunning(false);
  }, [remaining, running]);

  const handleExit = () => navigate({ to: "/home" });

  if (done) {
    const completed = steps.length;
    const totalXp = steps.reduce((a, s) => a + s.movement.xp, 0);
    return (
      <AppShell>
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
          <div className="size-20 rounded-full bg-primary/20 grid place-items-center mb-6 animate-scale-in">
            <Check className="size-10 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">{t("session.complete")}</h1>
          <InspirationCard placement="session_completion" variant="bare" className="max-w-sm mb-6" />
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
            <span>{t("session.movements", { n: completed })}</span>
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            <span>{t("session.min", { n: Math.round(totalSeconds / 60) })}</span>
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            <span className="inline-flex items-center gap-1"><Sparkles className="size-3.5 text-accent" /> +{totalXp} XP</span>
          </div>
          <div className="flex gap-3">
            <Link to="/home" className="h-10 px-5 rounded-full bg-foreground text-background text-sm font-medium grid place-items-center">
              {t("session.back_home")}
            </Link>
            <Link to="/progress" className="h-10 px-5 rounded-full bg-card ring-1 ring-black/5 text-sm font-medium grid place-items-center">
              {t("session.view_progress")}
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!current) {
    return (
      <AppShell>
        <div className="min-h-[60vh] grid place-items-center">
          <p className="text-muted-foreground">{t("session.preparing")}</p>
        </div>
      </AppShell>
    );
  }

  const Icon = current.movement.icon;

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("session.guided")}</p>
          <h1 className="text-lg font-semibold">{t("session.left", { t: format(totalSeconds - elapsed) })}</h1>
        </div>
        <button
          onClick={handleExit}
          aria-label="End session"
          className="size-10 rounded-full bg-card ring-1 ring-black/5 grid place-items-center hover:bg-accent/20"
        >
          <X className="size-4" />
        </button>
      </header>

      {/* Overall progress */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
        <div
          className="h-full bg-primary transition-[width] duration-1000 ease-linear"
          style={{ width: `${overallPct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mb-6">
        {t("session.step_of", { i: index + 1, n: steps.length })}
      </p>

      <div className="rounded-3xl bg-card ring-1 ring-black/5 p-6 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className={cn("size-14 rounded-2xl flex items-center justify-center shrink-0", current.movement.tint)}>
            <Icon className="size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {current.movement.category}
            </p>
            <h2 className="text-xl font-semibold leading-snug mb-1">{current.movement.title}</h2>
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
              {current.movement.description}
            </p>
          </div>
        </div>

        {/* Big timer */}
        <div className="flex flex-col items-center py-4">
          <div className="text-5xl font-semibold tabular-nums mb-3">{format(remaining)}</div>
          <div className="w-full max-w-xs h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-foreground transition-[width] duration-1000 ease-linear"
              style={{ width: `${stepPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        {remaining > 0 ? (
          <>
            <button
              onClick={() => setRunning((r) => !r)}
              aria-label={running ? "Pause" : "Resume"}
              className="h-12 px-6 rounded-full bg-foreground text-background text-sm font-medium inline-flex items-center gap-2 active:scale-95 transition-transform"
            >
              {running ? <><Pause className="size-4" /> {t("session.pause")}</> : <><Play className="size-4" /> {t("session.resume")}</>}
            </button>
            <button
              disabled
              aria-disabled="true"
              title={t("session.finish_first")}
              className="h-12 px-5 rounded-full bg-card ring-1 ring-black/5 text-sm font-medium inline-flex items-center gap-2 opacity-50 cursor-not-allowed"
            >
              <SkipForward className="size-4" /> {t("session.next")}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={confirmStep}
              disabled={confirmed}
              aria-label="Mark movement done"
              className={cn(
                "h-12 px-6 rounded-full text-sm font-medium inline-flex items-center gap-2 active:scale-95 transition-transform animate-scale-in",
                confirmed
                  ? "bg-card ring-1 ring-black/5 text-muted-foreground cursor-not-allowed"
                  : "bg-foreground text-background",
              )}
            >
              <Check className="size-4" /> {t("common.done")}
            </button>
            <button
              onClick={advanceToNext}
              disabled={!confirmed}
              aria-label="Next movement"
              title={confirmed ? undefined : "Tap Done first"}
              className={cn(
                "h-12 px-5 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-transform",
                confirmed
                  ? "bg-foreground text-background active:scale-95 animate-scale-in"
                  : "bg-card ring-1 ring-black/5 opacity-50 cursor-not-allowed",
              )}
            >
              <SkipForward className="size-4" /> {t("session.next")}
            </button>
          </>
        )}
      </div>

      {/* Upcoming preview */}
      {index + 1 < steps.length && (
        <div className="mt-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t("session.up_next")}</p>
          <ul className="space-y-2">
            {steps.slice(index + 1).map((s, i) => {
              const I = s.movement.icon;
              return (
                <li key={`${s.movement.id}-${i}`} className="flex items-center gap-3 p-3 rounded-2xl bg-card ring-1 ring-black/5">
                  <div className={cn("size-9 rounded-xl flex items-center justify-center", s.movement.tint)}>
                    <I className="size-4" />
                  </div>
                  <span className="flex-1 text-sm">{s.movement.title}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{format(s.seconds)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </AppShell>
  );
}