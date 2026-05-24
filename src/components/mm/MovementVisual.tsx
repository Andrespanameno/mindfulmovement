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
  let visual: React.ReactNode = null;
  switch (movementId) {
    case "box-breathing":
      visual = <BoxBreathing running={running} />;
      break;
    case "deep-breathing":
    case "tension-release-breath":
    case "mindful-breath-reset":
      visual = <ExpandingCircle running={running} />;
      break;
    case "shoulder-drop-breath":
      visual = <ShoulderDrop running={running} />;
      break;
    case "slow-nasal":
      visual = <NasalWave running={running} />;
      break;
    case "4-7-8-breathing":
      visual = <PulsingHalo running={running} />;
      break;
    default:
      visual = null;
  }
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
        {/* cx/cy must be 0 — animateMotion translates the element by the path
            coordinates, so any nonzero cx/cy offsets the dot off the line. */}
        <circle r="5" fill="currentColor" className="text-primary" cx="0" cy="0">
          {running ? (
            <animateMotion
              dur="16s"
              repeatCount="indefinite"
              rotate="auto"
              path="M 20 20 L 100 20 L 100 100 L 20 100 Z"
            />
          ) : (
            // Park the dot at the top-left corner when paused.
            <animateMotion dur="0.001s" fill="freeze" path="M 20 20 L 20 20" />
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

function ExpandingCircle({ running }: { running: boolean }) {
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

function ShoulderDrop({ running }: { running: boolean }) {
  // Two soft "shoulder" arcs that gently lift on inhale and drop on exhale.
  return (
    <div className="flex items-center justify-center py-2 h-32">
      <svg viewBox="0 0 160 80" className="w-40 h-20">
        <g
          style={
            running
              ? { animation: "mm-shoulders 8s ease-in-out infinite", transformOrigin: "80px 60px" }
              : undefined
          }
        >
          <path
            d="M 20 55 Q 50 30 80 40 Q 110 30 140 55"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-primary/70"
          />
          <circle cx="80" cy="40" r="4" fill="currentColor" className="text-primary" />
        </g>
      </svg>
      <style>{`
        @keyframes mm-shoulders {
          0%, 100% { transform: translateY(6px); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

function NasalWave({ running }: { running: boolean }) {
  // A soft sine wave that drifts left to right on inhale, then fades on exhale.
  return (
    <div className="flex items-center justify-center py-2 h-32 overflow-hidden">
      <svg viewBox="0 0 200 60" className="w-48 h-16">
        <path
          d="M 0 30 Q 25 10 50 30 T 100 30 T 150 30 T 200 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary/70"
          style={
            running
              ? { animation: "mm-wave 8s ease-in-out infinite" }
              : { opacity: 0.5 }
          }
        />
      </svg>
      <style>{`
        @keyframes mm-wave {
          0% { transform: translateX(-20px); opacity: 0.3; }
          50% { transform: translateX(20px); opacity: 1; }
          100% { transform: translateX(-20px); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function PulsingHalo({ running }: { running: boolean }) {
  // Concentric rings that slowly expand and fade — calm halo effect.
  return (
    <div className="flex items-center justify-center py-2 h-32">
      <div className="relative size-24 flex items-center justify-center">
        {running && (
          <>
            <span
              className="absolute inset-0 rounded-full bg-primary/20"
              style={{ animation: "mm-halo 6s ease-out infinite" }}
            />
            <span
              className="absolute inset-0 rounded-full bg-primary/20"
              style={{ animation: "mm-halo 6s ease-out infinite", animationDelay: "2s" }}
            />
            <span
              className="absolute inset-0 rounded-full bg-primary/20"
              style={{ animation: "mm-halo 6s ease-out infinite", animationDelay: "4s" }}
            />
          </>
        )}
        <span className="relative size-10 rounded-full bg-primary/60 ring-1 ring-primary/40" />
      </div>
      <style>{`
        @keyframes mm-halo {
          0% { transform: scale(0.4); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}