import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  achievedMilestoneIds,
  deriveMilestoneState,
  getMilestoneById,
  type MilestoneState,
} from "@/lib/xp";
import { isProgressHydrated, resetProgressHydration } from "@/lib/useSessionStore";

const TABLE = "achievement_celebrations_seen";

interface CelebrationSnapshot {
  /** Achievement id currently being celebrated, if any. */
  current: string | null;
  /** How many more are waiting behind it. */
  queued: number;
}

let queue: string[] = [];
let current: string | null = null;
let snapshot: CelebrationSnapshot = { current: null, queued: 0 };

const listeners = new Set<() => void>();

function publish() {
  snapshot = { current, queued: queue.length };
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Read-only subscription for the celebration host component. */
export function useAchievementCelebration(): CelebrationSnapshot {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}

/* ------------------------------------------------------------------ */
/* Per-user acknowledgement state                                      */
/* ------------------------------------------------------------------ */

let userId: string | null = null;
/** Achievement ids already acknowledged (celebrated or baselined). */
const acknowledged = new Set<string>();
/** Ids with an in-flight acknowledgement write — blocks duplicate popups. */
const inFlight = new Set<string>();
let ready = false;
let loadingFor: string | null = null;
/**
 * Snapshot of achievement ids that were unlocked the last time the engine
 * evaluated. `null` means no baseline has been taken yet for this user —
 * the first evaluation only establishes it and never celebrates.
 */
let previousUnlocked: Set<string> | null = null;

const DEBUG = import.meta.env.DEV;

function debugLog(
  id: string,
  prev: boolean,
  next: boolean,
  reason: string,
  queued: boolean,
) {
  if (!DEBUG) return;
  console.info("[achievements]", {
    achievementId: id,
    achievementName: getMilestoneById(id)?.label ?? "(unknown)",
    previousState: prev ? "unlocked" : "locked",
    currentState: next ? "unlocked" : "locked",
    reason,
    queued,
  });
}

export function resetAchievementCelebrations() {
  userId = null;
  ready = false;
  loadingFor = null;
  acknowledged.clear();
  inFlight.clear();
  previousUnlocked = null;
  needsBaseline = false;
  resetProgressHydration();
  queue = [];
  current = null;
  publish();
}

/**
 * Loads the user's acknowledgement records. On the very first load for a
 * pre-existing account, every already-completed achievement is marked as
 * acknowledged so nobody gets a backlog of pop-ups.
 */
export async function initAchievementCelebrations(
  id: string,
  state: MilestoneState & { history: Record<string, { sessions: number }> },
): Promise<void> {
  if (userId === id && (ready || loadingFor === id)) return;
  if (loadingFor === id) return;
  loadingFor = id;
  userId = id;
  ready = false;
  acknowledged.clear();
  previousUnlocked = null;

  const [seenRes, profileRes] = await Promise.all([
    (supabase.from(TABLE as never) as never as ReturnType<typeof supabase.from>)
      .select("achievement_id")
      .eq("user_id", id),
    supabase
      .from("profiles")
      .select("achievements_baselined")
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (userId !== id) return;

  for (const row of (seenRes.data ?? []) as { achievement_id: string }[]) {
    if (row?.achievement_id) acknowledged.add(row.achievement_id);
  }

  const baselined =
    (profileRes.data as { achievements_baselined?: boolean } | null)
      ?.achievements_baselined ?? false;

  if (!baselined) {
    // Only baseline against fully loaded progress; otherwise defer so we
    // don't permanently record an empty (zeroed) baseline.
    if (isProgressHydrated()) {
      await baselineNow(id, state);
    } else {
      needsBaseline = true;
    }
  }

  ready = true;
  loadingFor = null;
}

let needsBaseline = false;

async function baselineNow(
  id: string,
  state: MilestoneState & { history: Record<string, { sessions: number }> },
): Promise<void> {
  const already = achievedMilestoneIds(deriveMilestoneState(state));
  const toMark = already.filter((a) => !acknowledged.has(a));
  if (toMark.length > 0) {
    await acknowledge(id, toMark);
    toMark.forEach((a) => acknowledged.add(a));
  }
  await supabase
    .from("profiles")
    .update({ achievements_baselined: true })
    .eq("id", id);
  needsBaseline = false;
}

async function acknowledge(id: string, ids: string[]): Promise<boolean> {
  const rows = ids.map((achievement_id) => ({
    user_id: id,
    achievement_id,
  }));
  const { error } = await (
    supabase.from(TABLE as never) as never as ReturnType<typeof supabase.from>
  ).upsert(rows as never, { onConflict: "user_id,achievement_id" });
  if (error) {
    console.error("[achievements] acknowledge failed:", error.message);
    return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Detection + queueing                                                */
/* ------------------------------------------------------------------ */

/**
 * Detects incomplete -> complete transitions and queues a celebration for
 * each newly earned achievement. The pop-up is only queued once the
 * acknowledgement row is confirmed saved, so it can never fire twice or
 * appear for something the database didn't record.
 */
export async function checkAchievementUnlocks(
  state: MilestoneState & { history: Record<string, { sessions: number }> },
): Promise<void> {
  const id = userId;
  if (!id || !ready) return;

  // Never evaluate against half-loaded progress: the local store starts at
  // zero and only reflects reality after the remote stats + history land.
  // Evaluating early would make every real achievement look "newly unlocked".
  if (!isProgressHydrated()) {
    if (DEBUG) {
      console.info(
        "[achievements] skipped evaluation — remote progress not hydrated yet",
      );
    }
    return;
  }

  const earned = new Set(achievedMilestoneIds(deriveMilestoneState(state)));

  if (needsBaseline) {
    await baselineNow(id, state);
    if (userId !== id) return;
    previousUnlocked = earned;
    if (DEBUG) {
      earned.forEach((a) =>
        debugLog(a, true, true, "deferred baseline (no celebration)", false),
      );
    }
    return;
  }

  // First evaluation for this user: record the baseline only. Nothing here
  // has "just transitioned", so nothing may be celebrated.
  if (previousUnlocked === null) {
    previousUnlocked = earned;
    if (DEBUG) {
      earned.forEach((a) =>
        debugLog(a, true, true, "baseline snapshot (no celebration)", false),
      );
    }
    return;
  }

  const prev = previousUnlocked;
  const transitioned = [...earned].filter((a) => !prev.has(a));
  // Keep the snapshot in sync even when nothing is celebrated.
  previousUnlocked = earned;

  if (transitioned.length === 0) return;

  const fresh = transitioned.filter((a) => {
    if (acknowledged.has(a)) {
      debugLog(a, false, true, "already acknowledged in database", false);
      return false;
    }
    if (inFlight.has(a)) return false;
    return true;
  });
  if (fresh.length === 0) return;

  fresh.forEach((a) => inFlight.add(a));
  const ok = await acknowledge(id, fresh);
  fresh.forEach((a) => inFlight.delete(a));
  if (!ok || userId !== id) return;

  let changed = false;
  for (const a of fresh) {
    if (acknowledged.has(a)) continue;
    acknowledged.add(a);
    queue.push(a);
    changed = true;
    debugLog(a, false, true, "locked -> unlocked transition", true);
  }
  if (!changed) return;

  if (!current) {
    current = queue.shift() ?? null;
  }
  publish();
}

/** Called when the visible celebration is dismissed; advances the queue. */
export function dismissCurrentCelebration(): void {
  current = queue.shift() ?? null;
  publish();
}

/** True when there is something queued but nothing showing yet. */
export function hasPendingCelebrations(): boolean {
  return current !== null || queue.length > 0;
}
