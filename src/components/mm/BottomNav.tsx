import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { Home, TrendingUp, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const items = [
  { to: "/home", key: "nav.home", icon: Home },
  { to: "/progress", key: "nav.progress", icon: TrendingUp },
  { to: "/profile", key: "nav.profile", icon: User },
] as const;

function BottomNavImpl() {
  const { t } = useI18n();
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-background/85 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="max-w-[480px] mx-auto px-6 py-3 flex items-center justify-between">
        {items.map(({ to, key, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 min-h-12 min-w-12 text-muted-foreground transition-colors"
            activeProps={{ className: "text-foreground" }}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`size-9 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? "bg-primary/30" : "bg-transparent"
                  }`}
                >
                  <Icon className="size-4" strokeWidth={2.25} />
                </div>
                <span className="text-[10px] font-medium">{t(key)}</span>
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export const BottomNav = memo(BottomNavImpl);