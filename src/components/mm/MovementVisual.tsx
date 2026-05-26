import { cn } from "@/lib/utils";
import { movements } from "@/lib/movements";
import Lottie from "lottie-react";
import type { LottieRefCurrentProps } from "lottie-react";
import { useEffect, useRef } from "react";
import breathing478 from "@/assets/lottie/4-7-8-breathing.json";
import boxBreathing from "@/assets/lottie/box-breathing.json";

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
        <LottieBreath data={boxBreathing} running={running} />
      ) : movementId === "4-7-8-breathing" ? (
        <LottieBreath data={breathing478} running={running} />
      ) : (
        <BreathingCircle running={running} />
      )}
    </div>
  );
}

function LottieBreath({ data, running }: { data: unknown; running: boolean }) {
  const ref = useRef<LottieRefCurrentProps>(null);
  useEffect(() => {
    const api = ref.current;
    if (!api) return;
    if (running) api.play();
    else api.pause();
  }, [running]);
  return (
    <div className="flex items-center justify-center py-2 h-32">
      <Lottie
        lottieRef={ref}
        animationData={data}
        loop
        autoplay={running}
        style={{ height: "100%", width: "auto" }}
      />
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