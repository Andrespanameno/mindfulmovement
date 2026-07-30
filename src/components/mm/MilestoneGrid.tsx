import { useMemo } from "react";
import { useSessionStore } from "@/lib/useSessionStore";
import { milestones, getMilestoneProgress, deriveMilestoneState } from "@/lib/xp";
import { cn } from "@/lib/utils";
import { Check, Lock, Trophy } from "lucide-react";
import { useContent } from "@/lib/i18n-content";
import { useI18n } from "@/lib/i18n";

export function MilestoneGrid() {
  const s = useSessionStore();
  const c = useContent();
  const { t } = useI18n();
  const achievedLabel = t("milestone.achieved");
  const { sorted, next, nextProgress, allDone, stateForMilestones } = useMemo(() => {
    const stateForMilestones = deriveMilestoneState(s);
    const sorted = [...milestones].sort((a, b) => {
      const aDone = a.achieved(stateForMilestones);
      const bDone = b.achieved(stateForMilestones);
      if (aDone !== bDone) return aDone ? -1 : 1;
      if (!aDone && !bDone) {
        const ap = getMilestoneProgress(a, stateForMilestones);
        const bp = getMilestoneProgress(b, stateForMilestones);
        const ar = ap ? ap.current / ap.target : 0;
        const br = bp ? bp.current / bp.target : 0;
        return br - ar;
      }
      return 0;
    });
    const next = sorted.find((m) => !m.achieved(stateForMilestones));
    const nextProgress = next ? getMilestoneProgress(next, stateForMilestones) : null;
    return { sorted, next, nextProgress, allDone: !next, stateForMilestones };
  }, [s]);

  return (
    <div className="space-y-3">
      {/* Next Achievement highlight */}
      <div className="p-4 rounded-2xl bg-card ring-1 ring-black/5">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="size-3.5 text-primary" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("milestone.next")}
          </span>
        </div>
        {allDone ? (
          <p className="text-sm font-medium">{t("milestone.all_done")}</p>
        ) : next ? (
          <>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">
                  {c.milestoneLabel(next.id, next.label)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                  {c.milestoneDesc(next.id, next.description)}
                </p>
              </div>
              <div className="size-9 shrink-0 rounded-lg bg-primary/15 text-primary grid place-items-center">
                <next.icon className="size-4" />
              </div>
            </div>
            {nextProgress && (
              <>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((nextProgress.current / nextProgress.target) * 100))}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 tabular-nums">
                  {Math.min(nextProgress.current, nextProgress.target).toLocaleString()} /{" "}
                  {nextProgress.target.toLocaleString()}
                  {nextProgress.unit ? ` ${nextProgress.unit}` : ""}
                </p>
              </>
            )}
          </>
        ) : null}
      </div>

      {/* Swipeable carousel */}
      <div
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 pb-2 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {sorted.map((m) => {
          const done = m.achieved(stateForMilestones);
          const Icon = done ? m.icon : Lock;
          const label = c.milestoneLabel(m.id, m.label);
          const desc = c.milestoneDesc(m.id, m.description);
          const prog = !done ? getMilestoneProgress(m, stateForMilestones) : null;
          const pct = prog
            ? Math.min(100, Math.round((prog.current / prog.target) * 100))
            : 0;
          return (
            <div
              key={m.id}
              className={cn(
                "snap-start shrink-0 w-32 h-36 rounded-2xl p-3 flex flex-col justify-between ring-1 transition",
                done
                  ? "bg-card ring-primary/30"
                  : "bg-card/60 ring-black/5",
              )}
              title={desc}
            >
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "size-8 rounded-lg grid place-items-center",
                    done
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </div>
                {done && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
                    <Check className="size-3" />
                  </span>
                )}
              </div>
              <div>
                <p
                  className={cn(
                    "text-xs font-medium leading-tight line-clamp-2",
                    !done && "text-foreground/80",
                  )}
                >
                  {label}
                </p>
                {done ? (
                  <p className="text-[10px] mt-1 leading-tight text-primary font-medium">
                    {achievedLabel}
                  </p>
                ) : prog ? (
                  <div className="mt-1.5">
                    <div className="h-1 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary/70"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                      {Math.min(prog.current, prog.target).toLocaleString()}/
                      {prog.target.toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] mt-0.5 leading-tight text-muted-foreground">
                    {desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}