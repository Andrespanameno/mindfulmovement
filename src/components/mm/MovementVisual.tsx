import { cn } from "@/lib/utils";

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

// ---------- Static 2-frame poses ----------

function TwoFrame({
  start,
  end,
  startLabel = "Start",
  endLabel = "End",
}: {
  start: React.ReactNode;
  end: React.ReactNode;
  startLabel?: string;
  endLabel?: string;
}) {
  return (
    <div className="flex items-center justify-around gap-2">
      <Frame label={startLabel}>{start}</Frame>
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-muted-foreground shrink-0">
        <path
          d="M5 12 H19 M13 6 L19 12 L13 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <Frame label={endLabel}>{end}</Frame>
    </div>
  );
}

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-20 h-20 flex items-center justify-center">{children}</div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

const stroke = "stroke-foreground/70";

// Stick figure helpers — minimal, calm, consistent scale.
function WallPushupPose({ close }: { close?: boolean }) {
  const lean = close ? 18 : 8;
  return (
    <svg viewBox="0 0 80 80" className={cn("w-full h-full fill-none", stroke)} strokeWidth="2" strokeLinecap="round">
      {/* wall */}
      <line x1="68" y1="10" x2="68" y2="70" />
      {/* head */}
      <circle cx={50 + lean} cy="22" r="5" />
      {/* body */}
      <line x1={50 + lean} y1="27" x2={40 + lean / 2} y2="55" />
      {/* arms to wall */}
      <line x1={50 + lean} y1="32" x2="68" y2="30" />
      {/* legs */}
      <line x1={40 + lean / 2} y1="55" x2="30" y2="70" />
      <line x1={40 + lean / 2} y1="55" x2="38" y2="70" />
    </svg>
  );
}

function CalfRaisePose({ up }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={cn("w-full h-full fill-none", stroke)} strokeWidth="2" strokeLinecap="round">
      <circle cx="40" cy={up ? 14 : 20} r="5" />
      <line x1="40" y1={up ? 19 : 25} x2="40" y2={up ? 48 : 54} />
      <line x1="40" y1={up ? 48 : 54} x2="32" y2={up ? 62 : 68} />
      <line x1="40" y1={up ? 48 : 54} x2="48" y2={up ? 62 : 68} />
      {/* heels */}
      {up ? (
        <>
          <line x1="28" y1="62" x2="36" y2="62" />
          <line x1="44" y1="62" x2="52" y2="62" />
        </>
      ) : (
        <>
          <line x1="26" y1="68" x2="36" y2="68" />
          <line x1="44" y1="68" x2="54" y2="68" />
        </>
      )}
      <line x1="10" y1="72" x2="70" y2="72" className="text-muted-foreground/40" />
    </svg>
  );
}

function ChairSquatPose({ sitting }: { sitting?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={cn("w-full h-full fill-none", stroke)} strokeWidth="2" strokeLinecap="round">
      {/* chair */}
      <rect x="46" y="48" width="22" height="4" />
      <line x1="48" y1="52" x2="48" y2="70" />
      <line x1="66" y1="52" x2="66" y2="70" />
      <line x1="66" y1="48" x2="66" y2="30" />
      {/* figure */}
      <circle cx={sitting ? 50 : 36} cy={sitting ? 30 : 18} r="5" />
      <line x1={sitting ? 50 : 36} y1={sitting ? 35 : 23} x2={sitting ? 50 : 36} y2={sitting ? 48 : 48} />
      {sitting ? (
        <>
          <line x1="50" y1="48" x2="40" y2="58" />
          <line x1="40" y1="58" x2="40" y2="70" />
        </>
      ) : (
        <>
          <line x1="36" y1="48" x2="32" y2="70" />
          <line x1="36" y1="48" x2="40" y2="70" />
        </>
      )}
    </svg>
  );
}

function ShoulderRollPose({ rolled }: { rolled?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={cn("w-full h-full fill-none", stroke)} strokeWidth="2" strokeLinecap="round">
      <circle cx="40" cy="22" r="6" />
      <line x1="40" y1="28" x2="40" y2="58" />
      {/* shoulders */}
      <line x1="28" y1={rolled ? 30 : 34} x2="52" y2={rolled ? 30 : 34} />
      {/* arc */}
      <path
        d={rolled ? "M22 36 Q28 26 34 36" : "M22 38 Q28 46 34 38"}
        className="text-primary"
        stroke="currentColor"
      />
      <line x1="40" y1="58" x2="34" y2="70" />
      <line x1="40" y1="58" x2="46" y2="70" />
    </svg>
  );
}

