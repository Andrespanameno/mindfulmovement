import { useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useContent } from "@/lib/i18n-content";
import { getMilestoneById } from "@/lib/xp";

interface Props {
  achievementId: string;
  onDismiss: () => void;
  onViewAchievements?: () => void;
}

/**
 * Reusable celebration modal for a freshly earned achievement.
 * Uses the achievement definitions in `@/lib/xp` — no duplicate copy.
 */
export function AchievementUnlockedModal({
  achievementId,
  onDismiss,
  onViewAchievements,
}: Props) {
  const { t } = useI18n();
  const c = useContent();
  const milestone = getMilestoneById(achievementId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  if (!milestone) return null;
  const Icon = milestone.icon;
  const label = c.milestoneLabel(milestone.id, milestone.label);
  const desc = c.milestoneDesc(milestone.id, milestone.description);

  return (
    <div
      data-mm-overlay="open"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/40 px-6 animate-fade-in backdrop-blur-sm"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.5rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
      }}
      onClick={onDismiss}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="mm-achv-title"
        aria-describedby="mm-achv-desc"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[22rem] rounded-3xl bg-card p-7 text-center ring-1 ring-black/5 shadow-xl animate-scale-in"
      >
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t("achv.close")}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
          <Sparkles className="size-3" aria-hidden="true" />
          {t("achv.unlocked")}
        </span>

        {/* Badge with a small, brief sparkle burst */}
        <div className="relative mx-auto mt-5 size-20">
          <span aria-hidden="true" className="mm-burst" />
          <div className="relative grid size-20 place-items-center rounded-2xl bg-primary/15 text-primary mm-badge-pop">
            <Icon className="size-9" aria-hidden="true" />
          </div>
        </div>

        <h2
          id="mm-achv-title"
          className="mt-5 text-lg font-semibold leading-tight tracking-tight"
        >
          {label}
        </h2>
        <p id="mm-achv-desc" className="mt-1.5 text-sm text-muted-foreground">
          {desc}
        </p>
        <p className="mt-3 text-sm font-medium text-foreground/90">
          {t("achv.message")}
        </p>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-6 text-[0.9375rem] font-semibold text-primary-foreground transition-opacity active:opacity-85"
        >
          {t("achv.celebrate")}
        </button>
        {onViewAchievements && (
          <button
            type="button"
            onClick={onViewAchievements}
            className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("achv.view")}
          </button>
        )}
      </div>
    </div>
  );
}
