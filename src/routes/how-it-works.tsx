import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/mm/AppShell";
import { ArrowLeft, Heart, Clock, TrendingUp, Droplets, Wind, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Mindful Movement" },
      { name: "description", content: "Learn how Mindful Movement helps you build healthier daily habits." },
    ],
  }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  const { t } = useI18n();
  const features = [
    { icon: Heart, label: t("how.feature.micro") },
    { icon: TrendingUp, label: t("how.feature.mobility") },
    { icon: Sparkles, label: t("how.feature.posture") },
    { icon: Wind, label: t("how.feature.breathing") },
    { icon: Droplets, label: t("how.feature.hydration") },
    { icon: Clock, label: t("how.feature.prompts") },
  ];

  return (
    <AppShell>
      <header className="mb-6">
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          {t("common.back")}
        </Link>
      </header>

      <div className="flex flex-col items-center text-center mb-8">
        <div className="size-14 rounded-full bg-secondary ring-1 ring-black/5 mb-3 grid place-items-center">
          <Sparkles className="size-6 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold">{t("how.title")}</h1>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl bg-card ring-1 ring-black/5 p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("how.intro")}
          </p>
        </div>

        <div className="rounded-2xl bg-card ring-1 ring-black/5 p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("how.schedule")}
          </p>
        </div>

        <div className="rounded-2xl bg-card ring-1 ring-black/5 p-6">
          <p className="text-sm font-medium text-foreground mb-4">{t("how.combines")}</p>
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl bg-secondary/60 px-3 py-2.5"
              >
                <Icon className="size-4 text-primary shrink-1" />
                <span className="text-sm text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card ring-1 ring-black/5 p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("how.track")}
          </p>
        </div>

        <div className="rounded-2xl bg-warm/40 ring-1 ring-black/5 p-6 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {t("how.philosophy_label")}
          </p>
          <p className="text-lg font-semibold text-foreground italic">
            {t("how.philosophy")}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