function NeckTiltPose({ tilted }: { tilted?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={cn("w-full h-full fill-none", stroke)} strokeWidth="2" strokeLinecap="round">
      <g transform={tilted ? "rotate(-18 40 32)" : ""}>
        <circle cx="40" cy="22" r="6" />
        <line x1="40" y1="28" x2="40" y2="36" />
      </g>
      <line x1="28" y1="38" x2="52" y2="38" />
      <line x1="40" y1="38" x2="40" y2="62" />
      <line x1="40" y1="62" x2="34" y2="72" />
      <line x1="40" y1="62" x2="46" y2="72" />
    </svg>
  );
}

function MarchPose({ lift }: { lift?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={cn("w-full h-full fill-none", stroke)} strokeWidth="2" strokeLinecap="round">
      <circle cx="40" cy="18" r="5" />
      <line x1="40" y1="23" x2="40" y2="50" />
      {/* arms */}
      <line x1="40" y1="30" x2={lift ? 30 : 32} y2={lift ? 24 : 42} />
      <line x1="40" y1="30" x2={lift ? 50 : 48} y2={lift ? 42 : 24} />
      {/* legs */}
      <line x1="40" y1="50" x2="34" y2="70" />
      {lift ? (
        <line x1="40" y1="50" x2="48" y2="56" />
      ) : (
        <line x1="40" y1="50" x2="46" y2="70" />
      )}
      <line x1="10" y1="72" x2="70" y2="72" className="text-muted-foreground/40" />
    </svg>
  );
}

function OverheadReachPose({ up }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={cn("w-full h-full fill-none", stroke)} strokeWidth="2" strokeLinecap="round">
      <circle cx="40" cy="22" r="5" />
      <line x1="40" y1="27" x2="40" y2="54" />
      {up ? (
        <>
          <line x1="40" y1="30" x2="32" y2="10" />
          <line x1="40" y1="30" x2="48" y2="10" />
        </>
      ) : (
        <>
          <line x1="40" y1="32" x2="30" y2="46" />
          <line x1="40" y1="32" x2="50" y2="46" />
        </>
      )}
      <line x1="40" y1="54" x2="34" y2="72" />
      <line x1="40" y1="54" x2="46" y2="72" />
    </svg>
  );
}

function PosturePose({ aligned }: { aligned?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className={cn("w-full h-full fill-none", stroke)} strokeWidth="2" strokeLinecap="round">
      <circle cx={aligned ? 40 : 44} cy={aligned ? 18 : 22} r="5" />
      {aligned ? (
        <path d="M40 23 L40 54" />
      ) : (
        <path d="M44 27 Q38 38 40 54" />
      )}
      <line x1={aligned ? 30 : 34} y1={aligned ? 32 : 36} x2={aligned ? 50 : 52} y2={aligned ? 32 : 36} />
      <line x1="40" y1="54" x2="34" y2="72" />
      <line x1="40" y1="54" x2="46" y2="72" />
    </svg>
  );
}

const visuals: Record<string, React.ReactNode> = {
  "box-breathing": <BoxBreathing />,
  "deep-breathing": <DeepBreathing />,
  "wall-pushups": (
    <TwoFrame start={<WallPushupPose />} end={<WallPushupPose close />} />
  ),
  "calf-raises": <TwoFrame start={<CalfRaisePose />} end={<CalfRaisePose up />} />,
  "chair-squats": (
    <TwoFrame start={<ChairSquatPose />} end={<ChairSquatPose sitting />} />
  ),
  "shoulder-rolls": (
    <TwoFrame start={<ShoulderRollPose />} end={<ShoulderRollPose rolled />} />
  ),
  "neck-release": <TwoFrame start={<NeckTiltPose />} end={<NeckTiltPose tilted />} />,
  "march-in-place": <TwoFrame start={<MarchPose />} end={<MarchPose lift />} />,
  "overhead-reach": (
    <TwoFrame start={<OverheadReachPose />} end={<OverheadReachPose up />} />
  ),
  "mindful-standing": (
    <TwoFrame
      start={<PosturePose />}
      end={<PosturePose aligned />}
      startLabel="Relax"
      endLabel="Align"
    />
  ),
};