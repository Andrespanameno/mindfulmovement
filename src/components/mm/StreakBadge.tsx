import { Flame } from "lucide-react";
import { useSessionStore } from "@/lib/useSessionStore";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function StreakBadge({ className }: { className?: string }) {
  const streak = useSessionStore((s) => s.streak);
  const bestStreak = useSessionStore((s) => s.bestStreak);
  const { t } = useI18n();
  return (
    <div className={cn("p-4 rounded-2xl bg-secondary/60 ring-1 ring-black/5", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Flame className="size-4 text-accent" />
        <span className="text-xs font-medium text-muted-foreground">{t("profile.streak")}</span>
      </div>
      <p className="text-2xl font-semibold">
        {streak} <span className="text-sm font-medium text-muted-foreground">{t("profile.days")}</span>
      </p>
      <p className="text-[11px] text-muted-foreground mt-1">{t(bestStreak === 1 ? "profile.best_one" : "profile.best_other", { n: bestStreak })}</p>
    </div>
  );
}

export function Milestones({ className }: { className?: string }) {
  return null;
}