import { cn } from "@/lib/utils";
import wallPushupsImg from "@/assets/movements/wall-pushups.png";
import calfRaisesImg from "@/assets/movements/calf-raises.png";
import chairSquatsImg from "@/assets/movements/chair-squats.png";
import shoulderRollsImg from "@/assets/movements/shoulder-rolls.png";
import neckReleaseImg from "@/assets/movements/neck-release.png";
import marchInPlaceImg from "@/assets/movements/march-in-place.png";
import overheadReachImg from "@/assets/movements/overhead-reach.png";
import mindfulStandingImg from "@/assets/movements/mindful-standing.png";

interface Props {
  movementId: string;
  className?: string;
}

/**
 * Lightweight per-movement visual.
 * - Breathing exercises: simple SVG/CSS animations paced with the technique.
 * - All others: static 2-frame "start → end" pose illustration.
 * Only renders for the 10 movements that ship with visuals today; returns null otherwise.
 */
export function MovementVisual({ movementId, className }: Props) {
  const visual = visuals[movementId];
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

function BoxBreathing() {
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
        <circle r="6" fill="currentColor" className="text-primary">
          <animateMotion
            dur="16s"
            repeatCount="indefinite"
            path="M 20 20 L 100 20 L 100 100 L 20 100 Z"
          />
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

function DeepBreathing() {
  return (
    <div className="flex items-center justify-center py-2 h-32">
      <div
        className="size-20 rounded-full bg-primary/30 ring-1 ring-primary/40 flex items-center justify-center"
        style={{
          animation: "mm-breath 8s ease-in-out infinite",
        }}
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

// ---------- Hand-drawn sketch illustrations ----------

function SketchImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="flex items-center justify-center h-32">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-auto object-contain"
      />
    </div>
  );
}

const visuals: Record<string, React.ReactNode> = {
  "box-breathing": <BoxBreathing />,
  "deep-breathing": <DeepBreathing />,
  "wall-pushups": <SketchImage src={wallPushupsImg} alt="Person doing a wall push-up" />,
  "calf-raises": <SketchImage src={calfRaisesImg} alt="Person rising onto tiptoes" />,
  "chair-squats": <SketchImage src={chairSquatsImg} alt="Person lowering into a chair squat" />,
  "shoulder-rolls": <SketchImage src={shoulderRollsImg} alt="Person rolling their shoulders" />,
  "neck-release": <SketchImage src={neckReleaseImg} alt="Person gently tilting their head in a neck stretch" />,
  "march-in-place": <SketchImage src={marchInPlaceImg} alt="Person marching in place" />,
  "overhead-reach": <SketchImage src={overheadReachImg} alt="Person reaching both arms overhead" />,
  "mindful-standing": <SketchImage src={mindfulStandingImg} alt="Person standing tall with aligned posture" />,
};