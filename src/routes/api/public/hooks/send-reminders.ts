import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isDispatchSlotUTC } from "@/lib/reminders";

const MOVEMENT = [
  "Time for a quick movement reset?",
  "Let's stand and stretch for a minute.",
  "Movement helps reset the mind.",
  "Roll your shoulders — slow and easy.",
  "A small walk now will feel great later.",
];
const HYDRATION = [
  "Hydration checkpoint.",
  "A glass of water is a gentle reset.",
  "Small sips, steady focus.",
];
const BREATH = [
  "Take a few intentional breaths.",
  "Inhale slow, exhale slower.",
  "One mindful breath, right now.",
];

type Kind = "movement" | "hydration" | "breath";

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickKind(s: {
  movement: boolean;
  hydration: boolean;
  breath: boolean;
}): { kind: Kind; message: string } | null {
  const pool: { kind: Kind; message: string }[] = [];
  if (s.movement) pool.push({ kind: "movement", message: pick(MOVEMENT) });
  if (s.hydration) pool.push({ kind: "hydration", message: pick(HYDRATION) });
  if (s.breath) pool.push({ kind: "breath", message: pick(BREATH) });
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Returns true if the user's local hour-of-day falls within
 * [startHour, endHour). Assumes user-local = UTC for simplicity until we
 * persist a timezone; weekends respect the quiet flag.
 */
function inActiveWindow(s: {
  enabled: boolean;
  start_hour: number;
  end_hour: number;
  quiet_weekends: boolean;
}, now: Date): boolean {
  if (!s.enabled) return false;
  const day = now.getUTCDay();
  if (s.quiet_weekends && (day === 0 || day === 6)) return false;
  const h = now.getUTCHours();
  if (s.start_hour <= s.end_hour) return h >= s.start_hour && h < s.end_hour;
  return h >= s.start_hour || h < s.end_hour;
}

export const Route = createFileRoute("/api/public/hooks/send-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        const incoming =
          request.headers.get("apikey") ??
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
          "";
        if (!expected || incoming !== expected) {
          return new Response("Forbidden", { status: 403 });
        }

        const now = new Date();

        const { data: settings, error: settingsErr } = await supabaseAdmin
          .from("reminder_settings")
          .select(
            "user_id, enabled, start_hour, end_hour, interval_min, movement, hydration, breath, quiet_weekends",
          )
          .eq("enabled", true);

        if (settingsErr) {
          return Response.json(
            { ok: false, error: settingsErr.message },
            { status: 500 },
          );
        }

        const candidates = (settings ?? []).filter(
          (s) => inActiveWindow(s, now) && isDispatchSlotUTC(s, now),
        );
        if (candidates.length === 0) {
          return Response.json({ ok: true, dispatched: 0, considered: 0 });
        }

        const userIds = candidates.map((c) => c.user_id);

        // Fetch the most recent dispatch per user (one round trip).
        const { data: recent, error: recentErr } = await supabaseAdmin
          .from("reminder_dispatches")
          .select("user_id, created_at")
          .in("user_id", userIds)
          .order("created_at", { ascending: false });

        if (recentErr) {
          return Response.json(
            { ok: false, error: recentErr.message },
            { status: 500 },
          );
        }

        const lastByUser = new Map<string, number>();
        for (const r of recent ?? []) {
          if (!lastByUser.has(r.user_id)) {
            lastByUser.set(r.user_id, new Date(r.created_at).getTime());
          }
        }

        const toInsert: Array<{
          user_id: string;
          kind: Kind;
          message: string;
          scheduled_for: string;
        }> = [];

        for (const s of candidates) {
          const last = lastByUser.get(s.user_id) ?? 0;
          const elapsedMin = (now.getTime() - last) / 60000;
          if (elapsedMin < s.interval_min) continue;
          const choice = pickKind(s);
          if (!choice) continue;
          toInsert.push({
            user_id: s.user_id,
            kind: choice.kind,
            message: choice.message,
            scheduled_for: now.toISOString(),
          });
        }

        if (toInsert.length === 0) {
          return Response.json({
            ok: true,
            dispatched: 0,
            considered: candidates.length,
          });
        }

        const { error: insertErr } = await supabaseAdmin
          .from("reminder_dispatches")
          .insert(toInsert);

        if (insertErr) {
          return Response.json(
            { ok: false, error: insertErr.message },
            { status: 500 },
          );
        }

        return Response.json({
          ok: true,
          dispatched: toInsert.length,
          considered: candidates.length,
        });
      },
    },
  },
});