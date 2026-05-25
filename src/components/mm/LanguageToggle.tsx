import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function LanguageToggle({ className }: Props) {
  const { lang, setLang } = useI18n();
  const options: { value: Lang; label: string }[] = [
    { value: "en", label: "EN" },
    { value: "es", label: "ES" },
  ];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-secondary/60 ring-1 ring-black/5 p-0.5 text-xs font-medium",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {options.map(({ value, label }) => {
        const active = lang === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setLang(value)}
            aria-pressed={active}
            className={cn(
              "h-7 px-3 rounded-full transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
