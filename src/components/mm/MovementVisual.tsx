import { cn } from "@/lib/utils";

interface Props {
  movementId: string;
  running?: boolean;
  className?: string;
}

/**
 * Breathing-only visual. Animates only while `running` is true.
 * Returns null for non-breathing movements.
 */
export function MovementVisual({ movementId, running = false, className }: Props) {
  const visual =
    movementId === "box-breathing" ? (
      <BoxBreathing running={running} />
    ) : movementId === "deep-breathing" ? (
      <DeepBreathing running={running} />
    ) : null;
  if (!visual) return null;
  return (
    <div
      className={cn(
        "rounded-2xl bg-background/60 ring-1 ring-black/5 px-4 py-3 mb-4",
        className,
      )}
    >
      {visual}
    </div>
  );
}

// ---------- Breathing animations ----------

function BoxBreathing({ running }: { running: boolean }) {
  // 16s loop: 4s top → 4s right → 4s bottom → 4s left
  return (
    <div className="flex items-center justify-center py-2">
      <svg viewBox="0 0 120 120" className="w-28 h-28">
        <rect
          x="20"
          y="20"
          width="80"
          height="80"
          rx="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary/40"
        />
        <circle r="6" fill="currentColor" className="text-primary" cx="20" cy="20">
          {running && (
            <animateMotion
              dur="16s"
              repeatCount="indefinite"
              path="M 20 20 L 100 20 L 100 100 L 20 100 Z"
            />
          )}
        </circle>
        <text
          x="60"
          y="58"
          textAnchor="middle"
          className="fill-foreground/70 text-[9px]"
          fontSize="9"
        >
          inhale · hold
        </text>
        <text
          x="60"
          y="72"
          textAnchor="middle"
          className="fill-foreground/70 text-[9px]"
          fontSize="9"
        >
          exhale · hold
        </text>
      </svg>
    </div>
  );
}

function DeepBreathing({ running }: { running: boolean }) {
  return (
    <div className="flex items-center justify-center py-2 h-32">
      <div
        className="size-20 rounded-full bg-primary/30 ring-1 ring-primary/40 flex items-center justify-center"
        style={running ? { animation: "mm-breath 8s ease-in-out infinite" } : undefined}
      >
        <span className="text-[10px] font-medium text-foreground/70">inhale · exhale</span>
      </div>
      <style>{`
        @keyframes mm-breath {
          0%, 100% { transform: scale(0.6); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}