import { useEffect, useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MessagePlacement =
  | "home_page"
  | "session_completion"
  | "hydration_completion"
  | "progress_summary";

export type MessageCategory =
  | "movement"
  | "consistency"
  | "hydration"
  | "breathing"
  | "stress_relief"
  | "progress"
  | "encouragement";

export interface MotivationalMessage {
  id: string;
  message: string;
  author: string | null;
  category: MessageCategory;
  placement: MessagePlacement;
}

const RING_SIZE = 10;
const storageKey = (p: MessagePlacement) => `mm:recent-messages:${p}`;

function readRing(p: MessagePlacement): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(p));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeRing(p: MessagePlacement, ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKey(p),
      JSON.stringify(ids.slice(-RING_SIZE)),
    );
  } catch {
    /* ignore */
  }
}

function pickFromPool(
  pool: MotivationalMessage[],
  recent: string[],
): MotivationalMessage | null {
  if (pool.length === 0) return null;
  let fresh = pool.filter((m) => !recent.includes(m.id));
  if (fresh.length === 0) {
    // Fall back to "anything except the most recent one"
    const last = recent[recent.length - 1];
    fresh = pool.filter((m) => m.id !== last);
    if (fresh.length === 0) fresh = pool;
  }
  return fresh[Math.floor(Math.random() * fresh.length)];
}

export function useMotivationalMessage(opts: {
  placement: MessagePlacement;
  category?: MessageCategory;
}) {
  const { placement, category } = opts;

  const { data, isLoading } = useQuery({
    queryKey: ["motivational_messages", placement],
    staleTime: 1000 * 60 * 60, // 1h — content is mostly static
    queryFn: async (): Promise<MotivationalMessage[]> => {
      const { data, error } = await supabase
        .from("motivational_messages")
        .select("id, message, author, category, placement")
        .eq("placement", placement)
        .eq("active", true);
      if (error) throw error;
      return (data ?? []) as MotivationalMessage[];
    },
  });

  const pool = useMemo(() => {
    const all = data ?? [];
    if (!category) return all;
    const filtered = all.filter((m) => m.category === category);
    return filtered.length > 0 ? filtered : all;
  }, [data, category]);

  const [picked, setPicked] = useState<MotivationalMessage | null>(null);

  const next = useCallback(() => {
    if (pool.length === 0) {
      setPicked(null);
      return;
    }
    const recent = readRing(placement);
    const choice = pickFromPool(pool, recent);
    setPicked(choice);
    if (choice) writeRing(placement, [...recent, choice.id]);
  }, [pool, placement]);

  // Pick once when the pool first becomes available (or placement changes).
  useEffect(() => {
    if (pool.length === 0) return;
    if (picked && pool.some((m) => m.id === picked.id)) return;
    next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, placement]);

  return { message: picked, isLoading, next };
}