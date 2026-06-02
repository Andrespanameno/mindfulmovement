import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/useProfile";
import { useI18n } from "@/lib/i18n";

export function WelcomeModal() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;
    if (!profile.onboarding_completed) return;
    if (profile.has_seen_welcome_modal) return;
    setOpen(true);
  }, [user, profile?.onboarding_completed, profile?.has_seen_welcome_modal]);

  const close = async () => {
    setOpen(false);
    if (user) {
      try {
        await updateProfile({ has_seen_welcome_modal: true });
      } catch (err) {
        console.error("[welcome-modal] failed to persist flag", err);
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-foreground/40 backdrop-blur-sm px-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-background text-foreground p-6 sm:p-7 shadow-2xl ring-1 ring-border animate-in zoom-in-95 slide-in-from-bottom-2 duration-300">
        <div className="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-4">
          <Sparkles className="size-6" />
        </div>
        <h2
          id="welcome-modal-title"
          className="text-xl sm:text-2xl font-semibold leading-tight tracking-tight text-balance"
        >
          {t("welcome.title")}
        </h2>
        <div className="mt-3 space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
          <p>{t("welcome.body1")}</p>
          <p>{t("welcome.body2")}</p>
          <p className="font-medium text-foreground">{t("welcome.body3")}</p>
        </div>
        <button
          type="button"
          onClick={close}
          className="mt-6 w-full h-12 rounded-xl bg-foreground text-background font-semibold text-base transition active:scale-[0.98]"
        >
          {t("welcome.cta")}
        </button>
      </div>
    </div>
  );
}