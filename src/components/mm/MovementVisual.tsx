import { cn } from "@/lib/utils";
import { movements } from "@/lib/movements";
import Lottie from "lottie-react";
import breathing478 from "@/assets/lottie/4-7-8-breathing.json";

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
  const movement = movements.find((m) => m.id === movementId);
  if (movement?.category !== "breath-calm") return null;

  return (
    <div
      className={cn(
        "rounded-2xl bg-background/60 ring-1 ring-black/5 px-4 py-3 mb-4",
        className,
      )}
    >
      {movementId === "box-breathing" ? (
        <BoxBreathing />
      ) : movementId === "4-7-8-breathing" ? (
        <LottieBreath data={breathing478} running={running} />
      ) : (
        <BreathingCircle running={running} />
      )}
    </div>
  );
}

function LottieBreath({ data, running }: { data: unknown; running: boolean }) {
  return (
    <div className="flex items-center justify-center py-2 h-32">
      <Lottie
        animationData={data}
        loop
        autoplay={running}
        style={{ height: "100%", width: "auto" }}
      />
    </div>
  );
}

function BoxBreathing() {
  // Always-on dot tracing the perimeter of a square.
  const size = 96;
  const pad = 16;
  const x = pad;
  const y = pad;
  const w = size;
  return (
    <div className="flex items-center justify-center py-2 h-32">
      <svg width={w + pad * 2} height={w + pad * 2} viewBox={`0 0 ${w + pad * 2} ${w + pad * 2}`}>
        <rect
          x={x}
          y={y}
          width={w}
          height={w}
          rx="6"
          fill="none"
          className="stroke-primary/40"
          strokeWidth="2"
        />
        <circle r="5" className="fill-primary">
          <animateMotion
            dur="8s"
            repeatCount="indefinite"
            rotate="0"
            path={`M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + w} L ${x} ${y + w} Z`}
          />
        </circle>
      </svg>
    </div>
  );
}

function BreathingCircle({ running }: { running: boolean }) {
  return (
    <div className="flex items-center justify-center py-2 h-32">
      <div
        className="size-20 rounded-full bg-primary/30 ring-1 ring-primary/40"
        style={running ? { animation: "mm-breath 8s ease-in-out infinite" } : undefined}
      />
      <style>{`
        @keyframes mm-breath {
          0%, 100% { transform: scale(0.6); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}