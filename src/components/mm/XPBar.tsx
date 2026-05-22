import { Sparkles } from "lucide-react";
import { useSessionStore } from "@/lib/useSessionStore";
import { getLevelInfo, xpEncouragements } from "@/lib/xp";
import { cn } from "@/lib/utils";

interface Props {
  variant?: "light" | "dark";
  className?: string;
}

export function XPBar({ variant = "light", className }: Props) {
  const { totalXp } = useSessionStore();
  const { level, title, xpIntoLevel, xpForNext, pct } = getLevelInfo(totalXp);
  const tip = xpEncouragements[level % xpEncouragements.length];

  const dark = variant === "dark";

  return (
    <div
      className={cn(
        "p-5 rounded-3xl ring-1",
        dark ? "bg-foreground text-background ring-black/5" : "bg-card ring-black/5",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={cn("text-xs", dark ? "text-background/60" : "text-muted-foreground")}>
            Level {level}
          </p>
          <p className="text-lg font-medium">{title}</p>
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full",
            dark ? "bg-background/10 text-background" : "bg-primary/15 text-primary",
          )}
        >
          <Sparkles className="size-3.5" /> {totalXp} XP
        </div>
      </div>
      <div
        className={cn(
          "w-full h-1.5 rounded-full overflow-hidden mb-2",
          dark ? "bg-background/15" : "bg-secondary",
        )}
      >
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className={cn("text-[11px]", dark ? "text-background/60" : "text-muted-foreground")}>
          {xpIntoLevel} / {xpForNext} XP to Level {level + 1}
        </p>
        <p className={cn("text-[11px] italic", dark ? "text-background/60" : "text-muted-foreground")}>
          {tip}
        </p>
      </div>
    </div>
  );
}