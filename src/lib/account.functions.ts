import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    // Best-effort cleanup of app data. Most tables would cascade if FKs existed,
    // but we delete explicitly to be safe across schemas without ON DELETE CASCADE.
    const tables = [
      "hydration_logs",
      "movement_sessions",
      "breathing_sessions",
      "reminder_dispatches",
      "reminder_settings",
      "user_stats",
      "profiles",
    ] as const;

    for (const table of tables) {
      const column = table === "profiles" ? "id" : "user_id";
      const { error } = await supabaseAdmin.from(table).delete().eq(column, userId);
      if (error) {
        console.error(`[deleteAccount] failed to clear ${table}:`, error.message);
      }
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      throw new Error(authError.message);
    }

    return { ok: true };
  });