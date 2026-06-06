import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { shouldSuppressReminder } from "@/lib/reminderDedup";
import {
  MOVEMENT_REMINDERS,
  MOVEMENT_REMINDERS_ES,
  HYDRATION_REMINDERS,
  HYDRATION_REMINDERS_ES,
  BREATH_REMINDERS,
  BREATH_REMINDERS_ES,
} from "@/lib/reminders";

type Kind = "movement" | "hydration" | "breath";

function buildEnToEsMap(): Record<string, string> {
  const map: Record<string, string> = {};
  const pairs: [string[], string[]][] = [
    [MOVEMENT_REMINDERS, MOVEMENT_REMINDERS_ES],
    [HYDRATION_REMINDERS, HYDRATION_REMINDERS_ES],
    [BREATH_REMINDERS, BREATH_REMINDERS_ES],
  ];
  for (const [en, es] of pairs) {
    en.forEach((s, i) => {
      if (es[i]) map[s] = es[i];
    });
  }
  return map;
}

const EN_TO_ES = buildEnToEsMap();

/**
 * Subscribes to the user's `reminder_dispatches` rows and surfaces any
 * undelivered dispatch as a toast, then marks it delivered. Pairs with the
 * server-side cron at /api/public/hooks/send-reminders.
 */
export function DispatchedReminders() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    seenRef.current = new Set();

    const titleFor = (kind: Kind): string => {
      if (kind === "movement") return t("notif.movement.title");
      if (kind === "hydration") return t("notif.hydration.title");
      return t("notif.breath.title");
    };

    const localizeMessage = (msg: string): string => {
      if (lang !== "es" || !msg) return msg;
      return EN_TO_ES[msg] ?? msg;
    };

    const surface = async (row: {
      id: string;
      kind: string;
      message: string;
      delivered_at: string | null;
    }) => {
      if (row.delivered_at) return;
      if (seenRef.current.has(row.id)) return;
      seenRef.current.add(row.id);
      // Suppress in-app toast if a native notification was just tapped or
      // the user is already in a guided session — still mark delivered so
      // it does not replay on next mount.
      if (shouldSuppressReminder()) {
        console.info("[DispatchedReminders] suppressed toast for", row.id);
      } else {
        toast(titleFor(row.kind as Kind), {
          description: localizeMessage(row.message),
          duration: 10000,
          action: {
            label: t("notif.action_start"),
            onClick: () => {
              window.location.assign("/session");
            },
          },
        });
      }
      await supabase
        .from("reminder_dispatches")
        .update({ delivered_at: new Date().toISOString() })
        .eq("id", row.id);
    };

    // Catch up on anything pending from the last 24h.
    (async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("reminder_dispatches")
        .select("id, kind, message, delivered_at")
        .eq("user_id", user.id)
        .is("delivered_at", null)
        .gte("created_at", since)
        .order("created_at", { ascending: true });
      for (const row of data ?? []) await surface(row);
    })();

    const channel = supabase
      .channel(`reminder-dispatches-${user.id}`, {
        config: { private: true },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reminder_dispatches",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            kind: string;
            message: string;
            delivered_at: string | null;
          };
          void surface(row);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, t, lang]);

  return null;
}