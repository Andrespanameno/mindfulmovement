import { useI18n } from "@/lib/i18n";

interface Props {
  running?: boolean;
}

const PHASES = ["breath.inhale", "breath.hold", "breath.exhale", "breath.hold"] as const;

export function BoxBreathingVisual({ running = false }: Props) {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-center py-2 h-32">
      <div
        className="relative w-32 h-32"
        style={{ ["--play-state" as string]: running ? "running" : "paused" }}
      >
        {/* Square outline */}
        <div
          className="absolute inset-0 rounded-lg ring-2 ring-primary/40"
          style={{
            animation: "box-breath-pulse 16s ease-in-out infinite",
            animationPlayState: "var(--play-state)",
          }}
        />

        {/* Moving dot */}
        <div
          className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-primary"
          style={{
            marginTop: "-6px",
            marginLeft: "-6px",
            animation: "box-breath-dot 16s linear infinite",
            animationPlayState: "var(--play-state)",
          }}
        />

        {/* Phase labels — centered, each visible during its 4s window */}
        <div className="absolute inset-0 flex items-center justify-center">
          {PHASES.map((key, i) => (
            <span
              key={key + i}
              className="absolute text-sm font-semibold text-primary"
              style={{
                opacity: 0,
                animation: `box-breath-label 16s linear infinite`,
                animationDelay: `${-i * 4}s`,
                animationPlayState: "var(--play-state)",
              }}
            >
              {t(key)}
            </span>
          ))}
        </div>

        <style>{`
          @keyframes box-breath-dot {
            0%   { transform: translate(-52px, 52px); }
            25%  { transform: translate(-52px, -52px); }
            50%  { transform: translate(52px, -52px); }
            75%  { transform: translate(52px, 52px); }
            100% { transform: translate(-52px, 52px); }
          }
          @keyframes box-breath-pulse {
            0%, 100% { transform: scale(1); }
            50%      { transform: scale(1.05); }
          }
          @keyframes box-breath-label {
            0%, 2%   { opacity: 0; }
            6%, 22%  { opacity: 1; }
            25%, 100%{ opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
