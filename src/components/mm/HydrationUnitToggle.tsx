import { useI18n } from "@/lib/i18n";
import type { HydrationUnit } from "@/lib/hydrationUnit";

export function HydrationUnitToggle({
  value,
  onChange,
  className = "",
}: {
  value: HydrationUnit;
  onChange: (next: HydrationUnit) => void;
  className?: string;
}) {
  const { t } = useI18n();
  const units: HydrationUnit[] = ["oz", "ml"];
  return (
    <div
      role="group"
      aria-label={t("unit.hydration_unit")}
      className={`inline-flex items-center rounded-full bg-secondary p-0.5 ring-1 ring-border ${className}`}
    >
      {units.map((u) => {
        const active = u === value;
        return (
          <button
            key={u}
            type="button"
            onClick={() => onChange(u)}
            aria-pressed={active}
            className={`px-3 h-7 rounded-full text-xs font-semibold transition ${
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(u === "oz" ? "unit.oz" : "unit.ml")}
          </button>
        );
      })}
    </div>
  );
}