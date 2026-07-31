import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { ArrowLeft, Shield, FileText, ChevronRight, Sparkles, Trash2, RotateCcw } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useProfile } from "@/lib/useProfile";
import { useAppVersion } from "@/lib/appVersion";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { deleteAccount } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import { cancelAllReminders } from "@/lib/nativeNotifications";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Mindful Movement" },
      { name: "description", content: "App settings and legal information." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useI18n();
  const appVersion = useAppVersion();
  const navigate = useNavigate();
  const { updateProfile } = useProfile();
  const runDelete = useServerFn(deleteAccount);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [replaying, setReplaying] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Cancel all scheduled local notifications BEFORE deleting the account
      // so no further reminders fire on this device after deletion.
      try {
        await cancelAllReminders();
      } catch (err) {
        console.error("[settings] cancelAllReminders failed:", err);
      }
      await runDelete();
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // ignore
      }
      toast.success(t("settings.delete_success"));
      navigate({ to: "/", replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(t("settings.delete_error", { message }));
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const handleReplayTutorial = async () => {
    setReplaying(true);
    try {
      await updateProfile({ tutorial_seen: false });
    } catch (err) {
      console.error("[settings] replay tutorial failed", err);
      toast.error(t("settings.replay_error"));
      setReplaying(false);
      return;
    }
    setReplaying(false);
    navigate({ to: "/home", replace: true });
  };

  const items = [
    { icon: Sparkles, label: t("settings.item.how"), to: "/how-it-works" },
    { icon: Shield, label: t("settings.item.privacy"), to: "/privacy" },
    { icon: FileText, label: t("settings.item.terms"), to: "/terms" },
  ];

  return (
    <AppShell>
      <header className="mb-8">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          {t("common.back")}
        </Link>
      </header>

      <div className="mb-8">
        <h1 className="text-xl font-semibold">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("settings.sub")}</p>
      </div>

      <div className="rounded-2xl bg-card ring-1 ring-black/5 divide-y divide-border mb-auto">
        {items.map(({ icon: Icon, label, to }) => (
          <Link
            key={label}
            to={to}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
          >
            <div className="size-8 rounded-lg bg-secondary grid place-items-center">
              <Icon className="size-4" />
            </div>
            <span className="text-sm font-medium flex-1">{label}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        {appVersion?.version
          ? appVersion.build
            ? t("settings.version_build", {
                version: appVersion.version,
                build: appVersion.build,
              })
            : t("settings.version", { version: appVersion.version })
          : ""}
      </p>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          disabled={replaying}
          onClick={handleReplayTutorial}
          className="w-full rounded-2xl bg-card ring-1 ring-black/5 px-4 py-3.5 flex items-center gap-3 text-left hover:bg-secondary/40 transition-colors"
        >
          <div className="size-8 rounded-lg bg-secondary grid place-items-center">
            <RotateCcw className="size-4" />
          </div>
          <span className="text-sm font-medium flex-1">{replaying ? t("settings.replay_preparing") : t("settings.replay_tour")}</span>
        </button>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="w-full rounded-2xl bg-card ring-1 ring-black/5 px-4 py-3.5 flex items-center gap-3 text-left text-destructive hover:bg-destructive/5 transition-colors"
        >
          <div className="size-8 rounded-lg bg-destructive/10 grid place-items-center">
            <Trash2 className="size-4" />
          </div>
          <span className="text-sm font-medium flex-1">{t("settings.delete_account")}</span>
        </button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={(o) => !deleting && setConfirmOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.delete_confirm_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? t("settings.deleting") : t("settings.delete_action")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
