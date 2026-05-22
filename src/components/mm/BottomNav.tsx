import { Link } from "@tanstack/react-router";
import { Home, Sparkles, TrendingUp, User } from "lucide-react";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/move", label: "Move", icon: Sparkles },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/85 backdrop-blur-md border-t border-border">
      <div className="max-w-[480px] mx-auto px-6 py-3 flex items-center justify-between">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 py-1 px-3 text-muted-foreground transition-colors"
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
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}