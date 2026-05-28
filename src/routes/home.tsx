import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { Droplet, ArrowRight, Sparkles, Play } from "lucide-react";
import { useSessionStore, HYDRATION_GOAL_OZ } from "@/lib/useSessionStore";
import { XPBar } from "@/components/mm/XPBar";
import { StreakBadge } from "@/components/mm/StreakBadge";
import { ThemeToggle } from "@/components/mm/ThemeToggle";
import { useProfile } from "@/lib/useProfile";
import { useAuth } from "@/lib/auth-context";
import { InspirationCard } from "@/components/mm/InspirationCard";
import { FirstTimeTutorial } from "@/components/mm/FirstTimeTutorial";
import { useI18n } from "@/lib/i18n";

function getGreetingKey() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "home.greeting.morning";
  if (hour >= 12 && hour < 17) return "home.greeting.afternoon";
  return "home.greeting.evening";
}

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Today — Mindful Movement" },
      { name: "description", content: "Your daily dashboard: XP, streak, hydration, and gentle movement suggestions." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { ouncesToday } = useSessionStore();
  const { profile } = useProfile();
  const { user } = useAuth();
  const { t } = useI18n();
  const hydrationPct = Math.min(100, Math.round((ouncesToday / HYDRATION_GOAL_OZ) * 100));

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "there";
  const initials = (profile?.full_name || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">{t(getGreetingKey(), { name: displayName })}</p>
          <h1 className="text-2xl font-semibold">{t("home.title")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/profile"
            className="size-10 rounded-full bg-secondary ring-1 ring-border grid place-items-center text-xs font-semibold text-foreground hover:bg-accent/20 transition-colors"
            aria-label={t("nav.profile")}
            title={t("nav.profile")}
          >
            {initials}
          </Link>
        </div>
      </header>

      <Link
        to="/session"
        className="block p-6 rounded-3xl bg-foreground text-background mb-8 relative overflow-hidden active:scale-[0.99] transition-transform"
      >
        <div className="absolute -right-12 -top-12 size-44 rounded-full bg-primary/30 blur-2xl" />
        <p className="text-xs uppercase tracking-widest text-background/60 mb-2">{t("home.guided.eyebrow")}</p>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-semibold">{t("home.guided.title")}</h3>
            <p className="text-sm text-background/70 mt-1">{t("home.guided.sub")}</p>
          </div>
          <span className="size-12 rounded-full bg-background text-foreground grid place-items-center shrink-0">
            <Play className="size-5" />
          </span>
        </div>
      </Link>

      <Link
        to="/hydration"
        className="block p-6 rounded-3xl bg-card ring-1 ring-black/5 mb-8"
      >
        <div className="flex items-center gap-6">
          <HydrationRing pct={hydrationPct} />
          <div className="flex-1">
            <h3 className="font-medium flex items-center gap-2">
              <Droplet className="size-4 text-primary" /> {t("home.hydration.title")}
            </h3>
            <p className="text-sm text-muted-foreground text-pretty mt-1">
              {ouncesToday >= HYDRATION_GOAL_OZ
                ? t("home.hydration.reached")
                : t("home.hydration.remaining", { n: HYDRATION_GOAL_OZ - ouncesToday })}
            </p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground shrink-0" />
        </div>
      </Link>

      <section className="grid grid-cols-2 gap-4 mb-6">
        <StreakBadge />
        <XpToday />
      </section>

      <div className="mb-8">
        <XPBar />
      </div>

      <InspirationCard placement="home_page" />
      <FirstTimeTutorial />
    </AppShell>
  );
}

function XpToday() {
  const { xpToday } = useSessionStore();
  const { t } = useI18n();
  return (
    <div className="p-4 rounded-2xl bg-secondary/60 ring-1 ring-black/5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="size-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">{t("home.xp_today")}</span>
      </div>
      <p className="text-2xl font-semibold">{xpToday}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{t("home.xp_tip")}</p>
    </div>
  );
}

function HydrationRing({ pct }: { pct: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-20 shrink-0">
      <svg className="size-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} strokeWidth="6" fill="none" className="stroke-secondary" />
        <circle
          cx="40"
          cy="40"
          r={r}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          className="stroke-primary transition-all"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xs font-semibold">
        {pct}%
      </span>
    </div>
  );
}