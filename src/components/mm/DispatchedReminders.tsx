import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

type Kind = "movement" | "hydration" | "breath";

function titleFor(kind: Kind): string {
  if (kind === "movement") return "Mindful Movement";
  if (kind === "hydration") return "Hydration check";
  return "Breath check";
}

/**
 * Subscribes to the user's `reminder_dispatches` rows and surfaces any
 * undelivered dispatch as a toast, then marks it delivered. Pairs with the
 * server-side cron at /api/public/hooks/send-reminders.
 */
export function DispatchedReminders() {
  const { user } = useAuth();
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    seenRef.current = new Set();

    const surface = async (row: {
      id: string;
      kind: string;
      message: string;
      delivered_at: string | null;
    }) => {
      if (row.delivered_at) return;
      if (seenRef.current.has(row.id)) return;
      seenRef.current.add(row.id);
      toast(titleFor(row.kind as Kind), {
        description: row.message,
        duration: 10000,
        action: {
          label: "Start",
          onClick: () => {
            window.location.assign("/session");
          },
        },
      });
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
      .channel(`reminder-dispatches-${user.id}`)
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
  }, [user]);

  return null;
}