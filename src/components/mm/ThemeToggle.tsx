import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme, toggleTheme } from "@/lib/theme";

export function ThemeToggle() {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="size-10 rounded-full bg-secondary ring-1 ring-border grid place-items-center text-foreground hover:bg-accent/20 transition-colors"
    >
      {mounted && theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}