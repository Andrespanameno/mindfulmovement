import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, SkipForward, X, Check, Sparkles } from "lucide-react";
import { App as CapacitorApp } from "@capacitor/app";
import { isNative } from "@/lib/native";
import { AppShell } from "@/components/mm/AppShell";
import { buildGuidedSession, type SessionStep } from "@/lib/movements";
import { useProfile } from "@/lib/useProfile";
import { completeMovement } from "@/lib/useSessionStore";
import { supabase } from "@/integrations/supabase/client";
import { setGuidedSessionActive } from "@/lib/reminderDedup";
import { cn } from "@/lib/utils";
import { InspirationCard } from "@/components/mm/InspirationCard";
import { useI18n } from "@/lib/i18n";
import { useContent } from "@/lib/i18n-content";
import { MovementVisual } from "@/components/mm/MovementVisual";
import { getMovementImage } from "@/lib/movementImages";
import { useReminderSettings } from "@/lib/reminders";
import { logHydration, QUICK_ADDS_OZ } from "@/lib/useSessionStore";
import { mlToOz, QUICK_ADDS_ML, type HydrationUnit } from "@/lib/hydrationUnit";
import { Droplet } from "lucide-react";
import { notify } from "@/lib/notify";

// Track recently-used movement ids across guided sessions so repeats are
// avoided. Stored in localStorage; capped at the last N ids.
const RECENT_IDS_KEY = "mm.recent_movement_ids";
const RECENT_MAX = 12;

function readRecentIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function pushRecentIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    const prev = readRecentIds();
    const next = [...ids, ...prev.filter((id) => !ids.includes(id))].slice(0, RECENT_MAX);
    window.localStorage.setItem(RECENT_IDS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

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
  const content = useContent();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const reminders = useReminderSettings();
  const unit: HydrationUnit = profile?.hydration_unit ?? "oz";
  const [hydrationLogged, setHydrationLogged] = useState(false);
  const [hydrationSkipped, setHydrationSkipped] = useState(false);

  // Mark a guided session as active so reminder surfaces (native taps and
  // in-app toasts) can de-duplicate against an in-progress session.
  useEffect(() => {
    setGuidedSessionActive(true);
    return () => setGuidedSessionActive(false);
  }, []);

  // Defer building until profile loads so the user's saved
  // session_max_minutes preference is applied on the very first build.
  // Building eagerly with `profile == null` silently falls back to 5.
  const [steps, setSteps] = useState<SessionStep[]>([]);
  const builtForMaxRef = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loggedRef = useRef<Set<string>>(new Set());
  const [imgFailed, setImgFailed] = useState(false);

  // Timestamp-based timer state. `runStartAt` is the wall-clock ms when the
  // current running segment began; `elapsedBeforeMs` accumulates time from
  // prior running segments within the same step (across pauses).
  const currentStepSeconds = steps[index]?.seconds ?? 0;
  const [runStartAt, setRunStartAt] = useState<number | null>(() => Date.now());
  const [elapsedBeforeMs, setElapsedBeforeMs] = useState(0);
  const [nowTs, setNowTs] = useState(() => Date.now());

  const computeRemaining = useCallback(
    (now: number) => {
      const stepSec = currentStepSeconds;
      if (stepSec <= 0) return 0;
      const runningMs = running && runStartAt != null ? Math.max(0, now - runStartAt) : 0;
      const usedSec = Math.floor((elapsedBeforeMs + runningMs) / 1000);
      return Math.max(0, stepSec - usedSec);
    },
    [currentStepSeconds, running, runStartAt, elapsedBeforeMs],
  );
  const remaining = computeRemaining(nowTs);

  // Reset image error state when the current step changes
  useEffect(() => {
    setImgFailed(false);
  }, [index]);

  // Once the user reaches the completion screen, the session is no longer
  // "in progress" — clear the dedup flag immediately so any stale native
  // notification state cannot interfere with completion-screen navigation.
  useEffect(() => {
    if (done) setGuidedSessionActive(false);
  }, [done]);

  // Build (or rebuild) whenever the profile loads or the saved max-length
  // preference changes — but never mid-session. This ensures we always read
  // the *latest* saved preference before generating steps, regardless of how
  // the user landed here (home, reminder toast, native notification tap).
  useEffect(() => {
    if (!profile) return;
    const max = profile.session_max_minutes ?? 5;
    if (builtForMaxRef.current === max && steps.length > 0) return;
    // Don't disrupt an in-progress session past the first step.
    if (steps.length > 0 && index > 0) return;
    console.info(
      `[guided-session] building with session_max_minutes=${max} (profile loaded)`,
    );
    const next = buildGuidedSession({
      preferredCategories: profile.preferred_categories,
      fitnessLevel: profile.fitness_level,
      workStyle: profile.work_style,
      lifestyle: profile.lifestyle,
      wellnessGoals: profile.wellness_goals,
      recentIds: readRecentIds(),
      allowBreath: reminders.breath,
      includeBreath: reminders.breath,
      maxMinutes: max,
      nudges: {
        movement: reminders.movement,
        hydration: reminders.hydration,
        breath: reminders.breath,
      },
    });
    builtForMaxRef.current = max;
    setSteps(next);
    setIndex(0);
    setConfirmed(false);
    setElapsedBeforeMs(0);
    setRunStartAt(Date.now());
    setNowTs(Date.now());
    setRunning(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, profile?.session_max_minutes]);

  // Once a session has been built, record its movement ids so the next
  // guided session will down-weight them.
  useEffect(() => {
    if (steps.length > 0) pushRecentIds(steps.map((s) => s.movement.id));
  }, [steps]);

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
    setIndex(index + 1);
    setElapsedBeforeMs(0);
    setRunStartAt(Date.now());
    setNowTs(Date.now());
    setConfirmed(false);
    setRunning(true);
  };

  // Pause/resume: when running flips, capture or release the running segment.
  const toggleRunning = () => {
    const now = Date.now();
    if (running) {
      if (runStartAt != null) {
        setElapsedBeforeMs((e) => e + Math.max(0, now - runStartAt));
      }
      setRunStartAt(null);
      setNowTs(now);
      setRunning(false);
    } else {
      setRunStartAt(now);
      setNowTs(now);
      setRunning(true);
    }
  };

  // Ticker — drives re-renders; remaining is computed from timestamps so
  // background throttling / missed ticks self-correct on the next render.
  useEffect(() => {
    if (!running || done) return;
    setNowTs(Date.now());
    intervalRef.current = setInterval(() => {
      setNowTs(Date.now());
    }, 250);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, done, index]);

  // When step timer hits zero, bank elapsed and pause; user taps Done.
  useEffect(() => {
    if (remaining === 0 && running) {
      const now = Date.now();
      if (runStartAt != null) {
        setElapsedBeforeMs((e) => e + Math.max(0, now - runStartAt));
      }
      setRunStartAt(null);
      setRunning(false);
    }
  }, [remaining, running, runStartAt]);

  // Force a recompute when the page/app returns from background or when
  // navigated into from a notification tap.
  useEffect(() => {
    const refresh = () => setNowTs(Date.now());
    const onVis = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        refresh();
      }
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", onVis);

    let removeAppListener: (() => void) | null = null;
    if (isNative()) {
      const handle = CapacitorApp.addListener("appStateChange", (s) => {
        if (s.isActive) refresh();
      });
      removeAppListener = () => {
        void Promise.resolve(handle).then((h) => h.remove());
      };
    }
    // Initial kick after mount (covers notification-driven navigation).
    refresh();
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", onVis);
      removeAppListener?.();
    };
  }, []);

  // Reset timer bookkeeping whenever the step index changes.
  useEffect(() => {
    setElapsedBeforeMs(0);
    setRunStartAt((prev) => (running ? Date.now() : prev));
    setNowTs(Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const handleExit = () => navigate({ to: "/home" });

  // Programmatic navigation for the completion screen. Using onClick +
  // navigate (instead of <Link>) avoids cases where a late native event
  // (notification tap replay, focus-change touch) swallows the first tap on
  // an <a> element after a notification-launched session.
  const goHome = () => {
    setGuidedSessionActive(false);
    navigate({ to: "/home", replace: true });
  };
  const goProgress = () => {
    setGuidedSessionActive(false);
    navigate({ to: "/progress", replace: true });
  };

  if (done) {
    const completed = steps.length;
    const totalXp = steps.reduce((a, s) => a + s.movement.xp, 0);
    const showHydrationPrompt = reminders.hydration;
    const quickAdds = unit === "ml" ? QUICK_ADDS_ML : QUICK_ADDS_OZ;
    const handleHydrationAdd = (amount: number) => {
      const oz = unit === "ml" ? mlToOz(amount) : amount;
      logHydration(oz);
      void (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error } = await supabase.from("hydration_logs").insert({ user_id: user.id, ounces: oz });
        if (error) console.error("[hydration_logs] insert failed:", error.message);
      })();
      setHydrationLogged(true);
      notify.success(t("hydration.toast.logged_u", {
        n: amount,
        unit: t(unit === "ml" ? "unit.ml" : "unit.oz"),
      }));
    };
    return (
      <AppShell>
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
          <div className="size-20 rounded-full bg-primary/20 grid place-items-center mb-6 animate-scale-in">
            <Check className="size-10 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">{t("session.complete")}</h1>
          <InspirationCard placement="session_completion" variant="bare" className="max-w-sm mb-6" />
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
            <span>{t(completed === 1 ? "session.movements_one" : "session.movements_other", { n: completed })}</span>
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            <span>{t("session.min", { n: Math.round(totalSeconds / 60) })}</span>
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            <span className="inline-flex items-center gap-1"><Sparkles className="size-3.5 text-accent" /> +{totalXp} XP</span>
          </div>
          {showHydrationPrompt && !hydrationLogged && !hydrationSkipped && (
            <div className="w-full max-w-sm rounded-3xl bg-card ring-1 ring-black/5 p-5 mb-6">
              <div className="flex items-center justify-center gap-2 mb-1 text-primary">
                <Droplet className="size-4" />
                <p className="text-sm font-semibold">{t("session.hydration.prompt")}</p>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{t("session.hydration.sub")}</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {quickAdds.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleHydrationAdd(amount)}
                    className="h-14 rounded-2xl bg-primary/10 ring-1 ring-primary/20 text-primary font-semibold flex flex-col items-center justify-center gap-0.5 active:scale-[0.97] transition"
                  >
                    <span className="text-base leading-none">{amount}</span>
                    <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
                      {unit === "ml" ? "mL" : "oz"}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setHydrationSkipped(true)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {t("session.hydration.skip")}
              </button>
            </div>
          )}
          {showHydrationPrompt && hydrationLogged && (
            <div className="w-full max-w-sm rounded-2xl bg-primary/10 ring-1 ring-primary/20 p-3 mb-6 text-sm text-primary inline-flex items-center justify-center gap-2">
              <Check className="size-4" /> {t("session.hydration.logged")}
            </div>
          )}
          {showHydrationPrompt && hydrationSkipped && !hydrationLogged && (
            <div className="w-full max-w-sm rounded-2xl bg-muted ring-1 ring-black/5 p-3 mb-6 text-sm text-muted-foreground inline-flex items-center justify-center gap-2">
              {t("session.hydration.skipped")}
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={goHome}
              className="h-10 px-5 rounded-full bg-foreground text-background text-sm font-medium grid place-items-center"
            >
              {t("session.back_home")}
            </button>
            <button
              type="button"
              onClick={goProgress}
              className="h-10 px-5 rounded-full bg-card ring-1 ring-black/5 text-sm font-medium grid place-items-center"
            >
              {t("session.view_progress")}
            </button>
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
          aria-label={t("session.aria.end")}
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
              {content.categoryLabel(current.movement.category, current.movement.category)}
            </p>
            <h2 className="text-xl font-semibold leading-snug mb-1">
              {content.movementTitle(current.movement.id, current.movement.title)}
            </h2>
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
              {content.movementDesc(current.movement.id, current.movement.description)}
            </p>
          </div>
        </div>

        {/* Visual reference for the current movement */}
        {current.movement.category === "breath-calm" ? (
          <MovementVisual movementId={current.movement.id} running={running} />
        ) : (
          (() => {
            const imageUrl = getMovementImage(current.movement.id);
            return (
              <div className="mb-6 rounded-2xl overflow-hidden bg-background/60 ring-1 ring-black/5 flex items-center justify-center min-h-40 sm:min-h-48">
                {imageUrl && !imgFailed ? (
                  <img
                    src={imageUrl}
                    alt={content.movementTitle(current.movement.id, current.movement.title)}
                    loading="lazy"
                    onError={() => setImgFailed(true)}
                    className="w-full h-40 sm:h-48 object-contain"
                  />
                ) : (
                  <div className="h-40 sm:h-48 w-full flex flex-col items-center justify-center gap-2 text-muted-foreground/80 px-4">
                    <div className={cn("size-12 rounded-2xl flex items-center justify-center", current.movement.tint)}>
                      <Icon className="size-5" />
                    </div>
                    <p className="text-xs font-medium text-center">
                      {content.movementTitle(current.movement.id, current.movement.title)}
                    </p>
                  </div>
                )}
              </div>
            );
          })()
        )}

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
              onClick={toggleRunning}
              aria-label={running ? t("session.aria.pause") : t("session.aria.resume")}
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
              aria-label={t("session.aria.mark_done")}
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
              aria-label={t("session.aria.next")}
              title={confirmed ? undefined : t("session.tap_done_first")}
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
                  <span className="flex-1 text-sm">
                    {content.movementTitle(s.movement.id, s.movement.title)}
                  </span>
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