import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function deleteUserAccount(userId: string) {
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
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq(column as never, userId);

    if (error) {
      console.error(`[deleteAccount] failed to clear ${table}:`, error.message);
    }
  }

  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (authError) {
    throw new Error(authError.message);
  }

  return { ok: true };
}